/**
 A **SpecularMaterial** is a physically-based {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 {{#crossLink "Entity"}}Entities{{/crossLink}} using the *specular-glossiness* workflow.

 ## Examples

 | <a href="../../examples/#importing_gltf_pbr"><img src="../../assets/images/screenshots/SpecularMaterial/telephone.png"></img></a> | <a href="../../examples/#materials_specular_samples"><img src="../../assets/images/screenshots/SpecularMaterial/materials.png"></img></a> | <a href="../../examples/#materials_specular_textures"><img src="../../assets/images/screenshots/SpecularMaterial/textures.png"></img></a> | <a href="../../examples/#materials_specular_specularVsGlossiness"><img src="../../assets/images/screenshots/SpecularMaterial/specVsGloss.png"></img></a> |
 |:------:|:----:|:-----:|:-----:|
 |[glTF models with PBR materials](../../examples/#importing_gltf_pbr)|[Sample materials ](../../examples/#materials_specular_samples) | [Texturing spec/gloss channels](../../examples/#materials_specular_textures) | [Specular Vs. glossiness](../../examples/#materials_specular_specularVsGlossiness) |

 ## Overview

 * SpecularMaterial is usually used for insulators, such as ceramic, wood and plastic.
 * {{#crossLink "MetallicMaterial"}}{{/crossLink}} is usually used for conductive materials, such as metal.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} is usually used for non-realistic objects.

 <img src="../../../assets/images/SpecularMaterial.png"></img>

 For an introduction to PBR concepts, try these articles:

 * Joe Wilson's [Basic Theory of Physically-Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
 * Jeff Russel's [Physically-based Rendering, and you can too!](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)
 * Sebastien Legarde's [Adapting a physically-based shading model](http://seblagarde.wordpress.com/tag/physically-based-rendering/)

 The following table summarizes SpecularMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 |  {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the diffuse color of the material. |
 |  {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the specular color of the material. |
 | {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The glossiness the material. |
 | {{#crossLink "SpecularMaterial/specularF0:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The specularF0 of the material surface. |
 |  {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the emissive color of the material. |
 | {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/specularMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | sRGB | Texture RGB components multiplying by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}}. If the fourth component (A) is present, it multiplies by {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first three components multiplying by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and fourth component multiplying by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with RGB components multiplying by {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/opacityMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Texture with first component multiplying by {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}}. |
 | {{#crossLink "SpecularMaterial/occlusionMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Ambient occlusion texture multiplying by surface's reflected diffuse and specular light. |
 | {{#crossLink "SpecularMaterial/normalMap:property"}}{{/crossLink}} | {{#crossLink "Texture"}}{{/crossLink}} |  | null | linear | Tangent-space normal map. |


 ## Usage

 In the example below we'll create the plastered sphere shown in the [Sample Materials](../../examples/#materials_specular_textures) example (see screenshots above).

 Here's a closeup of the sphere we'll create:

 <a href="../../examples/#materials_specular_samples"><img src="../../assets/images/screenshots/SpecularMaterial/plaster.png"></img></a>

 Our plastered sphere {{#crossLink "Entity"}}{{/crossLink}} has:

 * a {{#crossLink "SphereGeometry"}}{{/crossLink}},
 * a {{#crossLink "Lights"}}{{/crossLink}} containing {{#crossLink "DirLight"}}DirLights{{/crossLink}}, plus {{#crossLink "CubeTexture"}}CubeTextures{{/crossLink}} for light and reflection maps, and
 * a SpecularMaterial with {{#crossLink "Texture"}}Textures{{/crossLink}} providing diffuse, glossiness, specular and normal maps.

 Note that in this example we're providing separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}
 channels, which allows us a little creative flexibility. Then, in the next example further down, we'll combine those channels
 within the same {{#crossLink "Texture"}}{{/crossLink}} for efficiency.

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

    material: new xeogl.SpecularMaterial({

        // Channels with default values, just to show them

        diffuse: [1.0, 1.0, 1.0],
        specular: [1.0, 1.0, 1.0],
        glossiness: 1.0,
        emissive: [0.0, 0.0, 0.0]
        opacity: 1.0,

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
 ````

 ### Combining channels within the same textures

 In the previous example we provided separate {{#crossLink "Texture"}}Textures{{/crossLink}} for the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and
 {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} channels, but we can combine those channels into the same {{#crossLink "Texture"}}{{/crossLink}} to reduce download time, memory footprint and rendering time (and also for glTF compatibility).

 Here's our SpecularMaterial again with those channels combined in the
 {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} {{#crossLink "Texture"}}Texture{{/crossLink}}, where the
 *RGB* component multiplies by {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} and *A* multiplies by {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}}.

 ````javascript
 new xeogl.SpecularMaterial({

    // Default values
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    glossiness: 1.0,
    emissive: [0.0, 0.0, 0.0]
    opacity: 1.0,

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

 Although not shown in this example, we can also texture {{#crossLink "MetallicMaterial/opacity:property"}}{{/crossLink}} with
 the *A* component of {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}}'s {{#crossLink "Texture"}}{{/crossLink}},
 if required.

 @class SpecularMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material

 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this SpecularMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted

 @param [cfg] {*} The SpecularMaterial configuration

 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.

 @param [cfg.meta=null] {String:Object} Metadata to attach to this SpecularMaterial.

 @param [cfg.diffuse=[1,1,1]] {Float32Array}  RGB diffuse color of this SpecularMaterial. Multiplies by the RGB
 components of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

 @param [cfg.diffuseMap=undefined] {Texture} RGBA {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color
 of this SpecularMaterial, with optional *A* component for opacity. The RGB components multiply by the
 {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} property,
 while the *A* component, if present, multiplies by the {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} property.

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

 @param [cfg.opacity=1.0] {Number} Factor in the range 0..1 indicating how transparent this SpecularMaterial is.
 A value of 0.0 indicates fully transparent, 1.0 is fully opaque. Multiplies by the *R* component of
 {{#crossLink "SpecularMaterial/opacityMap:property"}}{{/crossLink}} and the *A* component, if present, of
 {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}. Attached {{#crossLink "Entity"}}Entities{{/crossLink}}
 will appear transparent only if they are also attached to {{#crossLink "Modes"}}Modes{{/crossLink}} that
 have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} set to **true**.

 @param [cfg.opacityMap=undefined] {Texture} RGB {{#crossLink "Texture"}}{{/crossLink}} containing this SpecularMaterial's
 opacity in its *R* component. The *R* component multiplies by the {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} property. Must
 be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

 */
