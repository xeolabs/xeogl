/**
 An **OBBGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the extents of a World-space entity-oriented bounding box (OBB).

 <a href="../../examples/#geometry_OBBGeometry"><img src="http://i.giphy.com/3o6ZsSVy0NKXZ1vDSo.gif"></img></a>

 ## Overview

 * A World-space OBB a bounding box that's oriented to its contents, given as a 32-element array containing the homogeneous coordinates for the eight corner vertices, ie. each having elements [x,y,z,w].
 * Set an OBBGeometry's {{#crossLink "OBBGeometry/obb:property"}}{{/crossLink}} property to an OBB to fix it to those extents, or
 * Set an OBBGeometry's {{#crossLink "OBBGeometry/boundary:property"}}{{/crossLink}} property to a {{#crossLink "Boundary3D"}}{{/crossLink}}
 to make it dynamically fit itself to changes in the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/obb:property"}}{{/crossLink}} extents.

 ## Examples

 * [Rendering an OBBGeometry](../../examples/#geometry_OBBGeometry)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a OBBGeometry that shows the extents of the
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} of another {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript
 // First Entity with a TorusGeometry
 var torus = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Entity with an OBBGeometry that shows a wireframe box
 // for the World-space boundary of the first Entity

 var boundaryHelper = new xeogl.Entity({

     geometry: new xeogl.OBBGeometry({
         boundary: torus.worldBoundary
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 Now whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position, our OBBGeometry will automatically
 update to stay fitted to it.

 We could also directly configure the OBBGeometry with
 the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/obb:property"}}OBB{{/crossLink}}:

 ````javascript
 var boundaryHelper2 = new xeogl.Entity({

     geometry: new xeogl.OBBGeometry({
         boundary: torus.worldBoundary.obb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````
 Note that, without the reference to a {{#crossLink "Boundary3D"}}{{/crossLink}}, our second OBBGeometry is fixed to the
 given OBB and will not automatically update whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position.

 @class OBBGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this OBBGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this OBBGeometry.
 @param [cfg.boundary] {Number|String|Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}.
 @param [cfg.obb] {Float32Array} An entity-oriented box (OBB) in a 32-element Float32Array
 containing homogeneous coordinates for the eight corner vertices, ie. each having elements (x,y,z,w).
 @extends Component
 */
(function () {

    "use strict";

    xeogl.OBBGeometry = xeogl.Geometry.extend({

        type: "xeogl.OBBGeometry",

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
             A {{#crossLink "Boundary3D"}}{{/crossLink}} whose {{#crossLink "Boundary3D/obb:property"}}OBB{{/crossLink}} we'll
             dynamically fit this OBBGeometry to.

             This property effectively replaces the {{#crossLink "OBBGeometry/obb:property"}}{{/crossLink}} property.

             Fires a {{#crossLink "OBBGeometry/boundary:event"}}{{/crossLink}} event on change.

             @property boundary
             @type Boundary3D
             */
            boundary: {

                set: function (value) {

                    var geometryDirty = false;
                    var self = this;

                    /**
                     * Fired whenever this OBBGeometry's {{#crossLink "OBBGeometry/boundary:property"}}{{/crossLink}}
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
             Sets this OBBGeometry to an entity-oriented bounding box (OBB), given as a 32-element Float32Array
             containing homogeneous coordinates for the eight corner vertices, ie. each having elements [x,y,z,w].

             This property effectively replaces the {{#crossLink "OBBGeometry/boundary:property"}}{{/crossLink}} property, causing it to become null.

             @property obb
             @type Float32Array
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

        _getJSON: function () {

            var json = {};

            if (this._attached.boundary) {
                json.boundary = this._attached.boundary.id;

            } else if (this.positions) {
                json.positions = this.positions;
            }

            return json;
        }
    });
})();
