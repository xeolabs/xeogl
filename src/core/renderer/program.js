(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     * @class Vertex and fragment shaders for pick and draw
     *
     * @param {Number} id ID unique among all programs in the owner {@link XEO.renderer.ProgramFactory}
     * @param {String} hash Hash code which uniquely identifies the capabilities of the program, computed from hashes on the {@link Scene_Core}s that the {@link XEO.renderer.ProgramSource} composed to render
     * @param {XEO.renderer.ProgramSource} source Sourcecode from which the the program is compiled in {@link #build}
     * @param {WebGLRenderingContext} gl WebGL context
     */
    XEO.renderer.Program = function (id, hash, source, gl) {

        /**
         * ID for this program, unique among all programs in the display
         * @type Number
         */
        this.id = id;

        /**
         * Hash code for this program's capabilities, same as the hash on {@link #source}
         * @type String
         */
        this.hash = source.hash;

        /**
         * Source code for this program's shaders
         * @type renderer.ProgramSource
         */
        this.source = source;

        /**
         * WebGL context on which this program's shaders are allocated
         * @type WebGLRenderingContext
         */
        this.gl = gl;

        /**
         * The drawing program
         * @type webgl.Program
         */
        this.draw = null;

        /**
         * The picking program
         * @type webgl.Program
         */
        this.pick = null;

        /**
         * The count of display objects using this program
         * @type Number
         */
        this.useCount = 0;

        this.build(gl);
    };

    /**
     *  Creates the render and pick programs.
     * This is also re-called to re-create them after WebGL context loss.
     */
    XEO.renderer.Program.prototype.build = function (gl) {

        this.gl = gl;

        this.draw = new XEO.renderer.webgl.Program(gl, this.source.drawVertex, this.source.drawFragment);
        this.pick = new XEO.renderer.webgl.Program(gl, this.source.pickVertex, this.source.pickFragment);
    };

})();
