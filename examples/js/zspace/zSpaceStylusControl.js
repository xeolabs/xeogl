/**
 A **ZSpaceStylusControl** component works in conjunction with a {{#crossLink "ZSpaceEffect"}}{{/crossLink}} to drag
 {{#crossLink "Entity"}}Entities{{/crossLink}} around with a zSpace stylus input device.

 <img src="../../../assets/images/ZSpaceStylusControl.png"></img>

 ## Examples

 <ul>
 <li>[zSpace cube](../../examples/effects_zspace_cube.html)</li>
 <li>[zSpace with random geometries](../../examples/effects_zspace_geometries.html)</li>
 <li>[zSpace with glTF gearbox model](../../examples/effects_zspace_gearbox.html)</li>
 <li>[zSpace with glTF gearbox model and entity explorer](../../examples/effects_zspace_gearbox_explorer.html)</li>
 <li>[zSpace with glTF reciprocating saw model](../../examples/effects_zspace_ReciprocatingSaw.html)</li>
 </ul>

 ## Usage

 ````javascript
 // Create a textured cube entity
 var entity = new xeogl.Entity({
     geometry: new xeogl.BoxGeometry({
         xSize: .6,
         ySize: .6,
         zSize: .6
     }),
     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
             src: "textures/diffuse/UVCheckerMap11-1024.png"
         })
     }),
     modes: new xeogl.Modes({
         backfaces: true
     }),
     transform: new xeogl.Rotate({
         xyz: [0, 1, 0],
         angle: 0
     })
 });

 // Set initial camera position
 var scene = entity.scene;
 scene.camera.view.eye = [0, 2, -10];
 scene.camera.view.look = [0, 0, 0];

 // Allow camera control with keyboard and mouse
 var cameraControl = new xeogl.CameraControl();

 // Create a ZSpaceEffect
 var zspaceEffect = new xeogl.ZSpaceEffect({
     canvasOffset: [330, 0]
 });

 // Create a ZSpaceStylusControl
 var zspaceStylusControl = new xeogl.ZSpaceStylusControl();

 // Handle missing zSpace support
 zspaceEffect.on("supported", function (supported) {
     if (!supported) {
         document.getElementById("log").innerText = "(zSpace not detected) ";
     }
 });
 ````

 @class ZSpaceStylusControl
 @module xeogl
 @submodule zspace
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ZSpaceStylusControl in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ZSpaceStylusControl.
 @param [cfg.zspaceEffect] {String|ZSpaceEffect} ID or instance of a {{#crossLink "ZSpaceEffect"}}ZSpaceEffect{{/crossLink}} for this ZSpaceStylusControl.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this ZSpaceStylusControl. Defaults to the first instance found in
 the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this ZSpaceStylusControl is initially active.
 @extends Component
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.ZSpaceStylusControl = xeogl.Component.extend({

        type: "xeogl.ZSpaceStylusControl",

        _init: function (cfg) {

            this._super(cfg);

            this.zspaceEffect = cfg.zspaceEffect;
            this.active = cfg.active;
        },

        _props: {

            /**
             * The {{#crossLink "ZSpaceEffect"}}{{/crossLink}} attached to this ZSpaceStylusControl.
             *
             * @property zspaceEffect
             * @type ZSpaceEffect
             */
            zspaceEffect: {

                set: function (value) {

                    /**
                     * Fired whenever this ZSpaceStylusControl's {{#crossLink "ZSpaceStylusControl/zspaceEffect:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event zspaceEffect
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "zspaceEffect",
                        type: "xeogl.ZSpaceEffect",
                        component: value,
                        sceneSingleton: true // Default to first xeogl.ZSpaceEffect found in the Scene
                    });
                },

                get: function () {
                    return this._attached.zspaceEffect;
                }
            },

            /**
             * Flag which indicates whether this ZSpaceStylusControl is active or not.
             *
             * Fires an {{#crossLink "ZSpaceStylusControl/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = value !== false;

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;
                    this._active ? this._activate() : this._deactivate();

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this ZSpaceStylusControl's {{#crossLink "ZSpaceStylusControl/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _activate: function () { // Activates this ZSpaceStylusControl

            var self = this;

            this._stylusHelper = new (function () {
                var ray = new xeogl.Entity(self.scene, {
                    geometry: {
                        type: "xeogl.Geometry",
                        primitive: "lines",
                        positions: [0, 0, 0, 0, 0, 0],
                        indices: [0, 1]
                    },
                    material: {
                        type: "xeogl.PhongMaterial",
                        emissive: [1, 0.3, 0.3],
                        diffuse: [0, 0, 0],
                        ambient: [0, 0, 0],
                        lineWidth: 3
                    },
                    modes: {
                        pickable: false, // Can't pick the tylus helper
                        collidable: false // Don't include stylus helper in boundary calculations
                    }
                });

                this.setPosition = (function () {
                    var positions = new Float32Array(6);
                    return function (pos, dir) {
                        positions[0] = pos[0]; // Origin
                        positions[1] = pos[1];
                        positions[2] = pos[2];
                        positions[3] = pos[0] + dir[0]; // Direction
                        positions[4] = pos[1] + dir[1];
                        positions[5] = pos[2] + dir[2];

                        ray.geometry.positions = positions;
                    };
                })();

                this.setHighlighted = function (highlighted) {
                    ray.material.emissive = highlighted ? [0.3, 1.0, 0.3] : [1.0, 0.3, 0.3];
                    ray.material.lineWidth = highlighted ? 5 : 3;
                };

                this.destroy = function () {
                    ray.destroy();
                };
            })();

            var stylusHelper = this._stylusHelper;
            var zspaceEffect = this._attached.zspaceEffect;

            this._onStylusMoved = zspaceEffect.on("stylusMoved", (function () {

                var stylusLength = 0.5;
                var draggingEntity;
                var stylusHelperDir = math.vec3();
                var startOffset = vec4.create();
                var startRotation = quat.create();
                var button0Pressed = false;
                var lastEntityHighlighted = null;
                var hit;
                var stylusPos = vec3.create();
                var stylusDir = vec3.create();
                var stylusP = vec4.create();
                var stylusD = vec4.create();
                var rotationMatrix = mat3.create();
                var startScale = vec3.create();
                var q = quat.create();
                var matrix = mat4.create();
                var stylusEnd = vec4.create();
                var entityPos = vec4.create();
                var zero = vec4.create();
                var offset = vec4.create();
                var rotation = quat.create();
                var entityRotation = quat.create();
                var newRotation = quat.create();
                var newOffset = vec4.create();


                var extractScale = (function () {

                    var a = vec3.create();
                    var b = vec3.create();
                    var c = vec3.create();

                    function length(vec) {
                        return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
                    }

                    return function (scale, mat) {

                        a[0] = mat[0];
                        a[1] = mat[1];
                        a[2] = mat[2];

                        b[0] = mat[4];
                        b[1] = mat[5];
                        b[2] = mat[6];

                        c[0] = mat[8];
                        c[1] = mat[9];
                        c[2] = mat[10];

                        scale[0] = xeogl.math.lenVec3(a);
                        scale[1] = xeogl.math.lenVec3(b);
                        scale[2] = xeogl.math.lenVec3(c);
                    };
                })();

                return function () {

                    var stylusMatrix = zspaceEffect.stylusWorldMatrix;

                    vec3.set(stylusPos, stylusMatrix[12], stylusMatrix[13], stylusMatrix[14]);
                    vec3.set(stylusDir, -stylusMatrix[8], -stylusMatrix[9], -stylusMatrix[10]);

                    vec4.set(stylusP, stylusPos[0], stylusPos[1], stylusPos[2], 1.0);
                    vec4.set(stylusD, stylusDir[0], stylusDir[1], stylusDir[2], 1.0);

                    // Update stylus helper

                    math.mulVec3Scalar(stylusDir, 310, stylusHelperDir);
                    stylusHelper.setPosition(stylusPos, stylusHelperDir);

                    if (!draggingEntity) {

                        // Not dragging an entity
                        // Highlight whatever entity is currently hit by the stylus

                        hit = self.scene.pick({
                            pickSurface: false, // <--- Don't need 3D pick unless we want the ray-entity intersection point
                            origin: stylusPos,
                            direction: stylusDir
                        });

                        if (lastEntityHighlighted) {
                            if (!hit || (hit.entity.id !== lastEntityHighlighted.id)) {
                           //     lastEntityHighlighted.material.emissive = [0, 0, 0];  // De-highlight the previous hit entity
                            }
                        }

                        if (hit) {
                            stylusHelper.setHighlighted(true);
                         //   hit.entity.material.emissive = [0.25, 0.25, 0]; // highlight the new entity
                            lastEntityHighlighted = hit.entity;

                        } else {
                            stylusHelper.setHighlighted(false);
                            lastEntityHighlighted = null;
                        }
                    }

                    if (zspaceEffect.stylusButton0 !== button0Pressed) {

                        if (zspaceEffect.stylusButton0 && hit) {

                            // Button 0 down and stylus hitting an entity
                            // Grab entity and begin dragging it

                            draggingEntity = hit.entity;

                             //Ensure that the entity has a single modelling transform
                             //ZSPaceStylusControl cannot yet support articulation of hierarchies

                            if (draggingEntity.transform.parent) {

                                self.warn("Flattening transform of " + draggingEntity.type + " " + draggingEntity.id);

                                var transform = draggingEntity.transform;
                                draggingEntity.transform = draggingEntity.create({
                                    type: "xeogl.Transform",
                                    matrix: transform.leafMatrix
                                });
                            }

                            // Get rotation matrix from entity leaf transform

                            var entityModelMat = draggingEntity.transform.matrix;

                            mat3.fromMat4(rotationMatrix, entityModelMat);
                            quat.fromMat3(q, rotationMatrix);
                            quat.invert(q, q);
                            mat4.fromQuat(matrix, q);

                            extractScale(startScale, entityModelMat);

                            // TODO: startScale.setFromMatrixScale ( objectHit.matrixWorld );		// Get scale vector from entity's scale matrix

                            // Get World-space entity center

                            vec4.set(zero, 0.0, 0.0, 0.0, 1.0);
                            vec4.transformMat4(entityPos, zero, draggingEntity.transform.matrix);

                            // Get World-space stylus endpoint

                            vec4.scaleAndAdd(stylusEnd, stylusP, stylusD, stylusLength);

                            // Get offset of stylus end from entity center

                            vec4.subtract(offset, entityPos, stylusEnd);
                            vec4.transformMat4(startOffset, offset, matrix);

                            // Get rotation quaternion at start of drag

                            mat3.fromMat4(rotationMatrix, stylusMatrix);
                            quat.fromMat3(rotation, rotationMatrix);
                            quat.invert(rotation, rotation);
                            mat3.fromMat4(rotationMatrix, draggingEntity.transform.matrix);
                            quat.fromMat3(entityRotation, rotationMatrix);

                            quat.multiply(startRotation, rotation, entityRotation);

                            //draggingEntity.material.emissive = [0.25, 0.25, 0.0];

                        } else {

                            // Button 0 released - release entity

                            if (draggingEntity) {
                            //    draggingEntity.material.emissive = [0.0, 0.0, 0.0];
                                draggingEntity = null;
                            }
                        }

                        button0Pressed = zspaceEffect.stylusButton0;

                    } else if (draggingEntity) {

                        // Continue dragging entity

                        // TODO derive scale from startscale

                        vec4.scaleAndAdd(stylusEnd, stylusP, stylusD, stylusLength);
                        mat3.fromMat4(rotationMatrix, stylusMatrix);

                        quat.fromMat3(rotation, rotationMatrix);
                        quat.multiply(newRotation, rotation, startRotation);

                        mat4.fromQuat(matrix, newRotation);
                        vec4.transformMat4(offset, startOffset, matrix);

                        vec4.add(newOffset, offset, stylusEnd);

                        matrix[12] = newOffset[0];
                        matrix[13] = newOffset[1];
                        matrix[14] = newOffset[2];

                        draggingEntity.transform.matrix = matrix;
                    }
                };
            })());
        },

        _deactivate: function () {
            this._stylusHelper.destroy();
            this._attached.zspaceEffect.off(this._onStylusMoved);
        },

        _getJSON: function () {
            var json = {
                active: this._active
            };
            if (this._attached.zspaceEffect) {
                json.camera = this._attached.zspaceEffect.id;
            }
            return json;
        },

        _destroy: function () {
            this.active = false; // Indirectly calls _deactivate()
        }
    });
})();
