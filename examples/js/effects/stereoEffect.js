/**
 A **StereoEffect** sets up a stereo view for its {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <a href="../../examples/#effects_StereoEffect"><img src="../../assets/images/screenshots/StereoEffect.png"></img></a>

 ## Overview

 * Use a StereoEffect as a base class for split-view VR effects.

 <img src="../../../assets/images/StereoEffect.png"></img>

 ## Examples

 * [Stereo view using a StereoEffect](../../examples/#effects_StereoEffect)

 ## Usage

 Stereo view of an {{#crossLink "Entity"}}{{/crossLink}} using the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Camera"}}{{/crossLink}} and {{#crossLink "Viewport"}}{{/crossLink}}:

 ````javascript
 // Both the Entity and the StereoEffect use their Scene's default Camera and Viewport

 var entity = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 var stereoEffect = new xeogl.StereoEffect({
     eyeSep: 0.2, // Default
     focalLength: 20, // Default
     aperture: 45, // Default
     active: true // Default
 });
 ````

 Stereo view of an {{#crossLink "Entity"}}{{/crossLink}} using a custom {{#crossLink "Camera"}}{{/crossLink}} and {{#crossLink "Viewport"}}{{/crossLink}}:

 ````javascript
 var camera = new xeogl.Camera({
     view: new xeogl.Lookat({
         eye: [0, 0, 10],
         look: [0, 0, 0],
         up: [0, 1, 0]
     }),
     project: new xeogl.Perspective({
         fovy: 60,
         near: 0.1,
         far: 1000
     })
 });

 var viewport = new xeogl.Viewport();

 var entity = new xeogl.Entity({
     camera: camera,
     viewport: viewport,
     geometry: new xeogl.TorusGeometry()
 });

 var stereoEffect = new xeogl.StereoEffect({
     camera: camera,
     viewport: viewport,
     eyeSep: 0.2, // Default
     focalLength: 20, // Default
     aperture: 45, // Default
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
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this StereoEffect.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this StereoEffect. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.viewport] {String|Viewport} ID or instance of a {{#crossLink "Viewport"}}Viewport{{/crossLink}} for this StereoEffect.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this StereoEffect. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/viewport:property"}}viewport{{/crossLink}}.
 @param [cfg.eyeSep=0.2] Number Interpupillary distance (the distance between the center of the pupils of the two eyes).
 @param [cfg.focalLength=20] Focal length.
 @param [cfg.aperture=45] Aperture angle in degrees.
 @param [cfg.active=true] {Boolean} Whether or not this StereoEffect is active.
 @extends Entity
 */
