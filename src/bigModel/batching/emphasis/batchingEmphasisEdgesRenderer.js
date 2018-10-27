/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Map} from "../../../utils/map.js";
import {BatchingEmphasisEdgesShaderSource} from "./batchingEmphasisEdgesShaderSource.js";
import {Program} from "../../../webgl/program.js";
import {stats} from './../../../stats.js';
import {RENDER_PASSES} from './../../renderPasses.js';

const ids = new Map({});

const BatchingEmphasisEdgesRenderer = function (hash, layer) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = layer.model.scene;
    this._useCount = 0;
    this._shaderSource = new BatchingEmphasisEdgesShaderSource(layer);
    this._allocate(layer);
};

const renderers = {};
const defaultColorize = new Float32Array([1.0, 1.0, 1.0, 1.0]);

BatchingEmphasisEdgesRenderer.get = function (layer) {
    const scene = layer.model.scene;
    const hash = getHash(scene);
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new BatchingEmphasisEdgesRenderer(hash, layer);
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

BatchingEmphasisEdgesRenderer.prototype.getValid = function () {
    return this._hash === getHash(this._scene);
};

BatchingEmphasisEdgesRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

BatchingEmphasisEdgesRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

BatchingEmphasisEdgesRenderer.prototype.drawLayer = function (frame, layer, renderPass) {
    const model = layer.model;
    const scene = model.scene;
    const gl = scene.canvas.gl;
    const state = layer._state;
    if (!this._program) {
        this._allocate(layer);
    }
    if (frame.lastProgramId !== this._program.id) {
        frame.lastProgramId = this._program.id;
        this._bindProgram(frame, layer);
    }
    if (renderPass === RENDER_PASSES.GHOSTED) {
        const material = scene.ghostMaterial._state;
        const fillColor = material.fillColor;
        const fillAlpha = material.fillAlpha;
        gl.uniform4f(this._uColorize, fillColor[0], fillColor[1], fillColor[2], fillAlpha);
    } else if (renderPass === RENDER_PASSES.HIGHLIGHTED) {
        const material = scene.highlightMaterial._state;
        const fillColor = material.fillColor;
        const fillAlpha = material.fillAlpha;
        gl.uniform4f(this._uColorize, fillColor[0], fillColor[1], fillColor[2], fillAlpha);
    } else {
        gl.uniform4fv(this._uColorize, defaultColorize);
    }
    gl.uniform1i(this._uRenderPass, renderPass);
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, model.worldMatrix);
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

BatchingEmphasisEdgesRenderer.prototype._allocate = function (layer) {
    var scene = layer.model.scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    this._program = new Program(gl, this._shaderSource);
    if (this._program.errors) {
        this.errors = this._program.errors;
        return;
    }
    const program = this._program;
    this._uColorize = program.getLocation("colorize");
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

BatchingEmphasisEdgesRenderer.prototype._bindProgram = function (frame, layer) {
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const program = this._program;
    const clipsState = scene._clipsState;
    program.bind();
    frame.useProgram++;
    const camera = scene.camera;
    const cameraState = camera._state;
    this._uModelMatrix = program.getLocation("modelMatrix");
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

export {BatchingEmphasisEdgesRenderer};
