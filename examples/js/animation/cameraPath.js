/**
 A **CameraPath** flies a {{#crossLink "Camera"}}{{/crossLink}} along a spline curve.

 ## Usage

 In the example below we create an {{#crossLink "Entity"}}{{/crossLink}} and a {{#crossLink "Camera"}}{{/crossLink}},
 then we create a {{#crossLink "CameraPath"}}{{/crossLink}} that binds the {{#crossLink "Camera"}}{{/crossLink}} to a
 {{#crossLink "SplineCurve"}}{{/crossLink}}. Finally, we periodically update the position 't' on
 the {{#crossLink "SplineCurve"}}{{/crossLink}} within the {{#crossLink "Scene"}}{{/crossLink}}'s animation loop, which
 causes the {{#crossLink "Camera"}}{{/crossLink}} to move with that position along the {{#crossLink "SplineCurve"}}{{/crossLink}}.

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

 var spline = new xeogl.SplineCurve({
     points: [
         [0, 0, 100],
         [10, 5, 60],
         [7, 2, 20],
         [2, -1, 10]
     ]
 });

 new xeogl.CameraPath({
    camera: camera,
    SplineCurve: spline
 });

 // Periodically update the position 't' on the SplineCurve, which causes the CameraPath
 // to interpolate the Camera to that position

 xeogl.scene.on("tick", function(e) {
     var t = (e.time - e.startTime) * 0.01;
     spline.t = t;
 });
 ````

 @class CameraPath
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraPath.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraPath. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
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

            this.camera = cfg.camera;

            this.frames = [];

            this._eyeCurve = this.create(xeogl.SplineCurve);
            this._lookCurve = this.create(xeogl.SplineCurve);
            this._upCurve = this.create(xeogl.SplineCurve);

            if (cfg.frames) {
                this.addFrames(cfg.frames);
            }

            this.t = cfg.t;
        },

        _props: {


            /**
             * The Camera for this CameraPath.
             *
             * When set to a null or undefined value, will default to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
             * default {{#crossLink "Scene/camera:property"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "CameraPath/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this CameraPaths's {{#crossLink "CameraPath/camera:property"}}{{/crossLink}} property changes.
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
             The current progress along this CameraPath. This value will will be clamped to range [0..1].

             @property t
             @default 0
             @type Number
             */
            t: {

                set: function (value) {

                    var camera = this._attached.camera;
                    if (!camera) {
                        return;
                    }

                    value = value || 0;

                    this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);

                    if (this._eyeCurve.points.length < 2) {

                    }

                    this._eyeCurve.t = this._t;
                    this._lookCurve.t = this._t;
                    this._upCurve.t = this._t;

                    var lookat = camera.view;

                    lookat.eye = this._eyeCurve.point;
                    lookat.look = this._lookCurve.point;
                    lookat.up = this._upCurve.point;
                },

                get: function () {
                    return this._t;
                }
            }
        },

        /**
         *
         */
        recordFrame: function (t) {

            var camera = this._attached.camera;
            if (!camera) {
                this.error("CameraPath has no Camera - can't append frame.");
                return;
            }

            var view = this.camera.view;
            if (!view) {
                this.error("Camera has no view transform component - can't append frame.");
                return;
            }

            if (!view.isType("xeogl.Lookat")) {
                this.error("Camera's view transform is not a Lookat - can't append frame.");
                return;
            }

            var lookat = view;

            this.addFrame(t, lookat.eye, lookat.look, lookat.up);
        },

        /**
         *
         * @param frames
         */
        addFrames: function (frames) {
            var frame;
            for (var i = 0, len = frames.length; i < len; i++) {
                frame = frames[i];
                this.addFrame(frame.t || 0, frame.eye, frame.look, frame.up);
            }
        },

        /**
         *
         * @param t
         * @param eye
         * @param look
         * @param up
         */
        addFrame: function (t, eye, look, up) {
            var frame = {
                t: t,
                eye: eye.slice(0),
                look: look.slice(0),
                up: up.slice(0)
            };
            this.frames.push(frame);
            this._eyeCurve.points.push(eye.slice(0));
            this._lookCurve.points.push(look.slice(0));
            this._upCurve.points.push(up.slice(0));
        },

        /**
         *
         */
        clearFrames: function () {
            this.frames = [];
            this._eyeCurve.points = [];
            this._lookCurve.points = [];
            this._upCurve.points = [];
        },

        /**
         *
         * @param frame
         */
        getFrameT: function (frame) {
            return this._tFrames[frame];
        },

        getTFrame: function(t) {

        },

        _getJSON: function () {

            var json = {
                frames: [],
                t: this._t
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            var tFrames = this._tFrames;
            var eyePoints = this._eyeCurve.points;
            var lookPoints = this._lookCurve.points;
            var upPoints = this._upCurve.points;

            for (var i = 0, len = eyePoints.length; i < len; i++) {
                json.frames.push({
                    t: tFrames[i],
                    eye: eyePoints[i],
                    look: lookPoints[i],
                    up: upPoints[i]
                });
            }

            return json;
        }
    });

})();
