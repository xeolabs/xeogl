(function () {

    "use strict";

    /** 
     * Buffer for vertices and indices
     *
     * @param gl WebGL
     * @param type  Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
     * @param values  WebGL array wrapper
     * @param numItems Count of items in array wrapper
     * @param itemSize Size of each item
     * @param usage Eg. STATIC_DRAW
     */
    XEO.renderer.webgl.ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {

        /**
         * True when this buffer is allocated and ready to go
         * @type {boolean}
         */
        this.allocated = false;

        this.gl = gl;
        this.type = type;
        this.numItems = numItems;
        this.itemSize = itemSize;
        this.usage = usage;

        this._allocate(values, numItems);
    };

    /**
     * Allocates this buffer
     *
     * @param values
     * @param numItems
     * @private
     */
    XEO.renderer.webgl.ArrayBuffer.prototype._allocate = function (values, numItems) {
        
        this.allocated = false;
        
        this._handle = this.gl.createBuffer();
        
        if (!this._handle) {
            throw "Failed to allocate WebGL ArrayBuffer";
        }
        
        if (this._handle) {
            this.gl.bindBuffer(this.type, this._handle);
            this.gl.bufferData(this.type, values, this.usage);
            this.gl.bindBuffer(this.type, null);
            this.numItems = numItems;
            this.length = values.length;
            this.allocated = true;
        }
    };

    /**
     * Updates values within this buffer, reallocating if needed.
     *
     * @param data
     * @param offset
     */
    XEO.renderer.webgl.ArrayBuffer.prototype.setData = function (data, offset) {
        
        if (!this.allocated) {
            return;
        }
        
        if (data.length > this.length) {
            
            // Needs reallocation
            
            this.destroy();
            
            this._allocate(data, data.length);
            
        } else {
            
            // No reallocation needed
            
            if (offset || offset === 0) {
                
                this.gl.bufferSubData(this.type, offset, data);
                
            } else {
                
                this.gl.bufferData(this.type, data);
            }
        }
    };

    /** 
     * Binds this buffer     
     */
    XEO.renderer.webgl.ArrayBuffer.prototype.bind = function () {
        
        if (!this.allocated) {
            return;
        }
        
        this.gl.bindBuffer(this.type, this._handle);
    };
    
    /**
     * Unbinds this buffer
     */
    XEO.renderer.webgl.ArrayBuffer.prototype.unbind = function () {
        
        if (!this.allocated) {
            return;
        }
        
        this.gl.bindBuffer(this.type, null);
    };

    /**
     * Destroys this buffer
     */
    XEO.renderer.webgl.ArrayBuffer.prototype.destroy = function () {
        
        if (!this.allocated) {
            return;
        }
        
        this.gl.deleteBuffer(this._handle);
        
        this._handle = null;
        
        this.allocated = false;
    };

})();

