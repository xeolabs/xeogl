/**
 A **Lookat** is a {{#crossLink "Transform"}}{{/crossLink}} that defines a viewing transform as an {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} position, a
 {{#crossLink "Lookat/look:property"}}look{{/crossLink}} position and an {{#crossLink "Lookat/up:property"}}up{{/crossLink}}
 vector.

 @class Lookat
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lookat in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lookat.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.eye=[0,0,10]] {Array of Number} Eye position.
 @param [cfg.look=[0,0,0]] {Array of Number} The position of the point-of-interest we're looking at.
 @param [cfg.up=[0,1,0]] {Array of Number} The "up" vector.
 @param [cfg.worldAxis=[1, 0, 0, 0, 1, 0, 0, 0, 1]] {Array of Number} Indicates the up, right and forward axis of the World coordinate system. Has format: ````[rightX, rightY, rightZ, upX, upY, upZ, forwardX, forwardY, forwardZ]````.
 @param [cfg.gimbalLock=true] {Boolean} Whether to lock yaw rotation to pivot about the World-space "up" axis.
 @extends Transform
 @author xeolabs / http://xeolabs.com/
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

    xeogl.Lookat = xeogl.Transform.extend({

        type: "xeogl.Lookat",

        _init: function (cfg) {

            this._super(cfg);

            var self = this;

            var onTick = this.scene.on("tick", function () { // HAACK: Camera not immediately available.
                if (self.scene.camera) {
                    self.scene.camera.on("dirty", self._update, self);
                    self.scene.off(onTick);
                }
            });

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
        },

        _update: (function () {

            var mat = math.mat4();
            var eyeLookVec = math.vec3();
            var eyeLookVecNorm = math.vec3();
            var eyeLookOffset = math.vec3();
            var offsetEye = math.vec3();

            return function () {

                if (this.scene.camera && this.scene.camera.projection === "ortho") {

                    // In ortho mode, build the view matrix with an eye position that's translated
                    // well back from look, so that the front clip plane doesn't unexpectedly cut
                    // the front off the view (not a problem with perspective, since objects close enough
                    // to be clipped by the front plane are usually too big to see anything of their cross-sections).

                    math.subVec3(this._eye, this._look, eyeLookVec);
                    math.normalizeVec3(eyeLookVec, eyeLookVecNorm);
                    math.mulVec3Scalar(eyeLookVecNorm, 1000.0, eyeLookOffset);
                    math.addVec3(this._look, eyeLookOffset, offsetEye);

                    math.lookAtMat4v(offsetEye, this._look, this._up, mat);

                } else {
                    math.lookAtMat4v(this._eye, this._look, this._up, mat);
                }

                this.matrix = mat;
            };
        })(),

        /**
         * Rotate 'eye' about 'look', around the 'up' vector
         *
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
         * Rotate 'eye' about 'look' around the right axis (orthogonal to "up" and "look").
         *
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
         * Rotate 'look' about 'eye', around the 'up' vector.
         *
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
         * Rotate 'look' about 'eye', around the right axis (orthogonal to "up" and "look").
         *
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
         * Pans the camera along X, Y and Z axis.
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
         * Increments/decrements zoom factor, ie. distance between eye and look.
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
             * Position of this Lookat's eye.
             *
             * Fires an {{#crossLink "Lookat/eye:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/eye:property"}}{{/crossLink}} property changes.
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
             * Position of this Lookat's point-of-interest.
             *
             * Fires a {{#crossLink "Lookat/look:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/look:property"}}{{/crossLink}} property changes.
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
             * Direction of the "up" vector.
             * Fires an {{#crossLink "Lookat/up:event"}}{{/crossLink}} event on change.
             * @property up
             * @default [0,1,0]
             * @type Float32Array
             */
            up: {

                set: function (value) {

                    this._up.set(value || [0, 1, 0]);
                    this._needUpdate(0);

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/up:property"}}{{/crossLink}} property changes.
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

                    var worldAxis = value || [1, 0, 0, 0, 1, 0, 0, 0, 1];

                    this.worldRight[0] = worldAxis[0];
                    this.worldRight[1] = worldAxis[1];
                    this.worldRight[2] = worldAxis[2];

                    this.worldUp[0] = worldAxis[3];
                    this.worldUp[1] = worldAxis[4];
                    this.worldUp[2] = worldAxis[5];

                    this.worldForward[0] = worldAxis[6];
                    this.worldForward[1] = worldAxis[7];
                    this.worldForward[2] = worldAxis[8];
                },

                get: function () {
                    return this._worldAxis;
                }
            },

            /**
             * Direction of World-space "up".
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
             * Fires a {{#crossLink "Lookat/gimbalLock:event"}}{{/crossLink}} event on change.
             *
             * @property gimbalLock
             * @default true
             * @type Boolean
             */
            gimbalLock: {

                set: function (value) {

                    this._gimbalLock = value !== false;

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/gimbalLock:property"}}{{/crossLink}} property changes.
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
            }
        }
    });

})();
