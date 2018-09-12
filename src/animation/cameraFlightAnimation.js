/**
 A **CameraFlightAnimation** jumps or flies the {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Camera"}}{{/crossLink}} to look at a given target.

 <a href="../../examples/#animation_camera_flight"><img src="http://i.giphy.com/3o7TKP0jN800EQ99EQ.gif"></img></a>

 * TODO: Document behaviour for ortho projection
 * TODO: Update docs for camera refactor, where ortho and perspective components will always be present on camera

 ## Overview

 * Can be made to either fly or jump to its target.
 * While busy flying to a target, it can be stopped, or redirected to fly to a different target.

 A CameraFlightAnimation's target can be:

 * specific ````eye````, ````look```` and ````up```` positions,
 * an axis-aligned World-space bounding box (AABB), or
 * an instance or ID of any {{#crossLink "Component"}}{{/crossLink}} subtype that provides a World-space AABB.

 You can configure its {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}
 and {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}} properties to make it stop at the point where the target
 occupies a certain amount of the field-of-view.

 ## Examples

 * [Flying to random meshes](../../examples/#animation_camera_flight)

 ## Flying to a Mesh

 Flying to a {{#crossLink "Mesh"}}{{/crossLink}}:

 ````Javascript
 // Create a CameraFlightAnimation that takes one second to fly
 // the default Scene's Camera to each specified target
 var cameraFlight = new xeogl.CameraFlightAnimation({
    fit: true, // Default
    fitFOV: 45, // Default, degrees
    duration: 1 // Default, seconds
 }, function() {
           // Arrived
       });

 // Create a Mesh, which gets all the default components
 var mesh = new Mesh();

 // Fly to the Mesh's World-space AABB
 cameraFlight.flyTo(mesh);
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

 ## Flying to an AABB

 Flying the CameraFlightAnimation from the previous two examples explicitly to the {{#crossLink "Boundary3D"}}Boundary3D's{{/crossLink}}
 axis-aligned bounding box:

 ````Javascript
 cameraFlight.flyTo(mesh.aabb);
 ````

 @class CameraFlightAnimation
 @module xeogl
 @submodule animation
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraFlightAnimation.
 @param [cfg.fit=true] {Boolean} When true, will ensure that when this CameraFlightAnimation has flown or jumped to a boundary
 it will adjust the distance between the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}}
 and {{#crossLink "Lookat/look:property"}}{{/crossLink}} position so as to ensure that the target boundary is filling the view volume.
 @param [cfg.fitFOV=45] {Number} How much field-of-view, in degrees, that a target boundary should
 fill the canvas when fitting the {{#crossLink "Camera"}}Camera{{/crossLink}} to the target boundary. Only applies when the {{#crossLink "Camera"}}Camera{{/crossLink}}'s active projection is a{{#crossLink "Perspective"}}{{/crossLink}}.
 @param [cfg.trail] {Boolean} When true, will cause this CameraFlightAnimation to point the {{#crossLink "Camera"}}{{/crossLink}} in the direction that it is travelling.
 @param [cfg.duration=1] {Number} Flight duration, in seconds, when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}CameraFlightAnimation#flyTo(){{/crossLink}}.
 @extends Component
 */

import {math} from '../math/math.js';
import {utils} from '../utils.js';
import {tasks} from '../tasks.js';
import {Component} from '../component.js';
import {Mesh} from '../objects/mesh.js';
import {AABBGeometry} from '../geometry/aabbGeometry.js';
import {PhongMaterial} from '../materials/phongMaterial.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.CameraFlightAnimation";

const tempVec3 = math.vec3();
const newLook = math.vec3();
const newEye = math.vec3();
const newUp = math.vec3();
const newLookEyeVec = math.vec3();
const lookEyeVec = math.vec3();

