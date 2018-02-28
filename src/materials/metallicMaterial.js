/**
 A **MetallicMaterial** is a physically-based {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 {{#crossLink "Entity"}}Entities{{/crossLink}} using the *metallic-roughness* workflow.

 ## Examples

 | <a href="../../examples/#importing_gltf_pbr_metallic_helmet"><img src="../../assets/images/screenshots/MetallicMaterial/helmet.png"></img></a> | <a href="../../examples/#materials_metallic_fireHydrant"><img src="../../assets/images/screenshots/MetallicMaterial/hydrant3.png"></img></a> | <a href="../../examples/#materials_metallic_samples_metals"><img src="../../assets/images/screenshots/MetallicMaterial/metals.png"></img></a> | <a href="../../examples/#materials_metallic_metallicVsRoughness"><img alt="Metallic Vs Roughness" src="../../assets/images/screenshots/MetallicMaterial/metalVsRough.png"></img></a> |
 |:------:|:----:|:-----:|:-----:|
 |[glTF models with PBR materials](../../examples/#importing_gltf_pbr_metallic_helmet)|[Fire hydrant model](../../examples/#materials_metallic_fireHydrant)| [Sample metal materials ](../../examples/#materials_metallic_samples_metals)|[Metallic Vs. roughness](../../examples/#materials_metallic_metallicVsRoughness)|

 ## Overview

 * MetallicMaterial is usually used for conductive materials, such as metal.
 * {{#crossLink "SpecularMaterial"}}{{/crossLink}} is usually used for insulators, such as wood, ceramics and plastic.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} is usually used for non-realistic objects.

 <img src="../../../assets/images/MetallicMaterial.png"></img>

 For an introduction to PBR concepts, try these articles:

 * Joe Wilson's [Basic Theory of Physically-Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
 * Jeff Russel's [Physically-based Rendering, and you can too!](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)
 * Sebastien Legarde's [Adapting a physically-based shading model](http://seblagarde.wordpress.com/tag/physically-based-rendering/)

 The following table summarizes MetallicMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 | {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the base color of the material. |
 | {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The metallic-ness the material (1 for metals, 0 for non-metals). |
 | {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The roughness of the material surface. |
 | {{#crossLink "MetallicMaterial/specularF0:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The specular Fresnel of the material surface. |
 | {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the emissive color of the material. |
 | {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/metallicMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/roughnessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/metallicRoughnessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and second component multiplying by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with RGB components multiplying by {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/occlusionMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Ambient occlusion texture multiplying by surface's reflected diffuse and specular light. |
 | {{#crossLink "MetallicMaterial/normalMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Tangent-space normal map. |
 | {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}} | String | "opaque", "blend", "mask" | "blend" |  | Alpha blend mode. |
 | {{#crossLink "MetallicMaterial/alphaCutoff:property"}}{{/crossLink}} | Number | [0..1] | 0.5 |  | Alpha cutoff value. |
 | {{#crossLink "MetallicMaterial/backfaces:property"}}{{/crossLink}} | Boolean |  | false |  | Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces. |
 | {{#crossLink "MetallicMaterial/frontface:property"}}{{/crossLink}} | String | "ccw", "cw" | "ccw" |  | The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} frontfaces - "cw" for clockwise, or "ccw" for counter-clockwise. |

 ## Usage

 In the example below we'll create the [yellow fire hydrant](../../examples/#materials_metallic_fireHydrant) shown in the example screen shots above. Our hydrant {{#crossLink "Entity"}}{{/crossLink}} has:

 * a {{#crossLink "OBJGeometry"}}{{/crossLink}} which loads the fire hydrant mesh from an .OBJ file,
 * a MetallicMaterial with {{#crossLink "Texture"}}Textures{{/crossLink}} providing diffuse, metallic, roughness, occlusion and normal maps.

 We'll also provide its {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Lights"}}{{/crossLink}} with
 {{#crossLink "DirLight"}}DirLights{{/crossLink}}, plus {{#crossLink "CubeTexture"}}CubeTextures{{/crossLink}} for light
 and reflection maps.

 Note that in this example we're providing separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}
 channels, which allows us a little creative flexibility. Then, in the next example further down, we'll combine those channels
 within the same {{#crossLink "Texture"}}{{/crossLink}} for efficiency.

 ````javascript
 var hydrant = new xeogl.Entity({

    geometry: new xeogl.OBJGeometry({
        src: "models/obj/FireHydrantMesh.obj"
    }),

    material: new xeogl.MetallicMaterial({

        // Channels with default values, just to show them

        baseColor: [1.0, 1.0, 1.0],
        metallic: 1.0,
        roughness: 1.0,
        emissive: [0.0, 0.0, 0.0],
        alpha: 1.0,

        // Textures to multiply by some of the channels

        baseColorMap : new xeogl.Texture({  // Multiplies by baseColor
            src: "textures/diffuse/fire_hydrant_Base_Color.png"
        }),

        metallicMap : new xeogl.Texture({   // R component multiplies by metallic
            src: "textures/metallic/fire_hydrant_Metallic.png"
        }),

        roughnessMap : new xeogl.Texture({  // R component multiplies by roughness
            src: "textures/roughness/fire_hydrant_Roughness.png"
        }),

        occlusionMap : new xeogl.Texture({  // Multiplies by fragment alpha
            src: "textures/occlusion/fire_hydrant_Mixed_AO.png"
        }),

        normalMap : new xeogl.Texture({
            src: "textures/normal/fire_hydrant_Normal_OpenGL.png"
        })
    })
 });

 var scene = hydrant.scene;

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

 In the previous example we provided separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and
 {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} channels, but we can combine those channels into the same {{#crossLink "Texture"}}{{/crossLink}} to reduce download time, memory footprint and rendering time (and also for glTF compatibility).

 Here's our MetallicMaterial again with those channels combined in the
 {{#crossLink "MetallicMaterial/metallicRoughnessMap:property"}}{{/crossLink}} {{#crossLink "Texture"}}Texture{{/crossLink}}, where the
 *R* component multiplies by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and *G* multiplies by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}.

 ````javascript
 hydrant.material = new xeogl.MetallicMaterial({

    baseColor: [1,1,1], // Default value
    metallic: 1.0,      // Default value
    roughness: 1.0,     // Default value

    baseColorMap : new xeogl.Texture({
        src: "textures/diffuse/fire_hydrant_Base_Color.png"
    }),
    metallicRoughnessMap : new xeogl.Texture({
        src: "textures/metallicRoughness/fire_hydrant_MetallicRoughness.png"
    }),
    occlusionMap : new xeogl.Texture({
        src: "textures/occlusion/fire_hydrant_Mixed_AO.png"
    }),
    normalMap : new xeogl.Texture({
        src: "textures/normal/fire_hydrant_Normal_OpenGL.png"
    })
 });
 ````

 Although not shown in this example, we can also texture {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} with
 the *A* component of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}'s {{#crossLink "Texture"}}{{/crossLink}},
 if required.

 ## Transparency

 ### Alpha Blending

 Let's make our hydrant transparent.

 We'll update its MetallicMaterial's {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}}
 and {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}}, causing it to blend 50% with the background:

 ````javascript
 hydrant.material.alpha = 0.5;
 hydrant.material.alphaMode = "blend";
 ````

 <img src="../../../assets/images/screenshots/MetallicMaterial/alphaBlend.png"></img>

 ### Alpha Masking

 Let's apply an alpha mask to our hydrant.

 We'll give its MetallicMaterial an {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}}
 and configure {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}}, {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}},
 and {{#crossLink "MetallicMaterial/alphaCutoff:property"}}{{/crossLink}} to treat it as an alpha mask:

 ````javascript
 hydrant.material.alphaMap = new xeogl.Texture({
        src: "textures/diffuse/crossGridColorMap.jpg"
    });

 hydrant.material.alpha = 1.0;
 hydrant.material.alphaMode = "mask";
 hydrant.material.alphaCutoff = 0.2;
 ````

 <img src="../../../assets/images/screenshots/MetallicMaterial/alphaMask.png"></img>

 @class MetallicMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material

 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this MetallicMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.

 @param [cfg] {*} The MetallicMaterial configuration.

 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.

 @param [cfg.meta=null] {String:Object} Metadata to attach to this material.

 @param [cfg.baseColor=[1,1,1]] {Float32Array}  RGB diffuse color of this MetallicMaterial. Multiplies by the RGB
 components of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}.

 @param [cfg.metallic=1.0] {Number} Factor in the range 0..1 indicating how metallic this MetallicMaterial is.
 1 is metal, 0 is non-metal. Multiplies by the *R* component of {{#crossLink "MetallicMaterial/metallicMap:property"}}{{/crossLink}} and the *A* component of
 {{#crossLink "MetallicMaterial/metalRoughnessMap:property"}}{{/crossLink}}.

 @param [cfg.roughness=1.0] {Number} Factor in the range 0..1 indicating the roughness of this MetallicMaterial.
 0 is fully smooth, 1 is fully rough. Multiplies by the *R* component of {{#crossLink "MetallicMaterial/roughnessMap:property"}}{{/crossLink}}.

 @param [cfg.specularF0=0.0] {Number} Factor in the range 0..1 indicating specular Fresnel.

 @param [cfg.emissive=[0,0,0]] {Float32Array}  RGB emissive color of this MetallicMaterial. Multiplies by the RGB
 components of {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}}.

 @param [cfg.alpha=1.0] {Number} Factor in the range 0..1 indicating the alpha of this MetallicMaterial.
 Multiplies by the *R* component of {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} and the *A* component,
 if present, of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}. The value of
 {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}} indicates how alpha is interpreted when rendering.

 @param [cfg.baseColorMap=undefined] {Texture} RGBA {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color
 of this MetallicMaterial, with optional *A* component for alpha. The RGB components multiply by the
 {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} property,
 while the *A* component, if present, multiplies by the {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} property.

 @param [cfg.alphaMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's
 alpha in its *R* component. The *R* component multiplies by the {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} property. Must
 be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.metallicMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's
 metallic factor in its *R* component. The *R* component multiplies by the
 {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property. Must be within the same
 {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.roughnessMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's
 roughness factor in its *R* component. The *R* component multiplies by the
 {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property. Must be within the same
 {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.metallicRoughnessMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this
 MetallicMaterial's metalness in its *R* component and roughness in its *G* component. Its *R* component multiplies by the
 {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property, while its *G* component multiplies by the
 {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property. Must be within the same
 {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.emissiveMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing the emissive color of this
 MetallicMaterial. Multiplies by the {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} property.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.occlusionMap=undefined] {Texture} RGB ambient occlusion {{#crossLink "Texture"}}{{/crossLink}}. Within shaders,
 multiplies by the specular and diffuse light reflected by surfaces. Must be within the same {{#crossLink "Scene"}}{{/crossLink}}
 as this MetallicMaterial.

 @param [cfg.normalMap=undefined] {Texture} RGB tangent-space normal {{#crossLink "Texture"}}{{/crossLink}}. Must be
 within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

 @param [cfg.alphaMode="opaque"] {String} The alpha blend mode, which specifies how alpha is to be interpreted. Accepted
 values are "opaque", "blend" and "mask". See the {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}} property for more info.

 @param [cfg.alphaCutoff=0.5] {Number} The alpha cutoff value.
 See the {{#crossLink "MetallicMaterial/alphaCutoff:property"}}{{/crossLink}} property for more info.

 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.

 @param [cfg.lineWidth=1] {Number} Scalar that controls the width of lines for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines".
 @param [cfg.pointSize=1] {Number} Scalar that controls the size of points for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "points".

 */
