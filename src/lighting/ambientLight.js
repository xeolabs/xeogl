/**
 An **AmbientLight** defines an ambient light source of fixed intensity and color that affects all attached {{#crossLink "Entity"}}Entities{{/crossLink}}
 equally.

 <a href="../../examples/#lights_ambient"><img src="http://i.giphy.com/l0HlGTxXQWMRVOPwk.gif"></img></a>

 ## Overview

 * AmbientLights are grouped, along with other light source types, within
 {{#crossLink "Lights"}}Lights{{/crossLink}} components, which are attached to {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * When the {{#crossLink "Entity"}}Entities{{/crossLink}} have {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}},
 AmbientLight {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}} is multiplied by
 {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}} {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} at each rendered fragment of the {{#crossLink "Geometry"}}{{/crossLink}} surface.

 <img src="../../../assets/images/AmbientLight.png"></img>

 ## Examples

 * [Ambient light source](../../examples/#lights_ambient)

 ## Usage

 ```` javascript
 var entity = new xeogl.Entity({

     lights: new xeogl.Lights({
         lights: [
             new xeogl.AmbientLight({
                 color: [0.7, 0.7, 0.7]
             })
         ]
     }),

     material: new xeogl.PhongMaterial({
        diffuse: [0.5, 0.5, 0.0]
     }),

     geometry: new xeogl.BoxGeometry()
 });
 ````

 @class AmbientLight
 @module xeogl
 @submodule lighting
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this AmbientLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} AmbientLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AmbientLight.
 @param [cfg.color=[0.7, 0.7, 0.8]] {Array(Number)} The color of this AmbientLight.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.AmbientLight = xeogl.Component.extend({

        type: "xeogl.AmbientLight",

        _init: function (cfg) {

            this._state = {
                type: "ambient",
                color: xeogl.math.vec3([0.7, 0.7, 0.7]),
                intensity: 1.0
            };

            this.color = cfg.color;
            this.intensity = cfg.intensity;
        },

        _props: {

            /**
             The color of this AmbientLight.

             Fires an {{#crossLink "AmbientLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    this._state.color.set(value ||  [ 0.7, 0.7, 0.8 ]);

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this AmbientLight's {{#crossLink "AmbientLight/color:property"}}{{/crossLink}} property changes.

                     @event color
                     @param value The property's new value
                     */
                    this.fire("color", this._state.color);
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
             The intensity of this AmbientLight.

             Fires a {{#crossLink "AmbientLight/intensity:event"}}{{/crossLink}} event on change.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {

                set: function (value) {

                    this._state.intensity = value !== undefined ? value :  1.0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this AmbientLight's  {{#crossLink "AmbientLight/intensity:property"}}{{/crossLink}} property changes.
                     * @event intensity
                     * @param value The property's new value
                     */
                    this.fire("intensity", this._state.intensity);
                },

                get: function () {
                    return this._state.intensity;
                }
            }
        },

        _getJSON: function () {
            return {
                color: this._state.color,
                intensity: this._state.intensity
            };
        }
    });

})();
