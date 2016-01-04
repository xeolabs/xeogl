/**
 A **CameraControl** pans, rotates and zooms a {{#crossLink "Camera"}}{{/crossLink}} using the mouse and keyboard,
 as well as switches it between preset left, right, anterior, posterior, superior and inferior views.

 A CameraControl is comprised of the following control components, which each handle an aspect of interaction:

 <ul>
 <li>panning - {{#crossLink "KeyboardPanCamera"}}{{/crossLink}} and {{#crossLink "MousePanCamera"}}{{/crossLink}}</li>
 <li>rotation - {{#crossLink "KeyboardRotateCamera"}}{{/crossLink}} and {{#crossLink "MouseRotateCamera"}}{{/crossLink}}</li>
 <li>zooming - {{#crossLink "KeyboardZoomCamera"}}{{/crossLink}} and {{#crossLink "MouseZoomCamera"}}{{/crossLink}}</li>
 <li>switching preset views - {{#crossLink "KeyboardAxisCamera"}}{{/crossLink}}</li>
 <li>picking - {{#crossLink "MousePickObject"}}{{/crossLink}}</li>
 <li>camera flight animation - {{#crossLink "CameraFlight"}}{{/crossLink}}</li>
 </ul>

 A CameraControl provides the controls as read-only properties, in case you need to configure or deactivate
 them individually.

 <ul>
 <li>Activating or deactivating the CameraControl will activate/deactivate all the controls in unison.</li>
 <li>Attaching a different {{#crossLink "Camera"}}{{/crossLink}} to the CameraControl will also attach that
 {{#crossLink "Camera"}}{{/crossLink}} to all the controls.</li>
 <li>The controls are not intended to be attached to a different {{#crossLink "Camera"}}{{/crossLink}} than the owner CameraControl.</li>
 <li>The CameraControl manages the lifecycles of the controls, destroying them when the CameraControl is destroyed.</li>
 </ul>

 ## Example

 ````Javascript
 var scene = new XEO.Scene();

 var camera = new XEO.Camera(scene);

 var cameraControl = new XEO.CameraControl(scene, {

        camera: camera,

        // "First person" mode rotates look about eye.
        // By default however, we orbit eye about look.
        firstPerson: false
    });

 // Reduce the sensitivity of mouse rotation
 cameraControl.mouseRotate.sensitivity = 0.7;

 // Deactivate switching between preset views
 cameraControl.axisCamera.active = false;

 // Create a GameObject
 var object = new XEO.GameObject(scene);
 ````

 @class CameraControl
 @module XEO
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CameraControl.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to control.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CameraControl. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this CameraControl is active.
 @param [firstPerson=false] {Boolean} Whether or not this CameraControl is in "first person" mode.
 @extends Component
 */
