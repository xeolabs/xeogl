/**
 A {{#crossLink "Texture"}}{{/crossLink}} that provides a canvas and 3D context to draw to.

 @class TextureCanvas
 @module xeogl
 @extends Component
 */
xeogl.TextureCanvas = xeogl.Component.extend({

    type: "xeogl.TextureCanvas",

    _init: function (cfg) {

        var self = this;

        this._needBlit = false;

        this._tick = this.scene.on("tick",
            function () {
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
    },

    _update: function () {

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

    },

    _props: {

        canvas: {
            get: function() {
                return this._canvas;
            }
        },

        context: {
            get: function() {
                return this._context;
            }
        },

        /**
         * The TextureCanvas's dimension on the X-axis.
         *
         * Fires a {{#crossLink "TextureCanvas/xSize:event"}}{{/crossLink}} event on change.
         *
         * @property xSize
         * @default 1
         * @type Number
         */
        xSize: {

            set: function (value) {

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

                /**
                 * Fired whenever this TextureCanvas's {{#crossLink "TextureCanvas/xSize:property"}}{{/crossLink}} property changes.
                 * @event xSize
                 * @type Number
                 * @param value The property's new value
                 */
                this.fire("xSize", this._xSize);
            },

            get: function () {
                return this._xSize;
            }
        },

        /**
         * The TextureCanvas's dimension on the Y-axis.
         *
         * Fires a {{#crossLink "TextureCanvas/ySize:event"}}{{/crossLink}} event on change.
         *
         * @property ySize
         * @default 1.0
         * @type Number
         */
        ySize: {

            set: function (value) {

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

                /**
                 * Fired whenever this TextureCanvas's {{#crossLink "TextureCanvas/ySize:property"}}{{/crossLink}} property changes.
                 * @event ySize
                 * @type Number
                 * @param value The property's new value
                 */
                this.fire("ySize", this._ySize);
            },

            get: function () {
                return this._ySize;
            }
        }
    },

    clear: function () {

        this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = "black";
        this._ctx.fill();

        this._needBlit = true;
    },

    _destroy: function () {
        this._canvas.destroy();
        this.scene.off(this._tick);
    }
});