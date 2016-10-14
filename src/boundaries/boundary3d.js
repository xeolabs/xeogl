/**
 A **Boundary3D** provides the axis-aligned and object-aligned extents of its owner component.

 A Boundary3D provides spatial info in these properties:

 <ul>
 <li>{{#crossLink "Boundary3D/obb:property"}}{{/crossLink}} - an object-aligned bounding box (OBB), as an array of eight corner vertex positions</li>
 <li>{{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}} - an axis-aligned bounding box (AABB), as minimum and maximum corner vertex positions</li>
 <li>{{#crossLink "Boundary3D/center:property"}}{{/crossLink}} - center coordinate</li>
 </ul>

 As shown in the diagram below, the following xeoEngine components have Boundary3Ds:
 * A {{#crossLink "Scene/worldBoundary:property"}}Scene's worldBoundary{{/crossLink}} provides the **World**-space boundary of all its {{#crossLink "Entity"}}Entities{{/crossLink}}
 * A {{#crossLink "Geometry/localBoundary:property"}}Geometry's localBoundary{{/crossLink}} provides the **Local**-space boundary of its {{#crossLink "Geometry/positions:property"}}positions{{/crossLink}}
 * An {{#crossLink "Entity/localBoundary:property"}}Entity's localBoundary{{/crossLink}} (also) provides the **Local**-space boundary of its {{#crossLink "Geometry"}}{{/crossLink}}
 * An {{#crossLink "Entity/worldBoundary:property"}}Entity's worldBoundary {{/crossLink}} provides the **World**-space boundary of
 its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by the {{#crossLink "Entity/transform:property"}}Entity's Modelling transform{{/crossLink}}.
 * An {{#crossLink "Entity/viewBoundary:property"}}Entity's viewBoundary{{/crossLink}} provides the **View**-space boundary of
 its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by both the {{#crossLink "Entity/transform:property"}}Entity's Modelling transform{{/crossLink}} **and** {{#crossLink "Camera/view:property"}}Viewing transform{{/crossLink}}.
 * A {{#crossLink "CollectionBoundary/worldBoundary:property"}}CollectionBoundary's worldBoundary{{/crossLink}} provides the **World**-space boundary of all the {{#crossLink "Entity"}}Entities{{/crossLink}} contained within its {{#crossLink "Collection"}}Collection{{/crossLink}}.

 The diagram also shows an {{#crossLink "Entity/canvasBoundary:property"}}Entity's canvasBoundary{{/crossLink}}, which is a {{#crossLink "Boundary2D"}}{{/crossLink}} that provides the **Canvas**-space boundary of the {{#crossLink "Geometry"}}Geometry's{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by the {{#crossLink "Entity/transform:property"}}Entity's Modelling transform{{/crossLink}}, {{#crossLink "Camera/view:property"}}Viewing transform{{/crossLink}}
 and {{#crossLink "Camera/project:property"}}Projection transform{{/crossLink}}.

 <br><br>
 <img src="../../../assets/images/Boundary3D.png"></img>

 ## Examples

 <ul>
 <li>[Entity World-space boundary](../../examples/#boundaries_Entity_worldBoundary)</li>
 <li>[Entity View-space boundary](../../examples/#boundaries_Entity_viewBoundary)</li>
 <li>[Entity Canvas-space boundary](../../examples/#boundaries_Entity_canvasBoundary)</li>
 <li>[Flying camera to Entity World-space boundaries](../../examples/#boundaries_flyToBoundary)</li>
 <li>[Visualizing a CollectionBoundary](../../examples/#boundaries_CollectionBoundary)</li>
 <li>[Visualizing a CollectionBoundary hierarchy](../../examples/#boundaries_CollectionBoundary_hierarchy)</li>
 </ul>

 ## Usage

 In the example below we'll get the World-space Boundary3D of an {{#crossLink "Entity"}}{{/crossLink}}, subscribe to updates on the Boundary3D,
 then animate the {{#crossLink "Entity"}}Entity's{{/crossLink}} modelling transform, which gives our callback a running update
 of the moving Boundary3D extents.

 ```` javascript
 // Entity With a Geometry and Transform

 var entity = new XEO.Entity({
        geometry: new XEO.BoxGeometry(),
        transform: new XEO.Translate({
            xyz: [-5, 0, 0]
        })
  });

 // Subscribe to updates to the Boundary3D

 var worldBoundary = entity.worldBoundary;

 worldBoundary.on("updated", function() {
        obb = worldBoundary.obb;
        aabb = worldBoundary.aabb;
        center = worldBoundary.center;

        //...
    });

 // Animate the modelling transform;
 // on each tick, this will update the Boundary3D and fire our
 // callback, which enables us to track the changing boundary.

 var x = 0;

 entity.scene.on("tick", function() {
    translate.xyz: [x, 0, 0];
    x += 0.5;
 });
 ````

 @class Boundary3D
 @module XEO
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary3D within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Boundary3D.
 @param [cfg.obb] {Array of Number} Optional initial 3D object-aligned bounding volume (OBB).
 @param [cfg.aabb] {Array of Number} Optional initial 3D axis-aligned bounding volume (AABB).
 @param [cfg.center] {Array of Number} Optional initial 3D center
 @param [cfg.getDirty] {Function} Optional callback to check if parent component has new OBB, positions or transform matrix.
 @param [cfg.getOBB] {Function} Optional callback to get new OBB from parent.
 @param [cfg.getMatrix] {Function} Optional callback to get new transform matrix from parent.
 @param [cfg.getPositions] {Function} Optional callback to get new positions from parent.
 @extends Component
 */

