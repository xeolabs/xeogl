/**
 A **PlaneGeometry** defines a plane geometry for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class PlaneGeometry
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this PlaneGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PlaneGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.ySize=1] {Number} Dimension on the Y-axis.
 @param [cfg.xSegments=1] {Number} Number of segments on the X-axis.
 @param [cfg.ySegments=1] {Number} Number of segments on the Y-axis.

 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.PlaneGeometry = XEO.Geometry.extend({

        type: "XEO.PlaneGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;

            this.xSegments = cfg.xSegments;
            this.ySegments = cfg.ySegments;

            this.lod = cfg.lod;

            this.autoNormals = cfg.autoNormals !== false;
        },

        /**
         * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
         * to generate geometry data arrays.
         *
         * @protected
         */
        _update: function () {

            // Geometry needs rebuild

            var width = this._xSize;
            var height = this._ySize;

            var xSegments = Math.floor(this._lod * this._xSegments);
            var ySegments = Math.floor(this._lod * this._ySegments);

            if (ySegments < 1) {
                ySegments = 1;
            }

            if (ySegments < 1) {
                ySegments = 1;
            }

            var halfWidth = width / 2;
            var halfHeight = height / 2;

            var planeX = Math.floor(xSegments) || 1;
            var planeY = Math.floor(ySegments) || 1;

            var planeX1 = planeX + 1;
            var planeY1 = planeY + 1;

            var segmentWidth = width / planeX;
            var segmentHeight = height / planeY;

            var positions = new Float32Array(planeX1 * planeY1 * 3);
            var normals = new Float32Array(planeX1 * planeY1 * 3);
            var uvs = new Float32Array(planeX1 * planeY1 * 2);

            var offset = 0;
            var offset2 = 0;

            var iy;
            var ix;
            var x;
            var a;
            var b;
            var c;
            var d;

            for (iy = 0; iy < planeY1; iy++) {

                var y = iy * segmentHeight - halfHeight;

                for (ix = 0; ix < planeX1; ix++) {

                    x = ix * segmentWidth - halfWidth;

                    positions[offset] = x;
                    positions[offset + 1] = -y;

                    normals[offset + 2] = -1;

                    uvs[offset2] = (planeX - ix) / planeX;
                    uvs[offset2 + 1] = ( (planeY - iy) / planeY );

                    offset += 3;
                    offset2 += 2;
                }
            }

            offset = 0;

            var indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Array : Uint16Array )(planeX * planeY * 6);

            for (iy = 0; iy < planeY; iy++) {

                for (ix = 0; ix < planeX; ix++) {

                    a = ix + planeX1 * iy;
                    b = ix + planeX1 * ( iy + 1 );
                    c = ( ix + 1 ) + planeX1 * ( iy + 1 );
                    d = ( ix + 1 ) + planeX1 * iy;

                    indices[offset] = d;
                    indices[offset + 1] = b;
                    indices[offset + 2] = a;

                    indices[offset + 3] = d;
                    indices[offset + 4] = c;
                    indices[offset + 5] = b;

                    offset += 6;
                }
            }

            this.positions = positions;
            this.normals = normals;
            this.uv = uvs;
            this.indices = indices;
        },


        _props: {

            /**
             * The PlaneGeometry's level-of-detail factor.
             *
             * Fires a {{#crossLink "PlaneGeometry/lod:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/lod:property"}}{{/crossLink}} property changes.
                     * @event lod
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("lod", this._lod);
                },

                get: function () {
                    return this._lod;
                }
            },

            /**
             * The PlaneGeometry's dimension on the X-axis.
             *
             * Fires a {{#crossLink "PlaneGeometry/xSize:event"}}{{/crossLink}} event on change.
             *
             * @property xSize
             * @default 1
             * @type Number
             */
            xSize: {

                set: function (value) {

                    value = value || 1;

                    if (this._xSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSize = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/xSize:property"}}{{/crossLink}} property changes.
                     * @event xSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSize", this._xSize);
                },

                get: function () {
                    return this._xSize;
                }
            },

            /**
             * The PlaneGeometry's dimension on the Y-axis.
             *
             * Fires a {{#crossLink "PlaneGeometry/ySize:event"}}{{/crossLink}} event on change.
             *
             * @property ySize
             * @default 1.0
             * @type Number
             */
            ySize: {

                set: function (value) {

                    value = value || 1.0;

                    if (this._ySize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative ySize not allowed - will invert");
                        value = value * -1;
                    }

                    this._ySize = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/ySize:property"}}{{/crossLink}} property changes.
                     * @event ySize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("ySize", this._ySize);
                },

                get: function () {
                    return this._ySize;
                }
            },

            /**
             * The PlaneGeometry's number of segments on the X-axis.
             *
             * Fires a {{#crossLink "PlaneGeometry/xSegments:event"}}{{/crossLink}} event on change.
             *
             * @property xSegments
             * @default 1
             * @type Number
             */
            xSegments: {

                set: function (value) {

                    value = value || 1;

                    if (this._xSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/xSegments:property"}}{{/crossLink}} property changes.
                     * @event xSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSegments", this._xSegments);
                },

                get: function () {
                    return this._xSegments;
                }
            },

            /**
             * The PlaneGeometry's number of segments on the Y-axis.
             *
             * Fires a {{#crossLink "PlaneGeometry/ySegments:event"}}{{/crossLink}} event on change.
             *
             * @property ySegments
             * @default 1
             * @type Number
             */
            ySegments: {

                set: function (value) {

                    value = value || 1;

                    if (this._ySegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative ySegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._ySegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/ySegments:property"}}{{/crossLink}} property changes.
                     * @event ySegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("ySegments", this._ySegments);
                },

                get: function () {
                    return this._ySegments;
                }
            }
        },

        _getJSON: function () {
            return {
                xSize: this._xSize,
                ySize: this._ySize,
                xSegments: this._xSegments,
                ySegments: this._ySegments
            };
        }
    });

})();
