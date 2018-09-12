/**
 A **StereoEffect** sets up a stereo view for its {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <a href="../../examples/#effects_stereo"><img src="../../assets/images/screenshots/StereoEffect.png"></img></a>

 ## Overview

 * Based on technique described in [this article by Paul Bourke](http://paulbourke.net/stereographics/stereorender/).

 ## Examples

 * [Stereo view using a StereoEffect](../../examples/#effects_stereo)

 ## Usage

 Stereo view of an {{#crossLink "Mesh"}}{{/crossLink}} using the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Camera"}}{{/crossLink}} and {{#crossLink "Viewport"}}{{/crossLink}}:

 ````javascript
 // Both the Mesh and the StereoEffect use their Scene's default Camera and Viewport

 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TorusGeometry()
 });

 var stereoEffect = new xeogl.StereoEffect({
     fov: 45, // Default
     active: true // Default
 });
 ````

 @class StereoEffect
 @module xeogl
 @submodule effects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this StereoEffect in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this StereoEffect.
 @param [cfg.fov=45] Field-of-view angle in degrees.
 @param [cfg.active=true] {Boolean} Whether or not this StereoEffect is active.
 @extends Mesh
 */

xeogl.StereoEffect = class xeoglStereoEffect extends xeogl.Component {

    init(cfg) {
        super.init(cfg);
        this.fov = cfg.fov;
        this.active = cfg.active !== false;
    }

    /**
     * Field-of-view angle in degrees.
     *
     *
     * @property fov
     * @type Number
     * @default 45
     */
    set fov(value) {
        value = value || 45;
        if (this._fov === value) {
            return;
        }
        this._fov = value;
    }

    get fov() {
        return this._fov;
    }

    /**
     * Flag which indicates whether this StereoEffect is active or not.
     *
     * @property active
     * @type Boolean
     * @default true
     */
    set active(value) {
        value = !!value;
        if (this._active === value) {
            return;
        }
        this._active = value;
        this._active ? this._activate() : this._deactivate();
    }

    get active() {
        return this._active;
    }

    _activate() {

        var scene = this.scene;
        var camera = scene.camera;
        var viewport = scene.viewport;
        var frustum = camera.frustum;
        var canvas = scene.canvas;

        scene.passes = 2; // Two passes per render
        scene.clearEachPass = false; // Clear before first pass only
        camera.projection = "frustum"; // Camera in frustum projection mode
        viewport.autoBoundary = false; // Allow custom viewport boundary

        var math = xeogl.math;
        var eye = math.vec3();
        var look = math.vec3();
        var up = math.vec3();
        var eyeLook = math.vec3();
        var eyeVec = math.vec3();
        var sepVec = math.vec3();
        var leftEye = math.vec3();
        var leftLook = math.vec3();
        var rightEye = math.vec3();
        var rightLook = math.vec3();

        var self = this;

        this._onSceneRendering = scene.on("rendering", function (e) {

            var focalLength = -Math.abs(math.lenVec3(math.subVec3(camera.look, camera.eye, eyeLook)));
            var eyeSep = (1 / 30) * focalLength;
            var near = 0.1;
            var DTOR = 0.0174532925;
            var radians = DTOR * self._fov / 2;
            var wd2 = near * Math.tan(radians);
            var ndfl = near / focalLength;
            var canvasBoundary = canvas.boundary;
            var canvasWidth = canvasBoundary[2];
            var canvasHeight = canvasBoundary[3];
            var halfCanvasWidth = Math.round(canvasWidth / 2);
            var canvasAspectRatio = canvasWidth / canvasHeight;

            switch (e.pass) {

                case 0:

                    eye.set(camera.eye);
                    look.set(camera.look);
                    up.set(camera.up);

                    math.subVec3(look, eye, eyeVec);
                    math.cross3Vec3(up, eyeVec, sepVec);
                    math.normalizeVec3(sepVec);
                    math.mulVec3Scalar(sepVec, eyeSep / 2.0);

                    // Find left and right viewpoints

                    math.subVec3(eye, sepVec, leftEye);
                    math.subVec3(look, sepVec, leftLook);

                    math.addVec3(eye, sepVec, rightEye);
                    math.addVec3(look, sepVec, rightLook);

                    // Set view transform to left side

                    camera.eye = leftEye;
                    camera.look = leftLook;

                    // Set projection frustum to left half of view space

                    frustum.left = -canvasAspectRatio * wd2 - 0.5 * eyeSep * ndfl;
                    frustum.right = canvasAspectRatio * wd2 - 0.5 * eyeSep * ndfl;
                    frustum.top = wd2 * 2;
                    frustum.bottom = -wd2 * 2;

                    // Set viewport to left half of canvas

                    viewport.boundary = [0, 0, halfCanvasWidth, canvasHeight];

                    break;

                case 1:

                    // Set view transform to right side

                    camera.eye = rightEye;
                    camera.look = rightLook;

                    // Set projection frustum to left half of view space

                    frustum.left = -canvasAspectRatio * wd2 + 0.5 * eyeSep * ndfl;
                    frustum.right = canvasAspectRatio * wd2 + 0.5 * eyeSep * ndfl;
                    frustum.top = wd2 * 2;
                    frustum.bottom = -wd2 * 2;

                    // Set viewport to right half of canvas

                    viewport.boundary = [halfCanvasWidth, 0, halfCanvasWidth, canvasHeight];

                    break;
            }
        });

        // Intercept Scene after each render
        // After the second pass we'll restore the thispoint

        this._onSceneRendered = scene.on("rendered", function (e) {
            switch (e.pass) {
                case 1:
                    camera.eye = eye;
                    camera.look = look;
                    camera.up = up;
                    break;
            }
        });
    }

    _deactivate() {
        var scene = this.scene;
        scene.passes = 1; // Don't need to restore scene.clearEachPass
        scene.viewport.autoBoundary = true;
        scene.off(this._onSceneRendering);
        scene.off(this._onSceneRendered);
    }

    destroy() {
        super.destroy();
        this.active = false;
    }
};
