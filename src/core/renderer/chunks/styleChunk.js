/**
 *
 */
XEO.ChunkFactory.createChunkType({

    type:"style",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (frameCtx) {

        var lineWidth = this.core.lineWidth;

        if (frameCtx.lineWidth != lineWidth) {
            var gl = this.program.gl;
            gl.lineWidth(lineWidth);
            frameCtx.lineWidth = lineWidth;
        }
    }
});
