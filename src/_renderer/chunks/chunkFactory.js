(function () {

    "use strict";

    /**
     *  Manages creation, reuse and destruction of {@link xeogl.renderer.Chunk}s.
     */
    xeogl.renderer.ChunkFactory = function () {
        this.types = xeogl.renderer.ChunkFactory.types;
    };

    /**
     * Sub-classes of {@link xeogl.renderer.Chunk} provided by this factory
     */
    xeogl.renderer.ChunkFactory.types = {};   // Supported chunk classes, installed by #createChunkType

    /**
     * Creates a chunk type.
     *
     * @param params Members to augment the chunk class prototype with
     * @param params.type Type name for the new chunk class
     * @param params.draw Method to render the chunk in draw render
     * @param params.pickObject
     * @param params.pickPrimitive
     */
    xeogl.renderer.ChunkFactory.createChunkType = function (params) {

        if (!params.type) {
            throw "'type' expected in params";
        }

        var supa = xeogl.renderer.Chunk;

        var chunkClass = function () { // Create the class
            this.useCount = 0;
            this.init.apply(this, arguments);
        };

        chunkClass.prototype = new supa();              // Inherit from base class
        chunkClass.prototype.constructor = chunkClass;

        xeogl._apply(params, chunkClass.prototype);   // Augment subclass

        xeogl.renderer.ChunkFactory.types[params.type] = {
            constructor: chunkClass,
            chunks: {},
            freeChunks: [],
            freeChunksLen: 0
        };

        return chunkClass;
    };

    /**
     * Gets a chunk from this factory.
     */
    xeogl.renderer.ChunkFactory.prototype.getChunk = function (id, type, program, state) {

        var chunkType = this.types[type];

        if (!chunkType) {
            throw "chunk type not supported: '" + type + "'";
        }

        var chunk = chunkType.chunks[id];

        if (chunk) {
            chunk.useCount++;
            return chunk;
        }

        // Try to recycle a free chunk

        if (chunkType.freeChunksLen > 0) {
            chunk = chunkType.freeChunks[--chunkType.freeChunksLen];
        }

        if (chunk) {

            // Reinitialise the free chunk

            chunk.init(id, program, state);

        } else {

            // No free chunk, create a new one

            chunk = new chunkType.constructor(id, program, state);
        }

        chunk.useCount = 1;

        chunkType.chunks[id] = chunk;

        return chunk;
    };

    /**
     * Releases a chunk back to this factory.
     *
     * @param {xeogl.renderer.Chunk} chunk Chunk to release
     */
    xeogl.renderer.ChunkFactory.prototype.putChunk = function (chunk) {

        if (chunk.useCount === 0) { // In case of excess puts
            return;
        }

        // Free the chunk if use count now zero

        if (--chunk.useCount <= 0) {

            var chunkType = this.types[chunk.type];

            delete chunkType.chunks[chunk.id];

            chunkType.freeChunks[chunkType.freeChunksLen++] = chunk;
        }
    };

    /**
     * Restores the chunks in this factory after a WebGL context recovery.
     */
    xeogl.renderer.ChunkFactory.prototype.webglRestored = function (gl) {

        var types = this.types;
        var chunkType;
        var chunks;
        var chunk;

        for (var type in types) {

            if (types.hasOwnProperty(type)) {

                chunkType = types[type];

                chunks = chunkType.chunks;

                for (var id in chunks) {

                    if (chunks.hasOwnProperty(id)) {

                        chunk = chunks[id];

                        if (chunk.build) {
                            chunk.build();
                        }
                    }
                }
            }
        }
    };

})();
