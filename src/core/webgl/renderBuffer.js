(function () {

    "use strict";

    XEO.webgl.RenderBuffer = function (cfg) {

        /**
         * True as soon as this buffer is allocated and ready to go
         */
        this.allocated = false;

        /**
         * The canvas, to synch buffer size with when its dimensions change
         */
        this.canvas = cfg.canvas;

        /**
         * WebGL context
         */
        this.gl = cfg.canvas.gl;

        /**
         * Buffer resources, set up in #_touch
         */
        this.buf = null;

        /**
         * True while this buffer is bound
         * @type {boolean}
         */
        this.bound = false;
    };

    /**
     * Called after WebGL context is restored.
     */
    XEO.webgl.RenderBuffer.prototype.webglRestored = function (_gl) {
        this.gl = _gl;
        this.buf = null;
        this.allocated = false;
        this.bound = false;
    };

    /**
     * Binds this buffer
     */
    XEO.webgl.RenderBuffer.prototype.bind = function () {
        this._touch();
        if (this.bound) {
            return;
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
        this.bound = true;
    };

    XEO.webgl.RenderBuffer.prototype._touch = function () {
        var width = this.canvas.canvas.width;
        var height = this.canvas.canvas.height;
        if (this.buf) { // Currently have a buffer
            if (this.buf.width === width && this.buf.height === height) { // Canvas size unchanged, buffer still good
                return;
            } else { // Buffer needs reallocation for new canvas size
                this.gl.deleteTexture(this.buf.texture);
                this.gl.deleteFramebuffer(this.buf.framebuf);
                this.gl.deleteRenderbuffer(this.buf.renderbuf);
            }
        }

        this.buf = {
            framebuf: this.gl.createFramebuffer(),
            renderbuf: this.gl.createRenderbuffer(),
            texture: this.gl.createTexture(),
            width: width,
            height: height
        };

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.buf.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureStorage);
        }

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.buf.renderbuf);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.buf.texture, 0);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.buf.renderbuf);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Verify framebuffer is OK
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);

        if (!this.gl.isFramebuffer(this.buf.framebuf)) {
            throw XEO_error.fatalError(XEO.errors.INVALID_FRAMEBUFFER, "Invalid framebuffer");
        }

        var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

        switch (status) {

            case this.gl.FRAMEBUFFER_COMPLETE:
                break;

            case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");

            case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");

            case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");

            case this.gl.FRAMEBUFFER_UNSUPPORTED:
                throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");

            default:
                throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: " + status);
        }

        this.bound = false;
    };

    /**
     * Clears this renderbuffer
     */
    XEO.webgl.RenderBuffer.prototype.clear = function () {
        if (!this.bound) {
            throw "Render buffer not bound";
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.disable(this.gl.BLEND);
    };

    /**
     * Reads buffer pixel at given coordinates
     */
    XEO.webgl.RenderBuffer.prototype.read = function (pickX, pickY) {
        var x = pickX;
        var y = this.canvas.canvas.height - pickY;
        var pix = new Uint8Array(4);
        this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pix);
        return pix;
    };

    /**
     * Unbinds this renderbuffer
     */
    XEO.webgl.RenderBuffer.prototype.unbind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.bound = false;
    };

    /** Returns the texture
     */
    XEO.webgl.RenderBuffer.prototype.getTexture = function () {
        var self = this;
        return {
            bind: function (unit) {
                if (self.buf && self.buf.texture) {
                    self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                    self.gl.bindTexture(self.gl.TEXTURE_2D, self.buf.texture);
                    return true;
                }
                return false;
            },
            unbind: function (unit) {
                if (self.buf && self.buf.texture) {
                    self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                    self.gl.bindTexture(self.gl.TEXTURE_2D, null);
                }
            }
        };
    };

    /** Destroys this buffer
     */
    XEO.webgl.RenderBuffer.prototype.destroy = function () {
        if (this.buf) {
            this.gl.deleteTexture(this.buf.texture);
            this.gl.deleteFramebuffer(this.buf.framebuf);
            this.gl.deleteRenderbuffer(this.buf.renderbuf);
            this.buf = null;
            this.bound = false;
        }
    };

})();