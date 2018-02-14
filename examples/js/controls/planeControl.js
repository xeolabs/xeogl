/**

 Helper that visualizes the position and direction of a plane.

 @class ClipControl
 @constructor
 @param cfg {*} Configuration
 @param [cfg.pos=[0,0,0]] {Float32Array} World-space position.
 @param [cfg.dir=[0,0,1]] {Float32Array} World-space direction vector.
 @param [cfg.color=[0.4,0.4,0.4]] {Float32Array} Emmissive color
 @param [cfg.solid=true] {Boolean} Indicates whether or not this helper is filled with color or just wireframe.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 @param [cfg.planeSize] {Float32Array} The width and height of the ClipControl plane indicator.
 @param [cfg.autoPlaneSize=false] {Boolean} Indicates whether or not this ClipControl's
 {{#crossLink "ClipControl/planeSize:property"}}{{/crossLink}} is automatically sized to fit within
 the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
 */
(function () {

    "use strict";

    xeogl.ClipControl = xeogl.Component.extend({

        type: "xeogl.ClipControl",

        _init: function (cfg) {

            this._solid = false;
            this._visible = false;

            this._initEntities();

            this.planeSize = cfg.planeSize;
            this.autoPlaneSize = cfg.autoPlaneSize;
            this.pos = cfg.pos;
            this.dir = cfg.dir;
            this.color = cfg.color;
            this.solid = cfg.solid;
            this.visible = cfg.visible;
            this.active = true;

            this._initEvents();
        },

        _initEntities: function () {
            var transform = this._planeScale = new xeogl.Scale(this, {
                xyz: [10, 10, 0],
                parent: this._quaternion = new xeogl.Quaternion(this, {
                    xyzw: [0, 0, 0, 1],
                    parent: this._translate = new xeogl.Translate(this, {
                        xyz: [-10, -10, 0]
                    })
                })
            });

            var thickQuarterTorus = new xeogl.TorusGeometry(this, {
                radius: 1.0,
                tube: 0.02,
                radialSegments: 64,
                tubeSegments: 14,
                arc: (Math.PI * 2.0) / 4.0
            });

            var arrowHead = new xeogl.CylinderGeometry(this, {
                radiusTop: 0.001,
                radiusBottom: 0.10,
                height: 0.2,
                radialSegments: 16,
                heightSegments: 1,
                openEnded: false
            });

            var arrowShaft = new xeogl.CylinderGeometry(scene, {
                radiusTop: 0.02,
                radiusBottom: 0.02,
                height: 1.0,
                radialSegments: 20,
                heightSegments: 1,
                openEnded: false
            });

            var axisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var xAxisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
                diffuse: [1, 0.3, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var xAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
                emissive: [1, 0.3, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var yAxisMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
                diffuse: [0.3, 1, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var yAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
                emissive: [0.3, 1, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });


            var zAxisMaterial = new xeogl.PhongMaterial(scene, { // Blue by convention
                diffuse: [0.3, 0.3, 1],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var zAxisLabelMaterial = new xeogl.PhongMaterial(scene, {
                emissive: [0.3, 0.3, 1],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });

            var ballMaterial = new xeogl.PhongMaterial(scene, {
                diffuse: [0.5, 0.5, 0.5],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            });


            // ----------------- Entities ------------------------------

            this._displayEntities = [

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
                }),

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
                }),

                this._arrow = new xeogl.Entity(this, {
                    geometry: new xeogl.Geometry(this, {
                        primitive: "lines",
                        positions: [
                            1.0, 1.0, 1.0, 1.0, -1.0, 1.0
                        ],
                        indices: [0, 1]
                    }),
                    material: new xeogl.PhongMaterial(this, {
                        emissive: [1, 0, 0],
                        diffuse: [0, 0, 0],
                        lineWidth: 4
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }),

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
                }),


                this._rotateXHoopDisplay = new xeogl.Entity(this, { // Green hoop about Y-axis
                    geometry: thickQuarterTorus,
                    material: yAxisMaterial,
                    transform: new xeogl.Rotate(this, {
                        xyz: [1, 0, 0],
                        angle: -90,
                        parent: transform
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }),

                this._rotateYHoopDisplay = new xeogl.Entity(this, { // Red hoop about Y-axis
                    geometry: thickQuarterTorus,
                    material: xAxisMaterial,
                    transform: new xeogl.Rotate(this, {
                        xyz: [0, 1, 0],
                        angle: 90,
                        parent: new xeogl.Rotate(this, {
                            xyz: [1, 0, 0],
                            angle: 270,
                            parent: transform
                        })
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }),

                this._rotateZHoopDisplay = new xeogl.Entity(this, { // Blue hoop about Z-axis
                    geometry: thickQuarterTorus,
                    material: zAxisMaterial,
                    transform: new xeogl.Rotate(this, {
                        xyz: [1, 0, 0],
                        angle: 90,
                        parent: new xeogl.Rotate(this, {
                            xyz: [1, 0, 0],
                            angle: 90,
                            parent: transform
                        })
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }),

                // Ball at center of axis

                new xeogl.Entity(this, {  // Arrow
                    geometry: new xeogl.SphereGeometry(this, {
                        radius: 0.05
                    }),
                    material: ballMaterial,
                    transform: transform,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false
                }),

                // X-axis arrow, shaft and label

                new xeogl.Entity(this, {  // Arrow
                    geometry: arrowHead,
                    material: xAxisMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, 1, 0],
                        parent: new xeogl.Rotate(this, {
                            xyz: [0, 0, 1],
                            angle: 90,
                            parent: transform
                        })
                    })
                }),

                new xeogl.Entity(this, {  // Shaft
                    geometry: arrowShaft,
                    material: xAxisMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, .5, 0],
                        parent: new xeogl.Rotate(this, {
                            xyz: [0, 0, 1],
                            angle: 90,
                            parent: transform
                        })
                    })
                }),

                new xeogl.Entity(this, {  // Label
                    geometry: new xeogl.VectorTextGeometry(this, {text: "X", size: 1.5}),
                    material: xAxisLabelMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [-7, 0, 0],
                        parent: transform
                    }),
                    billboard: "spherical"
                }),

                // Y-axis arrow, shaft and label

                new xeogl.Entity(this, {  // Arrow
                    geometry: arrowHead,
                    material: yAxisMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, 1, 0],
                        parent: transform
                    })
                }),

                new xeogl.Entity(this, {  // Shaft
                    geometry: arrowShaft,
                    material: yAxisMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, .5, 0],
                        parent: transform
                    })
                }),

                new xeogl.Entity(this, {  // Label
                    geometry: new xeogl.VectorTextGeometry(this, {text: "Y", size: 1.5}),
                    material: yAxisLabelMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, 7, 0],
                        parent: transform
                    }),
                    billboard: "spherical"
                }),

                // Z-axis arrow, shaft and label

                new xeogl.Entity(this, {  // Arrow
                    geometry: arrowHead,
                    material: zAxisMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    clippable: false,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, 1, 0],
                        parent: new xeogl.Rotate(this, {
                            xyz: [0.8, 0, 0],
                            angle: 90,
                            parent: transform
                        })
                    })
                }),

                new xeogl.Entity(this, {  // Shaft
                    geometry: arrowShaft,
                    material: zAxisMaterial,
                    clippable: false,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, .5, 0],
                        parent: new xeogl.Rotate(this, {
                            xyz: [1, 0, 0],
                            angle: 90,
                            parent: transform
                        })
                    })
                }),

                new xeogl.Entity(this, {  // Label
                    geometry: new xeogl.VectorTextGeometry(this, {text: "Z", size: 1.5}),
                    material: zAxisLabelMaterial,
                    pickable: false,
                    collidable: true,
                    visible: !!cfg.visible,
                    transform: new xeogl.Translate(this, {
                        xyz: [0, 0, 7],
                        parent: transform
                    }),
                    billboard: "spherical"
                })
            ];

            this._rotateXHoopPickable = new xeogl.Entity(this, {
                geometry: new xeogl.TorusGeometry(this, {
                    radius: 1.0,
                    tube: 0.05,
                    radialSegments: 64,
                    tubeSegments: 14,
                    arc: (Math.PI * 2.0)
                }),
                material: new xeogl.PhongMaterial(this, {
                   // alpha: 0,
                    alphaMode: "blend"
                }),
                transform: new xeogl.Rotate(this, {
                    xyz: [1, 0, 0],
                    angle: 90,
                    parent: transform
                }),
                pickable: true,
                collidable: true,
                clippable: false
            });

            this._rotateYHoopPickable = new xeogl.Entity(this, {
                geometry: new xeogl.TorusGeometry(this, {
                    radius: 1.0,
                    tube: 0.05,
                    radialSegments: 64,
                    tubeSegments: 14,
                    arc: (Math.PI * 2.0)
                }),
                material: new xeogl.PhongMaterial(this, {
                //    alpha: 0,
                    alphaMode: "blend"
                }),
                transform: new xeogl.Rotate(this, {
                    xyz: [0, 1, 0],
                    angle: 90,
                    parent: new xeogl.Rotate(this, {
                        xyz: [1, 0, 0],
                        angle: 90,
                        parent: transform
                    })
                }),
                pickable: true,
                collidable: true,
                clippable: false
            });
        },

        _initEvents: function () {

            var self = this;
            var scene = this.scene;
            var math = xeogl.math;
            var canvas = this.scene.canvas.canvas;
            var over = false;

            canvas.oncontextmenu = function (e) {
                e.preventDefault();
            };

            var getClickCoordsWithinElement = (function () {
                var coords = new Float32Array(2);
                return function (event) {
                    if (!event) {
                        event = window.event;
                        coords[0] = event.x;
                        coords[a] = event.y;
                    } else {
                        var element = event.target;
                        var totalOffsetLeft = 0;
                        var totalOffsetTop = 0;

                        while (element.offsetParent) {
                            totalOffsetLeft += element.offsetLeft;
                            totalOffsetTop += element.offsetTop;
                            element = element.offsetParent;
                        }
                        coords[0] = event.pageX - totalOffsetLeft;
                        coords[1] = event.pageY - totalOffsetTop;
                    }
                    return coords;
                };
            })();

            //------------------------------------------------------------------------------------
            // Mouse and touch 
            //------------------------------------------------------------------------------------

            (function () {

                var lastX;
                var lastY;
                var xDelta = 0;
                var yDelta = 0;
                var down = false;

                var mouseDownLeft;
                var mouseDownMiddle;
                var mouseDownRight;

                canvas.addEventListener("mousedown", function (e) {
                    if (!self._active) {
                        return;
                    }
                    if (!over) {
                        return;
                    }
                    switch (e.which) {
                        case 1: // Left button
                            mouseDownLeft = true;
                            down = true;
                            xDelta = 0;
                            yDelta = 0;
                            var coords = getClickCoordsWithinElement(e);
                            lastX = coords[0];
                            lastY = coords[1];
                            break;
                        case 2: // Middle/both buttons
                            mouseDownMiddle = true;
                            break;
                        case 3: // Right button
                            mouseDownRight = true;
                            down = true;
                            xDelta = 0;
                            yDelta = 0;
                            var coords = getClickCoordsWithinElement(e);
                            lastX = coords[0];
                            lastY = coords[1];
                            break;
                            break;
                        default:
                            break;
                    }
                });

                canvas.addEventListener("mouseup", function (e) {
                    if (!self._active) {
                        return;
                    }
                    switch (e.which) {
                        case 1: // Left button
                            mouseDownLeft = false;
                            break;
                        case 2: // Middle/both buttons
                            mouseDownMiddle = false;
                            break;
                        case 3: // Right button
                            mouseDownRight = false;
                            break;
                        default:
                            break;
                    }
                    down = false;
                    xDelta = 0;
                    yDelta = 0;
                });

                canvas.addEventListener("mouseenter", function () {
                    if (!self._active) {
                        return;
                    }
                    over = true;
                    xDelta = 0;
                    yDelta = 0;
                });

                canvas.addEventListener("mouseleave", function () {
                    if (!self._active) {
                        return;
                    }
                    over = false;
                    xDelta = 0;
                    yDelta = 0;
                });

                canvas.addEventListener("mousemove", function (e) {
                    if (!self._active) {
                        return;
                    }
                    if (!over) {
                        return;
                    }
                    if (!down) {
                        return;
                    }
                    var coords = getClickCoordsWithinElement(e);
                    var x = coords[0];
                    var y = coords[1];
                    xDelta += (x - lastX) * mouseOrbitRate;
                    yDelta += (y - lastY) * mouseOrbitRate;
                    lastX = x;
                    lastY = y;
                });

                canvas.addEventListener("wheel", function (e) {
                    if (!self._active) {
                        return;
                    }
                    var delta = Math.max(-1, Math.min(1, -e.deltaY * 40));
                    if (delta === 0) {
                        return;
                    }
                    var d = delta / Math.abs(delta);
//...
                    e.preventDefault();
                });
            })();
        },

        _props: {

            /**
             Indicates whether this ClipControl is active or not.

             @property active
             @default true
             @type Boolean
             */
            active: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._active) {
                        return;
                    }

                    this._active = value;
                },

                get: function () {
                    return this._active;
                }
            },

            /**
              The {{#crossLink "Clip"}}{{/crossLink}} attached to this ClipControl.
             
              @property clip
              @type Clip
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
                                self.pos = pos;
                            },
                            dir: function (dir) {
                                self.dir = dir;
                            },
                            active: function (active) {
                                // TODO: How to represent?
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.clip;
                }
            },

            /**
              World-space position of this ClipControl.
             
              @property pos
              @default [0,0,0]
              @type {Float32Array}
             */
            pos: {

                set: function (value) {
                    (this._pos = this._pos || new xeogl.math.vec3()).set(value || [0, 0, 0]);
                    this._translate.xyz = this._pos;
                    this._needUpdate(); // Need to rebuild arrow
                },

                get: function () {
                    return this._pos;
                }
            },

            /**
             * World-space direction of this ClipControl.
             *
             * @property dir
             * @default [0,0,1]
             * @type {Float32Array}
             */
            dir: {

                set: (function () {

                    var zeroVec = new Float32Array([0, 0, -1]);
                    var quat = new Float32Array(4);

                    return function (value) {
                        (this._dir = this._dir || new xeogl.math.vec3()).set(value || [0, 0, 1]);
                        xeogl.math.vec3PairToQuaternion(zeroVec, this._dir, quat);
                        this._quaternion.xyzw = quat;
                        this._needUpdate(); // Need to rebuild arrow
                    };
                })(),

                get: function () {
                    return this._dir;
                }
            },

            /**
             * The width and height of the ClipControl plane indicator.
             *
             * Values assigned to this property will be overridden by an auto-computed value when
             * {{#crossLink "ClipControl/autoPlaneSize:property"}}{{/crossLink}} is true.
             *
             * @property planeSize
             * @default [1,1]
             * @type {Float32Array}
             */
            planeSize: {

                set: function (value) {
                    (this._planeSize = this._planeSize || new xeogl.math.vec2()).set(value || [1, 1]);
                    this._planeScale.xyz = [this._planeSize[0], this._planeSize[1], 1.0];
                },

                get: function () {
                    return this._planeSize;
                }
            },

            /**
             * Indicates whether this ClipControl's {{#crossLink "ClipControl/planeSize:property"}}{{/crossLink}} is automatically
             * generated or not.
             *
             * When auto-generated, {{#crossLink "ClipControl/planeSize:property"}}{{/crossLink}} will automatically size
             * to fit within the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
             *
             * @property autoPlaneSize
             * @default false
             * @type {Boolean}
             */
            autoPlaneSize: {

                set: function (value) {

                    value = !!value;

                    if (this._autoPlaneSize === value) {
                        return;
                    }

                    this._autoPlaneSize = value;

                    if (this._autoPlaneSize) {
                        if (!this._onSceneAABB) {
                            this._onSceneAABB = this.scene.on("boundary", function () {
                                var aabbDiag = xeogl.math.getAABB3Diag(this.scene.aabb);
                                var clipSize = (aabbDiag * 0.50);
                                this.planeSize = [clipSize, clipSize];
                            }, this);
                        }
                    } else {
                        if (this._onSceneAABB) {
                            this.scene.off(this._onSceneAABB);
                            this._onSceneAABB = null;
                        }
                    }
                },

                get: function () {
                    return this._autoPlaneSize;
                }
            },

            /**
             * Emmissive color of this ClipControl.
             *
             * @property color
             * @default [0.4,0.4,0.4]
             * @type {Float32Array}
             */
            color: {

                set: function (value) {
                    (this._color = this._color || new xeogl.math.vec3()).set(value || [0.4, 0.4, 0.4]);
                    this._planeWire.material.emissive = this._color;
                    this._arrow.material.emissive = this._color;
                },

                get: function () {
                    return this._color;
                }
            },

            /**
             Indicates whether this ClipControl is filled with color or just wireframe.

             @property solid
             @default true
             @type Boolean
             */
            solid: {

                set: function (value) {
                    this._solid = value !== false;
                    this._planeSolid.visible = this._solid && this._visible;
                },

                get: function () {
                    return this._solid;
                }
            },

            /**
             * Visibility of this ClipControl.
             *
             * @property visible
             * @type Boolean
             * @default true
             */
            visible: {

                set: function (value) {

                    value = !!value;

                    if (this._visible === value) {
                        return;
                    }

                    this._visible = value;

                    for (var i = 0; i < this._displayEntities.length; i++) {
                        this._displayEntities[i].visible = value;
                    }
                },

                get: function () {
                    return this._visible;
                }
            }
        },

        _destroy: function () {
            if (this._onSceneAABB) {
                this.scene.off(this._onSceneAABB);
            }
        }
    });
})();