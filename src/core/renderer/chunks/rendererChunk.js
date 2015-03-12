(function () {

    "use strict";

    /**
     *
     */
    XEO.ChunkFactory.createChunkType({

        type: "renderer",

        build: function () {
        },

        drawAndPick: function (frameCtx) {

            if (this.state.props) {
                var gl = this.program.gl;
                if (frameCtx.renderer) {
                    frameCtx.renderer.props.restoreProps(gl);
                    frameCtx.renderer = this.state;
                }
                this.state.props.setProps(gl);
            }
        }
    });

})();
