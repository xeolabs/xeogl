/**
 A **CameraControl** pans, rotates and zooms a {{#crossLink "Camera"}}{{/crossLink}} with the mouse and keyboard,
 as well as switches it between preset left, right, anterior, posterior, superior and inferior views.

 A CameraControl contains the following control sub-components, each of which handle an aspect of interaction:

 * {{#crossLink "KeyboardPanCamera"}}{{/crossLink}} pans the camera with the W,S,A,D,X and Z keys
 * {{#crossLink "MousePanCamera"}}{{/crossLink}} pans horizontally and vertically by dragging the mouse with left and right buttons down
 * {{#crossLink "KeyboardRotateCamera"}}{{/crossLink}} rotates the camera with the arrow keys
 * {{#crossLink "MouseRotateCamera"}}{{/crossLink}} rotates the camera by dragging with the left mouse button down
 * {{#crossLink "KeyboardZoomCamera"}}{{/crossLink}} zooms the *eye* position closer and further from the *look* position with the + and - keys
 * {{#crossLink "MouseZoomCamera"}}{{/crossLink}} zooms the *eye* closer and further from *look* using the mousewheel
 * {{#crossLink "KeyboardAxisCamera"}}{{/crossLink}} between preset left, right, anterior, posterior, superior and inferior views using keys 1-6
 * {{#crossLink "MousePickEntity"}}{{/crossLink}} TODO
 * {{#crossLink "cameraFlightAnimation"}}{{/crossLink}} TODO

 A CameraControl provides these control sub-components as read-only properties, which allows them to be individually configured (or deactivated) as required.

 * Activating or deactivating a CameraControl will activate or deactivate all its control sub-components.
 * Attaching a different {{#crossLink "Camera"}}{{/crossLink}} to the CameraControl will also attach that
 {{#crossLink "Camera"}}{{/crossLink}} to all the control sub-components.
 * The control sub-components are not supposed to be re-attached to a different {{#crossLink "Camera"}}{{/crossLink}} than the owner CameraControl.
 * A CameraControl manages the life-cycles of its control sub-components, destroying them when the CameraControl is destroyed.

 <img src="../../../assets/images/CameraControl.png"></img>

 ## Examples

 * [CameraControl example](../../examples/#interaction_CameraControl)
 * [KeyboardRotateCamera example](../../examples/#interaction_KeyboardRotateCamera)
 * [KeyboardPanCamera example](../../examples/#interaction_KeyboardPanCamera)
 * [KeyboardZoomCamera example](../../examples/#interaction_KeyboardZoomCamera)
 * [KeyboardRotateCamera example](../../examples/#interaction_KeyboardRotateCamera)
 * [KeyboardPanCamera example](../../examples/#interaction_KeyboardPanCamera)
 * [KeyboardZoomCamera example](../../examples/#interaction_KeyboardZoomCamera)

 ## Usage

 ````Javascript
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

 var entity = new xeogl.Entity({
     camera: camera,
     geometry: new xeogl.BoxGeometry()
 });

 var cameraControl = new xeogl.CameraControl({
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
 @module xeogl
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


    xeogl.CameraControl = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.CameraControl",

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
            this._boundaryHelper = this.create({
                type: "xeogl.Entity",
                geometry: this.create({
                    type: "xeogl.AABBGeometry"
                }),
                material: this.create({
                    type: "xeogl.PhongMaterial",
                    diffuse: [0, 0, 0],
                    ambient: [0, 0, 0],
                    specular: [0, 0, 0],
                    emissive: [1.0, 1.0, 0.6],
                    lineWidth: 4
                }),
                visibility: this.create({
                    type: "xeogl.Visibility",
                    visible: false
                }),
                modes: this.create({
                    type: "xeogl.Modes",
                    // Does not contribute to the size of any enclosing boundaries
                    // that might be calculated by xeogl, eg. like that returned by xeogl.Scene#worldBoundary
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
            this.keyboardAxis = this.create(xeogl.KeyboardAxisCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardRotateCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardOrbit
             * @final
             * @type KeyboardRotateCamera
             */
            this.keyboardRotate = this.create(xeogl.KeyboardRotateCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MouseRotateCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mouseRotate
             * @final
             * @type MouseRotateCamera
             */
            this.mouseRotate = this.create(xeogl.MouseRotateCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardPanCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardPan
             * @final
             * @type KeyboardPanCamera
             */
            this.keyboardPan = this.create(xeogl.KeyboardPanCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MousePanCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mousePan
             * @final
             * @type MousePanCamera
             */
            this.mousePan = this.create(xeogl.MousePanCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "KeyboardZoomCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property keyboardZoom
             * @final
             * @type KeyboardZoomCamera
             */
            this.keyboardZoom = this.create(xeogl.KeyboardZoomCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MouseZoomCamera"}}{{/crossLink}} within this CameraControl.
             *
             * @property mouseZoom
             * @final
             * @type MouseZoomCamera
             */
            this.mouseZoom = this.create(xeogl.MouseZoomCamera, {
                camera: cfg.camera
            });

            /**
             * The {{#crossLink "MousePickEntity"}}{{/crossLink}} within this CameraControl.
             *
             * @property mousePickEntity
             * @final
             * @type MousePickEntity
             */
            this.mousePickEntity = this.create(xeogl.MousePickEntity, {
                pickSurface: true
            });

            this.mousePickEntity.on("pick", this._entityPicked, this);

            this.mousePickEntity.on("nopick",
                function () {
                    //alert("Nothing picked");
                });

            /**
             * The {{#crossLink "cameraFlightAnimation"}}{{/crossLink}} within this CameraControl.
             *
             * @property cameraFlight
             * @final
             * @type cameraFlightAnimation
             */
            this.cameraFlight = this.create(xeogl.CameraFlightAnimation, {
                camera: cfg.camera,
                duration: 0.5
            });

            // Set component properties

            this.firstPerson = cfg.firstPerson;
            this.camera = cfg.camera;
            this.active = cfg.active !== false;
        },

        _entityPicked: function (e) {

            var pos;

            if (e.worldPos) {
                pos = e.worldPos
            }

            var worldBoundary = e.entity.worldBoundary;
            var aabb = worldBoundary.aabb;
            var sphere = worldBoundary.sphere;

            this._boundaryHelper.geometry.aabb = aabb;
            //    this._boundaryHelper.visibility.visible = true;

            if (pos) {

                // Fly to look at point, don't change eye->look dist

                var view = this.camera.view;
                var diff = xeogl.math.subVec3(view.eye, view.look, []);

                this.cameraFlight.flyTo({
                        look: pos,
                        aabb: aabb
                    },
                    this._hideEntityBoundary, this);

                // TODO: Option to back off to fit AABB in view

            } else {

                // Fly to fit target boundary in view

                this.cameraFlight.flyTo({
                        aabb: aabb
                    },
                    this._hideEntityBoundary, this);
            }
        },

        _hideEntityBoundary: function () {
            this._boundaryHelper.visibility.visible = false;
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
                },

                get: function () {
                    return this._firstPerson;
                }
            },

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

                    this.keyboardAxis.camera = camera;
                    this.keyboardRotate.camera = camera;
                    this.mouseRotate.camera = camera;
                    this.keyboardPan.camera = camera;
                    this.mousePan.camera = camera;
                    this.keyboardZoom.camera = camera;
                    this.mouseZoom.camera = camera;
                    this.cameraFlight.camera = camera;
                },

                get: function () {
                    return this._attached.camera;
                }
            },

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
        },

        _getJSON: function () {

            var json = {
                firstPerson: this._firstPerson,
                active: this._active
            };

            if (this._attached.camera) {
                json.camera = this._attached.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });

})();
