/**
 A **Material** defines the surface appearance of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 Material is the base class for:

 * {{#crossLink "PhongMaterial"}}{{/crossLink}} - Blinn-Phong shading material.
 * (more Material subtypes coming)

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
