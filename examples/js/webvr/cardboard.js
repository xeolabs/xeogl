/**
 A **Cardboard** sets up a Google Cardboard effect for its Scene.

 ## Examples

 <ul>
 <li>[Cardboard cube](../../examples/webvr_cardboard_cube.html)</li>
 <li>[Cardboard with glTF gearbox model](../../examples/webvr_cardboard_gearbox.html)</li>
 </ul>

 ## Usage

 In the following example we're going to set up a Cardboard-viewable scene with xeoEngine, creating the scene incrementally to
 emphasize the plug-and-play design of xeoEngine's API.

 First we'll create a simple torus-shaped {{#crossLink "Entity"}}{{/crossLink}}, which will be within xeoEngine's default
 {{#crossLink "Scene"}}{{/crossLink}}, since we're not defining the {{#crossLink "Scene"}}{{/crossLink}} component
 explicitly. Our {{#crossLink "Entity"}}{{/crossLink}} is also implicitly connected to the
 {{#crossLink "Scene"}}{{/crossLink}}'s default {{#crossLink "Camera"}}{{/crossLink}}, since we didn't explicitly create
 a {{#crossLink "Camera"}}{{/crossLink}} for it either.

 ````javascript
 var entity = new XEO.Entity({
     geometry: new XEO.TorusGeometry(),
     material: new XEO.PhongMaterial({
        diffuseMap: new XEO.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 At this point we've got a textured torus floating in the middle of the canvas (which is also created automatically
 since we didn't specify one).

 Let's view it on Cardboard by dropping a Cardboard component into our default {{#crossLink "Scene"}}{{/crossLink}}:

 ````javascript
 var cardboard = new Cardboard();
 ````

 The Cardboard component immediately activates, so at this point we'll have a stereo
 view of the torus, which we can view with Cardboard glasses.

 At any point we can always disable the Cardboard effect to switch between normal WebGL mono viewing mode:

 ````javascript
 cardboard.active = false; // Back to normal mono viewing..
 cardboard.active = true; // ..and then back to Cardboard stereo mode.
 ````

 @class Cardboard
 @module XEO
 @submodule webvr
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Cardboard component in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Cardboard component.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this Cardboard component.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Cardboard component. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.viewport] {String|Viewport} ID or instance of a {{#crossLink "Viewport"}}Viewport{{/crossLink}} for this Cardboard component.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Cardboard component. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/viewport:property"}}viewport{{/crossLink}}.
 @param [cfg.eyeSep=0.2] Number Eye separation distance.
 @param [cfg.focalLength=20] Focal length.
 @param [cfg.aperture=45] Aperture angle in degrees.
 @param [cfg.active=true] {Boolean} Whether or not this Cardboard component is active.
 @extends Entity
 */
