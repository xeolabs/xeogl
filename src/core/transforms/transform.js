/**
 A **Transform** defines a modelling matrix to transform attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>
 <li>Sub-classes of Transform are: {{#crossLink "Translate"}}{{/crossLink}},
 {{#crossLink "Scale"}}{{/crossLink}}, {{#crossLink "Rotate"}}{{/crossLink}}, and {{#crossLink "Quaternion"}}{{/crossLink}}</li>
 <li>Can be connected into hierarchies with other {{#crossLink "Transform"}}Transforms{{/crossLink}} and sub-classes</li>
 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} are connected to leaf Transforms
 in the hierarchy, and will be transformed by each Transform on the path up to the
 root, in that order.</li>
 <li>See <a href="./Shader.html#inputs">Shader Inputs</a> for the variables that Transforms create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Transform.png"></img>

 ## Example

 TODO

 @class Transform
 @module XEO
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Transform in the
 default {{#crossLink "Scene"}}Scene{{/crossLink}}  when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Transform by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Transform.
 @param [cfg.parent] {String|XEO.Transform} ID or instance of a parent Transform within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.matrix=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Array of Number} One-dimensional, sixteen element array of elements for the Transform, an identity matrix by default.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Transform = XEO.Component.extend({

        type: "XEO.Transform",

        _init: function (cfg) {

            this._state = new XEO.renderer.ModelTransform({
                matrix: null,
                normalMatrix: null
            });

            this.parent = cfg.parent;
            this.matrix = cfg.matrix;
        },

        _props: {

            /**
             * The parent Transform.
             *
             * Fires a {{#crossLink "Transform/parent:event"}}{{/crossLink}} event on change.
             *
             * @property parent
             * @type Transform
             */
            parent: {

                set: function (value) {

                    this._parent = value;

                    /**
                     * Fired whenever this Transform's {{#crossLink "Transform/parent:property"}}{{/crossLink}} property changes.
                     * @event parent
                     * @param value The property's new value
                     */
                    this.fire("parent", this._parent);
                },

                get: function () {
                    return this._parent;
                }
            },

            /**
             * The elements of this Transform's matrix.
             *
             * Fires an {{#crossLink "Transform/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             * @type {Array of Number}
             */
            matrix: {

                set: function (value) {

                    value = value || [
                            1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1
                        ];

                    this._state.matrix = new Float32Array(value);

                    this._state.normalMatrix = new Float32Array(
                        XEO.math.transposeMat4(
                            new Float32Array(
                                XEO.math.inverseMat4(
                                    this._state.matrix, this._state.normalMatrix), this._state.normalMatrix)));

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Transform's {{#crossLink "Transform/matrix:property"}}{{/crossLink}} property changes.
                     * @event matrix
                     * @param value The property's new value
                     */
                    this.fire("matrix", this._state.matrix);
                },

                get: function () {
                    return this._state.matrix;
                }
            }
        },

        _compile: function () {                    
          this._renderer.modelTransform = this._state;
        },

        _getJSON: function () {
            return {
                matrix: Array.prototype.slice.call(this._state.matrix)
            };
        }
    });

})();
