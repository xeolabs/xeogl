/**
 An **Entity** is an object within a xeogl {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 See the {{#crossLink "Scene"}}Scene{{/crossLink}} class documentation for more information on Entities.

 <img src="../../../assets/images/Entity.png"></img>

 ## Examples

 * [Entity with TorusGeometry and MetallicMaterial](../../examples/#entities_examples_metallicTorus)

 ## Boundaries

 #### Local-space

 A Entity provides its Local-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}}.

 ```` javascript
 var scene = new xeogl.Scene();

 var geometry = new xeogl.Geometry(myScene, {
      //...
 });

 var entity = new xeogl.Entity(myScene, {
       geometry: myGeometry,
       transform: translate
 });

 // Get the Local-space Boundary3D
 var localBoundary = entity.localBoundary;

 // Get Local-space entity-aligned bounding box (OBB),
 // which is an array of eight vertices that describes
 // the box that is aligned with the Entity's Geometry
 var obb = localBoundary.obb;

 // Get the Local-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = localBoundary.aabb;

 // get the Local-space center of the Entity:
 var center = localBoundary.center;
 ````

 #### World-space

 A Entity provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 transformation by the Entity's {{#crossLink "Entity/transform:property"}}Modelling transform{{/crossLink}}.

 ```` javascript
 var entity = new xeogl.Entity({
    geometry: new xeogl.TorusGeometry(),
    transform: new xeogl.Translate({
        xyz: [-5, 0, 0]
    })
 });

 // Get the World-space boundary
 var worldBoundary = entity.worldBoundary;

 // Get the boundary as an entity-aligned bounding box (OBB), which is a flattened array
 of eight 3D vertices that describes the box that is aligned with the Entity
 var obb = worldBoundary.obb;

 // Get the boundary as an axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = worldBoundary.aabb;

 ````

 #### View-space

 A Entity also provides its View-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry/positions:property"}}Geometry positions{{/crossLink}} after
 their transformation by the {{#crossLink "Camera/view:property"}}View{{/crossLink}} and
 {{#crossLink "Entity/transform:property"}}Modelling{{/crossLink}} transforms.

 ```` javascript
 // Get the View-space Boundary3D
 var viewBoundary = entity.viewBoundary;

 // Get View-space entity-aligned bounding box (OBB),
 // which is an array of eight vertices that describes
 // the box that is aligned with the Entity
 var obb = viewBoundary.obb;

 // Get the View-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = viewBoundary.aabb;

 // get the View-space center of the Entity:
 var center = viewBoundary.center;
 ````

 #### View-space

 A Entity also provides its Canvas-space boundary as a {{#crossLink "Boundary2D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry/positions:property"}}Geometry positions{{/crossLink}} after
 their transformation by the {{#crossLink "Entity/transform:property"}}Modelling{{/crossLink}},
 {{#crossLink "Camera/view:property"}}View{{/crossLink}} and {{#crossLink "Camera/project:property"}}Projection{{/crossLink}} transforms.

 ```` javascript
 // Get the Canvas-space Boundary2D
 var canvasBoundary = entity.canvasBoundary;

 // Get the Canvas-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = canvasBoundary.aabb;

 // get the Canvas-space center of the Entity:
 var center = canvasBoundary.center;
 ````

 ## Skyboxes

 An {{#crossLink "Entity"}}{{/crossLink}} has a {{#crossLink "Entity/stationary:property"}}{{/crossLink}} property
 that will cause it to never translate with respect to the viewpoint, while still rotationg, as if always far away.

 This is useful for using Entities as skyboxes, like so:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.BoxGeometry({
         xSize: 1000,
         ySize: 1000,
         zSize: 1000
     }),

     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
         })
     }),

     stationary: true // Locks position with respect to viewpoint
 });
 ````

 ## Billboarding

 An {{#crossLink "Entity"}}{{/crossLink}} has a {{#crossLink "Entity/billboard:property"}}{{/crossLink}} property
 that can make it behave as a billboard.

 Two billboard types are supported:

 * **Spherical** billboards are free to rotate their {{#crossLink "Entity"}}Entities{{/crossLink}} in any direction and always face the {{#crossLink "Camera"}}{{/crossLink}} perfectly.
 * **Cylindrical** billboards rotate their {{#crossLink "Entity"}}Entities{{/crossLink}} towards the {{#crossLink "Camera"}}{{/crossLink}}, but only about the Y-axis.

 Note that {{#crossLink "Scale"}}{{/crossLink}} transformations to have no effect on billboarded {{#crossLink "Entity"}}Entities{{/crossLink}}.

 The example below shows a box that remains rotated directly towards the viewpoint, using spherical billboarding:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.BoxGeometry(),

     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
         })
     }),

     billboard: "spherical"
 });
 ````

 #### Examples

 * [Spherical billboards](../../examples/#transforms_billboard_spherical)
 * [Cylindrical billboards](../../examples/#transforms_billboard_cylindrical)
 * [Clouds using billboards](../../examples/#transforms_billboard_spherical_clouds)


 @class Entity
 @module xeogl
 @submodule entities
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Entity within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Entity.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to attach to this Entity.  Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.clips] {String|Clips} ID or instance of a {{#crossLink "Clips"}}Clips{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/clips:property"}}clips{{/crossLink}}.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.lights] {String|Lights} ID or instance of a {{#crossLink "Lights"}}Lights{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/lights:property"}}lights{{/crossLink}}.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.morphTargets] {String|MorphTargets} ID or instance of a {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default instance, {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @param [cfg.viewport] {String|Viewport} ID or instance of a {{#crossLink "Viewport"}}{{/crossLink}} attached to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/viewport:property"}}{{/crossLink}}, which is automatically resizes to the canvas.
 @param [cfg.outline] {String|Outline} ID or instance of a {{#crossLink "Outline"}}{{/crossLink}} attached to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/outline:property"}}{{/crossLink}}.
 @param [cfg.xray] {String|XRay} ID or instance of a {{#crossLink "XRay"}}{{/crossLink}} attached to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/xray:property"}}{{/crossLink}}.
 @param [cfg.visible=true] {Boolean}  Indicates if this Entity is visible.
 @param [cfg.culled=true] {Boolean}  Indicates if this Entity is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this Entity is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this Entity is clippable by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.xrayed=false] {Boolean} Whether to render this Entity as X-rayed, as configured by the Entity's {{#crossLink "XRay"}}{{/crossLink}} component.
 @param [cfg.collidable=true] {Boolean} Whether this Entity is included in boundary calculations.
 @param [cfg.castShadow=true] {Boolean} Whether this Entity casts shadows.
 @param [cfg.receiveShadow=true] {Boolean} Whether this Entity receives shadows.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this entity, as configured by the Entity's {{#crossLink "Outline"}}{{/crossLink}} component
 @param [cfg.layer=0] {Number} Indicates this Entity's rendering priority, typically used for transparency sorting,
 @param [cfg.stationary=false] {Boolean} Disables the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}} translations for this Entity. This is useful for skybox Entities.
 @param [cfg.billboard="none"] {String} Specifies the billboarding behaviour for this Entity. Options are "none", "spherical" and "cylindrical".
 @param [cfg.loading] {Boolean} Flag which indicates that this Entity is freshly loaded. This will increment the
 {{#crossLink "Spinner/processes:property"}}Spinner processes{{/crossLink}} count, and then when this Entity is first
 rendered, will decrement the count again.
 @extends Component
 */

