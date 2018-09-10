/**
 A **LightMap** specifies a cube texture light map.

 ## Usage

 ````javascript

 new xeogl.LightMap({
    src: [
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
    ]
 });
 ````
 @class LightMap
 @module xeogl
 @submodule lighting
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this LightMap, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this LightMap.
 @param [cfg.src=null] {Array of String} Paths to six image files to load into this LightMap.
 @param [cfg.flipY=false] {Boolean} Flips this LightMap's source data along its vertical axis when true.
 @param [cfg.encoding="linear"] {String} Encoding format.  See the {{#crossLink "LightMap/encoding:property"}}{{/crossLink}} property for more info.
 @extends Component
 */

import {core} from "./../core.js";
import {CubeTexture} from './cubeTexture.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.LightMap";

class LightMap extends CubeTexture{

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
        this.scene._lightMapCreated(this);
    }

    destroy() {
        super.destroy();
        this.scene._lightMapDestroyed(this);
    }
}

componentClasses[type] = LightMap;

export{LightMap};
