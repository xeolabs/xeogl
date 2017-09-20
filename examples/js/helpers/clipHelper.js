/**

 Helper that visualizes the position and direction of a {{#crossLink "Clip"}}{{/crossLink}}.

 The helper works by tracking updates to the {{#crossLink "Clip"}}{{/crossLink}}'s
 {{#crossLink "Clip/pos:property"}}{{/crossLink}} and {{#crossLink "Clip/dir:property"}}{{/crossLink}}.

 @class ClipHelper
 @constructor
 @param cfg {*} Configuration
 @param cfg.clip {Clip} A {{#crossLink "Clip"}}{{/crossLink}} to visualize.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 */
(function () {

    "use strict";

    xeogl.ClipHelper = xeogl.Component.extend({

        type: "xeogl.ClipHelper",

        _init: function (cfg) {

            var material = new xeogl.PhongMaterial(this, {
                emissive: [1, 0, 0],
                diffuse: [0, 0, 0],
                lineWidth: 4
            });

            var transform = new xeogl.Quaternion(this, {
                xyzw: [0, 0, 0, 1],
                parent: new xeogl.Translate(this, {
                    xyz: [0, 0, 0]
                })
            });

            this._plane = new xeogl.Entity(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "lines",
                    positions: [
                        0.5, 0.5, 0.0, 0.5, -0.5, 0.0, // 0
                        -0.5, -0.5, 0.0, -0.5, 0.5, 0.0, // 1
                        0.5, 0.5, -0.0, 0.5, -0.5, -0.0, // 2
                        -0.5, -0.5, -0.0, -0.5, 0.5, -0.0 // 3
                    ],
                    indices: [0, 1, 0, 3, 1, 2, 2, 3]
                }),
                material: material,
                transform: transform,
                pickable: false,
                collidable: true,
                clippable: false
            });

            this._arrow = new xeogl.Entity(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "lines",
                    positions: [
                        1.0, 1.0, 1.0, 1.0, -1.0, 1.0
                    ],
                    indices: [0, 1]
                }),
                material: material,
                pickable: false,
                collidable: false,
                clippable: false
            });

            this._label = new xeogl.Entity(this, {
                geometry: new xeogl.VectorTextGeometry(this, {
                    text: this.id,
                    size: 0.07,
                    origin: [0.02, 0.02, 0.0]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [0.3, 1, 0.3],
                    lineWidth: 2
                }),
                transform: transform, // Shares transform with plane
                pickable: false,
                collidable: false,
                clippable: false,
                billboard: "spherical"
            });

            this.clip = cfg.clip;
            this.visible = cfg.visible;
        },

        _update: (function () {
            var positions = new Float32Array(6);
            var zeroVec = new Float32Array([0, 0, -1]);
            var quat = new Float32Array(4);
            return function () {

                var clip = this._attached.clip;

                if (clip) {

                    var pos = clip.pos;
                    var dir = clip.dir;

                    positions[0] = pos[0];
                    positions[1] = pos[1];
                    positions[2] = pos[2];
                    positions[3] = pos[0] + dir[0];
                    positions[4] = pos[1] + dir[1];
                    positions[5] = pos[2] + dir[2];

                    this._arrow.geometry.positions = positions;

                    xeogl.math.vec3PairToQuaternion(zeroVec, dir, quat);

                    this._plane.transform.xyzw = quat;
                    this._plane.transform.parent.xyz = pos;
                }
            };
        })(),

        _props: {

            /**
             * The {{#crossLink "Clip"}}Clip{{/crossLink}} attached to this ClipHelper.
             *
             * Fires an {{#crossLink "ClipHelper/Clip:event"}}{{/crossLink}} event on change.
             *
             * @property clip
             * @type Clip
             */
            clip: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "clip",
                        type: "xeogl.Clip",
                        component: value,
                        on: {
                            pos: function (pos) {
                                self._needUpdate();
                            },
                            dir: function (dir) {
                                self._needUpdate();
                            },
                            active: function (active) {
                                var emissive = active ? [0.3, 1.0, 0.3] : [0.3, 0.3, 0.3];
                                self._plane.material.emissive = emissive;
                                self._arrow.material.emissive = emissive;
                            },
                            side: function (quadraticAttenuation) {
                            }
                        }
                    });

                    if (this._attached.clip) {
                        this._label.geometry.text = this._attached.clip.id;
                    }
                },

                get: function () {
                    return this._attached.clip;
                }
            },

            /**
             Indicates whether this ClipHelper is visible or not.

             Fires a {{#crossLink "ClipHelper/active:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    value = value !== false;

                    this._plane.visible = value;
                    this._arrow.visible = value;
                    this._label.visible = value;

                    /**
                     Fired whenever this helper's {{#crossLink "ClipHelper/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", this._plane.visible);
                },

                get: function () {
                    return this._plane.visible;
                }
            }
        }
    });
})();