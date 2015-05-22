(function () {

    "use strict";

    /**
     * Create display state chunk type for draw and pick render of lookAt transform
     */
    XEO.ChunkFactory.createChunkType({

        type: "viewTransform",

        build: function () {

            this._uViewMatrixDraw = this.program.draw.getUniformLocation("XEO_uVMatrix");
            this._uViewNormalMatrixDraw = this.program.draw.getUniformLocation("XEO_uVNMatrix");
            this._uWorldEyeDraw = this.program.draw.getUniformLocation("XEO_uWorldEye");

            this._uViewMatrixPick = this.program.pick.getUniformLocation("XEO_uVMatrix");
        },

        draw: function (frameCtx) {

            var gl = this.program.gl;

            var state = this.state;

            if (this._uViewMatrixDraw) {
                gl.uniformMatrix4fv(this._uViewMatrixDraw, gl.FALSE, state.matrix);
            }

            if (this._uViewNormalMatrixDraw) {
                gl.uniformMatrix4fv(this._uViewNormalMatrixDraw, gl.FALSE, state.normalMatrix);
            }

            if (this._uWorldEyeDraw) {
                gl.uniform3fv(this._uWorldEyeDraw, state.eye);
            }

            frameCtx.viewMatrix = state.mat;
        },

        pick: function (frameCtx) {

            var gl = this.program.gl;

            if (this._uViewMatrixPick) {
                gl.uniformMatrix4fv(this._uViewMatrixPick, gl.FALSE, this.state.matrix);
            }

            frameCtx.viewMatrix = this.state.matrix;
        }
    });

})();