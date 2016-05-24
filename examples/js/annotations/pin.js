/**
 A **Pin** defines spherical geometry for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class Pin
 @module XEO
 @submodule annotations
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Pin in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Pin.
 @param [cfg.entity] {Entity|String|Number} ID of instance of an {{#crossLink "Entity"}}{{/crossLink}} to associate this Pin with.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Pin = XEO.Component.extend({

        type: "XEO.Pin",

        _init: function (cfg) {

            this._pin = this.create(XEO.Entity, { // Shows the actual 3D pin

                geometry: this.create(XEO.Geometry, {
                        primitive: "points",
                        positions: [10, .5, .5],
                        indices: [0]
                    },
                    "pinGeometry"), // Geometry shared with all Pins in this Scene

                visibility: this.create(XEO.Visibility, {
                    visible: true
                }),

                cull: this.create(XEO.Cull, {
                    culled: true
                }),

                material: this.create(XEO.PhongMaterial, {
                    emissive: [1, 0, 0],
                    pointSize: 6
                }),

                transform: this.create(XEO.Translate, {
                    xyz: [0, 0, 0]
                })
            });

            this.entity = cfg.entity;
            this.triangle = cfg.triangle;
            this.bary = cfg.bary;
            this.visible = cfg.visible;
        },

        _props: {

            /**
             * The {{#crossLink "Entity"}}{{/crossLink}} this Pin is attached to.
             *
             * Fires an {{#crossLink "Pin/entity:event"}}{{/crossLink}} event on change.
             *
             * @property entity
             * @type XEO.Entity
             */
            entity: {

                set: function (value) {

                    /**
                     * Fired whenever this Pin's {{#crossLink "Pin/entity:property"}}{{/crossLink}} property changes.
                     * @event entity
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "entity",
                        type: "XEO.Entity",
                        component: value,
                        sceneDefault: false,
                        onAttached: {
                            callback: this._entityAttached,
                            scope: this
                        },
                        onDetached: {
                            callback: this._entityDetached,
                            scope: this
                        }
                    });
                },

                get: function () {
                    return this._attached.entity;
                }
            },

            /**
             * Index of the triangle containing this pin.
             *
             * Fires an {{#crossLink "Pin/triangle:event"}}{{/crossLink}} event on change.
             *
             * @property localPos
             * @default 0
             * @type Number
             */
            triangle: {

                set: function (value) {

                    this._triangle = value || 0;

                    /**
                     Fired whenever this Pin's {{#crossLink "Pin/triangle:property"}}{{/crossLink}} property changes.
                     @event triangle
                     @param value Number The property's new value
                     */
                    this.fire("triangle", this._triangle);
                },

                get: function () {
                    return this._triangle;
                }
            },

            /**
             * Barycentric coordinates of this Pin within its triangle.
             *
             * Fires an {{#crossLink "Pin/bary:event"}}{{/crossLink}} event on change.
             *
             * @property bary
             * @default [0.3,0.3,0.3]
             * @type Float32Array
             */
            bary: {

                set: function (value) {

                    this._bary = value || XEO.math.vec3([.3, .3, .3]);

                    /**
                     Fired whenever this Pin's {{#crossLink "Pin/bary:property"}}{{/crossLink}} property changes.
                     @event bary
                     @param value Float32Array The property's new value
                     */
                    this.fire("bary", this._bary);
                },

                get: function () {
                    return this._bary;
                }
            },

            /**
             Indicates whether this Pin is visible or not.

             Fires a {{#crossLink "Pin/visible:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    value = value !== false;

                    this._pin.visibility.visible = value;

                    /**
                     Fired whenever this Visibility's {{#crossLink "Visibility/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", value);
                },

                get: function () {
                    return this._pin.visibility.visible;
                }
            },

            /**
             * Local-space 3D boundary of this Pin.
             *
             * @property localBoundary
             * @type Boundary3D
             * @final
             */
            localBoundary: {
                get: function () {
                    return this._pin.localBoundary;
                }
            },

            /**
             * World-space 3D boundary of this Pin.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {
                get: function () {
                    return this._pin.worldBoundary;
                }
            },

            /**
             * View-space 3D boundary of this Pin.
             *
             * @property viewBoundary
             * @type Boundary3D
             * @final
             */
            viewBoundary: {
                get: function () {
                    return this._pin.viewBoundary;
                }
            },

            /**
             * Canvas-space 2D boundary of this Pin.
             *
             * @property canvasBoundary
             * @type Boundary2D
             * @final
             */
            canvasBoundary: {
                get: function () {
                    return this._pin.canvasBoundary;
                }
            }
        },

        _entityAttached: function (entity) {
            this._onEntityWorldBoundary = entity.worldBoundary.on("updated", this._arrangePin, this);
            this._onEntityVisible = entity.visibility.on("visible", this._entityVisible, this);
        },

        _arrangePin: function () {
            if (!this._bary || !this._attached.entity) {
                return;
            }
            this._pin.transform.xyz = this._bary;
        },

        _entityVisible: function (visible) {
            this.visible = visible;
        },

        _entityDetached: function (entity) {
            entity.worldBoundary.off(this._onEntityWorldBoundary);
            entity.visibility.off(this._onEntityVisible);
        },

        _update: function () {

            var entity = this._attached.entity;

            if (entity) {

                var transform = entity.transform;
                var geometry = entity.geometry;
                var indices = geometry.indices;
                var positions = geometry.positions;

                var ia = indices[i];
                var ib = indices[i + 1];
                var ic = indices[i + 2];

                var ia3 = ia * 3;
                var ib3 = ib * 3;
                var ic3 = ic * 3;

                a[0] = positions[ia3];
                a[1] = positions[ia3 + 1];
                a[2] = positions[ia3 + 2];

                b[0] = positions[ib3];
                b[1] = positions[ib3 + 1];
                b[2] = positions[ib3 + 2];

                c[0] = positions[ic3];
                c[1] = positions[ic3 + 1];
                c[2] = positions[ic3 + 2];

                //   XEO.math.barycentricToCartesian2(bary, a, b, c, cartesian) {

            }
        },

        _getJSON: function () {
            var json = {
                bary: this.bary,
                visible: this.visible
            };
            if (this._attached.entity) {
                json.entity = this._attached.entity.id;
            }
            return json;
        }
    });

})();
