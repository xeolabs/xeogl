/**
 Shows the shape and control points of {{#crossLink "SplineCurve"}}{{/crossLink}}

 @class SplineCurveHelper
 @module entities
 @extends Component
 */
xeogl.SplineCurveHelper = xeogl.Component.extend({

    type: "xeogl.SplineCurveHelper",

    _init: function (cfg) {

        this._super(cfg);

        this._divisions = 100;

        this._line = new xeogl.Entity(this.scene, {
            geometry: new xeogl.Geometry(this.scene, {
                primitive: "lines",
                positions: [0, 0, 0],
                indices: [0, 1]
            }),
            material: new xeogl.PhongMaterial(this.scene, {
                diffuse: [1, 0, 0]
            })
        });

        this.splineCurve = cfg.splineCurve;
    },

    _update: function () {

        var splineCurve = this._children.splineCurve;

        if (!splineCurve) {
            return;
        }

        var points = splineCurve.getPoints(this._divisions);

        var positions = [];
        var point;

        for (var i = 0, len = points.length; i < len; i++) {

            point = points[i];

            positions.push(point[0]);
            positions.push(point[1]);
            positions.push(point[2]);
        }

        var indices = [];

        for (var i = 0, len = points.length - 1; i < len; i++) {
            indices.push(i);
            indices.push(i + 1);
        }

        this._line.geometry.positions = positions;
        this._line.geometry.indices = indices;
    },

    _props: {

        /**
         * The SplineCurve for this SplineCurveHelper.
         *
         * Fires a {{#crossLink "SplineCurveHelper/splineCurve:event"}}{{/crossLink}} event on change.
         *
         * @property splinecurve
         * @type {Splinecurve}
         */
        splineCurve: {

            set: function (value) {

                // Unsubscribe from old Curves's events

                var oldSplineCurve = this._children.splineCurve;

                if (oldSplineCurve && (!value || (value.id !== undefined ? value.id : value) !== oldSplinecurve.id)) {
                    oldSplineCurve.off(this._onSplinecurveCurves);
                }

                /**
                 * Fired whenever this CameraPaths's {{#crossLink "CameraPath/path:property"}}{{/crossLink}} property changes.
                 * @event path
                 * @param value The property's new value
                 */
                this._setChild("path", value);

                var newPath = this._children.path;

                if (newPath) {

                    // Subscribe to new Path's curves

                    var self = this;

                    this._onPathCurves = newPath.on("curves",
                        function () {
                            self._needUpdate();
                        });
                }
            },

            get: function () {
                return this._children.path;
            }
        }
    },

    _getJSON: function () {

        var json = {
            divisions: this._divisions
        };

        if (this._children.path) {
            json.path = this._children.path.id;
        }

        return json;
    },

    _destroy: function () {
        this._line.destroy();
    }
});