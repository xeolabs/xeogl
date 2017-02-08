/**
 A **Material** defines the surface appearance of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 Material is the base class for:

 * {{#crossLink "MetallicMaterial"}}{{/crossLink}} - physically-based material for metallic surfaces. Use this one for
 things made of metal.
 * {{#crossLink "SpecularMaterial"}}{{/crossLink}} - physically-based material for non-metallic (dielectric)
 surfaces. Use this one for insulators, such as ceramics, plastics, wood etc.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} - legacy material for classic Blinn-Phong shading. Use this material
 for things that don't need to look real, such as wireframe objects and "helper" objects like labels etc. This material type is also
 more efficient to render than the physically-based materials, so in some cases might be more suitable for low-power GPUs,
 such as on mobile devices.

 Your {{#crossLink "Scene"}}Scenes{{/crossLink}} are allowed to contain a mixture of these material types.

 @class Material
 @module xeogl
 @submodule materials
 @constructor
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Material = xeogl.Component.extend({

        type: "xeogl.Material",

        _init: function () {

        }
    });

})();
