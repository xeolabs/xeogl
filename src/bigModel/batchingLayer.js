/**
 A BatchingLayer is a batch containing multiple geometries that is rendered in one draw call.

 It consists of a set of geometry attribute arrays and an index array.


 */
import {BatchingDrawRenderer} from "./draw/batchingDrawRenderer.js";
import {State} from '../renderer/state.js';
import {ArrayBuf} from '../webgl/arrayBuf.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.BatchingLayer";

const memoryStats = stats.memory;
var bigIndicesSupported = WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];

// Static per-vertex attribute data buffers; one set of these is used as scratch memory for a BatchingLayer as geometry is
// appended to it, then VBOs are created from these as a BatchingLayer is packed.
// Therefore, only one BatchingLayer can be assembled at a time.

const MAX_VERTS = 500000;

const BUFFERS = {
    positions: new Float32Array(MAX_VERTS * 3),
    colors: new Float32Array(MAX_VERTS * 4),
    quantizedPositions: new Uint16Array(MAX_VERTS * 3), // TODO: 16-bit?
    quantizedNormals: new Int8Array(MAX_VERTS * 3),
    flags: new Int8Array(MAX_VERTS),
    indices: bigIndicesSupported ? new Uint32Array(MAX_VERTS * 4) : new Uint16Array(MAX_VERTS * 4),
    lenPositions: 0,
    lenColors: 0,
    lenQuantizedNormals: 0,
    lenFlags: 0,
    lenIndices: 0
};

var currentBatchingLayer = null;

class BatchingLayer {

    constructor(scene, cfg) {
        this.scene = scene;
        var primitiveName = cfg.primitive || "triangles";
        var primitive;
        const gl = scene.canvas.gl;
        switch (primitiveName) {
            case "points":
                primitive = gl.POINTS;
                break;
            case "lines":
                primitive = gl.LINES;
                break;
            case "line-loop":
                primitive = gl.LINE_LOOP;
                break;
            case "line-strip":
                primitive = gl.LINE_STRIP;
                break;
            case "triangles":
                primitive = gl.TRIANGLES;
                break;
            case "triangle-strip":
                primitive = gl.TRIANGLE_STRIP;
                break;
            case "triangle-fan":
                primitive = gl.TRIANGLE_FAN;
                break;
            default:
                this.error(`Unsupported value for 'primitive': '${primitiveName}' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.`);
                primitive = gl.TRIANGLES;
                primitiveName = "triangles";
        }
        this._state = new State({
            primitiveName: primitiveName,
            primitive: primitive,
            positionsBuf: null,
            normalsBuf: null,
            colorsbuf: null,
            flagsBuf: null,
            indicesBuf: null,
            positionsDecodeMatrix: math.mat4()
        });
        this._aabb = math.collapseAABB3();
        this._portions = [];
        this._finalized = false;
        this._drawRenderer = BatchingDrawRenderer.get(this);
    }

    canCreatePortion(lenPositions) {
        return (BUFFERS.lenPositions + lenPositions) < (MAX_VERTS * 3);
    }

