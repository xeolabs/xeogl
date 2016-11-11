/**
 A **Boundary3D** provides the 3D extents of its parent component in a given coordinate system.

 <a href="../../examples/#boundaries_flyToBoundary"><img src="../../assets/images/screenshots/Boundary3D.png"></img></a>

 ## Overview

 A Boundary3D provides its spatial info in these properties:

 <ul>
 <li>{{#crossLink "Boundary3D/obb:property"}}{{/crossLink}} - an oriented box (OBB) in a 32-element Float32Array
 containing homogeneous coordinates for the eight corner vertices, ie. each having elements [x,y,z,w].</li>
 <li>{{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}} - an axis-aligned box (AABB) in a six-element Float32Array
 containing the min/max extents of the axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````,</li>
 <li>{{#crossLink "Boundary3D/center:property"}}{{/crossLink}} - the center point as a Float32Array containing elements ````[x,y,z]```` and</li>
 <li>{{#crossLink "Boundary3D/sphere:property"}}{{/crossLink}} - a bounding sphere, given as a Float32Array containingg elements````[x,y,z,radius]````.</li>
 </ul>

 As shown in the diagram below, the following xeogl components have Boundary3Ds:

 * A {{#crossLink "Scene/worldBoundary:property"}}Scene's worldBoundary{{/crossLink}} provides the **World**-space boundary of all its {{#crossLink "Entity"}}Entities{{/crossLink}}
 * A {{#crossLink "Geometry/localBoundary:property"}}Geometry's localBoundary{{/crossLink}} provides the **Local**-space boundary of its {{#crossLink "Geometry/positions:property"}}positions{{/crossLink}}
 * An {{#crossLink "Entity/localBoundary:property"}}Entity's localBoundary{{/crossLink}} (also) provides the **Local**-space boundary of its {{#crossLink "Geometry"}}{{/crossLink}}
 * An {{#crossLink "Entity/worldBoundary:property"}}Entity's worldBoundary {{/crossLink}} provides the **World**-space boundary of
 its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by the {{#crossLink "Entity/transform:property"}}Entity's Modelling transform{{/crossLink}}.
 * An {{#crossLink "Entity/viewBoundary:property"}}Entity's viewBoundary{{/crossLink}} provides the **View**-space boundary of
 its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by both the {{#crossLink "Entity/transform:property"}}Entity's Modelling transform{{/crossLink}} **and** {{#crossLink "Camera/view:property"}}Viewing transform{{/crossLink}}.
 * A {{#crossLink "Model/worldBoundary:property"}}Model's worldBoundary{{/crossLink}} provides the **World**-space boundary of all its {{#crossLink "Entity"}}Entities{{/crossLink}}

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
 <li>[Model World-space boundary](../../examples/#boundaries_Model_worldBoundary)</li>
 </ul>

 ## Usage

 In the example below we'll get the World-space Boundary3D of an {{#crossLink "Entity"}}{{/crossLink}}, subscribe to updates on the Boundary3D,
 then animate the {{#crossLink "Entity"}}Entity's{{/crossLink}} modelling transform, which gives our callback a running update
 of the moving Boundary3D extents.

 ```` javascript
 // Entity With a Geometry and Transform

 var entity = new xeogl.Entity({
        geometry: new xeogl.BoxGeometry(),
        transform: new xeogl.Translate({
            xyz: [-5, 0, 0]
        })
  });

 // Subscribe to updates to the Boundary3D

 var worldBoundary = entity.worldBoundary;

 worldBoundary.on("updated", function() {
        obb = worldBoundary.obb;
        aabb = worldBoundary.aabb;
        center = worldBoundary.center;
        sphere = worldBoundary.sphere();
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
 @module xeogl
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary3D within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Boundary3D.
 @param [cfg.obb] {Float32Array} Optional initial 3D object-aligned bounding volume (OBB).
 @param [cfg.aabb] {Float32Array} Optional initial 3D axis-aligned bounding volume (AABB).
 @param [cfg.center] {Float32Array} Optional initial 3D center
 @param [cfg.sphere] {Float32Array} Optional initial 3D bounding sphere.
 @param [cfg.getDirty] {Function} Optional callback to check if parent component has new OBB, positions or transform matrix.
 @param [cfg.getOBB] {Function} Optional callback to get new OBB from parent.
 @param [cfg.getMatrix] {Function} Optional callback to get new transform matrix from parent.
 @param [cfg.getPositions] {Function} Optional callback to get new positions from parent.
 @extends Component
 */

/**
 * Fired whenever this Boundary3D's {{#crossLink "Boundary3D/obb:property"}}{{/crossLink}},
 * {{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}}, {{#crossLink "Boundary3D/sphere:property"}}{{/crossLink}}
 * or {{#crossLink "Boundary3D/center:property"}}{{/crossLink}} properties change.
 * @event updated
 */
