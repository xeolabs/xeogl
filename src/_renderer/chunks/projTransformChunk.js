(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "projTransform",

        build: function () {
            this._uProjMatrixDraw = this.program.draw.getUniform("xeo_uProjMatrix");
            this._uProjMatrixPickObject = this.program.pickObject.getUniform("xeo_uProjMatrix");
            this._uProjMatrixPickPrimitive = this.program.pickPrimitive.getUniform("xeo_uProjMatrix");
        },

        draw: function () {
            if (this._uProjMatrixDraw) {
                this._uProjMatrixDraw.setValue(this.state.getMatrix());
            }
        },

        pickObject: function (frameCtx) {
            if (this._uProjMatrixPickObject) {
                this._uProjMatrixPickObject.setValue(frameCtx.pickProjMatrix || this.state.getMatrix());
            }
        },

        pickPrimitive: function (frameCtx) {
            if (this._uProjMatrixPickPrimitive) {
                this._uProjMatrixPickPrimitive.setValue(frameCtx.pickProjMatrix || this.state.getMatrix());
            }
        }
    });

})();