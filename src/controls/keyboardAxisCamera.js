/**
 A **KeyboardAxisCamera** switches a {{#crossLink "Camera"}}{{/crossLink}} between preset left, right, anterior,
 posterior, superior and inferior views using the keyboard.

 * A KeyboardAxisCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.

 By default the views are selected by the following keys:

 * '1' - left side, viewing center from along -X axis
 * '2' - right side, viewing center from along +X axis
 * '3' - anterior, viewing center from along -Z axis
 * '4' - posterior, viewing center from along +Z axis
 * '5' - superior, viewing center from along -Y axis
 * '6' - inferior, viewing center from along +Y axis

 ## Examples

 * [KeyboardAxisCamera example](../../examples/#interaction_KeyboardAxisCamera)
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

 new xeogl.KeyboardAxisCamera({
     camera: camera
 });
 ````

 @class KeyboardAxisCamera
 @module xeogl
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Entity} Optional map of user-defined metadata to attach to this KeyboardAxisCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardAxisCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this KeyboardAxisCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.KeyboardAxisCamera = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.KeyboardAxisCamera",

        _init: function (cfg) {

            // Event handles

            this._onKeyDown = null;

            // Animations

            this._cameraFly = new xeogl.CameraFlightAnimation(this.scene, {
                duration: 1.0
            });

            // Init properties

            this.camera = cfg.camera;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this KeyboardAxisCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardAxisCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "KeyboardAxisCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this KeyboardAxisCamera's {{#crossLink "KeyboardAxisCamera/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    var camera = this._attach({
                        name: "camera",
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true
                    });

                    // Update animation

                    this._cameraFly.camera = camera;
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * Flag which indicates whether this KeyboardAxisCamera is active or not.
             *
             * Fires an {{#crossLink "KeyboardAxisCamera/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._active === value) {
                        return;
                    }

                    this._cameraFly.active = value;

                    var self = this;

                    var input = this.scene.input;

                    if (value) {

                        this._onKeyDown = input.on("keydown",
                            function (keyCode) {

                                if (!self._attached.camera) {
                                    return;
                                }

                                if (!input.mouseover) {
                                    return;
                                }

                                if (keyCode === input.KEY_NUM_1
                                    || keyCode === input.KEY_NUM_2
                                    || keyCode === input.KEY_NUM_3
                                    || keyCode === input.KEY_NUM_4
                                    || keyCode === input.KEY_NUM_5
                                    || keyCode === input.KEY_NUM_6) {


                                    xeogl.scheduleTask(function () {
                                        self._fly(keyCode);
                                    });
                                }
                            });

                    } else {

                        this.scene.off(this._onKeyDown);
                    }

                    /**
                     * Fired whenever this KeyboardAxisCamera's {{#crossLink "KeyboardAxisCamera/active:property"}}{{/crossLink}} property changes.
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

        _fly: function (keyCode) {

            var input = this.scene.input;
            var boundary = this.scene.worldBoundary;
            var aabb = boundary.aabb;
            var center = boundary.center;
            var diag = xeogl.math.getAABB3Diag(aabb);

            this._fitFOV = 55;
            var dist = Math.abs((diag) / Math.tan(this._fitFOV / 2));

            switch (keyCode) {

                case input.KEY_NUM_1:

                    // Right view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0] - dist, center[1], center[2]],
                        up: [0, 1, 0]
                    });

                    break;

                case input.KEY_NUM_2:

                    // Back view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0], center[1], center[2] + dist],
                        up: [0, 1, 0]
                    });

                    break;

                case input.KEY_NUM_3:

                    // Left view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0] + dist, center[1], center[2]],
                        up: [0, 1, 0]
                    });


                    break;

                case input.KEY_NUM_4:

                    // Front view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0], center[1], center[2] - dist],
                        up: [0, 1, 0]
                    });

                    break;

                case input.KEY_NUM_5:

                    // Top view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0], center[1] - dist, center[2]],
                        up: [0, 0, -1]
                    });

                    break;

                case input.KEY_NUM_6:

                    // Bottom view

                    this._cameraFly.flyTo({
                        look: center,
                        eye: [center[0], center[1] + dist, center[2]],
                        up: [0, 0, 1]
                    });

                    break;
            }
        },

        _getJSON: function () {

            var json = {
                active: this._active
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            return json;
        },

        _destroy: function () {

            this.active = false;

            this._cameraFly.destroy();
        }
    });

})();
