/**
 A **Configs** holds configuration properties for the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview


 * Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Configs on itself as a read-only property.
 * Config property values are set on a Configs using its {{#crossLink "Configs/set:method"}}{{/crossLink}} method,
 and changes to properties may be subscribed to using {{#crossLink "Component/on:method"}}{{/crossLink}}.
 * You can define your own properties in a Configs, but take care not to clobber the native properties used by
 xeogl (see table below).


 <img src="../../../assets/images/Configs.png"></img>

 ## Native xeogl config properties

 Don't use the following names for your own Configs properties, because these are already used by xeogl:

 | Name  | Description  |
 |---|---|
 | TODO  | TODO  |
 | TODO  | TODO  |


 ## Usage

 In this example, we're subscribing to change events for a {{#crossLink "Scene"}}Scene's{{/crossLink}} "foo" configuration property, then updating that
 property, which fires a change event.

 ````Javascript
 var scene = new xeogl.Scene();

 var configs = scene.configs;

 // Subscribe to change of a Configs property.
 // The subscriber is also immediately notified of the current value via the callback.
 configs.on("foo", function(value) {
    console.log("foo = " + value);
});

 // Create and set a Configs property, firing our change handler:
 configs.set("foo", "Hello!");

 // Read the current value of a Configs property.
 // Normally we would asynchronously subscribe with #on though, to be sure that
 // we're getting the latest changes to the property.
 var bar = configs.props["bar"];
 ````

 @class Configs
 @module xeogl
 @submodule configs
 @constructor
 @param [scene] {Scene} Parent scene - creates this component in the default scene when omitted.
 @param {Object} [cfg]  Config values.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Configs = xeogl.Component.extend({

        type: "xeogl.Configs",

        _init: function (cfg) {

            this.props = {};

            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    this.set(key, cfg[key]);
                }
            }
        },

        /**
         * Sets a property on this Configs.
         *
         * Fires an event with the same name as the property. Existing subscribers to the event will be
         * notified immediately of the property value. Like all events on a Component, this Configs will
         * retain the event, to notify any subscribers that are attached subsequently.
         *
         * @method set
         * @param {String} name The property name
         * @param {Object} value The property value
         * @param {Boolean} [forget=false] When true, does not retain for subsequent subscribers
         */
        set: function (name, value) {

            this.props[name] = value;

            this.fire(name, value);
        },

        _toJSON: function () {
            return xeogl._copy(this.props);
        }
    });

})();
