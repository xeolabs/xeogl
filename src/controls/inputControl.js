/**

 * "hoverEnter" - Hover enters a new object
 * "hover" -  Hover continues over an object - fired continuously as mouse moves over an object
 * "hoverSurface" - Hover continues over an object surface - fired continuously as mouse moves over an object
 * "hoverLeave"  - Hover has left the last object we were hovering over
 * "hoverOff" - Hover continues over empty space - fired continuously as mouse moves over nothing
 * "pickedObject" - Clicked or tapped object
 * "pickedSurface" -  Clicked or tapped object, with event containing surface intersection details
 * "doublePickedObject" - Double-clicked or double-tapped object
 * "doublePickedSurface" - Double-clicked or double-tapped object, with event containing surface intersection details
 * "pickedNothing" - Clicked or tapped, but not on any objects
 * "doublePickedNothing" - Double-clicked or double-tapped, but not on any objects

 InputControl only fires "hover" events when the mouse is up.

 For efficiency, InputControl only does surface intersection picking when you subscribe to "doublePickedObject" and
 "doublePickedSurface" events. Therefore, only subscribe to those when you're OK with the overhead incurred by the
 surface intersection tests.

 @class InputControl
 @module xeogl
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this InputControl.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this InputControl. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [firstPerson=false] {Boolean} Whether or not this InputControl is in "first person" mode.
 @param [walking=false] {Boolean} Whether or not this InputControl is in "walking" mode.
 @param [doublePickFlyTo=true] {Boolean} Whether to fly the camera to each {{#crossLink "Entity"}}{{/crossLink}} that's double-clicked.
 @extends Component
 */
