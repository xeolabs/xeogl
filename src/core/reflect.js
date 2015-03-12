(function () {

    "use strict";

    /**
     @class Reflect
     @module XEO
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Reflect in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Reflect.    
     @extends Component
     */
    XEO.Reflect = XEO.Component.extend({

        className: "XEO.Reflect",

        type: "reflect",

        _init: function (cfg) {
        },

        _compile: function () {
            this._renderer.reflect = this._state;
        },

        _getJSON: function () {
            return {

            };
        }
    });

})();