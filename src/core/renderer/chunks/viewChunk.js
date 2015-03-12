(function () {

    "use strict";

    /**
     *
     */
    XEO.ChunkFactory.createChunkType({

        type: "view",

        // Avoid reapplication of a chunk after a program switch.
        programGlobal: true,

        build: function () {
        },

        drawAndPick: function (frameCtx) {

            var scissorTestEnabled = this.state.scissorTestEnabled;

            if (frameCtx.scissorTestEnabled !== scissorTestEnabled) {
                var gl = this.program.gl;
                if (scissorTestEnabled) {
                    gl.enable(gl.SCISSOR_TEST);
                } else {
                    gl.disable(gl.SCISSOR_TEST);
                }
                frameCtx.scissorTestEnabled = scissorTestEnabled;
            }
        }
    });

})();
