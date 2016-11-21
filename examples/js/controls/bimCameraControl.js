(function () {

    "use strict";

    /**

     Controls camera with mouse and keyboard, handles selection of entities and rotation point.

     */
    xeogl.BIMCameraControl = xeogl.Component.extend({

        type: "xeogl.BIMCameraControl",

        _init: function (cfg) {

            var self = this;

            var math = xeogl.math;

            // Configs

            var sensitivityMouseRotate = cfg.sensitivityMouseRotate || 1.0;
            var sensitivityMousePan = cfg.sensitivityMousePan || 0.5;
            var sensitivityKeyboardPan = cfg.sensitivityKeyboardPan || 0.5;
            var sensitivityKeyboardRotate = cfg.sensitivityKeyboardRotate || 0.5;
            var sensitivityMouseZoom = cfg.sensitivityMouseZoom || 0.5;
            var sensitivityKeyboardZoom = cfg.sensitivityKeyboardZoom || 0.5;

            var orthoScaleRate = 0.02; // Rate at which orthographic scale changes with zoom

            var canvasPickTolerance = 4;
            var worldPickTolerance = 3;

            var tempVec3a = math.vec3();
            var tempVec3b = math.vec3();
            var tempVec3c = math.vec3();
            var pitchMat = math.mat4();

            var camera = cfg.camera;
            var scene = this.scene;
            var input = scene.input;

            // Camera position on last mouse click
            var rotateStartEye;
            var rotateStartLook;
            var rotateStartUp = math.vec3();

            var orbitPitchAxis = math.vec3([1, 0, 0]); // The current axis for vertical orbit  

            var pickHit; // Hit record from the most recent pick
            var pickClicks = 0; // Number of times we've clicked on same spot on entity

            var mouseClickPos = math.vec2(); // Canvas position of last mouseDown
            var firstPickCanvasPos = math.vec2(); // Canvas position of first pick
            var firstPickWorldPos = math.vec2(); // World position of first pick
            var firstPickTime; // Time of first pick

            var rotatePos = math.vec3([0, 0, 0]); // World-space pivot point we're currently rotating about

            var mouseDownPos = math.vec2(); // Mouse's last position while down
            var rotationDeltas = math.vec2(); // Accumulated angle deltas while rotating with keyboard or mouse

            var shiftDown = false; // True while shift key down
            var mouseDown = false; // true while mouse down


            var flying = false;

            // Rotation point indicator

            var pickHelper = this.create({
                type: "xeogl.Entity,",
                geometry: this.create({
                    type: "xeogl.SphereGeometry",
                    radius: 0.1
                }),
                material: this.create({
                    type: "xeogl.PhongMaterial",
                    diffuse: [0, 0, 0],
                    ambient: [0, 0, 0],
                    specular: [0, 0, 0],
                    emissive: [1.0, 1.0, 0.6], // Glowing
                    lineWidth: 4
                }),
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 0, 0]
                }),
                visibility: this.create({
                    type: "xeogl.Visibility",
                    visible: false // Initially invisible
                }),
                modes: this.create({
                    type: "xeogl.Modes",
                    collidable: false // This helper has no collision boundary of its own
                })
            });

            // Shows the rotation point indicator
            // at the given position for one second

            var showRotationPoint = (function () {

                var pickHelperHide = null;

                return function (pos) {

                    pickHelper.transform.xyz = pos;
                    pickHelper.visibility.visible = true;

                    if (pickHelperHide) {
                        clearTimeout(pickHelperHide);
                        pickHelperHide = null;
                    }

                    pickHelperHide = setTimeout(function () {
                            pickHelper.visibility.visible = false;
                            pickHelperHide = null;
                        },
                        1000)
                };
            })();


            var pickTimer;

            // Fires a "pick" after a timeout period unless clearPickTimer is called before then.
            function startPickTimer() {

                if (pickTimer) {
                    clearPickTimer();
                }

                pickTimer = setTimeout(function () {
                    pickClicks = 0;
                    self.fire("pick", pickHit);
                    pickTimer = null;
                }, 250);
            }

            // Stops a previous call to startPickTimer from firing a "pick"
            function clearPickTimer() {
                clearTimeout(pickTimer);
                pickTimer = null;
            }


            function resetRotate() {

                pickClicks = 0;

                rotationDeltas[0] = 0;
                rotationDeltas[1] = 0;

                rotateStartEye = camera.view.eye.slice();
                rotateStartLook = camera.view.look.slice();
                math.addVec3(rotateStartEye, camera.view.up, rotateStartUp);

                setOrbitPitchAxis();
            }

            function setOrbitPitchAxis() {
                math.cross3Vec3(math.normalizeVec3(math.subVec3(camera.view.eye, camera.view.look, [])), camera.view.up, orbitPitchAxis);
            }

            var setCursor = (function () {

                var t;

                return function (cursor, persist) {

                    clearTimeout(t);

                    self.scene.canvas.overlay.style["cursor"] = cursor;

                    if (!persist) {
                        t = setTimeout(function () {
                            self.scene.canvas.overlay.style["cursor"] = "auto";
                        }, 100);
                    }
                };
            })();

            input.on("mousedown",
                function (canvasPos) {

                    canvasPos = canvasPos.slice();

                    if (!input.mouseover) {
                        return;
                    }

                    if (!input.mouseDownLeft) {
                        return;
                    }

                    if (flying) {
                        return;
                    }

                    clearPickTimer();

                    setOrbitPitchAxis();

                    rotateStartEye = camera.view.eye.slice();
                    rotateStartLook = camera.view.look.slice();
                    math.addVec3(rotateStartEye, camera.view.up, rotateStartUp);

                    pickHit = scene.pick({
                        canvasPos: canvasPos,
                        pickSurface: true
                    });

                    if (pickHit) {

                        var pickWorldPos = pickHit.worldPos.slice();
                        var pickCanvasPos = canvasPos;

                        var pickTime = Date.now();

                        if (pickClicks === 1) {

                            if ((pickTime - firstPickTime < 250)
                                && closeEnoughCanvas(canvasPos, firstPickCanvasPos)
                                && closeEnoughWorld(pickWorldPos, firstPickWorldPos)) {

                                // Double-clicked

                                rotatePos = pickWorldPos;

                                showRotationPoint(pickWorldPos);
                            }

                            pickClicks = 0;

                        } else {

                            pickClicks = 1;

                            firstPickWorldPos = pickWorldPos;
                            firstPickCanvasPos = pickCanvasPos;
                            firstPickTime = pickTime;
                        }

                    } else {

                        pickClicks = 0;
                    }

                    mouseClickPos[0] = canvasPos[0];
                    mouseClickPos[1] = canvasPos[1];

                    mouseDownPos[0] = canvasPos[0];
                    mouseDownPos[1] = canvasPos[1];

                    rotationDeltas[0] = 0;
                    rotationDeltas[1] = 0;

                    mouseDown = true;
                });

            // Returns true if the two Canvas-space points are
            // close enough to be considered the same point

            function closeEnoughCanvas(p, q) {
                return p[0] >= (q[0] - canvasPickTolerance) &&
                    p[0] <= (q[0] + canvasPickTolerance) &&
                    p[1] >= (q[1] - canvasPickTolerance) &&
                    p[1] <= (q[1] + canvasPickTolerance);
            }

            // Returns true if the two World-space points are
            // close enough to be considered the same point

            function closeEnoughWorld(p, q) {
                return p[0] >= (q[0] - worldPickTolerance) &&
                    p[0] <= (q[0] + worldPickTolerance) &&
                    p[1] >= (q[1] - worldPickTolerance) &&
                    p[1] >= (q[1] - worldPickTolerance) &&
                    p[2] <= (q[2] + worldPickTolerance) &&
                    p[2] <= (q[2] + worldPickTolerance);
            }

            input.on("mousemove",
                function (canvasPos) {

                    if (!input.mouseover) {
                        return;
                    }

                    if (flying) {
                        return;
                    }

                    if (!mouseDown) {

                        var hit = scene.pick({
                            canvasPos: canvasPos,
                            pickSurface: true
                        });

                        if (hit) {
                            setCursor("pointer", true);
                        } else {
                            setCursor("auto", true);
                        }

                        return;
                    }

                    if (flying) {
                        return;
                    }

                    var math = xeogl.math;

                    rotationDeltas[0] += (canvasPos[0] - mouseDownPos[0]) * sensitivityMouseRotate;
                    rotationDeltas[1] += (canvasPos[1] - mouseDownPos[1]) * sensitivityMouseRotate;

                    math.rotationMat4v(rotationDeltas[1] * math.DEGTORAD, orbitPitchAxis, pitchMat);

                    camera.view.eye = rotate(rotateStartEye);
                    camera.view.look = rotate(rotateStartLook);
                    camera.view.up = math.subVec3(rotate(rotateStartUp), camera.view.eye, []);

                    mouseDownPos[0] = canvasPos[0];
                    mouseDownPos[1] = canvasPos[1];

                    //setCursor("url(bimsurfer/src/xeoViewer/controls/cursors/rotate.png), auto");
                });

            function rotate(p) {
                var p1 = math.subVec3(p, rotatePos, tempVec3a);
                var p2 = math.transformVec3(pitchMat, p1, tempVec3b);
                var p3 = math.addVec3(p2, rotatePos, tempVec3c);
                return math.rotateVec3Z(p3, rotatePos, -rotationDeltas[0] * math.DEGTORAD, math.vec3());
            }

            input.on("keydown",
                function (keyCode) {
                    if (keyCode === input.KEY_SHIFT) {
                        shiftDown = true;
                    }
                });

            input.on("keyup",
                function (keyCode) {
                    if (keyCode === input.KEY_SHIFT) {
                        shiftDown = false;
                        resetRotate();
                    }
                });

            input.on("mouseup",
                function (canvasPos) {

                    if (!mouseDown) {
                        return;
                    }

                    if (flying) {
                        return;
                    }

                    mouseDown = false;

                    if (input.mouseover) {

                        if (firstPickCanvasPos && closeEnoughCanvas(canvasPos, firstPickCanvasPos)) {

                            if (pickClicks === 1) {

                                if (shiftDown) {

                                    pickClicks = 0;

                                    self.fire("pick", pickHit);

                                } else {
                                    startPickTimer();
                                }

                            } else {
                                //  self.fire("nopick");
                            }

                        } else if (pickClicks === 0) {

                            if (mouseClickPos && closeEnoughCanvas(canvasPos, mouseClickPos)) {

                                self.fire("nopick");
                            }
                        }
                    }
                });

            input.on("dblclick",
                function () {

                    if (flying) {
                        return;
                    }

                    mouseDown = false;
                });

            //---------------------------------------------------------------------------------------------------------
            // Keyboard rotate camera
            //---------------------------------------------------------------------------------------------------------

            (function () {

                var tempVec3 = math.vec3();

                scene.on("tick",
                    function (params) {

                        if (!input.mouseover) {
                            return;
                        }

                        if (mouseDown) {
                            return;
                        }

                        if (flying) {
                            return;
                        }

                        var elapsed = params.deltaTime;

                        var yawRate = sensitivityKeyboardRotate * 0.3;
                        var pitchRate = sensitivityKeyboardRotate * 0.3;

                        if (!input.ctrlDown && !input.altDown) {

                            var left = input.keyDown[input.KEY_LEFT_ARROW];
                            var right = input.keyDown[input.KEY_RIGHT_ARROW];
                            var up = input.keyDown[input.KEY_UP_ARROW];
                            var down = input.keyDown[input.KEY_DOWN_ARROW];

                            if (left || right || up || down) {

                                var yaw = 0;
                                var pitch = 0;

                                if (right) {
                                    yaw = -elapsed * yawRate;

                                } else if (left) {
                                    yaw = elapsed * yawRate;
                                }

                                if (down) {
                                    pitch = elapsed * pitchRate;

                                } else if (up) {
                                    pitch = -elapsed * pitchRate;
                                }

                                if (Math.abs(yaw) > Math.abs(pitch)) {
                                    pitch = 0;
                                } else {
                                    yaw = 0;
                                }

                                var math = xeogl.math;

                                rotationDeltas[0] -= yaw;
                                rotationDeltas[1] += pitch;

                                math.rotationMat4v(rotationDeltas[1] * math.DEGTORAD, orbitPitchAxis, pitchMat);

                                camera.view.eye = rotate(rotateStartEye);
                                camera.view.look = rotate(rotateStartLook);
                                camera.view.up = math.subVec3(rotate(rotateStartUp), camera.view.eye, tempVec3);

                                //setCursor("url(bimsurfer/src/xeoViewer/controls/cursors/rotate.png), auto");
                            }
                        }
                    });
            })();

            //---------------------------------------------------------------------------------------------------------
            // Keyboard zoom camera
            //---------------------------------------------------------------------------------------------------------

            (function () {

                var tempVec3a = xeogl.math.vec3();
                var tempVec3b = xeogl.math.vec3();
                var tempVec3c = xeogl.math.vec3();

                scene.on("tick",
                    function (params) {

                        if (!input.mouseover) {
                            return;
                        }

                        if (mouseDown) {
                            return;
                        }

                        if (flying) {
                            return;
                        }

                        var elapsed = params.deltaTime;

                        if (!input.ctrlDown && !input.altDown) {

                            var wkey = input.keyDown[input.KEY_ADD];
                            var skey = input.keyDown[input.KEY_SUBTRACT];

                            if (wkey || skey) {

                                var delta = 0;

                                if (skey) {
                                    delta = elapsed * 0.1 * sensitivityKeyboardZoom; // Want sensitivity configs in [0..1] range
                                } else if (wkey) {
                                    delta = -elapsed * 0.1 * sensitivityKeyboardZoom;
                                }

                                var view = camera.view;
                                var eye = view.eye;
                                var look = view.look;

                                // Get vector from eye to center of rotationDeltas
                                var eyePivotVec = math.mulVec3Scalar(math.normalizeVec3(math.subVec3(eye, rotatePos, tempVec3a), tempVec3b), delta);

                                // Move eye and look along the vector
                                view.eye = math.addVec3(eye, eyePivotVec, tempVec3c);
                                view.look = math.addVec3(look, eyePivotVec, tempVec3c);

                                if (camera.project.isType("xeogl.Ortho")) {
                                    camera.project.scale += delta * (math.getAABBDiag(scene.worldBoundary.aabb) * orthoScaleRate);
                                }

                                setCursor("crosshair");

                                resetRotate();
                            }
                        }
                    });
            })();

            //---------------------------------------------------------------------------------------------------------
            // Mouse zoom
            // Roll mouse wheel to move eye and look closer or further from center of rotationDeltas
            //---------------------------------------------------------------------------------------------------------

            (function () {

                var delta = 0;
                var target = 0;
                var newTarget = false;
                var targeting = false;
                var progress = 0;

                var tempVec3a = xeogl.math.vec3();
                var tempVec3b = xeogl.math.vec3();
                var tempVec3c = xeogl.math.vec3();
                var tempVec3d = xeogl.math.vec3();

                input.on("mousewheel",
                    function (_delta) {

                        if (mouseDown) {
                            return;
                        }

                        if (flying) {
                            return;
                        }

                        delta = _delta;

                        if (delta === 0) {
                            targeting = false;
                            newTarget = false;
                        } else {
                            newTarget = true;
                        }
                    });

                scene.on("tick",
                    function () {

                        if (mouseDown) {
                            return;
                        }

                        if (flying) {
                            return;
                        }

                        var f = sensitivityMouseZoom * 1.0;

                        if (newTarget) {
                            target = delta * f;
                            progress = 0;
                            newTarget = false;
                            targeting = true;
                        }

                        if (targeting) {

                            if (delta > 0) {

                                progress += sensitivityMouseZoom * 0.1;

                                if (progress > target) {
                                    targeting = false;
                                }

                            } else if (delta < 0) {

                                progress -= sensitivityMouseZoom * 0.1;

                                if (progress < target) {
                                    targeting = false;
                                }
                            }

                            if (targeting) {

                                var view = camera.view;
                                var eye = view.eye;
                                var look = view.look;

                                // Get vector from eye to center of rotationDeltas
                                var eyePivotVec = math.mulVec3Scalar(math.normalizeVec3(math.subVec3(eye, rotatePos, tempVec3a), tempVec3b), delta);

                                console.log(rotatePos);

                                // Move eye and look along the vector
                                view.eye = math.addVec3(eye, eyePivotVec, tempVec3c);
                                view.look = math.addVec3(look, eyePivotVec, tempVec3d);

                                if (camera.project.isType("xeogl.Ortho")) {
                                    camera.project.scale += delta * (math.getAABBDiag(scene.worldBoundary.aabb) * orthoScaleRate);
                                }

                                setCursor("crosshair");

                                resetRotate();
                            }
                        }
                    });
            })();

            //---------------------------------------------------------------------------------------------------------
            // Keyboard axis view
            // Press 1,2,3,4,5 or 6 to view center of model from along an axis
            //---------------------------------------------------------------------------------------------------------

            (function () {

                var flight = self.create({
                    type: "xeogl.CameraFlightAnimation",
                    camera: camera,
                    duration: 1.0 // One second to fly to each new target
                });

                function fly(eye, look, up) {

                    flying = true;

                    setCursor("wait", true);

                    flight.cancel();

                    flight.flyTo({
                            look: look,
                            eye: eye,
                            up: up
                        },
                        function () {

                            setCursor("auto");

                            resetRotate();

                            flying = false;
                        });
                }

                input.on("keydown",
                    function (keyCode) {

                        if (!input.mouseover) {
                            return;
                        }

                        if (mouseDown) {
                            return;
                        }

                        var boundary = scene.worldBoundary;
                        var aabb = boundary.aabb;
                        var center = boundary.center;
                        var diag = xeogl.math.getAABBDiag(aabb);
                        var fitFOV = 55;
                        var dist = Math.abs((diag) / Math.tan(fitFOV / 2));

                        switch (keyCode) {

                            case input.KEY_NUM_1: // Right view
                                fly(math.vec3([center[0] - dist, center[1], center[2]]), center, math.vec3([0, 0, 1]));
                                break;

                            case input.KEY_NUM_2: // Back view
                                fly(math.vec3([center[0], center[1] + dist, center[2]]), center, math.vec3([0, 0, 1]));
                                break;

                            case input.KEY_NUM_3: // Left view
                                fly(math.vec3([center[0] + dist, center[1], center[2]]), center, math.vec3([0, 0, 1]));
                                break;

                            case input.KEY_NUM_4: // Front view
                                fly(math.vec3([center[0], center[1] - dist, center[2]]), center, math.vec3([0, 0, 1]));
                                break;

                            case input.KEY_NUM_5: // Top view
                                fly(math.vec3([center[0], center[1], center[2] + dist]), center, math.vec3([0, 1, 0]));
                                break;

                            case input.KEY_NUM_6: // Bottom view
                                fly(math.vec3([center[0], center[1], center[2] - dist]), center, math.vec3([0, -1, 0]));
                                break;

                            default:
                                return;
                        }
                    });
            })();

            //---------------------------------------------------------------------------------------------------------
            // Keyboard pan camera
            // Press W,S,A or D to pan the camera 
            //---------------------------------------------------------------------------------------------------------

            (function () {

                var tempVec3 = math.vec3();

                scene.on("tick",
                    function (params) {

                        if (mouseDown) {
                            return;
                        }

                        if (!input.mouseover) {
                            return;
                        }

                        if (flying) {
                            return;
                        }

                        var elapsed = params.deltaTime;

                        if (!input.ctrlDown && !input.altDown) {

                            var wkey = input.keyDown[input.KEY_W];
                            var skey = input.keyDown[input.KEY_S];
                            var akey = input.keyDown[input.KEY_A];
                            var dkey = input.keyDown[input.KEY_D];
                            var zkey = input.keyDown[input.KEY_Z];
                            var xkey = input.keyDown[input.KEY_X];

                            if (wkey || skey || akey || dkey || xkey || zkey) {

                                var x = 0;
                                var y = 0;
                                var z = 0;

                                var sensitivity = sensitivityKeyboardPan * 0.1;

                                if (skey) {
                                    y = elapsed * sensitivity;
                                } else if (wkey) {
                                    y = -elapsed * sensitivity;
                                }

                                if (dkey) {
                                    x = elapsed * sensitivity;
                                } else if (akey) {
                                    x = -elapsed * sensitivity;
                                }

                                if (xkey) {
                                    z = elapsed * sensitivity;
                                } else if (zkey) {
                                    z = -elapsed * sensitivity;
                                }

                                tempVec3[0] = x;
                                tempVec3[1] = y;
                                tempVec3[2] = z;

                                camera.view.pan(tempVec3);

                                resetRotate();

                                setCursor("e-resize");
                            }
                        }
                    });
            })();
        }
    });
})();