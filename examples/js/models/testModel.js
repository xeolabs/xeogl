/**
 A **TestModel** is a procedurally-generated test {{#crossLink "Model"}}{{/crossLink}} containing {{#crossLink "Entity"}}Entities{{/crossLink}} that represent city buildings.

 <a href="../../examples/#models_generation_TestModel"><img src="http://i.giphy.com/l0HlPJO1AN01Lz27e.gif"></img></a>

 ## Overview

 * Procedurally generates simple content for development and testing.
 * Allows you to develop some basic capabilities of your app without needing to load any models.

 It inherits these capabilities from its {{#crossLink "Model"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the components within it.
 * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * Provides its dynamic World-space axis-aligned boundary.

 ## Examples

 * TODO

 ## Usage

 ````javascript
 var model = new xeogl.TestModel({
     id: "myModel",
     size: 5000, // Width of each axis
     density: 4 // How many buildings on each axis
 });
 ````
 
 @class TestModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this TestModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this TestModel.
 @param [cfg.size] {Number} World-space width of each axis.
 @param [cfg.density] {Number} Number of buildings on each axis.
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this TestModel.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this TestModel. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the TestModel attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @extends Model
 */
(function () {

    "use strict";

    xeogl.TestModel = xeogl.BuildableModel.extend({

        type: "xeogl.TestModel",

        _init: function (cfg) {
            
            this._super(cfg);
            
            this._generate(cfg);
        },

        _generate: function (options) {

            this.destroyAll();
            
            options = options || {};

            // Create some geometry and material assets

            this.asset("box", {
                type: "xeogl.BoxGeometry",
                xSize: 1,
                ySize: 1,
                zSize: 1
            });

            this.asset("asphalt", {
                type: "xeogl.LambertMaterial",
                diffuse: [0.2, 0.2, 0.2],
                ambient: [0.2, 0.2, 0.2],
                specular: [0.0, 0.0, 0.0]
            });

            this.asset("lightConcrete", {
                type: "xeogl.LambertMaterial",
                diffuse: [0.6, 0.6, 0.6],
                ambient: [0.2, 0.2, 0.2]
            });

            this.asset("grass", {
                type: "xeogl.LambertMaterial",
                diffuse: [0, 0.5, 0.2],
                ambient: [0.1, 0.1, 0.1]
            });

            // Select a couple of assets and generate the asphalt ground

            this.geometry("box");
            this.material("asphalt");
            this.pos(20, -.5, 20);
            this.scale(140, 0.1, 140);
            this.entity();

            // Generate the buildings

            var size = options.size || 1000;
            var halfSize = size * 0.5;
            var density = options.density || 10;
            var spacing = size / density;

            for (var x = -halfSize; x <= halfSize; x += spacing) {
                for (var z = -halfSize; z <= halfSize; z += spacing) {
                    this._generateBuilding(x + 2, z + 2, x + spacing - 2, z + spacing - 2, options);
                }
            }
        },

        _generateBuilding: function (xmin, zmin, xmax, zmax, options) {

            var xpos = (xmin + xmax) * 0.5;
            var ypos = 0;
            var zpos = (zmin + zmax) * 0.5;

            // Each building gets a green lawn under it

            this.geometry("box");
            this.material("grass");
            this.pos(xpos, ypos, zpos);
            this.scale((xmax - xmin) / 2.5, 0.5, (zmax - zmin) / 2.5);
            this.colorize(0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5, 1.0);
            this.entity();

            // Now generate the building as a bunch of boxes

            var yMaxSize = (Math.random() * 30) + 15;
            var ySize = yMaxSize + 10;
            var width;
            var axis;
            var sign;

            var xminBox;
            var zminBox;
            var xmaxBox;
            var zmaxBox;

            while (ySize > 5) {

                width = (Math.random() * 5) + 2;
                axis = Math.round(Math.random());
                sign = Math.round(Math.random());

                switch (axis) {

                    case 0:

                        if (sign == 0) {

                            xminBox = xmin;
                            zminBox = zpos - width;

                            xmaxBox = xpos + width;
                            zmaxBox = zpos + width;

                        } else {

                            xminBox = xpos - width;
                            zminBox = zpos - width;

                            xmaxBox = xmax;
                            zmaxBox = zpos + width;
                        }

                        break;

                    case 1:

                        if (sign == 0) {

                            xminBox = xpos - width;
                            zminBox = zmin;

                            xmaxBox = xpos + width;
                            zmaxBox = zpos + width;

                        } else {

                            xminBox = xpos - width;
                            zminBox = zpos - width;

                            xmaxBox = xpos + width;
                            zmaxBox = zmax;
                        }

                        break;
                }

                this.geometry("box");
                this.material("lightConcrete");
                this.pos(xpos, ypos + ySize, zpos);
                this.scale((xmaxBox - xminBox) * 0.5, ySize, (zmaxBox - zminBox) * 0.5);
                this.entity();

                // Decrease current vertical box size
                ySize -= (Math.random() * 5) + 2;
            }
        },

        _props: {},

        _destroy: function () {
            this.destroyAll();
        }
    });

})();
