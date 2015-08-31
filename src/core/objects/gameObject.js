/**
 A **GameObject** is an entity within a xeoEngine {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 See the {{#crossLink "Scene"}}Scene{{/crossLink}} class documentation for more information on GameObjects.</li>

 <img src="../../../assets/images/GameObject.png"></img>


 ## Boundaries

 #### World-space

 A GameObject provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 transformation by the GameObject's {{#crossLink "GameObject/transform:property"}}Modelling transform{{/crossLink}}.</li>


 ```` javascript
 var scene = new XEO.Scene();

 var geometry = new XEO.Geometry(myScene, {
      //...
  });

 var translate = new XEO.Translate(scene, {
    xyz: [-5, 0, 0] // Translate along -X axis
 });

 var object = new XEO.GameObject(myScene, {
       geometry: myGeometry,
       transform: translate
  });

 // Get the World-space Boundary3D
 var worldBoundary = object.worldBoundary();

 // Get World-space object-aligned bounding box (OBB),
 // which is an array of eight vertices that describes
 // the box that is aligned with the GameObjectbject
 var obb = worldBoundary.obb;

 // Get the World-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = worldBoundary.aabb;

 // get the World-space center of the GameObject:
 var center = worldBoundary.center;

 ````

 #### View-space

 A GameObject also provides its View-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses
 the {{#crossLink "Geometry/positions:property"}}Geometry positions{{/crossLink}} after
 their transformation by the {{#crossLink "Camera/view:property"}}View{{/crossLink}} and
 {{#crossLink "GameObject/transform:property"}}Modelling{{/crossLink}} transforms.</li>

 ```` javascript
 // Get the View-space Boundary3D
 var viewBoundary = object.viewBoundary();

 // Get View-space object-aligned bounding box (OBB),
 // which is an array of eight vertices that describes
 // the box that is aligned with the GameObjectbject
 var obb = viewBoundary.obb;

 // Get the View-space axis-aligned bounding box (ABB),
 // which contains the extents of the boundary on each axis
 var aabb = viewBoundary.aabb;

 // get the View-space center of the GameObject:
 var center = viewBoundary.center;

 ````

 @class GameObject
 @module XEO
 @submodule objects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GameObject within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GameObject.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to attach to this GameObject.  Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.clips] {String|Clips} ID or instance of a {{#crossLink "Clips"}}Clips{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/clips:property"}}clips{{/crossLink}}.
 @param [cfg.colorTarget] {String|ColorTarget} ID or instance of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}}.
 @param [cfg.depthTarget] {String|DepthTarget} ID or instance of a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}}.
 @param [cfg.depthBuf] {String|DepthBuf} ID or instance of a {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, depth {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}}.
 @param [cfg.visibility] {String|Visibility} ID or instance of a {{#crossLink "Visibility"}}Visibility{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}}.
 @param [cfg.modes] {String|Modes} ID or instance of a {{#crossLink "Modes"}}Modes{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/modes:property"}}modes{{/crossLink}}.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.layer] {String|Layer} ID or instance of a {{#crossLink "Layer"}}Layer{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}.
 @param [cfg.lights] {String|Lights} ID or instance of a {{#crossLink "Lights"}}Lights{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/lights:property"}}lights{{/crossLink}}.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.morphTargets] {String|MorphTargets} ID or instance of a {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default instance, {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}}.
 @param [cfg.reflect] {String|Reflect} ID or instance of a {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/reflect:property"}}reflection{{/crossLink}}.
 @param [cfg.shader] {String|Shader} ID or instance of a {{#crossLink "Shader"}}Shader{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shader:property"}}shader{{/crossLink}}.
 @param [cfg.shaderParams] {String|ShaderParams} ID or instance of a {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}}.
 @param [cfg.stage] {String|Stage} ID or instance of of a {{#crossLink "Stage"}}Stage{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @extends Component
 */

