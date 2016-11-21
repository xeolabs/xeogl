/**
 A **BuildableModel** is a {{#crossLink "Model"}}{{/crossLink}} that provides a fluent API through which you can
 build it incrementally.

 ## Overview

 * A BuilderModel implements the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) with a [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface) that  makes it easy to programmatically generate content for xeogl.
 * TODO: more info

 ## Examples

 * [Generating a city with a BuildableModel](../../examples/#models_BuildableModel_city)</li>

 ## Usage

 A BuildableModel containing ten textured boxes with random sizes and positions:

 ````javascript
 var model = new xeogl.BuildableModel();

 // Add a BoxGeometry asset
 buildableModel.asset("boxGeometry", {
     type: "xeogl.BoxGeometry"
 });

 // Add a PhongMaterial asset
 buildableModel.asset("gridMaterial", {
     type: "xeogl.PhongMaterial",
     ambient: [0.9, 0.3, 0.9],
     shininess: 30,
     diffuseMap: {
         src: "textures/diffuse/gridMaterial.jpg"
     }
 });

 // Set the BoxGeometry asset as the current geometry
 buildableModel.geometry("boxGeometry");

 // Set the PhongMaterial asset as the current material
 buildableModel.material("gridMaterial");

 // Build ten entities with random sizes and positions,
 // that each get the current geometry and material
 for (var i = 0; i < 10; i++) {

     buildableModel.scale(Math.random() * 10 + 1, Math.random() * 10 + 1, Math.random() * 10 + 1);
     buildableModel.pos(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);

     buildableModel.entity();
 }
 ````

 @class BuildableModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BuildableModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BuildableModel.
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this BuildableModel.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this BuildableModel. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the BuildableModel attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @extends Model
 */
