/**
 A **KeyboardRotateCamera** orbits a {{#crossLink "Camera"}}{{/crossLink}} about its point-of-interest using the keyboard's arrow keys.

 <ul>
 <li>A KeyboardRotateCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to its target {{#crossLink "Camera"}}{{/crossLink}}.
 <li>The point-of-interest is the {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/look:property"}}{{/crossLink}}.</li>
 <li>Orbiting involves rotating the {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/eye:property"}}{{/crossLink}}
 about {{#crossLink "Lookat/look:property"}}{{/crossLink}}.</li>
 <li>Y-axis rotation is about the {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/up:property"}}{{/crossLink}} vector.</li>
 <li>Z-axis rotation is about the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} -&gt; {{#crossLink "Lookat/look:property"}}{{/crossLink}} vector.</li>
 <li>X-axis rotation is about the vector perpendicular to the {{#crossLink "Lookat/eye:property"}}{{/crossLink}}-&gt;{{#crossLink "Lookat/look:property"}}{{/crossLink}}
 and {{#crossLink "Lookat/up:property"}}{{/crossLink}} vectors.</li>
 <li>In 'first person' mode, the {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/look:property"}}{{/crossLink}}
 position will orbit the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} position, otherwise the {{#crossLink "Lookat/eye:property"}}{{/crossLink}}
 will orbit the {{#crossLink "Lookat/look:property"}}{{/crossLink}}.</li>
 </ul>

 ## Examples

 <ul>
 <li>[KeyboardRotateCamera example](../../examples/#interaction_KeyboardRotateCamera)</li>
 <li>[CameraControl example](../../examples/#interaction_CameraControl)</li>
 </ul>

 ## Usage

 ````Javascript
 var camera = new XEO.Camera({
     view: new XEO.Lookat({
         eye: [0, 0, 10],
         look: [0, 0, 0],
         up: [0, 1, 0]
     }),
     project: new XEO.Perspective({
         fovy: 60,
         near: 0.1,
         far: 1000
     })
 });

 var entity = new XEO.Entity({
     camera: camera,
     geometry: new XEO.BoxGeometry()
 });

 new XEO.KeyboardRotateCamera(scene, {

     camera: camera,

     // "First person" mode rotates look about eye.
     // By default however, we orbit eye about look.
     firstPerson: false
 });
 ````
 @class KeyboardRotateCamera
 @module XEO
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent viewer, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this KeyboardAxisCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardRotateCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.sensitivity=1.0] {Number} Orbit sensitivity factor.
 @param [cfg.firstPerson=false] {Boolean}  Indicates whether this KeyboardRotateCamera is in "first person" mode.
 @param [cfg.active=true] {Boolean} Whether or not this MousePanCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.KeyboardRotateCamera = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.KeyboardRotateCamera",

        _init: function (cfg) {

            // Event handles

            this._onTick = null;

            // Init properties

            this.camera = cfg.camera;
            this.active = cfg.active !== false;
            this.sensitivity = cfg.sensitivity;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this KeyboardRotateCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardRotateCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this KeyboardRotateCamera's {{#crossLink "KeyboardRotateCamera/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */

                    this._attach({
                        name: "camera",
                        type: "XEO.Camera",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The sensitivity of this KeyboardRotateCamera.
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/sensitivity:event"}}{{/crossLink}} event on change.
             *
             * @property sensitivity
             * @type Number
             * @default 1.0
             */
            sensitivity: {

                set: function (value) {

                    this._sensitivity = value || 1.0;

                    /**
                     * Fired whenever this KeyboardRotateCamera's  {{#crossLink "KeyboardRotateCamera/sensitivity:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this KeyboardRotateCamera is in "first person" mode.
             *
             * A KeyboardRotateCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to its
             * target {{#crossLink "Camera"}}{{/crossLink}}. In 'first person' mode, the
             * {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/look:property"}}{{/crossLink}}
             * position orbits the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} position, otherwise
             * the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} orbits {{#crossLink "Lookat/look:property"}}{{/crossLink}}.</li>
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/firstPerson:event"}}{{/crossLink}} event on change.
             *
             * @property firstPerson
             * @default false
             * @type Boolean
             */
            firstPerson: {

                set: function (value) {

                    value = !!value;

                    this._firstPerson = value;

                    /**
                     * Fired whenever this KeyboardRotateCamera's {{#crossLink "KeyboardRotateCamera/firstPerson:property"}}{{/crossLink}} property changes.
                     * @event firstPerson
                     * @param value The property's new value
                     */
                    this.fire('firstPerson', this._firstPerson);
                },

                get: function () {
                    return this._firstPerson;
                }
            },

            /**
             * Flag which indicates whether this KeyboardRotateCamera is active or not.
             *
             * Fires an {{#crossLink "KeyboardRotateCamera/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    if (this._active === value) {
                        return;
                    }

                    var input = this.scene.input;

                    if (value) {

                        var self = this;

                        this._onTick = this.scene.on("tick",
                            function (params) {

                                var camera = self._attached.camera;

                                if (!camera) {
                                    return;
                                }

                                if (!input.mouseover) {
                                    return;
                                }

                                var elapsed = params.deltaTime;

                                var yawRate = self._sensitivity * 0.3;
                                var pitchRate = self._sensitivity * 0.3;

                                if (!input.ctrlDown && !input.altDown) {

                                    var left = input.keyDown[input.KEY_LEFT_ARROW];
                                    var right = input.keyDown[input.KEY_RIGHT_ARROW];
                                    var up = input.keyDown[input.KEY_UP_ARROW];
                                    var down = input.keyDown[input.KEY_DOWN_ARROW];

                                    if (left || right || up || down) {

                                        var yaw = 0;
                                        var pitch = 0;

                                        if (right) {
                                            yaw = -elapsed * yawRate;

                                        } else if (left) {
                                            yaw = elapsed * yawRate;
                                        }

                                        if (down) {
                                            pitch = elapsed * pitchRate;

                                        } else if (up) {
                                            pitch = -elapsed * pitchRate;
                                        }

                                        if (Math.abs(yaw) > Math.abs(pitch)) {
                                            pitch = 0;
                                        } else {
                                            yaw = 0;
                                        }

                                        if (yaw !== 0) {
                                            camera.view.rotateEyeY(yaw);
                                        }

                                        if (pitch !== 0) {
                                            camera.view.rotateEyeX(pitch);
                                        }
                                    }
                                }
                            });

                    } else {

                        this.scene.off(this._onTick);
                    }

                    /**
                     * Fired whenever this KeyboardRotateCamera's {{#crossLink "KeyboardRotateCamera/active:property"}}{{/crossLink}} property changes.
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

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false; // Unbinds events
        }
    });

})();
