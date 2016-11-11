/**
 A **LatheGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that's defined as the revolution of a profile about an exis.

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a LatheGeometry and a {{#crossLink "PhongMaterial"}}{{/crossLink}} with
 diffuse {{#crossLink "Texture"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.LatheGeometry({
        primitive: "triangles",
        points: [
            [ 0, 0,  8],
            [-2, 0,  5],
            [-1, 0,  5.1],
            [-1, 0, -2],
            [ 0, 0, -2]
        ],
        segments: 10,
        phiStart: 0,
        phiLength:90,
        lod: 1.0, // Default
        autoNormals: true // Default
     }),

     material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });
 ````


 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this LatheGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this LatheGeometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.points=[]] Profile points.
 @param [cfg.segments=4] {Number} Number of revolution segments.
 @param [cfg.phiStart=0] {Number} Angle in degrees at which revolution starts.
 @param [cfg.phiLength=360] {Number} Length of revolution in degrees.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.LatheGeometry = xeogl.Geometry.extend({

        type: "xeogl.LatheGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.points = cfg.points;
            this.segments = cfg.segments;
            this.phiStart = cfg.phiStart;
            this.phiLength = cfg.phiLength;
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

            var positions = [];
            var uvs = [];
            var indices = [];
            var segments = Math.floor(this._lod * this._segments);
            if (segments < 4) {
                segments = 4;
            }
            var phiStart = this._phiStart * xeogl.math.DEGTORAD;
            var phiLength = this._phiLength * xeogl.math.DEGTORAD;
            var points = this._points;
            var inversePointLength = 1.0 / ( points.length - 1 );
            var inverseSegments = 1.0 / segments;

            for (var i = 0, il = segments; i <= il; i++) {

                var phi = phiStart + i * inverseSegments * phiLength;

                var c = Math.cos(phi);
                var s = Math.sin(phi);

                for (var j = 0, jl = points.length; j < jl; j++) {

                    var pt = points[j];

                    positions.push(c * pt[0] - s * pt[1]);
                    positions.push(s * pt[0] + c * pt[1]);
                    positions.push(pt[2]);
                }
            }

            var np = points.length;

            for (var i = 0, il = segments; i < il; i++) {

                for (var j = 0, jl = points.length - 1; j < jl; j++) {

                    var base = j + np * i;
                    var a = base;
                    var b = base + np;
                    var c = base + 1 + np;
                    var d = base + 1;

                    var u0 = i * inverseSegments;
                    var v0 = j * inversePointLength;
                    var u1 = u0 + inverseSegments;
                    var v1 = v0 + inversePointLength;

                    indices.push(d);
                    indices.push(b);
                    indices.push(a);

                    //uvs.push(u0);
                    //uvs.push(v0);
                    //
                    //uvs.push(u1);
                    //uvs.push(v0);
                    //
                    //uvs.push(u0);
                    //uvs.push(v1);

                    indices.push(d);
                    indices.push(c);
                    indices.push(b);

                    //uvs.push(u1);
                    //uvs.push(v0);
                    //
                    //uvs.push(u1);
                    //uvs.push(v1);
                    //
                    //uvs.push(u0);
                    //uvs.push(v1);
                }
            }

            this.positions = positions;
         //   this.normals = positions;
          //  this.uv = positions;
            this.indices = indices;
        },

        _props: {

            /**
             Profile points on this LatheGeometry.

             Fires a {{#crossLink "LatheGeometry/points:event"}}{{/crossLink}} event on change.

             @property points
             @default []
             @type Float32Array
             */
            points: {

                set: function (value) {

                    this._points = value || [];

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this LatheGeometry's
                     * {{#crossLink "LatheGeometry/points:property"}}{{/crossLink}} property changes.
                     * @event points
                     * @param value The property's new value
                     */
                    this.fire("points", this._points);
                },

                get: function () {
                    return this._points;
                }
            },

            /**
             * The LatheGeometry's level-of-detail factor.
             *
             * Fires a {{#crossLink "LatheGeometry/lod:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this LatheGeometry's {{#crossLink "LatheGeometry/lod:property"}}{{/crossLink}} property changes.
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
             * Angle at which this LatheGeometry's rotation starts.
             *
             * Fires a {{#crossLink "LatheGeometry/phiStart:event"}}{{/crossLink}} event on change.
             *
             * @property phiStart
             * @default 0
             * @type Number
             */
            phiStart: {

                set: function (value) {

                    value = value || 0;

                    if (this._phiStart === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative phiStart not allowed - will invert");
                        value = value * -1;
                    }

                    this._phiStart = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this LatheGeometry's {{#crossLink "LatheGeometry/phiStart:property"}}{{/crossLink}} property changes.
                     * @event phiStart
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("phiStart", this._phiStart);
                },

                get: function () {
                    return this._phiStart;
                }
            },

            /**
             * Angle at which this LatheGeometry's rotation starts.
             *
             * Fires a {{#crossLink "LatheGeometry/phiLength:event"}}{{/crossLink}} event on change.
             *
             * @property phiLength
             * @default 1
             * @type Number
             */
            phiLength: {

                set: function (value) {

                    value = value || 1;

                    if (this._phiLength === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative phiLength not allowed - will invert");
                        value = value * -1;
                    }

                    this._phiLength = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this LatheGeometry's {{#crossLink "LatheGeometry/phiLength:property"}}{{/crossLink}} property changes.
                     * @event phiLength
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("phiLength", this._phiLength);
                },

                get: function () {
                    return this._phiLength;
                }
            },

            /**
             * The LatheGeometry's number of segments of rotation.
             *
             * Fires a {{#crossLink "LatheGeometry/segments:event"}}{{/crossLink}} event on change.
             *
             * @property segments
             * @default 4
             * @type Number
             */
            segments: {

                set: function (value) {

                    value = Math.floor(value || 4);

                    if (this._segments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative segments not allowed - will invert");
                        value = value * -1;
                    }

                    this._segments = value;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this LatheGeometry's {{#crossLink "LatheGeometry/segments:property"}}{{/crossLink}} property changes.
                     * @event segments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("segments", this._segments);
                },

                get: function () {
                    return this._segments;
                }
            }
        },

        _getJSON: function () {
            return {
                points: this._points,
                phiStart: this._phiStart,
                phiLength: this._phiLength,
                segments: this._segments
            };
        }
    });

})();
