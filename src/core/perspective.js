/**
 A **Perspective** component defines a perspective projection transform.

 ## Overview

 <ul>

 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895185/L.png"></img>

 ## Example

 In this example we have a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Perspective
 projection transform.

 ````Javascript
var scene = new XEO.Scene();

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
(function () {

    "use strict";

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

            var state = this._state;

            // Build matrix values
            state.matrix = XEO.math.perspectiveMatrix4(state.fovy * Math.PI / 180.0, state.aspect, state.near, state.far);

            // Build typed array, avoid reallocating
            if (!state.mat) {
                state.mat = new Float32Array(state.matrix);
            } else {
                state.mat.set(state.matrix);
            }

            this.fire("matrix", state.matrix);

            this._dirty = false;
        },

        _props: {

            /**
             * Field-of-view angle on Y-axis, in degrees.
             * Fires a {{#crossLink "Perspective/fovy:event"}}{{/crossLink}} event on change.
             * @property fovy
             * @default 60.0
             * @type Number
             */
            fovy: {

                set: function (value) {
                    value = value || 60.0;
                    this._state.fovy = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Perspective's   {{#crossLink "Perspective/fovy:property"}}{{/crossLink}} property changes.
                     * @event fovy
                     * @param value The property's new value
                     */
                    this.fire("fovy", value);
                },

                get: function () {
                    return this._state.fovy;
                }
            },

            /**
             * Aspect ratio of the perspective frustum. This is effectively the height of the frustum divided by the width.
             * Fires an {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} event on change.
             * @property aspect
             * @default 60.0
             * @type Number
             */
            aspect: {

                set: function (value) {
                    value = value || 1.0;
                    this._state.aspect = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Perspective's   {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} property changes.
                     * @event aspect
                     * @param value The property's new value
                     */
                    this.fire("aspect", value);
                },

                get: function () {
                    return this._state.aspect;
                }
            },

            /**
             * Position of the near plane on the positive View-space Z-axis.
             * Fires a {{#crossLink "Perspective/near:event"}}{{/crossLink}} event on change.
             * @property near
             * @default 0.1
             * @type Number
             */
            near: {

                set: function (value) {
                    value = value || 0.1;
                    this._state.near = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Perspective's   {{#crossLink "Perspective/near:property"}}{{/crossLink}} property changes.
                     * @event near
                     * @param value The property's new value
                     */
                    this.fire("near", value);
                },

                get: function () {
                    return this._state.near;
                }
            },

            /**
             * Position of the far plane on the positive View-space Z-axis.
             * Fires a {{#crossLink "Perspective/far:event"}}{{/crossLink}} event on change.
             * @property far
             * @default 10000.0
             * @type Number
             */
            far: {

                set: function (value) {
                    value = value || 10000.0;
                    this._state.far = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Perspective's  {{#crossLink "Perspective/far:property"}}{{/crossLink}} property changes.
                     * @event far
                     * @param value The property's new value
                     */
                    this.fire("far", value);
                },

                get: function () {
                    return this._state.far;
                }
            },

            matrix: {

                get: function () {
                    if (this._dirty) {
                        this._state.rebuild();
                    }
                    return this._state.matrix.slice(0);
                }
            }
        },

        _compile: function () {
            this._renderer.cameraMat = this._state;
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

})();