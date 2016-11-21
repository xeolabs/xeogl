/**
 A **Modes** toggles various xeogl modes and capabilities for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 * Though the rendering modes are defined by various different components attached to the {{#crossLink "Entity"}}Entities{{/crossLink}},
 Modes components provide a single point through which you can toggle them on or off.
 * A Modes may be shared among multiple {{#crossLink "Entity"}}Entities{{/crossLink}} to toggle
 rendering modes for them as a group.

 <img src="../../../assets/images/Modes.png"></img>

 ## Usage

 In this example we have a Modes that toggles rendering modes for two {{#crossLink "Entity"}}Entities{{/crossLink}}. The
 properties of the Modes are initialised to their default values.

 ````javascript
 // Create a Modes with default properties
 var modes = new xeogl.Modes(scene, {
    collidable: true,           // Include Entities in boundary calculations
    pickable: true,             // Enable picking
    clippable true,             // Enable effect of xeogl.Clip components
    transparent : false,        // Disable transparency
    backfaces : true,           // Render backfaces
    frontface : "ccw"
 });

 var boxGeometry = new xeogl.BoxGeometry();

 // Create two Entities whose rendering modes will be controlled by our Modes

 var entity1 = new xeogl.Entity({
     geometry: boxGeometry,
     modes: modes,
     translate: new xeogl.Translate({
        xyz: [3, 0, 0]
     })
 });

 var entity2 = new xeogl.Entity(scene, {
     geometry: boxGeometry,
     modes: modes,
     translate: new xeogl.Translate({
        xyz: [3, 0, 0]
     })
 });
 ````

 @class Modes
 @module xeogl
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Modes in the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Modes.
 @param [cfg.pickable=true] {Boolean}  Whether to enable picking.
 @param [cfg.clippable=true] {Boolean} Whether to enable clippable by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.transparent=false] {Boolean} Whether to enable the transparency effect created by {{#crossLink "Material"}}Material{{/crossLink}}s when they have
 {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} < 1.0. This mode will set attached {{#crossLink "Entity"}}Entities{{/crossLink}} transparent (ie. to be rendered in a
 transparency pass with blending enabled etc), while
 the {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} will indicate the **degree** of their transparency
 (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).
 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 @param [cfg.collidable=true] {Boolean} Whether attached {{#crossLink "Entity"}}Entities{{/crossLink}} are included in boundary-related calculations. Set this false if the
 {{#crossLink "Entity"}}Entities{{/crossLink}} are things like helpers or indicators that should not be included in boundary calculations.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Modes = xeogl.Component.extend({

        type: "xeogl.Modes",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Modes({
                pickable: null,
                clippable: null,
                transparent: null,
                backfaces: null,
                frontface: null, // Boolean for speed; true == "ccw", false == "cw"
                collidable: null
            });

            this.pickable = cfg.pickable;
            this.clippable = cfg.clippable;
            this.transparent = cfg.transparent;
            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;
            this.collidable = cfg.collidable;
        },

        _props: {

            /**
             Whether this Modes enables picking of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             Picking is performed via calls to {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}.

             Fires a {{#crossLink "Modes/pickable:event"}}{{/crossLink}} event on change.

             @property pickable
             @default true
             @type Boolean
             */
            pickable: {

                set: function (value) {

                    value = value !== false;

                    if (this._state.pickable === value) {
                        return;
                    }

                    this._state.pickable = value;

                    // No need to trigger a render;
                    // state is only used when picking

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
             Whether this Modes enables clippable of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             clippable is done by {{#crossLink "Clips"}}{{/crossLink}} that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             Fires a {{#crossLink "Modes/clippable:event"}}{{/crossLink}} event on change.

             @property clippable
             @default true
             @type Boolean
             */
            clippable: {

                set: function (value) {

                    value = value !== false;

                    if (this._state.clippable === value) {
                        return;
                    }

                    this._state.clippable = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes' {{#crossLink "Modes/clippable:property"}}{{/crossLink}} property changes.

                     @event clippable
                     @param value The property's new value
                     */
                    this.fire("clippable", this._state.clippable);
                },

                get: function () {
                    return this._state.clippable;
                }
            },

            /**
             Whether this Modes sets attached {{#crossLink "Entity"}}Entities{{/crossLink}} transparent.

             When true. this property will set attached {{#crossLink "Entity"}}Entities{{/crossLink}} transparent (ie. to be rendered in a
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

                    value = !!value;

                    if (this._state.transparent === value) {
                        return;
                    }

                    this._state.transparent = value;

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
             Whether this Modes enables backfaces to be visible on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             Fires a {{#crossLink "Modes/backfaces:event"}}{{/crossLink}} event on change.

             @property backfaces
             @default false
             @type Boolean
             */
            backfaces: {

                set: function (value) {

                    value = !!value;

                    if (this._state.backfaces === value) {
                        return;
                    }

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
             Indicates the winding direction of front faces on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             Fires a {{#crossLink "Modes/frontface:event"}}{{/crossLink}} event on change.

             @property frontface
             @default "ccw"
             @type String
             */
            frontface: {

                set: function (value) {

                    value = value !== "cw";

                    if (this._state.frontface === value) {
                        return;
                    }

                    this._state.frontface = value;

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
             Whether attached {{#crossLink "Entity"}}Entities{{/crossLink}} are included
             in boundary-related calculations.

             Set this false if the
             {{#crossLink "Entity"}}Entities{{/crossLink}} are things like helpers or indicators that should not be included in boundary calculations.

             For example, when set false, the {{#crossLink "Entity/worldBoundary:property"}}World-space boundary{{/crossLink}} of all attached {{#crossLink "Entity"}}Entities{{/crossLink}} would not be considered when calculating the {{#crossLink "Scene/worldBoundary:property"}}World-space boundary{{/crossLink}} of their
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
                clippable: this._state.clippable,
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
