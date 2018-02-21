/**
 A **CylinderGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a cylinder-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_cylinder"><img src="../../assets/images/screenshots/CylinderGeometry.png"></img></a>

 ## Examples

 * [Textured CylinderGeometry](../../examples/#geometry_primitives_cylinder)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a CylinderGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.CylinderGeometry({
         center: [0,0,0],
         radiusTop: 2.0,
         radiusBottom: 2.0,
         height: 5.0,
         radialSegments: 20,
         heightSegments: 1,
         openEnded: false
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class CylinderGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CylinderGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CylinderGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a CylinderGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the CylinderGeometry.
 @param [cfg.radiusTop=1] {Number} Radius of top.
 @param [cfg.radiusBottom=1] {Number} Radius of bottom.
 @param [cfg.height=1] {Number} Height.
 @param [cfg.radialSegments=60] {Number} Number of segments around the CylinderGeometry.
 @param [cfg.heightSegments=1] {Number} Number of vertical segments.
 @param [cfg.openEnded=false] {Boolean} Whether or not the CylinderGeometry has solid caps on the ends.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.CylinderGeometry = xeogl.Geometry.extend({

        type: "xeogl.CylinderGeometry",

        _init: function (cfg) {

            var radiusTop = cfg.radiusTop || 1;
            if (radiusTop < 0) {
                this.error("negative radiusTop not allowed - will invert");
                radiusTop *= -1;
            }

            var radiusBottom = cfg.radiusBottom || 1;
            if (radiusBottom < 0) {
                this.error("negative radiusBottom not allowed - will invert");
                radiusBottom *= -1;
            }

            var height = cfg.height || 1;
            if (height < 0) {
                this.error("negative height not allowed - will invert");
                height *= -1;
            }

            var radialSegments = cfg.radialSegments || 32;
            if (radialSegments < 0) {
                this.error("negative radialSegments not allowed - will invert");
                radialSegments *= -1;
            }
            if (radialSegments < 3) {
                radialSegments = 3;
            }

            var heightSegments = cfg.heightSegments || 1;
            if (heightSegments < 0) {
                this.error("negative heightSegments not allowed - will invert");
                heightSegments *= -1;
            }
            if (heightSegments < 1) {
                heightSegments = 1;
            }

            var openEnded = !!cfg.openEnded;

            var center = cfg.center;
            var centerX = center ? center[0] : 0;
            var centerY = center ? center[1] : 0;
            var centerZ = center ? center[2] : 0;

            var heightHalf = height / 2;
            var heightLength = height / heightSegments;
            var radialAngle = (2.0 * Math.PI / radialSegments);
            var radialLength = 1.0 / radialSegments;
            //var nextRadius = this._radiusBottom;
            var radiusChange = (radiusTop - radiusBottom) / heightSegments;

            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            var h;
            var i;

            var x;
            var z;

            var currentRadius;
            var currentHeight;

            var first;
            var second;

            var startIndex;
            var tu;
            var tv;

            // create vertices
            var normalY = (90.0 - (Math.atan(height / (radiusBottom - radiusTop))) * 180 / Math.PI) / 90.0;

            for (h = 0; h <= heightSegments; h++) {
                currentRadius = radiusTop - h * radiusChange;
                currentHeight = heightHalf - h * heightLength;

                for (i = 0; i <= radialSegments; i++) {
                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);

                    normals.push(currentRadius * x);
                    normals.push(normalY); //todo
                    normals.push(currentRadius * z);

                    uvs.push((i * radialLength));
                    uvs.push(h * 1 / heightSegments);

                    positions.push((currentRadius * x) + centerX);
                    positions.push((currentHeight) + centerY);
                    positions.push((currentRadius * z) + centerZ);
                }
            }

            // create faces
            for (h = 0; h < heightSegments; h++) {
                for (i = 0; i <= radialSegments; i++) {

                    first = h * (radialSegments + 1) + i;
                    second = first + radialSegments;

                    indices.push(first);
                    indices.push(second);
                    indices.push(second + 1);

                    indices.push(first);
                    indices.push(second + 1);
                    indices.push(first + 1);
                }
            }

            // create top cap
            if (!openEnded && radiusTop > 0) {
                startIndex = (positions.length / 3);

                // top center
                normals.push(0.0);
                normals.push(1.0);
                normals.push(0.0);

                uvs.push(0.5);
                uvs.push(0.5);

                positions.push(0 + centerX);
                positions.push(heightHalf + centerY);
                positions.push(0 + centerZ);

                // top triangle fan
                for (i = 0; i <= radialSegments; i++) {
                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);
                    tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                    tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                    normals.push(radiusTop * x);
                    normals.push(1.0);
                    normals.push(radiusTop * z);

                    uvs.push(tu);
                    uvs.push(tv);

                    positions.push((radiusTop * x) + centerX);
                    positions.push((heightHalf) + centerY);
                    positions.push((radiusTop * z) + centerZ);
                }

                for (i = 0; i < radialSegments; i++) {
                    center = startIndex;
                    first = startIndex + 1 + i;

                    indices.push(first);
                    indices.push(first + 1);
                    indices.push(center);
                }
            }

            // create bottom cap
            if (!openEnded && radiusBottom > 0) {

                startIndex = (positions.length / 3);

                // top center
                normals.push(0.0);
                normals.push(-1.0);
                normals.push(0.0);

                uvs.push(0.5);
                uvs.push(0.5);

                positions.push(0 + centerX);
                positions.push(0 - heightHalf + centerY);
                positions.push(0 + centerZ);

                // top triangle fan
                for (i = 0; i <= radialSegments; i++) {

                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);

                    tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                    tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                    normals.push(radiusBottom * x);
                    normals.push(-1.0);
                    normals.push(radiusBottom * z);

                    uvs.push(tu);
                    uvs.push(tv);

                    positions.push((radiusBottom * x) + centerX);
                    positions.push((0 - heightHalf) + centerY);
                    positions.push((radiusBottom * z) + centerZ);
                }

                for (i = 0; i < radialSegments; i++) {

                    center = startIndex;
                    first = startIndex + 1 + i;

                    indices.push(center);
                    indices.push(first + 1);
                    indices.push(first);
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
