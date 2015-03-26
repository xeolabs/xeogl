/**
 A **Modes** toggles various xeoEngine rendering modes for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>Though the rendering modes are defined by various different components attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}},
 Modes components provide a single point through which you can toggle them on or off.</li>

 <li>A Modes may be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to toggle
 rendering modes for them as a group.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7123073/L.png"></img>

 ## Example

 In this example we have a Modes that toggles rendering modes for
 two {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. The properties of the Modes are initialised to their
 default values.

 ````javascript
var scene = new XEO.Scene();

 // Create a Modes with default properties
 var modes = new XEO.Modes(scene, {
    picking: true,              // Enable picking
    clipping true,              // Enable effect of XEO.Clip components
    transparent : false,        // Disable transparency
    backfaces : true,           // Render backfaces
    frontface : "ccw"
 });

 // Create two GameObjects whose rendering modes will be controlled by our Modes

 var object1 = new XEO.GameObject(scene, {
       modes: modes
 });

 var object2 = new XEO.GameObject(scene, {
       modes: modes
 });

 // Subscribe to change on the Modes' "backfaces" property
 var handle = modes.on("backfaces", function(value) {
       //...
 });

 // Hide backfaces on our GameObjects by flipping the Modes' "backfaces" property,
 // which will also call our handler
 modes.backfaces = false;

 // Unsubscribe from the Modes again
 modes.off(handle);

 // When we destroy our Modes, the GameObjects will fall back
 // on the Scene's default Modes instance
 modes.destroy();

 ````

 @class Modes
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Modes in the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Modes.
 @param [cfg.picking=true] {Boolean}  Whether to enable picking.
 @param [cfg.clipping=true] {Boolean} Whether to enable clipping by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.transparent=false] {Boolean} Whether to enable the transparency effect created by {{#crossLink "Material"}}Material{{/crossLink}}s when they have
 {{#crossLink "Material/opacity:property"}}{{/crossLink}} < 1.0. This mode will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
 transparency pass with blending enabled etc), while
 the {{#crossLink "Material/opacity:property"}}{{/crossLink}} will indicate the **degree** of their transparency
 (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).
 @param [cfg.backfaces=true] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Modes = XEO.Component.extend({

        className: "XEO.Modes",

        type: "modes",

        _init: function (cfg) {

            this.picking = cfg.picking;
            this.clipping = cfg.clipping;
            this.transparent = cfg.transparent;
            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;
        },

        _props: {

            /**
             Whether this Modes enables picking of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Picking is performed via calls to {{#crossLink "Canvas/pick:method"}}Canvas pick{{/crossLink}}.

             Fires a {{#crossLink "Modes/picking:event"}}{{/crossLink}} event on change.
             @property picking
             @default true
             @type Boolean
             */
            picking: {

                set: function (value) {
                    value = value !== false;
                    this._state.picking = value;
                    this._renderer.drawListDirty = true;

                    /**
                     * Fired whenever this Modes'' {{#crossLink "Modes/picking:property"}}{{/crossLink}} property changes.
                     * @event picking
                     * @param value The property's new value
                     */
                    this.fire("picking", value);
                },

                get: function () {
                    return this._state.picking;
                }
            },

            /**
             Whether this Modes enables clipping of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Clipping is done by {{#crossLink "Clips"}}{{/crossLink}} that are also attached to
             the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/clipping:event"}}{{/crossLink}} event on change.

             @property clipping
             @default true
             @type Boolean
             */
            clipping: {

                set: function (value) {
                    value = value !== false;
                    this._state.clipping = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/clipping:property"}}{{/crossLink}} property changes.
                     @event clipping
                     @param value The property's new value
                     */
                    this.fire("clipping", value);
                },

                get: function () {
                    return this._state.clipping;
                }
            },

            /**
             Whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are transparent.

             When true. this property will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
             transparency pass with blending enabled etc), while
             the {{#crossLink "Material/opacity:property"}}{{/crossLink}} will be used to indicate the **degree** of their transparency
             (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).

             Fires a {{#crossLink "Modes/transparent:event"}}{{/crossLink}} event on change.

             @property transparent
             @default false
             @type Boolean
             */
            transparent: {

                set: function (value) {
                    value = !!value;
                    this._state.transparent = value;
                    this._renderer.stateOrderDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/transparent:property"}}{{/crossLink}} property changes.
                     @event transparent
                     @param value The property's new value
                     */
                    this.fire("transparent", value);
                },

                get: function () {
                    return this._state.transparent;
                }
            },

            /**
             Whether this Modes enables backfaces to be visible on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
             the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/backfaces:event"}}{{/crossLink}} event on change.

             @property backfaces
             @default true
             @type Boolean
             */
            backfaces: {

                set: function (value) {
                    value = value !== false;
                    this._state.backfaces = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/backfaces:property"}}{{/crossLink}} property changes.
                     @event backfaces
                     @param value The property's new value
                     */
                    this.fire("backfaces", value);
                },

                get: function () {
                    return this._state.backfaces;
                }
            },

            /**
             Indicates the winding direction of front faces on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
             the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/frontface:event"}}{{/crossLink}} event on change.

             @property frontface
             @default "ccw"
             @type String
             */
            frontface: {

                set: function (value) {
                    value = value || "ccw";
                    this._state.frontface = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/frontface:property"}}{{/crossLink}} property changes.
                     @event frontface
                     @param value The property's new value
                     */
                    this.fire("frontface", value);
                },

                get: function () {
                    return this._state.frontface;
                }
            }
        },

        _compile: function () {
            this._renderer.flags = this._state;
        },

        /**
         * JSON representation of this component
         * @property json
         * @type GameObject
         */

        _getJSON: function () {
            return {
                picking: this.picking,
                clipping: this.clipping,
                transparent: this.transparent,
                backfaces: this.backfaces,
                frontface: this.frontface
            };
        }
    });

})();


