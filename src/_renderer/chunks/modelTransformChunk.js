(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "modelTransform",

        build: function () {
            this._uModelMatrixDraw = this.program.draw.getUniform("modelMatrix");
            this._uModelNormalMatrixDraw = this.program.draw.getUniform("modelNormalMatrix");
            this._uModelMatrixShadow = this.program.shadow.getUniform("modelMatrix");
            this._uModelMatrixPickObject = this.program.pickObject.getUniform("modelMatrix");
            this._uModelMatrixPickPrimitive = this.program.pickPrimitive.getUniform("modelMatrix");
            this._uModelMatrixOutline = this.program.outline.getUniform("modelMatrix");
        },

        draw: function () {
            if (this._uModelMatrixDraw) {
                this._uModelMatrixDraw.setValue(this.state.getMatrix());
            }
            if (this._uModelNormalMatrixDraw) {
                this._uModelNormalMatrixDraw.setValue(this.state.getNormalMatrix());
            }
        },

        shadow: function () {
            if (this._uModelMatrixShadow) {
                this._uModelMatrixShadow.setValue(this.state.getMatrix());
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
        },

        outline: function () {
            if (this._uModelMatrixOutline) {
                this._uModelMatrixOutline.setValue(this.state.getMatrix());
            }
        }
    });

})();