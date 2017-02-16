(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "MetallicMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uBaseColor = draw.getUniform("xeo_uBaseColor");
            this._uMetallic = draw.getUniform("xeo_uMetallic");
            this._uRoughness = draw.getUniform("xeo_uRoughness");
            this._uSpecularF0 = draw.getUniform("xeo_uSpecularF0");
            this._uEmissive = draw.getUniform("xeo_uEmissive");
            this._uOpacity = draw.getUniform("xeo_uOpacity");

            if (state.baseColorMap) {
                this._uBaseColorMap = "xeo_uBaseColorMap";
                this._uBaseColorMapMatrix = draw.getUniform("xeo_uBaseColorMapMatrix");
            }

            if (state.metallicMap) {
                this._uMetallicMap = "xeo_uMetallicMap";
                this._uMetallicMapMatrix = draw.getUniform("xeo_uMetallicMapMatrix");
            }

            if (state.roughnessMap) {
                this._uRoughnessMap = "xeo_uRoughnessMap";
                this._uRoughnessMapMatrix = draw.getUniform("xeo_uRoughnessMapMatrix");
            }

            if (state.metallicRoughnessMap) {
                this._uMetallicRoughnessMap = "xeo_uMetallicRoughnessMap";
                this._uMetallicRoughnessMapMatrix = draw.getUniform("xeo_uMetallicRoughnessMapMatrix");
            }

            if (state.emissiveMap) {
                this._uEmissiveMap = "xeo_uEmissiveMap";
                this._uEmissiveMapMatrix = draw.getUniform("xeo_uEmissiveMapMatrix");
            }

            if (state.occlusionMap) {
                this._uOcclusionMap = "xeo_uOcclusionMap";
                this._uOcclusionMapMatrix = draw.getUniform("xeo_uOcclusionMapMatrix");
            }

            if (state.opacityMap) {
                this._uOpacityMap = "xeo_uOpacityMap";
                this._uOpacityMapMatrix = draw.getUniform("xeo_uOpacityMapMatrix");
            }

            if (state.normalMap) {
                this._uNormalMap = "xeo_uNormalMap";
                this._uNormalMapMatrix = draw.getUniform("xeo_uNormalMapMatrix");
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

            if (this._uOpacity) {
                this._uOpacity.setValue(state.opacity);
            }

            if (state.baseColorMap && state.baseColorMap.texture) {
                draw.bindTexture(this._uBaseColorMap, state.baseColorMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uBaseColorMapMatrix) {
                    this._uBaseColorMapMatrix.setValue(state.baseColorMap.matrix);
                }
            }

            if (state.metallicMap && state.metallicMap.texture) {
                draw.bindTexture(this._uMetallicMap, state.metallicMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uMetallicMapMatrix) {
                    this._uMetallicMapMatrix.setValue(state.metallicMap.matrix);
                }
            }
            
            if (state.roughnessMap && state.roughnessMap.texture) {
                draw.bindTexture(this._uRoughnessMap, state.roughnessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uRoughnessMapMatrix) {
                    this._uRoughnessMapMatrix.setValue(state.roughnessMap.matrix);
                }
            }
            
            if (state.metallicRoughnessMap && state.metallicRoughnessMap.texture) {
                draw.bindTexture(this._uMetallicRoughnessMap, state.metallicRoughnessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uMetallicRoughnessMapMatrix) {
                    this._uMetallicRoughnessMapMatrix.setValue(state.metallicRoughnessMap.matrix);
                }
            }

            if (state.emissiveMap && state.emissiveMap.texture) {
                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            if (state.occlusionMap && state.occlusionMap.texture) {
                draw.bindTexture(this._uOcclusionMap, state.occlusionMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uOcclusionMapMatrix) {
                    this._uOcclusionMapMatrix.setValue(state.occlusionMap.matrix);
                }
            }

            if (state.opacityMap && state.opacityMap.texture) {
                draw.bindTexture(this._uOpacityMap, state.opacityMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uOpacityMapMatrix) {
                    this._uOpacityMapMatrix.setValue(state.opacityMap.matrix);
                }
            }

            if (state.normalMap && state.normalMap.texture) {
                draw.bindTexture(this._uNormalMap, state.normalMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uNormalMapMatrix) {
                    this._uNormalMapMatrix.setValue(state.normalMap.matrix);
                }
            }
        }
    });

})();
