(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {

            this._uViewMatrixDraw = this.program.draw.getUniform("XEO_uViewMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniform("XEO_uViewNormalMatrix");
            this._uEyeDraw = this.program.draw.getUniform("XEO_uEye");

            this._uViewMatrixPick = this.program.pick.getUniform("XEO_uViewMatrix");
        },

        draw: function (frameCtx) {

            var state = this.state;

            if (this._uViewMatrixDraw) {
                this._uViewMatrixDraw.setValue(state.matrix);
            }

            if (this._uViewNormalMatrixDraw) {
                this._uViewNormalMatrixDraw.setValue(state.normalMatrix);
            }

            if (this._uEyeDraw) {
                this._uEyeDraw.setValue(state.eye);
            }

            frameCtx.viewMatrix = state.matrix;
        },

        pick: function (frameCtx) {

            var gl = this.program.gl;

            if (this._uViewMatrixPick) {
                this._uViewMatrixPick.setValue(this.state.matrix);
            }

            frameCtx.viewMatrix = this.state.matrix;
        }
    });

})();