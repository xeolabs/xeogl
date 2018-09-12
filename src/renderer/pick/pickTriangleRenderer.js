/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {PickTriangleShaderSource} from "./pickTriangleShaderSource.js";
import {Program} from "../program.js";
import {stats} from "../../stats.js";

const PickTriangleRenderer = function (hash, mesh) {
    this._hash = hash;
    this._scene = mesh.scene;
    this._useCount = 0;
    this._shaderSource = new PickTriangleShaderSource(mesh);
    this._allocate(mesh);
};

const renderers = {};

PickTriangleRenderer.get = function (mesh) {
    const hash = [
        mesh.scene.canvas.canvas.id,
        mesh.scene._clipsState.getHash(),
        mesh._geometry._state.quantized ? "cp" : "",
        mesh._state.hash
    ].join(";");
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new PickTriangleRenderer(hash, mesh);
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

PickTriangleRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

PickTriangleRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

PickTriangleRenderer.prototype.drawMesh = function (frame, mesh) {
    if (!this._program) {
        this._allocate(mesh);
    }
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    const materialState = mesh._material._state;
    const meshState = mesh._state;
    const geometry = mesh._geometry;
    const geometryState = mesh._geometry._state;
    const backfaces = materialState.backfaces;
    const frontface = materialState.frontface;
    const positionsBuf = geometry._getPickTrianglePositions();
    const pickColorsBuf = geometry._getPickTriangleColors();
    const camera = scene.camera;
    const cameraState = camera._state;
    this._program.bind();
    frame.useProgram++;
    gl.uniformMatrix4fv(this._uViewMatrix, false, frame.pickViewMatrix || cameraState.matrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, frame.pickProjMatrix || camera.project._state.matrix);
    if (clipsState.clips.length > 0) {
        const clips = clipsState.clips;
        let clipUniforms;
        let uClipActive;
        let clip;
        let uClipPos;
        let uClipDir;
        for (let i = 0, len = this._uClips.length; i < len; i++) {
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
    if (frame.backfaces !== backfaces) {
        if (backfaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }
        frame.backfaces = backfaces;
    }
    if (frame.frontface !== frontface) {
        if (frontface) {
            gl.frontFace(gl.CCW);
        } else {
            gl.frontFace(gl.CW);
        }
        frame.frontface = frontface;
    }
    this._lastMaterialId = materialState.id;
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
    if (this._uClippable) {
        gl.uniform1i(this._uClippable, mesh._state.clippable);
    }
    if (this._uPositionsDecodeMatrix) {
        gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
        this._aPosition.bindArrayBuffer(positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
    } else {
        this._aPosition.bindArrayBuffer(positionsBuf);
    }
    pickColorsBuf.bind();
    gl.enableVertexAttribArray(this._aColor.location);
    gl.vertexAttribPointer(this._aColor.location, pickColorsBuf.itemSize, pickColorsBuf.itemType, true, 0, 0); // Normalize
    gl.drawArrays(geometryState.primitive, 0, positionsBuf.numItems / 3);
};

PickTriangleRenderer.prototype._allocate = function (mesh) {
    const gl = mesh.scene.canvas.gl;
    this._program = new Program(gl, this._shaderSource);
    this._useCount = 0;
    if (this._program.errors) {
        this.errors = this._program.errors;
        return;
    }
    const program = this._program;
    this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
    this._uModelMatrix = program.getLocation("modelMatrix");
    this._uViewMatrix = program.getLocation("viewMatrix");
    this._uProjMatrix = program.getLocation("projMatrix");
    this._uClips = [];
    const clips = mesh.scene._clipsState.clips;
    for (let i = 0, len = clips.length; i < len; i++) {
        this._uClips.push({
            active: program.getLocation("clipActive" + i),
            pos: program.getLocation("clipPos" + i),
            dir: program.getLocation("clipDir" + i)
        });
    }
    this._aPosition = program.getAttribute("position");
    this._aColor = program.getAttribute("color");
    this._uClippable = program.getLocation("clippable");
};

export{PickTriangleRenderer};



