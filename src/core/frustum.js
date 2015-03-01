"use strict";

/**
  A **Frustum** defines a perspective projection as a frustum-shaped view volume.

  {{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
  {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

  <img src="http://www.gliffy.com/go/publish/image/7103657/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Frustum
 projection transform.

 ````Javascript
 var scene = new XEO.Scene(engine);

 var frustum = new XEO.Frustum(scene, {
    left:       1.0,    // Position of the left plane on the View-space X-axis
    right:      1.0,    // Position of the right plane on the View-space X-axis
    top:        1.0,    // Position of the top plane on the View-space Y-axis.
    bottom :   -1.0,    // Position of the bottom plane on the View-space Y-axis.
    near:       0.1,    // Position of the near plane on the View-space Z-axis.
    far:        10000   // Position of the far plane on the positive View-space Z-axis.
 });

 var camera = new XEO.Camera(scene, {
       project: frustum
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 // Subscribe to changes on a property of our Frustum component
 frustum.on("near", function(value) {
       console.log("Frustum 'near' updated: " + value);
   });

 // Set the value of a property on our Frustum component, which fires the event we just subscribed to
 frustum.near = 45.0;

 // Get the value of a property on our Frustum component
 var value = frustum.near;

 // Destroy ths Frustum component, causing the camera to fall back on the scene's default projection transform
 frustum.destroy();
 ````

 @class Frustum
  @module XEO
  @constructor
  @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Frustum within the
  default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
  @param [cfg] {*} Configs
  @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
  @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Frustum.
  @param [cfg.left=-1] {Number} Position of the left plane on the View-space X-axis.
  @param [cfg.right=1] {Number} Position of the right plane on the View-space X-axis.
  @param [cfg.top=1] {Number} Position of the top plane on the View-space Y-axis.
  @param [cfg.bottom=-1] {Number} Position of the bottom plane on the View-space Y-axis.
  @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
  @param [cfg.far=1000] {Number} Position of the far plane on the positive View-space Z-axis.
  @extends Component
 */
XEO.Frustum = XEO.Component.extend({

    className: "XEO.Frustum",

    type: "project",

    _init: function (cfg) {

        this.mode = "frustum";

        this.left = cfg.left;
        this.right = cfg.right;
        this.top = cfg.top;
        this.bottom = cfg.bottom;
        this.near = cfg.near;
        this.far = cfg.far;

        var self = this;

        // Lazy-rebuild matrix on each scene tick
        this._onTick = this.scene.on("tick",
            function (c) {
                if (self._dirty) {
                    self._rebuild();
                }
            });
    },

    _rebuild: function () {

        var core = this._core;

        // Build matrix values
        core.matrix = XEO.math.frustumMat4c(core.left, core.right, core.bottom, core.top, core.near, core.far, []);

        // Build typed array, avoid reallocating
        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }

        this.fire("matrix", core.matrix);

        this._dirty = false;
    },

    /**
      Position of the left plane on the View-space X-axis.

      Fires a {{#crossLink "Frustum/left:event"}}{{/crossLink}} event on change.

      @property left
      @default -1.0
      @type Number
     */
    set left(value) {
        value = value || -1.0;
        this._core.left = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/left:property"}}{{/crossLink}} property changes.
         * @event left
         * @param value The property's new value
         */
        this.fire("left", value);
    },

    get left() {
        return this._core.left;
    },

    /**
     * Position of the right plane on the View-space X-axis.
     * Fires a {{#crossLink "Frustum/right:event"}}{{/crossLink}} event on change.
     * @property right
     * @default 1.0
     * @type Number
     */
    set right(value) {
        value = value || 1.0;
        this._core.right = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         this Frustum's          * @event right
         * @param value The property's new value
         */
        this.fire("right", value);
    },

    get right() {
        return this._core.right;
    },

    /**
     * Position of the top plane on the View-space Y-axis.
     * Fires a {{#crossLink "Frustum/top:event"}}{{/crossLink}} event on change.
     * @property top
     * @default 1.0
     * @type Number
     */
    set top(value) {
        value = value || 1.0;
        this._core.top = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/top:property"}}{{/crossLink}} property changes.
         * @event top
         * @param value The property's new value
         */
        this.fire("top", value);
    },

    get top() {
        return this._core.top;
    },

    /**
     * Position of the bottom plane on the View-space Y-axis.
     * Fires a {{#crossLink "Frustum/bottom:event"}}{{/crossLink}} event on change.
     * @property bottom
     * @default -1.0
     * @type Number
     */
    set bottom(value) {
        value = value || -1.0;
        this._core.bottom = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/bottom:property"}}{{/crossLink}} property changes.
         * @event bottom
         * @param value The property's new value
         */
        this.fire("bottom", value);
    },

    get bottom() {
        return this._core.bottom;
    },

    /**
     * Position of the near plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Frustum/near:event"}}{{/crossLink}} event on change.
     * @property near
     * @default 0.1
     * @type Number
     */
    set near(value) {
        value = value || 0.1;
        this._core.near = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/near:property"}}{{/crossLink}} property changes.
         * @event near
         * @param value The property's new value
         */
        this.fire("near", value);
    },

    get near() {
        return this._core.near;
    },

    /**
     * Position of the far plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Frustum/far:event"}}{{/crossLink}} event on change.
     * @property far
     * @default 10000.0
     * @type Number
     */
    set far(value) {
        value = value || 10000.0;
        this._core.far = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's  {{#crossLink "Frustum/far:property"}}{{/crossLink}} property changes.
         * @event far
         * @param value The property's new value
         */
        this.fire("far", value);
    },

    get far() {
        return this._core.far;
    },

    get matrix() {
        if (this._dirty) {
            this._core.rebuild();
        }
        return this._core.matrix.slice(0);
    },

    _compile: function () {
        this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
            near: this.near,
            far: this.far
        };
    },

    _destroy: function () {
        this.scene.off(this._onTick);
    }
});

