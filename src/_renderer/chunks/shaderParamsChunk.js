(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "shaderParams",

        draw: function () {

            var uniforms = this.state.uniforms;

            if (uniforms) {

                var program = this.program.draw;
                var name;

                for (name in uniforms) {
                    if (uniforms.hasOwnProperty(name)) {
                        program.setUniform(name, uniforms[name]);
                    }
                }
            }
        }
    });

})();