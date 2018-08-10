/**
 An **AmbientLight** defines an ambient light source of fixed intensity and color that affects all {{#crossLink "Mesh"}}Meshes{{/crossLink}}
 equally.

 <a href="../../examples/#lights_ambient"><img src="http://i.giphy.com/l0HlGTxXQWMRVOPwk.gif"></img></a>

 ## Overview

 * When {{#crossLink "Mesh"}}Meshes{{/crossLink}} have {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}},
 AmbientLight {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}} is multiplied by
 PhongMaterial {{#crossLink "PhongMaterial/ambient:property"}}{{/crossLink}} at each rendered fragment of the {{#crossLink "Geometry"}}{{/crossLink}} surface.
 * When the Meshes have {{#crossLink "LambertMaterial"}}LambertMaterials{{/crossLink}},
 AmbientLight {{#crossLink "AmbientLight/color:property"}}color{{/crossLink}} is multiplied by
 LambertMaterial {{#crossLink "LambertMaterial/ambient:property"}}{{/crossLink}} for each rendered triangle of the Geometry surface (ie. flat shaded).
 * {{#crossLink "AmbientLight"}}{{/crossLink}}, {{#crossLink "DirLight"}}{{/crossLink}},
 {{#crossLink "SpotLight"}}{{/crossLink}} and {{#crossLink "PointLight"}}{{/crossLink}} instances are registered by ID
 on {{#crossLink "Scene/lights:property"}}Scene#lights{{/crossLink}} for convenient access.

 ## Examples

 * [Ambient light source](../../examples/#lights_ambient)

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 DirLights, then create a Phong-shaded box mesh.

 ````javascript
 new xeogl.AmbientLight({
    color: [0.8, 0.8, 0.8],
    intensity: 0.5
 });

 new xeogl.DirLight({
    dir: [-0.8, -0.4, -0.4],
    color: [0.4, 0.4, 0.5],
    intensity: 0.5,
    space: "view"
 });

 new xeogl.DirLight({
    dir: [0.2, -0.8, 0.8],
    color: [0.8, 0.8, 0.8],
    intensity: 0.5,
    space: "view"
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
            this.scene._lightCreated(this);
        },

        _props: {

            /**
             The color of this AmbientLight.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {
                set: function (value) {
                    this._state.color.set(value ||  [ 0.7, 0.7, 0.8 ]);
                    this._renderer.setImageForceDirty();
                },
                get: function () {
                    return this._state.color;
                }
            },

            /**
             The intensity of this AmbientLight.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {
                set: function (value) {
                    this._state.intensity = value !== undefined ? value :  1.0;
                    this._renderer.setImageForceDirty();
                },
                get: function () {
                    return this._state.intensity;
                }
            }
        },

        _destroy: function () {
            this.scene._lightDestroyed(this);
        }
    });

})();
