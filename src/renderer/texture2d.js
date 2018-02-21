/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer.Texture2D = function (gl, target) {
    this.gl = gl;
    this.target = target || gl.TEXTURE_2D;
    this.texture = gl.createTexture();
    this.setPreloadColor([0,0,0,0]); // Prevents "there is no texture bound to the unit 0" error
    this.allocated = true;
};

xeogl.renderer.Texture2D.prototype.setPreloadColor = (function () {

    var color = new Uint8Array([0, 0, 0, 1]);

    return function (value) {

        if (!value) {
            color[0] = 0;
            color[1] = 0;
            color[2] = 0;
            color[3] = 255;
        } else {
            color[0] = Math.floor(value[0] * 255);
            color[1] = Math.floor(value[1] * 255);
            color[2] = Math.floor(value[2] * 255);
            color[3] = Math.floor((value[3] !== undefined ? value[3] : 1) * 255);
        }

        var gl = this.gl;

        gl.bindTexture(this.target, this.texture);
        gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        if (this.target === gl.TEXTURE_CUBE_MAP) {

            var faces = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];

            for (var i = 0, len = faces.length; i < len; i++) {
                gl.texImage2D(faces[i], 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
            }

        } else {
            gl.texImage2D(this.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
        }

        gl.bindTexture(this.target, null);
    };
})();

xeogl.renderer.Texture2D.prototype.setTarget = function (target) {
    this.target = target || this.gl.TEXTURE_2D;
};

xeogl.renderer.Texture2D.prototype.setImage = function (image, props) {
    var gl = this.gl;
    gl.bindTexture(this.target, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, props.flipY);
    if (this.target === gl.TEXTURE_CUBE_MAP) {
        if (xeogl._isArray(image)) {
            var images = image;
            var faces = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];
            for (var i = 0, len = faces.length; i < len; i++) {
                gl.texImage2D(faces[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
            }
        }
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
    gl.bindTexture(this.target, null);
};

xeogl.renderer.Texture2D.prototype.setProps = function (props) {
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

xeogl.renderer.Texture2D.prototype._getGLEnum = function (name, defaultVal) {
    if (name === undefined) {
        return defaultVal;
    }
    var glName = xeogl.renderer.webgl.enums[name];
    if (glName === undefined) {
        return defaultVal;
    }
    return this.gl[glName];
};


xeogl.renderer.Texture2D.prototype.bind = function (unit) {
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

xeogl.renderer.Texture2D.prototype.unbind = function (unit) {
    if (!this.allocated) {
        return;
    }
    if (this.texture) {
        var gl = this.gl;
        gl.activeTexture(gl["TEXTURE" + unit]);
        gl.bindTexture(this.target, null);
    }
};

xeogl.renderer.Texture2D.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    if (this.texture) {
        this.gl.deleteTexture(this.texture);
        this.texture = null;
    }
};

xeogl.renderer.clampImageSize = function (image, numPixels) {
    var n = image.width * image.height;
    if (n > numPixels) {
        var ratio = numPixels / n;
        var width = image.width * ratio;
        var height = image.height * ratio;
        var canvas = document.createElement("canvas");
        canvas.width = xeogl.renderer.nextHighestPowerOfTwo(width);
        canvas.height = xeogl.renderer.nextHighestPowerOfTwo(height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
};

xeogl.renderer.ensureImageSizePowerOfTwo = function (image) {
    if (!xeogl.renderer.isPowerOfTwo(image.width) || !xeogl.renderer.isPowerOfTwo(image.height)) {
        var canvas = document.createElement("canvas");
        canvas.width = xeogl.renderer.nextHighestPowerOfTwo(image.width);
        canvas.height = xeogl.renderer.nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
};

xeogl.renderer.isPowerOfTwo = function (x) {
    return (x & (x - 1)) === 0;
};

xeogl.renderer.nextHighestPowerOfTwo = function (x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};
