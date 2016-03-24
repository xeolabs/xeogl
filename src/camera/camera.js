/**
 A **Camera** defines viewing and projection transforms for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <ul>
 <li> A Camera is composed of a viewing transform and a {{#crossLink "Projection"}}{{/crossLink}}.</li>
 <li>The viewing transform is usually a {{#crossLink "Lookat"}}Lookat{{/crossLink}}. Having the viewing transform as a
 separate component from the Camera allows us to switch the Camera between multiple, existing viewpoints by simply re-attaching it to
 different viewing transform components (ie. {{#crossLink "Lookat"}}Lookats{{/crossLink}}).</li>
 <li>The {{#crossLink "Projection"}}{{/crossLink}} may be an {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}}
 or {{#crossLink "Perspective"}}Perspective{{/crossLink}}. Likewise, having the projection transform as a
 separate component from the Camera allows us to switch the Camera between multiple, existing projections by simply re-attaching it to
 different projection components.</li>
 <li> By default, each Camera is composed of its parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}} transform,
 (which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}) and default
 {{#crossLink "Scene/project:property"}}{{/crossLink}} transform (which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}).
 You would override those with your own transform components as necessary.</li>

 </ul>

 <img src="../../../assets/images/Camera.png"></img>

 ## Examples

 <ul>
 <li>[Perspective Camera](../../examples/#camera_perspective)</li>
 </ul>

 ## Usage

 The example below defines an {{#crossLink "Entity"}}{{/crossLink}} that has a Camera with
 a {{#crossLink "Lookat"}}{{/crossLink}} view transform and a {{#crossLink "Perspective"}}{{/crossLink}} projection transform.

 ```` javascript
 var entity = new XEO.Entity({
     camera: new XEO.Camera({
         view: new XEO.Lookat({
             eye: [0, 0, 10],
             look: [0, 0, 0],
             up: [0, 1, 0]
         }),
         project: new XEO.Lookat({
             fovy: 60,
             near: 0.1,
             far: 1000
         })
     }),
     geometry: new XEO.BoxGeometry()
 });

 entity.scene.on("tick", function () {
     camera.view.rotateEyeY(0.5);
     camera.view.rotateEyeX(0.3);
 });
 ````
 @class Camera
 @module XEO
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Camera within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Camera by ID within its parent {{#crossLink "Scene"}}Scene{{/crossLink}} later.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Camera.
 @param [cfg.view] {String|XEO.Lookat} ID or instance of a view transform within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}} transform,
 which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
 @param [cfg.project] {String|XEO.Projection} ID or instance of a projection transform
 within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/project:property"}}{{/crossLink}} transform,
 which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Camera = XEO.Component.extend({

        type: "XEO.Camera",

        _init: function (cfg) {

            this.project = cfg.project;

            this.view = cfg.view;
        },

        _props: {

            /**
             * The projection transform component for this Camera.
             *
             * When set to a null or undefined value, will default to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
             * default {{#crossLink "Scene/project:property"}}project{{/crossLink}}, which is
             * a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
             *
             * Fires a {{#crossLink "Camera/project:event"}}{{/crossLink}} event on change.
             *
             * @property project
             * @type Projection
             */
            project: {

                set: function (value) {

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/project:property"}}{{/crossLink}} property changes.
                     *
                     * @event project
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "project",
                        type: "XEO.Projection",
                        component: value,
                        sceneDefault: true,
                        on: {
                            matrix: {
                                callback: function () {
                                    this.fire("projectMatrix");
                                },
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.project;
                }
            },

            /**
             * The viewing transform for this Camera.
             *
             * When set to a null or undefined value, will default to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
             * default {{#crossLink "Scene/view:property"}}view{{/crossLink}}, which is
             * a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
             *
             * Fires a {{#crossLink "Camera/view:event"}}{{/crossLink}} event on change.
             *
             * @property view
             * @type Lookat
             */
            view: {

                set: function (value) {

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/view:property"}}{{/crossLink}} property changes.
                     *
                     * @event view
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "view",
                        type: "XEO.Lookat",
                        component: value,
                        sceneDefault: true,
                        on: {
                            matrix: {
                                callback: function () {
                                    this.fire("viewMatrix");
                                },
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.view;
                }
            }
        },

        _compile: function () {
            this._attached.project._compile();
            this._attached.view._compile();
        },

        _getJSON: function () {
            return { // Will always have the Scene's defaults
                project: this._attached.project.id,
                view: this._attached.view.id
            }
        }
    });

})();
