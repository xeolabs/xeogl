/**
 * @author xeolabs / https://github.com/xeolabs
 */

/**
 * Wraps a WebGL Attribute in convenience methods/properties.
 */

xeogl.renderer.Attribute = function (gl, location) {
    this._gl = gl;
    this.location = location;
};

xeogl.renderer.Attribute.prototype.bindArrayBuffer = function (buffer, type) {
    if (!buffer) {
        return;
    }
    buffer.bind();
    this._gl.enableVertexAttribArray(this.location);
    this._gl.vertexAttribPointer(
        this.location,
        type === this._gl.BYTE ? 2 : buffer.itemSize,
        type || this._gl.FLOAT,
        type === this._gl.BYTE,
        0, 0);
};
