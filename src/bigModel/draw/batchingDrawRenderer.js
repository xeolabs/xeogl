/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Map} from "../../utils/map.js";
import {BatchingDrawShaderSource} from "./batchingDrawShaderSource.js";
import {Program} from "../../webgl/program.js";
import {RENDER_PASSES} from './../renderPasses.js';
import {stats} from './../../stats.js';

const ids = new Map({});

const BatchingDrawRenderer = function (hash, layer) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = layer.scene;
    this._useCount = 0;
    this._shaderSource = new BatchingDrawShaderSource(layer);
    this._allocate(layer);
};

const renderers = {};
const defaultColorize = new Float32Array([1.0, 1.0, 1.0, 1.0]);

BatchingDrawRenderer.get = function (layer) {
    const scene = layer.scene;
    const hash = getHash(scene);
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new BatchingDrawRenderer(hash, layer);
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
    return [scene.canvas.canvas.id, "", scene._lightsState.getHash(), scene._clipsState.getHash()].join(";")
}

BatchingDrawRenderer.prototype.getValid = function () {
    return this._hash === getHash(this._scene);
};

BatchingDrawRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

BatchingDrawRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

BatchingDrawRenderer.prototype.drawLayer = function (frame, layer, renderPass) {
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
    gl.uniform1i(this._uRenderPass, renderPass);
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, model.worldMatrix);
    gl.uniformMatrix4fv(this._uModelNormalMatrix, gl.FALSE, model.worldNormalMatrix);
    this._aPosition.bindArrayBuffer(state.positionsBuf, gl.UNSIGNED_SHORT, false);
    frame.bindArray++;
    if (this._aNormal) {
        this._aNormal.bindArrayBuffer(state.normalsBuf, gl.BYTE, false);
        frame.bindArray++;
    }
    if (this._aColor) {
        this._aColor.bindArrayBuffer(state.colorsBuf, gl.UNSIGNED_BYTE, false);
        frame.bindArray++;
    }
    if (this._aFlags) {
        this._aFlags.bindArrayBuffer(state.flagsBuf, gl.UNSIGNED_BYTE, true);
        frame.bindArray++;
    }
    state.indicesBuf.bind();
    frame.bindArray++;
    if (renderPass === RENDER_PASSES.GHOST) {
        const material = scene.ghostMaterial._state;
        const fillColor = material.fillColor;
        const fillAlpha = material.fillAlpha;
        gl.uniform4f(this._uColorize, fillColor[0], fillColor[1], fillColor[2], fillAlpha);
    } else if (renderPass === RENDER_PASSES.HIGHLIGHT) {
        const material = scene.highlightMaterial._state;
        const fillColor = material.fillColor;
        const fillAlpha = material.fillAlpha;
        gl.uniform4f(this._uColorize, fillColor[0], fillColor[1], fillColor[2], fillAlpha);
    } else {
        gl.uniform4fv(this._uColorize, defaultColorize);
    }
    gl.drawElements(state.primitive, state.indicesBuf.numItems, state.indicesBuf.itemType, 0);
    frame.drawElements++;
};

BatchingDrawRenderer.prototype._allocate = function (layer) {
    const gl = layer.scene.canvas.gl;
    const lightsState = layer.scene._lightsState;
    const clipsState = layer.scene._clipsState;
    this._program = new Program(gl, this._shaderSource);
    if (this._program.errors) {
        this.errors = this._program.errors;
        return;
    }
    const program = this._program;
    this._uRenderPass = program.getLocation("renderPass");
    this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
    this._uModelMatrix = program.getLocation("modelMatrix");
    this._uModelNormalMatrix = program.getLocation("modelNormalMatrix");
    this._uViewMatrix = program.getLocation("viewMatrix");
    this._uViewNormalMatrix = program.getLocation("viewNormalMatrix");
    this._uProjMatrix = program.getLocation("projMatrix");
    this._uColorize = program.getLocation("colorize");
    this._uLightAmbient = [];
    this._uLightColor = [];
    this._uLightDir = [];
    this._uLightPos = [];
    this._uLightAttenuation = [];
    const lights = lightsState.lights;
    let light;

    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        switch (light.type) {
            case "ambient":
                this._uLightAmbient[i] = program.getLocation("lightAmbient");
                break;
            case "dir":
                this._uLightColor[i] = program.getLocation("lightColor" + i);
                this._uLightPos[i] = null;
                this._uLightDir[i] = program.getLocation("lightDir" + i);
                break;
            case "point":
                this._uLightColor[i] = program.getLocation("lightColor" + i);
                this._uLightPos[i] = program.getLocation("lightPos" + i);
                this._uLightDir[i] = null;
                this._uLightAttenuation[i] = program.getLocation("lightAttenuation" + i);
                break;
            case "spot":
                this._uLightColor[i] = program.getLocation("lightColor" + i);
                this._uLightPos[i] = program.getLocation("lightPos" + i);
                this._uLightDir[i] = program.getLocation("lightDir" + i);
                this._uLightAttenuation[i] = program.getLocation("lightAttenuation" + i);
                break;
        }
    }
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
    this._aNormal = program.getAttribute("normal");
    this._aColor = program.getAttribute("color");
    this._aFlags = program.getAttribute("flags");
};

BatchingDrawRenderer.prototype._bindProgram = function (frame, layer) {
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const program = this._program;
    const lightsState = scene._lightsState;
    const clipsState = scene._clipsState;
    const lights = lightsState.lights;
    let light;
    program.bind();
    frame.useProgram++;
    const camera = scene.camera;
    const cameraState = camera._state;
    gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
    gl.uniformMatrix4fv(this._uViewNormalMatrix, false, cameraState.normalMatrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, camera._project._state.matrix);
    gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, layer._state.positionsDecodeMatrix);
    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        if (this._uLightAmbient[i]) {
            gl.uniform4f(this._uLightAmbient[i], light.color[0], light.color[1], light.color[2], light.intensity);
        } else {
            if (this._uLightColor[i]) {
                gl.uniform4f(this._uLightColor[i], light.color[0], light.color[1], light.color[2], light.intensity);
            }
            if (this._uLightPos[i]) {
                gl.uniform3fv(this._uLightPos[i], light.pos);
                if (this._uLightAttenuation[i]) {
                    gl.uniform1f(this._uLightAttenuation[i], light.attenuation);
                }
            }
            if (this._uLightDir[i]) {
                gl.uniform3fv(this._uLightDir[i], light.dir);
            }
        }
    }
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

export {BatchingDrawRenderer};
