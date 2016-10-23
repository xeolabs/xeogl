/**
 A **PointLightHelper** shows a visual indicator for a {{#crossLink "PointLight"}}{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class PointLightHelper
 @module xeogl
 @submodule entities
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this PointLightHelper in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PointLightHelper.
 @extends Entity
 */
(function () {

    "use strict";

    xeogl.PointLightHelper = xeogl.Component.extend({

        type: "xeogl.PointLightHelper",

        _init: function (cfg) {

            this._sphere = this.create(xeogl.Entity, {
                geometry: this.create(xeogl.SphereGeometry, {
                    radius: 0.5
                }, "sphere"),
                material: this.create(xeogl.PhongMaterial, {
                    emissive: [1, 1, 1]
                }),
                transform: this.create(xeogl.Translate, {
                    xyz: cfg.pos || [0, 0, 0]
                })
            });

            this.pointLight = cfg.pointLight;
        },

        _props: {

            /**
             * The {{#crossLink "PointLight"}}PointLight{{/crossLink}} attached to this PointLightHelper.
             *
             * Fires an {{#crossLink "PointLightHelper/pointLight:event"}}{{/crossLink}} event on change.
             *
             * @property pointLight
             * @type PointLight
             */
            pointLight: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "pointLight",
                        type: "xeogl.PointLight",
                        component: value,
                        on: {
                            pos: function (pos) {
                                self._sphere.transform.xyz = pos;
                            },
                            color: function (color) {
                                self._sphere.material.emissive = color;
                            },
                            intensity: function (intensity) {
                                // TODO: How to represent?
                            },
                            quadraticAttenuation: function (quadraticAttenuation) {
                                // TODO: How to represent?
                            }
                        }
                    });

                    this._info.geometry.text = value ? JSON.stringify(value.json, "\t", 4) : "";
                },

                get: function () {
                    return this._children.pointLight;
                }
            }
        }
    });
})();
