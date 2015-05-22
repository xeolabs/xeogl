/**
 A **Lights** defines a group of light sources that illuminate attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 A Lights may contain a virtually unlimited number of three types of light source:

 <ul>
 <li>{{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}s, which are fixed-intensity and fixed-color, and
 affect all the {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally,</li>
 <li>{{#crossLink "PointLight"}}PointLight{{/crossLink}}s, which emit light that
 originates from a single point and spreads outward in all directions, and </li>
 <li>{{#crossLink "DirLight"}}DirLight{{/crossLink}}s, which illuminate all the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally from a given direction</li>
 </ul>

 Within xeoEngine's <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model, ambient,
 diffuse and specular light sources are multiplied by the {{#crossLink "Material/ambient:property"}}{{/crossLink}},
 {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and {{#crossLink "Material/specular:property"}}{{/crossLink}}
 properties, respectively, on the {{#crossLink "Material"}}Materials{{/crossLink}} attached to
 the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.


 <img src="../../../assets/images/Lights.png"></img>

 ## Example

 In this example we have a {{#crossLink "GameObject"}}{{/crossLink}} that has a {{#crossLink "Geometry"}}{{/crossLink}},
 a {{#crossLink "Material"}}{{/crossLink}} and a {{#crossLink "Lights"}}{{/crossLink}}. The {{#crossLink "Lights"}}{{/crossLink}}
 contains an {{#crossLink "AmbientLight"}}{{/crossLink}}, a {{#crossLink "DirLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}}.


 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
});

 // Within xeoEngine's lighting calculations, the AmbientLight's ambient color
 // will be multiplied by the Material's ambient color, while the DirLight and PointLight's
 // diffuse and specular colors will be multiplied by the Material's diffuse and specular colors

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
});

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"
});

 var pointLight = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0],
    constantAttenuation: 0,
    linearAttenuation: 0,
    quadraticAttenuation: 0,
    space: "view"
});

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        dirLight,
        pointLight
    ]
});

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````


 @class Lights
 @constructor
 @module XEO
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lights in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lights.
 @param [cfg.lights] {{Array of String|GameObject}} Array of light source IDs or instances.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Lights = XEO.Component.extend({

        className: "XEO.Lights",

        type: "lights",

        _init: function (cfg) {

            this._state = this._renderer.createState({
                lights: [],
                numLights: 0,
                hash: ""
            });

            this._lights = [];
            this._dirtySubs = [];
            this._destroyedSubs = [];

            this.lights = cfg.lights;
        },

        _props: {

            /**
             The light sources in this Lights.

             Fires a {{#crossLink "Lights/lights:event"}}{{/crossLink}} event on change.

             @property lights
             @default []
             @type {{Array of AmbientLight, PointLight and DirLight}}
             */
            lights: {

                set: function (value) {

                    value = value || [];

                    var light;

                    // Unsubscribe from events on old lights
                    for (var i = 0, len = this._lights.length; i < len; i++) {
                        light = this._lights[i];
                        light.off(this._dirtySubs[i]);
                        light.off(this._destroyedSubs[i]);
                    }

                    this._lights = [];
                    this._dirtySubs = [];
                    this._destroyedSubs = [];

                    var lights = [];
                    var self = this;

                    function lightDirty() {
                        self.fire("dirty", true);
                    }

                    function lightDestroyed() {
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

                    for (var i = 0, len = value.length; i < len; i++) {

                        light = value[i];

                        if (XEO._isString(light)) {

                            // ID given for light - find the light component

                            var id = light;
                            light = this.viewer.components[id];
                            if (!light) {
                                this.error("Component with this ID not found: '" + id + "'");
                                continue;
                            }
                        }

                        if (light.type !== "light") {
                            this.error("Component with this ID is not a light source: '" + light.id + "'");
                            continue;
                        }

                        this._lights.push(light);

                        this._dirtySubs.push(light.on("dirty", lightDirty));

                        this._destroyedSubs.push(light.on("destroyed", lightDestroyed));

                        lights.push(light);
                    }

                    this.fire("dirty", true);
                    this.fire("lights", this._lights);
                },

                get: function () {
                    return this._lights.slice(0, this._lights.length);
                }
            }
        },

        _compile: function () {

            var state = this._state;
            var lights = state.lights;
            var numLights = this._lights.length;

            state.numLights = numLights;

            for (var i = 0; i < numLights; i++) {
                lights[i] = this._lights[i]._state;
            }

            this._state.hash = this._makeHash(lights, numLights);

            this._renderer.lights = this._state;
        },

        _makeHash: function (lights, numLights) {

            if (numLights === 0) {
                return "";
            }

            var parts = [];
            var light;

            for (var i = 0; i < numLights; i++) {

                light = lights[i];
                parts.push(light.mode);

                if (light.specular) {
                    parts.push("s");
                }

                if (light.diffuse) {
                    parts.push("d");
                }

                parts.push((light.space === "world") ? "w" : "v");
            }

            return parts.join("");
        },

        _getJSON: function () {

            var lightIds = [];

            for (var i = 0, len = this._lights.length; i < len; i++) {
                lightIds.push(this._lights[i].id);
            }

            return {
                lights: lightIds
            };
        },

        _destroy: function () {
            this._renderer.destroyState(this._state);
        }
    });
})();