/**
 A **PBRMaterial** is a {{#crossLink "Material"}}{{/crossLink}} subclass which defines the appearance of
 attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} using a physically-based rendering model.

 ## Overview

 Physically Based Rendering (PBR) is a method of shading and rendering that provides a more accurate representation
 of how light interacts with surfaces. It can be referred to as Physically Based Rendering (PBR) or Physically Based Shading (PBS).
 Depending on what aspect of the pipeline is being discussed, PBS is usually specific to shading concepts and PBR specific
 to rendering and lighting. However, both terms describe on a whole, the process of representing assets from a physically
 accurate standpoint. - *Wes McDermott, Allegorithmic PBR Guide, Vol. 2*

 See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that PBRMaterials create within xeoEngine's shaders.

 ### Metallic materials

 ### Specular materials

 <img src="../../../assets/images/PBRMaterial.png"></img>

 ## Example 1: Metallic material with color map

 In this example we have

 <ul>
 <li>a {{#crossLink "Texture"}}{{/crossLink}},</li>
 <li>a metallic {{#crossLink "PBRMaterial"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}} as a color map,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 Note that the value for the {{#crossLink "PBRMaterial"}}PBRMaterial's{{/crossLink}} {{#crossLink "PBRMaterial/color:property"}}{{/crossLink}}
 property is ignored and redundant, since we assign a {{#crossLink "Texture"}}{{/crossLink}} to the
 {{#crossLink "PBRMaterial"}}PBRMaterial's{{/crossLink}} {{#crossLink "PBRMaterial/colorMap:property"}}{{/crossLink}} property.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors then directly provide the metallic base color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var scene = new XEO.Scene();

 var colorMap = new XEO.Texture(scene, {
    src: "colorMap.jpg"
 });

 // A metallic material
 var metalMaterial = new XEO.PBRMaterial(scene, {

    // Metallic material (else specular)
    metallic: true,

    // Base color in Metallic mode (else albedo in Specular mode)
    color: [1.0, 0.8, 0.0],
    colorMap: colorMap,

    // Black (0.0) for non-metal and white (1.0) for raw metal
    metalness: 0.8,

    // Fresnel values
    specularF0: 0.0,
 });

 var geometry = new XEO.Geometry(scene); // Geometry without parameters will default to a 2x2x2 box.

 var object = new XEO.GameObject(scene, {
    material: metalMaterial,
    geometry: geometry
 });
 ````

 @class PBRMaterial
 @module XEO
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PBRMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PBRMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this PBRMaterial.
 @param [cfg.metallic=false] {Boolean} Selects the material mode: Metallic when true, Specular otherwise (default).
 @param [cfg.color=[ 1.0, 1.0, 1.0 ]] {Array of Number} Base color in Metallic mode, albedo in Specular mode.
 @param [cfg.colorMap=null] {Texture} A color map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the color property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.emissive=[ 1.0, 1.0, 1.0 ]] {Array of Number} Emissive color.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque. Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.opacityMap=null] {Texture} An opacity map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the opacity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.roughness=0] {Number} Scalar in range 0-1 that controls roughness, where 0 is 100% glossiness and 1 is 100% roughness.
 @param [cfg.roughnessMap=null] {Texture} A roughness map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the roughness property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.bumpMap=null] {Texture} A bump map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 @param [cfg.metalness=1] {Number} Scalar in range 0-1 that controls how much metalness is applied for non-metalic PBRMaterials; black (0.0) for non-metal and white (1.0) for raw metal.
 @param [cfg.specularF0=1] {Number} Scalar in range 0-1 that controls how much Fresnel is applied for non-metalic PBRMaterials.
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} Specular color.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMaterial.
 */
