/**
 An **OutlineMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that's applied to {{#crossLink "Entity"}}Entities{{/crossLink}}
 to render an outline around them.

 WIP

 @class OutlineMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this OutlineMaterial within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The OutlineMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this OutlineMaterial.
 @param [cfg.color=[1.0,0.2,0.2]] {Array of Number}  Outline RGB color.
 @param [cfg.alpha=1.0] {Number} Outline opacity. A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
 @param [cfg.width=4] {Number}  Outline width, in pixels.
 */
(function () {

    "use strict";

    xeogl.OutlineMaterial = xeogl.Material.extend({

        type: "xeogl.OutlineMaterial",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new xeogl.renderer.OutlineMaterial({

                type: "OutlineMaterial",

                color: null,
                alpha: null,
                width: null
            });

            this.color = cfg.color;
            this.alpha = cfg.alpha;
            this.width = cfg.width;
        },

        _props: {
            
            /**
             RGB outline color.

             @property color
             @default [1.0, 0.2, 0.2]
             @type Float32Array
             */
            color: {

                set: function (value) {

                    var color = this._state.color;

                    if (!color) {
                        color = this._state.color = new Float32Array(3);

                    } else if (value && color[0] === value[0] && color[1] === value[1] && color[2] === value[2]) {
                        return;
                    }

                    if (value) {
                        color[0] = value[0];
                        color[1] = value[1];
                        color[2] = value[2];

                    } else {
                        color[0] = 1.0;
                        color[1] = 0.2;
                        color[2] = 0.2;
                    }

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.color;
                }
            },

            /**
            Outline transparency.

             A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

             @property alpha
             @default 1.0
             @type Number
             */
            alpha: {

                set: function (value) {

                    value = (value !== undefined && value !== null) ? value : 1.0;

                    if (this._state.alpha === value) {
                        return;
                    }

                    this._state.alpha = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.alpha;
                }
            },

            /**
             Outline width in pixels.

             @property width
             @default 4.0
             @type Number
             */
            width: {

                set: function (value) {

                    this._state.width = value || 4.0;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.width;
                }
            }
        },

        _getState: function () {
            return this._state;
        },

        _destroy: function () {
            this._super();
            this._state.destroy();
        }
    });

})();