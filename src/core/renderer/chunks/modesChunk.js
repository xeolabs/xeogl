(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "modes",

        build: function () {

            var draw = this.program.draw;

            this._uModesClippingDraw = draw.getUniform("xeo_uModesClipping");

            var pick = this.program.pick;

            this._uModesClippingPick = pick.getUniform("xeo_uModesClipping");
        },

        drawAndPick: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;

            if (frameCtx.backfaces !== backfaces) {

                if (backfaces) {
                    gl.disable(gl.CULL_FACE);

                } else {
                    gl.enable(gl.CULL_FACE);
                }

                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;

            if (frameCtx.frontface !== frontface) {

                // frontface is boolean for speed,
                // true == "ccw", false == "cw"

                if (frontface) {
                    gl.frontFace(gl.CCW);

                } else {
                    gl.frontFace(gl.CW);
                }

                frameCtx.frontface = frontface;
            }

            var transparent = state.transparent;

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

                if (this._uModesClippingPick) {
                    this._uModesClippingPick.setValue(state.clipping);
                }

            } else {
                if (this._uModesClippingDraw) {
                    this._uModesClippingDraw.setValue(state.clipping);
                }
            }
        }
    });
})();
