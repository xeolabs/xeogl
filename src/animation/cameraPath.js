/**
 A **CameraPath** flies a {{#crossLink "Camera"}}{{/crossLink}} along a {{#crossLink "Curve"}}{{/crossLink}}.

 ## Usage

 In the example below we create an {{#crossLink "Entity"}}{{/crossLink}} and a {{#crossLink "Camera"}}{{/crossLink}},
 then we create a {{#crossLink "CameraPath"}}{{/crossLink}} that binds the {{#crossLink "Camera"}}{{/crossLink}} to a
 {{#crossLink "SplineCurve"}}{{/crossLink}}. Finally, we periodically update the position 't' on
 the {{#crossLink "SplineCurve"}}{{/crossLink}} within the {{#crossLink "Scene"}}{{/crossLink}}'s animation loop, which
 causes the {{#crossLink "Camera"}}{{/crossLink}} to move with that position along the {{#crossLink "SplineCurve"}}{{/crossLink}}.

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

 var spline = new XEO.SplineCurve({
     points: [
         [0, 0, 100],
         [10, 5, 60],
         [7, 2, 20],
         [2, -1, 10]
     ]
 });

 new XEO.CameraPath({
    camera: camera,
    path: spline
 });

 // Periodically update the position 't' on the SplineCurve, which causes the CameraPath
 // to interpolate the Camera to that position

 XEO.scene.on("tick", function(e) {
     var t = (e.time - e.startTime) * 0.01;
     spline.t = t;
 });
 ````

 @class CameraPath
 @module XEO
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraPath.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraPath. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.path] {String|Curve} ID or instance of a {{#crossLink "Curve"}}{{/crossLink}} to move along.
 @extends Component
 */
(function () {

    "use strict";

    XEO.CameraPath = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.CameraPath",

        _init: function (cfg) {

            this.freeRotate = cfg.freeRotate;
            this.camera = cfg.camera;
            this.path = cfg.path;
        },

        _props: {

            /**
             * Flag which indicates whether the viewing direction is free to move around.
             *
             * Fires a {{#crossLink "MouseRotateCamera/freeRotate:event"}}{{/crossLink}} event on change.
             *
             * @property freeRotate
             * @default false
             * @type Boolean
             */
            freeRotate: {

                set: function (value) {

                    value = !!value;

                    this._freeRotate = value;

                    /**
                     * Fired whenever this MouseRotateCamera's {{#crossLink "MouseRotateCamera/freeRotate:property"}}{{/crossLink}} property changes.
                     * @event freeRotate
                     * @param value The property's new value
                     */
                    this.fire('freeRotate', this._freeRotate);
                },

                get: function () {
                    return this._freeRotate;
                }
            },

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
                    this._setChild("XEO.Camera", "camera", value);

                    this._update();
                },

                get: function () {
                    return this._children.camera;
                }
            },

            /**
             * The Curve for this CameraPath.
             *
             * Fires a {{#crossLink "CameraPath/path:event"}}{{/crossLink}} event on change.
             *
             * @property path
             * @type {Path}
             */
            path: {

                set: function (value) {

                    // Unsubscribe from old Curves's events

                    var oldPath = this._children.path;

                    if (oldPath && (!value || (value.id !== undefined ? value.id : value) !== oldPath.id)) {
                        oldPath.off(this._onPathT);
                    }

                    /**
                     * Fired whenever this CameraPaths's {{#crossLink "CameraPath/path:property"}}{{/crossLink}} property changes.
                     * @event path
                     * @param value The property's new value
                     */
                    this._setChild("XEO.Path", "path", value);

                    var newPath = this._children.path;

                    if (newPath) {

                        // Subscribe to new Path's events

                        this._onPathT = newPath.on("t", this._update, this);
                    }
                },

                get: function () {
                    return this._children.path;
                }
            }
        },

        _update: function () {

            var camera = this._children.camera;
            var path = this._children.path;

            if (!camera || !path) {
                return;
            }

            var point = path.point;
            var tangent = path.tangent;

            var view = camera.view;

            view.eye = point;

            if (!this._freeRotate) {
                view.look = [point[0] + tangent[0], point[1] + tangent[1], point[2] + tangent[2]];
            }
        },

        _getJSON: function () {

            var json = {
                freeRotate: this._freeRotate
            };

            if (this._children.camera) {
                json.camera = this._children.camera.id;
            }

            if (this._children.path) {
                json.path = this._children.path.id;
            }

            return json;
        },

        _destroy: function () {
            if (this._children.path) {
                this._children.path.off(this._onPathT);
            }
        }
    });

})();
