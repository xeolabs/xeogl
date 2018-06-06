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
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ReflectionMap in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this ReflectionMap, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ReflectionMap.
 @param [cfg.src=null] {Array of String} Paths to six image files to load into this ReflectionMap.
 @param [cfg.flipY=false] {Boolean} Flips this ReflectionMap's source data along its vertical axis when true.
 @param [cfg.encoding="linear"] {String} Encoding format.  See the {{#crossLink "ReflectionMap/encoding:property"}}{{/crossLink}} property for more info.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.ReflectionMap = xeogl.CubeTexture.extend({
        type: "xeogl.ReflectionMap",
        _init: function (cfg) {
            this._super(cfg);
            this._renderer.lights.addReflectionMap(this._state);
        },

        _destroy: function () {
            this._renderer.lights.removeReflectionMap(this._state);
            this._super(cfg);
        }
    });
})();
