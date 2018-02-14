/**
 A **Shadow** defines a shadow cast by a {{#crossLink "DirLight"}}{{/crossLink}} or a {{#crossLink "SpotLight"}}{{/crossLink}}.

 Work in progress!

 ## Overview

 * Shadows are attached to {{#crossLink "DirLight"}}{{/crossLink}} and {{#crossLink "SpotLight"}}{{/crossLink}} components.

 TODO

 ## Examples

 TODO

 ## Usage

 ```` javascript
 var entity = new xeogl.Entity(scene, {

        lights: new xeogl.Lights({
            lights: [

                new xeogl.SpotLight({
                    pos: [0, 100, 100],
                    dir: [0, -1, 0],
                    color: [0.5, 0.7, 0.5],
                    intensity: 1
                    constantAttenuation: 0,
                    linearAttenuation: 0,
                    quadraticAttenuation: 0,
                    space: "view",

                    shadow: new xeogl.Shadow({
                        resolution: [1000, 1000],
                        intensity: 0.7,
                        sampling: "stratified" // "stratified" | "poisson" | "basic"
                    });
                })
            ]
        }),
 ,
        material: new xeogl.PhongMaterial({
            diffuse: [0.5, 0.5, 0.0]
        }),

        geometry: new xeogl.BoxGeometry()
  });
 ````

 @class Shadow
 @module xeogl
 @submodule lighting
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Shadow within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The Shadow configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Shadow.
 @param [cfg.resolution=[1000,1000]] {Uint16Array} Resolution of the texture map for this Shadow.
 @param [cfg.intensity=1.0] {Number} Intensity of this Shadow.
 */
(function () {

    "use strict";

    xeogl.Shadow = xeogl.Component.extend({

        type: "xeogl.Shadow",

        _init: function (cfg) {

            this._state = {
                resolution: xeogl.math.vec3([1000, 1000]),
                intensity: 1.0
            };

            this.resolution = cfg.resolution;
            this.intensity = cfg.intensity;
        },

        _props: {

            /**
             The resolution of the texture map for this Shadow.

             This will be either World- or View-space, depending on the value of {{#crossLink "Shadow/space:property"}}{{/crossLink}}.

             Fires a {{#crossLink "Shadow/resolution:event"}}{{/crossLink}} event on change.

             @property resolution
             @default [1000, 1000]
             @type Uint16Array
             */
            resolution: {

                set: function (value) {

                    this._state.resolution.set(value || [1000.0, 1000.0]);

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this Shadow's  {{#crossLink "Shadow/resolution:property"}}{{/crossLink}} property changes.
                     @event resolution
                     @param value The property's new value
                     */
                    this.fire("resolution", this._state.resolution);
                },

                get: function () {
                    return this._state.resolution;
                }
            },
            
            /**
             The intensity of this Shadow.

             Fires a {{#crossLink "Shadow/intensity:event"}}{{/crossLink}} event on change.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {

                set: function (value) {

                    value = value !== undefined ? value : 1.0;

                    this._state.intensity = value;

                    this._renderer.imageDirty();

                    /**
                     * Fired whenever this Shadow's  {{#crossLink "Shadow/intensity:property"}}{{/crossLink}} property changes.
                     * @event intensity
                     * @param value The property's new value
                     */
                    this.fire("intensity", this._state.intensity);
                },

                get: function () {
                    return this._state.intensity;
                }
            }
        }
    });

})();
