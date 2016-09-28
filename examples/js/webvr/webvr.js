/**
 A **WebVR** component makes its {{#crossLink "Scene"}}{{/crossLink}} viewable with a webVR viewer.

 <ul>
 <li>Plug-and-play: just create a WebVR component within your xeoEngine {{#crossLink "Scene"}}{{/crossLink}} to make it viewable with a WebVR display.</li>
 <li>Activate or disable the WebVR component at any time to switch between webVR mode and normal mono viewing mode.</li>
 <li>Requires WebGL2 and WebVR support, which you'll have if you're running on a webVR viewer.</li>
 <li>Attaches to a {{#crossLink "Camera"}}{{/crossLink}}, defaults to its {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/camera:property"}}{{/crossLink}} if none is specified.</li>
 <li>Don't attach different view or projection transform components to the {{#crossLink "Camera"}}{{/crossLink}} while the WebVR component is active.</li>
 <li>You can however update the {{#crossLink "Camera"}}{{/crossLink}}'s view transformation at any time, to move the
 viewpoint around.
 </ul>

 <img src="../../../assets/images/WebVR.png"></img>

 ## Examples

 <ul>
 <li>[webVR cube](../../examples/webvr_webvr_cube.html)</li>
 <li>[webVR with random geometries](../../examples/webvr_webvr_geometries.html)</li>
 <li>[webVR with glTF gearbox model](../../examples/webvr_webvr_gearbox.html)</li>
 <li>[webVR with glTF gearbox model and entity explorer](../../examples/webvr_webvr_gearbox_explorer.html)</li>
 </ul>

 ## Usage

 In the following example we're going to set up a WebVR-viewable scene with xeoEngine, defining the scene step-by-step to
 emphasize the plug-and-play design of xeoEngine's API.

 **1. Create an entity**

 First we'll create a simple torus-shaped {{#crossLink "Entity"}}{{/crossLink}}, which will be within xeoEngine's default
 {{#crossLink "Scene"}}{{/crossLink}}, since we're not defining the {{#crossLink "Scene"}}{{/crossLink}} component
 explicitly. Our {{#crossLink "Entity"}}{{/crossLink}} is also implicitly connected to the
 {{#crossLink "Scene"}}{{/crossLink}}'s default {{#crossLink "Camera"}}{{/crossLink}}, since we didn't explicitly create
 a {{#crossLink "Camera"}}{{/crossLink}} for it either.

 ````javascript
 var entity = new XEO.Entity({
     geometry: new XEO.TorusGeometry(),
     material: new XEO.PhongMaterial({
        diffuseMap: new XEO.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 **2. Enable mouse/keyboard camera interaction**

 At this point we've got a textured torus floating in the middle of the canvas (which is also created automatically
 since we didn't specify one). Now we'll create a
 {{#crossLink "CameraControl"}}{{/crossLink}}, which immediately allows us to move our viewpoint around with the mouse and
 keyboard. This component is also within xeoEngine's default {{#crossLink "Scene"}}{{/crossLink}} and connected to the
 {{#crossLink "Scene"}}{{/crossLink}}'s default {{#crossLink "Camera"}}{{/crossLink}}.

 ````javascript
 new CameraControl();
 ````

 **3. Enable WebVR viewing**

 Now we can orbit, pan and zoom around the torus with the mouse and keyboard. Let's view it on a WebVR display by
 dropping a WebVR component into our default {{#crossLink "Scene"}}{{/crossLink}}.

 ````javascript
 var webvr = new WebVR();
 ````

 The WebVR component immediately activates, so at this point if we're running on a WebVR device we'll have a stereo
 view of the torus, which we can view with the stereo glasses.

 At any point we can always disable the WebVR effect to switch between normal WebGL mono viewing mode:

 ````javascript
 webvr.active = false; // Back to normal mono viewing..
 webvr.active = true; // ..and then back to WebVR stereo mode.

 ````

 ## Detecting support

 The **WebVR** will fire a "supported" event once it has determined whether or not the browser
 supports a webVR viewer:

 ````javascript
 webvr.on("supported", function (supported) {

        if (!supported) {

            // Not a webVR device

            this.error("This computer is not a WebVR viewer!"); // Log error on the XEO.WebVR component

            // At this point you could just destroy the XEO.WebVR to make it detach from the Camera
        }
    });
 ````
 @class WebVR
 @module XEO
 @submodule webvr
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this WebVR in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this WebVR.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this WebVR.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this WebVR. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.nearClip=0.1] {Number} Position of the near clipping plane on the View-space Z-axis.
 @param [cfg.farClip=10000] {Number} Position of the far clipping plane on the View-space Z-axis.
 @param [cfg.displaySize=0.521,0.293] {Array of Number} The viewer display size.
 @param [cfg.displayResolution=1920,1080] {Array of Number} The viewer display resolution.
 @param [cfg.active=true] {Boolean} Whether or not this WebVR is initially active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.WebVR = XEO.Component.extend({

        type: "XEO.WebVR",

        _init: function (cfg) {

            this._super(cfg);

            var self = this;

            this._supported = false; // True as soon as webVR support is detected
            this._vrDisplay = null;

            // Find WebVR display(s)

            if (!navigator.getVRDisplays) {

                this.error("WebVR is not supported by this browser");
                this.fire("supported", this._supported = false, false);

            } else {

                navigator.getVRDisplays().then(function (displays) {

                    if (displays.length === 0) {
                        self.error("No WebVR displays found");
                        self.fire("supported", self._supported = false, false);
                        return;
                    }

                    self._frameData = new VRFrameData();
                    self._vrDisplay = displays[0];

                    self.fire("supported", self._supported = true, false); // Battlestation is fully operational.
                });
            }

            // Set properties on this XEO.WebVR (see _props below)

            this.camera = cfg.camera;
            this.viewport = cfg.viewport;
            this.nearClip = cfg.nearClip;
            this.farClip = cfg.farClip;
            this.active = cfg.active;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} attached to this WebVR component.
             *
             * The WebVR component will attach a {{#crossLink "Projection"}}{{/crossLink}} to its
             * {{#crossLink "Camera"}}{{/crossLink}} if the {{#crossLink "Camera"}}Camera{{/crossLink}} does not have
             * one already, replacing whatever projection transform component was already attached.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this WebVR component. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * No other component should modify the state of the {{#crossLink "Camera"}}{{/crossLink}} while
             * it's attached to this WebVR component. There is no prevention or check for that, so if that
             * happens you'll get unexpected results.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this WebVR component's {{#crossLink "WebVR/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    var camera = this._attach({
                        name: "camera",
                        type: "XEO.Camera",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.camera;
                }
            },

            /**
             * The {{#crossLink "Viewport"}}{{/crossLink}} attached to this Webvr.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Webvr. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/viewport:property"}}Viewport{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property Viewport
             * @type Viewport
             */
            viewport: {

                set: function (value) {

                    /**
                     * Fired whenever this Webvr's {{#crossLink "Webvr/Viewport:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event Viewport
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "viewport",
                        type: "XEO.Viewport",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.viewport;
                }
            },

            /**
             * Position of this WebVR's near plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "WebVR/nearClip:event"}}{{/crossLink}} event on change.
             *
             * @property nearClip
             * @default 0.1
             * @type Number
             */
            nearClip: {

                set: function (value) {

                    this._nearClip = (value !== undefined && value !== null) ? value : 0.1;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this WebVR's   {{#crossLink "WebVR/nearClip:property"}}{{/crossLink}} property changes.
                     * @event nearClip
                     * @param value The property's new value
                     */
                    this.fire("nearClip", this._nearClip);
                },

                get: function () {
                    return this._nearClip;
                }
            },

            /**
             * Position of this WebVR's far plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "WebVR/farClip:event"}}{{/crossLink}} event on change.
             *
             * @property farClip
             * @default 10000.0
             * @type Number
             */
            farClip: {

                set: function (value) {

                    this._farClip = (value !== undefined && value !== null) ? value : 10000;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this WebVR's  {{#crossLink "WebVR/farClip:property"}}{{/crossLink}} property changes.
                     *
                     * @event farClip
                     * @param value The property's new value
                     */
                    this.fire("farClip", this._farClip);
                },

                get: function () {
                    return this._farClip;
                }
            },

            /**
             * Flag which indicates whether this WebVR component is active or not.
             *
             * Note that this WebVR component can still be activated when the browser does not support WebVR.
             *
             * Fires an {{#crossLink "WebVR/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = value !== false;

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;
                    this._active ? this._activate() : this._deactivate();

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this WebVR component's {{#crossLink "WebVR/active:property"}}{{/crossLink}} property changes.
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
            this._onSceneRendering = this.scene.on("rendering", this._rendering, this);
        },

        _rendering: function (e) { // Scene render callback, called for left and right eye within each render

            if (!this._supported) {

                // Support is found asynchronously and we are able to be active while looking for it.
                // Come back on next render, maybe we'll have support then.

                return;
            }

            var camera = this._attached.camera;

            if (!camera) {
                return; // Come back on next render, maybe we'll have a camera then
            }

            var viewport = this._attached.viewport;

            if (!viewport) { // Come back on next render, maybe we'll have a viewport then
                return;
            }

            // Need to have XEO.Transforms for viewing and projection
            // on the Camera, so that we can set matrices on them.

            if (camera.project.type !== "XEO.Transform") {
                this.warn("Replacing camera's projection transform with a XEO.Transform (needed for WebVR)");
                this._oldProject = camera.project; // Save so we can restore on deactivation
                camera.project = camera.create(XEO.Transform);
            }

            if (!camera.view.parent) {
                camera.view.postMultiply = true;
                camera.view.parent = camera.create(XEO.Transform);
            }

            // If we have not yet configured the scene to do two passes per frame,
            // then configure it now and come back on the next render.
            // Note that we also configure the scene to clear the framebuffer before each pass.

            if (this.scene.passes !== 2 || !this.scene.clearEachPass) {
                this.scene.passes = 2;
                this.scene.clearEachPass = true;
                return;
            }

            var canvas = this.scene.canvas;
            var canvasBoundary = canvas.boundary;
            var canvasWidth = canvasBoundary[2];
            var canvasHeight = canvasBoundary[3];
            var halfCanvasWidth = Math.round(canvasWidth / 2);

            switch (e.pass) {

                case 0: // Left eye

                    this._vrDisplay.getFrameData(this._frameData);

                    camera.view.parent.matrix = this._frameData.leftViewMatrix;
                    camera.project.matrix = this._frameData.leftProjectionMatrix;
                    viewport.boundary = [0, 0, halfCanvasWidth, canvasHeight];

                    break;

                case 1: // Right eye

                    camera.view.parent.matrix = this._frameData.rightViewMatrix;
                    camera.project.matrix = this._frameData.rightProjectionMatrix;
                    viewport.boundary = [halfCanvasWidth, 0, halfCanvasWidth, canvasHeight];

                    break;
            }
        },

        _deactivate: function () { // Deactivates this XEO.WebVR

            var scene = this.scene;

            scene.passes = 1; // Don't need to restore scene.clearEachPass

            if (this._oldProject) { // Transforms were replaced on camera when activating - restore old transforms
                this._attached.camera.project = this._oldProject;
                this._oldProject = null;
                this._attached.camera.parent.destroy();
            }

            scene.off(this._onSceneRendering);
        },

        _getJSON: function () { // Returns JSON configuration of this component

            var json = {
                active: this._active,
                nearClip: this._nearClip,
                farClip: this._farClip
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            if (this._attached.viewport) {
                json.viewport = this._attached.viewport.id;
            }

            return json;
        },

        _destroy: function () { // Called on destruction of this component
            this.active = false;
        }
    });
})();
