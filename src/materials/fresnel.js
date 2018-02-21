/**
 A **Fresnel** specifies a Fresnel effect for attached {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}}.

 <a href="../../examples/#materials_phong_fresnel"><img src="../../assets/images/screenshots/PhongMaterial/fresnelWide.png"></img></a>

 ## Overview

 * Fresnels are grouped within {{#crossLink "PhongMaterial"}}{{/crossLink}}s, which are attached to
 {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Examples

 * [PhongMaterials with Fresnels](../../examples/#materials_phong_fresnel)

 <img src="../../../assets/images/Fresnel.png"></img>

 ## Usage

 ````javascript
 var entity = new xeogl.Entity({

     material: new xeogl.PhongMaterial({
         ambient: [0.3, 0.3, 0.3],
         shininess: 30,

         diffuseFresnel: new xeogl.Fresnel({
             edgeColor: [1.0, 1.0, 1.0],
             centerColor: [0.0, 0.0, 0.0],
             power: 4,
             bias: 0.6
         }),

         specularFresnel: new xeogl.Fresnel({
             edgeColor: [1.0, 1.0, 1.0],
             centerColor: [0.0, 0.0, 0.0],
             power: 4,
             bias: 0.2
         })
     }),

     new xeogl.TorusGeometry()
 });
 ````

 @class Fresnel
 @module xeogl
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

    xeogl.Fresnel = xeogl.Component.extend({

        type: "xeogl.Fresnel",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Fresnel({
                edgeColor: xeogl.math.vec3([0, 0, 0]),
                centerColor: xeogl.math.vec3([1, 1, 1]),
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

             @property edgeColor
             @default [0.0, 0.0, 0.0]
             @type Float32Array
             */
            edgeColor: {

                set: function (value) {

                    this._state.edgeColor.set(value || [0.0, 0.0, 0.0]);

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.edgeColor;
                }
            },

            /**
             This Fresnel's center color.

             @property centerColor
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            centerColor: {

                set: function (value) {

                    this._state.centerColor.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.centerColor;
                }
            },

            /**
             * Indicates this Fresnel's edge bias.
             *
             * @property edgeBias
             * @default 0
             * @type Number
             */
            edgeBias: {

                set: function (value) {

                    this._state.edgeBias = value || 0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.edgeBias;
                }
            },

            /**
             * Indicates this Fresnel's center bias.
             *
             * @property centerBias
             * @default 1
             * @type Number
             */
            centerBias: {

                set: function (value) {

                    this._state.centerBias = (value !== undefined && value !== null) ? value : 1;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.centerBias;
                }
            },

            /**
             * Indicates this Fresnel's power.
             *
             * @property power
             * @default 1
             * @type Number
             */
            power: {

                set: function (value) {

                    this._state.power = (value !== undefined && value !== null) ? value : 1;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.power;
                }
            }
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
