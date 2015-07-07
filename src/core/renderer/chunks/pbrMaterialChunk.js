(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "pbrMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uMetallic = draw.getUniform("XEO_uMetallic");

            this._uMaterialColor = draw.getUniform("XEO_uMaterialColor");
            
            if (state.colorMap) {
                this._uMaterialColorMap = draw.getUniform("XEO_uMaterialColorMap");
                this._uMaterialColorMapMatrix = draw.getUniform("XEO_uMaterialColorMapMatrix");
            }
            
            this._uMaterialEmissive = draw.getUniform("XEO_uMaterialEmissive");

            if (state.emissiveMap) {
                this._uMaterialEmissiveMap = draw.getUniform("XEO_uMaterialEmissiveMap");
                this._uMaterialEmissiveMapMatrix = draw.getUniform("XEO_uMaterialEmissiveMapMatrix");
            }

            this._uMaterialOpacity = draw.getUniform("XEO_uMaterialOpacity");

            if (state.opacityMap) {
                this._uMaterialOpacityMap = draw.getUniform("XEO_uMaterialOpacityMap");
                this._uMaterialOpacityMapMatrix = draw.getUniform("XEO_uMaterialOpacityMapMatrix");
            }

            this._uMaterialRoughness = draw.getUniform("XEO_uMaterialRoughness");

            if (state.roughnessMap) {
                this._uMaterialRoughnessMap = draw.getUniform("XEO_uMaterialRoughnessMap");
                this._uMaterialRoughnessMapMatrix = draw.getUniform("XEO_uMaterialRoughnessMapMatrix");
            }

            if (state.normalMap) {
                this._uMaterialNormalMap = draw.getUniform("XEO_uMaterialNormalMap");
                this._uMaterialNormalMapMatrix = draw.getUniform("XEO_uMaterialNormalMapMatrix");
            }

            this._uMaterialSpecular = draw.getUniform("XEO_uMaterialSpecular");
            
            if (state.specularMap) {
                this._uMaterialSpecularMap = draw.getUniform("XEO_uMaterialSpecularMap");
                this._uMaterialSpecularMapMatrix = draw.getUniform("XEO_uMaterialSpecularMapMatrix");
            }
        },

        draw: function (frameCtx) {

            frameCtx.textureUnit = 0;
            
            var draw = this.program.draw;
            var state = this.state;

            if (this._uMetallic) {
                this._uMetallic.setValue(state.metallic);
            }

            // Base color

            if (this._uMaterialColor) {
                this._uMaterialColor.setValue(state.color);
            }

            if ( this._uMaterialColorMap) {

                draw.bindTexture(this._uMaterialColorMap, state.colorMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialColorMapMatrix) {
                    this._uMaterialColorMapMatrix.setValue(state.colorMap.matrix);
                }
            }

            // Emissive color

            if (this._uMaterialEmissive) {
                this._uMaterialEmissive.setValue(state.emissive);
            }

            if (this._uMaterialEmissiveMap) {

                draw.bindTexture(this._uMaterialEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialEmissiveMapMatrix) {
                    this._uMaterialEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            // Opacity 

            if (this._uMaterialOpacity) {
                this._uMaterialOpacity.setValue(state.opacity);
            }
            
            if (this._uMaterialOpacityMap) {

                draw.bindTexture(this._uMaterialOpacityMap, state.opacityMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialOpacityMapMatrix) {
                    this._uMaterialOpacityMapMatrix.setValue(state.opacityMap.matrix);
                }
            }
            
            // Roughness

            if (this._uMaterialRoughness) {
                this._uMaterialRoughness.setValue(state.roughness);
            }

            if (this._uMaterialRoughnessMap) {

                draw.bindTexture(this._uMaterialRoughnessMap, state.roughnessMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialRoughnessMapMatrix) {
                    this._uMaterialRoughnessMapMatrix.setValue(state.roughnessMap.matrix);
                }
            }

            // Normal map

            if (this._uMaterialNormalMap) {

                draw.bindTexture(this._uMaterialNormalMap, state.normalMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialNormalMapMatrix) {
                    this._uMaterialNormalMapMatrix.setValue(state.normalMap.matrix);
                }
            }

            // Specular 

            if (this._uMaterialSpecular) {
                this._uMaterialSpecular.setValue(state.specular);
            }

            if (this._uMaterialSpecularMap) {

                draw.bindTexture(this._uMaterialSpecularMap, state.specularMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialSpecularMapMatrix) {
                    this._uMaterialSpecularMapMatrix.setValue(state.specularMap.matrix);
                }
            }
            

            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                frameCtx.textureUnit = 0;
            }
        }
    });

})();