    createPortion(positions, normals, indices, flags, color, matrix, aabb) {
        if (this._finalized) {
            this.error("Layer already finalized - can't create more portions.");
            return;
        }
        if (currentBatchingLayer !== null) {
            if (currentBatchingLayer !== this) {
                this.error("Already packing another BatchingLayer - can only pack one at a time.");
                return;
            }
        } else {
            currentBatchingLayer = this;
        }
        const positionsIndex = BUFFERS.lenPositions;
        const vertsIndex = positionsIndex/3;
        const indicesIndex = BUFFERS.lenIndices;
        const numVerts = positions.length / 3;
        { // Positions
            const lenPositions = positions.length;
            BUFFERS.positions.set(positions, BUFFERS.lenPositions);
            const p = math.vec4([0, 0, 0, 1]);
            const q = math.vec4([0, 0, 0, 1]);
            for (var i = BUFFERS.lenPositions, len = BUFFERS.lenPositions + lenPositions; i < len; i += 3) {
                p[0] = BUFFERS.positions[i + 0];
                p[1] = BUFFERS.positions[i + 1];
                p[2] = BUFFERS.positions[i + 2];
                if (matrix) {
                    math.transformPoint4(matrix, p, q);
                } else {
                    q.set(p); // OPTIMIZE
                }
                math.expandAABB3Point3(aabb, q); // Expand TileMesh AABB
                math.expandAABB3Point3(this._aabb, q); // Expand BatchingLayer AABB
                BUFFERS.positions[i + 0] = q[0];
                BUFFERS.positions[i + 1] = q[1];
                BUFFERS.positions[i + 2] = q[2];
            }
            BUFFERS.lenPositions += lenPositions;
        }
        { // Normals
            // TODO: transform normals
            BUFFERS.lenQuantizedNormals = octEncodeNormals(normals, normals.length, BUFFERS.quantizedNormals, BUFFERS.lenQuantizedNormals); // BOTTLENECK - better to have these precomputed in the pipeline!
        }
        { // Flags
            const lenFlags = numVerts;
            for (var i = BUFFERS.lenFlags, len = BUFFERS.lenFlags + lenFlags; i < len; i++) {
                BUFFERS.flags[i] = flags;
            }
            BUFFERS.lenFlags += lenFlags;
        }
        { // Colors
            const lenColors = (numVerts * 4);
            const r = color[0];
            const g = color[1];
            const b = color[2];
            const a = color[3];
            for (var i = BUFFERS.lenColors, len = BUFFERS.lenColors + lenColors; i < len; i += 4) {
                BUFFERS.colors[i + 0] = r;
                BUFFERS.colors[i + 1] = g;
                BUFFERS.colors[i + 2] = b;
                BUFFERS.colors[i + 3] = a;
            }
            BUFFERS.lenColors += lenColors;
        }
        { // Indices
            for (var i = 0, len = indices.length; i < len; i++) {
                BUFFERS.indices[BUFFERS.lenIndices + i] = indices[i] + vertsIndex;
            }
            BUFFERS.lenIndices += indices.length;
        }
        var portion = {
            positionsIndex: positionsIndex,
            numPositions: positions.length,
            indicesIndex: indicesIndex,
            numIndices: indices.length
        };
        var portionId = this._portions.length;
        this._portions.push(portion);
        return portionId;
    }

    finalize() {
        if (this._finalized) {
            this.error("Already finalized");
            return;
        }
        this.clear();
        const state = this._state;
        const gl = this.scene.canvas.gl;
        quantizePositions(BUFFERS.positions, BUFFERS.lenPositions, this._aabb, BUFFERS.quantizedPositions, state.positionsDecodeMatrix); // BOTTLENECK
        // TODO: slice() calls use lots of extra memory
        state.positionsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, BUFFERS.quantizedPositions.slice(0, BUFFERS.lenPositions), BUFFERS.lenPositions, 3, gl.STATIC_DRAW);
        state.normalsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, BUFFERS.quantizedNormals.slice(0, BUFFERS.lenQuantizedNormals), BUFFERS.lenQuantizedNormals, 3, gl.STATIC_DRAW);
        state.colorsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, BUFFERS.colors.slice(0, BUFFERS.lenColors), BUFFERS.lenColors, 4, gl.STATIC_DRAW);
        state.flagsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, BUFFERS.flags.slice(0, BUFFERS.lenFlags), BUFFERS.lenFlags, 1, gl.STATIC_DRAW);
        state.indicesBuf = new ArrayBuf(gl, gl.ELEMENT_ARRAY_BUFFER, BUFFERS.indices.slice(0, BUFFERS.lenIndices), BUFFERS.lenIndices, 1, gl.STATIC_DRAW);
        BUFFERS.lenPositions = 0;
        BUFFERS.lenColors = 0;
        BUFFERS.lenQuantizedNormals = 0;
        BUFFERS.lenFlags = 0;
        BUFFERS.lenIndices = 0;
        currentBatchingLayer = null;
        this._finalized = true;
    }

    setFlags(portionId, flags) { // TODO
        var portion = this._portions[portionId];
        var positionsIndex = portion.positionsIndex;
        var numPositions = portion.numPositions;
        var flagsIndex = positionsIndex / 3;
        var lenFlags = numPositions / 3;
        for (var i = 0; i < lenFlags; i++) {
            BUFFERS.flags[i] = flags;
        }
        //this._state.flagsBuf.setData(BUFFERS.flags, flagsIndex, lenFlags);
    }

    setColor(portionId, color) { // TODO
        var portion = this._portions[portionId];
        const r = color[0];
        const g = color[1];
        const b = color[2];
        const a = color[3];
        for (var i = portion.positionsIndex * 4, len = (portion.positionsIndex + portion.numPositions) * 4; i < len; i++) {
            BUFFERS.colors[i + 0] = r;
            BUFFERS.colors[i + 1] = g;
            BUFFERS.colors[i + 2] = b;
            BUFFERS.colors[i + 3] = a;
        }
    }

    draw(frame) {
        if (this._drawRenderer) {
            this._drawRenderer.drawLayer(frame, this);
        }
    }

    clear() {
        const state = this._state;
        if (state.positionsBuf) {
            state.positionsBuf.destroy();
            state.positionsBuf = null;
        }
        if (state.normalsBuf) {
            state.normalsBuf.destroy();
            state.normalsBuf = null;
        }
        if (state.colorsBuf) {
            state.colorsBuf.destroy();
            state.colorsBuf = null;
        }
        if (state.flagsBuf) {
            state.flagsBuf.destroy();
            state.flagsBuf = null;
        }
        if (state.indicesBuf) {
            state.indicesBuf.destroy();
            state.indicessBuf = null;
        }
        this._finalized = false;
    }

    destroy() {
        if (this._drawRenderer) {
            this._drawRenderer.put();
            this._drawRenderer = null;
        }
        this.clear();
        this._state.destroy();
    }
}

