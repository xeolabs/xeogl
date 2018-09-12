/**
 A **PhongMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 attached {{#crossLink "Mesh"}}Meshes{{/crossLink}} using
 the classic <a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model">Blinn-Phong</a> lighting model.

 ## Examples

 | <a href="../../examples/#materials_phong_textures"><img src="../../assets/images/screenshots/PhongMaterial/textures.png"></img></a> | <a href="../../examples/#materials_phong_textures_video"><img src="../../assets/images/screenshots/PhongMaterial/videoTexture.png"></img></a> | <a href="../../examples/#materials_phong_fresnel"><img src="../../assets/images/screenshots/PhongMaterial/fresnel.png"></img></a> |
 |:------:|:----:|:-----:|:-----:|
 |[Phong textures](../../examples/#materials_phong_textures)|[Video texture](../../examples/#materials_phong_textures_video)| [Fresnels](../../examples/#materials_phong_fresnel)|

 ## Overview

 * Used for rendering non-realistic objects such as "helpers", wireframe objects, labels etc.
 * Use the physically-based {{#crossLink "MetallicMaterial"}}{{/crossLink}} or {{#crossLink "SpecularMaterial"}}{{/crossLink}} when more realism is required.

 The following table summarizes PhongMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 |  {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the ambient light reflected by the material. |
 |  {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the diffuse light reflected by the material. |
 |  {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the specular light reflected by the material. |
 |  {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the light emitted by the material. |
 | {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "PhongMaterial/shininess:property"}}{{/crossLink}} | Number | [0, 128] | 80 | linear | Determines the size and sharpness of specular highlights. |
 | {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | Determines the amount of reflectivity. |
 | {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with RGB components multiplying by {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/alphaMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/occlusionMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Ambient occlusion texture multiplying by {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} and {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/normalMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Tangent-space normal map. |
 | {{#crossLink "PhongMaterial/diffuseFresnel:property"}}{{/crossLink}} | {{#crossLink "Fresnel"}}{{/crossLink}} |  | null |  | Fresnel term applied to {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/specularFresnel:property"}}{{/crossLink}} | {{#crossLink "Fresnel"}}{{/crossLink}} |  | null |  | Fresnel term applied to {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/emissiveFresnel:property"}}{{/crossLink}} | {{#crossLink "Fresnel"}}{{/crossLink}} |  | null |  | Fresnel term applied to {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/reflectivityFresnel:property"}}{{/crossLink}} | {{#crossLink "Fresnel"}}{{/crossLink}} |  | null |  | Fresnel term applied to {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/alphaFresnel:property"}}{{/crossLink}} | {{#crossLink "Fresnel"}}{{/crossLink}} |  | null |  | Fresnel term applied to {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "PhongMaterial/lineWidth:property"}}{{/crossLink}} | Number | [0..100] | 1 |  | Line width in pixels. |
 | {{#crossLink "PhongMaterial/pointSize:property"}}{{/crossLink}} | Number | [0..100] | 1 |  | Point size in pixels. |
 | {{#crossLink "PhongMaterial/alphaMode:property"}}{{/crossLink}} | String | "opaque", "blend", "mask" | "blend" |  | Alpha blend mode. |
 | {{#crossLink "PhongMaterial/alphaCutoff:property"}}{{/crossLink}} | Number | [0..1] | 0.5 |  | Alpha cutoff value. |
 | {{#crossLink "PhongMaterial/backfaces:property"}}{{/crossLink}} | Boolean |  | false |  | Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces. |
 | {{#crossLink "PhongMaterial/frontface:property"}}{{/crossLink}} | String | "ccw", "cw" | "ccw" |  | The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} frontfaces - "cw" for clockwise, or "ccw" for counter-clockwise. |

 ## Usage

 In this example we have a Mesh with

 * a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},
 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies a {{#crossLink "Texture"}}{{/crossLink}} as a diffuse map and a specular {{#crossLink "Fresnel"}}{{/crossLink}}, and
 * a {{#crossLink "TorusGeometry"}}{{/crossLink}}.

 ```` javascript
 var torus = new xeogl.Mesh({

    lights: new xeogl.Lights({
        lights: [
            new xeogl.AmbientLight({
                color: [0.7, 0.7, 0.7]
            }),
            new xeogl.DirLight({
                dir: [-1, -1, -1],
                color: [0.5, 0.7, 0.5],
                intensity: [1.0, 1.0, 1.0],
                space: "view"
            })
        ]
    }),

    material: new xeogl.PhongMaterial({
        ambient: [0.3, 0.3, 0.3],
        diffuse: [0.5, 0.5, 0.0],   // Ignored, since we have assigned a Texture to diffuseMap, below
        diffuseMap: new xeogl.Texture({
            src: "diffuseMap.jpg"
        }),
        specular: [1, 1, 1],
        specularFresnel: new xeogl.Fresnel({
            leftColor: [1.0, 1.0, 1.0],
            rightColor: [0.0, 0.0, 0.0],
            power: 4
        }),
        shininess: 80, // Default
        alpha: 1.0 // Default
    }),

    geometry: new xeogl.TorusGeometry()
});
 ````

 ## Transparency

 ### Alpha Blending

 Let's make our torus transparent. We'll update its PhongMaterial's {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}
 and {{#crossLink "PhongMaterial/alphaMode:property"}}{{/crossLink}}, causing it to blend 50% with the background:

 ````javascript
 torus.material.alpha = 0.5;
 torus.material.alphaMode = "blend";
 ````
 *TODO: Screenshot*

 ### Alpha Masking

 Now let's make holes in our torus instead. We'll give its PhongMaterial an {{#crossLink "PhongMaterial/alphaMap:property"}}{{/crossLink}}
 and configure {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/alphaMode:property"}}{{/crossLink}},
 and {{#crossLink "PhongMaterial/alphaCutoff:property"}}{{/crossLink}} to treat it as an alpha mask:

 ````javascript
 torus.material.alphaMap = new xeogl.Texture({
        src: "textures/diffuse/crossGridColorMap.jpg"
    });

 torus.material.alpha = 1.0;
 torus.material.alphaMode = "mask";
 torus.material.alphaCutoff = 0.2;
 ````
 *TODO: Screenshot*


 @class PhongMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} The PhongMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this PhongMaterial.
 @param [cfg.ambient=[1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial ambient color.
 @param [cfg.diffuse=[ 1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial diffuse color.
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial specular color.
 @param [cfg.emissive=[ 0.0, 0.0, 0.0 ]] {Array of Number} PhongMaterial emissive color.
 @param [cfg.alpha=1] {Number} Scalar in range 0-1 that controls alpha, where 0 is completely transparent and 1 is completely opaque.
 @param [cfg.shininess=80] {Number} Scalar in range 0-128 that determines the size and sharpness of specular highlights.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.lineWidth=1] {Number} Scalar that controls the width of lines for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines".
 @param [cfg.pointSize=1] {Number} Scalar that controls the size of points for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "points".
 @param [cfg.ambientMap=null] {Texture} A ambient map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will multiply by the diffuse property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the diffuse property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.emissiveMap=undefined] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.normalMap=undefined] {Texture} A normal map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.alphaMap=undefined] {Texture} An alpha map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the alpha property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.reflectivityMap=undefined] {Texture} A reflectivity control map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the reflectivity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.occlusionMap=null] {Texture} An occlusion map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.diffuseFresnel=undefined] {Fresnel} A diffuse {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.specularFresnel=undefined] {Fresnel} A specular {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.emissiveFresnel=undefined] {Fresnel} An emissive {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.alphaFresnel=undefined] {Fresnel} An alpha {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.reflectivityFresnel=undefined] {Fresnel} A reflectivity {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.alphaMode="opaque"] {String} The alpha blend mode - accepted values are "opaque", "blend" and "mask".
 See the {{#crossLink "PhongMaterial/alphaMode:property"}}{{/crossLink}} property for more info.
 @param [cfg.alphaCutoff=0.5] {Number} The alpha cutoff value. See the {{#crossLink "PhongMaterial/alphaCutoff:property"}}{{/crossLink}} property for more info.
 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 */
