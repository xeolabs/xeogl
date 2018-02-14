/**
 An **Ortho** defines an orthographic projection transform.

 ## Overview

 * {{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * An Ortho works like Blender's orthographic projection, where the positions of the left, right, top and bottom planes are
 implicitly specified with a single {{#crossLink "Ortho/scale:property"}}{{/crossLink}} property, which causes the frustum to be symmetrical on X and Y axis, large enough to
 contain the number of units given by {{#crossLink "Ortho/scale:property"}}{{/crossLink}}.
 * An Ortho's {{#crossLink "Ortho/near:property"}}{{/crossLink}} and {{#crossLink "Ortho/far:property"}}{{/crossLink}} properties
 specify the distances to the WebGL clipping planes.
 * Use {{#crossLink "Frustum"}}{{/crossLink}} if you need to individually specify the position of each of the frustum
 planes, eg. for an asymmetrical view volume, such as those used for stereo viewing.
 * Use {{#crossLink "Perspective"}}{{/crossLink}} if you need perspective projection.

 <img src="../../../assets/images/Ortho.png"></img>

 ## Examples

 * [Camera with orthographic projection](../../examples/#transforms_camera_project_ortho)

 ## Usage

 ````Javascript
 new xeogl.Entity({

     camera: xeogl.Camera({

         view: new xeogl.Lookat({
             eye: [0, 0, -4],
             look: [0, 0, 0],
             up: [0, 1, 0]
         }),

         project: new xeogl.Ortho(scene, {
             scale: 100.0,  // Fit at least 100 units within the ortho volume X & Y extents
             near: 0.1,
             far: 1000
         })
     }),

     geometry: new xeogl.BoxGeometry()
 });
 ````

 @class Ortho
 @module xeogl
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Ortho within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Ortho.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.scale=1.0] {Number} Scale factor for this Ortho's extents on X and Y axis.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Ortho = xeogl.Component.extend({

        type: "xeogl.Ortho",

        _init: function (cfg) {

            this._state = new xeogl.renderer.ProjTransform({
                matrix: xeogl.math.mat4()
            });

            this.scale = cfg.scale;
            this.near = cfg.near;
            this.far = cfg.far;

            this._onCanvasBoundary = this.scene.canvas.on("boundary", this._needUpdate, this);
        },

        _update: function () {

            var scene = this.scene;
            var scale = this._scale;
            var canvas = scene.canvas.canvas;
            var canvasWidth = canvas.clientWidth;
            var canvasHeight = canvas.clientHeight;
            var halfSize = 0.5 * scale;
            var aspect = canvasWidth / canvasHeight;

            var left;
            var right;
            var top;
            var bottom;

            if (canvasWidth > canvasHeight) {
                left = -halfSize;
                right = halfSize;
                top = halfSize / aspect;
                bottom = -halfSize / aspect;

            } else {
                left = -halfSize * aspect;
                right = halfSize * aspect;
                top = halfSize;
                bottom = -halfSize;
            }

            xeogl.math.orthoMat4c(left, right, bottom, top, this._near, this._far, this._state.matrix);

            this._renderer.imageDirty();

            this.fire("matrix", this._state.matrix);
        },

        _props: {

            /**
             * Scale factor for this Ortho's extents on X and Y axis.
             *
             * Clamps to minimum value of ````0.01```.
             *
             * Fires a {{#crossLink "Ortho/scale:event"}}{{/crossLink}} event on change.
             *
             * @property scale
             * @default 1.0
             * @type Number
             */
            scale: {

                set: function (value) {

                    if (value === undefined || value === null) {
                        value = 1.0;
                    }

                    if (value <= 0) {
                        value = 0.01;
                    }

                    this._scale = value;

                    this._needUpdate(0);

                    /**
                     * Fired whenever this Ortho's {{#crossLink "Ortho/scale:property"}}{{/crossLink}} property changes.
                     *
                     * @event scale
                     * @param value The property's new value
                     */
                    this.fire("scale", this._scale);
                },

                get: function () {
                    return this._scale;
                }
            },

            /**
             * Position of this Ortho's near plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Ortho/near:event"}}{{/crossLink}} event on change.
             *
             * @property near
             * @default 0.1
             * @type Number
             */
            near: {

                set: function (value) {

                    this._near = (value !== undefined && value !== null) ? value : 0.1;

                    this._needUpdate(0);

                    /**
                     * Fired whenever this Ortho's  {{#crossLink "Ortho/near:property"}}{{/crossLink}} property changes.
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
             * Position of this Ortho's far plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Ortho/far:event"}}{{/crossLink}} event on change.
             *
             * @property far
             * @default 10000.0
             * @type Number
             */
            far: {

                set: function (value) {

                    this._far = (value !== undefined && value !== null) ? value : 10000.0;

                    this._needUpdate(0);

                    /**
                     * Fired whenever this Ortho's {{#crossLink "Ortho/far:property"}}{{/crossLink}} property changes.
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
             * The Ortho's projection transform matrix.
             *
             * Fires a {{#crossLink "Ortho/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             * @type {Float32Array}
             */
            matrix: {

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._state.matrix;
                }
            }
        },

        _destroy: function () {
            this._super();
            this.scene.canvas.off(this._onCanvasBoundary);
        }
    });

})();
