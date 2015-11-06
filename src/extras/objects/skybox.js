/**
 A **SkyBox** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the axis-aligned boundary of a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class SkyBox
 @module XEO
 @submodule objects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this SkyBox in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SkyBox.
 @param [cfg.boundary] {Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    XEO.SkyBox = XEO.Component.extend({

        _init: function (cfg) {

            this._super(cfg);

            this._texture = new XEO.Texture(this.scene, { // TODO: should be an emissiveMap?
                src: cfg.src
            });

            this._material = new XEO.PhongMaterial(this.scene, {
                diffuseMap: this._texture
            });

            this._geometry = new XEO.Geometry(this.scene, {
                primitive: "triangles",
                positions: [
                    5000, 5000, 5000, -5000, 5000, 5000, -5000, -5000, 5000, 5000, -5000, 5000, // v0-v1-v2-v3 front
                    5000, 5000, 5000, 5000, -5000, 5000, 5000, -5000, -5000, 5000, 5000, -5000, // v0-v3-v4-v5 right
                    5000, 5000, 5000, 5000, 5000, -5000, -5000, 5000, -5000, -5000, 5000, 5000, // v0-v5-v6-v1 top
                    -5000, 5000, 5000, -5000, 5000, -5000, -5000, -5000, -5000, -5000, -5000, 5000, // v1-v6-v7-v2 left
                    -5000, -5000, -5000, 5000, -5000, -5000, 5000, -5000, 5000, -5000, -5000, 5000, // v7-v4-v3-v2 bottom
                    5000, -5000, -5000, -5000, -5000, -5000, -5000, 5000, -5000, 5000, 5000, -5000 // v4-v7-v6-v5 back
                ],
                uv: [
                    0.5, 0.6666,
                    0.25, 0.6666,
                    0.25, 0.3333,
                    0.5, 0.3333,

                    0.5, 0.6666,
                    0.5, 0.3333,
                    0.75, 0.3333,
                    0.75, 0.6666,

                    0.5, 0.6666,
                    0.5, 1,
                    0.25, 1,
                    0.25, 0.6666,

                    0.25, 0.6666,
                    0.0, 0.6666,
                    0.0, 0.3333,
                    0.25, 0.3333,

                    0.25, 0,
                    0.50, 0,
                    0.50, 0.3333,
                    0.25, 0.3333,

                    0.75, 0.3333,
                    1.0, 0.3333,
                    1.0, 0.6666,
                    0.75, 0.6666
                ],
                indices: [
                    0, 1, 2,
                    0, 2, 3,
                    4, 5, 6,
                    4, 6, 7,
                    8, 9, 10,
                    8, 10, 11,
                    12, 13, 14,
                    12, 14, 15,

                    16, 17, 18,
                    16, 18, 19,

                    20, 21, 22,
                    20, 22, 23
                ]
            });

            this._object = new XEO.GameObject(this.scene, {
                material: this._material,
                geometry: this._geometry
            });
        },

        _props: {

            src: {

                set: function (value) {
                    this._texture.src = value;
                },

                get: function () {
                    return this._texture.src;
                }
            }
        },

        _getJSON: function () {
            return {
                src: this._material.diffuseMap.src
            };
        },

        _destroyed: function () {
            this._object.destroy();
            this._texture.destroy();
            this._material.destroy();
            this._geometry.destroy();
        }
    });

})();

