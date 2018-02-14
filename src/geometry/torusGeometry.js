/**
 A **TorusGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a torus-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_torus"><img src="../../assets/images/screenshots/TorusGeometry.png"></img></a>

 ## Overview

 * Dynamically modify a TorusGeometry's shape at any time by updating its {{#crossLink "TorusGeometry/center:property"}}{{/crossLink}}, {{#crossLink "TorusGeometry/radius:property"}}{{/crossLink}}, {{#crossLink "TorusGeometry/tube:property"}}{{/crossLink}},
 {{#crossLink "TorusGeometry/radialSegments:property"}}{{/crossLink}}, {{#crossLink "TorusGeometry/tubeSegments:property"}}{{/crossLink}},  and
 {{#crossLink "TorusGeometry/arc:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.

 ## Examples


 * [Textured TorusGeometry](../../examples/#geometry_primitives_torus)


 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a TorusGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.TorusGeometry({
         center: [0,0,0],
         radius: 1.0,
         tube: 0.5,
         radialSegments: 32,
         tubeSegments: 24,
         arc: Math.PI * 2.0
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class TorusGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this TorusGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this TorusGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a TorusGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the TorusGeometry.
 @param [cfg.radius=1] {Number} The overall radius of the TorusGeometry.
 @param [cfg.tube=0.3] {Number} The tube radius of the TorusGeometry.
 @param [cfg.radialSegments=32] {Number} The number of radial segments that make up the TorusGeometry.
 @param [cfg.tubeSegments=24] {Number} The number of tubular segments that make up the TorusGeometry.
 @param [cfg.arc=Math.PI / 2.0] {Number} The length of the TorusGeometry's arc in radians, where Math.PI*2 is a closed torus.
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.TorusGeometry = xeogl.Geometry.extend({

        type: "xeogl.TorusGeometry",

        _init: function (cfg) {

            var radius = cfg.radius || 1;
            if (radius < 0) {
                this.error("negative radius not allowed - will invert");
                radius *= -1;
            }
            radius *= 0.5;

            var tube = cfg.tube || 0.3;
            if (tube < 0) {
                this.error("negative tube not allowed - will invert");
                tube *= -1;
            }

            var radialSegments = cfg.radialSegments || 32;
            if (radialSegments < 0) {
                this.error("negative radialSegments not allowed - will invert");
                radialSegments *= -1;
            }
            if (radialSegments < 4) {
                radialSegments = 4;
            }

            var tubeSegments = cfg.tubeSegments || 24;
            if (tubeSegments < 0) {
                this.error("negative tubeSegments not allowed - will invert");
                tubeSegments *= -1;
            }
            if (tubeSegments < 4) {
                tubeSegments = 4;
            }

            var arc = cfg.arc || Math.PI * 2;
            if (arc < 0) {
                this.warn("negative arc not allowed - will invert");
                arc *= -1;
            }
            if (arc > 360) {
                arc = 360;
            }

            var center = cfg.center;
            var centerX = center ? center[0] : 0;
            var centerY = center ? center[1] : 0;
            var centerZ = center ? center[2] : 0;

            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            var u;
            var v;
            var x;
            var y;
            var z;
            var vec;

            var i;
            var j;

            for (j = 0; j <= tubeSegments; j++) {
                for (i = 0; i <= radialSegments; i++) {

                    u = i / radialSegments * arc;
                    v = j / tubeSegments * Math.PI * 2;

                    centerX = radius * Math.cos(u);
                    centerY = radius * Math.sin(u);

                    x = (radius + tube * Math.cos(v) ) * Math.cos(u);
                    y = (radius + tube * Math.cos(v) ) * Math.sin(u);
                    z = tube * Math.sin(v);

                    positions.push(x + centerX);
                    positions.push(y + centerY);
                    positions.push(z + centerZ);

                    uvs.push(1 - (i / radialSegments));
                    uvs.push((j / tubeSegments));

                    vec = xeogl.math.normalizeVec3(xeogl.math.subVec3([x, y, z], [centerX, centerY, centerZ], []), []);

                    normals.push(vec[0]);
                    normals.push(vec[1]);
                    normals.push(vec[2]);
                }
            }

            var a;
            var b;
            var c;
            var d;

            for (j = 1; j <= tubeSegments; j++) {
                for (i = 1; i <= radialSegments; i++) {

                    a = ( radialSegments + 1 ) * j + i - 1;
                    b = ( radialSegments + 1 ) * ( j - 1 ) + i - 1;
                    c = ( radialSegments + 1 ) * ( j - 1 ) + i;
                    d = ( radialSegments + 1 ) * j + i;

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);

                    indices.push(c);
                    indices.push(d);
                    indices.push(a);
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
