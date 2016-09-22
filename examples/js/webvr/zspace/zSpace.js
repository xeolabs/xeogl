/**
 A **ZSpace** component makes its {{#crossLink "Scene"}}{{/crossLink}} viewable with a zSpace viewer.

 <ul>
 <li>Plug-and-play: just create a ZSpace component within your xeoEngine {{#crossLink "Scene"}}{{/crossLink}} to make it viewable with a ZSpace display.</li>
 <li>Activate or disable the ZSpace component at any time to switch between ZSpace mode and normal viewing mode.</li>
 <li>Requires WebGL2 and WebVR support, which you'll have if you're running on a zSpace viewer.</li>
 <li>Attaches to a {{#crossLink "Camera"}}{{/crossLink}}</li>
 <li>By default, a ZSpace component is attached to its parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}{{/crossLink}}.</li>
 <li>Don't attach different view or projection components to the {{#crossLink "Camera"}}{{/crossLink}} while the ZSpace component is active.</li>
 </ul>

 <img src="../../../assets/images/ZSpace.png"></img>

 ## Examples

 <ul>
 <li>[zSpace cube](../../examples/webvr_zspace_cube.html)</li>
 <li>[zSpace with random geometries](../../examples/webvr_zspace_geometries.html)</li>
 <li>[zSpace with gearbox model](../../examples/webvr_zspace_gearbox.html)</li>
 <li>[zSpace with gearbox model and entity explorer](../../examples/webvr_zspace_gearbox_explorer.html)</li>
 </ul>

 ## Usage

 In the following example we're going to set up a ZSpace-viewable scene with xeoEngine, defining the scene step-by-step to
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

 **3. Enable ZSpace viewing**

 Now we can orbit, pan and zoom around the torus with the mouse and keyboard. Let's view it on a ZSpace display by
 dropping a ZSPace component into our default {{#crossLink "Scene"}}{{/crossLink}}.

 ````javascript
 var zspace = new ZSpace();
 ````

 The ZSpace component immediately activates, so at this point if we're running on a ZSpace device we'll have a stereo
 view of the torus, which we can view with the stereo glasses.

 At any point we can always disable the ZSpace effect to switch between normal WebGL mono viewing mode:

 ````javascript
 zspace.active = false; // Back to normal mono viewing..
 zspace.active = true; // ..and then back to ZSpace stereo mode.

 ````

 ## Detecting support

 The **ZSpace** will fire a "supported" event once it has determined whether or not the browser
 supports a zSpace viewer:

 ````javascript
 zspace.on("supported", function (supported) {

        if (!supported) {

            // Not a zSpace device

            this.error("This computer is not a ZSpace viewer!"); // Log error on the XEO.ZSpace component

            // At this point you could just destroy the XEO.ZSpace to make it detach from the Camera
        }
    });
 ````

 ## Handling stylus input

 Reading the current World-space position and direction of the stylus:

 ````javascript
 var stylusPos = zspace.stylusPos;
 var stylusDir = zspace.stylusDir;
 ````

 Note that these properties only have meaningful values once the ZSpace has fired at least one {{#crossLink "ZSpace/stylusMoved:event"}}{{/crossLink}} event.

 Subscribing to stylus movement:

 ````javascript
 zspace.on("stylusMoved", function() {
     var stylusPos = zspace.stylusPos;
     var stylusDir = zspace.stylusDir;
     //...
 });
 ````

 Reading the current state of each stylus button:

 ````javascript
 var button0 = zspace.stylusButton0; // Boolean
 var button1 = zspace.stylusButton1;
 var button2 = zspace.stylusButton2;
 ````

 Subscribing to change of state of each stylus button:

 ````javascript
 zspace.on("stylusButton0", function(value) { // Boolean value
     this.log("stylusButton0 = " + value);
 });

 zspace.on("stylusButton1", function(value) {
     this.log("stylusButton1 = " + value);
 });

 zspace.on("stylusButton2", function(value) {
     this.log("stylusButton2 = " + value);
 });
 ````

 Picking an {{#crossLink "Entity"}}{{/crossLink}} with the stylus when button 0 is pressed:

 ````javascript
 zspace.on("stylusButton0", function() {

    var hit = zspace.scene.pick({
        pickSurface: true,
        origin: zspace.stylusPos,
        direction: zspace.stylusOrientation
    });

    if (hit) { // Picked an Entity

        var entity = hit.entity;

        // Other properties on the hit result:

        var primitive = hit.primitive; // Type of primitive that was picked, usually "triangles"
        var primIndex = hit.primIndex; // Position of triangle's first index in the picked Entity's Geometry's indices array
        var indices = hit.indices; // UInt32Array containing the triangle's vertex indices
        var localPos = hit.localPos; // Float32Array containing the picked Local-space position within the triangle
        var worldPos = hit.worldPos; // Float32Array containing the picked World-space position within the triangle
        var viewPos = hit.viewPos; // Float32Array containing the picked View-space position within the triangle
        var bary = hit.bary; // Float32Array containing the picked barycentric position within the triangle
        var normal = hit.normal; // Float32Array containing the interpolated normal vector at the picked position on the triangle
        var uv = hit.uv; // Float32Array containing the interpolated UV coordinates at the picked position on the triangle

        //...
    }
 });
 ````
 @class ZSpace
 @module XEO
 @submodule webvr
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ZSpace in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ZSpace.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this ZSpace.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this ZSpace. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.nearClip=0.1] {Number} Position of the near clipping plane on the View-space Z-axis.
 @param [cfg.farClip=10000] {Number} Position of the far clipping plane on the View-space Z-axis.
 @param [cfg.displaySize=0.521,0.293] {Array of Number} The viewer display size.
 @param [cfg.displayResolution=1920,1080] {Array of Number} The viewer display resolution.
 @param [cfg.active=true] {Boolean} Whether or not this ZSpace is initially active.
 @extends Component
 */
