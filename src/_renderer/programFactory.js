(function () {

    "use strict";

    /**
     *  Manages {@link xeogl.renderer.ProgramState} instances.
     * @param stats Collects runtime statistics
     * @param gl WebGL context
     */
    xeogl.renderer.ProgramFactory = function (stats, gl) {

        this.stats = stats;

        this._gl = gl;

        this._programStates = {};
    };


    /**
     * Get a program that fits the given set of states.
     * Reuses any free program in the pool that matches the given hash.
     */
    xeogl.renderer.ProgramFactory.prototype.get = function (hash, states) {

        var programState = this._programStates[hash];

        if (!programState) {

            // No program exists for the states

            // Create it and map it to the hash

            var source = xeogl.renderer.ProgramSourceFactory.getSource(hash, states);

            var program = new xeogl.renderer.Program(this.stats, hash, source, this._gl);

            programState = new xeogl.renderer.ProgramState({
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
    xeogl.renderer.ProgramFactory.prototype.put = function (programState) {

        if (--programState.useCount <= 0) {

            var program = programState.program;

            program.draw.destroy();
            program.pickObject.destroy();
            program.pickPrimitive.destroy();

            xeogl.renderer.ProgramSourceFactory.putSource(program.hash);

            delete this._programStates[program.hash];

            this.stats.memory.programs--;
        }
    };

    /**
     * Rebuild all programs in the pool after WebGL context was lost and restored.
     */
    xeogl.renderer.ProgramFactory.prototype.webglRestored = function (gl) {

        this._gl = gl;

        for (var id in this._programStates) {
            if (this._programStates.hasOwnProperty(id)) {

                this._programStates[id].build(gl);
            }
        }
    };

    xeogl.renderer.ProgramFactory.prototype.destroy = function () {
    };

})();
