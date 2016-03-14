/**
 A **Boundary2D** is a Canvas-space 2D boundary.

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

 var entity = new XEO.Entity({
        geometry: new XEO.BoxGeometry(),
        transform: new XEO.Translate({
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
 @module XEO
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary2D within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Boundary.
 @param [cfg.aabb] {Array of Number} Optional initial canvas-space 2D axis-aligned bounding volume (AABB).
 @param [cfg.center] {Array of Number} Optional initial canvas-space 2D center
 @param [cfg.getDirty] {Function} Optional callback to check if parent component has new OBB and matrix.
 @param [cfg.getOBB] {Function} Optional callback to get new view-space 3D OBB from parent.
 @param [cfg.getMatrix] {Function} Optional callback to get new projection matrix from parent.
 @param [cfg.shown] {Boolean} Set true to show a helper DIV that indicates the boundary.
 @extends Component
 */

/**
 * Fired whenever this Boundary2D's {{#crossLink "Boundary2D/abb:property"}}{{/crossLink}} abd {{#crossLink "Boundary2D/center:property"}}{{/crossLink}}.
 * properties change.
 * @event updated
 */
(function () {

    "use strict";

    XEO.Boundary2D = XEO.Component.extend({

        type: "XEO.Boundary2D",

        _init: function (cfg) {

            // Indicator DIV

            this._div = null;
            this._shown = false;

            // Cached boundaries

            this._obb = null; // Private 3D View-space OBB
            this._aabb = cfg.aabb || null; // 2D Canvas-space AABB
            this._center = cfg.center || null; // 2D Canvas-space center

            // Optional callbacks to lazy-pull
            // data from owner component

            this._getDirty = cfg.getDirty;
            this._getOBB = cfg.getOBB;
            this._getMatrix = cfg.getMatrix;

            this.shown = cfg.shown;
        },

        _props: {

            /**
             * 2D Canvas-space axis-aligned bounding box (AABB).
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
             * 2D Canvas-space center point.
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
            },

            /**
             * When true, shows a helper DIV that indicates the boundary.
             *
             * @property shown
             * @type {Boolean}
             */
            shown: {

                set: function (value) {

                    if (value === this._shown) {
                        return;
                    }

                    if (value) {
                        if (!this._div) {

                            var body = document.getElementsByTagName("body")[0];
                            var div = document.createElement('div');

                            var style = div.style;
                            style.position = "absolute";
                            style.padding = "0";
                            style.margin = "0";
                            style.border = "3px solid #99FF99";
                            style["border-radius"] = "10px";
                            style["z-index"] = "1000";

                            body.appendChild(div);

                            var self = this;

                            this.on("updated",
                                function () {

                                    var aabb = self.aabb;

                                    div.style.left = aabb.min[0] + "px";
                                    div.style.top = aabb.min[1] + "px";
                                    div.style.width = (aabb.max[0] - aabb.min[0]) + "px";
                                    div.style.height = (aabb.max[1] - aabb.min[1]) + "px";
                                });

                            this._div = div;
                        }
                    } else {
                        if (this._div) {
                            this._div.parentNode.removeChild(this._div);
                            this._div = null;
                        }
                    }

                    this._shown = value;

                    /**
                     * Fired whenever this Boundary2d's
                     * {{#crossLink "Boundary2d/shown:property"}}{{/crossLink}} property changes.
                     * @event shown
                     * @param value The property's new value
                     */
                    this.fire("shown", this._shown);
                },

                get: function () {
                    return this._shown;
                }
            }
        },

        // Lazy (re)builds the obb, aabb and center.

        _buildBoundary: function () {

            var math = XEO.math;

            var canvas = this.scene.canvas.canvas;
            var width = canvas.width;
            var height = canvas.height;

            if (!this._obb) {

                // Lazy-allocate

                this._obb = [];
                this._aabb = XEO.math.AABB2();
                this._center = XEO.math.vec2();
            }

            var obb = this._getOBB();
            var matrix = this._getMatrix();

            if (obb && matrix) {

                math.transformPoints3(matrix, obb, this._obb);
                math.points3ToAABB2(this._obb, this._aabb);
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
