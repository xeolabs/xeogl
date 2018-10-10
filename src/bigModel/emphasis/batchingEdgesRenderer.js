/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Map} from "../../utils/map.js";
import {BatchingEdgesShaderSource} from "./batchingEdgesShaderSource.js";
import {Program} from "../../webgl/program.js";
import {stats} from './../../stats.js';

const ids = new Map({});

const BatchingEdgesRenderer = function (hash, layer) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = layer.scene;
    this._useCount = 0;
    this._shaderSource = new BatchingEdgesShaderSource(layer);
    this._allocate(layer);
};

const renderers = {};

BatchingEdgesRenderer.get = function (layer) {
    const scene = layer.scene;
    const hash = getHash(scene);
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new BatchingEdgesRenderer(hash, layer);
        if (renderer.errors) {
            console.log(renderer.errors.join("\n"));
            return null;
        }
        renderers[hash] = renderer;
        stats.memory.programs++;
    }
    renderer._useCount++;
    return renderer;
};

function getHash(scene) {
    return [scene.canvas.canvas.id, "", scene._clipsState.getHash()].join(";")
}

BatchingEdgesRenderer.prototype.getValid = function () {
    return this._hash === getHash(this._scene);
};

BatchingEdgesRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

BatchingEdgesRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

BatchingEdgesRenderer.prototype.drawLayer = function (frame, layer, renderPass) {
    const model = layer.model;
    const scene = layer.scene;
    const gl = scene.canvas.gl;
    const state = layer._state;
    if (!this._program) {
        this._allocate(layer);
    }
    if (frame.lastProgramId !== this._program.id) {
        frame.lastProgramId = this._program.id;
        this._bindProgram(frame, layer);
    }
    gl.uniform4fv(this._uColor, new Float32Array([0.0, 0.0, 0.0, 0.0]));
    gl.uniform1i(this._uRenderPass, renderPass);
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, model.worldMatrix);
    gl.uniformMatrix4fv(this._uModelNormalMatrix, gl.FALSE, model.worldNormalMatrix);
    this._aPosition.bindArrayBuffer(state.positionsBuf, gl.UNSIGNED_SHORT, false);
    frame.bindArray++;
    if (this._aFlags) {
        this._aFlags.bindArrayBuffer(state.flagsBuf, gl.UNSIGNED_BYTE, true);
        frame.bindArray++;
    }
    state.edgeIndicesBuf.bind();
    frame.bindArray++;
    gl.drawElements(gl.LINES, state.edgeIndicesBuf.numItems, state.edgeIndicesBuf.itemType, 0);
    frame.drawElements++;
};

BatchingEdgesRenderer.prototype._allocate = function (layer) {
    const gl = layer.scene.canvas.gl;
    const clipsState = layer.scene._clipsState;
    this._program = new Program(gl, this._shaderSource);
    if (this._program.errors) {
        this.errors = this._program.errors;
        return;
    }
    const program = this._program;
    this._uColor = program.getLocation("color");
    this._uRenderPass = program.getLocation("renderPass");
    this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
    this._uViewMatrix = program.getLocation("viewMatrix");
    this._uProjMatrix = program.getLocation("projMatrix");
    this._uClips = [];
    const clips = clipsState.clips;
    for (var i = 0, len = clips.length; i < len; i++) {
        this._uClips.push({
            active: program.getLocation("clipActive" + i),
            pos: program.getLocation("clipPos" + i),
            dir: program.getLocation("clipDir" + i)
        });
    }
    this._aPosition = program.getAttribute("position");
    this._aFlags = program.getAttribute("flags");
};

BatchingEdgesRenderer.prototype._bindProgram = function (frame, layer) {
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const program = this._program;
    const clipsState = scene._clipsState;
    program.bind();
    frame.useProgram++;
    const camera = scene.camera;
    const cameraState = camera._state;
    this._uModelMatrix = program.getLocation("modelMatrix");
    this._uModelNormalMatrix = program.getLocation("modelNormalMatrix");
    gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, camera._project._state.matrix);
    gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, layer._state.positionsDecodeMatrix);
    if (clipsState.clips.length > 0) {
        const clips = scene._clipsState.clips;
        let clipUniforms;
        let uClipActive;
        let clip;
        let uClipPos;
        let uClipDir;
        for (var i = 0, len = this._uClips.length; i < len; i++) {
            clipUniforms = this._uClips[i];
            uClipActive = clipUniforms.active;
            clip = clips[i];
            if (uClipActive) {
                gl.uniform1i(uClipActive, clip.active);
            }
            uClipPos = clipUniforms.pos;
            if (uClipPos) {
                gl.uniform3fv(clipUniforms.pos, clip.pos);
            }
            uClipDir = clipUniforms.dir;
            if (uClipDir) {
                gl.uniform3fv(clipUniforms.dir, clip.dir);
            }
        }
    }
};

export {BatchingEdgesRenderer};
