(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {
            this._uViewMatrixDraw = this.program.draw.getUniform("viewMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniform("viewNormalMatrix");
            this._uViewMatrixShadow = this.program.pickObject.getUniform("shadowViewMatrix");
            this._uViewMatrixPickObject = this.program.pickObject.getUniform("viewMatrix");
            this._uViewMatrixPickPrimitive = this.program.pickPrimitive.getUniform("viewMatrix");
        },

        draw: function () {
            if (this._uViewMatrixDraw) {
                this._uViewMatrixDraw.setValue(this.state.getMatrix());
            }
            if (this._uViewNormalMatrixDraw) {
                this._uViewNormalMatrixDraw.setValue(this.state.getNormalMatrix());
            }
        },

        shadow: function (frameCtx) {
            if (this._uViewMatrixShadow) {
                this._uViewMatrixShadow.setValue(frameCtx.shadowViewMatrix);
            }
            if (this._uProjMatrixShadow) {
                this._uProjMatrixShadow.setValue(frameCtx.shadowProjMatrix);
            }
        },

        pickObject: function (frameCtx) {
            if (this._uViewMatrixPickObject) {
                this._uViewMatrixPickObject.setValue(frameCtx.pickViewMatrix || this.state.getMatrix());
            }
        },

        pickPrimitive: function (frameCtx) {
            if (this._uViewMatrixPickPrimitive) {
                this._uViewMatrixPickPrimitive.setValue(frameCtx.pickViewMatrix || this.state.getMatrix());
            }
        }
    });

})();