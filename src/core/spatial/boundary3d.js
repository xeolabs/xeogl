/**
 A **Boundary3D** provides the axis-aligned and object-aligned extents of its owner component.

 ## Overview

 A Boundary3D provides its spatial info in these properties:

 <ul>
 <li>{{#crossLink "Boundary3D/obb:property"}}{{/crossLink}} - object-aligned bounding box (OBB)</li>
 <li>{{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}} - axis-aligned bounding box (AABB)</li>
 <li>{{#crossLink "Boundary3D/center:property"}}{{/crossLink}} - center coordinate </li>
 </ul>

 The following components have Boundary3Ds:

 <ul>
 <li>A {{#crossLink "Geometry"}}{{/crossLink}} provides its Model-space boundary via
 property {{#crossLink "Geometry/modelBoundary:property"}}{{/crossLink}}</li>
 <li>A {{#crossLink "GameObject"}}{{/crossLink}} provides its World and View-space boundaries via
 properties {{#crossLink "GameObject/worldBoundary:property"}}{{/crossLink}}
 and {{#crossLink "GameObject/viewBoundary:property"}}{{/crossLink}}</li>
 </ul>

 <img src="../../../assets/images/Boundary.png"></img>

 ## Example

 A {{#crossLink "GameObject"}}{{/crossLink}} provides its World-space boundary as a Boundary3D that encloses
 its {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} after
 their transformation by the GameObject's {{#crossLink "GameObject/transform:property"}}Modelling transform{{/crossLink}}.

 In this example we get the boundary and subscribe to updates on it, then animate the modelling transform,
 which gives us a running update of the moving boundary extents via our update handler.

 ```` javascript
 var scene = new XEO.Scene();

 // Geometry
 var geometry = new XEO.Geometry(myScene, {...});

 // Modelling transform
 var translate = new XEO.Translate(scene, {
    xyz: [-5, 0, 0]
 });

 // Game object that applies the modelling transform to the Geometry
 var object = new XEO.GameObject(myScene, {
       geometry: myGeometry,
       transform: translate
  });

 var worldBoundary = object.worldBoundary();

 // World-space OBB
 var obb = worldBoundary.obb;

 // World-space AABB
 var aabb = worldBoundary.aabb;

 // World-space center
 var center = worldBoundary.center;

 // Subscribe to updates to the Boundary3D
 worldBoundary.on("updated",
 function() {

        // Get the updated properties again

        obb = worldBoundary.obb;
        aabb = worldBoundary.aabb;
        center = worldBoundary.center;

        //...
    });

 // Animate the modelling transform;
 // on each tick, this will update the Boundary3D and fire our
 // handler, enabling us to track the changing boundary.

 var x = 0;

 scene.on("tick", function() {
    translate.xyz: [x, 0, 0];
    x += 0.5;
 });
 ````

 @class Boundary3D
 @module XEO
 @submodule spatial
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Boundary.
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

            // Owner injected callbacks to provide
            // resources on lazy-rebuild

            this._getDirty = cfg.getDirty;
            this._getOBB = cfg.getOBB;
            this._getMatrix = cfg.getMatrix;
            this._getPositions = cfg.getPositions;

            // Cached bounding boxes (oriented and axis-aligned) 

            this._obb = null;
            this._aabb = null;

            // Cached center point

            this._center = null;
        },

        _props: {

            /**
             * World-space oriented bounding box (OBB).
             *
             * @property obb
             * @final
             * @type {*}
             */
            obb: {

                get: function () {

                    if (this._getDirty()) {
                        this._build();
                    }

                    return this._obb;
                }
            },

            /**
             * World-space axis-aligned bounding box (AABB).
             *
             * @property aabb
             * @final
             * @type {*}
             */
            aabb: {

                get: function () {

                    if (this._getDirty()) {
                        this._build();
                    }

                    return this._aabb;
                }
            },

            /**
             * World-space center point.
             *
             * @property center
             * @final
             * @type {Array of Number}
             */
            center: {

                get: function () {

                    if (this._getDirty()) {
                        this._build();
                    }

                    return this._center;
                }
            }
        },


        // Lazy (re)builds the public
        // properties of this Boundary3D

        _build: function () {

            if (!this._obb) {

                // Lazy-allocate

                this._obb = [];

                this._aabb = {
                    xmin: 0, ymin: 0, zmin: 0,
                    xmax: 0, ymax: 0, zmax: 0
                };

                this._center = [0, 0, 0];
            }

            var aabb = this._getAABB ? this._getAABB() : null;

            if (aabb) {

                // Got AABB

                // Derive OBB and center

                this._aabb.xmin = aabb.xmin;
                this._aabb.ymin = aabb.ymin;
                this._aabb.zmin = aabb.zmin;
                this._aabb.xmax = aabb.xmax;
                this._aabb.ymax = aabb.ymax;
                this._aabb.zmax = aabb.zmax;

                XEO.math.AABB3ToOBB3(this._aabb, this._obb);
                XEO.math.getAABBCenter(this._aabb, this._center);

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

                    XEO.math.positions3ToAABB3(positions, this._aabb);
                    XEO.math.AABB3ToOBB3(this._aabb, this._obb);
                    XEO.math.transformPoints3(matrix, this._obb);
                    XEO.math.points3ToAABB3(this._obb, this._aabb);
                    XEO.math.getAABBCenter(this._aabb, this._center);

                } else {

                    // No transform matrix

                    XEO.math.positions3ToAABB3(positions, this._aabb);
                    XEO.math.AABB3ToOBB3(this._aabb, this._obb);
                    XEO.math.getAABBCenter(this._aabb, this._center);
                }

                return;
            }

            var obb = this._getOBB ? this._getOBB() : null;

            if (obb) {

                // Got OOBB (array of eight point objects)

                matrix = this._getMatrix ? this._getMatrix() : null;

                if (matrix) {

                    // Got transform matrix

                    // Transform OOBB by matrix,
                    // derive AABB and center

                    XEO.math.transformPoints3(matrix, obb, this._obb);
                    XEO.math.points3ToAABB3(this._obb, this._aabb);
                    XEO.math.getAABBCenter(this._aabb, this._center);

                } else {

                    // No transform matrix

                    // Copy OOBB, derive AABB and center

                    for (var i = 0, len = obb.length; i < lenl; i++) {
                        this._obb[i] = obb[i];
                    }

                    XEO.math.points3ToAABB3(this._obb, this._aabb);
                    XEO.math.getAABBCenter(this._aabb, this._center);
                }
            }
        }
    });

})();
