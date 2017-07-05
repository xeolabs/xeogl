/**
 A **Outline** renders an outline around attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 TODO

 ## Usage

 ````javascript

 var outline = new xeogl.Outline({
    thickness: 15,      // Default
    color: [1,0,0]      // Default
 });

 new xeogl.Entity({
     geometry: new xeogl.TorusGeometry(),
     outline: outline,
     modes: new xeogl.Modes({
        outline: false  // Hide the outline (default)
     });
 });

 new xeogl.Entity({
     geometry: new xeogl.BoxGeometry(),
     outline: outline,
     modes: new xeogl.Modes({
        outline: true  // Show the outline
     });
 });
 ````

 @class Outline
 @module xeogl
 @submodule outline
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Outline within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Outline configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Outline.
 @param [cfg.thickness=15] {Number} Thickness of the outline in pixels.
 @param [cfg.color=[1,1,0]] {Float32Array} The RGB outline color.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Outline = xeogl.Component.extend({

        type: "xeogl.Outline",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Outline({
                thickness: 15,
                color: xeogl.math.vec3([1.0, 1.0, 0.0])
            });

            this.thickness = cfg.thickness;
            this.color = cfg.color;
        },

        _props: {

            /**
             * The Outline's thickness in pixels.
             *
             * Fires a {{#crossLink "Outline/thickness:event"}}{{/crossLink}} event on change.
             *
             * @property thickness
             * @default 15
             * @type Number
             */
            thickness: {

                set: function (value) {

                    // TODO: Only accept rendering thickness in range [0...MAX_thickness]

                    value = value || 15;

                    value = Math.round(value);


                    if (value === this._state.thickness) {
                        return;
                    }

                    this._state.thickness = value;

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Outline's  {{#crossLink "Outline/thickness:property"}}{{/crossLink}} property changes.
                     *
                     * @event thickness
                     * @param value The property's new value
                     */
                    this.fire("thickness", this._state.thickness);
                },

                get: function () {
                    return this._state.thickness;
                }
            },

            /**
             The Outline's RGB color.

             Fires a {{#crossLink "Outline/color:event"}}{{/crossLink}} event on change.

             @property color
             @default [1.0, 1.0, 0.0]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    var color = this._state.color;

                    if (!color) {
                        color = this._state.color = new Float32Array(3);

                    } else if (value && color[0] === value[0] && color[1] === value[1] && color[2] === value[2]) {
                        return;
                    }

                    if (value) {
                        color[0] = value[0];
                        color[1] = value[1];
                        color[2] = value[2];

                    } else {
                        color[0] = 1;
                        color[1] = 1;
                        color[2] = 0;
                    }

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Outline's {{#crossLink "Outline/color:property"}}{{/crossLink}} property changes.
                     *
                     * @event color
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("color", this._state.color);
                },

                get: function () {
                    return this._state.color;
                }
            }
        },

        _compile: function () {
            this._renderer.outline = this._state;
        },

        _getJSON: function () {
            return {
                thickness: this._state.thickness,
                color: xeogl.math.vecToArray(this._state.color)
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
