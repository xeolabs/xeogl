/**
 A **CameraFlight** flies a {{#crossLink "Camera"}}{{/crossLink}} to a given target component, AABB or eye/look/up position.

 ## Overview

 <ul>
 <li>A CameraFlight animates the {{#crossLink "Lookat"}}{{/crossLink}} attached to the {{#crossLink "Camera"}}{{/crossLink}}.
 </ul>

 ## Example

 ````Javascript
 var scene = new XEO.Scene();

 var camera = new XEO.Camera(scene);

 var object = new XEO.GameObject(scene);

 var animation = new XEO.CameraFlight(scene, {
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

 @class CameraFlight
 @module XEO
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Fly configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlight.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFlight. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    XEO.CameraFlight = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.CameraFlight",

        _init: function (cfg) {

            this._look1 = XEO.math.vec3();
            this._eye1 = XEO.math.vec3();
            this._up1 = XEO.math.vec3();

            this._look2 = XEO.math.vec3();
            this._eye2 = XEO.math.vec3();
            this._up2 = XEO.math.vec3();

            this._eyeLookVec = XEO.math.vec3();
            this._vec = XEO.math.vec3();

            this._dist = 0;

            this._flying = false;

            this._ok = null;

            this._onTick = null;

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
         * Begins flying this CameraFlight's {{#crossLink "Camera"}}{{/crossLink}} to the given target.
         *
         * <ul>
         *     <li>When the target is a boundary, the {{#crossLink "Camera"}}{{/crossLink}} will fly towards the target
         *     and stop when the target fills most of the canvas.</li>
         *     <li>When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
         *      vectors, then this CameraFlight will interpolate the {{#crossLink "Camera"}}{{/crossLink}} to that target and stop there.</li>
         * @method flyTo
         * @param params  {*|Component} Either a parameters object or a {{#crossLink "Component"}}{{/crossLink}} subtype that has a {{#crossLink "WorldBoundary"}}{{/crossLink}}.
         * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
         * {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position will
         * swing away from its {{#crossLink "Camera/eye:property"}}look{{/crossLink}} position as it flies to the target.
         * @param [params.component] {String|Component} ID or instance of a component to fly to.
         * @param [params.aabb] {*}  World-space axis-aligned bounding box (AABB) target to fly to.
         * @param [params.eye] {Array of Number} Position to fly the eye position to.
         * @param [params.look] {Array of Number} Position to fly the look position to.
         * @param [params.up] {Array of Number} Position to fly the up vector to.
         * @param [ok] {Function} Callback fired on arrival
         */
        flyTo: function (params, ok) {

            if (this._flying) {
                this.stop();
            }

            var camera = this._children.camera;

            if (!camera) {
                if (ok) {
                    ok();
                }
                return;
            }

            this._flying = false;
            this._flyToLook = false;
            this._flyToBoundary = false;

            this._ok = ok;

            var lookat = camera.view;

            this._eye1 = lookat.eye;
            this._look1 = lookat.look;
            this._up1 = lookat.up;

            var worldBoundary = params.worldBoundary;
            var component = !worldBoundary ? params.component : null;
            var aabb = worldBoundary ? worldBoundary.aabb : params.aabb;

            var eye = params.eye;
            var look = params.look;
            var up = params.up;

            var offset = params.offset;
            var backoff = params.backoff;

            if (worldBoundary || component || aabb) {

                if (component) {

                    // Get AABB from component

                    if (XEO._isNumeric(component) || XEO._isString(component)) {

                        var componentId = component;

                        component = this.scene.components[componentId];

                        if (!component) {
                            this.error("Component not found: " + XEO._inQuotes(componentId));
                            if (ok) {
                                ok();
                            }
                            return;
                        }
                    }

                    worldBoundary = component.worldBoundary;

                    if (!worldBoundary) {
                        this.error("Can't fly to component " + XEO._inQuotes(componentId) + " - does not have a worldBoundary");
                        if (ok) {
                            ok();
                        }
                        return;
                    }

                    aabb = worldBoundary.aabb;
                }

                if (aabb) {

                    if (aabb.xmax <= aabb.xmin || aabb.ymax <= aabb.ymin || aabb.zmax <= aabb.zmin) {

                        // Don't fly to an empty boundary
                        return;
                    }

                    this._look2 = XEO.math.getAABBCenter(aabb);

                    if (offset) {
                        this._look2[0] += offset[0];
                        this._look2[1] += offset[1];
                        this._look2[2] += offset[2];
                    }
                }

                this._flyToBoundary = true;

            } else if (eye || look || up) {

                look = look || this._look1;
                eye = eye || this._eye1;
                up = up || this._up1;

                this._look2[0] = look[0];
                this._look2[1] = look[1];
                this._look2[2] = look[2];

                this._eye2[0] = eye[0];
                this._eye2[1] = eye[1];
                this._eye2[2] = eye[2];

                this._up2[0] = up[0];
                this._up2[1] = up[1];
                this._up2[2] = up[2];

                this._flyToLook = true;
            }

            this.fire("started", params, true);

            var self = this;

            this._time1 = (new Date()).getTime();
            this._time2 = this._time1 + this._duration;

            this._tick = this.scene.on("tick",
                function (params) {
                    self._update(params);
                });

            this._flying = true;
        },

        _update: function (params) {

            if (!this._flying) {
                return;
            }

            var time = params.time;

            var t = (time - this._time1) / (this._time2 - this._time1);

            if (t > 1) {
                this.stop();
                return;
            }

            t = this.easing ? this._ease(t, 0, 1, 1) : t;

            var view = this._children.camera.view;

            if (this._flyToLook) {

                view.eye = XEO.math.lerpVec3(t, 0, 1, this._eye1, this._eye2, []);
                view.look = XEO.math.lerpVec3(t, 0, 1, this._look1, this._look2, []);
                view.up = XEO.math.lerpVec3(t, 0, 1, this._up1, this._up2, []);

                return;
            }

            if (this._flyToBoundary) {

                var eye = view.eye;
                var look = view.look;
                var up = view.up;

                var newLook = XEO.math.lerpVec3(t, 0, 1, this._look1, this._look2, []);

                var x = newLook[0] - look[0];
                var y = newLook[1] - look[1];
                var z = newLook[2] - look[2];

                /*
                 var backoff = backoff || 0.5;
                 backoff = backoff < 0 ? 0 : (backoff > 1 ? 1 : backoff);
                 backoff = 1 - backoff;

                 var eyeLookVec = XEO.math.subVec3(eye, look, []);
                 var normEyeLookVec = XEO.math.normalizeVec3(eyeLookVec, []);

                 var dist = params.dist || 2.5;
                 var lenVec = Math.abs(XEO.math.lenVec3(this._vec));
                 var diag = XEO.math.getAABBDiag(aabb);
                 var len = Math.abs((diag / (1.0 + (backoff * 0.8))) / Math.tan(this._stopFOV / 2));  /// Tweak this to set final camera distance on arrival
                 var sca = (len / lenVec) * dist;

                 this._eye2 = XEO.math.addVec3(this._look2, XEO.math.mulVec3Scalar(this._vec, sca, []), []);

                 */

                view.eye = [eye[0] + x, eye[1] + y, eye[2] + z];
                view.look = newLook;
           //     view.up = [up[0] + x, up[1] + y, up[2] + z];
            }
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
            this._flyToLook = false;
            this._flyToBoundary = false;

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

                    /**
                     * Fired whenever this CameraFlight's {{#crossLink "CameraFlight/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("camera", value);

                    this.stop();
                },

                get: function () {
                    return this._children.camera;
                }
            },

            duration: {

                set: function (value) {

                    this._duration = value * 1000.0;

                    this.stop();
                },

                get: function () {
                    return this._duration / 1000.0;
                }
            }
        },

        _getJSON: function () {

            var json = {};

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
