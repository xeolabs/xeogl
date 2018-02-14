/**

 A **PathGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that is defined by a {{#crossLink "Curve"}}{{/crossLink}}.

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a PathGeometry, a {{#crossLink "Path"}}{{/crossLink}} and
 a {{#crossLink "PhongMaterial"}}{{/crossLink}}:

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.PathGeometry({

        divisions: 10,

        path: new xeogl.Path({

            // Subpaths

            curves: [
                new xeogl.CubicBezierCurve({
                    v0: [-10, 0, 0],
                    v1: [-5, 15, 0],
                    v2: [20, 15, 0],
                    v3: [10, 0, 0]
                }),
                new xeogl.QuadraticBezierCurve({
                    v0: [10, 0, 0],
                    v1: [30, 15, 0],
                    v2: [20, 0, 0]
                }),
                new xeogl.SplineCurve({
                    points: [
                        [20, 0, 0],
                        [-5, 15, 0],
                        [20, 15, 0],
                        [10, 0, 0]
                    ]
                })
            ]
        })
     }),

     material: new xeogl.PhongMaterial(
        diffuse: [1,0,0]
     })
 });
 ````

 @class PathGeometry
 @module xeogl
 @submodule geometry
 @extends Geometry
 */
xeogl.PathGeometry = xeogl.Geometry.extend({

    type: "xeogl.PathGeometry",

    // Constructor

    _init: function (cfg) {

        this._super(cfg);

        this.path = cfg.path;
        this.divisions = cfg.divisions;
    },

    /**
     * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
     * to generate geometry data arrays.
     *
     * @protected
     */
    _update: function () {

        var path = this._attached.path;

        if (!path) {
            return;
        }

        var i;
        var len;

        var points = path.getPoints(this._divisions);

        var positions = [];
        var point;

        for (i = 0, len = points.length; i < len; i++) {

            point = points[i];

            positions.push(point[0]);
            positions.push(point[1]);
            positions.push(point[2]);
        }

        var indices = [];

        for (i = 0, len = points.length - 1; i < len; i++) {
            indices.push(i);
            indices.push(i + 1);
        }

        this.primitive = "lines";
        this.positions = positions;
        this.indices = indices;
        this.normals = null;
        this.uv = null;
    },

    _props: {

        /**
         * The Path for this PathGeometry.
         *
         * @property path
         * @type {Path}
         */
        path: {

            set: function (value) {

                this._attach({
                    name: "path",
                    type: "xeogl.Curve",
                    component: value,
                    sceneDefault: false,
                    on: {
                        curves: {
                            callback: this._needUpdate,
                            scope: this
                        }
                    }
                });
            },

            get: function () {
                return this._attached.path;
            }
        },

        /**
         * The number of segments in this PathGeometry.
         *
         * @property divisions
         * @default 6
         * @type {Number}
         */
        divisions: {

            set: function (value) {

                value = value || 6;

                this._divisions = value;

                this._needUpdate();
            },

            get: function () {
                return this._divisions;
            }
        }
    }
});