import {core} from "./../core.js";
import {Material} from './material.js';
import {State} from '../renderer/state.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.PhongMaterial";
const alphaModes = {"opaque": 0, "mask": 1, "blend": 2};
const alphaModeNames = ["opaque", "mask", "blend"];

class PhongMaterial extends Material {

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

        super.init(cfg);

        this._state = new State({
            type: "PhongMaterial",
            ambient: math.vec3([1.0, 1.0, 1.0]),
            diffuse: math.vec3([1.0, 1.0, 1.0]),
            specular: math.vec3([1.0, 1.0, 1.0]),
            emissive: math.vec3([0.0, 0.0, 0.0]),
            alpha: null,
            shininess: null,
            reflectivity: null,
            alphaMode: null,
            alphaCutoff: null,
            lineWidth: null,
            pointSize: null,
            backfaces: null,
            frontface: null, // Boolean for speed; true == "ccw", false == "cw"
            hash: null
        });

        this.ambient = cfg.ambient;
        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.emissive = cfg.emissive;
        this.alpha = cfg.alpha;
        this.shininess = cfg.shininess;
        this.reflectivity = cfg.reflectivity;
        this.lineWidth = cfg.lineWidth;
        this.pointSize = cfg.pointSize;

        if (cfg.ambientMap) {
            this._ambientMap = this._checkComponent("xeogl.Texture", cfg.ambientMap);
        }
        if (cfg.diffuseMap) {
            this._diffuseMap = this._checkComponent("xeogl.Texture", cfg.diffuseMap);
        }
        if (cfg.specularMap) {
            this._specularMap = this._checkComponent("xeogl.Texture", cfg.specularMap);
        }
        if (cfg.emissiveMap) {
            this._emissiveMap = this._checkComponent("xeogl.Texture", cfg.emissiveMap);
        }
        if (cfg.alphaMap) {
            this._alphaMap = this._checkComponent("xeogl.Texture", cfg.alphaMap);
        }
        if (cfg.reflectivityMap) {
            this._reflectivityMap = this._checkComponent("xeogl.Texture", cfg.reflectivityMap);
        }
        if (cfg.normalMap) {
            this._normalMap = this._checkComponent("xeogl.Texture", cfg.normalMap);
        }
        if (cfg.occlusionMap) {
            this._occlusionMap = this._checkComponent("xeogl.Texture", cfg.occlusionMap);
        }
        if (cfg.diffuseFresnel) {
            this._diffuseFresnel = this._checkComponent("xeogl.Fresnel", cfg.diffuseFresnel);
        }
        if (cfg.specularFresnel) {
            this._specularFresnel = this._checkComponent("xeogl.Fresnel", cfg.specularFresnel);
        }
        if (cfg.emissiveFresnel) {
            this._emissiveFresnel = this._checkComponent("xeogl.Fresnel", cfg.emissiveFresnel);
        }
        if (cfg.alphaFresnel) {
            this._alphaFresnel = this._checkComponent("xeogl.Fresnel", cfg.alphaFresnel);
        }
        if (cfg.reflectivityFresnel) {
            this._reflectivityFresnel = this._checkComponent("xeogl.Fresnel", cfg.reflectivityFresnel);
        }

