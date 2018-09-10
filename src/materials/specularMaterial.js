/**
 A **SpecularMaterial** is a physically-based {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 {{#crossLink "Mesh"}}Meshes{{/crossLink}} using the *specular-glossiness* workflow.

 ## Examples

 | <a href="../../examples/#importing_gltf_pbr_specular_telephone"><img src="../../assets/images/screenshots/SpecularMaterial/telephone.png"></img></a> | <a href="../../examples/#materials_specular_samples"><img src="../../assets/images/screenshots/SpecularMaterial/materials.png"></img></a> | <a href="../../examples/#materials_specular_textures"><img src="../../assets/images/screenshots/SpecularMaterial/textures.png"></img></a> | <a href="../../examples/#materials_specular_specularVsGlossiness"><img src="../../assets/images/screenshots/SpecularMaterial/specVsGloss.png"></img></a> |
 |:------:|:----:|:-----:|:-----:|
 |[glTF models with PBR materials](../../examples/#importing_gltf_pbr_specular_telephone)|[Sample materials ](../../examples/#materials_specular_samples) | [Texturing spec/gloss channels](../../examples/#materials_specular_textures) | [Specular Vs. glossiness](../../examples/#materials_specular_specularVsGlossiness) |

 ## Overview

 * SpecularMaterial is usually used for insulators, such as ceramic, wood and plastic.
 * {{#crossLink "MetallicMaterial"}}{{/crossLink}} is usually used for conductive materials, such as metal.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} is usually used for non-realistic objects.

 For an introduction to PBR concepts, try these articles:

 * Joe Wilson's [Basic Theory of Physically-Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
 * Jeff Russel's [Physically-based Rendering, and you can too!](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)
 * Sebastien Legarde's [Adapting a physically-based shading model](http://seblagarde.wordpress.com/tag/physically-based-rendering/)

 The following table summarizes SpecularMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 | {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the diffuse color of the material. |
 | {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the specular color of the material. |
 | {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The glossiness the material. |
 | {{#crossLink "SpecularMaterial/specularF0:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The specularF0 of the material surface. |
 | {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the emissive color of the material. |
 | {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/specularMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first three components multiplying by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and fourth component multiplying by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with RGB components multiplying by {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/occlusionMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Ambient occlusion texture multiplying by surface's reflected diffuse and specular light. |
 | {{#crossLink "SpecularMaterial/normalMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Tangent-space normal map. |
 | {{#crossLink "SpecularMaterial/alphaMode:property"}}{{/crossLink}} | String | "opaque", "blend", "mask" | "blend" |  | Alpha blend mode. |
 | {{#crossLink "SpecularMaterial/alphaCutoff:property"}}{{/crossLink}} | Number | [0..1] | 0.5 |  | Alpha cutoff value. |
 | {{#crossLink "SpecularMaterial/backfaces:property"}}{{/crossLink}} | Boolean |  | false |  | Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces. |
 | {{#crossLink "SpecularMaterial/frontface:property"}}{{/crossLink}} | String | "ccw", "cw" | "ccw" |  | The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} frontfaces - "cw" for clockwise, or "ccw" for counter-clockwise. |

 ## Usage

 In the example below we'll create the plastered sphere shown in the [Sample Materials](../../examples/#materials_specular_textures) example (see screenshots above).

 Here's a closeup of the sphere we'll create:

 <a href="../../examples/#materials_specular_samples"><img src="../../assets/images/screenshots/SpecularMaterial/plaster.png"></img></a>

 Our plastered sphere {{#crossLink "Mesh"}}{{/crossLink}} has:

 * a {{#crossLink "SphereGeometry"}}{{/crossLink}},
 * a SpecularMaterial with {{#crossLink "Texture"}}Textures{{/crossLink}} providing diffuse, glossiness, specular and normal maps.

 We'll also provide its {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Lights"}}{{/crossLink}} with
 {{#crossLink "DirLight"}}DirLights{{/crossLink}}, plus {{#crossLink "CubeTexture"}}CubeTextures{{/crossLink}} for light
 and reflection maps.

 Note that in this example we're providing separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}
 channels, which allows us a little creative flexibility. Then, in the next example further down, we'll combine those channels
 within the same {{#crossLink "Texture"}}{{/crossLink}} for efficiency.

 ````javascript
 var plasteredSphere = new xeogl.Mesh({

    geometry: new xeogl.SphereGeometry({
        center: [0,0,0],
        radius: 1.5,
        heightSegments: 60,
        widthSegments: 60
    }),

    material: new xeogl.SpecularMaterial({

        // Channels with default values, just to show them

        diffuse: [1.0, 1.0, 1.0],
        specular: [1.0, 1.0, 1.0],
        glossiness: 1.0,
        emissive: [0.0, 0.0, 0.0]
        alpha: 1.0,

        // Textures to multiply some of the channels

        diffuseMap: {       // RGB components multiply by diffuse
            src: "textures/materials/poligon/Plaster07_1k/Plaster07_COL_VAR1_1K.jpg"
        },
        specularMap: {      // RGB component multiplies by specular
            src: "textures/materials/poligon/Plaster07_1k/Plaster07_REFL_1K.jpg"
        },
        glossinessMap: {    // R component multiplies by glossiness
            src: "textures/materials/poligon/Plaster07_1k/Plaster07_GLOSS_1K.jpg"
        },
        normalMap: {
            src: "textures/materials/poligon/Plaster07_1k/Plaster07_NRM_1K.jpg"
        }
    })
 });

 var scene = plasteredSphere.scene;

 scene.lights.lights = [
 new xeogl.DirLight({
         dir: [0.8, -0.6, -0.8],
         color: [0.8, 0.8, 0.8],
         space: "view"
     }),
 new xeogl.DirLight({
         dir: [-0.8, -0.4, -0.4],
         color: [0.4, 0.4, 0.5],
         space: "view"
     }),
 new xeogl.DirLight({
         dir: [0.2, -0.8, 0.8],
         color: [0.8, 0.8, 0.8],
         space: "view"
     }
 ];

 scene.lights.lightMap = new xeogl.CubeTexture({
     src: [
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
         "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
     ]
 });

 scene.lights.reflectionMap = new xeogl.CubeTexture({
     src: [
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
         "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
     ]
 });
 ````

 ### Combining channels within the same textures

 In the previous example we provided separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and
 {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} channels, but we can combine those channels into the same {{#crossLink "Texture"}}{{/crossLink}} to reduce download time, memory footprint and rendering time (and also for glTF compatibility).

 Here's our SpecularMaterial again with those channels combined in the
 {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} {{#crossLink "Texture"}}Texture{{/crossLink}}, where the
 *RGB* component multiplies by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and *A* multiplies by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}.

 ````javascript
 plasteredSphere.material = new xeogl.SpecularMaterial({

    // Default values
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    glossiness: 1.0,
    emissive: [0.0, 0.0, 0.0]
    alpha: 1.0,

    diffuseMap: {
        src: "textures/materials/poligon/Plaster07_1k/Plaster07_COL_VAR1_1K.jpg"
    },
    specularGlossinessMap: { // RGB multiplies by specular, A by glossiness
        src: "textures/materials/poligon/Plaster07_1k/Plaster07_REFL_GLOSS_1K.jpg"
    },
    normalMap: {
        src: "textures/materials/poligon/Plaster07_1k/Plaster07_NRM_1K.jpg"
    }
 });
 ````

 Although not shown in this example, we can also texture {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} with
 the *A* component of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}'s {{#crossLink "Texture"}}{{/crossLink}},
 if required.

 ## Transparency

 ### Alpha Blending

 Let's make our plastered sphere transparent. We'll update its SpecularMaterial's {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}}
 and {{#crossLink "SpecularMaterial/alphaMode:property"}}{{/crossLink}}, causing it to blend 50% with the background:

 ````javascript
 plasteredSphere.material.alpha = 0.5;
 plasteredSphere.material.alphaMode = "blend";
 ````

 *TODO: Screenshot*

 ### Alpha Masking

 Now let's make holes in our plastered sphere. We'll give its SpecularMaterial an {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}}
 and configure {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}}, {{#crossLink "SpecularMaterial/alphaMode:property"}}{{/crossLink}},
 and {{#crossLink "SpecularMaterial/alphaCutoff:property"}}{{/crossLink}} to treat it as an alpha mask:

 ````javascript
 plasteredSphere.material.alphaMap = new xeogl.Texture({
     src: "textures/diffuse/crossGridColorMap.jpg"
 });

 plasteredSphere.material.alpha = 1.0;
 plasteredSphere.material.alphaMode = "mask";
 plasteredSphere.material.alphaCutoff = 0.2;
 ````

 *TODO: Screenshot*

 @class SpecularMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material

 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.

 @param [cfg] {*} The SpecularMaterial configuration

 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.

 @param [cfg.meta=null] {String:Object} Metadata to attach to this SpecularMaterial.

 @param [cfg.diffuse=[1,1,1]] {Float32Array}  RGB diffuse color of this SpecularMaterial. Multiplies by the RGB
 components of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

 @param [cfg.diffuseMap=undefined] {Texture} RGBA {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color
 of this SpecularMaterial, with optional *A* component for alpha. The RGB components multiply by the
 {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} property,
 while the *A* component, if present, multiplies by the {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} property.

 @param [cfg.specular=[1,1,1]] {Number} RGB specular color of this SpecularMaterial. Multiplies by the
 {{#crossLink "SpecularMaterial/specularMap:property"}}{{/crossLink}} and the *RGB* components of
 {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

 @param [cfg.specularMap=undefined] {Texture} RGB texture containing the specular color of this SpecularMaterial. Multiplies
 by the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 @param [cfg.glossiness=1.0] {Number} Factor in the range [0..1] indicating how glossy this SpecularMaterial is. 0 is
 no glossiness, 1 is full glossiness. Multiplies by the *R* component of {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}}
 and the *A* component of {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

 @param [cfg.specularGlossinessMap=undefined] {Texture} RGBA {{#crossLink "Texture"}}{{/crossLink}} containing this
 SpecularMaterial's specular color in its *RGB* component and glossiness in its *A* component. Its *RGB* components multiply by the
 {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property, while its *A* component multiplies by the
 {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property. Must be within the same
 {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 @param [cfg.specularF0=0.0] {Number} Factor in the range 0..1 indicating how reflective this SpecularMaterial is.

 @param [cfg.emissive=[0,0,0]] {Float32Array}  RGB emissive color of this SpecularMaterial. Multiplies by the RGB
 components of {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}}.

 @param [cfg.emissiveMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing the emissive color of this
 SpecularMaterial. Multiplies by the {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} property.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 @param [cfg.occlusionMap=undefined] {Texture} RGB ambient occlusion {{#crossLink "Texture"}}{{/crossLink}}. Within shaders,
 multiplies by the specular and diffuse light reflected by surfaces. Must be within the same {{#crossLink "Scene"}}{{/crossLink}}
 as this SpecularMaterial.

 @param [cfg.normalMap=undefined] {Texture} RGB tangent-space normal {{#crossLink "Texture"}}{{/crossLink}}. Must be
 within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 @param [cfg.alpha=1.0] {Number} Factor in the range 0..1 indicating how transparent this SpecularMaterial is.
 A value of 0.0 indicates fully transparent, 1.0 is fully opaque. Multiplies by the *R* component of
 {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}} and the *A* component, if present, of
 {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

 @param [cfg.alphaMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this SpecularMaterial's
 alpha in its *R* component. The *R* component multiplies by the {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} property. Must
 be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 @param [cfg.alphaMode="opaque"] {String} The alpha blend mode - accepted values are "opaque", "blend" and "mask".
 See the {{#crossLink "SpecularMaterial/alphaMode:property"}}{{/crossLink}} property for more info.

 @param [cfg.alphaCutoff=0.5] {Number} The alpha cutoff value.
 See the {{#crossLink "SpecularMaterial/alphaCutoff:property"}}{{/crossLink}} property for more info.

 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.

 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.

 @param [cfg.lineWidth=1] {Number} Scalar that controls the width of lines for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines".
 @param [cfg.pointSize=1] {Number} Scalar that controls the size of points for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "points".

 */
