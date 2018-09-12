/**
 A **SphereGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a sphere-shaped mesh for attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_sphere"><img src="../../assets/images/screenshots/SphereGeometry.png"></img></a>

 ## Examples

 * [Textured SphereGeometry](../../examples/#geometry_primitives_sphere)

 ## Usage

 An {{#crossLink "Mesh"}}{{/crossLink}} with a SphereGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Mesh({

     geometry: new xeogl.SphereGeometry({
         center: [0,0,0],
         radius: 1.5,
         heightSegments: 60,
         widthSegments: 60
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class SphereGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SphereGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a SphereGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the SphereGeometry.
 @param [cfg.radius=1] {Number}
 @param [cfg.heightSegments=24] {Number} The SphereGeometry's number of latitudinal bands.
 @param [cfg.widthSegments=18] {Number} The SphereGeometry's number of longitudinal bands.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
import {core} from "./../core.js";
import {utils} from '../utils.js';
import {Geometry} from './geometry.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.SphereGeometry";

class SphereGeometry extends Geometry {

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

        const lod = cfg.lod || 1;

        const centerX = cfg.center ? cfg.center[0] : 0;
        const centerY = cfg.center ? cfg.center[1] : 0;
        const centerZ = cfg.center ? cfg.center[2] : 0;

        let radius = cfg.radius || 1;
        if (radius < 0) {
            this.warn("negative radius not allowed - will invert");
            radius *= -1;
        }

        let heightSegments = cfg.heightSegments || 18;
        if (heightSegments < 0) {
            this.warn("negative heightSegments not allowed - will invert");
            heightSegments *= -1;
        }
        heightSegments = Math.floor(lod * heightSegments);
        if (heightSegments < 18) {
            heightSegments = 18;
        }

        let widthSegments = cfg.widthSegments || 18;
        if (widthSegments < 0) {
            this.warn("negative widthSegments not allowed - will invert");
            widthSegments *= -1;
        }
        widthSegments = Math.floor(lod * widthSegments);
        if (widthSegments < 18) {
            widthSegments = 18;
        }

        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        let i;
        let j;

        let theta;
        let sinTheta;
        let cosTheta;

        let phi;
        let sinPhi;
        let cosPhi;

        let x;
        let y;
        let z;

        let u;
        let v;

        let first;
        let second;

        for (i = 0; i <= heightSegments; i++) {

            theta = i * Math.PI / heightSegments;
            sinTheta = Math.sin(theta);
            cosTheta = Math.cos(theta);

            for (j = 0; j <= widthSegments; j++) {

                phi = j * 2 * Math.PI / widthSegments;
                sinPhi = Math.sin(phi);
                cosPhi = Math.cos(phi);

                x = cosPhi * sinTheta;
                y = cosTheta;
                z = sinPhi * sinTheta;
                u = 1.0 - j / widthSegments;
                v = i / heightSegments;

                normals.push(x);
                normals.push(y);
                normals.push(z);

                uvs.push(u);
                uvs.push(v);

                positions.push(centerX + radius * x);
                positions.push(centerY + radius * y);
                positions.push(centerZ + radius * z);
            }
        }

        for (i = 0; i < heightSegments; i++) {
            for (j = 0; j < widthSegments; j++) {

                first = (i * (widthSegments + 1)) + j;
                second = first + widthSegments + 1;

                indices.push(first + 1);
                indices.push(second + 1);
                indices.push(second);
                indices.push(first + 1);
                indices.push(second);
                indices.push(first);
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

componentClasses[type] = SphereGeometry;

export {SphereGeometry};
