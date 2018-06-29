/**
 A **CustomProjection** defines a projection for a {{#crossLink "Camera"}}Camera{{/crossLink}} as a custom 4x4 matrix..

 ## Overview

 * A {{#crossLink "Camera"}}Camera{{/crossLink}} has a CustomProjection to configure its custom projection mode.
 * A CustomProjection lets us explicitly set the elements of its 4x4 transformation matrix.

 ## Examples

 * [Camera with a CustomProjection](../../examples/#camera_customProjection)

 ## Usage

 * See {{#crossLink "Camera"}}{{/crossLink}}

 @class CustomProjection
 @module xeogl
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this CustomProjection within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CustomProjection.
 @param [cfg.matrix=] {Float32Array} 4x4 transform matrix.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CustomProjection = xeogl.Component.extend({

        type: "xeogl.CustomProjection",

        _init: function (cfg) {
            this._state = new xeogl.renderer.State({
                matrix: xeogl.math.mat4()
            });
            this.matrix = cfg.matrix;
        },

        _props: {

            /**
             The CustomProjection's projection transform matrix.

             Fires a {{#crossLink "CustomProjection/matrix:event"}}{{/crossLink}} event on change.

             @property matrix
             @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             @type {Float32Array}
             */
            matrix: {
                set: function (matrix) {
                    this._state.matrix.set(matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
                    /**
                     Fired whenever this CustomProjection's {{#crossLink "CustomProjection/matrix:property"}}{{/crossLink}} property changes.

                     @event matrix
                     @param value The property's new value
                     */
                    this.fire("far", this._state.matrix);
                },
                get: function () {
                    return this._state.matrix;
                }
            }
        },

        _destroy: function () {
            this._state.destroy();
        }
    });
})();
