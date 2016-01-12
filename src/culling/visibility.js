/**
 A **Visibility** toggles the visibility of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 <ul>
 <li>A Visibility may be shared among multiple {{#crossLink "Entity"}}Entities{{/crossLink}} to toggle
 their visibility as a group.</li>
 </ul>

 <img src="../../../assets/images/Visibility.png"></img>

 ## Example

 This example creates a Visibility that toggles the visibility of
 two {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ````javascript
var scene = new XEO.Scene();

// Create a Visibility
var visibility = new XEO.Visibility(scene, {
    visible: true
});

// Create two Entities whose visibility will be controlled by our Visibility

var entity1 = new XEO.Entity(scene, {
    visibility: visibility
});

var entity2 = new XEO.Entity(scene, {
    visibility: visibility
});

// Subscribe to change on the Visibility's "visible" property
var handle = visibility.on("visible", function(value) {
    //...
});

// Hide our Entities by flipping the Visibility's "visible" property,
// which will also call our handler
visibility.visible = false;

// Unsubscribe from the Visibility again
visibility.off(handle);

// When we destroy our Visibility, the Entities will fall back
// on the Scene's default Visibility instance
visibility.destroy();
 ````
 @class Visibility
 @module XEO
 @submodule culling
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Visibility in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Visibility.
 @param [cfg.visible=true] {Boolean} Flag which controls visibility of the attached {{#crossLink "Entity"}}Entities{{/crossLink}}
 @extends Component
 */
(function () {

    "use strict";

    XEO.Visibility = XEO.Component.extend({

        type: "XEO.Visibility",

        _init: function (cfg) {

            this._state = new XEO.renderer.Visibility({
                visible: true
            });

            this.visible = cfg.visible;
        },

        _props: {

            /**
             Indicates whether this Visibility makes attached {{#crossLink "Entity"}}Entities{{/crossLink}} visible or not.

             Fires a {{#crossLink "Visibility/visible:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    this._state.visible =  value !== false;

                    this._renderer.drawListDirty = true;

                    /**
                     Fired whenever this Visibility's {{#crossLink "Visibility/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible",  this._state.visible);
                },

                get: function () {
                    return this._state.visible;
                }
            }
        },

        _compile: function () {
            this._renderer.visibility = this._state;
        },

        _getJSON: function () {
            return {
                visible: this.visible
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
