/**
 A **PBRMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the appearance of
 attached {{#crossLink "Entity"}}Entities{{/crossLink}} using a physically-based rendering model.

 ## Overview

 <ul>
 <li>Physically Based Rendering (PBR) is a method of shading and rendering that provides a more accurate representation
 of how light interacts with surfaces. It can be referred to as Physically Based Rendering (PBR) or Physically Based Shading (PBS).
 Depending on what aspect of the pipeline is being discussed, PBS is usually specific to shading concepts and PBR specific
 to rendering and lighting. However, both terms describe on a whole, the process of representing assets from a physically
 accurate standpoint. - *Wes McDermott, Allegorithmic PBR Guide, Vol. 2*</li>
 <li>The xeoEngine PBRMaterial is based on the once used in [Unreal Engine](https://docs.unrealengine.com/latest/INT/Engine/Rendering/Materials/PhysicallyBased/index.html)</li>
 </ul>

 <img src="../../../assets/images/PBRMaterial.png"></img>

 ### Material attributes

 * **{{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}** - degree of metallicity in range ````[0..1]````, where ````0```` is fully dialectric (non-metal) and ````1```` is fully metallic.
 * **{{#crossLink "PBRMaterial/color:property"}}{{/crossLink}}** - base color.
 * **{{#crossLink "PBRMaterial/colorMap:property"}}{{/crossLink}}** - color map {{#crossLink "Texture"}}{{/crossLink}} to replace {{#crossLink "PBRMaterial/color:property"}}{{/crossLink}}.
 * **{{#crossLink "PBRMaterial/emissive:property"}}{{/crossLink}}** - emissive color.
 * **{{#crossLink "PBRMaterial/emissiveMap:property"}}{{/crossLink}}** - emissive map {{#crossLink "Texture"}}{{/crossLink}} to replace {{#crossLink "PBRMaterial/emissive:property"}}{{/crossLink}}.
 * **{{#crossLink "PBRMaterial/opacity:property"}}{{/crossLink}}** - opacity in range ````[0..1]````.
 * **{{#crossLink "PBRMaterial/opacityMap:property"}}{{/crossLink}}** - opacity map {{#crossLink "Texture"}}{{/crossLink}} to replace {{#crossLink "PBRMaterial/opacity:property"}}{{/crossLink}}.
 * **{{#crossLink "PBRMaterial/roughness:property"}}{{/crossLink}}** - surface roughness in range ````[0..1]````, where ````0```` is 100% smooth and ````1```` is 100% rough.
 * **{{#crossLink "PBRMaterial/roughnessMap:property"}}{{/crossLink}}** - roughness map {{#crossLink "Texture"}}{{/crossLink}} to replace {{#crossLink "PBRMaterial/roughness:property"}}{{/crossLink}}.
 * **{{#crossLink "PBRMaterial/normalMap:property"}}{{/crossLink}}** - normal map {{#crossLink "Texture"}}{{/crossLink}}.
 * **{{#crossLink "PBRMaterial/specular:property"}}{{/crossLink}}** - specular reflection color.
 * **{{#crossLink "PBRMaterial/specularMap:property"}}{{/crossLink}}** - specular map {{#crossLink "Texture"}}{{/crossLink}} to replace {{#crossLink "PBRMaterial/specular:property"}}{{/crossLink}}.


 ## Example 1: Non-metallic material

 In this example we have

 <ul>
 <li>a dialectric (non-metallic) PBRMaterial,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>an {{#crossLink "Entity"}}{{/crossLink}} attached to all of the above.</li>
 </ul>


 ```` javascript
 var scene = new XEO.Scene();

 var material1 = new XEO.PBRMaterial(scene, {
    metallic: 0.0, // Default
    color: [1.0, 0.8, 0.0],
    specular: [1.0, 1.0, 1.0]
 });

 var geometry = new XEO.Geometry(scene);  // Default box

 var entity = new XEO.Entity(scene, {
    material: material1,
    geometry: geometry
 });
 ````

 ## Example 2: Metallic material

 ```` javascript
 var material2 = new XEO.PBRMaterial(scene, {
    metallic: 1.0,
    color: [1.0, 0.8, 0.0],
    roughness: 0.3
 });
 ````

 ## Example 3: Metallic material with color map

 ```` javascript
 var colorMap = new XEO.Texture(scene, {
    src: "colorMap.jpg"
 });

 var material3 = new XEO.PBRMaterial(scene, {
    metallic: 1.0,
    colorMap: colorMap,
    roughness: 0.3
 });
 ````

 @class PBRMaterial
 @module XEO
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PBRMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PBRMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this PBRMaterial.
 @param [cfg.metallic=0.0] {Number} Scalar in range 0-1 that controls how metallic the PBRMaterial is.
 @param [cfg.color=[ 1.0, 1.0, 1.0 ]] {Array of Number} Base color.
 @param [cfg.colorMap=null] {Texture} A color map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the color property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.emissive=[ 1.0, 1.0, 1.0 ]] {Array of Number} Emissive color.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque. Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.opacityMap=null] {Texture} An opacity map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the opacity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.roughness=0.0] {Number} Scalar in range 0-1 that controls roughness, where 0 is 100% glossiness and 1 is 100% roughness.
 @param [cfg.roughnessMap=null] {Texture} A roughness map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the roughness property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.normalMap=null] {Texture} A normal map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} Specular color.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 */
