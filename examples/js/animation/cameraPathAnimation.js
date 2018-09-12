/**
 A **CameraPathAnimation** animates the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} along a {{#crossLink "CameraPath"}}{{/crossLink}}.

 ## Examples

 * [Interpolating the Camera along a path](../../examples/#camera_path_interpolation)
 * [Flying directly to each frame on a path](../../examples/#camera_path_flyToFrame)
 * [Jumping directly to each frame on a path](../../examples/#camera_path_scrubToFrame)
 * [A menu of Camera waypoints to fly to](../../examples/#camera_path_frameMenu)

 ## Usage

 ### Interpolating the Camera along a path

 In this example we'll use the CameraPathAnimation's
 {{#crossLink "CameraPathAnimation/play"}}{{/crossLink}} method to smoothly <b>interpolate</b>
 the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} along a {{#crossLink "CameraPath"}}{{/crossLink}}:

 <a href="../../examples/#camera_path_interpolation"><img src="http://i.giphy.com/l0MYDGMYzdFf6TqRW.gif"></img></a>

 ````Javascript
 // Load a model from glTF

 var gearbox = new xeogl.GLTFModel({
         src: "models/gltf/GearboxAssy/glTF-MaterialsCommon/GearboxAssy.gltf"
 });

 // Define a CameraPath

 var cameraPath = new xeogl.CameraPath({
     frames: [
         {t: 0, eye: [184.21, 10.54, -7.03], look: [159.2, 17.02, 3.21], up: [-0.15, 0.97, 0.13]},
         {t: 1, eye: [184.91, 10.10, -11.26], look: [171.03, 13.69, -5.57], up: [-0.15, 0.97, 0.12]},
         {t: 2, eye: [181.37, 12.35, -16.93], look: [171.03, 13.69, -5.57], up: [-0.17, 0.93, 0.28]},
         {t: 2, eye: [174.01, 13.55, -20.70], look: [171.03, 13.69, -5.57], up: [-0.01, 0.90, 0.40]},
         {t: 4, eye: [166.48, 14.36, -20.30], look: [171.03, 13.69, -5.57], up: [0.19, 0.88, 0.40]},
         {t: 5, eye: [160.32, 14.69, -16.63], look: [171.03, 13.69, -5.57], up: [0.36, 0.87, 0.29]},
         {t: 6, eye: [156.67, 17.97, -4.77], look: [162.53, 17.42, 1.28], up: [0.36, 0.87, 0.29]},
         {t: 7, eye: [151.14, 16.68, -10.04], look: [158.94, 15.95, -1.99], up: [0.36, 0.87, 0.29]},
         {t: 8, eye: [146.26, 17.56, -4.77], look: [152.13, 17.05, 1.28], up: [0.36, 0.87, 0.28]},
         {t: 9, eye: [137.26, 18.36, -9.65], look: [149.76, 17.27, 3.24], up: [0.36, 0.87, 0.28]},
         {t: 10, eye: [139.04, 18.29, -11.17], look: [149.76, 17.27, 3.24], up: [0.32, 0.87, 0.33]},
         {t: 11, eye: [140.66, 18.13, -12.26], look: [149.76, 17.27, 3.24], up: [0.28, 0.87, 0.35]},
         {t: 12, eye: [147.18, 17.66, -14.56], look: [149.76, 17.27, 3.24], up: [0.12, 0.89, 0.41]},
         {t: 13, eye: [158.05, 16.33, -12.69], look: [149.76, 17.27, 3.24], up: [-0.11, 0.91, 0.34]},
         {t: 14, eye: [150.11, 13.26, -6.69], look: [147.95, 13.50, -2.52], up: [-0.11, 0.91, 0.34]},
         {t: 15, eye: [149.27, 13.00, -3.34], look: [148.72, 13.05, -2.29], up: [-0.11, 0.91, 0.35]},
         {t: 16, eye: [152.62, 11.65, -4.87], look: [148.47, 12.08, 3.08], up: [-0.11, 0.91, 0.35]},
         {t: 17, eye: [153.35, 12.24, -1.84], look: [148.69, 12.72, 7.01], up: [-0.11, 0.91, 0.35]},
         {t: 18, eye: [156.49, 12.11, 0.74], look: [148.69, 12.72, 7.012], up: [-0.23, 0.92, 0.26]},
         {t: 19, eye: [158.52, 11.98, 5.21], look: [148.69, 12.72, 7.01], up: [-0.32, 0.92, 0.12]},
         {t: 20, eye: [158.60, 11.50, 7.91], look: [148.69, 12.72, 7.01], up: [-0.30, 0.94, 0.035]},
         {t: 21, eye: [157.60, 11.76, 11.51], look: [148.69, 12.72, 7.01], up: [-0.31, 0.93, -0.089]},
         {t: 22, eye: [152.67, 18.35, 14.29], look: [148.69, 12.72, 7.01], up: [-0.46, 0.51, -0.70]},
         {t: 23, eye: [148.79, 21.67, 11.52], look: [148.69, 12.72, 7.01], up: [-0.15, 0.036, -0.97]},
         {t: 24, eye: [147.11, 22.40, 9.07], look: [148.69, 12.72, 7.01], up: [0.38, -0.16, -0.89]},
         {t: 25, eye: [144.80, 21.92, 6.23], look: [148.69, 12.72, 7.01], up: [0.98, -0.02, 0.03]},
         {t: 26, eye: [144.11, 20.18, 2.13], look: [148.69, 12.72, 7.01], up: [0.71, 0.29, 0.62]},
         {t: 27, eye: [145.87, 17.37, -1.40], look: [148.69, 12.72, 7.01], up: [0.31, 0.60, 0.71]},
         {t: 28, eye: [144.37, 19.17, -7.33], look: [146.13, 16.27, -2.08], up: [0.31, 0.60, 0.71]},
         {t: 29, eye: [142.54, 21.91, -17.26], look: [146.89, 14.81, -4.28], up: [0.31, 0.60, 0.71]}
     ]
 });

 // Once the model has loaded, animate the
 // (default Scene's default Camera) along the CameraPath

 var cameraPathAnimation = new xeogl.CameraPathAnimation({
     cameraPath: cameraPath
 });

 gearbox.on("loaded", function () {
     cameraPathAnimation.play();
 });
 ````

 <br>
 ### Flying directly to each frame on a path

 In this example, we'll use the CameraPathAnimation's {{#crossLink "CameraPathAnimation/flyToFrame"}}{{/crossLink}} method
 to <b>fly</b> the {{#crossLink "Camera"}}{{/crossLink}} directly to each frame on the {{#crossLink "CameraPath"}}{{/crossLink}}:

 <a href="../../examples/#camera_path_flyToFrame"><img src="http://i.giphy.com/l3vQYNjsnAQwPBeYU.gif"></img></a>

 ````javascript
 var i = 0;
 var dir = 1;

 gearbox.on("loaded", function () {
     function nextFrame() {
         cameraPathAnimation.flyToFrame(i += dir, function() { setTimeout(nextFrame, 1000); });

         if (i <= 0 || i >= 29) {
             dir = -dir;
         }
     }
     nextFrame();
 });
 ````
 <br>
 ### Jumping directly to each frame on a path

 In this example, we'll use the CameraPathAnimation's {{#crossLink "CameraPathAnimation/scrubToFrame"}}{{/crossLink}} method
 to <b>jump</b> the {{#crossLink "Camera"}}{{/crossLink}} directly to each frame on the {{#crossLink "CameraPath"}}{{/crossLink}}:

 <a href="../../examples/#camera_path_scrubToFrame"><img src="http://i.giphy.com/l0Hlyqk7kewTjSBZ6.gif"></img></a>

 ````javascript
 var i = 0;
 var dir = 1;

 gearbox.on("loaded", function () {
     function nextFrame() {
         cameraPathAnimation.scrubToFrame(i += dir);

         if (i <= 0 || i >= 29) {
             dir = -dir;
         }
         setTimeout(nextFrame, 1000);
     }
     nextFrame();
 });
 ````

 @class CameraPathAnimation
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to CameraPathAnimation.
 @param [cfg.cameraPath] {Number|String|CameraPath} ID or instance of a {{#crossLink "CameraPath"}}{{/crossLink}} to animate the {{#crossLink "Camera"}}{{/crossLink}} along.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as CameraPathAnimation. .
 @extends Component
 */
