/**
 A **PointLight** defines a positional light source that originates from a single point and spreads outward in all directions,
 to illuminate {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 <a href="../../examples/#lights_point_world_normalMap"><img src="http://i.giphy.com/3o6ZsZoFGIOJ2nlmN2.gif"></img></a>

 ## Overview

 * PointLights have a position, but no direction.
 * PointLights may be defined in either **World** or **View** coordinate space. When in World-space, their positions
 are relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their positions are relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * PointLights have {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.
 * {{#crossLink "AmbientLight"}}{{/crossLink}}, {{#crossLink "DirLight"}}{{/crossLink}},
 {{#crossLink "SpotLight"}}{{/crossLink}} and {{#crossLink "PointLight"}}{{/crossLink}} instances are registered by ID
 on {{#crossLink "Scene/lights:property"}}Scene#lights{{/crossLink}} for convenient access.

 ## Examples

 * [View-space positional three-point lighting](../../examples/#lights_point_view_threePoint)
 * [World-space positional three-point lighting](../../examples/#lights_point_world_threePoint)
 * [World-space point light and normal map](../../examples/#lights_point_world_normalMap)

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 PointLights, then create a Phong-shaded box mesh.

 ````javascript
 new xeogl.AmbientLight({
        color: [0.8, 0.8, 0.8],
        intensity: 0.5
    });

 new xeogl.PointLight({
        pos: [-100, 0, 100],
        color: [0.3, 0.3, 0.5],
        intensity: .7
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
    });

 new xeogl.PointLight({
        pos: [0, 100, 100],
        color: [0.5, 0.7, 0.5],
        intensity: 1
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
    });

 // Create box mesh
 new xeogl.Mesh({
    material: new xeogl.PhongMaterial({
        ambient: [0.5, 0.5, 0.5],
        diffuse: [1,0.3,0.3]
    }),
    geometry: new xeogl.BoxGeometry()
 });
 ````


 @class PointLight
 @module xeogl
 @submodule lighting
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PointLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PointLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PointLight.
 @param [cfg.pos=[ 1.0, 1.0, 1.0 ]] {Float32Array} Position, in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.color=[0.7, 0.7, 0.8 ]] {Float32Array} Color of this PointLight.
 @param [cfg.intensity=1.0] {Number} Intensity of this PointLight, as a factor in range ````[0..1]````.
 @param [cfg.constantAttenuation=0] {Number} Constant attenuation factor.
 @param [cfg.linearAttenuation=0] {Number} Linear attenuation factor.
 @param [cfg.quadraticAttenuation=0] {Number} Quadratic attenuation factor.
 @param [cfg.space="view"] {String} The coordinate system this PointLight is defined in - "view" or "world".
 @param [cfg.shadow=false] {Boolean} Flag which indicates if this PointLight casts a shadow.
 */
(function () {

    "use strict";

    const math = xeogl.math;

    xeogl.PointLight = xeogl.Component.extend({

        type: "xeogl.PointLight",

        _init: function (cfg) {

            const self = this;

            this._shadowRenderBuf = null;
            this._shadowViewMatrix = null;
            this._shadowProjMatrix = null;
            this._shadowViewMatrixDirty = true;
            this._shadowProjMatrixDirty = true;

            this._state = new xeogl.renderer.State({
                type: "point",
                pos: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0, attenuation: [0.0, 0.0, 0.0],
                space: cfg.space || "view",
                shadow: false,
                shadowDirty: true,

                getShadowViewMatrix: (function () {
                    const look = math.vec3([0, 0, 0]);
                    const up = math.vec3([0, 1, 0]);
                    return function () {
                        if (self._shadowViewMatrixDirty) {
                            if (!self._shadowViewMatrix) {
                                self._shadowViewMatrix = math.identityMat4();
                            }
                            math.lookAtMat4v(self._state.pos, look, up, self._shadowViewMatrix);
                            self._shadowViewMatrixDirty = false;
                        }
                        return self._shadowViewMatrix;
                    };
                })(),

                getShadowProjMatrix: function () {
                    if (self._shadowProjMatrixDirty) { // TODO: Set when canvas resizes
                        if (!self._shadowProjMatrix) {
                            self._shadowProjMatrix = math.identityMat4();
                        }
                        const canvas = self.scene.canvas.canvas;
                        math.perspectiveMat4(70 * (Math.PI / 180.0), canvas.clientWidth / canvas.clientHeight, 0.1, 500.0, self._shadowProjMatrix);
                        self._shadowProjMatrixDirty = false;
                    }
                    return self._shadowProjMatrix;
                },

                getShadowRenderBuf: function () {
                    if (!self._shadowRenderBuf) {
                        self._shadowRenderBuf = new xeogl.renderer.RenderBuffer(self.scene.canvas.canvas, self.scene.canvas.gl);
                    }
                    return self._shadowRenderBuf;
                }
            });

            this.pos = cfg.pos;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
            this.constantAttenuation = cfg.constantAttenuation;
            this.linearAttenuation = cfg.linearAttenuation;
            this.quadraticAttenuation = cfg.quadraticAttenuation;
            this.shadow = cfg.shadow;

            this.scene._lightCreated(this);
        },

        _props: {

            /**
             The position of this PointLight.

             This will be either World- or View-space, depending on the value of {{#crossLink "PointLight/space:property"}}{{/crossLink}}.

             @property pos
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            pos: {
                set: function (value) {
                    this._state.pos.set(value || [1.0, 1.0, 1.0]);
                    this._shadowViewMatrixDirty = true;
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.pos;
                }
            },

            /**
             The color of this PointLight.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {
                set: function (value) {
                    this._state.color.set(value || [0.7, 0.7, 0.8]);
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.color;
                }
            },

            /**
             The intensity of this PointLight.

             @property intensity
             @default 1.0
             @type Number
             */
            intensity: {
                set: function (value) {
                    value = value !== undefined ? value : 1.0;
                    this._state.intensity = value;
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.intensity;
                }
            },

            /**
             The constant attenuation factor for this PointLight.

             @property constantAttenuation
             @default 0
             @type Number
             */
            constantAttenuation: {
                set: function (value) {
                    this._state.attenuation[0] = value || 0.0;
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.attenuation[0];
                }
            },

            /**
             The linear attenuation factor for this PointLight.

             @property linearAttenuation
             @default 0
             @type Number
             */
            linearAttenuation: {
                set: function (value) {
                    this._state.attenuation[1] = value || 0.0;
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.attenuation[1];
                }
            },

            /**
             The quadratic attenuation factor for this Pointlight.

             @property quadraticAttenuation
             @default 0
             @type Number
             */
            quadraticAttenuation: {
                set: function (value) {
                    this._state.attenuation[2] = value || 0.0;
                    this._renderer.imageDirty();
                },
                get: function () {
                    return this._state.attenuation[2];
                }
            },

            /**
             Flag which indicates if this PointLight casts a shadow.

             @property shadow
             @default false
             @type Boolean
             */
            shadow: {
                set: function (value) {
                    value = !!value;
                    if (this._state.shadow === value) {
                        return;
                    }
                    this._state.shadow = value;
                    this._shadowViewMatrixDirty = true;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.shadow;
                }
            }
        },

        _destroy: function () {
            if (this._shadowRenderBuf) {
                this._shadowRenderBuf.destroy();
            }
            this.scene._lightDestroyed(this);
        }
    });

})();
