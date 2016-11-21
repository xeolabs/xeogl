/**
 A **CameraFlightAnimation** jumps or flies a {{#crossLink "Camera"}}{{/crossLink}} to look at a given target.

 <a href="../../examples/#animation_CameraFlightAnimation_Entity"><img src="http://i.giphy.com/3o7TKP0jN800EQ99EQ.gif"></img></a>

 ## Overview

 * Requires that the {{#crossLink "Camera"}}{{/crossLink}} have a {{#crossLink "Lookat"}}{{/crossLink}} for its {{#crossLink "Camera/view:property"}}view{{/crossLink}} transform.
 * Can be attached to a different {{#crossLink "Camera"}}{{/crossLink}} at any time.
 * Can be made to either fly or jump to its target.
 * While busy flying to a target, it can be stopped, or redirected to fly to a different target.

 A CameraFlightAnimation's target can be:

 * specific ````eye````, ````look```` and ````up```` positions,
 * a World-space {{#crossLink "Boundary3D"}}{{/crossLink}},
 * an instance or ID of any {{#crossLink "Component"}}{{/crossLink}} subtype that provides a World-space {{#crossLink "Boundary3D"}}{{/crossLink}} in a "worldBoundary" property, or
 * an axis-aligned World-space bounding box (AABB).

 When a CameraFlightAnimation's target is a {{#crossLink "Boundary3D"}}{{/crossLink}} or AABB, you can configure its {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}
 and {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}} properties to make it stop at the point where the target
 occupies a certain amount of the field-of-view.

 ## Examples

 * [Flying to random Entities](../../examples/#animation_CameraFlightAnimation_Entity)
 * [Flying to Boundary3D](../../examples/#animation_CameraFlightAnimation_Boundary3D)
 * [Flying to AABB](../../examples/#animation_CameraFlightAnimation_AABB)

 ## Flying to an Entity

 Flying to an {{#crossLink "Entity"}}{{/crossLink}} (which provides a World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} via its {{#crossLink "Entity/worldBoundary:property"}}{{/crossLink}} property):

 ````Javascript
 var camera = new xeogl.Camera();

 // Create a CameraFlightAnimation that takes one second to fly
 // the default Scene's default Camera to each specified target
 var cameraFlight = new xeogl.CameraFlightAnimation({
    fit: true, // Default
    fitFOV: 45, // Default, degrees
    duration: 1 // Default, seconds
 }, function() {
           // Arrived
       });

 // Create a Entity, which gets all the default components
 var entity = new Entity();

 // Fly to the Entity's worldBoundary
 cameraFlight.flyTo(entity);
 ````
 ## Flying to a position

 Flying the CameraFlightAnimation from the previous example to specified eye, look and up positions:

 ````Javascript
 cameraFlight.flyTo({
    eye: [-5,-5,-5],
    look: [0,0,0]
    up: [0,1,0],
    duration: 1 // Default, seconds
 }, function() {
          // Arrived
      });
 ````

 ## Flying to a Boundary3D

 Flying the CameraFlightAnimation from the previous two examples explicitly to the World-space
 {{#crossLink "Boundary3D"}}{{/crossLink}} of the {{#crossLink "Entity"}}{{/crossLink}} property):

 ````Javascript
 cameraFlight.flyTo(entity.worldBoundary);
 ````

 ## Flying to an AABB

 Flying the CameraFlightAnimation from the previous two examples explicitly to the {{#crossLink "Boundary3D"}}Boundary3D's{{/crossLink}}
 axis-aligned bounding box:

 ````Javascript
 var worldBoundary = entity.worldBoundary;

 var aabb = worldBoundary.aabb;

 cameraFlight.flyTo(aabb);
 ````

 @class CameraFlightAnimation
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlightAnimation.
 @param [cfg.camera] {Number|String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFlightAnimation. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.fit=true] {Boolean} When true, will ensure that when this CameraFlightAnimation has flown or jumped to a boundary
 it will adjust the distance between the {{#crossLink "CameraFlightAnimation/camera:property"}}camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}}
 and {{#crossLink "Lookat/look:property"}}{{/crossLink}} position so as to ensure that the target boundary is filling the view volume.
 @param [cfg.fitFOV=45] {Number} How much field-of-view, in degrees, that a target boundary should
 fill the canvas when fitting the {{#crossLink "Camera"}}Camera{{/crossLink}} to the target boundary.
 @param [cfg.trail] {Boolean} When true, will cause this CameraFlightAnimation to point the {{#crossLink "Camera"}}{{/crossLink}} in the direction that it is travelling.
 @param [cfg.duration=1] {Number} Flight duration, in seconds, when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.CameraFlightAnimation = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.CameraFlightAnimation",

        _init: function (cfg) {

            this._look1 = math.vec3();
            this._eye1 = math.vec3();
            this._up1 = math.vec3();

            this._look2 = math.vec3();
            this._eye2 = math.vec3();
            this._up2 = math.vec3();

            this._flying = false;
            this._flyEyeLookUp = false;

            this._callback = null;
            this._callbackScope = null;

            this._onTick = null;

            this._time1 = null;
            this._time2 = null;

            this.easing = cfg.easing !== false;

            this.duration = cfg.duration;
            this.fit = cfg.fit;
            this.fitFOV = cfg.fitFOV;
            this.trail = cfg.trail;
            this.camera = cfg.camera;

            // Shows a wireframe box for target AABBs
            this._aabbHelper = this.create({
                type: "xeogl.Entity",
                geometry: this.create({
                    type: "xeogl.AABBGeometry",
                    material: this.create({
                        type: "xeogl.PhongMaterial",
                        diffuse: [0, 0, 0],
                        ambient: [0, 0, 0],
                        specular: [0, 0, 0],
                        emissive: [1.0, 1.0, 0.0],
                        lineWidth: 3
                    })
                }),
                visibility: this.create({
                    type: "xeogl.Visibility",
                    visible: false
                }),
                modes: this.create({
                    type: "xeogl.Modes",
                    collidable: false // Effectively has no boundary
                })
            });

            // Shows a wireframe box for target AABBs
            this._obbHelper = this.create({
                type: "xeogl.Entity",
                geometry: this.create({
                    type: "xeogl.OBBGeometry",
                    material: this.create({
                        type: "xeogl.PhongMaterial",
                        diffuse: [0, 0, 0],
                        ambient: [0, 0, 0],
                        specular: [0, 0, 0],
                        emissive: [1.0, 1.0, 0.0],
                        lineWidth: 3
                    })
                }),
                visibility: this.create({
                    type: "xeogl.Visibility",
                    visible: false
                }),
                modes: this.create({
                    type: "xeogl.Modes",
                    collidable: false // Effectively has no boundary
                })
            });
        },

        /**
         * Begins flying this CameraFlightAnimation's {{#crossLink "Camera"}}{{/crossLink}} to the given target.
         *
         *
         *  * When the target is a boundary, the {{#crossLink "Camera"}}{{/crossLink}} will fly towards the target
         *    and stop when the target fills most of the canvas.
         *  * When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
         *    vectors, then this CameraFlightAnimation will interpolate the {{#crossLink "Camera"}}{{/crossLink}} to that target and stop there.
         * @method flyTo
         * @param [params=scene]  {*|Component} Either a parameters object or a {{#crossLink "Component"}}{{/crossLink}} subtype that has a {{#crossLink "WorldBoundary"}}{{/crossLink}}.
         * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
         * {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position will
         * swing away from its {{#crossLink "Camera/eye:property"}}look{{/crossLink}} position as it flies to the target.
         * @param [params.component] {Number|String|Component} ID or instance of a component to fly to. Defaults to the entire {{#crossLink "Scene"}}{{/crossLink}}.
         * @param [params.aabb] {*}  World-space axis-aligned bounding box (AABB) target to fly to.
         * @param [params.eye] {Float32Array} Position to fly the eye position to.
         * @param [params.look] {Float32Array} Position to fly the look position to.
         * @param [params.up] {Float32Array} Position to fly the up vector to.
         * @param [params.fit=true] {Boolean} Whether to fit the target to the view volume. Overrides {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}.
         * @param [params.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
         * fill the canvas on arrival. Overrides {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}}.
         * @param [params.duration] {Number} Flight duration in seconds.  Overrides {{#crossLink "CameraFlightAnimation/duration:property"}}{{/crossLink}}.
         * @param [callback] {Function} Callback fired on arrival
         * @param [scope] {Object} Optional scope for callback
         */
        flyTo: (function () {

            var tempVec3 = math.vec3();

            return function (params, callback, scope) {

                params = params || this.scene;

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

                var view = camera.view;

                this._eye1[0] = view.eye[0];
                this._eye1[1] = view.eye[1];
                this._eye1[2] = view.eye[2];

                this._look1[0] = view.look[0];
                this._look1[1] = view.look[1];
                this._look1[2] = view.look[2];

                this._up1[0] = view.up[0];
                this._up1[1] = view.up[1];
                this._up1[2] = view.up[2];

                var aabb;
                var sphere;
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

                } else if (params.length === 6) { // [xmin,ymin,zmin, xmax,ymax,zmax]

                    // Argument is an AABB

                    aabb = params;

                //} else if (params.length === 4) { // [x,y,z,radius]
                //
                //    // Argument is an OBB
                //
                //    sphere = params;

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

                    if (aabb[3] <= aabb[0] || aabb[4] <= aabb[1] || aabb[5] <= aabb[2]) {

                        // Don't fly to an empty boundary
                        return;
                    }

                    // Show boundary

                    this._aabbHelper.geometry.aabb = aabb;
                    this._aabbHelper.visibility.visible = true;

                    var aabbCenter = math.getAABB3Center(aabb);

                    this._look2 = params.look || aabbCenter;

                    if (offset) {
                        this._look2[0] += offset[0];
                        this._look2[1] += offset[1];
                        this._look2[2] += offset[2];
                    }

                    var vec = math.normalizeVec3(math.subVec3(this._eye1, this._look1, tempVec3));
                    var diag = (params.look && false) ? math.getAABB3DiagPoint(aabb, params.look) : math.getAABB3Diag(aabb);
                    var sca = Math.abs((diag) / Math.tan((params.fitFOV || this._fitFOV) * xeogl.math.DEGTORAD));

                    this._eye2[0] = this._look2[0] + (vec[0] * sca);
                    this._eye2[1] = this._look2[1] + (vec[1] * sca);
                    this._eye2[2] = this._look2[2] + (vec[2] * sca);

                    this._up2[0] = this._up1[0];
                    this._up2[1] = this._up1[1];
                    this._up2[2] = this._up1[2];

                    this._flyEyeLookUp = false;

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

                    this._flyEyeLookUp = true;
                }

                this.fire("started", params, true);

                this._time1 = Date.now();
                this._time2 = this._time1 + (params.duration ? params.duration * 1000 : this._duration);

                this._flying = true; // False as soon as we stop

                xeogl.scheduleTask(this._update, this);
            };
        })(),

        /**
         * Jumps this CameraFlightAnimation's {{#crossLink "Camera"}}{{/crossLink}} to the given target.
         *
         *
         *     * When the target is a boundary, this CameraFlightAnimation will position the {{#crossLink "Camera"}}{{/crossLink}}
         *     at where the target fills most of the canvas.
         *     * When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
         *      vectors, then this CameraFlightAnimation will jump the {{#crossLink "Camera"}}{{/crossLink}} to that target.
         * @method flyTo
         * @param params  {*|Component} Either a parameters object or a {{#crossLink "Component"}}{{/crossLink}} subtype that has a {{#crossLink "WorldBoundary"}}{{/crossLink}}.
         * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
         * {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position will
         * swing away from its {{#crossLink "Camera/eye:property"}}look{{/crossLink}} position as it flies to the target.
         * @param [params.component] {Number|String|Component} ID or instance of a component to fly to.
         * @param [params.aabb] {*}  World-space axis-aligned bounding box (AABB) target to fly to.
         * @param [params.eye] {Float32Array} Position to fly the eye position to.
         * @param [params.look] {Float32Array} Position to fly the look position to.
         * @param [params.up] {Float32Array} Position to fly the up vector to.
         * @param [params.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
         * fill the canvas on arrival. Overrides {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}}.
         * @param [params.fit] {Boolean} Whether to fit the target to the view volume. Overrides {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}.
         */
        jumpTo: (function () {

            var eyeLookVec = math.vec3();
            var newEye = math.vec3();
            var newLook = math.vec3();
            var newUp = math.vec3();
            var newLookEyeVec = math.vec3();
            var tempVec3e = math.vec3();

            return function (params) {

                if (this._flying) {
                    this.stop();
                }

                var camera = this._attached.camera;

                if (!camera) {
                    return;
                }

                var view = camera.view;

                var aabb;
                var sphere;
                var componentId;

                if (params.worldBoundary) {

                    // Argument is a Component subtype with a worldBoundary

                    sphere = params.worldBoundary.sphere;

                } else if (params.sphere) {

                    sphere = params.sphere;

                } else if (params.aabb) {

                    aabb = params.aabb;

                    // Argument is a Boundary3D

                } else if (params.length === 6) { // [xmin,ymin,zmin, xmax,ymax,zmax]

                    // Argument is an AABB

                    aabb = params;

                } else if (params.length === 4) { // [x,y,z,radius]

                    // Argument is an OBB

                    sphere = params;

                } else if (params.eye || params.look || params.up) {

                    // Argument is eye, look and up positions

                    newEye = params.eye;
                    newLook = params.look;
                    newUp = params.up;

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

                    sphere = worldBoundary.sphere;
                }

                var offset = params.offset;

                if (aabb || sphere) {

                    var diag;

                    if (aabb) {

                        if (aabb[3] <= aabb[0] || aabb[4] <= aabb[1] || aabb[5] <= aabb[2]) {

                            // Don't fly to an empty boundary
                            return;
                        }

                        diag = math.getAABB3Diag(aabb);
                        math.getAABB3Center(aabb, newLook);

                    } else {

                        if (sphere[3] <= 0) {
                            return;
                        }

                        diag = sphere[3] * 2;

                        newLook[0] = sphere[0];
                        newLook[1] = sphere[1];
                        newLook[2] = sphere[2];
                    }

                    if (this._trail) {
                        math.subVec3(view.look, newLook, newLookEyeVec);
                    } else {
                        math.subVec3(view.eye, view.look, newLookEyeVec);
                    }

                    math.normalizeVec3(newLookEyeVec);

                    var dist;

                    var fit = (params.fit !== undefined) ? params.fit : this._fit;
                    if (fit) {
                        dist = Math.abs((diag) / Math.tan((params.fitFOV || this._fitFOV) * xeogl.math.DEGTORAD));

                    } else {
                        dist = math.lenVec3(math.subVec3(view.eye, view.look, tempVec3e));
                    }

                    math.mulVec3Scalar(newLookEyeVec, dist);

                    view.eye = math.addVec3(newLook, newLookEyeVec, newEye);
                    view.look = newLook;

                } else if (newEye || newLook || newUp) {

                    if (newEye) {
                        view.eye = newEye;
                    }

                    if (newLook) {
                        view.look = newLook;
                    }

                    if (newUp) {
                        view.up = newUp;
                    }
                }
            };
        })(),

        _update: (function () {

            var newLookEyeVec = math.vec3();
            var newEye = math.vec3();
            var newLook = math.vec3();
            var newUp = math.vec3();
            var lookEyeVec = math.vec3();

            return function () {

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

                if (this._flyEyeLookUp) {

                    view.eye = math.lerpVec3(t, 0, 1, this._eye1, this._eye2, newEye);
                    view.look = math.lerpVec3(t, 0, 1, this._look1, this._look2, newLook);
                    view.up = math.lerpVec3(t, 0, 1, this._up1, this._up2, newUp);

                } else {

                    math.lerpVec3(t, 0, 1, this._look1, this._look2, newLook);

                    var dist;

                    if (this._trail) {
                        math.subVec3(newLook, view.look, newLookEyeVec);

                    } else {
                        math.subVec3(view.eye, view.look, newLookEyeVec);
                    }

                    math.normalizeVec3(newLookEyeVec);
                    math.lerpVec3(t, 0, 1, this._eye1, this._eye2, newEye);
                    math.subVec3(newEye, newLook, lookEyeVec);
                    dist = math.lenVec3(lookEyeVec);
                    math.mulVec3Scalar(newLookEyeVec, dist);

                    view.eye = math.addVec3(newLook, newLookEyeVec, newEye);
                    view.look = newLook;
                }

                if (stopping) {
                    this.stop();
                    return;
                }

                xeogl.scheduleTask(this._update, this); // Keep flying
            };
        })(),

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

            this._aabbHelper.visibility.visible = false;

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

            this._aabbHelper.visibility.visible = false;

            this._flying = false;

            this._time1 = null;
            this._time2 = null;

            if (this._callback) {
                this._callback = null;
            }

            this.fire("canceled", true, true);
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} being controlled by this CameraFlightAnimation.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFlightAnimation. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * Fires a {{#crossLink "CameraFlightAnimation/camera:event"}}{{/crossLink}} event on change.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this CameraFlightAnimation's {{#crossLink "CameraFlightAnimation/camera:property"}}{{/crossLink}}
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
             * Flight duration, in seconds, when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}{{/crossLink}}.
             *
             * Stops any flight currently in progress.
             *
             * Fires a {{#crossLink "CameraFlightAnimation/duration:event"}}{{/crossLink}} event on change.
             *
             * @property duration
             * @default 0.5
             * @type Number
             */
            duration: {

                set: function (value) {

                    value = value || 0.5;

                    /**
                     Fired whenever this CameraFlightAnimation's {{#crossLink "CameraFlightAnimation/duration:property"}}{{/crossLink}} property changes.

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
             * When true, will ensure that this CameraFlightAnimation is flying to a boundary it will always adjust the distance between the
             * {{#crossLink "CameraFlightAnimation/camera:property"}}camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}}
             * and {{#crossLink "Lookat/look:property"}}{{/crossLink}}
             * so as to ensure that the target boundary is always filling the view volume.
             *
             * When false, the eye will remain at its current distance from the look position.
             *
             * Fires a {{#crossLink "CameraFlightAnimation/fit:event"}}{{/crossLink}} event on change.
             *
             * @property fit
             * @type Boolean
             * @default true
             */
            fit: {

                set: function (value) {

                    this._fit = value !== false;

                    /**
                     * Fired whenever this CameraFlightAnimation's
                     * {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}} property changes.
                     * @event fit
                     * @param value The property's new value
                     */
                    this.fire("fit", this._fit);
                },

                get: function () {
                    return this._fit;
                }
            },


            /**
             * How much of field-of-view, in degrees, that a target {{#crossLink "Entity"}}{{/crossLink}} or its AABB should
             * fill the canvas when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}{{/crossLink}} or {{#crossLink "CameraFlightAnimation/jumpTo:method"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "CameraFlightAnimation/fitFOV:event"}}{{/crossLink}} event on change.
             *
             * @property fitFOV
             * @default 45
             * @type Number
             */
            fitFOV: {

                set: function (value) {

                    value = value || 45;

                    /**
                     Fired whenever this CameraFlightAnimation's {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}} property changes.

                     @event fitFOV
                     @param value {Number} The property's new value
                     */
                    this._fitFOV = value;
                },

                get: function () {
                    return this._fitFOV;
                }
            },

            /**
             * When true, will cause this CameraFlightAnimation to point the {{#crossLink "CameraFlightAnimation/camera:property"}}{{/crossLink}}
             * in the direction that it is travelling.
             *
             * Fires a {{#crossLink "CameraFlightAnimation/trail:event"}}{{/crossLink}} event on change.
             *
             * @property trail
             * @type Boolean
             * @default false
             */
            trail: {

                set: function (value) {

                    this._trail = !!value;

                    /**
                     * Fired whenever this CameraFlightAnimation's {{#crossLink "CameraFlightAnimation/trail:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event trail
                     * @param value The property's new value
                     */
                    this.fire("trail", this._trail);
                },

                get: function () {
                    return this._trail;
                }
            }
        },

        _getJSON: function () {

            var json = {
                duration: this._duration,
                fitFOV: this._fitFOV,
                fit: this._fit,
                trail: this._trail
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
