/**
 An **OBBGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the extents of an oriented bounding box (OBB).

 <a href="../../examples/#geometry_primitives_OBBGeometry"><img src="http://i.giphy.com/3o6ZsSVy0NKXZ1vDSo.gif"></img></a>

 ## Overview

 * A World-space OBB a bounding box that's oriented to its contents, given as a 32-element array containing the homogeneous coordinates for the eight corner vertices, ie. each having elements [x,y,z,w].
 * Set an OBBGeometry's {{#crossLink "OBBGeometry/targetOBB:property"}}{{/crossLink}} property to an OBB to fix it to those extents, or
 * Set an OBBGeometry's {{#crossLink "OBBGeometry/target:property"}}{{/crossLink}} property to any {{#crossLink "Component"}}{{/crossLink}} subtype that has an OBB.

 ## Examples

 * [Rendering an OBBGeometry](../../examples/#geometry_primitives_OBBGeometry)

 ## Usage

 ````javascript
 // First Mesh with a TorusGeometry
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Mesh with an OBBGeometry that shows a wireframe box
 // for the World-space boundary of the first Mesh

 var boundaryHelper = new xeogl.Mesh({

     geometry: new xeogl.OBBGeometry({
         target: mesh
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 Now whenever our mesh {{#crossLink "Mesh"}}{{/crossLink}} changes shape or position, our OBBGeometry will automatically
 update to stay fitted to it.

 We could also directly configure the OBBGeometry with the {{#crossLink "Mesh"}}{{/crossLink}}'s {{#crossLink "Mesh/obb:property"}}OBB{{/crossLink}}:

 ````javascript
 var boundaryHelper2 = new xeogl.Mesh({

     geometry: new xeogl.OBBGeometry({
         targetOBB: mesh.obb
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````

 @class OBBGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this OBBGeometry.
 @param [cfg.target] {Component} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} whose OBB we'll show.
 @param [cfg.targetOBB] {Float32Array} An mesh-oriented box (OBB) in a 32-element Float32Array
 containing homogeneous coordinates for the eight corner vertices, ie. each having elements (x,y,z,w).
 @extends Component
 */
import {utils} from '../utils.js';
import {tasks} from '../tasks.js';
import {Geometry} from './geometry.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.OBBGeometry";

class OBBGeometry extends Geometry {

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
            quantized: false, // Quantized geometry is immutable
            primitive: cfg.primitive || "lines",
            positions: cfg.positions || [1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
                1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0],
            indices: [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]
        }));
        if (cfg.target) {
            this.target = cfg.target;
        } else if (cfg.targetOBB) {
            this.targetOBB = cfg.targetOBB;
        }
    }

    /**
     A component whose OBB we'll dynamically fit this AABBGeometry to.

     This property effectively replaces the {{#crossLink "OBBGeometry/targetOBB:property"}}{{/crossLink}} property.

     @property target
     @type Component
     */
    set  target(value) {
        let geometryDirty = false;
        const self = this;
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
                    tasks.scheduleTask(function () {
                        self._setPositionsFromOBB(self._attached.target.obb);
                        geometryDirty = false;
                    });
                }
            },
            onAttached: function () {
                self._setPositionsFromOBB(self._attached.target.obb);
            }
        });
    }

    get target() {
        return this._attached.target;
    }

    /**
     Sets this OBBGeometry to an mesh-oriented bounding box (OBB), given as a 32-element Float32Array
     containing homogeneous coordinates for the eight corner vertices, ie. each having elements [x,y,z,w].

     This property effectively replaces the {{#crossLink "OBBGeometry/boundary:property"}}{{/crossLink}} property, causing it to become null.

     @property targetOBB
     @type Float32Array
     */
    set targetOBB(value) {
        if (!value) {
            return;
        }
        if (this._attached.target) {
            this.target = null;
        }
        this._setPositionsFromOBB(value);
    }

    _setPositionsFromOBB(obb) {
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
    }
}

componentClasses[type] = OBBGeometry;

export{OBBGeometry};
