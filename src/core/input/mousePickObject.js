/**
 A **MousePickObject** picks {{#crossLink "GameObject"}}GameObjects{{/crossLink}} with mouse clicks.

 ## Overview

TODO

 ## Example

 ````Javascript
 var scene = new XEO.Scene({ element: "myDiv" });

 // Create some GameObjects

 var object1 = new XEO.GameObject(scene, {
    id: "object1",
    transform: new XEO.Translate(scene, { xyz: [-5, 0, 0] })
 });

 var object2 = new XEO.GameObject(scene, {
    id: "object2",
    transform: new XEO.Translate(scene, { xyz: [0, 0, 0] })
 });

 var object3 = new XEO.GameObject(scene, {
    id: "object3",
    transform: new XEO.Translate(scene, { xyz: [5, 0, 0] })
 });

 // Create a MousePickObject
 var mousePickObject = new XEO.MousePickObject(scene, {

    // We want the 3D World-space coordinates
    // of each location we pick

    rayPick: true
 });

 // Handle picked GameObjects
 mousePickObject.on("pick", function(e) {
    var object = e.object;
    var canvasPos = e.canvasPos;
    var worldPos = e.worldPos;
 });

 // Handle nothing picked
 mousePickObject.on("nopick", function(e) {
    var canvasPos = e.canvasPos;
 });
 ````

 @class MousePickObject
 @module XEO
 @submodule input
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MousePickObject.
 @param [rayPick=false] {Boolean} Indicates whether this MousePickObject will find the 3D ray intersection whenever it picks a
 {{#crossLink "GameObject"}}{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Indicates whether or not this MousePickObject is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.MousePickObject = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.MousePickObject",

        _init: function (cfg) {

            this.rayPick = cfg.rayPick;

            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * Flag which indicates whether this MousePickObject is active or not.
             *
             * Fires a {{#crossLink "MousePickObject/active:event"}}{{/crossLink}} event on change.
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

                        this._onMouseUp = input.on("dblclick",
                            function (canvasPos) {

                                var hit = self.scene.pick(canvasPos, {
                                    rayPick: self._rayPick
                                });

                                if (hit) {

                                    /**
                                     * Fired whenever a {{#crossLink "GameObject"}}GameObject{{/crossLink}} is picked.
                                     * @event picked
                                     * @param {String} objectId The ID of the picked {{#crossLink "GameObject"}}GameObject{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
                                     * @param {Array of Number} canvasPos The Canvas-space coordinate that was picked.
                                     * @param {Array of Number} worldPos When {{#crossLink "MousePickObject/rayPick"}}{{/crossLink}} is true,
                                     * provides the World-space coordinate that was ray-picked on the surface of the
                                     * {{#crossLink "GameObject"}}GameObject{{/crossLink}}.
                                     */
                                    self.fire("pick", hit);

                                } else {

                                    /**
                                     * Fired whenever an attempt to pick {{#crossLink "GameObject"}}GameObject{{/crossLink}} picks empty space.
                                     * @event nopick
                                     * @param {Array of Number} canvasPos The Canvas-space coordinate at which the pick was attempted.
                                     */
                                    self.fire("nopick", {
                                        canvasPos: canvasPos
                                    });
                                }
                            });

                    } else {

                        input.off(this._onMouseDown);
                        input.off(this._onMouseUp);
                    }

                    /**
                     * Fired whenever this MousePickObject's {{#crossLink "MousePickObject/active:property"}}{{/crossLink}} property changes.
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
             * Indicates whether this MousePickObject will find the 3D ray intersection whenever it picks a
             * {{#crossLink "GameObject"}}{{/crossLink}}.
             *
             * When true, this MousePickObject returns the 3D World-space intersection in each
             * {{#crossLink "MousePickObject/picked:event"}}{{/crossLink}} event.
             *
             * Fires a {{#crossLink "MousePickObject/rayPick:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this MousePickObject's {{#crossLink "MousePickObject/rayPick:property"}}{{/crossLink}} property changes.
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

            if (this._children.camera) {
                json.camera = this._children.camera.id;
            }

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();