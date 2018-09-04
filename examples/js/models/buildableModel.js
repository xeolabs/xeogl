/**
 A **BuildableModel** is a {{#crossLink "Model"}}{{/crossLink}} that provides a "stateful builder" API through which you can
 procedurally generate xeogl content.

 <a href="../../examples/#models_generation_city"><img src="http://i.giphy.com/l0HlPJO1AN01Lz27e.gif"></img></a>

 ## Overview

 * A BuilderModel implements the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern).
 * Create various assets within a BuilderModel, such as {{#crossLink "Geometry"}}Geometries{{/crossLink}}
 and {{#crossLink "Material"}}Materials{{/crossLink}}, then create {{#crossLink "Mesh"}}Meshes{{/crossLink}} that use those assets.
 * The BuilderModel then owns those components and will destroy them when you
 call its {{#crossLink "BuildableModel/clear:method"}}clear(){{/crossLink}} or {{#crossLink "Component/destroy:method"}}destroy(){{/crossLink}} methods.
 * A BuildableModel can be transformed within World space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * A BuildableModel provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 ## Examples

 * [Generating a city with a BuildableModel](../../examples/#models_generation_city)</li>

 ## Usage

 A BuildableModel containing ten textured boxes with random sizes and positions:

 ````javascript
 var model = new xeogl.BuildableModel();

 // Add a BoxGeometry asset
 buildableModel.createAsset("boxGeometry", {
     type: "xeogl.BoxGeometry"
 });

 // Add a PhongMaterial asset
 buildableModel.createAsset("gridMaterial", {
     type: "xeogl.PhongMaterial",
     ambient: [0.9, 0.3, 0.9],
     shininess: 30,
     diffuseMap: {
         src: "textures/diffuse/gridMaterial.jpg"
     }
 });

 // Set the BoxGeometry asset as the current geometry
 buildableModel.setGeometry("boxGeometry");

 // Set the PhongMaterial asset as the current material
 buildableModel.setMaterial("gridMaterial");

 // Build ten meshes with random sizes and positions,
 // that each get the current geometry and material
 for (var i = 0; i < 10; i++) {

     buildableModel.setScale(Math.random() * 10 + 1, Math.random() * 10 + 1, Math.random() * 10 + 1);
     buildableModel.setPosition(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);

     buildableModel.createMesh();
 }
 ````

 @class BuildableModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BuildableModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BuildableModel.
 @param [cfg.position=[0,0,0]] {Float32Array} The BuildableModel's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The BuildableModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The BuildableModel's local rotation, as Euler angles given in degrees.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The BuildableModel's local transform matrix. Overrides the position, scale and rotation parameters.
 @extends Model
 */
{

    xeogl.BuildableModel = class xeoglBuildableModel extends xeogl.Model {

        init(cfg) {
            super.init(cfg);
            this._initState();
        }

        _initState() {
            this._state = {
                material: null,
                geometry: null,
                pos: xeogl.math.vec3([0, 0, 0]),
                scale: xeogl.math.vec3([1, 1, 1]),
                angles: xeogl.math.vec3([0, 0, 0]),
                axis: [0, 1, 2],
                colorize: xeogl.math.vec3([1, 1, 1]),
                assetCfgs: {},
                assets: {}
            };
        }

        /**
         * Adds an asset to this BuildableModel.
         *
         * The asset is given as a configuration object, to be lazy-instantiated as soon as an mesh is built from
         * it with {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * #### Usage
         *
         * Adding a {{#crossLink "PhongMaterial"}}{{/crossLink}} asset with ID "gridMaterial":
         *
         * ````javascript
         * buildableModel.createAsset("gridMaterial", {
         *     type: "xeogl.PhongMaterial",
         *     ambient: [0.9, 0.3, 0.9],
         *     shininess: 30,
         *     diffuseMap: {
         *         src: "textures/diffuse/uvGrid2.jpg"
         *     }
         * });
         * ````
         *
         * Adding a {{#crossLink "BoxGeometry"}}{{/crossLink}} asset with ID "boxGeometry":
         *
         * ````javascript
         * buildableModel.createAsset("boxGeometry", {
         *     type: "xeogl.BoxGeometry",
         *     xSize: 1.0,
         *     ySize: 1.0,
         *     zSize: 1.0
         * });
         * ````
         *
         * @method createAsset
         * @param {String|Number} assetId A unique ID for the asset.
         * @param {*} cfg Configuration object for the asset.
         */
        createAsset(assetId, cfg) {
            this._state.assetCfgs[assetId] = cfg;
            delete this._state.assets[assetId];
        }

        /**
         * Selects the {{#crossLink "Geometry"}}{{/crossLink}} asset that will be added to
         * each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * The given ID must belong to a {{#crossLink "Geometry"}}{{/crossLink}} asset that was added previously with
         * {{#crossLink "BuildableModel/asset:method"}}asset(){{/crossLink}}.
         *
         * @method geometry
         * @param {String|Number} assetId The asset ID.
         */
        setGeometry(assetId) {
            this._state.geometry = assetId;
        }

        /**
         * Selects the {{#crossLink "Material"}}{{/crossLink}} asset that will be added to
         * each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * The given ID must belong to a {{#crossLink "Material"}}{{/crossLink}} asset that was added previously with
         * {{#crossLink "BuildableModel/asset:method"}}asset(){{/crossLink}}.
         *
         * @method setMaterial
         * @param {String|Number} assetId The asset ID.
         */
        setMaterial(assetId) {
            this._state.material = assetId;
        }

        /**
         * Sets the 3D position of each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * @method setPosition
         * @param {Number} x Position on X-axis.
         * @param {Number} y Position on Y-axis.
         * @param {Number} z Position on Z-axis.
         */
        setPosition(x, y, z) {
            this._state.pos[0] = x;
            this._state.pos[1] = y;
            this._state.pos[2] = z;
        }

        /**
         * Sets the 3D scale of each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * @method setScale
         * @param {Number} x Scale on X-axis.
         * @param {Number} y Scale on Y-axis.
         * @param {Number} z Scale on Z-axis.
         */
        setScale(x, y, z) {
            this._state.scale[0] = x;
            this._state.scale[1] = y;
            this._state.scale[2] = z;
        }

        /**
         * Sets the 3D Euler rotation angles for each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created
         * with {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * @method setRotation
         * @param {Number} x Angle on X-axis in degrees.
         * @param {Number} y Angle on Y-axis in degrees.
         * @param {Number} z Angle on Z-axis in degrees.
         */
        setRotation(x, y, z) {
            this._state.angles[0] = x;
            this._state.angles[1] = y;
            this._state.angles[2] = z;
        }

        /**
         * Sets the order of 3D rotations for each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created
         * with {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * #### Usage
         *
         * The X, Y and Z axis are identified as ````0, 1, 2```` respectively.
         *
         * ````Javascript
         * buildableModel.setRotationAxis(0,1,2); // X, Y, Z
         * buildableModel.setRotationAxis(2,0,1); // Z, X, Y
         * buildableModel.setRotationAxis(1,2,0); // Y, Z, X
         * ````
         *
         * @method setRotationAaxis
         * @param {Number} a Indicates the first rotation axis.
         * @param {Number} b Indicates the second rotation axis.
         * @param {Number} c Indicates the third rotation axis.
         */
        setRotationAxis(a, b, c) {
            this._state.axis[0] = a;
            this._state.axis[1] = b;
            this._state.axis[2] = c;
        }

        /**
         * Sets the RGBA colorize factors each {{#crossLink "Mesh"}}{{/crossLink}} subsequently created
         * with {{#crossLink "BuildableModel/mesh:method"}}mesh(){{/crossLink}}.
         *
         * #### Usage
         *
         * ````Javascript
         * buildableModel.setColorize(0.4, 0.4, 0.4, 1.0);
         * ````
         *
         * @method setColorize
         * @param {Number} r Indicates the amount of red.
         * @param {Number} g Indicates the amount of green.
         * @param {Number} b Indicates the amount of blue.
         * @param {Number} z Indicates the alpha.
         */
        setColorize(r, g, b, a) {
            this._state.colorize[0] = r;
            this._state.colorize[1] = g;
            this._state.colorize[2] = b;
            this._state.colorize[3] = a;
        }

        /**
         * Creates an {{#crossLink "Mesh"}}{{/crossLink}} with whatever assets and states are currently
         * set on this BuildableModel.
         *
         * @method createMesh
         * @param {String|Number} [id] A unique ID for the new {{#crossLink "Mesh"}}{{/crossLink}}.
         */
        createMesh(id) {
            var mesh = new xeogl.Mesh({
                id: id,
                material: this._getAsset(this._state.material),
                geometry: this._getAsset(this._state.geometry),
                scale: this._state.scale,
                position: this._state.pos,
                colorize: this._state.colorize
            });
            this._addComponent(mesh);
            this.addChild(mesh, false); // Don't inherit state from this Model
        }

        _getAsset(assetId) {
            if (assetId === null) {
                return;
            }
            var asset = this._state.assets[assetId];
            if (!asset) {
                var assetCfg = this._state.assetCfgs[assetId];
                if (!assetCfg) {
                    this.error("Unknown asset: " + assetId);
                    return;
                }
                asset = this.create(assetCfg);
                this._state.assets[assetId] = asset;
                this._addComponent(asset);
            }
            return asset;
        }

        /**
         * Removes all assets and {{#crossLink "Mesh"}}Meshes{{/crossLink}} from this BuildableModel.
         * @method clear
         */
        clear() {
            super.clear();
            this._initState();
        }

        /**
         * Resets the state of this BuildableModel to defaults.
         * @method reset
         */
        reset() {
            this.setPosition(0, 0, 0);
            this.setScale(1, 1, 1);
            this.setRotation(0, 0, 0);
            this.setRotationAxis(0, 1, 2);
            this.setColorize(1, 1, 1, 1);
            this.setMaterial(null);
            this.setGeometry(null);
        }
    };
}
