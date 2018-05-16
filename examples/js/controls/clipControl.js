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
            this._clipStartDir = xeogl.math.vec3();
            this._clipPos = xeogl.math.vec3();

            this._gumballGroup = null;
            this._planeScale = null;

            this._initEntities();

            this.planeSize = cfg.planeSize;
            this.autoPlaneSize = cfg.autoPlaneSize;
            this.color = cfg.color;
            this.solid = cfg.solid;
            this.clip = cfg.clip;
            this.visible = cfg.visible;
            this.active = true;

            this._initEvents();
        },

        _update: (function () {
            var arrowPositions = new Float32Array(6);
            return function () {

                var pos = this._pos;
                var dir = this._dir;

                // Rebuild arrow geometry

                arrowPositions[0] = pos[0];
                arrowPositions[1] = pos[1];
                arrowPositions[2] = pos[2];
                arrowPositions[3] = pos[0] + dir[0];
                arrowPositions[4] = pos[1] + dir[1];
                arrowPositions[5] = pos[2] + dir[2];

                //this._display.arrow.geometry.positions = arrowPositions;
            }
        })(),

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
                    this._attach({name: "clip", type: "xeogl.Clip", component: value});
                    var clip = this._attached.clip;
                    if (clip) { // Reset rotation and translation basis
                        this._setGumballDir(clip.dir);
                        this._setGumballPos(clip.pos);
                    }
                },
                get: function () {
                    return this._attached.clip;
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
                //    this._planeScale.xyz = [this._planeSize[0], this._planeSize[1], 1.0];
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
             * Emissive color of this ClipControl.
             *
             * @property color
             * @default [0.4,0.4,0.4]
             * @type {Float32Array}
             */
            color: {
                set: function (value) {
                    (this._color = this._color || new xeogl.math.vec3()).set(value || [0.4, 0.4, 0.4]);
                    this._display.planeWire.material.emissive = this._color;
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
                    this._display.planeSolid.visible = this._solid && this._visible;
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
                    for (var id in this._display) {
                        if (this._display.hasOwnProperty(id)) {
                            this._display[id].visible = value;
                        }
                    }
                },
                get: function () {
                    return this._visible;
                }
            }
        },

        _setGumballPos: function (xyz) {
            this._clipPos.set(xyz);
            this._gumballGroup.position = xyz;
        },

        _setGumballDir: (function () {
            var zeroVec = new Float32Array([0, 0, 1]);
            var quat = new Float32Array(4);
            return function (xyz) {
                this._clipStartDir.set(xyz);
                xeogl.math.vec3PairToQuaternion(zeroVec, xyz, quat);
                this._gumballGroup.quaternion = quat;
            };
        })(),

        _initEntities: function () {

            // Option for xeogl.Group.addChild(), to prevent child xeogl.Objects from inheriting
            // state from their parent xeogl.Group, such as 'pickable', 'visible', 'collidable' etc.
            // Although, the children's transforms are relative to the xeogl.Group.
            const DONT_INHERIT_GROUP_STATE = false;

            // Positions, rotates & scales all Meshes as a group;
            // Meshes still have their relative transforms.
            var gumballGroup = this._gumballGroup = new xeogl.Group(this, {
                //scale: [10, 10, 0],
                position: [0, 0, 0]
            });

            var radius = 1.2;
            var hoopRadius = radius - 0.2;

            var geometries = {
                arrowHead: new xeogl.CylinderGeometry(this, {
                    radiusTop: 0.001,
                    radiusBottom: 0.10,
                    height: 0.2,
                    radialSegments: 16,
                    heightSegments: 1,
                    openEnded: false
                }),
                curve: new xeogl.TorusGeometry(this, {
                    radius: hoopRadius,
                    tube: 0.0175,
                    radialSegments: 64,
                    tubeSegments: 14,
                    arc: (Math.PI * 2.0) / 4.0
                }),
                hoop: new xeogl.TorusGeometry(this, {
                    radius: hoopRadius,
                    tube: 0.0175,
                    radialSegments: 64,
                    tubeSegments: 8,
                    arc: (Math.PI * 2.0)
                }),
                curvePickable: new xeogl.TorusGeometry(this, {
                    radius: hoopRadius,
                    tube: 0.06,
                    radialSegments: 64,
                    tubeSegments: 14,
                    arc: (Math.PI * 2.0) / 4.0
                }),
                axis: new xeogl.CylinderGeometry(scene, {
                    radiusTop: 0.0175,
                    radiusBottom: 0.0175,
                    height: radius,
                    radialSegments: 20,
                    heightSegments: 1,
                    openEnded: false
                })
            };

            var materials = {
                pickable: new xeogl.PhongMaterial(this, {
                    diffuse: [1, 1, 0],
                    alpha: 0, // Invisible
                    alphaMode: "blend"
                }),
                red: new xeogl.PhongMaterial(scene, {
                    diffuse: [1, 0.3, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2
                }),
                transparentRed: new xeogl.PhongMaterial(scene, {
                    diffuse: [1, 0.3, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2,
                    alpha: 0.6,
                    alphaMode: "blend"
                }),
                highlightRed: new xeogl.GhostMaterial(scene, {
                    edges: false,
                    fill: true,
                    fillColor: [1, 0, 0],
                    fillAlpha: 0.5,
                    vertices: false
                }),
                labelRed: new xeogl.PhongMaterial(scene, {
                    emissive: [1, 0.3, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 3
                }),
                green: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.3, 1, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2
                }),
                highlightGreen: new xeogl.GhostMaterial(scene, {
                    edges: false,
                    fill: true,
                    fillColor: [0, 1, 0],
                    fillAlpha: 0.5,
                    vertices: false
                }),
                transparentGreen: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.3, 1.0, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2,
                    alpha: 0.4,
                    alphaMode: "blend"
                }),
                labelGreen: new xeogl.PhongMaterial(scene, { // Green by convention
                    emissive: [0.3, 1, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 3
                }),
                blue: new xeogl.PhongMaterial(scene, { // Blue by convention
                    diffuse: [0.3, 0.3, 1],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2
                }),
                highlightBlue: new xeogl.GhostMaterial(scene, {
                    edges: false,
                    fill: true,
                    fillColor: [0, 0, 1],
                    fillAlpha: 0.5,
                    vertices: false
                }),
                transparentBlue: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.3, 0.3, 1.0],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2,
                    alpha: 0.4,
                    alphaMode: "blend"
                }),
                labelBlue: new xeogl.PhongMaterial(scene, {
                    emissive: [0.3, 0.3, 1],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 3
                }),
                ball: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.5, 0.5, 0.5],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 2
                }),
                highlightBall: new xeogl.GhostMaterial(scene, {
                    edges: false,
                    fill: true,
                    fillColor: [0.5, 0.5, 0.5],
                    fillAlpha: 0.5,
                    vertices: false
                }),
                highlightPlane: new xeogl.GhostMaterial(scene, {
                    edges: true,
                    edgeWidth: 3,
                    fill: false,
                    fillColor: [0.5, 0.5, .5],
                    fillAlpha: 0.5,
                    vertices: false
                })
            };

            this._display = {

                planeWire: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: new xeogl.Geometry(this, {
                        primitive: "lines",
                        positions: [
                            1.1, 1.1, 0.0, 1.1, -1.1, 0.0, // 0
                            -1.1, -1.1, 0.0, -1.1, 1.1, 0.0, // 1
                            1.1, 1.1, -0.0, 1.1, -1.1, -0.0, // 2
                            -1.1, -1.1, -0.0, -1.1, 1.1, -0.0 // 3
                        ],
                        indices: [0, 1, 0, 3, 1, 2, 2, 3]
                    }),
                    highlight: true,
                    highlightMaterial: materials.highlightPlane,
                    material: new xeogl.PhongMaterial(this, {
                        emissive: [1, 0, 0],
                        diffuse: [0, 0, 0],
                        lineWidth: 2
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                planeSolid: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: new xeogl.Geometry(this, {
                        primitive: "triangles",
                        positions: [
                            1.1, 1.1, 0.0, 1.1, -1.1, 0.0, // 0
                            -1.1, -1.1, 0.0, -1.1, 1.1, 0.0, // 1
                            1.1, 1.1, -0.0, 1.1, -1.1, -0.0, // 2
                            -1.1, -1.1, -0.0, -1.1, 1.1, -0.0 // 3
                        ],
                        indices: [0, 1, 2, 2, 3, 0]
                    }),
                    highlight: true,
                    highlightMaterial: materials.highlightPlane,
                    material: new xeogl.PhongMaterial(this, {
                        emissive: [0, 0, 0],
                        diffuse: [0, 0, 0],
                        specular: [1, 1, 1],
                        shininess: 120,
                        alpha: 0.3,
                        alphaMode: "blend",
                        backfaces: true
                    }),
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    backfaces: true
                }), DONT_INHERIT_GROUP_STATE),

                xGreenCurve: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.curve,
                    material: materials.green,
                    highlight: true,
                    highlightMaterial: materials.highlightGreen,
                    rotation: [-90, 0, 0],
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    backfaces: true
                }), DONT_INHERIT_GROUP_STATE),

                xGreenCurvePickable: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.curvePickable,
                    material: materials.pickable,
                    rotation: [-90, 0, 0],
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                yRedCurve: gumballGroup.addChild(new xeogl.Mesh(this, { // Red hoop about Y-axis
                    geometry: geometries.curve,
                    material: materials.red,
                    highlight: true,
                    highlightMaterial: materials.highlightRed,
                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [0, 1, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(270 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate1, rotate2, xeogl.math.identityMat4());
                    })(),
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    backfaces: true
                }), DONT_INHERIT_GROUP_STATE),

                yRedCurvePickable: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.curvePickable,
                    material: materials.pickable,
                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [0, 1, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(270 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate1, rotate2, xeogl.math.identityMat4());
                    })(),
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                zBlueCurve: gumballGroup.addChild(new xeogl.Mesh(this, { // Blue hoop about Z-axis
                    geometry: geometries.curve,
                    material: materials.blue,
                    highlight: true,
                    highlightMaterial: materials.highlightBlue,
                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate2, rotate1, xeogl.math.identityMat4());
                    })(),
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    backfaces: true
                }), DONT_INHERIT_GROUP_STATE),

                zBlueCurvePickable: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.curvePickable,
                    material: materials.pickable,

                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate2, rotate1, xeogl.math.identityMat4());
                    })(),
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                ball: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: new xeogl.SphereGeometry(this, {
                        radius: 0.05
                    }),
                    highlight: true,
                    highlightMaterial: materials.highlightBall,
                    material: materials.ball,
                    pickable: false,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                xRedArrow: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.arrowHead,
                    material: materials.red,
                    highlight: true,
                    highlightMaterial: materials.highlightRed,
                    matrix: (function () {
                        var translate = xeogl.math.translateMat4c(0, radius + .1, 0, xeogl.math.identityMat4());
                        var rotate = xeogl.math.rotationMat4v(-90 * xeogl.math.DEGTORAD, [0, 0, 1], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate, translate, xeogl.math.identityMat4());
                    })(),
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                xRedShaft: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.axis,
                    material: materials.red,
                    highlight: true,
                    highlightMaterial: materials.highlightRed,
                    matrix: (function () {
                        var translate = xeogl.math.translateMat4c(0, radius / 2, 0, xeogl.math.identityMat4());
                        var rotate = xeogl.math.rotationMat4v(-90 * xeogl.math.DEGTORAD, [0, 0, 1], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate, translate, xeogl.math.identityMat4());
                    })(),
                    pickable: false,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                yGreenArrow: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.arrowHead,
                    material: materials.green,
                    highlight: true,
                    highlightMaterial: materials.highlightGreen,
                    matrix: (function () {
                        var translate = xeogl.math.translateMat4c(0, radius + .1, 0, xeogl.math.identityMat4());
                        var rotate = xeogl.math.rotationMat4v(180 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate, translate, xeogl.math.identityMat4());
                    })(),
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                yGreenShaft: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.axis,
                    material: materials.green,
                    highlight: true,
                    highlightMaterial: materials.highlightGreen,
                    position: [0, -radius / 2, 0],
                    pickable: false,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                zBlueArrow: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.arrowHead,
                    material: materials.blue,
                    highlight: true,
                    highlightMaterial: materials.highlightBlue,
                    matrix: (function () {
                        var translate = xeogl.math.translateMat4c(0, radius + .1, 0, xeogl.math.identityMat4());
                        var rotate = xeogl.math.rotationMat4v(-90 * xeogl.math.DEGTORAD, [0.8, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate, translate, xeogl.math.identityMat4());
                    })(),
                    pickable: true,
                    collidable: true,
                    clippable: false
                }), DONT_INHERIT_GROUP_STATE),

                zBlueShaft: gumballGroup.addChild(new xeogl.Mesh(this, {
                    geometry: geometries.axis,
                    material: materials.blue,
                    highlight: true,
                    highlightMaterial: materials.highlightBlue,
                    matrix: (function () {
                        var translate = xeogl.math.translateMat4c(0, radius / 2, 0, xeogl.math.identityMat4());
                        var rotate = xeogl.math.rotationMat4v(-90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate, translate, xeogl.math.identityMat4());
                    })(),
                    clippable: false,
                    pickable: false,
                    collidable: true
                }), DONT_INHERIT_GROUP_STATE)
            };

            this._hoops = {

                xHoop: gumballGroup.addChild(new xeogl.Mesh(this, { // Green hoop about Y-axis
                    geometry: geometries.hoop,
                    material: materials.transparentGreen,
                    highlight: true,
                    highlightMaterial: materials.highlightGreen,
                    rotation: [-90, 0, 0],
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    visible: false
                }), DONT_INHERIT_GROUP_STATE),

                yHoop: gumballGroup.addChild(new xeogl.Mesh(this, { // Red hoop about Y-axis
                    geometry: geometries.hoop,
                    material: materials.transparentRed,
                    highlight: true,
                    highlightMaterial: materials.highlightRed,
                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [0, 1, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(270 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate1, rotate2, xeogl.math.identityMat4());
                    })(),
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    visible: false
                }), DONT_INHERIT_GROUP_STATE),

                zHoop: gumballGroup.addChild(new xeogl.Mesh(this, { // Blue hoop about Z-axis
                    geometry: geometries.hoop,
                    material: materials.transparentBlue,
                    highlight: true,
                    highlightMaterial: materials.highlightBlue,
                    matrix: (function () {
                        var rotate2 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        var rotate1 = xeogl.math.rotationMat4v(90 * xeogl.math.DEGTORAD, [1, 0, 0], xeogl.math.identityMat4());
                        return xeogl.math.mulMat4(rotate2, rotate1, xeogl.math.identityMat4());
                    })(),
                    pickable: false,
                    collidable: true,
                    clippable: false,
                    visible: false
                }), DONT_INHERIT_GROUP_STATE)
            };
        },

        _initEvents: function () {

            var self = this;
            var scene = this.scene;
            var math = xeogl.math;
            var canvas = this.scene.canvas.canvas;
            var over = false;

            const DRAG_ACTIONS = {
                none: -1,
                xPan: 0,
                yPan: 1,
                zPan: 2,
                xRotate: 3,
                yRotate: 4,
                zRotate: 5
            };

            var nextDragAction = null; // As we hover over an arrow or hoop, self is the action we would do if we then dragged it.
            var dragAction = null; // Action we're doing while we drag an arrow or hoop.

            var startDrag = math.vec2();
            var dragVec = math.vec2();

            var xLocalAxis = math.vec3([1, 0, 0]);
            var yLocalAxis = math.vec3([0, 1, 0]);
            var zLocalAxis = math.vec3([0, 0, 1]);

            var rotateWorldVec = math.vec3();
            var panWorldVec = math.vec3();
            var panCanvasVec = math.vec2();

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

            var localToWorldVec = (function () {
                var math = xeogl.math;
                var mat = math.mat4();
                return function (localVec, worldVec) {
                    math.quaternionToMat4(self._gumballGroup.quaternion, mat);
                    math.transformVec3(mat, localVec, worldVec);
                    math.normalizeVec3(worldVec);
                    return worldVec;
                };
            })();

            var worldToCanvasVec = (function () {
                var math = xeogl.math;
                var tempVec4a = xeogl.math.vec4([0, 0, 0, 1]);
                var tempVec4b = xeogl.math.vec4();
                return function (worldVec, canvasVec) {
                    tempVec4a.set(worldVec);
                    math.transformPoint4(self.scene.camera.projMatrix, tempVec4a, tempVec4b);
                    var aabb = self.scene.canvas.boundary;
                    canvasVec[0] = Math.floor((1 + tempVec4b[0] / tempVec4b[3]) * aabb[2] / 2);
                    canvasVec[1] = Math.floor((1 - tempVec4b[1] / tempVec4b[3]) * aabb[3] / 2);
                    math.normalizeVec3(canvasVec);
                    return canvasVec;
                };
            })();

            var pan = function (inc, f) {
                self._clipPos[0] += inc[0] * f;
                self._clipPos[1] += inc[1] * f;
                self._clipPos[2] += inc[2] * f;
                self._gumballTranslate.xyz = self._clipPos;
                if (self._attached.clip) {
                    self._attached.clip.pos = self._clipPos;
                }
            };

            var rotateX = function (incDegrees) {
                self._gumballGroup.rotate([1, 0, 0, incDegrees]);
                rotateClip();
            };

            var rotateY = function (incDegrees) {
                self._gumballGroup.rotate([0, 1, 0, incDegrees]);
                rotateClip();
            };

            var rotateZ = function (incDegrees) {
                self._gumballGroup.rotate([0, 0, 1, incDegrees]);
                rotateClip();
            };


            var rotate = function (axis, incDegrees) {
                self._gumballGroup.rotate([axis[0], axis[1], axis[2], incDegrees]);
                rotateClip();
            };

            var rotateClip = (function () {
                var math = xeogl.math;
                var dir = math.vec3();
                var mat = math.mat4();
                var tempVec3b = math.vec3();
                return function () {
                    if (self._attached.clip) {
                        math.quaternionToMat4(self._gumballGroup.quaternion, mat);  // << ---
                        math.transformVec3(mat, [0, 0, -1], dir);
                        self._attached.clip.dir = dir;
                    }
                };
            })();

            var pick = (function () {

                var lastHighlightedMesh;
                var lastShownMesh;

                return function pick(canvasPos) {

                    var hit = scene.pick({
                        canvasPos: canvasPos
                    });

                    if (lastHighlightedMesh) {
                        lastHighlightedMesh.highlight = false;
                    }

                    if (lastShownMesh) {
                        lastShownMesh.visible = false;
                    }

                    if (hit) {

                        var id = hit.mesh.id;

                        var highlightMesh;
                        var shownMesh;

                        switch (id) {
                            case self._display.xRedArrow.id:
                                  highlightMesh = self._display.xRedArrow;
                                nextDragAction = DRAG_ACTIONS.xPan;
                                localToWorldVec(xLocalAxis, panWorldVec);
                                worldToCanvasVec(panWorldVec, panCanvasVec);
                                break;

                            case self._display.yGreenArrow.id:
                                highlightMesh = self._display.yGreenArrow;
                                nextDragAction = DRAG_ACTIONS.yPan;
                                localToWorldVec(yLocalAxis, panWorldVec);
                                worldToCanvasVec(panWorldVec, panCanvasVec);
                                break;

                            case self._display.zBlueArrow.id:
                                highlightMesh = self._display.zBlueArrow;
                                nextDragAction = DRAG_ACTIONS.zPan;
                                localToWorldVec(zLocalAxis, panWorldVec);
                                worldToCanvasVec(panWorldVec, panCanvasVec);
                                break;

                            case self._display.xGreenCurvePickable.id:
                                highlightMesh = self._display.xGreenCurve;
                                localToWorldVec(xLocalAxis, rotateWorldVec);
                                shownMesh = self._hoops.xHoop;
                                nextDragAction = DRAG_ACTIONS.xRotate;
                                break;

                            case self._display.yRedCurvePickable.id:
                                highlightMesh = self._display.yRedCurve;
                                localToWorldVec(yLocalAxis, rotateWorldVec);
                                shownMesh = self._hoops.yHoop;
                                nextDragAction = DRAG_ACTIONS.yRotate;
                                break;

                            case self._display.zBlueCurvePickable.id:
                                highlightMesh = self._display.zBlueCurve;
                                localToWorldVec(zLocalAxis, rotateWorldVec);
                                shownMesh = self._hoops.zHoop;
                                nextDragAction = DRAG_ACTIONS.zRotate;
                                break;

                            default:
                                nextDragAction = DRAG_ACTIONS.none;
                                return; // Not clicked an arrow or hoop
                        }

                        if (highlightMesh) {
                            highlightMesh.highlight = true;
                        }

                        if (shownMesh) {
                            shownMesh.visible = true;
                        }

                        lastHighlightedMesh = highlightMesh;
                        lastShownMesh = shownMesh;

                    } else {

                        lastHighlightedMesh = null;
                        lastShownMesh = null;
                        nextDragAction = DRAG_ACTIONS.none;
                    }
                };
            })();

            (function () {

                var lastX;
                var lastY;
                var xDelta = 0;
                var yDelta = 0;
                var down = false;

                var mouseDownLeft;
                var mouseDownMiddle;
                var mouseDownRight;

                canvas.addEventListener("mousemove", function (e) {

                    if (!self._active) {
                        return;
                    }

                    if (!over) {
                        return;
                    }

                    var coords = getClickCoordsWithinElement(e);

                    if (!down) {
                        pick(coords);
                        return;
                    }

                    var x = coords[0];
                    var y = coords[1];

                    xDelta += (x - lastX) * 0.1;
                    yDelta += (y - lastY) * 0.1;

                    lastX = x;
                    lastY = y;

                    dragVec[0] = coords[0] - startDrag[0];
                    dragVec[1] = coords[1] - startDrag[0];
                });

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

                            dragAction = nextDragAction;

                            startDrag[0] = coords[0];
                            startDrag[1] = coords[1];

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

                canvas.addEventListener("wheel", function (e) {
                    if (!self._active) {
                        return;
                    }
                    var delta = Math.max(-1, Math.min(1, -e.deltaY * 40));
                    if (delta === 0) {
                        return;
                    }
                    var d = delta / Math.abs(delta);
                    e.preventDefault();
                });

                scene.on("tick", function () {

                    if (dragAction === DRAG_ACTIONS.none) {
                        return;
                    }

                    if (xDelta === 0 && yDelta === 0) {
                        return;
                    }

                    //////////////////////////////////
                    // Calculate panRate
                    //////////////////////////////////

                    var panRate = .2;
                    var rotateRate = 1.0;

                    switch (dragAction) {
                        case DRAG_ACTIONS.xPan:
                            pan(panWorldVec, xDelta > 0 ? panRate : -panRate);
                            break;
                        case DRAG_ACTIONS.yPan:
                            pan(panWorldVec, xDelta > 0 ? panRate : -panRate);
                            break;
                        case DRAG_ACTIONS.zPan:
                            pan(panWorldVec, xDelta > 0 ? panRate : -panRate);
                            break;
                        case DRAG_ACTIONS.xRotate:
                            rotate(xLocalAxis, -xDelta);
                            break;
                        case DRAG_ACTIONS.yRotate:
                            rotate(yLocalAxis, -xDelta);
                            break;
                        case DRAG_ACTIONS.zRotate:
                            rotate(zLocalAxis, -xDelta);
                            break;
                    }

                    xDelta = 0;
                    yDelta = 0;
                });

            })();
        },

        _destroy: function () {
            if (this._onSceneAABB) {
                this.scene.off(this._onSceneAABB);
            }
        }
    });
})();