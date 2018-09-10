/**
 A **CameraFollowAnimation** makes the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} dynamically follow a
 target component in order to keep it entirely in camera.

 <a href="../../examples/#animation_camera_follow_entity"><img src="http://i.giphy.com/l0HlHcuzAjhMQ8YSY.gif"></img></a>

 ## Overview

 * A target can be an instance or ID of any {{#crossLink "Component"}}{{/crossLink}} subtype that provides a World-space AABB.
 * Can be configured to either fly or jump to each updated position of the target.
 * Can be configured to automatically adjust the distance between the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Lookat"}}{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} to keep the target fitted to the view volume.

 ## Examples

 * [Following an Mesh with the Camera](../../examples/#animation_camera_follow_entity)
 * [Following an Mesh with the Camera, keeping Mesh fitted to view volume](../../examples/#animation_camera_follow_entity_fitToView)

 ## Usage

 In the example below, we'll use a CameraFollowAnimation to automatically follow an {{#crossLink "Mesh"}}{{/crossLink}}. Our CameraFollowAnimation's
 {{#crossLink "CameraFollowAnimation/fit:property"}}{{/crossLink}} property is set ````true````, which causes it to automatically
 keep the {{#crossLink "Mesh"}}{{/crossLink}} fitted to the view volume. Although we can orbit the
 {{#crossLink "Mesh"}}{{/crossLink}} using the {{#crossLink "CameraControl"}}{{/crossLink}}, we you can't control the
 distance of the {{#crossLink "Camera"}}{{/crossLink}} from the {{#crossLink "Mesh"}}{{/crossLink}} because our CameraFollowAnimation
 automatically controls that distance in order to do the automatic fitting.

 ````javascript
 // Create a red torus Mesh with a Translate modelling transform
 // that allows it to move around in World-space
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TorusGeometry(),
     material: new xeogl.PhongMaterial({
          diffuse: [1, 0.3, 0.3]
     }),
     transform: new xeogl.Translate({
         xyz: [0,0,0]
     })
 });

 // Create a CameraFollowAnimation that makes the Scene's Camera's Lookat follow the Mesh while keeping it
 // fitted to the view volume. The CameraFollowAnimation will jump to each new location, and since an update will occur on every frame,
 // the effect will be as if we're smoothly flying after the Mesh. If the updates occur sporadically,
 // then we would probably instead configure it to fly to each update, to keep the animation smooth.
 var cameraFollowAnimation = new xeogl.CameraFollowAnimation({
     target: mesh,
     fit: true,   // Fit target to view volume
     fitFOV: 35,  // Target will occupy 35 degrees of the field-of-view
     fly: false // Jump to each updated boundary extents
 });

 // Create a SplineCurve along which we'll animate our Mesh
 var curve = new xeogl.SplineCurve({
     points: [
         [-10, 0, 0],
         [-5, 15, 0],
         [20, 15, 0],
         [10, 0, 0]
     ]
 });

 // Bind the Mesh Translate to a point on the SplineCurve
 curve.on("point", function(point) {
     mesh.transform.xyz = point;
 });

 // Animate the point along the SplineCurve using the Scene clock
 curve.scene.on("tick", function(e) {
     curve.t = (e.time - e.startTime) * 0.01;
 });

 // Allow user control of the Camera with mouse and keyboard
 // (zooming will be overridden by the auto-fitting configured on our CameraFollowAnimation)
 new xeogl.CameraControl();
 ````

 @class CameraFollowAnimation
 @module xeogl
 @submodule animation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CameraFollowAnimation within xeogl's default {{#crossLink "Scene"}}Scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {*} Optional map of user-defined metadata to attach to this CameraFollowAnimation.
 @param [cfg.target] {Number|String|Camera} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} to follow.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraFollowAnimation. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.fly] {Boolean}  Indicates whether this CameraFollowAnimation will either fly or jump to each updated position of the
 target {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}}.
 @param [cfg.fit] {Boolean} When true, will ensure that this CameraFollowAnimation automatically adjusts the distance between the {{#crossLink "Camera"}}{{/crossLink}}'s {{#crossLink "Lookat"}}{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}} to keep the target {{#crossLink "Boundary3D"}}{{/crossLink}} fitted to the view volume.
 @param [cfg.fitFOV=45] {Number} How much of field-of-view, in degrees, that a target {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}} should
 fill the canvas when fitting to camera.
 @param [cfg.trail] {Boolean} When true, will cause this CameraFollowAnimation to point the camera in the direction that it is travelling.
 @extends Component
 */
