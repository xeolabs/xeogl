/**

 A **PhongMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 attached {{#crossLink "Entity"}}Entities{{/crossLink}} using
 the <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> lighting model.

 ## Overview

 * PhongMaterial properties, along with {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}},
 {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} and {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}},
 specify attributes that are to be **applied uniformly** across the surface of attached {{#crossLink "Geometry"}}Geometries{{/crossLink}}.
 * Most of those attributes can be textured, **effectively replacing the values set for those properties**, by
 assigning {{#crossLink "Texture"}}Textures{{/crossLink}} to the PhongMaterial's
 {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}},
 {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/opacityMap:property"}}{{/crossLink}}
 and  {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}} properties.
 * For example, the value of {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} will be ignored if your
 PhongMaterial also has a {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} set to a {{#crossLink "Texture"}}Texture{{/crossLink}}.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface, ie. they are not multiplied by
 the {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} for each pixel, as is done in many shading systems.
 * When the {{#crossLink "Entity"}}{{/crossLink}}'s {{#crossLink "Geometry"}}{{/crossLink}} has a
 {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines" or "points" then only the {{#crossLink "PhongMaterial"}}{{/crossLink}}'s
 {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}},
 {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} and {{#crossLink "PhongMaterial/opacityMap:property"}}{{/crossLink}}
 will actually be applied, since those primitive types cannot be shaded.

 <img src="../../../assets/images/PhongMaterial.png"></img>

 ## Usage

 In this example we have an Entity with

 * a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},
 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies a {{#crossLink "Texture"}}{{/crossLink}} as a diffuse map and a specular {{#crossLink "Fresnel"}}{{/crossLink}}, and
 * a {{#crossLink "TorusGeometry"}}{{/crossLink}}.

 Note that xeogl will ignore the PhongMaterial's {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}
 property, since we assigned the {{#crossLink "Texture"}}{{/crossLink}} to the PhongMaterial's
 {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} property. The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel
 colors directly provide the diffuse color of each fragment across the {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var entity = new xeogl.Entity({

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
        opacity: 1.0 // Default
    }),

    geometry: new xeogl.TorusGeometry()
});
 ````

 @class PhongMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PhongMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PhongMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this PhongMaterial.
 @param [cfg.ambient=[0.7, 0.7, 0.8 ]] {Array of Number} PhongMaterial ambient color.
 @param [cfg.diffuse=[ 1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial diffuse color.
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial specular color.
 @param [cfg.emissive=[ 0.0, 0.0, 0.0 ]] {Array of Number} PhongMaterial emissive color.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque.
 Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.shininess=80] {Number} Scalar in range 0-128 that determines the size and sharpness of specular highlights.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.lineWidth=1] {Number} Scalar that controls the width of lines for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines".
 @param [cfg.pointSize=1] {Number} Scalar that controls the size of points for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "points".
 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the diffuse property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.normalMap=null] {Texture} A normal map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.opacityMap=null] {Texture} An opacity map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the opacity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.reflectivityMap=null] {Texture} A reflectivity control map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the reflectivity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.diffuseFresnel=null] {Fresnel} A diffuse {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}.
 @param [cfg.specularFresnel=null] {Fresnel} A specular {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}.
 @param [cfg.emissiveFresnel=null] {Fresnel} An emissive {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}.
 @param [cfg.opacityFresnel=null] {Fresnel} An opacity {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}.
 @param [cfg.reflectivityFresnel=null] {Fresnel} A reflectivity {{#crossLink "Fresnel"}}Fresnel{{/crossLink}}.
 */
