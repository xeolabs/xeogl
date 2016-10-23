/**
 A **CardboardFirstPerson** handles device orientation and position events and updates a Camera for a first-person view transform.

 ## Usage

 Stereo view of an Entity with CardboardFirstPerson control:

 ````javascript
 new xeogl.Entity({
     geometry: new xeogl.BoxGeometry()
 });

 new Stereo();

 new xeogl.CardboardFirstPerson();
 ````

 Stereo view of an Entity with CardboardFirstPerson control, using custom Camera and Viewport:

 ````javascript
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

 var viewport = new xeogl.Viewport();

 var entity = new xeogl.Entity({
     camera: camera,
     viewport: viewport,
     geometry: new xeogl.BoxGeometry()
 });

 new xeogl.Stereo({
     camera: camera,
     viewport: viewport
 });

 new xeogl.CardboardFirstPerson({
     camera: camera,
     active: true // Default
 });
 ````

 @class CardboardFirstPerson
 @module xeogl
 @submodule interaction
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CardboardFirstPerson in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CardboardFirstPerson.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this CardboardFirstPerson.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CardboardFirstPerson. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this CardboardFirstPerson is active.
 @extends CameraController
 */
(function () {

    "use strict";

    xeogl.CardboardFirstPerson = xeogl.CameraController.extend({

        type: "xeogl.CardboardFirstPerson",

        _init: function (cfg) {

            this._super(cfg);

            this.on("active",
                function (active) {

                    // TODO

                    if (active) {

                    } else {

                    }
                },
                this);
        }
    });
})();
