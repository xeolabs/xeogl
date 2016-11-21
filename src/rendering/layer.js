/**
 A **Layer** sets the rendering order of {{#crossLink "Entity"}}Entities{{/crossLink}} within their {{#crossLink "Stage"}}Stages{{/crossLink}}.

 ## Overview

 * When xeogl renders a {{#crossLink "Scene"}}Scene{{/crossLink}}, each {{#crossLink "Stage"}}Stage{{/crossLink}} within that will render its bin
 of {{#crossLink "Entity"}}Entities{{/crossLink}} in turn, from the lowest priority {{#crossLink "Stage"}}Stage{{/crossLink}} to the highest.
 * {{#crossLink "Stage"}}Stages{{/crossLink}} are typically used for ordering the render-to-texture steps in posteffects pipelines.
 * You can control the render order of the individual {{#crossLink "Entity"}}Entities{{/crossLink}} ***within*** a {{#crossLink "Stage"}}Stage{{/crossLink}}
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.
 * {{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "Entity"}}Entities{{/crossLink}} within {{#crossLink "Stage"}}Stages{{/crossLink}}.
 * {{#crossLink "Entity"}}Entities{{/crossLink}} not explicitly attached to a Layer are implicitly
 attached to the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}. which has
 a {{#crossLink "Layer/priority:property"}}{{/crossLink}} value of zero.
 * You can use Layers without defining any {{#crossLink "Stage"}}Stages{{/crossLink}} if you simply let your
 {{#crossLink "Entity"}}Entities{{/crossLink}} fall back on the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.

 <img src="../../../assets/images/Layer.png"></img>

 ## Examples

 * [Z-sorted transparent entities](../../examples/#materials_techniques_transparencySort)
 * [Clouds as billboarded and z-sorted alpha maps](../../examples/#billboards_spherical_clouds)

 ## Usage

 In this example we'll use Layers to perform <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency sorting</a>,
 which ensures that transparent entities are rendered farthest-to-nearest, so that they alpha-blend correctly with each other.

 We want to render the three nested boxes shown below, in which the innermost box is opaque and blue,
 the box enclosing that is transparent and yellow, and the outermost box is transparent and green. We need the boxes to
 render in order innermost-to-outermost, in order to blend transparencies correctly.

 <img src="../../assets/images/transparencySort.jpg"></img>

 Our scene has one {{#crossLink "Stage"}}{{/crossLink}}, just for completeness. As mentioned earlier, you don't have to
 create this because the {{#crossLink "Scene"}}{{/crossLink}} will provide its default {{#crossLink "Stage"}}{{/crossLink}}.
 Then, within that {{#crossLink "Stage"}}{{/crossLink}}, we create an {{#crossLink "Entity"}}{{/crossLink}} for each box,
 each assigned to a different prioritised {{#crossLink "Layer"}}{{/crossLink}} to ensure that they are rendered in the right order.

 ````javascript
 // A Stage, just for completeness
 // We could instead just implicitly default to the Scene's default Stage
 var stage = new xeogl.Stage({
    priority: 0
 });

 // Geometry we'll share among our Entities
 var geometry = new xeogl.BoxGeometry();

 // Innermost box
 // Blue and opaque, in Layer with render order 0, renders first

 var entity1 = new xeogl.Entity({
    geometry: geometry,
    stage: stage,
    layer: new xeogl.Layer({
        priority: 1
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0],
        opacity: 1.0
    })
 });

 // Middle box
 // Red and transparent, in Layer with render order 2, renders next

 var entity2 = new xeogl.Entity({
    geometry: geometry,
    stage: stage,
    layer: new xeogl.Layer({
        priority: 2
    }),
    material: new xeogl.Layer({
        priority: 2
    }),
    scale: new xeogl.Scale({
        xyz: [6, 6, 6]
    })
 });

 // Outermost box
 // Green and transparent, in Layer with render order 3, renders last

 var entity3 = new xeogl.Entity({
    geometry: geometry,
    stage: stage,
    layer: new xeogl.Layer({
        priority: 3
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 1, 0.2],
        opacity: 0.2
    }),
    scale: new xeogl.Scale({
        xyz: [9, 9, 9]
    })
 });
 ````

 @class Layer
 @module xeogl
 @submodule rendering
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

    xeogl.Layer = xeogl.Component.extend({

        type: "xeogl.Layer",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Layer({
                priority: null
            });

            this.priority = cfg.priority;
        },

        _props: {

            /**
             * Indicates this Layer's rendering priority for the attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
             *
             * Each {{#crossLink "Entity"}}{{/crossLink}} is also attached to a {{#crossLink "Stage"}}Stage{{/crossLink}}, which sets a *stage* rendering
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

                    // TODO: Only accept rendering priority in range [0...MAX_PRIORITY]

                    value = value || 0;

                    value = Math.round(value);


                    if (value === this._state.priority) {
                        return;
                    }

                    this._state.priority = value;

                    this._renderer.stateOrderDirty = true;

                    /**
                     * Fired whenever this Layer's  {{#crossLink "Layer/priority:property"}}{{/crossLink}} property changes.
                     *
                     * @event priority
                     * @param value The property's new value
                     */
                    this.fire("priority", this._state.priority);
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
                priority: this._state.priority
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
