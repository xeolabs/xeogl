/**
 A **MetallicMaterial** is a physically-based {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 {{#crossLink "Entity"}}Entities{{/crossLink}} using the *metallic-roughness* workflow.

 ## Examples

 | <a href="../../examples/#importing_gltf_PBR"><img src="../../assets/images/screenshots/MetallicMaterial/helmet.png"></img></a> | <a href="../../examples/#materials_metallic_FireHydrant"><img src="../../assets/images/screenshots/MetallicMaterial/hydrant3.png"></img></a> | <a href="../../examples/#materials_metallic_materials_metals"><img src="../../assets/images/screenshots/MetallicMaterial/metals.png"></img></a> | <a href="../../examples/#materials_metallic_metallicVsRoughness"><img alt="Metallic Vs Roughness" src="../../assets/images/screenshots/MetallicMaterial/metalVsRough.png"></img></a> |
 |:------:|:----:|:-----:|:-----:|
 |[glTF models with PBR materials](../../examples/#importing_gltf_PBR)|[Fire hydrant model](../../examples/#materials_metallic_FireHydrant)| [Sample metal materials ](../../examples/#materials_metallic_materials_metals)|[Metallic Vs. roughness](../../examples/#materials_metallic_metallicVsRoughness)|

 ## Overview

 * MetallicMaterial is usually used for conductive materials, such as metal.
 * {{#crossLink "SpecularMaterial"}}{{/crossLink}} is usually used for conductors, such as wood, ceramics and plastic.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} is usually used for non-realistic objects.

 <img src="../../../assets/images/MetallicMaterial.png"></img>

 For an introduction to PBR concepts, try these articles:

 * Joe Wilson's [Basic Theory of Physically-Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
 * Jeff Russel's [Physically-based Rendering, and you can too!](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)
 * Sebastien Legarde's [Adapting a physically-based shading model](http://seblagarde.wordpress.com/tag/physically-based-rendering/)

 The following table summarizes MetallicMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 |  {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the base color of the material. |
 | {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The metallic-ness the material (1 for metals, 0 for non-metals). |
 | {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The roughness of the material surface. |
 | {{#crossLink "MetallicMaterial/specularF0:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The specular Fresnel of the material surface. |
 |  {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the emissive color of the material. |
 | {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/metallicMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/roughnessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/metallicRoughnessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and second component multiplying by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with RGB components multiplying by {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/opacityMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}}. |
 | {{#crossLink "MetallicMaterial/occlusionMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Ambient occlusion texture multiplying by surface's reflected diffuse and specular light. |
 | {{#crossLink "SpecularMaterial/normalMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Tangent-space normal map. |


 ## Usage

 In the example below we'll create the [yellow fire hydrant](../../examples/#materials_metallic_FireHydrant) shown in the example screen shots above. Our hydrant {{#crossLink "Entity"}}{{/crossLink}} has:

 * a {{#crossLink "OBJGeometry"}}{{/crossLink}} which loads the fire hydrant mesh from an .OBJ file,
 * a {{#crossLink "Lights"}}{{/crossLink}} containing {{#crossLink "DirLight"}}DirLights{{/crossLink}}, plus {{#crossLink "CubeTexture"}}CubeTextures{{/crossLink}} for light and reflection maps, and
 * a MetallicMaterial with {{#crossLink "Texture"}}Textures{{/crossLink}} providing diffuse, metallic, roughness, occlusion and normal maps.

 Note that in this example we're providing separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}
 channels, which allows us a little creative flexibility. Then, in the next example further down, we'll combine those channels
 within the same {{#crossLink "Texture"}}{{/crossLink}}, which results in shorter download times, reduced memory
 footprint and faster rendering.

 ````javascript
 new xeogl.Entity({

    geometry: new xeogl.OBJGeometry({
        src: "models/obj/FireHydrantMesh.obj"
    }),

    lights: new xeogl.Lights({
        lights: [
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
            })
        ],
        lightMap: new xeogl.CubeTexture({
            src: [
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
                "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
            ]
        }),
        reflectionMap: new xeogl.CubeTexture({
            src: [
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
                "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
            ]
        })
    }),

    material: new xeogl.MetallicMaterial({

        // Channels with default values, just to show them

        baseColor: [1.0, 1.0, 1.0],
        metallic: 1.0,
        roughness: 1.0,
        emissive: [0.0, 0.0, 0.0],
        opacity: 1.0,

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
 ````

 ### Combining channels within the same textures

 In the previous example we provided separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and
 {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} channels, but we can combine those channels into the same {{#crossLink "Texture"}}{{/crossLink}} to reduce download time, memory footprint and rendering time (and also for glTF compatibility).

 Here's our MetallicMaterial again with those channels combined in the
 {{#crossLink "MetallicMaterial/metallicRoughnessMap:property"}}{{/crossLink}} {{#crossLink "Texture"}}Texture{{/crossLink}}, where the
 *R* component multiplies by {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} and *G* multiplies by {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}}.

 ````javascript
 new xeogl.MetallicMaterial({

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

 Although not shown in this example, we can also texture {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} with
 the *A* component of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}'s {{#crossLink "Texture"}}{{/crossLink}},
 if required.

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

 @param [cfg.opacity=1.0] {Number} Factor in the range 0..1 indicating how transparent this MetallicMaterial is.
 A value of 0.0 indicates fully transparent, 1.0 is fully opaque. Multiplies by the *R* component of
 {{#crossLink "MetallicMaterial/opacityMap:property"}}{{/crossLink}} and the *A* component, if present, of
 {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}. Attached {{#crossLink "Entity"}}Entities{{/crossLink}}
 will appear transparent only if they are also attached to {{#crossLink "Modes"}}Modes{{/crossLink}} that
 have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} set to **true**.

 @param [cfg.baseColorMap=undefined] {Texture} RGBA {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color
 of this MetallicMaterial, with optional *A* component for opacity. The RGB components multiply by the
 {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} property,
 while the *A* component, if present, multiplies by the {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} property.

 @param [cfg.opacityMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's
 opacity in its *R* component. The *R* component multiplies by the {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} property. Must
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

 */