var quantizePositions = (function () { // http://cg.postech.ac.kr/research/mesh_comp_mobile/mesh_comp_mobile_conference.pdf
    const translate = math.mat4();
    const scale = math.mat4();
    return function (positions, lenPositions, aabb, quantizedPositions, positionsDecodeMatrix) {
        const xmin = aabb[0];
        const ymin = aabb[1];
        const zmin = aabb[2];
        const xwid = aabb[3] - xmin;
        const ywid = aabb[4] - ymin;
        const zwid = aabb[5] - zmin;
        // const maxInt = 2000000;
        const maxInt = 65525;
        const xMultiplier = maxInt / xwid;
        const yMultiplier = maxInt / ywid;
        const zMultiplier = maxInt / zwid;
        let i;
        for (i = 0; i < lenPositions; i += 3) {
            quantizedPositions[i + 0] = Math.floor((positions[i + 0] - xmin) * xMultiplier);
            quantizedPositions[i + 1] = Math.floor((positions[i + 1] - ymin) * yMultiplier);
            quantizedPositions[i + 2] = Math.floor((positions[i + 2] - zmin) * zMultiplier);
        }
        math.identityMat4(translate);
        math.translationMat4v(aabb, translate);
        math.identityMat4(scale);
        math.scalingMat4v([xwid / maxInt, ywid / maxInt, zwid / maxInt], scale);
        math.mulMat4(translate, scale, positionsDecodeMatrix);
    };
})();

function octEncodeNormals(array, lenArray, encoded, lenEncoded) { // http://jcgt.org/published/0003/02/01/
    let oct, dec, best, currentCos, bestCos;
    let i, ei;
    for (i = 0, ei = 0; i < lenArray; i += 3, ei += 2) {
        // Test various combinations of ceil and floor to minimize rounding errors
        best = oct = octEncodeVec3(array, i, "floor", "floor");
        dec = octDecodeVec2(oct);
        currentCos = bestCos = dot(array, i, dec);
        oct = octEncodeVec3(array, i, "ceil", "floor");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "floor", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "ceil", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        encoded[ei] = best[0];
        encoded[ei + 1] = best[1];
        lenEncoded += 2;
    }
    return lenEncoded;
}

function octEncodeVec3(array, i, xfunc, yfunc) { // Oct-encode single normal vector in 2 bytes
    let x = array[i] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    let y = array[i + 1] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    if (array[i + 2] < 0) {
        let tempx = x;
        let tempy = y;
        tempx = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        tempy = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
        x = tempx;
        y = tempy;
    }
    return new Int8Array([
        Math[xfunc](x * 127.5 + (x < 0 ? -1 : 0)),
        Math[yfunc](y * 127.5 + (y < 0 ? -1 : 0))
    ]);
}

function octDecodeVec2(oct) { // Decode an oct-encoded normal
    let x = oct[0];
    let y = oct[1];
    x /= x < 0 ? 127 : 128;
    y /= y < 0 ? 127 : 128;
    const z = 1 - Math.abs(x) - Math.abs(y);
    if (z < 0) {
        x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        y = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
    }
    const length = Math.sqrt(x * x + y * y + z * z);
    return [
        x / length,
        y / length,
        z / length
    ];
}

function dot(array, i, vec3) { // Dot product of a normal in an array against a candidate decoding
    return array[i] * vec3[0] + array[i + 1] * vec3[1] + array[i + 2] * vec3[2];
}

componentClasses[type] = BatchingLayer;

export {BatchingLayer};