import {Material} from './material.js';
import {State} from '../renderer/state.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.SpecularMaterial";
const alphaModes = {"opaque": 0, "mask": 1, "blend": 2};
const alphaModeNames = ["opaque", "mask", "blend"];

class SpecularMaterial extends Material {

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
            type: "SpecularMaterial",
            diffuse: math.vec3([1.0, 1.0, 1.0]),
            emissive: math.vec3([0.0, 0.0, 0.0]),
            specular: math.vec3([1.0, 1.0, 1.0]),
            glossiness: null,
            specularF0: null,
            alpha: null,
            alphaMode: null,
            alphaCutoff: null,
            lineWidth: null,
            pointSize: null,
            backfaces: null,
            frontface: null, // Boolean for speed; true == "ccw", false == "cw"
            hash: null
        });

        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.glossiness = cfg.glossiness;
        this.specularF0 = cfg.specularF0;
        this.emissive = cfg.emissive;
        this.alpha = cfg.alpha;

        if (cfg.diffuseMap) {
            this._diffuseMap = this._checkComponent("xeogl.Texture", cfg.diffuseMap);
        }
        if (cfg.emissiveMap) {
            this._emissiveMap = this._checkComponent("xeogl.Texture", cfg.emissiveMap);
        }
        if (cfg.specularMap) {
            this._specularMap = this._checkComponent("xeogl.Texture", cfg.specularMap);
        }
        if (cfg.glossinessMap) {
            this._glossinessMap = this._checkComponent("xeogl.Texture", cfg.glossinessMap);
        }
        if (cfg.specularGlossinessMap) {
            this._specularGlossinessMap = this._checkComponent("xeogl.Texture", cfg.specularGlossinessMap);
        }
        if (cfg.occlusionMap) {
            this._occlusionMap = this._checkComponent("xeogl.Texture", cfg.occlusionMap);
        }
        if (cfg.alphaMap) {
            this._alphaMap = this._checkComponent("xeogl.Texture", cfg.alphaMap);
        }
        if (cfg.normalMap) {
            this._normalMap = this._checkComponent("xeogl.Texture", cfg.normalMap);
        }

        this.alphaMode = cfg.alphaMode;
        this.alphaCutoff = cfg.alphaCutoff;
        this.backfaces = cfg.backfaces;
        this.frontface = cfg.frontface;

        this.lineWidth = cfg.lineWidth;
        this.pointSize = cfg.pointSize;

        this._makeHash();
    }

    _makeHash() {
        const state = this._state;
        const hash = ["/spe"];
        if (this._diffuseMap) {
            hash.push("/dm");
            if (this._diffuseMap.hasMatrix) {
                hash.push("/mat");
            }
            hash.push("/" + this._diffuseMap.encoding);
        }
        if (this._emissiveMap) {
            hash.push("/em");
            if (this._emissiveMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._glossinessMap) {
            hash.push("/gm");
            if (this._glossinessMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._specularMap) {
            hash.push("/sm");
            if (this._specularMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._specularGlossinessMap) {
            hash.push("/sgm");
            if (this._specularGlossinessMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._occlusionMap) {
            hash.push("/ocm");
            if (this._occlusionMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._normalMap) {
            hash.push("/nm");
            if (this._normalMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        if (this._alphaMap) {
            hash.push("/opm");
            if (this._alphaMap.hasMatrix) {
                hash.push("/mat");
            }
        }
        hash.push(";");
        state.hash = hash.join("");
    }

    /**
     RGB diffuse color of this SpecularMaterial.

     Multiplies by the *RGB* components of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

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
     RGB {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color of this SpecularMaterial, with optional *A* component for alpha.

     The *RGB* components multiply by the {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} property,
     while the *A* component, if present, multiplies by the {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} property.

     @property diffuseMap
     @default undefined
     @type {Texture}
     @final
     */
    get diffuseMap() {
        return this._diffuseMap;
    }

    /**
     RGB specular color of this SpecularMaterial.

     Multiplies by the {{#crossLink "SpecularMaterial/specularMap:property"}}{{/crossLink}}
     and the *A* component of {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

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
     RGB texture containing the specular color of this SpecularMaterial.

     Multiplies by the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property.

     @property specularMap
     @default undefined
     @type {Texture}
     @final
     */
    get specularMap() {
        return this._specularMap;
    }

    /**
     RGBA texture containing this SpecularMaterial's specular color in its *RGB* components and glossiness in its *A* component.

     The *RGB* components multiply by the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property, while
     the *A* component multiplies by the {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property.

     @property specularGlossinessMap
     @default undefined
     @type {Texture}
     @final
     */
    get specularGlossinessMap() {
        return this._specularGlossinessMap;
    }

    /**
     Factor in the range [0..1] indicating how glossy this SpecularMaterial is.

     0 is no glossiness, 1 is full glossiness.

     Multiplies by the *R* component of {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}}
     and the *A* component of {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

     @property glossiness
     @default 1.0
     @type Number
     */
    set glossiness(value) {
        value = (value !== undefined && value !== null) ? value : 1.0;
        if (this._state.glossiness === value) {
            return;
        }
        this._state.glossiness = value;
        this._renderer.imageDirty();
    }

    get glossiness() {
        return this._state.glossiness;
    }

    /**
     RGB texture containing this SpecularMaterial's glossiness in its *R* component.

     The *R* component multiplies by the {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property.

     Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

     @property glossinessMap
     @default undefined
     @type {Texture}
     @final
     */
    get glossinessMap() {
        return this._glossinessMap;
    }

    /**
     Factor in the range [0..1] indicating amount of specular Fresnel.

     @property specularF0
     @default 0.0
     @type Number
     */
    set specularF0(value) {
        value = (value !== undefined && value !== null) ? value : 0.0;
        if (this._state.specularF0 === value) {
            return;
        }
        this._state.specularF0 = value;
        this._renderer.imageDirty();
    }

    get specularF0() {
        return this._state.specularF0;
    }

    /**
     RGB emissive color of this SpecularMaterial.

     Multiplies by {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}}.

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
     RGB texture containing the emissive color of this SpecularMaterial.

     Multiplies by the {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} property.

     @property emissiveMap
     @default undefined
     @type {Texture}
     @final
     */
    get emissiveMap() {
        return this._emissiveMap;
    }

    /**
     Factor in the range [0..1] indicating how transparent this SpecularMaterial is.

     A value of 0.0 is fully transparent, while 1.0 is fully opaque.

     Multiplies by the *R* component of {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}} and
     the *A* component, if present, of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

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
     RGB {{#crossLink "Texture"}}{{/crossLink}} with alpha in its *R* component.

     The *R* component multiplies by the {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} property.

     @property alphaMap
     @default undefined
     @type {Texture}
     @final
     */
    get alphaMap() {
        return this._alphaMap;
    }

    /**
     RGB tangent-space normal {{#crossLink "Texture"}}{{/crossLink}} attached to this SpecularMaterial.

     @property normalMap
     @default undefined
     @type {Texture}
     @final
     */
    get normalMap() {
        return this._normalMap;
    }

    /**
     RGB ambient occlusion {{#crossLink "Texture"}}{{/crossLink}} attached to this SpecularMaterial.

     Within objectRenderers, multiplies by the specular and diffuse light reflected by surfaces.

     @property occlusionMap
     @default undefined
     @type {Texture}
     @final
     */
    get occlusionMap() {
        return this._occlusionMap;
    }

    /**
     The alpha rendering mode.

     This governs how alpha is treated. Alpha is the combined result of the
     {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} and
     {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}} properties.

     * "opaque" - The alpha value is ignored and the rendered output is fully opaque.
     * "mask" - The rendered output is either fully opaque or fully transparent depending on the alpha value and the specified alpha cutoff value.
     * "blend" - The alpha value is used to composite the source and destination areas. The rendered output is combined with the background using the normal painting operation (i.e. the Porter and Duff over operator)

     @property alphaMode
     @default "opaque"
     @type {String}
     */
    set alphaMode(alphaMode) {
        alphaMode = alphaMode || "opaque";
        let value = alphaModes[alphaMode];
        if (value === undefined) {
            this.error("Unsupported value for 'alphaMode': " + alphaMode + " defaulting to 'opaque'");
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

     Specifies the cutoff threshold when {{#crossLink "SpecularMaterial/alphaMode:property"}}{{/crossLink}}
     equals "mask". If the alpha is greater than or equal to this value then it is rendered as fully
     opaque, otherwise, it is rendered as fully transparent. A value greater than 1.0 will render the entire
     material as fully transparent. This value is ignored for other modes.

     Alpha is the combined result of the
     {{#crossLink "SpecularMaterial/alpha:property"}}{{/crossLink}} and
     {{#crossLink "SpecularMaterial/alphaMap:property"}}{{/crossLink}} properties.

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

    /**
     The SpecularMaterial's line width.

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
     The SpecularMaterial's point size.

     @property pointSize
     @default 1
     @type Number
     */
    set pointSize(value) {
        this._state.pointSize = value || 1;
        this._renderer.imageDirty();
    }

    get pointSize() {
        return this._state.pointSize;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = SpecularMaterial;

export{SpecularMaterial};