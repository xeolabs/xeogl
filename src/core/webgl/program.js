/**
 * Wrapper for a WebGL program
 *
 * @param gl WebGL gl
 * @param vertex Source code for vertex shader
 * @param fragment Source code for fragment shader
 */
XEO.webgl.Program = function (gl, vertex, fragment) {

    /**
     * True as soon as this program is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;

    this._uniforms = {};
    this._samplers = {};
    this._attributes = {};

    this.uniformValues = [];

    this.materialSettings = {
        specularColor: [0, 0, 0],

        specular: 0,
        shininess: 0,
        emit: 0,
        alpha: 0
    };

    this._vertexShader = new XEO.webgl.Shader(gl, gl.VERTEX_SHADER, vertex);

    this._fragmentShader = new XEO.webgl.Shader(gl, gl.FRAGMENT_SHADER, fragment);

    var a, i, u, u_name, location, shader;

    // Create program, attach shaders, link and validate program

    this.handle = gl.createProgram();

    if (this.handle) {

        if (this._vertexShader.valid) {
            gl.attachShader(this.handle, this._vertexShader.handle);
        }

        if (this._fragmentShader.valid) {
            gl.attachShader(this.handle, this._fragmentShader.handle);
        }

        gl.linkProgram(this.handle);

        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        var valueIndex = 0;
        for (i = 0; i < numUniforms; ++i) {
            u = gl.getActiveUniform(this.handle, i);
            if (u) {
                u_name = u.name;
                if (u_name[u_name.length - 1] == "\u0000") {
                    u_name = u_name.substr(0, u_name.length - 1);
                }
                location = gl.getUniformLocation(this.handle, u_name);
                if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {
                    this._samplers[u_name] = new XEO.webgl.Sampler(gl, this.handle, u_name, u.type, u.size, location);
                } else {
                    this._uniforms[u_name] = new XEO.webgl.Uniform(gl, this.handle, u_name, u.type, u.size, location, valueIndex);
                    this.uniformValues[valueIndex] = null;
                    ++valueIndex;
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this._attributes[a.name] = new XEO.webgl.Attribute(gl, this.handle, a.name, a.type, a.size, location);
            }
        }

        // Program allocated
        this.allocated = true;
    }
};

XEO.webgl.Program.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.useProgram(this.handle);
};

XEO.webgl.Program.prototype.getUniformLocation = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u.getLocation();
    }
};

XEO.webgl.Program.prototype.getUniform = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u;
    }
};

XEO.webgl.Program.prototype.getAttribute = function (name) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        return attr;
    }
};

XEO.webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        attr.bindFloatArrayBuffer(buffer);
    }
};

XEO.webgl.Program.prototype.bindTexture = function (name, texture, unit) {
    if (!this.allocated) {
        return false;
    }
    var sampler = this._samplers[name];
    if (sampler) {
        return sampler.bindTexture(texture, unit);
    } else {
        return false;
    }
};

XEO.webgl.Program.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteProgram(this.handle);
    this.gl.deleteShader(this._vertexShader.handle);
    this.gl.deleteShader(this._fragmentShader.handle);
    this.handle = null;
    this._attributes = null;
    this._uniforms = null;
    this._samplers = null;
    this.allocated = false;
};


XEO.webgl.Program.prototype.setUniform = function (name, value) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        if (this.uniformValues[u.index] !== value || !u.numberValue) {
            u.setValue(value);
            this.uniformValues[u.index] = value;
        }
    }
};
