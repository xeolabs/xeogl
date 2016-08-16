(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "modelTransform",

        build: function () {
            this._uModelMatrixDraw = this.program.draw.getUniform("xeo_uModelMatrix");
            this._uModelNormalMatrixDraw = this.program.draw.getUniform("xeo_uModelNormalMatrix");
            this._uModelMatrixPickObject = this.program.pickObject.getUniform("xeo_uModelMatrix");
            this._uModelMatrixPickPrimitive = this.program.pickPrimitive.getUniform("xeo_uModelMatrix");
        },

        draw: function () {
            if (this._uModelMatrixDraw) {
                this._uModelMatrixDraw.setValue(this.state.getMatrix());
            }
            if (this._uModelNormalMatrixDraw) {
                this._uModelNormalMatrixDraw.setValue(this.state.getNormalMatrix());
            }
        },

        pickObject: function () {
            if (this._uModelMatrixPickObject) {
                this._uModelMatrixPickObject.setValue(this.state.getMatrix());
            }
        },

        pickPrimitive: function () {
            if (this._uModelMatrixPickPrimitive) {
                this._uModelMatrixPickPrimitive.setValue(this.state.getMatrix());
            }
        }
    });

})();