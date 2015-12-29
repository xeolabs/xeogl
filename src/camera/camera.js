

/**
 A **Camera** defines a viewpoint on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li> A Camera is composed of a viewing transform and a projection transform.</li>

 <li>The viewing transform is usually a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.</li>

 <li>The projection transform may be an {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}}
 or {{#crossLink "Perspective"}}Perspective{{/crossLink}}.</li>

 <li> By default, each Camera is composed of its parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}} transform,
 (which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}) and default
 {{#crossLink "Scene/project:property"}}{{/crossLink}} transform (which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}).
 You would override those with your own transform components as necessary.</li>

 </ul>

 <img src="../../../assets/images/Camera.png"></img>

 ## Example

 In the example below, we have

 <ul>
 <li>a {{#crossLink "Lookat"}}{{/crossLink}} view transform,</li>
 <li>a {{#crossLink "Perspective"}}{{/crossLink}} projection transform,</li>
 <li>a Camera attached to the {{#crossLink "Lookat"}}{{/crossLink}} and {{#crossLink "Perspective"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>


 ```` javascript
 var scene = new XEO.Scene();

 var lookat = new XEO.Lookat(scene, {
        eye: [0, 0, -10],
        look: [0, 0, 0],
        up: [0, 1, 0]
    });

 var perspective = new XEO.Lookat(scene, {
        fovy: 60,
        near: 0.1,
        far: 1000
    });

 var camera = new XEO.Camera(scene, {
        view: lookat,
        project: perspective
    });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
        camera: camera,
        geometry: geometry
    });

 scene.on("tick", function () {
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
 @param [cfg.project] {String|XEO.Perspective|XEO.Ortho|XEO.Frustum} ID or instance of a projection transform
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
             * @type Perspective|XEO.Ortho|XEO.Frustum
             */
            project: {

                set: function (value) {

                    // Unsubscribe from old projection's events

                    var oldProject = this._children.project;

                    if (oldProject) {
                        oldProject.off(this._onProjectMatrix);
                    }
                    
                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/project:property"}}{{/crossLink}} property changes.
                     * @event project
                     * @param value The property's new value
                     */
                    this._setChild("project", value);

                    var newProject = this._children.project;

                    if (newProject) {

                        // Subscribe to new projection's events

                        var self = this;
                        
                        this._onProjectMatrix = newProject.on("matrix",
                            function () {
                                self.fire("projectMatrix");
                            });
                    }
                },

                get: function () {
                    return this._children.project;
                }
            },

            /**
             * The viewing transform component for this Camera.
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

                    // Unsubscribe from old view transform's events

                    var oldView = this._children.project;

                    if (oldView) {
                        oldView.off(this._onViewMatrix);
                    }

                    /**
                     * Fired whenever this Camera's {{#crossLink "Camera/view:property"}}{{/crossLink}} property changes.
                     *
                     * @event view
                     * @param value The property's new value
                     */
                    this._setChild("view", value);

                    var newView = this._children.view;

                    if (newView) {

                        // Subscribe to new projection's events

                        var self = this;

                        this._onViewMatrix = newView.on("matrix",
                            function () {
                                self.fire("viewMatrix");
                            });
                    }
                },

                get: function () {
                    return this._children.view;
                }
            }
        },

        _compile: function () {
            this._children.project._compile();
            this._children.view._compile();
        },

        _getJSON: function () {

            var json = {};

            if (this._children.project) {
                json.project = this._children.project.id;
            }

            if (this._children.view) {
                json.view = this._children.view.id;
            }

            return json;
        }
    });

})();
