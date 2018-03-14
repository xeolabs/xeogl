/**
 A **Camera** defines viewing and projection transforms for its {{#crossLink "Scene"}}{{/crossLink}}.

 ## Overview

 * One Camera per Scene
 * Controls viewing and projection transforms
 * Has methods to pan, zoom and orbit (or first-person rotation)
 * Dynamically configurable World-space "up" direction
 * Switchable between perspective, frustum and orthographic projections
 * Switchable gimbal lock
 * Can be "flown" to look at targets using a {{#crossLink "CameraFlightAnimation"}}{{/crossLink}}
 * Can be animated along a path using a {{#crossLink "CameraPathAnimation"}}{{/crossLink}}
 * Can follow a target using a {{#crossLink "CameraFollowAnimation"}}{{/crossLink}}

 ## Examples

 * [Perspective projection](../../examples/#camera_perspective)
 * [Orthographic projection](../../examples/#camera_orthographic)
 * [Frustum projection](../../examples/#camera_frustum)
 * [Camera with world Z-axis as "up"](../../examples/#camera_zAxisUp)
 * [Camera with world Y-axis as "up"](../../examples/#camera_yAxisUp)
 * [Automatically following an Entity with a Camera](../../examples/#camera_follow)
 * [Animating a Camera along a path](../../examples/#camera_path_interpolation)
 * [Architectural fly-through](../../examples/#importing_gltf_ModernOffice)

 ## Usage

 * [Getting the Camera](#getting)
 * [Moving around](#moving-around)
 * [Projection](#projection)
 * [Configuring World up direction](#configuring-world-up-direction)
 * [Gimbal locking](#gimbal-locking)

 ### Getting the Camera

 There is exactly one Camera per Scene:

 ````javascript
 var camera = myScene.camera;
 ````

 ### Moving around

 Get and set the Camera's absolute position at any time via its {{#crossLink "Camera/eye:property"}}{{/crossLink}},
 {{#crossLink "Camera/look:property"}}{{/crossLink}} and {{#crossLink "Camera/up:property"}}{{/crossLink}} properties:

 ````javascript
 camera.eye = [-10,0,0];
 camera.look = [-10,0,0];
 camera.up = [0,1,0];
 ````

 Get the view matrix:

 ````javascript
 var viewMatrix = camera.viewMatrix;
 var viewNormalMatrix = camera.normalMatrix;
 ````

 Listen for view matrix updates:

 ````javascript
 camera.on("matrix", function(matrix) { ... });
 ````

 Orbiting the {{#crossLink "Camera/look:property"}}{{/crossLink}} position:

 ````javascript
 camera.orbitYaw(20.0);
 camera.orbitPitch(10.0);
 ````

 First-person rotation, rotates {{#crossLink "Camera/look:property"}}{{/crossLink}}
 and {{#crossLink "Camera/up:property"}}{{/crossLink}} about {{#crossLink "Camera/eye:property"}}{{/crossLink}}:

 ````javascript
 camera.yaw(5.0);
 camera.pitch(-10.0);
 ````

 Panning along the Camera's local axis (ie. left/right, up/down, forward/backward):

 ````javascript
 camera.pan([-20, 0, 10]);
 ````

 Zoom to vary distance between {{#crossLink "Camera/eye:property"}}{{/crossLink}} and {{#crossLink "Camera/look:property"}}{{/crossLink}}:

 ````javascript
 camera.zoom(-5); // Move five units closer
 ````

 Get the current distance between {{#crossLink "Camera/eye:property"}}{{/crossLink}} and {{#crossLink "Camera/look:property"}}{{/crossLink}}:

 ````javascript
 var distance = camera.eyeLookDist;
 ````

 ### Projection

 For each projection type, the Camera has a Component to manage that projection's configuration. You can hot-switch the Camera
 between those projection types, while updating the properties of each projection component at any time.

 ````javascript
 camera.perspective.near = 0.4;
 camera.perspective.fov = 45;
 //...

 camera.ortho.near = 0.8;
 camera.ortho.far = 1000;
 //...

 camera.frustum.left = -1.0;
 camera.frustum.right = 1.0;
 camera.frustum.far = 1000.0;
 //...

 camera.projection = "perspective"; // Switch to perspective
 camera.projection = "frustum"; // Switch to frustum
 camera.projection = "ortho"; // Switch to ortho
 ````

 Get the projection matrix:

 ````javascript
 var projMatrix = camera.projMatrix;
 ````

 Listen for projection matrix updates:

 ````javascript
 camera.on("projMatrix", function(matrix) { ... });
 ````

 ### Configuring World up direction

 We can dynamically configure the direction that we consider to be "up" in the World-space coordinate system.

 Set the +Y axis as World "up" (convention in some modeling software):

 ````javascript
 camera.worldAxis = [
 1, 0, 0,    // Right
 0, 1, 0,    // Up
 0, 0,-1     // Forward
 ];
 ````

 Set the +Z axis as World "up" (convention in most CAD and BIM viewers):

 ````javascript
 camera.worldAxis = [
 1, 0, 0, // Right
 0, 0, 1, // Up
 0,-1, 0  // Forward
 ];
 ````

 The Camera has read-only convenience properties that provide each axis individually:

 ````javascript
 var worldRight = camera.worldRight;
 var worldForward = camera.worldForward;
 var worldUp = camera.worldUp;
 ````

 ### Gimbal locking

 By default, the Camera locks yaw rotation to pivot about the World-space "up" axis. We can dynamically lock and unlock that
 at any time:

 ````javascript
 camera.gimbalLock = false; // Yaw rotation now happens about Camera's local Y-axis
 camera.gimbalLock = true; // Yaw rotation now happens about World's "up" axis
 ````

 See: <a href="https://en.wikipedia.org/wiki/Gimbal_lock">https://en.wikipedia.org/wiki/Gimbal_lock</a>

 @class Camera
 @module xeogl
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Camera within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Camera by ID within its parent {{#crossLink "Scene"}}Scene{{/crossLink}} later.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Camera.
 @extends Component
 */
