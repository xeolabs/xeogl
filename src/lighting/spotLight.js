/**
 A **SpotLight** defines a positional light source that originates from a single point and eminates in a given direction,
 to illuminate {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 * SpotLights are grouped, along with other light source types, within a {{#crossLink "Lights"}}Lights{{/crossLink}} component,
 which belongs to a {{#crossLink "Scene"}}{{/crossLink}}.
 * SpotLights have a position and direction.
 * SpotLights may be defined in either **World** or **View** coordinate space. When in World-space, their positions
 are relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their positions are relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * SpotLights have {{#crossLink "SpotLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "SpotLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "SpotLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.
 * A SpotLight can also have a {{#crossLink "Shadow"}}{{/crossLink}} component, to configure it to cast a shadow.

 ## Examples

    TODO

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 SpotLights, then create a Phong-shaded box entity.

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
     new xeogl.SpotLight({
         pos: [0, 100, 100],
         dir: [0, -1, 0],
         color: [0.5, 0.7, 0.5],
         intensity: 1
         constantAttenuation: 0,
         linearAttenuation: 0,
         quadraticAttenuation: 0,
         space: "view"
     }),
     new xeogl.PointLight({
         pos: [0, 100, 100],
         dir: [0, -1, 0],
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

 @class SpotLight
 @module xeogl
 @submodule lighting
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this SpotLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The SpotLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SpotLight.
 @param [cfg.pos=[ 1.0, 1.0, 1.0 ]] {Float32Array} Position, in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.dir=[ 0.0, -1.0, 0.0 ]] {Float32Array} Direction in which this Spotlight is shining, in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.color=[0.7, 0.7, 0.8 ]] {Float32Array} Color of this SpotLight.
 @param [cfg.intensity=1.0] {Number} Intensity of this SpotLight.
 @param [cfg.constantAttenuation=0] {Number} Constant attenuation factor.
 @param [cfg.linearAttenuation=0] {Number} Linear attenuation factor.
 @param [cfg.quadraticAttenuation=0] {Number} Quadratic attenuation factor.
 @param [cfg.space="view"] {String} The coordinate system this SpotLight is defined in - "view" or "world".
 @param [cfg.shadow=false] {Boolean} Flag which indicates if this SpotLight casts a shadow.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.SpotLight = xeogl.Component.extend({

        type: "xeogl.SpotLight",

        _init: function (cfg) {

            var self = this;

            this._shadowRenderBuf = null;
            this._shadowViewMatrix = null;
            this._shadowProjMatrix = null;
            this._shadowViewMatrixDirty = true;
            this._shadowProjMatrixDirty = true;

            this._state = new xeogl.renderer.Light({
                type: "spot",
                pos: math.vec3([1.0, 1.0, 1.0]),
                dir: math.vec3([0.0, -1.0, 0.0]),
                color: math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,
                attenuation: [0.0, 0.0, 0.0],
                space: "view",
                shadow: false,
                shadowDirty: true,

                getShadowViewMatrix: (function () {
                    var look = math.vec3();
                    var up = math.vec3([0, 1, 0]);
                    return function () {
                        if (self._shadowViewMatrixDirty) {
                            if (!self._shadowViewMatrix) {
                                self._shadowViewMatrix = math.identityMat4();
                            }
                            math.addVec3(self._state.pos, self._state.dir, look);
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
                        math.perspectiveMat4(60 *(Math.PI / 180.0), canvas.clientWidth / canvas.clientHeight, 0.1, 400.0, self._shadowProjMatrix);
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
             The position of this SpotLight.

             This will be either World- or View-space, depending on the value of {{#crossLink "SpotLight/space:property"}}{{/crossLink}}.

             Fires a {{#crossLink "SpotLight/pos:event"}}{{/crossLink}} event on change.

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
                     Fired whenever this SpotLight's  {{#crossLink "SpotLight/pos:property"}}{{/crossLink}} property changes.
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
             The direction in which the light is shining.

             Fires a {{#crossLink "SpotLight/dir:event"}}{{/crossLink}} event on change.

             @property dir
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            dir: {

                set: function (value) {

                    this._state.dir.set(value || [1.0, 1.0, 1.0]);

                    this._shadowViewMatrixDirty = true;
                    this._renderer.imageDirty();

                    /**
                     * Fired whenever this SpotLight's  {{#crossLink "SpotLight/dir:property"}}{{/crossLink}} property changes.
                     * @event dir
                     * @param value The property's new value
                     */
                    this.fire("dir", this._state.dir);
                },

                get: function () {
                    return this._state.dir;
                }
            },

            /**
             The color of this SpotLight.

             Fires a {{#crossLink "SpotLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    this._state.color.set(value || [0.7, 0.7, 0.8]);

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this SpotLight's  {{#crossLink "SpotLight/color:property"}}{{/crossLink}} property changes.
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
             The intensity of this SpotLight.

             Fires a {{#crossLink "SpotLight/intensity:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this SpotLight's  {{#crossLink "SpotLight/intensity:property"}}{{/crossLink}} property changes.
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
             The constant attenuation factor for this SpotLight.

             Fires a {{#crossLink "SpotLight/constantAttenuation:event"}}{{/crossLink}} event on change.

             @property constantAttenuation
             @default 0
             @type Number
             */
            constantAttenuation: {

                set: function (value) {

                    this._state.attenuation[0] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this SpotLight's {{#crossLink "SpotLight/constantAttenuation:property"}}{{/crossLink}} property changes.

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
             The linear attenuation factor for this SpotLight.

             Fires a {{#crossLink "SpotLight/linearAttenuation:event"}}{{/crossLink}} event on change.

             @property linearAttenuation
             @default 0
             @type Number
             */
            linearAttenuation: {

                set: function (value) {

                    this._state.attenuation[1] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this SpotLight's  {{#crossLink "SpotLight/linearAttenuation:property"}}{{/crossLink}} property changes.

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
             The quadratic attenuation factor for this SpotLight.

             Fires a {{#crossLink "SpotLight/quadraticAttenuation:event"}}{{/crossLink}} event on change.

             @property quadraticAttenuation
             @default 0
             @type Number
             */
            quadraticAttenuation: {

                set: function (value) {

                    this._state.attenuation[2] = value || 0.0;

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this SpotLight's {{#crossLink "SpotLight/quadraticAttenuation:property"}}{{/crossLink}} property changes.

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
             Indicates which coordinate space this SpotLight is in.

             Supported values are:


             * "view" - View space, aligned within the view volume as if fixed to the viewer's head
             * "world" - World space, fixed within the world, moving within the view volume with respect to camera


             Fires a {{#crossLink "SpotLight/space:event"}}{{/crossLink}} event on change.

             @property space
             @default "view"
             @type String
             */
            space: {

                set: function (value) {

                    this._state.space = value || "view";

                    this.fire("dirty", true); // Need to rebuild shader

                    /**
                     Fired whenever this SpotLight's  {{#crossLink "SpotLight/space:property"}}{{/crossLink}} property changes.

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
             Flag which indicates if this SpotLight casts a shadow.

             Fires a {{#crossLink "SpotLight/shadow:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this SpotLight's {{#crossLink "SpotLight/shadow:property"}}{{/crossLink}} property changes.
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
//            this.scene.canvas.off(this._webglContextRestored);

            if (this._shadowRenderBuf) {
                this._shadowRenderBuf.destroy();
            }
        }
    });

})();
