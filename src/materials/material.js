/**
 A **Material** defines the surface appearance of attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 Material is the base class for:

 * {{#crossLink "MetallicMaterial"}}{{/crossLink}} - physically-based material for metallic surfaces. Use this one for things made of metal.
 * {{#crossLink "SpecularMaterial"}}{{/crossLink}} - physically-based material for non-metallic (dielectric)
 surfaces. Use this one for insulators, such as ceramics, plastics, wood etc.
 * {{#crossLink "PhongMaterial"}}{{/crossLink}} - material for classic Blinn-Phong shading. This is less demanding of graphics hardware than the physically-based materials.
 * {{#crossLink "LambertMaterial"}}{{/crossLink}} - material for fast, flat-shaded CAD rendering without textures. Use
 this for navigating huge CAD or BIM models interactively. This material gives the best rendering performance and uses the least memory.
 * {{#crossLink "EmphasisMaterial"}}{{/crossLink}} - defines the appearance of Meshes when "ghosted" or "highlighted".
 * {{#crossLink "EdgeMaterial"}}{{/crossLink}} - defines the appearance of Meshes when edges are emphasized.
 * {{#crossLink "OutlineMaterial"}}{{/crossLink}} - defines the appearance of outlines drawn around Meshes.

 A {{#crossLink "Scene"}}Scene{{/crossLink}} is allowed to contain a mixture of these material types.

 @class Material
 @module xeogl
 @submodule materials
 @constructor
 @extends Component
 */
import {Component} from '../component.js';
import {stats} from './../stats.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Material";

class Material extends Component{

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {
        super.init(cfg);
        stats.memory.materials++;
    }

    destroy() {
        super.destroy();
        stats.memory.materials--;
    }
}

componentClasses[type] = Material;

export{Material};
