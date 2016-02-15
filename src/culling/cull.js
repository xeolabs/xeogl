/**
 A **Cull** toggles the culling of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 <ul>
 <li>Cull components are intended for **visibility culling systems** to control the visibility of {{#crossLink "Entity"}}Entities{{/crossLink}}.</li>
 <li>{{#crossLink "Visibility"}}{{/crossLink}} components are intended for users to control the visibility of {{#crossLink "Entity"}}Entities{{/crossLink}} via UIs.</li>
 <li>Each {{#crossLink "Entity"}}{{/crossLink}} is visible when its {{#crossLink "Visibility"}}Visibility's{{/crossLink}} {{#crossLink "Visibility/visible:property"}}visible{{/crossLink}} property is true and {{#crossLink "Cull"}}Cull's{{/crossLink}} {{#crossLink "Cull/culled:property"}}visible{{/crossLink}} is false.
 <li>A Cull may be shared among multiple {{#crossLink "Entity"}}Entities{{/crossLink}} to toggle
 their culling status as a group.</li>
 </ul>

 <img src="../../../assets/images/Cull.png"></img>

 ## Example

 This example creates a Cull that toggles the culling of
 two {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ````javascript
 var scene = new XEO.Scene();

 // Create a Cull component
 var cull = new XEO.Cull(scene, {
    culled: false
});

 // Create two Entities whose culling will be controlled by our Cull

 var entity1 = new XEO.Entity(scene, {
    cull: cull
});

 var entity2 = new XEO.Entity(scene, {
    cull: cull
});

 // Subscribe to change on the Cull's "culled" property
 var handle = cull.on("culled", function(value) {
    //...
});

 // Hide our Entities by flipping the Cull's "culled" property,
 // which will also call our handler
 cull.culled = true;

 // Unsubscribe from the Cull again
 cull.off(handle);

 // When we destroy our Cull, the Entities will fall back
 // on the Scene's default Cull instance
 cull.destroy();
 ````
 @class Cull
 @module XEO
 @submodule culling
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Cull in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Cull.
 @param [cfg.culled=false] {Boolean} Flag which controls culling of the attached {{#crossLink "Entity"}}Entities{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    XEO.Cull = XEO.Component.extend({

        type: "XEO.Cull",

        _init: function (cfg) {

            this._state = new XEO.renderer.Cull({
                culled: true
            });

            this.culled = cfg.culled;
        },

        _props: {

            /**
             Indicates whether this Cull culls its attached {{#crossLink "Entity"}}Entities{{/crossLink}} or not.

             Fires a {{#crossLink "Cull/culled:event"}}{{/crossLink}} event on change.

             @property culled
             @default false
             @type Boolean
             */
            culled: {

                set: function (value) {

                    value = !!value;

                    if (value === this._state.culled) {
                        return;
                    }

                    this._state.culled = value;

                    this._renderer.drawListDirty = true;

                    /**
                     Fired whenever this Cull's {{#crossLink "Cull/culled:property"}}{{/crossLink}} property changes.

                     @event culled
                     @param value {Boolean} The property's new value
                     */
                    this.fire("culled", this._state.culled);
                },

                get: function () {
                    return this._state.culled;
                }
            }
        },

        _compile: function () {
            this._renderer.cull = this._state;
        },

        _getJSON: function () {
            return {
                culled: this.culled
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
