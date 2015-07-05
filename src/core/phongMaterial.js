/**
 A **PhongMaterial** defines the surface appearance of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>PhongMaterials interact with {{#crossLink "Lights"}}{{/crossLink}} using the <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model.</li>

 <li>These PhongMaterial properties, along with {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}},
 {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} and {{#crossLink "PhongMaterial/reflectivity:property"}}{{/crossLink}},
 specify attributes that are to be **applied uniformly** across the surface of attached {{#crossLink "Geometry"}}Geometries{{/crossLink}}.</li>

 <li>Most of those attributes can be textured, **effectively replacing the values set for those properties**, by
 assigning {{#crossLink "Texture"}}Textures{{/crossLink}} to the PhongMaterial's
 {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}},
 {{#crossLink "PhongMaterial/emissiveMap:property"}}{{/crossLink}}, {{#crossLink "PhongMaterial/opacityMap:property"}}{{/crossLink}}
 and  {{#crossLink "PhongMaterial/reflectivityMap:property"}}{{/crossLink}} properties.</li>

 <li>For example, the value of {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} will be ignored if your
 PhongMaterial also has a {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} set to a {{#crossLink "Texture"}}Texture{{/crossLink}}.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface, ie. they are not multiplied by
 the {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} for each pixel, as is done in many shading systems.</li>

 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that PhongMaterials create within xeoEngine's shaders.</li>

 </ul>

 <img src="../../../assets/images/PhongMaterial.png"></img>

 ## Example

 In this example we have

 <ul>
 <li>a {{#crossLink "Texture"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Fresnel"}}{{/crossLink}},</li>
 <li>a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}} as a diffuse map and the {{#crossLink "Fresnel"}}{{/crossLink}} as a specular Fresnel effect,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 Note that the value for the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}
 property is ignored and redundant, since we assign a {{#crossLink "Texture"}}{{/crossLink}} to the
 {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} property.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var scene = new XEO.Scene();

 var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
 });

 var fresnel = new XEO.Fresnel(scene, {
    leftColor: [1.0, 1.0, 1.0],
    rightColor: [0.0, 0.0, 0.0],
    power: 4
 });

 var material = new XEO.PhongMaterial(scene, {
    ambient:         [0.3, 0.3, 0.3],
    diffuse:         [0.5, 0.5, 0.0],   // Ignored, since we have assigned a Texture to diffuseMap, below
    diffuseMap:      diffuseMap,
    specular:        [1, 1, 1],
    shininess:       30,
    specularFresnel: fresnel
 });

 var ambientLight = new XEO.AmbientLight(scene, {
    color: [0.7, 0.7, 0.7]
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    color:      [0.5, 0.7, 0.5],
    intensity:  [1.0, 1.0, 1.0],
    space:      "view"
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        dirLight
    ]
 });

 var geometry = new XEO.Geometry(scene); // Geometry without parameters will default to a 2x2x2 box.

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
 });
 ````

 @class PhongMaterial
 @module XEO
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
 @param [cfg.emissive=[ 1.0, 1.0, 1.0 ]] {Array of Number} PhongMaterial emissive color.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque.
 Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.shininess=30] {Number} Scalar in range 0-70 that determines the size and sharpness of specular highlights.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the diffuse property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
 @param [cfg.bumpMap=null] {Texture} A bump map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PhongMaterial.
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

    XEO.PhongMaterial = XEO.Material.extend({

        className: "XEO.PhongMaterial",

        type: "material",

        _init: function (cfg) {

            this._state = new XEO.renderer.PhongMaterial({

                type: "phongMaterial",

                ambient: [0.7, 0.7, 0.8],
                diffuse: [1.0, 1.0, 1.0],
                specular: [1.0, 1.0, 1.0],
                emissive: [1.0, 1.0, 1.0],

                opacity: 1.0,
                shininess: 30.0,
                reflectivity: 1.0,

                bumpMap: null,
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

                dirty: true,
                
                hash: null
            });


            this._components = [];
            this._dirtyComponentSubs = [];
            this._destroyedComponentSubs = [];


            this.ambient = cfg.ambient;
            this.diffuse = cfg.diffuse;
            this.specular = cfg.specular;
            this.emissive = cfg.emissive;

            this.opacity = cfg.opacity;
            this.shininess = cfg.shininess;
            this.reflectivity = cfg.reflectivity;

            this.bumpMap = cfg.bumpMap;
            this.diffuseMap = cfg.diffuseMap;
            this.specularMap = cfg.specularMap;
            this.emissiveMap = cfg.emissiveMap;
            this.opacityMap = cfg.opacityMap;
            this.reflectivityMap = cfg.reflectivityMap;

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
             @type Array(Number)
             */
            ambient: {

                set: function (value) {

                    this._state.ambient = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} property changes.
                     *
                     * @event ambient
                     * @param value {Array(Number)} The property's new value
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
             @type Array(Number)
             */
            diffuse: {

                set: function (value) {

                    this._state.diffuse = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} property changes.
                     *
                     * @event diffuse
                     * @param value {Array(Number)} The property's new value
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
             @default [0.3, 0.3, 0.3]
             @type Array(Number)
             */
            specular: {

                set: function (value) {

                    this._state.specular = value || [0.3, 0.3, 0.3];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} property changes.

                     @event specular
                     @param value {Array(Number)} The property's new value
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
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            emissive: {

                set: function (value) {

                    this._state.emissive = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} property changes.

                     @event emissive
                     @param value {Array(Number)} The property's new value
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

             Attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} will appear transparent only if they are also attached
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

                    this._state.opacity = (value !== undefined || value !== null) ? value : 1.0;

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
             @default 30.0
             @type Number
             */
            shininess: {

                set: function (value) {

                    this._state.shininess = value !== undefined ? value : 30;

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
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} property changes.

                     @event diffuseMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("diffuseMap", texture);
                },

                get: function () {
                    return this._components["diffuseMap"];
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
                    this._attachComponent("specularMap", texture);
                },

                get: function () {
                    return this._components["specularMap"];
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
                    this._attachComponent("emissiveMap", texture);
                },

                get: function () {
                    return this._components["emissiveMap"];
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
                    this._attachComponent("opacityMap", texture);
                },

                get: function () {
                    return this._components["opacityMap"];
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
                    this._attachComponent("reflectivityMap", texture);
                },

                get: function () {
                    return this._components["reflectivityMap"];
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
                    this._attachComponent("diffuseFresnel", fresnel);
                },

                get: function () {
                    return this._components["diffuseFresnel"];
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
                    this._attachComponent("specularFresnel", fresnel);
                },

                get: function () {
                    return this._components["specularFresnel"];
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
                    this._attachComponent("emissiveFresnel", fresnel);
                },

                get: function () {
                    return this._components["emissiveFresnel"];
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
                    this._attachComponent("opacityFresnel", fresnel);
                },

                get: function () {
                    return this._components["opacityFresnel"];
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
                    this._attachComponent("reflectivityFresnel", fresnel);
                },

                get: function () {
                    return this._components["reflectivityFresnel"];
                }
            }
        },

        _attachComponent: function (type, component) {

            if (XEO._isString(component)) {

                // ID given for component - find the component 
                var id = component;

                component = this.scene.components[id];

                if (!component) {
                    this.error("Component with this ID not found: '" + id + "'");
                    return;
                }
            }

            if (component && component.type !== "texture" && component.type !== "fresnel") {
                this.error("Component with this ID is not a Texture or Fresnel: '" + id + "'");
                return;
            }

            var oldComponent = this._components[type];

            if (oldComponent) {

                // Replacing old component

                oldComponent.off(this._dirtyComponentSubs[type]);
                oldComponent.off(this._destroyedComponentSubs[type]);

                delete this._components[type];
            }

            var self = this;

            if (component) {

                this._dirtyComponentSubs[type] = component.on("dirty",
                    function () {
                        self.fire("dirty", true);
                    });

                this._destroyedComponentSubs[type] = component.on("destroyed",
                    function () {

                        delete self._dirtyComponentSubs[type];
                        delete self._destroyedComponentSubs[type];

                        self._state.dirty = true;

                        self.fire("dirty", true);
                        self.fire(type, null);
                    });

                this._components[type] = component;
            }

            this._state[type] = component ? component._state : null;

            this._state.dirty = true;

            this.fire(type, component || null);
        },

        _compile: function () {

            if (this._state.dirty) {

                this._makeHash();

                this._state.dirty = false;
            }

            this._renderer.material = this._state;
        },

        _makeHash: function () {

            var state = this._state;

            var hash = ["/p"]; // 'P' for Phong

            if (state.bumpMap) {
                hash.push("/b");
                if (state.bumpMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.diffuseMap) {
                hash.push("/d");
                if (state.diffuseMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.specularMap) {
                hash.push("/s");
                if (state.specularMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.emissiveMap) {
                hash.push("/e");
                if (state.emissiveMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.opacityMap) {
                hash.push("/o");
                if (state.opacityMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.reflectivityMap) {
                hash.push("/r");
                if (state.reflectivityMap.matrix) {
                    hash.push("/anim");
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

                ambient: this.ambient,
                diffuse: this.diffuse,
                specular: this.specular,
                emissive: this.emissive,

                // Factors

                opacity: this.opacity,
                shininess: this.shininess,
                reflectivity: this.reflectivity
            };

            // Textures

            var components = this._components;

            if (components.bumpMap) {
                json.bumpMap = components.bumpMap.id;
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