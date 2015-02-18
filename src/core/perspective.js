"use strict";

/**
 A perspective projection transform.

 <ul>

 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints on associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895185/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's associated with a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Perspective
 projection transform.

 ````Javascript
 var scene = new XEO.Scene(engine);

 var perspective = new XEO.Perspective(scene, {
       fovy: 60,
       near: 0.1,
       far: 1000
   });

 var camera = new XEO.Camera(scene, {
       project: perspective
   });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 // Subscribe to changes on a property of our perspective component
 perspective.on("fovy", function(value) {
       console.log("perspective 'fovy' updated: " + value);
   });

 // Set the value of a property on our perspective component, which fires the event we just subscribed to
 perspective.fovy = 45.0;

 // Get the value of a property on our perspective component
 var value = perspective.fovy;

 // Destroy ths perspective component, causing the camera to fall back on the scene's default projection transform
 perspective.destroy();
 ````

 @class Perspective
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Perspective within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Perspective.
 @param [cfg.fovy=60.0] {Number} Field-of-view angle on Y-axis.
 @param [cfg.aspect=1.0] {Number} Aspect ratio.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @extends Component
 */
XEO.Perspective = XEO.Component.extend({

    className: "XEO.Perspective",

    type: "project",

    _init: function (cfg) {

        this.mode = "perspective";

        var canvas = this.scene.canvas;

        this.fovy = cfg.fovy;
        this.aspect = canvas.width / canvas.height;
        this.near = cfg.near;
        this.far = cfg.far;

        var self = this;

        // Recompute aspect from change in canvas size
        this._canvasResized = this.scene.canvas.on("resized",
            function () {
                self.aspect = canvas.width / canvas.height;
            });

        // Lazy-rebuild matrix on each scene tick
        this._tick = this.scene.on("tick",
            function (c) {
                if (self._dirty) {
                    self._rebuild();
                }
            });
    },

    _rebuild: function () {

        var core = this._core;

        // Build matrix values
        core.matrix = XEO.math.perspectiveMatrix4(core.fovy * Math.PI / 180.0, core.aspect, core.near, core.far);

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
     * Field-of-view angle on Y-axis, in degrees.
     * Fires a {{#crossLink "Perspective/fovy:event"}}{{/crossLink}} event on change.
     * @property fovy
     * @default 60.0
     * @type Number
     */
    set fovy(value) {
        value = value || 60.0;
        this._core.fovy = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's   {{#crossLink "Perspective/fovy:property"}}{{/crossLink}} property changes.
         * @event fovy
         * @param value The property's new value
         */
        this.fire("fovy", value);
    },

    get fovy() {
        return this._core.fovy;
    },

    /**
     * Aspect ratio of the perspective frustum. This is effectively the height of the frustum divided by the width.
     * Fires an {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} event on change.
     * @property aspect
     * @default 60.0
     * @type Number
     */
    set aspect(value) {
        value = value || 1.0;
        this._core.aspect = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's   {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} property changes.
         * @event aspect
         * @param value The property's new value
         */
        this.fire("aspect", value);
    },

    get aspect() {
        return this._core.aspect;
    },

    /**
     * Position of the near plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Perspective/near:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Perspective's   {{#crossLink "Perspective/near:property"}}{{/crossLink}} property changes.
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
     * Fires a {{#crossLink "Perspective/far:event"}}{{/crossLink}} event on change.
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
         * Fired whenever this Perspective's  {{#crossLink "Perspective/far:property"}}{{/crossLink}} property changes.
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
            fovy: this.fovy,
            aspect: this.aspect,
            near: this.near,
            far: this.far
        };
    },

    _destroy: function () {
        this.scene.canvas.off(this._canvasResized);
        this.scene.off(this._tick);
    }
});

XEO.Scene.prototype.newPerspective = function (cfg) {
    return new XEO.Perspective(this, cfg);
};