(function () {

    "use strict";

    xeogl.SpecularMaterial = xeogl.Material.extend({

        type: "xeogl.SpecularMaterial",

        _init: function (cfg) {

            this._state = new xeogl.renderer.SpecularMaterial({
                type: "SpecularMaterial",
                diffuse: xeogl.math.vec4([1.0, 1.0, 1.0]),
                emissive: xeogl.math.vec4([0.0, 0.0, 0.0]),
                specular: xeogl.math.vec4([1.0, 1.0, 1.0]),
                glossiness: 1.0,
                specularF0: 0.0,
                opacity: 1.0,

                diffuseMap: null,
                emissiveMap: null,
                specularMap: null,
                glossinessMap: null,
                specularGlossinessMap: null,
                occlusionMap: null,
                opacityMap: null,
                normalMap: null,

                hash: null
            });

            this._hashDirty = true;

            this.on("dirty", function () {

                // This SpecularMaterial is flagged dirty when a
                // child component fires "dirty", which always
                // means that a shader recompile will be needed.

                this._hashDirty = true;
            }, this);

            this.diffuse = cfg.diffuse;
            this.specular = cfg.specular;
            this.glossiness = cfg.glossiness;
            this.specularF0 = cfg.specularF0;
            this.emissive = cfg.emissive;
            this.opacity = cfg.opacity;

            if (cfg.diffuseMap) {
                this.diffuseMap = cfg.diffuseMap;
            }

            if (cfg.emissiveMap) {
                this.emissiveMap = cfg.emissiveMap;
            }

            if (cfg.specularMap) {
                this.specularMap = cfg.specularMap;
            }

            if (cfg.glossinessMap) {
                this.glossinessMap = cfg.glossinessMap;
            }

            if (cfg.specularGlossinessMap) {
                this.specularGlossinessMap = cfg.specularGlossinessMap;
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
             RGB diffuse color of this SpecularMaterial.

             Multiplies by the *RGB* components of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "SpecularMaterial/diffuse:event"}}{{/crossLink}} event on change.

             @property diffuse
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            diffuse: {

                set: function (value) {

                    var diffuse = this._state.diffuse;

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

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} property changes.
                     *
                     * @event diffuse
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("diffuse", this._state.diffuse);
                },

                get: function () {
                    return this._state.diffuse;
                }
            },

            /**
             RGB {{#crossLink "Texture"}}{{/crossLink}} containing the diffuse color of this SpecularMaterial, with optional *A* component for opacity.

             The *RGB* components multiply by the {{#crossLink "SpecularMaterial/diffuse:property"}}{{/crossLink}} property,
             while the *A* component, if present, multiplies by the {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} property.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/diffuseMap:event"}}{{/crossLink}} event on change.

             @property diffuseMap
             @default undefined
             @type {Texture}
             */
            diffuseMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}} property changes.

                     @event diffuseMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "diffuseMap", texture);
                },

                get: function () {
                    return this._attached.diffuseMap;
                }
            },

            /**
             RGB specular color of this SpecularMaterial.

             Multiplies by the {{#crossLink "SpecularMaterial/specularMap:property"}}{{/crossLink}}
             and the *A* component of {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "SpecularMaterial/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            specular: {

                set: function (value) {

                    var specular = this._state.specular;

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

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property changes.

                     @event specular
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("specular", this._state.specular);
                },

                get: function () {
                    return this._state.specular;
                }
            },

            /**
             RGB texture containing the specular color of this SpecularMaterial.

             Multiplies by the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/specularMap:event"}}{{/crossLink}} event on change.

             @property specularMap
             @default undefined
             @type {Texture}
             */
            specularMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} property changes.

                     @event specularMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "specularMap", texture);
                },

                get: function () {
                    return this._attached.specularMap;
                }
            },

            /**
             RGBA texture containing this SpecularMaterial's specular color in its *RGB* components and glossiness in its *A* component.

             The *RGB* components multiply by the {{#crossLink "SpecularMaterial/specular:property"}}{{/crossLink}} property, while
             the *A* component multiplies by the {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/specularGlossinessMap:event"}}{{/crossLink}} event on change.

             @property specularGlossinessMap
             @default undefined
             @type {Texture}
             */
            specularGlossinessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}} property changes.

                     @event specularGlossinessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "specularGlossinessMap", texture);
                },

                get: function () {
                    return this._attached.specularGlossinessMap;
                }
            },

            /**
             Factor in the range [0..1] indicating how glossy this SpecularMaterial is.

             0 is no glossiness, 1 is full glossiness.

             Multiplies by the *R* component of {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}}
             and the *A* component of {{#crossLink "SpecularMaterial/specularGlossinessMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "SpecularMaterial/glossiness:event"}}{{/crossLink}} event on change.

             @property glossiness
             @default 1.0
             @type Number
             */
            glossiness: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.glossiness === value) {
                        return;
                    }

                    this._state.glossiness = value;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property changes.
                     *
                     * @event glossiness
                     * @param value {Number} The property's new value
                     */
                    this.fire("glossiness", this._state.glossiness);
                },

                get: function () {
                    return this._state.glossiness;
                }
            },

            /**
             RGB texture containing this SpecularMaterial's glossiness in its *R* component.

             The *R* component multiplies by the {{#crossLink "SpecularMaterial/glossiness:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/glossinessMap:event"}}{{/crossLink}} event on change.

             @property glossinessMap
             @default undefined
             @type {Texture}
             */
            glossinessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/glossinessMap:property"}}{{/crossLink}} property changes.

                     @event glossinessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "glossinessMap", texture);
                },

                get: function () {
                    return this._attached.glossinessMap;
                }
            },

            /**
             Factor in the range [0..1] indicating amount of specular Fresnel.

             Fires a {{#crossLink "SpecularMaterial/specularF0:event"}}{{/crossLink}} event on change.

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
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/specularF0:property"}}{{/crossLink}} property changes.

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
             RGB emissive color of this SpecularMaterial.

             Multiplies by {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "SpecularMaterial/emissive:event"}}{{/crossLink}} event on change.

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
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} property changes.

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
             RGB texture containing the emissive color of this SpecularMaterial.

             Multiplies by the {{#crossLink "SpecularMaterial/emissive:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/emissiveMap:event"}}{{/crossLink}} event on change.

             @property emissiveMap
             @default undefined
             @type {Texture}
             */
            emissiveMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/emissiveMap:property"}}{{/crossLink}} property changes.

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
             Factor in the range [0..1] indicating how transparent this SpecularMaterial is.

             A value of 0.0 is fully transparent, while 1.0 is fully opaque.

             Multiplies by the *R* component of {{#crossLink "SpecularMaterial/opacityMap:property"}}{{/crossLink}} and
             the *A* component, if present, of {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             Fires an {{#crossLink "SpecularMaterial/opacity:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} property changes.
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
             RGB {{#crossLink "Texture"}}{{/crossLink}} with opacity in its *R* component.

             The *R* component multiplies by the {{#crossLink "SpecularMaterial/opacity:property"}}{{/crossLink}} property.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires an {{#crossLink "SpecularMaterial/opacityMap:event"}}{{/crossLink}} event on change.

             @property opacityMap
             @default undefined
             @type {Texture}
             */
            opacityMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/opacityMap:property"}}{{/crossLink}} property changes.

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
             RGB tangent-space normal {{#crossLink "Texture"}}{{/crossLink}} attached to this SpecularMaterial.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

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
            },

            /**
             RGB ambient occlusion {{#crossLink "Texture"}}{{/crossLink}} attached to this SpecularMaterial.

             Within shaders, multiplies by the specular and diffuse light reflected by surfaces.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpecularMaterial.

             Fires a {{#crossLink "SpecularMaterial/occlusionMap:event"}}{{/crossLink}} event on change.

             @property occlusionMap
             @default undefined
             @type {Texture}
             */
            occlusionMap: {

                set: function (texture) {

                    /**
                     Fired whenever this SpecularMaterial's {{#crossLink "SpecularMaterial/occlusionMap:property"}}{{/crossLink}} property changes.

                     @event occlusionMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "occlusionMap", texture);
                },

                get: function () {
                    return this._attached.occlusionMap;
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

            var hash = ["/spe"];

            if (state.diffuseMap) {
                hash.push("/dm");
                if (state.diffuseMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.emissiveMap) {
                hash.push("/em");
                if (state.emissiveMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.glossinessMap) {
                hash.push("/gm");
                if (state.glossinessMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.specularMap) {
                hash.push("/sm");
                if (state.specularMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.specularGlossinessMap) {
                hash.push("/sgm");
                if (state.specularGlossinessMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.occlusionMap) {
                hash.push("/ocm");
                if (state.occlusionMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.normalMap) {
                hash.push("/nm");
                if (state.normalMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.opacityMap) {
                hash.push("/opm");
                if (state.opacityMap.matrix) {
                    hash.push("/mat");
                }
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var json = {
                diffuse: this._state.diffuse.slice(),
                specular: this._state.specular.slice(),
                glossiness: this._state.glossiness,
                specularF0: this._state.specularF0,
                emissive: this._state.emissive.slice(),
                opacity: this._state.opacity
            };

            var components = this._attached;

            if (components.diffuseMap) {
                json.diffuseMap = components.diffuseMap.id;
            }

            if (components.emissiveMap) {
                json.emissiveMap = components.emissiveMap.id;
            }

            if (components.specularMap) {
                json.specularMap = components.specularMap.id;
            }

            if (components.glossinessMap) {
                json.glossinessMap = components.glossinessMap.id;
            }

            if (components.specularGlossinessMap) {
                json.specularGlossinessMap = components.specularGlossinessMap.id;
            }

            if (components.occlusionMap) {
                json.occlusionMap = components.occlusionMap.id;
            }

            if (components.opacityMap) {
                json.opacityMap = components.opacityMap.id;
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