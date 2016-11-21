/**
 A **PlaneGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a plane-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_PlaneGeometry"><img src="../../assets/images/screenshots/PlaneGeometry.png"></img></a>

 ## Overview

 * A PlaneGeometry lies in the X-Z plane.
 * Dynamically modify it's shape at any time by updating its {{#crossLink "PlaneGeometry/center:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/xSize:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/zSize:property"}}{{/crossLink}}, {{#crossLink "PlaneGeometry/xSegments:property"}}{{/crossLink}} and
 {{#crossLink "PlaneGeometry/zSegments:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.
 
 ## Examples

 * [Textured PlaneGeometry](../../examples/#geometry_PlaneGeometry)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a PlaneGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.PlaneGeometry({
         primitive: "triangles",
         center: [0,0,0],
         xSize: 2,
         zSize: 2,
         xSegments: 10,
         zSegments: 10,
         lod: 1.0 // Default
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class PlaneGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this PlaneGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PlaneGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a PlaneGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the PlaneGeometry.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.zSize=1] {Number} Dimension on the Z-axis.
 @param [cfg.xSegments=1] {Number} Number of segments on the X-axis.
 @param [cfg.zSegments=1] {Number} Number of segments on the Z-axis.

 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.PlaneGeometry = xeogl.Geometry.extend({

        type: "xeogl.PlaneGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.center = cfg.center;
            
            this.xSize = cfg.xSize;
            this.zSize = cfg.zSize;

            this.xSegments = cfg.xSegments;
            this.zSegments = cfg.zSegments;

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

            var centerX = this._center[0];
            var centerY = this._center[1];
            var centerZ = this._center[2];

            var width = this._xSize;
            var height = this._zSize;

            var xSegments = Math.floor(this._lod * this._xSegments);
            var zSegments = Math.floor(this._lod * this._zSegments);

            if (zSegments < 1) {
                zSegments = 1;
            }

            if (zSegments < 1) {
                zSegments = 1;
            }

            var halfWidth = width / 2;
            var halfHeight = height / 2;

            var planeX = Math.floor(xSegments) || 1;
            var planeZ = Math.floor(zSegments) || 1;

            var planeX1 = planeX + 1;
            var planeZ1 = planeZ + 1;

            var segmentWidth = width / planeX;
            var segmentHeight = height / planeZ;

            var positions = new Float32Array(planeX1 * planeZ1 * 3);
            var normals = new Float32Array(planeX1 * planeZ1 * 3);
            var uvs = new Float32Array(planeX1 * planeZ1 * 2);

            var offset = 0;
            var offset2 = 0;

            var iz;
            var ix;
            var x;
            var a;
            var b;
            var c;
            var d;

            for (iz = 0; iz < planeZ1; iz++) {

                var z = iz * segmentHeight - halfHeight;

                for (ix = 0; ix < planeX1; ix++) {

                    x = ix * segmentWidth - halfWidth;

                    positions[offset] = x + centerX;
                    positions[offset + 1] = centerY;
                    positions[offset + 2] = -z + centerZ;

                    normals[offset + 2] = -1;

                    uvs[offset2] = (planeX - ix) / planeX;
                    uvs[offset2 + 1] = ( (planeZ - iz) / planeZ );

                    offset += 3;
                    offset2 += 2;
                }
            }

            offset = 0;

            var indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Arraz : Uint16Array )(planeX * planeZ * 6);

            for (iz = 0; iz < planeZ; iz++) {

                for (ix = 0; ix < planeX; ix++) {

                    a = ix + planeX1 * iz;
                    b = ix + planeX1 * ( iz + 1 );
                    c = ( ix + 1 ) + planeX1 * ( iz + 1 );
                    d = ( ix + 1 ) + planeX1 * iz;

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
             * 3D point indicating the center position of this PlaneGeometry.
             *
             * Fires an {{#crossLink "PlaneGeometry/center:event"}}{{/crossLink}} event on change.
             *
             * @property center
             * @default [0,0,0]
             * @type {Float32Array}
             */
            center: {

                set: function (value) {

                    (this._center = this._center || new xeogl.math.vec3()).set(value || [0, 0, 0]);

                    this._scheduleUpdate();

                    /**
                     Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/center:property"}}{{/crossLink}} property changes.
                     @event center
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("center", this._center);
                },

                get: function () {
                    return this._center;
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
             * Fires a {{#crossLink "PlaneGeometry/zSize:event"}}{{/crossLink}} event on change.
             *
             * @property zSize
             * @default 1.0
             * @type Number
             */
            zSize: {

                set: function (value) {

                    value = value || 1.0;

                    if (this._zSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative zSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._zSize = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/zSize:property"}}{{/crossLink}} property changes.
                     * @event zSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSize", this._zSize);
                },

                get: function () {
                    return this._zSize;
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
             * Fires a {{#crossLink "PlaneGeometry/zSegments:event"}}{{/crossLink}} event on change.
             *
             * @property zSegments
             * @default 1
             * @type Number
             */
            zSegments: {

                set: function (value) {

                    value = value || 1;

                    if (this._zSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative zSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._zSegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this PlaneGeometry's {{#crossLink "PlaneGeometry/zSegments:property"}}{{/crossLink}} property changes.
                     * @event zSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSegments", this._zSegments);
                },

                get: function () {
                    return this._zSegments;
                }
            }
        },

        _getJSON: function () {
            return {
                center: this._center.slice(),
                xSize: this._xSize,
                zSize: this._zSize,
                xSegments: this._xSegments,
                zSegments: this._zSegments
            };
        }
    });

})();
