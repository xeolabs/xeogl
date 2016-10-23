(function () {

    "use strict";

    /**
     * An attribute within a {@link xeogl.renderer.webgl.Shader}
     */
    xeogl.renderer.webgl.Attribute = function (gl, location) {

        this.gl = gl;

        this.location = location;
    };

    xeogl.renderer.webgl.Attribute.prototype.bindFloatArrayBuffer = function (buffer) {

        if (buffer) {

            buffer.bind();

            this.gl.enableVertexAttribArray(this.location);

            // Vertices are not homogeneous - no w-element
            this.gl.vertexAttribPointer(this.location, buffer.itemSize, this.gl.FLOAT, false, 0, 0);
        }
    };

    xeogl.renderer.webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {

        this.gl.enableVertexAttribArray(this.location);

        // Vertices are not homogeneous - no w-element
        this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);
    };

})();