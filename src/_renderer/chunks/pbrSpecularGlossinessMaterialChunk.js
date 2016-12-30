(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "PBRSpecularGlossinessMaterial",

        build: function () {

            var state = this.state;

            var draw = this.program.draw;

            this._uDiffuseFactor = draw.getUniform("xeo_uDiffuseFactor");
            this._uSpecularFactor = draw.getUniform("xeo_uSpecularFactor");
            this._uGlossinessFactor = draw.getUniform("xeo_uGlossinessFactor");

            if (state.diffuseMap) {
                this._uDiffuseMap = "xeo_uDiffuseMap";
                this._uDiffuseMapMatrix = draw.getUniform("xeo_uDiffuseMapMatrix");
            }

            if (state.specularGlossinessMap) {
                this._uSpecularGlossinessMap = "xeo_uSpecularGlossinessMap";
                this._uSpecularGlossinessMapMatrix = draw.getUniform("xeo_uSpecularGlossinessMapMatrix");
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var state = this.state;

            if (this._uDiffuseFactor) {
                this._uDiffuseFactor.setValue(state.diffuseFactor);
            }

            if (this._uSpecularFactor) {
                this._uSpecularFactor.setValue(state.specularFactor);
            }

            if (this._uGlossinessFactor) {
                this._uGlossinessFactor.setValue(state.glossinessFactor);
            }

            if (state.diffuseMap && state.diffuseMap.texture) {
                draw.bindTexture(this._uDiffuseMap, state.diffuseMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;
                if (this._uDiffuseMapMatrix) {
                    this._uDiffuseMapMatrix.setValue(state.diffuseMap.matrix);
                }
            }

            if (state.specularGlossinessMap && state.specularGlossinessMap.texture) {
                draw.bindTexture(this._uSpecularGlossinessMap, state.specularGlossinessMap.texture, (frameCtx.textureUnit < 8 ? frameCtx.textureUnit++ : frameCtx.textureUnit = 0));
                frameCtx.bindTexture++;
                if (this._uSpecularGlossinessMapMatrix) {
                    this._uSpecularGlossinessMapMatrix.setValue(state.specularGlossinessMap.matrix);
                }
            }
        }
    });

})();
