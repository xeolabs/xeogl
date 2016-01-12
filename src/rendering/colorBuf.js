/**
 A **ColorBuf** configures the WebGL color buffer for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 <ul>

 <li>A ColorBuf configures **the way** that pixels are written to the WebGL color buffer.</li>
 <li>ColorBuf is not to be confused with {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, which stores rendered pixel
 colors for consumption by {{#crossLink "Texture"}}Textures{{/crossLink}}, used when performing *render-to-texture*.</li>

 </ul>

 <img src="../../../assets/images/ColorBuf.png"></img>

 ## Example

 In this example we're configuring the WebGL color buffer for an {{#crossLink "Entity"}}{{/crossLink}}.

 This example scene contains:

 <ul>
 <li>a ColorBuf that enables blending and sets the color mask,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>an {{#crossLink "Entity"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var colorBuf = new XEO.ColorBuf(scene, {
    blendEnabled: true,
    colorMask: [true, true, true, true]
});

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var Entity = new XEO.Entity(scene, {
    colorBuf: colorBuf,
    geometry: geometry
});
 ````

 @class ColorBuf
 @module XEO
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorBuf within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorBuf.
 @param [cfg.blendEnabled=false] {Boolean} Indicates if blending is enabled.
 @param [cfg.colorMask=[true, true, true, true]] {Array of Boolean} The color mask,
 @extends Component
 */
(function () {

    "use strict";

    XEO.ColorBuf = XEO.Component.extend({

        type: "XEO.ColorBuf",

        _init: function (cfg) {

            this._state = new XEO.renderer.ColorBuf({
                blendEnabled: false,
                colorMask: [true, true, true, true]
            });

            this.blendEnabled = cfg.blendEnabled;
            this.colorMask = cfg.colorMask;
        },

        _props: {

            /**
             * Indicates if blending is enabled for this ColorBuf.
             *
             * Fires a {{#crossLink "ColorBuf/blendEnabled:event"}}{{/crossLink}} event on change.
             *
             * @property blendEnabled
             * @default false
             * @type Boolean
             */
            blendEnabled: {

                set: function (value) {

                    this._state.blendEnabled = value === true;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this ColorBuf's {{#crossLink "ColorBuf/blendEnabled:property"}}{{/crossLink}} property changes.

                     @event blendEnabled
                     @param value {Boolean} The property's new value
                     */
                    this.fire("blendEnabled", this._state.blendEnabled);
                },

                get: function () {
                    return this._state.blendEnabled;
                }
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
            colorMask: {

                set: function (value) {

                    this._state.colorMask = value || [true, true, true, true];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this ColorBuf's {{#crossLink "ColorBuf/colorMask:property"}}{{/crossLink}} property changes.

                     @event colorMask
                     @param value {Four element array of Boolean} The property's new value
                     */
                    this.fire("colorMask", this._state.colorMask);
                },

                get: function () {
                    return this._state.colorMask;
                }
            }
        },

        _compile: function () {
            this._renderer.colorBuf = this._state;
        },

        _getJSON: function () {
            return {
                blendEnabled: this._state.blendEnabled,
                colorMask: this._state.colorMask
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
