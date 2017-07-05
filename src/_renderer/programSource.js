(function () {

    "use strict";

    /**
     *  Source code for pick and draw shader programs, to be compiled into one or more {@link xeogl.renderer.Program}s
     *
     * @param {String} hash Hash code identifying the rendering capabilities of the programs
     * @param {String} vertexPickObject Vertex shader source for object picking.
     * @param {String} fragmentPickObject Fragment shader source for object picking.
     * @param {String} vertexPickPrimitive Vertex shader source for primitive picking.
     * @param {String} fragmentPickPrimitive Fragment shader source for primitive picking.
     * @param {String} vertexDraw Vertex shader source for drawing.
     * @param {String} fragmentDraw Fragment shader source for drawing.
     * @param {String} vertexShadow Vertex shader source for drawing the shadow buffer.
     * @param {String} fragmentShadow Fragment shader source for drawing the shadow buffer.
     * @param {String} vertexOutline Vertex shader source for drawing outlines.
     * @param {String} fragmentOutline Fragment shader source for drawing outlines.
     */
    xeogl.renderer.ProgramSource = function (hash,
                                             vertexPickObject, fragmentPickObject,
                                             vertexPickPrimitive, fragmentPickPrimitive,
                                             vertexDraw, fragmentDraw,
                                             vertexShadow, fragmentShadow,
                                             vertexOutline, fragmentOutline) {

        /**
         * Hash code identifying the capabilities of the {@link xeogl.renderer.Program} that is compiled from this source
         * @type String
         */
        this.hash = hash;

        /**
         * Vertex shader source for object picking
         * @type {Array of String]
         */
        this.vertexPickObject = vertexPickObject;

        /**
         * Fragment shader source for object picking.
         * @type {Array of String}
         */
        this.fragmentPickObject = fragmentPickObject;

        /**
         * Vertex shader source for primitive picking.
         * @type {Array of String]
         */
        this.vertexPickPrimitive = vertexPickPrimitive;

        /**
         * Fragment shader source for primitive picking.
         * @type {Array of String}
         */
        this.fragmentPickPrimitive = fragmentPickPrimitive;

        /**
         * Vertex shader source for drawing.
         * @type {Array of String}
         */
        this.vertexDraw = vertexDraw;

        /**
         * Fragment shader source for drawing.
         * @type {Array of String}
         */
        this.fragmentDraw = fragmentDraw;

        /**
         * Vertex shader source for rendering shadow buffer.
         * @type {Array of String}
         */
        this.vertexShadow = vertexShadow;

        /**
         * Fragment shader source for rendering shadow buffer.
         * @type {Array of String}
         */
        this.fragmentShadow = fragmentShadow;

        /**
         * Vertex shader source for rendering outlines.
         * @type {Array of String}
         */
        this.vertexOutline = vertexOutline;

        /**
         * Fragment shader source for rendering outlines.
         * @type {Array of String}
         */
        this.fragmentOutline = fragmentOutline;

        /**
         * Count of {@link xeogl.renderer.Program}s compiled from this program source code
         * @type Number
         */
        this.useCount = 0;
    };

})();

