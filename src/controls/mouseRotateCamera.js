/**
 A **MouseRotateCamera** orbits a {{#crossLink "Camera"}}{{/crossLink}} about its point-of-interest using the mouse.

 <ul>
 <li>A MouseRotateCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.
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
 <li>[MouseRotateCamera example](../../examples/#interaction_MouseRotateCamera)</li>
 <li>[CameraControl example](../../examples/#interaction_CameraControl)</li>
 </ul>

 ## Usage

 ````Javascript
 var camera = new XEO.Camera({
     view: new XEO.Lookat({
         eye: [0, 0, -10],
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

 new XEO.MouseRotateCamera(scene, {

     camera: camera,

     // "First person" mode rotates look about eye.
     // By default however, we orbit eye about look.
     firstPerson: false
 });
 ````

 @class MouseRotateCamera
 @module XEO
 @submodule controls
 @constructor
 @param [scene] {scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent Scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MouseRotateCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MouseRotateCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.sensitivity=0.5] {Number} Mouse drag sensitivity factor.
 @param [cfg.firstPerson=false] {Boolean}  Indicates whether this MouseRotateCamera is in "first person" mode.
 @param [cfg.active=true] {Boolean} Whether or not this MouseRotateCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.MouseRotateCamera = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.MouseRotateCamera",

        _init: function (cfg) {

            // Event handles

            this._onTick = null;
            this._onMouseDown = null;
            this._onMouseMove = null;
            this._onMouseUp = null;

            // Init properties

            this.camera = cfg.camera;
            this.sensitivity = cfg.sensitivity;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this MouseRotateCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MouseRotateCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "MouseRotateCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this MouseRotateCamera's {{#crossLink "MouseRotateCamera/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Camera", "camera", value);
                },

                get: function () {
                    return this._children.camera;
                }
            },

            /**
             * The sensitivity of this MouseRotateCamera.
             *
             * Fires a {{#crossLink "MouseRotateCamera/sensitivity:event"}}{{/crossLink}} event on change.
             *
             * @property sensitivity
             * @type Number
             * @default 0.5
             */
            sensitivity: {

                set: function (value) {

                    this._sensitivity = value || 0.5;

                    /**
                     * Fired whenever this MouseRotateCamera's  {{#crossLink "MouseRotateCamera/sensitivity:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this MouseRotateCamera is in "first person" mode.
             *
             * A MouseRotateCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to its
             * target {{#crossLink "Camera"}}{{/crossLink}}. In 'first person' mode, the
             * {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/look:property"}}{{/crossLink}}
             * position orbits the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} position, otherwise
             * the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} orbits {{#crossLink "Lookat/look:property"}}{{/crossLink}}.</li>
             *
             * Fires a {{#crossLink "MouseRotateCamera/firstPerson:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this MouseRotateCamera's {{#crossLink "MouseRotateCamera/firstPerson:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this MouseRotateCamera is active or not.
             *
             * Fires an {{#crossLink "MouseRotateCamera/active:event"}}{{/crossLink}} event on change.
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

                        var lastX;
                        var lastY;
                        var xDelta = 0;
                        var yDelta = 0;
                        var down = false;
                        var over = false;
                        var angle;

                        this._onTick = this.scene.on("tick",
                            function () {

                                var camera = this._children.camera;

                                if (!camera) {
                                    return;
                                }

                                if (!over) {
                                    return;
                                }

                                if (!down) {
                                    return;
                                }

                                if (xDelta !== 0) {

                                    angle = -xDelta * this._sensitivity;

                                    if (this._firstPerson) {
                                        camera.view.rotateLookY(angle);
                                    } else {
                                        camera.view.rotateEyeY(angle);
                                    }

                                    xDelta = 0;
                                }

                                if (yDelta !== 0) {

                                    angle = yDelta * this._sensitivity;

                                    if (this._firstPerson) {
                                        camera.view.rotateLookX(-angle);
                                    } else {
                                        camera.view.rotateEyeX(angle);
                                    }

                                    yDelta = 0;
                                }
                            }, this);

                        this._onMouseDown = input.on("mousedown",
                            function (e) {

                                xDelta = 0;
                                yDelta = 0;

                                if (!over) {
                                    return;
                                }

                                if (input.mouseDownLeft
                                    && !input.mouseDownRight
                                    && !input.keyDown[input.KEY_SHIFT]
                                    && !input.mouseDownMiddle) {

                                    down = true;

                                    lastX = e[0];
                                    lastY = e[1];

                                } else {
                                    down = false;
                                }

                            }, this);

                        this._onMouseUp = input.on("mouseup",
                            function () {

                                down = false;

                                xDelta = 0;
                                yDelta = 0;
                            });

                        this._onMouseOver = input.on("mouseover",
                            function () {

                                over = true;

                                xDelta = 0;
                                yDelta = 0;
                            });

                        this._onMouseOut = input.on("mouseout",
                            function () {

                                over = false;

                                xDelta = 0;
                                yDelta = 0;
                            });


                        this._onMouseMove = input.on("mousemove",
                            function (e) {

                                if (!over) {
                                    return;
                                }

                                if (!down) {
                                    return;
                                }

                                xDelta += (e[0] - lastX) * this._sensitivity;
                                yDelta += (e[1] - lastY) * this._sensitivity;

                                lastX = e[0];
                                lastY = e[1];

                            }, this);

                    } else {

                        input.off(this._onTick);

                        input.off(this._onMouseDown);
                        input.off(this._onMouseUp);
                        input.off(this._onMouseMove);
                        input.off(this._onMouseOver);
                        input.off(this._onMouseOut);
                    }

                    /**
                     * Fired whenever this MouseRotateCamera's {{#crossLink "MouseRotateCamera/active:property"}}{{/crossLink}} property changes.
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
