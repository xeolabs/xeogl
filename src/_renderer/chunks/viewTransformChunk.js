(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {
            this._uViewMatrixDraw = this.program.draw.getUniform("xeo_uViewMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniform("xeo_uViewNormalMatrix");
            this._uViewMatrixPickObject = this.program.pickObject.getUniform("xeo_uViewMatrix");
            this._uViewMatrixPickPrimitive = this.program.pickPrimitive.getUniform("xeo_uViewMatrix");
        },

        draw: function () {
            if (this._uViewMatrixDraw) {
                this._uViewMatrixDraw.setValue(this.state.getMatrix());
            }
            if (this._uViewNormalMatrixDraw) {
                this._uViewNormalMatrixDraw.setValue(this.state.getNormalMatrix());
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