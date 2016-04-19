/**
 A **CardboardWrapAround** handles device orientation events and causes a Camera's eye position to orbit about its point-of-interest.

 ## Usage

 Stereo view of an Entity with CardboardWrapAround control:

 ````javascript
 new XEO.Entity({
     geometry: new XEO.BoxGeometry()
 });

 new Stereo();

 new XEO.CardboardWrapAround();
 ````

 Stereo view of an Entity with CardboardWrapAround control, using custom Camera and Viewport:

 ````javascript
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

 var viewport = new XEO.Viewport();

 var entity = new XEO.Entity({
     camera: camera,
     viewport: viewport,
     geometry: new XEO.BoxGeometry()
 });

 new XEO.Stereo({
     camera: camera,
     viewport: viewport
 });

 new XEO.CardboardWrapAround({
     camera: camera,
     active: true // Default
 });
 ````

 @class CardboardWrapAround
 @module XEO
 @submodule interaction
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CardboardWrapAround in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CardboardWrapAround.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this CardboardWrapAround.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CardboardWrapAround. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this CardboardWrapAround is active.
 @extends CameraController
 */
(function () {

    "use strict";

    XEO.CardboardWrapAround = XEO.CameraController.extend({

        type: "XEO.CardboardWrapAround",

        _init: function (cfg) {

            this._super(cfg);

            var input = this.scene.input;

            var autoAlign = true;

            var onOrientationChange;
            var onDeviceOrientation;

            var orientation;
            var orientationAngle;

            var math = XEO.math;
            var euler = math.vec3();
            var tempVec3a = math.vec3();
            var tempVec3b = math.vec3();

            var reflectQuaternion = math.identityQuaternion();
            reflectQuaternion[0] = -Math.sqrt(0.5);
            reflectQuaternion[3] = Math.sqrt(0.5);

            var quaternion = math.identityQuaternion();
            var orientQuaternion = math.identityQuaternion();
            var alignQuaternion = math.identityQuaternion();
            var orientMatrix = math.mat4();

            var self = this;

            // ---------- TESTING -----------------------------------

            var debug = false;

            if (debug) {

                var alpha = 0;
                var beta = 90;
                var gamma = 0;

                window.alphaInc = 0;
                window.betaInc = 0;
                window.gammaInc = 0;

                this.scene.on("tick", function () {
                    self.scene.input.fire("deviceorientation", {
                        alpha: alpha += window.alphaInc, // Z
                        beta: beta += window.betaInc, // X
                        gamma: gamma += window.gammaInc // Y
                    });
                });
            }

            // ------------------------------------------------------

            self.on("active",
                function (active) {
                    if (active) {

                        onOrientationChange = input.on("orientationchange",
                            function (e) {

                                orientation = e.orientation;
                                orientationAngle = e.orientationAngle;
                            });

                        onDeviceOrientation = input.on("deviceorientation",
                            function (e) {

                                var lookat = self.camera.view;

                                var alpha = e.gamma ? math.DEGTORAD * e.alpha : 0; // Z
                                var beta = e.beta ? math.DEGTORAD * e.beta : 0; // X'
                                var gamma = e.gamma ? math.DEGTORAD * e.gamma : 0; // Y'
                                var orient = orientationAngle ? math.DEGTORAD * orientationAngle : 0;

                                euler[0] = beta;
                                euler[1] = alpha;
                                euler[2] = -gamma;

                                math.eulerToQuaternion(euler, "YXZ", quaternion);
                                math.mulQuaternions(quaternion, reflectQuaternion, quaternion);
                                math.angleAxisToQuaternion(0, 0, 1, -orient, orientQuaternion);
                                math.mulQuaternions(quaternion, orientQuaternion, quaternion);
                                math.mulQuaternions(alignQuaternion, quaternion, quaternion);
                                math.quaternionToMat4(quaternion, orientMatrix);

                                // Rotate Camera look about eye using the matrix

                                // Eye

                                tempVec3a[0] = 0;
                                tempVec3a[1] = 0;
                                tempVec3a[2] = Math.abs(math.lenVec3(math.subVec3(lookat.eye, lookat.look, tempVec3b)));

                                lookat.eye = math.addVec3(math.transformVec3(orientMatrix, tempVec3a, tempVec3a), lookat.look);

                                // Up

                                tempVec3a[0] = 0;
                                tempVec3a[1] = 1;
                                tempVec3a[2] = 0;

                                lookat.up = math.transformVec3(orientMatrix, tempVec3a, tempVec3a);

                                if (self.autoForward) {

                                }

                                if (this.autoAlign && alpha !== 0) {
                                    autoAlign = false;
                                    self._align();
                                }
                            });

                    } else {

                        input.off(onOrientationChange);
                        input.off(onDeviceOrientation);
                    }
                });
        },

        _align: function() {

        }
    });
})();
