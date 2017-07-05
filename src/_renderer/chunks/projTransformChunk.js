(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "projTransform",

        build: function () {
            this._uProjMatrixDraw = this.program.draw.getUniform("projMatrix");
            this._uProjMatrixShadow = this.program.shadow.getUniform("shadowProjMatrix");
            this._uProjMatrixPickObject = this.program.pickObject.getUniform("projMatrix");
            this._uProjMatrixPickPrimitive = this.program.pickPrimitive.getUniform("projMatrix");
            this._uProjMatrixOutline = this.program.outline.getUniform("projMatrix");
        },

        draw: function () {
            if (this._uProjMatrixDraw) {
                this._uProjMatrixDraw.setValue(this.state.getMatrix());
            }
        },

        shadow: function (frameCtx) {
            if (this._uProjMatrixShadow) {
                this._uProjMatrixShadow.setValue(frameCtx.shadowProjMatrix);
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
        },

        outline: function (frameCtx) {
            if (this._uProjMatrixOutline) {
                this._uProjMatrixOutline.setValue(this.state.getMatrix());
            }
        }
    });

})();