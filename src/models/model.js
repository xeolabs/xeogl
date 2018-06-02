/**
 A **Model** is a {{#crossLink "Group"}}{{/crossLink}} of {{#crossLink "Component"}}Components{{/crossLink}}.

 Model is an abstract base class that's subclassed by (at least):

 * {{#crossLink "GLTFModel"}}{{/crossLink}}, which loads its components from glTF files.
 * {{#crossLink "OBJModel"}}{{/crossLink}}, which loads its components from .OBJ and .MTL files.
 * {{#crossLink "STLModel"}}{{/crossLink}}, which loads its components from .STL files.
 * {{#crossLink "SceneJSModel"}}{{/crossLink}}, which loads its components from SceneJS scene definitions.
 * {{#crossLink "BuildableModel"}}{{/crossLink}}, which provides a fluent API for building its components.


 @class Model
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ModelModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.parent] {Object} The parent.
 @param [cfg.position=[0,0,0]] {Float32Array} Local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} Local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} Local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} Local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @param [cfg.visible=true] {Boolean}        Indicates if visible.
 @param [cfg.culled=false] {Boolean}        Indicates if culled from view.
 @param [cfg.pickable=true] {Boolean}       Indicates if pickable.
 @param [cfg.clippable=true] {Boolean}      Indicates if clippable.
 @param [cfg.collidable=true] {Boolean}     Indicates if included in boundary calculations.
 @param [cfg.castShadow=true] {Boolean}     Indicates if casting shadows.
 @param [cfg.receiveShadow=true] {Boolean}  Indicates if receiving shadows.
 @param [cfg.outlined=false] {Boolean}      Indicates if outline is rendered.
 @param [cfg.ghosted=false] {Boolean}       Indicates if rendered as ghosted.
 @param [cfg.highlighted=false] {Boolean}   Indicates if rendered as highlighted.
 @param [cfg.selected=false] {Boolean}      Indicates if rendered as selected.
 @param [cfg.aabbVisible=false] {Boolean}   Indicates if axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean}    Indicates if oriented World-space bounding box is visible.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.

 @extends Group
 */
(function () {

    "use strict";

    xeogl.Model = xeogl.Group.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.Model",

        _init: function (cfg) {

            /**
             All contained {{#crossLink "Components"}}{{/crossLink}}, mapped to their IDs.

             @property components
             @type {{String:Component}}
             */
            this.components = {};

            /**
             Number of contained {{#crossLink "Components"}}{{/crossLink}}.

             @property numComponents
             @type Number
             */
            this.numComponents = 0;

            /**
             A map of maps; for each contained {{#crossLink "Component"}}{{/crossLink}} type,
             a map to IDs to {{#crossLink "Component"}}{{/crossLink}} instances, eg.

             ````
             "xeogl.Geometry": {
                "alpha": <xeogl.Geometry>,
                "beta": <xeogl.Geometry>
              },
             "xeogl.Rotate": {
                "charlie": <xeogl.Rotate>,
                "delta": <xeogl.Rotate>,
                "echo": <xeogl.Rotate>,
              },
             //...
             ````

             @property types
             @type {String:{String:xeogl.Component}}
             */
            this.types = {};

            /**
             All contained {{#crossLink "Object"}}Objects{{/crossLink}}, mapped to their IDs.

             @property objects
             @final
             @type {{String:Object}}
             */
            this.objects = {};

            /**
             All contained {{#crossLink "Mesh"}}Meshes{{/crossLink}}, mapped to their IDs.

             @property meshes
             @final
             @type {String:xeogl.Mesh}
             */
            this.meshes = {};

            /**
             {{#crossLink "Object"}}Objects{{/crossLink}} in this Model that have entity types, mapped to their IDs.

             Each Object is registered in this map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}} is
             set to value.

             @property entities
             @final
             @type {{String:Object}}
             */
            this.entities = {};

            // xeogl.Model overrides xeogl.Group / xeogl.Object state properties, (eg. visible, ghosted etc)
            // and those redefined properties are being set here through the super constructor.

            this._super(cfg); // Call xeogl.Group._init()
        },

        _addComponent: function (component) {
            var componentId;
            var types;
            if (xeogl._isNumeric(component) || xeogl._isString(component)) { // Component ID
                component = this.scene.components[component];
                if (!component) {
                    this.warn("Component not found: " + xeogl._inQuotes(component));
                    return;
                }
            } else if (xeogl._isObject(component)) { // Component config
                var type = component.type || "xeogl.Component";
                if (!xeogl._isComponentType(type)) {
                    this.error("Not a xeogl component type: " + type);
                    return;
                }
                component = new window[type](this.scene, component);
            }
            if (component.scene !== this.scene) { // Component in wrong Scene
                this.error("Attempted to add component from different xeogl.Scene: " + xeogl._inQuotes(component.id));
                return;
            }
            if (this.components[component.id]) { // Component already in this Model
                return;
            }
            if (component.model && component.model.id !== this.id) { // Component in other Model
                component.model.remove(component); // Transferring to this Model
            }
            this.components[component.id] = component;
            types = this.types[component.type];
            if (!types) {
                types = this.types[component.type] = {};
            }
            types[component.id] = component;
            if (component.isType("xeogl.Mesh")) {
                this.meshes[component.id] = component;
            }
            if (component.isType("xeogl.Object")) {
                this.objects[component.id] = component;
            }
            this.numComponents++;
            component._addedToModel(this);
            return component;
        },

        /**
         Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
         @method clear
         */
        clear: function () {
            // For efficiency, destroy Meshes first to avoid
            // xeogl's automatic default component substitutions
            for (var id in this.meshes) {
                if (this.meshes.hasOwnProperty(id)) {
                    this.meshes[id].destroy();
                }
            }
            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {
                    this.components[id].destroy(); // Groups in this Model will remove themselves when they're destroyed
                }
            }
            this.components = {};
            this.numComponents = 0;
            this.types = {};
            this.objects = {};
            this.meshes = {};
        },

        /**
         * @deprecated
         */
        destroyAll: function () {
            this.clear();
        },

        _destroy: function () {
            this._super();
            this.clear();
        }
    });

})();