(function () {

    "use strict";

    XEO.webgl.Texture2D = function (gl, cfg) {

        this.gl = gl;

        cfg = cfg || {};

        this.target = cfg.target || gl.TEXTURE_2D;

        this.texture = gl.createTexture();

        this.allocated = true;
    };

    XEO.webgl.Texture2D.prototype.setImage = function (image) {

        var gl = this.gl;

        gl.bindTexture(this.target, this.texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            XEO.webgl.ensureImageSizePowerOfTwo(cfg.image));

        gl.bindTexture(this.target, null);
    };

    XEO.webgl.Texture2D.prototype.setProps = function (cfg) {

        var gl = this.gl;

        gl.bindTexture(this.target, this.texture);

        // Flip the image's Y axis to match the WebGL texture coordinate space.
        if (cfg.flipY === true || cfg.flipY === false) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, cfg.flipY);
        }

        if (cfg.minFilter) {

            var minFilter = this._getGLEnum(cfg.minFilter);

            if (minFilter) {

                gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, minFilter);

                if (minFilter === gl.NEAREST_MIPMAP_NEAREST ||
                    minFilter === gl.LINEAR_MIPMAP_NEAREST ||
                    minFilter === gl.NEAREST_MIPMAP_LINEAR ||
                    minFilter === gl.LINEAR_MIPMAP_LINEAR) {

                    gl.generateMipmap(this.target);
                }
            }
        }

        if (cfg.magFilter) {
            var magFilter = this._getGLEnum(cfg.minFilter);
            if (magFilter) {
                gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, magFilter);
            }
        }

        if (cfg.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        gl.bindTexture(this.target, null);
    };

    XEO.webgl.Texture2D.prototype._getGLEnum = function (name, defaultVal) {

        if (name === undefined) {
            return defaultVal;
        }

        var glName = XEO.webgl.enums[name];

        if (glName === undefined) {
            return defaultVal;
        }

        return this.gl[glName];
    };


    XEO.webgl.Texture2D.prototype.bind = function (unit) {

        if (!this.allocated) {
            return;
        }

        if (this.texture) {

            var gl = this.gl;

            gl.activeTexture(gl["TEXTURE" + unit]);

            gl.bindTexture(this.target, this.texture);

            return true;
        }

        return false;
    };

    XEO.webgl.Texture2D.prototype.unbind = function (unit) {

        if (!this.allocated) {
            return;
        }

        if (this.texture) {

            var gl = this.gl;

            gl.activeTexture(gl["TEXTURE" + unit]);

            gl.bindTexture(this.target, null);
        }
    };

    XEO.webgl.Texture2D.prototype.destroy = function () {

        if (!this.allocated) {
            return;
        }

        if (this.texture) {

            this.gl.deleteTexture(this.texture);

            this.texture = null;
        }
    };


    XEO.webgl.clampImageSize = function (image, numPixels) {

        var n = image.width * image.height;

        if (n > numPixels) {

            var ratio = numPixels / n;

            var width = image.width * ratio;
            var height = image.height * ratio;

            var canvas = document.createElement("canvas");

            canvas.width = XEO.webgl.nextHighestPowerOfTwo(width);
            canvas.height = XEO.webgl.nextHighestPowerOfTwo(height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            image = canvas;
        }

        return image;
    };

    XEO.webgl.ensureImageSizePowerOfTwo = function (image) {

        if (!XEO.webgl.isPowerOfTwo(image.width) || !XEO.webgl.isPowerOfTwo(image.height)) {

            var canvas = document.createElement("canvas");

            canvas.width = XEO.webgl.nextHighestPowerOfTwo(image.width);
            canvas.height = XEO.webgl.nextHighestPowerOfTwo(image.height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
            image = canvas;
        }

        return image;
    };

    XEO.webgl.isPowerOfTwo = function (x) {
        return (x & (x - 1)) === 0;
    };

    XEO.webgl.nextHighestPowerOfTwo = function (x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

})();
