/**
 A **CylinderGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a cylinder-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_CylinderGeometry"><img src="../../assets/images/screenshots/CylinderGeometry.png"></img></a>

 ## Overview

 * Dynamically modify a CylinderGeometry's shape at any time by updating its {{#crossLink "CylinderGeometry/center:property"}}{{/crossLink}}, {{#crossLink "CylinderGeometry/radiusTop:property"}}{{/crossLink}}, {{#crossLink "CylinderGeometry/radiusBottom:property"}}{{/crossLink}}, {{#crossLink "CylinderGeometry/height:property"}}{{/crossLink}},
 {{#crossLink "CylinderGeometry/radialSegments:property"}}{{/crossLink}}, {{#crossLink "CylinderGeometry/heightSegments:property"}}{{/crossLink}} and
 {{#crossLink "CylinderGeometry/openEnded:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.

 ## Examples

 * [Textured CylinderGeometry](../../examples/#geometry_CylinderGeometry)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a CylinderGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.CylinderGeometry({
         center: [0,0,0],
         radiusTop: 2.0,
         radiusBottom: 2.0,
         height: 5.0,
         radialSegments: 20,
         heightSegments: 1,
         openEnded: false
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class CylinderGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CylinderGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CylinderGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a CylinderGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the CylinderGeometry.
 @param [cfg.radiusTop=1] {Number} Radius of top.
 @param [cfg.radiusBottom=1] {Number} Radius of bottom.
 @param [cfg.height=1] {Number} Height.
 @param [cfg.radialSegments=60] {Number} Number of segments around the CylinderGeometry.
 @param [cfg.heightSegments=1] {Number} Number of vertical segments.
 @param [cfg.openEnded=false] {Boolean} Whether or not the CylinderGeometry has solid caps on the ends.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.CylinderGeometry = xeogl.Geometry.extend({

        type: "xeogl.CylinderGeometry",

        _init: function (cfg) {

            this._super(cfg);
            this.center = cfg.center;
            this.lod = cfg.lod;
            this.center = cfg.center;
            this.radiusTop = cfg.radiusTop;
            this.radiusBottom = cfg.radiusBottom;
            this.height = cfg.height;
            this.radialSegments = cfg.radialSegments;
            this.heightSegments = cfg.heightSegments;
            this.openEnded = cfg.openEnded;
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

            var radiusTop = this._radiusTop;
            var radiusBottom = this._radiusBottom;
            var height = this._height;
            var radialSegments = Math.floor(this._radialSegments * this._lod);
            var heightSegments = Math.floor(this._heightSegments * this._lod);

            if (radialSegments < 3) {
                radialSegments = 3;
            }

            if (heightSegments < 1) {
                heightSegments = 1;
            }

            var openEnded = this._openEnded;

            var heightHalf = height / 2;
            var heightLength = height / heightSegments;
            var radialAngle = (2.0 * Math.PI / radialSegments);
            var radialLength = 1.0 / radialSegments;
            //var nextRadius = this._radiusBottom;
            var radiusChange = (radiusTop - radiusBottom) / heightSegments;

            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            var h;
            var i;

            var x;
            var z;

            var currentRadius;
            var currentHeight;

            var center;
            var first;
            var second;

            var startIndex;
            var tu;
            var tv;

            // create vertices
            var normalY = (90.0 - (Math.atan(height / (radiusBottom - radiusTop))) * 180 / Math.PI) / 90.0;

            for (h = 0; h <= heightSegments; h++) {
                currentRadius = radiusTop - h * radiusChange;
                currentHeight = heightHalf - h * heightLength;

                for (i = 0; i <= radialSegments; i++) {
                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);

                    normals.push(currentRadius * x);
                    normals.push(normalY); //todo
                    normals.push(currentRadius * z);

                    uvs.push((i * radialLength));
                    uvs.push(1 - h * 1 / heightSegments);

                    positions.push((currentRadius * x) + centerX);
                    positions.push((currentHeight) + centerY);
                    positions.push((currentRadius * z) + centerZ);
                }
            }

            // create faces
            for (h = 0; h < heightSegments; h++) {
                for (i = 0; i <= radialSegments; i++) {

                    first = h * (radialSegments + 1) + i;
                    second = first + radialSegments;

                    indices.push(first);
                    indices.push(second);
                    indices.push(second + 1);

                    indices.push(first);
                    indices.push(second + 1);
                    indices.push(first + 1);
                }
            }

            // create top cap
            if (!openEnded && radiusTop > 0) {
                startIndex = (positions.length / 3);

                // top center
                normals.push(0.0);
                normals.push(1.0);
                normals.push(0.0);

                uvs.push(0.5);
                uvs.push(0.5);

                positions.push(0 + centerX);
                positions.push(heightHalf + centerY);
                positions.push(0 + centerZ);

                // top triangle fan
                for (i = 0; i <= radialSegments; i++) {
                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);
                    tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                    tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                    normals.push(radiusTop * x);
                    normals.push(1.0);
                    normals.push(radiusTop * z);

                    uvs.push(tu);
                    uvs.push(tv);

                    positions.push((radiusTop * x) + centerX);
                    positions.push((heightHalf) + centerY);
                    positions.push((radiusTop * z) + centerZ);
                }

                for (i = 0; i < radialSegments; i++) {
                    center = startIndex;
                    first = startIndex + 1 + i;

                    indices.push(first);
                    indices.push(first + 1);
                    indices.push(center);
                }
            }

            // create bottom cap
            if (!openEnded && radiusBottom > 0) {

                startIndex = (positions.length / 3);

                // top center
                normals.push(0.0);
                normals.push(-1.0);
                normals.push(0.0);

                uvs.push(0.5);
                uvs.push(0.5);

                positions.push(0 + centerX);
                positions.push(0 - heightHalf + centerY);
                positions.push(0 + centerZ);

                // top triangle fan
                for (i = 0; i <= radialSegments; i++) {

                    x = Math.sin(i * radialAngle);
                    z = Math.cos(i * radialAngle);

                    tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                    tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                    normals.push(radiusBottom * x);
                    normals.push(-1.0);
                    normals.push(radiusBottom * z);

                    uvs.push(tu);
                    uvs.push(tv);

                    positions.push((radiusBottom * x) + centerX);
                    positions.push((0 - heightHalf) + centerY);
                    positions.push((radiusBottom * z) + centerZ);
                }

                for (i = 0; i < radialSegments; i++) {

                    center = startIndex;
                    first = startIndex + 1 + i;

                    indices.push(center);
                    indices.push(first + 1);
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
             * The CylinderGeometry's level-of-detail factor.
             *
             * Fires a {{#crossLink "CylinderGeometry/lod:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/lod:property"}}{{/crossLink}} property changes.
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
             * 3D point indicating the center position of this CylinderGeometry.
             *
             * Fires an {{#crossLink "CylinderGeometry/center:event"}}{{/crossLink}} event on change.
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
                     Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/center:property"}}{{/crossLink}} property changes.
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
             * The CylinderGeometry's top radius.
             *
             * Fires a {{#crossLink "CylinderGeometry/radiusTop:event"}}{{/crossLink}} event on change.
             *
             * @property radiusTop
             * @default 1
             * @type Number
             */
            radiusTop: {

                set: function (value) {

                    value = value !== undefined ? value : 1;

                    if (this._radiusTop === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative radiusTop not allowed - will invert");
                        value = value * -1;
                    }

                    this._radiusTop = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/radiusTop:property"}}{{/crossLink}} property changes.
                     * @event radiusTop
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radiusTop", this._radiusTop);
                },

                get: function () {
                    return this._radiusTop;
                }
            },

            /**
             * The CylinderGeometry's bottom radius.
             *
             * Fires a {{#crossLink "CylinderGeometry/radiusBottom:event"}}{{/crossLink}} event on change.
             *
             * @property radiusBottom
             * @default 1
             * @type Number
             */
            radiusBottom: {

                set: function (value) {

                    value = value !== undefined ? value : 1;

                    if (this._radiusBottom === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative radiusBottom not allowed - will invert");
                        value = value * -1;
                    }

                    this._radiusBottom = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/radiusBottom:property"}}{{/crossLink}} property changes.
                     * @event radiusBottom
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radiusBottom", this._radiusBottom);
                },

                get: function () {
                    return this._radiusBottom;
                }
            },

            /**
             * The CylinderGeometry's height.
             *
             * Fires a {{#crossLink "CylinderGeometry/height:event"}}{{/crossLink}} event on change.
             *
             * @property height
             * @default 1
             * @type Number
             */
            height: {

                set: function (value) {

                    value = value || 1;

                    if (this._height === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative height not allowed - will invert");
                        value = value * -1;
                    }

                    this._height = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/height:property"}}{{/crossLink}} property changes.
                     * @event height
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("height", this._height);
                },

                get: function () {
                    return this._height;
                }
            },

            /**
             * The CylinderGeometry's radial segments.
             *
             * Fires a {{#crossLink "CylinderGeometry/radialSegments:event"}}{{/crossLink}} event on change.
             *
             * @property radialSegments
             * @default 60
             * @type Number
             */
            radialSegments: {

                set: function (value) {

                    value = value || 60;

                    if (this._radialSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative radialSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._radialSegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/radialSegments:property"}}{{/crossLink}} property changes.
                     * @event radialSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radialSegments", this._radialSegments);
                },

                get: function () {
                    return this._radialSegments;
                }
            },

            /**
             * The CylinderGeometry's height segments.
             *
             * Fires a {{#crossLink "CylinderGeometry/heightSegments:event"}}{{/crossLink}} event on change.
             *
             * @property heightSegments
             * @default 1
             * @type Number
             */
            heightSegments: {

                set: function (value) {

                    value = value || 1;

                    if (this._heightSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative heightSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._heightSegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/heightSegments:property"}}{{/crossLink}} property changes.
                     * @event heightSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("heightSegments", this._heightSegments);
                },

                get: function () {
                    return this._heightSegments;
                }
            },

            /**
             * Indicates whether this CylinderGeometry's is open-ended.
             *
             * Fires a {{#crossLink "CylinderGeometry/openEnded:event"}}{{/crossLink}} event on change.
             *
             * @property openEnded
             * @default false
             * @type Boolean
             */
            openEnded: {

                set: function (value) {

                    value = value === undefined ? false : value;

                    if (this._openEnded === value) {
                        return;
                    }

                    this._openEnded = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CylinderGeometry's {{#crossLink "CylinderGeometry/openEnded:property"}}{{/crossLink}} property changes.
                     * @event openEnded
                     * @type Boolean
                     * @param value The property's new value
                     */
                    this.fire("openEnded", this._openEnded);
                },

                get: function () {
                    return this._openEnded;
                }
            }
        },


        _getJSON: function () {
            return {
                // Don't save lod
                center: this._center.slice(),
                radiusTop: this._radiusTop,
                radiusBottom: this._radiusBottom,
                height: this._height,
                radialSegments: this._radialSegments,
                heightSegments: this._heightSegments,
                openEnded: this._openEnded
            };
        }
    });

})();
