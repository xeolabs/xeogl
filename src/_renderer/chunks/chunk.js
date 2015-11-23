(function () {

    "use strict";

    /**
     * A chunk of WebGL state changes to render a XEO.renderer.State.
     *
     * @private
     */
    XEO.renderer.Chunk = function () {
    };

    /**
     * Initialises the chunk.
     *
     * @param {Number} id Chunk ID
     * @param {XEO.renderer.Program} program Program to render this chunk
     * @param {XEO.renderer.State} state The state rendered by this chunk
     */
    XEO.renderer.Chunk.prototype.init = function (id, program, state) {

        this.id = id;

        this.program = program;

        this.state = state;

        this.useCount = 0;

        if (this.build) {
            this.build();
        }
    };

})();