(function () {

    "use strict";

    var math = xeogl.math;

    var tempVec3 = math.vec3();
    var tempVec3b = math.vec3();
    var tempVec3c = math.vec3();
    var tempVec3d = math.vec3();
    var tempVec3e = math.vec3();
    var tempVec3f = math.vec3();

    xeogl.Camera = xeogl.Component.extend({

        type: "xeogl.Camera",

        _init: function (cfg) {

            this._state = new xeogl.renderer.ViewTransform({
                matrix: math.mat4(),
                normalMatrix: math.mat4()
            });

            this._perspective = new xeogl.Perspective(this);
            this._ortho = new xeogl.Ortho(this);
            this._frustum = new xeogl.Frustum(this);
            this._project = this._perspective;

            var self = this;

            this._eye = math.vec3([0, 0, 10.0]);
            this._look = math.vec3([0, 0, 0]);
            this._up = math.vec3([0, 1, 0]);

            this._worldUp = math.vec3([0, 1, 0]);
            this._worldRight = math.vec3([1, 0, 0]);
            this._worldForward = math.vec3([0, 0, -1]);

            this.eye = cfg.eye;
            this.look = cfg.look;
            this.up = cfg.up;
            this.worldAxis = cfg.worldAxis;
            this.gimbalLock = cfg.gimbalLock;

            this.projection = cfg.projection;

            this._perspective.on("matrix", function () {
                if (self._projectionType === "perspective") {
                    self.fire("projMatrix", self._perspective.matrix);
                }
            });

            this._ortho.on("matrix", function () {
                if (self._projectionType === "ortho") {
                    self.fire("projMatrix", self._ortho.matrix);
                }
            });

            this._frustum.on("matrix", function () {
                if (self._projectionType === "frustum") {
                    self.fire("projMatrix", self._frustum.matrix);
                }
            });
        },

        _update: (function () {

            var eyeLookVec = math.vec3();
            var eyeLookVecNorm = math.vec3();
            var eyeLookOffset = math.vec3();
            var offsetEye = math.vec3();

            return function () {

                // In ortho mode, build the view matrix with an eye position that's translated
                // well back from look, so that the front clip plane doesn't unexpectedly cut
                // the front off the view (not a problem with perspective, since objects close enough
                // to be clipped by the front plane are usually too big to see anything of their cross-sections).

                var eye;
                if (this.projection === "ortho") {
                    math.subVec3(this._eye, this._look, eyeLookVec);
                    math.normalizeVec3(eyeLookVec, eyeLookVecNorm);
                    math.mulVec3Scalar(eyeLookVecNorm, 1000.0, eyeLookOffset);
                    math.addVec3(this._look, eyeLookOffset, offsetEye);
                    eye = offsetEye;
                } else {
                    eye = this._eye;
                }

                math.lookAtMat4v(eye, this._look, this._up, this._state.matrix);
                math.inverseMat4(this._state.matrix, this._state.normalMatrix);
                math.transposeMat4(this._state.normalMatrix);

                this._renderer.imageDirty();

                this.fire("matrix", this._state.matrix);
                this.fire("viewMatrix", this._state.matrix);
            };
        })(),

        /**
         * Rotates {{#crossLink "Camera/eye:property"}}{{/crossLink}} about {{#crossLink "Camera/look:property"}}{{/crossLink}}, around the {{#crossLink "Camera/up:property"}}{{/crossLink}} vector
         *
         * @method orbitYaw
         * @param {Number} angle Angle of rotation in degrees
         */
        orbitYaw: (function () {
            var mat = math.mat4();
            return function (angle) {

                var lookEyeVec = math.subVec3(this._eye, this._look, tempVec3);
                math.rotationMat4v(angle * 0.0174532925, this._gimbalLock ? this._worldUp : this._up, mat);
                lookEyeVec = math.transformPoint3(mat, lookEyeVec, tempVec3b);

                this.eye = math.addVec3(this._look, lookEyeVec, tempVec3c); // Set eye position as 'look' plus 'eye' vector
                this.up = math.transformPoint3(mat, this._up, tempVec3d); // Rotate 'up' vector
            };
        })(),

        /**
         * Rotates {{#crossLink "Camera/eye:property"}}{{/crossLink}} about {{#crossLink "Camera/look:property"}}{{/crossLink}} around the right axis (orthogonal to {{#crossLink "Camera/up:property"}}{{/crossLink}} and "look").
         *
         * @method orbitPitch
         * @param {Number} angle Angle of rotation in degrees
         */
        orbitPitch: (function () {
            var mat = math.mat4();
            return function (angle) {

                var eye2 = math.subVec3(this._eye, this._look, tempVec3);
                var left = math.cross3Vec3(math.normalizeVec3(eye2, tempVec3b), math.normalizeVec3(this._up, tempVec3c));
                math.rotationMat4v(angle * 0.0174532925, left, mat);
                eye2 = math.transformPoint3(mat, eye2, tempVec3d);

                this.eye = math.addVec3(eye2, this._look, tempVec3e);
                this.up = math.transformPoint3(mat, this._up, tempVec3f);
            };
        })(),

        /**
         * Rotates {{#crossLink "Camera/look:property"}}{{/crossLink}} about {{#crossLink "Camera/eye:property"}}{{/crossLink}}, around the {{#crossLink "Camera/up:property"}}{{/crossLink}} vector.
         *
         * @method yaw
         * @param {Number} angle Angle of rotation in degrees
         */
        yaw: (function () {
            var mat = math.mat4();
            return function (angle) {

                var look2 = math.subVec3(this._look, this._eye, tempVec3);
                math.rotationMat4v(angle * 0.0174532925, this._gimbalLock ? this._worldUp : this._up, mat);
                look2 = math.transformPoint3(mat, look2, tempVec3b);

                this.look = math.addVec3(look2, this._eye, tempVec3c);

                if (this._gimbalLock) {
                    this.up = math.transformPoint3(mat, this._up, tempVec3d);
                }
            };
        })(),

        /**
         * Rotates {{#crossLink "Camera/look:property"}}{{/crossLink}} about {{#crossLink "Camera/eye:property"}}{{/crossLink}}, around the right axis (orthogonal to {{#crossLink "Camera/up:property"}}{{/crossLink}} and "look").
         *
         * @method pitch
         * @param {Number} angle Angle of rotation in degrees
         */
        pitch: (function () {
            var mat = math.mat4();
            return function (angle) {

                var look2 = math.subVec3(this._look, this._eye, tempVec3);
                var left = math.cross3Vec3(math.normalizeVec3(look2, tempVec3b), math.normalizeVec3(this._up, tempVec3c));
                math.rotationMat4v(angle * 0.0174532925, left, mat);
                look2 = math.transformPoint3(mat, look2, tempVec3d);

                this.look = math.addVec3(look2, this._eye, tempVec3e);
                this.up = math.transformPoint3(mat, this._up, tempVec3f);
            };
        })(),

        /**
         * Pans the camera along the camera's local X, Y and Z axis.
         *
         * @method pan
         * @param pan The pan vector
         */
        pan: function (pan) {

            var eye2 = math.subVec3(this._eye, this._look, tempVec3);
            var vec = [0, 0, 0];
            var v;

            if (pan[0] !== 0) {
                var left = math.cross3Vec3(math.normalizeVec3(eye2, []), math.normalizeVec3(this._up, tempVec3b));
                v = math.mulVec3Scalar(left, pan[0]);
                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            if (pan[1] !== 0) {
                v = math.mulVec3Scalar(math.normalizeVec3(this._up, tempVec3c), pan[1]);
                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            if (pan[2] !== 0) {
                v = math.mulVec3Scalar(math.normalizeVec3(eye2, tempVec3d), pan[2]);
                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            this.eye = math.addVec3(this._eye, vec, tempVec3e);
            this.look = math.addVec3(this._look, vec, tempVec3f);
        },

        /**
         * Increments/decrements zoom factor, ie. distance between {{#crossLink "Camera/eye:property"}}{{/crossLink}}
         * and {{#crossLink "Camera/look:property"}}{{/crossLink}}.
         *
         * @method zoom
         * @param delta
         */
        zoom: function (delta) {

            var vec = math.subVec3(this._eye, this._look, tempVec3);
            var lenLook = Math.abs(math.lenVec3(vec, tempVec3b));
            var newLenLook = Math.abs(lenLook + delta);

            if (newLenLook < 0.5) {
                return;
            }

            var dir = math.normalizeVec3(vec, tempVec3c);

            this.eye = math.addVec3(this._look, math.mulVec3Scalar(dir, newLenLook), tempVec3d);
        },

        _props: {

            /**
             * Position of this Camera's eye.
             *
             * Fires an {{#crossLink "Camera/eye:event"}}{{/crossLink}} event on change.
             *
             * @property eye
             * @default [0,0,10]
             * @type Float32Array
             */
            eye: {

                set: function (value) {

                    this._eye.set(value || [0, 0, 10]);
                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/eye:property"}}{{/crossLink}} property changes.
                     *
                     * @event eye
                     * @param value The property's new value
                     */
                    this.fire("eye", this._eye);
                },

                get: function () {
                    return this._eye;
                }
            },

            /**
             * Position of this Camera's point-of-interest.
             *
             * Fires a {{#crossLink "Camera/look:event"}}{{/crossLink}} event on change.
             *
             * @property look
             * @default [0,0,0]
             * @type Float32Array
             */
            look: {

                set: function (value) {

                    this._look.set(value || [0, 0, 0]);
                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/look:property"}}{{/crossLink}} property changes.
                     *
                     * @event look
                     * @param value The property's new value
                     */
                    this.fire("look", this._look);
                },

                get: function () {
                    return this._look;
                }
            },

            /**
             * Direction of this Camera's {{#crossLink "Camera/up:property"}}{{/crossLink}} vector.
             *
             * Fires an {{#crossLink "Camera/up:event"}}{{/crossLink}} event on change.
             *
             * @property up
             * @default [0,1,0]
             * @type Float32Array
             */
            up: {

                set: function (value) {

                    this._up.set(value || [0, 1, 0]);
                    this._needUpdate(0);

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/up:property"}}{{/crossLink}} property changes.
                     *
                     * @event up
                     * @param value The property's new value
                     */
                    this.fire("up", this._up);
                },

                get: function () {
                    return this._up;
                }
            },

            /**
             * Indicates the up, right and forward axis of the World coordinate system.
             *
             * Has format: ````[rightX, rightY, rightZ, upX, upY, upZ, forwardX, forwardY, forwardZ]````
             *
             * @property worldAxis
             * @default [1, 0, 0, 0, 1, 0, 0, 0, 1]
             * @type Float32Array
             */
            worldAxis: {

                set: function (value) {

                    value = value || [1, 0, 0, 0, 1, 0, 0, 0, 1];

                    if (!this._worldAxis) {
                        this._worldAxis = new Float32Array(value);

                    } else {
                        this._worldAxis.set(value);
                    }

                    this._worldRight[0] = this._worldAxis[0];
                    this._worldRight[1] = this._worldAxis[1];
                    this._worldRight[2] = this._worldAxis[2];

                    this._worldUp[0] = this._worldAxis[3];
                    this._worldUp[1] = this._worldAxis[4];
                    this._worldUp[2] = this._worldAxis[5];

                    this._worldForward[0] = this._worldAxis[6];
                    this._worldForward[1] = this._worldAxis[7];
                    this._worldForward[2] = this._worldAxis[8];

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/worldAxis:property"}}{{/crossLink}} property changes.
                     *
                     * @event worldAxis
                     * @param value The property's new value
                     */
                    this.fire("worldAxis", this._worldAxis);
                },

                get: function () {
                    return this._worldAxis;
                }
            },

            /**
             * Direction of World-space "up".
             *
             * @property worldUp
             * @default [0,1,0]
             * @type Float32Array
             * @final
             */
            worldUp: {

                get: function () {
                    return this._worldUp;
                }
            },

            /**
             * Direction of World-space "right".
             *
             * @property worldRight
             * @default [1,0,0]
             * @type Float32Array
             * @final
             */
            worldRight: {

                get: function () {
                    return this._worldRight;
                }
            },

            /**
             * Direction of World-space "forwards".
             *
             * @property worldForward
             * @default [0,0,-1]
             * @type Float32Array
             * @final
             */
            worldForward: {

                get: function () {
                    return this._worldForward;
                }
            },

            /**
             * Whether to lock yaw rotation to pivot about the World-space "up" axis.
             *
             * Fires a {{#crossLink "Camera/gimbalLock:event"}}{{/crossLink}} event on change.
             *
             * @property gimbalLock
             * @default true
             * @type Boolean
             */
            gimbalLock: {

                set: function (value) {

                    this._gimbalLock = value !== false;

                    /**
                     * Fired whenever this Camera's  {{#crossLink "Camera/gimbalLock:property"}}{{/crossLink}} property changes.
                     *
                     * @event gimbalLock
                     * @param value The property's new value
                     */
                    this.fire("gimbalLock", this._gimbalLock);
                },

                get: function () {
                    return this._gimbalLock;
                }
            },

            /**
             * Distance from "look" to "eye".
             * @property eyeLookDist
             * @type Number
             */
            eyeLookDist: {

                get: (function () {
                    var vec = new Float32Array(3);
                    return function () {
                        return math.lenVec3(math.subVec3(this._look, this._eye, vec));
                    };
                })()
            },

            /**
             * The Camera's viewing transformation matrix.
             *
             * Fires a {{#crossLink "Camera/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @type {Float32Array}
             * @deprecated
             */
            matrix: {

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._state.matrix;
                }
            },

            /**
             * The Camera's viewing transformation matrix.
             *
             * Fires a {{#crossLink "Camera/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property viewMatrix
             * @type {Float32Array}
             */
            viewMatrix: {

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._state.matrix;
                }
            },

            /**
             * The Camera's viewing normal transformation matrix.
             *
             * Fires a {{#crossLink "Camera/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property normalMatrix
             * @type {Float32Array}
             * @deprecated
             */
            normalMatrix: {

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._state.normalMatrix;
                }
            },

            /**
             * The Camera's viewing normal transformation matrix.
             *
             * Fires a {{#crossLink "Camera/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property viewNormalMatrix
             * @type {Float32Array}
             */
            viewNormalMatrix: {

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._state.normalMatrix;
                }
            },

            /**
             * Camera's projection transformation projMatrix.
             *
             * Fires a {{#crossLink "Camera/projMatrix:event"}}{{/crossLink}} event on change.
             *
             * @property projMatrix
             * @type {Float32Array}
             */
            projMatrix: {

                get: function () {

                    return this[this.projection].matrix;
                }
            },

            /**
             * The perspective projection transform for this Camera.
             *
             * This is used while {{#crossLink "Camera/projection:property"}}{{/crossLink}} equals "perspective".
             *
             * @property perspective
             * @type Perspective
             * @final
             */
            perspective: {

                get: function () {
                    return this._perspective;
                }
            },

            /**
             * The orthographic projection transform for this Camera.
             *
             * This is used while {{#crossLink "Camera/projection:property"}}{{/crossLink}} equals "ortho".
             *
             * @property ortho
             * @type Ortho
             * @final
             */
            ortho: {

                get: function () {
                    return this._ortho;
                }
            },

            /**
             * The frustum projection transform for this Camera.
             *
             * This is used while {{#crossLink "Camera/projection:property"}}{{/crossLink}} equals "frustum".
             *
             * @property frustum
             * @type Frustum
             * @final
             */
            frustum: {

                get: function () {
                    return this._frustum;
                }
            },

            /**
             The active projection type.

             Accepted values are "perspective", "ortho" and "frustum".

             @property projection
             @default "perspective"
             @type {String}
             */
            projection: {

                set: function (value) {

                    value = value || "perspective";

                    if (this._projectionType === value) {
                        return;
                    }

                    if (value === "perspective") {
                        this._project = this._perspective;

                    } else if (value === "ortho") {
                        this._project = this._ortho;

                    } else if (value === "frustum") {
                        this._project = this._frustum;

                    } else {
                        this.error("Unsupported value for 'projection': " + value + " defaulting to 'perspective'");
                        this._project = this._perspective;
                        value = "perspective";
                    }

                    this._projectionType = value;

                    this._renderer.imageDirty();

                    this._update(); // Need to rebuild lookat matrix with full eye, look & up

                    this.fire("dirty");
                },

                get: function () {
                    return this._projectionType;
                }
            },

            /**
             * The active projection transform for this Camera.
             *
             * @property project
             * @type Transform
             * @final
             */
            project: {

                get: function () {
                    return this._project;
                }
            },

            view: { // Baackwards compat
                get: function () {
                    return this;
                }
            }
        }
    });
})();
