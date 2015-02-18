"use strict";

/**
 A modelling transform, specified as a 4x4 matrix, that is applied to associated
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <img src="http://www.gliffy.com/go/publish/image/7123375/L.png"></img>

 ### Example

 @class Matrix
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Matrix in the
 default {{#crossLink "Scene"}}Scene{{/crossLink}}  when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Matrix by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Matrix.
 @param [cfg.elements=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Array of Number} One-dimensional, sixteen element array of elements for the Matrix, an identity matrix by default.
 @extends Component
 */
XEO.Matrix = XEO.Component.extend({

    className: "XEO.Matrix",

    type: "transform",

    _init: function (cfg) {

        this.elements = cfg.elements;
    },

    /**
     * Sets the Matrix elements.
     *
     * Fires an {{#crossLink "Matrix/elements:event"}}{{/crossLink}} event on change.
     *
     * @property elements
     * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     * @type {Array of Number}
     */
    set elements(value) {
        value = value || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this._core.elements = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Matrix's  {{#crossLink "Matrix/elements:property"}}{{/crossLink}} property changes.
         * @event elements
         * @param value The property's new value
         */
        this.fire("elements", value);
    },

    get elements() {
        return this._core.elements;
    },

    _compile: function () {
        //this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            elements: this._core.elements
        };
    }
});

