/**
 A **PlaneGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a plane-shaped mesh for attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_plane"><img src="../../assets/images/screenshots/PlaneGeometry.png"></img></a>

 ## Overview

 * A PlaneGeometry lies in the X-Z plane.
 * Dynamically modify it's shape at any time by updating its {{#crossLink "PlaneGeometry/center:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/xSize:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/zSize:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/xSegments:property"}}{{/crossLink}} and
 {{#crossLink "PlaneGeometry/zSegments:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.

 ## Examples

 * [Textured PlaneGeometry](../../examples/#geometry_primitives_plane)

 ## Usage

 An {{#crossLink "Mesh"}}{{/crossLink}} with a PlaneGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Mesh({

     geometry: new xeogl.PlaneGeometry({
         primitive: "triangles",
         center: [0,0,0],
         xSize: 2,
         zSize: 2,
         xSegments: 10,
         zSegments: 10
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class PlaneGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PlaneGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a PlaneGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the PlaneGeometry.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.zSize=1] {Number} Dimension on the Z-axis.
 @param [cfg.xSegments=1] {Number} Number of segments on the X-axis.
 @param [cfg.zSegments=1] {Number} Number of segments on the Z-axis.
 @extends Geometry
 */
import {utils} from '../utils.js';
import {Geometry} from './geometry.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.PlaneGeometry";

class PlaneGeometry extends Geometry {

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

        let xSize = cfg.xSize || 1;
        if (xSize < 0) {
            this.error("negative xSize not allowed - will invert");
            xSize *= -1;
        }

        let zSize = cfg.zSize || 1;
        if (zSize < 0) {
            this.error("negative zSize not allowed - will invert");
            zSize *= -1;
        }

        let xSegments = cfg.xSegments || 1;
        if (xSegments < 0) {
            this.error("negative xSegments not allowed - will invert");
            xSegments *= -1;
        }
        if (xSegments < 1) {
            xSegments = 1;
        }

        let zSegments = cfg.xSegments || 1;
        if (zSegments < 0) {
            this.error("negative zSegments not allowed - will invert");
            zSegments *= -1;
        }
        if (zSegments < 1) {
            zSegments = 1;
        }

        const center = cfg.center;
        const centerX = center ? center[0] : 0;
        const centerY = center ? center[1] : 0;
        const centerZ = center ? center[2] : 0;

        const halfWidth = xSize / 2;
        const halfHeight = zSize / 2;

        const planeX = Math.floor(xSegments) || 1;
        const planeZ = Math.floor(zSegments) || 1;

        const planeX1 = planeX + 1;
        const planeZ1 = planeZ + 1;

        const segmentWidth = xSize / planeX;
        const segmentHeight = zSize / planeZ;

        const positions = new Float32Array(planeX1 * planeZ1 * 3);
        const normals = new Float32Array(planeX1 * planeZ1 * 3);
        const uvs = new Float32Array(planeX1 * planeZ1 * 2);

        let offset = 0;
        let offset2 = 0;

        let iz;
        let ix;
        let x;
        let a;
        let b;
        let c;
        let d;

        for (iz = 0; iz < planeZ1; iz++) {

            const z = iz * segmentHeight - halfHeight;

            for (ix = 0; ix < planeX1; ix++) {

                x = ix * segmentWidth - halfWidth;

                positions[offset] = x + centerX;
                positions[offset + 1] = centerY;
                positions[offset + 2] = -z + centerZ;

                normals[offset + 2] = -1;

                uvs[offset2] = (planeX - ix) / planeX;
                uvs[offset2 + 1] = ( (planeZ - iz) / planeZ );

                offset += 3;
                offset2 += 2;
            }
        }

        offset = 0;

        const indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Array : Uint16Array )(planeX * planeZ * 6);

        for (iz = 0; iz < planeZ; iz++) {

            for (ix = 0; ix < planeX; ix++) {

                a = ix + planeX1 * iz;
                b = ix + planeX1 * ( iz + 1 );
                c = ( ix + 1 ) + planeX1 * ( iz + 1 );
                d = ( ix + 1 ) + planeX1 * iz;

                indices[offset] = d;
                indices[offset + 1] = b;
                indices[offset + 2] = a;

                indices[offset + 3] = d;
                indices[offset + 4] = c;
                indices[offset + 5] = b;

                offset += 6;
            }
        }

        super.init(utils.apply(cfg, {
            positions: positions,
            normals: normals,
            uv: uvs,
            indices: indices
        }));
    }
}

componentClasses[type] = PlaneGeometry;

export {PlaneGeometry};
