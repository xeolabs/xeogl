/**
 * @author xeolabs / https://github.com/xeolabs
 */

class Attribute {

    constructor(gl, location) {
        this._gl = gl;
        this.location = location;
    }

    bindArrayBuffer(buffer, type, normalized, stride, offset) {
        if (!buffer) {
            return;
        }
        buffer.bind();
        this._gl.enableVertexAttribArray(this.location);
        this._gl.vertexAttribPointer(this.location, type === this._gl.BYTE ? 2 : buffer.itemSize, type || this._gl.FLOAT, normalized,  stride || 0, offset || 0);
    }
}

export {Attribute};
