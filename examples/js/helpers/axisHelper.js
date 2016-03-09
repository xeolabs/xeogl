/**
 A **AxisHelper** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the axis-aligned boundary of a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class AxisHelper
 @module XEO
 @submodule helpers
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this AxisHelper in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AxisHelper.
 @param [cfg.boundary] {Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    XEO.AxisHelper = XEO.Entity.extend({

        type: "XEO.AxisHelper",

        _init: function (cfg) {

            this._super(cfg);

            this._c = [];

            var arrowGeometry = this._push(new XEO.LatheGeometry(this.scene, {
                primitive: "triangles",
                points: [
                    [0, 0, 10],
                    [-1.5, 0, 7],
                    [-.5, 0, 7.1],
                    [-.5, 0, 0],
                    [0, 0, 0]
                ],
                segments: 30,
                phiStart: 0,
                phiLength: 360
            }));

            this._push(new XEO.Entity(this.scene, {
                geometry: arrowGeometry,
                material: this._push(new XEO.PhongMaterial(this.scene, {
                    diffuse: [1, 0, 0]
                })),
                transform: this._push(new XEO.Rotate(this.scene, {
                    xyz: [1, 0, 0],
                    angle: 0
                }))
            }));

            this._push(new XEO.Entity(this.scene, {
                geometry: arrowGeometry,
                material: this._push(new XEO.PhongMaterial(this.scene, {
                    diffuse: [0, 1, 0]
                })),
                transform: this._push(new XEO.Rotate(this.scene, {
                    xyz: [1, 0, 0],
                    angle: 90
                }))
            }));

            this._push(new XEO.Entity(this.scene, {
                geometry: arrowGeometry,
                material: this._push(new XEO.PhongMaterial(this.scene, {
                    diffuse: [0, 0, 1]
                })),
                transform: this._push(new XEO.Rotate(this.scene, {
                    xyz: [0, 1, 0],
                    angle: 90
                }))
            }));

            this._push(new XEO.Entity(this.scene, {
                geometry: this._push(new XEO.Sphere(this.scene, {
                    radius: 1.0
                })),
                material: this._push(new XEO.PhongMaterial(this.scene, {
                    diffuse: [1, 1, 0]
                }))
            }));

            this._push(new XEO.Entity(this.scene, {
                geometry: this._push(new XEO.PlaneGeometry(this.scene, {
                    xSize: 100,
                    zSize: 100
                })),
                material: this._push(new XEO.PhongMaterial(this.scene, {
                    diffuse: [1, 1, 0]
                }))
            }));
        },

        _push: function (c) {
            this._c.push(c);
            return c;
        },

        _destroyed: function () {
            while (this._c.length > 0) {
                this._c.pop().destroy();
            }
        }
    });

})();
