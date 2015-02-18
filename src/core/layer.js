"use strict";

/**
 Specifies the render order of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within their {{#crossLink "Stage"}}Stages{{/crossLink}}.

 <ul>
 <li>When the parent {{#crossLink "Scene"}}Scene{{/crossLink}} renders, each {{#crossLink "Stage"}}Stage{{/crossLink}} will render its bin
 of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in turn, from the lowest priority {{#crossLink "Stage"}}Stage{{/crossLink}} to the highest.</li>

 <li>{{#crossLink "Stage"}}Stages{{/crossLink}} are typically used for ordering the render-to-texture steps in posteffects pipelines.</li>

 <li>You can control the render order of the individual {{#crossLink "GameObject"}}GameObjects{{/crossLink}} ***within*** a {{#crossLink "Stage"}}Stage{{/crossLink}}
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.</li>

 <li>{{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within {{#crossLink "Stage"}}Stages{{/crossLink}}.</li>


 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} not explicitly associated with a Layer are implicitly
 associated with the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}. which has
 a {{#crossLink "Layer/priority:property"}}{{/crossLink}} value of zero.</li>

 <li>You can use Layers without defining any {{#crossLink "Stage"}}Stages{{/crossLink}} if you simply let your
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} fall back on the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105071/L.png"></img>

 ### Example

 ````javascript

 TODO

 ````

 @class Layer
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Layer.
 @param [cfg.priority=0] {Number} The rendering priority,
 @extends Component
 */
XEO.Layer = XEO.Component.extend({

    className: "XEO.Layer",

    type: "layer",

    _init: function (cfg) {
        this.priority = cfg.priority;
    },

    /**
     * Indicates a *layer* rendering priority for the associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
     *
     * Each GameObject is also associated with a {{#crossLink "Stage"}}Stage{{/crossLink}}, which sets a *stage* rendering
     * priority via its {{#crossLink "Stage/priority:property"}}priority{{/crossLink}} property.
     *
     * Fires a {{#crossLink "Layer/priority:event"}}{{/crossLink}} event on change.
     *
     * @property priority
     * @default 0
     * @type Number
     */
    set priority(value) {
        value = value || 0;
        this._core.priority = value;
        this._renderer.stateOrderDirty = true;

        /**
         * Fired whenever this Layer's  {{#crossLink "Layer/priority:property"}}{{/crossLink}} property changes.
         * @event priority
         * @param value The property's new value
         */
        this.fire("priority", value);
    },

    get priority() {
        return this._core.priority;
    },

    _compile: function (ctx) {
        this._renderer.layer = this._core;
    },

    _getJSON: function () {
        return {
            priority: this.priority
        };
    }
});
