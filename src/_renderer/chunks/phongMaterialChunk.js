(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "phongMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            // Blinn-Phong base material

            this._uAmbient = draw.getUniform("materialAmbient");
            this._uDiffuse = draw.getUniform("materialDiffuse");
            this._uSpecular = draw.getUniform("materialSpecular");
            this._uEmissive = draw.getUniform("materialEmissive");
            this._uAlpha = draw.getUniform("materialAlpha");
            this._uShininess = draw.getUniform("materialShininess");

            this._uPointSize = draw.getUniform("pointSize");

            // Textures

            if (state.ambientMap) {
                this._uAmbientMap = "ambientMap";
                this._uAmbientMapMatrix = draw.getUniform("ambientMapMatrix");
            }

            if (state.diffuseMap) {
                this._uDiffuseMap = "diffuseMap";
                this._uDiffuseMapMatrix = draw.getUniform("diffuseMapMatrix");
            }

            if (state.specularMap) {
                this._uSpecularMap = "specularMap";
                this._uSpecularMapMatrix = draw.getUniform("specularMapMatrix");
            }

            if (state.emissiveMap) {
                this._uEmissiveMap = "emissiveMap";
                this._uEmissiveMapMatrix = draw.getUniform("emissiveMapMatrix");
            }

            if (state.alphaMap) {
                this._uAlphaMap = "alphaMap";
                this._uAlphaMapMatrix = draw.getUniform("alphaMapMatrix");
            }

            if (state.reflectivityMap) {
                this._uReflectivityMap = "reflectivityMap";
                this._uReflectivityMapMatrix = draw.getUniform("reflectivityMapMatrix");
            }

            if (state.normalMap) {
                this._uNormalMap = "normalMap";
                this._uNormalMapMatrix = draw.getUniform("normalMapMatrix");
            }

            if (state.occlusionMap) {
                this._uOcclusionMap = "occlusionMap";
                this._uOcclusionMapMatrix = draw.getUniform("occlusionMapMatrix");
            }

            // Fresnel effects

            if (state.diffuseFresnel) {
                this._uDiffuseFresnelEdgeBias = draw.getUniform("diffuseFresnelEdgeBias");
                this._uDiffuseFresnelCenterBias = draw.getUniform("diffuseFresnelCenterBias");
                this._uDiffuseFresnelEdgeColor = draw.getUniform("diffuseFresnelEdgeColor");
                this._uDiffuseFresnelCenterColor = draw.getUniform("diffuseFresnelCenterColor");
                this._uDiffuseFresnelPower = draw.getUniform("diffuseFresnelPower");
            }

            if (state.specularFresnel) {
                this._uSpecularFresnelEdgeBias = draw.getUniform("specularFresnelEdgeBias");
                this._uSpecularFresnelCenterBias = draw.getUniform("specularFresnelCenterBias");
                this._uSpecularFresnelEdgeColor = draw.getUniform("specularFresnelEdgeColor");
                this._uSpecularFresnelCenterColor = draw.getUniform("specularFresnelCenterColor");
                this._uSpecularFresnelPower = draw.getUniform("specularFresnelPower");
            }

            if (state.alphaFresnel) {
                this._uAlphaFresnelEdgeBias = draw.getUniform("alphaFresnelEdgeBias");
                this._uAlphaFresnelCenterBias = draw.getUniform("alphaFresnelCenterBias");
                this._uAlphaFresnelEdgeColor = draw.getUniform("alphaFresnelEdgeColor");
                this._uAlphaFresnelCenterColor = draw.getUniform("alphaFresnelCenterColor");
                this._uAlphaFresnelPower = draw.getUniform("alphaFresnelPower");
            }

            if (state.reflectivityFresnel) {
                this._uReflectivityFresnelEdgeBias = draw.getUniform("reflectivityFresnelEdgeBias");
                this._uReflectivityFresnelCenterBias = draw.getUniform("reflectivityFresnelCenterBias");
                this._uReflectivityFresnelEdgeColor = draw.getUniform("reflectivityFresnelEdgeColor");
                this._uReflectivityFresnelCenterColor = draw.getUniform("reflectivityFresnelCenterColor");
                this._uReflectivityFresnelPower = draw.getUniform("reflectivityFresnelPower");
            }

            if (state.emissiveFresnel) {
                this._uEmissiveFresnelEdgeBias = draw.getUniform("emissiveFresnelEdgeBias");
                this._uEmissiveFresnelCenterBias = draw.getUniform("emissiveFresnelCenterBias");
                this._uEmissiveFresnelEdgeColor = draw.getUniform("emissiveFresnelEdgeColor");
                this._uEmissiveFresnelCenterColor = draw.getUniform("emissiveFresnelCenterColor");
                this._uEmissiveFresnelPower = draw.getUniform("emissiveFresnelPower");
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;
            var gl = this.program.gl;
            var maxTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_UNITS;
            //  frameCtx.textureUnit = 0;

            if (this._uShininess) {
                this._uShininess.setValue(state.shininess);
            }

            if (frameCtx.lineWidth !== state.lineWidth) {
                gl.lineWidth(state.lineWidth);
                frameCtx.lineWidth = state.lineWidth;
            }

            if (this._uPointSize) {
                this._uPointSize.setValue(state.pointSize);
            }

            if (this._uAmbient) {
                this._uAmbient.setValue(state.ambient);
            }

            if (this._uDiffuse) {
                this._uDiffuse.setValue(state.diffuse);
            }

            if (this._uSpecular) {
                this._uSpecular.setValue(state.specular);
            }

            if (this._uEmissive) {
                this._uEmissive.setValue(state.emissive);
            }

            if (this._uAlpha) {
                this._uAlpha.setValue(state.alpha);
            }

            // Ambient map

            if (state.ambientMap && state.ambientMap.texture && this._uAmbientMap) {
                draw.bindTexture(this._uAmbientMap, state.ambientMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uAmbientMapMatrix) {
                    this._uAmbientMapMatrix.setValue(state.ambientMap.matrix);
                }
            }

            // Diffuse map

            if (state.diffuseMap && state.diffuseMap.texture && this._uDiffuseMap) {
                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            // Specular map

            if (state.specularMap && state.specularMap.texture && this._uSpecularMap) {
                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }

            // Emissive map

            if (state.emissiveMap && state.emissiveMap.texture && this._uEmissiveMap) {
                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            // Alpha map

            if (state.alphaMap && state.alphaMap.texture && this._uAlphaMap) {
                draw.bindTexture(this._uAlphaMap, state.alphaMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uAlphaMapMatrix) {
                    this._uAlphaMapMatrix.setValue(state.alphaMap.matrix);
                }
            }

            // Reflectivity map

            if (state.reflectivityMap && state.reflectivityMap.texture && this._uReflectivityMap) {
                draw.bindTexture(this._uReflectivityMap, state.reflectivityMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;

                if (this._uReflectivityMapMatrix) {
                    this._uReflectivityMapMatrix.setValue(state.reflectivityMap.matrix);
                }
            }

            // Normal map

            if (state.normalMap && state.normalMap.texture && this._uNormalMap) {
                draw.bindTexture(this._uNormalMap, state.normalMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uNormalMapMatrix) {
                    this._uNormalMapMatrix.setValue(state.normalMap.matrix);
                }
            }

            // Occlusion map

            if (state.occlusionMap && state.occlusionMap.texture && this._uOcclusionMap) {
                draw.bindTexture(this._uOcclusionMap, state.occlusionMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
                frameCtx.bindTexture++;

                if (this._uOcclusionMapMatrix) {
                    this._uOcclusionMapMatrix.setValue(state.occlusionMap.matrix);
                }
            }

            // Fresnel effects

            if (state.diffuseFresnel) {

                if (this._uDiffuseFresnelEdgeBias) {
                    this._uDiffuseFresnelEdgeBias.setValue(state.diffuseFresnel.edgeBias);
                }

                if (this._uDiffuseFresnelCenterBias) {
                    this._uDiffuseFresnelCenterBias.setValue(state.diffuseFresnel.centerBias);
                }

                if (this._uDiffuseFresnelEdgeColor) {
                    this._uDiffuseFresnelEdgeColor.setValue(state.diffuseFresnel.edgeColor);
                }

                if (this._uDiffuseFresnelCenterColor) {
                    this._uDiffuseFresnelCenterColor.setValue(state.diffuseFresnel.centerColor);
                }

                if (this._uDiffuseFresnelPower) {
                    this._uDiffuseFresnelPower.setValue(state.diffuseFresnel.power);
                }
            }

            if (state.specularFresnel) {

                if (this._uSpecularFresnelEdgeBias) {
                    this._uSpecularFresnelEdgeBias.setValue(state.specularFresnel.edgeBias);
                }

                if (this._uSpecularFresnelCenterBias) {
                    this._uSpecularFresnelCenterBias.setValue(state.specularFresnel.centerBias);
                }

                if (this._uSpecularFresnelEdgeColor) {
                    this._uSpecularFresnelEdgeColor.setValue(state.specularFresnel.edgeColor);
                }

                if (this._uSpecularFresnelCenterColor) {
                    this._uSpecularFresnelCenterColor.setValue(state.specularFresnel.centerColor);
                }

                if (this._uSpecularFresnelPower) {
                    this._uSpecularFresnelPower.setValue(state.specularFresnel.power);
                }
            }

            if (state.alphaFresnel) {

                if (this._uAlphaFresnelEdgeBias) {
                    this._uAlphaFresnelEdgeBias.setValue(state.alphaFresnel.edgeBias);
                }

                if (this._uAlphaFresnelCenterBias) {
                    this._uAlphaFresnelCenterBias.setValue(state.alphaFresnel.centerBias);
                }

                if (this._uAlphaFresnelEdgeColor) {
                    this._uAlphaFresnelEdgeColor.setValue(state.alphaFresnel.edgeColor);
                }

                if (this._uAlphaFresnelCenterColor) {
                    this._uAlphaFresnelCenterColor.setValue(state.alphaFresnel.centerColor);
                }

                if (this._uAlphaFresnelPower) {
                    this._uAlphaFresnelPower.setValue(state.alphaFresnel.power);
                }
            }

            if (state.reflectivityFresnel) {

                if (this._uReflectivityFresnelEdgeBias) {
                    this._uReflectivityFresnelEdgeBias.setValue(state.reflectivityFresnel.edgeBias);
                }

                if (this._uReflectivityFresnelCenterBias) {
                    this._uReflectivityFresnelCenterBias.setValue(state.reflectivityFresnel.centerBias);
                }

                if (this._uReflectivityFresnelEdgeColor) {
                    this._uReflectivityFresnelEdgeColor.setValue(state.reflectivityFresnel.edgeColor);
                }

                if (this._uReflectivityFresnelCenterColor) {
                    this._uReflectivityFresnelCenterColor.setValue(state.reflectivityFresnel.centerColor);
                }

                if (this._uReflectivityFresnelPower) {
                    this._uReflectivityFresnelPower.setValue(state.reflectivityFresnel.power);
                }
            }

            if (state.emissiveFresnel) {

                if (this._uEmissiveFresnelEdgeBias) {
                    this._uEmissiveFresnelEdgeBias.setValue(state.emissiveFresnel.edgeBias);
                }

                if (this._uEmissiveFresnelCenterBias) {
                    this._uEmissiveFresnelCenterBias.setValue(state.emissiveFresnel.centerBias);
                }

                if (this._uEmissiveFresnelEdgeColor) {
                    this._uEmissiveFresnelEdgeColor.setValue(state.emissiveFresnel.edgeColor);
                }

                if (this._uEmissiveFresnelCenterColor) {
                    this._uEmissiveFresnelCenterColor.setValue(state.emissiveFresnel.centerColor);
                }

                if (this._uEmissiveFresnelPower) {
                    this._uEmissiveFresnelPower.setValue(state.emissiveFresnel.power);
                }
            }
        }
    });

})();
