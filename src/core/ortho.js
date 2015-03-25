/**
 An **Ortho** component defines an orthographic projection transform.

 ## Overview

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7097089/L.png"></img>

 ## Example

 In this example we have a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and an Ortho
 projection transform.

 ````Javascript
 var scene = new XEO.Scene();

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
(function () {

    "use strict";

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

            var state = this._state;

            // Build matrix values
            state.matrix = XEO.math.orthoMat4c(state.left, state.right, state.bottom, state.top, state.near, state.far, []);

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
             * Position of the left plane on the View-space X-axis.
             * Fires a {{#crossLink "Ortho/left:event"}}{{/crossLink}} event on change.
             * @property left
             * @default -1.0
             * @type Number
             */
            left: {

                set: function (value) {
                    value = value || -1.0;
                    this._state.left = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/left:property"}}{{/crossLink}} property changes.
                     * @event left
                     * @param value The property's new value
                     */
                    this.fire("left", value);
                },

                get: function () {
                    return this._state.left;
                }
            },

            /**
             * Position of the right plane on the View-space X-axis.
             * Fires a {{#crossLink "Ortho/right:event"}}{{/crossLink}} event on change.
             * @property right
             * @default 1.0
             * @type Number
             */
            right: {

                set: function (value) {
                    value = value || 1.0;
                    this._state.right = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/right:property"}}{{/crossLink}} property changes.
                     * @event right
                     * @param value The property's new value
                     */
                    this.fire("right", value);
                },

                get: function () {
                    return this._state.right;
                }
            },

            /**
             * Position of the top plane on the View-space Y-axis.
             * Fires a {{#crossLink "Ortho/top:event"}}{{/crossLink}} event on change.
             * @property top
             * @default 1.0
             * @type Number
             */
            top: {

                set: function (value) {
                    value = value || 1.0;
                    this._state.top = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/top:property"}}{{/crossLink}} property changes.
                     * @event top
                     * @param value The property's new value
                     */
                    this.fire("top", value);
                },

                get: function () {
                    return this._state.top;
                }
            },

            /**
             * Position of the bottom plane on the View-space Y-axis.
             * Fires a {{#crossLink "Ortho/bottom:event"}}{{/crossLink}} event on change.
             * @property bottom
             * @default -1.0
             * @type Number
             */
            bottom: {

                set: function (value) {
                    value = value || -1.0;
                    this._state.bottom = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/bottom:property"}}{{/crossLink}} property changes.
                     * @event bottom
                     * @param value The property's new value
                     */
                    this.fire("bottom", value);
                },

                get: function () {
                    return this._state.bottom;
                }
            },

            /**
             * Position of the near plane on the positive View-space Z-axis.
             * Fires a {{#crossLink "Ortho/near:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/near:property"}}{{/crossLink}} property changes.
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
             * Fires a {{#crossLink "Ortho/far:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Ortho's {{#crossLink "Ortho/far:property"}}{{/crossLink}} property changes.
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

})();
