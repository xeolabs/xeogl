/**
 A **TestModel** is a procedurally-generated test {{#crossLink "Model"}}{{/crossLink}} containing {{#crossLink "Mesh"}}Meshes{{/crossLink}} that represent city buildings.

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
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this TestModel.
 @param [cfg.size] {Number} World-space width of each axis.
 @param [cfg.density] {Number} Number of buildings on each axis.
 @param [cfg.position=[0,0,0]] {Float32Array} The TestModel's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The TestModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The TestModel's local rotation, as Euler angles given in degrees.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The TestModel's local transform matrix. Overrides the position, scale and rotation parameters.
 @extends Model
 */
xeogl.TestModel = class xeoglTestModel extends xeogl.BuildableModel {

    init(cfg) {
        super.init(cfg);
        this._generate(cfg);
    }

    _generate(options) {

        this.destroyAll();

        options = options || {};

        // Create some geometry and material assets

        this.createAsset("box", {
            type: "xeogl.BoxGeometry",
            xSize: 1,
            ySize: 1,
            zSize: 1
        });

        this.createAsset("asphalt", {
            type: "xeogl.LambertMaterial",
            diffuse: [0.2, 0.2, 0.2],
            ambient: [0.2, 0.2, 0.2],
            specular: [0.0, 0.0, 0.0]
        });

        this.createAsset("lightConcrete", {
            type: "xeogl.LambertMaterial",
            diffuse: [0.6, 0.6, 0.6],
            ambient: [0.2, 0.2, 0.2]
        });

        this.createAsset("grass", {
            type: "xeogl.LambertMaterial",
            diffuse: [0, 0.5, 0.2],
            ambient: [0.1, 0.1, 0.1]
        });

        // Select a couple of assets and generate the asphalt ground

        this.setGeometry("box");
        this.setMaterial("asphalt");
        this.setPosition(20, -.5, 20);
        this.setScale(140, 0.1, 140);
        this.createMesh();

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
    }

    _generateBuilding(xmin, zmin, xmax, zmax, options) {

        var xpos = (xmin + xmax) * 0.5;
        var ypos = 0;
        var zpos = (zmin + zmax) * 0.5;

        // Each building gets a green lawn under it

        this.setGeometry("box");
        this.setMaterial("grass");
        this.setPosition(xpos, ypos, zpos);
        this.setScale((xmax - xmin) / 2.5, 0.5, (zmax - zmin) / 2.5);
        this.setColorize(0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5, 1.0);
        this.createMesh();

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

            this.setGeometry("box");
            this.setMaterial("lightConcrete");
            this.setPosition(xpos, ypos + ySize, zpos);
            this.setScale((xmaxBox - xminBox) * 0.5, ySize, (zmaxBox - zminBox) * 0.5);
            this.createMesh();

            // Decrease current vertical box size
            ySize -= (Math.random() * 5) + 2;
        }
    }
};

