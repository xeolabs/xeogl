(function () {

    "use strict";

    /**
     * A vertex/fragment shader in a program
     *
     * @param gl WebGL gl
     * @param type gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
     * @param source Source code for shader
     */
    XEO.renderer.webgl.Shader = function (gl, type, source) {

        /**
         * True as soon as this shader is allocated and ready to go
         * @type {boolean}
         */
        this.allocated = false;

        this.handle = gl.createShader(type);

        if (!this.handle) {
            console.error("Failed to create WebGL shader");
            return;
        }

        gl.shaderSource(this.handle, source);
        gl.compileShader(this.handle);

        this.valid = (gl.getShaderParameter(this.handle, gl.COMPILE_STATUS) !== 0);

        if (!this.valid) {

            if (!gl.isContextLost()) { // Handled explicitly elsewhere, so won't re-handle here

                console.error("Shader program failed to compile: " + gl.getShaderInfoLog(this.handle));
                console.error("Shader source:");

                var lines = source.split('\n');

                for (var j = 0; j < lines.length; j++) {
                    console.error((j + 1) + ": " + lines[j]);
                }

                return;
            }
        }

        this.allocated = true;
    };

})();