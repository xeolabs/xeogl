(function () {

    "use strict";

    /**
     *
     */
    XEO.ChunkFactory.createChunkType({

        type: "depthBuf",

        // Avoid reapplication of this chunk after a program switch.
        programGlobal: true,

        drawAndPick: function (frameCtx) {

            var gl = this.program.gl;

            var state = this.state;
            var enabled = state.enabled;

            if (frameCtx.depthbufEnabled !== enabled) {

                if (enabled) {
                    gl.enable(gl.DEPTH_TEST);

                } else {
                    gl.disable(gl.DEPTH_TEST);
                }

                frameCtx.depthbufEnabled = enabled;
            }

            var clearDepth = state.clearDepth;

            if (frameCtx.clearDepth !== clearDepth) {
                gl.clearDepth(clearDepth);
                frameCtx.clearDepth = clearDepth;
            }

            var depthFunc = state.depthFunc;

            if (frameCtx.depthFunc !== depthFunc) {
                gl.depthFunc(depthFunc);
                frameCtx.depthFunc = depthFunc;
            }

            if (state.clear) {
                gl.clear(gl.DEPTH_BUFFER_BIT);
            }
        }
    });

})();
