/**
 A **SpotLight** defines a positional light source that originates from a single point and eminates in a given direction, to illuminate attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

TODO

 ## Overview

 * SpotLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * SpotLights have a position and direction.
 * SpotLights may be defined in either **World** or **View** coordinate space. When in World-space, their positions
 are relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their positions are relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * SpotLights have {{#crossLink "SpotLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "SpotLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "SpotLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.
 * A SpotLight can also have a {{#crossLink "Shadow"}}{{/crossLink}} component, to configure it to cast a shadow.

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
                    space: "view"
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
 @param [cfg.shadows=false] {Boolean} Set true if this SpotLight casts shadows.
 @param [cfg.shadow=undefined] {Shadow} Defines a {{#crossLink "Shadow"}}{{/crossLink}} that is cast by this DirLight. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this DirLight.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.SpotLight = xeogl.Component.extend({

        type: "xeogl.SpotLight",

        _init: function (cfg) {

            var self = this;

            this._state = {
                type: "spot",
                pos: math.vec3([1.0, 1.0, 1.0]),
                dir: math.vec3([0.0, -1.0, 0.0]),
                color: math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,

                // Packaging constant, linear and quadratic attenuation terms
                // into an array for easy insertion into shaders as a vec3
                attenuation: [0.0, 0.0, 0.0],
                space: "view",

                shadow: null, // Shadow state, describes how to apply shadows

                // Set true whenever the shadow map needs re-rendering as a result of
                // associated Entities having moved or changed shape
                shadowDirty: true,

                getShadowViewMatrix: function () {
                    return self._getShadowViewMatrix();
                },

                getShadowProjMatrix: function () {
                    return self._getShadowProjMatrix();
                },

                getShadowRenderBuf: function () {
                    return self._getShadowRenderBuf();
                }
            };

            this.pos = cfg.pos;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
            this.constantAttenuation = cfg.constantAttenuation;
            this.linearAttenuation = cfg.linearAttenuation;
            this.quadraticAttenuation = cfg.quadraticAttenuation;
            this.space = cfg.space;
            this.shadow = cfg.shadow;
        },

        _getShadowViewMatrix: (function () {
            var look = math.vec3();
            var up = math.vec3([0, 1, 0]);
            return function () {
                if (!this._shadowViewMatrix) {
                    this._shadowViewMatrix = math.identityMat4();
                }
               // if (this._shadowViewMatrixDirty) {
                    math.addVec3(this._state.pos, this._state.dir, look);
                    math.lookAtMat4v(this._state.pos, look, up, this._shadowViewMatrix);
               // math.lookAtMat4v([0,-100, 0], [0,0,0], up, this._shadowViewMatrix);
                    this._shadowViewMatrixDirty = false;
             //   }
                return this._shadowViewMatrix;
            };
        })(),

        _getShadowProjMatrix: function () {
            if (!this._shadowProjMatrix) {
                this._shadowProjMatrix = math.identityMat4();
            }
            //if (this._shadowProjMatrixDirty) { // TODO: Set when canvas resizes
                var canvas = this.scene.canvas.canvas;
                math.perspectiveMat4(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0, this._shadowProjMatrix);
                this._shadowProjMatrixDirty = false;
           // }
            return this._shadowProjMatrix;
        },

        _getShadowRenderBuf: function () {
            if (!this._shadowRenderBuf) {
                this._shadowRenderBuf = new xeogl.renderer.webgl.RenderBuffer(this.scene.canvas.canvas, this.scene.canvas.gl);
            }
            return this._shadowRenderBuf;
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

                    this._shadowViewMatrixDirty = false;
                    this._renderer.imageDirty = true;

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

                    this._shadowViewMatrixDirty = false;
                    this._renderer.imageDirty = true;

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

                    this._renderer.imageDirty = true;

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

                    this._renderer.imageDirty = true;

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

                    this._renderer.imageDirty = true;

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

                    this._renderer.imageDirty = true;

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

                    this._renderer.imageDirty = true;

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

             Defines a {{#crossLink "Shadow"}}{{/crossLink}} that is cast by this SpotLight.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this SpotLight.

             Fires a {{#crossLink "SpotLight/shadow:event"}}{{/crossLink}} event on change.

             @property shadow
             @default undefined
             @type {Shadow}
             */
            shadow: {

                set: function (texture) {

                    /**
                     Fired whenever this SpotLight's {{#crossLink "SpotLight/shadow:property"}}{{/crossLink}} property changes.

                     @event shadow
                     @param value Number The property's new value
                     */
                    this._attachComponent("xeogl.Shadow", "shadow", texture);
                },

                get: function () {
                    return this._attached.shadow;
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
            this._state[name] = component ? component._state : null; // FIXME: Accessing _state breaks encapsulation
            this._hashDirty = true;
        },

        _getJSON: function () {
            var json = {
                type: this._state.type,
                pos: this._state.pos,
                dir: this._state.dir,
                color: this._state.color,
                intensity: this._state.intensity,
                constantAttenuation: this._state.attenuation[0],
                linearAttenuation: this._state.attenuation[1],
                quadraticAttenuation: this._state.attenuation[2],
                space: this._state.space
            };
            if (this._attached.shadow) {
                json.shadow = this._attached.shadow.id
            }
            return json;
        },

        _destroy: function () {
//            this.scene.canvas.off(this._webglContextRestored);

            if (this._shadowRenderBuf) {
                this._shadowRenderBuf.destroy();
            }
        }
    });

})();
