(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "program",

        build: function () {
        },

        shadow: function (frameCtx) {
            this.program.shadow.bind();
            frameCtx.useProgram++;
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;

            draw.bind();

            frameCtx.useProgram++;
            frameCtx.textureUnit = 0;
        },

        pickObject: function () {
            this.program.pickObject.bind();
        },

        pickPrimitive: function () {
            this.program.pickPrimitive.bind();
        }
    });
})();



