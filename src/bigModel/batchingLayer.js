/**
 A BatchingLayer is a batch containing multiple geometries that is rendered in one draw call.

 It consists of a set of geometry attribute arrays and an index array.

 */
import {WEBGL_INFO} from './../webglInfo.js';
import {BatchingDrawRenderer} from "./draw/batchingDrawRenderer.js";
import {BatchingEdgesRenderer} from "./emphasis/batchingEdgesRenderer.js";
import {BatchingPickRenderer} from "./pick/batchingPickRenderer.js";
import {State} from '../renderer/state.js';
import {ArrayBuf} from '../webgl/arrayBuf.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";
import {RENDER_FLAGS} from './renderFlags.js';
import {RENDER_PASSES} from './renderPasses.js';

const type = "xeogl.BatchingLayer";

const tempMat4 = math.mat4();
const tempVec3a = math.vec4([0, 0, 0, 1]);
const tempVec3b = math.vec4([0, 0, 0, 1]);

// Scratch memory used when updating the flags and colors VBOs
const bigIndicesSupported = WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];
const uint8Vec4Temp = new Uint8Array((bigIndicesSupported ? 5000000 : 65530) * 4); // Scratch memory for dynamic flags VBO update

var currentBatchingLayer = null;

class BatchingLayer {

    constructor(model, cfg) {
        this.model = model;
        this.scene = model.scene;
        this._buffer = cfg.buffer;
        var primitiveName = cfg.primitive || "triangles";
        var primitive;
        const gl = model.scene.canvas.gl;
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
            edgeIndicesBuf: null,
            positionsDecodeMatrix: math.mat4()
        });

        // These counts are used to avoid unnecessary render passes
        this.numObjects = 0;
        this.numVisibleObjects = 0;
        this.numTransparentObjects = 0;
        this.numGhostedObjects = 0;
        this.numHighlightedObjects = 0;
        this.numEdgesObjects = 0;

        //this.pickObjectBaseIndex = cfg.pickObjectBaseIndex;

        this._aabb = math.collapseAABB3();
        this._portions = [];

        this._finalized = false;

        this.compile();
    }

    canCreatePortion(lenPositions) {
        return (!this._finalized && this._buffer.lenPositions + lenPositions) < (this._buffer.maxVerts * 3);
    }

    /**
     * Appends geometry info to temp buffer arrays, creating a "portion" within this layer..
     *
     * - Color is expected to be quantized.
     * - Transforms the given positions by the given matrix before appending.
     * - Positions are not quantized until we call finalize(), which is when we know what their boundary is.
     * - Normals are quantized before appending.
     * - As we append flags, we count the numbers of visible, ghosted, highlighted and edged objects in this layer.
     * - Returns a handle to the new portion.
     */
    createPortion(positions, normals, indices, edgeIndices, flags, color, matrix, aabb) {
        if (this._finalized) {
            this.error("BatchingLayer already finalized - can't create more portions");
            return;
        }
        if (!this.canCreatePortion(positions.length)) {
            this.error("BatchingLayer full - check first with canCreatePortion()");
            return;
        }
        if (currentBatchingLayer !== null) {
            if (currentBatchingLayer !== this) {
                this.error("Already packing another BatchingLayer");
                return;
            }
        } else {
            currentBatchingLayer = this;
        }
        const buffer = this._buffer;
        const positionsIndex = buffer.lenPositions;
        const vertsIndex = positionsIndex / 3;
        const numVerts = positions.length / 3;
        const lenPositions = positions.length;
        { // Positions
            buffer.positions.set(positions, buffer.lenPositions);
            if (matrix) {
                for (var i = buffer.lenPositions, len = buffer.lenPositions + lenPositions; i < len; i += 3) {
                    tempVec3a[0] = buffer.positions[i + 0];
                    tempVec3a[1] = buffer.positions[i + 1];
                    tempVec3a[2] = buffer.positions[i + 2];
                    math.transformPoint4(matrix, tempVec3a, tempVec3b);
                    math.expandAABB3Point3(aabb, tempVec3b); // Expand portion AABB
                    math.expandAABB3Point3(this._aabb, tempVec3b); // Expand BatchingLayer AABB
                    buffer.positions[i + 0] = tempVec3b[0];
                    buffer.positions[i + 1] = tempVec3b[1];
                    buffer.positions[i + 2] = tempVec3b[2];
                }
            } else {
                for (var i = buffer.lenPositions, len = buffer.lenPositions + lenPositions; i < len; i += 3) {
                    tempVec3a[0] = buffer.positions[i + 0];
                    tempVec3a[1] = buffer.positions[i + 1];
                    tempVec3a[2] = buffer.positions[i + 2];
                    math.expandAABB3Point3(aabb, tempVec3a);
                    math.expandAABB3Point3(this._aabb, tempVec3a);
                }
            }
            buffer.lenPositions += lenPositions;
        }
        if (normals) {
            var modelNormalMatrix = tempMat4;
            if (matrix) {
                math.inverseMat4(matrix, modelNormalMatrix);
                math.transposeMat4(modelNormalMatrix);
            } else {
                math.identityMat4(modelNormalMatrix, modelNormalMatrix);
            }
            buffer.lenEncodedNormals = octEncodeNormals(modelNormalMatrix, normals, normals.length, buffer.encodedNormals, buffer.lenEncodedNormals); // BOTTLENECK - better to have these precomputed in the pipeline!
        }
        if (flags) {
            const lenFlags = (numVerts * 4);
            var visible = !!(flags & RENDER_FLAGS.VISIBLE) ? 255 : 0;
            var ghosted = !!(flags & RENDER_FLAGS.GHOSTED) ? 255 : 0;
            var highlighted = !!(flags & RENDER_FLAGS.HIGHLIGHTED) ? 255 : 0;
            var clippable = !!(flags & RENDER_FLAGS.CLIPPABLE) ? 255 : 0;
            var edges = !!(flags & RENDER_FLAGS.EDGES) ? 255 : 0;
            //   edges = Math.random() < .5;
            for (var i = buffer.lenFlags, len = buffer.lenFlags + lenFlags; i < len; i += 4) {
                //buffer.flags[i + 0] = visible;
                buffer.flags[i + 0] = true;
                buffer.flags[i + 1] = ghosted;
                buffer.flags[i + 2] = highlighted;
                buffer.flags[i + 3] = clippable;
            }
            buffer.lenFlags += lenFlags;
            if (visible) {
                this.numVisibleObjects++;
            }
            if (ghosted) {
                this.numGhostedObjects++;
            }
            if (highlighted) {
                this.numHighlightedObjects++;
            }
            if (edges) {
                this.numEdgesObjects++;
            }
        }
        if (color) {
            const lenColors = (numVerts * 4);

            // Color is pre-quantized
            const r = color[0];
            const g = color[1];
            const b = color[2];
            const a = color[3];

            for (var i = buffer.lenColors, len = buffer.lenColors + lenColors; i < len; i += 4) {
                buffer.colors[i + 0] = r;
                buffer.colors[i + 1] = g;
                buffer.colors[i + 2] = b;
                buffer.colors[i + 3] = a;
            }
            buffer.lenColors += lenColors;
            if (a < 255) {
                this.numTransparentObjects++;
            }
        }
        if (indices) {
            for (var i = 0, len = indices.length; i < len; i++) {
                buffer.indices[buffer.lenIndices + i] = indices[i] + vertsIndex;
            }
            buffer.lenIndices += indices.length;
        }
        if (edgeIndices) {
            for (var i = 0, len = edgeIndices.length; i < len; i++) {
                buffer.edgeIndices[buffer.lenEdgeIndices + i] = edgeIndices[i] + vertsIndex;
            }
            buffer.lenEdgeIndices += edgeIndices.length;
        }
        {
            var pickObjectId = this.numObjects;
            const lenPickIDs = (numVerts * 2);
            for (var i = buffer.lenPickIDs, len = buffer.lenPickIDs + lenPickIDs; i < len; i+=2) {
                buffer.pickIDs[i + 0] = pickObjectId;
                buffer.pickIDs[i + 1] = pickObjectId; // TODO: Make this the prim index
            }
            buffer.lenPickIDs += lenPickIDs;
        }

        var portionId = this._portions.length / 2;
        this._portions.push(vertsIndex);
        this._portions.push(numVerts);
        this.numObjects++;
        return portionId;
    }

    /**
     * Creates VBOs from the arrays that we've built with calls to createPortion().
     * After this, we're no longer allowed to call createPortion() for this BatchingLayer.
     */
    finalize() {
        if (this._finalized) {
            this.error("Already finalized");
            return;
        }
        this.clear();

        const state = this._state;
        const gl = this.model.scene.canvas.gl;
        const buffer = this._buffer;

        quantizePositions(buffer.positions, buffer.lenPositions, this._aabb, buffer.quantizedPositions, state.positionsDecodeMatrix); // BOTTLENECK

        if (buffer.slicing) {
            state.positionsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.quantizedPositions.slice(0, buffer.lenPositions), buffer.lenPositions, 3, gl.STATIC_DRAW);
            if (buffer.lenEncodedNormals > 0) {
                state.normalsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.encodedNormals.slice(0, buffer.lenEncodedNormals), buffer.lenEncodedNormals, 2, gl.STATIC_DRAW);
            }
            if (buffer.lenColors > 0) {
                state.colorsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.colors.slice(0, buffer.lenColors), buffer.lenColors, 4, gl.STATIC_DRAW);
            }
            if (buffer.lenIndices > 0) {
                state.indicesBuf = new ArrayBuf(gl, gl.ELEMENT_ARRAY_BUFFER, buffer.indices.slice(0, buffer.lenIndices), buffer.lenIndices, 1, gl.STATIC_DRAW);
            }
            if (buffer.lenEdgeIndices > 0) {
                state.edgeIndicesBuf = new ArrayBuf(gl, gl.ELEMENT_ARRAY_BUFFER, buffer.edgeIndices.slice(0, buffer.lenEdgeIndices), buffer.lenEdgeIndices, 1, gl.STATIC_DRAW);
            }
            state.flagsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.flags.slice(0, buffer.lenFlags), buffer.lenFlags, 4, gl.STATIC_DRAW);
        } else {
            state.positionsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.quantizedPositions, buffer.quantizedPositions.length, 3, gl.STATIC_DRAW);
            if (buffer.lenEncodedNormals > 0) {
                state.normalsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.encodedNormals, buffer.encodedNormals.length, 2, gl.STATIC_DRAW);
            }
            if (buffer.lenColors > 0) {
                state.colorsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.colors, buffer.colors.length, 4, gl.STATIC_DRAW);
            }
            state.flagsBuf = new ArrayBuf(gl, gl.ARRAY_BUFFER, buffer.flags, buffer.flags.length, 4, gl.STATIC_DRAW);
            if (buffer.lenIndices > 0) {
                state.indicesBuf = new ArrayBuf(gl, gl.ELEMENT_ARRAY_BUFFER, buffer.indices, buffer.indices.length, 1, gl.STATIC_DRAW);
            }
            if (buffer.lenEdgeIndices > 0) {
                state.edgeIndicesBuf = new ArrayBuf(gl, gl.ELEMENT_ARRAY_BUFFER, buffer.edgeIndices, buffer.edgeIndices.length, 1, gl.STATIC_DRAW);
            }
        }

        buffer.lenPositions = 0;
        buffer.lenColors = 0;
        buffer.lenEncodedNormals = 0;
        buffer.lenFlags = 0;
        buffer.lenIndices = 0;
        buffer.lenEdgeIndices = 0;

        currentBatchingLayer = null;

        this._buffer = null;

        this._finalized = true;
    }

    /**
     * Updates the rendering flags for the given portion.
     */
    setFlags(portionId, flags) {
        var portionsIdx = portionId * 2;
        var vertexBase = this._portions[portionsIdx];
        var numVerts = this._portions[portionsIdx + 1];
        var firstFlag = vertexBase * 4;
        var lenFlags = numVerts * 4;
        var visible = !!(flags & RENDER_FLAGS.VISIBLE) ? 255 : 0;
        var ghosted = !!(flags & RENDER_FLAGS.GHOSTED) ? 255 : 0;
        var highlighted = !!(flags & RENDER_FLAGS.HIGHLIGHTED) ? 255 : 0;
        var clippable = !!(flags & RENDER_FLAGS.CLIPPABLE) ? 255 : 0;
        for (var i = 0; i < lenFlags; i += 4) {
            uint8Vec4Temp[i + 0] = visible;
            uint8Vec4Temp[i + 1] = ghosted;
            uint8Vec4Temp[i + 2] = highlighted;
            uint8Vec4Temp[i + 3] = clippable;
        }
        this._state.flagsBuf.setData(uint8Vec4Temp.slice(0, lenFlags), firstFlag, lenFlags);
    }

    /**
     * Updates the RGBA values for the given portion.
     *
     * Values are assumed to be quantized to unsigned shorts.
     */
    setColor(portionId, color) {
        var portionsIdx = portionId * 2;
        var vertexBase = this._portions[portionsIdx];
        var numVerts = this._portions[portionsIdx + 1];
        var firstColor = vertexBase * 4;
        var lenColors = numVerts * 4;
        const r = color[0];
        const g = color[1];
        const b = color[2];
        const a = color[3];
        for (var i = 0; i < lenColors; i += 4) {
            uint8Vec4Temp[i + 0] = r;
            uint8Vec4Temp[i + 1] = g;
            uint8Vec4Temp[i + 2] = b;
            uint8Vec4Temp[i + 3] = a;
        }
        this._state.colorsBuf.setData(uint8Vec4Temp.slice(0, lenColors), firstColor, lenColors);
    }

    drawOpaque(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === this.numObjects || this.numGhostedObjects === this.numObjects) {
            return;
        }
        this._draw(frame, RENDER_PASSES.OPAQUE);
    }

    drawTransparent(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === 0 || this.numGhostedObjects === this.numObjects) {
            return;
        }
        this._draw(frame, RENDER_PASSES.TRANSPARENT);
    }

    drawGhostedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numGhostedObjects === 0) {
            return;
        }
        this._draw(frame, RENDER_PASSES.GHOST);
    }

    drawGhostedEdges(frame) {
    }

    drawGhostedVertices(frame) {
    }

    drawHighlightedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numHighlightedObjects === 0) {
            return;
        }
        this._draw(frame, RENDER_PASSES.HIGHLIGHT);
    }

    drawHighlightedEdges(frame) {
    }

    drawHighlightedVertices(frame) {
    }

    drawSelectedFill(frame) {
    }

    drawSelectedEdges(frame) {
    }

    drawSelectedVertices(frame) {
    }

    _draw(frame, renderPass) {
        if (this._drawRenderer) {
            this._drawRenderer.drawLayer(frame, this, renderPass);
        }
    }

    /**
     * Draws edges for edge-enhanced objects.
     */
    drawEdges(frame) {
        if (this.numEdgesObjects === 0) {
            return;
        }
        if (this._edgesRenderer) {
            this._edgesRenderer.drawLayer(frame, this);
        }
    }

    /**
     * Attempts to pick a triangle on an object
     */
    pick(frame) {
        if (this.numVisibleObjects === 0) {
            return;
        }
        if (this._pickRenderer) {
            this._pickRenderer.drawLayer(frame, this);
        }
    }

    /**
     * Clears this portion and un-finalizes it so that we can then call createPortion() to rebuild it.
     */
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
        if (state.edgeIndicesBuf) {
            state.edgeIndicesBuf.destroy();
            state.edgeIndicessBuf = null;
        }
        this._finalized = false;
    }

    /**
     * xeogl hook that creates shaders.
     */
    compile() {
        if (this._drawRenderer && this._drawRenderer.getValid() === false) {
            this._drawRenderer.put();
            this._drawRenderer = null;
        }
        if (!this._drawRenderer) {
            this._drawRenderer = BatchingDrawRenderer.get(this);
        }
        if (this._edgesRenderer && this._edgesRenderer.getValid() === false) {
            this._edgesRenderer.put();
            this._edgesRenderer = null;
        }
        if (!this._edgesRenderer) {
            this._edgesRenderer = BatchingEdgesRenderer.get(this);
        }
        if (!this._pickRenderer) {
            this._pickRenderer = BatchingPickRenderer.get(this);
        }
    }

    /**
     * xeogl hook to destroy this layer.
     */
    destroy() {
        this.clear();
        if (this._drawRenderer) {
            this._drawRenderer.put();
            this._drawRenderer = null;
        }
        if (this._edgesRenderer) {
            this._edgesRenderer.put();
            this._edgesRenderer = null;
        }
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

function octEncodeNormals(modelNormalMatrix, normals, lenNormals, encodedNormals, lenEncodedNormals) { // http://jcgt.org/published/0003/02/01/
    let oct, dec, best, currentCos, bestCos;
    let i, ei;
    let localNormal = new Float32Array([0, 0, 0, 0]);
    let worldNormal = new Float32Array([0, 0, 0, 0]);
    for (i = 0, ei = 0; i < lenNormals; i += 3, ei += 2) {
        localNormal[0] = normals[i];
        localNormal[1] = normals[i + 1];
        localNormal[2] = normals[i + 2];
        math.transformVec4(modelNormalMatrix, localNormal, worldNormal);
        math.normalizeVec3(worldNormal, worldNormal);
        // Test various combinations of ceil and floor to minimize rounding errors
        best = oct = octEncodeVec3(worldNormal, "floor", "floor");
        dec = octDecodeVec2(oct);
        currentCos = bestCos = dot(worldNormal, dec);
        oct = octEncodeVec3(worldNormal, "ceil", "floor");
        dec = octDecodeVec2(oct);
        currentCos = dot(worldNormal, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(worldNormal, "floor", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(worldNormal, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(worldNormal, "ceil", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(worldNormal, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        encodedNormals[ei] = best[0];
        encodedNormals[ei + 1] = best[1];
        lenEncodedNormals += 2;
    }
    return lenEncodedNormals;
}

function octEncodeVec3(p, xfunc, yfunc) { // Oct-encode single normal vector in 2 bytes
    let x = p[0] / (Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]));
    let y = p[1] / (Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]));
    if (p[2] < 0) {
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

function dot(p, vec3) { // Dot product of a normal in an array against a candidate decoding
    return p[0] * vec3[0] + p[1] * vec3[1] + p[2] * vec3[2];
}

componentClasses[type] = BatchingLayer;

export {BatchingLayer};