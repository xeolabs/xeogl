/**
 A **Fresnel** specifies a Fresnel effect.

 ## Overview

 <ul>
 <li>Fresnels are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "Entity"}}Entities{{/crossLink}}.</li>
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
 <li>an {{#crossLink "Entity"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var fresnel1 = new XEO.Fresnel(scene, {
    edgeColor: [1.0, 1.0, 1.0],
    centerColor: [0.0, 0.0, 0.0],
    power: 4,
    bias: 0.6
});

 var fresnel2 = new XEO.Fresnel(scene, {
    edgeColor: [1.0, 1.0, 1.0],
    centerColor: [0.0, 0.0, 0.0],
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

 var entity = new XEO.Entity(scene, {
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
 @param [cfg.edgeColor=[ 0.0, 0.0, 0.0 ]] {Array of Number} Color used on edges.
 @param [cfg.centerColor=[ 1.0, 1.0, 1.0 ]] {Array of Number} Color used on center.
 @param [cfg.edgeBias=0] {Number} Bias at the edge.
 @param [cfg.centerBias=1] {Number} Bias at the center.
 @param [cfg.power=0] {Number} The power.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Fresnel = XEO.Component.extend({

        type: "XEO.Fresnel",

        _init: function (cfg) {

            this._state = new XEO.renderer.Fresnel({
                edgeColor: [0, 0, 0],
                centerColor: [1, 1, 1],
                edgeBias: 0,
                centerBias: 1,
                power: 1
            });

            this.edgeColor = cfg.edgeColor;
            this.centerColor = cfg.centerColor;
            this.edgeBias = cfg.edgeBias;
            this.centerBias = cfg.centerBias;
            this.power = cfg.power;
        },

        _props: {

            /**
             This Fresnel's edge color.

             Fires an {{#crossLink "Fresnel/edgeColor:event"}}{{/crossLink}} event on change.

             @property edgeColor
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            edgeColor: {

                set: function (value) {

                    this._state.edgeColor = value || [0.0, 0.0, 0.0];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Fresnel's {{#crossLink "Fresnel/edgeColor:property"}}{{/crossLink}} property changes.

                     @event edgeColor
                     @param value The property's new value
                     */
                    this.fire("edgeColor", this._state.edgeColor);
                },

                get: function () {
                    return this._state.edgeColor;
                }
            },

            /**
             This Fresnel's center color.

             Fires an {{#crossLink "Fresnel/centerColor:event"}}{{/crossLink}} event on change.

             @property centerColor
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            centerColor: {

                set: function (value) {

                    this._state.centerColor = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Fresnel's {{#crossLink "Fresnel/centerColor:property"}}{{/crossLink}} property changes.

                     @event centerColor
                     @param value The property's new value
                     */
                    this.fire("centerColor", this._state.centerColor);
                },

                get: function () {
                    return this._state.centerColor;
                }
            },

            /**
             * Indicates this Fresnel's edge bias.
             *
             * Fires a {{#crossLink "Fresnel/edgeBias:event"}}{{/crossLink}} event on change.
             *
             * @property edgeBias
             * @default 0
             * @type Number
             */
            edgeBias: {

                set: function (value) {

                    this._state.edgeBias = value || 0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Fresnel's {{#crossLink "Fresnel/edgeBias:property"}}{{/crossLink}} property changes.
                     *
                     * @event edgeBias
                     * @param value The property's new value
                     */
                    this.fire("edgeBias", this._state.edgeBias);
                },

                get: function () {
                    return this._state.edgeBias;
                }
            },

            /**
             * Indicates this Fresnel's center bias.
             *
             * Fires a {{#crossLink "Fresnel/centerBias:event"}}{{/crossLink}} event on change.
             *
             * @property centerBias
             * @default 1
             * @type Number
             */
            centerBias: {

                set: function (value) {

                    this._state.centerBias = (value !== undefined && value !== null) ? value : 1;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Fresnel's {{#crossLink "Fresnel/centerBias:property"}}{{/crossLink}} property changes.
                     *
                     * @event centerBias
                     * @param value The property's new value
                     */
                    this.fire("centerBias", this._state.centerBias);
                },

                get: function () {
                    return this._state.centerBias;
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

                    this._state.power = (value !== undefined && value !== null) ? value : 1;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Fresnel's {{#crossLink "Fresnel/power:property"}}{{/crossLink}} property changes.
                     *
                     * @event power
                     * @param value The property's new value
                     */
                    this.fire("power", this._state.power);
                },

                get: function () {
                    return this._state.power;
                }
            }
        },

        _getJSON: function () {
            return {
                edgeColor: this._state.edgeColor,
                centerColor: this._state.centerColor,
                edgeBias: this._state.edgeBias,
                centerBias: this._state.centerBias,
                power: this._state.power
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
