/**
 A **PointMarkings** is used to draw persistable markings on Entities.

 ## Examples

TODO

 ## Usage

 ````javascript
 // Load a gearbox model to draw marks on
 var gearbox = new xeogl.GLTFModel({
     src: "models/gltf/gearbox/gearbox_assy.gltf"
 });

 // Set initial camera position
 var view = gearbox.scene.camera.view;
 view.eye = [184.21, 10.54, -7.03];
 view.look = [159.20, 17.02, 3.21];
 view.up = [-0.15, 0.97, 0.13];

 // Create marks wherever we draw on the surface of our gearbox

 var scene = gearbox.scene; // Using default scene for this example
 var input = scene.input;
 var pointMarkings = new xeogl.PointMarkings();

 input.on("mousemove", function (coords) {

     var hit = scene.pick({
         canvasPos: coords,
         pickSurface: true
     });

     if (hit) {
         pointMarkings.draw(hit);
     }
 });

 // Allow user camera control
 new xeogl.CameraControl();
 ````

 ````javascript
 var data = pointMarkings.save();

 pointMarkings.clear();

 pointMarkings.load(data);
 ````

 @class PointMarkings
 @module xeogl
 @submodule marking
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this PointMarkings in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PointMarkings.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this PointMarkings.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PointMarkings. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this PointMarkings is active.
 @extends CameraController
 */
(function () {

    "use strict";

    xeogl.PointMarkings = xeogl.Component.extend({

        type: "xeogl.PointMarkings",

        _init: function (cfg) {

            this._super(cfg);

            this._drawings = {};
            this._entityDestroySubs = {};

            this._material = this.create({
                type: "xeogl.PhongMaterial",
                emissive: [1.0, 0.0, 0.0],
                diffuse: [0, 0, 0],
                ambient: [0, 0, 0],
                pointSize: 8
            });

            this._modes = this.create({
                type: "xeogl.Modes",
                pickable: false,
                collidable: false
            })
        },

        /**
         Draws a mark on this PointMarkings.

         The point that we're drawing at is given as a hit record that was previously returned from a call to the
         {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Scene/pick:method"}}pick(){{/crossLink}} method. Performing the
         pick externally, instead of encapsulating within this draw() method, allows us to intercept the
         pick result and perform other tasks with it, in addition to drawing.

         @param {*} hit A hit record previously obtained from {{#crossLink "Scene/pick:method"}}{{/crossLink}}.
         */
        draw: function (hit) {
            if (hit.entity && hit.worldPos && hit.normal) {
                var drawing = this._getDrawing(hit.entity);
                drawing.draw(hit);
            }
        },

        _getDrawing: function (entity) {
            var drawing = this._drawings[entity.id];
            if (!drawing) {
                drawing = new xeogl._EntityPointMarkings({ // Defined in this code module, after this component type
                    entity: entity,
                    material: this._material,
                    modes: this._modes
                });
                this._drawings[entity.id] = drawing;
                var self = this;
                this._entityDestroySubs[entity.id] = entity.on("destroyed", function () {
                    self._destroyDrawing(drawing);
                })
            }
            return drawing;
        },

        _destroyDrawing: function (drawing) {
            var entity = drawing.entity;
            entity.off(this._entityDestroySubs[entity.id]);
            drawing.destroy();
            delete this._drawings[entity.id];
            delete this._entityDestroySubs[entity.id];
        },

        /**
         Clears this PointMarkings.
         */
        clear: function () {
            for (var entityId in this._drawings) {
                if (this._drawings.hasOwnProperty(entityId)) {
                    this._destroyDrawing(this._drawings[entityId]);
                }
            }
        },

        /**
         Saves this PointMarkings.
         @returns {*} Data that may be loaded again with {{#crossLink "PointMarkings/load:method"}}save(){{/crossLink}}.
         */
        save: function () {
            var data = [];
            var drawing;
            for (var entityId in this._drawings) {
                if (this._drawings.hasOwnProperty(entityId)) {
                    drawing = this._drawings[entityId];
                    data.push({
                        entityId: entityId,
                        data: drawing.getData()
                    });
                }
            }
            return data;
        },

        /**
         Loads data into this PointMarkings.
         Clears this PointMarkings first.
         @param {*} data Data that was previously saved with {{#crossLink "PointMarkings/save:method"}}save(){{/crossLink}}.
         */
        load: function (data) {
            this.clear();
            var elem;
            var entityId;
            var entity;
            var drawing;
            for (var i = 0, len = data.length; i < len; i++) {
                elem = data[i];
                entityId = elem.entityId;
                entity = this.scene.entities[entityId];
                if (!entity) {
                    this.warn("load - entity not found: " + entityId);
                } else {
                    drawing = this._getDrawing(entity);
                    if (drawing) {
                        drawing.setData(elem.data);
                    }
                }
            }
        },

        _destroy: function () {
            this.clear();
        }
    });

    const MAX_POINTS = 100000;

    xeogl._EntityPointMarkings = xeogl.Component.extend({

        type: "xeogl._EntityPointMarkings",

        _init: function (cfg) {

            this._super(cfg);

            var entity = cfg.entity;
            var positions = new Float32Array(MAX_POINTS * 3);
            var indices = new Uint16Array(MAX_POINTS);

            for (var i = 0; i < MAX_POINTS; i++) { // Initialize the indices to reference the positions
                indices[i] = i;
            }

            this._helper = this.create({
                type: "xeogl.Entity",
                geometry: {
                    primitive: "points",
                    positions: positions,
                    indices: indices,
                    usage: "dynamic"
                },
                material: cfg.material,
                modes: cfg.modes,
                visibility: entity.visibility,  // Visibility and transform in synch with target entity
                XXXXtransform: entity.transform
            });

            this._numPoints = 0;
        },

        draw: (function () {
            var tempVec3 = xeogl.math.vec3();
            return function (hit) {
                if (hit.worldPos && hit.normal) {
                    var worldPos = hit.worldPos;
                    var normal = hit.normal;
                    tempVec3[0] = worldPos[0] + normal[0] * 0.01;
                    tempVec3[1] = worldPos[1] + normal[1] * 0.01;
                    tempVec3[2] = worldPos[2] + normal[2] * 0.01;
                    this._helper.geometry.setPositions(tempVec3, this._numPoints * 3);
                    this._numPoints++;
                }
            };
        })(),

        getData: function () {
            return this._helper.geometry.positions.slice(0, this._numPoints * 3);
        },

        setData: function (data) {
            var i = 0;
            var len = data.length;
            while (i < len) {
                this._positions[i] = data[i];
                i++;
            }
            this._numPoints = len;
            len = this._positions.length;
            while (i < len) {
                this._positions[i] = 0;
                i++;
            }
            this._helper.geometry.positions = this._positions;
        }
    });
})();
