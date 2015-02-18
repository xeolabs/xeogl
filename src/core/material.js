"use strict";

/**
 Defines the surface appearance of associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>Materials interact with {{#crossLink "Lights"}}{{/crossLink}} using the <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model.</li>

 <li>Within XEO Engine's shading calculations, a Material's {{#crossLink "Material/ambient:property"}}{{/crossLink}}, {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and
  {{#crossLink "Material/specular:property"}}{{/crossLink}} properties are multiplied by corresponding color properties on associated
 {{#crossLink "PointLight"}}AmbientLights{{/crossLink}}, {{#crossLink "PointLight"}}PointLights{{/crossLink}} and {{#crossLink "DirLight"}}DirLights{{/crossLink}}.</li>

 <li>These Material properties, along with {{#crossLink "Material/emissive:property"}}{{/crossLink}},
 {{#crossLink "Material/opacity:property"}}{{/crossLink}} and {{#crossLink "Material/reflectivity:property"}}{{/crossLink}},
 specify attributes that are to be **applied uniformly** across the surface of associated {{#crossLink "Geometry"}}Geometries{{/crossLink}}.</li>

 <li>Most of those attributes can be textured, **effectively replacing the values set for those properties**, by
 assigning {{#crossLink "Texture"}}Textures{{/crossLink}} to the Material's
 {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}}, {{#crossLink "Material/specularMap:property"}}{{/crossLink}},
 {{#crossLink "Material/emissiveMap:property"}}{{/crossLink}}, {{#crossLink "Material/opacityMap:property"}}{{/crossLink}}
 and  {{#crossLink "Material/reflectivityMap:property"}}{{/crossLink}} properties</li>

 <li>For example, the value of {{#crossLink "Material/diffuse:property"}}{{/crossLink}} will be ignored if your
 Material also has a {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} set to a {{#crossLink "Texture"}}Texture{{/crossLink}}.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface, ie. they are not multiplied by
 the {{#crossLink "Material/diffuse:property"}}{{/crossLink}} for each pixel, as is done in many shading systems.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6921713/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "Texture"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}} as a diffuse map,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} associated with all of the above.</li>
 </ul>

 Note that the value for the {{#crossLink "Material"}}Material's{{/crossLink}} {{#crossLink "Material/diffuse:property"}}{{/crossLink}}
 property is ignored and redundant, since we assign a {{#crossLink "Texture"}}{{/crossLink}} to the
 {{#crossLink "Material"}}Material's{{/crossLink}} {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} property.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var scene = new XEO.Scene();

 var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
 });

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.5, 0.5, 0.0],   // Ignored, since we have assigned a Texture to diffuseMap, below
    diffuseMap: diffuseMap,
    specular:   [1. 1, 1],
    shininess:  30
});

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
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

 @class Material
 @module XEO
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Material within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The Material configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this Material.
 @param [cfg.ambient=[0.7, 0.7, 0.8 ]] {Array of Number} Material ambient color. Multiplied by {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}} {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}}.
 @param [cfg.diffuse=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material diffuse color. Multiplied by {{#crossLink "PointLight"}}PointLight{{/crossLink}} {{#crossLink "PointLight/diffuse:property"}}diffuse{{/crossLink}} and {{#crossLink "DirLight"}}DirLight{{/crossLink}} {{#crossLink "DirLight/diffuse:property"}}diffuse{{/crossLink}}
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material specular color. Multiplied by {{#crossLink "PointLight"}}PointLight{{/crossLink}} {{#crossLink "PointLight/specular:property"}}specular{{/crossLink}} and {{#crossLink "DirLight"}}DirLight{{/crossLink}} {{#crossLink "DirLight/specular:property"}}specular{{/crossLink}}
 @param [cfg.emissive=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material emissive color.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque.
 Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.shininess=30] {Number} Scalar in range 0-70 that determines the size and sharpness of specular highlights.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the diffuse property.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property.
 @param [cfg.bumpMap=null] {Texture} A bump map {{#crossLink "Texture"}}Texture{{/crossLink}}.
 @param [cfg.opacityMap=null] {Texture} An opacity map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the opacity property.
 @param [cfg.reflectivityMap=null] {Texture} A reflectivity control map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the reflectivity property.
 */
