/**
 Rotates, pans and zooms the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Camera"}}{{/crossLink}} with keyboard, mouse and touch input.

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

 ## Pivoting

 ## Zooming

 ## Events

 ## Activating and deactivating

 ## Inertia

 ## First person

 ## Zoom to pointer

 TODO: describe only works for first-person
 TODO: make configurable?

 ## Keyboard layout

 # Fly-to


 @class CameraControl
 @module xeogl
 @submodule controls
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraControl.
 @param [cfg.firstPerson=false] {Boolean} Whether or not this CameraControl is in "first person" mode.
 @param [cfg.walking=false] {Boolean} Whether or not this CameraControl is in "walking" mode.
 @param [cfg.keyboardLayout="qwerty"] {String} Keyboard layout.
 @param [cfg.doublePickFlyTo=true] {Boolean} Whether to fly the camera to each {{#crossLink "Mesh"}}{{/crossLink}} that's double-clicked.
 @param [cfg.active=true] {Boolean} Indicates whether or not this CameraControl is active.
 @param [cfg.pivoting=false] {Boolean} When true, clicking on a {{#crossLink "Mesh"}}{{/crossLink}} and dragging will pivot
 the {{#crossLink "Camera"}}{{/crossLink}} about the picked point on the Mesh's surface.
 @param [cfg.panToPointer=false] {Boolean} When true, mouse wheel when mouse is over a {{#crossLink "Mesh"}}{{/crossLink}} will zoom
 the {{#crossLink "Camera"}}{{/crossLink}} towards the hoveredd point on the Mesh's surface.
 @param [cfg.panToPivot=false] {Boolean} TODO.
 @param [cfg.inertia=0.5] {Number} A factor in range [0..1] indicating how much the camera keeps moving after you finish panning or rotating it.
 @author xeolabs / http://xeolabs.com
 @author DerSchmale / http://www.derschmale.com
 @extends Component
 */

import {core} from "./../core.js";
import {math} from '../math/math.js';
import {Component} from '../component.js';
import {Mesh} from '../objects/mesh.js';
import {AABBGeometry} from '../geometry/aabbGeometry.js';
import {PhongMaterial} from '../materials/phongMaterial.js';
import {CameraFlightAnimation} from '../animation/cameraFlightAnimation.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.CameraControl";

class CameraControl extends Component {

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

        const self = this;

        this._boundaryHelper = new Mesh(this, {
            geometry: new AABBGeometry(this),
            material: new PhongMaterial(this, {
                diffuse: [0, 0, 0],
                ambient: [0, 0, 0],
                specular: [0, 0, 0],
                emissive: [1.0, 1.0, 0.6],
                lineWidth: 4
            }),
            visible: false,
            collidable: false
        });

