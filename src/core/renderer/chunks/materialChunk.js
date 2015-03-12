(function () {

    "use strict";

    /**
     * Create display state chunk type for draw render of material transform
     */
    XEO.ChunkFactory.createChunkType({

        type: "material",

        build: function () {

            var draw = this.program.draw;

            this._uMaterialBaseColor = draw.getUniformLocation("XEO_uMaterialColor");
            this._uMaterialSpecularColor = draw.getUniformLocation("XEO_uMaterialSpecularColor");
            this._uMaterialSpecular = draw.getUniformLocation("XEO_uMaterialSpecular");
            this._uMaterialShine = draw.getUniformLocation("XEO_uMaterialShine");
            this._uMaterialEmit = draw.getUniformLocation("XEO_uMaterialEmit");
            this._uMaterialAlpha = draw.getUniformLocation("XEO_uMaterialAlpha");
        },

        draw: function () {

            var gl = this.program.gl;
            var materialSettings = this.program.draw.materialSettings;

            if (this._uMaterialBaseColor) {
                gl.uniform3fv(this._uMaterialBaseColor, this.state.baseColor);
            }

            if (this._uMaterialSpecularColor &&
                (materialSettings.specular[0] !== this.state.specular[0] ||
                    materialSettings.specular[1] !== this.state.specular[1] ||
                    materialSettings.specular[2] !== this.state.specular[2])) {
                gl.uniform3fv(this._uMaterialSpecularColor, this.state.specular);
                materialSettings.specular[0] = this.state.specular[0];
                materialSettings.specular[1] = this.state.specular[1];
                materialSettings.specular[2] = this.state.specular[2];
            }

            if (this._uMaterialSpecular && materialSettings.specular !== this.state.specular) {
                gl.uniform1f(this._uMaterialSpecular, this.state.specular);
                materialSettings.specular = this.state.specular;
            }

            if (this._uMaterialShine && materialSettings.shininess !== this.state.shininess) {
                gl.uniform1f(this._uMaterialShine, this.state.shininess);
                materialSettings.shininess = this.state.shininess;
            }

            if (this._uMaterialEmit && materialSettings.emit !== this.state.emit) {
                gl.uniform1f(this._uMaterialEmit, this.state.emit);
                materialSettings.emit = this.state.emit;
            }

            if (this._uMaterialAlpha && materialSettings.alpha !== this.state.alpha) {
                gl.uniform1f(this._uMaterialAlpha, this.state.alpha);
                materialSettings.alpha = this.state.alpha;
            }
        }
    });

})();
