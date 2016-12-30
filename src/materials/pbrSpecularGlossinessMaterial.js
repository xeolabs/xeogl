/**

 A **PBRSpecularGlossinessMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 attached {{#crossLink "Entity"}}Entities{{/crossLink}} using the specular-glossy physically-based rendering model.

 ## Overview

 TODO

 <img src="../../../assets/images/PBRSpecularGlossinessMaterial.png"></img>

 ## Usage

 ```` javascript

 ````

 @class PBRSpecularGlossinessMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PBRSpecularGlossinessMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PBRSpecularGlossinessMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this material.

 @param [cfg.diffuseFactor=[[1.0, 1.0, 1.0]] {Array of Number} The RGB components of the reflected diffuse color of the material.
 For raw metals the diffuse color is black (0.0). The fourth component (A) is the glossiness of the material.

 @param [cfg.specularFactor=[[1.0, 1.0, 1.0]] {Array of Number} The specular RGB color of the material.

 @param [cfg.glossinessFactor=1] {Number} The glossiness of the material (0 is glossiness, 1 is full glossiness).

 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}} with RGB or RGBA
 components of the reflected diffuse color of the material. For raw metals the diffuse color is black (0.0). If the fourth
 component (A) is present, it represents the opacity of the material. Otherwise, an opacity of 1 is assumed. Will override
 the effect of the {{#crossLink "PBRSpecularGlossinessMaterial/diffuse:property"}}{{/crossLink}} property. Must be within
 the same {{#crossLink "Scene"}}{{/crossLink}} as this PBRSpecularGlossinessMaterial.

 @param [cfg.specularGlossinessMap=null] {Texture} An RGBA {{#crossLink "Texture"}}Texture{{/crossLink}} containing the specular color of the
 material (RGB components) and its glossiness (A component), which will override the effect of the {{#crossLink "PBRSpecularGlossinessMaterial/specular:property"}}{{/crossLink}} and {{#crossLink "PBRSpecularGlossinessMaterial/glossiness:property"}}{{/crossLink}} properties.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this PBRSpecularGlossinessMaterial.

 */
