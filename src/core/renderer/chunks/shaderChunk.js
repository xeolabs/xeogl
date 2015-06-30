(function () {

    "use strict";

    /**
     *
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "shader",

        build: function () {
        },

        drawAndPick: function (frameCtx) {

            var params = this.state.params;

            if (params) {

                var program = frameCtx.pick ? this.program.pick : this.program.draw;
                var name;

                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        program.setUniform(name, params[name]);
                    }
                }
            }
        }
    });

})();