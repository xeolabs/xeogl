/**
 A **TorusGeometry** defines toroid geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class TorusGeometry
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this TorusGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this TorusGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.radius=1] {Number}
 @param [cfg.tube=0.3] {Number}
 @param [cfg.segmentsR=32] {Number}
 @param [cfg.segmentsT=24] {Number}
 @param [cfg.arc=Math.PI / 2.0] {Number}
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.TorusGeometry = XEO.Geometry.extend({

        type: "XEO.TorusGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.lod = cfg.lod;
            this.radius = cfg.radius;
            this.tube = cfg.tube;
            this.segmentsR = cfg.segmentsR;
            this.segmentsT = cfg.segmentsT;
            this.arc = cfg.arc;
        },

        _torusDirty: function () {
            if (!this.__dirty) {
                this.__dirty = true;
                var self = this;
                this.scene.once("tick4",
                    function () {
                        self._buildTorus();
                        self.__dirty = false;
                    });
            }
        },

        _buildTorus: function () {

            var radius = this._radius;
            var tube = this._tube;
            var segmentsR = Math.floor(this._segmentsR * this._lod);
            var segmentsT = Math.floor(this._segmentsT * this._lod);
            var arc = this._arc;

            if (segmentsR < 4) {
                segmentsR = 4;
            }

            if (segmentsT < 4) {
                segmentsT = 4;
            }

            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            var u;
            var v;
            var centerX;
            var centerY;
            var centerZ = 0;
            var x;
            var y;
            var z;
            var vec;

            var i;
            var j;

            for (j = 0; j <= segmentsR; j++) {
                for (i = 0; i <= segmentsT; i++) {

                    u = i / segmentsT * arc;
                    v = j / segmentsR * Math.PI * 2;

                    centerX = radius * Math.cos(u);
                    centerY = radius * Math.sin(u);

                    x = (radius + tube * Math.cos(v) ) * Math.cos(u);
                    y = (radius + tube * Math.cos(v) ) * Math.sin(u);
                    z = tube * Math.sin(v);

                    positions.push(x);
                    positions.push(y);
                    positions.push(z);

                    uvs.push(1 - (i / segmentsT));
                    uvs.push(1 - (j / segmentsR));

                    vec = XEO.math.normalizeVec3(XEO.math.subVec3([x, y, z], [centerX, centerY, centerZ], []), []);

                    normals.push(vec[0]);
                    normals.push(vec[1]);
                    normals.push(vec[2]);
                }
            }

            var a;
            var b;
            var c;
            var d;

            for (j = 1; j <= segmentsR; j++) {
                for (i = 1; i <= segmentsT; i++) {

                    a = ( segmentsT + 1 ) * j + i - 1;
                    b = ( segmentsT + 1 ) * ( j - 1 ) + i - 1;
                    c = ( segmentsT + 1 ) * ( j - 1 ) + i;
                    d = ( segmentsT + 1 ) * j + i;

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);

                    indices.push(c);
                    indices.push(d);
                    indices.push(a);
                }
            }

            this.positions = positions;
            this.normals = normals;
            this.uv = uvs;
            this.indices = indices;
        },

        _props: {

            /**
             * The TorusGeometry's level-of-detail factor.
             *
             * Fires a {{#crossLink "TorusGeometry/lod:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/lod:property"}}{{/crossLink}} property changes.
                     * @event lod
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("lod", this._lod);

                    this._torusDirty();
                },

                get: function () {
                    return this._lod;
                }
            },

            /**
             * The TorusGeometry's radius.
             *
             * Fires a {{#crossLink "TorusGeometry/radius:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/radius:property"}}{{/crossLink}} property changes.
                     * @event radius
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radius", this._radius);

                    this._torusDirty();
                },

                get: function () {
                    return this._radius;
                }
            },


            /**
             * The TorusGeometry's tube.
             *
             * Fires a {{#crossLink "TorusGeometry/tube:event"}}{{/crossLink}} event on change.
             *
             * @property tube
             * @default 0.3
             * @type Number
             */
            tube: {

                set: function (value) {

                    value = value || 0.3;

                    if (this._tube === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative tube not allowed - will invert");
                        value = value * -1;
                    }

                    this._tube = value;

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/tube:property"}}{{/crossLink}} property changes.
                     * @event tube
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("tube", this._tube);

                    this._torusDirty();
                },

                get: function () {
                    return this._tube;
                }
            },

            /**
             * The TorusGeometry's segmentsR.
             *
             * Fires a {{#crossLink "TorusGeometry/segmentsR:event"}}{{/crossLink}} event on change.
             *
             * @property segmentsR
             * @default 32
             * @type Number
             */
            segmentsR: {

                set: function (value) {

                    value = value || 32;

                    if (this._segmentsR === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative segmentsR not allowed - will invert");
                        value = value * -1;
                    }

                    this._segmentsR = value;

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/segmentsR:property"}}{{/crossLink}} property changes.
                     * @event segmentsR
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("segmentsR", this._segmentsR);

                    this._torusDirty();
                },

                get: function () {
                    return this._segmentsR;
                }
            },


            /**
             * The TorusGeometry's segmentsT.
             *
             * Fires a {{#crossLink "TorusGeometry/segmentsT:event"}}{{/crossLink}} event on change.
             *
             * @property segmentsT
             * @default 24
             * @type Number
             */
            segmentsT: {

                set: function (value) {

                    value = value || 24;

                    if (this._segmentsT === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative segmentsT not allowed - will invert");
                        value = value * -1;
                    }

                    this._segmentsT = value;

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/segmentsT:property"}}{{/crossLink}} property changes.
                     * @event segmentsT
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("segmentsT", this._segmentsT);

                    this._torusDirty();
                },

                get: function () {
                    return this._segmentsT;
                }
            },

            /**
             * The TorusGeometry's arc.
             *
             * Fires a {{#crossLink "TorusGeometry/arc:event"}}{{/crossLink}} event on change.
             *
             * @property arc
             * @default Math.PI * 2
             * @type Number
             */
            arc: {

                set: function (value) {

                    value = value || Math.PI * 2;

                    if (this._arc === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative arc not allowed - will invert");
                        value = value * -1;
                    }

                    this._arc = value;

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/arc:property"}}{{/crossLink}} property changes.
                     * @event arc
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("arc", this._arc);

                    this._torusDirty();
                },

                get: function () {
                    return this._arc;
                }
            }
        },

        _getJSON: function () {
            return {
                // Don't save lod
                radius: this._radius,
                tube: this._tube,
                segmentsR: this._segmentsR,
                segmentsT: this._segmentsT,
                arc: this._arc
            };
        }
    });

})();
