(function () {

    "use strict";

    XEO.renderer.webgl.Uniform = function (renderStats, gl, type, location) {

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
            value = new Array(2);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value[0] = v[0];
                value[1] = v[1];
                gl.uniform2iv(location, v);
            };

        } else if (type === gl.BOOL_VEC3) {
            value = new Array(3);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value[0] = v[0];
                value[1] = v[1];
                value[2] = v[2];
                gl.uniform3iv(location, v);
            };

        } else if (type === gl.BOOL_VEC4) {
            value = new Array(4);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value[0] = v[0];
                value[1] = v[1];
                value[2] = v[2];
                value[3] = v[3];
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
            value = new Uint32Array(2);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value.set(v);
                gl.uniform2iv(location, v);
            };

        } else if (type === gl.INT_VEC3) {
            value = new Uint32Array(3);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value.set(v);
                gl.uniform3iv(location, v);
            };

        } else if (type === gl.INT_VEC4) {
            value = new Uint32Array(4);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value.set(v);
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
            value = new Float32Array(2);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1]) {
                    return;
                }
                value.set(v);
                gl.uniform2fv(location, v);
            };

        } else if (type === gl.FLOAT_VEC3) {
            value = new Float32Array(3);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                    return;
                }
                value.set(v);
                gl.uniform3fv(location, v);
            };

        } else if (type === gl.FLOAT_VEC4) {
            value = new Float32Array(4);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value.set(v);
                gl.uniform4fv(location, v);
            };

        } else if (type === gl.FLOAT_MAT2) {
            value = new Float32Array(4);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] &&
                    value[2] === v[2] && value[3] === v[3]) {
                    return;
                }
                value.set(v);
                gl.uniformMatrix2fv(location, gl.FALSE, v);
            };

        } else if (type === gl.FLOAT_MAT3) {
            value = new Float32Array(9);

            func = function (v) {
                if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] &&
                    value[3] === v[3] && value[4] === v[4] && value[5] === v[5] &&
                    value[6] === v[6] && value[7] === v[7] && value[8] === v[8]) {
                    return;
                }
                value.set(v);
                gl.uniformMatrix3fv(location, gl.FALSE, v);
            };

        } else if (type === gl.FLOAT_MAT4) {
            value = new Float32Array(16);

            func = function (v) {
                if (value[0] === v[0]   && value[1] === v[1]   && value[2] === v[2]   && value[3] === v[3]   &&
                    value[4] === v[4]   && value[5] === v[5]   && value[6] === v[6]   && value[7] === v[7]   &&
                    value[8] === v[8]   && value[9] === v[9]   && value[10] === v[10] && value[11] === v[11] &&
                    value[12] === v[12] && value[13] === v[13] && value[14] === v[14] && value[15] === v[15]) {
                    return;
                }
                value.set(v);
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









