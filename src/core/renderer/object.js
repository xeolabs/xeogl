(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     * @class A draw list object within a {@link XEO.renderer.Renderer}
     */
    XEO.renderer.Object = function (id) {

        /**
         * ID for this objects, unique among all objects in the display
         * @type Number
         */
        this.id = id;

        /**
         * Hash code for this object, unique among all objects in the display
         * @type String
         */
        this.hash = null;

        /**
         * State sort key, computed from #layer, #program and #texture
         * @type Number
         */
        this.sortKey = null;

        /**
         * Sequence of state chunks applied to render this object
         * @type {[XEO.Chunk]} chunks
         */
        this.chunks = [];

        /**
         * Number of state chunks applied to render this object
         * @type Number
         */
        this.chunksLen = 0;

        /**
         * Shader programs that render this object, also used for (re)computing #sortKey
         * @type renderer.Program
         */
        this.program = null;

        /**
         * State for the XEO.Layer that this object was compiled from, used for (re)computing #sortKey and visibility cull
         */
        this.layer = null;

        /**
         * State for the XEO.Texture that this object was compiled from, used for (re)computing #sortKey
         */
        this.texture = null;

        /**
         * State for the XEO.Modes that this object was compiled from, used for visibility cull
         */
        this.modes = null;
    };

})();