/**
 A **Entity** is an object within a xeoEngine {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 See the {{#crossLink "Scene"}}Scene{{/crossLink}} class documentation for more information on Entities.</li>

 <img src="../../../assets/images/Entity.png"></img>


 ## Boundaries

 #### Local-space

 A Entity provides its Local-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}}.</li>

 ```` javascript
 var scene = new XEO.Scene();

 var geometry = new XEO.Geometry(myScene, {
      //...
  });

 var entity = new XEO.Entity(myScene, {
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
 transformation by the Entity's {{#crossLink "Entity/transform:property"}}Modelling transform{{/crossLink}}.</li>


 ```` javascript
 var scene = new XEO.Scene();

 var geometry = new XEO.Geometry(myScene, {
      //...
  });

 var translate = new XEO.Translate(scene, {
    xyz: [-5, 0, 0] // Translate along -X axis
 });

 var entity = new XEO.Entity(myScene, {
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
 {{#crossLink "Entity/transform:property"}}Modelling{{/crossLink}} transforms.</li>

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
 {{#crossLink "Camera/view:property"}}View{{/crossLink}} and {{#crossLink "Camera/project:property"}}Projection{{/crossLink}} transforms.</li>

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
 @module XEO
 @submodule entities
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Entity within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Entity.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to attach to this Entity.  Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.clips] {String|Clips} ID or instance of a {{#crossLink "Clips"}}Clips{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/clips:property"}}clips{{/crossLink}}.
 @param [cfg.colorTarget] {String|ColorTarget} ID or instance of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}}.
 @param [cfg.depthTarget] {String|DepthTarget} ID or instance of a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}}.
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
 @param [cfg.shader] {String|Shader} ID or instance of a {{#crossLink "Shader"}}Shader{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shader:property"}}shader{{/crossLink}}.
 @param [cfg.shaderParams] {String|ShaderParams} ID or instance of a {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}}.
 @param [cfg.stage] {String|Stage} ID or instance of of a {{#crossLink "Stage"}}Stage{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
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

    XEO.Entity = XEO.Component.extend({

        type: "XEO.Entity",

        _init: function (cfg) {

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

                    // Unsubscribe from old Cameras's events

                    var oldCamera = this._children.camera;

                    if (oldCamera) {
                        oldCamera.off(this._onCameraViewMatrix);
                        oldCamera.off(this._onCameraProjMatrix);
                    }

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Camera", "camera", value);

                    var newCamera = this._children.camera;

                    if (newCamera) {

                        // Subscribe to new Camera's events

                        this._onCameraViewMatrix = newCamera.on("viewMatrix", this._setViewBoundaryDirty, this);
                        this._onCameraProjMatrix = newCamera.on("projMatrix", this._setCanvasBoundaryDirty, this);
                    }
                },

                get: function () {
                    return this._children.camera;
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
                    this._setChild("XEO.Clips", "clips", value);
                },

                get: function () {
                    return this._children.clips;
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
             * @type ColorTarget
             */
            colorTarget: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/colorTarget:property"}}{{/crossLink}} property changes.
                     * @event colorTarget
                     * @param value The property's new value
                     */
                    this._setChild("XEO.ColorTarget", "colorTarget", value);
                },

                get: function () {
                    return this._children.colorTarget;
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
                    this._setChild("XEO.ColorBuf", "colorBuf", value);
                },

                get: function () {
                    return this._children.colorBuf;
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
                    this._setChild("XEO.DepthTarget", "depthTarget", value);
                },

                get: function () {
                    return this._children.depthTarget;
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
                    this._setChild("XEO.DepthBuf", "depthBuf", value);
                },

                get: function () {
                    return this._children.depthBuf;
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
                    this._setChild("XEO.Visibility", "visibility", value);
                },

                get: function () {
                    return this._children.visibility;
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
                    this._setChild("XEO.Cull", "cull", value);
                },

                get: function () {
                    return this._children.cull;
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
                    this._setChild("XEO.Modes", "modes", value);
                },

                get: function () {
                    return this._children.modes;
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

                    // Unsubscribe from old Geometry's events

                    var oldGeometry = this._children.geometry;

                    if (oldGeometry) {

                        if (!value || (value.id !== undefined ? value.id : value) != oldGeometry.id) {
                            oldGeometry.off(this._onGeometryPositions);
                            oldGeometry.off(this._onGeometryDestroyed);
                        }
                    }

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/geometry:property"}}{{/crossLink}} property changes.
                     *
                     * @event geometry
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Geometry", "geometry", value);

                    var newGeometry = this._children.geometry;

                    if (newGeometry) {

                        // Subscribe to new Geometry's events

                        // World-space boundary is dirty when new Geometry's
                        // positions are updated or Geometry is destroyed.

                        this._onGeometryPositions = newGeometry.on("positions", this._setWorldBoundaryDirty, this);
                        this._onGeometryDestroyed = newGeometry.on("destroyed", this._setWorldBoundaryDirty, this);
                    }
                },

                get: function () {
                    return this._children.geometry;
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
                    this._setChild("XEO.Layer", "layer", value);
                },

                get: function () {
                    return this._children.layer;
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
                    this._setChild("XEO.Lights", "lights", value);
                },

                get: function () {
                    return this._children.lights;
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
                    this._setChild("XEO.Material", "material", value);
                },

                get: function () {
                    return this._children.material;
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
             * @type MorphTargets
             */
            morphTargets: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/morphTargets:property"}}{{/crossLink}} property changes.
                     * @event morphTargets
                     * @param value The property's new value
                     */
                    this._setChild("XEO.MorphTargets", "morphTargets", value);
                },

                get: function () {
                    return this._children.morphTargets;
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
                    this._setChild("XEO.Reflect", "reflect", value);
                },

                get: function () {
                    return this._children.reflect;
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
             * @type Shader
             */
            shader: {

                set: function (value) {

                    /**
                     * Fired whenever this Entity's  {{#crossLink "Entity/shader:property"}}{{/crossLink}} property changes.
                     * @event shader
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Shader", "shader", value);
                },

                get: function () {
                    return this._children.shader;
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
                    this._setChild("XEO.ShaderParams", "shaderParams", value);
                },

                get: function () {
                    return this._children.shaderParams;
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
                    this._setChild("XEO.Stage", "stage", value);
                },

                get: function () {
                    return this._children.stage;
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

                    // Unsubscribe from old Transform's events

                    var oldTransform = this._children.transform;

                    if (oldTransform && !XEO._isSameComponent(oldTransform, value)) {
                        oldTransform.off(this._onTransformUpdated);
                        oldTransform.off(this._onTransformDestroyed);
                    }

                    /**
                     * Fired whenever this Entity's {{#crossLink "Entity/transform:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event transform
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Transform", "transform", value);

                    // Subscribe to new Transform's events

                    var newTransform = this._children.transform;

                    if (newTransform) {

                        // World-space boundary is dirty when Transform's
                        // matrix is updated or Transform is destroyed.

                        var self = this;

                        this._onTransformUpdated = newTransform.on("updated",
                            function () {
                                if (self._transformDirty) {
                                    return;
                                }
                                self._transformDirty = true;
                                XEO.scheduleTask(function () {
                                    if (!self._transformDirty) {
                                        return;
                                    }
                                    newTransform._buildLeafMatrix();

                                    self._setWorldBoundaryDirty();
                                    self._transformDirty = false;
                                });
                            });

                        this._onTransformDestroyed = newTransform.on("destroyed", this._setWorldBoundaryDirty, this);
                    }
                },

                get: function () {
                    return this._children.transform;
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
                    this._setChild("XEO.Billboard", "billboard", value);
                },

                get: function () {
                    return this._children.billboard;
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
                    this._setChild("XEO.Stationary", "stationary", value);
                },

                get: function () {
                    return this._children.stationary;
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
                    return this._children.geometry.localBoundary;
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
             * [here](http://xeoengine.org/examples/#boundaries_Entity_worldBoundary)
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

                        this._worldBoundary = new XEO.Boundary3D(this.scene, {

                            meta: {
                                desc: "Entity " + self.id + " World-space boundary" // For debugging
                            },

                            getDirty: function () {
                                if (self._worldBoundaryDirty) {
                                    self._worldBoundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            // Faster and less precise than getPositions:
                            getOBB: function () {
                                var geometry = self._children.geometry;
                                if (geometry) {
                                    var boundary = geometry.localBoundary;
                                    return boundary.obb;
                                }
                            },

                            //getPositions: function () {
                            //    return self._children.geometry.positions;
                            //},

                            getMatrix: function () {

                                var transform = self._children.transform;

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

                        this._viewBoundary = new XEO.Boundary3D(this.scene, {

                            meta: {
                                desc: "Entity " + self.id + " View-space boundary" // For debugging
                            },

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
                                return self._children.camera.view.matrix;
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

                        this._canvasBoundary = new XEO.Boundary2D(this.scene, {

                            meta: {
                                desc: "Entity " + self.id + " Canvas-space boundary" // For debugging
                            },

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
                                return self._children.camera.project.matrix;
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
             * Will return null if xeoEngine has not yet rendered this Entity.
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
             * Will return null if xeoEngine has not yet rendered this Entity.
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
            var geometry = this._children.geometry;
            return geometry && geometry.positions && geometry.indices;

        },

        _compile: function () {

            var children = this._children;

            children.camera._compile();
            children.clips._compile();
            children.colorTarget._compile();
            children.colorBuf._compile();
            children.depthTarget._compile();
            children.depthBuf._compile();
            children.visibility._compile();
            children.cull._compile();
            children.modes._compile();
            children.geometry._compile();
            children.layer._compile();
            children.lights._compile();
            children.material._compile();
            //children.morphTargets._compile();
            children.reflect._compile();
            children.shader._compile();
            children.shaderParams._compile();
            children.stage._compile();
            children.transform._compile();
            children.billboard._compile();
            children.stationary._compile();

            // (Re)build this Entity in the renderer; for each Entity in teh scene graph,
            // there is an "object" in the renderer, that has the same ID as the entity

            var objectId = this.id;

            var result = this._renderer.buildObject(objectId);

            if (result && result.error) {

                // Object has errors, probably due to
                // shader not allocating/compiling/linking.

                this.error(result.errorLog.join("\n"));
            }
        },

        _getJSON: function () {

            var children = this._children;

            return {
                camera: children.camera.id,
                clips: children.clips.id,
                colorTarget: children.colorTarget.id,
                colorBuf: children.colorBuf.id,
                depthTarget: children.depthTarget.id,
                depthBuf: children.depthBuf.id,
                visibility: children.visibility.id,
                cull: children.cull.id,
                modes: children.modes.id,
                geometry: children.geometry.id,
                layer: children.layer.id,
                lights: children.lights.id,
                material: children.material.id,
                reflect: children.reflect.id,
                shader: children.shader.id,
                shaderParams: children.shaderParams.id,
                stage: children.stage.id,
                transform: children.transform.id,
                billboard: children.billboard.id,
                stationary: children.stationary.id
            };
        },

        _destroy: function () {

            if (this._children.transform) {
                this._children.transform.off(this._onTransformUpdated);
                this._children.transform.off(this._onTransformDestroyed);
            }

            if (this._children.geometry) {
                this._children.geometry.off(this._onGeometryDirty);
                this._children.geometry.off(this._onGeometryPositions);
                this._children.geometry.off(this._onGeometryDestroyed);
            }

            if (this._worldBoundary) {
                this._worldBoundary.destroy();
            }

            if (this._viewBoundary) {
                this._viewBoundary.destroy();
            }

            if (this._canvasBoundary) {
                this._canvasBoundary.destroy();
            }

            this._renderer.removeObject(this.id);
        }
    });

})();
