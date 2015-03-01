
XEO.webgl.Texture2D = function (gl, cfg) {

    /**
     * True as soon as this texture is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.target = cfg.target || gl.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;
    this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
    this.texture = cfg.texture;
    this.format = gl.RGBA;
    this.isDepth = false;
    this.depthMode = 0;
    this.depthCompareMode = 0;
    this.depthCompareFunc = 0;

    try {
        gl.bindTexture(this.target, this.texture);

        if (cfg.minFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, cfg.minFilter);
        }

        if (cfg.magFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, cfg.magFilter);
        }

        if (cfg.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        if (cfg.minFilter == gl.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == gl.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == gl.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
            gl.generateMipmap(this.target);
        }

        gl.bindTexture(this.target, null);

        this.allocated = true;

    } catch (e) {
        throw XEO_error.fatalError(XEO.errors.OUT_OF_VRAM, "Failed to create texture: " + e.message || e);
    }

    this.bind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, this.texture);
            if (this.update) {
                this.update(gl);
            }
            return true;
        }
        return false;
    };

    this.unbind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, null);
        }
    };

    this.destroy = function () {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
    };
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
    return (x & (x - 1)) == 0;
};

XEO.webgl.nextHighestPowerOfTwo = function (x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};

