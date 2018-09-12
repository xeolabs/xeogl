/**
 A {{#crossLink "Texture"}}{{/crossLink}} that provides a canvas and 3D context to draw to.

 @class TextureCanvas
 @module xeogl
 @extends Component
 */
xeogl.TextureCanvas = class xeoglTextureCanvas extends xeogl.Component {

    init(cfg) {

        super.init(cfg);

        var self = this;

        this._needBlit = false;

        this._tick = this.scene.on("tick", function () {
            //xeogl.scheduleTask(function () {
            if (self._needBlit) {
                if (self._texture) {
                    self._image.src = self._canvas.toDataURL();
                    self._texture.image = self._image;
                    self._needBlit = false;
                }
            }
            //});
        });

        this._needBuild = false;

        this._texture = cfg.texture;

        this.xSize = cfg.xSize;
        this.ySize = cfg.ySize;

        this.clear();
    }

    _update() {
        var canvas = this._canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        var ctx = this._ctx = canvas.getContext("2d");
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fill();
        this._image = new Image();
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this._context;
    }

    /**
     * The TextureCanvas's dimension on the X-axis.
     *
     * Fires a {{#crossLink "TextureCanvas/xSize:event"}}{{/crossLink}} event on change.
     *
     * @property xSize
     * @default 1
     * @type Number
     */
    set xSize(value) {
        value = value || 1;
        if (this._xSize === value) {
            return;
        }
        if (value < 0) {
            this.warn("negative xSize not allowed - will invert");
            value = value * -1;
        }
        this._xSize = value;
        this._needUpdate();
    }

    get xSize() {
        return this._xSize;
    }

    /**
     * The TextureCanvas's dimension on the Y-axis.
     *
     * Fires a {{#crossLink "TextureCanvas/ySize:event"}}{{/crossLink}} event on change.
     *
     * @property ySize
     * @default 1.0
     * @type Number
     */
    set ySize(value) {
        value = value || 1.0;
        if (this._ySize === value) {
            return;
        }
        if (value < 0) {
            this.warn("negative ySize not allowed - will invert");
            value = value * -1;
        }
        this._ySize = value;
        this._needUpdate();
    }

    get ySize() {
        return this._ySize;
    }

    clear() {
        this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = "black";
        this._ctx.fill();
        this._needBlit = true;
    }

    destroy() {
        super.destroy();
        this._canvas.destroy();
        this.scene.off(this._tick);
    }
};