        this.alphaMode = cfg.alphaMode;
        this.alphaCutoff = cfg.alphaCutoff;
        this.backfaces = cfg.backfaces;
        this.frontface = cfg.frontface;

        this._makeHash();
    }

    _makeHash() {
        const state = this._state;
        const hash = ["/p"]; // 'P' for Phong
        if (this._normalMap) {
            hash.push("/nm");
            if (this._normalMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._ambientMap) {
            hash.push("/am");
            if (this._ambientMap.hasMatrix) {
                hash.push("/mat");
            }
            hash.push("/" + this._ambientMap.encoding);
        }
        if (this._diffuseMap) {
            hash.push("/dm");
            if (this._diffuseMap.hasMatrix) {
                hash.push("/mat");
            }
            hash.push("/" + this._diffuseMap.encoding);
        }
        if (this._specularMap) {
            hash.push("/sm");
            if (this._specularMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._emissiveMap) {
            hash.push("/em");
            if (this._emissiveMap.hasMatrix) {
                hash.push("/mat");
            }
            hash.push("/" + this._emissiveMap.encoding);
        }
        if (this._alphaMap) {
            hash.push("/opm");
            if (this._alphaMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._reflectivityMap) {
            hash.push("/rm");
            if (this._reflectivityMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._occlusionMap) {
            hash.push("/ocm");
            if (this._occlusionMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._diffuseFresnel) {
            hash.push("/df");
        }
        if (this._specularFresnel) {
            hash.push("/sf");
        }
        if (this._emissiveFresnel) {
            hash.push("/ef");
        }
        if (this._alphaFresnel) {
            hash.push("/of");
        }
        if (this._reflectivityFresnel) {
            hash.push("/rf");
        }
        hash.push(";");
        state.hash = hash.join("");
    }

    /**
     The PhongMaterial's ambient color.

     @property ambient
     @default [0.3, 0.3, 0.3]
     @type Float32Array
     */
    set ambient(value) {
        let ambient = this._state.ambient;
        if (!ambient) {
            ambient = this._state.ambient = new Float32Array(3);
        } else if (value && ambient[0] === value[0] && ambient[1] === value[1] && ambient[2] === value[2]) {
            return;
        }
        if (value) {
            ambient[0] = value[0];
            ambient[1] = value[1];
            ambient[2] = value[2];
        } else {
            ambient[0] = .2;
            ambient[1] = .2;
            ambient[2] = .2;
        }
        this._renderer.imageDirty();
    }

    get ambient() {
        return this._state.ambient;
    }

    /**
     The PhongMaterial's diffuse color.

     Multiplies by {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}}.

     @property diffuse
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set diffuse(value) {
        let diffuse = this._state.diffuse;
        if (!diffuse) {
            diffuse = this._state.diffuse = new Float32Array(3);
        } else if (value && diffuse[0] === value[0] && diffuse[1] === value[1] && diffuse[2] === value[2]) {
            return;
        }
        if (value) {
            diffuse[0] = value[0];
            diffuse[1] = value[1];
            diffuse[2] = value[2];
        } else {
            diffuse[0] = 1;
            diffuse[1] = 1;
            diffuse[2] = 1;
        }
        this._renderer.imageDirty();
    }

    get diffuse() {
        return this._state.diffuse;
    }

    /**
     The material's specular color.

     Multiplies by {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}}.

     @property specular
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set specular(value) {
        let specular = this._state.specular;
        if (!specular) {
            specular = this._state.specular = new Float32Array(3);
        } else if (value && specular[0] === value[0] && specular[1] === value[1] && specular[2] === value[2]) {
            return;
        }
        if (value) {
            specular[0] = value[0];
            specular[1] = value[1];
            specular[2] = value[2];
        } else {
            specular[0] = 1;
            specular[1] = 1;
            specular[2] = 1;
        }
        this._renderer.imageDirty();
    }

    get specular() {
        return this._state.specular;
    }

    /**
     The PhongMaterial's emissive color.

     Multiplies by {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}}.

     @property emissive
     @default [0.0, 0.0, 0.0]
     @type Float32Array
     */
    set emissive(value) {
        let emissive = this._state.emissive;
        if (!emissive) {
            emissive = this._state.emissive = new Float32Array(3);
        } else if (value && emissive[0] === value[0] && emissive[1] === value[1] && emissive[2] === value[2]) {
            return;
        }
        if (value) {
            emissive[0] = value[0];
            emissive[1] = value[1];
            emissive[2] = value[2];
        } else {
            emissive[0] = 0;
            emissive[1] = 0;
            emissive[2] = 0;
        }
        this._renderer.imageDirty();
    }

    get emissive() {
        return this._state.emissive;
    }

    /**
     Factor in the range [0..1] indicating how transparent the PhongMaterial is.

     A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

     Multiplies by {{#crossLink "PhongMaterial/alphaMap:property"}}{{/crossLink}}.

     @property alpha
     @default 1.0
     @type Number
     */
    set alpha(value) {
        value = (value !== undefined && value !== null) ? value : 1.0;
        if (this._state.alpha === value) {
            return;
        }
        this._state.alpha = value;
        this._renderer.imageDirty();
    }

    get alpha() {
        return this._state.alpha;
    }

    /**
     A factor in range [0..128] that determines the size and sharpness of the specular highlights create by this PhongMaterial.

     Larger values produce smaller, sharper highlights. A value of 0.0 gives very large highlights that are almost never
     desirable. Try values close to 10 for a larger, fuzzier highlight and values of 100 or more for a small, sharp
     highlight.

     @property shininess
     @default 80.0
     @type Number
     */
    set shininess(value) {
        this._state.shininess = value !== undefined ? value : 80;
        this._renderer.imageDirty();
    }

    get shininess() {
        return this._state.shininess;
    }

    /**
     The PhongMaterial's line width.

     @property lineWidth
     @default 1.0
     @type Number
     */
    set lineWidth(value) {
        this._state.lineWidth = value || 1.0;
        this._renderer.imageDirty();
    }

    get lineWidth() {
        return this._state.lineWidth;
    }

    /**
     The PhongMaterial's point size.

     @property pointSize
     @default 1.0
     @type Number
     */
    set pointSize(value) {
        this._state.pointSize = value || 1.0;
        this._renderer.imageDirty();
    }

    get pointSize() {
        return this._state.pointSize;
    }

    /**
     Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected by this PhongMaterial.

     The surface will be non-reflective when this is 0, and completely mirror-like when it is 1.0.

     Multiplies by {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}}.

     @property reflectivity
     @default 1.0
     @type Number
     */
    set reflectivity(value) {
        this._state.reflectivity = value !== undefined ? value : 1.0;
        this._renderer.imageDirty();
    }

    get reflectivity() {
        return this._state.reflectivity;
    }

    /**
     Normal map.

     @property normalMap
     @default undefined
     @type {Texture}
     @final
     */
    get normalMap() {
        return this._normalMap;
    }

    /**
     Ambient map.

     Multiplies by {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}}.

     @property ambientMap
     @default undefined
     @type {Texture}
     @final
     */
    get ambientMap() {
        return this._ambientMap;
    }

    /**
     Diffuse map.

     Multiplies by {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}.

     @property diffuseMap
     @default undefined
     @type {Texture}
     @final
     */
    get diffuseMap() {
        return this._diffuseMap;
    }

    /**
     Specular map.

     Multiplies by {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}}.

     @property specularMap
     @default undefined
     @type {Texture}
     @final
     */

    get specularMap() {
        return this._specularMap;
    }

    /**
     Emissive map.

     Multiplies by {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}}.

     @property emissiveMap
     @default undefined
     @type {Texture}
     @final
     */
    get emissiveMap() {
        return this._emissiveMap;
    }

    /**
     Alpha map.

     Multiplies by {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}.

     @property alphaMap
     @default undefined
     @type {Texture}
     @final
     */
    get alphaMap() {
        return this._alphaMap;
    }

    /**
     Reflectivity map.

     Multiplies by {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}}.

     @property reflectivityMap
     @default undefined
     @type {Texture}
     @final
     */
    get reflectivityMap() {
        return this._reflectivityMap;
    }

    /**

     Occlusion map.

     @property occlusionMap
     @default undefined
     @type {Texture}
     @final
     */
    get occlusionMap() {
        return this._occlusionMap;
    }

    /**
     Diffuse Fresnel.

     Applies to {{#crossLink "PhongMaterial/diffuseFresnel:property"}}{{/crossLink}}.

     @property diffuseFresnel
     @default undefined
     @type {Fresnel}
     @final
     */
    get diffuseFresnel() {
        return this._diffuseFresnel;
    }

    /**
     Specular Fresnel.

     Applies to {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}}.

     @property specularFresnel
     @default undefined
     @type {Fresnel}
     @final
     */
    get specularFresnel() {
        return this._specularFresnel;
    }

    /**
     Emissive Fresnel.

     Applies to {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}}.

     @property emissiveFresnel
     @default undefined
     @type {Fresnel}
     @final
     */
    get emissiveFresnel() {
        return this._emissiveFresnel;
    }

    /**
     Alpha Fresnel.

     Applies to {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}}.

     @property alphaFresnel
     @default undefined
     @type {Fresnel}
     @final
     */
    get alphaFresnel() {
        return this._alphaFresnel;
    }

    /**
     Reflectivity Fresnel.

     Applies to {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}}.

     @property reflectivityFresnel
     @default undefined
     @type {Fresnel}
     @final
     */
    get reflectivityFresnel() {
        return this._reflectivityFresnel;
    }

    /**
     The alpha rendering mode.

     This governs how alpha is treated. Alpha is the combined result of the
     {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}} and
     {{#crossLink "PhongMaterial/alphaMap:property"}}{{/crossLink}} properties.

     * "opaque" - The alpha value is ignored and the rendered output is fully opaque.
     * "mask" - The rendered output is either fully opaque or fully transparent depending on the alpha value and the specified alpha cutoff value.
     * "blend" - The alpha value is used to composite the source and destination areas. The rendered output is combined with the background using the normal painting operation (i.e. the Porter and Duff over operator).

     @property alphaMode
     @default "opaque"
     @type {String}
     */

    set alphaMode(alphaMode) {
        alphaMode = alphaMode || "opaque";
        let value = alphaModes[alphaMode];
        if (value === undefined) {
            this.error("Unsupported value for 'alphaMode': " + alphaMode + " - defaulting to 'opaque'");
            value = "opaque";
        }
        if (this._state.alphaMode === value) {
            return;
        }
        this._state.alphaMode = value;
        this._renderer.imageDirty();
    }

    get alphaMode() {
        return alphaModeNames[this._state.alphaMode];
    }

    /**
     The alpha cutoff value.

     Specifies the cutoff threshold when {{#crossLink "PhongMaterial/alphaMode:property"}}{{/crossLink}}
     equals "mask". If the alpha is greater than or equal to this value then it is rendered as fully
     opaque, otherwise, it is rendered as fully transparent. A value greater than 1.0 will render the entire
     material as fully transparent. This value is ignored for other modes.

     Alpha is the combined result of the
     {{#crossLink "PhongMaterial/alpha:property"}}{{/crossLink}} and
     {{#crossLink "PhongMaterial/alphaMap:property"}}{{/crossLink}} properties.

     @property alphaCutoff
     @default 0.5
     @type {Number}
     */
    set alphaCutoff(alphaCutoff) {
        if (alphaCutoff === null || alphaCutoff === undefined) {
            alphaCutoff = 0.5;
        }
        if (this._state.alphaCutoff === alphaCutoff) {
            return;
        }
        this._state.alphaCutoff = alphaCutoff;
    }

    get alphaCutoff() {
        return this._state.alphaCutoff;
    }

    /**
     Whether backfaces are visible on attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

     The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
     the {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

     @property backfaces
     @default false
     @type Boolean
     */
    set backfaces(value) {
        value = !!value;
        if (this._state.backfaces === value) {
            return;
        }
        this._state.backfaces = value;
        this._renderer.imageDirty();
    }

    get backfaces() {
        return this._state.backfaces;
    }

    /**
     Indicates the winding direction of front faces on attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

     The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
     the {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

     @property frontface
     @default "ccw"
     @type String
     */
    set frontface(value) {
        value = value !== "cw";
        if (this._state.frontface === value) {
            return;
        }
        this._state.frontface = value;
        this._renderer.imageDirty();
    }

    get frontface() {
        return this._state.frontface ? "ccw" : "cw";
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = PhongMaterial;

export{PhongMaterial};