/**
 * Fired when this Entity is *picked* via a call to the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method
 * on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas {{/crossLink}}.
 * @event picked
 * @param {String} entityId The ID of this Entity.
 * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
 * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
 */
(function () {

    "use strict";

    xeogl.Entity = xeogl.Component.extend({

        type: "xeogl.Entity",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Modes({
                visible: true,
                culled: false,
                pickable: null,
                clippable: null,
                xrayed: null,
                collidable: null,
                castShadow: null,
                receiveShadow: null,
                outlined: null,
                layer: null,
                billboard: null,
                hash: ""
            });

            this._loading = cfg.loading;

            if (this._loading === true) {
                this.scene.canvas.spinner.processes++;
            }

            this.camera = cfg.camera;
            this.clips = cfg.clips;
            this.geometry = cfg.geometry;
            this.lights = cfg.lights;
            this.material = cfg.material;
            this.morphTargets = cfg.morphTargets;
            this.transform = cfg.transform;
            this.stationary = cfg.stationary;
            this.viewport = cfg.viewport;
            this.outline = cfg.outline;
            this.xray = cfg.xray;

            this.visible = cfg.visible;
            this.culled = cfg.culled;
            this.pickable = cfg.pickable;
            this.clippable = cfg.clippable;
            this.xrayed = cfg.xrayed;
            this.collidable = cfg.collidable;
            this.castShadow = cfg.castShadow;
            this.receiveShadow = cfg.receiveShadow;
            this.outlined = cfg.outlined;
            this.layer = cfg.layer;
            this.stationary = cfg.stationary;
            this.billboard = cfg.billboard;

            // Cached boundary for each coordinate space
            // The Entity's Geometry component caches the Local-space boundary

            this._worldBoundary = null;
            this._viewBoundary = null;
            this._canvasBoundary = null;

            this._worldBoundaryDirty = true;
            this._viewBoundaryDirty = true;
            this._canvasBoundaryDirty = true;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    // Invalidate cached World-space bounding boxes

                    this._setViewBoundaryDirty();

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "camera",
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true,
                        on: {
                            viewMatrix: {
                                callback: this._setViewBoundaryDirty,
                                scope: this
                            },
                            projMatrix: {
                                callback: this._setCanvasBoundaryDirty,
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The {{#crossLink "Clips"}}Clips{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/clips:property"}}clips{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/clips:event"}}{{/crossLink}} event on change.
             *
             * @property clips
             * @type Clips
             */
            clips: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/clips:property"}}{{/crossLink}} property changes.
                     * @event clips
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "clips",
                        type: "xeogl.Clips",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.clips;
                }
            },

            /**
             * The {{#crossLink "Geometry"}}Geometry{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/geometry:property"}}camera{{/crossLink}}
             * (a simple box) when set to a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/geometry:event"}}{{/crossLink}} event on change.
             *
             * Updates {{#crossLink "Entity/boundary"}}{{/crossLink}},
             * {{#crossLink "Entity/worldObb"}}{{/crossLink}} and
             * {{#crossLink "Entity/center"}}{{/crossLink}}
             *
             * @property geometry
             * @type Geometry
             */
            geometry: {

                set: function (value) {

                    // Invalidate cached World-space bounding boxes

                    this._setWorldBoundaryDirty();

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/geometry:property"}}{{/crossLink}} property changes.
                     *
                     * @event geometry
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "geometry",
                        type: "xeogl.Geometry",
                        component: value,
                        sceneDefault: true,
                        on: {
                            positions: {
                                callback: this._setWorldBoundaryDirty,
                                scope: this
                            },
                            destroyed: {
                                callback: this._setWorldBoundaryDirty,
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.geometry;
                }
            },

            /**
             * The {{#crossLink "Lights"}}Lights{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}lights{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/lights:event"}}{{/crossLink}} event on change.
             *
             * @property lights
             * @type Lights
             */
            lights: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/lights:property"}}{{/crossLink}} property changes.
                     *
                     * @event lights
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "lights",
                        type: "xeogl.Lights",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.lights;
                }
            },

            /**
             * The {{#crossLink "Material"}}Material{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/material:property"}}material{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/material:event"}}{{/crossLink}} event on change.
             *
             * @property material
             * @type Material
             */
            material: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/material:property"}}{{/crossLink}} property changes.
                     *
                     * @event material
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "material",
                        type: "xeogl.Material",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.material;
                }
            },

            /**
             * The {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/morphTargets:event"}}{{/crossLink}} event on change.
             *
             * @property morphTargets
             * @private
             * @type MorphTargets
             */
            morphTargets: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/morphTargets:property"}}{{/crossLink}} property changes.
                     * @event morphTargets
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "morphTargets",
                        type: "xeogl.MorphTargets",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.morphTargets;
                }
            },

            /**
             * The Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/transform:property"}}transform{{/crossLink}}
             * (an identity matrix) when set to a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/transform:event"}}{{/crossLink}} event on change.
             *
             * Updates {{#crossLink "Entity/boundary"}}{{/crossLink}},
             * {{#crossLink "Entity/worldObb"}}{{/crossLink}} and
             * {{#crossLink "Entity/center"}}{{/crossLink}}
             *
             * @property transform
             * @type Transform
             */
            transform: {

                set: function (value) {

                    // Invalidate cached World-space bounding boxes

                    this._setWorldBoundaryDirty();

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/transform:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event transform
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "transform",
                        type: "xeogl.Transform",
                        component: value,
                        sceneDefault: true,
                        on: {
                            updated: {

                                callback: function () {

                                    if (this._transformDirty) {
                                        return;
                                    }

                                    this._transformDirty = true;

                                    xeogl.scheduleTask(this._transformUpdated, this);
                                },
                                scope: this
                            },

                            destroyed: {
                                callback: this._setWorldBoundaryDirty,
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.transform;
                }
            },
            
            /**
             * The {{#crossLink "Viewport"}}{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. When set to a null or undefined value,
             * defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/viewport:property"}}viewport{{/crossLink}},
             * which automatically resizes to the canvas.
             *
             * Fires an {{#crossLink "Entity/viewport:event"}}{{/crossLink}} event on change.
             *
             * @property viewport
             * @type Viewport
             */
            viewport: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/viewport:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event viewport
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "viewport",
                        type: "xeogl.Viewport",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.viewport;
                }
            },

            /**
             * The {{#crossLink "Outline"}}Outline{{/crossLink}} effect attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/outline:property"}}Outline{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/outline:event"}}{{/crossLink}} event on change.
             *
             * @property outline
             * @type Outline
             */
            outline: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/Outline:property"}}{{/crossLink}} property changes.
                     *
                     * @event Outline
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "outline",
                        type: "xeogl.Outline",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.outline;
                }
            },

            /**
             * The {{#crossLink "XRay"}}XRay{{/crossLink}} effect attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/xray:property"}}XRay{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/xray:event"}}{{/crossLink}} event on change.
             *
             * @property xray
             * @type XRay
             */
            xray: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/XRay:property"}}{{/crossLink}} property changes.
                     *
                     * @event XRay
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "xray",
                        type: "xeogl.XRay",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.xray;
                }
            },

            /**
             Indicates whether this Entity is visible or not.

             The Entity is only rendered when {{#crossLink "Entity/visible:property"}}{{/crossLink}} is true and
             {{#crossLink "Entity/culled:property"}}{{/crossLink}} is false.
             
             Fires a {{#crossLink "Entity/visible:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    this._state.visible =  value !== false;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible",  this._state.visible);
                },

                get: function () {
                    return this._state.visible;
                }
            },

            /**
             Indicates whether or not this Entity is currently culled from view.

             The Entity is only rendered when {{#crossLink "Entity/visible:property"}}{{/crossLink}} is true and
             {{#crossLink "Entity/culled:property"}}{{/crossLink}} is false.

             Fires a {{#crossLink "Entity/culled:event"}}{{/crossLink}} event on change.

             @property culled
             @default false
             @type Boolean
             */
            culled: {

                set: function (value) {
                    
                    this._state.culled =  !!value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/culled:property"}}{{/crossLink}} property changes.

                     @event culled
                     @param value {Boolean} The property's new value
                     */
                    this.fire("culled",  this._state.culled);
                },

                get: function () {
                    return this._state.culled;
                }
            },

            /**
             Indicates whether this entity is pickable or not.

             Picking is done via calls to {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}.

             Fires a {{#crossLink "Entity/pickable:event"}}{{/crossLink}} event on change.

             @property pickable
             @default true
             @type Boolean
             */
            pickable: {

                set: function (value) {

                    value = value !== false;

                    if (this._state.pickable === value) {
                        return;
                    }

                    this._state.pickable = value;

                    // No need to trigger a render;
                    // state is only used when picking

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/pickable:property"}}{{/crossLink}} property changes.
                     *
                     * @event pickable
                     * @param value The property's new value
                     */
                    this.fire("pickable", this._state.pickable);
                },

                get: function () {
                    return this._state.pickable;
                }
            },

            /**
             Indicates whether this Entity is clippable by {{#crossLink "Clips"}}{{/crossLink}} components.

             Fires a {{#crossLink "Entity/clippable:event"}}{{/crossLink}} event on change.

             @property clippable
             @default true
             @type Boolean
             */
            clippable: {

                set: function (value) {

                    value = value !== false;

                    if (this._state.clippable === value) {
                        return;
                    }

                    this._state.clippable = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/clippable:property"}}{{/crossLink}} property changes.

                     @event clippable
                     @param value The property's new value
                     */
                    this.fire("clippable", this._state.clippable);
                },

                get: function () {
                    return this._state.clippable;
                }
            },

            /**
             Indicates whether this Entity is included in boundary calculations.

             Set this false if the Entity is a helper or indicator that should not be included in boundary calculations.

             For example, when set false, the {{#crossLink "Entity/worldBoundary:property"}}World-space boundary{{/crossLink}} of all attached {{#crossLink "Entity"}}Entities{{/crossLink}} would not be considered when calculating the {{#crossLink "Scene/worldBoundary:property"}}World-space boundary{{/crossLink}} of their
             {{#crossLink "Scene"}}{{/crossLink}}.

             Fires a {{#crossLink "Entity/collidable:event"}}{{/crossLink}} event on change.

             @property collidable
             @default true
             @type Boolean
             */
            collidable: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._state.collidable) {
                        return;
                    }

                    this._state.collidable = value;

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/collidable:property"}}{{/crossLink}} property changes.

                     @event collidable
                     @param value The property's new value
                     */
                    this.fire("collidable", this._state.collidable);
                },

                get: function () {
                    return this._state.collidable;
                }
            },


            /**
             Indicates whether this Entity casts shadows.

             Fires a {{#crossLink "Entity/castShadow:event"}}{{/crossLink}} event on change.

             @property castShadow
             @default true
             @type Boolean
             */
            castShadow: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._state.castShadow) {
                        return;
                    }

                    this._state.castShadow = value;

                    this._renderer.imageDirty = true; // Re-render in next shadow map generation pass

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/castShadow:property"}}{{/crossLink}} property changes.

                     @event castShadow
                     @param value The property's new value
                     */
                    this.fire("castShadow", this._state.castShadow);
                },

                get: function () {
                    return this._state.castShadow;
                }
            },

            /**
             Indicates whether this Entity receives shadows.

             Fires a {{#crossLink "Entity/receiveShadow:event"}}{{/crossLink}} event on change.

             @property receiveShadow
             @default true
             @type Boolean
             */
            receiveShadow: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._state.receiveShadow) {
                        return;
                    }

                    this._state.receiveShadow = value;

                    this._state.hash = value ? "/mod/rs;" : "/mod;";

                    this.fire("dirty", this); // Now need to (re)compile shaders to include/exclude shadow mapping

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/receiveShadow:property"}}{{/crossLink}} property changes.

                     @event receiveShadow
                     @param value The property's new value
                     */
                    this.fire("receiveShadow", this._state.receiveShadow);
                },

                get: function () {
                    return this._state.receiveShadow;
                }
            },

            /**
             Indicates whether this Entity is rendered with an outline.

             The outline effect is configured via the Entity's {{#crossLink "Entity/outline:property"}}outline{{/crossLink}} component.

             Fires a {{#crossLink "Entity/outlined:event"}}{{/crossLink}} event on change.

             @property outlined
             @default false
             @type Boolean
             */
            outlined: {

                set: function (value) {

                    value = !!value;

                    if (value === this._state.outlined) {
                        return;
                    }

                    this._state.outlined = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Entity' {{#crossLink "Entity/outlined:property"}}{{/crossLink}} property changes.

                     @event outlined
                     @param value The property's new value
                     */
                    this.fire("outlined", this._state.outlined);
                },

                get: function () {
                    return this._state.outlined;
                }
            },

            /**
             Indicates whether this Entity is rendered X-rayed (transparent).

             The X-ray effect is configured via the Entity's {{#crossLink "Entity/xray:property"}}outline{{/crossLink}} component.

             Fires a {{#crossLink "Entity/xrayed:event"}}{{/crossLink}} event on change.

             @property xrayed
             @default false
             @type Boolean
             */
            xrayed: {

                set: function (value) {

                    value = !!value;

                    if (this._state.xrayed === value) {
                        return;
                    }

                    this._state.xrayed = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Entity's {{#crossLink "Entity/xrayed:property"}}{{/crossLink}} property changes.

                     @event xrayed
                     @param value The property's new value
                     */
                    this.fire("xrayed", this._state.xrayed);
                },

                get: function () {
                    return this._state.xrayed;
                }
            },

            /**
             * Indicates this Entity's rendering order.
             *
             * This can be set on multiple transparent Entities, to make them render in a specific order   
             * for correct alpha blending.
             *
             * Fires a {{#crossLink "Layer/layer:event"}}{{/crossLink}} event on change.
             *
             * @property layer
             * @default 0
             * @type Number
             */
            layer: {

                set: function (value) {

                    // TODO: Only accept rendering layer in range [0...MAX_layer]

                    value = value || 0;

                    value = Math.round(value);


                    if (value === this._state.layer) {
                        return;
                    }

                    this._state.layer = value;

                    this._renderer.stateOrderDirty = true;

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Layer/layer:property"}}{{/crossLink}} property changes.
                     *
                     * @event layer
                     * @param value The property's new value
                     */
                    this.fire("layer", this._state.layer);
                },

                get: function () {
                    return this._state.layer;
                }
            },

            /**
             * Flag which indicates whether this Entity is stationary or not.
             *
             * Setting this true will disable the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}}
             * translations for this Entity, while still alowing it to rotate. This is useful for skybox Entities.

             * Fires an {{#crossLink "Entity/stationary:event"}}{{/crossLink}} event on change.
             *
             * @property stationary
             * @default false
             * @type Boolean
             */
            stationary: {

                set: function (value) {

                    value = !!value;

                    if (this._state.stationary === value) {
                        return;
                    }

                    this._state.stationary = value;

                  //  this._state.hash = (this._state.stationary ? "a;" : ";");

                    this.fire("dirty", this);

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/stationary:property"}}{{/crossLink}} property changes.
                     * @event stationary
                     * @param value The property's new value
                     */
                    this.fire('stationary', this._state.stationary);
                },

                get: function () {
                    return this._state.stationary;
                }
            },

            /**
             * Specifies the billboarding behaviour for this Entity.
             *
             * Options are:
             *
             *     * **"none"** -  **(default)** - No billboarding.
             *     * **"spherical"** - Entity is billboarded to face the viewpoint, rotating both vertically and horizontally.
             *     * **"cylindrical"** - Entity is billboarded to face the viewpoint, rotating only about its vertically
             *     axis. Use this mode for things like trees on a landscape.
             *
             * Fires an {{#crossLink "Entity/billboard:event"}}{{/crossLink}} event on change.
             *
             * @property billboard
             * @default "none"
             * @type String
             */
            billboard: {

                set: function (value) {

                    value = value || "none";

                    if (value !== "spherical" &&
                        value !== "cylindrical" &&
                        value !== "none") {

                        this.error("Unsupported value for 'billboard': " + value + " - accepted values are " +
                            "'spherical', 'cylindrical' and 'none' - defaulting to 'none'.");

                        value = "none";
                    }

                    if (this._state.billboard === value) {
                        return;
                    }

                    this._state.billboard = value;

                    this._state.hash = (this._state.active ? "a;" : ";") + (this._state.billboard ? "s;" : ";");

                    this.fire("dirty", this);

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/billboard:property"}}{{/crossLink}} property changes.
                     * @event billboard
                     * @param value The property's new value
                     */
                    this.fire('billboard', this._state.billboard);
                },

                get: function () {
                    return this._state.billboard;
                }
            },
            
            /**
             * Local-space 3D boundary of this Entity.
             *
             * This is a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
             * the {{#crossLink "Geometry"}}{{/crossLink}} that is attached to this Entity.
             *
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} will fire an {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}}
             * event whenever this Entity's {{#crossLink "Entity/geometry:property"}}{{/crossLink}} is linked to
             * a new {{#crossLink "Geometry"}}{{/crossLink}}, or whenever the {{#crossLink "Geometry"}}{{/crossLink}}'s
             * {{#crossLink "Geometry/positions:property"}}{{/crossLink}} are updated.
             *
             * The a {{#crossLink "Boundary3D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * @property localBoundary
             * @type Boundary3D
             * @final
             */
            localBoundary: {

                get: function () {
                    return this._attached.geometry.localBoundary;
                }
            },

            /**
             * World-space 3D boundary of this Entity.
             *
             * This is a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses the {{#crossLink "Geometry"}}{{/crossLink}}
             * that is attached to this Entity after transformation by this Entity's modelling
             * {{#crossLink "Entity/transform:property"}}{{/crossLink}}.
             *
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} will fire an {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}}
             * event whenever this Entity's {{#crossLink "Entity/geometry:property"}}{{/crossLink}} is linked to
             * a new {{#crossLink "Geometry"}}{{/crossLink}}, or whenever the {{#crossLink "Geometry"}}{{/crossLink}}'s
             * {{#crossLink "Geometry/positions:property"}}{{/crossLink}} are updated.
             *
             * The a {{#crossLink "Boundary3D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * <h4>Example</h4>
             *
             * [here](http://xeogl.org/examples/#boundaries_Entity_worldBoundary)
             *
             * <h4>Performance</h4>
             *
             * To minimize performance overhead, only reference this property if you need it, and destroy
             * the {{#crossLink "Boundary3D"}}{{/crossLink}} as soon as you don't need it anymore.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._worldBoundary) {

                        var self = this;

                        // this._setWorldBoundaryDirty();

                        this._worldBoundary = this.create({

                            type:"xeogl.Boundary3D",

                            getDirty: function () {
                                if (self._worldBoundaryDirty) {
                                    self._worldBoundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            // Faster and less precise than getPositions:
                            getOBB: function () {
                                var geometry = self._attached.geometry;
                                if (geometry) {
                                    var boundary = geometry.localBoundary;
                                    return boundary.obb;
                                }
                            },

                            //getPositions: function () {
                            //    return self._attached.geometry.positions;
                            //},

                            getMatrix: function () {

                                var transform = self._attached.transform;

                                if (self._transformDirty) {
                                    transform._buildLeafMatrix();
                                    self._setWorldBoundaryDirty();
                                    self._transformDirty = false;
                                }

                                return transform.leafMatrix;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {
                                self._worldBoundary = null;
                            });
                    }

                    return this._worldBoundary;
                }
            },

            /**
             * View-space 3D boundary of this Entity.
             *
             * This is a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses the {{#crossLink "Geometry"}}{{/crossLink}}
             * that is attached to this Entity after transformation by this Entity's modelling
             * {{#crossLink "Entity/transform:property"}}{{/crossLink}} and {{#crossLink "Camera"}}{{/crossLink}}
             * {{#crossLink "Camera/view:property"}}view transform{{/crossLink}}.
             *
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} will fire an {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}}
             * event whenever there are any changes to the {{#crossLink "Geometry"}}{{/crossLink}},
             * {{#crossLink "Entity/transform:property"}}{{/crossLink}} or {{#crossLink "Camera"}}{{/crossLink}} that
             * would affect its extents.
             *
             * The a {{#crossLink "Boundary3D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * <h4>Performance</h4>
             *
             * To minimize performance overhead, only reference this property if you need it, and destroy
             * the {{#crossLink "Boundary3D"}}{{/crossLink}} as soon as you don't need it anymore.
             *
             * @property viewBoundary
             * @type Boundary3D
             * @final
             */
            viewBoundary: {

                get: function () {

                    if (!this._viewBoundary) {

                        var self = this;

                        //     this._setViewBoundaryDirty();

                        this._viewBoundary = this.create({

                            type:"xeogl.Boundary3D",

                            getDirty: function () {
                                if (self._viewBoundaryDirty) {
                                    self._viewBoundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getOBB: function () {
                                return self.worldBoundary.obb;
                            },

                            getMatrix: function () {
                                return self._attached.camera.view.matrix;
                            }
                        });

                        this._viewBoundary.on("destroyed",
                            function () {
                                self._viewBoundary = null;
                            });
                    }

                    return this._viewBoundary;
                }
            },

            /**
             * Canvas-space 2D boundary.
             *
             * This is a {{#crossLink "Boundary2D"}}{{/crossLink}} that encloses this Entity's
             * {{#crossLink "Entity/geometry:property"}}{{/crossLink}} after transformation by this Entity's modelling
             * {{#crossLink "Entity/transform:property"}}{{/crossLink}} and {{#crossLink "Camera"}}{{/crossLink}}
             * {{#crossLink "Camera/view:property"}}view{{/crossLink}} and
             * {{#crossLink "Camera/project:property"}}projection{{/crossLink}} transforms.
             *
             * The {{#crossLink "Boundary2D"}}{{/crossLink}} will fire an {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}}
             * event whenever there are any changes to the {{#crossLink "Geometry"}}{{/crossLink}},
             * {{#crossLink "Entity/transform:property"}}{{/crossLink}} or {{#crossLink "Camera"}}{{/crossLink}} that
             * would affect its extents.
             *
             * The a {{#crossLink "Boundary2D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary2D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * <h4>Performance</h4>
             *
             * To minimize performance overhead, only reference this property if you need it, and destroy
             * the {{#crossLink "Boundary2D"}}{{/crossLink}} as soon as you don't need it anymore.
             *
             * @property canvasBoundary
             * @type Boundary2D
             * @final
             */
            canvasBoundary: {

                get: function () {

                    if (!this._canvasBoundary) {

                        var self = this;

                        //   this._setCanvasBoundaryDirty();

                        this._canvasBoundary = this.create({

                            type:"xeogl.Boundary2D",

                            getDirty: function () {
                                if (self._canvasBoundaryDirty) {
                                    self._canvasBoundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getOBB: function () {
                                return self.viewBoundary.obb;
                            },

                            getMatrix: function () {
                                return self._attached.camera.project.matrix;
                            }
                        });

                        this._canvasBoundary.on("destroyed",
                            function () {
                                self._canvasBoundary = null;
                            });
                    }

                    return this._canvasBoundary;
                }
            },

            /**
             * JSON object containing the (GLSL) source code of the shaders for this Entity.
             *
             * This is sometimes useful to have as a reference
             * when constructing your own custom {{#crossLink "Shader"}}{{/crossLink}} components.
             *
             * Will return null if xeogl has not yet rendered this Entity.
             *
             * @property glsl
             * @type JSON
             * @final
             */
            glsl: {

                get: function () {
                    var rendererObject = this._renderer.objects[this.id];
                    if (!rendererObject) {
                        return null;
                    }
                    var source = rendererObject.program.program.source;
                    return {
                        draw: {
                            vertex: source.vertexDraw,
                            fragment: source.fragmentDraw
                        },
                        pickObject: {
                            vertex: source.vertexPickObject,
                            fragment: source.fragmentPickObject
                        },
                        pickPrimitive: {
                            vertex: source.vertexPickPrimitive,
                            fragment: source.fragmentPickPrimitive
                        }
                    };
                }
            },

            /**
             * The (GLSL) source code of the shaders for this Entity, as a string.
             *
             * This is sometimes useful to have as a reference
             * when constructing your own custom {{#crossLink "Shader"}}{{/crossLink}} components.
             *
             * Will return null if xeogl has not yet rendered this Entity.
             *
             * @property glslString
             * @type String
             * @final
             */
            glslString: {

                get: function () {
                    var glsl = this.glsl;
                    if (glsl) {
                        return JSON.stringify(glsl, "\n", 4);
                    }
                }
            }
        },

        // Callbacks as members, to avoid GC churn

        _transformUpdated: function () {
            if (!this._transformDirty) {
                return;
            }
            this._attached.transform._buildLeafMatrix();
            this._setWorldBoundaryDirty();
            this._transformDirty = false;
        },


        _setWorldBoundaryDirty: function () {
            this._worldBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
            this._setViewBoundaryDirty();
            var lights = this._attached.lights;
            if (lights) {
                lights._shadowsDirty(); // Need to re-render shadow maps
            }
        },

        _setViewBoundaryDirty: function () {
            this._viewBoundaryDirty = true;
            if (this._viewBoundary) {
                this._viewBoundary.fire("updated", true);
            }
            this._setCanvasBoundaryDirty();
        },

        _setCanvasBoundaryDirty: function () {
            this._canvasBoundaryDirty = true;
            if (this._canvasBoundary) {
                this._canvasBoundary.fire("updated", true);
            }
        },

        // Returns true if there is enough on this Entity to render something.
        _valid: function () {
            var geometry = this._attached.geometry;
            return !this.destroyed && geometry && geometry.positions && geometry.indices;

        },

        _compileAsynch: function () {

            var self = this;

            if (!this._compiling) {

                self._compiling = true;

                var object = this._renderer.objects[this.id];

                if (object) {
                    object.compiled = false;
                }

                var task = function () {

                    if (!self._valid()) {
                        xeogl.scheduleTask(task);
                        return;
                    }

                    self._compile();

                    self._compiling = false;
                };

                xeogl.scheduleTask(task);
            }
        },

        _compile: function () {

            var attached = this._attached;

            attached.camera._compile();
            attached.clips._compile();
            attached.geometry._compile();
            attached.lights._compile();
            attached.material._compile();
            this._renderer.modelTransform = attached.transform._state;
            attached.viewport._compile();
            attached.outline._compile();
            attached.xray._compile();

            this._makeHash();

            this._renderer.modes = this._state;

            // (Re)build this Entity in the renderer; for each Entity in teh scene graph,
            // there is an "object" in the renderer, that has the same ID as the entity

            var objectId = this.id;

            var result = this._renderer.buildObject(objectId);

            if (this._loading) {

                // This Entity was flagged as freshly loaded, which incremented the xeogl.Spinner#processes
                // count on the Scene Canvas, causing a spinner to appear. Unflag and decrement the
                // count now that we have compiled it into the render graph. Spinner will disappear
                // when the count has returned to zero.

                this.scene.canvas.spinner.processes--;
                this._loading = false;
                this.fire("loaded", true);
            }

            if (result && result.error) {

                // Object has errors, probably due to
                // shader not allocating/compiling/linking.

                this.error(result.errorLog.join("\n"));
            }
        },

        _makeHash: function () {
            var hash = [];
            var state = this._state;
            if (state.stationary) {
                hash.push("/s");
            }
            if (state.billboard === "none") {
                hash.push("/n");
            } else if (state.billboard === "spherical") {
                hash.push("/s");
            } else if (state.billboard === "cylindrical") {
                hash.push("/c");
            }
            hash.push(";");
            this._state.hash = hash.join("");
        },

        _getJSON: function () {

            var attached = this._attached;

            return {
                camera: attached.camera.id,
                clips: attached.clips.id,
                geometry: attached.geometry.id,
                lights: attached.lights.id,
                material: attached.material.id,
                transform: attached.transform.id,
                viewport: attached.viewport.id,
                outline: attached.outline.id,
                xray: attached.xray.id,

                visible: this._state.visible,
                culled: this._state.culled,
                pickable: this._state.pickable,
                clippable: this._state.clippable,
                collidable: this._state.collidable,
                castShadow: this._state.castShadow,
                receiveShadow: this._state.receiveShadow,
                outlined: this._state.outlined,
                xrayed:  this._state.xrayed,
                layer: this._state.layer,
                stationary: this._state.stationary,
                billboard: this._state.billboard
            };
        },

        _destroy: function () {
            this._renderer.removeObject(this.id);
        }
    });

})();
