/**
 A **Stats** provides statistics on the parent {{#crossLink "Scene"}}{{/crossLink}}.

 ## Overview

 <ul>
 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Stats instance on itself.</li>
 <li>You can manage your own statistics properties in a Stats, but take care not to clobber the properties that are
 provided by the {{#crossLink "Scene"}}{{/crossLink}} (see table below).</li>
 </ul>

 <img src="../../../assets/images/Stats.png"></img>

 ## Example

 This example shows how to subscribe to the "numGeometries' statistic, which indicates
 how many {{#crossLink "Geometry"}}{{/crossLink}} components are in the parent {{#crossLink "Scene"}}{{/crossLink}}.

 ````Javascript
 var scene = new XEO.Scene();

 // Get the statistics for a Scene
 var stats = scene.stats;

 // Subscribe to change of a statistic
 // The subscriber is also immediately notified of the current value via the callback.
 var handle = configs.on("numGeometries", function(value) {
     console.log("Number of Geometry components in the Scene is now " + value);
});

 // Unsubscribe
 configs.off(handle);

 // Read the current value of a statistic
 // Normally we would asynchronously subscribe with #on though, to be sure that
 // we're getting the latest changes to the statistic.
 var numGeometries = configs.props["numGeometries"];
 ````

 As mentioned, we can manage our own statistics as well (perhaps if we're extending xeoEngine):

 ````Javascript
 // Create a statistic
 configs.zero("myStatistic");

 // Increment our statistic
 configs.inc("myStatistic");

 // Decrement our statistic
 configs.dec("myStatistic");

 // Subscribe to change of our statistic
 handle2 = configs.on("myStatistic", function(value) {
    console.log("Value of myStatistic is now " + value);
});

 // Unsubscribe
 configs.off(handle2);

 // Read the current value of our statistic
 var myStatistic = configs.props["myStatistic"];
 ````

 ## Native xeoEngine statistics

 Listed below are are the statistics provided by the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

 Don't use these names for your own custom statistics properties.

 | Name  | Description|
 |---|---|
 | "numGeometries" | Number of {{#crossLink "Geometry"}}Geometrys{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}} |
 | "numTextures"  | Number of {{#crossLink "Texture"}}Textures{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}}  |
 | "numGameObjects"  | Number of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}}  |

 @class Stats
 @module XEO
 @submodule reporting
 @constructor
 @extends Component
 */
(function () {

    "use strict";

    XEO.Stats = XEO.Component.extend({

        type: "XEO.Stats",

        _init: function (cfg) {

            this.stats = {};

            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {

                    this.stats[key] = cfg[key];

                    this.fire(key, this.stats[key]);
                }
            }
        },

        clear: function () {
            // TODO?
        },

        /**
         Increments the value of a statistic property within this Stats.

         Publishes the new value as an event with the same name as the property.

         @method inc
         @param {String} name The statistic property name.
         @param {Number} [count=1] Amount to add.
         */
        inc: function (name, count) {

            count = (count !== undefined && count != null) ? count : 1;

            if (this.stats[name] === undefined || this.stats[name] === null) {
                this.stats[name] = count;
            }

            this.stats[name] += count;

            this.fire(name, this.stats[name]);
        },

        /**
         Decrements the value of a statistic property within this Stats.

         Publishes the new value as an event with the same name as the property.

         @method dec
         @param {String} name The statistic property name.
         @param {Number} [count=1] Amount to subtract.
         */
        dec: function (name, count) {

            count = (count !== undefined && count != null) ? count : 1;

            if (this.stats[name] === undefined || this.stats[name] === null) {
                this.stats[name] = count;
            }

            this.stats[name] -= count;

            this.fire(name, this.stats[name]);
        },

        /**
         Zeroes the value of a statistic property within this Stats.

         Publishes the new value as an event with the same name as the property.

         @method zero
         @param {String} name The statistic property name.
         */
        zero: function (name) {

            if (this.stats[name] === undefined || this.stats[name] === null) {
                this.stats[name] = 0;
            }

            this.stats[name] = 0;

            this.fire(name, this.stats[name]);
        },

        _getJSON: function () {
            return {
                stats: XEO._copy(this.stats)
            };
        }
    });

})();
