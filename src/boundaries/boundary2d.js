/**
 A **Boundary2D** is a Canvas-space 2D boundary.

 <a href="../../examples/#boundaries_flyToBoundary"><img src="../../assets/images/screenshots/Boundary3D.png"></img></a>

 ## Overview

 A Boundary2D provides its spatial info in these properties:

 <ul>
 <li>{{#crossLink "Boundary2D/aabb:property"}}{{/crossLink}} - axis-aligned bounding box (AABB)</li>
 <li>{{#crossLink "Boundary2D/center:property"}}{{/crossLink}} - center coordinate </li>
 </ul>

 The following components have Boundary2Ds:

 <ul>
 <li>An {{#crossLink "Entity"}}{{/crossLink}} provides its Canvas-space boundary via
 its {{#crossLink "Entity/canvasBoundary:property"}}{{/crossLink}} property</li>
 </ul>

 <img src="../../../assets/images/Boundary2D.png"></img>

 ## Examples

 <ul>
 <li>[Visualizing an Entity's Canvas-space boundary](../../examples/#boundaries_Entity_canvasBoundary)</li>
 </ul>

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} provides its Canvas-space boundary as a Boundary2D that encloses
 its {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 transformation by the Entity's {{#crossLink "Entity/transform:property"}}modelling transform{{/crossLink}}
 and {{#crossLink "Entity/camera:property"}}projection transform{{/crossLink}}.

 In the example below we'll create an {{#crossLink "Entity"}}{{/crossLink}}, get its Boundary2D, subscribe to updates on it,
 then animate the {{#crossLink "Entity"}}Entity's{{/crossLink}} {{#crossLink "Translate"}}{{/crossLink}}
 which gives us a running update of the Boundary2D's moving extents via our update handler.

 ```` javascript
 // Entity With a Geometry and Transform

 var entity = new xeogl.Entity({
        geometry: new xeogl.BoxGeometry(),
        transform: new xeogl.Translate({
            xyz: [-5, 0, 0]
        })
  });

 // Subscribe to updates to the Boundary2D

 var canvasBoundary = entity.canvasBoundary;

 canvasBoundary.on("updated", function() {
        aabb = canvasBoundary.aabb;
        center = canvasBoundary.center;

        //...
    });

 // Animate the modelling transform;
 // on each tick, this will update the Boundary2D and fire our
 // handler, enabling us to track the changing boundary.

 var x = 0;

 entity.scene.on("tick", function() {
    entity.transform.xyz: [x, 0, 0];
    x += 0.5;
 });
 ````

 @class Boundary2D
 @module xeogl
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary2D within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Boundary.
 @param [cfg.aabb] {Float32Array} Optional initial canvas-space 2D axis-aligned bounding volume (AABB).
 @param [cfg.center] {Float32Array} Optional initial canvas-space 2D center
 @param [cfg.getDirty] {Function} Optional callback to check if parent component has new OBB and matrix.
 @param [cfg.getOBB] {Function} Optional callback to get new view-space 3D OBB from parent.
 @param [cfg.getMatrix] {Function} Optional callback to get new projection matrix from parent.
 @extends Component
 */

/**
 * Fired whenever this Boundary2D's {{#crossLink "Boundary2D/aabb:property"}}{{/crossLink}} and {{#crossLink "Boundary2D/center:property"}}{{/crossLink}}.
 * properties change.
 * @event updated
 */
(function () {

    "use strict";

    xeogl.Boundary2D = xeogl.Component.extend({

        type: "xeogl.Boundary2D",

        _init: function (cfg) {

            // Cached boundaries

            this._obb = null; // Private 3D View-space OBB
            this._aabb = cfg.aabb || null; // 2D Canvas-space AABB
            this._center = cfg.center || null; // 2D Canvas-space center

            // Optional callbacks to lazy-pull
            // data from owner component

            this._getDirty = cfg.getDirty;
            this._getOBB = cfg.getOBB;
            this._getMatrix = cfg.getMatrix;
        },

        _props: {

            /**
             * An axis-aligned box (AABB) representation of this 2D boundary.
             *
             * The AABB is represented by a four-element Float32Array containing the min/max canvas-space
             * extents of the axis-aligned volume, ie. ````[xmin,ymin,xmax,ymax]````.
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
             * The center point of this 2D boundary.
             *
             * The center point is represented by a Float32Array containing canvas-space coordinates,
             * ie. ````[x,y]````.
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
            }
        },

        // Lazy (re)builds the obb, aabb and center.

        _buildBoundary: function () {

            var math = xeogl.math;

            var canvas = this.scene.canvas.canvas;
            var width = canvas.width;
            var height = canvas.height;

            if (!this._obb) {

                // Lazy-allocate

                this._obb = math.OBB2();
                this._aabb = math.AABB2();
                this._center = math.vec2();
            }

            var obb = this._getOBB();
            var matrix = this._getMatrix();

            if (obb && matrix) {

                math.transformOBB3(matrix, obb, this._obb);
                math.OBB3ToAABB2(this._obb, this._aabb);
                math.AABB2ToCanvas(this._aabb, width, height);
                math.getAABB2Center(this._aabb, this._center);
            }
        },

        _getJSON: function () {
            return {
                aabb: this.aabb,
                center: this.center
            };
        }
    });
})();