(function () {

    "use strict";

    var math = XEO.math;

    XEO.ZSpace = XEO.Component.extend({

        type: "XEO.ZSpace",

        _init: function (cfg) {

            this._super(cfg);

            var self = this;

            this._supported = false; // True as soon as zSpace support is detected
            this._displaySize = math.vec2([0.521, 0.293]);
            this._displayResolution = math.vec2([1920, 1080]);
            this._stylusButton0 = false;
            this._stylusButton1 = false;
            this._stylusButton2 = false;
            this._stylusPos = math.vec3([0, 0, 0]);
            this._stylusOrientation = math.identityQuaternion();

            this._stylusWorldPos = math.vec3([0, 0, 0]);
            this._stylusWorldDir = math.vec3([0, 0, 0]);

            // WebVR devices
            this._leftViewDevice = null;
            this._rightViewDevice = null;
            this._leftProjectionDevice = null;
            this._rightProjectionDevice = null;
            this._stylusDevice = null;
            this._stylusButtonsDevice = null;

            this._swapzSpace = false;
            this._zspaceEnable = true;
            this._stylusGamepad = null;
            this._canvasOffset = math.vec2([0, 0]);
            this._canvasOffset = math.vec2([310, 0]);

            // Matrices
            this._leftViewMatrix = math.identityMat4();
            this._rightViewMatrix = math.identityMat4();
            this._leftProjectionMatrix = math.identityMat4();
            this._rightProjectionMatrix = math.identityMat4();
            this._stylusCameraMatrix = math.identityMat4();

            // Stereo drawing framebuffer
            this._frameBufferAllocated = false; // True when allocated
            this._frameBuffer = null;
            this._frameBufferTexture = null;
            this._frameBufferDepthTexture = null;

            if (this.scene.canvas.webgl2 === false) {

                // WebGL 2 support is required

                this.error("WebGL 2 is not supported by this browser");
                this.fire("supported", this._supported = false, false);

            } else {

                // Find ZSPace display(s)

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

                        var i;
                        var display;
                        var displayName;

                        for (i = 0; i < displays.length; i++) {

                            display = displays[i];
                            displayName = display.displayName;

                            self.log("Found WebVR display: '" + displayName + "'");

                            switch (display.displayName) {
                                case "ZSpace Left View":
                                    self._leftViewDevice = display;
                                    break;

                                case "ZSpace Right View":
                                    self._rightViewDevice = display;
                                    break;

                                case "ZSpace Left Projection":
                                    self._leftProjectionDevice = display;
                                    break;

                                case "ZSpace Right Projection":
                                    self._rightProjectionDevice = display;
                                    break;

                                case "ZSpace Stylus":
                                    self._stylusDevice = display;
                                    break;

                                case "ZSpace Stylus Buttons":
                                    self._stylusButtonsDevice = display;
                                    break;
                            }
                        }

                        if (!self._leftViewDevice
                            || !self._rightViewDevice
                            || !self._leftProjectionDevice
                            || !self._rightProjectionDevice
                            || !self._stylusDevice
                            || !self._stylusButtonsDevice) {
                            self.log("ZSPace WebVR display(s) not found");
                            self.fire("supported", self._supported = false, false);
                            return;
                        }

                        self.fire("supported", self._supported = true, false); // Battlestation is fully operational.
                    });

                    var zspaceConnectHandler = function (e) {
                        self.log("zspace connected");
                        self._stylusGamepad = e.gamepad;
                    };

                    var zspaceDisconnectHandler = function (e) {
                        self.log("zspace disconnected");
                        self._stylusGamepad = null;
                    };

                    window.addEventListener("gamepadconnected", zspaceConnectHandler);
                    window.addEventListener("gamepaddisconnected", zspaceDisconnectHandler);
                }
            }

            // Set properties on this XEO.ZSpace (see _props below)

            this.camera = cfg.camera;
            this.nearClip = cfg.nearClip;
            this.farClip = cfg.farClip;
            this.displaySize = cfg.displaySize;
            this.displayResolution = cfg.displayResolution;
            this.active = cfg.active;
        },

        _props: {

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} attached to this ZSpace component.
             *
             * The ZSpace component will attach a {{#crossLink "Projection"}}{{/crossLink}} to its
             * {{#crossLink "Camera"}}{{/crossLink}} if the {{#crossLink "Camera"}}Camera{{/crossLink}} does not have
             * one already, replacing whatever projection transform component was already attached.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this ZSpace component. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * No other component should modify the state of the {{#crossLink "Camera"}}{{/crossLink}} while
             * it's attached to this ZSpace component. There is no prevention or check for that, so if that
             * happens you'll get unexpected results.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this ZSpace component's {{#crossLink "ZSpace/camera:property"}}{{/crossLink}}
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
             * Position of this ZSpace's near plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "ZSpace/nearClip:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this ZSpace's   {{#crossLink "ZSpace/nearClip:property"}}{{/crossLink}} property changes.
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
             * Position of this ZSpace's far plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "ZSpace/farClip:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this ZSpace's  {{#crossLink "ZSpace/farClip:property"}}{{/crossLink}} property changes.
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
             * The display resolution.
             *
             * Fires a {{#crossLink "ZSpace/displayResolution:event"}}{{/crossLink}} event on change.
             *
             * @property displayResolution
             * @default [1920, 1080]
             * @type Float32Array
             */
            displayResolution: {

                set: function (value) {

                    (this._displayResolution = this._displayResolution || new XEO.math.vec2()).set(value || [1920, 1080]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this ZSpace's {{#crossLink "ZSpace/displayResolution:property"}}{{/crossLink}} property changes.
                     * @event displayResolution
                     * @type Float32Array
                     * @param value The property's new value
                     */
                    this.fire("displayResolution", this._displayResolution);
                },

                get: function () {
                    return this._displayResolution;
                }
            },

            /**
             * The display size.
             *
             * Fires a {{#crossLink "ZSpace/displaySize:event"}}{{/crossLink}} event on change.
             *
             * @property displaySize
             * @default [0.521, 0.293]
             * @type Float32Array
             */
            displaySize: {

                set: function (value) {

                    (this._displaySize = this._displaySize || new XEO.math.vec2()).set(value || [0.521, 0.293]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this ZSpace's {{#crossLink "ZSpace/displaySize:property"}}{{/crossLink}} property changes.
                     * @event displaySize
                     * @type Float32Array
                     * @param value The property's new value
                     */
                    this.fire("displaySize", this._displaySize);
                },

                get: function () {
                    return this._displaySize;
                }
            },

            /**
             * The current World-space position of the stylus.
             *
             * Fires a {{#crossLink "ZSpace/stylusMoved:event"}}{{/crossLink}} event on change.
             *
             * @property stylusPos
             * @type Float32Array
             * @final
             */
            stylusPos: {
                get: function () {
                    return this._stylusWorldPos;
                }
            },

            /**
             * The current World-space direction the stylus is pointing in.
             *
             * Fires a {{#crossLink "ZSpace/stylusMoved:event"}}{{/crossLink}} event on change.
             *
             * @property stylusOrientation
             * @type Float32Array
             * @final
             */
            stylusDir: {
                get: function () {
                    return this._stylusWorldDir;
                }
            },

            /**
             * The current camera matrix for the stylus.
             *
             * Fires a {{#crossLink "ZSpace/stylusMoved:event"}}{{/crossLink}} event on change.
             *
             * @property stylusCameraMatrix
             * @type Float32Array
             * @final
             */
            stylusCameraMatrix: {
                get: function () {
                    return this._stylusCameraMatrix;
                }
            },

            /**
             * Whether or not the first button is down on the stylus.
             *
             * Fires a {{#crossLink "ZSpace/stylusButton0:event"}}{{/crossLink}} event on change.
             *
             * @property stylusButton0
             * @default false
             * @type Boolean
             * @final
             */
            stylusButton0: {
                get: function () {
                    return this._stylusButton0;
                }
            },

            /**
             * Whether or not the second button is down on the stylus.
             *
             * Fires a {{#crossLink "ZSpace/stylusButton1:event"}}{{/crossLink}} event on change.
             *
             * @property stylusButton1
             * @default false
             * @type Boolean
             * @final
             */
            stylusButton1: {
                get: function () {
                    return this._stylusButton1;
                }
            },

            /**
             * Whether or not the third button is down on the stylus.
             *
             * Fires a {{#crossLink "ZSpace/stylusButton2:event"}}{{/crossLink}} event on change.
             *
             * @property stylusButton2
             * @default false
             * @type Boolean
             * @final
             */
            stylusButton2: {
                get: function () {
                    return this._stylusButton2;
                }
            },

            /**
             * Flag which indicates whether this ZSpace component is active or not.
             *
             * Note that this ZSpace component can still be activated when the browser does not support ZSpace.
             *
             * Fires an {{#crossLink "ZSpace/active:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this ZSpace component's {{#crossLink "ZSpace/active:property"}}{{/crossLink}} property changes.
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

        _activate: function () { // Activates this ZSpace component

            var self = this;

            // Need to reallocate stereo framebuffer
            // whenever canvas resizes or context lost/restored

            this._onCanvasResized = this.scene.canvas.on("boundary", function () {
                self._destroyFrameBuffer(); // To recreate next time we bind it
            });

            this._onWebGLContextRestored = this.scene.canvas.on("webglContextRestored", function () {
                self._frameBufferAllocated = false; // Framebuffers were destroyed by context loss, reallocate next time we bind
            });

            // Intercept each render with a callback; we'll get two invocations
            // per frame, one for the left eye, a second for the right

            this._onSceneRendering = this.scene.on("rendering", this._rendering, this);

            // Attach renderer hooks to bind/unbind our stereo
            // framebuffer as the renderer's output buffer.

            this._renderer.bindOutputFramebuffer = function (pass) {
                if (!self._supported) { // Support not found yet
                    return;
                }
                self._bindFrameBuffer(pass); // pass will be 0 for left or 1 for right
            };

            this._renderer.unbindOutputFramebuffer = function (pass) {
                if (!self._supported) { // Support not found yet
                    return;
                }
                if (pass === 1) { // Unbind after right eye pass
                    self._unbindFrameBuffer();
                }
            };
        },

        _bindFrameBuffer: function (pass) { // Activates stereo output framebuffer, lazy-allocating it if needed
            if (!this._frameBufferAllocated) { // Becomes false on "webglContextRestored" event and when canvas resized
                this._allocateFrameBuffer();
            }
            // this.log("Binding stereo framebuffer - pass = " + pass);
            var gl = this.scene.canvas.gl;
            if (pass === 0) {
                gl.setStereoFramebuffer(this._frameBuffer, this._frameBufferTexture);
            }
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._frameBuffer);
            gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this._frameBufferTexture, 0, pass);
            gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, this._frameBufferDepthTexture, 0, pass);
        },

        _allocateFrameBuffer: function () { // Allocates stereo output framebuffer

            var gl = this.scene.canvas.gl;
            var canvas = this.scene.canvas.canvas;
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            // this.log("Creating stereo framebuffer - size = " + width + ", " + height);

            this._frameBufferTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._frameBufferTexture);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGB8, width, height, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

            if (this.frameBuffer == null) {
                this._frameBuffer = gl.createFramebuffer();
            }

            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._frameBuffer);
            gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this._frameBufferTexture, 0, 0);

            this._frameBufferDepthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._frameBufferDepthTexture);
            gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH24_STENCIL8, width, height, 2, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
            gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, this._frameBufferDepthTexture, 0, 0);

            gl.setStereoFramebuffer(this._frameBuffer, this._frameBufferTexture);

            this._frameBufferAllocated = true;
        },

        _destroyFrameBuffer: function () { // Called on deactivation to destroy stereo framebuffer

            if (!this._frameBufferAllocated) {
                return;
            }

            //this.log("Destroying stereo framebuffer");

            var gl = this.scene.canvas.gl;

            gl.deleteTexture(this._frameBufferDepthTexture);
            gl.deleteFramebuffer(this._frameBuffer);

            this._frameBufferAllocated = false;
        },

        _unbindFrameBuffer: function () { // Deactivates stereo output framebuffer
            var gl = this.scene.canvas.gl;
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
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

            // Need to have XEO.Transforms for viewing and projection
            // on the Camera, so that we can set matrices on them.

            if (camera.project.type !== "XEO.Transform") {
                this.warn("Replacing camera's projection transform with a XEO.Transform (needed for ZSpace)");
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

            switch (e.pass) {

                case 0: // Left eye

                    this._buildMatrices(); // Build the matrices on first pass

                    // This forces an update from the compositor (important!)
                    var gl = this.scene.canvas.gl;
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    camera.view.parent.matrix = this._leftViewMatrix;
                    camera.project.matrix = this._leftProjectionMatrix;

                    break;

                case 1: // Right eye

                    camera.view.parent.matrix = this._rightViewMatrix;
                    camera.project.matrix = this._rightProjectionMatrix;

                    break;
            }
        },

        _buildMatrices: (function () { // Builds view and projection matrices for left and right views, polls the stylus

            // Cached vars

            var canvas;
            var canvasPosition;
            var canvasWidth;
            var canvasHeight;
            var displayCenterX;
            var displayCenterY;
            var displayScaleFactorX;
            var displayScaleFactorY;
            var viewportCenterX;
            var viewportCenterY;

            var viewportShift = math.vec3([0.0, 0.0, 0.0]); // View offset
            var offsetTranslateMat = math.identityMat4(); // View offset translation matrix

            var scale = math.vec3(); // View scale
            var viewScaleMat = math.identityMat4(); // View scale matrix

            var tempVec3a = math.vec3();
            var tempVec3b = math.vec3();
            var vecEyeLook = math.vec3();

            var leftProjectionPose;
            var rightProjectionPose;

            var up;
            var down;
            var left;
            var right;

            // Viewer is looking down at model as if it were on a table

            var invViewMatrix = math.mat4();
            var stylusWorldMatrix = math.mat4();
            var stylusLocalMatrix = math.mat4();

            return function () {

                // Automatically derive viewer scale from base view transform
                var camera = this._attached.camera;
                var len = math.lenVec3(math.subVec3(camera.view.look, camera.view.eye, vecEyeLook));
                var viewerScale = len / 0.41;

                displayScaleFactorX = this._displaySize[0] / this._displayResolution[0];
                displayScaleFactorY = this._displaySize[1] / this._displayResolution[1];

                canvas = this.scene.canvas.canvas;

                canvasPosition = getPosition(canvas);
                canvasWidth = canvas.clientWidth * displayScaleFactorX * viewerScale;
                canvasHeight = canvas.clientHeight * displayScaleFactorY * viewerScale;
                displayCenterX = this._displayResolution[0] * 0.5;
                displayCenterY = this._displayResolution[1] * 0.5;
                viewportCenterX = canvasPosition.x + (canvas.clientWidth * 0.5);
                viewportCenterY = this._displayResolution[1] - (canvasPosition.y + (canvas.clientHeight * 0.5));

                // View offset matrix

                viewportShift[0] = (viewportCenterX - displayCenterX) * displayScaleFactorX;
                viewportShift[1] = (viewportCenterY - displayCenterY) * displayScaleFactorY;
                math.translationMat4v(viewportShift, offsetTranslateMat);

                // Viewer scale matrix

                scale[0] = viewerScale;
                scale[1] = viewerScale;
                scale[2] = viewerScale;
                math.scalingMat4v(scale, viewScaleMat);

                // Batches this component's outgoing update events for after all ZSpace device updates
                // processed, so that we have all device state available at the time we fire them

                var stylusMoved = false;
                var stylusButton0Updated = false;
                var stylusButton1Updated = false;
                var stylusButton2Updated = false;

                // Left eye viewing matrix

                var leftViewPose = this._leftViewDevice.getPose();
                if (leftViewPose && leftViewPose.orientation && leftViewPose.position) {

                    math.transformPoint3(offsetTranslateMat, leftViewPose.position, tempVec3a);
                    math.transformPoint3(viewScaleMat, tempVec3a, tempVec3b);
                    math.rotationTranslationMat4(leftViewPose.orientation, tempVec3b, this._leftViewMatrix);

                } else {
                    math.lookAtMat4v([-15, 0, -40], [-15, 0, 0], [0, 1, 0], this._leftViewMatrix);
                }

                // Right eye viewing matrix

                var rightViewPose = this._rightViewDevice.getPose();
                if (rightViewPose && rightViewPose.orientation && rightViewPose.position) {

                    math.transformPoint3(offsetTranslateMat, rightViewPose.position, tempVec3a);
                    math.transformPoint3(viewScaleMat, tempVec3a, tempVec3b);
                    math.rotationTranslationMat4(rightViewPose.orientation, tempVec3b, this._rightViewMatrix);

                } else {
                    math.lookAtMat4v([15, 0, -40], [15, 0, 0], [0, 1, 0], this._rightViewMatrix);
                }

                offsetTranslateMat[12] = -offsetTranslateMat[12];
                offsetTranslateMat[13] = -offsetTranslateMat[13];

                // Left eye projection matrix

                leftProjectionPose = this._leftProjectionDevice.getPose();
                if (leftProjectionPose && leftProjectionPose.orientation && leftProjectionPose.position) {
                    math.transformPoint3(offsetTranslateMat, leftProjectionPose.position, tempVec3a);
                    math.transformPoint3(viewScaleMat, tempVec3a, tempVec3b);
                    up = Math.atan((canvasHeight * 0.5 - tempVec3b[1]) / tempVec3b[2]);
                    down = Math.atan((canvasHeight * 0.5 + tempVec3b[1]) / tempVec3b[2]);
                    left = Math.atan((canvasWidth * 0.5 + tempVec3b[0]) / tempVec3b[2]);
                    right = Math.atan((canvasWidth * 0.5 - tempVec3b[0]) / tempVec3b[2]);
                    makeProjectionMatrix(up, down, left, right, this._nearClip, this._farClip, this._leftProjectionMatrix);

                } else {
                    math.frustumMat4(-0.1, 0.1, -0.1, 0.1, 0.1, 1000.0, this._leftProjectionMatrix);
                }

                // Right eye projection matrix

                rightProjectionPose = this._rightProjectionDevice.getPose();
                if (rightProjectionPose && rightProjectionPose.orientation && rightProjectionPose.position) {
                    math.transformPoint3(offsetTranslateMat, rightProjectionPose.position, tempVec3a);
                    math.transformPoint3(viewScaleMat, tempVec3a, tempVec3b);
                    up = Math.atan((canvasHeight * 0.5 - tempVec3b[1]) / tempVec3b[2]);
                    down = Math.atan((canvasHeight * 0.5 + tempVec3b[1]) / tempVec3b[2]);
                    left = Math.atan((canvasWidth * 0.5 + tempVec3b[0]) / tempVec3b[2]);
                    right = Math.atan((canvasWidth * 0.5 - tempVec3b[0]) / tempVec3b[2]);
                    makeProjectionMatrix(up, down, left, right, this._nearClip, this._farClip, this._rightProjectionMatrix);

                } else {
                    math.frustumMat4(-0.1, 0.1, -0.1, 0.1, 0.1, 1000.0, this._rightProjectionMatrix);
                }

                // Poll the stylus' pose

                var stylusPose = this._stylusDevice.getPose();
                if (stylusPose && stylusPose.orientation && stylusPose.position) {

                    var orientation = stylusPose.orientation;

                    math.transformPoint3(offsetTranslateMat, stylusPose.position, tempVec3a);
                    math.transformPoint3(viewScaleMat, tempVec3a, tempVec3b);

                    math.rotationTranslationMat4(orientation, tempVec3b, this._stylusCameraMatrix);

                    if (this._stylusPos[0] !== tempVec3b[0] && this._stylusPos[1] !== tempVec3b[1] && this._stylusPos[2] !== tempVec3b[2]) {
                        this._stylusPos[0] = tempVec3b[0];
                        this._stylusPos[1] = tempVec3b[1];
                        this._stylusPos[2] = tempVec3b[2];
                        stylusMoved = true;
                    }

                    if (this._stylusOrientation[0] !== orientation[0] &&
                        this._stylusOrientation[1] !== orientation[1] &&
                        this._stylusOrientation[2] !== orientation[2] &&
                        this._stylusOrientation[3] !== orientation[3]) {

                        this._stylusOrientation[0] = orientation[0];
                        this._stylusOrientation[1] = orientation[1];
                        this._stylusOrientation[2] = orientation[2];
                        this._stylusOrientation[3] = orientation[3];
                        stylusMoved = true;
                    }

                    if (stylusMoved) {

                        var viewMatrix = camera.view.matrix;

                        math.inverseMat4(viewMatrix, invViewMatrix);
                        math.mulMat4(invViewMatrix, this._stylusCameraMatrix, stylusWorldMatrix);

                        this._stylusWorldPos[0] = stylusWorldMatrix[12];
                        this._stylusWorldPos[1] = stylusWorldMatrix[13];
                        this._stylusWorldPos[2] = stylusWorldMatrix[14];

                        this._stylusWorldDir[0] = -stylusWorldMatrix[8];
                        this._stylusWorldDir[1] = -stylusWorldMatrix[9];
                        this._stylusWorldDir[2] = -stylusWorldMatrix[10];

                        math.normalizeVec3(this._stylusWorldDir);
                    }

                } else {
                    math.identityMat4(this._stylusCameraMatrix);
                }

                // Poll the stylus' buttons

                var stylusButtonsPose = this._stylusButtonsDevice.getPose();
                if (stylusButtonsPose && stylusButtonsPose.position) {

                    var buttons = stylusButtonsPose.position;
                    var button0 = !!buttons[0];
                    var button1 = !!buttons[1];
                    var button2 = !!buttons[2];

                    if (this._stylusButton0 !== button0) {
                        this._stylusButton0 = button0;
                        stylusButton0Updated = true;
                    }

                    if (this._stylusButton1 !== button1) {
                        this._stylusButton1 = button1;
                        stylusButton1Updated = true;
                    }

                    if (this._stylusButton2 !== button2) {
                        this._stylusButton2 = button2;
                        stylusButton2Updated = true;
                    }
                }

                // Fire batched update events

                if (stylusMoved) {

                    /**
                     * Fired whenever this ZSpace component's stylus moves.
                     *
                     * @event stylusMoved
                     */
                    this.fire("stylusMoved", true);
                }

                if (stylusButton0Updated) {

                    /**
                     * Fired whenever this ZSpace component's first button is pressed or released.
                     *
                     * @event stylusButton0
                     * @param value True if the button is down.
                     */
                    this.fire("stylusButton0", this._stylusButton0);
                }

                if (stylusButton1Updated) {

                    /**
                     * Fired whenever this ZSpace component's second button is pressed or released.
                     *
                     * @event stylusButton1
                     * @param value True if the button is down.
                     */
                    this.fire("stylusButton1", this._stylusButton1);
                }

                if (stylusButton2Updated) {

                    /**
                     * Fired whenever this ZSpace component's third button is pressed or released.
                     *
                     * @event stylusButton2
                     * @param value True if the button is down.
                     */
                    this.fire("stylusButton2", this._stylusButton2);
                }
            };

        })(),

        _deactivate: function () { // Deactivates this XEO.ZSpace

            var scene = this.scene;

            scene.passes = 1; // Don't need to restore scene.clearEachPass

            if (this._oldView) { // Transforms were replaced on camera when activating - restore old transforms
                this._attached.camera.view = this._oldView;
                this._attached.camera.project = this._oldProject;
                this._oldView = null;
                this._oldProject = null;
            }

            scene.canvas.off(this._onCanvasResized);
            scene.canvas.off(this._onWebGLContextRestored);
            scene.off(this._onSceneRendering);

            this._renderer.bindOutputFramebuffer = null; // Remove hooks to bind/unbind our stereo framebuffer
            this._renderer.unbindOutputFramebuffer = null;

            this._destroyFrameBuffer();
        },

        _getJSON: function () { // Returns JSON configuration of this component
            var json = {
                active: this._active,
                displayResolution: this._displayResolution.slice(0),
                displaySize: this._displaySize.slice(0),
                nearClip: this._nearClip,
                farClip: this._farClip
            };
            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }
            return json;
        },

        _destroy: function () { // Called on destruction of this component
            this.active = false;
        }
    });

    function getPosition(canvas) { // Helper function to get an element's exact position
        var canvasOffset = [0, 0];
        return {
            x: window.screenX + canvas.offsetLeft - screen.availLeft + canvasOffset[0],
            y: window.screenY + canvas.offsetTop + 75 + canvasOffset[1]
        };
    }

    function makeProjectionMatrix(up, down, left, right, nearClip, farClip, out) {
        var o = Math.tan(up);
        var u = Math.tan(down);
        var l = Math.tan(left);
        var e = Math.tan(right);
        var M = 2 / (l + e), s = 2 / (o + u);
        out[0] = M;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = s;
        out[6] = 0;
        out[7] = 0;
        out[8] = -((l - e) * M * .5);
        out[9] = (o - u) * s * .5;
        out[10] = farClip / (nearClip - farClip);
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = farClip * nearClip / (nearClip - farClip);
        out[15] = 0;
        return out;
    }
})();
