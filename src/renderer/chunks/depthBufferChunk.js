/**
 *
 */
XEO.ChunkFactory.createChunkType({

    type:"depthBuf",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (frameCtx) {

        var gl = this.program.gl;

        var enabled = this.core.enabled;

        if (frameCtx.depthbufEnabled != enabled) {
            if (enabled) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            frameCtx.depthbufEnabled = enabled;
        }

        var clearDepth = this.core.clearDepth;

        if (frameCtx.clearDepth != clearDepth) {
            gl.clearDepth(clearDepth);
            frameCtx.clearDepth = clearDepth;
        }

        var depthFunc = this.core.depthFunc;

        if (frameCtx.depthFunc != depthFunc) {
            gl.depthFunc(depthFunc);
            frameCtx.depthFunc = depthFunc;
        }

        if (this.core.clear) {
            gl.clear(gl.DEPTH_BUFFER_BIT);
        }
    }
});
