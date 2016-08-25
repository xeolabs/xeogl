/**
 A **ZSpaceStylus** component is used in combination with a {{#crossLink "ZSpace"}}ZSpace{{/crossLink}} to create a
 stylus pointer in VR that can pick and drag {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Examples

 <ul>
 <li>[zSpace with random geometries](../../examples/#webvr_zspace_geometries)</li>
 <li>[zSpace with glTF gearbox model](../../examples/#webvr_zspace_gltf_gearbox)</li>
 </ul>

 ## Usage

 In the example below, we'll create an {{#crossLink "Entity"}}{{/crossLink}} in xeoEngine's default
 {{#crossLink "Scene"}}{{/crossLink}}. Then we'll also create a {{#crossLink "ZSpace"}}{{/crossLink}}, which
 enables us to view and interact with the {{#crossLink "Scene"}}{{/crossLink}} using a ZSpace viewer.
 Finally, we'll create a **ZSpaceStylus** to access the viewer's stylus input.

 ````javascript

 // Create an Entity

 new XEO.Entity({
     geometry: new XEO.TorusGeometry(),
     material: new XEO.PhongMaterial({
        diffuseMap: new XEO.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });

 // Create a ZSpace viewer

 var zSpace = new XEO.ZSpace();

 // Create a ZSpaceStylus to access the viewer's stylus input device

 var stylus = new XEO.ZSpaceStylus({
     zSpace: zSpace
 });

 stylus.on("picked", function () {

 });````

 @class ZSpaceStylus
 @module XEO
 @submodule webvr
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ZSpaceStylus in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ZSpaceStylus.
 @param [cfg.ZSpace] {ZSpace} ID or instance of a {{#crossLink "ZSpace"}}{{/crossLink}} for this ZSpaceStylus.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this ZSpaceStylus.
 @extends Component
 */
(function () {

    "use strict";

    var math = XEO.math;

    XEO.ZSpaceStylus = XEO.Component.extend({

        type: "XEO.ZSpaceStylus",

        _init: function (cfg) {

            this._super(cfg);

            // Create helper entity to show stylus in the 3D view

            this._modes = this.create(XEO.Modes, {
                pickable: false,
                collidable: false,
                transparent: true,
                frontface: "ccw"
            });

            this._quaternion = this.create(XEO.Quaternion, {});

            this._translate = this.create(XEO.Translate, {
                xyz: [0, 0, 0],
                parent: this._quaternion
            });

            this._visibility = this.create(XEO.Visibility, {
                visible: false
            });

            this._shaft = this.create(XEO.Entity, {
                geometry: this.create(XEO.CylinderGeometry, {
                    radiusTop: 0.1,
                    radiusBottom: 0.1,
                    height: 5.0,
                    radialSegments: 10,
                    heightSegments: 1,
                    openEnded: false
                }),
                material: this.create(XEO.PhongMaterial, {
                    diffuse: [1.0, 0.5, 0.5],
                    emissive: [1.0, 0.5, 0.5],
                    ambient: [0.3, 0.3, 0.3],
                    specular: [1, 1, 1],
                    opacity: 0.4
                }),
                transform: this.create(XEO.Rotate, {
                    xyz: [1, 0, 0],
                    angle: 90,
                    parent: this._translate
                }),
                modes: this._modes,
                visibility: this._visibility
            });

            // Set ZSpaceStylus properties

            this.zSpace = cfg.zSpace;
        },

        _props: {

            /**
             * The {{#crossLink "ZSpace"}}{{/crossLink}} this stylus is currently connected to.
             *
             * Fires a {{#crossLink "ZSpaceStylus/ZSpace:event"}}{{/crossLink}} event on change.
             *
             * @property zSpace
             * @type ZSpace
             */
            zSpace: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "zSpace",
                        type: "XEO.ZSpace",
                        component: value,
                        sceneDefault: false,
                        on: {

                            stylusMoved: (function () {

                                var stylusWorldMat = math.mat4();
                                var pos = math.vec3();
                                var dir = math.vec3();

                                return function () {

                                    math.mulMat4(this.camera.view.matrix, this.stylusCameraMatrix, stylusWorldMat);

                                    pos[0] = stylusWorldMat[12];
                                    pos[1] = stylusWorldMat[13];
                                    pos[2] = stylusWorldMat[14];

                                    dir[0] = -stylusWorldMat[8];
                                    dir[1] = -stylusWorldMat[9];
                                    dir[2] = -stylusWorldMat[10];

                                    math.normalizeVec3(dir);

                                    //raycaster.set(pos, dir);
                                    //
                                    //if (draggingObject == null) {
                                    //    intersects = raycaster.intersectObjects(scene.children, true);
                                    //
                                    //    var hit = false;
                                    //    stylusLength = 0.5 * zspace.viewerScale;
                                    //    objectHit = null;
                                    //    for (var i = 0; i < intersects.length; i++) {
                                    //        if (intersects[i].object != stylusLine) {
                                    //            stylusLength = intersects[i].distance;
                                    //            objectHit = intersects[i].object;
                                    //            hit = true;
                                    //            break;
                                    //        }
                                    //    }
                                    //}


                                    //self._quaternion.xyzw = this.stylusOrientation;
                                    self._translate.xyz = pos;
                                    self._visibility.visible = true;
                                };
                            })(),

                            stylusButton0: function (value) { // TODO: Show on helper
                                self.log("stylusButton0");
                                self._shaft.material.diffuse = value ? [1, 1, 0.5] : [0.5, 0.5, 0.5];
                            },

                            stylusButton1: function (value) { // TODO: Show on helper
                                self.log("stylusButton1");
                            },

                            stylusButton2: function (value) {
                                self.log("stylusButton2");
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.zSpace;
                }
            }
        },

        _pickEntities: function (pos, dir) {

        }
    });
})();
