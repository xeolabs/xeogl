(function () {

    "use strict";

    XEO.renderer.webgl.Uniform = function (gl, type, location) {

        var func = null;

        var value = null;

        if (type === gl.BOOL) {

            func = function (v) {
                if (value === v) {
                    return;
                }
                value = v;
                gl.uniform1i(location, v);
            };

        } else if (type === gl.BOOL_VEC2) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value = v;
                gl.uniform2iv(location, v);
            };

        } else if (type === gl.BOOL_VEC3) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value = v;
                gl.uniform3iv(location, v);
            };

        } else if (type === gl.BOOL_VEC4) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value = v;
                gl.uniform4iv(location, v);
            };

        } else if (type === gl.INT) {

            func = function (v) {
                if (value === v) {
                    return;
                }
                value = v;
                gl.uniform1iv(location, v);
            };

        } else if (type === gl.INT_VEC2) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value = v;
                gl.uniform2iv(location, v);
            };

        } else if (type === gl.INT_VEC3) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value = v;
                gl.uniform3iv(location, v);
            };

        } else if (type === gl.INT_VEC4) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value = v;
                gl.uniform4iv(location, v);
            };

        } else if (type === gl.FLOAT) {

            func = function (v) {
                if (value === v) {
                    return;
                }
                value = v;
                gl.uniform1f(location, v);
            };

        } else if (type === gl.FLOAT_VEC2) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value = v;
                gl.uniform2fv(location, v);
            };

        } else if (type === gl.FLOAT_VEC3) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value = v;
                gl.uniform3fv(location, v);
            };

        } else if (type === gl.FLOAT_VEC4) {

            func = function (v) {
                if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value = v;
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

        this.getLocation = function () {
            return location;
        };
    };

})();









