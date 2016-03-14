/**
 A **Projection** component defines a projection transformation as a 4x4 matrix.

 <ul>
 <li>Projection is the base class for (at least) the {{#crossLink "Perspective"}}{{/crossLink}} and {{#crossLink "Ortho"}}{{/crossLink}} components.</li>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair Projections with {{#crossLink "Lookat"}}Lookat{{/crossLink}} components.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Projection components create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Projection.png"></img>

 ## Examples

 <ul>
 <li>[Camera with perspective projection](../../examples/#camera_perspective)</li>
 </ul>

 ## Usage

 ````Javascript
 new XEO.Entity({

     camera: XEO.Camera({

         view: new XEO.Lookat({
             eye: [0, 0, -4],
             look: [0, 0, 0],
             up: [0, 1, 0]
         }),

         project: new XEO.Projection({
             matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         })
     }),

     geometry: new XEO.BoxGeometry()
 });
 ````

 @class Projection
 @module XEO
 @submodule camera
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Projection within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Projection.
 @param [cfg.matrix=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Array of Number} One-dimensional, sixteen element array of elements for the Transform, an identity matrix by default.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Projection = XEO.Component.extend({

        type: "XEO.Projection",

        _init: function (cfg) {

            this._state = new XEO.renderer.ProjTransform({
                matrix: XEO.math.identityMat4(XEO.math.mat4())
            });

            this.matrix = cfg.matrix;
        },

        _props: {

            /**
             * The Projection's matrix.
             *
             * Fires a {{#crossLink "Projection/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             * @type {Array of Number}
             */
            matrix: {

                set: function (value) {

                    value = value || XEO.math.identityMat4();

                    if (!this._matrix) {
                        this._matrix = XEO.math.mat4();
                    }

                    this._matrix.set(value);

                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Projection's {{#crossLink "Projection/matrix:property"}}{{/crossLink}} property changes.
                     * @event matrix
                     * @param value The property's new value
                     */
                    this.fire("matrix", this._matrix);
                },

                get: function () {
                    return this._matrix;
                }
            }
        },

        _compile: function () {
            this._renderer.modelProjection = this._state;
        },

        _getJSON: function () {
            return {
                matrix: Array.prototype.slice.call(this._matrix)
            };
        }
    });

})();
