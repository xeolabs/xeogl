(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "modes",

        build: function () {

            var draw = this.program.draw;

            this._uClippingDraw = draw.getUniformLocation("XEO_uClipping");

            var pick = this.program.pick;

            this._uClippingPick = pick.getUniformLocation("XEO_uClipping");
        },

        drawAndPick: function (frameCtx) {

            var gl = this.program.gl;

            var backfaces = this.state.backfaces;

            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = this.state.frontface;

            if (frameCtx.frontface !== frontface) {
                if (frontface === "ccw") {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }

            var transparent = this.state.transparent;

            if (frameCtx.transparent !== transparent) {
                if (!frameCtx.pick) {
                    if (transparent) {

                        // Entering a transparency bin

                        gl.enable(gl.BLEND);
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                        frameCtx.blendEnabled = true;

                    } else {

                        // Leaving a transparency bin

                        gl.disable(gl.BLEND);
                        frameCtx.blendEnabled = false;
                    }
                }
                frameCtx.transparent = transparent;
            }

            if (frameCtx.pick) {
                gl.uniform1i(this._uClippingPick, this.state.clipping);

            } else {
                gl.uniform1i(this._uClippingDraw, this.state.clipping);
            }
        }
    });
})();
