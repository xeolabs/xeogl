(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "shaderParams",

        draw: function () {

            var params = this.state.params;

            if (params) {

                var program = this.program.draw;
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