(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "program",

        build: function () {

            // Note that "program" chunks are always after "renderTarget" chunks

            this._depthModeDraw = this.program.draw.getUniform("XEO_uDepthMode");
            this._depthModePick = this.program.pick.getUniform("XEO_uDepthMode");
            this._rayPickMode = this.program.pick.getUniform("XEO_uRayPickMode");
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;

            draw.bind();

            frameCtx.textureUnit = 0;

            this._depthModeDraw.setValue(frameCtx.depthMode);

            frameCtx.drawProgram = draw;
        },

        pick: function (frameCtx) {

            var pick = this.program.pick;

            pick.bind();

            this._rayPickMode.setValue(frameCtx.rayPick);

            this._depthModePick.setValue(frameCtx.depthMode);

            frameCtx.textureUnit = 0;

            //for (var i = 0; i < 10; i++) {
            //    gl.disableVertexAttribArray(i);
            //}
        }
    });
})();



