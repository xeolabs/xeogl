(function () {

    "use strict";

    /**
     *
     */
    XEO.ChunkFactory.createChunkType({

        type: "draw",

        /**
         * As we apply a list of state chunks in a {@link XEO.Renderer}, we track the ID of each chunk
         * in order to avoid redundantly re-applying the same chunk.
         *
         * We don't want that for draw chunks however, because they contain GL drawElements calls,
         * which we need to do for each object.
         */
        unique: true,

        build: function () {
            this._depthModeDraw = this.program.draw.getUniformLocation("XEO_uDepthMode");
            this._depthModePick = this.program.pick.getUniformLocation("XEO_uDepthMode");
        },

        drawAndPick: function (frameCtx) {
            var gl = this.program.gl;
            gl.uniform1i(frameCtx.pick ? this._depthModePick : this._depthModeDraw, frameCtx.depthMode);
            gl.drawElements(this.state.primitive, this.state.indexBuf.numItems, gl.UNSIGNED_SHORT, 0);
            //frameCtx.textureUnit = 0;
        }
    });

})();