(function () {

    "use strict";


    XEO.CameraControl = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.CameraControl",

        /**
         Indicates that only one instance of a CameraControl may be active within
         its {{#crossLink "Scene"}}{{/crossLink}} at a time. When a CameraControl is activated, that has
         a true value for this flag, then any other active CameraControl will be deactivated first.

         @property exclusive
         @type Boolean
         @final
         */
        exclusive: true,

        _init: function (cfg) {

            var self = this;

            var scene = this.scene;

            // Shows a bounding box around each GameObject we fly to
            this._boundaryObject = new XEO.GameObject(scene, {
                geometry: new XEO.BoundaryGeometry(scene),
                material: new XEO.PhongMaterial(scene, {
                    diffuse: [0, 0, 0],
                    ambient: [0, 0, 0],
                    specular: [0, 0, 0],
                    emissive: [1.0, 1.0, 0.6],
                    lineWidth: 4
                }),
                visibility: new XEO.Visibility(scene, {
                    visible: false
                }),
                modes: new XEO.Modes({

                    // Does not contribute to the size of any enclosing boundaries
                    // that might be calculated by xeoEngine, eg. like that returned by XEO.Scene#worldBoundary
                    collidable: false
                })
            });

            /**
             * The {{#crossLink "KeyboardAxisCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardAxis
             * @final
             * @type KeyboardAxisCamera
             */
            this.keyboardAxis = new XEO.KeyboardAxisCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardRotateCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardOrbit
             * @final
             * @type KeyboardRotateCamera
             */
            this.keyboardRotate = new XEO.KeyboardRotateCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MouseRotateCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mouseOrbit
             * @final
             * @type MouseRotateCamera
             */
            this.mouseRotate = new XEO.MouseRotateCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardPanCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardPan
             * @final
             * @type KeyboardPanCamera
             */
            this.keyboardPan = new XEO.KeyboardPanCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MousePanCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mousePan
             * @final
             * @type MousePanCamera
             */
            this.mousePan = new XEO.MousePanCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardZoomCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardZoom
             * @final
             * @type KeyboardZoomCamera
             */
            this.keyboardZoom = new XEO.KeyboardZoomCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MouseZoomCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mouseZoom
             * @final
             * @type MouseZoomCamera
             */
            this.mouseZoom = new XEO.MouseZoomCamera(scene, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MousePickObject"}}{{/crossLink}} within this CameraControl.
             *
             * @property mousePickObject
             * @final
             * @type MousePickObject
             */
            this.mousePickObject = new XEO.MousePickObject(scene, {
                rayPick: true
            });

            this.mousePickObject.on("pick", this._objectPicked, this);

            this.mousePickObject.on("nopick",
                function (e) {
                    //alert("Nothing picked");
                });

            /**
             * The {{#crossLink "CameraFlight"}}{{/crossLink}} within this CameraControl.
             *
             * @property cameraFlight
             * @final
             * @type CameraFlight
             */
            this.cameraFlight = new XEO.CameraFlight(scene, {
                camera: cfg.camera,
                duration: 0.5
            });

            // Set component properties

            this.firstPerson = cfg.firstPerson;
            this.camera = cfg.camera;
            this.active = cfg.active !== false;
        },

        _objectPicked: function (e) {

            // Fly camera to each picked object
            // Don't change distance between look and eye

            var view = this.cameraFlight.camera.view;

            var pos;

            if (e.worldPos) {
                pos = e.worldPos

            } else if (e.object) {
                pos = e.object.worldBoundary.center
            }

            if (pos) {

                var diff = XEO.math.subVec3(view.eye, view.look, []);

                var input = this.scene.input;

              //  if (input.keyDown[input.KEY_SHIFT] && e.object) {

                    // var aabb = e.object.worldBoundary.aabb;

                    this._boundaryObject.geometry.obb = e.object.worldBoundary.obb;
                    this._boundaryObject.visibility.visible = true;

                    var center = e.object.worldBoundary.center;

                    this.cameraFlight.flyTo({
                            aabb: e.object.worldBoundary.aabb,
                            oXffset: [
                                pos[0] - center[0],
                                pos[1] - center[1],
                                pos[2] - center[2]
                            ]
                        },
                        this._hideObjectBoundary, this);

                //} else {
                //
                //    this.cameraFlight.flyTo({
                //            look: pos,
                //            eye: [
                //                pos[0] + diff[0],
                //                pos[1] + diff[1],
                //                pos[2] + diff[2]
                //            ]
                //        },
                //        this._hideObjectBoundary, this);
                //}
            }
        },

        _hideObjectBoundary: function () {
            this._boundaryObject.visibility.visible = false;
        },

        _props: {

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

                    this.keyboardRotate.firstPerson = value;
                    this.mouseRotate.firstPerson = value;

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/firstPerson:property"}}{{/crossLink}} property changes.
                     * @event firstPerson
                     * @param value The property's new value
                     */
                    this.fire('firstPerson', this._firstPerson);
                }

                ,

                get: function () {
                    return this._firstPerson;
                }
            }
            ,

            /**
             * The {{#crossLink "Camera"}}{{/crossLink}} being controlled by this CameraControl.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraControl. Defaults to the parent
             * {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property camera
             * @type Camera
             */
            camera: {

                set: function (value) {

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/camera:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event camera
                     * @param value The property's new value
                     */
                    this._setChild("camera", value);

                    // Update camera on child components

                    var camera = this._children.camera;

                    this.keyboardAxis.camera = camera;
                    this.keyboardRotate.camera = camera;
                    this.mouseRotate.camera = camera;
                    this.keyboardPan.camera = camera;
                    this.mousePan.camera = camera;
                    this.keyboardZoom.camera = camera;
                    this.mouseZoom.camera = camera;
                    this.cameraFlight.camera = camera;
                }

                ,

                get: function () {
                    return this._children.camera;
                }
            }
            ,

            /**
             * Flag which indicates whether this CameraControl is active or not.
             *
             * Fires an {{#crossLink "CameraControl/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._active === value) {
                        return;
                    }

                    // Activate or deactivate child components

                    this.keyboardAxis.active = value;
                    this.keyboardRotate.active = value;
                    this.mouseRotate.active = value;
                    this.keyboardPan.active = value;
                    this.mousePan.active = value;
                    this.keyboardZoom.active = value;
                    this.mouseZoom.active = value;
                    this.mousePickObject.active = value;
                    this.cameraFlight.active = value;

                    /**
                     * Fired whenever this CameraControl's {{#crossLink "CameraControl/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active = value);
                },

                get: function () {
                    return this._active;
                }
            }
        }
        ,

        _getJSON: function () {

            var json = {
                firstPerson: this._firstPerson,
                active: this._active
            };

            if (this._children.camera) {
                json.camera = this._children.camera.id;
            }

            return json;
        }
        ,

        _destroy: function () {

            this.active = false;

            // FIXME: Does not recursively destroy child components
            this._boundaryObject.destroy();

            this.keyboardAxis.destroy();
            this.keyboardRotate.destroy();
            this.mouseRotate.destroy();
            this.keyboardPan.destroy();
            this.mousePan.destroy();
            this.keyboardZoom.destroy();
            this.mouseZoom.destroy();
            this.mousePickObject.destroy();
            this.cameraFlight.destroy();
        }
    });

})();
