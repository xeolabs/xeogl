/**
 A **BoundaryGeometry** is {{#crossLink "Geometry"}}{{/crossLink}} that shows the entity-aligned wireframe bounding box (OBB)
 of a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 ## Examples

 <ul>
 <li>[Rendering a BoundaryGeometry](../../examples/#geometry_BoundaryGeometry)</li>
 </ul>

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a BoundaryGeometry that shows the extents of the
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} of another {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript

 // First Entity with a BoxGeometry
 var box = new xeogl.Entity({
     geometry: new xeogl.BoxGeometry({
        xSize: 1,
        ySize: 1,
        zSize: 1
     })
 });

 // World-space boundary of the first entity
 var worldBoundary = box.worldBoundary;

 // Second Entity with a BoundaryGeometry that shows a wireframe box
 // for the World-space boundary of the first Entity

 new xeogl.Entity({

     geometry: new xeogl.BoundaryGeometry({
         boundary: worldBoundary
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 @class BoundaryGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BoundaryGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoundaryGeometry.
 @param [cfg.boundary] {Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    xeogl.BoundaryGeometry = xeogl.Geometry.extend({

        type: "xeogl.BoundaryGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.primitive = cfg.primitive || "lines";

            this.indices = [
                0, 1, 1, 2, 2, 3, 3, 0, 4,
                5, 5, 6, 6, 7, 7, 4, 0, 4,
                1, 5, 2, 6, 3, 7
            ];

            if (cfg.boundary) {
                this.boundary = cfg.boundary;

            } else if (cfg.obb) {
                this.obb = cfg.obb;

            } else if (cfg.aabb) {
                this.aabb = cfg.aabb;

            } else if (cfg.positions) {
                this.positions = cfg.positions;

            } else {
                this.positions = [
                    1.0, 1.0, 1.0,
                    1.0, -1.0, 1.0,
                    -1.0, -1.0, 1.0,
                    -1.0, 1.0, 1.0,
                    1.0, 1.0, -1.0,
                    1.0, -1.0, -1.0,
                    -1.0, -1.0, -1.0,
                    -1.0, 1.0, -1.0
                ];
            }
        },

        _props: {

            /**
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} we are showing.
             *
             * Fires a {{#crossLink "BoundaryGeometry/boundary:event"}}{{/crossLink}} event on change.
             *
             * @property Boundary3D
             * @type Boundary3D
             */
            boundary: {

                set: function (value) {

                    var geometryDirty = false;
                    var self = this;

                    this._attach({
                        name: "boundary",
                        type: "xeogl.Boundary3D",
                        component: value,
                        sceneDefault: false,
                        on: {
                            updated: function () {
                                if (geometryDirty) {
                                    return;
                                }
                                geometryDirty = true;
                                xeogl.scheduleTask(function () {
                                    self._setPositionsFromOBB(self._attached.boundary.obb);
                                    geometryDirty = false;
                                });
                            }
                        },
                        onAttached: function () {
                            self._setPositionsFromOBB(self._attached.boundary.obb);
                        }
                    });
                },

                get: function () {
                    return this._attached.boundary;
                }
            },

            /**
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} we are showing.
             *
             * Fires a {{#crossLink "BoundaryGeometry/boundary:event"}}{{/crossLink}} event on change.
             *
             * @property Boundary3D
             * @type Boundary3D
             */
            obb: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (this._attached.boundary) {
                        this.boundary = null;
                    }

                    this._setPositionsFromOBB(value);
                }
            },

            /**
             * Assign to an Axis-aligned bounding-box
             *
             * @property aabb
             * @type Boundary3D
             */
            aabb: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (this._attached.boundary) {
                        this.boundary = null;
                    }

                    this._setPositionsFromAABB(value);
                }
            }
        },

        _setPositionsFromOBB: function (obb) {
            this.positions = [
                obb[0], obb[1], obb[2],
                obb[4], obb[5], obb[6],
                obb[8], obb[9], obb[10],
                obb[12], obb[13], obb[14],
                obb[16], obb[17], obb[18],
                obb[20], obb[21], obb[22],
                obb[24], obb[25], obb[26],
                obb[28], obb[29], obb[30]
            ];
        },

        _setPositionsFromAABB: function (aabb) {
            this.positions = [
                aabb[3], aabb[4], aabb[5],
                aabb[3], aabb[1], aabb[5],
                aabb[0], aabb[1], aabb[5],
                aabb[0], aabb[4], aabb[5],
                aabb[3], aabb[4], aabb[2],
                aabb[3], aabb[1], aabb[2],
                aabb[0], aabb[1], aabb[2],
                aabb[0], aabb[4], aabb[2]
            ];
        },

        _getJSON: function () {

            var json = {};

            if (this._attached.boundary) {
                json.boundary = this._attached.boundary.id;

            } else if (json.positions) {
                json.positions = this.positions;
            }

            return json;
        },

        _destroy: function () {

            if (this._attached.boundary) {
                this._attached.boundary.off(this._onBoundaryUpdated);
                this._attached.boundary.off(this._onBoundaryDestroyed);
            }

            this._super();
        }
    });
})();
