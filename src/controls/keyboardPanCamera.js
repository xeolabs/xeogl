/**
 A **KeyboardPanCamera** pans a {{#crossLink "Camera"}}{{/crossLink}} using the W,S,A,D,X and Z keys.

 * A KeyboardPanCamera updates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.
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

 * [KeyboardPanCamera example](../../examples/#interaction_KeyboardPanCamera)
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

 new xeogl.KeyboardPanCamera({
     camera: camera
 });
 ````

 @class KeyboardPanCamera
 @module xeogl
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this KeyboardRotateCamera.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardPanCamera. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.sensitivity=0.5] {Number} Pan sensitivity factor.
 @param [cfg.active=true] {Boolean} Whether or not this KeyboardPanCamera is active.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.KeyboardPanCamera = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.KeyboardPanCamera",

        _init: function (cfg) {

            // Event handles

            this._onTick = null;

            // Init properties

            this.camera = cfg.camera;
            this.sensitivity = cfg.sensitivity;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this KeyboardPanCamera.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this KeyboardPanCamera. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "KeyboardPanCamera/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this KeyboardPanCamera's {{#crossLink "KeyboardPanCamera/camera:property"}}{{/crossLink}} property changes.
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
             * The sensitivity of this KeyboardPanCamera.
             *
             * Fires a {{#crossLink "KeyboardPanCamera/sensitivity:event"}}{{/crossLink}} event on change.
             *
             * @property sensitivity
             * @type Number
             * @default 0.5
             */
            sensitivity: {

                set: function (value) {

                    this._sensitivity = value || 0.5;

                    /**
                     * Fired whenever this KeyboardPanCamera's  {{#crossLink "KeyboardPanCamera/sensitivity:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this KeyboardPanCamera is active or not.
             *
             * Fires an {{#crossLink "KeyboardPanCamera/active:event"}}{{/crossLink}} event on change.
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

                                if (!input.ctrlDown && !input.altDown) {

                                    var wkey = input.keyDown[input.KEY_W];
                                    var skey = input.keyDown[input.KEY_S];
                                    var akey = input.keyDown[input.KEY_A];
                                    var dkey = input.keyDown[input.KEY_D];
                                    var zkey = input.keyDown[input.KEY_Z];
                                    var xkey = input.keyDown[input.KEY_X];

                                    if (wkey || skey || akey || dkey || xkey || zkey) {

                                        var x = 0;
                                        var y = 0;
                                        var z = 0;

                                        var sensitivity = self._sensitivity * 0.01;

                                        if (skey) {
                                            y = elapsed * sensitivity;

                                        } else if (wkey) {
                                            y = -elapsed * sensitivity;
                                        }

                                        if (dkey) {
                                            x = elapsed * sensitivity;

                                        } else if (akey) {
                                            x = -elapsed * sensitivity;
                                        }

                                        if (xkey) {
                                            z = elapsed * sensitivity;

                                        } else if (zkey) {
                                            z = -elapsed * sensitivity;
                                        }

                                        camera.view.pan([x, y, z]);
                                    }
                                }
                            });

                    } else {

                        if (this._onTick) {
                            this.scene.off(this._onTick);
                        }
                    }

                    /**
                     * Fired whenever this KeyboardPanCamera's {{#crossLink "KeyboardPanCamera/active:property"}}{{/crossLink}} property changes.
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
            this.active = false;
        }
    });

})();
