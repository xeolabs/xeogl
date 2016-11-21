/**
 An **Entity** is an object within a xeogl {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 See the {{#crossLink "Scene"}}Scene{{/crossLink}} class documentation for more information on Entities.

 <img src="../../../assets/images/Entity.png"></img>

 ## Examples

 * [Minimal Entity example](../../examples/#entities_minimal)

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
 var scene = new xeogl.Scene();

 var geometry = new xeogl.Geometry(myScene, {
      //...
 });

 var translate = new xeogl.Translate(scene, {
    xyz: [-5, 0, 0] // Translate along -X axis
 });

 var entity = new xeogl.Entity(myScene, {
       geometry: myGeometry,
       transform: translate
 });

 // Get the World-space Boundary3D
 var worldBoundary = entity.worldBoundary;

 // Get World-space entity-aligned bounding box (OBB),
 // which is an array of eight vertices that describes
 // the box that is aligned with the Entity
 var obb = worldBoundary.obb;

 // Get the World-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = worldBoundary.aabb;

 // get the World-space center of the Entity:
 var center = worldBoundary.center;
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
 @param [cfg.depthBuf] {String|DepthBuf} ID or instance of a {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, depth {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}}.
 @param [cfg.visibility] {String|Visibility} ID or instance of a {{#crossLink "Visibility"}}Visibility{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}}.
 @param [cfg.cull] {String|Cull} ID or instance of a {{#crossLink "Cull"}}{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}{{/crossLink}}'s default instance, {{#crossLink "Scene/cull:property"}}cull{{/crossLink}}.
 @param [cfg.modes] {String|Modes} ID or instance of a {{#crossLink "Modes"}}Modes{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/modes:property"}}modes{{/crossLink}}.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.layer] {String|Layer} ID or instance of a {{#crossLink "Layer"}}Layer{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}.
 @param [cfg.lights] {String|Lights} ID or instance of a {{#crossLink "Lights"}}Lights{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/lights:property"}}lights{{/crossLink}}.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.morphTargets] {String|MorphTargets} ID or instance of a {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default instance, {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}}.
 @param [cfg.reflect] {String|Reflect} ID or instance of a {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/reflect:property"}}reflection{{/crossLink}}.
 @param [cfg.stage] {String|Stage} ID or instance of of a {{#crossLink "Stage"}}Stage{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @param [cfg.viewport] {String|Viewport} ID or instance of a {{#crossLink "Viewport"}}{{/crossLink}} attached to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/viewport:property"}}{{/crossLink}}, which is automatically resizes to the canvas.
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

            this._loading = cfg.loading;

            if (this._loading === true) {
                this.scene.canvas.spinner.processes++;
            }

            this.camera = cfg.camera;
            this.clips = cfg.clips;
            this.colorTarget = cfg.colorTarget;
            this.colorBuf = cfg.colorBuf;
            this.depthTarget = cfg.depthTarget;
            this.depthBuf = cfg.depthBuf;
            this.visibility = cfg.visibility;
            this.cull = cfg.cull;
            this.modes = cfg.modes;
            this.geometry = cfg.geometry;
            this.layer = cfg.layer;
            this.lights = cfg.lights;
            this.material = cfg.material;
            this.morphTargets = cfg.morphTargets;
            this.reflect = cfg.reflect;
            this.shader = cfg.shader;
            this.shaderParams = cfg.shaderParams;
            this.stage = cfg.stage;
            this.transform = cfg.transform;
            this.billboard = cfg.billboard;
            this.stationary = cfg.stationary;
            this.viewport = cfg.viewport;

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
             * The {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/colorTarget:event"}}{{/crossLink}} event on change.
             *
             * @property colorTarget
             * @private
             * @type ColorTarget
             */
            colorTarget: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/colorTarget:property"}}{{/crossLink}} property changes.
                     * @event colorTarget
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "colorTarget",
                        type: "xeogl.ColorTarget",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.colorTarget;
                }
            },

            /**
             * The {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorBuf:property"}}colorBuf{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/colorBuf:event"}}{{/crossLink}} event on change.
             *
             * @property colorBuf
             * @type ColorBuf
             */
            colorBuf: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/colorBuf:property"}}{{/crossLink}} property changes.
                     *
                     * @event colorBuf
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "colorBuf",
                        type: "xeogl.ColorBuf",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.colorBuf;
                }
            },

            /**
             * The {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/depthTarget:event"}}{{/crossLink}} event on change.
             *
             * @property depthTarget
             * @private
             * @type DepthTarget
             */
            depthTarget: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/depthTarget:property"}}{{/crossLink}} property changes.
                     *
                     * @event depthTarget
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "depthTarget",
                        type: "xeogl.DepthTarget",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.depthTarget;
                }
            },

            /**
             * The {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
             * parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/depthBuf:event"}}{{/crossLink}} event on change.
             *
             * @property depthBuf
             * @type DepthBuf
             */
            depthBuf: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/depthBuf:property"}}{{/crossLink}} property changes.
                     *
                     * @event depthBuf
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "depthBuf",
                        type: "xeogl.DepthBuf",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.depthBuf;
                }
            },

            /**
             * The {{#crossLink "Visibility"}}Visibility{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/visibility:event"}}{{/crossLink}} event on change.
             *
             * @property visibility
             * @type Visibility
             */
            visibility: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/visibility:property"}}{{/crossLink}} property changes.
                     *
                     * @event visibility
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "visibility",
                        type: "xeogl.Visibility",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.visibility;
                }
            },

            /**
             * The {{#crossLink "Cull"}}{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/cull:property"}}cull{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/cull:event"}}{{/crossLink}} event on change.
             *
             * @property cull
             * @type Cull
             */
            cull: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/cull:property"}}{{/crossLink}} property changes.
                     *
                     * @event cull
                     * @param value The property's new value
                     */

                    this._attach({
                        name: "cull",
                        type: "xeogl.Cull",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.cull;
                }
            },

            /**
             * The {{#crossLink "Modes"}}Modes{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/modes:property"}}modes{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/modes:event"}}{{/crossLink}} event on change.
             *
             * @property modes
             * @type Modes
             */
            modes: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/modes:property"}}{{/crossLink}} property changes.
                     *
                     * @event modes
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "modes",
                        type: "xeogl.Modes",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.modes;
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
                     * @event modes
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
             * The {{#crossLink "Layer"}}Layer{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/layer:property"}}layer{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/layer:event"}}{{/crossLink}} event on change.
             *
             * @property layer
             * @type Layer
             */
            layer: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/layer:property"}}{{/crossLink}} property changes.
                     *
                     * @event layer
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "layer",
                        type: "xeogl.Layer",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.layer;
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
             * The {{#crossLink "Reflect"}}Reflect{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/reflect:property"}}reflect{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/reflect:event"}}{{/crossLink}} event on change.
             *
             * @property reflect
             * @type Reflect
             */
            reflect: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/reflect:property"}}{{/crossLink}} property changes.
                     *
                     * @event reflect
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "reflect",
                        type: "xeogl.Reflect",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.reflect;
                }
            },

            /**
             * The {{#crossLink "Shader"}}Shader{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shader:property"}}shader{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/shader:event"}}{{/crossLink}} event on change.
             *
             * @property shader
             * @private
             * @type Shader
             */
            shader: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/shader:property"}}{{/crossLink}} property changes.
                     * @event shader
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "shader",
                        type: "xeogl.Shader",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.shader;
                }
            },

            /**
             * The {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/shaderParams:event"}}{{/crossLink}} event on change.
             *
             * @property shaderParams
             * @private
             * @type ShaderParams
             */
            shaderParams: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/shaderParams:property"}}{{/crossLink}} property changes.
                     *
                     * @event shaderParams
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "shaderParams",
                        type: "xeogl.ShaderParams",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.shaderParams;
                }
            },

            /**
             * The {{#crossLink "Stage"}}Stage{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/stage:property"}}stage{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/stage:event"}}{{/crossLink}} event on change.
             *
             * @property stage
             * @type Stage
             */
            stage: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/stage:property"}}{{/crossLink}} property changes.
                     *
                     * @event stage
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "stage",
                        type: "xeogl.Stage",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.stage;
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
             * The {{#crossLink "Billboard"}}{{/crossLink}} attached to this Entity.
             *
             * When {{#crossLink "Billboard/property:active"}}{{/crossLink}}, the {{#crossLink "Billboard"}}{{/crossLink}}
             * will keep this Entity oriented towards the viewpoint.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/billboard:property"}}billboard{{/crossLink}}
             * (an identity matrix) when set to a null or undefined value.
             *
             * Fires an {{#crossLink "Entity/billboard:event"}}{{/crossLink}} event on change.
             *
             * @property billboard
             * @type Billboard
             */
            billboard: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/billboard:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event billboard
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "billboard",
                        type: "xeogl.Billboard",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.billboard;
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
             * The {{#crossLink "Stationary"}}{{/crossLink}} attached to this Entity.
             *
             * When {{#crossLink "Stationary/property:active"}}{{/crossLink}}, the {{#crossLink "Stationary"}}{{/crossLink}}
             * will prevent the translation component of the viewing transform from being applied to this Entity, yet
             * still allowing it to rotate.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/stationary:property"}}stationary{{/crossLink}},
             * which is disabled by default.
             *
             * Fires an {{#crossLink "Entity/stationary:event"}}{{/crossLink}} event on change.
             *
             * @property stationary
             * @type Stationary
             */
            stationary: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/stationary:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event stationary
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "stationary",
                        type: "xeogl.Stationary",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.stationary;
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

        _compile: function () {

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

                    self.__compile();

                    self._compiling = false;
                };

                xeogl.scheduleTask(task);
            }
        },

        __compile: function () {

            var attached = this._attached;

            attached.camera._compile();
            attached.clips._compile();
            attached.colorTarget._compile();
            attached.colorBuf._compile();
            attached.depthTarget._compile();
            attached.depthBuf._compile();
            attached.visibility._compile();
            attached.cull._compile();
            attached.modes._compile();
            attached.geometry._compile();
            attached.layer._compile();
            attached.lights._compile();
            attached.material._compile();
            attached.reflect._compile();
            attached.shader._compile();
            attached.shaderParams._compile();
            attached.stage._compile();
            this._renderer.modelTransform = attached.transform._state;
            attached.billboard._compile();
            attached.stationary._compile();
            attached.viewport._compile();

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
            }

            if (result && result.error) {

                // Object has errors, probably due to
                // shader not allocating/compiling/linking.

                this.error(result.errorLog.join("\n"));
            }
        },

        _getJSON: function () {

            var attached = this._attached;

            return {
                camera: attached.camera.id,
                clips: attached.clips.id,
                colorTarget: attached.colorTarget.id,
                colorBuf: attached.colorBuf.id,
                depthTarget: attached.depthTarget.id,
                depthBuf: attached.depthBuf.id,
                visibility: attached.visibility.id,
                cull: attached.cull.id,
                modes: attached.modes.id,
                geometry: attached.geometry.id,
                layer: attached.layer.id,
                lights: attached.lights.id,
                material: attached.material.id,
                reflect: attached.reflect.id,
                shader: attached.shader.id,
                shaderParams: attached.shaderParams.id,
                stage: attached.stage.id,
                transform: attached.transform.id,
                billboard: attached.billboard.id,
                stationary: attached.stationary.id,
                viewport: attached.viewport.id
            };
        },

        _destroy: function () {
            this._renderer.removeObject(this.id);
        }
    });

})();
