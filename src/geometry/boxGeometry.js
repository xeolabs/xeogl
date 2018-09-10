/**
 A **BoxGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a box-shaped mesh for attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_box"><img src="../../assets/images/screenshots/BoxGeometry.png"></img></a>

 ## Overview

 * Dynamically modify a BoxGeometry's dimensions at any time by updating its {{#crossLink "BoxGeometry/center:property"}}{{/crossLink}}, {{#crossLink "BoxGeometry/xSize:property"}}{{/crossLink}}, {{#crossLink "BoxGeometry/ySize:property"}}{{/crossLink}} and {{#crossLink "BoxGeometry/zSize:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.

 ## Examples

 * [Textured BoxGeometry](../../examples/#geometry_primitives_box)

 ## Usage

 An {{#crossLink "Mesh"}}{{/crossLink}} with a BoxGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Mesh({

     geometry: new xeogl.BoxGeometry({
        center: [0,0,0],
        xSize: 1,  // Half-size on each axis; BoxGeometry is actually two units big on each side.
        ySize: 1,
        zSize: 1
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class BoxGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoxGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a BoxGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position.
 @param [cfg.xSize=1.0] {Number} Half-size on the X-axis.
 @param [cfg.ySize=1.0] {Number} Half-size on the Y-axis.
 @param [cfg.zSize=1.0] {Number} Half-size on the Z-axis.
 @extends Geometry
 */

import {utils} from '../utils.js';
import {Geometry} from './geometry.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.BoxGeometry";

class BoxGeometry extends Geometry {

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

        let ySize = cfg.ySize || 1;
        if (ySize < 0) {
            this.error("negative ySize not allowed - will invert");
            ySize *= -1;
        }

        let zSize = cfg.zSize || 1;
        if (zSize < 0) {
            this.error("negative zSize not allowed - will invert");
            zSize *= -1;
        }

        const center = cfg.center;
        const centerX = center ? center[0] : 0;
        const centerY = center ? center[1] : 0;
        const centerZ = center ? center[2] : 0;

        const xmin = -xSize + centerX;
        const ymin = -ySize + centerY;
        const zmin = -zSize + centerZ;
        const xmax = xSize + centerX;
        const ymax = ySize + centerY;
        const zmax = zSize + centerZ;

        super.init(utils.apply(cfg, {

            // The vertices - eight for our cube, each
            // one spanning three array elements for X,Y and Z
            positions: [

                // v0-v1-v2-v3 front
                xmax, ymax, zmax,
                xmin, ymax, zmax,
                xmin, ymin, zmax,
                xmax, ymin, zmax,

                // v0-v3-v4-v1 right
                xmax, ymax, zmax,
                xmax, ymin, zmax,
                xmax, ymin, zmin,
                xmax, ymax, zmin,

                // v0-v1-v6-v1 top
                xmax, ymax, zmax,
                xmax, ymax, zmin,
                xmin, ymax, zmin,
                xmin, ymax, zmax,

                // v1-v6-v7-v2 left
                xmin, ymax, zmax,
                xmin, ymax, zmin,
                xmin, ymin, zmin,
                xmin, ymin, zmax,

                // v7-v4-v3-v2 bottom
                xmin, ymin, zmin,
                xmax, ymin, zmin,
                xmax, ymin, zmax,
                xmin, ymin, zmax,

                // v4-v7-v6-v1 back
                xmax, ymin, zmin,
                xmin, ymin, zmin,
                xmin, ymax, zmin,
                xmax, ymax, zmin
            ],

            // Normal vectors, one for each vertex
            normals: [

                // v0-v1-v2-v3 front
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                // v0-v3-v4-v5 right
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                // v0-v5-v6-v1 top
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                // v1-v6-v7-v2 left
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,

                // v7-v4-v3-v2 bottom
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,

                // v4-v7-v6-v5 back
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1
            ],

            // UV coords
            uv: [

                // v0-v1-v2-v3 front
                1, 0,
                0, 0,
                0, 1,
                1, 1,

                // v0-v3-v4-v1 right
                0, 0,
                0, 1,
                1, 1,
                1, 0,

                // v0-v1-v6-v1 top
                1, 1,
                1, 0,
                0, 0,
                0, 1,

                // v1-v6-v7-v2 left
                1, 0,
                0, 0,
                0, 1,
                1, 1,

                // v7-v4-v3-v2 bottom
                0, 1,
                1, 1,
                1, 0,
                0, 0,

                // v4-v7-v6-v1 back
                0, 1,
                1, 1,
                1, 0,
                0, 0
            ],

            // Indices - these organise the
            // positions and uv texture coordinates
            // into geometric primitives in accordance
            // with the "primitive" parameter,
            // in this case a set of three indices
            // for each triangle.
            //
            // Note that each triangle is specified
            // in counter-clockwise winding order.
            //
            // You can specify them in clockwise
            // order if you configure the Modes
            // node's frontFace flag as "cw", instead of
            // the default "ccw".
            indices: [
                0, 1, 2,
                0, 2, 3,
                // front
                4, 5, 6,
                4, 6, 7,
                // right
                8, 9, 10,
                8, 10, 11,
                // top
                12, 13, 14,
                12, 14, 15,
                // left
                16, 17, 18,
                16, 18, 19,
                // bottom
                20, 21, 22,
                20, 22, 23
            ],

            // Tangents are lazy-computed from normals and UVs
            // for Normal mapping once we know we have texture

            tangents: null
        }));

        this.box = true;
    }
}

componentClasses[type] = BoxGeometry;

export{BoxGeometry};
