(function () {

    "use strict";

    XEO.renderer.webgl.Texture2D = function (gl) {

        this.gl = gl;

        this.target = gl.TEXTURE_2D;

        this.texture = gl.createTexture();

        this.allocated = true;
    };

    XEO.renderer.webgl.Texture2D.prototype.setImage = function (image, props) {

        var gl = this.gl;

        gl.bindTexture(this.target, this.texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, props.flipY);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.bindTexture(this.target, null);
    };

    XEO.renderer.webgl.Texture2D.prototype.setProps = function (props) {

        var gl = this.gl;

        gl.bindTexture(this.target, this.texture);

        if (props.minFilter) {

            var minFilter = this._getGLEnum(props.minFilter);

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

        if (props.magFilter) {
            var magFilter = this._getGLEnum(props.magFilter);
            if (magFilter) {
                gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, magFilter);
            }
        }

        if (props.wrapS) {
            var wrapS = this._getGLEnum(props.wrapS);
            if (wrapS) {
                gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, wrapS);
            }
        }

        if (props.wrapT) {
            var wrapT = this._getGLEnum(props.wrapT);
            if (wrapT) {
                gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, wrapT);
            }
        }

        gl.bindTexture(this.target, null);
    };

    XEO.renderer.webgl.Texture2D.prototype._getGLEnum = function (name, defaultVal) {

        if (name === undefined) {
            return defaultVal;
        }

        var glName = XEO.renderer.webgl.enums[name];

        if (glName === undefined) {
            return defaultVal;
        }

        return this.gl[glName];
    };


    XEO.renderer.webgl.Texture2D.prototype.bind = function (unit) {

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

    XEO.renderer.webgl.Texture2D.prototype.unbind = function (unit) {

        if (!this.allocated) {
            return;
        }

        if (this.texture) {

            var gl = this.gl;

            gl.activeTexture(gl["TEXTURE" + unit]);

            gl.bindTexture(this.target, null);
        }
    };

    XEO.renderer.webgl.Texture2D.prototype.destroy = function () {

        if (!this.allocated) {
            return;
        }

        if (this.texture) {

            this.gl.deleteTexture(this.texture);

            this.texture = null;
        }
    };


    XEO.renderer.webgl.clampImageSize = function (image, numPixels) {

        var n = image.width * image.height;

        if (n > numPixels) {

            var ratio = numPixels / n;

            var width = image.width * ratio;
            var height = image.height * ratio;

            var canvas = document.createElement("canvas");

            canvas.width = XEO.renderer.webgl.nextHighestPowerOfTwo(width);
            canvas.height = XEO.renderer.webgl.nextHighestPowerOfTwo(height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            image = canvas;
        }

        return image;
    };

    XEO.renderer.webgl.ensureImageSizePowerOfTwo = function (image) {

        if (!XEO.renderer.webgl.isPowerOfTwo(image.width) || !XEO.renderer.webgl.isPowerOfTwo(image.height)) {

            var canvas = document.createElement("canvas");

            canvas.width = XEO.renderer.webgl.nextHighestPowerOfTwo(image.width);
            canvas.height = XEO.renderer.webgl.nextHighestPowerOfTwo(image.height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
            image = canvas;
        }

        return image;
    };

    XEO.renderer.webgl.isPowerOfTwo = function (x) {
        return (x & (x - 1)) === 0;
    };

    XEO.renderer.webgl.nextHighestPowerOfTwo = function (x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

})();
