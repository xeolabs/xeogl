/**
 A **CameraFlyAnimation** flies a {{#crossLink "Camera"}}{{/crossLink}} to given eye, look and up positions.

 ## Overview

 <ul>
 <li>A CameraFlyAnimation animates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the target {{#crossLink "Camera"}}{{/crossLink}}.
 </ul>

 ## Example

 ````Javascript
 var scene = new XEO.Scene();

 var camera = new XEO.Camera(scene);

 var object = new XEO.GameObject(scene);

 var animation = new XEO.CameraFlyAnimation(scene, {
    camera: camera
 });

 animation.flyTo({
    eye: [-5,-5,-5],
    look: [0,0,0]
    up: [0,1,0]
 }, function() {
    // Arrived
 });
 ````

 @class CameraFlyAnimation
 @module XEO
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Fly configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlyAnimation.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFlyAnimation. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    XEO.CameraFlyAnimation = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.CameraFlyAnimation",

        _init: function (cfg) {

            this._look1 = XEO.math.vec3();
            this._eye1 = XEO.math.vec3();
            this._up1 = XEO.math.vec3();

            this._look2 = XEO.math.vec3();
            this._eye2 = XEO.math.vec3();
            this._up2 = XEO.math.vec3();

            this._vec = XEO.math.vec3();

            this._dist = 0;

            this._flying = false;

            this._ok = null;

            this._onTick = null;

            this._camera = cfg.camera;

            this._tempVec = XEO.math.vec3();

            this._eyeVec = XEO.math.vec3();
            this._lookVec = XEO.math.vec3();

            this._stopFOV = 55;

            this._time1 = null;
            this._time2 = null;

            this.easing = cfg.easing !== false;

            this.duration = cfg.duration || 0.5;

            this.camera = cfg.camera;
        },

        /**
         * Begins flying this CameraFlyAnimation's {{#crossLink "Camera"}}{{/crossLink}} to the given target.
         *
         * <ul>
         *     <li>When the target is a boundary, the {{#crossLink "Camera"}}{{/crossLink}} will fly towards the target
         *     and stop when the target fills most of the canvas.</li>
         *     <li>When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
         *      vectors, then this CameraFlyAnimation will interpolate the {{#crossLink "Camera"}}{{/crossLink}} to that target and stop there.</li>
         * @method flyTo
         * @param params  {*} Flight parameters
         * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
         * {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position will
         * swing away from its {{#crossLink "Camera/eye:property"}}look{{/crossLink}} position as it flies to the target.
         * @param [params.worldAABB] {{xmin:Number, ymin:Number, zmin: Number, xmax: Number, ymax: Number, zmax: Number }}  World-space axis-aligned bounding box (AABB) target to fly to.
         * @param [params.eye] {Array of Number} Position to fly the {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position to.
         * @param [params.look] {Array of Number} Position to fly the {{#crossLink "Camera/look:property"}}Camera's look{{/crossLink}} position to.
         * @param [params.up] {Array of Number} Position to fly the {{#crossLink "Camera/up:property"}}Camera's up{{/crossLink}} vector to.
         * @param [ok] {Function} Callback fired on arrival
         */
        flyTo: function (params, ok) {

            if (this._flying) {
                this.stop();
            }

            this._ok = ok;

            this._arc = params.arc === undefined ? 0.0 : params.arc;

            var lookat = this.camera.view;

            // Set up initial camera state

            this._look1 = lookat.look;
            this._eye1 = lookat.eye;
            this._up1 = lookat.up;

            // Get normalized eye->look vector

            this._vec = XEO.math.normalizeVec3(XEO.math.subVec3(this._eye1, this._look1, []));

            // Back-off factor in range of [0..1], when 0 is close, 1 is far

            var backOff = params.backOff || 0.5;

            if (backOff < 0) {
                backOff = 0;

            } else if (backOff > 1) {
                backOff = 1;
            }

            backOff = 1 - backOff;

            // Set up final camera state

            if (params.component || params.worldAABB) {

                var worldAABB;

                if (params.component) {

                    var component = params.component;

                    if (XEO._isNumeric(component) || XEO._isString(component)) {

                        var componentId = component;

                        component = this.scene.components[componentId];

                        if (!component) {
                            this.error("Component not found: " + XEO._inQuotes(componentId));
                            return;
                        }
                    }

                    worldAABB = component.worldAABB;

                    if (!worldAABB) {
                        this.error("Can't fly to component " + XEO._inQuotes(componentId) + " - does not have a worldAABB");
                        return;
                    }
                } else {

                    // Zooming to look and eye computed from boundary

                    worldAABB = params.worldAABB;
                }

                if (worldAABB.xmax <= worldAABB.xmin || worldAABB.ymax <= worldAABB.ymin || worldAABB.zmax <= worldAABB.zmin) {
                    return;
                }

                var dist = params.dist || 2.5;
                var lenVec = Math.abs(XEO.math.lenVec3(this._vec));
                var diag = XEO.math.getAABBDiag(worldAABB);
                var len = Math.abs((diag / (1.0 + (backOff * 0.8))) / Math.tan(this._stopFOV / 2));  /// Tweak this to set final camera distance on arrival
                var sca = (len / lenVec) * dist;

                this._look2 = XEO.math.getAABBCenter(worldAABB);
                this._look2 = [this._look2[0], this._look2[1], this._look2[2]];

                if (params.offset) {

                    this._look2[0] += params.offset[0];
                    this._look2[1] += params.offset[1];
                    this._look2[2] += params.offset[2];
                }

                this._eye2 = XEO.math.addVec3(this._look2, XEO.math.mulVec3Scalar(this._vec, sca, []));
                this._up2 = XEO.math.vec3();
                this._up2[1] = 1;

            } else {

                // Zooming to specific look and eye points

                var lookat = params;

                var look = params.look || this._camera.view.look;
                var eye = params.eye || this._camera.view.eye;
                var up = params.up || this._camera.view.up;

                this._look2[0] = look[0];
                this._look2[1] = look[1];
                this._look2[2] = look[2];


                this._eye2[0] = eye[0];
                this._eye2[1] = eye[1];
                this._eye2[2] = eye[2];

                this._up2[0] = up[0];
                this._up2[1] = up[1];
                this._up2[2] = up[2];
            }

            this.fire("started", params, true);

            var self = this;

            this._time1 = (new Date()).getTime();
            this._time2 = this._time1 + this._duration;

            this._tick = this.scene.on("tick",
                function (params) {
                    self._update(params.time * 1000.0);
                });

            this._flying = true;
        },

        _update: function (time) {

            if (!this._flying) {
                return;
            }

            time = (new Date()).getTime();

            var t = (time - this._time1) / (this._time2 - this._time1);

            if (t > 1) {
                this.stop();
                return;
            }

            t = this.easing ? this._ease(t, 0, 1, 1) : t;

            var view = this._camera.view;

            view.eye = XEO.math.lerpVec3(t, 0, 1, this._eye1, this._eye2, []);
            view.look = XEO.math.lerpVec3(t, 0, 1, this._look1, this._look2, []);
            view.up = XEO.math.lerpVec3(t, 0, 1, this._up1, this._up2, []);
        },

        // Quadratic easing out - decelerating to zero velocity
        // http://gizma.com/easing

        _ease: function (t, b, c, d) {
            t /= d;
            return -c * t * (t - 2) + b;
        },

        stop: function () {

            if (!this._flying) {
                return;
            }

            this.scene.off(this._tick);

            this._flying = false;

            this._time1 = null;
            this._time2 = null;

            this.fire("stopped", true, true);

            var ok = this._ok;

            if (ok) {
                this._ok = false;
                ok();
            }
        },

        _props: {

            camera: {

                set: function (value) {
                    var camera = value || this.scene.camera;
                    if (camera) {
                        if (XEO._isNumeric(camera) || XEO._isString(camera)) {
                            camera = this.scene.components[camera];
                            if (!camera) {
                                this.error("Component not found: " + XEO._inQuotes(value));
                                return;
                            }
                        }
                        if (camera.type != "XEO.Camera") {
                            this.error("Component " + XEO._inQuotes(camera.id) + " is not a XEO.Camera");
                            return;
                        }
                        this._camera = value || this.scene.camera;
                    }
                    this.stop();
                },

                get: function () {
                    return this._camera;
                }
            },

            duration: {

                set: function (value) {
                    this._duration = value * 1000.0;
                    this.stop();
                },

                get: function () {
                    return this._duration * 0.001;
                }
            }
        },

        _getJSON: function () {

            var json = {
            };

            if (this._children.camera) {
                json.camera = this._children.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.stop();
        }
    });

})();