        this._pivoter = new (function () { // Pivots the Camera around an arbitrary World-space position

            // Pivot math by: http://www.derschmale.com/

            const scene = self.scene;
            const camera = scene.camera;
            const canvas = scene.canvas;
            const pivotPoint = new Float32Array(3);
            let cameraOffset;
            let azimuth = 0;
            let polar = 0;
            let radius = 0;
            let pivoting = false; // True while pivoting

            const spot = document.createElement("div");
            spot.innerText = " ";
            spot.style.color = "#ffffff";
            spot.style.position = "absolute";
            spot.style.width = "25px";
            spot.style.height = "25px";
            spot.style.left = "0px";
            spot.style.top = "0px";
            spot.style["border-radius"] = "15px";
            spot.style["border"] = "2px solid #ffffff";
            spot.style["background"] = "black";
            spot.style.visibility = "hidden";
            spot.style["box-shadow"] = "5px 5px 15px 1px #000000";
            spot.style["z-index"] = 0;
            spot.style["pointer-events"] = "none";
            document.body.appendChild(spot);

            (function () {
                const viewPos = math.vec4();
                const projPos = math.vec4();
                const canvasPos = math.vec2();
                let distDirty = true;
                camera.on("viewMatrix", function () {
                    distDirty = true;
                });
                camera.on("projMatrix", function () {
                    distDirty = true;
                });
                scene.on("tick", function () {
                    if (pivoting && distDirty) {
                        math.transformPoint3(camera.viewMatrix, pivotPoint, viewPos);
                        viewPos[3] = 1;
                        math.transformPoint4(camera.projMatrix, viewPos, projPos);
                        const aabb = canvas.boundary;
                        canvasPos[0] = Math.floor((1 + projPos[0] / projPos[3]) * aabb[2] / 2);
                        canvasPos[1] = Math.floor((1 - projPos[1] / projPos[3]) * aabb[3] / 2);
                        const canvasElem = canvas.canvas;
                        const rect = canvasElem.getBoundingClientRect();
                        spot.style.left = (Math.floor(rect.left + canvasPos[0]) - 12) + "px";
                        spot.style.top = (Math.floor(rect.top + canvasPos[1]) - 12) + "px";
                        spot.style.visibility = "visible";
                        distDirty = false;
                    }
                });
            })();

            this.startPivot = function (worldPos) {
                if (worldPos) { // Use last pivotPoint by default
                    pivotPoint.set(worldPos);
                }
                let lookat = math.lookAtMat4v(camera.eye, camera.look, camera.worldUp);
                cameraOffset = math.transformPoint3(lookat, pivotPoint);
                cameraOffset[2] += math.distVec3(camera.eye, pivotPoint);
                lookat = math.inverseMat4(lookat);
                const offset = math.transformVec3(lookat, cameraOffset);
                const diff = math.vec3();
                math.subVec3(camera.eye, pivotPoint, diff);
                math.addVec3(diff, offset);
                if (camera.worldUp[2] === 1) {
                    const t = diff[1];
                    diff[1] = diff[2];
                    diff[2] = t;
                }
                radius = math.lenVec3(diff);
                polar = Math.acos(diff[1] / radius);
                azimuth = Math.atan2(diff[0], diff[2]);
                pivoting = true;
            };

            this.getPivoting = function () {
                return pivoting;
            };

            this.getPivotPos = function () {
                return pivotPoint;
            };

            this.continuePivot = function (yawInc, pitchInc) {
                if (!pivoting) {
                    return;
                }
                if (yawInc === 0 && pitchInc === 0) {
                    return;
                }
                if (camera.worldUp[2] === 1) {
                    dx = -dx;
                }
                var dx = -yawInc;
                const dy = -pitchInc;
                azimuth += -dx * .01;
                polar += dy * .01;
                polar = math.clamp(polar, .001, Math.PI - .001);
                const pos = [
                    radius * Math.sin(polar) * Math.sin(azimuth),
                    radius * Math.cos(polar),
                    radius * Math.sin(polar) * Math.cos(azimuth)
                ];
                if (camera.worldUp[2] === 1) {
                    const t = pos[1];
                    pos[1] = pos[2];
                    pos[2] = t;
                }
                // Preserve the eye->look distance, since in xeogl "look" is the point-of-interest, not the direction vector.
                const eyeLookLen = math.lenVec3(math.subVec3(camera.look, camera.eye, math.vec3()));
                math.addVec3(pos, pivotPoint);
                let lookat = math.lookAtMat4v(pos, pivotPoint, camera.worldUp);
                lookat = math.inverseMat4(lookat);
                const offset = math.transformVec3(lookat, cameraOffset);
                lookat[12] -= offset[0];
                lookat[13] -= offset[1];
                lookat[14] -= offset[2];
                const zAxis = [lookat[8], lookat[9], lookat[10]];
                camera.eye = [lookat[12], lookat[13], lookat[14]];
                math.subVec3(camera.eye, math.mulVec3Scalar(zAxis, eyeLookLen), camera.look);
                camera.up = [lookat[4], lookat[5], lookat[6]];
                spot.style.visibility = "visible";
            };

            this.endPivot = function () {
                spot.style.visibility = "hidden";
                pivoting = false;
            };

        })();

        this._cameraFlight = new CameraFlightAnimation(this, {
            duration: 0.5
        });

        this.firstPerson = cfg.firstPerson;
        this.walking = cfg.walking;
        this.keyboardLayout = cfg.keyboardLayout;
        this.doublePickFlyTo = cfg.doublePickFlyTo;
        this.active = cfg.active;
        this.pivoting = cfg.pivoting;
        this.panToPointer = cfg.panToPointer;
        this.panToPivot = cfg.panToPivot;
        this.inertia = cfg.inertia;

