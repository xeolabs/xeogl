(function () {

    "use strict";

    /**
     * @class Manages creation, reuse and destruction of {@link XEO.Chunk}s for the components within a single {@link XEO.Renderer}.
     */
    XEO.renderer.ChunkFactory = function () {
        this._chunks = {};
        this.chunkTypes = XEO.renderer.ChunkFactory.chunkTypes;
    };

    /**
     * Sub-classes of {@link XEO.Chunk} provided by this factory
     */
    XEO.renderer.ChunkFactory.chunkTypes = {};    // Supported chunk classes, installed by #createChunkType

    /**
     * Free pool of unused {@link XEO.Chunk} instances
     */
    XEO.renderer.ChunkFactory._freeChunks = {};    // Free chunk pool for each type

    /**
     * Creates a chunk class for instantiation by this factory
     *
     * @param params Members to augment the chunk class prototype with
     * @param params.type Type name for the new chunk class
     * @param params.draw Method to render the chunk in draw render
     * @param params.pick Method to render the chunk in pick render
     * @param params.drawAndPick Method to render the chunk in both draw and pick renders
     */
    XEO.renderer.ChunkFactory.createChunkType = function (params) {

        if (!params.type) {
            throw "'type' expected in params";
        }

        var supa = XEO.Chunk;

        var chunkClass = function () { // Create the class
            this.useCount = 0;
            this.init.apply(this, arguments);
        };

        chunkClass.prototype = new supa();              // Inherit from base class
        chunkClass.prototype.constructor = chunkClass;

        if (params.drawAndPick) {                       // Common method for draw and pick render
            params.draw = params.pick = params.drawAndPick;
        }

        XEO.renderer.ChunkFactory.chunkTypes[params.type] = chunkClass;

        XEO._apply(params, chunkClass.prototype);   // Augment subclass

        XEO.renderer.ChunkFactory._freeChunks[params.type] = { // Set up free chunk pool for this type
            chunks: [],
            chunksLen: 0
        };

        return chunkClass;
    };

    /**
     *
     */
    XEO.renderer.ChunkFactory.prototype.getChunk = function (chunkId, type, program, state, core2) {

        var chunkClass = XEO.renderer.ChunkFactory.chunkTypes[type]; // Check type supported

        if (!chunkClass) {
            throw "chunk type not supported: '" + type + "'";
        }

        var chunk = this._chunks[chunkId];  // Try to reference an existing chunk

        if (chunk) {
            chunk.useCount++;
            return chunk;
        }

        var freeChunks = XEO.renderer.ChunkFactory._freeChunks[type]; // Try to recycle a free chunk

        if (freeChunks.chunksLen > 0) {
            chunk = freeChunks.chunks[--freeChunks.chunksLen];
        }

        if (chunk) {    // Reinitialise the recycled chunk

            chunk.init(chunkId, program, state, core2);

        } else {        // Instantiate a fresh chunk

            chunk = new chunkClass(chunkId, program, state, core2); // Create new chunk

        }

        chunk.type = type;

        chunk.useCount = 1;

        this._chunks[chunkId] = chunk;

        return chunk;
    };

    /**
     * Releases a display state chunk back to this factory, destroying it if the chunk's use count is then zero.
     *
     * @param {XEO.Chunk} chunk Chunk to release
     */
    XEO.renderer.ChunkFactory.prototype.putChunk = function (chunk) {

        if (chunk.useCount === 0) {
            return; // In case of excess puts
        }

        if (--chunk.useCount <= 0) {    // Release shared state if use count now zero

            if (chunk.recycle) {
                chunk.recycle();
            }

            this._chunks[chunk.id] = null;

            var freeChunks = XEO.renderer.ChunkFactory._freeChunks[chunk.type];

            freeChunks.chunks[freeChunks.chunksLen++] = chunk;
        }
    };

    /**
     * Re-cache shader variable locations for each active chunk and reset VAOs if any
     */
    XEO.renderer.ChunkFactory.prototype.webglRestored = function () {

        var chunk;

        for (var chunkId in this._chunks) {

            if (this._chunks.hasOwnProperty(chunkId)) {

                chunk = this._chunks[chunkId]; // Re-cache chunk's shader variable locations

                if (chunk.build) {
                    chunk.build();
                }
            }
        }
    };

})();