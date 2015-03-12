(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "camera",

        build: function () {

            this._uPMatrixDraw = this.program.draw.getUniformLocation("XEO_uPMatrix");
            this._uZNearDraw = this.program.draw.getUniformLocation("XEO_uZNear");
            this._uZFarDraw = this.program.draw.getUniformLocation("XEO_uZFar");

            this._uPMatrixPick = this.program.pick.getUniformLocation("XEO_uPMatrix");
            this._uZNearPick = this.program.pick.getUniformLocation("XEO_uZNear");
            this._uZFarPick = this.program.pick.getUniformLocation("XEO_uZFar");
        },

        draw: function (frameCtx) {

            if (this.state.checkAspect) {
                this.state.checkAspect(this.state, frameCtx.aspect);
            }

            var gl = this.program.gl;

            if (this._uPMatrixDraw) {
                gl.uniformMatrix4fv(this._uPMatrixDraw, gl.FALSE, this.state.mat);
            }

            if (this._uZNearDraw) {
                gl.uniform1f(this._uZNearDraw, this.state.optics.near);
            }

            if (this._uZFarDraw) {
                gl.uniform1f(this._uZFarDraw, this.state.optics.far);
            }

            frameCtx.cameraMat = this.state.mat; // Query only in draw pass
        },


        pick: function (frameCtx) {

            if (this.state.checkAspect) {
                this.state.checkAspect(this.state, frameCtx.aspect);
            }

            var gl = this.program.gl;

            if (this._uPMatrixPick) {
                gl.uniformMatrix4fv(this._uPMatrixPick, gl.FALSE, this.state.mat);
            }

            if (frameCtx.rayPick) { // Z-pick pass: feed near and far clip planes into shader

                if (this._uZNearPick) {
                    gl.uniform1f(this._uZNearPick, this.state.optics.near);
                }

                if (this._uZFarPick) {
                    gl.uniform1f(this._uZFarPick, this.state.optics.far);
                }
            }

            frameCtx.cameraMat = this.state.mat; // Query only in draw pass
        }
    });

})();