XEO.Material = XEO.Component.extend({


    className: "XEO.Material",

    type: "material",

    _init: function (cfg) {

        this._textures = [];
        this._dirtyTextureSubs = [];
        this._destroyedTextureSubs = [];

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
    },

    /**
     * The Material's ambient color, which is multiplied by the {{#crossLink "AmbientLight/ambient:property"}}{{/crossLink}}
     * property of the {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}.
     *
     * Fires a {{#crossLink "Material/ambient:event"}}{{/crossLink}} event on change.
     *
     * @property ambient
     * @default [1.0, 1.0, 1.0]
     * @type Array(Number)
     */
    set ambient(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.ambient = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/ambient:property"}}{{/crossLink}} property changes.
         * @event ambient
         * @param value {Array(Number)} The property's new value
         */
        this.fire("ambient", value);
    },

    get ambient() {
        return this._core.ambient;
    },

    /**
     * The Material's diffuse color.
     *
     * This property may be textured by adding a {{#crossLink "Texture"}}Texture{{/crossLink}} that has an
     * {{#crossLink "Texture/applyTo:property"}}{{/crossLink}} set to ````"diffuse"````.
     *
     * Fires a {{#crossLink "Material/diffuse:event"}}{{/crossLink}} event on change.
     *
     * @property diffuse
     * @default [1.0, 1.0, 1.0]
     * @type Array(Number)
     */
    set diffuse(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.diffuse = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/diffuse:property"}}{{/crossLink}} property changes.
         * @event diffuse
         * @param value {Array(Number)} The property's new value
         */
        this.fire("diffuse", value);
    },

    get diffuse() {
        return this._core.diffuse;
    },

    /**
     * The material's specular color.
     *
     * This property may be textured by adding a {{#crossLink "Texture"}}Texture{{/crossLink}} that has an
     * {{#crossLink "Texture/applyTo:property"}}{{/crossLink}} set to ````"specular"````.
     *
     * Fires a {{#crossLink "Material/specular:event"}}{{/crossLink}} event on change.
     *
     * @property specular
     * @default [0.3, 0.3, 0.3]
     * @type Array(Number)
     */
    set specular(value) {
        value = value || [ 0.3, 0.3, 0.3 ];
        this._core.specular = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/specular:property"}}{{/crossLink}} property changes.
         * @event specular
         * @param value {Array(Number)} The property's new value
         */
        this.fire("specular", value);
    },

    get specular() {
        return this._core.specular;
    },

    /**
     * The Material's emissive color.
     *
     * This property may be textured by adding a {{#crossLink "Texture"}}Texture{{/crossLink}} that has an
     * {{#crossLink "Texture/applyTo:property"}}{{/crossLink}} set to ````"emissive"````.
     *
     * Fires a {{#crossLink "Material/emissive:event"}}{{/crossLink}} event on change.
     *
     * @property emissive
     * @default [1.0, 1.0, 1.0]
     * @type Array(Number)
     */
    set emissive(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.emissive = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/emissive:property"}}{{/crossLink}} property changes.
         * @event emissive
         * @param value {Array(Number)} The property's new value
         */
        this.fire("emissive", value);
    },

    get emissive() {
        return this._core.emissive;
    },

    /**
     * Factor in the range [0..1] indicating how transparent the Material is.
     *
     * A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
     *
     * If {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} is not set to true on associated
     * {{#crossLink "Modes"}}Modes{{/crossLink}}, then the Material will remain fully opaque and this property will
     * have no effect.
     *
     * This property may be textured by adding a {{#crossLink "Texture"}}Texture{{/crossLink}} that has an
     * {{#crossLink "Texture/applyTo:property"}}{{/crossLink}} set to ````"opacity"````.
     *
     * Fires an {{#crossLink "Material/opacity:event"}}{{/crossLink}} event on change.
     *
     * @property opacity
     * @default 1.0
     * @type Number
     */
    set opacity(value) {
        value = value != undefined ? value : 1;
        this._core.opacity = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/opacity:property"}}{{/crossLink}} property changes.
         * @event opacity
         * @param value {Number} The property's new value
         */
        this.fire("opacity", value);
    },

    get opacity() {
        return this._core.opacity;
    },

    /**
     * A factor in range [0..128] that determines the size and sharpness of the specular highlights create by this Material.
     *
     * Larger values produce smaller, sharper highlights. A value of 0.0 gives very large highlights that are almost never
     * desirable. Try values close to 10 for a larger, fuzzier highlight and values of 100 or more for a small, sharp
     * highlight.
     *
     * Fires a {{#crossLink "Material/shininess:event"}}{{/crossLink}} event on change.
     *
     * @property shininess
     * @default 30.0
     * @type Number
     */
    set shininess(value) {
        value = value != undefined ? value : 30;
        this._core.shininess = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/shininess:property"}}{{/crossLink}} property changes.
         * @event shininess
         * @param value Number The property's new value
         */
        this.fire("shininess", value);
    },

    get shininess() {
        return this._core.shininess;
    },

    /**
     * Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected by this Material.
     *
     * The surface will be non-reflective when this is 0, and completely mirror-like when it is 1.0.
     *
     * This property may be textured by adding a {{#crossLink "Texture"}}Texture{{/crossLink}} that has an
     * {{#crossLink "Texture/applyTo:property"}}{{/crossLink}} set to ````"reflectivity"````.
     *
     * Fires a {{#crossLink "Material/reflectivity:event"}}{{/crossLink}} event on change.
     *
     * @property reflectivity
     * @default 1.0
     * @type Number
     */
    set reflectivity(value) {
        value = value != undefined ? value : 1.0;
        this._core.reflectivity = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/reflectivity:property"}}{{/crossLink}} property changes.
         * @event reflectivity
         * @param value Number The property's new value
         */
        this.fire("reflectivity", value);
    },

    get reflectivity() {
        return this._core.reflectivity;
    },

    /**
     * A diffuse texture map attached to this Material.
     *
     * Fires a {{#crossLink "Material/diffuseMap:event"}}{{/crossLink}} event on change.
     *
     * @property diffuseMap
     * @default null
     * @type {Texture}
     */
    set diffuseMap(texture) {
        this._attachTexture("diffuseMap", texture);

        /**
         * Fired whenever this Material's {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} property changes.
         * @event diffuseMap
         * @param value Number The property's new value
         */
    },

    get diffuseMap() {
        return this._textures["diffuseMap"];
    },

    /**
     * A specular texture map attached to this Material.
     *
     * Fires a {{#crossLink "Material/specularMap:event"}}{{/crossLink}} event on change.
     *
     * @property specularMap
     * @default null
     * @type {Texture}
     */
    set specularMap(texture) {
        this._attachTexture("specularMap", texture);

        /**
         * Fired whenever this Material's {{#crossLink "Material/specularMap:property"}}{{/crossLink}} property changes.
         * @event specularMap
         * @param value Number The property's new value
         */
    },

    get specularMap() {
        return this._textures["specularMap"];
    },

    /**
     * A emissive texture map attached to this Material.
     *
     * Fires a {{#crossLink "Material/emissiveMap:event"}}{{/crossLink}} event on change.
     *
     * @property emissiveMap
     * @default null
     * @type {Texture}
     */
    set emissiveMap(texture) {
        this._attachTexture("emissiveMap", texture);

        /**
         * Fired whenever this Material's {{#crossLink "Material/emissiveMap:property"}}{{/crossLink}} property changes.
         * @event emissiveMap
         * @param value Number The property's new value
         */
    },

    get emissiveMap() {
        return this._textures["emissiveMap"];
    },

    /**
     * A opacity texture map attached to this Material.
     *
     * Fires a {{#crossLink "Material/opacityMap:event"}}{{/crossLink}} event on change.
     *
     * @property opacityMap
     * @default null
     * @type {Texture}
     */
    set opacityMap(texture) {
        this._attachTexture("opacityMap", texture);

        /**
         * Fired whenever this Material's {{#crossLink "Material/opacityMap:property"}}{{/crossLink}} property changes.
         * @event opacityMap
         * @param value Number The property's new value
         */
    },

    get opacityMap() {
        return this._textures["opacityMap"];
    },

    /**
     * A reflectivity texture map attached to this Material.
     *
     * Fires a {{#crossLink "Material/reflectivityMap:event"}}{{/crossLink}} event on change.
     *
     * @property reflectivityMap
     * @default null
     * @type {Texture}
     */
    set reflectivityMap(texture) {
        this._attachTexture("reflectivityMap", texture);

        /**
         * Fired whenever this Material's {{#crossLink "Material/reflectivityMap:property"}}{{/crossLink}} property changes.
         * @event reflectivityMap
         * @param value Number The property's new value
         */
    },

    get reflectivityMap() {
        return this._textures["reflectivityMap"];
    },

    _attachTexture: function (type, texture) {

        if (XEO._isString(texture)) {

            // ID given for texture - find the texture component
            var id = texture;

            texture = this.scene.components[id];

            if (!texture) {
                this.error("Texture not found for ID: '" + id + "'");
                return;
            }
        }

        if (texture.type != "texture") {
            this.error("Component is not a texture: '" + id + "'");
            return;
        }

        var oldTexture = this._textures[type];

        if (oldTexture) {

            // Replacing old texture

            oldTexture.off(this._dirtyTextureSubs[type]);
            oldTexture.off(this._destroyedTextureSubs[type]);
        }

        var self = this;

        this._dirtyTextureSubs[type] = texture.on("dirty", function () {
            self.fire("dirty", true);
        });

        this._dirtyTextureSubs[type] = texture.on("destroyed",
            function () {
                delete self._dirtyTextureSubs[type];
                delete self._destroyedTextureSubs[type];
                self.fire("dirty", true);
                self.fire(type, null);
            });

        this._textures[type] = texture;

        this.fire(type, texture);
    },

    _compile: function () {
        // Set material state on renderer
        this._renderer.material = this._core;
        // Set texture state on renderer
        var layers = [];
        for (var i = 0, len = this._textures.length; i < len; i++) {
            layers.push(this._textures[i]._core);
        }
        var core = {
            type: "texture",
            bumpMap: this.bumpMap ? this.bumpMap._core : null,
            diffuseMap: this.diffuseMap ? this.diffuseMap._core : null,
            specularMap: this.specularMap ? this.specularMap._core : null,
            emissiveMap: this.emissiveMap ? this.emissiveMap._core : null,
            opacityMap: this.opacityMap ? this.opacityMap._core : null,
            reflectivityMap: this.reflectivityMap ? this.reflectivityMap._core : null,
            hash: this._makeTexturesHash()
        };

        this._renderer.texture = core;
    },

    // Texture hash helps reuse pooled shaders
    _makeTexturesHash: function (layers) {
        var hash = [];
        if (this.bumpMap) {
            hash.push("/b");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.diffuseMap) {
            hash.push("/d");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.specularMap) {
            hash.push("/s");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.emissiveMap) {
            hash.push("/e");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.opacityMap) {
            hash.push("/o");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.reflectivityMap) {
            hash.push("/r");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        return  hash.join("");
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

        if (this.bumpMap) {
            json.bumpMap = this.bumpMap.id;
        }
        if (this.diffuseMap) {
            json.diffuseMap = this.diffuseMap.id;
        }
        if (this.specularMap) {
            json.specularMap = this.specularMap.id;
        }
        if (this.emissiveMap) {
            json.emissiveMap = this.emissiveMap.id;
        }
        if (this.opacityMap) {
            json.opacityMap = this.opacityMap.id;
        }
        if (this.reflectivityMap) {
            json.reflectivityMap = this.reflectivityMap.id;
        }

        return json;
    }
});