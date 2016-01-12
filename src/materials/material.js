/**
 A **Material** defines the surface appearance of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 Material is the base class for:

 <ul>
 <li>{{#crossLink "PBRMaterial"}}{{/crossLink}} - Physically-based rendering (PBR) material.</li>
 <li>{{#crossLink "PhongMaterial"}}{{/crossLink}} - Blinn-Phong shading material.</li>
 <li>(more coming)</li>
 </ul>

 <img src="../../../assets/images/Material.png"></img>

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

        _init: function (cfg) {

        }
    });

})();
