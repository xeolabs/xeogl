(function () {

    "use strict";

    /**
     *  Manages {@link XEO.renderer.ProgramState} instances.
     * @param stats Collects runtime statistics
     * @param cfg Configs
     */
    XEO.renderer.ProgramFactory = function (stats, cfg) {

        this.stats = stats;

        this._canvas = cfg.canvas;

        this._programStates = {};
    };


    /**
     * Get a program that fits the given set of states.
     * Reuses any free program in the pool that matches the given hash.
     */
    XEO.renderer.ProgramFactory.prototype.get = function (hash, states) {

        var programState = this._programStates[hash];

        if (!programState) {

            // No program exists for the states

            // Create it and map it to the hash

            var source = XEO.renderer.ProgramSourceFactory.getSource(hash, states);

            var program = new XEO.renderer.Program(this.stats, hash, source, this._canvas.gl);

            programState = new XEO.renderer.ProgramState({
                program: program,
                useCount: 0
            });

            this._programStates[hash] = programState;

            this.stats.memory.programs++;
        }

        programState.useCount++;

        return programState;
    };

    /**
     * Release a program back to the pool.
     */
    XEO.renderer.ProgramFactory.prototype.put = function (programState) {

        if (--programState.useCount <= 0) {

            var program = programState.program;

            program.draw.destroy();
            program.pickObject.destroy();
            program.pickPrimitive.destroy();

            XEO.renderer.ProgramSourceFactory.putSource(program.hash);

            delete this._programStates[program.hash];

            this.stats.memory.programs--;
        }
    };

    /**
     * Rebuild all programs in the pool after WebGL context was lost and restored.
     */
    XEO.renderer.ProgramFactory.prototype.webglRestored = function () {

        var gl = this._canvas.gl;

        for (var id in this._programStates) {
            if (this._programStates.hasOwnProperty(id)) {

                this._programStates[id].build(gl);
            }
        }
    };

    XEO.renderer.ProgramFactory.prototype.destroy = function () {
    };

})();
