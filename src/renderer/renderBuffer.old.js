/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer.RenderBuffer = function (canvas, gl, options) {

    options = options || {};

    this.gl = gl;
    this.allocated = false;
    this.canvas = canvas;
    this.buffer = null;
    this.bound = false;
    this.size = options.size;
};

xeogl.renderer.RenderBuffer.prototype.setSize = function (size) {
    this.size = size;
};

xeogl.renderer.RenderBuffer.prototype.webglRestored = function (gl) {
    this.gl = gl;
    this.buffer = null;
    this.allocated = false;
    this.bound = false;
};

xeogl.renderer.RenderBuffer.prototype.bind = function () {
    this._touch();
    if (this.bound) {
        return;
    }
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer.framebuf);
    this.bound = true;
};

xeogl.renderer.RenderBuffer.prototype._touch = function () {

    var width;
    var height;
    var gl = this.gl;

    if (this.size) {
        width = this.size[0];
        height = this.size[1];

    } else {
        width = this.canvas.clientWidth;
        height = this.canvas.clientHeight;
    }

    if (this.buffer) {

        if (this.buffer.width === width && this.buffer.height === height) {
            return;

        } else {
            gl.deleteTexture(this.buffer.texture);
            gl.deleteFramebuffer(this.buffer.framebuf);
            gl.deleteRenderbuffer(this.buffer.renderbuf);
        }
    }

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_AX_FILTER, gl.NEAREST);

    var renderbuf = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuf);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    var framebuf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuf);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Verify framebuffer is OK

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    if (!gl.isFramebuffer(framebuf)) {
        throw "Invalid framebuffer";
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    switch (status) {

        case gl.FRAMEBUFFER_COMPLETE:
            break;

        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT";

        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";

        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS";

        case gl.FRAMEBUFFER_UNSUPPORTED:
            throw "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED";

        default:
            throw "Incomplete framebuffer: " + status;
    }

    this.buffer = {
        framebuf: framebuf,
        renderbuf: renderbuf,
        texture: texture,
        width: width,
        height: height
    };

    this.bound = false;
};

xeogl.renderer.RenderBuffer.prototype.clear = function () {
    if (!this.bound) {
        throw "Render buffer not bound";
    }
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

xeogl.renderer.RenderBuffer.prototype.read = function (pickX, pickY) {
    var x = pickX;
    var y = this.canvas.height - pickY;
    var pix = new Uint8Array(4);
    var gl = this.gl;
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    return pix;
};

xeogl.renderer.RenderBuffer.prototype.unbind = function () {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.bound = false;
};

xeogl.renderer.RenderBuffer.prototype.getTexture = function () {
    var self = this;
    return {
        renderBuffer: this,
        bind: function (unit) {
            if (self.buffer && self.buffer.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, self.buffer.texture);
                return true;
            }
            return false;
        },
        unbind: function (unit) {
            if (self.buffer && self.buffer.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, null);
            }
        }
    };
};

xeogl.renderer.RenderBuffer.prototype.destroy = function () {
    if (this.allocated) {
        var gl = this.gl;
        gl.deleteTexture(this.buffer.texture);
        gl.deleteFramebuffer(this.buffer.framebuf);
        gl.deleteRenderbuffer(this.buffer.renderbuf);
        this.allocated = false;
        this.buffer = null;
        this.bound = false;
    }
};
