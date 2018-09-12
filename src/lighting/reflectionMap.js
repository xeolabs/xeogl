/**
 A **ReflectionMap** specifies a cube texture reflection map.

 ## Usage

 ````javascript

 new xeogl.ReflectionMap({
    src: [
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
        "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
    ]
 });
 ````
 @class ReflectionMap
 @module xeogl
 @submodule lighting
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this ReflectionMap, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ReflectionMap.
 @param [cfg.src=null] {Array of String} Paths to six image files to load into this ReflectionMap.
 @param [cfg.flipY=false] {Boolean} Flips this ReflectionMap's source data along its vertical axis when true.
 @param [cfg.encoding="linear"] {String} Encoding format.  See the {{#crossLink "ReflectionMap/encoding:property"}}{{/crossLink}} property for more info.
 @extends Component
 */
import {CubeTexture} from './cubeTexture.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.ReflectionMap";

class ReflectionMap extends CubeTexture {

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
        this.scene._lightsState.addReflectionMap(this._state);
        this.scene._reflectionMapCreated(this);
    }

    destroy() {
        super.destroy();
        this.scene._reflectionMapDestroyed(this);
    }
}

componentClasses[type] = ReflectionMap;

export{ReflectionMap};
