(function () {

    "use strict";

    /**
     * @class A chunk of WebGL state changes to render a {@link SceneJS_Core} for drawing and picking (if applicable to the state type).
     *
     * <p>Instances of this class are created and recycled by a {@link XEO.ChunkFactory}.</p>
     *
     * <p>Each {@link XEO.renderer.Object} has a list of chunks to render it's {@link SceneJS_Core}s</p>
     *
     * @private
     */
    XEO.Chunk = function () {
    };

    /**
     * Initialises the chunk. This is called within the constructor, and also to by the owner {@link XEO.ChunkFactory}
     * when recycling a chunk from its free chunk pool. This method sets the given properties on the chunk, then calls the
     * chunk instance's <b>build</b> method if the chunk has been augmented with one.
     *
     * @param {String} id Chunk ID
     * @param {XEO.renderer.Program} program Program to render the chunk
     * @param {SceneJS_Core} state The state core rendered by this chunk
     * @param {SceneJS_Core} core2 Another state core rendered by this chunk, only used for geometry
     */
    XEO.Chunk.prototype.init = function (id, program, state, core2) {

        this.id = id;
        this.program = program;
        this.state = state;
        this.core2 = core2;

        if (this.build) {
            this.build();
        }
    };

})();
