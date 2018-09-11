/**
 A **CameraPath** defines a spline curve along which the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} can be animated.

 * See {{#crossLink "CameraPathAnimation"}}{{/crossLink}} for usage.

 @class CameraPath
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraPath.
 @param [cfg.eyeCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} property along.
 @param [cfg.lookCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/look:property"}}Camera's look{{/crossLink}} property along.
 @extends Component
 */
{
    const tempVec3a = xeogl.math.vec3();

    xeogl.CameraPath = class xeoglCameraPath extends xeogl.Component {

        /**
         JavaScript class name for this Component.

         For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

         @property type
         @type String
         @final
         */
        get type() {
            return "xeogl.CameraPath";
        }

        init(cfg) {

            super.init(cfg);

            this._frames = [];

            this._eyeCurve = new xeogl.SplineCurve(this);
            this._lookCurve = new xeogl.SplineCurve(this);
            this._upCurve = new xeogl.SplineCurve(this);

            if (cfg.frames) {
                this.addFrames(cfg.frames);
            }
        }

        /**
         The frames set on the constructor and added with {{#crossLink "CameraPath/addFrame:method"}}{{/crossLink}}.

         @property frames
         @type {[]}
         @final
         */
        get frames() {
            return this._frames;
        }

        /**
         The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
         {{#crossLink "Camera/property:eye"}}Camera's eye position{{/crossLink}} travels.

         This property is read-only and is internally created and destroyed by this CameraPath.

         @property eyeCurve
         @type {SplineCurve}
         @final
         */
        get eyeCurve() {
            return this._eyeCurve;
        }

        /**
         The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
         {{#crossLink "Camera/property:eye"}}Camera's look position{{/crossLink}} travels.

         This property is read-only and is internally created and destroyed by this CameraPath.

         @property lookCurve
         @type {SplineCurve}
         @final
         */
        get lookCurve() {
            return this._lookCurve;
        }

        /**
         The {{#crossLink "SplineCurve"}}{{/crossLink}} which defines the path along which a
         {{#crossLink "Camera/property:up"}}Camera's up vector{{/crossLink}} travels.

         This property is read-only and is internally created and destroyed by this CameraPath.

         @property upCurve
         @type {SplineCurve}
         @final
         */
        get upCurve() {
            return this._upCurve;
        }

        /**
         Adds a frame to this CameraPath, given as the current position of a {{#crossLink "Camera"}}{{/crossLink}}.

         @param {Number} t Time instant for the new frame.
         @param {Camera} camera The {{#crossLink "Camera"}}{{/crossLink}}.
         */
        saveFrame(t) {
            const camera = this.scene.camera;
            this.addFrame(t, camera.eye, camera.look, camera.up);
        }

        /**
         Adds a frame to this CameraPath, specified as values for eye, look and up vectors at a given time instant.

         @param {Number} t Time instant for the new frame;
         @param {Float32Array} eye A three-element vector specifying the eye position for the new frame.
         @param {Float32Array} look A three-element vector specifying the look position for the new frame.
         @param {Float32Array} up A three-element vector specifying the up vector for the new frame.
         */
        addFrame(t, eye, look, up) {
            const frame = {
                t: t,
                eye: eye.slice(0),
                look: look.slice(0),
                up: up.slice(0)
            };
            this._frames.push(frame);
            this._eyeCurve.points.push(frame.eye);
            this._lookCurve.points.push(frame.look);
            this._upCurve.points.push(frame.up);
        }

        /**
         Adds multiple frames to this CameraPath, each frame specified as a set of values for eye, look and up
         vectors at a given time instant.

         @param {Array} frames An array of frames.
         */
        addFrames(frames) {
            let frame;
            for (let i = 0, len = frames.length; i < len; i++) {
                frame = frames[i];
                this.addFrame(frame.t || 0, frame.eye, frame.look, frame.up);
            }
        }

        /**
         Sets the position of the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} to a position interpolated within this CameraPath
         at the given time instant.

         @param {Number} t Time instant.
         */
        loadFrame(t) {

            const camera = this.scene.camera;

            t = t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t);

            camera.eye = this._eyeCurve.getPoint(t, tempVec3a);
            camera.look = this._lookCurve.getPoint(t, tempVec3a);
            camera.up = this._upCurve.getPoint(t, tempVec3a);
        }

        /**
         Gets eye, look and up vectors on this CameraPath at a given instant.

         @param {Number} t Time instant.
         @param {Float32Array} eye The eye position to update.
         @param {Float32Array} look The look position to update.
         @param {Float32Array} up The up vector to update.
         */
        sampleFrame(t, eye, look, up) {
            t = t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t);
            this._eyeCurve.getPoint(t, eye);
            this._lookCurve.getPoint(t, look);
            this._upCurve.getPoint(t, up);
        }

        /**
         Removes all frames from this CameraPath.
         */
        clearFrames() {
            this._frames = [];
            this._eyeCurve.points = [];
            this._lookCurve.points = [];
            this._upCurve.points = [];
        }
    };
}