/**
 A **CameraFlight** flies a {{#crossLink "Camera"}}{{/crossLink}} to a given target.

 <ul>
 <li>A CameraFlight animates the {{#crossLink "Lookat"}}{{/crossLink}} attached to its {{#crossLink "Camera"}}{{/crossLink}}.</li>
 <li>A CameraFlight can be attached to a different {{#crossLink "Camera"}}{{/crossLink}} at any time.</li>
 <li>While a CameraFlight is busy flying to a target, it can be stopped, or redirected to fly to a different target.</li>
 </ul>

 A target can be:

 <ul>
 <li>specific ````eye````, ````look```` and ````up```` positions,</li>
 <li>a World-space {{#crossLink "Boundary3D"}}{{/crossLink}},</li>
 <li>an instance or ID of any {{#crossLink "Component"}}{{/crossLink}} subtype that provides a World-space</li>
 {{#crossLink "Boundary3D"}}{{/crossLink}} in a "worldBoundary" property, or</li>
 <li>an axis-aligned World-space bounding box.</li>
 </ul>

 ## Examples

 <ul>
 <li>[Flying to Entity](../../examples/#animation_CameraFlight_Entity)</li>
 <li>[Flying to Boundary3D](../../examples/#animation_CameraFlight_Boundary3D)</li>
 <li>[Flying to AABB](../../examples/#animation_CameraFlight_AABB)</li>
 </ul>

 ## Flying to a position

 Flying the CameraFlight from the previous example to specified eye, look and up positions:

 ````Javascript
 cameraFlight.flyTo({
    eye: [-5,-5,-5],
    look: [0,0,0]
    up: [0,1,0]
 }, function() {
    // Arrived
 });
 ````
 ## Flying to an Entity

 Flying to an {{#crossLink "Entity"}}{{/crossLink}} (which provides a World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} via its {{#crossLink "Entity/worldBoundary:property"}}{{/crossLink}} property):

 ````Javascript
 var camera = new XEO.Camera();

 // Create a CameraFlight that takes exactly twenty seconds to fly
 // the Camera to each specified target
 var cameraFlight = new XEO.CameraFlight({
    camera: camera,
    duration: 20 // Seconds
 });

 // Create a Entity, which gets all the default components
 var entity = new Entity();

 // Fly to the Entity's worldBoundary
 cameraFlight.flyTo(entity);
 ````

 ## Flying to a Boundary3D

 Flying the CameraFlight from the previous two examples explicitly to the World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} of the {{#crossLink "Entity"}}{{/crossLink}} property):

 ````Javascript
 var worldBoundary = entity.worldBoundary;

 cameraFlight.flyTo(worldBoundary);
 ````

 ## Flying to an AABB

 Flying the CameraFlight from the previous two examples explicitly to the {{#crossLink "Boundary3D"}}Boundary3D's{{/crossLink}}
 axis-aligned bounding box:

 ````Javascript
 var worldBoundary = entity.worldBoundary;

 var aabb = worldBoundary.aabb;

 cameraFlight.flyTo(aabb);
 ````

 @class CameraFlight
 @author xeolabs / http://xeolabs.org
 @module XEO
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {String|Component|Boundary3D|Array of Number|*} Target - see class documentation above.
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlight.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFlight. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    // Caches to avoid garbage collection

    var tempVec3 = XEO.math.vec3();
    var tempVec3b = XEO.math.vec3();
    var tempVec3c = XEO.math.vec3();

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

            this._flying = false;

            this._callback = null;
            this._callbackScope = null;

            this._onTick = null;

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
         * @param [callback] {Function} Callback fired on arrival
         * @param [scope] {Object} Optional scope for callback
         */
        flyTo: function (params, callback, scope) {

            if (this._flying) {
                this.stop();
            }

            var camera = this._attached.camera;

            if (!camera) {
                if (callback) {
                    if (scope) {
                        callback.call(scope);
                    } else {
                        callback();
                    }
                }
                return;
            }

            this._flying = false;

            this._callback = callback;
            this._callbackScope = scope;

            var lookat = camera.view;

            this._eye1[0] = lookat.eye[0];
            this._eye1[1] = lookat.eye[1];
            this._eye1[2] = lookat.eye[2];

            this._look1[0] = lookat.look[0];
            this._look1[1] = lookat.look[1];
            this._look1[2] = lookat.look[2];

            this._up1[0] = lookat.up[0];
            this._up1[1] = lookat.up[1];
            this._up1[2] = lookat.up[2];

            var aabb;
            var eye;
            var look;
            var up;
            var componentId;

            if (params.worldBoundary) {

                // Argument is a Component subtype with a worldBoundary

                aabb = params.worldBoundary.aabb;

            } else if (params.aabb) {

                aabb = params.aabb;

                // Argument is a Boundary3D

            } else if (params.min !== undefined && params.max !== undefined) {

                // Argument is an AABB

                aabb = params;

            } else if (params.eye || params.look || params.up) {

                // Argument is eye, look and up positions

                eye = params.eye;
                look = params.look;
                up = params.up;

            } else {

                // Argument must be an instance or ID of a Component (subtype)

                var component = params;

                if (XEO._isNumeric(component) || XEO._isString(component)) {

                    componentId = component;

                    component = this.scene.components[componentId];

                    if (!component) {
                        this.error("Component not found: " + XEO._inQuotes(componentId));
                        if (callback) {
                            if (scope) {
                                callback.call(scope);
                            } else {
                                callback();
                            }
                        }
                        return;
                    }
                }

                var worldBoundary = component.worldBoundary;

                if (!worldBoundary) {
                    this.error("Can't fly to component " + XEO._inQuotes(componentId) + " - does not have a worldBoundary");
                    if (callback) {
                        if (scope) {
                            callback.call(scope);
                        } else {
                            callback();
                        }
                    }
                    return;
                }

                aabb = worldBoundary.aabb;
            }

            var offset = params.offset;

            if (aabb) {

                if (aabb.max[0] <= aabb.min[0] || aabb.max[1] <= aabb.min[1] || aabb.max[2] <= aabb.min[2]) {

                    // Don't fly to an empty boundary
                    return;
                }

                this._look2 = XEO.math.getAABBCenter(aabb);

                if (offset) {
                    this._look2[0] += offset[0];
                    this._look2[1] += offset[1];
                    this._look2[2] += offset[2];
                }

                var vec = XEO.math.normalizeVec3(XEO.math.subVec3(this._eye1, this._look1, tempVec3));
                var diag = XEO.math.getAABBDiag(aabb);
                var sca = Math.abs((diag) / Math.tan((params.stopFOV || this._stopFOV) / 2));

                this._eye2[0] = this._look2[0] + (vec[0] * sca);
                this._eye2[1] = this._look2[1] + (vec[1] * sca);
                this._eye2[2] = this._look2[2] + (vec[2] * sca);

                this._up2[0] = this._up1[0];
                this._up2[1] = this._up1[1];
                this._up2[2] = this._up1[2];

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
            }

            this.fire("started", params, true);

            this._time1 = Date.now();
            this._time2 = this._time1 + (params.duration ? params.duration * 1000 : this._duration);

            this._flying = true; // False as soon as we stop

            XEO.scheduleTask(this._update, this);
        },

        _update: function () {

            if (!this._flying) {
                return;
            }

            var time = Date.now();

            var t = (time - this._time1) / (this._time2 - this._time1);

            var stopping = (t >= 1);

            if (t > 1) {
                t = 1;
            }

            t = this.easing ? this._ease(t, 0, 1, 1) : t;

            var view = this._attached.camera.view;

            view.eye = XEO.math.lerpVec3(t, 0, 1, this._eye1, this._eye2, tempVec3);
            view.look = XEO.math.lerpVec3(t, 0, 1, this._look1, this._look2, tempVec3b);
            view.up = XEO.math.lerpVec3(t, 0, 1, this._up1, this._up2, tempVec3c);

            if (stopping) {
                this.stop();
                return;
            }

            XEO.scheduleTask(this._update, this); // Keep flying
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

            //this.scene.off(this._tick);

            this._flying = false;

            this._time1 = null;
            this._time2 = null;

            var callback = this._callback;

            if (callback) {

                this._callback = null;

                if (this._callbackScope) {
                    callback.call(this._callbackScope);
                } else {
                    callback();
                }
            }

            this.fire("stopped", true, true);
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
                    this._attach({
                        name: "camera",
                        type: "XEO.Camera",
                        component: value,
                        sceneDefault: true
                    });

                    this.stop();
                },

                get: function () {
                    return this._attached.camera;
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

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.stop();
        }
    });

})();
