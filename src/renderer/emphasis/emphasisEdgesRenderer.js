/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Map} from "../../utils/map.js";
import {EmphasisEdgesShaderSource} from "./emphasisEdgesShaderSource.js";
import {Program} from "../program.js";
import {stats} from './../../stats.js';

const ids = new Map({});

const EmphasisEdgesRenderer = function (hash, mesh) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = mesh.scene;
    this._useCount = 0;
    this._shaderSource = new EmphasisEdgesShaderSource(mesh);
    this._allocate(mesh);
};

const renderers = {};

EmphasisEdgesRenderer.get = function (mesh) {
    const hash = [
        mesh.scene.id,
        mesh.scene.gammaOutput ? "go" : "", // Gamma input not needed
        mesh.scene._clipsState.getHash(),
        mesh._geometry._state.quantized ? "cp" : "",
        mesh._state.hash
    ].join(";");
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new EmphasisEdgesRenderer(hash, mesh);
        renderers[hash] = renderer;
        stats.memory.programs++;
    }
    renderer._useCount++;
    return renderer;
};

EmphasisEdgesRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

EmphasisEdgesRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

EmphasisEdgesRenderer.prototype.drawMesh = function (frame, mesh, mode) {
    if (!this._program) {
        this._allocate(mesh);
    }
    const scene = this._scene;
    const gl = scene.canvas.gl;
    let materialState;
    const meshState = mesh._state;
    const geometry = mesh._geometry;
    const geometryState = geometry._state;
    if (frame.lastProgramId !== this._program.id) {
        frame.lastProgramId = this._program.id;
        this._bindProgram(frame);
    }
    switch (mode) {
        case 0:
            materialState = mesh._ghostMaterial._state;
            break;
        case 1:
            materialState = mesh._highlightMaterial._state;
            break;
        case 2:
            materialState = mesh._selectedMaterial._state;
            break;
        case 3:
        default:
            materialState = mesh._edgeMaterial._state;
            break;
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
        if (frame.lineWidth !== materialState.edgeWidth) {
            gl.lineWidth(materialState.edgeWidth);
            frame.lineWidth = materialState.edgeWidth;
        }
        if (this._uEdgeColor) {
            const edgeColor = materialState.edgeColor;
            const edgeAlpha = materialState.edgeAlpha;
            gl.uniform4f(this._uEdgeColor, edgeColor[0], edgeColor[1], edgeColor[2], edgeAlpha);
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
    let indicesBuf;
    if (geometryState.primitive === gl.TRIANGLES) {
        indicesBuf = geometry._getEdgesIndices();
    } else if (geometryState.primitive === gl.LINES) {
        indicesBuf = geometryState.indicesBuf;
    }
    if (indicesBuf) {
        if (geometryState.id !== this._lastGeometryId) {
            if (this._uPositionsDecodeMatrix) {
                gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
            }
            if (!geometryState.combined) { // VBOs were bound by the VertexBufs logic above
                if (this._aPosition) {
                    this._aPosition.bindArrayBuffer(geometryState.positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
            }
            indicesBuf.bind();
            frame.bindArray++;
            this._lastGeometryId = geometryState.id;
        }
        gl.drawElements(gl.LINES, indicesBuf.numItems, indicesBuf.itemType, 0);
        frame.drawElements++;
    }
};

EmphasisEdgesRenderer.prototype._allocate = function (mesh) {
    const gl = mesh.scene.canvas.gl;
    const clipsState = mesh.scene._clipsState;
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
    for (let i = 0, len = clipsState.clips.length; i < len; i++) {
        this._uClips.push({
            active: program.getLocation("clipActive" + i),
            pos: program.getLocation("clipPos" + i),
            dir: program.getLocation("clipDir" + i)
        });
    }
    this._uEdgeColor = program.getLocation("edgeColor");
    this._aPosition = program.getAttribute("position");
    this._uClippable = program.getLocation("clippable");
    this._uGammaFactor = program.getLocation("gammaFactor");
    this._lastMaterialId = null;
    this._lastVertexBufsId = null;
    this._lastGeometryId = null;
};

EmphasisEdgesRenderer.prototype._bindProgram = function (frame) {
    const program = this._program;
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    const camera = scene.camera;
    const cameraState = camera._state;
    program.bind();
    frame.useProgram++;
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

export {EmphasisEdgesRenderer};
