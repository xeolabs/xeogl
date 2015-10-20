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
                this._uBumpMap = "xeo_uNormalMap";
                this._uBumpMapMatrix = draw.getUniform("xeo_uNormalMapMatrix");
            }

            // Fresnel effects

            if (state.diffuseFresnel) {
                this._uDiffuseFresnelBias = draw.getUniform("xeo_uDiffuseFresnelBias");
                this._uDiffuseFresnelPower = draw.getUniform("xeo_uDiffuseFresnelPower");
                this._uDiffuseFresnelLeftColor = draw.getUniform("xeo_uDiffuseFresnelLeftColor");
                this._uDiffuseFresnelRightColor = draw.getUniform("xeo_uDiffuseFresnelRightColor");
            }

            if (state.specularFresnel) {
                this._uSpecularFresnelBias = draw.getUniform("xeo_uSpecularFresnelBias");
                this._uSpecularFresnelPower = draw.getUniform("xeo_uSpecularFresnelPower");
                this._uSpecularFresnelLeftColor = draw.getUniform("xeo_uSpecularFresnelLeftColor");
                this._uSpecularFresnelRightColor = draw.getUniform("xeo_uSpecularFresnelRightColor");
            }

            if (state.opacityFresnel) {
                this._uOpacityFresnelBias = draw.getUniform("xeo_uOpacityFresnelBias");
                this._uOpacityFresnelPower = draw.getUniform("xeo_uOpacityFresnelPower");
                this._uOpacityFresnelLeftColor = draw.getUniform("xeo_uOpacityFresnelLeftColor");
                this._uOpacityFresnelRightColor = draw.getUniform("xeo_uOpacityFresnelRightColor");
            }

            if (state.reflectivityFresnel) {
                this._uReflectivityFresnelBias = draw.getUniform("xeo_uReflectivityFresnelBias");
                this._uReflectivityFresnelPower = draw.getUniform("xeo_uReflectivityFresnelPower");
                this._uReflectivityFresnelLeftColor = draw.getUniform("xeo_uReflectivityFresnelLeftColor");
                this._uReflectivityFresnelRightColor = draw.getUniform("xeo_uReflectivityFresnelRightColor");
            }

            if (state.emissiveFresnel) {
                this._uEmissiveFresnelBias = draw.getUniform("xeo_uEmissiveFresnelBias");
                this._uEmissiveFresnelPower = draw.getUniform("xeo_uEmissiveFresnelPower");
                this._uEmissiveFresnelLeftColor = draw.getUniform("xeo_uEmissiveFresnelLeftColor");
                this._uEmissiveFresnelRightColor = draw.getUniform("xeo_uEmissiveFresnelRightColor");
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;
            var gl = this.program.gl;

            // Diffuse color

            if (this._uDiffuse) {
                this._uDiffuse.setValue(state.diffuse);
            }

            // Specular color

            if (this._uSpecular) {
                this._uSpecular.setValue(state.specular);
            }

            // Emissive color

            if (this._uEmissive) {
                this._uEmissive.setValue(state.emissive);
            }

            // Opacity

            if (this._uOpacity) {
                this._uOpacity.setValue(state.opacity);
            }


            if (this._uShininess) {
                this._uShininess.setValue(state.shininess);
            }

            if (frameCtx.lineWidth != state.lineWidth) {
                gl.lineWidth(state.lineWidth);
                frameCtx.lineWidth = state.lineWidth;
            }

            if (this._uPointSize) {
                this._uPointSize.setValue(state.pointSize);
            }

            // Textures


            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                frameCtx.textureUnit = 0;
            }

            // Diffuse map

            if (state.diffuseMap && state.diffuseMap.texture) {

                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, frameCtx.textureUnit++);
                frameCtx.bindTexture++;

                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            // Specular map

            if (state.specularMap && state.specularMap.texture) {

                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, frameCtx.textureUnit++);
                frameCtx.bindTexture++;

                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }

            // Emissive map

            if (state.emissiveMap && state.emissiveMap.texture) {

                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit++);
                frameCtx.bindTexture++;

                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            // Opacity map

            if (state.opacityMap && state.opacityMap.texture) {

                draw.bindTexture(this._uOpacityMap, state.opacityMap.texture, frameCtx.textureUnit++);
                frameCtx.bindTexture++;

                if (this._uOpacityMapMatrix) {
                    this._uOpacityMapMatrix.setValue(state.opacityMap.matrix);
                }
            }

            // Reflectivity map

            if (state.reflectivityMap && state.reflectivityMap.texture) {

                draw.bindTexture(this._uReflectivityMap, state.reflectivityMap.texture, frameCtx.textureUnit++);

                if (this._uReflectivityMapMatrix) {
                    this._uReflectivityMapMatrix.setValue(state.reflectivityMap.matrix);
                }
            }

            // Bump map

            if (state.bumpMap && state.bumpMap.texture) {

                draw.bindTexture(this._uBumpMap, state.normalMap.texture, frameCtx.textureUnit++);
                frameCtx.bindTexture++;

                if (this._uBumpMapMatrix) {
                    this._uBumpMapMatrix.setValue(state.normalMap.matrix);
                }
            }

            frameCtx.textureUnit++;


            // Fresnel effects

            if (state.diffuseFresnel) {

                if (this._uDiffuseFresnelBias) {
                    this._uDiffuseFresnelBias.setValue(state.diffuseFresnel.bias);
                }

                if (this._uDiffuseFresnelPower) {
                    this._uDiffuseFresnelPower.setValue(state.diffuseFresnel.power);
                }

                if (this._uDiffuseFresnelLeftColor) {
                    this._uDiffuseFresnelLeftColor.setValue(state.diffuseFresnel.leftColor);
                }

                if (this._uDiffuseFresnelRightColor) {
                    this._uDiffuseFresnelRightColor.setValue(state.diffuseFresnel.rightColor);
                }
            }

            if (state.specularFresnel) {

                if (this._uSpecularFresnelBias) {
                    this._uSpecularFresnelBias.setValue(state.specularFresnel.bias);
                }

                if (this._uSpecularFresnelPower) {
                    this._uSpecularFresnelPower.setValue(state.specularFresnel.power);
                }

                if (this._uSpecularFresnelLeftColor) {
                    this._uSpecularFresnelLeftColor.setValue(state.specularFresnel.leftColor);
                }

                if (this._uSpecularFresnelRightColor) {
                    this._uSpecularFresnelRightColor.setValue(state.specularFresnel.rightColor);
                }
            }

            if (state.opacityFresnel) {

                if (this._uOpacityFresnelBias) {
                    this._uOpacityFresnelBias.setValue(state.opacityFresnel.bias);
                }

                if (this._uOpacityFresnelPower) {
                    this._uOpacityFresnelPower.setValue(state.opacityFresnel.power);
                }

                if (this._uOpacityFresnelLeftColor) {
                    this._uOpacityFresnelLeftColor.setValue(state.opacityFresnel.leftColor);
                }

                if (this._uOpacityFresnelRightColor) {
                    this._uOpacityFresnelRightColor.setValue(state.opacityFresnel.rightColor);
                }
            }

            if (state.reflectivityFresnel) {

                if (this._uReflectivityFresnelBias) {
                    this._uReflectivityFresnelBias.setValue(state.reflectivityFresnel.bias);
                }

                if (this._uReflectivityFresnelPower) {
                    this._uReflectivityFresnelPower.setValue(state.reflectivityFresnel.power);
                }

                if (this._uReflectivityFresnelLeftColor) {
                    this._uReflectivityFresnelLeftColor.setValue(state.reflectivityFresnel.leftColor);
                }

                if (this._uReflectivityFresnelRightColor) {
                    this._uReflectivityFresnelRightColor.setValue(state.reflectivityFresnel.rightColor);
                }
            }

            if (state.emissiveFresnel) {

                if (this._uEmissiveFresnelBias) {
                    this._uEmissiveFresnelBias.setValue(state.emissiveFresnel.bias);
                }

                if (this._uEmissiveFresnelPower) {
                    this._uEmissiveFresnelPower.setValue(state.emissiveFresnel.power);
                }

                if (this._uEmissiveFresnelLeftColor) {
                    this._uEmissiveFresnelLeftColor.setValue(state.emissiveFresnel.leftColor);
                }

                if (this._uEmissiveFresnelRightColor) {
                    this._uEmissiveFresnelRightColor.setValue(state.emissiveFresnel.rightColor);
                }
            }
        }
    });

})();
