/**
 * Rotates, pans and zooms the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} with keyboard, mouse and touch input.

 CameraControl fires these events:

 * "hover" - Hover enters a new object
 * "hoverSurface" - Hover continues over an object surface - fired continuously as mouse moves over an object
 * "hoverLeave"  - Hover has left the last object we were hovering over
 * "hoverOff" - Hover continues over empty space - fired continuously as mouse moves over nothing
 * "picked" - Clicked or tapped object
 * "pickedSurface" -  Clicked or tapped object, with event containing surface intersection details
 * "doublePicked" - Double-clicked or double-tapped object
 * "doublePickedSurface" - Double-clicked or double-tapped object, with event containing surface intersection details
 * "pickedNothing" - Clicked or tapped, but not on any objects
 * "doublePickedNothing" - Double-clicked or double-tapped, but not on any objects

 CameraControl only fires "hover" events when the mouse is up.

 For efficiency, CameraControl only does surface intersection picking when you subscribe to "doublePicked" and
 "doublePickedSurface" events. Therefore, only subscribe to those when you're OK with the overhead incurred by the
 surface intersection tests.

 ## Panning

 ## Rotating

 ## Zooming

 ## Events

 ## Activating and deactivating

 ## Inertia

 ## First person

 ## Keyboard layout

 # Fly-to


 @class CameraControl
 @module xeogl
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraControl.
 @param [cfg.firstPerson=false] {Boolean} Whether or not this CameraControl is in "first person" mode.
 @param [cfg.walking=false] {Boolean} Whether or not this CameraControl is in "walking" mode.
 @param [cfg.keyboardLayout="qwerty"] {String} Keyboard layout.
 @param [cfg.doublePickFlyTo=true] {Boolean} Whether to fly the camera to each {{#crossLink "Entity"}}{{/crossLink}} that's double-clicked.
 @param [cfg.active=true] {Boolean} Indicates whether or not this CameraControl is active.
 @param [cfg.inertia=0.5] {Number} A factor in range [0..1] indicating how much the camera keeps moving after you finish panning or rotating it.
 @extends Component
 */
