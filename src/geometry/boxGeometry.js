/**
 A **BoxGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a box-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_BoxGeometry"><img src="../../assets/images/screenshots/BoxGeometry.png"></img></a>

 ## Overview

 * Dynamically modify a BoxGeometry's dimensions at any time by updating its {{#crossLink "BoxGeometry/center:property"}}{{/crossLink}}, {{#crossLink "BoxGeometry/xSize:property"}}{{/crossLink}}, {{#crossLink "BoxGeometry/ySize:property"}}{{/crossLink}} and {{#crossLink "BoxGeometry/zSize:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.

 ## Examples

 * [Textured BoxGeometry](../../examples/#geometry_BoxGeometry)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a BoxGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.BoxGeometry({
        center: [0,0,0],
        xSize: 1,  // Half-size on each axis; BoxGeometry is actually two units big on each side.
        ySize: 1,
        zSize: 1
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class BoxGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BoxGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoxGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a BoxGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position.
 @param [cfg.xSize=1.0] {Number} Half-size on the X-axis.
 @param [cfg.ySize=1.0] {Number} Half-size on the Y-axis.
 @param [cfg.zSize=1.0] {Number} Half-size on the Z-axis.
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.BoxGeometry = xeogl.Geometry.extend({

        type: "xeogl.BoxGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.center = cfg.center;
            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;
            this.zSize = cfg.zSize;
        },

        /**
         * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
         * to generate geometry data arrays.
         *
         * @protected
         */
        _update: function () {

            var xmin = -this._xSize + this._center[0];
            var ymin = -this._ySize + this._center[1];
            var zmin = -this._zSize + this._center[2];
            var xmax = this._xSize + this._center[0];
            var ymax = this._ySize + this._center[1];
            var zmax = this._zSize + this._center[2];

            // The vertices - eight for our cube, each
            // one spanning three array elements for X,Y and Z
            this.positions = [

                // v0-v1-v2-v3 front
                xmax, ymax, zmax,
                xmin, ymax, zmax,
                xmin, ymin, zmax,
                xmax, ymin, zmax,

                // v0-v3-v4-v1 right
                xmax, ymax, zmax,
                xmax, ymin, zmax,
                xmax, ymin, zmin,
                xmax, ymax, zmin,

                // v0-v1-v6-v1 top
                xmax, ymax, zmax,
                xmax, ymax, zmin,
                xmin, ymax, zmin,
                xmin, ymax, zmax,

                // v1-v6-v7-v2 left
                xmin, ymax, zmax,
                xmin, ymax, zmin,
                xmin, ymin, zmin,
                xmin, ymin, zmax,

                // v7-v4-v3-v2 bottom
                xmin, ymin, zmin,
                xmax, ymin, zmin,
                xmax, ymin, zmax,
                xmin, ymin, zmax,

                // v4-v7-v6-v1 back
                xmax, ymin, zmin,
                xmin, ymin, zmin,
                xmin, ymax, zmin,
                xmax, ymax, zmin
            ];

            // Normal vectors, one for each vertex
            this.normals = [

                // v0-v1-v2-v3 front
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                // v0-v3-v4-v5 right
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                // v0-v5-v6-v1 top
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                // v1-v6-v7-v2 left
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,

                // v7-v4-v3-v2 bottom
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,

                // v4-v7-v6-v5 back
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1
            ];

            // UV coords
            this.uv = [

                // v0-v1-v2-v3 front
                1, 1,
                0, 1,
                0, 0,
                1, 0,

                // v0-v3-v4-v1 right
                0, 1,
                0, 0,
                1, 0,
                1, 1,

                // v0-v1-v6-v1 top
                1, 0,
                1, 1,
                0, 1,
                0, 0,

                // v1-v6-v7-v2 left
                1, 1,
                0, 1,
                0, 0,
                1, 0,

                // v7-v4-v3-v2 bottom
                0, 0,
                1, 0,
                1, 1,
                0, 1,

                // v4-v7-v6-v1 back
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ];

            // Indices - these organise the
            // positions and uv texture coordinates
            // into geometric primitives in accordance
            // with the "primitive" parameter,
            // in this case a set of three indices
            // for each triangle.
            //
            // Note that each triangle is specified
            // in counter-clockwise winding order.
            //
            // You can specify them in clockwise
            // order if you configure the Modes
            // node's frontFace flag as "cw", instead of
            // the default "ccw".
            this.indices = [
                0, 1, 2,
                0, 2, 3,
                // front
                4, 5, 6,
                4, 6, 7,
                // right
                8, 9, 10,
                8, 10, 11,
                // top
                12, 13, 14,
                12, 14, 15,
                // left
                16, 17, 18,
                16, 18, 19,
                // bottom
                20, 21, 22,
                20, 22, 23
            ];

            // Tangents are lazy-computed from normals and UVs
            // for Normal mapping once we know we have texture

            this.tangents = null;
        },

        _props: {

            /**
             * 3D point indicating the center position of this BoxGeometry.
             *
             * Fires an {{#crossLink "BoxGeometry/center:event"}}{{/crossLink}} event on change.
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
                     Fired whenever this BoxGeometry's {{#crossLink "BoxGeometry/center:property"}}{{/crossLink}} property changes.
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
             * The BoxGeometry's half-size on the X-axis.
             *
             * Fires a {{#crossLink "BoxGeometry/xsize:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this BoxGeometry's {{#crossLink "BoxGeometry/xSize:property"}}{{/crossLink}} property changes.
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
             * The BoxGeometry's half-size on the Y-axis.
             *
             * Fires a {{#crossLink "BoxGeometry/ySize:event"}}{{/crossLink}} event on change.
             *
             * @property ySize
             * @default 1
             * @type Number
             */
            ySize: {

                set: function (value) {

                    value = value || 1;

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
                     * Fired whenever this BoxGeometry's {{#crossLink "BoxGeometry/ySize:property"}}{{/crossLink}} property changes.
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
             * The BoxGeometry's half-size on the Z-axis.
             *
             * Fires a {{#crossLink "BoxGeometry/zSize:event"}}{{/crossLink}} event on change.
             *
             * @property zSize
             * @default 1
             * @type Number
             */
            zSize: {

                set: function (value) {

                    value = value || 1;

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
                     * Fired whenever this BoxGeometry's {{#crossLink "BoxGeometry/zSize:property"}}{{/crossLink}} property changes.
                     * @event zSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSize", this._zSize);
                },

                get: function () {
                    return this._zSize;
                }
            }
        },

        _getJSON: function () {
            return {
                center: this._center.slice(),
                xSize: this._xSize,
                ySize: this._ySize,
                zSize: this._zSize
            };
        }
    });

})();
