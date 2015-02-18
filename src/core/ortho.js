"use strict";

/**
 An orthographic projection transform.

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7097089/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's associated with a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and an Ortho
 projection transform.

 ````Javascript
 var scene = new XEO.Scene(engine);

 var ortho = new XEO.Ortho(scene, {
    left:       1.0,    // Position of the left plane on the View-space X-axis
    right:      1.0,    // Position of the right plane on the View-space X-axis
    top:        1.0,    // Position of the top plane on the View-space Y-axis.
    bottom :   -1.0,    // Position of the bottom plane on the View-space Y-axis.
    near:       0.1,    // Position of the near plane on the View-space Z-axis.
    far:        10000   // Position of the far plane on the positive View-space Z-axis.
 });

 var camera = new XEO.Camera(scene, {
       project: ortho
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 // Subscribe to changes on a property of our ortho component
 ortho.on("near", function(value) {
       console.log("ortho 'near' updated: " + value);
   });

 // Set the value of a property on our ortho component, which fires the event we just subscribed to
 ortho.near = 45.0;

 // Get the value of a property on our ortho component
 var value = ortho.near;

 // Destroy ths ortho component, causing the camera to fall back on the scene's default projection transform
 ortho.destroy();
 ````

 @class Ortho
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Ortho within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Ortho.
 @param [cfg.left=-1.0] {Number} Position of the left plane on the View-space X-axis.
 @param [cfg.right=1.0] {Number} Position of the right plane on the View-space X-axis.
 @param [cfg.top=1.0] {Number} Position of the top plane on the View-space Y-axis.
 @param [cfg.bottom=-1.0] {Number} Position of the bottom plane on the View-space Y-axis.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @extends Component
 */
XEO.Ortho = XEO.Component.extend({

    className: "XEO.Ortho",

    type: "project",

    _init: function (cfg) {

        this.mode = "ortho";

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
        core.matrix = XEO.math.orthoMat4c(core.left, core.right, core.bottom, core.top, core.near, core.far, []);

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
     * Position of the left plane on the View-space X-axis.
     * Fires a {{#crossLink "Ortho/left:event"}}{{/crossLink}} event on change.
     * @property left
     * @default -1.0
     * @type Number
     */
    set left(value) {
        value = value || -1.0;
        this._core.left = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/left:property"}}{{/crossLink}} property changes.
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
     * Fires a {{#crossLink "Ortho/right:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Ortho's  {{#crossLink "Ortho/right:property"}}{{/crossLink}} property changes.
         * @event right
         * @param value The property's new value
         */
        this.fire("right", value);
    },

    get right() {
        return this._core.right;
    },

    /**
     * Position of the top plane on the View-space Y-axis.
     * Fires a {{#crossLink "Ortho/top:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Ortho's  {{#crossLink "Ortho/top:property"}}{{/crossLink}} property changes.
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
     * Fires a {{#crossLink "Ortho/bottom:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Ortho's  {{#crossLink "Ortho/bottom:property"}}{{/crossLink}} property changes.
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
     * Fires a {{#crossLink "Ortho/near:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Ortho's  {{#crossLink "Ortho/near:property"}}{{/crossLink}} property changes.
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
     * Fires a {{#crossLink "Ortho/far:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Ortho's {{#crossLink "Ortho/far:property"}}{{/crossLink}} property changes.
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

