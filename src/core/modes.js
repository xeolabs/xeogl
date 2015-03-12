(function () {

    "use strict";


    /**
     A **Modes** toggles xeoEngine's rendering modes for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     <ul>

     <li>Though the rendering modes are defined by various different components attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}},
     Modes components provide a single point through which you can toggle them on or off.</li>

     <li>A Modes may be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to toggle
     rendering modes for them as a group.</li>

     </ul>

     <img src="http://www.gliffy.com/go/publish/image/7123073/L.png"></img>

     ### Example

     In this example we have a Modes that toggles rendering modes for
     two {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. The properties of the Modes are initialised to their
     default values.

     ````javascript

     // Create a scene
     var scene = new XEO.Scene();

     // Create a Modes with default properties
     var modes = new XEO.Modes(scene, {
        picking: true,              // Enable picking
        clipping true,              // Enable effect of XEO.Clip components
        transparent : false,        // Disable transparency
        backfaces : true,           // Render backfaces
        frontface : "ccw",          // Frontfaces have counter-clockwise vertex
        backfaceLighting : true,    // Enable backface lighting
        backfaceTexturing : true,   // Enable backfaces texturing
        diffuse : true,             // Enable diffuse lighting
        specular : true,            // Enable specular lighting
        ambient : true,             // Enable ambient lighting
        reflection : true           // Enable reflections
  });

     // Create two GameObjects whose rendering modes will be controlled by our Modes

     var object1 = new XEO.GameObject(scene, {
       modes: modes
  });

     var object2 = new XEO.GameObject(scene, {
       modes: modes
  });

     // Subscribe to change on the Modes' "specular" property
     var handle = modes.on("specular", function(value) {
       //...
  });

     // Disable specular lighting on our GameObjects by flipping the Modes' "specular" property,
     // which will also call our handler
     modes.specular = false;

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
     @param [cfg.backfaceLighting=true] {Boolean} Whether to apply {{#crossLink "Lights"}}Lights{{/crossLink}} to {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces
     @param [cfg.backfaceTexturing=true] {Boolean} Whether to apply {{#crossLink "Texture"}}Textures{{/crossLink}} to {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces
     @param [cfg.diffuse=true] {Boolean} Whether to enable diffuse contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
     @param [cfg.specular=true] {Boolean} Whether to enable specular contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
     @param [cfg.ambient=true] {Boolean} Whether to enable ambient contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
     @param [cfg.reflection=true] {Boolean} Whether to enable reflections created by {{#crossLink "Reflection"}}{{/crossLink}}s
     @extends Component
     */
    XEO.Modes = XEO.Component.extend({

        className: "XEO.Modes",

        type: "modes",

        _init: function (cfg) {

            this.picking = cfg.picking;
            this.clipping = cfg.clipping;
            this.transparent = cfg.transparent;
            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;
            this.backfaceLighting = cfg.backfaceLighting;
            this.backfaceTexturing = cfg.backfaceTexturing;
            this.diffuse = cfg.diffuse;
            this.specular = cfg.specular;
            this.ambient = cfg.ambient;
            this.reflection = cfg.reflection;
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
            },

            /**
             Whether this Modes enables lighting on the backfaces of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The lights and geometry will be defined by {{#crossLink "Lights"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
             that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/backfaceLighting:event"}}{{/crossLink}} event on change.

             @property backfaceLighting
             @default true
             @type Boolean
             */
            backfaceLighting: {

                set: function (value) {
                    value = value !== false;
                    this._state.backfaceLighting = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/backfaceLighting:property"}}{{/crossLink}} property changes.
                     @event backfaceLighting
                     @param value The property's new value
                     */
                    this.fire("backfaceLighting", value);
                },

                get: function () {
                    return this._state.backfaceLighting;
                }
            },

            /**
             Whether this Modes enables textures to be applied to the backfaces of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The textures and geometry will be defined by {{#crossLink "Texture"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
             that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/backfaceTexturing:event"}}{{/crossLink}} event on change.

             @property backfaceTexturing
             @default true
             @type Boolean
             */
            backfaceTexturing: {

                set: function (value) {
                    value = value !== false;
                    this._state.backfaceTexturing = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/backfaceTexturing:property"}}{{/crossLink}} property changes.
                     @event backfaceTexturing
                     @param value The property's new value
                     */
                    this.fire("backfaceTexturing", value);
                },

                get: function () {
                    return this._state.backfaceTexturing;
                }
            },

            /**
             Whether this Modes enables diffuse lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Lighting will be defined by {{#crossLink "Lights"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
             that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/diffuse:event"}}{{/crossLink}} event on change.

             @property diffuse
             @default true
             @type Boolean
             */
            diffuse: {

                set: function (value) {
                    value = value !== false;
                    this._state.diffuse = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/diffuse:property"}}{{/crossLink}} property changes.
                     @event diffuse
                     @param value The property's new value
                     */
                    this.fire("diffuse", value);
                },

                get: function () {
                    return this._state.diffuse;
                }
            },

            /**
             Whether this Modes enables specular lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Lighting will be defined by {{#crossLink "Lights"}}{{/crossLink}} components that are also attached to
             the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default true
             @type Boolean
             */
            specular: {

                set: function (value) {
                    value = value !== false;
                    this._state.specular = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/specular:property"}}{{/crossLink}} property changes.
                     @event specular
                     @param value The property's new value
                     */
                    this.fire("specular", value);
                },

                get: function () {
                    return this._state.specular;
                }
            },

            /**
             Whether this Modes enables ambient lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The ambient lighting will be provided by {{#crossLink "AmbientLight"}}{{/crossLink}} components that are also
             attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/ambient:event"}}{{/crossLink}} event on change.

             @property ambient
             @default true
             @type Boolean
             */
            ambient: {

                set: function (value) {
                    value = value !== false;
                    this._state.ambient = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/ambient:property"}}{{/crossLink}} property changes.
                     @event ambient
                     @param value The property's new value
                     */
                    this.fire("ambient", value);
                },

                get: function () {
                    return this._state.ambient;
                }
            },

            /**
             Whether this Modes enables reflections on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             The reflections will be defined by {{#crossLink "CubeMap"}}{{/crossLink}} components that are also attached
             to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

             Fires a {{#crossLink "Modes/reflection:event"}}{{/crossLink}} event on change.

             @property reflection
             @default true
             @type Boolean
             */
            reflection: {

                set: function (value) {
                    value = value !== false;
                    this._state.reflection = value;
                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Modes'' {{#crossLink "Modes/reflection:property"}}{{/crossLink}} property changes.
                     @event reflection
                     @param value The property's new value
                     */
                    this.fire("reflection", value);
                },

                get: function () {
                    return this._state.reflection;
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
                frontface: this.frontface,
                backfaceLighting: this.backfaceLighting,
                backfaceTexturing: this.backfaceTexturing,
                diffuse: this.diffuse,
                specular: this.specular,
                ambient: this.ambient,
                reflection: this.reflection
            };
        }
    });

})();


