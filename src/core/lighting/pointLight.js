/**
 A **PointLight** defines a positional light source that originates from a single point and spreads outward in all directions, to illuminate
 attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>PointLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>PointLights have a position, but no direction.</li>

 <li>PointLights may be defined in either **World** or **View** coordinate space. When in World-space, their position
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their position is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.</li>

 <li>PointLights have {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.</li>

 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that PointLights create within xeoEngine's shaders.</li>

 </ul>

 <img src="../../../assets/images/PointLight.png"></img>

 ## Example

 In this example we have
 <ul>
 <li>a {{#crossLink "PhongMaterial"}}{{/crossLink}},</li>
 <li>a PointLight,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing the PointLight,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 <iframe style="width: 600px; height: 400px" src="../../examples/light_PointLight.html"></iframe>

 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.PhongMaterial(scene, {
        color: [1, 1, 1],
        intensity: 1
 });

 // Our PointLight's intensity does not attenuate over distance.

 var pointLight = new XEO.PointLight(scene, {
        pos: [0, 100, 100],
        color: [0.5, 0.7, 0.5],
        intensity: 1
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
 });

 var lights = new XEO.Lights(scene, {
        lights: [
            pointLight
        ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
        lights: lights,
        material: material,
        geometry: geometry
  });
 ````

 As with all components, we can <a href="XEO.Component.html#changeEvents" class="crosslink">observe and change properties</a> on PointLights like so:

 ````Javascript
 var handle = pointLight.on("color", // Attach a change listener to a property
 function(value) {
        // Property value has changed
    });

 pointLight.color = [0.4, 0.6, 0.4]; // Fires the change listener

 pointLight.off(handle); // Detach the change listener
 ````

 @class PointLight
 @module XEO
 @submodule lighting
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PointLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PointLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PointLight.
 @param [cfg.pos=[ 1.0, 1.0, 1.0 ]] {Array(Number)} Position, in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.color=[0.7, 0.7, 0.8 ]] {Array(Number)} Color of this PointLight.
 @param [cfg.intensity=1.0] {Number} Intensity of this PointLight.
 @param [cfg.constantAttenuation=0] {Number} Constant attenuation factor.
 @param [cfg.linearAttenuation=0] {Number} Linear attenuation factor.
 @param [cfg.quadraticAttenuation=0] {Number} Quadratic attenuation factor.
 @param [cfg.space="view"] {String} The coordinate system this PointLight is defined in - "view" or "space".
 */
(function () {

    "use strict";

    XEO.PointLight = XEO.Component.extend({

        type: "XEO.PointLight",

        _init: function (cfg) {

            this._state = {
                type: "point",
                pos: [1.0, 1.0, 1.0],
                color: [0.7, 0.7, 0.8],
                intensity:   1.0,
                constantAttenuation: 0.0,
                linearAttenuation: 0.0,
                quadraticAttenuation: 0.0,
                space: "view"
            };

            this.pos = cfg.pos;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
            this.constantAttenuation = cfg.constantAttenuation;
            this.linearAttenuation = cfg.linearAttenuation;
            this.quadraticAttenuation = cfg.quadraticAttenuation;
            this.space = cfg.space;
        },

        _props: {

            /**
             The position of this PointLight.

             This will be either World- or View-space, depending on the value of {{#crossLink "PointLight/space:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PointLight/pos:event"}}{{/crossLink}} event on change.

             @property pos
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            pos: {

                set: function (value) {

                    this._state.pos = value || [ 1.0, 1.0, 1.0 ];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/pos:property"}}{{/crossLink}} property changes.
                     @event pos
                     @param value The property's new value
                     */
                    this.fire("pos", this._state.pos);
                },

                get: function () {
                    return this._state.pos;
                }
            },

            /**
             The color of this PointLight.

             Fires a {{#crossLink "PointLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Array(Number)
             */
            color: {

                set: function (value) {

                    this._state.color = value || [ 0.7, 0.7, 0.8 ];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/color:property"}}{{/crossLink}} property changes.
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
             The intensity of this PointLight.

             Fires a {{#crossLink "PointLight/intensity:event"}}{{/crossLink}} event on change.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {

                set: function (value) {

                    value = value !== undefined ? value :  1.0;

                    this._state.intensity = value;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PointLight's  {{#crossLink "PointLight/intensity:property"}}{{/crossLink}} property changes.
                     * @event intensity
                     * @param value The property's new value
                     */
                    this.fire("intensity", this._state.intensity);
                },

                get: function () {
                    return this._state.intensity;
                }
            },

            /**
             The constant attenuation factor for this PointLight.

             Fires a {{#crossLink "PointLight/constantAttenuation:event"}}{{/crossLink}} event on change.

             @property constantAttenuation
             @default 0
             @type Number
             */
            constantAttenuation: {

                set: function (value) {

                    this._state.constantAttenuation = value || 0.0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PointLight's {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}} property changes.

                     @event constantAttenuation
                     @param value The property's new value
                     */
                    this.fire("constantAttenuation", this._state.constantAttenuation);
                },

                get: function () {
                    return this._state.constantAttenuation;
                }
            },

            /**
             The linear attenuation factor for this PointLight.

             Fires a {{#crossLink "PointLight/linearAttenuation:event"}}{{/crossLink}} event on change.

             @property linearAttenuation
             @default 0
             @type Number
             */
            linearAttenuation: {

                set: function (value) {

                    this._state.linearAttenuation = value || 0.0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} property changes.

                     @event linearAttenuation
                     @param value The property's new value
                     */
                    this.fire("linearAttenuation", this._state.linearAttenuation);
                },

                get: function () {
                    return this._state.linearAttenuation;
                }
            },

            /**
             The quadratic attenuation factor for this Pointlight.

             Fires a {{#crossLink "PointLight/quadraticAttenuation:event"}}{{/crossLink}} event on change.

             @property quadraticAttenuation
             @default 0
             @type Number
             */
            quadraticAttenuation: {

                set: function (value) {

                    this._state.quadraticAttenuation =  value || 0.0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PointLight's {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} property changes.

                     @event quadraticAttenuation
                     @param value The property's new value
                     */
                    this.fire("quadraticAttenuation", this._state.quadraticAttenuation);
                },

                get: function () {
                    return this._state.quadraticAttenuation;
                }
            },

            /**
             Indicates which coordinate space this PointLight is in.

             Supported values are:

             <ul>
             <li>"view" - View space, aligned within the view volume as if fixed to the viewer's head</li>
             <li>"world" - World space, fixed within the world, moving within the view volume with respect to camera</li>
             </ul>

             Fires a {{#crossLink "PointLight/space:event"}}{{/crossLink}} event on change.

             @property space
             @default "view"
             @type String
             */
            space: {

                set: function (value) {

                    this._state.space = value || "view";

                    this.fire("dirty", true); // Need to rebuild shader

                    /**
                     Fired whenever this Pointlight's  {{#crossLink "PointLight/space:property"}}{{/crossLink}} property changes.

                     @event space
                     @param value The property's new value
                     */
                    this.fire("space", this._state.space);
                },

                get: function () {
                    return this._state.space;
                }
            }
        },

        _getJSON: function () {
            return {
                type: this._state.type,
                pos: this._state.pos,
                color: this._state.color,
                intensity: this._state.intensity,
                constantAttenuation: this._state.constantAttenuation,
                linearAttenuation: this._state.linearAttenuation,
                quadraticAttenuation: this._state.quadraticAttenuation,
                space: this._state.space
            };
        }
    });

})();
