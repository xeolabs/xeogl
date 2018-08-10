/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.EmphasisEdgesRenderer = function (hash, mesh) {
        this.id = ids.addItem({});
        this._hash = hash;
        this._scene = mesh.scene;
        this._useCount = 0;
        this._shaderSource = new xeogl.renderer.EmphasisEdgesShaderSource(mesh);
        this._allocate(mesh);
    };

    var renderers = {};

    xeogl.renderer.EmphasisEdgesRenderer.get = function (mesh) {
        var hash = [
            mesh.scene.id,
            mesh.scene.gammaOutput ? "go" : "", // Gamma input not needed
            mesh.scene._clipsState.getHash(),
            mesh._geometry._state.quantized ? "cp" : "",
            mesh._state.hash
        ].join(";");
        var renderer = renderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.EmphasisEdgesRenderer(hash, mesh);
            renderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.EmphasisEdgesRenderer.prototype.put = function () {
        if (--this._useCount === 0) {
            ids.removeItem(this.id);
            if (this._program) {
                this._program.destroy();
            }
            delete renderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.EmphasisEdgesRenderer.prototype.webglContextRestored = function () {
        this._program = null;
    };

    xeogl.renderer.EmphasisEdgesRenderer.prototype.drawMesh = function (frame, mesh, mode) {
        if (!this._program) {
            this._allocate(mesh);
        }
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var materialState;
        var meshState = mesh._state;
        var geometry = mesh._geometry;
        var geometryState = geometry._state;
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
            var backfaces = materialState.backfaces;
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
                var edgeColor = materialState.edgeColor;
                var edgeAlpha = materialState.edgeAlpha;
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
            var vertexBufs = mesh._geometry._getVertexBufs();
            if (vertexBufs.id !== this._lastVertexBufsId) {
                if (vertexBufs.positionsBuf && this._aPosition) {
                    this._aPosition.bindArrayBuffer(vertexBufs.positionsBuf, vertexBufs.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                this._lastVertexBufsId = vertexBufs.id;
            }
        }
        // Bind VBOs
        var indicesBuf;
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

    xeogl.renderer.EmphasisEdgesRenderer.prototype._allocate = function (mesh) {
        var gl = mesh.scene.canvas.gl;
        var clipsState = mesh.scene._clipsState;
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        if (this._program.errors) {
            this.errors = this._program.errors;
            return;
        }
        var program = this._program;
        this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
        this._uModelMatrix = program.getLocation("modelMatrix");
        this._uViewMatrix = program.getLocation("viewMatrix");
        this._uProjMatrix = program.getLocation("projMatrix");
        this._uClips = [];
        for (var i = 0, len = clipsState.clips.length; i < len; i++) {
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

    xeogl.renderer.EmphasisEdgesRenderer.prototype._bindProgram = function (frame) {
        var program = this._program;
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var clipsState = scene._clipsState;
        var camera = scene.camera;
        var cameraState = camera._state;
        program.bind();
        frame.useProgram++;
        this._lastMaterialId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
        gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, camera.project._state.matrix);
        if (clipsState.clips.length > 0) {
            var clips = clipsState.clips;
            var clipUniforms;
            var uClipActive;
            var clip;
            var uClipPos;
            var uClipDir;
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
        if (this._uGammaFactor) {
            gl.uniform1f(this._uGammaFactor, scene.gammaFactor);
        }
    };

})();
