/**
 A **Projection** component defines a projection transformation.

 ## Overview

 <ul>
 <li>Projection is the base class for (at least) the {{#crossLink "Perspective"}}{{/crossLink}} and {{#crossLink "Ortho"}}{{/crossLink}} types.</li>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair Projections with {{#crossLink "Lookat"}}Lookat{{/crossLink}} components.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Projection components create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Projection.png"></img>

 ## Example

 In this example we have an {{#crossLink "Entity"}}Entity{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} and a
 Projection:

 ````Javascript
 var entity = new XEO.Entity({

        camera: new XEO.Camera({

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

 var scene = entity.scene;
 var view = entity.camera.view;

 scene.on("tick",
    function () {
        view.rotateEyeY(0.5);
        view.rotateEyeX(0.3);
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
