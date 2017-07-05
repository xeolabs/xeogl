(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "modes",

        build: function () {
        },

        draw: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;

            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;

            if (frameCtx.frontface !== frontface) {

                // frontface is boolean for speed,
                // true == "ccw", false == "cw"

                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        },

        shadow: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {

                // frontface is boolean for speed,
                // true == "ccw", false == "cw"

                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        },

        pickObject: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {

                // frontface is boolean for speed,
                // true == "ccw", false == "cw"

                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        },

        pickPrimitive: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            var backfaces = state.backfaces;
            if (frameCtx.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frameCtx.backfaces = backfaces;
            }

            var frontface = state.frontface;
            if (frameCtx.frontface !== frontface) {

                // frontface is boolean for speed,
                // true == "ccw", false == "cw"

                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frameCtx.frontface = frontface;
            }
        }
    });
})();
