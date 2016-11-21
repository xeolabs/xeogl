/**
 A **DirLight** is a directional light source that illuminates all attached {{#crossLink "Entity"}}Entities{{/crossLink}} equally
 from a given direction.

 ## Overview

 * DirLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * DirLights have a direction, but no position.
 * DirLights may be defined in either **World** or **View** coordinate space. When in World-space, their direction
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their direction is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.

 <img src="../../../assets/images/DirLight.png"></img>

 ## Examples

 * [View-space directional light](../../examples/#lights_directional_view)
 * [World-space directional light](../../examples/#lights_directional_world)

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

 @extends Component
 */
(function () {

    "use strict";

    xeogl.DirLight = xeogl.Component.extend({

        type: "xeogl.DirLight",

        _init: function (cfg) {

            this._state = {
                type: "dir",
                dir: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([0.7, 0.7, 0.8]),
                intensity: 1.0,
                space: "view"
            };

            this.dir = cfg.dir;
            this.color = cfg.color;
            this.intensity = cfg.intensity;
            this.space = cfg.space;
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
            }
        },

        _getJSON: function () {
            return {
                type: this._state.type,
                dir: this._state.dir,
                color: this._state.color,
                intensity: this._state.intensity,
                space: this._state.space
            };
        }
    });

})();
