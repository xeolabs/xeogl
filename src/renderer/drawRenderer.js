/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.DrawRenderer = function (gl, hash, scene, object) {
        this._init(gl, hash, scene, object);
    };

    var drawRenderers = {};

    xeogl.renderer.DrawRenderer.create = function (gl, hash, scene, object) {
        var renderer = drawRenderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.DrawRenderer(gl, hash, scene, object);
            drawRenderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.DrawRenderer.prototype.destroy = function () {
        if (--this._useCount === 0) {
            ids.removeItem(this.id);
            this._program.destroy();
            delete drawRenderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.DrawRenderer.prototype._init = function (gl, hash, scene, object) {

        this.id = ids.addItem({});
        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.DrawShaderSource(gl, scene, object);
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
        this._uGammaFactor = program.getLocation("gammaFactor");

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

                case "spot":
                    this._uLightColor[i] = program.getLocation("lightColor" + i);
                    this._uLightPos[i] = program.getLocation("lightPos" + i);
                    this._uLightDir[i] = program.getLocation("lightDir" + i);
                    this._uLightAttenuation[i] = program.getLocation("lightAttenuation" + i);
                    break;
            }

            if (light.shadow) {
                this._uShadowViewMatrix[i] = program.getLocation("shadowViewMatrix" + i);
                this._uShadowProjMatrix[i] = program.getLocation("shadowProjMatrix" + i);
            }
        }

        if (scene.lights.lightMap) {
            this._uLightMap = "lightMap";
        }

        if (scene.lights.reflectionMap) {
            this._uReflectionMap = "reflectionMap";
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

        this._uPointSize = program.getLocation("pointSize");

        switch (material.type) {

            case "LambertMaterial":

                this._uMaterialColor = program.getLocation("materialColor");
                this._uMaterialEmissive = program.getLocation("materialEmissive");
                this._uAlphaModeCutoff = program.getLocation("materialAlphaModeCutoff");

                break;

            case "PhongMaterial":

                this._uMaterialAmbient = program.getLocation("materialAmbient");
                this._uMaterialDiffuse = program.getLocation("materialDiffuse");
                this._uMaterialSpecular = program.getLocation("materialSpecular");
                this._uMaterialEmissive = program.getLocation("materialEmissive");
                this._uAlphaModeCutoff = program.getLocation("materialAlphaModeCutoff");
                this._uMaterialShininess = program.getLocation("materialShininess");

                if (material.ambientMap) {
                    this._uMaterialAmbientMap = "ambientMap";
                    this._uMaterialAmbientMapMatrix = program.getLocation("ambientMapMatrix");
                }
                if (material.diffuseMap) {
                    this._uDiffuseMap = "diffuseMap";
                    this._uDiffuseMapMatrix = program.getLocation("diffuseMapMatrix");
                }
                if (material.specularMap) {
                    this._uSpecularMap = "specularMap";
                    this._uSpecularMapMatrix = program.getLocation("specularMapMatrix");
                }
                if (material.emissiveMap) {
                    this._uEmissiveMap = "emissiveMap";
                    this._uEmissiveMapMatrix = program.getLocation("emissiveMapMatrix");
                }
                if (material.alphaMap) {
                    this._uAlphaMap = "alphaMap";
                    this._uAlphaMapMatrix = program.getLocation("alphaMapMatrix");
                }
                if (material.reflectivityMap) {
                    this._uReflectivityMap = "reflectivityMap";
                    this._uReflectivityMapMatrix = program.getLocation("reflectivityMapMatrix");
                }
                if (material.normalMap) {
                    this._uNormalMap = "normalMap";
                    this._uNormalMapMatrix = program.getLocation("normalMapMatrix");
                }
                if (material.occlusionMap) {
                    this._uOcclusionMap = "occlusionMap";
                    this._uOcclusionMapMatrix = program.getLocation("occlusionMapMatrix");
                }
                if (material.diffuseFresnel) {
                    this._uDiffuseFresnelEdgeBias = program.getLocation("diffuseFresnelEdgeBias");
                    this._uDiffuseFresnelCenterBias = program.getLocation("diffuseFresnelCenterBias");
                    this._uDiffuseFresnelEdgeColor = program.getLocation("diffuseFresnelEdgeColor");
                    this._uDiffuseFresnelCenterColor = program.getLocation("diffuseFresnelCenterColor");
                    this._uDiffuseFresnelPower = program.getLocation("diffuseFresnelPower");
                }
                if (material.specularFresnel) {
                    this._uSpecularFresnelEdgeBias = program.getLocation("specularFresnelEdgeBias");
                    this._uSpecularFresnelCenterBias = program.getLocation("specularFresnelCenterBias");
                    this._uSpecularFresnelEdgeColor = program.getLocation("specularFresnelEdgeColor");
                    this._uSpecularFresnelCenterColor = program.getLocation("specularFresnelCenterColor");
                    this._uSpecularFresnelPower = program.getLocation("specularFresnelPower");
                }
                if (material.alphaFresnel) {
                    this._uAlphaFresnelEdgeBias = program.getLocation("alphaFresnelEdgeBias");
                    this._uAlphaFresnelCenterBias = program.getLocation("alphaFresnelCenterBias");
                    this._uAlphaFresnelEdgeColor = program.getLocation("alphaFresnelEdgeColor");
                    this._uAlphaFresnelCenterColor = program.getLocation("alphaFresnelCenterColor");
                    this._uAlphaFresnelPower = program.getLocation("alphaFresnelPower");
                }
                if (material.reflectivityFresnel) {
                    this._uReflectivityFresnelEdgeBias = program.getLocation("reflectivityFresnelEdgeBias");
                    this._uReflectivityFresnelCenterBias = program.getLocation("reflectivityFresnelCenterBias");
                    this._uReflectivityFresnelEdgeColor = program.getLocation("reflectivityFresnelEdgeColor");
                    this._uReflectivityFresnelCenterColor = program.getLocation("reflectivityFresnelCenterColor");
                    this._uReflectivityFresnelPower = program.getLocation("reflectivityFresnelPower");
                }
                if (material.emissiveFresnel) {
                    this._uEmissiveFresnelEdgeBias = program.getLocation("emissiveFresnelEdgeBias");
                    this._uEmissiveFresnelCenterBias = program.getLocation("emissiveFresnelCenterBias");
                    this._uEmissiveFresnelEdgeColor = program.getLocation("emissiveFresnelEdgeColor");
                    this._uEmissiveFresnelCenterColor = program.getLocation("emissiveFresnelCenterColor");
                    this._uEmissiveFresnelPower = program.getLocation("emissiveFresnelPower");
                }
                break;

            case "MetallicMaterial":

                this._uBaseColor = program.getLocation("materialBaseColor");
                this._uMaterialMetallic = program.getLocation("materialMetallic");
                this._uMaterialRoughness = program.getLocation("materialRoughness");
                this._uMaterialSpecularF0 = program.getLocation("materialSpecularF0");
                this._uMaterialEmissive = program.getLocation("materialEmissive");
                this._uAlphaModeCutoff = program.getLocation("materialAlphaModeCutoff");
                if (material.baseColorMap) {
                    this._uBaseColorMap = "baseColorMap";
                    this._uBaseColorMapMatrix = program.getLocation("baseColorMapMatrix");
                }
                if (material.metallicMap) {
                    this._uMetallicMap = "metallicMap";
                    this._uMetallicMapMatrix = program.getLocation("metallicMapMatrix");
                }
                if (material.roughnessMap) {
                    this._uRoughnessMap = "roughnessMap";
                    this._uRoughnessMapMatrix = program.getLocation("roughnessMapMatrix");
                }
                if (material.metallicRoughnessMap) {
                    this._uMetallicRoughnessMap = "metallicRoughnessMap";
                    this._uMetallicRoughnessMapMatrix = program.getLocation("metallicRoughnessMapMatrix");
                }
                if (material.emissiveMap) {
                    this._uEmissiveMap = "emissiveMap";
                    this._uEmissiveMapMatrix = program.getLocation("emissiveMapMatrix");
                }
                if (material.occlusionMap) {
                    this._uOcclusionMap = "occlusionMap";
                    this._uOcclusionMapMatrix = program.getLocation("occlusionMapMatrix");
                }
                if (material.alphaMap) {
                    this._uAlphaMap = "alphaMap";
                    this._uAlphaMapMatrix = program.getLocation("alphaMapMatrix");
                }
                if (material.normalMap) {
                    this._uNormalMap = "normalMap";
                    this._uNormalMapMatrix = program.getLocation("normalMapMatrix");
                }
                break;

            case "SpecularMaterial":

                this._uMaterialDiffuse = program.getLocation("materialDiffuse");
                this._uMaterialSpecular = program.getLocation("materialSpecular");
                this._uMaterialGlossiness = program.getLocation("materialGlossiness");
                this._uMaterialReflectivity = program.getLocation("reflectivityFresnel");
                this._uMaterialEmissive = program.getLocation("materialEmissive");
                this._uAlphaModeCutoff = program.getLocation("materialAlphaModeCutoff");
                if (material.diffuseMap) {
                    this._uDiffuseMap = "diffuseMap";
                    this._uDiffuseMapMatrix = program.getLocation("diffuseMapMatrix");
                }
                if (material.specularMap) {
                    this._uSpecularMap = "specularMap";
                    this._uSpecularMapMatrix = program.getLocation("specularMapMatrix");
                }
                if (material.glossinessMap) {
                    this._uGlossinessMap = "glossinessMap";
                    this._uGlossinessMapMatrix = program.getLocation("glossinessMapMatrix");
                }
                if (material.specularGlossinessMap) {
                    this._uSpecularGlossinessMap = "materialSpecularGlossinessMap";
                    this._uSpecularGlossinessMapMatrix = program.getLocation("materialSpecularGlossinessMapMatrix");
                }
                if (material.emissiveMap) {
                    this._uEmissiveMap = "emissiveMap";
                    this._uEmissiveMapMatrix = program.getLocation("emissiveMapMatrix");
                }
                if (material.occlusionMap) {
                    this._uOcclusionMap = "occlusionMap";
                    this._uOcclusionMapMatrix = program.getLocation("occlusionMapMatrix");
                }
                if (material.alphaMap) {
                    this._uAlphaMap = "alphaMap";
                    this._uAlphaMapMatrix = program.getLocation("alphaMapMatrix");
                }
                if (material.normalMap) {
                    this._uNormalMap = "normalMap";
                    this._uNormalMapMatrix = program.getLocation("normalMapMatrix");
                }
                break;
        }

        this._aPosition = program.getAttribute("position");
        this._aNormal = program.getAttribute("normal");
        this._aUV = program.getAttribute("uv");
        this._aColor = program.getAttribute("color");
        this._aFlags = program.getAttribute("flags");

        this._uClippable = program.getLocation("clippable");
        this._uColorize = program.getLocation("colorize");

        this._lastMaterialId = null;
        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;

        this._lastColorize = new Float32Array(4);

        this._baseTextureUnit = 0;

    };

    xeogl.renderer.DrawRenderer.prototype._bindProgram = function (frame) {

        var program = this._program;

        program.bind();

        frame.useProgram++;
        frame.textureUnit = 0;

        var gl = this._gl;
        var maxTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_UNITS;
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

        if (lights.lightMap && lights.lightMap.texture && this._uLightMap) {
            program.bindTexture(this._uLightMap, lights.lightMap.texture, frame.textureUnit);
            frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
            frame.bindTexture++;
        }

        if (lights.reflectionMap && lights.reflectionMap.texture && this._uReflectionMap) {
            program.bindTexture(this._uReflectionMap, lights.reflectionMap.texture, frame.textureUnit);
            frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
            frame.bindTexture++;
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

        this._baseTextureUnit = frame.textureUnit;
    };

    xeogl.renderer.DrawRenderer.prototype.drawObject = function (frame, object) {

        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }

        var maxTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_UNITS;
        var gl = this._gl;
        var program = this._program;
        var material = object.material;
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        if (material.id !== this._lastMaterialId) {

            frame.textureUnit = this._baseTextureUnit;

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

            switch (material.type) {

                case "LambertMaterial":

                    if (this._uMaterialAmbient) {
                        gl.uniform3fv(this._uMaterialAmbient, material.ambient);
                    }
                    if (this._uMaterialColor) {
                        gl.uniform4f(this._uMaterialColor, material.color[0], material.color[1], material.color[2], material.alpha);
                    }
                    if (this._uMaterialEmissive) {
                        gl.uniform3fv(this._uMaterialEmissive, material.emissive);
                    }

                    break;

                case "PhongMaterial":

                    if (this._uMaterialShininess) {
                        gl.uniform1f(this._uMaterialShininess, material.shininess);
                    }
                    if (this._uMaterialAmbient) {
                        gl.uniform3fv(this._uMaterialAmbient, material.ambient);
                    }
                    if (this._uMaterialDiffuse) {
                        gl.uniform3fv(this._uMaterialDiffuse, material.diffuse);
                    }
                    if (this._uMaterialSpecular) {
                        gl.uniform3fv(this._uMaterialSpecular, material.specular);
                    }
                    if (this._uMaterialEmissive) {
                        gl.uniform3fv(this._uMaterialEmissive, material.emissive);
                    }
                    if (this._uAlphaModeCutoff) {
                        gl.uniform4f(
                            this._uAlphaModeCutoff,
                            1.0 * material.alpha,
                            material.alphaMode === 1 ? 1.0 : 0.0,
                            material.alphaCutoff,
                            0);
                    }
                    if (material.ambientMap && material.ambientMap.texture && this._uMaterialAmbientMap) {
                        program.bindTexture(this._uMaterialAmbientMap, material.ambientMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uMaterialAmbientMapMatrix) {
                            gl.uniformMatrix4fv(this._uMaterialAmbientMapMatrix, false, material.ambientMap.matrix);
                        }
                    }
                    if (material.diffuseMap && material.diffuseMap.texture && this._uDiffuseMap) {
                        program.bindTexture(this._uDiffuseMap, material.diffuseMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uDiffuseMapMatrix) {
                            gl.uniformMatrix4fv(this._uDiffuseMapMatrix, false, material.diffuseMap.matrix);
                        }
                    }
                    if (material.specularMap && material.specularMap.texture && this._uSpecularMap) {
                        program.bindTexture(this._uSpecularMap, material.specularMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uSpecularMapMatrix) {
                            gl.uniformMatrix4fv(this._uSpecularMapMatrix, false, material.specularMap.matrix);
                        }
                    }
                    if (material.emissiveMap && material.emissiveMap.texture && this._uEmissiveMap) {
                        program.bindTexture(this._uEmissiveMap, material.emissiveMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uEmissiveMapMatrix) {
                            gl.uniformMatrix4fv(this._uEmissiveMapMatrix, false, material.emissiveMap.matrix);
                        }
                    }
                    if (material.alphaMap && material.alphaMap.texture && this._uAlphaMap) {
                        program.bindTexture(this._uAlphaMap, material.alphaMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uAlphaMapMatrix) {
                            gl.uniformMatrix4fv(this._uAlphaMapMatrix, false, material.alphaMap.matrix);
                        }
                    }
                    if (material.reflectivityMap && material.reflectivityMap.texture && this._uReflectivityMap) {
                        program.bindTexture(this._uReflectivityMap, material.reflectivityMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        if (this._uReflectivityMapMatrix) {
                            gl.uniformMatrix4fv(this._uReflectivityMapMatrix, false, material.reflectivityMap.matrix);
                        }
                    }
                    if (material.normalMap && material.normalMap.texture && this._uNormalMap) {
                        program.bindTexture(this._uNormalMap, material.normalMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uNormalMapMatrix) {
                            gl.uniformMatrix4fv(this._uNormalMapMatrix, false, material.normalMap.matrix);
                        }
                    }
                    if (material.occlusionMap && material.occlusionMap.texture && this._uOcclusionMap) {
                        program.bindTexture(this._uOcclusionMap, material.occlusionMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uOcclusionMapMatrix) {
                            gl.uniformMatrix4fv(this._uOcclusionMapMatrix, false, material.occlusionMap.matrix);
                        }
                    }
                    if (material.diffuseFresnel) {
                        if (this._uDiffuseFresnelEdgeBias) {
                            gl.uniform1f(this._uDiffuseFresnelEdgeBias, material.diffuseFresnel.edgeBias);
                        }
                        if (this._uDiffuseFresnelCenterBias) {
                            gl.uniform1f(this._uDiffuseFresnelCenterBias, material.diffuseFresnel.centerBias);
                        }
                        if (this._uDiffuseFresnelEdgeColor) {
                            gl.uniform3fv(this._uDiffuseFresnelEdgeColor, material.diffuseFresnel.edgeColor);
                        }
                        if (this._uDiffuseFresnelCenterColor) {
                            gl.uniform3fv(this._uDiffuseFresnelCenterColor, material.diffuseFresnel.centerColor);
                        }
                        if (this._uDiffuseFresnelPower) {
                            gl.uniform1f(this._uDiffuseFresnelPower, material.diffuseFresnel.power);
                        }
                    }
                    if (material.specularFresnel) {
                        if (this._uSpecularFresnelEdgeBias) {
                            gl.uniform1f(this._uSpecularFresnelEdgeBias, material.specularFresnel.edgeBias);
                        }
                        if (this._uSpecularFresnelCenterBias) {
                            gl.uniform1f(this._uSpecularFresnelCenterBias, material.specularFresnel.centerBias);
                        }
                        if (this._uSpecularFresnelEdgeColor) {
                            gl.uniform3fv(this._uSpecularFresnelEdgeColor, material.specularFresnel.edgeColor);
                        }
                        if (this._uSpecularFresnelCenterColor) {
                            gl.uniform3fv(this._uSpecularFresnelCenterColor, material.specularFresnel.centerColor);
                        }
                        if (this._uSpecularFresnelPower) {
                            gl.uniform1f(this._uSpecularFresnelPower, material.specularFresnel.power);
                        }
                    }
                    if (material.alphaFresnel) {
                        if (this._uAlphaFresnelEdgeBias) {
                            gl.uniform1f(this._uAlphaFresnelEdgeBias, material.alphaFresnel.edgeBias);
                        }
                        if (this._uAlphaFresnelCenterBias) {
                            gl.uniform1f(this._uAlphaFresnelCenterBias, material.alphaFresnel.centerBias);
                        }
                        if (this._uAlphaFresnelEdgeColor) {
                            gl.uniform3fv(this._uAlphaFresnelEdgeColor, material.alphaFresnel.edgeColor);
                        }
                        if (this._uAlphaFresnelCenterColor) {
                            gl.uniform3fv(this._uAlphaFresnelCenterColor, material.alphaFresnel.centerColor);
                        }
                        if (this._uAlphaFresnelPower) {
                            gl.uniform1f(this._uAlphaFresnelPower, material.alphaFresnel.power);
                        }
                    }
                    if (material.reflectivityFresnel) {
                        if (this._uReflectivityFresnelEdgeBias) {
                            gl.uniform1f(this._uReflectivityFresnelEdgeBias, material.reflectivityFresnel.edgeBias);
                        }
                        if (this._uReflectivityFresnelCenterBias) {
                            gl.uniform1f(this._uReflectivityFresnelCenterBias, material.reflectivityFresnel.centerBias);
                        }
                        if (this._uReflectivityFresnelEdgeColor) {
                            gl.uniform3fv(this._uReflectivityFresnelEdgeColor, material.reflectivityFresnel.edgeColor);
                        }
                        if (this._uReflectivityFresnelCenterColor) {
                            gl.uniform3fv(this._uReflectivityFresnelCenterColor, material.reflectivityFresnel.centerColor);
                        }
                        if (this._uReflectivityFresnelPower) {
                            gl.uniform1f(this._uReflectivityFresnelPower, material.reflectivityFresnel.power);
                        }
                    }
                    if (material.emissiveFresnel) {
                        if (this._uEmissiveFresnelEdgeBias) {
                            gl.uniform1f(this._uEmissiveFresnelEdgeBias, material.emissiveFresnel.edgeBias);
                        }
                        if (this._uEmissiveFresnelCenterBias) {
                            gl.uniform1f(this._uEmissiveFresnelCenterBias, material.emissiveFresnel.centerBias);
                        }
                        if (this._uEmissiveFresnelEdgeColor) {
                            gl.uniform3fv(this._uEmissiveFresnelEdgeColor, material.emissiveFresnel.edgeColor);
                        }
                        if (this._uEmissiveFresnelCenterColor) {
                            gl.uniform3fv(this._uEmissiveFresnelCenterColor, material.emissiveFresnel.centerColor);
                        }
                        if (this._uEmissiveFresnelPower) {
                            gl.uniform1f(this._uEmissiveFresnelPower, material.emissiveFresnel.power);
                        }
                    }
                    break;


                case "MetallicMaterial":

                    if (this._uBaseColor) {
                        gl.uniform3fv(this._uBaseColor, material.baseColor);
                    }
                    if (this._uMaterialMetallic) {
                        gl.uniform1f(this._uMaterialMetallic, material.metallic);
                    }
                    if (this._uMaterialRoughness) {
                        gl.uniform1f(this._uMaterialRoughness, material.roughness);
                    }
                    if (this._uMaterialSpecularF0) {
                        gl.uniform1f(this._uMaterialSpecularF0, material.specularF0);
                    }
                    if (this._uMaterialEmissive) {
                        gl.uniform3fv(this._uMaterialEmissive, material.emissive);
                    }
                    if (this._uAlphaModeCutoff) {
                        gl.uniform4f(
                            this._uAlphaModeCutoff,
                            1.0 * material.alpha,
                            material.alphaMode === 1 ? 1.0 : 0.0,
                            material.alphaCutoff,
                            0.0);
                    }
                    if (material.baseColorMap && material.baseColorMap.texture && this._uBaseColorMap) {
                        program.bindTexture(this._uBaseColorMap, material.baseColorMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uBaseColorMapMatrix) {
                            gl.uniformMatrix4fv(this._uBaseColorMapMatrix, false, material.baseColorMap.matrix);
                        }
                    }
                    if (material.metallicMap && material.metallicMap.texture && this._uMetallicMap) {
                        program.bindTexture(this._uMetallicMap, material.metallicMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uMetallicMapMatrix) {
                            gl.uniformMatrix4fv(this._uMetallicMapMatrix, false, material.metallicMap.matrix);
                        }
                    }
                    if (material.roughnessMap && material.roughnessMap.texture && this._uRoughnessMap) {
                        program.bindTexture(this._uRoughnessMap, material.roughnessMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uRoughnessMapMatrix) {
                            gl.uniformMatrix4fv(this._uRoughnessMapMatrix, false, material.roughnessMap.matrix);
                        }
                    }
                    if (material.metallicRoughnessMap && material.metallicRoughnessMap.texture && this._uMetallicRoughnessMap) {
                        program.bindTexture(this._uMetallicRoughnessMap, material.metallicRoughnessMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uMetallicRoughnessMapMatrix) {
                            gl.uniformMatrix4fv(this._uMetallicRoughnessMapMatrix, false, material.metallicRoughnessMap.matrix);
                        }
                    }
                    if (material.emissiveMap && material.emissiveMap.texture && this._uEmissiveMap) {
                        program.bindTexture(this._uEmissiveMap, material.emissiveMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uEmissiveMapMatrix) {
                            gl.uniformMatrix4fv(this._uEmissiveMapMatrix, false, material.emissiveMap.matrix);
                        }
                    }
                    if (material.occlusionMap && material.occlusionMap.texture && this._uOcclusionMap) {
                        program.bindTexture(this._uOcclusionMap, material.occlusionMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uOcclusionMapMatrix) {
                            gl.uniformMatrix4fv(this._uOcclusionMapMatrix, false, material.occlusionMap.matrix);
                        }
                    }
                    if (material.alphaMap && material.alphaMap.texture && this._uAlphaMap) {
                        program.bindTexture(this._uAlphaMap, material.alphaMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uAlphaMapMatrix) {
                            gl.uniformMatrix4fv(this._uAlphaMapMatrix, false, material.alphaMap.matrix);
                        }
                    }
                    if (material.normalMap && material.normalMap.texture && this._uNormalMap) {
                        program.bindTexture(this._uNormalMap, material.normalMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uNormalMapMatrix) {
                            gl.uniformMatrix4fv(this._uNormalMapMatrix, false, material.normalMap.matrix);
                        }
                    }
                    break;

                case "SpecularMaterial":

                    if (this._uMaterialDiffuse) {
                        gl.uniform3fv(this._uMaterialDiffuse, material.diffuse);
                    }
                    if (this._uMaterialSpecular) {
                        gl.uniform3fv(this._uMaterialSpecular, material.specular);
                    }
                    if (this._uMaterialGlossiness) {
                        gl.uniform1f(this._uMaterialGlossiness, material.glossiness);
                    }
                    if (this._uMaterialReflectivity) {
                        gl.uniform1f(this._uMaterialReflectivity, material.reflectivity);
                    }
                    if (this._uMaterialEmissive) {
                        gl.uniform3fv(this._uMaterialEmissive, material.emissive);
                    }
                    if (this._uAlphaModeCutoff) {
                        gl.uniform4f(
                            this._uAlphaModeCutoff,
                            1.0 * material.alpha,
                            material.alphaMode === 1 ? 1.0 : 0.0,
                            material.alphaCutoff,
                            0.0);
                    }
                    if (material.diffuseMap && material.diffuseMap.texture && this._uDiffuseMap) {
                        program.bindTexture(this._uDiffuseMap, material.diffuseMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uDiffuseMapMatrix) {
                            gl.uniformMatrix4fv(this._uDiffuseMapMatrix, false, material.diffuseMap.matrix);
                        }
                    }
                    if (material.specularMap && material.specularMap.texture && this._uSpecularMap) {
                        program.bindTexture(this._uSpecularMap, material.specularMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uSpecularMapMatrix) {
                            gl.uniformMatrix4fv(this._uSpecularMapMatrix, false, material.specularMap.matrix);
                        }
                    }
                    if (material.glossinessMap && material.glossinessMap.texture && this._uGlossinessMap) {
                        program.bindTexture(this._uGlossinessMap, material.glossinessMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uGlossinessMapMatrix) {
                            gl.uniformMatrix4fv(this._uGlossinessMapMatrix, false, material.glossinessMap.matrix);
                        }
                    }
                    if (material.specularGlossinessMap && material.specularGlossinessMap.texture && this._uSpecularGlossinessMap) {
                        program.bindTexture(this._uSpecularGlossinessMap, material.specularGlossinessMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uSpecularGlossinessMapMatrix) {
                            gl.uniformMatrix4fv(this._uSpecularGlossinessMapMatrix, false, material.specularGlossinessMap.matrix);
                        }
                    }
                    if (material.emissiveMap && material.emissiveMap.texture && this._uEmissiveMap) {
                        program.bindTexture(this._uEmissiveMap, material.emissiveMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uEmissiveMapMatrix) {
                            gl.uniformMatrix4fv(this._uEmissiveMapMatrix, false, material.emissiveMap.matrix);
                        }
                    }
                    if (material.occlusionMap && material.occlusionMap.texture && this._uOcclusionMap) {
                        program.bindTexture(this._uOcclusionMap, material.occlusionMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uOcclusionMapMatrix) {
                            gl.uniformMatrix4fv(this._uOcclusionMapMatrix, false, material.occlusionMap.matrix);
                        }
                    }
                    if (material.alphaMap && material.alphaMap.texture && this._uAlphaMap) {
                        program.bindTexture(this._uAlphaMap, material.alphaMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uAlphaMapMatrix) {
                            gl.uniformMatrix4fv(this._uAlphaMapMatrix, false, material.alphaMap.matrix);
                        }
                    }
                    if (material.normalMap && material.normalMap.texture && this._uNormalMap) {
                        program.bindTexture(this._uNormalMap, material.normalMap.texture, frame.textureUnit);
                        frame.textureUnit = (frame.textureUnit + 1) % maxTextureUnits;
                        frame.bindTexture++;
                        if (this._uNormalMapMatrix) {
                            gl.uniformMatrix4fv(this._uNormalMapMatrix, false, material.normalMap.matrix);
                        }
                    }
                    break;
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
                if (vertexBufs.uvBuf && this._aUV) {
                    this._aUV.bindArrayBuffer(vertexBufs.uvBuf, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (vertexBufs.colorsBuf && this._aColor) {
                    this._aColor.bindArrayBuffer(vertexBufs.colorsBuf);
                    frame.bindArray++;
                }
                if (vertexBufs.flagsBuf && this._aFlags) {
                    this._aFlags.bindArrayBuffer(vertexBufs.flagsBuf, gl.UNSIGNED_SHORT);
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
                if (this._aUV) {
                    this._aUV.bindArrayBuffer(geometry.uvBuf, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (this._aColor) {
                    this._aColor.bindArrayBuffer(geometry.colorsBuf);
                    frame.bindArray++;
                }
                if (this._aFlags) {
                    this._aFlags.bindArrayBuffer(geometry.flagsBuf);
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
