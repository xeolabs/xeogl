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
    up: [0,1,0],
    stopFOV: 45, // Default, degrees
    duration: 1 // Default, seconds
 }, function() {
    // Arrived
 });
 ````
 ## Flying to an Entity

 Flying to an {{#crossLink "Entity"}}{{/crossLink}} (which provides a World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} via its {{#crossLink "Entity/worldBoundary:property"}}{{/crossLink}} property):

 ````Javascript
 var camera = new xeogl.Camera();

 // Create a CameraFlight that takes exactly twenty seconds to fly
 // the Camera to each specified target
 var cameraFlight = new xeogl.CameraFlight({
    camera: camera,
    stopFOV: 45, // Default, degrees
    duration: 1 // Default, seconds
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
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlight.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFlight. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.stopFOV=45] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
  fill the canvas when calling {{#crossLink "CameraFlight/flyTo:method"}}{{/crossLink}} or {{#crossLink "CameraFlight/jumpTo:method"}}{{/crossLink}}.
 @param [cfg.duration=1] {Number} Flight duration, in seconds, when calling {{#crossLink "CameraFlight/flyTo:method"}}{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    // Caches to avoid garbage collection

    var tempVec3 = xeogl.math.vec3();
    var tempVec3b = xeogl.math.vec3();
    var tempVec3c = xeogl.math.vec3();

    xeogl.CameraFlight = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.CameraFlight",

        _init: function (cfg) {

            this._look1 = xeogl.math.vec3();
            this._eye1 = xeogl.math.vec3();
            this._up1 = xeogl.math.vec3();

            this._look2 = xeogl.math.vec3();
            this._eye2 = xeogl.math.vec3();
            this._up2 = xeogl.math.vec3();

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

            // Shows a wireframe box at the given boundary
            this._boundaryIndicator = this.create(xeogl.Entity, {
                geometry: this.create(xeogl.BoundaryGeometry, {
                    material: this.create(xeogl.PhongMaterial, {
                        diffuse: [0, 0, 0],
                        ambient: [0, 0, 0],
                        specular: [0, 0, 0],
                        emissive: [1.0, 1.0, 0.0],
                        lineWidth: 3
                    })
                }),
                visibility: this.create(xeogl.Visibility, {
                    visible: false
                }),
                modes: this.create(xeogl.Modes, {
                    collidable: false // Effectively has no boundary
                })
            });
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
         * @param [params.stopFOV=45] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
         * fill the canvas on arrival.
         * @param [params.duration=1] {Number} Flight duration in seconds.
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

                if (xeogl._isNumeric(component) || xeogl._isString(component)) {

                    componentId = component;

                    component = this.scene.components[componentId];

                    if (!component) {
                        this.error("Component not found: " + xeogl._inQuotes(componentId));
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
                    this.error("Can't fly to component " + xeogl._inQuotes(componentId) + " - does not have a worldBoundary");
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

                // Show boundary

                this._boundaryIndicator.geometry.aabb = aabb;
                this._boundaryIndicator.visibility.visible = true;

                var aabbCenter = xeogl.math.getAABBCenter(aabb);

                this._look2 = params.look || aabbCenter;

                if (offset) {
                    this._look2[0] += offset[0];
                    this._look2[1] += offset[1];
                    this._look2[2] += offset[2];
                }

                var vec = xeogl.math.normalizeVec3(xeogl.math.subVec3(this._eye1, this._look1, tempVec3));
                var diag = (params.look && false) ? xeogl.math.getAABBDiagPoint(aabb, params.look) : xeogl.math.getAABBDiag(aabb);
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

            xeogl.scheduleTask(this._update, this);
        },

        /**
         * Jumps this CameraFlight's {{#crossLink "Camera"}}{{/crossLink}} to the given target.
         *
         * <ul>
         *     <li>When the target is a boundary, this CameraFlight will position the {{#crossLink "Camera"}}{{/crossLink}}
         *     at where the target fills most of the canvas.</li>
         *     <li>When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
         *      vectors, then this CameraFlight will jump the {{#crossLink "Camera"}}{{/crossLink}} to that target.</li>
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
         * @param [params.stopFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
         * fill the canvas on arrival.
         */
        jumpTo: function (params) {

            if (this._flying) {
                this.stop();
            }

            var camera = this._attached.camera;

            if (!camera) {
                return;
            }

            var lookat = camera.view;

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

                if (xeogl._isNumeric(component) || xeogl._isString(component)) {

                    componentId = component;

                    component = this.scene.components[componentId];

                    if (!component) {
                        this.error("Component not found: " + xeogl._inQuotes(componentId));
                        return;
                    }
                }

                var worldBoundary = component.worldBoundary;

                if (!worldBoundary) {
                    this.error("Can't jump to component " + xeogl._inQuotes(componentId) + " - does not have a worldBoundary");
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

                eye = lookat.eye;
                look = xeogl.math.getAABBCenter(aabb);

                var vec = xeogl.math.normalizeVec3(xeogl.math.subVec3(eye, look, tempVec3));
                var diag = xeogl.math.getAABBDiag(aabb);
                var sca = Math.abs((diag) / Math.tan((params.stopFOV || this._stopFOV) / 2));

                lookat.eye = [look[0] + (vec[0] * sca), look[1] + (vec[1] * sca), look[2] + (vec[2] * sca)];
                lookat.look = look;

            } else if (eye || look || up) {

                if (eye) {
                    lookat.eye = eye;
                }

                if (look) {
                    lookat.look = look;
                }

                if (up) {
                    lookat.up = up;
                }
            }
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

            view.eye = xeogl.math.lerpVec3(t, 0, 1, this._eye1, this._eye2, tempVec3);
            view.look = xeogl.math.lerpVec3(t, 0, 1, this._look1, this._look2, tempVec3b);
            view.up = xeogl.math.lerpVec3(t, 0, 1, this._up1, this._up2, tempVec3c);

            if (stopping) {
                this.stop();
                return;
            }

            xeogl.scheduleTask(this._update, this); // Keep flying
        },

        // Quadratic easing out - decelerating to zero velocity
        // http://gizma.com/easing

        _ease: function (t, b, c, d) {
            t /= d;
            return -c * t * (t - 2) + b;
        },

        /**
         * Stops an earlier flyTo, fires arrival callback.
         * @method stop
         */
        stop: function () {

            if (!this._flying) {
                return;
            }

            this._boundaryIndicator.visibility.visible = false;

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

        /**
         * Cancels an earlier flyTo without calling the arrival callback.
         * @method cancel
         */
        cancel: function () {

            if (!this._flying) {
                return;
            }

            this._boundaryIndicator.visibility.visible = false;

            this._flying = false;

            this._time1 = null;
            this._time2 = null;

            if (this._callback) {
                this._callback = null;
            }

            this.fire("canceled", true, true);
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
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true
                    });

                    this.stop();
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * Flight duration, in seconds, when calling {{#crossLink "CameraFlight/flyTo:method"}}{{/crossLink}}.
             *
             * Stops any flight currently in progress.
             *
             * Fires a {{#crossLink "CameraFlight/duration:event"}}{{/crossLink}} event on change.
             *
             * @property duration
             * @default 1
             * @type Number
             */
            duration: {

                set: function (value) {

                    value = value || 1.0;

                    /**
                     Fired whenever this CameraFlight's {{#crossLink "CameraFlight/duration:property"}}{{/crossLink}} property changes.

                     @event duration
                     @param value {Number} The property's new value
                     */
                    this._duration = value * 1000.0;

                    this.stop();
                },

                get: function () {
                    return this._duration / 1000.0;
                }
            },

            /**
             * How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
             * fill the canvas when calling {{#crossLink "CameraFlight/flyTo:method"}}{{/crossLink}} or {{#crossLink "CameraFlight/jumpTo:method"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "CameraFlight/stopFOV:event"}}{{/crossLink}} event on change.
             *
             * @property stopFOV
             * @default 45
             * @type Number
             */
            stopFOV: {

                set: function (value) {

                    value = value || 45;

                    /**
                     Fired whenever this CameraFlight's {{#crossLink "CameraFlight/stopFOV:property"}}{{/crossLink}} property changes.

                     @event stopFOV
                     @param value {Number} The property's new value
                     */
                    this._stopFOV = value;
                },

                get: function () {
                    return this._stopFOV;
                }
            }
        },

        _getJSON: function () {

            var json = {
                duration: this._duration,
                stopFOV: this._stopFOV
            };

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
