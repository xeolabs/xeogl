/**
 A **ShowBoundary** defines toroid geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class ShowBoundary
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ShowBoundary in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ShowBoundary.
 @param [cfg.radius=1] {Number}
 @param [cfg.tube=0.3] {Number}
 @param [cfg.segmentsR=32] {Number}
 @param [cfg.segmentsT=24] {Number}
 @param [cfg.arc=Math.PI / 2.0] {Number}
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.ShowBoundary = XEO.Geometry.extend({

        type: "XEO.ShowBoundary",

        _init: function (cfg) {

            this.box = new XEO.Geometry(this.scene);

            this.object = new XEO.GameObject(this.scene, {
                    geometry: this.box
                }
            );

            this.boundary = cfg.boundary;
        },
        props: {

            /**
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} we are showing.
             *
             * Fires a {{#crossLink "ShowBoundary/boundary:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this ShowBoundary's  {{#crossLink "ShowBoundary/boundary:property"}}{{/crossLink}} property changes.
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
                                if (self.box) {
                                    self.box.positions = boundary.obb;
                                }
                            });

                        this.box.positions = boundary.obb;
                    }
                },

                get: function () {
                    return this._children.boundary;
                }
            }
        },

        children: {
            boundary: {
                events: {
                    "updated": function () {
                        this._box.positions = this._children.boundary.obb;
                    }
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

            this._box.destroy();
            this._object.destroy();
        }
    });

})();