/**
 * Fired when this GameObject is *picked* via a call to the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method
 * on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas {{/crossLink}}.
 * @event picked
 * @param {String} objectId The ID of this GameObject.
 * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
 * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
 */
(function () {

    "use strict";

    XEO.GameObject = XEO.Component.extend({

        type: "XEO.GameObject",

        _init: function (cfg) {

            this.camera = cfg.camera;
            this.clips = cfg.clips;
            this.colorTarget = cfg.colorTarget;
            this.colorBuf = cfg.colorBuf;
            this.depthTarget = cfg.depthTarget;
            this.depthBuf = cfg.depthBuf;
            this.visibility = cfg.visibility;
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

            // Cached boundary for each coordinate space

            this._worldBoundary = null;
            this._viewBoundary = null;
            this._canvasBoundary = null;

            this._worldBoundaryDirty = true;
            this._viewBoundaryDirty = true;
            this._canvasBoundaryDirty = true;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    // Invalidate cached World-space bounding boxes

                    this._setWorldBoundaryDirty();

                    // Unsubscribe from old Cameras's events

                    var oldCamera = this._children.camera;

                    if (oldCamera && (!value || (value.id !== undefined ? value.id : value) !== oldCamera.id)) {
                        oldCamera.off(this._onCameraDestroyed);
                        oldCamera.off(this._onCameraView);
                        oldCamera.off(this._onCameraViewMatrix);
                    }

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("camera", value);

                    var newCamera = this._children.camera;

                    if (newCamera) {

                        // Subscribe to new Camera's events

                        // World-space boundary is dirty when new Camera's - (TODO)

                        var self = this;

                        this._onCameraView = newCamera.on("view",
                            function () {
                                self._setWorldBoundaryDirty();
                            });

                        this._onCameraDestroyed = newCamera.on("destroyed",
                            function () {
                                self._setWorldBoundaryDirty();
                            });
                    }
                },

                get: function () {
                    return this._children.camera;
                }
            },

            /**
             * The {{#crossLink "Clips"}}Clips{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/clips:property"}}clips{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/clips:event"}}{{/crossLink}} event on change.
             *
             * @property clips
             * @type Clips
             */
            clips: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/clips:property"}}{{/crossLink}} property changes.
                     * @event clips
                     * @param value The property's new value
                     */
                    this._setChild("clips", value);
                },

                get: function () {
                    return this._children.clips;
                }
            },

            /**
             * The {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/colorTarget:event"}}{{/crossLink}} event on change.
             *
             * @property colorTarget
             * @type ColorTarget
             */
            colorTarget: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/colorTarget:property"}}{{/crossLink}} property changes.
                     * @event colorTarget
                     * @param value The property's new value
                     */
                    this._setChild("colorTarget", value);
                },

                get: function () {
                    return this._children.colorTarget;
                }
            },

            /**
             * The {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorBuf:property"}}colorBuf{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/colorBuf:event"}}{{/crossLink}} event on change.
             *
             * @property colorBuf
             * @type ColorBuf
             */
            colorBuf: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/colorBuf:property"}}{{/crossLink}} property changes.
                     *
                     * @event colorBuf
                     * @param value The property's new value
                     */
                    this._setChild("colorBuf", value);
                },

                get: function () {
                    return this._children.colorBuf;
                }
            },

            /**
             * The {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/depthTarget:event"}}{{/crossLink}} event on change.
             *
             * @property depthTarget
             * @type DepthTarget
             */
            depthTarget: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/depthTarget:property"}}{{/crossLink}} property changes.
                     *
                     * @event depthTarget
                     * @param value The property's new value
                     */
                    this._setChild("depthTarget", value);
                },

                get: function () {
                    return this._children.depthTarget;
                }
            },

            /**
             * The {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
             * parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/depthBuf:event"}}{{/crossLink}} event on change.
             *
             * @property depthBuf
             * @type DepthBuf
             */
            depthBuf: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/depthBuf:property"}}{{/crossLink}} property changes.
                     *
                     * @event depthBuf
                     * @param value The property's new value
                     */
                    this._setChild("depthBuf", value);
                },

                get: function () {
                    return this._children.depthBuf;
                }
            },

            /**
             * The {{#crossLink "Visibility"}}Visibility{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/visibility:event"}}{{/crossLink}} event on change.
             *
             * @property visibility
             * @type Visibility
             */
            visibility: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/visibility:property"}}{{/crossLink}} property changes.
                     *
                     * @event visibility
                     * @param value The property's new value
                     */
                    this._setChild("visibility", value);
                },

                get: function () {
                    return this._children.visibility;
                }
            },

            /**
             * The {{#crossLink "Modes"}}Modes{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/modes:property"}}modes{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/modes:event"}}{{/crossLink}} event on change.
             *
             * @property modes
             * @type Modes
             */
            modes: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's {{#crossLink "GameObject/modes:property"}}{{/crossLink}} property changes.
                     *
                     * @event modes
                     * @param value The property's new value
                     */
                    this._setChild("modes", value);
                },

                get: function () {
                    return this._children.modes;
                }
            },

            /**
             * The {{#crossLink "Geometry"}}Geometry{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/geometry:property"}}camera{{/crossLink}}
             * (a simple box) when set to a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/geometry:event"}}{{/crossLink}} event on change.
             *
             * Updates {{#crossLink "GameObject/boundary"}}{{/crossLink}},
             * {{#crossLink "GameObject/worldObb"}}{{/crossLink}} and
             * {{#crossLink "GameObject/center"}}{{/crossLink}}
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

                            oldGeometry.off(this._onGeometryDirty);
                            oldGeometry.off(this._onGeometryPositions);
                            oldGeometry.off(this._onGeometryDestroyed);
                        }
                    }

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/geometry:property"}}{{/crossLink}} property changes.
                     *
                     * @event geometry
                     * @param value The property's new value
                     */
                    this._setChild("geometry", value);

                    var newGeometry = this._children.geometry;

                    if (newGeometry) {

                        // Subscribe to new Geometry's events

                        // World-space boundary is dirty when new Geometry's
                        // positions are updated or Geometry is destroyed.

                        var self = this;

                        this._onGeometryDirty = newGeometry.on("dirty",
                            function () {
                                self.fire("dirty", true);
                            });

                        this._onGeometryPositions = newGeometry.on("positions",
                            function () {
                                self._setWorldBoundaryDirty();
                            });

                        this._onGeometryDestroyed = newGeometry.on("destroyed",
                            function () {
                                self._setWorldBoundaryDirty();
                            });
                    }
                },

                get: function () {
                    return this._children.geometry;
                }
            },

            /**
             * The {{#crossLink "Layer"}}Layer{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/layer:property"}}layer{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/layer:event"}}{{/crossLink}} event on change.
             *
             * @property layer
             * @type Layer
             */
            layer: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/layer:property"}}{{/crossLink}} property changes.
                     *
                     * @event layer
                     * @param value The property's new value
                     */
                    this._setChild("layer", value);
                },

                get: function () {
                    return this._children.layer;
                }
            },

            /**
             * The {{#crossLink "Lights"}}Lights{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}lights{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/lights:event"}}{{/crossLink}} event on change.
             *
             * @property lights
             * @type Lights
             */
            lights: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/lights:property"}}{{/crossLink}} property changes.
                     *
                     * @event lights
                     * @param value The property's new value
                     */
                    this._setChild("lights", value);
                },

                get: function () {
                    return this._children.lights;
                }
            },

            /**
             * The {{#crossLink "Material"}}Material{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/material:property"}}material{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/material:event"}}{{/crossLink}} event on change.
             *
             * @property material
             * @type Material
             */
            material: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/material:property"}}{{/crossLink}} property changes.
                     *
                     * @event material
                     * @param value The property's new value
                     */
                    this._setChild("material", value);
                },

                get: function () {
                    return this._children.material;
                }
            },

            /**
             * The {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/morphTargets:event"}}{{/crossLink}} event on change.
             *
             * @property morphTargets
             * @type MorphTargets
             */
            morphTargets: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/morphTargets:property"}}{{/crossLink}} property changes.
                     * @event morphTargets
                     * @param value The property's new value
                     */
                    this._setChild("morphTargets", value);
                },

                get: function () {
                    return this._children.morphTargets;
                }
            },

            /**
             * The {{#crossLink "Reflect"}}Reflect{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/reflect:property"}}reflect{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/reflect:event"}}{{/crossLink}} event on change.
             *
             * @property reflect
             * @type Reflect
             */
            reflect: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/reflect:property"}}{{/crossLink}} property changes.
                     *
                     * @event reflect
                     * @param value The property's new value
                     */
                    this._setChild("reflect", value);
                },

                get: function () {
                    return this._children.reflect;
                }
            },

            /**
             * The {{#crossLink "Shader"}}Shader{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shader:property"}}shader{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/shader:event"}}{{/crossLink}} event on change.
             *
             * @property shader
             * @type Shader
             */
            shader: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/shader:property"}}{{/crossLink}} property changes.
                     * @event shader
                     * @param value The property's new value
                     */
                    this._setChild("shader", value);
                },

                get: function () {
                    return this._children.shader;
                }
            },

            /**
             * The {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/shaderParams:event"}}{{/crossLink}} event on change.
             *
             * @property shaderParams
             * @type ShaderParams
             */
            shaderParams: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/shaderParams:property"}}{{/crossLink}} property changes.
                     *
                     * @event shaderParams
                     * @param value The property's new value
                     */
                    this._setChild("shaderParams", value);
                },

                get: function () {
                    return this._children.shaderParams;
                }
            },

            /**
             * The {{#crossLink "Stage"}}Stage{{/crossLink}} attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/stage:property"}}stage{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/stage:event"}}{{/crossLink}} event on change.
             *
             * @property stage
             * @type Stage
             */
            stage: {

                set: function (value) {

                    /**
                     * Fired whenever this GameObject's  {{#crossLink "GameObject/stage:property"}}{{/crossLink}} property changes.
                     *
                     * @event stage
                     * @param value The property's new value
                     */
                    this._setChild("stage", value);
                },

                get: function () {
                    return this._children.stage;
                }
            },

            /**
             * The Model-to-World-space transform attached to this GameObject.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/transform:property"}}transform{{/crossLink}}
             * (an identity matrix) when set to a null or undefined value.
             *
             * Fires a {{#crossLink "GameObject/transform:event"}}{{/crossLink}} event on change.
             *
             * Updates {{#crossLink "GameObject/boundary"}}{{/crossLink}},
             * {{#crossLink "GameObject/worldObb"}}{{/crossLink}} and
             * {{#crossLink "GameObject/center"}}{{/crossLink}}
             *
             * @property transform
             * @type Component
             */
            transform: {

                set: function (value) {

                    // Invalidate cached World-space bounding boxes

                    this._setWorldBoundaryDirty();

                    // Unsubscribe from old Transform's events

                    var oldTransform = this._children.transform;

                    if (oldTransform && (!value || value.id !== oldTransform.id)) {
                        oldTransform.off(this._onTransformMatrix);
                        oldTransform.off(this._onTransformDestroyed);
                    }

                    /**
                     * Fired whenever this GameObject's {{#crossLink "GameObject/transform:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event transform
                     * @param value The property's new value
                     */
                    this._setChild("transform", value);

                    // Subscribe to new Transform's events

                    var newTransform = this._children.transform;

                    if (newTransform) {

                        // World-space boundary is dirty when Transform's
                        // matrix is updated or Transform is destroyed.

                        var self = this;

                        this._onTransformMatrix = newTransform.on("matrix",
                            function () {
                                self._setWorldBoundaryDirty();
                            });

                        this._onTransformDestroyed = newTransform.on("destroyed",
                            function () {
                                self._setWorldBoundaryDirty();
                            });
                    }
                },

                get: function () {
                    return this._children.transform;
                }
            },

            /**
             * World-space 3D boundary.
             *
             * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
             * this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time you reference it.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._worldBoundary) {

                        var self = this;

                        this._worldBoundary = new XEO.Boundary3D(this.scene, {

                            getDirty: function () {
                                return self._worldBoundaryDirty;
                            },

                            getOBB: function () {

                                // Calls our Geometry's modelBoundary property,
                                // lazy-inits the boundary and its obb

                                return self._children.geometry.modelBoundary.obb;
                            },

                            getMatrix: function () {
                                return self._children.transform.matrix;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {
                                self._worldBoundary = null;
                            });

                        this._setWorldBoundaryDirty();
                    }

                    return this._worldBoundary;
                }
            },

            /**
             * View-space 3D boundary.
             *
             * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
             * this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance
             * next time you reference it.
             *
             * @property viewBoundary
             * @type Boundary3D
             * @final
             */
            viewBoundary: {

                get: function () {

                    if (!this._viewBoundary) {

                        var self = this;

                        this._viewBoundary = new XEO.Boundary3D(this.scene, {

                            getDirty: function () {
                                return self._viewBoundaryDirty;
                            },

                            getOBB: function () {

                                // Calls our worldBoundary property,
                                // lazy-inits the boundary and its obb

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

                        this._setViewBoundaryDirty();
                    }

                    return this._viewBoundary;
                }
            },

            /**
             * JSON object containing the (GLSL) source code of the shaders for this GameObject.
             *
             * This is sometimes useful to have as a reference
             * when constructing your own custom {{#crossLink "Shader"}}{{/crossLink}} components.
             *
             * Will return null if xeoEngine has not yet rendered this GameObject.
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
                    var source = rendererObject.program.source;
                    return {
                        draw: {
                            vertex: source.drawVertex,
                            fragment: source.drawFragment
                        },
                        pick: {
                            vertex: source.pickVertex,
                            fragment: source.pickFragment
                        }
                    };
                }
            },

            /**
             * The (GLSL) source code of the shaders for this GameObject, as a string.
             *
             * This is sometimes useful to have as a reference
             * when constructing your own custom {{#crossLink "Shader"}}{{/crossLink}} components.
             *
             * Will return null if xeoEngine has not yet rendered this GameObject.
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


        _setWorldBoundaryDirty: function () {
            this._worldBoundaryDirty = true;
            this._viewBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
            if (this._viewBoundary) {
                this._viewBoundary.fire("updated", true);
            }
        },

        _setViewBoundaryDirty: function () {
            this._viewBoundaryDirty = true;
            if (this._viewBoundary) {
                this._viewBoundary.fire("updated", true);
            }
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

            // (Re)build this GameObject in the renderer

            var result = this._renderer.buildObject(this.id);

            if (result && result.error) {

                // Object has errors, probably due to
                // shader not allocating/compiling/linking.

                this.error(result.errorLog.join("\n"));
            }
        },

        _getJSON: function () {
            return {
                camera: this.camera.id,
                clips: this.clips.id,
                colorTarget: this.colorTarget.id,
                colorBuf: this.colorBuf.id,
                depthTarget: this.depthTarget.id,
                depthBuf: this.depthBuf.id,
                visibility: this.visibility.id,
                modes: this.modes.id,
                geometry: this.geometry.id,
                layer: this.layer.id,
                lights: this.lights.id,
                material: this.material.id,
                //  morphTargets: this.morphTargets.id,
                reflect: this.reflect.id,
                shader: this.shader.id,
                shaderParams: this.shaderParams.id,
                stage: this.stage.id,
                transform: this.transform.id
            };
        },

        _destroy: function () {

            if (this._children.transform) {
                this._children.transform.off(this._onTransformMatrix);
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

            this._renderer.removeObject(this.id);
        }
    });

})();
