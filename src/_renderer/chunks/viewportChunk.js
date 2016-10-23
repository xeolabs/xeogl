(function () {

    "use strict";

    /**
     *
     */
    xeogl.renderer.ChunkFactory.createChunkType({

        type: "viewport",

        // Avoid re-application of this chunk after a program switch.

        programGlobal: true,

        draw: function () {
            var boundary = this.state.boundary;
            this.program.gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        },

        pickObject: function () {
            var boundary = this.state.boundary;
            this.program.gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        },

        pickPrimitive: function () {
            var boundary = this.state.boundary;
            this.program.gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        }
    });

})();
