/**
 A **Material** defines the surface appearance of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 Material is the base class for:

 <ul>
 <li>{{#crossLink "PhongMaterial"}}{{/crossLink}} - Blinn-Phong shading material.</li>
 <li>(more Material subtypes coming)</li>
 </ul>

 @class Material
 @module XEO
 @submodule materials
 @constructor
 @extends Component
 */
(function () {

    "use strict";

    XEO.Material = XEO.Component.extend({

        type: "XEO.Material",

        _init: function () {

        }
    });

})();
