/**
 A **SphereGeometry** is a parameterized {{#crossLink "Geometry"}}{{/crossLink}} that defines a sphere-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_SphereGeometry"><img src="../../assets/images/screenshots/SphereGeometry.png"></img></a>

 ## Overview
 
 * Dynamically modify a SphereGeometry's shape at any time by updating its {{#crossLink "SphereGeometry/center:property"}}{{/crossLink}}, {{#crossLink "SphereGeometry/radius:property"}}{{/crossLink}}, {{#crossLink "SphereGeometry/heightSegments:property"}}{{/crossLink}} and
 {{#crossLink "SphereGeometry/widthSegments:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.
 
 ## Examples


 * [Textured SphereGeometry](../../examples/#geometry_SphereGeometry)


 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a SphereGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.SphereGeometry({
         center: [0,0,0],
         radius: 1.5,
         heightSegments: 60,
         widthSegments: 60
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class SphereGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this SphereGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SphereGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values for a SphereGeometry are 'points', 'lines' and 'triangles'.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the SphereGeometry.
 @param [cfg.radius=1] {Number}
 @param [cfg.heightSegments=24] {Number} The SphereGeometry's number of latitudinal bands.
 @param [cfg.widthSegments=18] {Number} The SphereGeometry's number of longitudinal bands.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.SphereGeometry = xeogl.Geometry.extend({

        type: "xeogl.SphereGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.lod = cfg.lod;
            this.center = cfg.center;
            this.radius = cfg.radius;
            this.heightSegments = cfg.heightSegments;
            this.widthSegments = cfg.widthSegments;
        },

        /**
         * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
         * to generate geometry data arrays.
         *
         * @protected
         */
        _update: function () {

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

            var xCenter = this._center[0];
            var yCenter = this._center[1];
            var zCenter = this._center[2];

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
                    u = 1.0 - j / widthSegments;
                    v = 1.0 - i / heightSegments;

                    normals.push(x);
                    normals.push(y);
                    normals.push(z);

                    uvs.push(u);
                    uvs.push(v);

                    positions.push(xCenter + radius * x);
                    positions.push(yCenter + radius * y);
                    positions.push(zCenter + radius * z);
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
             * The SphereGeometry's level-of-detail factor.
             *
             * Fires a {{#crossLink "SphereGeometry/lod:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this SphereGeometry's {{#crossLink "SphereGeometry/lod:property"}}{{/crossLink}} property changes.
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
             * 3D point indicating the center position of this SphereGeometry.
             *
             * Fires an {{#crossLink "SphereGeometry/center:event"}}{{/crossLink}} event on change.
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
                     Fired whenever this SphereGeometry's {{#crossLink "SphereGeometry/center:property"}}{{/crossLink}} property changes.
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
             * The SphereGeometry's radius.
             *
             * Fires a {{#crossLink "SphereGeometry/radius:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this SphereGeometry's {{#crossLink "SphereGeometry/radius:property"}}{{/crossLink}} property changes.
                     * @event radius
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("radius", this._radius);
                },

                get: function () {
                    return this._radius;
                }
            },


            /**
             * The SphereGeometry's number of latitudinal bands.
             *
             * Fires a {{#crossLink "SphereGeometry/heightSegments:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this SphereGeometry's {{#crossLink "SphereGeometry/heightSegments:property"}}{{/crossLink}} property changes.
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
             * The SphereGeometry's number of longitudinal bands.
             *
             * Fires a {{#crossLink "SphereGeometry/widthSegments:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this SphereGeometry's {{#crossLink "SphereGeometry/widthSegments:property"}}{{/crossLink}} property changes.
                     * @event widthSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("widthSegments", this._widthSegments);
                },

                get: function () {
                    return this._widthSegments;
                }
            }
        },

        _getJSON: function () {
            return {
                // Don't save lod
                center: this._center.slice(),
                radius: this._radius,
                heightSegments: this._heightSegments,
                widthSegments: this._widthSegments
            };
        }
    });

})();
