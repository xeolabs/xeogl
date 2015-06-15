(function () {

    "use strict";

    /**
     * @class Manages {@link XEO.renderer.Program} instances.
     */
    XEO.renderer.ProgramFactory = function (cfg) {

        this._canvas = cfg.canvas;

        this._programs = {};

        this._nextProgramId = 0;
    };


    /**
     * Get a program that fits the given set of states.
     * Reuses any free program in the pool that matches the given hash.
     */
    XEO.renderer.ProgramFactory.prototype.get = function (hash, states) {

        var program = this._programs[hash];

        if (!program) {

            // No program exists for the states

            // Create it and map it to the hash

            var source = XEO.renderer.ProgramSourceFactory.getSource(hash, states);

            program = new XEO.renderer.Program(this._nextProgramId++, hash, source, this._canvas.gl);

            this._programs[hash] = program;
        }

        program.useCount++;

        return program;
    };

    /**
     * Release a program back to the pool.
     */
    XEO.renderer.ProgramFactory.prototype.put = function (program) {

        if (--program.useCount <= 0) {

            program.draw.destroy();
            program.pick.destroy();

            XEO.renderer.ProgramSourceFactory.putSource(program.hash);

            this._programs[program.hash] = null;
        }
    };

    /**
     * Rebuild all programs in the pool after WebGL context was lost and restored.
     */
    XEO.renderer.ProgramFactory.prototype.webglRestored = function () {

        var gl = this._canvas.gl;

        for (var id in this._programs) {
            if (this._programs.hasOwnProperty(id)) {

                this._programs[id].build(gl);
            }
        }
    };

    XEO.renderer.ProgramFactory.prototype.destroy = function () {
    };

})();
