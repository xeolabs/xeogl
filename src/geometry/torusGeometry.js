/**
 A **TorusGeometry** extends {{#crossLink "Geometry"}}{{/crossLink}} to define a torus-shaped mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_TorusGeometry"><img src="../../assets/images/screenshots/TorusGeometry.png"></img></a>

 ## Examples

 <ul>
 <li>[Textured TorusGeometry](../../examples/#geometry_TorusGeometry)</li>
 </ul>

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a TorusGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.TorusGeometry({
         radius: 1.0,
         tube: 0.3,
         radialSegments: 32,
         tubeSegments: 24,
         arc: Math.PI * 2.0
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````

 @class TorusGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this TorusGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this TorusGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.radius=1] {Number} The overall radius of the TorusGeometry.
 @param [cfg.tube=0.3] {Number} The tube radius of the TorusGeometry.
 @param [cfg.radialSegments=32] {Number} The number of radial segments that make up the TorusGeometry.
 @param [cfg.tubeSegments=24] {Number} The number of tubular segments that make up the TorusGeometry.
 @param [cfg.arc=Math.PI / 2.0] {Number} The length of the TorusGeometry's arc in in radians, where Math.PI*2 is a closed torus.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.TorusGeometry = xeogl.Geometry.extend({

        type: "xeogl.TorusGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.lod = cfg.lod;
            this.radius = cfg.radius;
            this.tube = cfg.tube;
            this.radialSegments = cfg.radialSegments;
            this.tubeSegments = cfg.tubeSegments;
            this.arc = cfg.arc;
        },

        /**
         * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
         * to generate geometry data arrays.
         *
         * @protected
         */
        _update: function () {

            var radius = this._radius;
            var tube = this._tube;
            var radialSegments = Math.floor(this._radialSegments * this._lod);
            var tubeSegments = Math.floor(this._tubeSegments * this._lod);
            var arc = this._arc;

            if (radialSegments < 4) {
                radialSegments = 4;
            }

            if (tubeSegments < 4) {
                tubeSegments = 4;
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

            for (j = 0; j <= radialSegments; j++) {
                for (i = 0; i <= tubeSegments; i++) {

                    u = i / tubeSegments * arc;
                    v = j / radialSegments * Math.PI * 2;

                    centerX = radius * Math.cos(u);
                    centerY = radius * Math.sin(u);

                    x = (radius + tube * Math.cos(v) ) * Math.cos(u);
                    y = (radius + tube * Math.cos(v) ) * Math.sin(u);
                    z = tube * Math.sin(v);

                    positions.push(x);
                    positions.push(y);
                    positions.push(z);

                    uvs.push(1 - (i / tubeSegments));
                    uvs.push(1 - (j / radialSegments));

                    vec = xeogl.math.normalizeVec3(xeogl.math.subVec3([x, y, z], [centerX, centerY, centerZ], []), []);

                    normals.push(vec[0]);
                    normals.push(vec[1]);
                    normals.push(vec[2]);
                }
            }

            var a;
            var b;
            var c;
            var d;

            for (j = 1; j <= radialSegments; j++) {
                for (i = 1; i <= tubeSegments; i++) {

                    a = ( tubeSegments + 1 ) * j + i - 1;
                    b = ( tubeSegments + 1 ) * ( j - 1 ) + i - 1;
                    c = ( tubeSegments + 1 ) * ( j - 1 ) + i;
                    d = ( tubeSegments + 1 ) * j + i;

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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/lod:property"}}{{/crossLink}} property changes.
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
             * The overall radius of the TorusGeometry.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/radius:property"}}{{/crossLink}} property changes.
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
             * The tube radius of the TorusGeometry.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/tube:property"}}{{/crossLink}} property changes.
                     * @event tube
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("tube", this._tube);
                },

                get: function () {
                    return this._tube;
                }
            },

            /**
             * The number of radial segments that make up the TorusGeometry.
             *
             * Fires a {{#crossLink "TorusGeometry/radialSegments:event"}}{{/crossLink}} event on change.
             *
             * @property radialSegments
             * @default 32
             * @type Number
             */
            radialSegments: {

                set: function (value) {

                    value = value || 32;

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
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/radialSegments:property"}}{{/crossLink}} property changes.
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
             * The number of tubular segments that make up the TorusGeometry.
             *
             * Fires a {{#crossLink "TorusGeometry/tubeSegments:event"}}{{/crossLink}} event on change.
             *
             * @property tubeSegments
             * @default 24
             * @type Number
             */
            tubeSegments: {

                set: function (value) {

                    value = value || 24;

                    if (this._tubeSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative tubeSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._tubeSegments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/tubeSegments:property"}}{{/crossLink}} property changes.
                     * @event tubeSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("tubeSegments", this._tubeSegments);
                },

                get: function () {
                    return this._tubeSegments;
                }
            },

            /**
             * The length of the TorusGeometry's arc in radians, where Math.PI*2 is a closed torus.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this TorusGeometry's {{#crossLink "TorusGeometry/arc:property"}}{{/crossLink}} property changes.
                     * @event arc
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("arc", this._arc);
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
                radialSegments: this._radialSegments,
                tubeSegments: this._tubeSegments,
                arc: this._arc
            };
        }
    });

})();