(function () {

    "use strict";

    xeogl.PhongMaterial = xeogl.Material.extend({

        type: "xeogl.PhongMaterial",

        _init: function (cfg) {

            this._state = new xeogl.renderer.PhongMaterial({

                type: "phongMaterial",

                ambient: xeogl.math.vec3([1.0, 1.0, 1.0]),
                diffuse: xeogl.math.vec3([1.0, 1.0, 1.0]),
                specular: xeogl.math.vec3([1.0, 1.0, 1.0]),
                emissive: xeogl.math.vec3([0.0, 0.0, 0.0]),

                opacity: 1.0,
                shininess: 30.0,
                reflectivity: 1.0,

                lineWidth: 1.0,
                pointSize: 1.0,

                ambientMap: null,
                normalMap: null,
                diffuseMap: null,
                specularMap: null,
                emissiveMap: null,
                opacityMap: null,
                reflectivityMap: null,

                diffuseFresnel: null,
                specularFresnel: null,
                emissiveFresnel: null,
                opacityFresnel: null,
                reflectivityFresnel: null,

                hash: null
            });

            this._hashDirty = true;

            this.on("dirty", function () {

                // This PhongMaterial is flagged dirty when a
                // child component fires "dirty", which always
                // means that a shader recompile will be needed.

                this._hashDirty = true;
            }, this);

            this.ambient = cfg.ambient;
            this.diffuse = cfg.diffuse;
            this.specular = cfg.specular;
            this.emissive = cfg.emissive;

            this.opacity = cfg.opacity;
            this.shininess = cfg.shininess;
            this.reflectivity = cfg.reflectivity;

            this.lineWidth = cfg.lineWidth;
            this.pointSize = cfg.pointSize;

            this.ambientMap = cfg.ambientMap;
            this.diffuseMap = cfg.diffuseMap;
            this.specularMap = cfg.specularMap;
            this.emissiveMap = cfg.emissiveMap;
            this.opacityMap = cfg.opacityMap;
            this.reflectivityMap = cfg.reflectivityMap;
            this.normalMap = cfg.normalMap;

            this.diffuseFresnel = cfg.diffuseFresnel;
            this.specularFresnel = cfg.specularFresnel;
            this.emissiveFresnel = cfg.emissiveFresnel;
            this.opacityFresnel = cfg.opacityFresnel;
            this.reflectivityFresnel = cfg.reflectivityFresnel;
        },

        _props: {

            /**
             The PhongMaterial's ambient color.

             Fires a {{#crossLink "PhongMaterial/ambient:event"}}{{/crossLink}} event on change.

             @property ambient
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            ambient: {

                set: function (value) {

                    this._state.ambient.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} property changes.
                     *
                     * @event ambient
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("ambient", this._state.ambient);
                },

                get: function () {
                    return this._state.ambient;
                }
            },

            /**
             The PhongMaterial's diffuse color.

             This property may be overridden by {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PhongMaterial/diffuse:event"}}{{/crossLink}} event on change.

             @property diffuse
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            diffuse: {

                set: function (value) {

                    this._state.diffuse.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} property changes.
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
             The material's specular color.

             This property may be overridden by {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PhongMaterial/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            specular: {

                set: function (value) {

                    this._state.specular.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} property changes.

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
             The PhongMaterial's emissive color.

             This property may be overridden by {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PhongMaterial/emissive:event"}}{{/crossLink}} event on change.

             @property emissive
             @default [0.0, 0.0, 0.0]
             @type Float32Array
             */
            emissive: {

                set: function (value) {

                    this._state.emissive.set(value || [0.0, 0.0, 0.0]);

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} property changes.

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
             Factor in the range [0..1] indicating how transparent the PhongMaterial is.

             A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             This property may be overridden by {{#crossLink "PhongMaterial/opacityMap:property"}}{{/crossLink}}.

             Fires an {{#crossLink "PhongMaterial/opacity:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} property changes.
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
             A factor in range [0..128] that determines the size and sharpness of the specular highlights create by this PhongMaterial.

             Larger values produce smaller, sharper highlights. A value of 0.0 gives very large highlights that are almost never
             desirable. Try values close to 10 for a larger, fuzzier highlight and values of 100 or more for a small, sharp
             highlight.

             Fires a {{#crossLink "PhongMaterial/shininess:event"}}{{/crossLink}} event on change.

             @property shininess
             @default 80.0
             @type Number
             */
            shininess: {

                set: function (value) {

                    this._state.shininess = value !== undefined ? value : 80;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/shininess:property"}}{{/crossLink}} property changes.

                     @event shininess
                     @param value Number The property's new value
                     */
                    this.fire("shininess", this._state.shininess);
                },

                get: function () {
                    return this._state.shininess;
                }
            },

            /**
             The PhongMaterial's line width.

             Fires a {{#crossLink "PhongMaterial/lineWidth:event"}}{{/crossLink}} event on change.

             @property lineWidth
             @default 1.0
             @type Number
             */
            lineWidth: {

                set: function (value) {

                    this._state.lineWidth = value || 1.0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/lineWidth:property"}}{{/crossLink}} property changes.
                     *
                     * @event lineWidth
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("lineWidth", this._state.lineWidth);
                },

                get: function () {
                    return this._state.lineWidth;
                }
            },

            /**
             The PhongMaterial's point size.

             Fires a {{#crossLink "PhongMaterial/pointSize:event"}}{{/crossLink}} event on change.

             @property pointSize
             @default 1.0
             @type Number
             */
            pointSize: {

                set: function (value) {

                    this._state.pointSize = value || 1.0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/pointSize:property"}}{{/crossLink}} property changes.
                     *
                     * @event pointSize
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("pointSize", this._state.pointSize);
                },

                get: function () {
                    return this._state.pointSize;
                }
            },

            /**
             Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected by this PhongMaterial.

             The surface will be non-reflective when this is 0, and completely mirror-like when it is 1.0.

             This property may be overridden by {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PhongMaterial/reflectivity:event"}}{{/crossLink}} event on change.

             @property reflectivity
             @default 1.0
             @type Number
             */
            reflectivity: {

                set: function (value) {

                    this._state.reflectivity = value !== undefined ? value : 1.0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}} property changes.

                     @event reflectivity
                     @param value Number The property's new value
                     */
                    this.fire("reflectivity", this._state.reflectivity);
                },

                get: function () {
                    return this._state.reflectivity;
                }
            },

            /**
             A normal {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/normalMap:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/normalMap:event"}}{{/crossLink}} event on change.

             @property normalMap
             @default null
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
             An ambient {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/ambientMap:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/ambientMap:event"}}{{/crossLink}} event on change.

             @property ambientMap
             @default null
             @type {Texture}
             */
            ambientMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/ambientMap:property"}}{{/crossLink}} property changes.

                     @event ambientMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "ambientMap", texture);
                },

                get: function () {
                    return this._attached.ambientMap;
                }
            },

            /**
             A diffuse {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/diffuseMap:event"}}{{/crossLink}} event on change.

             @property diffuseMap
             @default null
             @type {Texture}
             */
            diffuseMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} property changes.

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
             A specular {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/specularMap:event"}}{{/crossLink}} event on change.

             @property specularMap
             @default null
             @type {Texture}
             */
            specularMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}} property changes.

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
             An emissive {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} when not null or undefined.

             Fires an {{#crossLink "PhongMaterial/emissiveMap:event"}}{{/crossLink}} event on change.

             @property emissiveMap
             @default null
             @type {Texture}
             */
            emissiveMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}} property changes.

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
             An opacity {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} when not null or undefined.

             Fires an {{#crossLink "PhongMaterial/opacityMap:event"}}{{/crossLink}} event on change.

             @property opacityMap
             @default null
             @type {Texture}
             */
            opacityMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/opacityMap:property"}}{{/crossLink}} property changes.

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
             A reflectivity {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/reflectivityMap:event"}}{{/crossLink}} event on change.

             @property reflectivityMap
             @default null
             @type {Texture}
             */
            reflectivityMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}} property changes.

                     @event reflectivityMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "reflectivityMap", texture);
                },

                get: function () {
                    return this._attached.reflectivityMap;
                }
            },

            /**
             A reflection {{#crossLink "CubeMap"}}{{/crossLink}} attached to this PhongMaterial.

             Fires a {{#crossLink "PhongMaterial/reflection:event"}}{{/crossLink}} event on change.

             @property reflection
             @default null
             @type {Reflect}
             */
            reflection: {

                set: function (cubeMap) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}} property changes.

                     @event reflection
                     @param value {Reflect} The property's new value
                     */
                    this._attachComponent("xeogl.Reflect", "reflection", cubeMap);
                },

                get: function () {
                    return this._attached.reflection;
                }
            },

            /**
             A diffuse {{#crossLink "Fresnel"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/diffuseFresnel:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/diffuseFresnel:event"}}{{/crossLink}} event on change.

             @property diffuseFresnel
             @default null
             @type {Fresnel}
             */
            diffuseFresnel: {

                set: function (fresnel) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} property changes.

                     @event diffuseFresnel
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Fresnel", "diffuseFresnel", fresnel);
                },

                get: function () {
                    return this._attached.diffuseFresnel;
                }
            },

            /**
             A specular {{#crossLink "Fresnel"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/specularFresnel:event"}}{{/crossLink}} event on change.

             @property specularFresnel
             @default null
             @type {Fresnel}
             */
            specularFresnel: {

                set: function (fresnel) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/specularFresnel:property"}}{{/crossLink}} property changes.

                     @event specularFresnel
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Fresnel", "specularFresnel", fresnel);
                },

                get: function () {
                    return this._attached.specularFresnel;
                }
            },

            /**
             An emissive {{#crossLink "Fresnel"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} when not null or undefined.

             Fires an {{#crossLink "PhongMaterial/emissiveFresnel:event"}}{{/crossLink}} event on change.

             @property emissiveFresnel
             @default null
             @type {Fresnel}
             */
            emissiveFresnel: {

                set: function (fresnel) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/emissiveFresnel:property"}}{{/crossLink}} property changes.

                     @event emissiveFresnel
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Fresnel", "emissiveFresnel", fresnel);
                },

                get: function () {
                    return this._attached.emissiveFresnel;
                }
            },

            /**
             An opacity {{#crossLink "Fresnel"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} when not null or undefined.

             Fires an {{#crossLink "PhongMaterial/opacityFresnel:event"}}{{/crossLink}} event on change.

             @property opacityFresnel
             @default null
             @type {Fresnel}
             */
            opacityFresnel: {

                set: function (fresnel) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/opacityFresnel:property"}}{{/crossLink}} property changes.

                     @event opacityFresnel
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Fresnel", "opacityFresnel", fresnel);
                },

                get: function () {
                    return this._attached.opacityFresnel;
                }
            },

            /**
             A reflectivity {{#crossLink "Fresnel"}}{{/crossLink}} attached to this PhongMaterial.

             This property overrides {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/reflectivityFresnel:event"}}{{/crossLink}} event on change.

             @property reflectivityFresnel
             @default null
             @type {Fresnel}
             */
            reflectivityFresnel: {

                set: function (fresnel) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/reflectivityFresnel:property"}}{{/crossLink}} property changes.

                     @event reflectivityFresnel
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Fresnel", "reflectivityFresnel", fresnel);
                },

                get: function () {
                    return this._attached.reflectivityFresnel;
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

            var hash = ["/p"]; // 'P' for Phong

            if (state.normalMap) {
                hash.push("/b");
                if (state.normalMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.ambientMap) {
                hash.push("/a");
                if (state.ambientMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.diffuseMap) {
                hash.push("/d");
                if (state.diffuseMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.specularMap) {
                hash.push("/s");
                if (state.specularMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.emissiveMap) {
                hash.push("/e");
                if (state.emissiveMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.opacityMap) {
                hash.push("/o");
                if (state.opacityMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.reflectivityMap) {
                hash.push("/r");
                if (state.reflectivityMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.diffuseFresnel) {
                hash.push("/df");
            }

            if (state.specularFresnel) {
                hash.push("/sf");
            }

            if (state.emissiveFresnel) {
                hash.push("/ef");
            }

            if (state.opacityFresnel) {
                hash.push("/of");
            }

            if (state.reflectivityFresnel) {
                hash.push("/rf");
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var json = {

                // Colors

                ambient: this._state.ambient,
                diffuse: this._state.diffuse,
                specular: this._state.specular,
                emissive: this._state.emissive
            };

            if (this._state.opacity !== 1.0) {
                json.opacity = this._state.opacity;
            }

            if (this._state.shininess !== 80.0) {
                json.shininess = this._state.shininess;
            }

            if (this._state.reflectivity !== 1.0) {
                json.reflectivity = this._state.reflectivity;
            }


            // Lines and points

            if (this._state.lineWidth !== 1.0) {
                json.lineWidth = this._state.lineWidth;
            }

            if (this._state.pointSize !== 1.0) {
                json.pointSize = this._state.pointSize;
            }

            // Textures

            var components = this._attached;

            if (components.normalMap) {
                json.normalMap = components.normalMap.id;
            }

            if (components.ambientMap) {
                json.ambientMap = components.ambientMap.id;
            }

            if (components.diffuseMap) {
                json.diffuseMap = components.diffuseMap.id;
            }

            if (components.specularMap) {
                json.specularMap = components.specularMap.id;
            }

            if (components.emissiveMap) {
                json.emissiveMap = components.emissiveMap.id;
            }

            if (components.opacityMap) {
                json.opacityMap = components.opacityMap.id;
            }

            if (components.reflectivityMap) {
                json.reflectivityMap = components.reflectivityMap.id;
            }

            if (components.diffuseFresnel) {
                json.diffuseFresnel = components.diffuseFresnel.id;
            }

            if (components.specularFresnel) {
                json.specularFresnel = components.specularFresnel.id;
            }

            if (components.emissiveFresnel) {
                json.emissiveFresnel = components.emissiveFresnel.id;
            }

            if (components.opacityFresnel) {
                json.opacityFresnel = components.opacityFresnel.id;
            }

            if (components.reflectivityFresnel) {
                json.reflectivityFresnel = components.reflectivityFresnel.id;
            }

            return json;
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
