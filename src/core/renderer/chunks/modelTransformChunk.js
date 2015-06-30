(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "modelTransform",

        build: function () {

            var draw = this.program.draw;

            this._uModelMatrixDraw = draw.getUniform("XEO_uModelMatrix");
            this._uModelNormalMatrixDraw = draw.getUniform("XEO_uModelNormalMatrix");

            var pick = this.program.pick;

            this._uModelMatrixPick = pick.getUniform("XEO_uModelMatrix");
        },

        draw: function () {

            var gl = this.program.gl;

            if (this._uModelMatrixDraw) {
                this._uModelMatrixDraw.setValue(this.state.matrix);
            }

            if (this._uModelNormalMatrixDraw) {
                this._uModelNormalMatrixDraw.setValue(this.state.normalMatrix);
            }
        },

        pick: function () {

            var gl = this.program.gl;

            if (this._uModelMatrixPick) {
                this._uModelMatrixPick.setValue(this.state.matrix);
            }
        }
    });

})();
