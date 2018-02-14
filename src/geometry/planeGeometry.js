/**
 A **PlaneGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a plane-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

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

 An {{#crossLink "Entity"}}{{/crossLink}} with a PlaneGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

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
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this PlaneGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
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
(function () {

    "use strict";

    xeogl.PlaneGeometry = xeogl.Geometry.extend({

        type: "xeogl.PlaneGeometry",

        _init: function (cfg) {

            var xSize = cfg.xSize || 1;
            if (xSize < 0) {
                this.error("negative xSize not allowed - will invert");
                xSize *= -1;
            }

            var zSize = cfg.zSize || 1;
            if (zSize < 0) {
                this.error("negative zSize not allowed - will invert");
                zSize *= -1;
            }

            var xSegments = cfg.xSegments || 1;
            if (xSegments < 0) {
                this.error("negative xSegments not allowed - will invert");
                xSegments *= -1;
            }
            if (xSegments < 1) {
                xSegments = 1;
            }

            var zSegments = cfg.xSegments || 1;
            if (zSegments < 0) {
                this.error("negative zSegments not allowed - will invert");
                zSegments *= -1;
            }
            if (zSegments < 1) {
                zSegments = 1;
            }

            var center = cfg.center;
            var centerX = center ? center[0] : 0;
            var centerY = center ? center[1] : 0;
            var centerZ = center ? center[2] : 0;

            var halfWidth = xSize / 2;
            var halfHeight = zSize / 2;

            var planeX = Math.floor(xSegments) || 1;
            var planeZ = Math.floor(zSegments) || 1;

            var planeX1 = planeX + 1;
            var planeZ1 = planeZ + 1;

            var segmentWidth = xSize / planeX;
            var segmentHeight = zSize / planeZ;

            var positions = new Float32Array(planeX1 * planeZ1 * 3);
            var normals = new Float32Array(planeX1 * planeZ1 * 3);
            var uvs = new Float32Array(planeX1 * planeZ1 * 2);

            var offset = 0;
            var offset2 = 0;

            var iz;
            var ix;
            var x;
            var a;
            var b;
            var c;
            var d;

            for (iz = 0; iz < planeZ1; iz++) {

                var z = iz * segmentHeight - halfHeight;

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

            var indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Array : Uint16Array )(planeX * planeZ * 6);

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

            this._super(xeogl._apply(cfg, {
                positions: positions,
                normals: normals,
                uv: uvs,
                indices: indices
            }));
        }
    });

})();
