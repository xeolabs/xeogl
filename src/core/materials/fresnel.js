/**
 A **Fresnel** specifies a Fresnel effect.

 ## Overview

 <ul>
 <li>Fresnels are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Fresnels create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Fresnel.png"></img>

 ## Example

 The example below has:
 <ul>
 <li>two Fresnels,</li>
 <li>a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies the {{#crossLink "Fresnel"}}{{/crossLink}}s to diffuse and specular shading,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that has the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var fresnel1 = new XEO.Fresnel(scene, {
    leftColor: [1.0, 1.0, 1.0],
    rightColor: [0.0, 0.0, 0.0],
    power: 4,
    bias: 0.6
});

 var fresnel2 = new XEO.Fresnel(scene, {
    leftColor: [1.0, 1.0, 1.0],
    rightColor: [0.0, 0.0, 0.0],
    power: 4,
    bias: 0.2
});

 var material = new XEO.PhongMaterial(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess: 30,
    diffuseFresnel: fresnel1,
    specularFresnel: fresnel3
});

 var light1 = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0]
});

 var light2 = new XEO.AmbientLight(scene, {
    color: [0.5, 0.7, 0.5]
});

 var lights = new XEO.Lights(scene, {
    lights: [
        light1,
        light2
    ]
});

 // Geometry without parameters will default to a 2x2x2 box.
 var geometry = new XEO.Geometry(scene);

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````

 @class Fresnel
 @module XEO
 @submodule materials
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Fresnel.
 @param [cfg.leftColor=[ 0.0, 0.0, 0.0 ]] {Array of Number} Color used on edges.
 @param [cfg.rightColor=[ 0.0, 0.0, 0.0 ]] {Array of Number} Color used on center.
 @param [cfg.power=0] {Number} The power.
 @param [cfg.bias=0] {Number} The bias.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Fresnel = XEO.Component.extend({

        type: "XEO.Fresnel",

        _init: function (cfg) {

            this._state = new XEO.renderer.Fresnel({
                leftColor: [1,1,1],
                rightColor: [0,0,0],
                power: 1,
                bias: 0
            });

            this.leftColor = cfg.leftColor;
            this.rightColor = cfg.rightColor;
            this.power = cfg.power;
            this.bias = cfg.bias;
        },

        _props: {

            /**
             This Fresnel's edge color.

             Fires an {{#crossLink "Fresnel/leftColor:event"}}{{/crossLink}} event on change.

             @property leftColor
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            leftColor: {

                set: function (value) {

                    this._state.leftColor = value || [ 0.0, 0.0, 0.0 ];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Fresnel's {{#crossLink "leftColorLight/leftColor:property"}}{{/crossLink}} property changes.

                     @event leftColor
                     @param value The property's new value
                     */
                    this.fire("leftColor", this._state.leftColor);
                },

                get: function () {
                    return this._state.leftColor;
                }
            },

            /**
             This Fresnel's center color.

             Fires an {{#crossLink "Fresnel/rightColor:event"}}{{/crossLink}} event on change.

             @property rightColor
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            rightColor: {

                set: function (value) {

                    this._state.rightColor = value || [ 0.0, 0.0, 0.0 ];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Fresnel's {{#crossLink "rightColorLight/rightColor:property"}}{{/crossLink}} property changes.

                     @event rightColor
                     @param value The property's new value
                     */
                    this.fire("rightColor", this._state.rightColor);
                },

                get: function () {
                    return this._state.rightColor;
                }
            },

            /**
             * Indicates this Fresnel's power.
             *
             * Fires a {{#crossLink "Fresnel/power:event"}}{{/crossLink}} event on change.
             *
             * @property power
             * @default 1
             * @type Number
             */
            power: {

                set: function (value) {

                    this._state.power = value || 0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Fresnel's  {{#crossLink "Fresnel/power:property"}}{{/crossLink}} property changes.
                     *
                     * @event power
                     * @param value The property's new value
                     */
                    this.fire("power", this._state.power);
                },

                get: function () {
                    return this._state.power;
                }
            },

            /**
             * Indicates this Fresnel's bias.
             *
             * Fires a {{#crossLink "Fresnel/bias:event"}}{{/crossLink}} event on change.
             *
             * @property bias
             * @default 0
             * @type Number
             */
            bias: {

                set: function (value) {

                    this._state.bias = value || 0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Fresnel's  {{#crossLink "Fresnel/bias:property"}}{{/crossLink}} property changes.
                     *
                     * @event bias
                     * @param value The property's new value
                     */
                    this.fire("bias", this._state.bias);
                },

                get: function () {
                    return this._state.bias;
                }
            }
        },

        _getJSON: function () {
            return {
                leftColor: this._state.leftColor,
                rightColor: this._state.rightColor,
                power: this._state.power,
                bias: this._state.bias
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
