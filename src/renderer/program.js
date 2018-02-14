/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.Program = function (gl, shaderSource) {

        this.id = ids.addItem({});
        this.gl = gl;

        this.allocated = false;
        this.compiled = false;
        this.linked = false;
        this.validated = false;
        this.errors = null;

        this.uniforms = {};
        this.samplers = {};
        this.attributes = {};

        this._vertexShader = new xeogl.renderer.Shader(gl, gl.VERTEX_SHADER, joinSansComments(shaderSource.vertex));
        this._fragmentShader = new xeogl.renderer.Shader(gl, gl.FRAGMENT_SHADER, joinSansComments(shaderSource.fragment));

        if (!this._vertexShader.allocated) {
            this.errors = ["Vertex shader failed to allocate"].concat(this._vertexShader.errors);
            return;
        }

        if (!this._fragmentShader.allocated) {
            this.errors = ["Fragment shader failed to allocate"].concat(this._fragmentShader.errors);
            return;
        }

        this.allocated = true;

        if (!this._vertexShader.compiled) {
            this.errors = ["Vertex shader failed to compile"].concat(this._vertexShader.errors);
            return;
        }

        if (!this._fragmentShader.compiled) {
            this.errors = ["Fragment shader failed to compile"].concat(this._fragmentShader.errors);
            return;
        }

        this.compiled = true;

        var a;
        var i;
        var u;
        var uName;
        var location;

        this.handle = gl.createProgram();

        if (!this.handle) {
            this.errors = ["Failed to allocate program"];
            return;
        }

        gl.attachShader(this.handle, this._vertexShader.handle);
        gl.attachShader(this.handle, this._fragmentShader.handle);
        gl.linkProgram(this.handle);

        this.linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);

        // HACK: Disable validation temporarily: https://github.com/xeolabs/xeogl/issues/5
        // Perhaps we should defer validation until render-time, when the program has values set for all inputs?
        this.validated = true;

        if (!this.linked || !this.validated) {
            this.errors = [];
            this.errors.push("");
            this.errors.push(gl.getProgramInfoLog(this.handle));
            this.errors.push("\nVertex shader:\n");
            this.errors = this.errors.concat(shaderSource.vertex);
            this.errors.push("\nFragment shader:\n");
            this.errors = this.errors.concat(shaderSource.fragment);
            return;
        }

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
                    this.samplers[uName] = new xeogl.renderer.Sampler(gl, location);
                } else {
                    this.uniforms[uName] = location;
                }
            }
        }

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this.attributes[a.name] = new xeogl.renderer.Attribute(gl, location);
            }
        }

        this.allocated = true;
    };

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

    xeogl.renderer.Program.prototype.bind = function () {
        if (!this.allocated) {
            return;
        }
        this.gl.useProgram(this.handle);
    };

    xeogl.renderer.Program.prototype.getLocation = function (name) {
        if (!this.allocated) {
            return;
        }
        return this.uniforms[name];
    };

    xeogl.renderer.Program.prototype.getAttribute = function (name) {
        if (!this.allocated) {
            return;
        }
        return this.attributes[name];
    };

    xeogl.renderer.Program.prototype.bindTexture = function (name, texture, unit) {
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

    xeogl.renderer.Program.prototype.destroy = function () {
        if (!this.allocated) {
            return;
        }
        ids.removeItem(this.id);
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
