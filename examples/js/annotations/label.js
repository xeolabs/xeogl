/**
 A **Label** defines spherical geometry for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class Label
 @module XEO
 @submodule annotations
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Label in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Label.
 @param [cfg.pin] {Pin|String|Number} ID of instance of a {{#crossLink "Pin"}}{{/crossLink}} to associate this Label with.
 @extends Component
 */
(function () {

    "use strict";

    // Converts XEO color to CSS
    function cssColor(color) {
        return "rgb(" +
            Math.floor(color[0] * 255) + "," +
            Math.floor(color[1] * 255) + "," +
            Math.floor(color[2] * 255) + ")";
    }

    XEO.Label = XEO.Component.extend({

        type: "XEO.Label",

        _init: function (cfg) {

            var body = document.getElementsByTagName("body")[0];

            var fillColor = [1, 1, 0];
            var color = [0, 0, 0];
            var opacity = 0.5;
            var lineWidth = 1;
            var text = "xxx";

            this._boxDiv = document.createElement('div');
            this._boxDiv.innerText = text;
            var style = this._boxDiv.style;
            style.color = cssColor(color);
            style.position = "absolute";
            style.padding = "10px";
            style.margin = "0";
            style.background = fillColor ? cssColor(fillColor) : "black";
            style.opacity = opacity;
            style.border = lineWidth + "px solid " + cssColor(color);
            style["z-index"] = "10001";
            style.width = "auto";
            style.height = "auto";
            style["border-radius"] = "5px";
            style.font = "bold 12px arial,serif";
            body.appendChild(this._boxDiv);

            this._pointDiv = document.createElement('div');
            this._pointDiv.innerText = "3";
            style = this._pointDiv.style;
            style["font"] = "Helvetica 11px sans-serif";
            style["line-height"] = ".9";
            style.color = "black";
            style.background = "white";
            style.position = "absolute";
            style.padding = "2px";
            style.margin = "0";
            style.background = "white";
            style.opacity = 1.0;
            style.border = "2px solid gray";
            style.width = "13px";
            style.height = "13px";
            style["border-radius"] = "9px";
            style["z-index"] = "1001";
            body.appendChild(this._pointDiv);

            this.offset = cfg.offset;
            this.bgColor = cfg.bgColor;
            this.opacity = cfg.opacity;
            this.text = cfg.text;
            this.pin = cfg.pin; // Set pin last so that other props are ready to render label for it
        },

        _props: {

            /**
             * The {{#crossLink "Pin"}}{{/crossLink}} this Label is attached to.
             *
             * Fires an {{#crossLink "Label/pin:event"}}{{/crossLink}} event on change.
             *
             * @property pin
             * @type XEO.Pin
             */
            pin: {

                set: function (value) {

                    /**
                     * Fired whenever this Label's {{#crossLink "Label/pin:property"}}{{/crossLink}} property changes.
                     *
                     * @event pin
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "pin",
                        type: "XEO.Pin",
                        component: value,
                        sceneDefault: false,
                        onAttached: {
                            callback: this._pinAttached,
                            scope: this
                        },
                        onDetached: {
                            callback: this._pinDetached,
                            scope: this
                        }
                    });
                },

                get: function () {
                    return this._attached.pin;
                }
            },

            /**
             * The background color of this Label.
             *
             * Fires an {{#crossLink "Label/bgColor:event"}}{{/crossLink}} event on change.
             *
             * @property bgcolor
             * @default [1,1,1]
             * @type {Array of Number}
             */
            bgColor: {

                set: function (value) {

                    value = value || [1,1,1];

                    if (this._bgColor) {
                        if (this._bgColor[0] === value[0] && this._bgColor[1] === value[1] && this._bgColor[2] === value[2]) {
                            return;
                        } else {
                            this._bgColor[0] = value[0];
                            this._bgColor[1] = value[1];
                            this._bgColor[2] = value[2];
                        }
                    } else {
                        this._bgColor = value;
                    }

                    /**
                     Fired whenever this Label's {{#crossLink "Label/bgColor:property"}}{{/crossLink}} property changes.
                     @event bgColor
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("bgColor", this._bgColor);

                    this._boxDiv.style.background = cssColor(this._bgColor);
                },

                get: function () {
                    return this._bgColor;
                }
            },

            /**
             * The opacity of this Label, as value in range [0..1].
             *
             * Fires an {{#crossLink "Label/opacity:event"}}{{/crossLink}} event on change.
             *
             * @property opacity
             * @default 1
             * @type Number
             */
            opacity: {

                set: function (value) {

                    this._opacity = (value === undefined || value === null) ? 1.0 : value;

                    this._boxDiv.style.opacity = this._opacity;
                },

                get: function () {
                    return this._opacity;
                }
            },

            /**
             * The text within this Label.
             *
             * Fires an {{#crossLink "Label/text:event"}}{{/crossLink}} event on change.
             *
             * @property text
             * @default ""
             * @type String
             */
            text: {

                set: function (value) {

                    this._text = (value === undefined || value === null) ? "" : value;

                    this._boxDiv.innerText = this._text;
                },

                get: function () {
                    return this._text;
                }
            },

            /**
             * Vector indicating the Canvas-space offset of this Label from its {{#crossLink "Pin/entity:property"}}.
             *
             * Fires an {{#crossLink "Label/offset:event"}}{{/crossLink}} event on change.
             *
             * @property offset
             * @default [0,0]
             * @type {Array of Number}
             */
            offset: {

                set: function (value) {

                    value = value || [0, 0];

                    if (this._offset) {
                        if (this._offset[0] === value[0] && this._offset[1] === value[1]) {
                            return;
                        } else {
                            this._offset[0] = value[0];
                            this._offset[1] = value[1];
                        }
                    } else {
                        this._offset = value;
                    }

                    this._arrangeLabel();

                    /**
                     Fired whenever this Label's {{#crossLink "Label/offset:property"}}{{/crossLink}} property changes.
                     @event offset
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("offset", this._offset);
                },

                get: function () {
                    return this._offset;
                }
            }
        },

        _pinAttached: function (pin) {
            this._onPinCanvasBoundary = pin.canvasBoundary.on("updated", this._pinCanvasBoundaryUpdated, this);
            this._onPinVisible = pin.on("visible", this._pinVisible, this);
        },

        _pinCanvasBoundaryUpdated: function () {

            var pin = this._attached.pin;

            if (!pin) {
                return;
            }

            var boxDiv = this._boxDiv;
            var pointDiv = this._pointDiv;
            var zIndex = 10000 + Math.floor(pin.viewBoundary.center[2]);

            boxDiv.style["z-index"] = zIndex;
            pointDiv.style["z-index"] = zIndex + 1;

            this._arrangeLabel();
        },

        _arrangeLabel: function () {

            if (!this._offset) {
                return;
            }

            var pin = this._attached.pin;

            if (!pin) {
                return;
            }

            var center = pin.canvasBoundary.center;
            var boxDiv = this._boxDiv;
            var pointDiv = this._pointDiv;

            boxDiv.style.left = this._offset[0] + center[0] - 3 + "px";
            boxDiv.style.top = this._offset[1] + center[1] - 3 + "px";

            pointDiv.style.left = this._offset[0] + center[0] - 5 + "px";
            pointDiv.style.top = this._offset[1] + center[1] - 5 + "px";
        },

        _pinVisible: function (visible) {
            this.visible = visible;
        },

        _pinDetached: function (pin) {
            pin.canvasBoundary.off(this._onPinCanvasBoundary);
            pin.off(this._onPinVisible);
        },

        _getJSON: function () {

            var json = {
                opacity: this._opacity,
                bgColor: this._bgColor,
                text: this._text,
                offset: this._offset
            };

            if (this._attached.pin) {
                json.pin = this._attached.pin.id;
            }

            return json;
        },

        _destroy: function () {
            this.pin = null; // Unsubscribes from Pin updates
        }
    });

})();
