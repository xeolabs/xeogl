/**
 A **CardboardEffect** sets up a stereo view for its {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <a href="../../examples/#effects_CardboardEffect"><img src="../../assets/images/screenshots/CardboardEffect.png"></img></a>

 ## Overview

 * Work-in-progress
 * Uses asymmetric frustum technique described in [this article by Paul Bourke](http://paulbourke.net/stereographics/stereorender/).

 <img src="../../../assets/images/CardboardEffect.png"></img>

 ## Examples

 * [Stereo view using a CardboardEffect](../../examples/#effects_CardboardEffect)

 ## Usage

 ````javascript
 var entity = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 var CardboardEffect = new xeogl.CardboardEffect({
     fov: 45, // Default
     active: true // Default
 });
 ````

 ````javascript
 var CardboardEffect = new xeogl.CardboardEffect({
     fov: 45, // Default
     active: true // Default
 });
 ````

 @class CardboardEffect
 @module xeogl
 @submodule effects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CardboardEffect in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CardboardEffect.
 @param [cfg.fov=45] fov angle in degrees.
 @param [cfg.active=true] {Boolean} Whether or not this CardboardEffect is active.
 @extends Entity
 */
(function () {

    "use strict";

    xeogl.CardboardEffect = xeogl.Component.extend({

        type: "xeogl.CardboardEffect",

        _init: function (cfg) {
            this.viewport = cfg.viewport;
            this.fov = cfg.fov;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * fov angle in degrees.
             *
             * Fires an {{#crossLink "CardboardEffect/fov:event"}}{{/crossLink}} event on change.
             *
             * @property fov
             * @type Number
             * @default 45
             */
            fov: {

                set: function (value) {

                    value = value || 45;

                    if (this._fov === value) {
                        return;
                    }

                    this._fov = value;

                    /**
                     * Fired whenever this CardboardEffect's {{#crossLink "CardboardEffect/fov:property"}}{{/crossLink}} property changes.
                     * @event fov
                     * @param value The property's new value
                     */
                    this.fire('fov', this._fov);
                },

                get: function () {
                    return this._fov;
                }
            },

            /**
             * Flag which indicates whether this CardboardEffect is active or not.
             *
             * Fires an {{#crossLink "CardboardEffect/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;

                    this._active ? this._activate() : this._deactivate();

                    /**
                     * Fired whenever this CardboardEffect's {{#crossLink "CardboardEffect/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _activate: function () {

            var scene = this.scene;

            // Configure Scene to render twice for each frame
            // and only clear the frame before the first pass

            scene.passes = 2;
            scene.clearEachPass = false;

            var math = xeogl.math;
            var eye = math.vec3();
            var look = math.vec3();
            var eyeLook = math.vec3();
            var up = math.vec3();
            var eyeVec = math.vec3();
            var sepVec = math.vec3();
            var leftEye = math.vec3();
            var leftLook = math.vec3();
            var rightEye = math.vec3();
            var rightLook = math.vec3();

            // Intercept Scene before each render

            var self = this;

            this._onSceneRendering = scene.on("rendering", function (e) {

                // We'll rely on the Scene's Default Camera and Viewport
                // but we need to replace the Camera's projection with Frustum

                var camera = self._attached.camera;
                if (!camera) {
                    self.error("Can't activate: no xeogl.Camera attached");
                    return;
                }

                var viewport = self._attached.viewport;
                if (!viewport) {
                    self.error("Can't activate: no xeogl.Viewport attached");
                    return;
                }

                viewport.autoBoundary = false;


                var frustum = camera.frustum;
                var canvas = scene.canvas;
                var focalLength = -Math.abs(math.lenVec3(math.subVec3(camera.look, camera.eye, eyeLook)));
                var eyeSep = (1 / 30) * focalLength;
                var near = 0.1;
                var DTOR = 0.0174532925;
                var radians = DTOR * self._fov / 2;
                var wd2 = near * Math.tan(radians);
                var ndfl = near / focalLength;
                var canvasBoundary = canvas.boundary;
                var canvasWidth = canvasBoundary[2];
                var canvasHeight = canvasBoundary[3];
                var halfCanvasWidth = Math.round(canvasWidth / 2);
                var halfCanvasHeight = Math.round(canvasHeight / 2);
                var canvasAspectRatio = canvasWidth / canvasHeight;

                switch (e.pass) {

                    case 0:

                        eye.set(camera.eye);
                        look.set(camera.look);
                        up.set(camera.up);

                        math.subVec3(look, eye, eyeVec);
                        math.cross3Vec3(up, eyeVec, sepVec);
                        math.normalizeVec3(sepVec);
                        math.mulVec3Scalar(sepVec, eyeSep / 2.0);

                        // Find left and right viewpoints

                        math.subVec3(eye, sepVec, leftEye);
                        math.subVec3(look, sepVec, leftLook);

                        math.addVec3(eye, sepVec, rightEye);
                        math.addVec3(look, sepVec, rightLook);

                        // Set view transform to left side

                        camera.eye = leftEye;
                        camera.look = leftLook;

                        // Set projection frustum to left half of view space

                        frustum.left = -canvasAspectRatio * wd2 - 0.5 * eyeSep * ndfl;
                        frustum.right = canvasAspectRatio * wd2 - 0.5 * eyeSep * ndfl;
                        frustum.top = wd2 * 2;
                        frustum.bottom = -wd2 * 2;

                        // Set viewport to left half of canvas

                        viewport.boundary = [0, 0, halfCanvasWidth, canvasHeight];

                        break;

                    case 1:

                        // Set view transform to right side

                        camera.eye = rightEye;
                        camera.look = rightLook;

                        // Set projection frustum to left half of view space

                        frustum.left = -canvasAspectRatio * wd2 + 0.5 * eyeSep * ndfl;
                        frustum.right = canvasAspectRatio * wd2 + 0.5 * eyeSep * ndfl;
                        frustum.top = wd2 * 2;
                        frustum.bottom = -wd2 * 2;

                        // Set viewport to right half of canvas

                        viewport.boundary = [halfCanvasWidth, 0, halfCanvasWidth, canvasHeight];

                        break;
                }
            });

            // Intercept Scene after each render
            // After the second pass we'll restore the thispoint

            this._onSceneRendered = scene.on("rendered", function (e) {

                var camera = self._attached.camera;
                if (!camera) {
                    return;
                }


                switch (e.pass) {
                    case 1:
                        camera.eye = eye;
                        camera.look = look;
                        camera.up = up;
                        break;
                }
            });

            var input = this.scene.input;
            var orientation;
            var orientationAngle;
            var euler = math.vec3();
            var tempVec3a = math.vec3();
            var tempVec3b = math.vec3();
            var tempVec3c = math.vec3();
            var tempVec3d = math.vec3();
            var tempVec3e = math.vec3();
            var reflectQuaternion = math.identityQuaternion();
            reflectQuaternion[0] = -Math.sqrt(0.5);
            reflectQuaternion[3] = Math.sqrt(0.5);
            var quaternion = math.identityQuaternion();
            var orientQuaternion = math.identityQuaternion();
            var alignQuaternion = math.identityQuaternion();
            var orientMatrix = math.mat4();

            this._onOrientationChanged = input.on("orientationchanged", function (e) {
                orientation = e.orientation;
                orientationAngle = e.orientationAngle;
            });

            this._onDeviceOrientation = input.on("deviceorientation", function (e) {
                var camera = self._attached.camera;
                if (!camera) {
                    return;
                }

                var alpha = e.alpha ? math.DEGTORAD * e.alpha : 0; // Z
                var beta = e.beta ? math.DEGTORAD * e.beta : 0; // X'
                var gamma = e.gamma ? math.DEGTORAD * e.gamma : 0; // Y'
                var orient = math.DEGTORAD * window.orientation;


                euler[0] = beta;
                euler[1] = alpha;
                euler[2] = -gamma;

                math.eulerToQuaternion(euler, "YXZ", quaternion);
                math.mulQuaternions(quaternion, reflectQuaternion, quaternion);
                math.angleAxisToQuaternion(0, 0, 1, -orient, orientQuaternion);
                math.mulQuaternions(quaternion, orientQuaternion, quaternion);
                math.mulQuaternions(quaternion, alignQuaternion, quaternion);
                math.quaternionToMat4(quaternion, orientMatrix);

                var eye = camera.eye;
                var look = camera.look;

                var lenEyeLook = -Math.abs(math.lenVec3(math.subVec3(look, eye, tempVec3c)));

                tempVec3d[0] = 0;
                tempVec3d[1] = 0;
                tempVec3d[2] = lenEyeLook;

                look = math.addVec3(math.transformVec3(orientMatrix, tempVec3d, tempVec3d), eye);

                // Up

                tempVec3e[0] = 0;
                tempVec3e[1] = 1;
                tempVec3e[2] = 0;

                var up = math.transformVec3(orientMatrix, tempVec3e, tempVec3e);

                camera.look = look;
                camera.up = up;
            });
        },

        _deactivate: function () {

            var scene = this.scene;
            scene.passes = 1; // Don't need to restore scene.clearEachPass
            scene.off(this._onSceneRendering);
            scene.off(this._onSceneRendered);

            var input = scene.input;
            input.off(this._onOrientationChanged);
            input.off(this._onDeviceOrientation);
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();
