(function () {

    "use strict";

    XEO.webgl.Uniform = function (gl, program, name, type, size, location, index, logging) {

        var func = null;

        this.numberValue = false;

        if (type === gl.BOOL) {
            this.numberValue = true;
            func = function (v) {
                gl.uniform1i(location, v);
            };
        } else if (type === gl.BOOL_VEC2) {
            func = function (v) {
                gl.uniform2iv(location, v);
            };
        } else if (type === gl.BOOL_VEC3) {
            func = function (v) {
                gl.uniform3iv(location, v);
            };
        } else if (type === gl.BOOL_VEC4) {
            func = function (v) {
                gl.uniform4iv(location, v);
            };
        } else if (type === gl.INT) {
            this.numberValue = true;
            func = function (v) {
                gl.uniform1iv(location, v);
            };
        } else if (type === gl.INT_VEC2) {
            func = function (v) {
                gl.uniform2iv(location, v);
            };
        } else if (type === gl.INT_VEC3) {
            func = function (v) {
                gl.uniform3iv(location, v);
            };
        } else if (type === gl.INT_VEC4) {
            func = function (v) {
                gl.uniform4iv(location, v);
            };
        } else if (type === gl.FLOAT) {
            this.numberValue = true;
            func = function (v) {
                gl.uniform1f(location, v);
            };
        } else if (type === gl.FLOAT_VEC2) {
            func = function (v) {
                gl.uniform2fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC3) {
            func = function (v) {
                gl.uniform3fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC4) {
            func = function (v) {
                gl.uniform4fv(location, v);
            };
        } else if (type === gl.FLOAT_MAT2) {
            func = function (v) {
                gl.uniformMatrix2fv(location, gl.FALSE, v);
            };
        } else if (type === gl.FLOAT_MAT3) {
            func = function (v) {
                gl.uniformMatrix3fv(location, gl.FALSE, v);
            };
        } else if (type === gl.FLOAT_MAT4) {
            func = function (v) {
                gl.uniformMatrix4fv(location, gl.FALSE, v);
            };
        } else {
            throw "Unsupported shader uniform type: " + type;
        }

        this.setValue = func;


        this.getValue = function () {
            return gl.getUniform(program, location);
        };

        this.getLocation = function () {
            return location;
        };

        // This is just an integer key for caching the uniform's value, more efficient than caching by name.
        this.index = index;
    };

})();









