/**
 A **CameraPath** defines spline curve along which a {{#crossLink "Camera"}}{{/crossLink}} can be animated.

 * See {{#crossLink "CameraPathAnimation"}}{{/crossLink}} for usage.

 @class CameraPath
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraPath.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraPath. Defaults to the
 parent {{#crossLink "Scene"}}{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.eyeCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} property along.
 @param [cfg.lookCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/look:property"}}Camera's look{{/crossLink}} property along.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CameraPath = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.CameraPath",

        _init: function (cfg) {

            this._frames = [];

            this._eyeCurve = this.create(xeogl.SplineCurve);
            this._lookCurve = this.create(xeogl.SplineCurve);
            this._upCurve = this.create(xeogl.SplineCurve);

            if (cfg.frames) {
                this.addFrames(cfg.frames);
            }
        },

        _props: {

            /**
             The frames set on the constructor and added with {{#crossLink "CameraPath/addFrame:method"}}{{/crossLink}}.

             @property frames
             @type {[]}
             @final
             */
            frames: {

                get: function () {
                    return this._frames;
                }
            },

            /**
             The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
             {{#crossLink "Camera/property:eye"}}Camera's eye position{{/crossLink}} travels.

             This property is read-only and is internally created and destroyed by this CameraPath.

             @property eyeCurve
             @type {SplineCurve}
             @final
             */
            eyeCurve: {

                get: function () {
                    return this._eyeCurve;
                }
            },

            /**
             The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
             {{#crossLink "Camera/property:eye"}}Camera's look position{{/crossLink}} travels.

             This property is read-only and is internally created and destroyed by this CameraPath.

             @property lookCurve
             @type {SplineCurve}
             @final
             */
            lookCurve: {

                get: function () {
                    return this._lookCurve;
                }
            },

            /**
             The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
             {{#crossLink "Camera/property:up"}}Camera's up vector{{/crossLink}} travels.

             This property is read-only and is internally created and destroyed by this CameraPath.

             @property upCurve
             @type {SplineCurve}
             @final
             */
            upCurve: {

                get: function () {
                    return this._upCurve;
                }
            }
        },

        /**
         Adds a frame to this CameraPath, given as the current position of a {{#crossLink "Camera"}}{{/crossLink}}.

         The {{#crossLink "Camera/property:view"}}Camera's view transform{{/crossLink}} must be a {{#crossLink "Lookat"}}{{/crossLink}}.

         @param {Number} t Time instant for the new frame.
         @param {Camera} camera The {{#crossLink "Camera"}}{{/crossLink}}.
         */
        saveFrame: function (t, camera) {

            var view = camera.view;

            if (!view) {
                this.error("Camera has no view transform component - can't save frame.");
                return;
            }

            if (!view.isType("xeogl.Lookat")) {
                this.error("Camera's view transform is not a Lookat - can't save frame.");
                return;
            }

            var lookat = view;

            this.addFrame(t, lookat.eye, lookat.look, lookat.up);
        },

        /**
         Adds a frame to this CameraPath, specified as values for eye, look and up vectors at a given time instant.

         @param {Number} t Time instant for the new frame;
         @param {Float32Array} eye A three-element vector specifying the eye position for the new frame.
         @param {Float32Array} look A three-element vector specifying the look position for the new frame.
         @param {Float32Array} up A three-element vector specifying the up vector for the new frame.
         */
        addFrame: function (t, eye, look, up) {
            var frame = {
                t: t,
                eye: eye.slice(0),
                look: look.slice(0),
                up: up.slice(0)
            };
            this._frames.push(frame);
            this._eyeCurve.points.push(frame.eye);
            this._lookCurve.points.push(frame.look);
            this._upCurve.points.push(frame.up);
        },

        /**
         Adds multiple frames to this CameraPath, each frame specified as a set of values for eye, look and up
         vectors at a given time instant.

         @param {Array} frames An array of frames.
         */
        addFrames: function (frames) {
            var frame;
            for (var i = 0, len = frames.length; i < len; i++) {
                frame = frames[i];
                this.addFrame(frame.t || 0, frame.eye, frame.look, frame.up);
            }
        },

        /**
         Sets the position of a {{#crossLink "Camera"}}{{/crossLink}} to a position interpolated within this CameraPath
         at the given time instant.

         @param {Number} t Time instant.
         @param {Camera} camera The {{#crossLink "Camera"}}{{/crossLink}} to update.
         */
        loadFrame: (function () {

            var vec = xeogl.math.vec3();

            return function (t, camera) {

                var view = camera.view;

                if (!view) {
                    this.error("Camera has no view transform component - can't save frame.");
                    return;
                }

                if (!view.isType("xeogl.Lookat")) {
                    this.error("Camera's view transform is not a Lookat - can't save frame.");
                    return;
                }

                t = t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t);

                view.eye = this._eyeCurve.getPoint(t, vec);
                view.look = this._lookCurve.getPoint(t, vec);
                view.up = this._upCurve.getPoint(t, vec);
            };
        })(),

        /**
         Removes all frames from this CameraPath.
         */
        clearFrames: function () {
            this._frames = [];
            this._eyeCurve.points = [];
            this._lookCurve.points = [];
            this._upCurve.points = [];
        },

        _getJSON: function () {

            var json = {
                frames: []            };

            var eyePoints = this._eyeCurve.points;
            var lookPoints = this._lookCurve.points;
            var upPoints = this._upCurve.points;

            for (var i = 0, len = eyePoints.length; i < len; i++) {
                json.frames.push({
                    eye: eyePoints[i],
                    look: lookPoints[i],
                    up: upPoints[i]
                });
            }

            return json;
        }
    });
})();