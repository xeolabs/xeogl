/**

 Helper that visualizes the position and direction of a {{#crossLink "Clip"}}{{/crossLink}}.

 The helper works by tracking updates to the {{#crossLink "Clip"}}{{/crossLink}}'s
 {{#crossLink "Clip/pos:property"}}{{/crossLink}} and {{#crossLink "Clip/dir:property"}}{{/crossLink}}.

 @class ClipHelper
 @constructor
 @param cfg {*} Configuration
 @param cfg.clip {Clip} A {{#crossLink "Clip"}}{{/crossLink}} to visualize.
 @param [cfg.solid=true] {Boolean} Indicates whether or not this helper is filled with color or just wireframe.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 @param [cfg.planeSize] {Float32Array} The width and height of the ClipHelper plane indicator.
 @param [cfg.autoPlaneSize=false] {Boolean} Indicates whether or not this ClipHelper's
 {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} is automatically sized to fit within
 the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
 */
(function () {

    "use strict";

    xeogl.ClipHelper = xeogl.Component.extend({

        type: "xeogl.ClipHelper",

        _init: function (cfg) {

            // STYLE: Compose instead of extend, because we may want to add more helpers here

            this._planeHelper = new xeogl.PlaneHelper(this);

            this.clip = cfg.clip;
            this.planeSize = cfg.planeSize;
            this.autoPlaneSize = cfg.autoPlaneSize;
            this.solid = cfg.solid;
            this.visible = cfg.visible;
        },

        _props: {

            /**
             * The {{#crossLink "Clip"}}Clip{{/crossLink}} attached to this ClipHelper.
             *
             * Fires an {{#crossLink "ClipHelper/Clip:event"}}{{/crossLink}} event on change.
             *
             * @property clip
             * @type Clip
             */
            clip: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "clip",
                        type: "xeogl.Clip",
                        component: value,
                        on: {
                            pos: function (pos) {
                                self._planeHelper.pos = pos;
                            },
                            dir: function (dir) {
                                self._planeHelper.dir = dir;
                            },
                            active: function (active) {
                                self._planeHelper.color = active ? [0.2, 0.2, 0.2] : [1.0, 0.2, 0.2];
                            }
                        }
                    });

                    if (this._attached.clip) {
                        //this._label.geometry.text = this._attached.clip.id;
                    }
                },

                get: function () {
                    return this._attached.clip;
                }
            },

            /**
             * The width and height of the ClipHelper plane indicator.
             *
             * When no value is specified, will automatically size to fit within the
             * {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
             *
             * Fires an {{#crossLink "ClipHelper/planeSize:event"}}{{/crossLink}} event on change.
             *
             * @property planeSize
             * @default Fitted to scene boundary
             * @type {Float32Array}
             */
            planeSize: {

                set: function (value) {

                    this._planeHelper.planeSize = value;

                    /**
                     Fired whenever this ClipHelper's {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} property changes.
                     @event planeSize
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("planeSize", this._planeHelper.planeSize);
                },

                get: function () {
                    return this._planeHelper.planeSize;
                }
            },

            /**
             * Indicates whether this ClipHelper's {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} is automatically
             * generated or not.
             *
             * When auto-generated, {{#crossLink "ClipHelper/planeSize:property"}}{{/crossLink}} will automatically size
             * to fit within the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
             *
             * Fires an {{#crossLink "ClipHelper/autoPlaneSize:event"}}{{/crossLink}} event on change.
             *
             * @property autoPlaneSize
             * @default false
             * @type {Boolean}
             */
            autoPlaneSize: {

                set: function (value) {

                    this._planeHelper.autoPlaneSize = value;

                    /**
                     Fired whenever this ClipHelper's {{#crossLink "ClipHelper/autoPlaneSize:property"}}{{/crossLink}} property changes.
                     @event autoPlaneSize
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("autoPlaneSize", this._planeHelper.autoPlaneSize);
                },

                get: function () {
                    return this._planeHelper.autoPlaneSize;
                }
            },

            /**
             Indicates whether this ClipHelper's plane is filled or just wireframe.

             Fires a {{#crossLink "ClipHelper/active:event"}}{{/crossLink}} event on change.

             @property solid
             @default true
             @type Boolean
             */
            solid: {

                set: function (value) {

                    this._planeHelper.solid = value;

                    /**
                     Fired whenever this helper's {{#crossLink "ClipHelper/solid:property"}}{{/crossLink}} property changes.

                     @event solid
                     @param value {Boolean} The property's new value
                     */
                    this.fire("solid", this._planeHelper.solid);
                },

                get: function () {
                    return this._planeHelper.solid;
                }
            },
            
            /**
             Indicates whether this ClipHelper is visible or not.

             Fires a {{#crossLink "ClipHelper/active:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    this._planeHelper.visible = value;

                    /**
                     Fired whenever this helper's {{#crossLink "ClipHelper/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", this._planeHelper.visible);
                },

                get: function () {
                    return this._planeHelper.visible;
                }
            }
        }
    });
})();