xeogl.CameraPathAnimation = class xeoglCameraPathAnimation extends xeogl.Component {

    init(cfg) {

        super.init(cfg);

        this._cameraFlightAnimation = this.create({
            type: "xeogl.CameraFlightAnimation"
        });

        this._t = 0;

        this.state = xeogl.CameraPathAnimation.SCRUBBING;

        this._playingFromT = 0;
        this._playingToT = 0;
        this._playingRate = cfg.playingRate || 1.0;
        this._playingDir = 1.0;

        this.cameraPath = cfg.cameraPath;

        this._tick = this.scene.on("tick", this._updateT, this);
    }

    _updateT() {

        const cameraPath = this._attached.cameraPath;

        if (!cameraPath) {
            return;
        }

        const f = 0.002;
        //var f = 1.0;

        switch (this.state) {

            case xeogl.CameraPathAnimation.SCRUBBING:
                return;

            case xeogl.CameraPathAnimation.PLAYING:

                this._t += this._playingRate * f;

                const numFrames = this.cameraPath.frames.length;
                if (numFrames === 0 || (this._playingDir < 0 && this._t <= 0) || (this._playingDir > 0 && this._t >= this.cameraPath.frames[numFrames - 1].t)) {
                    this.state = xeogl.CameraPathAnimation.SCRUBBING;
                    this._t = this.cameraPath.frames[numFrames - 1].t;
                    return;
                }

                cameraPath.loadFrame(this._t);

                break;

            case xeogl.CameraPathAnimation.PLAYING_TO:

                let t = this._t + (this._playingRate * f * this._playingDir);

                //t = this._ease(t, this._playingFromT, this._playingToT, this._playingToT - this._playingFromT);

                if ((this._playingDir < 0 && t <= this._playingToT) || (this._playingDir > 0 && t >= this._playingToT)) {
                    t = this._playingToT;
                    this.state = xeogl.CameraPathAnimation.SCRUBBING;
                }

                this._t = t;

                cameraPath.loadFrame(this._t);

                break;
        }
    }

    // Quadratic easing out - decelerating to zero velocity
    // http://gizma.com/easing

    _ease(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    }

    /**
     The {{#crossLink "CameraPath"}}{{/crossLink}} for this CameraPathAnimation.

     Fires a {{#crossLink "CameraPathAnimation/cameraPath:event"}}{{/crossLink}} event on change.

     @property cameraPath
     @type CameraPath
     */
    set cameraPath(value) {
        this._attach({name: "cameraPath", type: "xeogl.CameraPath", component: value, sceneDefault: false});
    }

    get cameraPath() {
        return this._attached.cameraPath;
    }

    /**
     The rate at which this CameraPathAnimation plays.

     @property rate
     @type Number
     */
    set rate(value) {
        this._playingRate = value;
    }

    get rate() {
        return this._playingRate;
    }

    /**
     * Begins playing this CameraPathAnimation from the current time.
     * @method play
     */
    play() {
        if (!this._attached.cameraPath) {
            return;
        }
        this.state = xeogl.CameraPathAnimation.PLAYING;
    }

    /**
     * Begins playing this CameraPathAnimation from the current time to the given time.
     *
     * @method playToT
     * @param {Number} t Time instant.
     */
    playToT(t) {
        const cameraPath = this._attached.cameraPath;
        if (!cameraPath) {
            return;
        }
        this._playingFromT = this._t;
        this._playingToT = t;
        this._playingDir = (this._playingToT - this._playingFromT) < 0 ? -1 : 1;
        this.state = xeogl.CameraPathAnimation.PLAYING_TO;
    }

    /**
     * Begins playing this CameraPathAnimation from the current time to the time at the given frame.
     *
     * @method playToFrame
     * @param {Number} frameIdx Index of the frame to play to.
     */
    playToFrame(frameIdx) {
        const cameraPath = this._attached.cameraPath;
        if (!cameraPath) {
            return;
        }
        const frame = cameraPath.frames[frameIdx];
        if (!frame) {
            this.error("playToFrame - frame index out of range: " + frameIdx);
            return;
        }
        const t = (1.0 / cameraPath.frames.length ) * frameIdx;
        this.playToT(t);
    }

    /**
     * Flies this CameraPathAnimation's {{#crossLink "Camera"}}{{/crossLink}} to the time at the given frame.
     *
     * @method flyToFrame
     * @param {Number} frameIdx Index of the frame to play to.
     * @param {Function} [ok] Callback to fire when playing is complete.
     */
    flyToFrame(frameIdx, ok) {
        const cameraPath = this._attached.cameraPath;
        if (!cameraPath) {
            return;
        }
        const frame = cameraPath.frames[frameIdx];
        if (!frame) {
            this.error("flyToFrame - frame index out of range: " + frameIdx);
            return;
        }
        this.state = xeogl.CameraPathAnimation.SCRUBBING;
        this._cameraFlightAnimation.flyTo(frame, ok);
    }

    /**
     * Scrubs (sets) this CameraPathAnimation to the the given time.
     *
     * @method scrubToT
     * @param {Number} t Time instant.
     */
    scrubToT(t) {
        const cameraPath = this._attached.cameraPath;
        if (!cameraPath) {
            return;
        }
        const camera = this.scene.camera;
        if (!camera) {
            return;
        }
        this._t = t;
        cameraPath.loadFrame(this._t, camera);
        this.state = xeogl.CameraPathAnimation.SCRUBBING;
    }

    /**
     * Scrubs this CameraPathAnimation to the given frame.
     *
     * @method scrubToFrame
     * @param {Number} frameIdx Index of the frame to scrub to.
     */
    scrubToFrame(frameIdx) {
        const cameraPath = this._attached.cameraPath;
        if (!cameraPath) {
            return;
        }
        const camera = this.scene.camera;
        if (!camera) {
            return;
        }
        const frame = cameraPath.frames[frameIdx];
        if (!frame) {
            this.error("playToFrame - frame index out of range: " + frameIdx);
            return;
        }
        this._t = (1.0 / cameraPath.frames.length ) * frameIdx;
        cameraPath.loadFrame(this._t, camera);
        this.state = xeogl.CameraPathAnimation.SCRUBBING;
    }

    /**
     * Stops playing this CameraPathAnimation.
     *
     * @method stop
     */
    stop() {
        this.state = xeogl.CameraPathAnimation.SCRUBBING;
    }

    destroy() {
        super.destroy();
        this.scene.off(this._tick);
    }
};

xeogl.CameraPathAnimation.STOPPED = 0;
xeogl.CameraPathAnimation.SCRUBBING = 1;
xeogl.CameraPathAnimation.PLAYING = 2;
xeogl.CameraPathAnimation.PLAYING_TO = 3;