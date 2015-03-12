(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     * @class Manages {@link XEO.renderer.Program} instances.
     */
    XEO.renderer.ProgramFactory = function (cfg) {
        this._canvas = cfg.canvas;
        this._programs = {};
        this._nextProgramId = 0;
    };

    XEO.renderer.ProgramFactory.prototype = {

        getProgram: function (hash, states) {
            var program = this._programs[hash];
            if (!program) {
                var source = XEO.renderer.ProgramSourceFactory.getSource(hash, states);
                program = new XEO.renderer.Program(this._nextProgramId++, hash, source, this._canvas.gl);
                this._programs[hash] = program;
            }
            program.useCount++;
            return program;
        },

        putProgram: function (program) {
            if (--program.useCount <= 0) {
                program.draw.destroy();
                program.pick.destroy();
                XEO.renderer.ProgramSourceFactory.putSource(program.hash);
                this._programs[program.hash] = null;
            }
        },

        webglRestored: function () {
            var gl = this._canvas.gl;
            for (var id in this._programs) {
                if (this._programs.hasOwnProperty(id)) {
                    this._programs[id].build(gl);
                }
            }
        },

        destroy: function () {
        }
    };

})();