(function () {

    "use strict";

    XEO.PBRMaterial = XEO.Material.extend({

        className: "XEO.PBRMaterial",

        type: "material",

        _init: function (cfg) {

            this._state = new XEO.renderer.PBRMaterial({

                type: "pbrMaterial",

                // Workflow selector; true == Metallic, false == Specular
                metallic: false,

                //--------------------------------------------
                // Attributes common to both workflows
                //--------------------------------------------

                // Base color in Metallic mode, albedo in Specular mode
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
                bumpMap: null,

                //--------------------------------------------
                // Attributes used in Metallic workflow
                //--------------------------------------------

                // Black (0.0) for non-metal and white (1.0) for raw metal
                metalness: 1.0,

                // Fresnel values
                specularF0: 0.0,

                //--------------------------------------------
                // Attributes used in Specular workflow
                //--------------------------------------------

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


            // Mode switch

            this.metallic = cfg.metallic;

            // Common 

            this.color = cfg.color;
            this.colorMap = cfg.colorMap;
            this.emissive = cfg.emissive;
            this.emissiveMap = cfg.emissiveMap;
            this.opacity = cfg.opacity;
            this.opacityMap = cfg.opacityMap;
            this.roughness = cfg.roughness;
            this.roughnessMap = cfg.roughnessMap;
            this.bumpMap = cfg.bumpMap;

            // Metallic

            this.metalness = cfg.metalness;
            this.specularF0 = cfg.specularF0;

            // Specular 

            this.specular = cfg.specular;
            this.specularMap = cfg.specularMap;
        },

        _props: {

            /**
             Selects the material mode: Metallic when true, Specular otherwise (default).

             Fires a {{#crossLink "PBRMaterial/metallic:event"}}{{/crossLink}} event on change.

             @property metallic
             @default false
             @type Boolean
             */
            metallic: {

                set: function (value) {

                    this._state.metallic = value === true;

                    this._renderer.imageDirty = true;

                    this.fire("dirty", true);

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} property changes.

                     @event metallic
                     @param value {Boolean} The property's new value
                     */
                    this.fire("metallic", this._state.metallic);
                },

                get: function () {
                    return this._state.metallic;
                }
            },

            /**
             Indicates the PBRMaterial's base color in Metallic mode, or [albedo](https://en.wikipedia.org/wiki/Albedo) in Specular mode.

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
             A color {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMaterial.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property overrides {{#crossLink "PBRMaterial/colorMap:property"}}{{/crossLink}} when not null or undefined.

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
             The PBRMaterial's emissive color.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property may be overridden by {{#crossLink "PBRMaterial/emissiveMap:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PBRMaterial/emissive:event"}}{{/crossLink}} event on change.

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
             An emissive {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMaterial.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property overrides {{#crossLink "PBRMaterial/emissive:property"}}{{/crossLink}} when not null or undefined.

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
             Factor in the range [0..1] indicating how transparent the PBRMaterial is.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

             Attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} will appear transparent only if they are also attached
             to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
             set to **true**.

             This property may be overridden by {{#crossLink "PBRMaterial/opacityMap:property"}}{{/crossLink}}.

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
             An opacity {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMaterial.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property overrides {{#crossLink "PBRMaterial/opacity:property"}}{{/crossLink}} when not null or undefined.

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

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             A value of ````0```` is 100% glossiness, while ````1```` is 100% roughness.

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
             An roughness {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMaterial.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property overrides {{#crossLink "PBRMaterial/roughness:property"}}{{/crossLink}} when not null or undefined.

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
             A bump {{#crossLink "Texture"}}{{/crossLink}} attached to this PhongMaterial.

             Active when this PBRMaterial is in both Metallic and Specular modes (which is set by {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}}).

             This property overrides {{#crossLink "PBRMaterial/bumpMap:property"}}{{/crossLink}} when not null or undefined.

             Fires a {{#crossLink "PhongMaterial/bumpMap:event"}}{{/crossLink}} event on change.

             @property bumpMap
             @default null
             @type {Texture}
             */
            bumpMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PhongMaterial's {{#crossLink "PhongMaterial/bump:property"}}{{/crossLink}} property changes.

                     @event bumpMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("bumpMap", texture);
                },

                get: function () {
                    return this._components["bumpMap"];
                }
            },

            /**
             A factor in range [0..1] that indicates the surface metalness of this PBRMaterial.

             A value of ````0```` is non-metallic, while ````1```` is raw metal.

             Active when this PBRMaterial is in Metallic mode, ie. when {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} is ````true````.

             Fires a {{#crossLink "PBRMaterial/metalness:event"}}{{/crossLink}} event on change.

             @property metalness
             @default 0.0
             @type Number
             */
            metalness: {

                set: function (value) {

                    this._state.metalness = value !== undefined ? value : 0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/metalness:property"}}{{/crossLink}} property changes.

                     @event metalness
                     @param value Number The property's new value
                     */
                    this.fire("metalness", this._state.metalness);
                },

                get: function () {
                    return this._state.metalness;
                }
            },

            /**
             Scalar in range 0-1 that controls the degree of Fresnel.

             Active when this PBRMaterial is in Metallic mode, ie. when {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} is ````true````.

             Fires a {{#crossLink "PBRMaterial/specularF0:event"}}{{/crossLink}} event on change.

             @property specularF0
             @default 1.0
             @type Number
             */
            specularF0: {

                set: function (value) {

                    this._state.specularF0 = value !== undefined ? value : 1.0;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMaterial's {{#crossLink "PBRMaterial/specularF0:property"}}{{/crossLink}} property changes.

                     @event specularF0
                     @param value Number The property's new value
                     */
                    this.fire("specularF0", this._state.specularF0);
                },

                get: function () {
                    return this._state.specularF0;
                }
            },


            /**
             The material's specular color.

             Active when this PBRMaterial is in Specular mode, ie. when {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} is ````false````.

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
             A specular {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMaterial.

             Active when this PBRMaterial is in Specular mode, ie. when {{#crossLink "PBRMaterial/metallic:property"}}{{/crossLink}} is ````false````.

             This property overrides {{#crossLink "PBRMaterial/specular:property"}}{{/crossLink}} when not null or undefined.

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

            var hash = [];

            if (this._state.metallic) {
                hash.push("/m");
            } else {
                hash.push("/s");
            }

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

            if (state.bumpMap) {
                hash.push("/b");
                if (state.bumpMap.matrix) {
                    hash.push("/anim");
                }
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var components = this._components;

            var json = {};

            json.metallic = this._state.metallic;

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

            if (components.bumpMap) {
                json.bumpMap = components.bumpMap.id;
            }

            // Metallic

            json.metalness = this._state.metalness;
            json.specularF0 = this.specularF0;

            // Specular

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