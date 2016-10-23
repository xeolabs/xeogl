(function () {

    "use strict";

    function joinSansComments(srcLines) {
        var src = [];
        var line;
        var n;
        for (var i = 0, len = srcLines.length; i < len; i++) {
            line = srcLines[i];
            n = line.indexOf("/");
            if (n > 0) {
                if (line.charAt(n + 1) === "/") {
                    line = line.substring(0, n);
                }
            }
            src.push(line);
        }
        return src.join("\n");
    }

    /**
     * Wrapper for a WebGL program
     *
     * @param stats Collects runtime statistics
     * @param gl WebGL gl
     * @param vertex Source code for vertex shader
     * @param fragment Source code for fragment shader
     */
    xeogl.renderer.webgl.Program = function (stats, gl, vertex, fragment) {

        this.stats = stats;

        this.gl = gl;

        /**
         * True when successfully allocated
         * @type {boolean}
         */
        this.allocated = false;

        /**
         * True when successfully compiled
         * @type {boolean}
         */
        this.compiled = false;

        /**
         * True when successfully linked
         * @type {boolean}
         */
        this.linked = false;

        /**
         * True when successfully validated
         * @type {boolean}
         */
        this.validated = false;

        /**
         * Contains error log on failure to allocate, compile, validate or link
         * @type {boolean}
         */
        this.errorLog = null;

        // Inputs for this program

        this.uniforms = {};
        this.samplers = {};
        this.attributes = {};

        // Shaders

        this._vertexShader = new xeogl.renderer.webgl.Shader(gl, gl.VERTEX_SHADER, joinSansComments(vertex));
        this._fragmentShader = new xeogl.renderer.webgl.Shader(gl, gl.FRAGMENT_SHADER, joinSansComments(fragment));

        if (!this._vertexShader.allocated) {
            this.errorLog = ["Vertex shader failed to allocate"].concat(this._vertexShader.errorLog);
            return;
        }

        if (!this._fragmentShader.allocated) {
            this.errorLog = ["Fragment shader failed to allocate"].concat(this._fragmentShader.errorLog);
            return;
        }

        this.allocated = true;

        if (!this._vertexShader.compiled) {
            this.errorLog = ["Vertex shader failed to compile"].concat(this._vertexShader.errorLog);
            return;
        }

        if (!this._fragmentShader.compiled) {
            this.errorLog = ["Fragment shader failed to compile"].concat(this._fragmentShader.errorLog);
            return;
        }

        this.compiled = true;


        var a;
        var i;
        var u;
        var uName;
        var location;

        // Program

        this.handle = gl.createProgram();

        if (!this.handle) {
            this.errorLog = ["Failed to allocate program"];
            return;
        }

        gl.attachShader(this.handle, this._vertexShader.handle);
        gl.attachShader(this.handle, this._fragmentShader.handle);

        gl.linkProgram(this.handle);

        this.linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);

        // HACK: Disable validation temporarily: https://github.com/xeolabs/xeogl/issues/5
        // Perhaps we should defer validation until render-time, when the program has values set for all inputs?

        //this.validated = this.linked ? gl.getProgramParameter(this.handle, gl.VALIDATE_STATUS) : false;
        this.validated = true;

        if (!this.linked || !this.validated) {

            this.errorLog = [];

            this.errorLog.push("");
            this.errorLog.push(gl.getProgramInfoLog(this.handle));

            this.errorLog.push("\nVertex shader:\n");
            this.errorLog = this.errorLog.concat(vertex);

            this.errorLog.push("\nFragment shader:\n");
            this.errorLog = this.errorLog.concat(fragment);

            return;
        }


        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);

        for (i = 0; i < numUniforms; ++i) {

            u = gl.getActiveUniform(this.handle, i);

            if (u) {

                uName = u.name;

                if (uName[uName.length - 1] === "\u0000") {
                    uName = uName.substr(0, uName.length - 1);
                }

                location = gl.getUniformLocation(this.handle, uName);

                if ((u.type === gl.SAMPLER_2D) || (u.type === gl.SAMPLER_CUBE) || (u.type === 35682)) {

                    this.samplers[uName] = new xeogl.renderer.webgl.Sampler(gl, location);

                } else {

                    this.uniforms[uName] = new xeogl.renderer.webgl.Uniform(stats.frame, gl, u.type, location);
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);

        for (i = 0; i < numAttribs; i++) {

            a = gl.getActiveAttrib(this.handle, i);

            if (a) {

                location = gl.getAttribLocation(this.handle, a.name);

                this.attributes[a.name] = new xeogl.renderer.webgl.Attribute(gl, location);
            }
        }

        this.allocated = true;
    };

    xeogl.renderer.webgl.Program.prototype.bind = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.useProgram(this.handle);
    };

    xeogl.renderer.webgl.Program.prototype.setUniform = function (name, value) {

        if (!this.allocated) {
            return;
        }

        var u = this.uniforms[name];

        if (u) {
            u.setValue(value);
        }
    };

    xeogl.renderer.webgl.Program.prototype.getUniform = function (name) {

        if (!this.allocated) {
            return;
        }

        return this.uniforms[name];
    };

    xeogl.renderer.webgl.Program.prototype.getAttribute = function (name) {

        if (!this.allocated) {
            return;
        }

        return this.attributes[name];
    };

    xeogl.renderer.webgl.Program.prototype.bindTexture = function (name, texture, unit) {

        if (!this.allocated) {
            return false;
        }

        var sampler = this.samplers[name];

        if (sampler) {
            return sampler.bindTexture(texture, unit);

        } else {
            return false;
        }
    };

    xeogl.renderer.webgl.Program.prototype.destroy = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.deleteProgram(this.handle);
        this.gl.deleteShader(this._vertexShader.handle);
        this.gl.deleteShader(this._fragmentShader.handle);

        this.handle = null;
        this.attributes = null;
        this.uniforms = null;
        this.samplers = null;

        this.allocated = false;
    };

})();
