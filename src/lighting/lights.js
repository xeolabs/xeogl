/**
 A **Lights** defines a group of light sources within a {{#crossLink "Scene"}}{{/crossLink}}.

 ## Overview

 A Lights may contain a virtually unlimited number of three types of light source:

 * {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}s, which are fixed-intensity and fixed-color, and
 affect all the Scene's {{#crossLink "Entity"}}Entities{{/crossLink}} equally,
 * {{#crossLink "PointLight"}}PointLight{{/crossLink}}s, which emit light that
 originates from a single point and spreads outward in all directions,
 * {{#crossLink "DirLight"}}DirLight{{/crossLink}}s, which illuminate all the
 Entities equally from a given direction and may cast shadows, and
 * {{#crossLink "SpotLight"}}SpotLight{{/crossLink}}s, which eminate from a position in a given direction and may also cast shadows.

 A Lights can also have two other components that define environmental reflection and irradiance:

 * {{#crossLink "Lights/lightMap:property"}}{{/crossLink}} set to a {{#crossLink "CubeTexture"}}{{/crossLink}}, and
 * {{#crossLink "Lights/reflectionMap:property"}}{{/crossLink}} set to a {{#crossLink "CubeTexture"}}{{/crossLink}}.

 ## Examples

 * [Light and reflection maps](../../examples/#materials_metallic_fireHydrant)
 * [World-space point lighting with normal map](../../examples/#lights_point_world_normalMap)
 * [View-space directional three-point lighting](../../examples/#lights_directional_view_threePoint)
 * [View-space positional three-point lighting](../../examples/#lights_point_world_threePoint)
 * [World-space directional three-point lighting](../../examples/#lights_directional_world_threePoint)
 * [World-space positional three-point lighting](../../examples/#lights_point_world_threePoint)

 ## Usage

 In the example below we'll customize the default Scene's light sources, then create a metallic sphere entity.

 ````javascript

 // We're using the default xeogl Scene
 // Get Scene's Lights
 var lights = xeogl.scene.lights;

 // Customize the light sources
 lights.lights = [
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
 ];

 // Add a light cube map
 lights.lightMap = new xeogl.CubeTexture({
    src: [
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
    ]
 });

 // Add a reflection cube map
 lights.reflectionMap = new xeogl.CubeTexture({
    src: [
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
    ]
 });

 // Create a metallic sphere entity
 new xeogl.Entity({
    material: new xeogl.MetallicMaterial({
        roughness: 1.0,
        metallic: 1.0,
        baseColorMap: new xeogl.Texture({
            src: "textures/materials/poligon/RustMixedOnPaint012_1k/RustMixedOnPaint012_COL_VAR1_1K.jpg"
        }),
        roughnessMap: new xeogl.Texture({
            src: "textures/materials/poligon/RustMixedOnPaint012_1k/RustMixedOnPaint012_REFL_1K.jpg"
        })
    }),
    geometry: new xeogl.SphereGeometry()
 });
 ````

 @class Lights
 @constructor
 @module xeogl
 @submodule lighting
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lights in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lights.
 @param [cfg.lights] {Array of String|Entity} Array of light source IDs or instances.
 @param [cfg.lightMap=undefined] {CubeTexture} A light map {{#crossLink "CubeTexture"}}{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Lights.
 @param [cfg.reflectionMap=undefined] {CubeTexture} A reflection map {{#crossLink "CubeTexture"}}{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Lights.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Lights = xeogl.Component.extend({

        type: "xeogl.Lights",

        _init: function (cfg) {

            // Renderer state contains the states of the child light source components
            this._state = new xeogl.renderer.Lights({
                lights: [],
                hash: ""
            });

            // Array of child light source components
            this._lights = [];

            // Subscriptions to "dirty" events from child light source components
            this._dirtySubs = [];

            // Subscriptions to "destroyed" events from child light source components
            this._destroyedSubs = [];

            // Add initial light source components
            if (cfg.lights) {
                this.lights = cfg.lights;
            }

            if (cfg.lightMap) {
                this.lightMap = cfg.lightMap;
            }

            if (cfg.reflectionMap) {
                this.reflectionMap = cfg.reflectionMap;
            }
        },

        _props: {

            /**
             * The light sources in this Lights.
             *
             * Note that when removing or inserting light sources, you must reassign this property to the modified array,
             * so that this Lights able to detect that lights sources were actually added or removed. For example:
             *
             * ````javascript
             * var lights = myLights.lights;
             * lights.push(new xeogl.PointLight({...}));
             * myLights.lights = lights; // This way, the xeogl.Lights component is able to detect that the new light was added.
             * ````
             *
             * We'll be able to relax this once JavaScript gets the (proper) ability to observe array updates.
             *
             * Fires a {{#crossLink "Lights/lights:event"}}{{/crossLink}} event on change.
             *
             * @property lights
             * @default []
             * @type {{Array of AmbientLight, PointLight, DirLight or SpotLight}}
             */
            lights: {

                set: function (value) {

                    value = value || [];

                    var light;
                    var i;
                    var len;

                    // Unsubscribe from events on old lights

                    for (i = 0, len = this._lights.length; i < len; i++) {

                        light = this._lights[i];

                        light.off(this._dirtySubs[i]);
                        light.off(this._destroyedSubs[i]);
                    }

                    this._lights = [];

                    this._dirtySubs = [];
                    this._destroyedSubs = [];

                    var self = this;

                    function lightDirty() {
                        self.fire("dirty", true);
                    }

                    function lightDestroyed() { // TODO: Cache this callback

                        var id = this.id; // Light ID

                        for (var i = 0, len = self._lights.length; i < len; i++) {

                            if (self._lights[i].id === id) {

                                self._lights = self._lights.slice(i, i + 1);
                                self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                                self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);

                                self.fire("dirty", true);
                                self.fire("lights", self._lights);

                                return;
                            }
                        }
                    }

                    for (i = 0, len = value.length; i < len; i++) {

                        light = value[i];

                        if (xeogl._isNumeric(light) || xeogl._isString(light)) {

                            // ID given for light - find the light component

                            var id = light;

                            light = this.scene.components[id];

                            if (!light) {
                                this.error("Component not found: " + xeogl._inQuotes(id));
                                continue;
                            }
                        }

                        var type = light.type;

                        if (type !== "xeogl.AmbientLight" && type !== "xeogl.DirLight" && type !== "xeogl.PointLight" && type !== "xeogl.SpotLight") {
                            this.error("Component " + xeogl._inQuotes(light.id) + " is not an xeogl.AmbientLight, xeogl.DirLight, xeogl.PointLight or xeogl.SpotLight");
                            continue;
                        }

                        this._lights.push(light);

                        this._dirtySubs.push(light.on("dirty", lightDirty));

                        this._destroyedSubs.push(light.on("destroyed", lightDestroyed));
                    }

                    this.fire("dirty", true);

                    this._renderer.setImageForceDirty(); // Triggers a re-render (to clear) even if there are no entities

                    /**
                     Fired whenever this Lights's {{#crossLink "Lights/lights:property"}}{{/crossLink}} property changes.

                     @event lights
                     @param value Number The property's new value
                     */
                    this.fire("lights", this._lights);
                },

                get: function () {
                    return this._lights;
                }
            },

            /**
             A {{#crossLink "CubeTexture"}}{{/crossLink}} that defines the brightness of the
             surfaces of attached {{#crossLink "Entities"}}{{/crossLink}}.

             Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Lights.

             Fires a {{#crossLink "Lights/lightMap:event"}}{{/crossLink}} event on change.

             @property lightMap
             @default undefined
             @type {CubeTexture}
             */
            lightMap: {

                set: function (texture) {

                    /**
                     Fired whenever this Lights's {{#crossLink "Lights/lightMap:property"}}{{/crossLink}} property changes.

                     @event lightMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.CubeTexture", "lightMap", texture);
                },

                get: function () {
                    return this._attached.lightMap;
                }
            },

            /**
             A {{#crossLink "CubeTexture"}}{{/crossLink}} that defines a background image that is reflected in the
             surfaces of attached {{#crossLink "Entities"}}{{/crossLink}}.

             Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Lights.

             Fires a {{#crossLink "Lights/reflectionMap:event"}}{{/crossLink}} event on change.

             @property reflectionMap
             @default undefined
             @type {CubeTexture}
             */
            reflectionMap: {

                set: function (texture) {

                    /**
                     Fired whenever this Lights's {{#crossLink "Lights/reflectionMap:property"}}{{/crossLink}} property changes.

                     @event reflectionMap
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.CubeTexture", "reflectionMap", texture);
                },

                get: function () {
                    return this._attached.reflectionMap;
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
            this._state[name] = component ? component._state : undefined; // FIXME: Accessing _state breaks encapsulation
            this._hashDirty = true;
        },

        _shadowsDirty: function () {
            var light;
            for (var i = 0, len = this._lights.length; i < len; i++) {
                light = this._lights[i]._state;
                if (light.shadow) {
                    light.shadowDirty = true;
                }
            }
        },

        _getState: function () {
            var state = this._state;
            state.lights = [];
            for (var i = 0, len = this._lights.length; i < len; i++) {
                state.lights.push(this._lights[i]._state);
            }
            this._makeHash();
            return state;
        },

        _makeHash: function () {

            var hash = [];

            var state = this._state;

            var lights = state.lights;

            var light;

            for (var i = 0, len = lights.length; i < len; i++) {
                light = lights[i];
                hash.push("/");
                hash.push(light.type);
                hash.push((light.space === "world") ? "w" : "v");
                if (light.shadow) {
                    hash.push("sh");
                }
            }

            if (state.lightMap) {
                hash.push("/lm");
            }

            if (state.reflectionMap) {
                hash.push("/rm");
            }

            hash.push(";");

            this._state.hash = hash.join("");
        },

        _destroy: function () {

            var i;
            var len;
            var light;

            for (i = 0, len = this._lights.length; i < len; i++) {

                light = this._lights[i];

                light.off(this._dirtySubs[i]);
                light.off(this._destroyedSubs[i]);
            }

            this._state.destroy();
        }
    });
})();
