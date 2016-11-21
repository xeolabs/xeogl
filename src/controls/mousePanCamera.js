/**
 A **MousePanCamera** pans a {{#crossLink "Camera"}}{{/crossLink}} with the mouse.

 * A MousePanCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.
 * Panning is done by dragging the mouse with both the left and right buttons down.
 * Panning up and down involves translating the positions of the {{#crossLink "Lookat"}}Lookat's{{/crossLink}}
 {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} back and forth
 along the {{#crossLink "Lookat"}}Lookat's{{/crossLink}} {{#crossLink "Lookat/up:property"}}{{/crossLink}} vector.
 * Panning forwards and backwards involves translating
 {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} back and forth along the
 {{#crossLink "Lookat/eye:property"}}{{/crossLink}}-&gt;{{#crossLink "Lookat/look:property"}}{{/crossLink}} vector.
 * Panning left and right involves translating the {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and
 {{#crossLink "Lookat/look:property"}}{{/crossLink}} along the the vector perpendicular to the {{#crossLink "Lookat/up:property"}}{{/crossLink}}
 and {{#crossLink "Lookat/eye:property"}}{{/crossLink}}-&gt;{{#crossLink "Lookat/look:property"}}{{/crossLink}} vectors.

 ## Examples

 * [MousePanCamera example](../../examples/#interaction_MousePanCamera)
 * [CameraControl example](../../examples/#interaction_CameraControl)

 ## Usage

 ````Javascript
 var camera = new xeogl.Camera({
     view: new xeogl.Lookat({
         eye: [0, 0, 10],
         look: [0, 0, 0],
         up: [0, 1, 0]
     }),
     project: new xeogl.Perspective({
         fovy: 60,
         near: 0.1,
         far: 1000
     })
 });

 var entity = new xeogl.Entity({
     camera: camera,
     geometry: new xeogl.BoxGeometry()
 });

 new xeogl.MousePanCamera({
     camera: camera
 });
 ````

 @class MousePanCamera
 @module xeogl
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MousePanCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MousePanCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.sensitivity=0.5] {Number} Pan sensitivity factor.
 @param [cfg.active=true] {Boolean} Whether or not this MousePanCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.MousePanCamera = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.MousePanCamera",

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
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this MousePanCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MousePanCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "MousePanCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this MousePanCamera's {{#crossLink "MousePanCamera/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */

                    this._attach({
                        name: "camera",
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The sensitivity of this MousePanCamera.
             *
             * Fires a {{#crossLink "MousePanCamera/sensitivity:event"}}{{/crossLink}} event on change.
             *
             * @property sensitivity
             * @type Number
             * @default 0.5
             */
            sensitivity: {

                set: function (value) {

                    this._sensitivity = value ? value * 0.03 : 0.03;

                    /**
                     * Fired whenever this MousePanCamera's  {{#crossLink "MousePanCamera/sensitivity:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this MousePanCamera is active or not.
             *
             * Fires an {{#crossLink "MousePanCamera/active:event"}}{{/crossLink}} event on change.
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

                        var self = this;

                        this._onTick = this.scene.on("tick",
                            function () {

                                var camera = self._attached.camera;

                                if (!camera) {
                                    return;
                                }

                                if (xDelta !== 0 || yDelta !== 0) {

                                    camera.view.pan([xDelta, yDelta, 0]);

                                    xDelta = 0;
                                    yDelta = 0;
                                }
                            });

                        this._onMouseDown = input.on("mousedown",
                            function (e) {

                                if ((input.mouseDownLeft && input.mouseDownRight) ||
                                    (input.mouseDownLeft && input.keyDown[input.KEY_SHIFT]) ||
                                    input.mouseDownMiddle) {

                                    lastX = e[0];
                                    lastY = e[1];

                                    down = true;

                                } else {
                                    down = false;
                                }
                            });

                        this._onMouseUp = input.on("mouseup",
                            function () {
                                down = false;
                            });

                        this._onMouseUp = input.on("mouseout",
                            function () {
                                down = false;
                            });

                        this._onMouseMove = input.on("mousemove",
                            function (e) {
                                if (down) {
                                    xDelta += (e[0] - lastX) * self._sensitivity;
                                    yDelta += (e[1] - lastY) * self._sensitivity;
                                    lastX = e[0];
                                    lastY = e[1];
                                }
                            });

                    } else {

                        input.off(this._onTick);
                        input.off(this._onMouseDown);
                        input.off(this._onMouseUp);
                        input.off(this._onMouseMove);
                    }

                    /**
                     * Fired whenever this MousePanCamera's {{#crossLink "MousePanCamera/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active = value);
                },

                get: function () {
                    return this._active; // Unbinds events
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
            this.active = false;
        }
    });

})();
