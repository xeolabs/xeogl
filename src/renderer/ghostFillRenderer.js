/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.GhostFillRenderer = function (gl, hash, scene, object) {
        this._init(gl, hash, scene, object);
    };

    var ghostFillRenderers = {};

    xeogl.renderer.GhostFillRenderer.create = function (gl, hash, scene, object) {
        var renderer = ghostFillRenderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.GhostFillRenderer(gl, hash, scene, object);
            ghostFillRenderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.GhostFillRenderer.prototype.destroy = function () {
        if (--this._useCount === 0) {
            ids.removeItem(this.id);
            this._program.destroy();
            delete ghostFillRenderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.GhostFillRenderer.prototype._init = function (gl, hash, scene, object) {

        this.id = ids.addItem({});
        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.GhostFillShaderSource(gl, scene, object);
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
        this._uModelNormalMatrix = program.getLocation("modelNormalMatrix");
        this._uViewMatrix = program.getLocation("viewMatrix");
        this._uViewNormalMatrix = program.getLocation("viewNormalMatrix");
        this._uProjMatrix = program.getLocation("projMatrix");

        this._uLightAmbient = [];
        this._uLightColor = [];
        this._uLightDir = [];
        this._uLightPos = [];
        this._uLightAttenuation = [];

        var lights = scene.lights.lights;
        var light;

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
            }
        }

        this._uClips = [];
        var clips = scene.clips.clips;
        for (var i = 0, len = clips.length; i < len; i++) {
            this._uClips.push({
                active: program.getLocation("clipActive" + i),
                pos: program.getLocation("clipPos" + i),
                dir: program.getLocation("clipDir" + i)
            });
        }

        var material = object.material;

        this._uFillColor = program.getLocation("fillColor");

        this._aPosition = program.getAttribute("position");
        this._aNormal = program.getAttribute("normal");

        this._uClippable = program.getLocation("clippable");
        this._uGammaFactor = program.getLocation("gammaFactor");

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
    };

    xeogl.renderer.GhostFillRenderer.prototype._bindProgram = function (frame) {

        var program = this._program;

        program.bind();

        frame.useProgram++;
        frame.textureUnit = 0;

        var gl = this._gl;
        var scene = this._scene;
        var lights = scene.lights;
        var light;

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
        this._lastIndicesBufId = null;

        gl.uniformMatrix4fv(this._uViewMatrix, false, scene.viewTransform.matrix);
        gl.uniformMatrix4fv(this._uViewNormalMatrix, false, scene.viewTransform.normalMatrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, scene.projTransform.matrix);

        for (var i = 0, len = lights.lights.length; i < len; i++) {

            light = lights.lights[i];

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

    xeogl.renderer.GhostFillRenderer.prototype.drawObject = function (frame, object, mode) {

        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }

        var gl = this._gl;
        var material = mode === 0 ? object.ghostMaterial : (mode === 1 ? object.highlightMaterial : object.selectedMaterial);
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        if (material.id !== this._lastMaterialId) {
            var fillColor = material.fillColor;
            gl.uniform4f(this._uFillColor, fillColor[0], fillColor[1], fillColor[2], material.fillAlpha);
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

        if (geometry.id !== this._lastGeometryId) {

            if (this._uPositionsDecodeMatrix) {
                gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometry.positionsDecodeMatrix);
            }

            if (this._uUVDecodeMatrix) {
                gl.uniformMatrix3fv(this._uUVDecodeMatrix, false, geometry.uvDecodeMatrix);
            }

            if (geometry.combined) { // VBOs were bound by the VertexBufs logic above
                if (geometry.indicesBufCombined) {
                    geometry.indicesBufCombined.bind();
                    frame.bindArray++;
                }
            } else {
                if (this._aPosition) {
                    this._aPosition.bindArrayBuffer(geometry.positionsBuf, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (this._aNormal) {
                    this._aNormal.bindArrayBuffer(geometry.normalsBuf, geometry.quantized ? gl.BYTE : gl.FLOAT);
                    frame.bindArray++;
                }
                if (geometry.indicesBuf) {
                    geometry.indicesBuf.bind();
                    frame.bindArray++;
                    // gl.drawElements(geometry.primitive, geometry.indicesBuf.numItems, geometry.indicesBuf.itemType, 0);
                    // frame.drawElements++;
                } else if (geometry.positions) {
                    // gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.numItems);
                    //  frame.drawArrays++;
                }
            }
            this._lastGeometryId = geometry.id;
        }

        // Draw (indices bound in prev step)

        if (geometry.combined) {
            if (geometry.indicesBufCombined) { // Geometry indices into portion of uber-array
                gl.drawElements(geometry.primitive, geometry.indicesBufCombined.numItems, geometry.indicesBufCombined.itemType, 0);
                frame.drawElements++;
            } else {
                // TODO: drawArrays() with VertexBufs positions
            }
        } else {
            if (geometry.indicesBuf) {
                gl.drawElements(geometry.primitive, geometry.indicesBuf.numItems, geometry.indicesBuf.itemType, 0);
                frame.drawElements++;
            } else if (geometry.positions) {
                gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.numItems);
                frame.drawArrays++;
            }
        }
    };
})();
