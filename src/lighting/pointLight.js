/**
 A **PointLight** defines a positional light source that originates from a single point and spreads outward in all directions,
 to illuminate {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#lights_point_world_normalMap"><img src="http://i.giphy.com/3o6ZsZoFGIOJ2nlmN2.gif"></img></a>

 ## Overview

 * PointLights are grouped, along with other light source types, within a {{#crossLink "Lights"}}Lights{{/crossLink}} component,
 which belongs to a {{#crossLink "Scene"}}{{/crossLink}}.
 * PointLights have a position, but no direction.
 * PointLights may be defined in either **World** or **View** coordinate space. When in World-space, their positions
 are relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their positions are relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * PointLights have {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.

 ## Examples

 * [View-space positional three-point lighting](../../examples/#lights_point_view_threePoint)
 * [World-space positional three-point lighting](../../examples/#lights_point_world_threePoint)
 * [World-space point light and normal map](../../examples/#lights_point_world_normalMap)

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 PointLights, then create a Phong-shaded box entity.

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
    new xeogl.PointLight({
        pos: [-100, 0, 100],
        color: [0.3, 0.3, 0.5],
        intensity: .7
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
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

    var math = xeogl.math;

    xeogl.PointLight = xeogl.Component.extend({

        type: "xeogl.PointLight",

        _init: function (cfg) {

            var self = this;

            this._shadowRenderBuf = null;
            this._shadowViewMatrix = null;
            this._shadowProjMatrix = null;
            this._shadowViewMatrixDirty = true;
            this._shadowProjMatrixDirty = true;

            this._state = new xeogl.renderer.Light({
                type: "point",
                pos: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,attenuation: [0.0, 0.0, 0.0],
                space: "view",
                shadow: false,
                shadowDirty: true,

                getShadowViewMatrix: (function () {
                    var look = math.vec3([0,0,0]);
                    var up = math.vec3([0, 1, 0]);
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
                        var canvas = self.scene.canvas.canvas;
                        math.perspectiveMat4(70 *(Math.PI / 180.0), canvas.clientWidth / canvas.clientHeight, 0.1, 500.0, self._shadowProjMatrix);
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
            this.space = cfg.space;
            this.shadow = cfg.shadow;
        },

        _props: {

            /**
             The position of this PointLight.

             This will be either World- or View-space, depending on the value of {{#crossLink "PointLight/space:property"}}{{/crossLink}}.

             Fires a {{#crossLink "PointLight/pos:event"}}{{/crossLink}} event on change.

             @property pos
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            pos: {

                set: function (value) {

                    this._state.pos.set(value || [1.0, 1.0, 1.0]);

                    this._shadowViewMatrixDirty = true;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/pos:property"}}{{/crossLink}} property changes.
                     @event pos
                     @param value The property's new value
                     */
                    this.fire("pos", this._state.pos);
                },

                get: function () {
                    return this._state.pos;
                }
            },

            /**
             The color of this PointLight.

             Fires a {{#crossLink "PointLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    this._state.color.set(value || [0.7, 0.7, 0.8]);

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/color:property"}}{{/crossLink}} property changes.
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
             The intensity of this PointLight.

             Fires a {{#crossLink "PointLight/intensity:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this PointLight's  {{#crossLink "PointLight/intensity:property"}}{{/crossLink}} property changes.
                     * @event intensity
                     * @param value The property's new value
                     */
                    this.fire("intensity", this._state.intensity);
                },

                get: function () {
                    return this._state.intensity;
                }
            },

            /**
             The constant attenuation factor for this PointLight.

             Fires a {{#crossLink "PointLight/constantAttenuation:event"}}{{/crossLink}} event on change.

             @property constantAttenuation
             @default 0
             @type Number
             */
            constantAttenuation: {

                set: function (value) {

                    this._state.attenuation[0] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this PointLight's {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}} property changes.

                     @event constantAttenuation
                     @param value The property's new value
                     */
                    this.fire("constantAttenuation", this._state.attenuation[0]);
                },

                get: function () {
                    return this._state.attenuation[0];
                }
            },

            /**
             The linear attenuation factor for this PointLight.

             Fires a {{#crossLink "PointLight/linearAttenuation:event"}}{{/crossLink}} event on change.

             @property linearAttenuation
             @default 0
             @type Number
             */
            linearAttenuation: {

                set: function (value) {

                    this._state.attenuation[1] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} property changes.

                     @event linearAttenuation
                     @param value The property's new value
                     */
                    this.fire("linearAttenuation", this._state.attenuation[1]);
                },

                get: function () {
                    return this._state.attenuation[1];
                }
            },

            /**
             The quadratic attenuation factor for this Pointlight.

             Fires a {{#crossLink "PointLight/quadraticAttenuation:event"}}{{/crossLink}} event on change.

             @property quadraticAttenuation
             @default 0
             @type Number
             */
            quadraticAttenuation: {

                set: function (value) {

                    this._state.attenuation[2] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this PointLight's {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} property changes.

                     @event quadraticAttenuation
                     @param value The property's new value
                     */
                    this.fire("quadraticAttenuation", this._state.attenuation[2]);
                },

                get: function () {
                    return this._state.attenuation[2];
                }
            },

            /**
             Indicates which coordinate space this PointLight is in.

             Supported values are:


             * "view" - View space, aligned within the view volume as if fixed to the viewer's head
             * "world" - World space, fixed within the world, moving within the view volume with respect to camera


             Fires a {{#crossLink "PointLight/space:event"}}{{/crossLink}} event on change.

             @property space
             @default "view"
             @type String
             */
            space: {

                set: function (value) {

                    this._state.space = value || "view";

                    this.fire("dirty", true); // Need to rebuild shader

                    /**
                     Fired whenever this Pointlight's  {{#crossLink "PointLight/space:property"}}{{/crossLink}} property changes.

                     @event space
                     @param value The property's new value
                     */
                    this.fire("space", this._state.space);
                },

                get: function () {
                    return this._state.space;
                }
            },

            /**
             Flag which indicates if this PointLight casts a shadow.

             Fires a {{#crossLink "PointLight/shadow:event"}}{{/crossLink}} event on change.

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

                    /**
                     * Fired whenever this PointLight's {{#crossLink "PointLight/shadow:property"}}{{/crossLink}} property changes.
                     * @event shadow
                     * @param value The property's new value
                     */
                    this.fire("shadow", this._state.shadow);

                    this.fire("dirty", true);
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
        }
    });

})();
