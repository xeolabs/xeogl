/**
 *
 */
XEO.ChunkFactory.createChunkType({

    type: "renderer",

    build: function () {
    },

    drawAndPick: function (frameCtx) {

        if (this.core.props) {
            var gl = this.program.gl;
            if (frameCtx.renderer) {
                frameCtx.renderer.props.restoreProps(gl);
                frameCtx.renderer = this.core;
            }
            this.core.props.setProps(gl);
        }
    }
});