class CameraFlightAnimation extends Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

        super.init(cfg);

        this._aabbHelper = new Mesh(this, { // Shows a wireframe box for target AABBs
            geometry: new AABBGeometry(this),
            material: new PhongMaterial(this, {
                diffuse: [0, 0, 0],
                ambient: [0, 0, 0],
                specular: [0, 0, 0],
                emissive: [0.5, 1.0, 0.5],
                lineWidth: 2
            }),
            visible: false,
            collidable: false
        });

        this._look1 = math.vec3();
        this._eye1 = math.vec3();
        this._up1 = math.vec3();
        this._look2 = math.vec3();
        this._eye2 = math.vec3();
        this._up2 = math.vec3();
        this._orthoScale1 = 1;
        this._orthoScale2 = 1;
        this._flying = false;
        this._flyEyeLookUp = false;
        this._flyingEye = false;
        this._flyingLook = false;
        this._callback = null;
        this._callbackScope = null;
        this._time1 = null;
        this._time2 = null;
        this.easing = cfg.easing !== false;

        this.duration = cfg.duration;
        this.fit = cfg.fit;
        this.fitFOV = cfg.fitFOV;
        this.trail = cfg.trail;
    }

    /**
     * Begins flying the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} to the given target.
     *
     *  * When the target is a boundary, the {{#crossLink "Camera"}}{{/crossLink}} will fly towards the target
     *    and stop when the target fills most of the canvas.
     *  * When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
     *    vectors, then this CameraFlightAnimation will interpolate the {{#crossLink "Camera"}}{{/crossLink}} to that target and stop there.
     * @method flyTo
     * @param [params=scene]  {*|Component} Either a parameters object or a {{#crossLink "Component"}}{{/crossLink}} subtype that has an AABB.
     * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
     * {{#crossLink "Lookat/eye:property"}}Camera's eye{{/crossLink}} position will
     * swing away from its {{#crossLink "Lookat/eye:property"}}look{{/crossLink}} position as it flies to the target.
     * @param [params.component] {Number|String|Component} ID or instance of a component to fly to. Defaults to the entire {{#crossLink "Scene"}}{{/crossLink}}.
     * @param [params.aabb] {*}  World-space axis-aligned bounding box (AABB) target to fly to.
     * @param [params.eye] {Float32Array} Position to fly the eye position to.
     * @param [params.look] {Float32Array} Position to fly the look position to.
     * @param [params.up] {Float32Array} Position to fly the up vector to.
     * @param [params.fit=true] {Boolean} Whether to fit the target to the view volume. Overrides {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}.
     * @param [params.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Object"}}{{/crossLink}} or its AABB should
     * fill the canvas on arrival. Overrides {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}}.
     * @param [params.duration] {Number} Flight duration in seconds.  Overrides {{#crossLink "CameraFlightAnimation/duration:property"}}{{/crossLink}}.
     * @param [params.orthoScale] {Number} TODO: document this
     * @param [callback] {Function} Callback fired on arrival
     * @param [scope] {Object} Optional scope for callback
     */
    flyTo(params, callback, scope) {

        params = params || this.scene;

        if (this._flying) {
            this.stop();
        }

        this._flying = false;

        this._callback = callback;
        this._callbackScope = scope;

        const camera = this.scene.camera;

        this._eye1[0] = camera.eye[0];
        this._eye1[1] = camera.eye[1];
        this._eye1[2] = camera.eye[2];

        this._look1[0] = camera.look[0];
        this._look1[1] = camera.look[1];
        this._look1[2] = camera.look[2];

        this._up1[0] = camera.up[0];
        this._up1[1] = camera.up[1];
        this._up1[2] = camera.up[2];

        this._orthoScale1 = camera.ortho.scale;
        this._orthoScale2 = params.orthoScale || this._orthoScale1;

        let aabb;
        let eye;
        let look;
        let up;
        let componentId;

        if (params.aabb) {
            aabb = params.aabb;

        } else if (params.length === 6) {
            aabb = params;

        } else if ((params.eye && params.look) || params.up) {
            eye = params.eye;
            look = params.look;
            up = params.up;

        } else if (params.eye) {
            eye = params.eye;

        } else if (params.look) {
            look = params.look;

        } else { // Argument must be an instance or ID of a Component (subtype)

            let component = params;
            if (utils.isNumeric(component) || utils.isString(component)) {
                componentId = component;
                component = this.scene.components[componentId];
                if (!component) {
                    this.error("Component not found: " + utils.inQuotes(componentId));
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
            aabb = component.aabb || this.scene.aabb;
        }

        const poi = params.poi;

        if (aabb) {
            if (aabb[3] < aabb[0] || aabb[4] < aabb[1] || aabb[5] < aabb[2]) { // Don't fly to an inverted boundary
                return;
            }
            if (aabb[3] === aabb[0] && aabb[4] === aabb[1] && aabb[5] === aabb[2]) { // Don't fly to an empty boundary
                return;
            }
            if (params.showAABB !== false) { // Show boundary
                this._aabbHelper.geometry.targetAABB = aabb;
                //this._aabbHelper.visible = true;
            }

            aabb = aabb.slice();
            const aabbCenter = math.getAABB3Center(aabb);

            this._look2 = poi || aabbCenter;

            const eyeLookVec = math.subVec3(this._eye1, this._look1, tempVec3);
            const eyeLookVecNorm = math.normalizeVec3(eyeLookVec);
            const diag = poi ? math.getAABB3DiagPoint(aabb, poi) : math.getAABB3Diag(aabb);
            const fitFOV = params.fitFOV || this._fitFOV;
            const sca = Math.abs(diag / Math.tan(fitFOV * math.DEGTORAD));

            this._orthoScale2 = diag * 1.1;

            this._eye2[0] = this._look2[0] + (eyeLookVecNorm[0] * sca);
            this._eye2[1] = this._look2[1] + (eyeLookVecNorm[1] * sca);
            this._eye2[2] = this._look2[2] + (eyeLookVecNorm[2] * sca);

            this._up2[0] = this._up1[0];
            this._up2[1] = this._up1[1];
            this._up2[2] = this._up1[2];

            this._flyEyeLookUp = false;

        } else if (eye || look || up) {

            this._flyEyeLookUp = !!eye && !!look && !!up;
            this._flyingEye = !!eye && !look;
            this._flyingLook = !!look && !eye;

            if (look) {
                this._look2[0] = look[0];
                this._look2[1] = look[1];
                this._look2[2] = look[2];
            }

            if (eye) {
                this._eye2[0] = eye[0];
                this._eye2[1] = eye[1];
                this._eye2[2] = eye[2];
            }

            if (up) {
                this._up2[0] = up[0];
                this._up2[1] = up[1];
                this._up2[2] = up[2];
            }
        }

        this.fire("started", params, true);

        this._time1 = Date.now();
        this._time2 = this._time1 + (params.duration ? params.duration * 1000 : this._duration);

        this._flying = true; // False as soon as we stop

        tasks.scheduleTask(this._update, this);
    }

    /**
     * Jumps the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} to the given target.
     *
     *  * When the target is a boundary, this CameraFlightAnimation will position the {{#crossLink "Camera"}}{{/crossLink}}
     *  at where the target fills most of the canvas.
     *  * When the target is an explicit {{#crossLink "Camera"}}{{/crossLink}} position, given as ````eye````, ````look```` and ````up````
     *  vectors, then this CameraFlightAnimation will jump the {{#crossLink "Camera"}}{{/crossLink}} to that target.
     *
     * @method flyTo
     * @param params  {*|Component} Either a parameters object or a {{#crossLink "Component"}}{{/crossLink}} subtype that has a World-space AABB.
     * @param[params.arc=0]  {Number} Factor in range [0..1] indicating how much the
     * {{#crossLink "Camera/eye:property"}}Camera's eye{{/crossLink}} position will
     * swing away from its {{#crossLink "Camera/eye:property"}}look{{/crossLink}} position as it flies to the target.
     * @param [params.component] {Number|String|Component} ID or instance of a component to fly to.
     * @param [params.aabb] {*}  World-space axis-aligned bounding box (AABB) target to fly to.
     * @param [params.eye] {Float32Array} Position to fly the eye position to.
     * @param [params.look] {Float32Array} Position to fly the look position to.
     * @param [params.up] {Float32Array} Position to fly the up vector to.
     * @param [params.fitFOV] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "Object"}}{{/crossLink}} or its AABB should
     * fill the canvas on arrival. Overrides {{#crossLink "CameraFlightAnimation/fitFOV:property"}}{{/crossLink}}.
     * @param [params.fit] {Boolean} Whether to fit the target to the view volume. Overrides {{#crossLink "CameraFlightAnimation/fit:property"}}{{/crossLink}}.
     */
    jumpTo(params) {
        this._jumpTo(params);
    }

    _jumpTo(params) {

        if (this._flying) {
            this.stop();
        }

        const camera = this.scene.camera;

        var aabb;
        var componentId;
        var newEye;
        var newLook;
        var newUp;

        if (params.aabb) { // Boundary3D
            aabb = params.aabb;

        } else if (params.length === 6) { // AABB
            aabb = params;

        } else if (params.eye || params.look || params.up) { // Camera pose
            newEye = params.eye;
            newLook = params.look;
            newUp = params.up;

        } else { // Argument must be an instance or ID of a Component (subtype)

            let component = params;

            if (utils.isNumeric(component) || utils.isString(component)) {
                componentId = component;
                component = this.scene.components[componentId];
                if (!component) {
                    this.error("Component not found: " + utils.inQuotes(componentId));
                    return;
                }
            }
            aabb = component.aabb || this.scene.aabb;
        }

        const poi = params.poi;

        if (aabb) {

            if (aabb[3] <= aabb[0] || aabb[4] <= aabb[1] || aabb[5] <= aabb[2]) { // Don't fly to an empty boundary
                return;
            }

            var diag = poi ? math.getAABB3DiagPoint(aabb, poi) : math.getAABB3Diag(aabb);

            newLook = poi || math.getAABB3Center(aabb, newLook);

            if (this._trail) {
                math.subVec3(camera.look, newLook, newLookEyeVec);
            } else {
                math.subVec3(camera.eye, camera.look, newLookEyeVec);
            }

            math.normalizeVec3(newLookEyeVec);
            let dist;
            const fit = (params.fit !== undefined) ? params.fit : this._fit;

            if (fit) {
                dist = Math.abs((diag) / Math.tan((params.fitFOV || this._fitFOV) * math.DEGTORAD));

            } else {
                dist = math.lenVec3(math.subVec3(camera.eye, camera.look, tempVec3));
            }

            math.mulVec3Scalar(newLookEyeVec, dist);

            camera.eye = math.addVec3(newLook, newLookEyeVec, tempVec3);
            camera.look = newLook;

        } else if (newEye || newLook || newUp) {

            if (newEye) {
                camera.eye = newEye;
            }
            if (newLook) {
                camera.look = newLook;
            }
            if (newUp) {
                camera.up = newUp;
            }
        }
    }

    _update() {
        if (!this._flying) {
            return;
        }
        const time = Date.now();
        let t = (time - this._time1) / (this._time2 - this._time1);
        const stopping = (t >= 1);
        if (t > 1) {
            t = 1;
        }
        t = this.easing ? this._ease(t, 0, 1, 1) : t;
        const camera = this.scene.camera;
        if (this._flyingEye || this._flyingLook) {
            if (this._flyingEye) {
                math.subVec3(camera.eye, camera.look, newLookEyeVec);
                camera.eye = math.lerpVec3(t, 0, 1, this._eye1, this._eye2, newEye);
                camera.look = math.subVec3(newEye, newLookEyeVec, newLook);
            } else if (this._flyingLook) {
                camera.look = math.lerpVec3(t, 0, 1, this._look1, this._look2, newLook);
                //    camera.eye = math.addVec3(newLook, newLookEyeVec, newEye);
                camera.up = math.lerpVec3(t, 0, 1, this._up1, this._up2, newUp);
            }
        } else if (this._flyEyeLookUp) {
            camera.eye = math.lerpVec3(t, 0, 1, this._eye1, this._eye2, newEye);
            camera.look = math.lerpVec3(t, 0, 1, this._look1, this._look2, newLook);
            camera.up = math.lerpVec3(t, 0, 1, this._up1, this._up2, newUp);
        } else {
            math.lerpVec3(t, 0, 1, this._look1, this._look2, newLook);
            let dist;
            if (this._trail) {
                math.subVec3(newLook, camera.look, newLookEyeVec);
            } else {
                math.subVec3(camera.eye, camera.look, newLookEyeVec);
            }
            math.normalizeVec3(newLookEyeVec);
            math.lerpVec3(t, 0, 1, this._eye1, this._eye2, newEye);
            math.subVec3(newEye, newLook, lookEyeVec);
            dist = math.lenVec3(lookEyeVec);
            math.mulVec3Scalar(newLookEyeVec, dist);
            camera.eye = math.addVec3(newLook, newLookEyeVec, newEye);
            camera.look = newLook;
        }
        this.scene.camera.ortho.scale = this._orthoScale1 + (t * (this._orthoScale2 - this._orthoScale1));
        if (stopping) {
            this.stop();
            return;
        }
        tasks.scheduleTask(this._update, this); // Keep flying
    }

    _ease(t, b, c, d) { // Quadratic easing out - decelerating to zero velocity http://gizma.com/easing
        t /= d;
        return -c * t * (t - 2) + b;
    }

    /**
     * Stops an earlier flyTo, fires arrival callback.
     * @method stop
     */
    stop() {
        if (!this._flying) {
            return;
        }
        this._aabbHelper.visible = false;
        this._flying = false;
        this._time1 = null;
        this._time2 = null;
        const callback = this._callback;
        if (callback) {
            this._callback = null;
            if (this._callbackScope) {
                callback.call(this._callbackScope);
            } else {
                callback();
            }
        }
        this.fire("stopped", true, true);
    }

    /**
     * Cancels an earlier flyTo without calling the arrival callback.
     * @method cancel
     */
    cancel() {
        if (!this._flying) {
            return;
        }
        this._aabbHelper.visible = false;
        this._flying = false;
        this._time1 = null;
        this._time2 = null;
        if (this._callback) {
            this._callback = null;
        }
        this.fire("canceled", true, true);
    }

    /**
     * Flight duration, in seconds, when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}CameraFlightAnimation#flyTo(){{/crossLink}}.
     *
     * Stops any flight currently in progress.
     *
     * @property duration
     * @default 0.5
     * @type Number
     */
    set duration(value) {
        this._duration = value ? (value * 1000.0) : 500;
        this.stop();
    }

    get duration() {
        return this._duration / 1000.0;
    }

    /**
     * When true, will ensure that this CameraFlightAnimation is flying to a boundary it will always adjust the distance between the
     * {{#crossLink "CameraFlightAnimation/camera:property"}}camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}}
     * and {{#crossLink "Lookat/look:property"}}{{/crossLink}}
     * so as to ensure that the target boundary is always filling the view volume.
     *
     * When false, the eye will remain at its current distance from the look position.
     *
     * @property fit
     * @type Boolean
     * @default true
     */
    set fit(value) {
        this._fit = value !== false;
    }

    get fit() {
        return this._fit;
    }


    /**
     * How much of the perspective field-of-view, in degrees, that a target {{#crossLink "Object"}}{{/crossLink}} or its AABB should
     * fill the canvas when calling {{#crossLink "CameraFlightAnimation/flyTo:method"}}CameraFlightAnimation#jumpTo(){{/crossLink}} or {{#crossLink "CameraFlightAnimation/jumpTo:method"}}{{/crossLink}}.
     *
     * @property fitFOV
     * @default 45
     * @type Number
     */
    set fitFOV(value) {
        this._fitFOV = value || 45;
    }

    get fitFOV() {
        return this._fitFOV;
    }

    /**
     * When true, will cause this CameraFlightAnimation to point the {{#crossLink "CameraFlightAnimation/camera:property"}}{{/crossLink}}
     * in the direction that it is travelling.
     *
     * @property trail
     * @type Boolean
     * @default false
     */
    set trail(value) {
        this._trail = !!value;
    }

    get trail() {
        return this._trail;
    }
}

componentClasses[type] = CameraFlightAnimation;

export {CameraFlightAnimation};
