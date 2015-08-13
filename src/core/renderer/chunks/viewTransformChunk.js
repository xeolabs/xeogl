(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {

            this._uViewMatrixDraw = this.program.draw.getUniform("xeo_uViewMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniform("xeo_uViewNormalMatrix");
            this._uEyeDraw = this.program.draw.getUniform("xeo_uEye");

            this._uViewMatrixPick = this.program.pick.getUniform("xeo_uViewMatrix");
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

            var state = this.state;

            if (this._uViewMatrixPick) {
                this._uViewMatrixPick.setValue(state.matrix);
            }

            frameCtx.viewMatrix = state.matrix;
        }
    });

})();