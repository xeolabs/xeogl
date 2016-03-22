/**
 A **CameraControl** pans, rotates and zooms a {{#crossLink "Camera"}}{{/crossLink}} with the mouse and keyboard,
 as well as switches it between preset left, right, anterior, posterior, superior and inferior views.

 A CameraControl contains the following control sub-components, each of which handle an aspect of interaction:

 <ul>
 <li>{{#crossLink "KeyboardPanCamera"}}{{/crossLink}} pans the camera with the W,S,A,D,X and Z keys</li>
 <li>{{#crossLink "MousePanCamera"}}{{/crossLink}} pans horizontally and vertically by dragging the mouse with left and right buttons down</li>
 <li>{{#crossLink "KeyboardRotateCamera"}}{{/crossLink}} rotates the camera with the arrow keys</li>
 <li>{{#crossLink "MouseRotateCamera"}}{{/crossLink}} rotates the camera by dragging with the left mouse button down</li>
 <li>{{#crossLink "KeyboardZoomCamera"}}{{/crossLink}} zooms the *eye* position closer and further from the *look* position with the + and - keys</li>
 <li>{{#crossLink "MouseZoomCamera"}}{{/crossLink}} zooms the *eye* closer and further from *look* using the mousewheel</li>
 <li>{{#crossLink "KeyboardAxisCamera"}}{{/crossLink}} between preset left, right, anterior, posterior, superior and inferior views using keys 1-6</li>
 <li>{{#crossLink "MousePickEntity"}}{{/crossLink}} TODO</li>
 <li>{{#crossLink "CameraFlight"}}{{/crossLink}} TODO</li>
 </ul>

 A CameraControl provides these control sub-components as read-only properties, which allows them to be individually configured (or deactivated) as required.

 <ul>
 <li>Activating or deactivating a CameraControl will activate or deactivate all its control sub-components.</li>
 <li>Attaching a different {{#crossLink "Camera"}}{{/crossLink}} to the CameraControl will also attach that
 {{#crossLink "Camera"}}{{/crossLink}} to all the control sub-components.</li>
 <li>The control sub-components are not supposed to be re-attached to a different {{#crossLink "Camera"}}{{/crossLink}} than the owner CameraControl.</li>
 <li>A CameraControl manages the life-cycles of its control sub-components, destroying them when the CameraControl is destroyed.</li>
 </ul>

 <img src="../../../assets/images/CameraControl.png"></img>

 ## Examples

 <ul>
 <li>[CameraControl example](../../examples/#interaction_CameraControl)</li>
 <li>[KeyboardRotateCamera example](../../examples/#interaction_KeyboardRotateCamera)</li>
 <li>[KeyboardPanCamera example](../../examples/#interaction_KeyboardPanCamera)</li>
 <li>[KeyboardZoomCamera example](../../examples/#interaction_KeyboardZoomCamera)</li>
 <li>[KeyboardRotateCamera example](../../examples/#interaction_KeyboardRotateCamera)</li>
 <li>[KeyboardPanCamera example](../../examples/#interaction_KeyboardPanCamera)</li>
 <li>[KeyboardZoomCamera example](../../examples/#interaction_KeyboardZoomCamera)</li>
 </ul>

 ## Usage

 ````Javascript
 var camera = new XEO.Camera({
     view: new XEO.Lookat({
         eye: [0, 0, 10],
         look: [0, 0, 0],
         up: [0, 1, 0]
     }),
     project: new XEO.Perspective({
         fovy: 60,
         near: 0.1,
         far: 1000
     })
 });

 var entity = new XEO.Entity({
     camera: camera,
     geometry: new XEO.BoxGeometry()
 });

 var cameraControl = new XEO.CameraControl({
     camera: entity.camera,

     // "First person" mode rotates look about eye.
     // By default however, we orbit eye about look.
     firstPerson: false
 });

 // Reduce the sensitivity of mouse rotation
 cameraControl.mouseRotate.sensitivity = 0.7;

 // Disable switching between preset views
 cameraControl.keyboardAxis.active = false;
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

            var scene = this.scene;

            // Shows a bounding box around each Entity we fly to
            this._boundaryEntity = new XEO.Entity(scene, {
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
                modes: new XEO.Modes(scene, {

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
             * @property mouseRotate
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
             * The {{#crossLink "MousePickEntity"}}{{/crossLink}} within this CameraControl.
             *
             * @property mousePickEntity
             * @final
             * @type MousePickEntity
             */
            this.mousePickEntity = new XEO.MousePickEntity(scene, {
                rayPick: true
            });

            this.mousePickEntity.on("pick", this._entityPicked, this);

            this.mousePickEntity.on("nopick",
                function () {
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

        _entityPicked: function (e) {

            // Fly camera to each picked entity
            // Don't change distance between look and eye

          //  var view = this.cameraFlight.camera.view;

            var pos;

            if (e.worldPos) {
                pos = e.worldPos

            } else if (e.entity) {
                pos = e.entity.worldBoundary.center
            }

            if (pos) {

                //var diff = XEO.math.subVec3(view.eye, view.look, []);
                //
                //var input = this.scene.input;

              //  if (input.keyDown[input.KEY_SHIFT] && e.entity) {

                    // var aabb = e.entity.worldBoundary.aabb;

                    this._boundaryEntity.geometry.obb = e.entity.worldBoundary.obb;
                    this._boundaryEntity.visibility.visible = true;

                    var center = e.entity.worldBoundary.center;

                    this.cameraFlight.flyTo({
                            aabb: e.entity.worldBoundary.aabb,
                            oXffset: [
                                pos[0] - center[0],
                                pos[1] - center[1],
                                pos[2] - center[2]
                            ]
                        },
                        this._hideEntityBoundary, this);

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
                //        this._hideEntityBoundary, this);
                //}
            }
        },

        _hideEntityBoundary: function () {
            this._boundaryEntity.visibility.visible = false;
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
                    this._setChild("XEO.Camera", "camera", value);

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
                    this.mousePickEntity.active = value;
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
            this._boundaryEntity.destroy();

            this.keyboardAxis.destroy();
            this.keyboardRotate.destroy();
            this.mouseRotate.destroy();
            this.keyboardPan.destroy();
            this.mousePan.destroy();
            this.keyboardZoom.destroy();
            this.mouseZoom.destroy();
            this.mousePickEntity.destroy();
            this.cameraFlight.destroy();
        }
    });

})();