(function () {

    "use strict";

    xeogl.StereoEffect = xeogl.Entity.extend({

        type: "xeogl.StereoEffect",

        _init: function (cfg) {

            this.camera = cfg.camera;
            this.viewport = cfg.viewport;
            this.eyeSep = cfg.eyeSep;
            this.focalLength = cfg.focalLength;
            this.aperture = cfg.aperture;
            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} attached to this StereoEffect.
             *
             * This StereoEffect will attach a {{#crossLink "Frustum"}}{{/crossLink}} to its
             * {{#crossLink "Camera"}}{{/crossLink}} if the {{#crossLink "Camera"}}Camera{{/crossLink}} does not have
             * one already, replacing the projection transform component that was already attached.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this StereoEffect. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    var camera = this._attach({
                        name: "camera",
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true,
                        //onAdded: this._transformUpdated,
                        onAddedScope: this
                    });

                    // Ensure that Camera has a Frustum projection

                    if (camera.project.type !== "xeogl.Frustum") {
                        this.warn("Replacing camera's projection with a xeogl.Frustum (needed for stereo)");
                        camera.project = camera.project.create(xeogl.Frustum);
                    }
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The {{#crossLink "Viewport"}}{{/crossLink}} attached to this StereoEffect.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this StereoEffect. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/viewport:property"}}Viewport{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property Viewport
             * @type Viewport
             */
            viewport: {

                set: function (value) {

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/Viewport:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event Viewport
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "viewport",
                        type: "xeogl.Viewport",
                        component: value,
                        sceneDefault: true,
                        //onAdded: this._transformUpdated,
                        onAddedScope: this
                    });
                },

                get: function () {
                    return this._attached.viewport;
                }
            },

            /**
             * Interpupillary distance (the distance between the center of the pupils of the two eyes).
             *
             * Fires an {{#crossLink "StereoEffect/eyeSep:event"}}{{/crossLink}} event on change.
             *
             * @property eyeSep
             * @type Number
             * @default 0.2
             */
            eyeSep: {

                set: function (value) {

                    value = value || 0.2;

                    if (this._eyeSep === value) {
                        return;
                    }

                    this._eyeSep = value;

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/eyeSep:property"}}{{/crossLink}} property changes.
                     * @event eyeSep
                     * @param value The property's new value
                     */
                    this.fire('eyeSep', this._eyeSep);
                },

                get: function () {
                    return this._eyeSep;
                }
            },

            /**
             * Focal length.
             *
             * Fires an {{#crossLink "StereoEffect/focalLength:event"}}{{/crossLink}} event on change.
             *
             * @property focalLength
             * @type Number
             * @default 20
             */
            focalLength: {

                set: function (value) {

                    value = value || 20;

                    if (this._focalLength === value) {
                        return;
                    }

                    this._focalLength = value;

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/focalLength:property"}}{{/crossLink}} property changes.
                     * @event focalLength
                     * @param value The property's new value
                     */
                    this.fire('focalLength', this._focalLength);
                },

                get: function () {
                    return this._focalLength;
                }
            },

            /**
             * Aperture angle in degrees.
             *
             * Fires an {{#crossLink "StereoEffect/aperture:event"}}{{/crossLink}} event on change.
             *
             * @property aperture
             * @type Number
             * @default 45
             */
            aperture: {

                set: function (value) {

                    value = value || 45;

                    if (this._aperture === value) {
                        return;
                    }

                    this._aperture = value;

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/aperture:property"}}{{/crossLink}} property changes.
                     * @event aperture
                     * @param value The property's new value
                     */
                    this.fire('aperture', this._aperture);
                },

                get: function () {
                    return this._aperture;
                }
            },

            /**
             * Flag which indicates whether this StereoEffect is active or not.
             *
             * Fires an {{#crossLink "StereoEffect/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;

                    this._active ? this._activate() : this._deactivate();

                    /**
                     * Fired whenever this StereoEffect's {{#crossLink "StereoEffect/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _activate: function () {

            var scene = this.scene;

            // Configure Scene to render twice for each frame
            // and only clear the frame before the first pass

            scene.passes = 2;
            scene.clearEachPass = false;

            var canvasBoundary;

            var eye;
            var look;
            var up;

            var math = xeogl.math;
            var eyeVec = math.vec3();
            var sepVec = math.vec3();
            var leftEye = math.vec3();
            var leftLook = math.vec3();
            var rightEye = math.vec3();
            var rightLook = math.vec3();

            // Intercept Scene before each render

            var self = this;

            this._onSceneRendering = scene.on("rendering",
                function (e) {

                    // We'll rely on the Scene's Default Camera and Viewport
                    // but we need to replace the Camera's projection with Frustum

                    var camera = self._attached.camera;
                    if (!camera) {
                        self.error("Can't activate: no xeogl.Camera attached");
                        return;
                    }

                    var viewport = self._attached.viewport;
                    if (!viewport) {
                        self.error("Can't activate: no xeogl.Viewport attached");
                        return;
                    }

                    var view = camera.view;

                    var frustum = camera.project; // Need to replace the Camera's projection with Frustum

                    viewport.autoBoundary = false;

                    var canvas = scene.canvas;

                    var eyeSep = self._eyeSep;
                    var near = 0.1;
                    var DTOR = 0.0174532925;
                    var radians = DTOR * self._aperture / 2;
                    var wd2 = near * Math.tan(radians);
                    var ndfl = near / self._focalLength;

                    canvasBoundary = canvas.boundary;

                    var canvasWidth = canvasBoundary[2];
                    var canvasHeight = canvasBoundary[3];
                    var halfCanvasWidth = Math.round(canvasWidth / 2);
                    var halfCanvasHeight = Math.round(canvasHeight / 2);
                    var canvasAspectRatio = canvasWidth / canvasHeight;

                    switch (e.pass) {

                        case 0:

                            eye = view.eye.slice();
                            look = view.look.slice();
                            up = view.up.slice();

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

                            view.eye = leftEye;
                            view.look = leftLook;

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

                            view.eye = rightEye;
                            view.look = rightLook;

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

            self._onSceneRendered = scene.on("rendered",
                function (e) {

                    var camera = self._attached.camera;
                    if (!camera) {
                        return;
                    }
                    var view = camera.view;

                    switch (e.pass) {
                        case 1:

                            view.eye = eye;
                            view.look = look;
                            view.up = up;

                            break;
                    }
                });
        },

        _deactivate: function () {
            var scene = this.scene;

            scene.passes = 1; // Don't need to restore scene.clearEachPass

            scene.off(this._onSceneRendering);
            scene.off(this._onSceneRendered);
        },

        _getJSON: function () {

            var json = {
                active: this._active
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            if (this._attached.viewport) {
                json.viewport = this._attached.viewport.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();
