(function () {

    "use strict";

    xeogl.renderer.webgl.RenderBuffer = function (canvas, gl, options) {

        options = options || {};

        /**
         * True as soon as this buffer is allocated and ready to go
         */
        this.allocated = false;

        /**
         * The HTMLCanvasElement
         */
        this.canvas = canvas;

        /**
         * WebGL context
         */
        this.gl = gl;

        /**
         * Buffer resources, set up in #_touch
         */
        this.buffer = null;

        /**
         * True while this buffer is bound
         */
        this.bound = false;

        /**
         * Optional explicit buffer size - when omitted, buffer defaults to canvas size
         */
        this.size = options.size;
    };

    /**
     * Sets custom dimensions for this buffer.
     *
     * Buffer dynamically re-sizes to canvas when size is null.
     *
     * @param size {Array of Number} Two-element size vector
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.setSize = function (size) {
        this.size = size;
    };

    /**
     * Called after WebGL context is restored.
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.webglRestored = function (gl) {
        this.gl = gl;
        this.buffer = null;
        this.allocated = false;
        this.bound = false;
    };

    /**
     * Binds this buffer
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.bind = function () {

        this._touch();

        if (this.bound) {
            return;
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer.framebuf);

        this.bound = true;
    };

    xeogl.renderer.webgl.RenderBuffer.prototype._touch = function () {

        var width;
        var height;

        if (this.size) {

            // Buffer sized to custom dimensions

            width = this.size[0];
            height = this.size[1];

        } else {

            // Buffer sized to canvas (default)

            width = this.canvas.clientWidth;
            height = this.canvas.clientHeight;
        }

        if (this.buffer) {

            // Currently have a buffer

            if (this.buffer.width === width && this.buffer.height === height) {

                // Canvas size unchanged, buffer still good

                return;

            } else {

                // Buffer needs reallocation for new canvas size

                this.gl.deleteTexture(this.buffer.texture);
                this.gl.deleteFramebuffer(this.buffer.framebuf);
                this.gl.deleteRenderbuffer(this.buffer.renderbuf);
            }
        }

        this.buffer = {
            framebuf: this.gl.createFramebuffer(),
            renderbuf: this.gl.createRenderbuffer(),
            texture: this.gl.createTexture(),
            width: width,
            height: height
        };

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer.framebuf);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.buffer.texture);
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


        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.buffer.renderbuf);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.buffer.texture, 0);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.buffer.renderbuf);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Verify framebuffer is OK
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer.framebuf);

        if (!this.gl.isFramebuffer(this.buffer.framebuf)) {
            throw "Invalid framebuffer";
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

        switch (status) {

            case this.gl.FRAMEBUFFER_COMPLETE:
                break;

            case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT";

            case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";

            case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS";

            case this.gl.FRAMEBUFFER_UNSUPPORTED:
                throw "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED";

            default:
                throw "Incomplete framebuffer: " + status;
        }

        this.bound = false;
    };

    /**
     * Clears this renderbuffer
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.clear = function () {
        if (!this.bound) {
            throw "Render buffer not bound";
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.disable(this.gl.BLEND);
    };

    /**
     * Reads buffer pixel at given coordinates
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.read = function (pickX, pickY) {
        var x = pickX;
        var y = this.canvas.height - pickY;
        var pix = new Uint8Array(4);
        this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pix);
        return pix;
    };

    /**
     * Unbinds this renderbuffer
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.unbind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.bound = false;
    };

    /** Returns the texture
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.getTexture = function () {

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

    /** Destroys this buffer
     */
    xeogl.renderer.webgl.RenderBuffer.prototype.destroy = function () {

        if (this.allocated) {

            this.gl.deleteTexture(this.buffer.texture);
            this.gl.deleteFramebuffer(this.buffer.framebuf);
            this.gl.deleteRenderbuffer(this.buffer.renderbuf);

            this.allocated = false;
            this.buffer = null;
            this.bound = false;
        }
    };

})();
