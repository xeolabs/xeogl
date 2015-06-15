(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "program",

        build: function () {

            // Note that "program" chunks are always after "renderTarget" chunks
            this._depthModeDraw = this.program.draw.getUniform("XEO_uDepthMode");
            this._depthModePick = this.program.pick.getUniform("XEO_uDepthMode");
            this._rayPickMode = this.program.pick.getUniform("XEO_uRayPickMode");
        },

        draw: function (frameCtx) {

            var drawProgram = this.program.draw;

            drawProgram.bind();

            frameCtx.textureUnit = 0;

            var gl = this.program.gl;

            this._depthModeDraw.setValue(frameCtx.depthMode);

            frameCtx.drawProgram = this.program.draw;
        },

        pick: function (frameCtx) {

            var pickProgram = this.program.pick;

            pickProgram.bind();

            var gl = this.program.gl;

            this._rayPickMode.setValue(frameCtx.rayPick);

            this._depthModePick.setValue(frameCtx.depthMode);

            frameCtx.textureUnit = 0;

            for (var i = 0; i < 10; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
    });
})();



