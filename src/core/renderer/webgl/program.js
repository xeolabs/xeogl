(function () {

    "use strict";

    /**
     * Wrapper for a WebGL program
     *
     * @param gl WebGL gl
     * @param vertex Source code for vertex shader
     * @param fragment Source code for fragment shader
     */
    XEO.renderer.webgl.Program = function (gl, vertex, fragment) {

        /**
         * True as soon as this program is allocated and ready to go
         * @type {boolean}
         */
        this.allocated = false;

        this.gl = gl;

        // Inputs for this program

        this.uniforms = {};
        this.samplers = {};
        this.attributes = {};

        // Shaders

        this._vertexShader = new XEO.renderer.webgl.Shader(gl, gl.VERTEX_SHADER, vertex);

        this._fragmentShader = new XEO.renderer.webgl.Shader(gl, gl.FRAGMENT_SHADER, fragment);

        var a, i, u, u_name, location, shader;

        // Program

        this.handle = gl.createProgram();

        if (this.handle) {

            if (this._vertexShader.valid) {
                gl.attachShader(this.handle, this._vertexShader.handle);
            }

            if (this._fragmentShader.valid) {
                gl.attachShader(this.handle, this._fragmentShader.handle);
            }

            gl.linkProgram(this.handle);

            console.error("vertex");
            console.error(gl.getShaderInfoLog(this._vertexShader.handle));
            console.error("fragment");
            console.error(gl.getShaderInfoLog(this._fragmentShader.handle));

            // Discover uniforms and samplers

            var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
            var valueIndex = 0;

            for (i = 0; i < numUniforms; ++i) {

                u = gl.getActiveUniform(this.handle, i);

                if (u) {

                    u_name = u.name;

                    if (u_name[u_name.length - 1] === "\u0000") {
                        u_name = u_name.substr(0, u_name.length - 1);
                    }

                    location = gl.getUniformLocation(this.handle, u_name);

                    if ((u.type === gl.SAMPLER_2D) || (u.type === gl.SAMPLER_CUBE) || (u.type === 35682)) {

                        this.samplers[u_name] = new XEO.renderer.webgl.Sampler(gl, location);

                    } else {

                        this.uniforms[u_name] = new XEO.renderer.webgl.Uniform(gl, u.type, location);
                    }
                }
            }

            // Discover attributes

            var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);

            for (i = 0; i < numAttribs; i++) {

                a = gl.getActiveAttrib(this.handle, i);

                if (a) {

                    location = gl.getAttribLocation(this.handle, a.name);

                    this.attributes[a.name] = new XEO.renderer.webgl.Attribute(gl, location);
                }
            }

            this.allocated = true;
        }
    };

    XEO.renderer.webgl.Program.prototype.bind = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.useProgram(this.handle);
    };

    XEO.renderer.webgl.Program.prototype.setUniform = function (name, value) {

        if (!this.allocated) {
            return;
        }

        var u = this.uniforms[name];

        if (u) {
            u.setValue(value);
        }
    };

    XEO.renderer.webgl.Program.prototype.getUniform = function (name) {

        if (!this.allocated) {
            return;
        }

        return this.uniforms[name];
    };

    XEO.renderer.webgl.Program.prototype.getAttribute = function (name) {

        if (!this.allocated) {
            return;
        }

        return this.attributes[name];
    };

    XEO.renderer.webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {

        if (!this.allocated) {
            return;
        }

        return this.attributes[name];
    };

    XEO.renderer.webgl.Program.prototype.bindTexture = function (name, texture, unit) {

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

    XEO.renderer.webgl.Program.prototype.destroy = function () {

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
