/**
 A **Layer** specifies the render order of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within their {{#crossLink "Stage"}}Stages{{/crossLink}}.

 <ul>
 <li>When xeoEngine renders a {{#crossLink "Scene"}}Scene{{/crossLink}}, each {{#crossLink "Stage"}}Stage{{/crossLink}} within that will render its bin
 of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in turn, from the lowest priority {{#crossLink "Stage"}}Stage{{/crossLink}} to the highest.</li>

 <li>{{#crossLink "Stage"}}Stages{{/crossLink}} are typically used for ordering the render-to-texture steps in posteffects pipelines.</li>

 <li>You can control the render order of the individual {{#crossLink "GameObject"}}GameObjects{{/crossLink}} ***within*** a {{#crossLink "Stage"}}Stage{{/crossLink}}
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.</li>

 <li>{{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within {{#crossLink "Stage"}}Stages{{/crossLink}}.</li>


 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} not explicitly attached to a Layer are implicitly
 attached to the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}. which has
 a {{#crossLink "Layer/priority:property"}}{{/crossLink}} value of zero.</li>

 <li>You can use Layers without defining any {{#crossLink "Stage"}}Stages{{/crossLink}} if you simply let your
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} fall back on the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105071/L.png"></img>

 ## Example

 ````javascript
var scene = new XEO.Scene();

var stage = new XEO.Stage(scene, {
    priority: 0
});

var geometry = new XEO.Geometry(scene); // Geometry with no parameters defaults to a 2x2x2 box

// Innermost object
// Blue and opaque, in Layer with render order 0, renders first
 
var layer1 = new XEO.Layer(scene, {
    priority: 1
});

var material1 = new XEO.Material(scene, {
    diffuse: [0, 0, 1],
    opacity: 1.0
});
 
var scale1 = new XEO.Scale(scene, {
    xyz: [0.3, 0.3, 0.3]
});
    
var object1 = new XEO.GameObject(scene, {
    geometry: geometry,
    stage: stage,
    layer: layer1,
    material: material1,
    scale: scale1
});

// Middle object
// Red and transparent, in Layer with render order 2, renders next

var layer2 = new XEO.Layer(scene, {
    priority: 2
});

var material2 = new XEO.Material(scene, {
    diffuse: [0, 0, 1],
    opacity: 1.0
});

var scale2 = new XEO.Scale(scene, {
    xyz: [0.6, 0.6, 0.6]
});

var object2 = new XEO.GameObject(scene, {
    geometry: geometry,
    stage: stage,
    layer: layer2,
    material: material2,
    scale: scale2
});

// Outermost object
// Yellow and transparent, in Layer with render order 3, renders next

var layer3 = new XEO.Layer(scene, {
    priority: 3
});

var material3 = new XEO.Material(scene, {
    diffuse: [1, 1, 0],
    opacity: 1.0
});

var scale3 = new XEO.Scale(scene, {
    xyz: [1.0, 1.0, 1.0]
});

var object3 = new XEO.GameObject(scene, {
    geometry: geometry,
    stage: stage,
    layer: layer3,
    material: material3,
    scale: scale3
});

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
(function () {

    "use strict";

    XEO.Layer = XEO.Component.extend({

        className: "XEO.Layer",

        type: "layer",

        _init: function (cfg) {
            this.priority = cfg.priority;
        },

        _props: {

            /**
             * Indicates a *layer* rendering priority for the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
             *
             * Each GameObject is also attached to a {{#crossLink "Stage"}}Stage{{/crossLink}}, which sets a *stage* rendering
             * priority via its {{#crossLink "Stage/priority:property"}}priority{{/crossLink}} property.
             *
             * Fires a {{#crossLink "Layer/priority:event"}}{{/crossLink}} event on change.
             *
             * @property priority
             * @default 0
             * @type Number
             */
            priority: {

                set: function (value) {
                    value = value || 0;
                    this._state.priority = value;
                    this._renderer.stateOrderDirty = true;

                    /**
                     * Fired whenever this Layer's  {{#crossLink "Layer/priority:property"}}{{/crossLink}} property changes.
                     * @event priority
                     * @param value The property's new value
                     */
                    this.fire("priority", value);
                },

                get: function () {
                    return this._state.priority;
                }
            }
        },

        _compile: function () {
            this._renderer.layer = this._state;
        },

        _getJSON: function () {
            return {
                priority: this.priority
            };
        }
    });

})();