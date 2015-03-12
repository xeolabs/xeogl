(function () {

    "use strict";

    /** An attribute within a {@link XEO.webgl.Shader}
     */
    XEO.webgl.Attribute = function (gl, program, name, type, size, location) {

        this.gl = gl;
        this.location = location;

        this.bindFloatArrayBuffer = function (buffer) {
            if (buffer) {
                buffer.bind();
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
            }
        };
    };

    XEO.webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {
        this.gl.enableVertexAttribArray(this.location);
        this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);   // Vertices are not homogeneous - no w-element
    };

})();