/**
 * Fired whenever this Boundary3D's {{#crossLink "Boundary3D/obb:property"}}{{/crossLink}},
 * {{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}} or {{#crossLink "Boundary3D/center:property"}}{{/crossLink}}.
 * properties change.
 * @event updated
 */
(function () {

    "use strict";

    XEO.Boundary3D = XEO.Component.extend({

        type: "XEO.Boundary3D",

        _init: function (cfg) {

            // Cached bounding boxes (oriented and axis-aligned) 

            this._obb = cfg.obb || null;
            this._aabb = cfg.aabb || null;

            // Cached center point

            this._center = cfg.center || null;

            // Owner injected callbacks to provide
            // resources on lazy-rebuild

            this._getDirty = cfg.getDirty;
            this._getOBB = cfg.getOBB;
            this._getAABB = cfg.getAABB;
            this._getMatrix = cfg.getMatrix;
            this._getPositions = cfg.getPositions;
        },

        _props: {

            /**
             * 3D oriented bounding box (OBB).
             *
             * @property obb
             * @final
             * @type {*}
             */
            obb: {

                get: function () {

                    if (this._getDirty()) {
                        this._buildBoundary();
                    }

                    return this._obb;
                }
            },

            /**
             * 3D axis-aligned bounding box (AABB).
             *
             * @property aabb
             * @final
             * @type {*}
             */
            aabb: {

                get: function () {

                    if (this._getDirty()) {
                        this._buildBoundary();
                    }

                    return this._aabb;
                }
            },

            /**
             * 3D center point.
             *
             * @property center
             * @final
             * @type {Array of Number}
             */
            center: {

                get: function () {

                    if (this._getDirty()) {
                        this._buildBoundary();
                    }

                    return this._center;
                }
            }
        },

        // (Re)builds the obb, aabb and center.

        _buildBoundary: function () {

            var math = XEO.math;

            // Lazy-allocate

            if (!this._obb) {
                this._obb = [];
            }

            if (!this._aabb) {
                this._aabb = XEO.math.AABB3();
            }

            if (!this._center) {
                this._center = XEO.math.vec3();
            }

            var aabb = this._getAABB ? this._getAABB() : null;

            if (aabb) {

                // Got AABB

                // Derive OBB and center

                this._aabb.min[0] = aabb.min[0];
                this._aabb.min[1] = aabb.min[1];
                this._aabb.min[2] = aabb.min[2];
                this._aabb.max[0] = aabb.max[0];
                this._aabb.max[1] = aabb.max[1];
                this._aabb.max[2] = aabb.max[2];

                math.AABB3ToOBB3(this._aabb, this._obb);
                math.getAABBCenter(this._aabb, this._center);

                return;
            }

            // Get resources through callbacks

            var positions = this._getPositions ? this._getPositions() : null;

            var matrix;

            if (positions) {

                // Got flattened WebGL positions array

                matrix = this._getMatrix ? this._getMatrix() : null;

                if (matrix) {

                    // Got transform matrix

                    // Transform OOBB by matrix,
                    // derive AABB and center

                    math.positions3ToAABB3(positions, this._aabb);
                    math.AABB3ToOBB3(this._aabb, this._obb);
                    math.transformPoints3(matrix, this._obb);
                    math.points3ToAABB3(this._obb, this._aabb);
                    math.getAABBCenter(this._aabb, this._center);

                    return;

                }

                // No transform matrix

                math.positions3ToAABB3(positions, this._aabb);
                math.AABB3ToOBB3(this._aabb, this._obb);
                math.getAABBCenter(this._aabb, this._center);

                return
            }

            var obb = this._getOBB ? this._getOBB() : null;

            if (obb) {

                // Got OOBB (array of eight four-element subarrays)

                matrix = this._getMatrix ? this._getMatrix() : null;

                if (matrix) {

                    // Got transform matrix

                    // Transform OOBB by matrix,
                    // derive AABB and center

                    math.transformPoints3(matrix, obb, this._obb);
                    math.points3ToAABB3(this._obb, this._aabb);
                    math.getAABBCenter(this._aabb, this._center);

                    return;
                }

                // No transform matrix

                // Copy OOBB, derive AABB and center

                for (var i = 0, len = obb.length; i < len; i++) {
                    this._obb[i] = obb[i];
                }

                math.points3ToAABB3(this._obb, this._aabb);
                math.getAABBCenter(this._aabb, this._center);
            }
        },

        _getJSON: function () {
            return {
                obb: this.obb,
                aabb: this.aabb,
                center: this.center
            };
        }
    });

})();
