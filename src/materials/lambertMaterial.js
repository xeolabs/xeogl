/**
 A **LambertMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the surface appearance of
 attached {{#crossLink "Entity"}}Entities{{/crossLink}} using
 the non-physically based <a href="https://en.wikipedia.org/wiki/Lambertian_reflectance">Lambertian</a> model for calculating reflectance.

 ## Examples

TODO

 ## Overview

 * Used for rendering non-realistic objects such as "helpers", wireframe objects, labels etc.
 * Use  {{#crossLink "PhongMaterial"}}{{/crossLink}} when you need specular highlights.
 * Use the physically based {{#crossLink "MetallicMaterial"}}{{/crossLink}} or {{#crossLink "SpecularMaterial"}}{{/crossLink}} when you need more realism.

 For LambertMaterial, the illumination calculation is performed at each triangle vertex, and the resulting color is
 interpolated across the face of the triangle. For {{#crossLink "PhongMaterial"}}{{/crossLink}}, {{#crossLink "MetallicMaterial"}}{{/crossLink}} and
 {{#crossLink "SpecularMaterial"}}{{/crossLink}}, vertex normals are interpolated across the surface of the triangle, and
 the illumination calculation is performed at each texel.

 The following table summarizes LambertMaterial properties:

 | Property | Type | Range | Default Value | Space | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 |  {{#crossLink "LambertMaterial/ambient:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the ambient light reflected by the material. |
 |  {{#crossLink "LambertMaterial/color:property"}}{{/crossLink}} | Array | [0, 1] for all components | [1,1,1,1] | linear | The RGB components of the diffuse light reflected by the material. |
 |  {{#crossLink "LambertMaterial/emissive:property"}}{{/crossLink}} | Array | [0, 1] for all components | [0,0,0] | linear | The RGB components of the light emitted by the material. |
 | {{#crossLink "LambertMaterial/alpha:property"}}{{/crossLink}} | Number | [0, 1] | 1 | linear | The transparency of the material surface (0 fully transparent, 1 fully opaque). |
 | {{#crossLink "LambertMaterial/lineWidth:property"}}{{/crossLink}} | Number | [0..100] | 1 |  | Line width in pixels. |
 | {{#crossLink "LambertMaterial/pointSize:property"}}{{/crossLink}} | Number | [0..100] | 1 |  | Point size in pixels. |
 | {{#crossLink "LambertMaterial/backfaces:property"}}{{/crossLink}} | Boolean |  | false |  | Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces. |
 | {{#crossLink "LambertMaterial/backfaces:property"}}{{/crossLink}} | String | "ccw", "cw" | "ccw" |  | The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} frontfaces - "cw" for clockwise, or "ccw" for counter-clockwise. |

 ## Usage

 ```` javascript
 var torus = new xeogl.Entity({
    material: new xeogl.LambertMaterial({
        ambient: [0.3, 0.3, 0.3],
        color: [0.5, 0.5, 0.0],
        alpha: 1.0 // Default
    }),

    geometry: new xeogl.TorusGeometry()
});
 ````
 @class LambertMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this LambertMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The LambertMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this LambertMaterial.
 @param [cfg.ambient=[1.0, 1.0, 1.0 ]] {Array of Number} LambertMaterial ambient color.
 @param [cfg.color=[ 1.0, 1.0, 1.0 ]] {Array of Number} LambertMaterial diffuse color.
 @param [cfg.emissive=[ 0.0, 0.0, 0.0 ]] {Array of Number} LambertMaterial emissive color.
 @param [cfg.alpha=1] {Number} Scalar in range 0-1 that controls alpha, where 0 is completely transparent and 1 is completely opaque.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.lineWidth=1] {Number} Scalar that controls the width of lines for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "lines".
 @param [cfg.pointSize=1] {Number} Scalar that controls the size of points for {{#crossLink "Geometry"}}{{/crossLink}} with {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} set to "points".
 @param [cfg.backfaces=false] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 */
