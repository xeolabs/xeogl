/**
 A **MousePickEntity** picks {{#crossLink "Entity"}}Entities{{/crossLink}} with mouse clicks.

 ## Examples

 <ul>
 <li>[MousePickEntity example](../../examples/#interaction_MousePickEntity)</li>
 <li>[CameraControl example](../../examples/#interaction_CameraControl)</li>
 </ul>

 ## Usage

 ````Javascript
 // Create some Entities

 var entity1 = new XEO.Entity({
    id: "entity1",
    transform: new XEO.Translate(scene, { xyz: [-5, 0, 0] })
 });

 var entity2 = new XEO.Entity({
    id: "entity2",
    transform: new XEO.Translate(scene, { xyz: [0, 0, 0] })
 });

 var entity3 = new XEO.Entity({
    id: "entity3",
    transform: new XEO.Translate(scene, { xyz: [5, 0, 0] })
 });

 // Create a MousePickEntity
 var mousePickEntity = new XEO.MousePickEntity({

    // We want the 3D World-space coordinates
    // of each location we pick

    rayPick: true
 });

 // Handle picked Entities
 mousePickEntity.on("pick", function(e) {
    var entity = e.entity;
    var canvasPos = e.canvasPos;
    var primIndex = e.primIndex;
 });

 // Handle nothing picked
 mousePickEntity.on("nopick", function(e) {
    var canvasPos = e.canvasPos;
 });
 ````

 @class MousePickEntity
 @module XEO
 @submodule controls
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MousePickEntity.
 @param [rayPick=false] {Boolean} Indicates whether this MousePickEntity will find the 3D ray intersection whenever it picks a
 {{#crossLink "Entity"}}{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Indicates whether or not this MousePickEntity is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.MousePickEntity = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.MousePickEntity",

        _init: function (cfg) {

            this.rayPick = cfg.rayPick;

            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * Flag which indicates whether this MousePickEntity is active or not.
             *
             * Fires a {{#crossLink "MousePickEntity/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    if (this._active === value) {
                        return;
                    }

                    var input = this.scene.input;

                    if (value) {

                        var self = this;

                        var tolerance = 2; // Pixels
                        var over = false;
                        var down = false;
                        var downX;
                        var downY;

                        this._onMouseEnter = input.on("mouseenter",
                            function () {
                                over = true;
                            });

                        this._onMouseLeave = input.on("mouseleave",
                            function () {
                                over = false;
                            });

                        this._onMouseDown = input.on("mousedown",
                            function (canvasPos) {

                                if (!over) {
                                    return;
                                }

                                down = true;
                                downX = canvasPos[0];
                                downY = canvasPos[1];
                            });

                        this._onMouseUp = input.on("mouseup",
                            function (canvasPos) {

                                if (!down) {
                                    return;
                                }

                                if (!over) {
                                    return;
                                }

                                if (downX >= (canvasPos[0] - tolerance) &&
                                    downX <= (canvasPos[0] + tolerance) &&
                                    downY >= (canvasPos[1] - tolerance) &&
                                    downY <= (canvasPos[1] + tolerance)) {

                                    var hit = self.scene.pick({
                                        canvasPos : canvasPos,
                                        rayPick: self._rayPick
                                    });

                                    if (hit) {

                                        /**
                                         * Fired whenever an {{#crossLink "Entity"}}Entity{{/crossLink}} is picked.
                                         * @event picked
                                         * @param {String} entityId The ID of the picked {{#crossLink "Entity"}}Entity{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
                                         * @param {Array of Number} canvasPos The Canvas-space coordinate that was picked.
                                         * @param {Array of Number} worldPos When {{#crossLink "MousePickEntity/rayPick"}}{{/crossLink}} is true,
                                         * provides the World-space coordinate that was ray-picked on the surface of the
                                         * {{#crossLink "Entity"}}Entity{{/crossLink}}.
                                         */
                                        self.fire("pick", hit);

                                    } else {

                                        /**
                                         * Fired whenever an attempt to pick {{#crossLink "Entity"}}Entity{{/crossLink}} picks empty space.
                                         * @event nopick
                                         * @param {Array of Number} canvasPos The Canvas-space coordinate at which the pick was attempted.
                                         */
                                        self.fire("nopick", {
                                            canvasPos: canvasPos
                                        });
                                    }
                                }

                                down = false;
                            });
                    } else {

                        input.off(this._onMouseDown);
                        input.off(this._onMouseUp);
                    }

                    /**
                     * Fired whenever this MousePickEntity's {{#crossLink "MousePickEntity/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active = value);
                },

                get: function () {
                    return this._active;
                }
            },

            /**
             * Indicates whether this MousePickEntity will try to pick a {{#crossLink "Geometry"}}{{/crossLink}} primitive
             * whenever it picks an {{#crossLink "Entity"}}{{/crossLink}}.
             *
             * When true, this MousePickEntity will try to return the primitive index in a
             * {{#crossLink "MousePickEntity/picked:event"}}{{/crossLink}} event.
             *
             * Fires a {{#crossLink "MousePickEntity/rayPick:event"}}{{/crossLink}} event on change.
             *
             * @property rayPick
             * @type Boolean
             */
            rayPick: {

                set: function (value) {

                    value = !!value;

                    if (this._rayPick === value) {
                        return;
                    }

                    this._dirty = false;

                    /**
                     * Fired whenever this MousePickEntity's {{#crossLink "MousePickEntity/rayPick:property"}}{{/crossLink}} property changes.
                     * @event rayPick
                     * @param value The property's new value
                     */
                    this.fire('rayPick', this._rayPick = value);
                },

                get: function () {
                    return this._rayPick;
                }
            }
        },

        _getJSON: function () {

            var json = {
                rayPick: this._rayPick,
                active: this._active
            };

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();