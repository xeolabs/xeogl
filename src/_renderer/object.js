(function () {

    "use strict";

    /**
     * An object within a XEO.renderer.Renderer
     */
    XEO.renderer.Object = function (id) {

        /**
         * ID for this object, unique among all objects in the Renderer
         */
        this.id = id;

        /**
         * Hash code for this object, unique among all objects in the Renderer
         */
        this.hash = null;

        /**
         * State sort key, computed from #layer, #program and #material
         * @type Number
         */
        this.sortKey = null;

        /**
         * Sequence of state chunks applied to render this object
         */
        this.chunks = [];

        /**
         * Shader programs that render this object, also used for (re)computing #sortKey
         */
        this.program = null;

        /**
         * State for the XEO.renderer.Stage that this object was compiled from, used for (re)computing #sortKey and visibility cull
         */
        this.stage = null;

        /**
         * State for the XEO.renderer.Modes that this object was compiled from, used for visibility cull
         */
        this.modes = null;

        /**
         * State for the XEO.renderer.Layer that this object was compiled from, used for (re)computing #sortKey and visibility cull
         */
        this.layer = null;

        /**
         * State for the XEO.renderer.Material that this object was compiled from, used for (re)computing #sortKey
         */
        this.material = null;

        /**
         * True once the object has been compiled within the renderer display list.
         */
        this.compiled = false;
    };
})();