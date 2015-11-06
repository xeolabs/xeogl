(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "pbrMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uMetallic = draw.getUniform("xeo_uMetallic");

            this._uMaterialColor = draw.getUniform("xeo_uMaterialColor");
            
            if (state.colorMap) {
                this._uMaterialColorMap = draw.getUniform("xeo_uMaterialColorMap");
                this._uMaterialColorMapMatrix = draw.getUniform("xeo_uMaterialColorMapMatrix");
            }
            
            this._uMaterialEmissive = draw.getUniform("xeo_uEmissive");

            if (state.emissiveMap) {
                this._uEmissiveMap = draw.getUniform("xeo_uMaterialEmissiveMap");
                this._uMaterialEmissiveMapMatrix = draw.getUniform("xeo_uMaterialEmissiveMapMatrix");
            }

            this._uOpacity = draw.getUniform("xeo_uOpacity");

            if (state.opacityMap) {
                this._uMaterialOpacityMap = draw.getUniform("xeo_uMaterialOpacityMap");
                this._uMaterialOpacityMapMatrix = draw.getUniform("xeo_uMaterialOpacityMapMatrix");
            }

            this._uMaterialRoughness = draw.getUniform("xeo_uMaterialRoughness");

            if (state.roughnessMap) {
                this._uMaterialRoughnessMap = draw.getUniform("xeo_uMaterialRoughnessMap");
                this._uMaterialRoughnessMapMatrix = draw.getUniform("xeo_uMaterialRoughnessMapMatrix");
            }

            if (state.normalMap) {
                this._uMaterialNormalMap = draw.getUniform("xeo_uMaterialNormalMap");
                this._uMaterialNormalMapMatrix = draw.getUniform("xeo_uMaterialNormalMapMatrix");
            }

            this._uMaterialSpecular = draw.getUniform("xeo_uSpecular");
            
            if (state.specularMap) {
                this._uMaterialSpecularMap = draw.getUniform("xeo_uMaterialSpecularMap");
                this._uMaterialSpecularMapMatrix = draw.getUniform("xeo_uMaterialSpecularMapMatrix");
            }
        },

        draw: function (frameCtx) {

       //     frameCtx.textureUnit = 0;
            
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

            if (this._uEmissiveMap) {

                draw.bindTexture(this._uEmissiveMap, state.emissiveMap.texture, frameCtx.textureUnit++);

                if (this._uMaterialEmissiveMapMatrix) {
                    this._uMaterialEmissiveMapMatrix.setValue(state.emissiveMap.matrix);
                }
            }

            // Opacity 

            if (this._uOpacity) {
                this._uOpacity.setValue(state.opacity);
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
            

            //if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
            //    frameCtx.textureUnit = 0;
            //}
        }
    });

})();
