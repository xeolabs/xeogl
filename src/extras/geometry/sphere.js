/**
 A **Sphere** defines spherical geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class Sphere
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Sphere in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Sphere.
 @param [cfg.radius=1] {Number}
 @param [cfg.heightSegments=24] {Number}
 @param [cfg.widthSegments=18] {Number}
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.Sphere = XEO.Geometry.extend({

        type: "XEO.Sphere",

        _init: function (cfg) {

            this._super(cfg);

            this.lod = cfg.lod;
            this.radius = cfg.radius;
            this.heightSegments = cfg.heightSegments;
            this.widthSegments = cfg.widthSegments;
        },

        _sphereDirty: function () {
            if (!this.__dirty) {
                this.__dirty = true;
                var self = this;
                this.scene.once("tick2",
                    function () {
                        self._buildSphere();
                        self.__dirty = false;
                    });
            }
        },

        _buildSphere: function () {

            var radius = this._radius;
            var heightSegments = Math.floor(this._lod * this._heightSegments);
            var widthSegments = Math.floor(this._lod * this._widthSegments);

            if (heightSegments < 18) {
                heightSegments = 18;
            }

            if (widthSegments < 18) {
                widthSegments = 18;
            }

            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            var i;
            var j;

            var theta;
            var sinTheta;
            var cosTheta;

            var phi;
            var sinPhi;
            var cosPhi;

            var x;
            var y;
            var z;

            var u;
            var v;

            var first;
            var second;

            for (i = 0; i <= heightSegments; i++) {

                theta = i * Math.PI / heightSegments;
                sinTheta = Math.sin(theta);
                cosTheta = Math.cos(theta);

                for (j = 0; j <= widthSegments; j++) {

                    phi = j * 2 * Math.PI / widthSegments;
                    sinPhi = Math.sin(phi);
                    cosPhi = Math.cos(phi);

                    x = cosPhi * sinTheta;
                    y = cosTheta;
                    z = sinPhi * sinTheta;
                    u = j / widthSegments;
                    v = i / heightSegments;

                    normals.push(x);
                    normals.push(y);
                    normals.push(z);

                    uvs.push(u);
                    uvs.push(v);

                    positions.push(radius * x);
                    positions.push(radius * y);
                    positions.push(radius * z);
                }
            }

            for (i = 0; i < heightSegments; i++) {
                for (j = 0; j < widthSegments; j++) {

                    first = (i * (widthSegments + 1)) + j;
                    second = first + widthSegments + 1;

                    indices.push(first + 1);
                    indices.push(second + 1);
                    indices.push(second);
                    indices.push(first + 1);
                    indices.push(second);
                    indices.push(first);
                }
            }

            this.positions = positions;
            this.normals = normals;
            this.uv = uvs;
            this.indices = indices;
        },

        _props: {

            /**
             * The Sphere's level-of-detail factor.
             *
             * Fires a {{#crossLink "Sphere/lod:event"}}{{/crossLink}} event on change.
             *
             * @property lod
             * @default 1
             * @type Number
             */
            lod: {

                set: function (value) {

                    value = value !== undefined ? value : 1;

                    if (this._lod === value) {
                        return;
                    }

                    if (value < 0 || value > 1) {
                        this.warn("clamping lod to [0..1]");
                        value = value < 0 ? 0 : 1;
                    }

                    this._lod = value;

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/lod:property"}}{{/crossLink}} property changes.
                     * @event lod
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("lod", this._lod);

                    this._sphereDirty();
                },

                get: function () {
                    return this._lod;
                }
            },

            /**
             * The Sphere's radius.
             *
             * Fires a {{#crossLink "Sphere/radius:event"}}{{/crossLink}} event on change.
             *
             * @property radius
             * @default 1
             * @type Number
             */
            radius: {

                set: function (value) {

                    value = value || 1;

                    if (this._radius === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative radius not allowed - will invert");
                        value = value * -1;
                    }

                    this._radius = value;

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/radius:property"}}{{/crossLink}} property changes.
                     * @event radius
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radius", this._radius);

                    this._sphereDirty();
                },

                get: function () {
                    return this._radius;
                }
            },


            /**
             * The Sphere's number of latitude bands.
             *
             * Fires a {{#crossLink "Sphere/heightSegments:event"}}{{/crossLink}} event on change.
             *
             * @property heightSegments
             * @default 18
             * @type Number
             */
            heightSegments: {

                set: function (value) {

                    value = value || 18;

                    if (this._heightSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative heightSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._heightSegments = value;

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/heightSegments:property"}}{{/crossLink}} property changes.
                     * @event heightSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("heightSegments", this._heightSegments);

                    this._sphereDirty();
                },

                get: function () {
                    return this._heightSegments;
                }
            },

            /**
             * The Sphere's number of longitude bands.
             *
             * Fires a {{#crossLink "Sphere/widthSegments:event"}}{{/crossLink}} event on change.
             *
             * @property widthSegments
             * @default 24
             * @type Number
             */
            widthSegments: {

                set: function (value) {

                    value = value || 24;

                    if (this._widthSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative widthSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._widthSegments = value;

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/widthSegments:property"}}{{/crossLink}} property changes.
                     * @event widthSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("widthSegments", this._widthSegments);

                    this._sphereDirty();
                },

                get: function () {
                    return this._widthSegments;
                }
            }
        },

        _getJSON: function () {
            return {
                // Don't save lod
                radius: this._radius,
                heightSegments: this._heightSegments,
                widthSegments: this._widthSegments
            };
        }
    });

})();
