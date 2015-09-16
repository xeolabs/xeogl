/**
 A **BoundaryGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the axis-aligned boundary of a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class BoundaryGeometry
 @module XEO
 @submodule helpers
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BoundaryGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoundaryGeometry.
 @param [cfg.boundary] {Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    XEO.BoundaryGeometry = XEO.Geometry.extend({

        type: "XEO.BoundaryGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.primitive = cfg.primitive || "lines";

            this.positions = [
                1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
                1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
                -1.0, -1.0, -1.0, -1.0, 1.0, -1.0
            ];

            this.indices = [
                0, 1, 1, 2, 2, 3, 3, 0, 4,
                5, 5, 6, 6, 7, 7, 4, 0, 4,
                1, 5, 2, 6, 3, 7
            ];

            this.boundary = cfg.boundary;
        },

        _props: {

            /**
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} we are showing.
             *
             * Fires a {{#crossLink "BoundaryGeometry/boundary:event"}}{{/crossLink}} event on change.
             *
             * @property Boundary3D
             * @type Boundary3D
             */
            boundary: {

                set: function (value) {

                    // Unsubscribe from old boundary's events

                    var oldBoundary = this._children.boundary;

                    if (oldBoundary) {
                        if ((!value || (value.id !== undefined ? value.id : value) !== oldBoundary.id)) {
                            oldBoundary.off(this._onBoundaryUpdated);
                        }
                    }

                    /**
                     * Fired whenever this BoundaryGeometry's {{#crossLink "BoundaryGeometry/boundary:property"}}{{/crossLink}} property changes.
                     *
                     * @event boundary
                     * @param value The property's new value
                     */
                    this._setChild("boundary", value);

                    var boundary = this._children.boundary;

                    if (boundary) {

                        var self = this;

                        this._onBoundaryUpdated = boundary.on("updated",
                            function () {

                                var obb = boundary.obb;


                                //self.positions = [
                                //    obb[6][0], obb[6][1], obb[6][2],
                                //    obb[6][0], obb[6][1], obb[6][2],
                                //    obb[4][0], obb[4][1], obb[4][2],
                                //    obb[4][0], obb[3][1], obb[4][2],
                                //    obb[5][0], obb[3][1], obb[3][2],
                                //    obb[5][0], obb[4][1], obb[3][2],
                                //    obb[4][0], obb[4][1], obb[3][2],
                                //    obb[4][0], obb[3][1], obb[3][2]
                                //];

                                self.positions = [
                                    obb[2][0], obb[2][1], obb[4][2],
                                    obb[2][0], obb[4][1], obb[4][2],
                                    obb[0][0], obb[4][1], obb[4][2],
                                    obb[0][0], obb[2][1], obb[4][2],
                                    obb[2][0], obb[2][1], obb[3][2],
                                    obb[2][0], obb[4][1], obb[3][2],
                                    obb[0][0], obb[4][1], obb[3][2],
                                    obb[0][0], obb[2][1], obb[3][2]
                                ];

                            //    var aabb = boundary.aabb;
                            //
                            //    var xmin = aabb.xmin;
                            //    var ymin = aabb.ymin;
                            //    var zmin = aabb.zmin;
                            //    var xmax = aabb.xmax;
                            //    var ymax = aabb.ymax;
                            //    var zmax = aabb.zmax;
                            //
                            //    self.positions = [
                            //        xmax, ymax, zmax,
                            //        xmax, ymin, zmax,
                            //        xmin, ymin, zmax,
                            //        xmin, ymax, zmax,
                            //        xmax, ymax, zmin,
                            //        xmax, ymin, zmin,
                            //        xmin, ymin, zmin,
                            //        xmin, ymax, zmin
                            //    ];
                            });
                    }
                },

                get: function () {
                    return this._children.boundary;
                }
            }
        },

        _getJSON: function () {

            var attr = {};

            if (this._children.boundary) {
                attr.boundary = this._children.boundary.id;
            }

            return attr;
        },

        _destroyed: function () {

            if (this._children.boundary) {
                this._children.boundary.off(this._onBoundaryUpdated);
            }
        }
    });

})();
