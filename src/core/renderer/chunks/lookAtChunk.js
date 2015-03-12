(function () {

    "use strict";

    /**
     * Create display state chunk type for draw and pick render of lookAt transform
     */
    XEO.ChunkFactory.createChunkType({

        type: "lookAt",

        build: function () {

            this._uvMatrixDraw = this.program.draw.getUniformLocation("XEO_uVMatrix");
            this._uVNMatrixDraw = this.program.draw.getUniformLocation("XEO_uVNMatrix");
            this._uWorldEyeDraw = this.program.draw.getUniformLocation("XEO_uWorldEye");

            this._uvMatrixPick = this.program.pick.getUniformLocation("XEO_uVMatrix");
        },

        draw: function (frameCtx) {

            if (this.state.dirty) {
                this.state.rebuild();
            }

            var gl = this.program.gl;

            if (this._uvMatrixDraw) {
                gl.uniformMatrix4fv(this._uvMatrixDraw, gl.FALSE, this.state.mat);
            }

            if (this._uVNMatrixDraw) {
                gl.uniformMatrix4fv(this._uVNMatrixDraw, gl.FALSE, this.state.normalMat);
            }

            if (this._uWorldEyeDraw) {
                gl.uniform3fv(this._uWorldEyeDraw, this.state.lookAt.eye);
            }

            frameCtx.viewMat = this.state.mat;
        },

        pick: function (frameCtx) {

            var gl = this.program.gl;

            if (this._uvMatrixPick) {
                gl.uniformMatrix4fv(this._uvMatrixPick, gl.FALSE, this.state.mat);
            }

            frameCtx.viewMat = this.state.mat;
        }
    });

})();