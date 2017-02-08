(function () {

    "use strict";

    /**
     * A vertex/fragment shader in a program
     *
     * @param gl WebGL gl
     * @param type gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
     * @param source Source code for shader
     */
    xeogl.renderer.webgl.Shader = function (gl, type, source) {

        /**
         * True if this shader successfully allocated. When false,
         * #error will contain WebGL the error log.
         * @type {boolean}
         */
        this.allocated = false;

        /**
         * True if this shader successfully compiled. When false,
         * #error will contain WebGL the error log.
         * @type {boolean}
         */
        this.compiled = false;

        /**
         * Saves the WebGL error log when this shader failed to allocate or compile.
         * @type {boolean}
         */
        this.errorLog = null;

        /**
         * The GLSL for this shader.
         * @type {Array of String}
         */
        this.source = source;

        /**
         * WebGL handle to this shader's GPU resource
         */
        this.handle = gl.createShader(type);

        if (!this.handle) {
            this.errorLog = [
                "Failed to allocate"
            ];
            return;
        }

        this.allocated = true;

        gl.shaderSource(this.handle, source);
        gl.compileShader(this.handle);

        this.compiled = gl.getShaderParameter(this.handle, gl.COMPILE_STATUS);

        if (!this.compiled) {

            if (!gl.isContextLost()) { // Handled explicitly elsewhere, so won't re-handle here

                var lines = this.source.split("\n");
                var numberedLines = [];
                for (var i = 0; i < lines.length; i++) {
                    numberedLines.push((i + 1) + ": " + lines[i] + "\n");
                }

                this.errorLog = [];
                this.errorLog.push("");
                this.errorLog.push(gl.getShaderInfoLog(this.handle));
                this.errorLog = this.errorLog.concat(numberedLines.join(""));
            }
        }
    };

})();