(function () {

    "use strict";

    xeogl.MetallicMaterial = xeogl.Material.extend({

        type: "xeogl.MetallicMaterial",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new xeogl.renderer.MetallicMaterial({
                type: "MetallicMaterial",
                baseColor: xeogl.math.vec4([1.0, 1.0, 1.0]),
                emissive: xeogl.math.vec4([0.0, 0.0, 0.0]),
                metallic: null,
                roughness: null,
                specularF0: null,
                alpha: null,
                baseColorMap: null,
                alphaMap: null,
                metallicMap: null,
                roughnessMap: null,
                metallicRoughnessMap: null,
                emissiveMap: null,
                occlusionMap: null,
                normalMap: null,
                alphaMode: null, // "opaque"
                alphaCutoff: null,
                lineWidth: null,
                pointSize: null,
                backfaces: null,
                frontface: null, // Boolean for speed; true == "ccw", false == "cw"
                hash: null
            });

            this._hashDirty = true;

            this.on("dirty", function () {

                // This MetallicMaterial is flagged dirty when a
                // child component fires "dirty", which always
                // means that a shader recompile will be needed.

                this._hashDirty = true;
            }, this);

            this.baseColor = cfg.baseColor;
            this.metallic = cfg.metallic;
            this.roughness = cfg.roughness;
            this.specularF0 = cfg.specularF0;
            this.emissive = cfg.emissive;
            this.alpha = cfg.alpha;

            if (cfg.baseColorMap) {
                this.baseColorMap = cfg.baseColorMap;
            }

            if (cfg.metallicMap) {
                this.metallicMap = cfg.metallicMap;
            }

            if (cfg.roughnessMap) {
                this.roughnessMap = cfg.roughnessMap;
            }

            if (cfg.metallicRoughnessMap) {
                this.metallicRoughnessMap = cfg.metallicRoughnessMap;
            }

            if (cfg.emissiveMap) {
                this.emissiveMap = cfg.emissiveMap;
            }

            if (cfg.occlusionMap) {
                this.occlusionMap = cfg.occlusionMap;
            }

            if (cfg.alphaMap) {
                this.alphaMap = cfg.alphaMap;
            }

            if (cfg.normalMap) {
                this.normalMap = cfg.normalMap;
            }

            this.alphaMode = cfg.alphaMode;
            this.alphaCutoff = cfg.alphaCutoff;
            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;

            this.lineWidth = cfg.lineWidth;
            this.pointSize = cfg.pointSize;
        },

        _props: {

            /**
             RGB diffuse color of this MetallicMaterial.

             Multiplies by the RGB components of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}.

             @property baseColor
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            baseColor: {

                set: function (value) {

                    var baseColor = this._state.baseColor;

                    if (!baseColor) {
                        baseColor = this._state.baseColor = new Float32Array(3);

                    } else if (value && baseColor[0] === value[0] && baseColor[1] === value[1] && baseColor[2] === value[2]) {
                        return;
                    }

                    if (value) {
                        baseColor[0] = value[0];
                        baseColor[1] = value[1];
                        baseColor[2] = value[2];

                    } else {
                        baseColor[0] = 1;
                        baseColor[1] = 1;
                        baseColor[2] = 1;
                    }

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.baseColor;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color of this MetallicMaterial, with optional *A* component for alpha.

             The RGB components multiply by the {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} property,
             while the *A* component, if present, multiplies by the {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property baseColorMap
             @default undefined
             @type {Texture}
             */
            baseColorMap: {

                set: function (texture) {
                    this._attachComponent("xeogl.Texture", "baseColorMap", texture);
                },

                get: function () {
                    return this._attached.baseColorMap;
                }
            },

            /**
             Factor in the range [0..1] indicating how metallic this MetallicMaterial is.

             1 is metal, 0 is non-metal.

             Multiplies by the *R* component of {{#crossLink "MetallicMaterial/metallicMap:property"}}{{/crossLink}}
             and the *A* component of {{#crossLink "MetallicMaterial/metalRoughnessMap:property"}}{{/crossLink}}.

             @property metallic
             @default 1.0
             @type Number
             */
            metallic: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.metallic === value) {
                        return;
                    }

                    this._state.metallic = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.metallic;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's metallic factor in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property metallicMap
             @default undefined
             @type {Texture}
             */
            metallicMap: {

                set: function (texture) {
                    this._attachComponent("xeogl.Texture", "metallicMap", texture);
                },

                get: function () {
                    return this._attached.metallicMap;
                }
            },

            /**
             Factor in the range [0..1] indicating the roughness of this MetallicMaterial.

             0 is fully smooth, 1 is fully rough.

             Multiplies by the *R* component of {{#crossLink "MetallicMaterial/roughnessMap:property"}}{{/crossLink}}.

             @property roughness
             @default 1.0
             @type Number
             */
            roughness: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.roughness === value) {
                        return;
                    }

                    this._state.roughness = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.roughness;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's roughness factor in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property roughnessMap
             @default undefined
             @type {Texture}
             */
            roughnessMap: {

                set: function (texture) {
                    this._attachComponent("xeogl.Texture", "roughnessMap", texture);
                },

                get: function () {
                    return this._attached.roughnessMap;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's metalness in its *R* component and roughness in its *G* component.

             Its *B* component multiplies by the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property, while
             its *G* component multiplies by the {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property metallicRoughnessMap
             @default undefined
             @type {Texture}
             */
            metallicRoughnessMap: {

                set: function (texture) {
                    this._attachComponent("xeogl.Texture", "metallicRoughnessMap", texture);
                },

                get: function () {
                    return this._attached.metallicRoughnessMap;
                }
            },

            /**
             Factor in the range [0..1] indicating specular Fresnel value.

             @property specularF0
             @default 0.0
             @type Number
             */
            specularF0: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 0.0;

                    if (this._state.specularF0 === value) {
                        return;
                    }

                    this._state.specularF0 = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.specularF0;
                }
            },

            /**
             RGB emissive color of this MetallicMaterial.

             Multiplies by {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}}.
             @property emissive
             @default [0.0, 0.0, 0.0]
             @type Float32Array
             */
            emissive: {

                set: function (value) {

                    var emissive = this._state.emissive;

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
                },

                get: function () {
                    return this._state.emissive;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing the emissive color of this MetallicMaterial.

             Multiplies by the {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property emissiveMap
             @default undefined
             @type {Texture}
             */
            emissiveMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}} property changes.

                     @event emissiveMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "emissiveMap", texture);
                },

                get: function () {
                    return this._attached.emissiveMap;
                }
            },

            /**
             RGB ambient occlusion {{#crossLink "Texture"}}{{/crossLink}} attached to this MetallicMaterial.

             Within objectRenderers, multiplies by the specular and diffuse light reflected by surfaces.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property occlusionMap
             @default undefined
             @type {Texture}
             */
            occlusionMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/occlusionMap:property"}}{{/crossLink}} property changes.

                     @event occlusionMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "occlusionMap", texture);
                },

                get: function () {
                    return this._attached.occlusionMap;
                }
            },

            /**
             Factor in the range [0..1] indicating the alpha value.

             Multiplies by the *R* component of {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} and
             the *A* component, if present, of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}.

             The value of {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}} indicates how alpha is
             interpreted when rendering.

             @property alpha
             @default 1.0
             @type Number
             */
            alpha: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.alpha === value) {
                        return;
                    }

                    this._state.alpha = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.alpha;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's alpha in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property alphaMap
             @default undefined
             @type {Texture}
             */
            alphaMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} property changes.

                     @event alphaMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "alphaMap", texture);
                },

                get: function () {
                    return this._attached.alphaMap;
                }
            },

            /**
             RGB tangent-space normal map {{#crossLink "Texture"}}{{/crossLink}}.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             @property normalMap
             @default undefined
             @type {Texture}
             */
            normalMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/normalMap:property"}}{{/crossLink}} property changes.

                     @event normalMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "normalMap", texture);
                },

                get: function () {
                    return this._attached.normalMap;
                }
            },

            /**
             The alpha rendering mode.

             This specifies how alpha is interpreted. Alpha is the combined result of the
             {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} and
             {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} properties.

             * "opaque" - The alpha value is ignored and the rendered output is fully opaque.
             * "mask" - The rendered output is either fully opaque or fully transparent depending on the alpha and {{#crossLink "MetallicMaterial/alphaCutoff:property"}}{{/crossLink}}.
             * "blend" - The alpha value is used to composite the source and destination areas. The rendered output is combined with the background using the normal painting operation (i.e. the Porter and Duff over operator).

             @property alphaMode
             @default "opaque"
             @type {String}
             */
            alphaMode: (function () {
                var modes = {"opaque": 0, "mask": 1, "blend": 2};
                var modeNames = ["opaque", "mask", "blend"];
                return {
                    set: function (alphaMode) {

                        alphaMode = alphaMode || "opaque";

                        var value = modes[alphaMode];

                        if (value === undefined) {
                            this.error("Unsupported value for 'alphaMode': " + alphaMode + " defaulting to 'opaque'");
                            value = "opaque";
                        }

                        if (this._state.alphaMode === value) {
                            return;
                        }

                        this._state.alphaMode = value;

                        this._renderer.imageDirty();
                    },
                    get: function () {
                        return modeNames[this._state.alphaMode];
                    }
                };
            })(),

            /**
             The alpha cutoff value.

             Specifies the cutoff threshold when {{#crossLink "MetallicMaterial/alphaMode:property"}}{{/crossLink}}
             equals "mask". If the alpha is greater than or equal to this value then it is rendered as fully
             opaque, otherwise, it is rendered as fully transparent. A value greater than 1.0 will render the entire
             material as fully transparent. This value is ignored for other modes.

             Alpha is the combined result of the
             {{#crossLink "MetallicMaterial/alpha:property"}}{{/crossLink}} and
             {{#crossLink "MetallicMaterial/alphaMap:property"}}{{/crossLink}} properties.

             @property alphaCutoff
             @default 0.5
             @type {Number}
             */
            alphaCutoff: {
                set: function (alphaCutoff) {

                    if (alphaCutoff === null || alphaCutoff === undefined) {
                        alphaCutoff = 0.5;
                    }

                    if (this._state.alphaCutoff === alphaCutoff) {
                        return;
                    }

                    this._state.alphaCutoff = alphaCutoff;
                },
                get: function () {
                    return this._state.alphaCutoff;
                }
            },

            /**
             Whether backfaces are visible on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             @property backfaces
             @default false
             @type Boolean
             */
            backfaces: {

                set: function (value) {

                    value = !!value;

                    if (this._state.backfaces === value) {
                        return;
                    }

                    this._state.backfaces = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.backfaces;
                }
            },

            /**
             Indicates the winding direction of front faces on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             @property frontface
             @default "ccw"
             @type String
             */
            frontface: {

                set: function (value) {

                    value = value !== "cw";

                    if (this._state.frontface === value) {
                        return;
                    }

                    this._state.frontface = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.frontface ? "ccw" : "cw";
                }
            },

            /**
             The MetallicMaterial's line width.

             @property lineWidth
             @default 1.0
             @type Number
             */
            lineWidth: {

                set: function (value) {

                    this._state.lineWidth = value || 1.0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.lineWidth;
                }
            },

            /**
             The MetallicMaterial's point size.

             @property pointSize
             @default 1.0
             @type Number
             */
            pointSize: {

                set: function (value) {

                    this._state.pointSize = value || 1.0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.pointSize;
                }
            }
        },

        _attachComponent: function (expectedType, name, component) {
            component = this._attach({
                name: name,
                type: expectedType,
                component: component,
                sceneDefault: false,
                on: {
                    destroyed: {
                        callback: function () {
                            this._state[name] = null;
                            this._hashDirty = true;
                        },
                        scope: this
                    }
                }
            });
            this._state[name] = component ? component._state : null; // FIXME: Accessing _state breaks encapsulation
            this._hashDirty = true;
        },

        _getState: function () {
            if (this._hashDirty) {
                this._makeHash();
                this._hashDirty = false;
            }
            return this._state;
        },

        _makeHash: function () {

            var state = this._state;

            var hash = ["/met"];

            if (state.baseColorMap) {
                hash.push("/bm");
                if (state.baseColorMap.matrix) {
                    hash.push("/mat");
                }
                hash.push("/" + state.baseColorMap.encoding);
            }

            if (state.metallicMap) {
                hash.push("/mm");
                if (state.metallicMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.roughnessMap) {
                hash.push("/rm");
                if (state.roughnessMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.metallicRoughnessMap) {
                hash.push("/mrm");
                if (state.metallicRoughnessMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.emissiveMap) {
                hash.push("/em");
                if (state.emissiveMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.occlusionMap) {
                hash.push("/ocm");
                if (state.occlusionMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.alphaMap) {
                hash.push("/am");
                if (state.alphaMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.normalMap) {
                hash.push("/nm");
                if (state.normalMap.matrix) {
                    hash.push("/mat");
                }
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _destroy: function () {
            this._super();
            this._state.destroy();
        }
    });

})();