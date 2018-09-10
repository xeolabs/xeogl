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
 // First Mesh with a TorusGeometry
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Mesh with an AABBGeometry that shows a wireframe box
 // for the World-space axis-aligned boundary of the first Mesh
 var boundaryHelper = new xeogl.Mesh({

     geometry: new xeogl.AABBGeometry({
         targetAABB: mesh.aabb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 Now whenever our mesh {{#crossLink "Mesh"}}{{/crossLink}} changes shape or position, our AABBGeometry will automatically
 update to stay fitted to it.

 We could also directly configure the AABBGeometry with the {{#crossLink "Mesh"}}{{/crossLink}}'s {{#crossLink "Mesh/aabb:property"}}AABB{{/crossLink}}:

 ````javascript
 var boundaryHelper2 = new xeogl.Mesh({

     geometry: new xeogl.AABBGeometry({
         targetAABB: mesh.aabb
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
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AABBGeometry.
 @param [cfg.target] {Component} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} subtype whose AABB we'll show.
 @param [cfg.targetAABB] {Float32Array} An axis-aligned box (AABB) in a six-element Float32Array
 containing the min/max extents of the axis-aligned volume, ie. ````(xmin,ymin,zmin,xmax,ymax,zmax)````.
 @extends Component
 */

import {utils} from '../utils.js';
import {tasks} from '../tasks.js';
import {Geometry} from './geometry.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.AABBGeometry";

class AABBGeometry extends Geometry {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

        super.init(utils.apply(cfg, {
            combined: true,
            quantized: true, // Quantized geometry is immutable
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
    }


    /**
     A component whose AABB we'll dynamically fit this AABBGeometry to.

     This property effectively replaces the {{#crossLink "AABBGeometry/targetAABB:property"}}{{/crossLink}} property.

     @property target
     @type Component
     */
    set target(target) {
        let geometryDirty = false;
        const self = this;
        this._attach({
            name: "target",
            type: "xeogl.Component",
            component: target,
            sceneDefault: false,
            on: {
                boundary: function () {
                    if (geometryDirty) {
                        return;
                    }
                    geometryDirty = true;
                    tasks.scheduleTask(function () {
                        self._setPositionsFromAABB(self._attached.target.aabb);
                        geometryDirty = false;
                    });
                }
            },
            onAttached: function () {
                self._setPositionsFromAABB(self._attached.target.aabb);
            }
        });
    }

    get target() {
        return this._attached.target;
    }

    /**
     Sets this AABBGeometry to an axis-aligned box (AABB), given as a six-element Float32Array
     containing the min/max extents of the
     axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.

     This property overrides the {{#crossLink "AABBGeometry/target:property"}}{{/crossLink}} property, causing it to become null.

     @property targetAABB
     @type Float32Array
     */
    set targetAABB(aabb) {
        if (!aabb) {
            return;
        }
        if (this._attached.target) {
            this.target = null;
        }
        this._setPositionsFromAABB(aabb);
    }

    _setPositionsFromAABB(aabb) {
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
}

componentClasses[type] = AABBGeometry;

export{AABBGeometry};
