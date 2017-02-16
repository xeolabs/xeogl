(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "SpecularMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uDiffuse = draw.getUniform("xeo_uDiffuse");
            this._uSpecular = draw.getUniform("xeo_uSpecular");
            this._uGlossiness = draw.getUniform("xeo_uGlossiness");
            this._uReflectivity = draw.getUniform("xeo_uReflectivity");
            this._uEmissive = draw.getUniform("xeo_uEmissive");
            this._uOpacity = draw.getUniform("xeo_uOpacity");

            if (state.diffuseMap) {
                this._uDiffuseMap = "xeo_uDiffuseMap";
                this._uDiffuseMapMatrix = draw.getUniform("xeo_uDiffuseMapMatrix");
            }

            if (state.specularMap) {
                this._uSpecularMap = "xeo_uSpecularMap";
                this._uSpecularMapMatrix = draw.getUniform("xeo_uSpecularMapMatrix");
            }

            if (state.glossinessMap) {
                this._uGlossinessMap = "xeo_uGlossinessMap";
                this._uGlossinessMapMatrix = draw.getUniform("xeo_uGlossinessMapMatrix");
            }

            if (state.specularGlossinessMap) {
                this._uSpecularGlossinessMap = "xeo_uSpecularGlossinessMap";
                this._uSpecularGlossinessMapMatrix = draw.getUniform("xeo_uSpecularGlossinessMapMatrix");
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

            if (this._uOpacity) {
                this._uOpacity.setValue(state.opacity);
            }

            if (state.diffuseMap && state.diffuseMap.texture) {
                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            if (state.specularMap && state.specularMap.texture) {
                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }

            if (state.glossinessMap && state.glossinessMap.texture) {
                draw.bindTexture(this._uGlossinessMap, state.glossinessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uGlossinessMapMatrix) {
                    this._uGlossinessMapMatrix.setValue(state.glossinessMap.matrix);
                }
            }

            if (state.specularGlossinessMap && state.specularGlossinessMap.texture) {
                draw.bindTexture(this._uSpecularGlossinessMap, state.specularGlossinessMap.texture, frameCtx.textureUnit);
                  frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;
                if (this._uSpecularGlossinessMapMatrix) {
                    this._uSpecularGlossinessMapMatrix.setValue(state.specularGlossinessMap.matrix);
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
