/**
 A **MouseZoomCamera** zooms a {{#crossLink "Camera"}}{{/crossLink}} using the mouse wheel.

 ## Overview

 <ul>
 <li>A MouseZoomCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.
 <li>Zooming involves translating the positions of the {{#crossLink "Lookat"}}Lookat's{{/crossLink}}
 {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} back and forth
 along the {{#crossLink "Lookat/eye:property"}}{{/crossLink}}-&gt;{{#crossLink "Lookat/look:property"}}{{/crossLink}} vector.</li>
 </ul>

 ## Example

 ````Javascript
 var scene = new XEO.Scene();

 var camera = new XEO.Camera(scene);

 var control = new XEO.MouseZoomCamera(scene, {
        camera: camera
    });

 var entity = new XEO.Entity(scene);
 ````

 @class MouseZoomCamera
 @module XEO
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MouseZoomCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MouseZoomCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.sensitivity=0.5] {Number} Zoom sensitivity factor.
 @param [cfg.active=true] {Boolean} Whether or not this MouseZoomCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.MouseZoomCamera = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.MouseZoomCamera",

        _init: function (cfg) {

            // Event handles

            this._onTick = null;
            this._onMouseWheel = null;

            // Init properties

            this.camera = cfg.camera;
            this.sensitivity = cfg.sensitivity;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this MouseZoomCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MouseZoomCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "MouseZoomCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this MouseZoomCamera's {{#crossLink "MouseZoomCamera/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("camera", value);
                },

                get: function () {
                    return this._children.camera;
                }
            },

            /**
             * The sensitivity of this MouseZoomCamera.
             *
             * Fires a {{#crossLink "MouseZoomCamera/sensitivity:event"}}{{/crossLink}} event on change.
             *
             * @property sensitivity
             * @type Number
             * @default 0.5
             */
            sensitivity: {

                set: function (value) {

                    this._sensitivity = value || 0.5;

                    /**
                     * Fired whenever this MouseZoomCamera's  {{#crossLink "MouseZoomCamera/sensitivity:property"}}{{/crossLink}} property changes.
                     *
                     * @event sensitivity
                     * @param value The property's new value
                     */
                    this.fire("sensitivity", this._sensitivity);
                },

                get: function () {
                    return this._sensitivity;
                }
            },

            /**
             * Indicates whether this MouseZoomCamera is active or not.
             *
             * Fires an {{#crossLink "MouseZoomCamera/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    if (this._active === value) {
                        return;
                    }

                    if (value) {

                        var delta = 0;
                        var target = 0;
                        var newTarget = false;
                        var targeting = false;
                        var progress = 0;

                        var eyeVec = XEO.math.vec3();
                        var lookVec = XEO.math.vec3();
                        var tempVec3 = XEO.math.vec3();

                        var self = this;

                        this._onMouseWheel = this.scene.input.on("mousewheel",
                            function (_delta) {

                                delta = _delta;

                                if (delta === 0) {
                                    targeting = false;
                                    newTarget = false;
                                } else {
                                    newTarget = true;
                                }
                            });

                        this._onTick = this.scene.on("tick",
                            function () {

                                var camera = self._children.camera;

                                if (!camera) {
                                    return;
                                }

                                var eye = camera.view.eye;
                                var look = camera.view.look;

                                eyeVec[0] = eye[0];
                                eyeVec[1] = eye[1];
                                eyeVec[2] = eye[2];

                                lookVec[0] = look[0];
                                lookVec[1] = look[1];
                                lookVec[2] = look[2];

                                XEO.math.subVec3(eyeVec, lookVec, tempVec3);

                                var lenLook = Math.abs(XEO.math.lenVec3(tempVec3));
                                var lenLimits = 1000;
                                var f = self._sensitivity * (2.0 + (lenLook / lenLimits));

                                if (newTarget) {
                                    target = delta * f;
                                    progress = 0;
                                    newTarget = false;
                                    targeting = true;
                                }

                                if (targeting) {

                                    if (delta > 0) {

                                        progress += 0.2 * f;

                                        if (progress > target) {
                                            targeting = false;
                                        }

                                    } else if (delta < 0) {

                                        progress -= 0.2 * f;

                                        if (progress < target) {
                                            targeting = false;
                                        }
                                    }

                                    if (targeting) {
                                        camera.view.zoom(progress);
                                    }
                                }
                            });

                    } else {

                        if (this._onTick !== null) {
                            this.scene.off(this._onTick);
                            this.scene.input.off(this._onMouseWheel);
                        }
                    }

                    /**
                     * Fired whenever this MouseZoomCamera's {{#crossLink "MouseZoomCamera/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active = value);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _getJSON: function () {

            var json = {
                sensitivity: this._sensitivity,
                active: this._active
            };

            if (this._children.camera) {
                json.camera = this._children.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });

})();
