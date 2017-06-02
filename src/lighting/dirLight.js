/**
 A **DirLight** is a directional light source that illuminates all attached {{#crossLink "Entity"}}Entities{{/crossLink}} equally
 from a given direction.

 ## Overview

 * DirLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * DirLights have a direction, but no position.
 * The direction is the **direction that the light is emitted in**.
 * DirLights may be defined in either **World** or **View** coordinate space. When in World-space, their direction
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their direction is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * A DirLight can also have a {{#crossLink "Shadow"}}{{/crossLink}} component, to configure it to cast a shadow.

 <img src="../../../assets/images/DirLight.png"></img>

 ## Examples

 * [View-space directional three-point lighting](../../examples/#lights_directional_view_threePoint)
 * [World-space directional three-point lighting](../../examples/#lights_directional_world_threePoint)

 ## Usage

 ```` javascript
 var entity = new xeogl.Entity({

    lights: new xeogl.Lights({
        lights: [
            new xeogl.DirLight({

                // Note that this is the direction the light is shining,
                // not the direction to the light source

                dir:         [1, 1, 1],
                color:       [0.5, 0.7, 0.5],
                intensity:   1.0,
                space:      "view"  // Other option is "world", for World-space
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

 @class DirLight
 @module xeogl
 @submodule lighting
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this DirLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The DirLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DirLight.
 @param [cfg.dir=[1.0, 1.0, 1.0]] {Float32Array} A unit vector indicating the direction that the light is shining,
 given in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.color=[0.7, 0.7, 0.8 ]] {Float32Array} The color of this DirLight.
 @param [cfg.intensity=1.0 ] {Number} The intensity of this DirLight.
 @param [cfg.space="view"] {String} The coordinate system the DirLight is defined in - "view" or "space".
 @param [cfg.shadow=undefined] {Shadow} Defines a {{#crossLink "Shadow"}}{{/crossLink}} that is cast by this DirLight. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this DirLight.
 @extends Component
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.DirLight = xeogl.Component.extend({

        type: "xeogl.DirLight",

        _init: function (cfg) {

            var self = this;

            this._state = {
                type: "dir",
                dir: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,
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

            this.dir = cfg.dir;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
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
            //    math.addVec3(this._state.pos, this._state.dir, look);
                //math.lookAtMat4v(this._state.pos, look, up, this._shadowViewMatrix);
                 math.lookAtMat4v([0,-100, 0], [0,0,0], up, this._shadowViewMatrix);
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
             The direction in which the light is shining.

             Fires a {{#crossLink "DirLight/dir:event"}}{{/crossLink}} event on change.

             @property dir
             @default [1.0, 1.0, 1.0]
             @type Float32Array
             */
            dir: {

                set: function (value) {

                    this._state.dir.set(value || [1.0, 1.0, 1.0]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/dir:property"}}{{/crossLink}} property changes.
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
             The color of this DirLight.

             Fires a {{#crossLink "DirLight/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [0.7, 0.7, 0.8]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    this._state.color.set(value || [0.7, 0.7, 0.8]);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/color:property"}}{{/crossLink}} property changes.
                     * @event color
                     * @param value The property's new value
                     */
                    this.fire("color", this._state.color);
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
             The intensity of this DirLight.

             Fires a {{#crossLink "DirLight/intensity:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/intensity:property"}}{{/crossLink}} property changes.
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
             Specifies which coordinate space this DirLight is in.

             Supported values are:


             * "view" - View space, aligned within the view volume as if fixed to the viewer's head
             * "world" - World space, fixed within the world, moving within the view volume with respect to camera


             Fires a {{#crossLink "DirLight/space:event"}}{{/crossLink}} event on change.

             @property space
             @default "view"
             @type String
             */
            space: {

                set: function (value) {

                    this._state.space = value || "view";

                    this.fire("dirty", true); // Need to rebuild shader

                    /**
                     * Fired whenever this DirLight's {{#crossLink "DirLight/space:property"}}{{/crossLink}} property changes.
                     * @event space
                     * @param value The property's new value
                     */
                    this.fire("space", this._state.space);
                },

                get: function () {
                    return this._state.space;
                }
            },

            /**

             Defines a {{#crossLink "Shadow"}}{{/crossLink}} that is cast by this DirLight.

             Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this DirLight.

             Fires a {{#crossLink "DirLight/shadow:event"}}{{/crossLink}} event on change.

             @property shadow
             @default undefined
             @type {Shadow}
             */
            shadow: {

                set: function (texture) {

                    /**
                     Fired whenever this DirLight's {{#crossLink "DirLight/shadow:property"}}{{/crossLink}} property changes.

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
            var vecToArray = xeogl.math.vecToArray;
            var json = {
                type: this._state.type,
                dir: vecToArray(this._state.dir),
                color: vecToArray(this._state.color),
                intensity: this._state.intensity,
                space: this._state.space
            };
            if (this._attached.shadow) {
                json.shadow = this._attached.shadow.id
            }
            return json;
        }
    });

})();
