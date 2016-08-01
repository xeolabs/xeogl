/**
 A **CameraPathPlayer** animates a {{#crossLink "CameraPath"}}{{/crossLink}}.

 ## Usage

 ````Javascript

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
 @param [cfg.eyeCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} property along.
 @param [cfg.lookCurve] {String|SplineCurve} ID or instance of a {{#crossLink "SplineCurve"}}{{/crossLink}} to animate the {{#crossLink "Camera/look:property"}}Camera's look{{/crossLink}} property along.
 @extends Component
 */
(function () {

    "use strict";

    XEO.CameraPathPlayer = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.CameraPathPlayer",

        _init: function (cfg) {

            this.cameraPath = cfg.cameraPath;

            this.cameraFlight = this.create(XEO.CameraFlight);

            if (this.cameraPath) {
                this.cameraFlight.camera = this.cameraPath.camera;
            }

            this.state = this.SCRUBBING;

            this._playingFromT = 0;
            this._playingToT = 0;
            this._playingRate = 0.001;
            this._playingDir = 1.0;

            this._tick = this.scene.on("tick", this._updateT, this);
        },

        _updateT: function () {

            if (!this.cameraPath) {
                return;
            }

            switch (this.state) {
                case this.SCRUBBING:
                    return;

                case this.PLAYING:
                    this.cameraPath.t += this._playingRate;
                    break;

                case this.PLAYING_TO:
                    var t = this.cameraPath.t + (this._playingRate * this._playingDir);

                    //t = this._ease(t, this._playingFromT, this._playingToT, this._playingToT - this._playingFromT);

                    if ((this._playingDir < 0 && t <= this._playingToT) || (this._playingDir > 0 && t >= this._playingToT)) {
                        this.state = this.SCRUBBING;
                        break;
                    }
                    this.cameraPath.t = t;
                    break;
            }
        },

        // Quadratic easing out - decelerating to zero velocity
        // http://gizma.com/easing

        _ease: function (t, b, c, d) {
            t /= d;
            return -c * t * (t - 2) + b;
        },

        STOPPED: 0,
        SCRUBBING: 1,
        PLAYING: 2,
        PLAYING_TO: 3,

        _props: {


            /**
             * The CameraPath for this CameraPathPlayer.
             *
             * @property cameraPath
             * @type CameraPath
             */
            cameraPath: {

                set: function (value) {
                    this._attach({
                        name: "cameraPath",
                        type: "XEO.CameraPath",
                        component: value,
                        sceneDefault: false
                    });
                },

                get: function () {
                    return this._attached.cameraPath;
                }
            }
        },

        /**
         *
         */
        play: function () {
            if (!this.cameraPath) {
                return;
            }
            this.state = this.PLAYING;
        },

        /**
         *
         */
        playToT: function (t) {
            if (!this.cameraPath) {
                return;
            }
            this.state = this.PLAYING_TO;
            this._playingFromT = this.cameraPath.t;
            this._playingToT = t;
            this._playingDir = (this._playingToT - this._playingFromT) < 0 ? -1 : 1;
        },

        /**
         *
         */
        playToFrame: function (frameIdx) {
            if (!this.cameraPath) {
                return;
            }
            var frame = this.cameraPath.frames[frameIdx];
            if (!frame) {
                this.error("playToFrame - frame index out of range: " + frameIdx);
                return;
            }
            var t = (1.0 / this.cameraPath.frames.length ) * frameIdx;
            this.playToT(t);
        },

        /**
         *
         * @param frameIdx
         * @param ok
         */
        flyToFrame: function (frameIdx, ok) {
            if (!this.cameraPath) {
                return;
            }
            var frame = this.cameraPath.frames[frameIdx];
            if (!frame) {
                this.error("flyToFrame - frame index out of range: " + frameIdx);
                return;
            }
            this.state = this.SCRUBBING;
            this.cameraFlight.flyTo(frame, ok);
        },

        /**
         *
         */
        scrubToT: function (t) {
            if (!this.cameraPath) {
                return;
            }
            this._state = this.SCRUBBING;
            this.cameraPath.t = t;
        },

        /**
         *
         */
        scrubToFrame: function (frameIdx) {
            if (!this.cameraPath) {
                return;
            }
            var frame = this.cameraPath.frames[frameIdx];
            if (!frame) {
                this.error("playToFrame - frame index out of range: " + frameIdx);
                return;
            }
            this._state = this.SCRUBBING;
            this.cameraPath.t = (1.0 / this.cameraPath.frames.length ) * frameIdx;
        },

        /**
         *
         */
        stop: function () {
            this._state = this.SCRUBBING;
        },

        _getJSON: function () {
            var json = {};
            if (this._attached.camera) {
                json.cameraPath = this._attached.cameraPath.id;
            }
            return json;
        },

        _destroy: function () {
            this.scene.off(this._tick);
        }
    });

})();
