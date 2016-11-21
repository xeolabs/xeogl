/**
 An **AABBGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the extents of a World-space axis-aligned bounding box (AABB).

 <a href="../../examples/#geometry_AABBGeometry"><img src="http://i.giphy.com/3o6ZsSVy0NKXZ1vDSo.gif"></img></a>

 ## Overview

 * A World-space AABB is an axis-aligned box given as a six-element array containing the min/max extents of an axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.
 * Set a AABBGeometry's {{#crossLink "AABBGeometry/aabb:property"}}{{/crossLink}} property to an AABB to fix the AABBGeometry to those extents, or
 * set a AABBGeometry's {{#crossLink "AABBGeometry/boundary:property"}}{{/crossLink}} property to a {{#crossLink "Boundary3D"}}{{/crossLink}}
 to make it dynamically fit itself to changes in the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}} extents.

 ## Examples

 * [Rendering an AABBGeometry](../../examples/#geometry_AABBGeometry)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a AABBGeometry that shows the extents of the
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} of another {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript
 // First Entity with a TorusGeometry
 var torus = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Entity with an AABBGeometry that shows a wireframe box
 // for the World-space boundary of the first Entity

 var boundaryHelper = new xeogl.Entity({

     geometry: new xeogl.AABBGeometry({
         boundary: torus.worldBoundary
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 Now whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position, our AABBGeometry will automatically
 update to stay fitted to it.

 We could also directly configure the AABBGeometry with
 the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/aabb:property"}}AABB{{/crossLink}}:

 ````javascript
 var boundaryHelper2 = new xeogl.Entity({

     geometry: new xeogl.AABBGeometry({
         boundary: torus.worldBoundary.aabb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````
 Note that, without the reference to a {{#crossLink "Boundary3D"}}{{/crossLink}}, our second AABBGeometry is fixed to the
 given AABB and will not automatically update whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position.

 @class AABBGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this AABBGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AABBGeometry.
 @param [cfg.boundary] {Number|String|Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}.
 @param [cfg.aabb] {Float32Array} An axis-aligned box (AABB) in a six-element Float32Array
 containing the min/max extents of the axis-aligned volume, ie. ````(xmin,ymin,zmin,xmax,ymax,zmax)````.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.AABBGeometry = xeogl.Geometry.extend({

        type: "xeogl.AABBGeometry",

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
             A {{#crossLink "Boundary3D"}}{{/crossLink}} whose {{#crossLink "Boundary3D/aabb:property"}}OBB{{/crossLink}} we'll
             dynamically fit this OBBGeometry to.

             This property effectively replaces the {{#crossLink "AABBGeometry/aabb:property"}}{{/crossLink}} property.

             Fires a {{#crossLink "AABBGeometry/boundary:event"}}{{/crossLink}} event on change.

             @property boundary
             @type Boundary3D
             */
            boundary: {

                set: function (value) {

                    var geometryDirty = false;
                    var self = this;

                    /**
                     * Fired whenever this AABBGeometry's {{#crossLink "AABBGeometry/boundary:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event boundary
                     * @param value The property's new value
                     */
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
                                    self._setPositionsFromAABB(self._attached.boundary.aabb);
                                    geometryDirty = false;
                                });
                            }
                        },
                        onAttached: function () {
                            self._setPositionsFromAABB(self._attached.boundary.aabb);
                        }
                    });
                },

                get: function () {
                    return this._attached.boundary;
                }
            },

            /**
             Sets this AABBGeometry to an axis-aligned box (AABB), given as a six-element Float32Array
             containing the min/max extents of the
             axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.

             This property overrides the {{#crossLink "AABBGeometry/boundary:property"}}{{/crossLink}} property, causing it to become null.

             @property aabb
             @type Float32Array
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

            } else if (this.positions) {
                this.positions = this.positions;
            }

            return json;
        }
    });
})();