(function () {

    "use strict";

    xeogl.BuildableModel = xeogl.Model.extend({

        type: "xeogl.BuildableModel",

        _init: function (cfg) {

            this._super(cfg);

            this._material = null;
            this._geometry = null;
            this._pos = xeogl.math.vec3([0, 0, 0]);
            this._scale = xeogl.math.vec3([1, 1, 1]);
            this._angles = xeogl.math.vec3([0, 0, 0]);
            this._axis = [0, 1, 2];
            this._assetCfgs = {};
            this._assets = {};
        },

        /**
         * Adds an asset to this BuildableModel.
         *
         * The asset is given as a configuration object, to be lazy-instantiated as soon as an entity is built from
         * it with {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * ### Usage
         *
         * Adding a {{#crossLink "PhongMaterial"}}{{/crossLink}} asset with ID "uvGrid":
         *
         * ````javascript
         * buildableModel.asset("gridMaterial", {
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
         * buildableModel.asset("boxGeometry", {
         *     type: "xeogl.BoxGeometry",
         *     xSize: 1.0,
         *     ySize: 1.0,
         *     zSize: 1.0
         * });
         * ````
         *
         * @method asset
         * @param {String|Number} assetId A unique ID for the asset.
         * @param {*} cfg Configuration object for the asset.
         */
        asset: function (assetId, cfg) {
            this._assetCfgs[assetId] = cfg;
            delete this._assets[assetId];
        },

        /**
         * Sets the {{#crossLink "Geometry"}}{{/crossLink}} asset that will be added to
         * each {{#crossLink "Entity"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * The given ID must belong to a {{#crossLink "Geometry"}}{{/crossLink}} asset that was added previously with
         * {{#crossLink "BuildableModel/asset:method"}}asset(){{/crossLink}}.
         *
         * @method geometry
         * @param {String|Number} assetId The asset ID.
         */
        geometry: function (assetId) {
            this._geometry = assetId;
        },

        /**
         * Sets the {{#crossLink "Material"}}{{/crossLink}} asset that will be added to
         * each {{#crossLink "Entity"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * The given ID must belong to a {{#crossLink "Material"}}{{/crossLink}} asset that was added previously with
         * {{#crossLink "BuildableModel/asset:method"}}asset(){{/crossLink}}.
         *
         * @method material
         * @param {String|Number} assetId The asset ID.
         */
        material: function (assetId) {
            this._material = assetId;
        },

        /**
         * Sets the 3D position of each {{#crossLink "Entity"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * @method pos
         * @param {Number} x Position on X-axis.
         * @param {Number} y Position on Y-axis.
         * @param {Number} z Position on Z-axis.
         */
        pos: function (x, y, z) {
            this._pos[0] = x;
            this._pos[1] = y;
            this._pos[2] = z;
        },

        /**
         * Sets the 3D scale of each {{#crossLink "Entity"}}{{/crossLink}} subsequently created with
         * {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * @method scale
         * @param {Number} x Scale on X-axis.
         * @param {Number} y Scale on Y-axis.
         * @param {Number} z Scale on Z-axis.
         */
        scale: function (x, y, z) {
            this._scale[0] = x;
            this._scale[1] = y;
            this._scale[2] = z;
        },

        /**
         * Sets the 3D Euler rotation angles for each {{#crossLink "Entity"}}{{/crossLink}} subsequently created
         * with {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * @method angles
         * @param {Number} x Angle on X-axis in degrees.
         * @param {Number} y Angle on Y-axis in degrees.
         * @param {Number} z Angle on Z-axis in degrees.
         */
        angles: function (x, y, z) {
            this._angles[0] = x;
            this._angles[1] = y;
            this._angles[2] = z;
        },

        /**
         * Sets the order of 3D rotations for each {{#crossLink "Entity"}}{{/crossLink}} subsequently created
         * with {{#crossLink "BuildableModel/entity:method"}}entity(){{/crossLink}}.
         *
         * ### Usage
         *
         * The X, Y and Z axis are identified as ````0, 1, 2```` respectively.
         *
         * ````Javascript
         * buildableModel.axis(0,1,2); // X, Y, Z
         * buildableModel.axis(2,0,1); // Z, X, Y
         * buildableModel.axis(1,2,0); // Y, Z, X
         * ````
         *
         * @method axis
         * @param {Number} a Indicates the first rotation axis.
         * @param {Number} b Indicates the second rotation axis.
         * @param {Number} c Indicates the third rotation axis.
         */
        axis: function (a, b, c) {
            this._axis[0] = a;
            this._axis[1] = b;
            this._axis[2] = c;
        },

        /**
         * Creates an {{#crossLink "Entity"}}{{/crossLink}} with whatever assets and states are currently
         * set on this BuildableModel.
         *
         * @method entity
         * @param {String|Number} [id] A unique ID for the new {{#crossLink "Entity"}}{{/crossLink}}.
         */
        entity: function (id) {
            this.add({
                type: "xeogl.Entity",
                id: id,
                material: this._getAsset(this._material),
                geometry: this._getAsset(this._geometry),
                transform: {
                    type: "xeogl.Scale",
                    xyz: this._scale,
                    parent: this.create({
                        type: "xeogl.Translate",
                        xyz: this._pos
                    })
                }
            });
        },

        _getAsset: function (assetId) {
            if (assetId === null) {
                return;
            }
            var asset = this._assets[assetId];
            if (!asset) {
                var assetCfg = this._assetCfgs[assetId];
                if (!assetCfg) {
                    this.error("Unknown asset: " + assetId);
                    return;
                }
                asset = this.create(assetCfg);
                this._assets[assetId] = asset;
                this.add(asset);
            }
            return asset;
        },

        /**
         * Removes all assets and {{#crossLink "Entity"}}Entities{{/crossLink}} from this BuildableModel.
         * @method clear
         */
        clear: function () {
            this._super();
            this._assets = {};
        },

        /**
         * Resets the state of this BuildableModel to defaults.
         * @method reset
         */
        reset: function () {
            this.pos(0, 0, 0);
            this.scale(1, 1, 1);
            this.angles(0, 0, 0);
            this.axis(0, 1, 2);
            this.material(null);
            this.geometry(null);
        },

        _getJSON: function () {
            var json = this._super();
            // json.assets = this._assetCfgs;
            // json.entities = this._entities;
            return json;
        }
    });
})();
