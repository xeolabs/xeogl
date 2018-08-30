/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Map} from "../../utils/map.js";
import {EmphasisVerticesShaderSource} from "./emphasisVerticesShaderSource.js";
import {Program} from "../program.js";
import {stats} from "../../stats.js";

const ids = new Map({});

const EmphasisVerticesRenderer = function (hash, mesh) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = mesh.scene;
    this._shaderSource = new EmphasisVerticesShaderSource(mesh);
    this._allocate(mesh);
};

const renderers = {};

EmphasisVerticesRenderer.get = function (mesh) {
    const hash = [
        mesh.scene.id,
        mesh.scene.gammaOutput ? "go" : "",
        mesh.scene._clipsState.getHash(),
        mesh._geometry._state.quantized ? "cp" : "",
        mesh._state.hash
    ].join(";");
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new EmphasisVerticesRenderer(hash, mesh);
        renderers[hash] = renderer;
        stats.memory.programs++;
    }
    renderer._useCount++;
    return renderer;
};

EmphasisVerticesRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        this._scene.off(this._onWebglcontextrestored);
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

EmphasisVerticesRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

EmphasisVerticesRenderer.prototype.drawMesh = function (frame, mesh, mode) {
    if (!this._program) {
        this._allocate(mesh);
    }
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const materialState = mode === 0 ? mesh._ghostMaterial._state : (mode === 1 ? mesh._highlightMaterial._state : mesh._selectedMaterial._state);
    const meshState = mesh._state;
    const geometryState = mesh._geometry._state;
    if (frame.lastProgramId !== this._program.id) {
        frame.lastProgramId = this._program.id;
        this._bindProgram(frame, mesh);
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
        if (this._uVertexSize) { // TODO: cache
            gl.uniform1f(this._uVertexSize, materialState.vertexSize);
        }
        if (this._uVertexColor) {
            const vertexColor = materialState.vertexColor;
            const vertexAlpha = materialState.vertexAlpha;
            gl.uniform4f(this._uVertexColor, vertexColor[0], vertexColor[1], vertexColor[2], vertexAlpha);
        }
        this._lastMaterialId = materialState.id;
    }
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
    if (this._uModelNormalMatrix) {
        gl.uniformMatrix4fv(this._uModelNormalMatrix, gl.FALSE, mesh.worldNormalMatrix);
    }
    if (this._uClippable) {
        gl.uniform1i(this._uClippable, meshState.clippable);
    }
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
    // Bind VBOs
    if (geometryState.id !== this._lastGeometryId) {
        if (this._uPositionsDecodeMatrix) {
            gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
        }
        if (geometryState.combined) { // VBOs were bound by the VertexBufs logic above
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
                // gl.drawElements(geometryState.primitive, geometryState.indicesBuf.numItems, geometryState.indicesBuf.itemType, 0);
                // frame.drawElements++;
            } else if (geometryState.positions) {
                // gl.drawArrays(gl.TRIANGLES, 0, geometryState.positions.numItems);
                //  frame.drawArrays++;
            }
        }
        this._lastGeometryId = geometryState.id;
    }
    // Draw (indices bound in prev step)
    if (geometryState.combined) {
        if (geometryState.indicesBufCombined) { // Geometry indices into portion of uber-array
            gl.drawElements(gl.POINTS, geometryState.indicesBufCombined.numItems, geometryState.indicesBufCombined.itemType, 0);
            frame.drawElements++;
        } else {
            // TODO: drawArrays() with VertexBufs positions
        }
    } else {
        if (geometryState.indicesBuf) {
            gl.drawElements(gl.POINTS, geometryState.indicesBuf.numItems, geometryState.indicesBuf.itemType, 0);
            frame.drawElements++;
        } else if (geometryState.positions) {
            gl.drawArrays(gl.POINTS, 0, geometryState.positions.numItems);
            frame.drawArrays++;
        }
    }
};

EmphasisVerticesRenderer.prototype._allocate = function (mesh) {
    const clipsState = mesh.scene._clipsState;
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
    for (let i = 0, len = clipsState.clips.length; i < len; i++) {
        this._uClips.push({
            active: program.getLocation("clipActive" + i),
            pos: program.getLocation("clipPos" + i),
            dir: program.getLocation("clipDir" + i)
        });
    }
    this._uVertexColor = program.getLocation("vertexColor");
    this._uVertexSize = program.getLocation("vertexSize");
    this._aPosition = program.getAttribute("position");
    this._uClippable = program.getLocation("clippable");
    this._uGammaFactor = program.getLocation("gammaFactor");
    this._lastMaterialId = null;
    this._lastVertexBufsId = null;
    this._lastGeometryId = null;
};

EmphasisVerticesRenderer.prototype._bindProgram = function (frame, mesh) {
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    const program = this._program;
    const camera = scene.camera;
    const cameraState = camera._state;
    program.bind();
    frame.useProgram++;
    frame.textureUnit = 0;
    this._lastMaterialId = null;
    this._lastVertexBufsId = null;
    this._lastGeometryId = null;
    gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, camera.project._state.matrix);
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
    if (this._uGammaFactor) {
        gl.uniform1f(this._uGammaFactor, scene.gammaFactor);
    }
};

export{EmphasisVerticesRenderer};
