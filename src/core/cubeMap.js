"use strict";

/**
 *
 * @class CubeMap
 *  @module XEO
 * @constructor
 * @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this CubeMap within the
 * default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 * @param [cfg] {*} CubeMap configuration
 * @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 * @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CubeMap.
 * @extends Component
 */
XEO.CubeMap = XEO.Component.extend({

    className: "XEO.CubeMap",

    type: "cubeMap",

    _init: function (cfg) {

    },

    _compile: function (ctx) {

    },

    _getJSON : function() {
        return {

        };
    }
});
