(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "program",

        build: function () {
        },

        draw: function (frameCtx) {
            this.program.draw.bind();
            frameCtx.textureUnit = 0;
            frameCtx.useProgram++;
        },

        pickObject: function () {
            this.program.pickObject.bind();
        },

        pickPrimitive: function () {
            this.program.pickPrimitive.bind();
        }
    });
})();