(function () {

    "use strict";

    XEO.PBRMaterial = XEO.Material.extend({

        type: "XEO.PBRMaterial",

        _init: function (cfg) {

            this._state = new XEO.renderer.PBRMaterial({

                type: "pbrMaterial",

                // (0.0) for non-metal and (1.0) for raw metal
                metallic: 0.0,

                // Base color
                color: [1.0, 1.0, 1.0],
                colorMap: null,

                // Emissive color
                emissive: [1.0, 1.0, 1.0],
                emissiveMap: null,

                // Opacity
                opacity: 1.0,
                opacityMap: null,

                // Roughness
                roughness: 0.0,
                roughnessMap: null,

                // Bumpiness
                normalMap: null,

                // Specular reflectance
                specular: [1.0, 1.0, 1.0],
                specularMap: null,

                // True when state needs rebuild
                dirty: true,

                hash: null
            });


            this._components = [];
            this._dirtyComponentSubs = [];
            this._destroyedComponentSubs = [];

            this.metallic = cfg.metallic;

            this.color = cfg.color;
            this.colorMap = cfg.colorMap;

            this.emissive = cfg.emissive;
            this.emissiveMap = cfg.emissiveMap;

            this.opacity = cfg.opacity;
            this.opacityMap = cfg.opacityMap;

            this.roughness = cfg.roughness;
            this.roughnessMap = cfg.roughnessMap;

            this.normalMap = cfg.normalMap;

            this.specular = cfg.specular;
            this.specularMap = cfg.specularMap;
        },

        _props: {

            /**
             Controls how metallic this material is.

             Nonmetals have a value of ````0````, while metals have a value of ````1````. For pure surfaces, such as
             pure metal, pure stone, pure plastic, etc. this value will be 0 or 1, not anything in between. When
             creating hybrid surfaces like corroded, dusty, or rusty metals, you may find that you need some value
             between 0 and 1.

             Fires a {{#crossLink "PBRMaterial/metallic:event"}}{{/crossLink}} event on change.

             @property metallic
             @default 0.0
             @type Number
             */
            metallic: {

                set: function (value) {

                    this._state.metallic = value !== undefined ? value : 0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} property changes.

                     @event metallic
                     @param value Number The property's new value
                     */
                    this.fire("metallic", this._state.metallic);
                },

                get: function () {
                    return this._state.metallic;
                }
            },

            /**
             Base color of this material.

             This property may be overridden by {{#crossLink "PBRMaterial/colorMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            color: {

                set: function (value) {

                    this._state.color = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/color:property"}}{{/crossLink}} property changes.
                     *
                     * @event color
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("color", this._state.color);
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
             Color {{#crossLink "Texture"}}{{/crossLink}}, to apply instead of {{#crossLink "PBRMaterial/color:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/colorMap:event"}}{{/crossLink}} event on change.

             @property colorMap
             @default null
             @type {Texture}
             */
            colorMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/color:property"}}{{/crossLink}} property changes.

                     @event colorMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("colorMap", texture);
                },

                get: function () {
                    return this._components["colorMap"];
                }
            },

            /**
             Emissive color of this material.

             This property may be overridden by {{#crossLink "PBRMaterial/emissiveMap:property"}}{{/crossLink}}.

             Fires an {{#crossLink "PBRMaterial/emissive:event"}}{{/crossLink}} event on change.

             @property emissive
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            emissive: {

                set: function (value) {

                    this._state.emissive = value || [1.0, 1.0, 1.0];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/emissive:property"}}{{/crossLink}} property changes.

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
             Emissive {{#crossLink "Texture"}}{{/crossLink}}, to apply instead of {{#crossLink "PBRMaterial/emissive:property"}}{{/crossLink}}.

             Fires an {{#crossLink "PBRMaterial/emissiveMap:event"}}{{/crossLink}} event on change.

             @property emissiveMap
             @default null
             @type {Texture}
             */
            emissiveMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/emissiveMap:property"}}{{/crossLink}} property changes.

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
             Opacity of this material.

             Opacity is a value in the range [0..1], in which 0 is fully transparent and 1.0 is fully opaque.

             This property may be overidden by {{#crossLink "PBRMaterial/opacityMap:property"}}{{/crossLink}}.

             Attached {{#crossLink "Entity"}}Entities{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             Fires an {{#crossLink "PBRMaterial/opacity:event"}}{{/crossLink}} event on change.

             @property opacity
             @default 1.0
             @type Number
             */
            opacity: {

                set: function (value) {

                    this._state.opacity = (value !== undefined || value !== null) ? value : 1.0;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/opacity:property"}}{{/crossLink}} property changes.
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
             Opacity {{#crossLink "Texture"}}{{/crossLink}}, to apply instead of {{#crossLink "PBRMaterial/opacity:property"}}{{/crossLink}}.

             Fires an {{#crossLink "PBRMaterial/opacityMap:event"}}{{/crossLink}} event on change.

             @property opacityMap
             @default null
             @type {Texture}
             */
            opacityMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/opacityMap:property"}}{{/crossLink}} property changes.

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
             A factor in range [0..1] that indicates the surface roughness of this PBRMaterial.

             A value of ````0```` is a mirrow reflection, while ````1```` is completely matte.

             This property may be overidden by {{#crossLink "PBRMaterial/roughnessMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/roughness:event"}}{{/crossLink}} event on change.

             @property roughness
             @default 0.0
             @type Number
             */
            roughness: {

                set: function (value) {

                    this._state.roughness = value !== undefined ? value : 0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/roughness:property"}}{{/crossLink}} property changes.

                     @event roughness
                     @param value Number The property's new value
                     */
                    this.fire("roughness", this._state.roughness);
                },

                get: function () {
                    return this._state.roughness;
                }
            },

            /**
             Roughness {{#crossLink "Texture"}}{{/crossLink}}, to apply instead of {{#crossLink "PBRMaterial/roughness:property"}}{{/crossLink}}.

             Fires an {{#crossLink "PBRMaterial/roughnessMap:event"}}{{/crossLink}} event on change.

             @property roughnessMap
             @default null
             @type {Texture}
             */
            roughnessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/roughnessMap:property"}}{{/crossLink}} property changes.

                     @event roughnessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("roughnessMap", texture);
                },

                get: function () {
                    return this._components["roughnessMap"];
                }
            },

            /**
             A normal map {{#crossLink "Texture"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/normalMap:event"}}{{/crossLink}} event on change.

             @property normalMap
             @default null
             @type {Texture}
             */
            normalMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/normal:property"}}{{/crossLink}} property changes.

                     @event normalMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("normalMap", texture);
                },

                get: function () {
                    return this._components["normalMap"];
                }
            },

            /**
             Specular color of this material.

             This property may be overridden by {{#crossLink "PBRMaterial/specularMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default [0.3, 0.3, 0.3]
             @type Array(Number)
             */
            specular: {

                set: function (value) {

                    this._state.specular = value || [0.3, 0.3, 0.3];

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/specular:property"}}{{/crossLink}} property changes.

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
             Specular {{#crossLink "Texture"}}{{/crossLink}}, to apply instead of {{#crossLink "PBRMaterial/specular:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/specularMap:event"}}{{/crossLink}} event on change.

             @property specularMap
             @default null
             @type {Texture}
             */
            specularMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/specularMap:property"}}{{/crossLink}} property changes.

                     @event specularMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("specularMap", texture);
                },

                get: function () {
                    return this._components["specularMap"];
                }
            }
        },

        _attachComponent: function (type, component) {

            if (XEO._isString(component)) {

                // ID given for component - find the component 
                var id = component;

                component = this.scene.components[id];

                if (!component) {
                    this.error("Component not found: " + XEO._inQuotes(id));
                    return;
                }
            }

            if (component && component.type !== "XEO.Texture" && component.type !== "XEO.Fresnel") {
                this.error("Component " +XEO._inQuotes(id) + " is not a XEO.Texture or XEO.Fresnel");
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

            var hash = [];

            if (state.colorMap) {
                hash.push("/c");
                if (state.colorMap.matrix) {
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

            if (state.roughnessMap) {
                hash.push("/r");
                if (state.roughnessMap.matrix) {
                    hash.push("/anim");
                }
            }

            if (state.normalMap) {
                hash.push("/b");
                if (state.normalMap.matrix) {
                    hash.push("/anim");
                }
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var components = this._components;

            var json = {};

            // Common

            json.color = this._state.color;

            if (components.colorMap) {
                json.colorMap = components.colorMap.id;
            }

            json.emissive = this._state.emissive;

            if (components.emissiveMap) {
                json.emissiveMap = components.emissiveMap.id;
            }

            json.opacity = this._state.opacity;

            if (components.opacityMap) {
                json.opacityMap = components.opacityMap.id;
            }

            json.roughness = this._state.roughness;

            if (components.roughnessMap) {
                json.roughnessMap = components.roughnessMap.id;
            }

            if (components.normalMap) {
                json.normalMap = components.normalMap.id;
            }

            json.metallic = this._state.metallic;

            json.specular = this.specular;

            if (components.specularMap) {
                json.specularMap = components.specularMap.id;
            }

            return json;
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();