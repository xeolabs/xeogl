/**
 A **Viewport** defines a viewport within the canvas in which attached {{#crossLink "Entity"}}Entities{{/crossLink}} will render.

 ## Overview

 * Make a Viewport automatically size to its {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}
 by setting its {{#crossLink "Viewport/autoBoundary:property"}}{{/crossLink}} property ````true```` (default is ````false````).

 ## Examples

 * [Multiple viewports](../../examples/#canvas_multipleViewports)

 ## Usage

 ````javascript
 new xeogl.Entity({

    geometry: new xeogl.SphereGeometry(),

    material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
    }),

    viewport: new xeogl.Viewport({
        boundary: [0, 0, 500, 400],
        autoBoundary: false // Don't autosize to canvas (default)
    })
 });
 ````

 @class Viewport
 @module xeogl
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}, creates this Viewport within the
 default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Viewport configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent
 {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Viewport.
 @param [cfg.boundary] {Array of Number} Canvas-space Viewport boundary, given as
 (min, max, width, height). Defaults to the size of the parent
 {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.
 @param [cfg.autoBoundary=false] {Boolean} Indicates whether this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}}
 automatically synchronizes with the size of the parent {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

 @extends Component
 */
(function () {

    "use strict";

    xeogl.Viewport = xeogl.Component.extend({

        type: "xeogl.Viewport",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Viewport({
                boundary: [0, 0, 100, 100]
            });

            this.boundary = cfg.boundary;
            this.autoBoundary = cfg.autoBoundary;
        },

        _props: {

            /**
             The canvas-space boundary of this Viewport, indicated as [min, max, width, height].

             Defaults to the size of the parent
             {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

             Ignores attempts to set value when {{#crossLink "Viewport/autoBoundary:property"}}{{/crossLink}} is ````true````.

             Fires a {{#crossLink "Viewport/boundary:event"}}{{/crossLink}} event on change.

             @property boundary
             @default [size of Scene Canvas]
             @type {Array of Number}
             */
            boundary: {

                set: function (value) {

                    if (this._autoBoundary) {
                        return;
                    }

                    if (!value) {

                        var canvasBoundary = this.scene.canvas.boundary;

                        var width = canvasBoundary[2];
                        var height = canvasBoundary[3];

                        value = [0, 0, width, height];
                    }

                    this._state.boundary = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} property changes.

                     @event boundary
                     @param value {Boolean} The property's new value
                     */
                    this.fire("boundary", this._state.boundary);
                },

                get: function () {
                    return this._state.boundary;
                }
            },

            /**
             Indicates whether this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} automatically
             synchronizes with the size of the parent {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

             When set true, then this Viewport will fire a {{#crossLink "Viewport/boundary/event"}}{{/crossLink}} whenever
             the {{#crossLink "Canvas"}}{{/crossLink}} resizes. Also fires that event as soon as this ````autoBoundary````
             property is changed.

             Fires a {{#crossLink "Viewport/autoBoundary:event"}}{{/crossLink}} event on change.

             @property autoBoundary
             @default false
             @type Boolean
             */
            autoBoundary: {

                set: function (value) {

                    value = !!value;

                    if (value === this._autoBoundary) {
                        return;
                    }

                    this._autoBoundary = value;

                    if (this._autoBoundary) {
                        this._onCanvasSize = this.scene.canvas.on("boundary",
                            function (boundary) {

                                var width = boundary[2];
                                var height = boundary[3];

                                this._state.boundary = [0, 0, width, height];

                                /**
                                 Fired whenever this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} property changes.

                                 @event boundary
                                 @param value {Boolean} The property's new value
                                 */
                                this.fire("boundary", this._state.boundary);

                            }, this);

                    } else if (this._onCanvasSize) {
                        this.scene.canvas.off(this._onCanvasSize);
                        this._onCanvasSize = null;
                    }

                    /**
                     Fired whenever this Viewport's {{#crossLink "autoBoundary/autoBoundary:property"}}{{/crossLink}} property changes.

                     @event autoBoundary
                     @param value The property's new value
                     */
                    this.fire("autoBoundary", this._autoBoundary);
                },

                get: function () {
                    return this._autoBoundary;
                }
            }
        },

        _compile: function () {
            this._renderer.viewport = this._state;
        },

        _getJSON: function () {
            var json = {};
            if (this._autoBoundary) {
                json.autoBoundary = true;
            } else {
                json.boundary = this._state.boundary.slice();
            }
            return json;
        }
    });

})();