xeogl.CameraFollowAnimation = class xeoglCameraFollowAnimation extends xeogl.Component {

    init(cfg) {

        super.init(cfg);

        this._cameraFlight = new xeogl.CameraFlightAnimation(this);

        this.target = cfg.target;
        this.fly = cfg.fly;
        this.fit = cfg.fit;
        this.fitFOV = cfg.fitFOV;
        this.trail = cfg.trail;
    }

    _update() {
        const target = this._attached.target;
        if (target && this._cameraFlight) { // This component might have been destroyed
            if (this._fly) {
                this._cameraFlight.flyTo({
                    aabb: target.aabb
                });
            } else {
                this._cameraFlight.jumpTo({
                    aabb: target.aabb
                });
            }
        }
    }

    /**
     * The World-space {{#crossLink "Boundary3D"}}{{/crossLink}} followed by this CameraFollowAnimation.
     *
     * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollowAnimation. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}} when set to a null or undefined value.
     *
     * @property target
     * @type Component
     */
    set target(value) {
        /**
         * Fired whenever this CameraFollowAnimation's {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}} property changes.
         *
         * @event target
         * @param value The property's new value
         */
        this._attach({
            name: "target",
            type: "xeogl.Component",
            component: value,
            sceneDefault: false,
            on: {
                boundary: {
                    callback: this._needUpdate,
                    scope: this
                }
            }
        });
        this._needUpdate();
    }

    get target() {
        return this._attached.target;
    }

    /**
     * Indicates whether this CameraFollowAnimation will either fly or jump to each updated position of the
     * {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}}.
     *
     * Leave this false if the target updates continuously, otherwise leave it true
     * if you want the camera to fly smoothly to each updated target extents
     * for a less disorientating experience.
     *
     * @property fly
     * @type Boolean
     * @default false
     */
    set fly(value) {
        this._fly = !!value;
    }

    get fly() {
        return this._fly;
    }

    /**
     * When true, will ensure that this CameraFollowAnimation always adjusts the distance between the {{#crossLink "Camera"}}
     * camera{{/crossLink}}'s {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} and {{#crossLink "Lookat/look:property"}}{{/crossLink}}
     * positions so as to ensure that the {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}} is always filling the view volume.
     *
     * When false, the eye will remain at its current distance from the look position.
     *
     * @property fit
     * @type Boolean
     * @default true
     */
    set fit(value) {
        this._cameraFlight.fit = value !== false;
        this._needUpdate();
    }

    get fit() {
        return this._cameraFlight.fit;
    }

    /**
     * When {{#crossLink "CameraFollowAnimation/fit:property"}}{{/crossLink}} is set, to fit the target
     * {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}} in view, this property indicates how much
     * of the total field-of-view, in degrees, that the {{#crossLink "CameraFollowAnimation/target:property"}}{{/crossLink}} should fill.
     *
     * @property fitFOV
     * @default 45
     * @type Number
     */
    set fitFOV(value) {
        this._cameraFlight.fitFOV = value;
        this._needUpdate();
    }

    get fitFOV() {
        return this._cameraFlight.fitFOV;
    }

    /**
     * When true, will cause this CameraFollowAnimation to point the {{#crossLink "Camera"}}{{/crossLink}}
     * in the direction that it is travelling.
     *
     * @property trail
     * @type Boolean
     * @default false
     */
    set trail(value) {
        this._cameraFlight.trail = value;
    }

    get trail() {
        return this._cameraFlight.trail;
    }
};