(function () {

    "use strict";

    XEO.Cardboard = XEO.Entity.extend({

        type: "XEO.Cardboard",

        _init: function (cfg) {

            if (!window.OrientationChangeEvent) {
                this.warn("Browser event not supported: orientationchange");
            }

            if (!window.DeviceMotionEvent) {
                this.warn("Browser event not supported: devicemotion");
            }

            if (!window.DeviceOrientationEvent) {
                this.warn("Browser event not supported: deviceorientation");
            }

            this.camera = cfg.camera;
            this.viewport = cfg.viewport;
            this.eyeSep = cfg.eyeSep;
            this.focalLength = cfg.focalLength;
            this.aperture = cfg.aperture;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} attached to this Cardboard component.
             *
             * This Cardboard component will attach a {{#crossLink "Frustum"}}{{/crossLink}} to its
             * {{#crossLink "Camera"}}{{/crossLink}} if the {{#crossLink "Camera"}}Camera{{/crossLink}} does not have
             * one already, replacing the projection transform component that was already attached.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Cardboard. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this Cardboard's {{#crossLink "Cardboard/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    var camera = this._attach({
                        name: "camera",
                        type: "XEO.Camera",
                        component: value,
                        sceneDefault: true,
                        //onAdded: this._transformUpdated,
                        onAddedScope: this
                    });

                    // Ensure that Camera has a Frustum projection

                    if (camera.project.type !== "XEO.Frustum") {
                        this.warn("Replacing camera's projection with a XEO.Frustum (needed for stereo)");
                        camera.project = camera.project.create(XEO.Frustum);
                    }
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The {{#crossLink "Viewport"}}{{/crossLink}} attached to this Cardboard.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Cardboard. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/viewport:property"}}Viewport{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property Viewport
             * @type Viewport
             */
            viewport: {

                set: function (value) {

                    /**
                     * Fired whenever this Cardboard's {{#crossLink "Cardboard/Viewport:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event Viewport
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "viewport",
                        type: "XEO.Viewport",
                        component: value,
                        sceneDefault: true,
                        //onAdded: this._transformUpdated,
                        onAddedScope: this
                    });
                },

                get: function () {
                    return this._attached.viewport;
                }
            },

            /**
             * Eye separation distance.
             *
             * Fires an {{#crossLink "Cardboard/eyeSep:event"}}{{/crossLink}} event on change.
             *
             * @property eyeSep
             * @type Number
             * @default 0.2
             */
            eyeSep: {

                set: function (value) {

                    value = value || 0.2;

                    if (this._eyeSep === value) {
                        return;
                    }

                    this._eyeSep = value;

                    /**
                     * Fired whenever this Cardboard's {{#crossLink "Cardboard/eyeSep:property"}}{{/crossLink}} property changes.
                     * @event eyeSep
                     * @param value The property's new value
                     */
                    this.fire('eyeSep', this._eyeSep);
                },

                get: function () {
                    return this._eyeSep;
                }
            },

            /**
             * Focal length.
             *
             * Fires an {{#crossLink "Cardboard/focalLength:event"}}{{/crossLink}} event on change.
             *
             * @property focalLength
             * @type Number
             * @default 20
             */
            focalLength: {

                set: function (value) {

                    value = value || 20;

                    if (this._focalLength === value) {
                        return;
                    }

                    this._focalLength = value;

                    /**
                     * Fired whenever this Cardboard's {{#crossLink "Cardboard/focalLength:property"}}{{/crossLink}} property changes.
                     * @event focalLength
                     * @param value The property's new value
                     */
                    this.fire('focalLength', this._focalLength);
                },

                get: function () {
                    return this._focalLength;
                }
            },

            /**
             * Aperture angle in degrees.
             *
             * Fires an {{#crossLink "Cardboard/aperture:event"}}{{/crossLink}} event on change.
             *
             * @property aperture
             * @type Number
             * @default 45
             */
            aperture: {

                set: function (value) {

                    value = value || 45;

                    if (this._aperture === value) {
                        return;
                    }

                    this._aperture = value;

                    /**
                     * Fired whenever this Cardboard's {{#crossLink "Cardboard/aperture:property"}}{{/crossLink}} property changes.
                     * @event aperture
                     * @param value The property's new value
                     */
                    this.fire('aperture', this._aperture);
                },

                get: function () {
                    return this._aperture;
                }
            },

            /**
             * Flag which indicates whether this Cardboard component is active or not.
             *
             * Fires an {{#crossLink "Cardboard/active:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Cardboard component's {{#crossLink "Cardboard/active:property"}}{{/crossLink}} property changes.
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

            //--------------------------------------------------------------------------
            // Configure Scene to render twice for each frame
            // and only clear the frame before the first pass
            //--------------------------------------------------------------------------

            scene.passes = 2;
            scene.clearEachPass = false;

            var canvasBoundary;

            var eye;
            var look;
            var up;

            var math = XEO.math;
            var eyeVec = math.vec3();
            var sepVec = math.vec3();
            var leftEye = math.vec3();
            var leftLook = math.vec3();
            var rightEye = math.vec3();
            var rightLook = math.vec3();

            //--------------------------------------------------------------------------
            // Intercept Scene before each render
            //--------------------------------------------------------------------------

            var self = this;

            this._onSceneRendering = scene.on("rendering", function (e) {

                // We'll rely on the Scene's Default Camera and Viewport
                // but we need to replace the Camera's projection with Frustum

                var camera = self._attached.camera;
                if (!camera) {
                    self.error("Can't activate: no XEO.Camera attached");
                    return;
                }

                var viewport = self._attached.viewport;
                if (!viewport) {
                    self.error("Can't activate: no XEO.Viewport attached");
                    return;
                }

                var view = camera.view;

                var frustum = camera.project; // Need to replace the Camera's projection with Frustum

                viewport.autoBoundary = false;

                var canvas = scene.canvas;

                var eyeSep = self._eyeSep;
                var near = 0.1;
                var DTOR = 0.0174532925;
                var radians = DTOR * self._aperture / 2;
                var wd2 = near * Math.tan(radians);
                var ndfl = near / self._focalLength;

                canvasBoundary = canvas.boundary;

                var canvasWidth = canvasBoundary[2];
                var canvasHeight = canvasBoundary[3];
                var halfCanvasWidth = Math.round(canvasWidth / 2);
                var halfCanvasHeight = Math.round(canvasHeight / 2);
                var canvasAspectRatio = canvasWidth / canvasHeight;

                switch (e.pass) {

                    case 0:

                        eye = view.eye.slice();
                        look = view.look.slice();
                        up = view.up.slice();

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

                        view.eye = leftEye;
                        view.look = leftLook;

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

                        view.eye = rightEye;
                        view.look = rightLook;

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

            //--------------------------------------------------------------------------
            // Restore basis lookat after second pass
            //--------------------------------------------------------------------------

            self._onSceneRendered = scene.on("rendered", function (e) {

                var camera = self._attached.camera;
                if (!camera) {
                    return;
                }
                var view = camera.view;

                switch (e.pass) {
                    case 1:

                        view.eye = eye;
                        view.look = look;
                        view.up = up;

                        break;
                }
            });

            //--------------------------------------------------------------------------
            // Wire up device events to the Camera's Lookat
            //--------------------------------------------------------------------------

            var orientation;
            var orientationAngle;

            var orientationAngleLookup = {
                'landscape-primary': 90,
                'landscape-secondary': -90,
                'portrait-secondary': 180,
                'portrait-primary': 0
            };

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

            window.addEventListener('orientationchange', function () {
                orientation = window.screen.orientation || window.screen.mozOrientation || window.msOrientation || null;
                orientationAngle = orientation ? (orientationAngleLookup[orientation] || 0) : 0;
            }, false);

            window.addEventListener("deviceorientation", function (e) {

                var alpha = e.alpha ? math.DEGTORAD * e.alpha : 0; // Z
                var beta = e.beta ? math.DEGTORAD * e.beta : 0; // X'
                var gamma = e.gamma ? math.DEGTORAD * e.gamma : 0; // Y'
                //var orient = orientationAngle ? math.DEGTORAD * orientationAngle : 0;
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

                var camera = self._attached.camera;

                var lenEyeLook = -Math.abs(math.lenVec3(math.subVec3(camera.look, camera.eye, tempVec3c)));

                tempVec3d[0] = 0;
                tempVec3d[1] = 0;
                tempVec3d[2] = lenEyeLook;

                look = math.addVec3(math.transformVec3(orientMatrix, tempVec3d, tempVec3d), eye);

                // Up

                tempVec3e[0] = 0;
                tempVec3e[1] = 1;
                tempVec3e[2] = 0;

                var up = math.transformVec3(orientMatrix, tempVec3e, tempVec3e);

                //camera.eye = eye;
                camera.look = look;
                camera.up = up;

            }, false);

            window.addEventListener('devicemotion', function (e) {
return;
                    deviceMotionEvent.interval = e.interval;
                    deviceMotionEvent.orientationAngle = orientationAngle;

                    var accel = e.acceleration;

                    if (accel) {
                        acceleration[0] = accel.x;
                        acceleration[1] = accel.y;
                        acceleration[2] = accel.z;
                        deviceMotionEvent.acceleration = acceleration;
                    } else {
                        deviceMotionEvent.acceleration = null;
                    }

                    var accelGrav = e.accelerationIncludingGravity;

                    if (accelGrav) {
                        accelerationIncludingGravity[0] = accelGrav.x;
                        accelerationIncludingGravity[1] = accelGrav.y;
                        accelerationIncludingGravity[2] = accelGrav.z;
                        deviceMotionEvent.accelerationIncludingGravity = accelerationIncludingGravity;
                    } else {
                        deviceMotionEvent.accelerationIncludingGravity = null;
                    }

                    deviceMotionEvent.rotationRate = e.rotationRate;
                },
                false);
        },

        _deactivate: function () {
            var scene = this.scene;

            scene.passes = 1; // Don't need to restore scene.clearEachPass

            scene.off(this._onSceneRendering);
            scene.off(this._onSceneRendered);
        },

        _getJSON: function () {

            var json = {
                active: this._active,
                eyeSep: this._eyeSep,
                focalLength: this._focalLength,
                aperture: this._aperture
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            if (this._attached.viewport) {
                json.viewport = this._attached.viewport.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();