        this._initEvents(); // Set up all the mouse/touch/kb handlers
    }

    /**
     Indicates whether this CameraControl is active or not.

     @property active
     @default true
     @type Boolean
     */
    set active(value) {
        this._active = value !== false;
    }

    get active() {
        return this._active;
    }

    /**
     When true, clicking on a {{#crossLink "Mesh"}}{{/crossLink}} and dragging will pivot
     the {{#crossLink "Camera"}}{{/crossLink}} about the picked point on the Mesh's surface.

     @property pivoting
     @default false
     @type Boolean
     */
    set pivoting(value) {
        this._pivoting = !!value;
    }

    get pivoting() {
        return this._pivoting;
    }

    /**
     When true, mouse wheel when mouse is over a {{#crossLink "Mesh"}}{{/crossLink}} will zoom
     the {{#crossLink "Camera"}}{{/crossLink}} towards the hovered point on the Mesh's surface.

     @property panToPointer
     @default false
     @type Boolean
     */
    set panToPointer(value) {
        this._panToPointer = !!value;
        if (this._panToPointer) {
            this._panToPivot = false;
        }
    }

    get panToPointer() {
        return this._panToPointer;
    }

    /**
     When true, mouse wheel when mouse is over a {{#crossLink "Mesh"}}{{/crossLink}} will zoom
     the {{#crossLink "Camera"}}{{/crossLink}} towards the pivot point.

     @property panToPivot
     @default false
     @type Boolean
     */
    set panToPivot(value) {
        this._panToPivot = !!value;
        if (this._panToPivot) {
            this._panToPointer = false;
        }
    }

    get panToPivot() {
        return this._panToPivot;
    }

    /**
     Indicates whether this CameraControl is in "first person" mode.

     In "first person" mode (disabled by default) the look position rotates about the eye position. Otherwise,
     the eye rotates about the look.

     @property firstPerson
     @default false
     @type Boolean
     */
    set firstPerson(value) {
        this._firstPerson = !!value;
    }

    get firstPerson() {
        return this._firstPerson;
    }

    /**
     Indicates whether this CameraControl is in "walking" mode.

     When set true, this constrains eye movement to the horizontal X-Z plane. When doing a walkthrough,
     this is useful to allow us to look upwards or downwards as we move, while keeping us moving in the
     horizontal plane.

     This only has an effect when also in "first person" mode.

     @property walking
     @default false
     @type Boolean
     */
    set walking(value) {
        this._walking = !!value;
    }

    get walking() {
        return this._walking;
    }

    /**
     * TODO
     *
     *
     * @property doublePickFlyTo
     * @default true
     * @type Boolean
     */
    set doublePickFlyTo(value) {
        this._doublePickFlyTo = value !== false;
    }

    get doublePickFlyTo() {
        return this._doublePickFlyTo;
    }

    /**
     Factor in range [0..1] indicating how much the camera keeps moving after you finish
     panning or rotating it.

     A value of 0.0 causes it to immediately stop, 0.5 causes its movement to decay 50% on each tick,
     while 1.0 causes no decay, allowing it continue moving, by the current rate of pan or rotation.

     You may choose an inertia of zero when you want be able to precisely position or rotate the camera,
     without interference from inertia. ero inertia can also mean that less frames are rendered while
     you are positioning the camera.

     @property inertia
     @default 0.5
     @type Number
     */
    set inertia(value) {
        this._inertia = value === undefined ? 0.5 : value;
    }

    get inertia() {
        return this._inertia;
    }

    /**
     * TODO
     *
     * @property keyboardLayout
     * @default "qwerty"
     * @type String
     */
    set keyboardLayout(value) {
        this._keyboardLayout = value || "qwerty";
    }

    get keyboardLayout() {
        return this._keyboardLayout;
    }

    _initEvents() {

        const self = this;
        const scene = this.scene;
        const input = scene.input;
        const camera = scene.camera;
        const canvas = this.scene.canvas.canvas;
        let over = false;
        const mouseHoverDelay = 500;
        const mouseOrbitRate = 0.4;
        const mousePanRate = 0.4;
        const mouseZoomRate = 0.8;
        const mouseWheelPanRate = 0.4;
        const keyboardOrbitRate = .02;
        const keyboardPanRate = .02;
        const keyboardZoomRate = .02;
        const touchRotateRate = 0.3;
        const touchPanRate = 0.2;
        const touchZoomRate = 0.05;

        canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        const getCanvasPosFromEvent = function (event, canvasPos) {
            if (!event) {
                event = window.event;
                canvasPos[0] = event.x;
                canvasPos[1] = event.y;
            } else {
                let element = event.target;
                let totalOffsetLeft = 0;
                let totalOffsetTop = 0;
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

        const pickCursorPos = [0, 0];
        let needPickMesh = false;
        let needPickSurface = false;
        let lastPickedMeshId;
        let hit;
        let picked = false;
        let pickedSurface = false;

        function updatePick() {
            if (!needPickMesh && !needPickSurface) {
                return;
            }
            picked = false;
            pickedSurface = false;
            if (needPickSurface || self.hasSubs("hoverSurface")) {
                hit = scene.pick({
                    pickSurface: true,
                    canvasPos: pickCursorPos
                });
            } else { // needPickMesh == true
                hit = scene.pick({
                    canvasPos: pickCursorPos
                });
            }
            if (hit) {
                picked = true;
                const pickedMeshId = hit.mesh.id;
                if (lastPickedMeshId !== pickedMeshId) {
                    if (lastPickedMeshId !== undefined) {

                        /**
                         * Fired whenever the pointer no longer hovers over an {{#crossLink "Mesh"}}{{/crossLink}}.
                         * @event hoverOut
                         * @param mesh The Mesh
                         */
                        self.fire("hoverOut", {
                            mesh: scene.meshes[lastPickedMeshId]
                        });
                    }

                    /**
                     * Fired when the pointer is over a new {{#crossLink "Mesh"}}{{/crossLink}}.
                     * @event hoverEnter
                     * @param hit A pick hit result containing the ID of the Mesh - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
                     */
                    self.fire("hoverEnter", hit);
                    lastPickedMeshId = pickedMeshId;
                }
                /**
                 * Fired continuously while the pointer is moving while hovering over an {{#crossLink "Mesh"}}{{/crossLink}}.
                 * @event hover
                 * @param hit A pick hit result containing the ID of the Mesh - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
                 */
                self.fire("hover", hit);
                if (hit.worldPos) {
                    pickedSurface = true;

                    /**
                     * Fired while the pointer hovers over the surface of an {{#crossLink "Mesh"}}{{/crossLink}}.
                     *
                     * This event provides 3D information about the point on the surface that the pointer is
                     * hovering over.
                     *
                     * @event hoverSurface
                     * @param hit A surface pick hit result, containing the ID of the Mesh and 3D info on the
                     * surface position - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
                     */
                    self.fire("hoverSurface", hit);
                }
            } else {
                if (lastPickedMeshId !== undefined) {
                    /**
                     * Fired whenever the pointer no longer hovers over an {{#crossLink "Mesh"}}{{/crossLink}}.
                     * @event hoverOut
                     * @param mesh The Mesh
                     */
                    self.fire("hoverOut", {
                        mesh: scene.meshes[lastPickedMeshId]
                    });
                    lastPickedMeshId = undefined;
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
            needPickMesh = false;
            needPickSurface = false;
        }

        scene.on("tick", updatePick);

        //------------------------------------------------------------------------------------
        // Mouse, touch and keyboard camera control
        //------------------------------------------------------------------------------------

        (function () {

            let rotateVx = 0;
            let rotateVy = 0;
            let panVx = 0;
            let panVy = 0;
            let panVz = 0;
            let vZoom = 0;
            const mousePos = math.vec2();
            let panToMouse = false;

            let ctrlDown = false;
            let altDown = false;
            let shiftDown = false;
            const keyDown = {};

            const EPSILON = 0.001;

            const getEyeLookDist = (function () {
                const vec = new Float32Array(3);
                return function () {
                    return math.lenVec3(math.subVec3(camera.look, camera.eye, vec));
                };
            })();

            const getInverseProjectMat = (function () {
                let projMatDirty = true;
                camera.on("projMatrix", function () {
                    projMatDirty = true;
                });
                const inverseProjectMat = math.mat4();
                return function () {
                    if (projMatDirty) {
                        math.inverseMat4(camera.projMatrix, inverseProjectMat);
                    }
                    return inverseProjectMat;
                }
            })();

            const getTransposedProjectMat = (function () {
                let projMatDirty = true;
                camera.on("projMatrix", function () {
                    projMatDirty = true;
                });
                const transposedProjectMat = math.mat4();
                return function () {
                    if (projMatDirty) {
                        math.transposeMat4(camera.projMatrix, transposedProjectMat);
                    }
                    return transposedProjectMat;
                }
            })();

            const getInverseViewMat = (function () {
                let viewMatDirty = true;
                camera.on("viewMatrix", function () {
                    viewMatDirty = true;
                });
                const inverseViewMat = math.mat4();
                return function () {
                    if (viewMatDirty) {
                        math.inverseMat4(camera.viewMatrix, inverseViewMat);
                    }
                    return inverseViewMat;
                }
            })();

            const getSceneDiagSize = (function () {
                let sceneSizeDirty = true;
                let diag = 1; // Just in case
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

            const panToMousePos = (function () {

                const cp = math.vec4();
                const viewPos = math.vec4();
                const worldPos = math.vec4();
                const eyeCursorVec = math.vec3();

                const unproject = function (inverseProjMat, inverseViewMat, mousePos, z, viewPos, worldPos) {
                    const canvas = scene.canvas.canvas;
                    const halfCanvasWidth = canvas.offsetWidth / 2.0;
                    const halfCanvasHeight = canvas.offsetHeight / 2.0;
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

                    const lastHoverDistance = 0;
                    const inverseProjMat = getInverseProjectMat();
                    const inverseViewMat = getInverseViewMat();

                    // Get last two columns of projection matrix
                    const transposedProjectMat = getTransposedProjectMat();
                    const Pt3 = transposedProjectMat.subarray(8, 12);
                    const Pt4 = transposedProjectMat.subarray(12);
                    const D = [0, 0, -(lastHoverDistance || getSceneDiagSize()), 1];
                    const Z = math.dotVec4(D, Pt3) / math.dotVec4(D, Pt4);

                    unproject(inverseProjMat, inverseViewMat, mousePos, Z, viewPos, worldPos);

                    math.subVec3(worldPos, camera.eye, eyeCursorVec);
                    math.normalizeVec3(eyeCursorVec);

                    const px = eyeCursorVec[0] * factor;
                    const py = eyeCursorVec[1] * factor;
                    const pz = eyeCursorVec[2] * factor;

                    const eye = camera.eye;
                    const look = camera.look;

                    camera.eye = [eye[0] + px, eye[1] + py, eye[2] + pz];
                    camera.look = [look[0] + px, look[1] + py, look[2] + pz];
                };
            })();

            const panToWorldPos = (function () {
                const eyeCursorVec = math.vec3();
                return function (worldPos, factor) {
                    math.subVec3(worldPos, camera.eye, eyeCursorVec);
                    math.normalizeVec3(eyeCursorVec);
                    const px = eyeCursorVec[0] * factor;
                    const py = eyeCursorVec[1] * factor;
                    const pz = eyeCursorVec[2] * factor;
                    const eye = camera.eye;
                    const look = camera.look;
                    camera.eye = [eye[0] + px, eye[1] + py, eye[2] + pz];
                    camera.look = [look[0] + px, look[1] + py, look[2] + pz];
                };
            })();

            scene.on("tick", function () {

                const cameraInertia = self._inertia;

                if (Math.abs(rotateVx) < EPSILON) {
                    rotateVx = 0;
                }

                if (Math.abs(rotateVy) < EPSILON) {
                    rotateVy = 0;
                }

                if (rotateVy !== 0 || rotateVx !== 0) {

                    if (self._pivoter.getPivoting()) {
                        self._pivoter.continuePivot(rotateVy, rotateVx);

                    } else {

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
                    }

                    rotateVx *= cameraInertia;
                    rotateVy *= cameraInertia;
                }

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
                    const f = getEyeLookDist() / 80;
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
                        if (self._panToPointer) {
                            updatePick();
                            if (pickedSurface) {
                                panToWorldPos(hit.worldPos, -vZoom);
                            } else {
                                camera.zoom(vZoom);
                            }
                        } else if (self._panToPivot) {
                            panToWorldPos(self._pivoter.getPivotPos(), -vZoom); // FIXME: What about when pivotPos undefined?
                        } else {
                            camera.zoom(vZoom);
                        }
                        camera.ortho.scale = camera.ortho.scale + vZoom;
                    }
                    vZoom *= cameraInertia;
                }
            });

            function getZoomRate() {
                const aabb = scene.aabb;
                const xsize = aabb[3] - aabb[0];
                const ysize = aabb[4] - aabb[1];
                const zsize = aabb[5] - aabb[2];
                let max = (xsize > ysize ? xsize : ysize);
                max = (zsize > max ? zsize : max);
                if (isFinite(max)){
                    return max / 30;
                } else {
                    return 0;
                }
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

                let lastX;
                let lastY;
                let xDelta = 0;
                let yDelta = 0;
                let down = false;

                let mouseDownLeft;
                let mouseDownMiddle;
                let mouseDownRight;

                canvas.addEventListener("mousedown", function (e) {
                    if (!self._active) {
                        return;
                    }
                    over = true;
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

                document.addEventListener("mouseup", function (e) {
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
                    const x = mousePos[0];
                    const y = mousePos[1];
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

                    const panning = shiftDown || mouseDownRight;

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
                    if (self._panToPointer) {
                        needPickSurface = true;
                    }
                    const delta = Math.max(-1, Math.min(1, -e.deltaY * 40));
                    if (delta === 0) {
                        return;
                    }
                    const d = delta / Math.abs(delta);
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
                    const elapsed = e.deltaTime;
                    if (!self.ctrlDown && !self.altDown) {
                        const wkey = input.keyDown[input.KEY_ADD];
                        const skey = input.keyDown[input.KEY_SUBTRACT];
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

                        const elapsed = e.deltaTime;

                        // if (!self.ctrlDown && !self.altDown) {
                        let front, back, left, right, up, down;
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
                                panVy = -elapsed * keyboardPanRate;
                            } else if (up) {
                                panVy = elapsed * keyboardPanRate;
                            }
                            if (right) {
                                panVx = -elapsed * keyboardPanRate;
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

                let touchStartTime;
                const tapStartPos = new Float32Array(2);
                let tapStartTime = -1;

                const lastTouches = [];
                let numTouches = 0;

                const touch0Vec = new Float32Array(2);
                const touch1Vec = new Float32Array(2);

                const MODE_CHANGE_TIMEOUT = 50;
                const MODE_NONE = 0;
                const MODE_ROTATE = 1;
                const MODE_PAN = 1 << 1;
                const MODE_ZOOM = 1 << 2;
                let currentMode = MODE_NONE;
                let transitionTime = Date.now();

                function checkMode(mode) {
                    const currentTime = Date.now();
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
                    const touches = event.touches;
                    const changedTouches = event.changedTouches;

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

                    for (let i = 0, len = touches.length; i < len; ++i) {
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
                    const touches = event.touches;

                    if (numTouches === 1) {

                        var touch0 = touches[0];

                        if (checkMode(MODE_ROTATE)) {
                            const deltaX = touch0.pageX - lastTouches[0][0];
                            const deltaY = touch0.pageY - lastTouches[0][1];
                            const rotateX = deltaX * touchRotateRate;
                            const rotateY = deltaY * touchRotateRate;
                            rotateVx = rotateY;
                            rotateVy = -rotateX;
                        }

                    } else if (numTouches === 2) {

                        var touch0 = touches[0];
                        const touch1 = touches[1];

                        math.subVec2([touch0.pageX, touch0.pageY], lastTouches[0], touch0Vec);
                        math.subVec2([touch1.pageX, touch1.pageY], lastTouches[1], touch1Vec);

                        const panning = math.dotVec2(touch0Vec, touch1Vec) > 0;

                        if (panning && checkMode(MODE_PAN)) {
                            math.subVec2([touch0.pageX, touch0.pageY], lastTouches[0], touch0Vec);
                            panVx = touch0Vec[0] * touchPanRate;
                            panVy = touch0Vec[1] * touchPanRate;
                        }

                        if (!panning && checkMode(MODE_ZOOM)) {
                            const d1 = math.distVec2([touch0.pageX, touch0.pageY], [touch1.pageX, touch1.pageY]);
                            const d2 = math.distVec2(lastTouches[0], lastTouches[1]);
                            vZoom = (d2 - d1) * getZoomRate() * touchZoomRate;
                        }
                    }

                    for (let i = 0; i < numTouches; ++i) {
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
                    const elapsed = e.deltaTime;
                    const left = input.keyDown[input.KEY_LEFT_ARROW];
                    const right = input.keyDown[input.KEY_RIGHT_ARROW];
                    const up = input.keyDown[input.KEY_UP_ARROW];
                    const down = input.keyDown[input.KEY_DOWN_ARROW];
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
                    const elapsed = e.deltaTime;
                    let rotateLeft;
                    let rotateRight;
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

            // Mouse picking

            (function () {

                canvas.addEventListener("mousemove", function (e) {

                    if (!self._active) {
                        return;
                    }

                    getCanvasPosFromEvent(e, pickCursorPos);

                    if (self.hasSubs("hover") || self.hasSubs("hoverOut") || self.hasSubs("hoverOff") || self.hasSubs("hoverSurface")) {
                        needPickMesh = true;
                    }
                });

                let downX;
                let downY;
                let downCursorX;
                let downCursorY;

                canvas.addEventListener('mousedown', function (e) {
                    if (!self._active) {
                        return;
                    }
                    downX = e.clientX;
                    downY = e.clientY;
                    downCursorX = pickCursorPos[0];
                    downCursorY = pickCursorPos[1];

                    needPickSurface = self._pivoting;
                    updatePick();
                    if (self._pivoting) {
                        if (hit) {
                            self._pivoter.startPivot(hit.worldPos);
                        } else {
                            self._pivoter.startPivot(); // Continue to use last pivot point
                        }
                    }
                });

                canvas.addEventListener('mouseup', (function (e) {

                    let clicks = 0;
                    let timeout;

                    return function (e) {

                        if (!self._active) {
                            return;
                        }

                        self._pivoter.endPivot();

                        if (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3) {
                            return;
                        }

                        if (!self._doublePickFlyTo && !self.hasSubs("doublePicked") && !self.hasSubs("doublePickedSurface") && !self.hasSubs("doublePickedNothing")) {

                            //  Avoid the single/double click differentiation timeout

                            needPickSurface = !!self.hasSubs("pickedSurface");

                            updatePick();

                            if (hit) {

                                /**
                                 * Fired whenever the pointer has picked (ie. clicked or tapped) an {{#crossLink "Mesh"}}{{/crossLink}}.
                                 *
                                 * @event picked
                                 * @param hit A surface pick hit result containing the ID of the Mesh - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
                                 */
                                self.fire("picked", hit);
                                if (pickedSurface) {

                                    /**
                                     * Fired when the pointer has picked (ie. clicked or tapped) the surface of an {{#crossLink "Mesh"}}{{/crossLink}}.
                                     *
                                     * This event provides 3D information about the point on the surface that the pointer has picked.
                                     *
                                     * @event pickedSurface
                                     * @param hit A surface pick hit result, containing the ID of the Mesh and 3D info on the
                                     * surface possition - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
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

                                needPickMesh = self._doublePickFlyTo;
                                needPickSurface = needPickMesh || !!self.hasSubs("pickedSurface");
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

                            needPickMesh = self._doublePickFlyTo;
                            needPickSurface = needPickMesh && !!self.hasSubs("doublePickedSurface");

                            updatePick();

                            if (hit) {
                                /**
                                 * Fired whenever the pointer has double-picked (ie. double-clicked or double-tapped) an {{#crossLink "Mesh"}}{{/crossLink}}.
                                 *
                                 * @event picked
                                 * @param hit A surface pick hit result containing the ID of the Mesh - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
                                 */
                                self.fire("doublePicked", hit);
                                if (pickedSurface) {
                                    /**
                                     * Fired when the pointer has double-picked (ie. double-clicked or double-tapped) the surface of an {{#crossLink "Mesh"}}{{/crossLink}}.
                                     *
                                     * This event provides 3D information about the point on the surface that the pointer has picked.
                                     *
                                     * @event doublePickedSurface
                                     * @param hit A surface pick hit result, containing the ID of the Mesh and 3D info on the
                                     * surface possition - see {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.
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

                const TAP_INTERVAL = 150;
                const DBL_TAP_INTERVAL = 325;
                const TAP_DISTANCE_THRESHOLD = 4;

                let touchStartTime;
                const activeTouches = [];
                const tapStartPos = new Float32Array(2);
                let tapStartTime = -1;
                let lastTapTime = -1;

                canvas.addEventListener("touchstart", function (event) {

                    if (!self._active) {
                        return;
                    }

                    const touches = event.touches;
                    const changedTouches = event.changedTouches;

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

                    for (let i = 0, len = touches.length; i < len; ++i) {
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

                    const currentTime = Date.now();
                    const touches = event.touches;
                    const changedTouches = event.changedTouches;

                    // process tap

                    if (touches.length === 0 && changedTouches.length === 1) {

                        if (tapStartTime > -1 && currentTime - tapStartTime < TAP_INTERVAL) {

                            if (lastTapTime > -1 && tapStartTime - lastTapTime < DBL_TAP_INTERVAL) {

                                // Double-tap

                                pickCursorPos[0] = Math.round(changedTouches[0].clientX);
                                pickCursorPos[1] = Math.round(changedTouches[0].clientY);
                                needPickMesh = true;
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

                            } else if (math.distVec2(activeTouches[0], tapStartPos) < TAP_DISTANCE_THRESHOLD) {

                                // Single-tap

                                pickCursorPos[0] = Math.round(changedTouches[0].clientX);
                                pickCursorPos[1] = Math.round(changedTouches[0].clientY);
                                needPickMesh = true;
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

                    for (let i = 0, len = touches.length; i < len; ++i) {
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

            const KEY_NUM_1 = 49;
            const KEY_NUM_2 = 50;
            const KEY_NUM_3 = 51;
            const KEY_NUM_4 = 52;
            const KEY_NUM_5 = 53;
            const KEY_NUM_6 = 54;

            const center = math.vec3();
            const tempVec3a = math.vec3();
            const tempVec3b = math.vec3();
            const tempVec3c = math.vec3();

            const cameraTarget = {
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

                const keyCode = e.keyCode;

                if (keyCode !== KEY_NUM_1 &&
                    keyCode !== KEY_NUM_2 &&
                    keyCode !== KEY_NUM_3 &&
                    keyCode !== KEY_NUM_4 &&
                    keyCode !== KEY_NUM_5 &&
                    keyCode !== KEY_NUM_6) {
                    return;
                }

                const aabb = scene.aabb;
                const diag = math.getAABB3Diag(aabb);
                center[0] = aabb[0] + aabb[3] / 2.0;
                center[1] = aabb[1] + aabb[4] / 2.0;
                center[2] = aabb[2] + aabb[5] / 2.0;
                const dist = Math.abs((diag) / Math.tan(self._cameraFlight.fitFOV / 2));

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
    }

    _flyTo(hit) {

        let pos;

        if (hit && hit.worldPos) {
            pos = hit.worldPos
        }

        const aabb = hit ? hit.mesh.aabb : this.scene.aabb;

        this._boundaryHelper.geometry.targetAABB = aabb;
        //    this._boundaryHelper.visible = true;

        if (pos) {

            // Fly to look at point, don't change eye->look dist

            const camera = this.scene.camera;
            const diff = math.subVec3(camera.eye, camera.look, []);

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
    }

    _hideBoundary() {
        //    this._boundaryHelper.visible = false;
    }

    destroy() {
        this.active = false;
        super.destroy();
    }
}

componentClasses[type] = CameraControl;

export {CameraControl};
