(function () {

    "use strict";

    /**
     A **Transform** defines a modelling transform matrix for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     <ul>
     <li>Sub-classes of Transform are: {{#crossLink "Translate"}}{{/crossLink}},
     {{#crossLink "Scale"}}{{/crossLink}}, {{#crossLink "Rotate"}}{{/crossLink}}, and {{#crossLink "Quaternion"}}{{/crossLink}}</li>
     <li>Can be connected into hierarchies with other {{#crossLink "Transform"}}Transforms{{/crossLink}} and sub-classes</li>
     <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} are connected to leaf Transforms
     in the hierarchy, and will be transformed by each Transform on the path up to the
     root, in that order.</li>
     </ul>

     <img src="http://www.gliffy.com/go/publish/image/7123375/L.png"></img>

     ## Example

     @class Transform
     @module XEO
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
    XEO.Transform = XEO.Component.extend({

        className: "XEO.Transform",

        type: "transform",

        _init: function (cfg) {

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
                    this.fire("parent", value);
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
                    value = value || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                    this._state.matrix = value;
                    this._dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Transform's {{#crossLink "Transform/matrix:property"}}{{/crossLink}} property changes.
                     * @event matrix
                     * @param value The property's new value
                     */
                    this.fire("matrix", value);
                },

                get: function () {
                    return this._state.matrix;
                }
            }
        },

        _compile: function () {
            //this._renderer.cameraMat = this._state;
        },

        _getJSON: function () {
            return {
                matrix: this._state.matrix
            };
        }
    });

})();
