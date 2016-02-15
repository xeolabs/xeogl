/**
 A **Frustum** defines a perspective projection as a frustum-shaped view volume.

 ## Overview

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Ortho components create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Frustum.png"></img>

 ## Example

 In this example we have an {{#crossLink "Entity"}}Entity{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Frustum
 projection transform.

 ````Javascript

 var scene = new XEO.Scene();

 var lookat = new XEO.Lookat(scene, {
        eye: [0, 0, -4],
        look: [0, 0, 0],
        up: [0, 1, 0]
    });

 var frustum = new XEO.Frustum(scene, {
        left: -0.1,
        right: 0.1,
        bottom: -0.1,
        top: 0.1,
        near: 0.15,
        far: 1000
    });

 var camera = new XEO.Camera(scene, {
        view: lookat,
        project: frustum
    });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var entity = new XEO.Entity(scene, {
        camera: camera,
        geometry: geometry
    });

 scene.on("tick", function () {
       camera.view.rotateEyeY(0.5);
       camera.view.rotateEyeX(0.3);
    });
 ````

 @class Frustum
 @module XEO
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Frustum within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Frustum.
 @param [cfg.left=-1] {Number} Position of the Frustum's left plane on the View-space X-axis.
 @param [cfg.right=1] {Number} Position of the Frustum's right plane on the View-space X-axis.
 @param [cfg.bottom=-1] {Number} Position of the Frustum's bottom plane on the View-space Y-axis.
 @param [cfg.top=1] {Number} Position of the Frustum's top plane on the View-space Y-axis.
 @param [cfg.near=0.1] {Number} Position of the Frustum's near plane on the View-space Z-axis.
 @param [cfg.far=1000] {Number} Position of the Frustum's far plane on the positive View-space Z-axis.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Frustum = XEO.Projection.extend({

        type: "XEO.Frustum",

        _init: function (cfg) {

            this._state = new XEO.renderer.ProjTransform({
                matrix: XEO.math.identityMat4()
            });

            this._left = -1.0;
            this._right = 1.0;
            this._bottom = -1.0;
            this._top = 1.0;
            this._near = 0.1;
            this._far = 10000.0;

            // Set component properties

            this.left = cfg.left;
            this.right = cfg.right;
            this.bottom = cfg.bottom;
            this.top = cfg.top;
            this.near = cfg.near;
            this.far = cfg.far;
        },

        _props: {

            /**
             Position of this Frustum's left plane on the View-space X-axis.

             Fires a {{#crossLink "Frustum/left:event"}}{{/crossLink}} event on change.

             @property left
             @default -1.0
             @type Number
             */
            left: {

                set: function (value) {

                    this._left = (value !== undefined && value !== null) ? value : -1.0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's {{#crossLink "Frustum/left:property"}}{{/crossLink}} property changes.
                     *
                     * @event left
                     * @param value The property's new value
                     */
                    this.fire("left", this._left);
                },

                get: function () {
                    return this._left;
                }
            },

            /**
             * Position of this Frustum's right plane on the View-space X-axis.
             *
             * Fires a {{#crossLink "Frustum/right:event"}}{{/crossLink}} event on change.
             *
             * @property right
             * @default 1.0
             * @type Number
             */
            right: {

                set: function (value) {

                    this._right = (value !== undefined && value !== null) ? value : 1.0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's {{#crossLink "Frustum/right:property"}}{{/crossLink}} property changes.
                     *
                     * @event right
                     * @param value The property's new value
                     */
                    this.fire("right", this._right);
                },

                get: function () {
                    return this._right;
                }
            },

            /**
             * Position of this Frustum's top plane on the View-space Y-axis.
             *
             * Fires a {{#crossLink "Frustum/top:event"}}{{/crossLink}} event on change.
             *
             * @property top
             * @default 1.0
             * @type Number
             */
            top: {

                set: function (value) {

                    this._top = (value !== undefined && value !== null) ? value : 1.0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's   {{#crossLink "Frustum/top:property"}}{{/crossLink}} property changes.
                     *
                     * @event top
                     * @param value The property's new value
                     */
                    this.fire("top", this._top);
                },

                get: function () {
                    return this._top;
                }
            },

            /**
             * Position of this Frustum's bottom plane on the View-space Y-axis.
             *
             * Fires a {{#crossLink "Frustum/bottom:event"}}{{/crossLink}} event on change.
             *
             * @property bottom
             * @default -1.0
             * @type Number
             */
            bottom: {

                set: function (value) {

                    this._bottom = (value !== undefined && value !== null) ? value : -1.0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's   {{#crossLink "Frustum/bottom:property"}}{{/crossLink}} property changes.
                     *
                     * @event bottom
                     * @param value The property's new value
                     */
                    this.fire("bottom", this._bottom);
                },

                get: function () {
                    return this._bottom;
                }
            },

            /**
             * Position of this Frustum's near plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Frustum/near:event"}}{{/crossLink}} event on change.
             *
             * @property near
             * @default 0.1
             * @type Number
             */
            near: {

                set: function (value) {

                    this._near = (value !== undefined && value !== null) ? value : 0.1;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's {{#crossLink "Frustum/near:property"}}{{/crossLink}} property changes.
                     *
                     * @event near
                     * @param value The property's new value
                     */
                    this.fire("near", this._near);
                },

                get: function () {
                    return this._near;
                }
            },

            /**
             * Position of this Frustum's far plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Frustum/far:event"}}{{/crossLink}} event on change.
             *
             * @property far
             * @default 10000.0
             * @type Number
             */
            far: {

                set: function (value) {

                    this._far = (value !== undefined && value !== null) ? value : 10000.0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Frustum's  {{#crossLink "Frustum/far:property"}}{{/crossLink}} property changes.
                     *
                     * @event far
                     * @param value The property's new value
                     */
                    this.fire("far", this._far);
                },

                get: function () {
                    return this._far;
                }
            },

            /**
             * The elements of this Frustum's projection transform matrix.
             *
             * Fires a {{#crossLink "Frustum/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @type {Float64Array}
             */
            matrix: {

                get: function () {

                    if (this._buildScheduled) {

                        // Matrix update is scheduled for next frame.
                        // Lazy-build the matrix now, while leaving the update
                        // scheduled. The update task will fire a "matrix" event,
                        // without needlessly rebuilding the matrix again.

                        this._build();

                        this._buildScheduled = false;
                    }

                    return this._state.matrix;
                }
            }
        },

        _build: function () {

            XEO.math.frustumMat4(
                this._left,
                this._right,
                this._bottom,
                this._top,
                this._near,
                this._far,
                this._state.matrix);
        },

        _update: function () {

            this._renderer.imageDirty = true;

            /**
             * Fired whenever this Frustum's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is regenerated.
             * @event matrix
             * @param value The property's new value
             */
            this.fire("matrix", this._state.matrix);
        },

        _compile: function () {
            this._renderer.projTransform = this._state;
        },

        _getJSON: function () {
            return {
                left: this._left,
                right: this._right,
                top: this._top,
                bottom: this._bottom,
                near: this._near,
                far: this._far
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
