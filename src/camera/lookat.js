/**
 A **Lookat** defines a viewing transform as an {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} position, a
 {{#crossLink "Lookat/look:property"}}look{{/crossLink}} position and an {{#crossLink "Lookat/up:property"}}up{{/crossLink}}
 vector.

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with projection transforms such as
 {{#crossLink "Perspective"}}Perspective{{/crossLink}}, to define viewpoints on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Lookat components create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Lookat.png"></img>

 ## Usage

 ````Javascript
 new XEO.Entity({

     camera: XEO.Camera({

        view: new XEO.Lookat({
            eye: [0, 0, -4],
            look: [0, 0, 0],
            up: [0, 1, 0]
        }),

        project: new XEO.Perspective({
            fovy: 60,
            near: 0.1,
            far: 1000
        })
     }),

     new XEO.BoxGeometry();
 });
 ````

 @class Lookat
 @module XEO
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lookat in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lookat.
 @param [cfg.eye=[0,0,-10]] {Array of Number} Eye position.
 @param [cfg.look=[0,0,0]] {Array of Number} The position of the point-of-interest we're looking at.
 @param [cfg.up=[0,1,0]] {Array of Number} The "up" vector.
 @param [cfg.gimbalLockY=false] {Boolean} Whether Y-axis rotation is about the World-space Y-axis or the View-space Y-axis.
 @extends Component
 @author xeolabs / http://xeolabs.com/
 */
