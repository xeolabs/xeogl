/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {PickMeshShaderSource} from "./pickMeshShaderSource.js";
import {Program} from "../program.js";
import {stats} from "../../stats.js";

// No ID, because there is exactly one PickMeshRenderer per scene

const PickMeshRenderer = function (hash, mesh) {
    this._hash = hash;
    this._shaderSource = new PickMeshShaderSource(mesh);
    this._scene = mesh.scene;
    this._useCount = 0;
    this._allocate(mesh);
};

const renderers = {};

PickMeshRenderer.get = function (mesh) {
    const hash = [
        mesh.scene.canvas.canvas.id,
        mesh.scene._clipsState.getHash(),
        mesh._geometry._state.hash,
        mesh._state.hash
    ].join(";");
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new PickMeshRenderer(hash, mesh);
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

PickMeshRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

PickMeshRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

PickMeshRenderer.prototype.drawMesh = function (frame, mesh) {
    if (!this._program) {
        this._allocate(mesh);
    }
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const materialState = mesh._material._state;
    const geometryState = mesh._geometry._state;
    if (frame.lastProgramId !== this._program.id) {
        frame.lastProgramId = this._program.id;
        this._bindProgram(frame);
    }
    if (materialState.id !== this._lastMaterialId) {
        const backfaces = materialState.backfaces;
        if (frame.backfaces !== backfaces) {
            if (backfaces) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
            }
            frame.backfaces = backfaces;
        }
        const frontface = materialState.frontface;
        if (frame.frontface !== frontface) {
            if (frontface) {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
            frame.frontface = frontface;
        }
        if (frame.lineWidth !== materialState.lineWidth) {
            gl.lineWidth(materialState.lineWidth);
            frame.lineWidth = materialState.lineWidth;
        }
        if (this._uPointSize) {
            gl.uniform1i(this._uPointSize, materialState.pointSize);
        }
        this._lastMaterialId = materialState.id;
    }
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
    if (geometryState.combined) {
        const vertexBufs = mesh._geometry._getVertexBufs();
        if (vertexBufs.id !== this._lastVertexBufsId) {
            if (vertexBufs.positionsBuf && this._aPosition) {
                this._aPosition.bindArrayBuffer(vertexBufs.positionsBuf, vertexBufs.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                frame.bindArray++;
            }
            this._lastVertexBufsId = vertexBufs.id;
        }
    }
    // Mesh state
    if (this._uClippable) {
        gl.uniform1i(this._uClippable, mesh._state.clippable);
    }
    // Bind VBOs
    if (geometryState.id !== this._lastGeometryId) {
        if (this._uPositionsDecodeMatrix) {
            gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
        }
        if (geometryState.combined) { // VBOs were bound by the preceding VertexBufs chunk
            if (geometryState.indicesBufCombined) {
                geometryState.indicesBufCombined.bind();
                frame.bindArray++;
            }
        } else {
            if (this._aPosition) {
                this._aPosition.bindArrayBuffer(geometryState.positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                frame.bindArray++;
            }
            if (geometryState.indicesBuf) {
                geometryState.indicesBuf.bind();
                frame.bindArray++;
            }
        }
        this._lastGeometryId = geometryState.id;
    }
    // Mesh-indexed color
    const a = frame.pickmeshIndex >> 24 & 0xFF;
    const b = frame.pickmeshIndex >> 16 & 0xFF;
    const g = frame.pickmeshIndex >> 8 & 0xFF;
    const r = frame.pickmeshIndex & 0xFF;
    frame.pickmeshIndex++;
    gl.uniform4f(this._uPickColor, r / 255, g / 255, b / 255, a / 255);
    // Draw (indices bound in prev step)
    if (geometryState.combined) {
        if (geometryState.indicesBufCombined) { // Geometry indices into portion of uber-array
            gl.drawElements(geometryState.primitive, geometryState.indicesBufCombined.numItems, geometryState.indicesBufCombined.itemType, 0);
            frame.drawElements++;
        } else {
            // TODO: drawArrays() with VertexBufs positions
        }
    } else {
        if (geometryState.indicesBuf) {
            gl.drawElements(geometryState.primitive, geometryState.indicesBuf.numItems, geometryState.indicesBuf.itemType, 0);
            frame.drawElements++;
        } else if (geometryState.positions) {
            gl.drawArrays(gl.TRIANGLES, 0, geometryState.positions.numItems);
        }
    }
};

PickMeshRenderer.prototype._allocate = function (mesh) {
    const gl = mesh.scene.canvas.gl;
    this._program = new Program(gl, this._shaderSource);
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
    this._uClippable = program.getLocation("clippable");
    this._uPickColor = program.getLocation("pickColor");
    this._lastMaterialId = null;
    this._lastVertexBufsId = null;
    this._lastGeometryId = null;
};

PickMeshRenderer.prototype._bindProgram = function (frame) {
    if (!this._program) {
        this._allocate(mesh);
    }
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    const camera = scene.camera;
    const cameraState = camera._state;
    this._program.bind();
    frame.useProgram++;
    this._lastMaterialId = null;
    this._lastVertexBufsId = null;
    this._lastGeometryId = null;
    gl.uniformMatrix4fv(this._uViewMatrix, false, frame.pickViewMatrix || cameraState.matrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, frame.pickProjMatrix || camera.project._state.matrix);
    if (clipsState.clips.length > 0) {
        let clipUniforms;
        let uClipActive;
        let clip;
        let uClipPos;
        let uClipDir;
        for (let i = 0, len = this._uClips.length; i < len; i++) {
            clipUniforms = this._uClips[i];
            uClipActive = clipUniforms.active;
            clip = clipsState.clips[i];
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

export{PickMeshRenderer};
