/**
 A path geometry.

 @class PathGeometry
 @module geometry
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

    __scheduleBuild: function () {
        if (!this.__dirty) {
            this.__dirty = true;
            var self = this;
            this.scene.once("tick4",
                function () {
                    self.__build();
                    self.__dirty = false;
                });
        }
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

                // Unsubscribe from old Curves's events

                var oldPath = this._children.path;

                if (oldPath && (!value || (value.id !== undefined ? value.id : value) !== oldPath.id)) {
                    oldPath.off(this._onPathCurves);
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
                            self.__scheduleBuild();
                        });
                }
            },

            get: function () {
                return this._children.path;
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

                this.fire("divisions", this._divisions);

                this.__scheduleBuild();
            },

            get: function () {
                return this._divisions;
            }
        }
    },

    __build: function () {

        var path = this._children.path;

        if (!path) {
            return;
        }

        var points = path.getPoints(this._divisions);

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

        this.primitive = "lines";
        this.positions = positions;
        this.indices = indices;
        this.normals = null;
        this.uv = null;
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

        if (this._children.path) {
            this._children.path.off(this._onPathCurves);
        }

        this._super();
    }
});