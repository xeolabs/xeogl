(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "SpecularMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uDiffuse = draw.getUniform("materialDiffuse");
            this._uSpecular = draw.getUniform("materialSpecular");
            this._uGlossiness = draw.getUniform("materialGlossiness");
            this._uReflectivity = draw.getUniform("reflectivityFresnel");
            this._uEmissive = draw.getUniform("materialEmissive");
            this._uAlphaModeCutoff = draw.getUniform("materialAlphaModeCutoff");

            if (state.diffuseMap) {
                this._uDiffuseMap = "diffuseMap";
                this._uDiffuseMapMatrix = draw.getUniform("diffuseMapMatrix");
            }

            if (state.specularMap) {
                this._uSpecularMap = "specularMap";
                this._uSpecularMapMatrix = draw.getUniform("specularMapMatrix");
            }

            if (state.glossinessMap) {
                this._uGlossinessMap = "glossinessMap";
                this._uGlossinessMapMatrix = draw.getUniform("glossinessMapMatrix");
            }

            if (state.specularGlossinessMap) {
                this._uSpecularGlossinessMap = "materialSpecularGlossinessMap";
                this._uSpecularGlossinessMapMatrix = draw.getUniform("materialSpecularGlossinessMapMatrix");
            }

            if (state.emissiveMap) {
                this._uEmissiveMap = "emissiveMap";
                this._uEmissiveMapMatrix = draw.getUniform("emissiveMapMatrix");
            }

            if (state.occlusionMap) {
                this._uOcclusionMap = "occlusionMap";
                this._uOcclusionMapMatrix = draw.getUniform("occlusionMapMatrix");
            }

            if (state.alphaMap) {
                this._uAlphaMap = "alphaMap";
                this._uAlphaMapMatrix = draw.getUniform("alphaMapMatrix");
            }

            if (state.normalMap) {
                this._uNormalMap = "normalMap";
                this._uNormalMapMatrix = draw.getUniform("normalMapMatrix");
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;
            var gl = this.program.gl;
            var maxTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_UNITS;
            //    frameCtx.textureUnit = 0;

            if (this._uDiffuse) {
                this._uDiffuse.setValue(state.diffuse);
            }

            if (this._uSpecular) {
                this._uSpecular.setValue(state.specular);
            }

            if (this._uGlossiness) {
                this._uGlossiness.setValue(state.glossiness);
            }

            if (this._uReflectivity) {
                this._uReflectivity.setValue(state.reflectivity);
            }

            if (this._uEmissive) {
                this._uEmissive.setValue(state.emissive);
            }

            if (this._uAlphaModeCutoff) {
                this._uAlphaModeCutoff.setValue([1.0 * state.alpha, state.alphaMode === 1 ? 1.0 : 0.0, state.alphaCutoff, 0]);
            }

            if (state.diffuseMap && state.diffuseMap.texture && this._uDiffuseMap) {
                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            if (state.specularMap && state.specularMap.texture && this._uSpecularMap) {
                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }

            if (state.glossinessMap && state.glossinessMap.texture && this._uGlossinessMap) {
                draw.bindTexture(this._uGlossinessMap, state.glossinessMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uGlossinessMapMatrix) {
                    this._uGlossinessMapMatrix.setValue(state.glossinessMap.matrix);
                }
            }

            if (state.specularGlossinessMap && state.specularGlossinessMap.texture && this._uSpecularGlossinessMap) {
                draw.bindTexture(this._uSpecularGlossinessMap, state.specularGlossinessMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uSpecularGlossinessMapMatrix) {
                    this._uSpecularGlossinessMapMatrix.setValue(state.specularGlossinessMap.matrix);
                }
            }

            if (state.emissiveMap && state.emissiveMap.texture && this._uEmissiveMap) {
                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            if (state.occlusionMap && state.occlusionMap.texture && this._uOcclusionMap) {
                draw.bindTexture(this._uOcclusionMap, state.occlusionMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uOcclusionMapMatrix) {
                    this._uOcclusionMapMatrix.setValue(state.occlusionMap.matrix);
                }
            }

            if (state.alphaMap && state.alphaMap.texture && this._uAlphaMap) {
                draw.bindTexture(this._uAlphaMap, state.alphaMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uAlphaMapMatrix) {
                    this._uAlphaMapMatrix.setValue(state.alphaMap.matrix);
                }
            }

            if (state.normalMap && state.normalMap.texture && this._uNormalMap) {
                draw.bindTexture(this._uNormalMap, state.normalMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uNormalMapMatrix) {
                    this._uNormalMapMatrix.setValue(state.normalMap.matrix);
                }
            }
        },

        shadow: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }
            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {
                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        },

        pickObject: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {
                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        },

        pickPrimitive: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {
                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        }
    });

})();
