(function () {

    "use strict";

    /**
     * @class Manages creation, reuse and destruction of {@link XEO.renderer.Chunk}s.
     */
    XEO.renderer.ChunkFactory = function () {

        this._chunks = {};
        this._chunkIDs = new XEO.utils.Map();

        this.chunkTypes = XEO.renderer.ChunkFactory.chunkTypes;
    };

    /**
     * Sub-classes of {@link XEO.renderer.Chunk} provided by this factory
     */
    XEO.renderer.ChunkFactory.chunkTypes = {};    // Supported chunk classes, installed by #createChunkType

    // Free pool of unused XEO.renderer.Chunk instances
    XEO.renderer.ChunkFactory._freeChunks = {};    // Free chunk pool for each type

    /**
     * Creates a chunk type.
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

        var supa = XEO.renderer.Chunk;

        var chunkClass = function () { // Create the class

            this.useCount = 0;

            this.init.apply(this, arguments);
        };

        chunkClass.prototype = new supa();              // Inherit from base class
        chunkClass.prototype.constructor = chunkClass;

        if (params.drawAndPick) {                       // Common method for draw and pick render
            params.draw = params.pick = params.drawAndPick;
        }

        XEO._apply(params, chunkClass.prototype);   // Augment subclass

        XEO.renderer.ChunkFactory.chunkTypes[params.type] = chunkClass;

        XEO.renderer.ChunkFactory._freeChunks[params.type] = { // Set up free chunk pool for this type
            chunks: [],
            chunksLen: 0
        };

        return chunkClass;
    };

    /**
     * Gets a chunk from this factory.
     */
    XEO.renderer.ChunkFactory.prototype.getChunk = function (type, object, program, state) {

        var chunkClass = XEO.renderer.ChunkFactory.chunkTypes[type]; // Check type supported

        if (!chunkClass) {
            throw "chunk type not supported: '" + type + "'";
        }

        // Unique ID for our chunk

        var id = this._chunkIDs.addItem();

        // Try to recycle a free chunk

        var freeChunks = XEO.renderer.ChunkFactory._freeChunks[type];

        var chunk;

        if (freeChunks.chunksLen > 0) {
            chunk = freeChunks.chunks[--freeChunks.chunksLen];
        }

        if (chunk) {

            // Reinitialise the free chunk

            chunk.init(id, object, program, state);

        } else {

            // No free chunk, create a new one

            chunk = new chunkClass(id, object, program, state);
        }

        chunk.useCount = 1;

        this._chunks[id] = chunk;

        return chunk;
    };

    /**
     * Releases a chunk back to this factory.
     *
     * @param {XEO.renderer.Chunk} chunk Chunk to release
     */
    XEO.renderer.ChunkFactory.prototype.putChunk = function (chunk) {

        if (chunk.useCount === 0) { // In case of excess puts
            return;
        }

        // Free the chunk if use count now zero

        if (--chunk.useCount <= 0) {

          this._chunkIDs.removeItem(chunk.id);

            delete this._chunks[chunk.id];

            var freeChunks = XEO.renderer.ChunkFactory._freeChunks[chunk.type];

            freeChunks.chunks[freeChunks.chunksLen++] = chunk;
        }
    };

    /**
     * Restores the chunks in this factory after a WebGL context recovery.
     */
    XEO.renderer.ChunkFactory.prototype.webglRestored = function () {

        var chunk;

        for (var id in this._chunks) {

            if (this._chunks.hasOwnProperty(id)) {

                chunk = this._chunks[id];

                if (chunk.build) {
                    chunk.build();
                }
            }
        }
    };

})();
