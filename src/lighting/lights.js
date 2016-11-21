/**
 A **Lights** defines a group of light sources that illuminate attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 A Lights may contain a virtually unlimited number of three types of light source:

 * {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}s, which are fixed-intensity and fixed-color, and
 affect all the {{#crossLink "Entity"}}Entities{{/crossLink}} equally,
 * {{#crossLink "PointLight"}}PointLight{{/crossLink}}s, which emit light that
 originates from a single point and spreads outward in all directions, and
 * {{#crossLink "DirLight"}}DirLight{{/crossLink}}s, which illuminate all the
 {{#crossLink "Entity"}}Entities{{/crossLink}} equally from a given direction

 <img src="../../../assets/images/Lights.png"></img>

 ## Usage

 ```` javascript
 var entity = new xeogl.Entity({

     lights: new xeogl.Lights({
         lights: [

             new xeogl.AmbientLight({
                 color: [0.7, 0.7, 0.7]
             })

             new xeogl.DirLight({
                 dir:         [-1, -1, -1],
                 color:       [0.5, 0.7, 0.5],
                 intensity:   1.0,
                 space:      "view"  // Other option is "world", for World-space
             }),

             new xeogl.PointLight({
                 pos: [0, 100, 100],
                 color: [0.5, 0.7, 0.5],
                 intensity: 1
                 constantAttenuation: 0,
                 linearAttenuation: 0,
                 quadraticAttenuation: 0,
                 space: "view"
             })
         ]
    }),

    material: new xeogl.PhongMaterial({
        ambient:    [0.3, 0.3, 0.3],
        diffuse:    [0.7, 0.7, 0.7],
        specular:   [1. 1, 1],
        shininess:  30
    }),

    geometry: new xeogl.BoxGeometry()
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
 @param [cfg.lights] {{Array of String|Entity}} Array of light source IDs or instances.
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

            this._dirty = true;

            // Array of child light source components
            this._lights = [];

            // Subscriptions to "dirty" events from child light source components
            this._dirtySubs = [];

            // Subscriptions to "destroyed" events from child light source components
            this._destroyedSubs = [];

            // Add initial light source components
            this.lights = cfg.lights;
        },

        _props: {

            /**
             The light sources in this Lights.

             That that, when removing or inserting light sources, you must reassign this property to the modified array,
             so that this Lights able to detect that lights sources were actually added or removed. For example:

             ````javascript
             var lights = myLights.lights;

             lights.push(new xeogl.PointLight({...}));

             myLights.lights = lights; // This way, the xeogl.Lights component is able to detect that the new light was added.
             ````

             We'll be able to relax this once JavaScript gets the (proper) ability to observe array updates.

             Fires a {{#crossLink "Lights/lights:event"}}{{/crossLink}} event on change.

             @property lights
             @default []
             @type {{Array of AmbientLight, PointLight and DirLight}}
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

                                self._dirty = true;

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

                        if (type !== "xeogl.AmbientLight" && type !== "xeogl.DirLight" && type !== "xeogl.PointLight") {
                            this.error("Component " + xeogl._inQuotes(light.id) + " is not an xeogl.AmbientLight, xeogl.DirLight or xeogl.PointLight ");
                            continue;
                        }

                        this._lights.push(light);

                        this._dirtySubs.push(light.on("dirty", lightDirty));

                        this._destroyedSubs.push(light.on("destroyed", lightDestroyed));
                    }

                    this._dirty = true;

                    this.fire("dirty", true);
                    this.fire("lights", this._lights);
                },

                get: function () {
                    return this._lights;
                }
            }
        },

        _compile: function () {

            var state = this._state;

            if (this._dirty) {

                state.lights = [];

                for (var i = 0, len = this._lights.length; i < len; i++) {
                    state.lights.push(this._lights[i]._state);
                }

                this._makeHash();

                this._dirty = false;
            }

            this._renderer.lights = state;
        },

        _makeHash: function () {

            var lights = this._state.lights;

            if (lights.length === 0) {
                return ";";
            }

            var hash = [];
            var light;

            for (var i = 0, len = lights.length; i < len; i++) {

                light = lights[i];

                hash.push(light.type);
                hash.push((light.space === "world") ? "w" : "v");
            }

            hash.push(";");

            this._state.hash = hash.join("");
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
