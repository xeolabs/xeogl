/**
 A **Material** defines the surface appearance of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 Material is the base class for:

 * {{#crossLink "MetallicMaterial"}}{{/crossLink}} - physically-based material for metallic surfaces. Use this one for things made of metal.
 * {{#crossLink "SpecularMaterial"}}{{/crossLink}} - physically-based material for non-metallic (dielectric)
 surfaces. Use this one for insulators, such as ceramics, plastics, wood etc.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} - material for classic Blinn-Phong shading. This is less demanding of graphics hardware than the physically-based materials.
 * {{#crossLink "LambertMaterial"}}{{/crossLink}} - material for fast, flat-shaded CAD rendering without textures. Use
 this for navigating huge CAD or BIM models interactively. This material gives the best rendering performance and uses the least memory.
 * {{#crossLink "EmphasisMaterial"}}{{/crossLink}} - defines the appearance of Entities when "ghosted" or "highlighted".
 * {{#crossLink "OutlineMaterial"}}{{/crossLink}} - defines the appearance of outlines drawn around Entities.

 A {{#crossLink "Scene"}}Scene{{/crossLink}} is allowed to contain a mixture of these material types.

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
            xeogl.stats.memory.materials++;
        },

        _destroy: function() {
            xeogl.stats.memory.materials--;
        }
    });

})();
