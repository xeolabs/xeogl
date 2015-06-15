(function () {

    "use strict";

    /**
     * An attribute within a {@link XEO.renderer.webgl.Shader}
     */
    XEO.renderer.webgl.Attribute = function (gl, location) {

        this.gl = gl;

        this.location = location;
    };

    XEO.renderer.webgl.Attribute.prototype.bindFloatArrayBuffer = function (buffer) {

        if (buffer) {

            buffer.bind();

            gl.enableVertexAttribArray(this.location);

            // Vertices are not homogeneous - no w-element
            gl.vertexAttribPointer(this.location, buffer.itemSize, gl.FLOAT, false, 0, 0);
        }
    };

    XEO.renderer.webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {

        this.gl.enableVertexAttribArray(this.location);

        // Vertices are not homogeneous - no w-element
        this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);
    };

})();