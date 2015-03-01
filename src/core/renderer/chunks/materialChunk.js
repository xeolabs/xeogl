/**
 * Create display state chunk type for draw render of material transform
 */
XEO.ChunkFactory.createChunkType({

    type: "material",

    build : function() {

        var draw = this.program.draw;

        this._uMaterialBaseColor = draw.getUniformLocation("XEO_uMaterialColor");
        this._uMaterialSpecularColor = draw.getUniformLocation("XEO_uMaterialSpecularColor");
        this._uMaterialSpecular = draw.getUniformLocation("XEO_uMaterialSpecular");
        this._uMaterialShine = draw.getUniformLocation("XEO_uMaterialShine");
        this._uMaterialEmit = draw.getUniformLocation("XEO_uMaterialEmit");
        this._uMaterialAlpha = draw.getUniformLocation("XEO_uMaterialAlpha");
    },

    draw : function() {

        var gl = this.program.gl;
        var materialSettings = this.program.draw.materialSettings;

        if (this._uMaterialBaseColor) {
            gl.uniform3fv(this._uMaterialBaseColor, this.core.baseColor);
        }

        if (this._uMaterialSpecularColor &&
            (materialSettings.specular[0] != this.core.specular[0] ||
             materialSettings.specular[1] != this.core.specular[1] ||
             materialSettings.specular[2] != this.core.specular[2])) {
            gl.uniform3fv(this._uMaterialSpecularColor, this.core.specular);
            materialSettings.specular[0] = this.core.specular[0];
            materialSettings.specular[1] = this.core.specular[1];
            materialSettings.specular[2] = this.core.specular[2];
        }

        if (this._uMaterialSpecular && materialSettings.specular != this.core.specular) {
            gl.uniform1f(this._uMaterialSpecular, this.core.specular);
            materialSettings.specular = this.core.specular;
        }

        if (this._uMaterialShine && materialSettings.shininess != this.core.shininess) {
            gl.uniform1f(this._uMaterialShine, this.core.shininess);
            materialSettings.shininess = this.core.shininess;
        }

        if (this._uMaterialEmit && materialSettings.emit != this.core.emit) {
            gl.uniform1f(this._uMaterialEmit, this.core.emit);
            materialSettings.emit = this.core.emit;
        }

        if (this._uMaterialAlpha && materialSettings.alpha != this.core.alpha) {
            gl.uniform1f(this._uMaterialAlpha, this.core.alpha);
            materialSettings.alpha = this.core.alpha;
        }
    }
});