(function () {

    "use strict";

    XEO.Lookat = XEO.Component.extend({

        type: "XEO.Lookat",

        _init: function (cfg) {

            var mat = XEO.math.identityMat4(XEO.math.mat4());
            var invMat = XEO.math.inverseMat4(mat, XEO.math.mat4());

            this._state = new XEO.renderer.ViewTransform({
                matrix: mat,
                normalMatrix: invMat,
                eye: [0, 0, -10.0],
                look: [0, 0, 0],
                up: [0, 1, 0]
            });

            this._buildScheduled = false;

            this.eye = cfg.eye;
            this.look = cfg.look;
            this.up = cfg.up;
            this.gimbalLockY = cfg.gimbalLockY;
        },

        /**
         * Rotate 'eye' about 'look', around the 'up' vector
         *
         * @param {Number} angle Angle of rotation in degrees
         */
        rotateEyeY: function (angle) {

            // Get 'look' -> 'eye' vector
            var eye2 = XEO.math.subVec3(this._state.eye, this._state.look, []);

            var mat = XEO.math.rotationMat4v(angle * 0.0174532925, this._gimbalLockY ? [0, 1, 0] : this._state.up);
            eye2 = XEO.math.transformPoint3(mat, eye2, []);

            // Set eye position as 'look' plus 'eye' vector
            this.eye = XEO.math.addVec3(eye2, this._state.look, []);

            if (this._gimbalLockY) {

                // Rotate 'up' vector about orthogonal vector
                this.up = XEO.math.transformPoint3(mat, this._state.up, []);
            }
        },

        /**
         * Rotate 'eye' about 'look' around the X-axis
         *
         * @param {Number} angle Angle of rotation in degrees
         */
        rotateEyeX: function (angle) {

            // Get 'look' -> 'eye' vector
            var eye2 = XEO.math.subVec3(this._state.eye, this._state.look, []);

            // Get orthogonal vector from 'eye' and 'up'
            var left = XEO.math.cross3Vec3(XEO.math.normalizeVec3(eye2, []), XEO.math.normalizeVec3(this._state.up, []));

            // Rotate 'eye' vector about orthogonal vector
            var mat = XEO.math.rotationMat4v(angle * 0.0174532925, left);
            eye2 = XEO.math.transformPoint3(mat, eye2, []);

            // Set eye position as 'look' plus 'eye' vector
            this.eye = XEO.math.addVec3(eye2, this._state.look, []);

            // Rotate 'up' vector about orthogonal vector
            this.up = XEO.math.transformPoint3(mat, this._state.up, []);
        },

        /**
         * Rotate 'look' about 'eye', around the 'up' vector
         *
         * <p>Applies constraints added with {@link #addConstraint}.</p>
         *
         * @param {Number} angle Angle of rotation in degrees
         */
        rotateLookY: function (angle) {

            // Get 'look' -> 'eye' vector
            var look2 = XEO.math.subVec3(this._state.look, this._state.eye, []);

            // Rotate 'look' vector about 'up' vector
            var mat = XEO.math.rotationMat4v(angle * 0.0174532925, this._state.up);
            look2 = XEO.math.transformPoint3(mat, look2, []);

            // Set look position as 'look' plus 'eye' vector
            this.look = XEO.math.addVec3(look2, this._state.eye, []);
        },

        /**
         * Rotate 'eye' about 'look' around the X-axis
         *
         * @param {Number} angle Angle of rotation in degrees
         */
        rotateLookX: function (angle) {

            // Get 'look' -> 'eye' vector
            var look2 = XEO.math.subVec3(this._state.look, this._state.eye, []);

            // Get orthogonal vector from 'eye' and 'up'
            var left = XEO.math.cross3Vec3(XEO.math.normalizeVec3(look2, []), XEO.math.normalizeVec3(this._state.up, []));

            // Rotate 'look' vector about orthogonal vector
            var mat = XEO.math.rotationMat4v(angle * 0.0174532925, left);
            look2 = XEO.math.transformPoint3(mat, look2, []);

            // Set eye position as 'look' plus 'eye' vector
            this.look = XEO.math.addVec3(look2, this._state.eye, []);

            // Rotate 'up' vector about orthogonal vector
            this.up = XEO.math.transformPoint3(mat, this._state.up, []);
        },

        /**
         * Pans the camera along X and Y axis.
         * @param pan The pan vector
         */
        pan: function (pan) {

            // Get 'look' -> 'eye' vector
            var eye2 = XEO.math.subVec3(this._state.eye, this._state.look, []);

            // Building this pan vector
            var vec = [0, 0, 0];
            var v;

            if (pan[0] !== 0) {

                // Pan along orthogonal vector to 'look' and 'up'

                var left = XEO.math.cross3Vec3(XEO.math.normalizeVec3(eye2, []), XEO.math.normalizeVec3(this._state.up, []));

                v = XEO.math.mulVec3Scalar(left, pan[0]);

                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            if (pan[1] !== 0) {

                // Pan along 'up' vector

                v = XEO.math.mulVec3Scalar(XEO.math.normalizeVec3(this._state.up, []), pan[1]);

                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            if (pan[2] !== 0) {

                // Pan along 'eye'- -> 'look' vector

                v = XEO.math.mulVec3Scalar(XEO.math.normalizeVec3(eye2, []), pan[2]);

                vec[0] += v[0];
                vec[1] += v[1];
                vec[2] += v[2];
            }

            this.eye = XEO.math.addVec3(this._state.eye, vec, []);
            this.look = XEO.math.addVec3(this._state.look, vec, []);
        },

        /**
         * Increments/decrements zoom factor, ie. distance between eye and look.
         * @param delta
         */
        zoom: function (delta) {

            var vec = XEO.math.subVec3(this._state.eye, this._state.look, []); // Get vector from eye to look
            var lenLook = Math.abs(XEO.math.lenVec3(vec, []));    // Get len of that vector
            var newLenLook = Math.abs(lenLook + delta);         // Get new len after zoom

            var dir = XEO.math.normalizeVec3(vec, []);  // Get normalised vector

            this.eye = XEO.math.addVec3(this._state.look, XEO.math.mulVec3Scalar(dir, newLenLook), []);
        },

        _props: {

            /**
             * Whether Y-axis rotation is about the World-space Y-axis or the View-space Y-axis.
             *
             * Fires a {{#crossLink "Lookat/gimbalLockY:event"}}{{/crossLink}} event on change.
             *
             * @property gimbalLockY
             * @default false
             * @type Boolean
             */
            gimbalLockY: {

                set: function (value) {

                    value = value !== false;

                    this._gimbalLockY = value;
                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/gimbalLockY:property"}}{{/crossLink}} property changes.
                     *
                     * @event gimbalLockY
                     * @param value The property's new value
                     */
                    this.fire("gimbalLockY", this._state.gimbalLockY);
                },

                get: function () {
                    return this._gimbalLockY;
                }
            },

            /**
             * Position of this Lookat's eye.
             *
             * Fires an {{#crossLink "Lookat/eye:event"}}{{/crossLink}} event on change.
             *
             * @property eye
             * @default [0,0,-10]
             * @type Array(Number)
             */
            eye: {

                set: function (value) {

                    value = value || [0, 0, -10];

                    var eye = this._state.eye;

                    eye[0] = value[0];
                    eye[1] = value[1];
                    eye[2] = value[2];

                    this._scheduleUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/eye:property"}}{{/crossLink}} property changes.
                     *
                     * @event eye
                     * @param value The property's new value
                     */
                    this.fire("eye", this._state.eye);
                },

                get: function () {
                    return this._state.eye;
                }
            },

            /**
             * Position of this Lookat's point-of-interest.
             *
             * Fires a {{#crossLink "Lookat/look:event"}}{{/crossLink}} event on change.
             *
             * @property look
             * @default [0,0,0]
             * @type Array(Number)
             */
            look: {

                set: function (value) {

                    value = value || [0, 0, 0];

                    var look = this._state.look;

                    look[0] = value[0];
                    look[1] = value[1];
                    look[2] = value[2];

                    this._scheduleUpdate(0);; // Ensure matrix built on next "tick";

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/look:property"}}{{/crossLink}} property changes.
                     *
                     * @event look
                     * @param value The property's new value
                     */
                    this.fire("look", this._state.look);
                },

                get: function () {
                    return this._state.look;
                }
            },

            /**
             * Direction of the "up" vector.
             * Fires an {{#crossLink "Lookat/up:event"}}{{/crossLink}} event on change.
             * @property up
             * @default [0,1,0]
             * @type Array(Number)
             */
            up: {

                set: function (value) {

                    value = value || [0, 1, 0];

                    var up = this._state.up;

                    up[0] = value[0];
                    up[1] = value[1];
                    up[2] = value[2];

                    this._scheduleUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/up:property"}}{{/crossLink}} property changes.
                     *
                     * @event up
                     * @param value The property's new value
                     */
                    this.fire("up", this._state.up);
                },

                get: function () {
                    return this._state.up;
                }
            },

            /**
             * The elements of this Lookat's view transform matrix.
             *
             * Fires a {{#crossLink "Lookat/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @type {Float64Array}
             */
            matrix: {

                get: function () {

                    if (this._buildScheduled) {

                        // Matrix update is scheduled for next frame.
                        // Lazy-build the matrix now, while leaving the update
                        // scheduled. The update task will fire a "matrix" event,
                        // without needlessly rebuilding the matrix again.

                        this._build();

                        this._buildScheduled = false;
                    }

                    return this._state.matrix;
                }
            }
        },

        _build: function () {

            this._state.matrix = new Float32Array(XEO.math.lookAtMat4c(
                this._state.eye[0], this._state.eye[1], this._state.eye[2],
                this._state.look[0], this._state.look[1], this._state.look[2],
                this._state.up[0], this._state.up[1], this._state.up[2],
                this._state.matrix));

            this._state.normalMatrix = new Float32Array(XEO.math.transposeMat4(new Float32Array(XEO.math.inverseMat4(this._state.matrix, this._state.normalMatrix), this._state.normalMatrix)));
        },

        _update: function () {

            this._renderer.imageDirty = true;

            /**
             * Fired whenever this Lookat's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is updated.
             *
             * @event matrix
             * @param value The property's new value
             */
            this.fire("matrix", this._state.matrix);
        },

        _compile: function () {
            this._renderer.viewTransform = this._state;
        },

        _getJSON: function () {
            return {
                eye: this._state.eye,
                look: this._state.look,
                up: this._state.up
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
