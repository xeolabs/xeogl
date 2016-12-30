(function () {

    "use strict";

    /**
     * Buffer for vertices and indices
     *
     * @param gl WebGL
     * @param type  Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
     * @param data  WebGL array wrapper
     * @param numItems Count of items in array wrapper
     * @param itemSize Size of each item
     * @param usage Eg. STATIC_DRAW
     */
    xeogl.renderer.webgl.ArrayBuffer = function (gl, type, data, numItems, itemSize, usage) {

        /**
         * True when this buffer is allocated and ready to go
         * @type {boolean}
         */
        this.allocated = false;

        this.gl = gl;

        this.type = type;

        switch (data.constructor) {

            case Uint8Array:
                this.itemType = gl.UNSIGNED_BYTE;
                this.itemByteSize = 1;
                break;

            case Int8Array:
                this.itemType = gl.BYTE;
                this.itemByteSize = 1;
                break;

            case  Uint16Array:
                this.itemType = gl.UNSIGNED_SHORT;
                this.itemByteSize = 2;
                break;

            case  Int16Array:
                this.itemType = gl.SHORT;
                this.itemByteSize = 2;
                break;

            case Uint32Array:
                this.itemType = gl.UNSIGNED_INT;
                this.itemByteSize = 4;
                break;

            case Int32Array:
                this.itemType = gl.INT;
                this.itemByteSize = 4;
                break;

            default:
                this.itemType = gl.FLOAT;
                this.itemByteSize = 4;
        }

        this.usage = usage;

        this.length = 0;
        this.numItems = 0;
        this.itemSize = itemSize;

        this._allocate(data);
    };

    /**
     * Allocates this buffer
     *
     * @param data
     * @private
     */
    xeogl.renderer.webgl.ArrayBuffer.prototype._allocate = function (data) {

        this.allocated = false;

        this._handle = this.gl.createBuffer();

        if (!this._handle) {
            throw "Failed to allocate WebGL ArrayBuffer";
        }

        if (this._handle) {

            this.gl.bindBuffer(this.type, this._handle);
            this.gl.bufferData(this.type, data, this.usage);
            this.gl.bindBuffer(this.type, null);

            this.length = data.length;
            this.numItems = this.length / this.itemSize;

            this.allocated = true;
        }
    };

    /**
     * Updates data within this buffer, reallocating if needed.
     *
     * @param data
     * @param offset
     */
    xeogl.renderer.webgl.ArrayBuffer.prototype.setData = function (data, offset) {

        if (!this.allocated) {
            return;
        }

        if (data.length > this.length) {

            // Needs reallocation

            this.destroy();

            this._allocate(data, data.length);

        } else {

            // No reallocation needed

            this.gl.bindBuffer(this.type, this._handle);

            if (offset || offset === 0) {
                this.gl.bufferSubData(this.type, offset * this.itemByteSize, data);
            } else {
                this.gl.bufferData(this.type, data);
            }

            this.gl.bindBuffer(this.type, null);
        }
    };

    /**
     * Binds this buffer
     */
    xeogl.renderer.webgl.ArrayBuffer.prototype.bind = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.bindBuffer(this.type, this._handle);
    };

    /**
     * Unbinds this buffer
     */
    xeogl.renderer.webgl.ArrayBuffer.prototype.unbind = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.bindBuffer(this.type, null);
    };

    /**
     * Destroys this buffer
     */
    xeogl.renderer.webgl.ArrayBuffer.prototype.destroy = function () {

        if (!this.allocated) {
            return;
        }

        this.gl.deleteBuffer(this._handle);

        this._handle = null;

        this.allocated = false;
    };

})();

