(function () {

    "use strict";

    XEO.renderer.webgl.Uniform = function (renderStats, gl, type, location) {

        var func = null;

        var value0 = null;
        var value1 = null;
        var value2 = null;
        var value3 = null;

        if (type === gl.BOOL) {

            func = function (v) {
                if (value0 === v) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v;
                gl.uniform1i(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.BOOL_VEC2) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                gl.uniform2iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.BOOL_VEC3) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                gl.uniform3iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.BOOL_VEC4) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2] && value3 === v[3]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                value3 = v[3];
                gl.uniform4iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.INT) {

            func = function (v) {
                if (value0 === v) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v;
                gl.uniform1iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.INT_VEC2) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                gl.uniform2iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.INT_VEC3) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                gl.uniform3iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.INT_VEC4) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2] && value3 === v[3]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                value3 = v[3];
                gl.uniform4iv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT) {

            func = function (v) {
                if (value0 === v) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v;
                gl.uniform1f(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_VEC2) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                gl.uniform2fv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_VEC3) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                gl.uniform3fv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_VEC4) {

            func = function (v) {
                if (value0 === v[0] && value1 === v[1] && value2 === v[2] && value3 === v[3]) {
                    renderStats.setUniformCacheHits++;
                    return;
                }
                value0 = v[0];
                value1 = v[1];
                value2 = v[2];
                value3 = v[3];
                gl.uniform4fv(location, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_MAT2) {

            func = function (v) {
                gl.uniformMatrix2fv(location, gl.FALSE, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_MAT3) {

            func = function (v) {
                gl.uniformMatrix3fv(location, gl.FALSE, v);
                renderStats.setUniform++;
            };

        } else if (type === gl.FLOAT_MAT4) {

            func = function (v) {
                gl.uniformMatrix4fv(location, gl.FALSE, v);
                renderStats.setUniform++;
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









