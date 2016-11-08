/**
 A **CameraFollow** makes a {{#crossLink "Camera"}}{{/crossLink}} dynamically follow a
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} in order to keep it entirely in view.

 @class CameraFollow
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CameraFollow within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {*} Optional map of user-defined metadata to attach to this CameraFollow.
 @param [cfg.camera] {Number|String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFollow. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.worldBoundary] {Number|String|Camera} ID or instance of a {{#crossLink "Boundary3D"}}Boundary3D{{/crossLink}} to follow.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFollow. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s World-space boundary, {{#crossLink "Scene/worldBoundary:property"}}worldBoundary{{/crossLink}}.
 @param [cfg.fly] {Boolean}  Indicates whether this CameraFollow will either fly or jump to each updated position of the
 target {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}}.
 @param [cfg.fit] {Boolean} When true, will ensure that this CameraFollow always adjusts the distance between the
 {{#crossLink "CameraFollow/camera:property"}}camera{{/crossLink}}'s eye and look
 so as to ensure that the {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}}
 is always filling the view volume.
 @param [cfg.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}} should
 fill the canvas when fitting to view.
 @param [cfg.trail] {Boolean} When true, will cause this CameraFollow to point the {{#crossLink "CameraFollow/camera:property"}}{{/crossLink}} in the direction that it is travelling.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CameraFollow = xeogl.Component.extend({

        type: "xeogl.CameraFollow",

        _init: function (cfg) {

            this._cameraFlight = this.create({
                type: "xeogl.CameraFlight"
            });

            this.camera = cfg.camera;
            this.worldBoundary = cfg.worldBoundary;
            this.fly = cfg.fly;
            this.fit = cfg.fit;
            this.fitFOV = cfg.fitFOV;
            this.trail = cfg.trail;
        },

        _update: function () {

            var worldBoundary = this._attached.worldBoundary;

            if (worldBoundary && this._cameraFlight) { // This component might have been destroyed

                if (this._fly) {

                    this._cameraFlight.flyTo({
                        worldBoundary: worldBoundary
                    });

                } else {

                    this._cameraFlight.jumpTo({
                        worldBoundary: worldBoundary
                    });
                }
            }
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} being controlled by this CameraFollow.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollow. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "CameraFollow/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    this._cameraFlight.camera = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CameraFollow's
                     * {{#crossLink "CameraFollow/camera:property"}}{{/crossLink}} property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this.fire("camera", this._cameraFlight.camera);
                },

                get: function () {
                    return this._cameraFlight.camera;
                }
            },

            /**
             * The World-space {{#crossLink "Boundary3D"}}{{/crossLink}} followed by this CameraFollow.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollow. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Scene/worldBoundary:property"}}{{/crossLink}}
             * when set to a null or undefined value.
             *
             * Fires a {{#crossLink "CameraFollow/worldBoundary:event"}}{{/crossLink}} event on change.
             *
             * @property worldBoundary
             * @type Boundary3D
             */
            worldBoundary: {

                set: function (value) {

                    /**
                     * Fired whenever this CameraFollow's {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}} property changes.
                     *
                     * @event worldBoundary
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "worldBoundary",
                        type: "xeogl.Boundary3D",
                        component: value,
                        sceneDefault: true,
                        on: {
                            updated: {
                                callback: this._scheduleUpdate,
                                scope: this
                            }
                        }
                    });

                    this._scheduleUpdate();
                },

                get: function () {
                    return this._attached.worldBoundary;
                }
            },

            /**
             * Indicates whether this CameraFollow will either fly or jump to each updated position of the
             * target {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}}.
             *
             * Leave this false if the worldBoundary updates continuously, otherwise leave it true
             * if you want the camera to fly smoothly to each updated worldBoundary extents
             * for a less disorientating experience.
             *
             * Fires a {{#crossLink "CameraFollow/fly:event"}}{{/crossLink}} event on change.
             *
             * @property fly
             * @type Boolean
             * @default false
             */
            fly: {

                set: function (value) {

                    this._fly = !!value;

                    /**
                     * Fired whenever this CameraFollow's
                     * {{#crossLink "CameraFollow/fly:property"}}{{/crossLink}} property changes.
                     *
                     * @event fly
                     * @param value The property's new value
                     */
                    this.fire("fly", this._fly);
                },

                get: function () {
                    return this._fly;
                }
            },

            /**
             * When true, will ensure that this CameraFollow always adjusts the distance between the {{#crossLink "CameraFollow/camera:property"}}
             * camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}}
             * positions so as to ensure that the {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}}
             * is always filling the view volume.
             *
             * When false, the eye will remain at its current distance from the look position.
             *
             * Fires a {{#crossLink "CameraFollow/fit:event"}}{{/crossLink}} event on change.
             *
             * @property fit
             * @type Boolean
             * @default true
             */
            fit: {

                set: function (value) {

                    this._cameraFlight.fit = value !== false;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CameraFollow's
                     * {{#crossLink "CameraFollow/fit:property"}}{{/crossLink}} property changes.
                     * @event fit
                     * @param value The property's new value
                     */
                    this.fire("fit", this._cameraFlight.fit);
                },

                get: function () {
                    return this._cameraFlight.fit;
                }
            },

            /**
             * When {{#crossLink "CameraFollow/fit:property"}}{{/crossLink}} is set, to fit the target
             * {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}} in view, this property indicates how much
             * of the total field-of-view, in degrees, that
             * the {{#crossLink "CameraFollow/worldBoundary:property"}}{{/crossLink}} should fill.
             *
             * Fires a {{#crossLink "CameraFlight/fitFOV:event"}}{{/crossLink}} event on change.
             *
             * @property fitFOV
             * @default 45
             * @type Number
             */
            fitFOV: {

                set: function (value) {

                    this._cameraFlight.fitFOV = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CameraFollow's
                     * {{#crossLink "CameraFollow/fitFOV:property"}}{{/crossLink}} property changes.
                     *
                     * @event fitFOV
                     * @param value The property's new value
                     */
                    this.fire("fitFOV", this._cameraFlight.fitFOV);
                },

                get: function () {
                    return this._cameraFlight.fitFOV;
                }
            },

            /**
             * When true, will cause this CameraFollow to point the {{#crossLink "CameraFollow/camera:property"}}{{/crossLink}}
             * in the direction that it is travelling.
             *
             * Fires a {{#crossLink "CameraFollow/trail:event"}}{{/crossLink}} event on change.
             *
             * @property trail
             * @type Boolean
             * @default false
             */
            trail: {

                set: function (value) {

                    this._cameraFlight.trail = value;

                    /**
                     * Fired whenever this CameraFollow's {{#crossLink "CameraFollow/trail:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event trail
                     * @param value The property's new value
                     */
                    this.fire("trail", this._cameraFlight.trail);
                },

                get: function () {
                    return this._cameraFlight.trail;
                }
            }
        },

        _getJSON: function () {

            var json = {
                fly: this._fly,
                fit: this._cameraFlight.fit,
                fitFOV: this._cameraFlight.fitFOV,
                trail: this._cameraFlight.trail
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            if (this._attached.worldBoundary) {
                json.worldBoundary = this._attached.worldBoundary.id;
            }

            return json;
        }
    });

})();