(function () {

    "use strict";

    xeogl.LambertMaterial = xeogl.Material.extend({

        type: "xeogl.LambertMaterial",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new xeogl.renderer.LambertMaterial({

                type: "LambertMaterial",

                ambient: xeogl.math.vec3([1.0, 1.0, 1.0]),
                color: xeogl.math.vec3([1.0, 1.0, 1.0]),
                emissive: xeogl.math.vec3([0.0, 0.0, 0.0]),

                alpha: null,
                alphaMode: 0, // 2 ("blend") when transparent, so renderer knows when to add to transparency bin

                lineWidth: null,
                pointSize: null,

                backfaces: null,
                frontface: null, // Boolean for speed; true == "ccw", false == "cw"

                hash: "/lam;"
            });

            this.ambient = cfg.ambient;
            this.color = cfg.color;
            this.emissive = cfg.emissive;
            this.alpha = cfg.alpha;

            this.lineWidth = cfg.lineWidth;
            this.pointSize = cfg.pointSize;

            this.backfaces = cfg.backfaces;
            this.frontface = cfg.frontface;
        },

        _props: {

            /**
             The LambertMaterial's ambient color.

             @property ambient
             @default [0.3, 0.3, 0.3]
             @type Float32Array
             */
            ambient: {

                set: function (value) {

                    var ambient = this._state.ambient;

                    if (!ambient) {
                        ambient = this._state.ambient = new Float32Array(3);

                    } else if (value && ambient[0] === value[0] && ambient[1] === value[1] && ambient[2] === value[2]) {
                        return;
                    }

                    if (value) {
                        ambient[0] = value[0];
                        ambient[1] = value[1];
                        ambient[2] = value[2];

                    } else {
                        ambient[0] = .2;
                        ambient[1] = .2;
                        ambient[2] = .2;
                    }

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.ambient;
                }
            },

            /**
             The LambertMaterial's diffuse color.

             @property color
             @default [1.0, 1.0, 1.0]
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
                        color[2] = 1;
                    }

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
             The LambertMaterial's emissive color.

             @property emissive
             @default [0.0, 0.0, 0.0]
             @type Float32Array
             */
            emissive: {

                set: function (value) {

                    var emissive = this._state.emissive;

                    if (!emissive) {
                        emissive = this._state.emissive = new Float32Array(3);

                    } else if (value && emissive[0] === value[0] && emissive[1] === value[1] && emissive[2] === value[2]) {
                        return;
                    }

                    if (value) {
                        emissive[0] = value[0];
                        emissive[1] = value[1];
                        emissive[2] = value[2];

                    } else {
                        emissive[0] = 0;
                        emissive[1] = 0;
                        emissive[2] = 0;
                    }

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.emissive;
                }
            },

            /**
             Factor in the range [0..1] indicating how transparent the LambertMaterial is.

             A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

             @property alpha
             @default 1.0
             @type Number
             */
            alpha: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.alpha === value) {
                        return;
                    }

                    this._state.alpha = value;
                    this._state.alphaMode = value < 1.0 ? 2 /* blend */ : 0 /* opaque */

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.alpha;
                }
            },

            /**
             The LambertMaterial's line width.

             @property lineWidth
             @default 1.0
             @type Number
             */
            lineWidth: {

                set: function (value) {

                    this._state.lineWidth = value || 1.0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.lineWidth;
                }
            },

            /**
             The LambertMaterial's point size.

             @property pointSize
             @default 1.0
             @type Number
             */
            pointSize: {

                set: function (value) {

                    this._state.pointSize = value || 1.0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.pointSize;
                }
            },

            /**
             Whether backfaces are visible on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             @property backfaces
             @default false
             @type Boolean
             */
            backfaces: {

                set: function (value) {

                    value = !!value;

                    if (this._state.backfaces === value) {
                        return;
                    }

                    this._state.backfaces = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.backfaces;
                }
            },

            /**
             Indicates the winding direction of front faces on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

             The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
             the {{#crossLink "Entity"}}Entities{{/crossLink}}.

             @property frontface
             @default "ccw"
             @type String
             */
            frontface: {

                set: function (value) {

                    value = value !== "cw";

                    if (this._state.frontface === value) {
                        return;
                    }

                    this._state.frontface = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.frontface ? "ccw" : "cw";
                }
            }
        },


        _getState: function () {
            return this._state;
        },

        _destroy: function () {
            this._super();
            this._state.destroy();
        }
    });

})();