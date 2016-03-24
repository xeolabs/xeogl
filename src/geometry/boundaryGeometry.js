/**
 A **BoundaryGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the entity-aligned wireframe bounding box (OBB)
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
 var box = new XEO.Entity({
     geometry: new XEO.BoxGeometry({
        xSize: 1,
        ySize: 1,
        zSize: 1
     })
 });

 // World-space boundary of the first entity
 var worldBoundary = box.worldBoundary;

 // Second Entity with a BoundaryGeometry that shows a wireframe box
 // for the World-space boundary of the first Entity

 new XEO.Entity({

     geometry: new XEO.BoundaryGeometry({
         boundary: worldBoundary
     }),

     material: new XEO.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 @class BoundaryGeometry
 @module XEO
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

    XEO.BoundaryGeometry = XEO.Geometry.extend({

        type: "XEO.BoundaryGeometry",

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
                        type: "XEO.Boundary3D",
                        component: value,
                        sceneDefault: false,
                        on: {
                            updated: function () {
                                if (geometryDirty) {
                                    return;
                                }
                                geometryDirty = true;
                                XEO.scheduleTask(function () {
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
                obb[0][0], obb[0][1], obb[0][2],
                obb[1][0], obb[1][1], obb[1][2],
                obb[2][0], obb[2][1], obb[2][2],
                obb[3][0], obb[3][1], obb[3][2],
                obb[4][0], obb[4][1], obb[4][2],
                obb[5][0], obb[5][1], obb[5][2],
                obb[6][0], obb[6][1], obb[6][2],
                obb[7][0], obb[7][1], obb[7][2]
            ];
        },

        _setPositionsFromAABB: function (aabb) {
            this.positions = [
                aabb.max[0], aabb.max[1], aabb.max[2],
                aabb.max[0], aabb.min[1], aabb.max[2],
                aabb.min[0], aabb.min[1], aabb.max[2],
                aabb.min[0], aabb.max[1], aabb.max[2],
                aabb.max[0], aabb.max[1], aabb.min[2],
                aabb.max[0], aabb.min[1], aabb.min[2],
                aabb.min[0], aabb.min[1], aabb.min[2],
                aabb.min[0], aabb.max[1], aabb.min[2]
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
