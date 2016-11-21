/**
 A **CameraFollowAnimation** makes a {{#crossLink "Camera"}}{{/crossLink}} dynamically follow a
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} in order to keep it entirely in view.

 <a href="../../examples/#animation_CameraFollowAnimation"><img src="http://i.giphy.com/l0HlHcuzAjhMQ8YSY.gif"></img></a>

 ## Overview

 * Attaches to a {{#crossLink "Camera"}}{{/crossLink}}, which by default is the {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Camera"}}{{/crossLink}} when none is specified.
 * Requires that the {{#crossLink "Camera"}}{{/crossLink}} have a {{#crossLink "Lookat"}}{{/crossLink}} for its {{#crossLink "Camera/view:property"}}view{{/crossLink}} transform.
 * Also attaches to a {{#crossLink "Boundary3D"}}{{/crossLink}}, which by default will be the {{#crossLink "Scene"}}Scene's{{/crossLink}} World-space boundary, {{#crossLink "Scene/worldBoundary:property"}}{{/crossLink}}.
 * Can be configured to either fly or jump to each updated position of the target {{#crossLink "Boundary3D"}}{{/crossLink}}.
 * Can be configured to automatically adjust the distance between the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Lookat"}}{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} to keep the target {{#crossLink "Boundary3D"}}{{/crossLink}} fitted to the view volume.

 ## Examples

 * [Following an Entity with a Camera](../../examples/#animation_CameraFollowAnimation)
 * [Following an Entity with a Camera, keeping Entity fitted to view volume](../../examples/#animation_CameraFollowAnimation_fitToView)

 ## Usage

 In the example below, we'll use a CameraFollowAnimation to automatically follow an {{#crossLink "Entity"}}{{/crossLink}}'s World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} with the default {{#crossLink "Camera"}}{{/crossLink}}. Our CameraFollowAnimation's
 {{#crossLink "CameraFollowAnimation/fit:property"}}{{/crossLink}} property is set ````true````, which causes it to automatically
 keep the {{#crossLink "Boundary3D"}}{{/crossLink}} fitted to the view volume. Although we can orbit the
 {{#crossLink "Entity"}}{{/crossLink}} using the {{#crossLink "CameraControl"}}{{/crossLink}}, we you can't control the
 distance of the {{#crossLink "Camera"}}{{/crossLink}} from the {{#crossLink "Entity"}}{{/crossLink}} because our CameraFollowAnimation
 automatically controls that distance in order to do the automatic fitting.

 ````javascript
 // Create a red torus Entity with a Translate modelling transform
 // that allows it to move around in World-space
 var entity = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry(),
     material: new xeogl.PhongMaterial({
          diffuse: [1, 0.3, 0.3]
     }),
     transform: new xeogl.Translate({
         xyz: [0,0,0]
     })
 });

 // Create a CameraFollowAnimation that makes the (Scene's default) Camera's Lookat follow the Entity's World-space
 // Boundary3D, while keeping the Boundary3D fitted to the view volume. The CameraFollowAnimation
 // will jump to each updated Boundary3D extents, and since an update will occur on every frame,
 // the effect will be as if we're smoothly flying after the Boundary3D. If the updates occur sporadically,
 // then we would probably instead configure it to fly to each update, to keep the animation smooth.
 var cameraFollowAnimation = new xeogl.CameraFollowAnimation({
     worldBoundary: entity.worldBoundary,
     fit: true,   // Fit target to view volume
     fitFOV: 35,  // Target will occupy 35 degrees of the field-of-view
     fly: false // Jump to each updated boundary extents
 });

 // Create a SplineCurve along which we'll animate our Entity
 var curve = new xeogl.SplineCurve({
     points: [
         [-10, 0, 0],
         [-5, 15, 0],
         [20, 15, 0],
         [10, 0, 0]
     ]
 });

 // Bind the Entity Translate to a point on the SplineCurve
 curve.on("point", function(point) {
     entity.transform.xyz = point;
 });

 // Animate the point along the SplineCurve using the Scene clock
 curve.scene.on("tick", function(e) {
     curve.t = (e.time - e.startTime) * 0.01;
 });

 // Allow user control of the Camera with mouse and keyboard
 // (zooming will be overridden by the auto-fitting configured on our CameraFollowAnimation)
 new xeogl.CameraControl();
 ````

 @class CameraFollowAnimation
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CameraFollowAnimation within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {*} Optional map of user-defined metadata to attach to this CameraFollowAnimation.
 @param [cfg.camera] {Number|String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFollowAnimation. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.worldBoundary] {Number|String|Camera} ID or instance of a {{#crossLink "Boundary3D"}}Boundary3D{{/crossLink}} to follow.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFollowAnimation. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s World-space boundary, {{#crossLink "Scene/worldBoundary:property"}}worldBoundary{{/crossLink}}.
 @param [cfg.fly] {Boolean}  Indicates whether this CameraFollowAnimation will either fly or jump to each updated position of the
 target {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}}.
 @param [cfg.fit] {Boolean} When true, will ensure that this CameraFollowAnimation automatically adjusts the distance between the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Lookat"}}{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} to keep the target {{#crossLink "Boundary3D"}}{{/crossLink}} fitted to the view volume.
 @param [cfg.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}} should
 fill the canvas when fitting to view.
 @param [cfg.trail] {Boolean} When true, will cause this CameraFollowAnimation to point the {{#crossLink "CameraFollowAnimation/camera:property"}}{{/crossLink}} in the direction that it is travelling.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CameraFollowAnimation = xeogl.Component.extend({

        type: "xeogl.CameraFollowAnimation",

        _init: function (cfg) {

            this._cameraFlight = this.create({
                type: "xeogl.CameraFlightAnimation"
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
             * The {{#crossLink "Camera"}}{{/crossLink}} being controlled by this CameraFollowAnimation.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollowAnimation. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "CameraFollowAnimation/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    this._cameraFlight.camera = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CameraFollowAnimation's
                     * {{#crossLink "CameraFollowAnimation/camera:property"}}{{/crossLink}} property changes.
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
             * The World-space {{#crossLink "Boundary3D"}}{{/crossLink}} followed by this CameraFollowAnimation.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollowAnimation. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Scene/worldBoundary:property"}}{{/crossLink}}
             * when set to a null or undefined value.
             *
             * Fires a {{#crossLink "CameraFollowAnimation/worldBoundary:event"}}{{/crossLink}} event on change.
             *
             * @property worldBoundary
             * @type Boundary3D
             */
            worldBoundary: {

                set: function (value) {

                    /**
                     * Fired whenever this CameraFollowAnimation's {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}} property changes.
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
             * Indicates whether this CameraFollowAnimation will either fly or jump to each updated position of the
             * target {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}}.
             *
             * Leave this false if the worldBoundary updates continuously, otherwise leave it true
             * if you want the camera to fly smoothly to each updated worldBoundary extents
             * for a less disorientating experience.
             *
             * Fires a {{#crossLink "CameraFollowAnimation/fly:event"}}{{/crossLink}} event on change.
             *
             * @property fly
             * @type Boolean
             * @default false
             */
            fly: {

                set: function (value) {

                    this._fly = !!value;

                    /**
                     * Fired whenever this CameraFollowAnimation's
                     * {{#crossLink "CameraFollowAnimation/fly:property"}}{{/crossLink}} property changes.
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
             * When true, will ensure that this CameraFollowAnimation always adjusts the distance between the {{#crossLink "CameraFollowAnimation/camera:property"}}
             * camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}}
             * positions so as to ensure that the {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}}
             * is always filling the view volume.
             *
             * When false, the eye will remain at its current distance from the look position.
             *
             * Fires a {{#crossLink "CameraFollowAnimation/fit:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this CameraFollowAnimation's
                     * {{#crossLink "CameraFollowAnimation/fit:property"}}{{/crossLink}} property changes.
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
             * When {{#crossLink "CameraFollowAnimation/fit:property"}}{{/crossLink}} is set, to fit the target
             * {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}} in view, this property indicates how much
             * of the total field-of-view, in degrees, that
             * the {{#crossLink "CameraFollowAnimation/worldBoundary:property"}}{{/crossLink}} should fill.
             *
             * Fires a {{#crossLink "cameraFlightAnimation/fitFOV:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this CameraFollowAnimation's
                     * {{#crossLink "CameraFollowAnimation/fitFOV:property"}}{{/crossLink}} property changes.
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
             * When true, will cause this CameraFollowAnimation to point the {{#crossLink "CameraFollowAnimation/camera:property"}}{{/crossLink}}
             * in the direction that it is travelling.
             *
             * Fires a {{#crossLink "CameraFollowAnimation/trail:event"}}{{/crossLink}} event on change.
             *
             * @property trail
             * @type Boolean
             * @default false
             */
            trail: {

                set: function (value) {

                    this._cameraFlight.trail = value;

                    /**
                     * Fired whenever this CameraFollowAnimation's {{#crossLink "CameraFollowAnimation/trail:property"}}{{/crossLink}}
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
