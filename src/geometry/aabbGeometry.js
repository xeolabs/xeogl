/**
 An **AABBGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the extents of a World-space axis-aligned bounding box (AABB).

 <a href="../../examples/#geometry_primitives_AABBGeometry"><img src="http://i.giphy.com/3o6ZsSVy0NKXZ1vDSo.gif"></img></a>

 ## Overview

 * A World-space AABB is an axis-aligned box given as a six-element array containing the min/max extents of an axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.
 * Set a AABBGeometry's {{#crossLink "AABBGeometry/targetAABB:property"}}{{/crossLink}} property to an AABB to fix the AABBGeometry to those extents, or
 * set a AABBGeometry's {{#crossLink "AABBGeometry/target:property"}}{{/crossLink}} property to any target {{#crossLink "Component"}}{{/crossLink}}
 subtype that has an AABB, to make it dynamically fit itself to changes in the target AABB.

 ## Examples

 * [Rendering an AABBGeometry](../../examples/#geometry_primitives_AABBGeometry)

 ## Usage

 ````javascript
 // First Entity with a TorusGeometry
 var entity = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Entity with an AABBGeometry that shows a wireframe box
 // for the World-space axis-aligned boundary of the first Entity
 var boundaryHelper = new xeogl.Entity({

     geometry: new xeogl.AABBGeometry({
         targetAABB: entity.aabb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 Now whenever our entity {{#crossLink "Entity"}}{{/crossLink}} changes shape or position, our AABBGeometry will automatically
 update to stay fitted to it.

 We could also directly configure the AABBGeometry with the {{#crossLink "Entity"}}{{/crossLink}}'s {{#crossLink "Entity/aabb:property"}}AABB{{/crossLink}}:

 ````javascript
 var boundaryHelper2 = new xeogl.Entity({

     geometry: new xeogl.AABBGeometry({
         targetAABB: entity.aabb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

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
 @param [cfg.target] {Component} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} subtype whose AABB we'll show.
 @param [cfg.targetAABB] {Float32Array} An axis-aligned box (AABB) in a six-element Float32Array
 containing the min/max extents of the axis-aligned volume, ie. ````(xmin,ymin,zmin,xmax,ymax,zmax)````.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.AABBGeometry = xeogl.Geometry.extend({

        type: "xeogl.AABBGeometry",

        _init: function (cfg) {

            this._super(xeogl._apply(cfg, {

                // combined: true,

                primitive: cfg.primitive || "lines",
                indices: [
                    0, 1, 1, 2, 2, 3, 3, 0, 4,
                    5, 5, 6, 6, 7, 7, 4, 0, 4,
                    1, 5, 2, 6, 3, 7
                ],
                positions: cfg.positions || [
                    1.0, 1.0, 1.0,
                    1.0, -1.0, 1.0,
                    -1.0, -1.0, 1.0,
                    -1.0, 1.0, 1.0,
                    1.0, 1.0, -1.0,
                    1.0, -1.0, -1.0,
                    -1.0, -1.0, -1.0,
                    -1.0, 1.0, -1.0
                ]
            }));

            if (cfg.target) {
                this.target = cfg.target;

            } else if (cfg.targetAABB) {
                this.targetAABB = cfg.targetAABB;
            }
        },

        _props: {

            /**
             A component whose AABB we'll dynamically fit this AABBGeometry to.

             This property effectively replaces the {{#crossLink "AABBGeometry/targetAABB:property"}}{{/crossLink}} property.

             @property target
             @type Component
             */
            target: {

                set: function (value) {

                    var geometryDirty = false;
                    var self = this;

                    this._attach({
                        name: "target",
                        type: "xeogl.Component",
                        component: value,
                        sceneDefault: false,
                        on: {
                            boundary: function () {
                                if (geometryDirty) {
                                    return;
                                }
                                geometryDirty = true;
                                xeogl.scheduleTask(function () {
                                    self._setPositionsFromAABB(self._attached.target.aabb);
                                    geometryDirty = false;
                                });
                            }
                        },
                        onAttached: function () {
                            self._setPositionsFromAABB(self._attached.target.aabb);
                        }
                    });
                },

                get: function () {
                    return this._attached.target;
                }
            },

            /**
             Sets this AABBGeometry to an axis-aligned box (AABB), given as a six-element Float32Array
             containing the min/max extents of the
             axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.

             This property overrides the {{#crossLink "AABBGeometry/target:property"}}{{/crossLink}} property, causing it to become null.

             @property targetAABB
             @type Float32Array
             */
            targetAABB: {
                set: function (value) {
                    if (!value) {
                        return;
                    }
                    if (this._attached.target) {
                        this.target = null;
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
        }
    });
})();
