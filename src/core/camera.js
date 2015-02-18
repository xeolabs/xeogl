"use strict";

/**
 Defines a viewpoint on associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li> A Camera is composed of a viewing transform and a projection transform.</li>

 <li>The viewing transform may be a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.</li>

 <li>The projection transform may be an {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}}
 or {{#crossLink "Perspective"}}Perspective{{/crossLink}}.</li>

 <li> By default, each Camera gets its parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}},
 which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}, and default
 {{#crossLink "Scene/project:property"}}{{/crossLink}}, which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
 You would override those with your own transform components as necessary.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6891059/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's associated with a
 Camera that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a {{#crossLink "Perspective"}}Perspective{{/crossLink}}
 projection transform.

 ```` javascript
 var scene = new XEO.Scene();

 var lookat = new XEO.Lookat(scene, {
    eye: [0,0,-10],
    look: [0,0,0],
    up: [0,1,0]
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

 ````
 @class Camera
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Camera within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Camera by ID within its parent {{#crossLink "Scene"}}Scene{{/crossLink}} later.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Camera.
 @param [cfg.view] {String|XEO.Lookat} ID or instance of a view transform within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}},
 which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
 @param [cfg.project] {String|XEO.Perspective|XEO.Ortho|XEO.Frustum} ID or instance of a projection transform
 within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/project:property"}}{{/crossLink}},
 which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
 @extends Component
 */
XEO.Camera = XEO.Component.extend({

    className: "XEO.Camera",

    type: "camera",

    _init: function (cfg) {
        this.project = cfg.project;
        this.view = cfg.view;
    },

    /**
     * The projection transform for this Camera.
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
    set project(value) {

        /**
         * Fired whenever this Camera's {{#crossLink "Camera/project:property"}}{{/crossLink}} property changes.
         * @event project
         * @param value The property's new value
         */
        this._setChild("project", value);
    },

    get project() {
        return this._children.project;
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
    set view(value) {

        /**
         * Fired whenever this Camera's {{#crossLink "Camera/view:property"}}{{/crossLink}} property changes.
         *
         * @event view
         * @param value The property's new value
         */
        this._setChild("view", value);
    },

    get view() {
        return this._children.view;
    },

    _compile: function () {
        this._children.project._compile();
        this._children.view._compile();
    },

    _getJSON: function () {
        return {
            project: this.project.id,
            view: this.view.id
        };
    }
});

XEO.Scene.prototype.newCamera = function (cfg) {
    return new XEO.Camera(this, cfg);
};
