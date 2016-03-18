(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "phongMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            // Blinn-Phong base material

            this._uDiffuse = draw.getUniform("xeo_uDiffuse");
            this._uSpecular = draw.getUniform("xeo_uSpecular");
            this._uEmissive = draw.getUniform("xeo_uEmissive");
            this._uOpacity = draw.getUniform("xeo_uOpacity");
            this._uShininess = draw.getUniform("xeo_uShininess");

            this._uPointSize = draw.getUniform("xeo_uPointSize");

            // Textures

            if (state.ambientMap) {
                this._uAmbientMap = "xeo_uAmbientMap";
                this._uAmbientMapMatrix = draw.getUniform("xeo_uAmbientMapMatrix");
            }

            if (state.diffuseMap) {
                this._uDiffuseMap = "xeo_uDiffuseMap";
                this._uDiffuseMapMatrix = draw.getUniform("xeo_uDiffuseMapMatrix");
            }

            if (state.specularMap) {
                this._uSpecularMap = "xeo_uSpecularMap";
                this._uSpecularMapMatrix = draw.getUniform("xeo_uSpecularMapMatrix");
            }

            if (state.emissiveMap) {
                this._uEmissiveMap = "xeo_uEmissiveMap";
                this._uEmissiveMapMatrix = draw.getUniform("xeo_uEmissiveMapMatrix");
            }

            if (state.opacityMap) {
                this._uOpacityMap = "xeo_uOpacityMap";
                this._uOpacityMapMatrix = draw.getUniform("xeo_uOpacityMapMatrix");
            }

            if (state.reflectivityMap) {
                this._uReflectivityMap = "xeo_uReflectivityMap";
                this._uReflectivityMapMatrix = draw.getUniform("xeo_uReflectivityMapMatrix");
            }

            if (state.normalMap) {
                this._uNormalMap = "xeo_uNormalMap";
                this._uNormalMapMatrix = draw.getUniform("xeo_uNormalMapMatrix");
            }

            // Fresnel effects

            if (state.diffuseFresnel) {
                this._uDiffuseFresnelEdgeBias = draw.getUniform("xeo_uDiffuseFresnelEdgeBias");
                this._uDiffuseFresnelCenterBias = draw.getUniform("xeo_uDiffuseFresnelCenterBias");
                this._uDiffuseFresnelEdgeColor = draw.getUniform("xeo_uDiffuseFresnelEdgeColor");
                this._uDiffuseFresnelCenterColor = draw.getUniform("xeo_uDiffuseFresnelCenterColor");
                this._uDiffuseFresnelPower = draw.getUniform("xeo_uDiffuseFresnelPower");
            }

            if (state.specularFresnel) {
                this._uSpecularFresnelEdgeBias = draw.getUniform("xeo_uSpecularFresnelEdgeBias");
                this._uSpecularFresnelCenterBias = draw.getUniform("xeo_uSpecularFresnelCenterBias");
                this._uSpecularFresnelEdgeColor = draw.getUniform("xeo_uSpecularFresnelEdgeColor");
                this._uSpecularFresnelCenterColor = draw.getUniform("xeo_uSpecularFresnelCenterColor");
                this._uSpecularFresnelPower = draw.getUniform("xeo_uSpecularFresnelPower");
            }

            if (state.opacityFresnel) {
                this._uOpacityFresnelEdgeBias = draw.getUniform("xeo_uOpacityFresnelEdgeBias");
                this._uOpacityFresnelCenterBias = draw.getUniform("xeo_uOpacityFresnelCenterBias");
                this._uOpacityFresnelEdgeColor = draw.getUniform("xeo_uOpacityFresnelEdgeColor");
                this._uOpacityFresnelCenterColor = draw.getUniform("xeo_uOpacityFresnelCenterColor");
                this._uOpacityFresnelPower = draw.getUniform("xeo_uOpacityFresnelPower");
            }

            if (state.reflectivityFresnel) {
                this._uReflectivityFresnelEdgeBias = draw.getUniform("xeo_uReflectivityFresnelEdgeBias");
                this._uReflectivityFresnelCenterBias = draw.getUniform("xeo_uReflectivityFresnelCenterBias");
                this._uReflectivityFresnelEdgeColor = draw.getUniform("xeo_uReflectivityFresnelEdgeColor");
                this._uReflectivityFresnelCenterColor = draw.getUniform("xeo_uReflectivityFresnelCenterColor");
                this._uReflectivityFresnelPower = draw.getUniform("xeo_uReflectivityFresnelPower");
            }

            if (state.emissiveFresnel) {
                this._uEmissiveFresnelEdgeBias = draw.getUniform("xeo_uEmissiveFresnelEdgeBias");
                this._uEmissiveFresnelCenterBias = draw.getUniform("xeo_uEmissiveFresnelCenterBias");
                this._uEmissiveFresnelEdgeColor = draw.getUniform("xeo_uEmissiveFresnelEdgeColor");
                this._uEmissiveFresnelCenterColor = draw.getUniform("xeo_uEmissiveFresnelCenterColor");
                this._uEmissiveFresnelPower = draw.getUniform("xeo_uEmissiveFresnelPower");
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;
            var gl = this.program.gl;


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

            // Ambient map

            if (state.ambientMap && state.ambientMap.texture) {

                draw.bindTexture(this._uAmbientMap, state.ambientMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uAmbientMapMatrix) {
                    this._uAmbientMapMatrix.setValue(state.ambientMap.matrix);
                }
            }

            // Diffuse map

            if (state.diffuseMap && state.diffuseMap.texture) {

                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }

            } else if (this._uDiffuse) {
                this._uDiffuse.setValue(state.diffuse);
            }

            // Specular map

            if (state.specularMap && state.specularMap.texture) {

                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }

            } else if (this._uSpecular) {
                this._uSpecular.setValue(state.specular);
            }

            // Emissive map

            if (state.emissiveMap && state.emissiveMap.texture) {

                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }

            } else if (this._uEmissive) {
                this._uEmissive.setValue(state.emissive);
            }

            // Opacity map

            if (state.opacityMap && state.opacityMap.texture) {

                draw.bindTexture(this._uOpacityMap, state.opacityMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uOpacityMapMatrix) {
                    this._uOpacityMapMatrix.setValue(state.opacityMap.matrix);
                }

            } else if (this._uOpacity) {
                this._uOpacity.setValue(state.opacity);
            }

            // Reflectivity map

            if (state.reflectivityMap && state.reflectivityMap.texture) {

                draw.bindTexture(this._uReflectivityMap, state.reflectivityMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));

                if (this._uReflectivityMapMatrix) {
                    this._uReflectivityMapMatrix.setValue(state.reflectivityMap.matrix);
                }
            }

            // Normal map

            if (state.normalMap && state.normalMap.texture) {

                draw.bindTexture(this._uNormalMap, state.normalMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;

                if (this._uNormalMapMatrix) {
                    this._uNormalMapMatrix.setValue(state.normalMap.matrix);
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

            if (state.opacityFresnel) {

                if (this._uOpacityFresnelEdgeBias) {
                    this._uOpacityFresnelEdgeBias.setValue(state.opacityFresnel.edgeBias);
                }

                if (this._uOpacityFresnelCenterBias) {
                    this._uOpacityFresnelCenterBias.setValue(state.opacityFresnel.centerBias);
                }

                if (this._uOpacityFresnelEdgeColor) {
                    this._uOpacityFresnelEdgeColor.setValue(state.opacityFresnel.edgeColor);
                }

                if (this._uOpacityFresnelCenterColor) {
                    this._uOpacityFresnelCenterColor.setValue(state.opacityFresnel.centerColor);
                }

                if (this._uOpacityFresnelPower) {
                    this._uOpacityFresnelPower.setValue(state.opacityFresnel.power);
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
