(function () {

    "use strict";

    /**
     *
     */
    xeogl.renderer.ChunkFactory.createChunkType({

        type: "colorBuf",

        // Avoid re-application of this chunk after a program switch.

        programGlobal: true,

        draw: function (frameCtx) {

            if (!frameCtx.transparent) {

                // Blending forced while rendering a transparent bin

                var state = this.state;
                var blendEnabled = state.blendEnabled;

                var gl = this.program.gl;

                if (frameCtx.blendEnabled !== blendEnabled) {

                    if (blendEnabled) {
                        gl.enable(gl.BLEND);

                    } else {
                        gl.disable(gl.BLEND);
                    }

                    frameCtx.blendEnabled = blendEnabled;
                }

                var colorMask = state.colorMask;

                gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);
            }
        }
    });

})();
