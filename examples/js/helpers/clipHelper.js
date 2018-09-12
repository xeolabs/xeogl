/**

 Helper that visualizes the position and direction of a {{#crossLink "Clip"}}{{/crossLink}}.

 The helper works by tracking updates to the {{#crossLink "Clip"}}{{/crossLink}}'s
 {{#crossLink "Clip/pos:property"}}{{/crossLink}} and {{#crossLink "Clip/dir:property"}}{{/crossLink}}.

 @class ClipHelper
 @constructor
 @param cfg {*} Configuration
 @param cfg.clip {Clip} A {{#crossLink "Clip"}}{{/crossLink}} to visualize.
 @param [cfg.solid=true] {Boolean} Indicates whether or not this helper is filled with color or just wireframe.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 @param [cfg.planeSize] {Float32Array} The width and height of the ClipHelper plane indicator.
 @param [cfg.autoPlaneSize=false] {Boolean} Indicates whether or not this ClipHelper's
 {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} is automatically sized to fit within
 the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
 */
xeogl.ClipHelper = class xeoglClipHelper extends xeogl.Component {

    init(cfg) {

        super.init(cfg);

        this._planeHelper = new xeogl.PlaneHelper(this);

        this._clip = cfg.clip;
        this.planeSize = cfg.planeSize;
        this.autoPlaneSize = cfg.autoPlaneSize;
        this.solid = cfg.solid;
        this.visible = cfg.visible;

        var self = this;

        if (this._clip) {
            this._onPos = this._clip.on("pos", function (pos) {
                self._planeHelper.pos = pos;
            });
            this._onDir = this._clip.on("dir", function (dir) {
                self._planeHelper.dir = dir;
            });
        }
    }

    /**
     The {{#crossLink "Clip"}}Clip{{/crossLink}} attached to this ClipHelper.

     @property clip
     @type Clip
     */
    get clip() {
        return this._attached.clip;
    }

    /**
     The width and height of the ClipHelper plane indicator.

     When no value is specified, will automatically size to fit within the
     {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.

     @property planeSize
     @default Fitted to scene boundary
     @type {Float32Array}
     */
    set planeSize(value) {
        this._planeHelper.planeSize = value;
    }

    get planeSize() {
        return this._planeHelper.planeSize;
    }

    /**
     Indicates whether this ClipHelper's {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} is automatically
     generated or not.

     When auto-generated, {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} will automatically size
     to fit within the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.

     @property autoPlaneSize
     @default false
     @type {Boolean}
     */
    set autoPlaneSize(value) {
        this._planeHelper.autoPlaneSize = value;
    }

    get autoPlaneSize() {
        return this._planeHelper.autoPlaneSize;
    }

    /**
     Indicates whether this ClipHelper's plane is filled or just wireframe.

     @property solid
     @default true
     @type Boolean
     */
    set solid(value) {
        this._planeHelper.solid = value;
    }

    get solid() {
        return this._planeHelper.solid;
    }

    /**
     Indicates whether this ClipHelper is visible or not.

     @property visible
     @default true
     @type Boolean
     */
    set visible(value) {
        this._planeHelper.visible = value;
    }

    get visible() {
        return this._planeHelper.visible;
    }

    destroy() {
        super.destroy();
        if (this._onPos) {
            this._planeHelper.off(this._onPos);
            this._planeHelper.off(this._onDir);
        }
    }
};
