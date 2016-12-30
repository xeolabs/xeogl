/**

 A **PBRMetalRoughnessMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 attached {{#crossLink "Entity"}}Entities{{/crossLink}} using the specular-glossy physically-based rendering model.

 ## Overview

 https://github.com/tsturm/glTF/tree/master/extensions/Vendor/FRAUNHOFER_materials_pbr

 TODO

 <img src="../../../assets/images/PBRMetalRoughnessMaterial.png"></img>

 ## Usage

 ```` javascript

 ````

 @class PBRMetalRoughnessMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PBRMetalRoughnessMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PBRMetalRoughnessMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this material.

 @param [cfg.diffuse=[[1.0, 1.0, 1.0, 1.0]] {Array of Number} The RGB components of the reflected diffuse color of the material. For raw metals the diffuse color is black (0.0). The fourth component (A) is the glossiness of the material.
 @param [cfg.specular=[[1.0, 1.0, 1.0]] {Array of Number} The specular RGB color of the material.
 @param [cfg.glossiness=1] {Number} The glossiness of the material surface (0 is glossiness, 1 is full glossiness).
 @param [cfg.diffuseMap=undefined] {Texture} A diffuse {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the {{#crossLink "PBRMetalRoughnessMaterial/diffuse:property"}}{{/crossLink}} property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMetalRoughnessMaterial.
 @param [cfg.glossinessMap=undefined] {Texture} A glossiness {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of effect of the {{#crossLink "PBRMetalRoughnessMaterial/glossiness:property"}}{{/crossLink}} property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMetalRoughnessMaterial.
 @param [cfg.specularMap=undefined] {Texture} A specular {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the {{#crossLink "PBRMetalRoughnessMaterial/specular:property"}}{{/crossLink}} property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this PBRMetalRoughnessMaterial.
 */
(function () {

    "use strict";

    xeogl.PBRMetalRoughnessMaterial = xeogl.Material.extend({

        type: "xeogl.PBRMetalRoughnessMaterial",

        _init: function (cfg) {

            this._state = new xeogl.renderer.PBRMetalRoughnessMaterial({
                type: "PBRMetalRoughnessMaterial",
                diffuse: xeogl.math.vec3([1.0, 1.0, 1.0, 1.0]),
                glossiness: 1.0,
                specular: xeogl.math.vec3([1.0, 1.0, 1.0]),
                diffuseMap: null,
                glossinessMap: null,
                specularMap: null,

                hash: null
            });

            this._hashDirty = true;

            this.on("dirty", function () {

                // This PBRMetalRoughnessMaterial is flagged dirty when a
                // child component fires "dirty", which always
                // means that a shader recompile will be needed.

                this._hashDirty = true;
            }, this);

            this.diffuse = cfg.diffuse;
            this.glossiness = cfg.glossiness;
            this.specular = cfg.specular;
            this.diffuseMap = cfg.diffuseMap;
            this.glossinessMap = cfg.glossinessMap;
            this.specularMap = cfg.specularMap;
        },

        _props: {
            
            /**
             The RGB components of the reflected diffuse color of the PBRMetalRoughnessMaterial. 
             For raw metals the diffuse color is black (0.0). The fourth component (A) is the glossiness of the material.

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/diffuse:event"}}{{/crossLink}} event on change.

             @property diffuse
             @default [1.0, 1.0, 1.0, 1.0]
             @type Float32Array
             */
            diffuse: {

                set: function (value) {

                    this._state.diffuse.set(value || [1.0, 1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/diffuse:property"}}{{/crossLink}} property changes.
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
             The glossiness of the PBRMetalRoughnessMaterial (0 is glossiness, 1 is full glossiness).

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/glossiness:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/glossiness:property"}}{{/crossLink}} property changes.
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
             The specular RGB color of the PBRMetalRoughnessMaterial.

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            specular: {

                set: function (value) {

                    this._state.specular.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/specular:property"}}{{/crossLink}} property changes.

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
             A diffuse {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMetalRoughnessMaterial.

             This property overrides the {{#crossLink "PBRMetalRoughnessMaterial/diffuse:property"}}{{/crossLink}} property 
             when not null or undefined.

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/diffuseMap:event"}}{{/crossLink}} event on change.

             @property diffuseMap
             @default undefined
             @type {Texture}
             */
            diffuseMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/diffuseMap:property"}}{{/crossLink}} property changes.

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
             A glossiness {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMetalRoughnessMaterial.

             This property overrides the {{#crossLink "PBRMetalRoughnessMaterial/glossiness:property"}}{{/crossLink}} 
             property when not null or undefined.

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/glossinessMap:event"}}{{/crossLink}} event on change.

             @property glossinessMap
             @default undefined
             @type {Texture}
             */
            glossinessMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/glossinessMap:property"}}{{/crossLink}} property changes.

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
             A specular {{#crossLink "Texture"}}{{/crossLink}} attached to this PBRMetalRoughnessMaterial.

             This property overrides the {{#crossLink "PBRMetalRoughnessMaterial/specular:property"}}{{/crossLink}}
             property when not null or undefined.

             Fires a {{#crossLink "PBRMetalRoughnessMaterial/specularMap:event"}}{{/crossLink}} event on change.

             @property specularMap
             @default undefined
             @type {Texture}
             */
            specularMap: {

                set: function (texture) {

                    /**
                     Fired whenever this PBRMetalRoughnessMaterial's {{#crossLink "PBRMetalRoughnessMaterial/specularMap:property"}}{{/crossLink}} property changes.

                     @event specularMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Texture", "specularMap", texture);
                },

                get: function () {
                    return this._attached.specularMap;
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

            if (state.diffuseMap) {
                hash.push("/d");
                if (state.diffuseMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.glossinessMap) {
                hash.push("/g");
                if (state.glossinessMap.matrix) {
                    hash.push("/mat");
                }
            }

            if (state.specularMap) {
                hash.push("/s");
                if (state.specularMap.matrix) {
                    hash.push("/mat");
                }
            }

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            var json = {

                // Colors

                diffuse: this._state.diffuse,
                specular: this._state.specular
            };

            if (this._state.glossiness !== 1.0) {
                json.glossiness = this._state.glossiness;
            }

            // Textures

            var components = this._attached;

            if (components.diffuseMap) {
                json.diffuseMap = components.diffuseMap.id;
            }

            if (components.glossinessMap) {
                json.glossinessMap = components.glossinessMap.id;
            }

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
