/**
 A **BoxGeometry** defines box-shaped geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class BoxGeometry
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BoxGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoxGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.xSize=1.0] {Number}
 @param [cfg.ySize=1.0] {Number}
 @param [cfg.zSize=1.0] {Number}
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.BoxGeometry = XEO.Geometry.extend({

        type: "XEO.BoxGeometry",

        _init: function (cfg) {

            this._super(cfg);

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

            var xmin = -this._xSize;
            var ymin = -this._ySize;
            var zmin = -this._zSize;
            var xmax = this._xSize;
            var ymax = this._ySize;
            var zmax = this._zSize;

            this.positions = [
                xmin, ymin, zmax,
                xmax, ymin, zmax,
                xmax, ymax, zmax,
                xmin, ymax, zmax, // Front face

                xmin, ymin, zmin,
                xmin, ymax, zmin,
                xmax, xmax, zmin,
                xmax, ymin, zmin, // Back face

                xmin, ymax, zmin,
                xmin, ymax, zmax,
                xmax, ymax, zmax,
                xmax, ymax, zmin, // Top face

                xmin, ymin, zmin,
                xmax, ymin, zmin,
                xmax, ymin, zmax,
                xmin, ymin, zmax, // Bottom face

                xmax, ymin, zmin,
                xmax, ymax, zmin,
                xmax, ymax, zmax,
                xmax, ymin, zmax, // Right face

                xmin, ymin, zmin,
                xmin, ymin, zmax,
                xmin, ymax, zmax,
                xmin, ymax, zmin // Left face
            ];

            this.normals = [
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
            ];

            this.uv = [
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 1, 0, 0, 1, 0, 1, 1,
                1, 0, 1, 1, 0, 1, 0, 0,
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1
            ];

            // Tangents are lazy-computed from normals and UVs
            // for Normal mapping once we know we have texture

            this.tangents = null;

            this.indices = [
                0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // back
                8, 9, 10, 8, 10, 11,   // top
                12, 13, 14, 12, 14, 15,   // bottom
                16, 17, 18, 16, 18, 19,   // right
                20, 21, 22, 20, 22, 23    // left
            ];
        },

        _props: {

            /**
             * The BoxGeometry's size on the X-axis.
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
             * The BoxGeometry's size on the Y-axis.
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
             * The BoxGeometry's size on the Z-axis.
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
                xSize: this._xSize,
                ySize: this._ySize,
                zSize: this._zSize
            };
        }
    });

})();
