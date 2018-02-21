/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.LambertRenderer = function (gl, hash, scene, object) {
        this._init(gl, hash, scene, object);
    };

    var lambertRenderers = {};

    xeogl.renderer.LambertRenderer.create = function (gl, hash, scene, object) {
        var renderer = lambertRenderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.LambertRenderer(gl, hash, scene, object);
            lambertRenderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.LambertRenderer.prototype.destroy = function () {
        if (--this._useCount) {
            ids.removeItem(this.id);
            this._program.destroy();
            delete lambertRenderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.LambertRenderer.prototype._init = function (gl, hash, scene, object) {

        this.id = ids.addItem({});
        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.LambertShaderSource(gl, scene, object);
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        this._scene = scene;
        this._useCount = 0;

        if (this._program.errors) {
            this.errors = this._program.errors;
            return;
        }

        var program = this._program;

        this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
        this._uUVDecodeMatrix = program.getLocation("uvDecodeMatrix");

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
        this._uShadowViewMatrix = [];
        this._uShadowProjMatrix = [];

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

            if (light.shadow) {
                this._uShadowViewMatrix[i] = program.getLocation("shadowViewMatrix" + i);
                this._uShadowProjMatrix[i] = program.getLocation("shadowProjMatrix" + i);
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

        this._uPointSize = program.getLocation("pointSize");
        this._uMaterialColor = program.getLocation("materialColor");
        this._uMaterialEmissive = program.getLocation("materialEmissive");

        this._aPosition = program.getAttribute("position");
        this._aNormal = program.getAttribute("normal");
        this._aUV = program.getAttribute("uv");

        this._uClippable = program.getLocation("clippable");
        this._uColorize = program.getLocation("colorize");

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;

        this._lastColorize = new Float32Array(4);
    };

    xeogl.renderer.LambertRenderer.prototype._bindProgram = function (frame) {

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

        this._lastColorize[0] = -1;
        this._lastColorize[1] = -1;
        this._lastColorize[2] = -1;
        this._lastColorize[3] = -1;

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

                if (light.shadow) {
                    if (this._uShadowViewMatrix[i]) {
                        gl.uniformMatrix4fv(this._uShadowViewMatrix[i], false, light.getShadowViewMatrix());
                    }
                    if (this._uShadowProjMatrix[i]) {
                        gl.uniformMatrix4fv(this._uShadowProjMatrix[i], false, light.getShadowProjMatrix());
                    }
                    var shadowRenderBuf = light.getShadowRenderBuf();
                    if (shadowRenderBuf) {
                        program.bindTexture("shadowMap" + i, shadowRenderBuf.getTexture(), frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                    }
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
    };

    xeogl.renderer.LambertRenderer.prototype.drawObject = function (frame, object) {

        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }

        var gl = this._gl;
        var material = object.lambertMaterial;
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        if (material.id !== this._lastMaterialId) {

            var backfaces = material.backfaces;
            if (frame.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frame.backfaces = backfaces;
            }

            var frontface = material.frontface;
            
            if (frame.frontface !== frontface) {
                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frame.frontface = frontface;
            }

            if (frame.lineWidth !== material.lineWidth) {
                gl.lineWidth(material.lineWidth);
                frame.lineWidth = material.lineWidth;
            }

            if (this._uPointSize) {
                gl.uniform1f(this._uPointSize, material.pointSize);
            }

            gl.uniform3fv(this._uMaterialAmbient, material.ambient);
            gl.uniform4f(this._uMaterialColor, material.color[0], material.color[1], material.color[2], material.alpha);
            gl.uniform3fv(this._uMaterialEmissive, material.emissive);

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

        if (this._uColorize) {
            var colorize = modes.colorize;
            var lastColorize = this._lastColorize;
            if (lastColorize[0] !== colorize[0] ||
                lastColorize[1] !== colorize[0] ||
                lastColorize[2] !== colorize[0] ||
                lastColorize[3] !== colorize[0]) {
                gl.uniform4fv(this._uColorize, colorize);
                lastColorize[0] = colorize[0];
                lastColorize[1] = colorize[1];
                lastColorize[2] = colorize[2];
                lastColorize[3] = colorize[3];
            }
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
