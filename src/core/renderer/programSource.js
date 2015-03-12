(function () {

    "use strict";

    /**
     * @class Source code for pick and draw shader programs, to be compiled into one or more {@link XEO.renderer.Program}s
     *
     * @param {String} hash Hash code identifying the rendering capabilities of the programs
     * @param {String} pickVertex Source code of the pick vertex shader
     * @param {String} pickFragment Source code of the pick fragment shader
     * @param {String} drawVertex Source code of the draw vertex shader
     * @param {String} drawFragment Source code of the draw fragment shader
     */
    XEO.renderer.ProgramSource = function (hash, pickVertex, pickFragment, drawVertex, drawFragment) {

        /**
         * Hash code identifying the capabilities of the {@link XEO.renderer.Program} that is compiled from this source
         * @type String
         */
        this.hash = hash;

        /**
         * Source code for pick vertex shader
         * @type String
         */
        this.pickVertex = pickVertex;

        /**
         * Source code for pick fragment shader
         * @type String
         */
        this.pickFragment = pickFragment;

        /**
         * Source code for draw vertex shader
         * @type String
         */
        this.drawVertex = drawVertex;

        /**
         * Source code for draw fragment shader
         * @type String
         */
        this.drawFragment = drawFragment;

        /**
         * Count of {@link XEO.renderer.Program}s compiled from this program source code
         * @type Number
         */
        this.useCount = 0;
    };

})();

