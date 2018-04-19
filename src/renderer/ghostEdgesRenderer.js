/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.GhostEdgesRenderer = function (gl, hash, scene, object) {
        this._init(gl, hash, scene, object);
    };

    var ghostEdgesRenderers = {};

    xeogl.renderer.GhostEdgesRenderer.create = function (gl, hash, scene, object) {
        var renderer = ghostEdgesRenderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.GhostEdgesRenderer(gl, hash, scene, object);
            ghostEdgesRenderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.GhostEdgesRenderer.prototype.destroy = function () {
        if (--this._useCount === 0) {
            ids.removeItem(this.id);
            this._program.destroy();
            delete ghostEdgesRenderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.GhostEdgesRenderer.prototype._init = function (gl, hash, scene, object) {

        this.id = ids.addItem({});
        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.GhostEdgesShaderSource(gl, scene, object);
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        this._scene = scene;
        this._useCount = 0;

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

        var clips = scene.clips.clips;
        for (var i = 0, len = clips.length; i < len; i++) {
            this._uClips.push({
                active: program.getLocation("clipActive" + i),
                pos: program.getLocation("clipPos" + i),
                dir: program.getLocation("clipDir" + i)
            });
        }

        this._uEdgeColor = program.getLocation("edgeColor");
        this._aPosition = program.getAttribute("position");
        this._aNormal = program.getAttribute("normal");
        this._uClippable = program.getLocation("clippable");
        this._uGammaFactor = program.getLocation("gammaFactor");

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
    };

    xeogl.renderer.GhostEdgesRenderer.prototype._bindProgram = function (frame) {

        var program = this._program;

        program.bind();

        frame.useProgram++;

        var gl = this._gl;
        var scene = this._scene;

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;

        gl.uniformMatrix4fv(this._uViewMatrix, false, scene.viewTransform.matrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, scene.projTransform.matrix);

        if (scene.clips.clips.length > 0) {
            var clips = scene.clips.clips;
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

    xeogl.renderer.GhostEdgesRenderer.prototype.drawObject = function (frame, object, mode) {

        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }

        var gl = this._gl;
        var material = mode === 0 ? object.ghostMaterial : (mode === 1 ? object.highlightMaterial : object.selectedMaterial);
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        if (material.id !== this._lastMaterialId) {

            if (frame.lineWidth !== material.edgeWidth) {
                gl.lineWidth(material.edgeWidth);
                frame.lineWidth = material.edgeWidth;
            }

            if (this._uEdgeColor) {
                var edgeColor = material.edgeColor;
                var edgeAlpha = material.edgeAlpha;
                gl.uniform4f(this._uEdgeColor, edgeColor[0], edgeColor[1], edgeColor[2], edgeAlpha);
            }

            this._lastMaterialId = material.id;
        }

        if (modelTransform.id !== this._lastModelTransformId) {
            gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, modelTransform.getMatrix());
            if (this._uModelNormalMatrix) {
                gl.uniformMatrix4fv(this._uModelNormalMatrix, gl.FALSE, modelTransform.getNormalMatrix());
            }
            this._lastModelTransformId = modelTransform.id;
        }

        var modes = object.modes;

        if (this._uClippable) {
            gl.uniform1i(this._uClippable, modes.clippable);
        }

        if (geometry.combined) {
            var vertexBufs = object.vertexBufs;
            if (vertexBufs.id !== this._lastVertexBufsId) {
                if (vertexBufs.positionsBuf && this._aPosition) {
                    this._aPosition.bindArrayBuffer(vertexBufs.positionsBuf, vertexBufs.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (vertexBufs.normalsBuf && this._aNormal) {
                    this._aNormal.bindArrayBuffer(vertexBufs.normalsBuf, vertexBufs.quantized ? gl.BYTE : gl.FLOAT);
                    frame.bindArray++;
                }
                this._lastVertexBufsId = vertexBufs.id;
            }
        }

        // Bind VBOs

        var indicesBuf;

        if (geometry.primitive === gl.TRIANGLES) {
            indicesBuf = geometry.getGhostEdgesIndices();
        } else if (geometry.primitive === gl.LINES) {
            indicesBuf = geometry.indicesBuf;
        }

        if (indicesBuf) {

            if (geometry.id !== this._lastGeometryId) {

                if (this._uPositionsDecodeMatrix) {
                    gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometry.positionsDecodeMatrix);
                }

                if (!geometry.combined) { // VBOs were bound by the VertexBufs logic above
                    if (this._aPosition) {
                        this._aPosition.bindArrayBuffer(geometry.positionsBuf, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                        frame.bindArray++;
                    }
                    if (this._aNormal) {
                        this._aNormal.bindArrayBuffer(geometry.normalsBuf, geometry.quantized ? gl.BYTE : gl.FLOAT);
                        frame.bindArray++;
                    }
                }

                indicesBuf.bind();
                frame.bindArray++;

                this._lastGeometryId = geometry.id;
            }

            gl.drawElements(gl.LINES, indicesBuf.numItems, indicesBuf.itemType, 0);
            frame.drawElements++;
        }
    };
})();