(function () {

    "use strict";

    xeogl.MetallicMaterial = xeogl.Material.extend({

        type: "xeogl.MetallicMaterial",

        _init: function (cfg) {

            this._state = new xeogl.renderer.MetallicMaterial({
                type: "MetallicMaterial",

                baseColor: xeogl.math.vec4([1.0, 1.0, 1.0]),
                emissive: xeogl.math.vec4([0.0, 0.0, 0.0]),
                metallic: 1.0,
                roughness: 1.0,
                specularF0: 0.0,
                opacity: 1.0,

                baseColorMap: null,
                opacityMap: null,
                metallicMap: null,
                roughnessMap: null,
                metallicRoughnessMap: null,
                emissiveMap: null,
                occlusionMap: null,
                normalMap: null,

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
            this.opacity = cfg.opacity;

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

            if (cfg.opacityMap) {
                this.opacityMap = cfg.opacityMap;
            }

            if (cfg.normalMap) {
                this.normalMap = cfg.normalMap;
            }
        },

        _props: {

            /**
             RGB diffuse color of this MetallicMaterial.

             Multiplies by the RGB components of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "MetallicMaterial/baseColor:event"}}{{/crossLink}} event on change.

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

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} property changes.
                     *
                     * @event baseColor
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("baseColor", this._state.baseColor);
                },

                get: function () {
                    return this._state.baseColor;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color of this MetallicMaterial, with optional *A* component for opacity.

             The RGB components multiply by the {{#crossLink "MetallicMaterial/baseColor:property"}}{{/crossLink}} property,
             while the *A* component, if present, multiplies by the {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} property.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/baseColorMap:event"}}{{/crossLink}} event on change.

             @property baseColorMap
             @default undefined
             @type {Texture}
             */
            baseColorMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}} property changes.

                     @event baseColorMap
                     @param value Number The property's new value
                     */
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

             Fires a {{#crossLink "MetallicMaterial/metallic:event"}}{{/crossLink}} event on change.

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

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property changes.

                     @event metallic
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("metallic", this._state.metallic);
                },

                get: function () {
                    return this._state.metallic;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's metallic factor in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/metallicMap:event"}}{{/crossLink}} event on change.

             @property metallicMap
             @default undefined
             @type {Texture}
             */
            metallicMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/metallicMap:property"}}{{/crossLink}} property changes.

                     @event metallicMap
                     @param value Number The property's new value
                     */
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

             Fires a {{#crossLink "MetallicMaterial/roughness:event"}}{{/crossLink}} event on change.

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

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property changes.
                     *
                     * @event roughness
                     * @param value {Number} The property's new value
                     */
                    this.fire("roughness", this._state.roughness);
                },

                get: function () {
                    return this._state.roughness;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's roughness factor in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/roughnessMap:event"}}{{/crossLink}} event on change.

             @property roughnessMap
             @default undefined
             @type {Texture}
             */
            roughnessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/roughnessMap:property"}}{{/crossLink}} property changes.

                     @event roughnessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "roughnessMap", texture);
                },

                get: function () {
                    return this._attached.roughnessMap;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's metalness in its *R* component and roughness in its *G* component.

             Its *R* component multiplies by the {{#crossLink "MetallicMaterial/metallic:property"}}{{/crossLink}} property, while
             its *G* component multiplies by the {{#crossLink "MetallicMaterial/roughness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/metallicRoughnessMap:event"}}{{/crossLink}} event on change.

             @property metallicRoughnessMap
             @default undefined
             @type {Texture}
             */
            metallicRoughnessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/metallicRoughnessMap:property"}}{{/crossLink}} property changes.

                     @event metallicRoughnessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "metallicRoughnessMap", texture);
                },

                get: function () {
                    return this._attached.metallicRoughnessMap;
                }
            },

            /**
             Factor in the range [0..1] indicating specular Fresnel value.

             Fires a {{#crossLink "MetallicMaterial/specularF0:event"}}{{/crossLink}} event on change.

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

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/specularF0:property"}}{{/crossLink}} property changes.

                     @event specularF0
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("specularF0", this._state.specularF0);
                },

                get: function () {
                    return this._state.specularF0;
                }
            },

            /**
             RGB emissive color of this MetallicMaterial.

             Multiplies by {{#crossLink "MetallicMaterial/emissiveMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "MetallicMaterial/emissive:event"}}{{/crossLink}} event on change.

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

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} property changes.

                     @event emissive
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("emissive", this._state.emissive);
                },

                get: function () {
                    return this._state.emissive;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing the emissive color of this MetallicMaterial.

             Multiplies by the {{#crossLink "MetallicMaterial/emissive:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/emissiveMap:event"}}{{/crossLink}} event on change.

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

             Within shaders, multiplies by the specular and diffuse light reflected by surfaces.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "MetallicMaterial/occlusionMap:event"}}{{/crossLink}} event on change.

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
             Factor in the range [0..1] indicating how transparent this MetallicMaterial is.

             A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

             Multiplies by the *R* component of {{#crossLink "MetallicMaterial/opacityMap:property"}}{{/crossLink}} and
             the *A* component, if present, of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             Fires an {{#crossLink "MetallicMaterial/opacity:event"}}{{/crossLink}} event on change.

             @property opacity
             @default 1.0
             @type Number
             */
            opacity: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.opacity === value) {
                        return;
                    }

                    this._state.opacity = value;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} property changes.
                     *
                     * @event opacity
                     * @param value {Number} The property's new value
                     */
                    this.fire("opacity", this._state.opacity);
                },

                get: function () {
                    return this._state.opacity;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing this MetallicMaterial's opacity in its *R* component.

             The *R* component multiplies by the {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires an {{#crossLink "MetallicMaterial/opacityMap:event"}}{{/crossLink}} event on change.

             @property opacityMap
             @default undefined
             @type {Texture}
             */
            opacityMap: {

                set: function (texture) {

                    /**
                     Fired whenever this MetallicMaterial's {{#crossLink "MetallicMaterial/opacityMap:property"}}{{/crossLink}} property changes.

                     @event opacityMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "opacityMap", texture);
                },

                get: function () {
                    return this._attached.opacityMap;
                }
            },

            /**
             RGB tangent-space normal map {{#crossLink "Texture"}}{{/crossLink}}.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this MetallicMaterial.

             Fires a {{#crossLink "PhongMaterial/normalMap:event"}}{{/crossLink}} event on change.

             @property normalMap
             @default undefined
             @type {Texture}
             */
            normalMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/normalMap:property"}}{{/crossLink}} property changes.

                     @event normalMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "normalMap", texture);
                },

                get: function () {
                    return this._attached.normalMap;
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

        _compile: function () {

            if (this._hashDirty) {
                this._makeHash();
                this._hashDirty = false;
            }

            this._renderer.material = this._state;
        },

        _makeHash: function () {

            var state = this._state;

            var hash = ["/met"];

            if (state.baseColorMap) {
                hash.push("/bm");
                if (state.baseColorMap.matrix) {
                    hash.push("/mat");
                }
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

            if (state.opacityMap) {
                hash.push("/opm");
                if (state.opacityMap.matrix) {
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

        _getJSON: function () {

            var json = {
                baseColor: this._state.baseColor.slice(),
                metallic: this._state.metallic,
                roughness: this._state.roughness,
                specularF0: this._state.specularF0,
                emissive: this._state.emissive.slice(),
                opacity: this._state.opacity
            };

            var components = this._attached;

            if (components.baseColorMap) {
                json.baseColorMap = components.baseColorMap.id;
            }

            if (components.metallicMap) {
                json.metallicMap = components.metallicMap.id;
            }

            if (components.roughnessMap) {
                json.roughnessMap = components.roughnessMap.id;
            }

            if (components.metallicRoughnessMap) {
                json.metallicRoughnessMap = components.metallicRoughnessMap.id;
            }

            if (components.emissiveMap) {
                json.emissiveMap = components.emissiveMap.id;
            }

            if (components.occlusionMap) {
                json.occlusionMap = components.occlusionMap.id;
            }

            if (components.normalMap) {
                json.normalMap = components.normalMap.id;
            }

            return json;
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();