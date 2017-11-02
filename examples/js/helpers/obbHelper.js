/**

 Helper that visualizes the object-aligned boundary of a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 @class OBBHelper
 @constructor
 @param cfg {*} Configuration
 @param [cfg.boundary] {Number|String|Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}.
 @param [cfg.color=[0.4,0.4,0.4]] {Float32Array} Emmissive color
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.

 */
(function () {

    "use strict";

    xeogl.OBBHelper = xeogl.Component.extend({

        type: "xeogl.OBBHelper",

        _init: function (cfg) {

            this._box = new xeogl.Entity(this, {
                geometry: new xeogl.OBBGeometry(this),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [1, 0, 0],
                    diffuse: [0, 0, 0],
                    lineWidth: 4
                }),
                pickable: false,
                collidable: false,
                clippable: false
            });

            this.boundary = cfg.boundary;
            this.color = cfg.color;
            this.visible = cfg.visible;
        },

        _props: {

            /**
             A {{#crossLink "Boundary3D"}}{{/crossLink}} whose {{#crossLink "Boundary3D/aabb:property"}}AABB{{/crossLink}} we'll
             dynamically fit this OBBGeometry to.

             Fires a {{#crossLink "OBBHelper/boundary:event"}}{{/crossLink}} event on change.

             @property boundary
             @type Boundary3D
             */
            boundary: {

                set: function (boundary) {
                    this._box.geometry.boundary = boundary;
                },

                get: function () {
                    return this._box.geometry.boundary;
                }
            },

            /**
             * Emissive color of this OBBHelper.
             *
             * Fires an {{#crossLink "OBBHelper/color:event"}}{{/crossLink}} event on change.
             *
             * @property color
             * @default [0,1,0]
             * @type {Float32Array}
             */
            color: {

                set: function (value) {

                    this._box.material.emissive = value || [0, 1, 0];

                    /**
                     Fired whenever this OBBHelper's {{#crossLink "OBBHelper/color:property"}}{{/crossLink}} property changes.
                     @event color
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("color", this._color);
                },

                get: function () {
                    return this._box.emissive;
                }
            },

            /**
             Indicates whether this OBBHelper is visible or not.

             Fires a {{#crossLink "OBBHelper/visible:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    value = value !== false;

                    this._box.visible = value;

                    /**
                     Fired whenever this helper's {{#crossLink "OBBHelper/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", this._box.visible);
                },

                get: function () {
                    return this._box.visible;
                }
            }
        }
    });
})();