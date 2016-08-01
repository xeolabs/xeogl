/**

 A **PathGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that is defined by a {{#crossLink "Curve"}}{{/crossLink}}.

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a PathGeometry, a {{#crossLink "Path"}}{{/crossLink}} and
 a {{#crossLink "PhongMaterial"}}{{/crossLink}}:

 ````javascript
 new XEO.Entity({

     geometry: new XEO.PathGeometry({

        divisions: 10,

        path: new XEO.Path({

            // Subpaths

            curves: [
                new XEO.CubicBezierCurve({
                    v0: [-10, 0, 0],
                    v1: [-5, 15, 0],
                    v2: [20, 15, 0],
                    v3: [10, 0, 0]
                }),
                new XEO.QuadraticBezierCurve({
                    v0: [10, 0, 0],
                    v1: [30, 15, 0],
                    v2: [20, 0, 0]
                }),
                new XEO.SplineCurve({
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

     material: new XEO.PhongMaterial(
        diffuse: [1,0,0]
     })
 });
 ````

 @class PathGeometry
 @module XEO
 @submodule geometry
 @extends Geometry
 */
XEO.PathGeometry = XEO.Geometry.extend({

    type: "XEO.PathGeometry",

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
         * Fires a {{#crossLink "PathGeometry/path:event"}}{{/crossLink}} event on change.
         *
         * @property path
         * @type {Path}
         */
        path: {

            set: function (value) {

                /**
                 * Fired whenever this CameraPaths's {{#crossLink "CameraPath/path:property"}}{{/crossLink}} property changes.
                 * @event path
                 * @param value The property's new value
                 */
                this._attach({
                    name: "path",
                    type: "XEO.Curve",
                    component: value,
                    sceneDefault: false,
                    on: {
                        curves: {
                            callback: this._scheduleUpdate,
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
         * Fires a {{#crossLink "PathGeometry/divisions:event"}}{{/crossLink}} event on change.
         *
         * @property divisions
         * @default 6
         * @type {Number}
         */
        divisions: {

            set: function (value) {

                value = value || 6;

                this._divisions = value;

                this._scheduleUpdate();

                this.fire("divisions", this._divisions);
            },

            get: function () {
                return this._divisions;
            }
        }
    },

    _getJSON: function () {

        var json = {
            divisions: this._divisions
        };

        if (this._attached.path) {
            json.path = this._attached.path.id;
        }

        return json;
    }
});