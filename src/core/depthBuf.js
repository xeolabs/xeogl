"use strict";

/**
  Configures the WebGL depth buffer for associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 A DepthBuf configures **the way** that pixel depths are written to the WebGL depth buffer, and is not to be confused
 with {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}}, which holds the final pixel depths as a color-encoded image
 so that they may be fed into depth {{#crossLink "Texture"}}Textures{{/crossLink}}.

  <img src="http://www.gliffy.com/go/publish/image/7104991/L.png"></img>

  ### Example

 TODO

 @class DepthBuf
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this DepthBuf
  within the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DepthBuf.
 @param [cfg.clearDepth=1.0] {Number} The clear depth.
 @param [cfg.depthFunc="less"] {String} The depth function.
 @extends Component
 */
XEO.DepthBuf = XEO.Component.extend({

    className: "XEO.DepthBuf",

    type: "DepthBuf",

    _init: function (cfg) {
        this.clearDepth = cfg.clearDepth;
        this.depthFunc = cfg.depthFunc;
    },

    /**
     * The clear depth for this DepthBuf.
     *
     * Fires a {{#crossLink "DepthBuf/clearDepth:event"}}{{/crossLink}} event on change.
     *
     * @property clearDepth
     * @default 1.0
     * @type Number
     */
    set clearDepth(value) {
        value = value != undefined ? value : 1.0;
        this._core.clearDepth = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this DepthBuf's {{#crossLink "DepthBuf/clearDepth:property"}}{{/crossLink}} property changes.

          @event clearDepth
          @param value {Number} The property's new value
         */
        this.fire("clearDepth", value);
    },

    get clearDepth() {
        return this._core.clearDepth;
    },

    /**
     * The depth function for this DepthBuf.
     *
     * Accepted values are:
     *
     * <ul>
     *     <li>"less"</li>
     *     <li>"equal"</li>
     *     <li>"lequal"</li>
     *     <li>"greater"</li>
     *     <li>"notequal"</li>
     *     <li>"gequal"</li>
     * </ul>
     *
     * Fires a {{#crossLink "DepthBuf/depthFunc:event"}}{{/crossLink}} event on change.
     *
     * @property depthFunc
     * @default "less"
     * @type Number
     */
    set depthFunc(value) {
        value = value || "less";
        var enumName = this._depthFuncNames[value];
        if (enumName == undefined) {
            this.error("unsupported value for 'clearFunc' attribute on depthBuf component: '" + value
                + "' - supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'");
            return;
        }
        this._core.depthFunc = this.scene.canvas.gl[enumName];
        this._core.depthFuncName = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this DepthBuf's {{#crossLink "DepthBuf/depthFunc:property"}}{{/crossLink}} property changes.
          @event depthFunc
          @param value {String} The property's new value
         */
        this.fire("depthFunc", value);
    },

    /**
     * Lookup GL depth function enums
     * @private
     */
    _depthFuncNames: {
        less: "LESS",
        equal: "EQUAL",
        lequal: "LEQUAL",
        greater: "GREATER",
        notequal: "NOTEQUAL",
        gequal: "GEQUAL"
    },

    get depthFunc() {
        return this._core.depthFuncName;
    },

    _compile: function () {
        this._renderer.depthBuf = this._core;
    },

    _getJSON: function () {
        return {
            clearDepth: this.clearDepth,
            depthFunc: this.depthFunc
        };
    }
});