(function () {

    "use strict";

    xeogl.PBRSpecularGlossinessMaterial = xeogl.Material.extend({

        type: "xeogl.PBRSpecularGlossinessMaterial",

        _init: function (cfg) {

            this._state = new xeogl.renderer.PBRSpecularGlossinessMaterial({
                type: "PBRSpecularGlossinessMaterial",
                diffuseFactor: xeogl.math.vec3([1.0, 1.0, 1.0, 1.0]),
                specularFactor: xeogl.math.vec3([1.0, 1.0, 1.0]),
                glossinessFactor: 1.0,
                diffuseMap: null,
                specularGlossinessMap: null,
                hash: null
            });

            this._hashDirty = true;

            this.on("dirty", function () {

                // This PBRSpecularGlossinessMaterial is flagged dirty when a
                // child component fires "dirty", which always
                // means that a shader recompile will be needed.

                this._hashDirty = true;
            }, this);

            this.diffuseFactor = cfg.diffuseFactor;
            this.specularFactor = cfg.specularFactor;
            this.glossinessFactor = cfg.glossinessFactor;
            this.diffuseMap = cfg.diffuseMap;
            this.specularGlossinessMap = cfg.specularGlossinessMap;
        },

        _props: {
            

            /**
             The RGB components of the reflected diffuse color of the material. For raw metals the diffuse color is black (0.0). The fourth component (A) is the glossiness of the material.

             Fires a {{#crossLink "PBRSpecularGlossinessMaterial/diffuseFactor:event"}}{{/crossLink}} event on change.

             @property diffuseFactor
             @default [1.0, 1.0, 1.0, 1.0]
             @type Float32Array
             */
            diffuseFactor: {

                set: function (value) {

                    this._state.diffuseFactor.set(value || [1.0, 1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PBRSpecularGlossinessMaterial's {{#crossLink "PBRSpecularGlossinessMaterial/diffuseFactor:property"}}{{/crossLink}} property changes.
                     *
                     * @event diffuseFactor
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("diffuseFactor", this._state.diffuseFactor);
                },

                get: function () {
                    return this._state.diffuseFactor;
                }
            },

            /**
             The specular RGB color of the material.

             Fires a {{#crossLink "PBRSpecularGlossinessMaterial/specularFactor:event"}}{{/crossLink}} event on change.

             @property specularFactor
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            specularFactor: {

                set: function (value) {

                    this._state.specularFactor.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRSpecularGlossinessMaterial's {{#crossLink "PBRSpecularGlossinessMaterial/specularFactor:property"}}{{/crossLink}} property changes.

                     @event specularFactor
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("specularFactor", this._state.specularFactor);
                },

                get: function () {
                    return this._state.specularFactor;
                }
            },
            
            /**
             The glossiness of the material surface (0 is glossiness, 1 is full glossiness).

             Fires an {{#crossLink "PBRSpecularGlossinessMaterial/glossinessFactor:event"}}{{/crossLink}} event on change.

             @property glossinessFactor
             @default 1.0
             @type Number
             */
            glossinessFactor: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.glossinessFactor === value) {
                        return;
                    }

                    this._state.glossinessFactor = value;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PBRSpecularGlossinessMaterial's {{#crossLink "PBRSpecularGlossinessMaterial/glossinessFactor:property"}}{{/crossLink}} property changes.
                     *
                     * @event glossinessFactor
                     * @param value {Number} The property's new value
                     */
                    this.fire("glossinessFactor", this._state.glossinessFactor);
                },

                get: function () {
                    return this._state.glossinessFactor;
                }
            },
            
            /**
             A diffuse {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRSpecularGlossinessMaterial.

             This is a {{#crossLink "Texture"}}{{/crossLink}} with RGB or RGBA components of the reflected diffuse color of
             the material. For raw metals the diffuse color is black (0.0). If the fourth component (A) is present, it
             represents the opacity of the material. Otherwise, an opacity of 1 is assumed.

             Fires a {{#crossLink "PBRSpecularGlossinessMaterial/diffuseMap:event"}}{{/crossLink}} event on change.

             @property diffuseMap
             @default null
             @type {Texture}
             */
            diffuseMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRSpecularGlossinessMaterial's {{#crossLink "PBRSpecularGlossinessMaterial/diffuseMap:property"}}{{/crossLink}} property changes.

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
             A specular-glossiness {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRSpecularGlossinessMaterial.

             This is an RGBA {{#crossLink "Texture"}}{{/crossLink}}, containing the specular color of the material (RGB components) and its glossiness (A component).

             Fires an {{#crossLink "PBRSpecularGlossinessMaterial/specularGlossinessMap:event"}}{{/crossLink}} event on change.

             @property specularGlossinessMap
             @default null
             @type {Texture}
             */
            specularGlossinessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRSpecularGlossinessMaterial's {{#crossLink "PBRSpecularGlossinessMaterial/specularGlossinessMap:property"}}{{/crossLink}} property changes.

                     @event specularGlossinessMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "specularGlossinessMap", texture);
                },

                get: function () {
                    return this._attached.specularGlossinessMap;
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

            var hash = ["/sgm"];
            
            if (state.diffuseMap) {
                hash.push("/d");
                if (state.diffuseMap.matrix) {
                    hash.push("/mat");
                }
            }
            
            if (state.specularGlossinessMap) {
                hash.push("/sg");
                if (state.specularGlossinessMap.matrix) {
                    hash.push("/mat");
                }
            }
            
            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var json = {
                diffuseFactor: this._state.diffuseFactor,
                specularFactor: this._state.specularFactor
            };

            if (this._state.glossinessFactor !== 1.0) {
                json.glossinessFactor = this._state.glossinessFactor;
            }

            var components = this._attached;
            
            if (components.diffuseMap) {
                json.diffuseMap = components.diffuseMap.id;
            }

            if (components.specularGlossinessMap) {
                json.specularGlossinessMap = components.specularGlossinessMap.id;
            }
            
            return json;
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
