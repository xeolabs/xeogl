(function () {

    "use strict";


    /**
     Holds configuration properties for the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

     <ul>

     <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Configs instance on itself.</li>

     <li>A Configs is just a plain {{#crossLink "Component"}}{{/crossLink}} with no extras.</li>

     <li>Config property values are set on a Configs using its {{#crossLink "Component/fire:method"}}{{/crossLink}} method,
     and may be subscribed to with {{#crossLink "Component/on:method"}}{{/crossLink}}.</li>

     <li>You can define your own properties in a Configs, but take care not to clobber those used by the
     {{#crossLink "Scene"}}{{/crossLink}} (see table below).</li>

     </ul>

     <img src="http://www.gliffy.com/go/publish/image/7123181/L.png"></img>


     ### Configurations used by the Scene

     Don't use the following names for your own properties, because these are already used by xeoEngine:

     | Name  | Description  |
     |---|---|
     | foo  | foo property  |
     | bar  | bar property  |


     ### Example

     ````Javascript

     var scene = new XEO.Scene();

     var configs = scene.configs;

     // Subscribe to change of a Config property.
     // The subscriber is also immediately notified of the current value via the callback.
     configs.on("foo", function(value) {
        console.log("foo = " + value);
     });

     // Change a Configs property
     configs.fire("foo", "Hello!");

     // Read the current value of a Configs property.
     // Normally we would asynchronously subscribe with #on though, to be sure that
     // we're getting the latest changes to the property.
     var bar = configs.props["bar"];
     ````

     @class Configs
     @module XEO
     @constructor
     @param [scene] {Scene} Parent scene - creates this component in the default scene when omitted.
     @param {GameObject} [cfg]  Config values.
     @extends Component
     */
    XEO.Configs = XEO.Component.extend({

        className: "XEO.Configs",

        type: "configs",

        _init: function (cfg) {
            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    this.fire(key, cfg[key]);
                }
            }
        },

        _toJSON: function () {
            return  XEO._copy(this.props);
        }
    });

})();