(function () {

    "use strict";


    xeogl.InputControl = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.InputControl",

        /**
         Indicates that only one instance of a InputControl may be active within
         its {{#crossLink "Scene"}}{{/crossLink}} at a time. When a InputControl is activated, that has
         a true value for this flag, then any other active InputControl will be deactivated first.

         @property exclusive
         @type Boolean
         @final
         */
        exclusive: true,

        _init: function (cfg) {

            this._boundaryHelper = new xeogl.Entity(this, {
                camera: cfg.camera,
                geometry: new xeogl.AABBGeometry(this),
                material: new xeogl.PhongMaterial({
                    diffuse: [0, 0, 0],
                    ambient: [0, 0, 0],
                    specular: [0, 0, 0],
                    emissive: [1.0, 1.0, 0.6],
                    lineWidth: 4
                }),
                visible: false,
                collidable: false
            });

            //this.mousePickEntity.on("nopick", function () {
            //    var aabb = this.scene.worldBoundary.aabb;
            //    this._boundaryHelper.geometry.aabb = aabb;
            //    this._cameraFlight.flyTo({
            //            aabb: aabb,
            //            fitFOV: 45
            //        },
            //        this._hideBoundary, this);
            //}, this);

            this._cameraFlight = new xeogl.CameraFlightAnimation(this, {
                camera: cfg.camera,
                duration: 0.5
            });

            this.firstPerson = cfg.firstPerson;
            this.walking = cfg.walking;
            this.doublePickFlyTo = cfg.doublePickFlyTo;
            this.camera = cfg.camera;

            this._initEvents(); // Set up all the mouse/touch/kb handlers
        },

        _props: {

            /**
             * Flag which indicates whether this InputControl is in "first person" mode.
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
                     * Fired whenever this InputControl's {{#crossLink "InputControl/firstPerson:property"}}{{/crossLink}} property changes.
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
             * Flag which indicates whether this InputControl is in "walking" mode.
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
                     * Fired whenever this InputControl's {{#crossLink "InputControl/walking:property"}}{{/crossLink}} property changes.
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
                     * Fired whenever this InputControl's {{#crossLink "InputControl/doublePickFlyTo:property"}}{{/crossLink}} property changes.
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
             * The {{#crossLink "Camera"}}{{/crossLink}} being controlled by this InputControl.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this InputControl. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this InputControl's {{#crossLink "InputControl/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "camera",
                        type: "xeogl.Camera",
                        component: value,
                        sceneDefault: true,
                        onAdded: this._transformUpdated,
                        onAddedScope: this
                    });

                    // Update camera on child components

                    var camera = this._attached.camera;

                    this._boundaryHelper.camera = camera;
                },

                get: function () {
                    return this._attached.camera;
                }
            }
        },

        _getJSON: function () {

            var json = {
                firstPerson: this._firstPerson,
                walking: this._walking,
                doublePickFlyTo: this._doublePickFlyTo
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        },

        _initEvents: function () {

            var self = this;
            var scene = this.scene;
            var math = xeogl.math;
            var overlay = this.scene.canvas.overlay;

            overlay.oncontextmenu = function (e) {
                e.preventDefault();
            };

            var getClickCoordsWithinElement = (function () {
                var coords = new Float32Array(2);
                return function (event) {
                    if (!event) {
                        event = window.event;
                        coords[0] = event.x;
                        coords[a] = event.y;
                    } else {
                        var element = event.target;
                        var totalOffsetLeft = 0;
                        var totalOffsetTop = 0;

                        while (element.offsetParent) {
                            totalOffsetLeft += element.offsetLeft;
                            totalOffsetTop += element.offsetTop;
                            element = element.offsetParent;
                        }
                        coords[0] = event.pageX - totalOffsetLeft;
                        coords[1] = event.pageY - totalOffsetTop;
                    }
                    return coords;
                };
            })();

            //------------------------------------------------------------------------------------
            // Mouse and touch camera control
            //------------------------------------------------------------------------------------

            (function () {

                var mouseHoverDelay = 500;
                var mouseOrbitRate = 0.4;
                var mousePanRate = 0.2;
                var mouseZoomRate = 0.8;
                var keyboardOrbitRate = 140;
                var keyboardPanRate = 40;
                var keyboardZoomRate = 15;
                var touchRotateRate = 0.3;
                var touchPanRate = 0.2;
                var touchZoomRate = 0.05;
                var cameraFriction = 0.85;

                var rotateVx = 0;
                var rotateVy = 0;
                var panVx = 0;
                var panVy = 0;
                var vZoom = 0;

                var ctrlDown = false;
                var altDown = false;
                var shiftDown = false;
                var keyDown = {};

                var EPSILON = 0.001;

                var getEyeLookDist = (function () {
                    var vec = new Float32Array(3);
                    return function () {
                        var lookat = self.camera.view;
                        return math.lenVec3(math.subVec3(lookat.look, lookat.eye, vec));
                    };
                })();

                scene.on("tick", function () {

                    var lookat = self.camera.view;

                    rotateVx *= cameraFriction;
                    rotateVy *= cameraFriction;

                    if (Math.abs(rotateVx) < EPSILON) {
                        rotateVx = 0;
                    }

                    if (Math.abs(rotateVy) < EPSILON) {
                        rotateVy = 0;
                    }

                    if (rotateVx !== 0) {
                        if (self._firstPerson) {
                            lookat.rotateLookX(-rotateVx);
                        } else {
                            lookat.rotateEyeX(rotateVx);
                        }
                    }

                    if (rotateVy !== 0) {
                        if (self._firstPerson) {
                            lookat.rotateLookY(rotateVy);
                        } else {
                            lookat.rotateEyeY(rotateVy);
                        }
                    }

                    panVx *= cameraFriction;
                    panVy *= cameraFriction;

                    if (Math.abs(panVx) < EPSILON) {
                        panVx = 0;
                    }

                    if (Math.abs(panVy) < EPSILON) {
                        panVy = 0;
                    }

                    if (panVx !== 0 || panVy !== 0) {
                        var f = getEyeLookDist() / 80;
                        if (self._firstPerson && self._walking) {
                            var y = lookat.eye[1];
                            lookat.pan([panVx * f, panVy * f, 0]);
                            var eye = lookat.eye;
                            eye[1] = y;
                            lookat.eye = eye;
                        } else {
                            lookat.pan([panVx * f, panVy * f, 0]);
                        }
                    }

                    vZoom *= cameraFriction;

                    if (Math.abs(vZoom) < EPSILON) {
                        vZoom = 0;
                    }

                    if (vZoom !== 0) {
                        if (self._firstPerson) {
                            var y;
                            if (self._walking) {
                                y = lookat.eye[1];
                            }
                            lookat.pan([0, 0, vZoom]);
                            if (self._walking) {
                                var eye = lookat.eye;
                                eye[1] = y;
                                lookat.eye = eye;
                            }
                        } else {
                            lookat.zoom(vZoom);
                        }
                    }
                });

                function getZoomRate() {
                    var aabb = scene.worldBoundary.aabb;
                    var xsize = aabb[3]-aabb[0];
                    var ysize = aabb[4]-aabb[1];
                    var zsize = aabb[5]-aabb[2];
                    var max = (xsize > ysize ? xsize : ysize);
                    max = (zsize > max ? zsize : max);
                    return max/30;
                }

                document.addEventListener("keydown", function (e) {
                    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                        ctrlDown = e.ctrlKey || e.keyCode === 17 || e.metaKey; // !important, treat Windows or Mac Command Key as ctrl
                        altDown = e.altKey || e.keyCode === 18;
                        shiftDown = e.keyCode === 16;
                        keyDown[e.keyCode] = true;
                    }
                }, true);

                document.addEventListener("keyup", function (e) {
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
                    var over = false;
                    var mouseDownLeft;
                    var mouseDownMiddle;
                    var mouseDownRight;

                    overlay.addEventListener("mousedown", function (e) {
                        if (!over) {
                            return;
                        }
                        switch (e.which) {
                            case 1: // Left button
                                mouseDownLeft = true;
                                mouseDownLeft = true;
                                down = true;
                                xDelta = 0;
                                yDelta = 0;
                                var coords = getClickCoordsWithinElement(e);
                                lastX = coords[0];
                                lastY = coords[1];
                                break;
                            case 2: // Middle/both buttons
                                mouseDownMiddle = true;
                                break;
                            case 3: // Right button
                                mouseDownRight = true;
                                break;
                            default:
                                break;
                        }
                    });

                    overlay.addEventListener("mouseup", function (e) {
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

                    overlay.addEventListener("mouseenter", function () {
                        over = true;
                        xDelta = 0;
                        yDelta = 0;
                    });

                    overlay.addEventListener("mouseleave", function () {
                        over = false;
                        xDelta = 0;
                        yDelta = 0;
                    });

                    overlay.addEventListener("mousemove", function (e) {
                        if (!over) {
                            return;
                        }
                        if (!down) {
                            return;
                        }
                        var coords = getClickCoordsWithinElement(e);
                        var x = coords[0];
                        var y = coords[1];
                        xDelta += (x - lastX) * mouseOrbitRate;
                        yDelta += (y - lastY) * mouseOrbitRate;
                        lastX = x;
                        lastY = y;
                    });

                    scene.on("tick", function () {

                        if (Math.abs(xDelta) === 0 && Math.abs(yDelta) === 0) {
                            return;
                        }

                        var panning = shiftDown || mouseDownMiddle || (mouseDownLeft && mouseDownRight);

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

                    overlay.addEventListener("wheel", function (e) {
                        var delta = Math.max(-1, Math.min(1, -e.deltaY * 40));
                        if (delta === 0) {
                            return;
                        }
                        var d = delta / Math.abs(delta);
                        vZoom = -d * getZoomRate() * mouseZoomRate;
                    });

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

                    overlay.addEventListener("touchstart", function (event) {

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

                        event.preventDefault();
                        event.stopPropagation();
                    });

                    overlay.addEventListener("touchmove", function (event) {

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

                        event.preventDefault();
                        event.stopPropagation();
                    });

                })();

            })();

            //------------------------------------------------------------------------------------
            // Mouse and touch picking
            //------------------------------------------------------------------------------------

            (function () {

                var cursorPos = [0, 0];
                var needPick = false;
                var needPickSurface = false;
                var lastPickedEntityId;
                var hit;
                var picked = false;
                var pickedSurface = false;

                function update() {
                    if (!needPick && !needPickSurface) {
                        return;
                    }
                    picked = false;
                    pickedSurface = false;
                    if (needPickSurface || self.hasSubs("hoverSurface")) {
                        hit = scene.pick({
                            pickSurface: true,
                            canvasPos: cursorPos
                        });
                    } else { // needPick == true
                        hit = scene.pick({
                            canvasPos: cursorPos
                        });
                    }
                    if (hit) {
                        picked = true;
                        var pickedEntityId = hit.entity.id;
                        if (lastPickedEntityId !== pickedEntityId) {
                            if (lastPickedEntityId !== undefined) {
                                self.fire("hoverOut", hit);
                            }
                            self.fire("hover", hit);
                            lastPickedEntityId = pickedEntityId;
                        }
                        if (hit.worldPos) {
                            pickedSurface = true;
                            self.fire("hoverSurface", hit);
                        }
                    } else {
                        if (lastPickedEntityId !== undefined) {
                            self.fire("hoverOut", hit);
                            lastPickedEntityId = undefined;
                        }
                        self.fire("hoverOff", {
                            canvasPos: cursorPos
                        });
                    }
                    needPick = false;
                    needPickSurface = false;
                }

                scene.on("tick", update);

                function getCoordsWithinElement(event, coords) {
                    if (!event) {
                        event = window.event;
                        coords[0] = event.x;
                        coords[1] = event.y;
                    }
                    else {
                        var element = event.target;
                        var totalOffsetLeft = 0;
                        var totalOffsetTop = 0;

                        while (element.offsetParent) {
                            totalOffsetLeft += element.offsetLeft;
                            totalOffsetTop += element.offsetTop;
                            element = element.offsetParent;
                        }
                        coords[0] = event.pageX - totalOffsetLeft;
                        coords[1] = event.pageY - totalOffsetTop;
                    }
                }

                // Mouse picking

                (function () {

                    overlay.addEventListener("mousemove", function (e) {

                        //if (down) {
                        //    return;
                        //}

                        getCoordsWithinElement(e, cursorPos);

                        if (self.hasSubs("hover") || self.hasSubs("hoverOut") || self.hasSubs("hoverOff") || self.hasSubs("hoverSurface")) {
                            needPick = true;
                        }
                    });

                    var downX;
                    var downY;

                    overlay.addEventListener('mousedown', function (e) {
                        downX = e.clientX;
                        downY = e.clientY;
                    });

                    overlay.addEventListener('mouseup', (function (e) {
                        var clicks = 0;
                        var timeout;
                        return function (e) {

                            if (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3) {
                                return;
                            }

                            if (!self._doublePickFlyTo && !self.hasSubs("doublePickedObject") && !self.hasSubs("doublePickedSurface") && !self.hasSubs("doublePickedNothing")) {

                                //  Avoid the single/double click differentiation timeout

                                needPickSurface = !!self.hasSubs("pickedSurface");

                                update();

                                if (hit) {
                                    self.fire("pickedObject", hit);
                                    if (pickedSurface) {
                                        self.fire("pickedSurface", hit);
                                    }
                                } else {
                                    self.fire("pickedNothing");
                                }

                                return;
                            }

                            clicks++;

                            if (clicks == 1) {
                                timeout = setTimeout(function () {

                                    needPickSurface = !!self.hasSubs("pickedSurface");

                                    update();

                                    if (hit) {
                                        self.fire("pickedObject", hit);
                                        if (pickedSurface) {
                                            self.fire("pickedSurface", hit);
                                        }
                                    } else {
                                        self.fire("pickedNothing");
                                    }

                                    clicks = 0;
                                }, 250);

                            } else {

                                clearTimeout(timeout);

                                needPickSurface = !!self.hasSubs("doublePickedSurface");

                                update();

                                if (hit) {
                                    self.fire("doublePickedObject", hit);
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

                    overlay.addEventListener("touchstart", function (event) {

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

                        event.preventDefault();
                        event.stopPropagation();
                    });

                    //overlay.addEventListener("touchmove", function (event) {
                    //    event.preventDefault();
                    //    event.stopPropagation();
                    //});

                    overlay.addEventListener("touchend", function (event) {
                        var currentTime = Date.now();
                        var touches = event.touches;
                        var changedTouches = event.changedTouches;

                        // process tap

                        if (touches.length === 0 && changedTouches.length === 1) {

                            if (tapStartTime > -1 && currentTime - tapStartTime < TAP_INTERVAL) {

                                if (lastTapTime > -1 && tapStartTime - lastTapTime < DBL_TAP_INTERVAL) {

                                    // Double-tap

                                    cursorPos[0] = Math.round(changedTouches[0].clientX);
                                    cursorPos[1] = Math.round(changedTouches[0].clientY);
                                    needPick = true;
                                    needPickSurface = !!self.hasSubs("pickedSurface");

                                    update();

                                    if (hit) {
                                        self.fire("doublePickedObject", hit);
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

                                    cursorPos[0] = Math.round(changedTouches[0].clientX);
                                    cursorPos[1] = Math.round(changedTouches[0].clientY);
                                    needPick = true;
                                    needPickSurface = !!self.hasSubs("pickedSurface");

                                    update();

                                    if (hit) {
                                        self.fire("pickedObject", hit);
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

                        event.preventDefault();
                        event.stopPropagation();
                    });
                })();
            })();

            //------------------------------------------------------------------------------------
            // Keyboard camera control
            //------------------------------------------------------------------------------------

            (function () {

                var KEY_NUM_1 = 49;
                var KEY_NUM_2 = 50;
                var KEY_NUM_3 = 51;
                var KEY_NUM_4 = 52;
                var KEY_NUM_5 = 53;
                var KEY_NUM_6 = 54;

                document.addEventListener("keydown", function (e) {
                    var keyCode = e.keyCode;
                    switch (keyCode) {

                        case KEY_NUM_1:
                            viewer.viewFitRight();
                            break;

                        case KEY_NUM_2:
                            viewer.viewFitBack();
                            break;

                        case KEY_NUM_3:
                            viewer.viewFitLeft();
                            break;

                        case KEY_NUM_4:
                            viewer.viewFitFront();
                            break;

                        case KEY_NUM_5:
                            viewer.viewFitTop();
                            break;

                        case KEY_NUM_6:
                            viewer.viewFitBottom();
                            break;

                        default:
                            return;
                    }
                });
            })();
        },

        _flyTo: function (hit) {

            var pos;

            if (hit && hit.worldPos) {
                pos = hit.worldPos
            }

            var worldBoundary = hit ? hit.entity.worldBoundary : this.scene.worldBoundary;
            var aabb = worldBoundary.aabb;

            this._boundaryHelper.geometry.aabb = aabb;
            //    this._boundaryHelper.visible = true;

            if (pos) {

                // Fly to look at point, don't change eye->look dist

                var view = this.camera.view;
                var diff = xeogl.math.subVec3(view.eye, view.look, []);

                this._cameraFlight.flyTo({
                        look: pos,
                        //eye: xeogl.math.addVec3(pos, diff, [])
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
