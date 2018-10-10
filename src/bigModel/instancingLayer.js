/**
 A InstancingLayer is a batch containing multiple geometries that is rendered in one draw call.

 It consists of a set of geometry attribute arrays and an index array.


 */
import {InstancingDrawRenderer} from "./draw/instancingDrawRenderer.js";
import {State} from '../renderer/state.js';
import {ArrayBuf} from '../webgl/arrayBuf.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.InstancingLayer";

class InstancingLayer {

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

            positionsDecodeMatrix: math.mat4()
        });
        this._aabb = math.collapseAABB3();

        this._finalized = false;
        this._drawRenderer = InstancingDrawRenderer.get(this);
    }

    createPortion(flags, color, matrix, aabb) {

    }

    finalize() {
        if (this._finalized) {
            this.error("Already finalized");
            return;
        }
        const state = this._state;
        const gl = this.scene.canvas.gl;
    //
        this._finalized = true;
    }

    setFlags(portionId, flags) { // TODO
    //
    }

    setColor(portionId, color) { // TODO
      //
    }

    draw(frame) {
        if (this._drawRenderer) {
            this._drawRenderer.drawLayer(frame, this);
        }
    }

    destroy() {
        if (this._drawRenderer) {
            this._drawRenderer.put();
            this._drawRenderer = null;
        }
        this._renderer.meshListDirty();
        const state = this._state;
      //
        state.destroy();
    }
}

var quantizePositions = (function () { // http://cg.postech.ac.kr/research/mesh_comp_mobile/mesh_comp_mobile_conference.pdf
    const translate = math.mat4();
    const scale = math.mat4();
    return function (positions, lenPositions, aabb, quantizedPositions, positionsDecodeMatrix) {
        const xMultiplier = 65535 / aabb[2];
        const yMultiplier = 65535 / aabb[3];
        const zMultiplier = 65535 / aabb[4];
        let i;
        for (i = 0; i < lenPositions; i += 3) {
            quantizedPositions[i + 0] = Math.floor((positions[i + 0] - aabb[0]) * xMultiplier);
            quantizedPositions[i + 1] = Math.floor((positions[i + 1] - aabb[1]) * yMultiplier);
            quantizedPositions[i + 2] = Math.floor((positions[i + 2] - aabb[2]) * zMultiplier);
        }
        math.identityMat4(translate);
        math.translationMat4v(aabb, translate);
        math.identityMat4(scale);
        math.scalingMat4v([aabb[2] / 65535, aabb[3] / 65535, aabb[4] / 65535], scale);
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

componentClasses[type] = InstancingLayer;

export {InstancingLayer};