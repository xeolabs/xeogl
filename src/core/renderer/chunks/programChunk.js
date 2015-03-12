(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "program",

        build: function () {

            // Note that "program" chunks are always after "renderTarget" chunks
            this._depthModeDraw = this.program.draw.getUniformLocation("XEO_uDepthMode");
            this._depthModePick = this.program.pick.getUniformLocation("XEO_uDepthMode");
            this._rayPickMode = this.program.pick.getUniformLocation("XEO_uRayPickMode");
        },

        draw: function (frameCtx) {
            var drawProgram = this.program.draw;
            drawProgram.bind();
            frameCtx.textureUnit = 0;
            var gl = this.program.gl;
            gl.uniform1i(this._depthModeDraw, frameCtx.depthMode);
            if (!frameCtx.VAO) {
                for (var i = 0; i < 10; i++) {
                    gl.disableVertexAttribArray(i);
                }
            }

            frameCtx.drawProgram = this.program.draw;
        },

        pick: function (frameCtx) {
            var pickProgram = this.program.pick;
            pickProgram.bind();
            var gl = this.program.gl;
            gl.uniform1i(this._rayPickMode, frameCtx.rayPick);
            gl.uniform1i(this._depthModePick, frameCtx.depthMode);
            frameCtx.textureUnit = 0;
            for (var i = 0; i < 10; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
    });
})();



