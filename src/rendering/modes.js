/**
 A **Modes** toggles various xeoEngine modes and capabilities for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>Though the rendering modes are defined by various different components attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}},
 Modes components provide a single point through which you can toggle them on or off.</li>

 <li>A Modes may be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to toggle
 rendering modes for them as a group.</li>

 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Modes create within xeoEngine's shaders.</li>

 </ul>

 <img src="../../../assets/images/Modes.png"></img>

 ## Example

 In this example we have a Modes that toggles rendering modes for
 two {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. The properties of the Modes are initialised to their
 default values.

 ````javascript
 var scene = new XEO.Scene();

 // Create a Modes with default properties
 var modes = new XEO.Modes(scene, {
    pickable: true,             // Enable picking
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
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Modes in the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Modes.
 @param [cfg.pickable=true] {Boolean}  Whether to enable picking.
 @param [cfg.clipping=true] {Boolean} Whether to enable clipping by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.transparent=false] {Boolean} Whether to enable the transparency effect created by {{#crossLink "Material"}}Material{{/crossLink}}s when they have
 {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} < 1.0. This mode will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
 transparency pass with blending enabled etc), while
 the {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} will indicate the **degree** of their transparency
 (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).
 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 @param [cfg.collidable=true] {Boolean} Whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are included in boundary-related calculations. Set this false if the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are things like helpers or indicators that should not be included in boundary calculations.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Modes = XEO.Component.extend({

        type: "XEO.Modes",

        _init: function (cfg) {

            this._state = new XEO.renderer.Modes({
                pickable: true,
                clipping: true,
                transparent: false,
                backfaces: false,
                frontface: true, // Boolean for speed; true == "ccw", false == "cw"
                collidable: true
            });

            this.pickable = cfg.pickable;
            this.clipping = cfg.clipping;
            this.transparent = cfg.transparent;
            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;
            this.collidable = cfg.collidable;
        },

        _props: {

            /**
             Whether this Modes enables picking of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Picking is performed via calls to {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}.

             Fires a {{#crossLink "Modes/pickable:event"}}{{/crossLink}} event on change.

             @property pickable
             @default true
             @type Boolean
             */
            pickable: {

                set: function (value) {

                    this._state.pickable = value !== false;

                    this._renderer.drawListDirty = true;

                    /**
                     * Fired whenever this Modes' {{#crossLink "Modes/pickable:property"}}{{/crossLink}} property changes.
                     *
                     * @event pickable
                     * @param value The property's new value
                     */
                    this.fire("pickable", this._state.pickable);
                },

                get: function () {
                    return this._state.pickable;
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

                    this._state.clipping = value !== false;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/clipping:property"}}{{/crossLink}} property changes.

                     @event clipping
                     @param value The property's new value
                     */
                    this.fire("clipping", this._state.clipping);
                },

                get: function () {
                    return this._state.clipping;
                }
            },

            /**
             Whether this Modes sets attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent.

             When true. this property will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
             transparency pass with blending enabled etc), while
             the {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} will be used to indicate the **degree** of their transparency
             (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).

             Fires a {{#crossLink "Modes/transparent:event"}}{{/crossLink}} event on change.

             @property transparent
             @default false
             @type Boolean
             */
            transparent: {

                set: function (value) {

                    this._state.transparent = !!value;

                    this._renderer.stateOrderDirty = true;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/transparent:property"}}{{/crossLink}} property changes.

                     @event transparent
                     @param value The property's new value
                     */
                    this.fire("transparent", this._state.transparent);
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
             @default false
             @type Boolean
             */
            backfaces: {

                set: function (value) {

                    value = !!value;

                    this._state.backfaces = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/backfaces:property"}}{{/crossLink}} property changes.

                     @event backfaces
                     @param value The property's new value
                     */
                    this.fire("backfaces", this._state.backfaces);
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

                    this._state.frontface = value !== "cw";

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/frontface:property"}}{{/crossLink}} property changes.

                     @event frontface
                     @param value The property's new value
                     */
                    this.fire("frontface", this._state.frontface ? "ccw" : "cw");
                },

                get: function () {
                    return this._state.frontface ? "ccw" : "cw";
                }
            },

            /**
             Whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are included
             in boundary-related calculations.

             Set this false if the
             {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are things like helpers or indicators that should not be included in boundary calculations.

             For example, when set false, the {{#crossLink "GameObject/worldBoundary:property"}}World-space boundary{{/crossLink}} of all attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} would not be considered when calculating the {{#crossLink "Scene/worldBoundary:property"}}World-space boundary{{/crossLink}} of their
             {{#crossLink "Scene"}}{{/crossLink}}.

             Fires a {{#crossLink "Modes/collidable:event"}}{{/crossLink}} event on change.

             @property collidable
             @default true
             @type Boolean
             */
            collidable: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._state.collidable) {
                        return;
                    }

                    this._state.collidable = value;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/collidable:property"}}{{/crossLink}} property changes.

                     @event collidable
                     @param value The property's new value
                     */
                    this.fire("collidable", this._state.collidable);
                },

                get: function () {
                    return this._state.collidable;
                }
            }
        },

        _compile: function () {
            this._renderer.modes = this._state;
        },

        _getJSON: function () {
            return {
                pickable: this._state.pickable,
                clipping: this._state.clipping,
                transparent: this._state.transparent,
                backfaces: this._state.backfaces,
                frontface: this._state.frontface,
                collidable: this._state.collidable
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
