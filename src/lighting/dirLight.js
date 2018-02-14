/**
 A **DirLight** is a directional light source that illuminates all {{#crossLink "Entity"}}Entities{{/crossLink}} equally
 from a given direction.

 ## Overview

 * DirLights are grouped, along with other light source types, within a {{#crossLink "Lights"}}Lights{{/crossLink}} component,
 which belongs to a {{#crossLink "Scene"}}{{/crossLink}}.
 * DirLights have a direction, but no position.
 * The direction is the **direction that the light is emitted in**.
 * DirLights may be defined in either **World** or **View** coordinate space. When in World-space, their direction
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their direction is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * A DirLight can also have a {{#crossLink "Shadow"}}{{/crossLink}} component, to configure it to cast a shadow.

 ## Examples

 * [View-space directional three-point lighting](../../examples/#lights_directional_view_threePoint)
 * [World-space directional three-point lighting](../../examples/#lights_directional_world_threePoint)

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
        dir: [1, 1, 1],     // Direction the light is shining in
        color: [0.5, 0.7, 0.5],
        intensity: 1.0,
        space: "view",      // Other option is "world", for World-space
        shadow: false       // Default
     }),
 new xeogl.DirLight({
        dir: [0.2, -0.8, 0.8],
        color: [0.8, 0.8, 0.8],
        intensity: 0.5,
        space: "view",
        shadow: false
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
 @param [cfg.intensity=1.0 ] {Number} The intensity of this DirLight, as a factor in range ````[0..1]````.
 @param [cfg.space="view"] {String} The coordinate system the DirLight is defined in - "view" or "space".
 @param [cfg.shadow=false] {Boolean} Flag which indicates if this DirLight casts a shadow.
 @extends Component
 */
(function () {

    "use strict";

    var math = xeogl.math;

    xeogl.DirLight = xeogl.Component.extend({

        type: "xeogl.DirLight",

        _init: function (cfg) {

            var self = this;

            this._shadowRenderBuf = null;
            this._shadowViewMatrix = null;
            this._shadowProjMatrix = null;
            this._shadowViewMatrixDirty = true;
            this._shadowProjMatrixDirty = true;

            this._state = new xeogl.renderer.Light({
                type: "dir",
                dir: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,
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
                            var dir = self._state.dir;
                            math.lookAtMat4v([-dir[0], -dir[1], -dir[2]], [0, 0, 0], up, self._shadowViewMatrix);
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
                        xeogl.math.orthoMat4c(-10, 10, -10, 10, 0, 1000.0, self._shadowProjMatrix);
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

            this.dir = cfg.dir;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
            this.space = cfg.space;
            this.shadow = cfg.shadow;
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

                    this._shadowViewMatrixDirty = true;

                    this._renderer.imageDirty();

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

                    this._renderer.imageDirty();

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

                    this._renderer.imageDirty();

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
             Flag which indicates if this DirLight casts a shadow.

             Fires a {{#crossLink "DirLight/shadow:event"}}{{/crossLink}} event on change.

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
                     * Fired whenever this DirLight's {{#crossLink "DirLight/shadow:property"}}{{/crossLink}} property changes.
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
