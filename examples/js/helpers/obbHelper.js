/**

 Helper that visualizes the object-aligned boundary of a target {{#crossLink "Component"}}{{/crossLink}} subtype with a World-space object-aligned boundary (OBB).

 @class OBBHelper
 @constructor
 @param cfg {*} Configuration
 @param [cfg.target] {Number|String|Component} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} subtype with a World-space object-aligned boundary (OBB).
 @param [cfg.color=[0.4,0.4,0.4]] {Float32Array} Emmissive color
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.

 */
(function () {

    "use strict";

    xeogl.OBBHelper = xeogl.Component.extend({

        type: "xeogl.OBBHelper",

        _init: function (cfg) {

            this._box = new xeogl.Entity(this, {
                geometry: new xeogl.OBBGeometry(this),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [1, 0, 0],
                    diffuse: [0, 0, 0],
                    lineWidth: 4
                }),
                pickable: false,
                collidable: false,
                clippable: false
            });

            this.target = cfg.target;
            this.color = cfg.color;
            this.visible = cfg.visible;
        },

        _props: {

            /**
             * The target {{#crossLink "Component"}}{{/crossLink}} subtype.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollowAnimation. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}} when set to a null or undefined value.
             *
             * @property target
             * @type Component
             */
            target: {

                set: function (target) {
                    this._box.geometry.target = target;
                },

                get: function () {
                    return this._box.geometry.target;
                }
            },

            /**
             * Emissive color of this OBBHelper.
             *
             * @property color
             * @default [0,1,0]
             * @type {Float32Array}
             */
            color: {

                set: function (value) {
                    this._box.material.emissive = value || [0, 1, 0];
                },

                get: function () {
                    return this._box.emissive;
                }
            },

            /**
             Indicates whether this OBBHelper is visible or not.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {
                    this._box.visible = value !== false;
                },

                get: function () {
                    return this._box.visible;
                }
            }
        }
    });
})();