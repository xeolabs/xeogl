/**
 An **AmbientLight** defines an ambient light source of fixed intensity and color that affects all {{#crossLink "Entity"}}Entities{{/crossLink}}
 equally.

 <a href="../../examples/#lights_ambient"><img src="http://i.giphy.com/l0HlGTxXQWMRVOPwk.gif"></img></a>

 ## Overview

 * AmbientLights are grouped, along with other light source types, within a {{#crossLink "Lights"}}Lights{{/crossLink}} component,
 which belongs to a {{#crossLink "Scene"}}{{/crossLink}}.
 * When the {{#crossLink "Entity"}}Entities{{/crossLink}} have {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}},
 AmbientLight {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}} is multiplied by
 PhongMaterial {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} at each rendered fragment of the {{#crossLink "Geometry"}}{{/crossLink}} surface.
 * When the Entities have {{#crossLink "LambertMaterial"}}LambertMaterials{{/crossLink}},
 AmbientLight {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}} is multiplied by
 LambertMaterial {{#crossLink "LambertMaterial/ambient:property"}}{{/crossLink}} for each rendered triangle of the Geometry surface (ie. flat shaded).

 ## Examples

 * [Ambient light source](../../examples/#lights_ambient)

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 DirLights, then create a Phong-shaded box entity.

 ````javascript

 // We're using the default xeogl Scene
 // Get Scene's Lights
 var lights = xeogl.scene.lights;

 // Customize the light sources
 lights.lights = [
    new xeogl.AmbientLight({
        color: [0.8, 0.8, 0.8],
        intensity: 0.5
    }),
    new xeogl.DirLight({
        dir: [-0.8, -0.4, -0.4],
        color: [0.4, 0.4, 0.5],
        intensity: 0.5,
        space: "view"
    }),
    new xeogl.DirLight({
        dir: [0.2, -0.8, 0.8],
        color: [0.8, 0.8, 0.8],
        intensity: 0.5,
        space: "view"
    })
 ];

 // Create box entity
 new xeogl.Entity({
    material: new xeogl.PhongMaterial({
        ambient: [0.5, 0.5, 0.5],
        diffuse: [1,0.3,0.3]
    }),
    geometry: new xeogl.BoxGeometry()
 });
 ````

 @class AmbientLight
 @module xeogl
 @submodule lighting
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this AmbientLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} AmbientLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AmbientLight.
 @param [cfg.color=[0.7, 0.7, 0.8]] {Array(Number)} The color of this AmbientLight.
 @param [cfg.intensity=[1.0]] {Number} The intensity of this AmbientLight, as a factor in range ````[0..1]````.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.AmbientLight = xeogl.Component.extend({

        type: "xeogl.AmbientLight",

        _init: function (cfg) {

            this._state = {
                type: "ambient",
                color: xeogl.math.vec3([0.7, 0.7, 0.7]),
                intensity: 1.0
            };

            this.color = cfg.color;
            this.intensity = cfg.intensity;
        },

        _props: {

            /**
             The color of this AmbientLight.

             Fires an {{#crossLink "AmbientLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    this._state.color.set(value ||  [ 0.7, 0.7, 0.8 ]);

                    this._renderer.setImageForceDirty();

                    /**
                     Fired whenever this AmbientLight's {{#crossLink "AmbientLight/color:property"}}{{/crossLink}} property changes.

                     @event color
                     @param value The property's new value
                     */
                    this.fire("color", this._state.color);
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
             The intensity of this AmbientLight.

             Fires a {{#crossLink "AmbientLight/intensity:event"}}{{/crossLink}} event on change.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {

                set: function (value) {

                    this._state.intensity = value !== undefined ? value :  1.0;

                    this._renderer.setImageForceDirty();

                    /**
                     * Fired whenever this AmbientLight's  {{#crossLink "AmbientLight/intensity:property"}}{{/crossLink}} property changes.
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
