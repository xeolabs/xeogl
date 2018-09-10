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
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
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
 @param [cfg.edges=false] {Boolean}         Indicates if edges are emphasized.
 @param [cfg.aabbVisible=false] {Boolean}   Indicates if axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean}    Indicates if oriented World-space bounding box is visible.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.

 @extends Group
 */
import {core} from "../core.js";
import {utils} from '../utils.js';
import {Group} from "../objects/group.js";
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Model";

class Model extends Group {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

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
         {{#crossLink "Object"}}Objects{{/crossLink}} in this Model that have GUIDs, mapped to their GUIDs.

         Each Object is registered in this map when its {{#crossLink "Object/guid:property"}}{{/crossLink}} is
         assigned a value.

         @property guidObjects
         @final
         @type {{String:Object}}
         */
        this.guidObjects = {};

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

        /**
         For each entity type, a map of IDs to {{#crossLink "Object"}}Objects{{/crossLink}} of that entity type.

         Each Object is registered in this map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}} is
         assigned a value.

         @property entityTypes
         @final
         @type {String:{String:xeogl.Component}}
         */
        this.entityTypes = {};

        /**
         Lazy-regenerated ID lists.
         */
        this._objectGUIDs = null;
        this._entityIds = null;

        // xeogl.Model overrides xeogl.Group / xeogl.Object state properties, (eg. visible, ghosted etc)
        // and those redefined properties are being set here through the super constructor.

        super.init(cfg); // Call xeogl.Group._init()

        this.scene._modelCreated(this);
    }

    _addComponent(component) {
        let componentId;
        let types;
        if (utils.isNumeric(component) || utils.isString(component)) { // Component ID
            component = this.scene.components[component];
            if (!component) {
                this.warn("Component not found: " + utils.inQuotes(component));
                return;
            }
        } else if (utils.isObject(component)) { // Component config
            const type = component.type || "xeogl.Component";
            if (!core.isComponentType(type)) {
                this.error("Not a xeogl component type: " + type);
                return;
            }
            component = new window[type](this.scene, component);
        }
        if (component.scene !== this.scene) { // Component in wrong Scene
            this.error("Attempted to add component from different xeogl.Scene: " + utils.inQuotes(component.id));
            return;
        }
        if (this.components[component.id]) { // Component already in this Model
            return;
        }
        if (component.model && component.model.id !== this.id) { // Component in other Model
            component.model._removeComponent(component); // Transferring to this Model
        }
        this.components[component.id] = component;
        types = this.types[component.type];
        if (!types) {
            types = this.types[component.type] = {};
        }
        types[component.id] = component;
        if (component.isType("xeogl.Object")) {
            const object = component;
            this.objects[object.id] = object;
            if (object.entityType) {
                this.entities[object.id] = object;
                let objectsOfType = this.entityTypes[object.entityType];
                if (!objectsOfType) {
                    objectsOfType = {};
                    this.entityTypes[object.entityType] = objectsOfType;
                }
                objectsOfType[object.id] = object;
                this._entityIds = null; // Lazy regenerate
                this._entityTypeIds = null; // Lazy regenerate
            }
            if (object.guid) {
                this.guidObjects[object.id] = object;
                this._objectGUIDs = null; // To lazy-rebuild
            }
            if (component.isType("xeogl.Mesh")) {
                this.meshes[component.id] = component;
            }
        }
        this.numComponents++;
        component._addedToModel(this);
        return component;
    }

    _removeComponent(component) {
        const id = component.id;
        delete this.components[id];
        delete this.meshes[id];
        delete this.objects[id];
        if (component.entityType) {
            delete this.entities[id];
            const objectsOfType = this.entityTypes[component.entityType];
            if (objectsOfType) {
                delete objectsOfType[id];
            }
            this._entityIds = null; // Lazy regenerate
            this._entityTypeIds = null; // Lazy regenerate
        }
        if (component.guid) {
            delete this.guidObjects[component.guid];
            this._objectGUIDs = null; // To lazy-rebuild
        }
    }

    /**
     Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
     @method clear
     */
    clear() {
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
        this.entities = {};
    }

    /**
     Convenience array of entity type IDs in {{#crossLink "Model/entityTypes:property"}}{{/crossLink}}.
     @property entityTypeIds
     @final
     @type {Array of String}
     */
    get objectGUIDs() {
        if (!this._objectGUIDs) {
            this._objectGUIDs = Object.keys(this.guidObjects);
        }
        return this._objectGUIDs;
    }

    /**
     Convenience array of entity type IDs in {{#crossLink "Model/entityTypes:property"}}{{/crossLink}}.
     @property entityTypeIds
     @final
     @type {Array of String}
     */
    get entityTypeIds() {
        if (!this._entityTypeIds) {
            this._entityTypeIds = Object.keys(this.entityTypes);
        }
        return this._entityTypeIds;
    }

    /**
     Convenience array of IDs in {{#crossLink "Model/entities:property"}}{{/crossLink}}.
     @property entityIds
     @final
     @type {Array of String}
     */
    get entityIds() {
        if (!this._entityIds) {
            this._entityIds = Object.keys(this.entities);
        }
        return this._entityIds;
    }

    /**
     * @deprecated
     */
    destroyAll() {
        this.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
        this.scene._modelDestroyed(this);
    }
}

componentClasses[type] = Model;

export{Model};