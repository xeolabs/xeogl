/**
 A **Stage** is a bin of {{#crossLink "Entity"}}Entities{{/crossLink}} that is rendered in a specified priority with respect to
 other Stages in the same {{#crossLink "Scene"}}{{/crossLink}}.

 ## Overview

 * When the parent {{#crossLink "Scene"}}Scene{{/crossLink}} renders, each Stage renders its bin
 of {{#crossLink "Entity"}}Entities{{/crossLink}} in turn, from the lowest priority Stage to the highest.
 * Stages are typically used for ordering the render-to-texture steps in posteffects pipelines.
 * You can control the render order of the individual {{#crossLink "Entity"}}Entities{{/crossLink}} ***within*** a Stage
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.
 * {{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "Entity"}}Entities{{/crossLink}} within Stages.
 * {{#crossLink "Entity"}}Entities{{/crossLink}} not explicitly attached to a Stage are implicitly
 attached to the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has
 a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.

 <img src="../../../assets/images/Stage.png"></img>

 ## Examples

 * [Procedural texture using RTT](../../examples/#materials_texture_procedural)

 ## Usage

 In this example we're performing render-to-texture using {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} and
 {{#crossLink "Texture"}}{{/crossLink}} components.

 The first Entity renders its fragment colors to a {{#crossLink "ColorTarget"}}{{/crossLink}}, which is piped into a
 {{#crossLink "Texture"}}{{/crossLink}} that's applied to a second {{#crossLink "Entity"}}{{/crossLink}}. To ensure
 that the {{#crossLink "ColorTarget"}}{{/crossLink}} is rendered ***before*** the {{#crossLink "Texture"}}{{/crossLink}}
 that consumes it, we've attached each {{#crossLink "Entity"}}{{/crossLink}} to a prioritized {{#crossLink "Stage"}}{{/crossLink}}.

 ````javascript
 // First stage: an Entity that renders to a ColorTarget
 var entity1 = new xeogl.Entity({
    stage: new xeogl.Stage({
        priority: 0
    }),
    geometry: new xeogl.BoxGeometry(),
    colorTarget: new xeogl.ColorTarget()
 });

 // Second stage: an Entity with a Texture that sources from the ColorTarget
 var entity2 = new xeogl.Entity({
    stage: new xeogl.Stage( {
        priority: 1
    }),
    material: new xeogl.PhongMaterial({
        diffuseMap: new xeogl.Texture({
            target: entity1.colorTarget
        })
    }),
    geometry: new xeogl.BoxGeometry()
 });
 ````

 @class Stage
 @module xeogl
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Stage in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Stage.
 @param [cfg.priority=0] {Number} The rendering priority for the attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @param [cfg.pickable=true] {Boolean} Indicates whether attached {{#crossLink "Entity"}}Entities{{/crossLink}} are pickable.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Stage = xeogl.Component.extend({

        type: "xeogl.Stage",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Stage({
                priority: null,
                pickable: true
            });

            this.priority = cfg.priority;
            this.pickable = cfg.pickable;
        },

        _props: {

            priority: {

                /**
                 * Indicates the rendering priority for the
                 * {{#crossLink "Entity"}}Entities{{/crossLink}} in
                 * this Stage.
                 *
                 * Fires a {{#crossLink "Stage/priority:event"}}{{/crossLink}}
                 * event on change.
                 *
                 * @property priority
                 * @default 0
                 * @type Number
                 */
                set: function (value) {

                    value = value || 0;

                    if (value === this._state.priority) {
                        return;
                    }

                    value = Math.round(value);

                    this._state.priority = value;

                    this._renderer.stateOrderDirty = true;

                    /**
                     * Fired whenever this Stage's
                     * {{#crossLink "Stage/priority:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event priority
                     * @param value The property's new value
                     */
                    this.fire("priority", this._state.priority);
                },

                get: function () {
                    return this._state.priority;
                }
            },

            /**
             * Indicates whether the attached
             * {{#crossLink "Entity"}}Entities{{/crossLink}} are
             * pickable (see {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}).
             *
             * Fires a {{#crossLink "Stage/pickable:event"}}{{/crossLink}} event on change.
             *
             * @property pickable
             * @default true
             * @type Boolean
             */
            pickable: {

                set: function (value) {

                    value = value !== false;

                    if (this._state.pickable === value) {
                        return;
                    }

                    this._state.pickable = value;

                    // No need to trigger a render;
                    // state is only used when picking

                    /**
                     * Fired whenever this Stage's
                     * {{#crossLink "Stage/pickable:pickable"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event pickable
                     * @param value The property's new value
                     */
                    this.fire("pickable", this._state.pickable);
                },

                get: function () {
                    return this._state.pickable;
                }
            }
        },

        _compile: function () {
            this._renderer.stage = this._state;
        },

        _getJSON: function () {
            return {
                priority: this.priority,
                pickable: this.pickable
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
