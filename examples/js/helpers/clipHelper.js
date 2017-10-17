/**

 Helper that visualizes the position and direction of a {{#crossLink "Clip"}}{{/crossLink}}.

 The helper works by tracking updates to the {{#crossLink "Clip"}}{{/crossLink}}'s
 {{#crossLink "Clip/pos:property"}}{{/crossLink}} and {{#crossLink "Clip/dir:property"}}{{/crossLink}}.

 @class ClipHelper
 @constructor
 @param cfg {*} Configuration
 @param cfg.clip {Clip} A {{#crossLink "Clip"}}{{/crossLink}} to visualize.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 @param [cfg.size] {Float32Array} The width and height of the ClipHelper plane indicator. When no value is specified,
 will automatically size to fit within the {{#crossLink "Scene/worldBoundary:property"}}Scene's worldBoundary{{/crossLink}}.
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

            var transform = this._scale = new xeogl.Scale(this, {
                xyz: [10, 10, 0],
                parent: this._quaternion = new xeogl.Quaternion(this, {
                    xyzw: [0, 0, 0, 1],
                    parent: this._translate = new xeogl.Translate(this, {
                        xyz: [0, 0, 0]
                    })
                })
            });

            this._planeWire = new xeogl.Entity(this, {
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
                material: new xeogl.PhongMaterial(this, {
                    emissive: [1, 0, 0],
                    diffuse: [0, 0, 0],
                    lineWidth: 2
                }),
                transform: transform,
                pickable: false,
                collidable: true,
                clippable: false
            });

            this._planeSolid = new xeogl.Entity(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "triangles",
                    positions: [
                        0.5, 0.5, 0.0, 0.5, -0.5, 0.0, // 0
                        -0.5, -0.5, 0.0, -0.5, 0.5, 0.0, // 1
                        0.5, 0.5, -0.0, 0.5, -0.5, -0.0, // 2
                        -0.5, -0.5, -0.0, -0.5, 0.5, -0.0 // 3
                    ],
                    indices: [0, 1, 2, 2, 3, 0]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [0, 0, 0],
                    diffuse: [0, 0, 0],
                    specular: [1, 1, 1],
                    shininess: 120,
                    alpha: 0.3,
                    alphaMode: "blend",
                    backfaces: true
                }),
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
                collidable: true,
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
                collidable: true,
                clippable: false,
                billboard: "spherical"
            });

            this.clip = cfg.clip;
            this.size = cfg.size;
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

                    this._quaternion.xyzw = quat;
                    this._translate.xyz = pos;
                }
            };
        })(),

        _autoSizeClipPlane: function () {
            var aabbDiag = xeogl.math.getAABB3Diag(this.scene.worldBoundary.aabb);
            var clipSize = (aabbDiag * 0.50);
            this.size = [clipSize, clipSize];
        },

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
                                var emissive = active ? [0.2, 0.2, 0.2] : [1.0, 0.2, 0.2];
                                self._planeWire.material.emissive = emissive;
                                self._arrow.material.emissive = emissive;
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
             * The width and height of the ClipHelper plane indicator.
             *
             * When no value is specified, will automatically size to fit within the
             * {{#crossLink "Scene/worldBoundary:property"}}Scene's worldBoundary{{/crossLink}}.
             *
             * Fires an {{#crossLink "ClipHelper/size:event"}}{{/crossLink}} event on change.
             *
             * @property size
             * @default Fitted to scene boundary
             * @type {Float32Array}
             */
            size: {

                set: function (value) {

                    if (!value) {
                        if (!this._onSceneAABB) {
                            this._onSceneAABB = this.scene.worldBoundary.on("updated", this._autoSizeClipPlane, this);
                            return;
                        }
                    }

                    (this._size = this._size || new xeogl.math.vec2()).set(value || [1, 1]);

                    this._scale.xyz = [this._size[0], this._size[1], 1.0];

                    /**
                     Fired whenever this ClipHelper's {{#crossLink "ClipHelper/size:property"}}{{/crossLink}} property changes.
                     @event size
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("size", this._size);
                },

                get: function () {
                    return this._size;
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

                    this._planeWire.visible = value;
                    this._planeSolid.visible = value;
                    this._arrow.visible = value;
                    this._label.visible = value;

                    /**
                     Fired whenever this helper's {{#crossLink "ClipHelper/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", this._planeWire.visible);
                },

                get: function () {
                    return this._planeWire.visible;
                }
            }
        },

        _destroy: function () {
            if (this._onSceneAABB) {
                this.scene.worldBoundary.off(this._onSceneAABB);
            }
        }
    });
})();