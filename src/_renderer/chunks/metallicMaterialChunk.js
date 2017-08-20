(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "MetallicMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uBaseColor = draw.getUniform("materialBaseColor");
            this._uMetallic = draw.getUniform("materialMetallic");
            this._uRoughness = draw.getUniform("materialRoughness");
            this._uSpecularF0 = draw.getUniform("materialSpecularF0");
            this._uEmissive = draw.getUniform("materialEmissive");
            this._uAlphaModeCutoff = draw.getUniform("materialAlphaModeCutoff");

            if (state.baseColorMap) {
                this._uBaseColorMap = "baseColorMap";
                this._uBaseColorMapMatrix = draw.getUniform("baseColorMapMatrix");
            }

            if (state.metallicMap) {
                this._uMetallicMap = "metallicMap";
                this._uMetallicMapMatrix = draw.getUniform("metallicMapMatrix");
            }

            if (state.roughnessMap) {
                this._uRoughnessMap = "roughnessMap";
                this._uRoughnessMapMatrix = draw.getUniform("roughnessMapMatrix");
            }

            if (state.metallicRoughnessMap) {
                this._uMetallicRoughnessMap = "metallicRoughnessMap";
                this._uMetallicRoughnessMapMatrix = draw.getUniform("metallicRoughnessMapMatrix");
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
         //   frameCtx.textureUnit = 0;

            if (this._uBaseColor) {
                this._uBaseColor.setValue(state.baseColor);
            }

            if (this._uMetallic) {
                this._uMetallic.setValue(state.metallic);
            }

            if (this._uRoughness) {
                this._uRoughness.setValue(state.roughness);
            }

            if (this._uSpecularF0) {
                this._uSpecularF0.setValue(state.specularF0);
            }

            if (this._uEmissive) {
                this._uEmissive.setValue(state.emissive);
            }

            if (this._uAlphaModeCutoff) {
                this._uAlphaModeCutoff.setValue([1.0 * state.alpha, state.alphaMode === 1 ? 1.0 : 0.0, state.alphaCutoff, 0]);
            }

            if (state.baseColorMap && state.baseColorMap.texture && this._uBaseColorMap) {
                draw.bindTexture(this._uBaseColorMap, state.baseColorMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uBaseColorMapMatrix) {
                    this._uBaseColorMapMatrix.setValue(state.baseColorMap.matrix);
                }
            }

            if (state.metallicMap && state.metallicMap.texture && this._uMetallicMap) {
                draw.bindTexture(this._uMetallicMap, state.metallicMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uMetallicMapMatrix) {
                    this._uMetallicMapMatrix.setValue(state.metallicMap.matrix);
                }
            }
            
            if (state.roughnessMap && state.roughnessMap.texture && this._uRoughnessMap) {
                draw.bindTexture(this._uRoughnessMap, state.roughnessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uRoughnessMapMatrix) {
                    this._uRoughnessMapMatrix.setValue(state.roughnessMap.matrix);
                }
            }
            
            if (state.metallicRoughnessMap && state.metallicRoughnessMap.texture && this._uMetallicRoughnessMap) {
                draw.bindTexture(this._uMetallicRoughnessMap, state.metallicRoughnessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uMetallicRoughnessMapMatrix) {
                    this._uMetallicRoughnessMapMatrix.setValue(state.metallicRoughnessMap.matrix);
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