(function () {

    "use strict";


    xeogl.CameraControl = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.CameraControl",

        _init: function (cfg) {

            this._boundaryHelper = new xeogl.Entity(this, {
                geometry: new xeogl.AABBGeometry(this),
                material: new xeogl.PhongMaterial(this, {
                    diffuse: [0, 0, 0],
                    ambient: [0, 0, 0],
                    specular: [0, 0, 0],
                    emissive: [1.0, 1.0, 0.6],
                    lineWidth: 4
                }),
                visible: false,
                collidable: false
            });

            this._cameraFlight = new xeogl.CameraFlightAnimation(this, {
                duration: 0.5
            });

            this.firstPerson = cfg.firstPerson;
            this.walking = cfg.walking;
            this.keyboardLayout = cfg.keyboardLayout;
            this.doublePickFlyTo = cfg.doublePickFlyTo;
            this.active = cfg.active;
            this.inertia = cfg.inertia;

            this._initEvents(); // Set up all the mouse/touch/kb handlers
        },

        _props: {

            /**
             Indicates whether this CameraControl is active or not.

             Fires a {{#crossLink "CameraControl/active:event"}}{{/crossLink}} event on change.

             @property active
             @default true
             @type Boolean
             */
            active: {

                set: function (value) {

                    this._active = value !== false;

                    /**
                     Fired whenever this CameraControl's {{#crossLink "CameraControl/active:property"}}{{/crossLink}} property changes.

                     @event active
                     @param value {Boolean} The property's new value
                     */
                    this.fire("active", this._active);
                },

                get: function () {
                    return this._active;
                }
            },

            /**
             * Flag which indicates whether this CameraControl is in "first person" mode.
             *
             * In "first person" mode (disabled by default) the look position rotates about the eye position. Otherwise,
             * the eye rotates about the look.
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/firstPerson:event"}}{{/crossLink}} event on change.
             *
             * @property firstPerson
             * @default false
             * @type Boolean
             */
            firstPerson: {

                set: function (value) {

                    value = !!value;

                    this._firstPerson = value;

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/firstPerson:property"}}{{/crossLink}} property changes.
                     * @event firstPerson
                     * @param value The property's new value
                     */
                    this.fire('firstPerson', this._firstPerson);
                },

                get: function () {
                    return this._firstPerson;
                }
            },

            /**
             * Flag which indicates whether this CameraControl is in "walking" mode.
             *
             * When set true, this constrains eye movement to the horizontal X-Z plane. When doing a walkthrough,
             * this is useful to allow us to look upwards or downwards as we move, while keeping us moving in the
             * horizontal plane.
             *
             * This only has an effect when also in "first person" mode.
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/walking:event"}}{{/crossLink}} event on change.
             *
             * @property walking
             * @default false
             * @type Boolean
             */
            walking: {

                set: function (value) {

                    value = !!value;

                    this._walking = value;

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/walking:property"}}{{/crossLink}} property changes.
                     * @event walking
                     * @param value The property's new value
                     */
                    this.fire('walking', this._walking);
                },

                get: function () {
                    return this._walking;
                }
            },

            /**
             * TODO
             * Fires a {{#crossLink "KeyboardRotateCamera/doublePickFlyTo:event"}}{{/crossLink}} event on change.
             *
             * @property doublePickFlyTo
             * @default true
             * @type Boolean
             */
            doublePickFlyTo: {

                set: function (value) {

                    this._doublePickFlyTo = value !== false;

                    // ..

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/doublePickFlyTo:property"}}{{/crossLink}} property changes.
                     * @event doublePickFlyTo
                     * @param value The property's new value
                     */
                    this.fire('doublePickFlyTo', this._doublePickFlyTo);
                },

                get: function () {
                    return this._doublePickFlyTo;
                }
            },


            /**
             * A fact in range [0..1] indicating how much the camera keeps moving after you finish
             * panning or rotating it.
             *
             * A value of 0.0 causes it to immediately stop, 0.5 causes its movement to decay 50% on each tick,
             * while 1.0 causes no decay, allowing it continue moving, by the current rate of pan or rotation.
             *
             * You may choose an inertia of zero when you want be able to precisely position or rotate the camera,
             * without interference from inertia. ero inertia can also mean that less frames are rendered while
             * you are positioning the camera.
             *
             * Fires a {{#crossLink "KeyboardRotateCamera/inertia:event"}}{{/crossLink}} event on change.
             *
             * @property inertia
             * @default 0.5
             * @type Number
             */
            inertia: {

                set: function (value) {

                    this._inertia = value === undefined ? 0.5 : value;

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/inertia:property"}}{{/crossLink}} property changes.
                     * @event inertia
                     * @param value The property's new value
                     */
                    this.fire('inertia', this._inertia);
                },

                get: function () {
                    return this._inertia;
                }
            },

            /**
             * TODO
             * Fires a {{#crossLink "KeyboardRotateCamera/keyboardLayout:event"}}{{/crossLink}} event on change.
             *
             * @property keyboardLayout
             * @default "qwerty"
             * @type String
             */
            keyboardLayout: {

                set: function (value) {

                    this._keyboardLayout = value || "qwerty";

                    // ..

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/keyboardLayout:property"}}{{/crossLink}} property changes.
                     * @event keyboardLayout
                     * @param value The property's new value
                     */
                    this.fire('keyboardLayout', this._keyboardLayout);
                },

                get: function () {
                    return this._keyboardLayout;
                }
            }
        },

        _destroy: function () {
            this.active = false;
        },

        _initEvents: function () {

            var self = this;
            var scene = this.scene;
            var input = scene.input;
            var camera = scene.camera;
            var math = xeogl.math;
            var canvas = this.scene.canvas.canvas;
            var over = false;
            var mouseHoverDelay = 500;
            var mouseOrbitRate = 0.4;
            var mousePanRate = 0.4;
            var mouseZoomRate = 0.8;
            var mouseWheelPanRate = 0.4;
            var keyboardOrbitRate = .02;
            var keyboardPanRate = .02;
            var keyboardZoomRate = .02;
            var touchRotateRate = 0.3;
            var touchPanRate = 0.2;
            var touchZoomRate = 0.05;

            canvas.oncontextmenu = function (e) {
                e.preventDefault();
            };

            var getCanvasPosFromEvent = function (event, canvasPos) {
                if (!event) {
                    event = window.event;
                    canvasPos[0] = event.x;
                    canvasPos[1] = event.y;
                } else {
                    var element = event.target;
                    var totalOffsetLeft = 0;
                    var totalOffsetTop = 0;
                    while (element.offsetParent) {
                        totalOffsetLeft += element.offsetLeft;
                        totalOffsetTop += element.offsetTop;
                        element = element.offsetParent;
                    }
                    canvasPos[0] = event.pageX - totalOffsetLeft;
                    canvasPos[1] = event.pageY - totalOffsetTop;
                }
                return canvasPos;
            };

            //------------------------------------------------------------------------------------
            // Mouse, touch and keyboard camera control
            //------------------------------------------------------------------------------------

            (function () {

                var rotateVx = 0;
                var rotateVy = 0;
                var panVx = 0;
                var panVy = 0;
                var panVz = 0;
                var vZoom = 0;
                var mousePos = math.vec2();
                var panToMouse = false;

                var ctrlDown = false;
                var altDown = false;
                var shiftDown = false;
                var keyDown = {};

                var EPSILON = 0.001;

                var getEyeLookDist = (function () {
                    var vec = new Float32Array(3);
                    return function () {
                        return math.lenVec3(math.subVec3(camera.look, camera.eye, vec));
                    };
                })();

                var getInverseProjectMat = (function () {
                    var projMatDirty = true;
                    camera.on("projMatrix", function () {
                        projMatDirty = true;
                    });
                    var inverseProjectMat = math.mat4();
                    return function () {
                        if (projMatDirty) {
                            math.inverseMat4(camera.projMatrix, inverseProjectMat);
                        }
                        return inverseProjectMat;
                    }
                })();

                var getTransposedProjectMat = (function () {
                    var projMatDirty = true;
                    camera.on("projMatrix", function () {
                        projMatDirty = true;
                    });
                    var transposedProjectMat = math.mat4();
                    return function () {
                        if (projMatDirty) {
                            math.transposeMat4(camera.projMatrix, transposedProjectMat);
                        }
                        return transposedProjectMat;
                    }
                })();

                var getInverseViewMat = (function () {
                    var viewMatDirty = true;
                    camera.on("viewMatrix", function () {
                        viewMatDirty = true;
                    });
                    var inverseViewMat = math.mat4();
                    return function () {
                        if (viewMatDirty) {
                            math.inverseMat4(camera.viewMatrix, inverseViewMat);
                        }
                        return inverseViewMat;
                    }
                })();

                var getSceneDiagSize = (function () {
                    var sceneSizeDirty = true;
                    var diag = 1; // Just in case
                    scene.on("boundary", function () {
                        sceneSizeDirty = true;
                    });
                    return function () {
                        if (sceneSizeDirty) {
                            diag = math.getAABB3Diag(scene.aabb);
                        }
                        return diag;
                    };
                })();

                var panToMousePos = (function () {

                    var cp = math.vec4();
                    var viewPos = math.vec4();
                    var worldPos = math.vec4();
                    var eyeCursorVec = math.vec3();

                    var unproject = function (inverseProjMat, inverseViewMat, mousePos, z,  viewPos, worldPos) {
                        var canvas = scene.canvas.canvas;
                        var halfCanvasWidth = canvas.offsetWidth / 2.0;
                        var halfCanvasHeight = canvas.offsetHeight / 2.0;
                        cp[0] = (mousePos[0] - halfCanvasWidth) / halfCanvasWidth;
                        cp[1] = (mousePos[1] - halfCanvasHeight) / halfCanvasHeight;
                        cp[2] = z;
                        cp[3] = 1.0;
                        math.mulMat4v4(inverseProjMat, cp, viewPos);
                        math.mulVec3Scalar(viewPos, 1.0 / viewPos[3]); // Normalize homogeneous coord
                        viewPos[3] = 1.0;
                        viewPos[1] *= -1; // TODO: Why is this reversed?
                        math.mulMat4v4(inverseViewMat, viewPos, worldPos);
                    };

                    return function (mousePos, factor) {

                        console.log(mousePos);

                        var lastHoverDistance = 0;
                        var inverseProjMat = getInverseProjectMat();
                        var inverseViewMat = getInverseViewMat();

                        // Get last two columns of projection matrix
                        var transposedProjectMat = getTransposedProjectMat();
                        var Pt3 = transposedProjectMat.subarray(8, 12);
                        var Pt4 = transposedProjectMat.subarray(12);
                        var D = [0, 0, -(lastHoverDistance || getSceneDiagSize()), 1];
                        var Z = math.dotVec4(D, Pt3) / math.dotVec4(D, Pt4);

                        unproject(inverseProjMat, inverseViewMat, mousePos, Z, viewPos, worldPos);

                        math.subVec3(worldPos, camera.eye, eyeCursorVec);
                        math.normalizeVec3(eyeCursorVec);

                        var px = eyeCursorVec[0] * factor;
                        var py = eyeCursorVec[1] * factor;
                        var pz = eyeCursorVec[2] * factor;

                        var eye = camera.eye;
                        var look = camera.look;

                        camera.eye = [eye[0] + px, eye[1] + py, eye[2] + pz];
                        camera.look = [look[0] + px, look[1] + py, look[2] + pz];
                    };
                })();

                scene.on("tick", function () {

                    var cameraInertia = self._inertia;

                    if (Math.abs(rotateVx) < EPSILON) {
                        rotateVx = 0;
                    }

                    if (Math.abs(rotateVy) < EPSILON) {
                        rotateVy = 0;
                    }

                    if (rotateVx !== 0) {
                        if (self._firstPerson) {
                            camera.pitch(-rotateVx);
                        } else {
                            camera.orbitPitch(rotateVx);
                        }
                    }

                    if (rotateVy !== 0) {
                        if (self._firstPerson) {
                            camera.yaw(rotateVy);
                        } else {
                            camera.orbitYaw(rotateVy);
                        }
                    }

                    rotateVx *= cameraInertia;
                    rotateVy *= cameraInertia;

                    if (Math.abs(panVx) < EPSILON) {
                        panVx = 0;
                    }

                    if (Math.abs(panVy) < EPSILON) {
                        panVy = 0;
                    }

                    if (Math.abs(panVz) < EPSILON) {
                        panVz = 0;
                    }

                    if (panVx !== 0 || panVy !== 0 || panVz !== 0) {
                        var f = getEyeLookDist() / 80;
                        if (self._walking) {
                            var y = camera.eye[1];
                            camera.pan([panVx * f, panVy * f, panVz * f]);
                            var eye = camera.eye;
                            eye[1] = y;
                            camera.eye = eye;
                        } else {
                            camera.pan([panVx * f, panVy * f, panVz * f]);
                        }
                    }

                    panVx *= cameraInertia;
                    panVy *= cameraInertia;
                    panVz *= cameraInertia;

                    if (Math.abs(vZoom) < EPSILON) {
                        vZoom = 0;
                    }

                    if (vZoom !== 0) {
                        if (self._firstPerson) {
                            var y;
                            if (self._walking) {
                                y = camera.eye[1];
                            }
                            if (panToMouse) { // Using mouse input
                                panToMousePos(mousePos, -vZoom * 2);
                            } else {
                                camera.pan([0, 0, vZoom]); // Touchscreen input with no cursor
                            }
                            if (self._walking) {
                                var eye = camera.eye;
                                eye[1] = y;
                                camera.eye = eye;
                            }
                        } else {
                            // Do both zoom and ortho scale so that we can switch projections without weird scale jumps
                            camera.zoom(vZoom);
                            camera.ortho.scale = camera.ortho.scale + vZoom;
                        }
                        vZoom *= cameraInertia;
                    }
                });

                function getZoomRate() {
                    var aabb = scene.aabb;
                    var xsize = aabb[3] - aabb[0];
                    var ysize = aabb[4] - aabb[1];
                    var zsize = aabb[5] - aabb[2];
                    var max = (xsize > ysize ? xsize : ysize);
                    max = (zsize > max ? zsize : max);
                    return max / 30;
                }

                document.addEventListener("keyDown", function (e) {
                    if (!self._active) {
                        return;
                    }
                    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                        ctrlDown = e.ctrlKey || e.keyCode === 17 || e.metaKey; // !important, treat Windows or Mac Command Key as ctrl
                        altDown = e.altKey || e.keyCode === 18;
                        shiftDown = e.keyCode === 16;
                        keyDown[e.keyCode] = true;
                    }
                }, true);

                document.addEventListener("keyup", function (e) {
                    if (!self._active) {
                        return;
                    }
                    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                        if (e.ctrlKey || e.keyCode === 17) {
                            ctrlDown = false;
                        }
                        if (e.altKey || e.keyCode === 18) {
                            altDown = false;
                        }
                        if (e.keyCode === 16) {
                            shiftDown = false;
                        }
                        keyDown[e.keyCode] = false;
                    }
                });

                // Mouse camera rotate, pan and zoom

                (function () {

                    var lastX;
                    var lastY;
                    var xDelta = 0;
                    var yDelta = 0;
                    var down = false;

                    var mouseDownLeft;
                    var mouseDownMiddle;
                    var mouseDownRight;

                    canvas.addEventListener("mousedown", function (e) {
                        if (!self._active) {
                            return;
                        }
                        if (!over) {
                            return;
                        }
                        switch (e.which) {
                            case 1: // Left button
                                mouseDownLeft = true;
                                down = true;
                                xDelta = 0;
                                yDelta = 0;
                                getCanvasPosFromEvent(e, mousePos);
                                lastX = mousePos[0];
                                lastY = mousePos[1];
                                break;
                            case 2: // Middle/both buttons
                                mouseDownMiddle = true;
                                break;
                            case 3: // Right button
                                mouseDownRight = true;
                                down = true;
                                xDelta = 0;
                                yDelta = 0;
                                getCanvasPosFromEvent(e, mousePos);
                                lastX = mousePos[0];
                                lastY = mousePos[1];
                                break;
                                break;
                            default:
                                break;
                        }
                    });

                    canvas.addEventListener("mouseup", function (e) {
                        if (!self._active) {
                            return;
                        }
                        switch (e.which) {
                            case 1: // Left button
                                mouseDownLeft = false;
                                break;
                            case 2: // Middle/both buttons
                                mouseDownMiddle = false;
                                break;
                            case 3: // Right button
                                mouseDownRight = false;
                                break;
                            default:
                                break;
                        }
                        down = false;
                        xDelta = 0;
                        yDelta = 0;
                    });

                    canvas.addEventListener("mouseenter", function () {
                        if (!self._active) {
                            return;
                        }
                        over = true;
                        xDelta = 0;
                        yDelta = 0;
                    });

                    canvas.addEventListener("mouseleave", function () {
                        if (!self._active) {
                            return;
                        }
                        over = false;
                        xDelta = 0;
                        yDelta = 0;
                    });

                    canvas.addEventListener("mousemove", function (e) {
                        if (!self._active) {
                            return;
                        }
                        if (!over) {
                            return;
                        }
                        getCanvasPosFromEvent(e, mousePos);
                        panToMouse = true;
                        if (!down) {
                            return;
                        }
                        var x = mousePos[0];
                        var y = mousePos[1];
                        xDelta += (x - lastX) * mouseOrbitRate;
                        yDelta += (y - lastY) * mouseOrbitRate;
                        lastX = x;
                        lastY = y;
                    });

                    scene.on("tick", function () {
                        if (!self._active) {
                            return;
                        }
                        if (Math.abs(xDelta) === 0 && Math.abs(yDelta) === 0) {
                            return;
                        }

                        var panning = shiftDown || mouseDownRight;

                        if (panning) {

                            // Panning

                            panVx = xDelta * mousePanRate;
                            panVy = yDelta * mousePanRate;

                        } else {

                            // Orbiting

                            rotateVy = -xDelta * mouseOrbitRate;
                            rotateVx = yDelta * mouseOrbitRate;
                        }

                        xDelta = 0;
                        yDelta = 0;
                    });

                    // Mouse wheel zoom

                    canvas.addEventListener("wheel", function (e) {
                        if (!self._active) {
                            return;
                        }
                        var delta = Math.max(-1, Math.min(1, -e.deltaY * 40));
                        if (delta === 0) {
                            return;
                        }
                        var d = delta / Math.abs(delta);
                        vZoom = -d * getZoomRate() * mouseZoomRate;
                        e.preventDefault();
                    });

                    // Keyboard zoom

                    scene.on("tick", function (e) {
                        if (!self._active) {
                            return;
                        }
                        if (!over) {
                            return;
                        }
                        var elapsed = e.deltaTime;
                        if (!self.ctrlDown && !self.altDown) {
                            var wkey = input.keyDown[input.KEY_ADD];
                            var skey = input.keyDown[input.KEY_SUBTRACT];
                            if (wkey || skey) {
                                if (skey) {
                                    vZoom = elapsed * getZoomRate() * keyboardZoomRate;
                                } else if (wkey) {
                                    vZoom = -elapsed * getZoomRate() * keyboardZoomRate;
                                }
                            }
                        }
                    });

                    // Keyboard panning

                    (function () {

                        scene.on("tick", function (e) {
                            if (!self._active) {
                                return;
                            }
                            if (!over) {
                                return;
                            }

                            var elapsed = e.deltaTime;

                            // if (!self.ctrlDown && !self.altDown) {
                            var front, back, left, right, up, down;
                            if (self._keyboardLayout == 'azerty') {
                                front = input.keyDown[input.KEY_Z];
                                back = input.keyDown[input.KEY_S];
                                left = input.keyDown[input.KEY_Q];
                                right = input.keyDown[input.KEY_D];
                                up = input.keyDown[input.KEY_W];
                                down = input.keyDown[input.KEY_X];
                            } else {
                                front = input.keyDown[input.KEY_W];
                                back = input.keyDown[input.KEY_S];
                                left = input.keyDown[input.KEY_A];
                                right = input.keyDown[input.KEY_D];
                                up = input.keyDown[input.KEY_Z];
                                down = input.keyDown[input.KEY_X];
                            }
                            if (front || back || left || right || up || down) {
                                if (down) {
                                    panVy += elapsed * keyboardPanRate;
                                } else if (up) {
                                    panVy -= -elapsed * keyboardPanRate;
                                }
                                if (right) {
                                    panVx += -elapsed * keyboardPanRate;
                                } else if (left) {
                                    panVx = elapsed * keyboardPanRate;
                                }
                                if (back) {
                                    panVz = elapsed * keyboardPanRate;
                                } else if (front) {
                                    panVz = -elapsed * keyboardPanRate;
                                }
                            }
                            //          }
                        });
                    })();
                })();

                // Touch camera rotate, pan and zoom

                (function () {

                    var touchStartTime;
                    var tapStartPos = new Float32Array(2);
                    var tapStartTime = -1;

                    var lastTouches = [];
                    var numTouches = 0;

                    var touch0Vec = new Float32Array(2);
                    var touch1Vec = new Float32Array(2);

                    var MODE_CHANGE_TIMEOUT = 50;
                    var MODE_NONE = 0;
                    var MODE_ROTATE = 1;
                    var MODE_PAN = 1 << 1;
                    var MODE_ZOOM = 1 << 2;
                    var currentMode = MODE_NONE;
                    var transitionTime = Date.now();

                    function checkMode(mode) {
                        var currentTime = Date.now();
                        if (currentMode === MODE_NONE) {
                            currentMode = mode;
                            return true;
                        }
                        if (currentMode === mode) {
                            return currentTime - transitionTime > MODE_CHANGE_TIMEOUT;
                        }
                        currentMode = mode;
                        transitionTime = currentTime;
                        return false;
                    }

                    canvas.addEventListener("touchstart", function (event) {
                        if (!self._active) {
                            return;
                        }
                        var touches = event.touches;
                        var changedTouches = event.changedTouches;

                        touchStartTime = Date.now();

                        if (touches.length === 1 && changedTouches.length === 1) {
                            tapStartTime = touchStartTime;
                            tapStartPos[0] = touches[0].pageX;
                            tapStartPos[1] = touches[0].pageY;
                        } else {
                            tapStartTime = -1;
                        }

                        while (lastTouches.length < touches.length) {
                            lastTouches.push(new Float32Array(2));
                        }

                        for (var i = 0, len = touches.length; i < len; ++i) {
                            lastTouches[i][0] = touches[i].pageX;
                            lastTouches[i][1] = touches[i].pageY;
                        }

                        currentMode = MODE_NONE;
                        numTouches = touches.length;

                        event.stopPropagation();
                    }, {passive: true});

                    canvas.addEventListener("touchmove", function (event) {
                        if (!self._active) {
                            return;
                        }
                        var touches = event.touches;

                        if (numTouches === 1) {

                            var touch0 = touches[0];

                            if (checkMode(MODE_ROTATE)) {
                                var deltaX = touch0.pageX - lastTouches[0][0];
                                var deltaY = touch0.pageY - lastTouches[0][1];
                                var rotateX = deltaX * touchRotateRate;
                                var rotateY = deltaY * touchRotateRate;
                                rotateVx = rotateY;
                                rotateVy = -rotateX;
                            }

                        } else if (numTouches === 2) {

                            var touch0 = touches[0];
                            var touch1 = touches[1];

                            math.subVec2([touch0.pageX, touch0.pageY], lastTouches[0], touch0Vec);
                            math.subVec2([touch1.pageX, touch1.pageY], lastTouches[1], touch1Vec);

                            var panning = math.dotVec2(touch0Vec, touch1Vec) > 0;

                            if (panning && checkMode(MODE_PAN)) {
                                math.subVec2([touch0.pageX, touch0.pageY], lastTouches[0], touch0Vec);
                                panVx = touch0Vec[0] * touchPanRate;
                                panVy = touch0Vec[1] * touchPanRate;
                            }

                            if (!panning && checkMode(MODE_ZOOM)) {
                                var d1 = math.distVec2([touch0.pageX, touch0.pageY], [touch1.pageX, touch1.pageY]);
                                var d2 = math.distVec2(lastTouches[0], lastTouches[1]);
                                vZoom = (d2 - d1) * getZoomRate() * touchZoomRate;
                            }
                        }

                        for (var i = 0; i < numTouches; ++i) {
                            lastTouches[i][0] = touches[i].pageX;
                            lastTouches[i][1] = touches[i].pageY;
                        }

                        event.stopPropagation();
                    }, {passive: true});

                })();

                // Keyboard rotation

                (function () {

                    scene.on("tick", function (e) {
                        if (!self._active) {
                            return;
                        }
                        if (!over) {
                            return;
                        }
                        var elapsed = e.deltaTime;
                        var left = input.keyDown[input.KEY_LEFT_ARROW];
                        var right = input.keyDown[input.KEY_RIGHT_ARROW];
                        var up = input.keyDown[input.KEY_UP_ARROW];
                        var down = input.keyDown[input.KEY_DOWN_ARROW];
                        if (left || right || up || down) {
                            if (right) {
                                rotateVy += -elapsed * keyboardOrbitRate;

                            } else if (left) {
                                rotateVy += elapsed * keyboardOrbitRate;
                            }
                            if (down) {
                                rotateVx += elapsed * keyboardOrbitRate;

                            } else if (up) {
                                rotateVx += -elapsed * keyboardOrbitRate;
                            }
                        }
                    });
                })();

                // First-person rotation about vertical axis with A and E keys for AZERTY layout

                (function () {

                    scene.on("tick", function (e) {
                        if (!self._active) {
                            return;
                        }
                        if (!over) {
                            return;
                        }
                        var elapsed = e.deltaTime;
                        var rotateLeft;
                        var rotateRight;
                        if (self._keyboardLayout == 'azerty') {
                            rotateLeft = input.keyDown[input.KEY_A];
                            rotateRight = input.keyDown[input.KEY_E];
                        } else {
                            rotateLeft = input.keyDown[input.KEY_Q];
                            rotateRight = input.keyDown[input.KEY_E];
                        }
                        if (rotateRight || rotateLeft) {
                            if (rotateLeft) {
                                rotateVy += elapsed * keyboardOrbitRate;
                            } else if (rotateRight) {
                                rotateVy += -elapsed * keyboardOrbitRate;
                            }
                        }
                    });

                })();
            })();

            //------------------------------------------------------------------------------------
            // Mouse and touch picking
            //------------------------------------------------------------------------------------

            (function () {

                var pickCursorPos = [0, 0];
                var needPickEntity = false;
                var needPickSurface = false;
                var lastPickedEntityId;
                var hit;
                var picked = false;
                var pickedSurface = false;

                function updatePick() {
                    if (!needPickEntity && !needPickSurface) {
                        return;
                    }
                    picked = false;
                    pickedSurface = false;
                    if (needPickSurface || self.hasSubs("hoverSurface")) {
                        hit = scene.pick({
                            pickSurface: true,
                            canvasPos: pickCursorPos
                        });
                    } else { // needPickEntity == true
                        hit = scene.pick({
                            canvasPos: pickCursorPos
                        });
                    }
                    if (hit) {
                        picked = true;
                        var pickedEntityId = hit.entity.id;
                        if (lastPickedEntityId !== pickedEntityId) {
                            if (lastPickedEntityId !== undefined) {

                                /**
                                 * Fired whenever the pointer no longer hovers over an {{#crossLink "Entity"}}{{/crossLink}}.
                                 * @event hoverOut
                                 * @param entity The Entity
                                 */
                                self.fire("hoverOut", {
                                    entity: scene.entities[lastPickedEntityId]
                                });
                            }

                            /**
                             * Fired when the pointer is over a new {{#crossLink "Entity"}}{{/crossLink}}.
                             * @event hoverEnter
                             * @param hit A pick hit result containing the ID of the Entity - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                             */
                            self.fire("hoverEnter", hit);
                            lastPickedEntityId = pickedEntityId;
                        }
                        /**
                         * Fired continuously while the pointer is moving while hovering over an {{#crossLink "Entity"}}{{/crossLink}}.
                         * @event hover
                         * @param hit A pick hit result containing the ID of the Entity - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                         */
                        self.fire("hover", hit);
                        if (hit.worldPos) {
                            pickedSurface = true;

                            /**
                             * Fired while the pointer hovers over the surface of an {{#crossLink "Entity"}}{{/crossLink}}.
                             *
                             * This event provides 3D information about the point on the surface that the pointer is
                             * hovering over.
                             *
                             * @event hoverSurface
                             * @param hit A surface pick hit result, containing the ID of the Entity and 3D info on the
                             * surface possition - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                             */
                            self.fire("hoverSurface", hit);
                        }
                    } else {
                        if (lastPickedEntityId !== undefined) {
                            /**
                             * Fired whenever the pointer no longer hovers over an {{#crossLink "Entity"}}{{/crossLink}}.
                             * @event hoverOut
                             * @param entity The Entity
                             */
                            self.fire("hoverOut", {
                                entity: scene.entities[lastPickedEntityId]
                            });
                            lastPickedEntityId = undefined;
                        }
                        /**
                         * Fired continuously while the pointer is moving but not hovering over anything.
                         *
                         * @event hoverOff
                         */
                        self.fire("hoverOff", {
                            canvasPos: pickCursorPos
                        });
                    }
                    needPickEntity = false;
                    needPickSurface = false;
                }

                scene.on("tick", updatePick);

                // Mouse picking

                (function () {

                    canvas.addEventListener("mousemove", function (e) {

                        if (!self._active) {
                            return;
                        }

                        //if (down) {
                        //    return;
                        //}

                        getCanvasPosFromEvent(e, pickCursorPos);

                        if (self.hasSubs("hover") || self.hasSubs("hoverOut") || self.hasSubs("hoverOff") || self.hasSubs("hoverSurface")) {
                            needPickEntity = true;
                        }
                    });

                    var downX;
                    var downY;
                    var downCursorX;
                    var downCursorY;

                    canvas.addEventListener('mousedown', function (e) {
                        if (!self._active) {
                            return;
                        }
                        downX = e.clientX;
                        downY = e.clientY;
                        downCursorX = pickCursorPos[0];
                        downCursorY = pickCursorPos[1];
                    });

                    canvas.addEventListener('mouseup', (function (e) {
                        var clicks = 0;
                        var timeout;
                        return function (e) {
                            if (!self._active) {
                                return;
                            }
                            if (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3) {
                                return;
                            }

                            if (!self._doublePickFlyTo && !self.hasSubs("doublePicked") && !self.hasSubs("doublePickedSurface") && !self.hasSubs("doublePickedNothing")) {

                                //  Avoid the single/double click differentiation timeout

                                needPickSurface = !!self.hasSubs("pickedSurface");

                                updatePick();

                                if (hit) {

                                    /**
                                     * Fired whenever the pointer has picked (ie. clicked or tapped) an {{#crossLink "Entity"}}{{/crossLink}}.
                                     *
                                     * @event picked
                                     * @param hit A surface pick hit result containing the ID of the Entity - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                                     */
                                    self.fire("picked", hit);
                                    if (pickedSurface) {

                                        /**
                                         * Fired when the pointer has picked (ie. clicked or tapped) the surface of an {{#crossLink "Entity"}}{{/crossLink}}.
                                         *
                                         * This event provides 3D information about the point on the surface that the pointer has picked.
                                         *
                                         * @event pickedSurface
                                         * @param hit A surface pick hit result, containing the ID of the Entity and 3D info on the
                                         * surface possition - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                                         */
                                        self.fire("pickedSurface", hit);
                                    }
                                } else {

                                    /**
                                     * Fired when the pointer attempted a pick (ie. clicked or tapped), but has hit nothing.
                                     *
                                     * @event pickedNothing
                                     */
                                    self.fire("pickedNothing");
                                }

                                return;
                            }

                            clicks++;

                            if (clicks == 1) {
                                timeout = setTimeout(function () {

                                    needPickEntity = self._doublePickFlyTo;
                                    needPickSurface = needPickEntity || !!self.hasSubs("pickedSurface");
                                    pickCursorPos[0] = downCursorX;
                                    pickCursorPos[1] = downCursorY;

                                    updatePick();

                                    if (hit) {
                                        self.fire("picked", hit);
                                        if (pickedSurface) {
                                            self.fire("pickedSurface", hit);
                                        }
                                    } else {
                                        self.fire("pickedNothing");
                                    }

                                    clicks = 0;
                                }, 250);  // FIXME: Too short for track pads

                            } else {

                                clearTimeout(timeout);

                                needPickEntity = self._doublePickFlyTo;
                                needPickSurface = needPickEntity && !!self.hasSubs("doublePickedSurface");

                                updatePick();

                                if (hit) {
                                    /**
                                     * Fired whenever the pointer has double-picked (ie. double-clicked or double-tapped) an {{#crossLink "Entity"}}{{/crossLink}}.
                                     *
                                     * @event picked
                                     * @param hit A surface pick hit result containing the ID of the Entity - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                                     */
                                    self.fire("doublePicked", hit);
                                    if (pickedSurface) {
                                        /**
                                         * Fired when the pointer has double-picked (ie. double-clicked or double-tapped) the surface of an {{#crossLink "Entity"}}{{/crossLink}}.
                                         *
                                         * This event provides 3D information about the point on the surface that the pointer has picked.
                                         *
                                         * @event doublePickedSurface
                                         * @param hit A surface pick hit result, containing the ID of the Entity and 3D info on the
                                         * surface possition - see {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
                                         */
                                        self.fire("doublePickedSurface", hit);
                                    }
                                    if (self._doublePickFlyTo) {
                                        self._flyTo(hit);
                                    }
                                } else {

                                    /**
                                     * Fired when the pointer attempted a double-pick (ie. double-clicked or double-tapped), but has hit nothing.
                                     *
                                     * @event doublePickedNothing
                                     */
                                    self.fire("doublePickedNothing");
                                    if (self._doublePickFlyTo) {
                                        self._flyTo();
                                    }
                                }
                                clicks = 0;
                            }
                        };
                    })(), false);

                })();

                // Touch picking

                (function () {

                    var TAP_INTERVAL = 150;
                    var DBL_TAP_INTERVAL = 325;
                    var TAP_DISTANCE_THRESHOLD = 4;

                    var touchStartTime;
                    var activeTouches = [];
                    var tapStartPos = new Float32Array(2);
                    var tapStartTime = -1;
                    var lastTapTime = -1;

                    canvas.addEventListener("touchstart", function (event) {

                        if (!self._active) {
                            return;
                        }

                        var touches = event.touches;
                        var changedTouches = event.changedTouches;

                        touchStartTime = Date.now();

                        if (touches.length === 1 && changedTouches.length === 1) {
                            tapStartTime = touchStartTime;
                            tapStartPos[0] = touches[0].pageX;
                            tapStartPos[1] = touches[0].pageY;
                        } else {
                            tapStartTime = -1;
                        }

                        while (activeTouches.length < touches.length) {
                            activeTouches.push(new Float32Array(2))
                        }

                        for (var i = 0, len = touches.length; i < len; ++i) {
                            activeTouches[i][0] = touches[i].pageX;
                            activeTouches[i][1] = touches[i].pageY;
                        }

                        activeTouches.length = touches.length;

                        event.stopPropagation();
                    }, {passive: true});

                    //canvas.addEventListener("touchmove", function (event) {
                    //    event.preventDefault();
                    //    event.stopPropagation();
                    //});

                    canvas.addEventListener("touchend", function (event) {

                        if (!self._active) {
                            return;
                        }

                        var currentTime = Date.now();
                        var touches = event.touches;
                        var changedTouches = event.changedTouches;

                        // process tap

                        if (touches.length === 0 && changedTouches.length === 1) {

                            if (tapStartTime > -1 && currentTime - tapStartTime < TAP_INTERVAL) {

                                if (lastTapTime > -1 && tapStartTime - lastTapTime < DBL_TAP_INTERVAL) {

                                    // Double-tap

                                    pickCursorPos[0] = Math.round(changedTouches[0].clientX);
                                    pickCursorPos[1] = Math.round(changedTouches[0].clientY);
                                    needPickEntity = true;
                                    needPickSurface = !!self.hasSubs("pickedSurface");

                                    updatePick();

                                    if (hit) {
                                        self.fire("doublePicked", hit);
                                        if (pickedSurface) {
                                            self.fire("doublePickedSurface", hit);
                                        }
                                        if (self._doublePickFlyTo) {
                                            self._flyTo(hit);
                                        }
                                    } else {
                                        self.fire("doublePickedNothing");
                                        if (self._doublePickFlyTo) {
                                            self._flyTo();
                                        }
                                    }

                                    lastTapTime = -1;

                                } else if (xeogl.math.distVec2(activeTouches[0], tapStartPos) < TAP_DISTANCE_THRESHOLD) {

                                    // Single-tap

                                    pickCursorPos[0] = Math.round(changedTouches[0].clientX);
                                    pickCursorPos[1] = Math.round(changedTouches[0].clientY);
                                    needPickEntity = true;
                                    needPickSurface = !!self.hasSubs("pickedSurface");

                                    updatePick();

                                    if (hit) {
                                        self.fire("picked", hit);
                                        if (pickedSurface) {
                                            self.fire("pickedSurface", hit);
                                        }
                                    } else {
                                        self.fire("pickedNothing");
                                    }

                                    lastTapTime = currentTime;
                                }

                                tapStartTime = -1
                            }
                        }

                        activeTouches.length = touches.length;

                        for (var i = 0, len = touches.length; i < len; ++i) {
                            activeTouches[i][0] = touches[i].pageX;
                            activeTouches[i][1] = touches[i].pageY;
                        }

                        event.stopPropagation();
                    }, {passive: true});
                })();
            })();

            //------------------------------------------------------------------------------------
            // Keyboard camera axis views
            //------------------------------------------------------------------------------------

            (function () {

                var KEY_NUM_1 = 49;
                var KEY_NUM_2 = 50;
                var KEY_NUM_3 = 51;
                var KEY_NUM_4 = 52;
                var KEY_NUM_5 = 53;
                var KEY_NUM_6 = 54;

                var center = new math.vec3();
                var tempVec3a = new math.vec3();
                var tempVec3b = new math.vec3();
                var tempVec3c = new math.vec3();

                var cameraTarget = {
                    eye: new Float32Array(3),
                    look: new Float32Array(3),
                    up: new Float32Array(3)
                };

                document.addEventListener("keydown", function (e) {

                    if (!self._active) {
                        return;
                    }

                    if (!over) {
                        return;
                    }

                    var keyCode = e.keyCode;

                    if (keyCode !== KEY_NUM_1 &&
                        keyCode !== KEY_NUM_2 &&
                        keyCode !== KEY_NUM_3 &&
                        keyCode !== KEY_NUM_4 &&
                        keyCode !== KEY_NUM_5 &&
                        keyCode !== KEY_NUM_6) {
                        return;
                    }

                    var aabb = scene.aabb;
                    var diag = math.getAABB3Diag(aabb);
                    center[0] = aabb[0] + aabb[3] / 2.0;
                    center[1] = aabb[1] + aabb[4] / 2.0;
                    center[2] = aabb[2] + aabb[5] / 2.0;
                    var dist = Math.abs((diag) / Math.tan(self._cameraFlight.fitFOV / 2));

                    switch (keyCode) {

                        case KEY_NUM_1: // Right

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldRight, dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(camera.worldUp);

                            break;

                        case KEY_NUM_2: // Back

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldForward, dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(camera.worldUp);

                            break;

                        case KEY_NUM_3: // Left

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldRight, -dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(camera.worldUp);

                            break;

                        case KEY_NUM_4: // Front

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldForward, -dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(camera.worldUp);

                            break;

                        case KEY_NUM_5: // Top

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldUp, dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(math.normalizeVec3(math.mulVec3Scalar(camera.worldForward, 1, tempVec3b), tempVec3c));

                            break;

                        case KEY_NUM_6: // Bottom

                            cameraTarget.eye.set(math.mulVec3Scalar(camera.worldUp, -dist, tempVec3a));
                            cameraTarget.look.set(center);
                            cameraTarget.up.set(math.normalizeVec3(math.mulVec3Scalar(camera.worldForward, -1, tempVec3b)));

                            break;

                        default:
                            return;
                    }

                    if (self._cameraFlight.duration > 0) {
                        self._cameraFlight.flyTo(cameraTarget);
                    } else {
                        self._cameraFlight.jumpTo(cameraTarget);
                    }
                });

            })();
        },

        _flyTo: function (hit) {

            var pos;

            if (hit && hit.worldPos) {
                pos = hit.worldPos
            }

            var aabb = hit ? hit.entity.aabb : this.scene.aabb;

            this._boundaryHelper.geometry.targetAABB = aabb;
            //    this._boundaryHelper.visible = true;

            if (pos) {

                // Fly to look at point, don't change eye->look dist

                var camera = this.scene.camera;
                var diff = xeogl.math.subVec3(camera.eye, camera.look, []);

                this._cameraFlight.flyTo({
                        // look: pos,
                        // eye: xeogl.math.addVec3(pos, diff, []),
                        // up: camera.up,
                        aabb: aabb
                    },
                    this._hideBoundary, this);

                // TODO: Option to back off to fit AABB in view

            } else {

                // Fly to fit target boundary in view

                this._cameraFlight.flyTo({
                        aabb: aabb
                    },
                    this._hideBoundary, this);
            }
        },

        _hideBoundary: function () {
            //    this._boundaryHelper.visible = false;
        }
    });

})();
