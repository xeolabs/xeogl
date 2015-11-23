(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {
            this._uViewMatrixDraw = this.program.draw.getUniform("xeo_uViewMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniform("xeo_uViewNormalMatrix");
            this._uViewMatrixPickObject = this.program.pickObject.getUniform("xeo_uViewMatrix");
            this._uViewMatrixPickPrimitive = this.program.pickPrimitive.getUniform("xeo_uViewMatrix");
        },

        draw: function () {
            if (this._uViewMatrixDraw) {
                this._uViewMatrixDraw.setValue(this.state.matrix);
            }
            if (this._uViewNormalMatrixDraw) {
                this._uViewNormalMatrixDraw.setValue(this.state.normalMatrix);
            }
        },

        pickObject: function () {
            if (this._uViewMatrixPickObject) {
                this._uViewMatrixPickObject.setValue(this.state.matrix);
            }
        },

        pickPrimitive: function () {
            if (this._uViewMatrixPickPrimitive) {
                this._uViewMatrixPickPrimitive.setValue(this.state.matrix);
            }
        }
    });

})();