(function () {

    "use strict";

    xeogl.Boundary3D = xeogl.Component.extend({

        type: "xeogl.Boundary3D",

        _init: function (cfg) {

            // Cached bounding boxes (oriented and axis-aligned)
            this._obb = cfg.obb || null;
            this._aabb = cfg.aabb || null;

            // Cached bounding sphere
            this._sphere = cfg.sphere || null;

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
             * An oriented box (OBB) representation of this 3D boundary.
             *
             * The OBB is represented by a 32-element Float32Array containing the eight vertices of the box,
             * where each vertex is a homogeneous coordinate having [x,y,z,w] elements.
             *i
             * @property obb
             * @final
             * @type {Float32Array}
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
             * An axis-aligned box (AABB) representation of this 3D boundary.
             *
             * The AABB is represented by a six-element Float32Array containing the min/max extents of the
             * axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.
             *
             * @property aabb
             * @final
             * @type {Float32Array}
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
             * The center point of this 3D boundary.
             *
             * The center point is represented by a Float32Array containing elements ````[x,y,z]````.
             *
             * @property center
             * @final
             * @type {Float32Array}
             */
            center: {

                get: function () {

                    if (this._getDirty()) {
                        this._buildBoundary();
                    }

                    return this._center;
                }
            },

            /**
             * A spherical representation of this 3D boundary.
             *
             * The sphere is a four-element Float32Array containing the sphere center and
             * radius, ie: ````[xcenter, ycenter, zcenter, radius ]````.
             *
             * @property sphere
             * @final
             * @type {Float32Array}
             */
            sphere: {

                get: function () {

                    if (this._getDirty()) {
                        this._buildBoundary();
                    }

                    return this._sphere;
                }
            }
        },

        // Builds the obb, aabb, sphere and center.

        _buildBoundary: function () {

            var math = xeogl.math;

            // Lazy-allocate

            if (!this._obb) {
                this._obb = xeogl.math.OBB3();
            }

            if (!this._aabb) {
                this._aabb = xeogl.math.AABB3();
            }

            if (!this._sphere) {
                this._sphere = xeogl.math.vec4();
            }

            if (!this._center) {
                this._center = xeogl.math.vec3();
            }
            
            var aabb = this._getAABB ? this._getAABB() : null;

            if (aabb) {

                // Got AABB

                // Derive OBB, sphere and center

                this._aabb[0] = aabb[0];
                this._aabb[1] = aabb[1];
                this._aabb[2] = aabb[2];
                this._aabb[3] = aabb[3];
                this._aabb[4] = aabb[4];
                this._aabb[5] = aabb[5];

                math.AABB3ToOBB3(this._aabb, this._obb);
                math.OBB3ToSphere3(this._obb, this._sphere);
                math.getSphere3Center(this._sphere, this._center);
                
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

                    // Transform OBB by matrix, derive AABB, sphere and center

                    math.positions3ToAABB3(positions, this._aabb);
                    math.AABB3ToOBB3(this._aabb, this._obb);
                    math.transformOBB3(matrix, this._obb);
                    math.OBB3ToAABB3(this._obb, this._aabb);
                    math.OBB3ToSphere3(this._obb, this._sphere);
                    math.getSphere3Center(this._sphere, this._center);

                    return;
                }

                // No transform matrix

                math.positions3ToAABB3(positions, this._aabb);
                math.AABB3ToOBB3(this._aabb, this._obb);
                math.OBB3ToSphere3(this._obb, this._sphere);
                math.getSphere3Center(this._sphere, this._center);
                
                return
            }

            var obb = this._getOBB ? this._getOBB() : null;

            if (obb) {

                // Got OBB

                matrix = this._getMatrix ? this._getMatrix() : null;

                if (matrix) {

                    // Got transform matrix

                    // Transform OBB by matrix, derive AABB and center

                    math.transformOBB3(matrix, obb, this._obb);
                    math.OBB3ToAABB3(this._obb, this._aabb);
                    math.OBB3ToSphere3(this._obb, this._sphere);
                    math.getSphere3Center(this._sphere, this._center);

                    return;
                }

                // No transform matrix

                // Copy OBB, derive AABB and center

                for (var i = 0, len = obb.length; i < len; i++) {
                    this._obb[i] = obb[i];
                }

                math.OBB3ToAABB3(this._obb, this._aabb);
                math.OBB3ToSphere3(this._obb, this._sphere);
                math.getSphere3Center(this._sphere, this._center);

            }
        },

        _getJSON: function () {
            return {
                obb: this.obb,
                aabb: this.aabb,
                center: this.center,
                sphere: this.sphere
            };
        }
    });

})();
