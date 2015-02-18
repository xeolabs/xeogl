"use strict";

/**
 Configures the WebGL color buffer for associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>A ColorBuf configures **the way** that pixels are written to the WebGL color buffer, and is not to be confused
 with {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, which holds the final pixel colors so that they may be
 fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7104987/L.png"></img>

 ### Example

 TODO

 @class ColorBuf
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorBuf within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorBuf.
 @param [cfg.blendEnabled=true] {Boolean} Indicates if blending is enabled.
 @param [cfg.colorMask=[true, true, true, true]] {Array of Boolean} The color mask,
 @extends Component
 */
XEO.ColorBuf = XEO.Component.extend({

    className: "XEO.ColorBuf",

    type: "colorbuf",

    _init: function (cfg) {
        this.blendEnabled = cfg.blendEnabled;
        this.colorMask = cfg.colorMask;
    },

    /**
     * Indicates if blending is enabled for this ColorBuf.
     *
     * Fires a {{#crossLink "ColorBuf/blendEnabled:event"}}{{/crossLink}} event on change.
     *
     * @property blendEnabled
     * @default true
     * @type Boolean
     */
    set blendEnabled(value) {
        value = value !== false;
        this._core.blendEnabled = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this ColorBuf's {{#crossLink "ColorBuf/blendEnabled:property"}}{{/crossLink}} property changes.

          @event blendEnabled
          @param value {Boolean} The property's new value
         */
        this.fire("blendEnabled", value);
    },

    get blendEnabled() {
        return this._core.blendEnabled;
    },

    /**
     * Specifies whether red, green, blue, and alpha can or cannot be written into the frame buffer.
     *
     * Fires a {{#crossLink "ColorBuf/colorMask:event"}}{{/crossLink}} event on change.
     *
     * @property colorMask
     * @default [true, true, true, true]
     * @type {Four element array of Boolean}
     */
    set colorMask(value) {
        value = value || [true, true, true, true];
        this._core.colorMask = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this ColorBuf's {{#crossLink "ColorBuf/colorMask:property"}}{{/crossLink}} property changes.

          @event colorMask
          @param value {Four element array of Boolean} The property's new value
         */
        this.fire("colorMask", value);
    },

    get colorMask() {
        return this._core.colorMask;
    },

    _compile: function () {
        this._renderer.colorBuf = this._core;
    },

    _getJSON: function () {
        return {
            blendEnabled: this.blendEnabled,
            colorMask: this.colorMask
        };
    }
});


