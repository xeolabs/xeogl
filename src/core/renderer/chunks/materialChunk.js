(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "material",

        build: function () {

            var draw = this.program.draw;

            // Color

            this._uMaterialDiffuse = draw.getUniform("XEO_uMaterialDiffuse");
            this._uMaterialSpecular = draw.getUniform("XEO_uMaterialSpecular");
            this._uMaterialEmissive = draw.getUniform("XEO_uMaterialEmissive");

            // Opacity

            this._uMaterialOpacity = draw.getUniform("XEO_uMaterialOpacity");

            this._uMaterialShine = draw.getUniform("XEO_uMaterialShine");

            this._uDiffuseMap = draw.getUniform("XEO_uDiffuseMap");
            this._uDiffuseMapMatrix = draw.getUniform("XEO_uDiffuseMapMatrix");

            this._uSpecularMap = draw.getUniform("XEO_uSpecularMap");
            this._uSpecularMapMatrix = draw.getUniform("XEO_uSpecularMapMatrix");

            this._uEmissiveMap = draw.getUniform("XEO_uEmissiveMap");
            this._uEmissiveMapMatrix = draw.getUniform("XEO_uEmissiveMapMatrix");

            this._uOpacityMap = draw.getUniform("XEO_uOpacityMap");
            this._uOpacityMapMatrix = draw.getUniform("XEO_uOpacityMapMatrix");

            this._uReflectivityMap = draw.getUniform("XEO_uReflectivityMap");
            this._uReflectivityMapMatrix = draw.getUniform("XEO_uReflectivityMapMatrix");

            this._uBumpMap = draw.getUniform("XEO_uBumpMap");
            this._uBumpMapMatrix = draw.getUniform("XEO_uBumpMapMatrix");

        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;

            // Diffuse color

            if (this._uMaterialDiffuse) {
                this._uMaterialDiffuse.setValue(state.diffuse);
            }

            // Specular color

            if (this._uMaterialSpecular) {
                this._uMaterialSpecular.setValue(state.specular);
            }

            // Emissive color

            if (this._uMaterialEmissive) {
                this._uMaterialEmissive.setValue(state.emissive);
            }

            // Opacity 

            if (this._uMaterialOpacity) {
                this._uMaterialOpacity.setValue(state.opacity);
            }


            if (this._uMaterialShine) {
                this._uMaterialShine.setValue(state.shininess);
            }

            // Textures

            frameCtx.textureUnit = 0;

            // Diffuse map

            if (state.diffuseMap && this._uDiffuseMap) {

                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, frameCtx.textureUnit++);

                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            // Specular map

            if (state.specularMap && this._uSpecularMap) {

                draw.bindTexture(this._uSpecularMap, state.specularMap.texture, frameCtx.textureUnit++);

                if (this._uSpecularMapMatrix) {
                    this._uSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }

            // Emissive map

            if (state.emissiveMap && this._uEmissiveMap) {

                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit++);

                if (this._uEmissiveMapMatrix) {
                    this._uEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            // Opacity map

            if (state.opacityMap && this._uOpacityMap) {

                draw.bindTexture(this._uOpacityMap, state.opacityMap.texture, frameCtx.textureUnit++);

                if (this._uOpacityMapMatrix) {
                    this._uOpacityMapMatrix.setValue(state.opacityMap.matrix);
                }
            }

            // Reflectivity map

            if (state.reflectivityMap && this._uReflectivityMap) {

                draw.bindTexture(this._uReflectivityMap, state.reflectivityMap.texture, frameCtx.textureUnit++);

                if (this._uReflectivityMapMatrix) {
                    this._uReflectivityMapMatrix.setValue(state.reflectivityMap.matrix);
                }
            }

            // Bump map

            if (state.bumpMap && this._uBumpMap) {

                draw.bindTexture(this._uBumpMap, state.bumpMap.texture, frameCtx.textureUnit++);

                if (this._uBumpMapMatrix) {
                    this._uBumpMapMatrix.setValue(state.bumpMap.matrix);
                }
            }


            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                frameCtx.textureUnit = 0;
            }
        }
    });

})();
