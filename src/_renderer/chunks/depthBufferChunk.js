(function () {

    "use strict";

    /**
     *
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "depthBuf",

        // Avoid reapplication of this chunk after a program switch.

        programGlobal: true,

        draw: function (frameCtx) {

            var gl = this.program.gl;

            var state = this.state;
            var active = state.active;

            if (frameCtx.depthbufEnabled !== active) {

                if (active) {
                    gl.enable(gl.DEPTH_TEST);

                } else {
                    gl.disable(gl.DEPTH_TEST);
                }

                frameCtx.depthbufEnabled = active;
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
