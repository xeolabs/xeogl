/**
 A **Model** is a collection of {{#crossLink "Component"}}Components{{/crossLink}}.

 ## Overview

 * A Model owns the components that are added to it, automatically destroying them when the Model is destroyed.
 * Can be attached to a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, to transform its components as a group, within World-space.
 * Provides the collective axis-aligned World-space boundary of its components.

 A Model is subclassed by (at least):

 * {{#crossLink "GLTFModel"}}{{/crossLink}}, which loads its components from glTF files.
 * {{#crossLink "OBJModel"}}{{/crossLink}}, which loads its components from .OBJ and .MTL files.
 * {{#crossLink "STLModel"}}{{/crossLink}}, which loads its components from .STL files.
 * {{#crossLink "SceneJSModel"}}{{/crossLink}}, which loads its components from SceneJS scene definitions.
 * {{#crossLink "BuildableModel"}}{{/crossLink}}, which provides a fluent API for building its components.

 ## Usage

 * [Adding Components](#adding-components)
 * [Removing Components](#removing-components)
 * [Finding Models in Scenes](#finding-models-in-scenes)
 * [Finding Components in Models](#finding-components-in-models)
 * [Transforming a Model](#transforming-a-model)
 * [Getting the World-space boundary of a Model](#getting-the-world-space-boundary-of-a-model)
 * [Clearing a Model](#clearing-a-model)
 * [Destroying a Model](#destroying-a-model)

 ### Adding Components

 When adding components to a Model, it's usually easiest to just add their configuration objects and let the Model
 internally instantiate them, as shown below.

 As mentioned, a Model owns all the components added to it, destroying them when we destroy
 the Model or call the Model's {{#crossLink "Model/destroyAll:method"}}{{/crossLink}} method.

 ````javascript
 var model = new xeogl.Model({ // Create Model in xeogl's default Scene
     id: "myModel"
 });

 var geometry = model.add({
    type: "xeogl.TorusGeometry"
 });

 var material = model.add({
    type: "xeogl.PhongMaterial"
    diffuse: [0.4, 0.4, 9.0]
 });

 model.add({
    type: "xeogl.Entity",
    geometry: geometry,
    material: material
 });
 ````

 As shown below, we can also add our own component instances, supplying them either by reference or ID.

 Note that the components must be in the same {{#crossLink "Scene"}}{{/crossLink}} as the model.

 ````javascript
 // Add by instance
 var myEntity = new xeogl.Entity({
    geometry: geometry,
    material: material
 });
 model.add(myEntity);

 // Add by ID
 new xeogl.Entity({
    id: "myEntity",
    geometry: geometry,
    material: material
 })
 model.add("myEntity");
 ````

 We can also add components all in one shot,  via the Model's constructor:

 ````javascript
 model = new xeogl.Model({
    id: "myModel",
    components: [
        {
            type: "xeogl.TorusGeometry",
            id: "myGeometry"
        },
        {
            type: "xeogl.PhongMaterial",
            id: "myMaterial",
            diffuse: [0.4, 0.4, 0.9]
        },
        {
            type: "xeogl.Entity",
            id: "myEntity",
            geometry: "myGeometry",
            material: "myMaterial"
        }
    ]
 });
 ````

 ### Removing Components

 To remove a component instance from a Model:

 ````JavaScript
 model.remove(myEntity);
 ````

 We can also remove components by ID:

 ````JavaScript
 model.remove("myEntity");
 ````
 Note that if the Component is owned by the Model, where it was created like this:

 ````javascript
 var myComponent = new xeogl.Rotate(myModel, {... });
 ````

 then even after removing it, calling {{#crossLink "Model/destroyAll:method"}}destroyAll{{/crossLink}} on the
 Model will still destroy the component.

 ### Finding Models in Scenes

 Our Model will now be registered by ID on its Scene, so we can now find it like this:

 ````javascript
 model = xeogl.scene.models["myModel"];
 ````

 That's assuming that we've created the Model in the default xeogl Scene, which we did for these examples.

 ### Finding Components in Models

 Our Model now has various components within itself, which we can find by their IDs.

 To find the components grouped by their types, drop this expression into the browser's JavaScript
 debug console (we're using Chrome here):

 ````
 model.types;
 ````

 The result is the value of the Model's {{#crossLink "Model/types:property"}}types{{/crossLink}} map, which
 contains its components, mapped to their types:

 <img src="../../../assets/images/screenshots/Model_findingComponents.png"></img>

 Here we've expanded the {{#crossLink "PhongMaterial"}}{{/crossLink}} components, and we can see
 our {{#crossLink "PhongMaterial"}}{{/crossLink}}.

 Let's get that {{#crossLink "PhongMaterial"}}{{/crossLink}} from our Model's
 {{#crossLink "Model/components:property"}}{{/crossLink}} map and change its diffuse color:

 ```` JavaScript
 var material = model.components["myMaterial"];
 material.diffuse = [0.9, 0.4, 0.4];
 ````

 The Model also has an {{#crossLink "Model/entities:property"}}{{/crossLink}} map, in which we can find our {{#crossLink "Entity"}}{{/crossLink}}:

 <img src="../../../assets/images/screenshots/Model.entities.png"></img>

 ### Transforming a Model

 A Model lets us transform its Entities as a group.

 We can attach a modeling {{#crossLink "Transform"}}{{/crossLink}} to our Model, as a either a
 configuration object or a component instance:

 ```` Javascript
 // Attach transforms as a configuration object:
 model.transform = {
        type: "xeogl.Translate",
        xyz: [-35, 0, 0],
        parent: {
            type: "xeogl.Rotate",
            xyz: [0, 1, 0],
            angle: 45
        }
     };

 // Attach our own transform instances:
 model.transform = new xeogl.Translate({
        xyz: [-35, 0, 0],
        parent: new xeogl.Rotate({
            xyz: [0, 1, 0],
            angle: 45
        })
     });
 ````

 We can also provide the {{#crossLink "Transform"}}{{/crossLink}} to the Model constructor, as either configuration
 objects or instances.

 Here we'll provide them as configuration objects:

 ```` Javascript
 // Model internally instantiates our transform components:
 var model3 = new xeogl.Model({
        transform: {
            type: "xeogl.Translate",
            xyz: [-35, 0, 0],
            parent: {
                type: "xeogl.Rotate",
                xyz: [0, 1, 0],
                angle: 45
            }
        }
     });

 ````

 Note that, as with the components we added before, the Model will manage the lifecycles of our {{#crossLink "Transform"}}{{/crossLink}} components,
 destroying them when we destroy the Model or call its {{#crossLink "Model/destroyAll:method"}}{{/crossLink}} method. Also, when we call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on a Model component, the component will remove itself from the Model first.

 ### Getting the World-space boundary of a Model

 Get the World-space axis-aligned boundary of a MOdel like this:

 ```` Javascript
 model.on("boundary", function() {
    var aabb = model.aabb; //  [xmin, ymin,zmin,xmax,ymax, zmax]
    //...
 });
 ````

 We can also subscribe to changes to that boundary, which will happen whenever

 * the Model's {{#crossLink "Transform"}}{{/crossLink}} is updated,
 * components are added or removed from the Model, or
 * the {{#crossLink "Geometry"}}Geometries{{/crossLink}} or {{#crossLink "Transform"}}Transforms{{/crossLink}} of its Entities are switched or modified.

 ````javascript
 model.on("boundary", function() {
    var aabb = model.aabb; // [xmin, ymin,zmin,xmax,ymax, zmax]
 });
 ````

 ### Clearing a Model

 ```` Javascript
 model.clear();
 ````

 ### Destroying a Model

 ```` Javascript
 model.destroy();
 ````


 @class Model
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ModelModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ModelModel.
 @param [cfg.flattenTransforms=true] {Boolean} Flattens transform hierarchies to improve rendering performance.
 @param [cfg.ghosted=false] {Boolean} When true, sets all the Model's Entities initially ghosted.
 @param [cfg.highlighted=false] {Boolean} When true, sets all the Model's Entities initially highlighted.
 @param [cfg.outlined=false] {Boolean} When true, sets all the Model's Entities initially outlined.
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this Model.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Model. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the Model attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @param [cfg.components] {Array} Array of {{#crossLink "Components"}}{{/crossLink}} to add initially, given as IDs, configuration objects or instances.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Model = xeogl.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.Model",

        _init: function (cfg) {

            /**
             * The {{#crossLink "Components"}}{{/crossLink}} within this Model, mapped to their IDs.
             *
             * Fires an {{#crossLink "Model/updated:event"}}{{/crossLink}} event on change.
             *
             * @property components
             * @type {{String:Component}}
             */
            this.components = {};

            /**
             * The number of {{#crossLink "Components"}}{{/crossLink}} within this Model.
             *
             * @property numComponents
             * @type Number
             */
            this.numComponents = 0;

            /**
             * A map of maps; for each {{#crossLink "Component"}}{{/crossLink}} type in this Model,
             * a map to IDs to {{#crossLink "Component"}}{{/crossLink}} instances, eg.
             *
             * ````
             * "xeogl.Geometry": {
             *   "alpha": <xeogl.Geometry>,
             *   "beta": <xeogl.Geometry>
             * },
             * "xeogl.Rotate": {
             *   "charlie": <xeogl.Rotate>,
             *   "delta": <xeogl.Rotate>,
             *   "echo": <xeogl.Rotate>,
             * },
             * //...
             * ````
             *
             * @property types
             * @type {String:{String:xeogl.Component}}
             */
            this.types = {};

            /**
             * The {{#crossLink "Entity"}}Entity{{/crossLink}} component instances within this Model, mapped to their IDs.
             *
             * @property entities
             * @type {{String:Entity}}
             */
            this.entities = {};

            // Subscriptions to "destroyed" events from components
            this._onDestroyed = {};

            // Subscriptions to "boundary" events from Entities
            this._onBoundary = {};

            this._aabb = xeogl.math.AABB3();

            this._aabbDirty = false;

            // Dummy transform to make it easy to graft user-supplied transforms above added entities
            this._dummyRootTransform = this.create({
                type: "xeogl.Transform",
                meta: "dummy"
            });

            this.transform = cfg.transform;

            this.ghosted = cfg.ghosted || cfg.ghost; // Backwards compat
            this.highlighted = cfg.highlighted;
            this.visible = cfg.visible;
            this.culled = cfg.culled;
            this.outlined = cfg.outlined;
            this.selected = cfg.selected;

            if (cfg.components) {
                var components = cfg.components;
                for (var i = 0, len = components.length; i < len; i++) {
                    this.add(components[i]);
                }
            }
        },

        /**
         * Adds a {{#crossLink "Component"}}Component{{/crossLink}} or subtype to this Model.
         *
         * The {{#crossLink "Component"}}Component(s){{/crossLink}} may be specified by ID, instance, JSON definition or type.
         *
         * See class comment for usage examples.
         *
         * The {{#crossLink "Component"}}Components{{/crossLink}} must be in the same {{#crossLink "Scene"}}{{/crossLink}} as this Model.
         *
         * Fires an {{#crossLink "Model/added:event"}}{{/crossLink}} event.
         *
         * @method add
         * @param {Number|String|*|Component} component ID, definition or instance of a {{#crossLink "Component"}}Component{{/crossLink}} type or subtype.
         */
        add: function (component) {

            var componentId;
            var types;

            if (xeogl._isNumeric(component) || xeogl._isString(component)) {

                if (this.scene.types[component]) {

                    // Component type

                    var type = component;

                    types = this.scene.types[type];

                    if (!types) {
                        this.warn("Component type not found: '" + type + "'");
                        return;
                    }

                    for (componentId in types) {
                        if (types.hasOwnProperty(componentId)) {
                            this.add(types[componentId]);
                        }
                    }

                    return;

                } else {

                    // Component ID

                    component = this.scene.components[component];

                    if (!component) {
                        this.warn("Component not found: " + xeogl._inQuotes(component));
                        return;
                    }
                }

            } else if (xeogl._isObject(component)) {

                // Component config given

                var type = component.type || "xeogl.Component";

                if (!xeogl._isComponentType(type)) {
                    this.error("Not a xeogl component type: " + type);
                    return;
                }

                component = new window[type](this.scene, component);
            }

            if (component.scene !== this.scene) {

                // Component in wrong Scene

                this.warn("Attempted to add component from different xeogl.Scene: " + xeogl._inQuotes(component.id));
                return;
            }

            // Add component to this map

            if (this.components[component.id]) {

                // Component already in this Model
                return;
            }

            this.components[component.id] = component;

            // Register component for its type

            types = this.types[component.type];

            if (!types) {
                types = this.types[component.type] = {};
            }

            types[component.id] = component;

            this.numComponents++;

            // Remove component when it's destroyed

            var self = this;

            this._onDestroyed[component.id] = component.on("destroyed", function () {
                self.remove(component);
            });

            if (component.isType("xeogl.Entity")) {

                // Insert the dummy transform above
                // each entity we just loaded

                var rootTransform = component.transform;

                if (!rootTransform || rootTransform.id === "default.transform") {

                    component.transform = self._dummyRootTransform;

                } else {

                    while (rootTransform.parent) {

                        if (rootTransform.id === self._dummyRootTransform.id) {

                            // Since transform hierarchies may contain
                            // transforms that share the same parents, there is potential to find
                            // our dummy root transform while walking up an entity's transform
                            // path, when that path is joins a path that belongs to an Entity that
                            // we processed earlier

                            break;
                        }

                        rootTransform = rootTransform.parent;
                    }

                    if (rootTransform.id !== self._dummyRootTransform.id) {
                        rootTransform.parent = self._dummyRootTransform;
                    }
                }

                this.entities[component.id] = component;

                component.ghosted = this.ghosted;
                component.highlighted = this.highlighted;
                component.visible = this.visible;
                component.culled = this.culled;
                component.selected = this.selected;

                this._onBoundary[component.id] = component.on("boundary", this._setAABBDirty, this);

                this._setAABBDirty();
            }

            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is added to this {{#crossLink "Model"}}{{/crossLink}}.
             * @event added
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was added.
             */
            this.fire("added", component);

            if (!this._dirty) {
                this._needUpdate();
            }

            return component;
        },

        _needUpdate: function () {
            if (!this._dirty) {
                this._dirty = true;
                xeogl.scheduleTask(this._notifyUpdated, this);
            }
        },

        _notifyUpdated: function () {

            /* Fired on the next {{#crossLink "Scene/tick.animate:event"}}{{/crossLink}} whenever
             * {{#crossLink "Component"}}Components{{/crossLink}} were added or removed since the
             * last {{#crossLink "Scene/tick.animate:event"}}{{/crossLink}} event, to provide a batched change event
             * for subscribers who don't want to react to every individual addition or removal on this Model.
             *
             * @event updated
             */
            this.fire("updated");

            if (!this._aabbDirty) {
                this._setAABBDirty();
            }

            this._dirty = false;
        },

        /**
         * Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
         *
         * @method destroyAll
         */
        destroyAll: function () {

            // For efficiency, destroy Entities first to avoid
            // xeogl's automatic default component substitutions

            var type;
            var list = [];
            var components;
            var component;
            var id;

            for (type in this.types) {
                if (this.types.hasOwnProperty(type)) {
                    components = this.types[type];
                    for (id in components) {
                        if (components.hasOwnProperty(id)) {
                            component = components[id];
                            if (component.isType("xeogl.Entity")) {
                                list.push(component);
                            } else {
                                list.unshift(component);
                            }
                        }
                    }
                }
            }

            while (list.length > 0) {
                list.pop().destroy();
            }
        },
        /**
         * Removes all {{#crossLink "Component"}}Components{{/crossLink}} from this Model.
         *
         * @method removeAll
         */
        removeAll: function () {

            this.iterate(function (component) {
                component.destroy();
            });
        },

        /**
         * Removes a {{#crossLink "Component"}}{{/crossLink}} from this model, without destroying it.
         *
         * Note that if the Component is owned by the Model, where it was created like this:
         *
         * ````javascript
         * var myComponent = new xeogl.Rotate(myModel, {... });
         * ````
         *
         * then even after removing it, calling {{#crossLink "Model/destroyAll:method"}}destroyAll{{/crossLink}} on the
         * Model will still destroy the component.
         *
         * @param component
         */
        remove: function (component) {

            if (xeogl._isNumeric(component) || xeogl._isString(component)) {

                var id = component;

                // Component ID

                component = this.scene.components[id];

                if (!component) {
                    this.warn("Component not found in Scene: " + id);
                    return;
                }

                component = this.components[id];

                if (!component) {
                    this.warn("Component " + id + " is not in this Model");
                    return;
                }
            } else {

                if (component.scene !== this.scene) {
                    this.warn("Attempted to remove component that's not in same xeogl.Scene: '" + component.id + "'");
                    return;
                }
            }

            this._remove(component);
        },

        _remove: function (component) {

            var componentId = component.id;

            delete this.components[componentId];
            delete this.entities[componentId];

            // Unsubscribe from component destruction

            component.off(this._onDestroyed[componentId]);
            delete this._onDestroyed[componentId];

            // Unregister component for its type

            var types = this.types[component.type];

            if (types) {
                delete types[component.id];
            }

            this.numComponents--;

            //

            if (component.isType("xeogl.Entity")) {
                component.off(this._onBoundary[component.id]);
                delete this._onBoundary[component.id];
            }

            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is removed from this {{#crossLink "Model"}}{{/crossLink}}.
             * @event removed
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was removed.
             */
            this.fire("removed", component);

            if (!this._dirty) {
                this._needUpdate();
            }
        },

        /**
         * Iterates with a callback over the {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
         *
         * @method iterate
         * @param {Function} callback Callback called for each {{#crossLink "Component"}}{{/crossLink}}.
         * @param {Object} [scope=this] Optional scope for the callback, defaults to this Model.
         */
        iterate: function (callback, scope) {
            scope = scope || this;
            var components = this.components;
            for (var componentId in components) {
                if (components.hasOwnProperty(componentId)) {
                    callback.call(scope, components[componentId]);
                }
            }
        },

        _props: {

            /**
             * The Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} attached to this Model.
             *
             * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Model.
             *
             * Internally, the given {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most
             * {{#crossLink "Transform"}}Transform{{/crossLink}} that the Model attaches to
             * its {{#crossLink "Entity"}}Entities{{/crossLink}}.
             *
             * Fires an {{#crossLink "Model/transform:event"}}{{/crossLink}} event on change.
             *
             * @property transform
             * @type Transform
             */
            transform: {

                set: function (value) {

                    /**
                     * Fired whenever this Model's {{#crossLink "Model/transform:property"}}{{/crossLink}} property changes.
                     *
                     * @event transform
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "transform",
                        type: "xeogl.Transform",
                        component: value,
                        sceneDefault: false,
                        onAttached: {
                            callback: this._transformUpdated,
                            scope: this
                        }
                    });
                },

                get: function () {
                    return this._attached.transform;
                }
            },

            /**
             * World-space axis-aligned 3D boundary (AABB) of this Model.
             *
             * The AABB is represented by a six-element Float32Array containing the min/max extents of the
             * axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.
             *
             * @property aabb
             * @final
             * @type {Float32Array}
             */
            aabb: {

                get: function () {

                    if (this._aabbDirty) {

                        var xmin = xeogl.math.MAX_DOUBLE;
                        var ymin = xeogl.math.MAX_DOUBLE;
                        var zmin = xeogl.math.MAX_DOUBLE;
                        var xmax = -xeogl.math.MAX_DOUBLE;
                        var ymax = -xeogl.math.MAX_DOUBLE;
                        var zmax = -xeogl.math.MAX_DOUBLE;

                        var aabb;

                        var entities = this.entities;

                        for (var entityId in entities) {
                            if (entities.hasOwnProperty(entityId)) {

                                aabb = entities[entityId].aabb;

                                if (aabb[0] < xmin) {
                                    xmin = aabb[0];
                                }
                                if (aabb[1] < ymin) {
                                    ymin = aabb[1];
                                }
                                if (aabb[2] < zmin) {
                                    zmin = aabb[2];
                                }
                                if (aabb[3] > xmax) {
                                    xmax = aabb[3];
                                }
                                if (aabb[4] > ymax) {
                                    ymax = aabb[4];
                                }
                                if (aabb[5] > zmax) {
                                    zmax = aabb[5];
                                }
                            }
                        }

                        this._aabb[0] = xmin;
                        this._aabb[1] = ymin;
                        this._aabb[2] = zmin;
                        this._aabb[3] = xmax;
                        this._aabb[4] = ymax;
                        this._aabb[5] = zmax;

                        this._aabbDirty = false;
                    }

                    return this._aabb;
                }
            },

            /**
             Indicates whether this Model's Entities are visible or not.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {
                    value = value !== false;
                    this._visible = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].visible = value;
                        }
                    }
                },

                get: function () {
                    return this._visible;
                }
            },

            /**
             Indicates whether this Model's Entities are culled or not.

             @property culled
             @default false
             @type Boolean
             */
            culled: {

                set: function (value) {
                    value = !!value;
                    this._culled = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].culled = value;
                        }
                    }
                },

                get: function () {
                    return this._culled;
                }
            },

            /**
             * Flag which indicates if this Model's Entities are rendered with ghosted effect.
             *
             * @property ghosted
             * @default false
             * @type Boolean
             */
            "ghosted,ghost": {

                set: function (value) {
                    value = !!value;
                    this._ghosted = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].ghosted = value;
                        }
                    }
                },

                get: function () {
                    return this._ghosted;
                }
            },

            /**
             * Flag which indicates if this Model's Entities are rendered with highlighted effect.
             *
             * @property highlighted
             * @default false
             * @type Boolean
             */
            "highlight,highlighted": {

                set: function (value) {
                    value = !!value;
                    this._highlighted = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].highlighted = value;
                        }
                    }
                },

                get: function () {
                    return this._highlighted;
                }
            },

            /**
             * Flag which indicates if this Model's Entities are rendered as selected.
             *
             * @property selected
             * @default false
             * @type Boolean
             */
            selected: {

                set: function (value) {
                    value = !!value;
                    this._selected = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].selected = value;
                        }
                    }
                },

                get: function () {
                    return this._selected;
                }
            },

            /**
             * Flag which indicates if this Model's Entities are rendered with outlined effect.
             *
             * @property outlined
             * @default false
             * @type Boolean
             */
            "outlined,outline": {

                set: function (value) {
                    value = !!value;
                    this._outlined = value;
                    for (var id in this.entities) {
                        if (this.entities.hasOwnProperty(id)) {
                            this.entities[id].outlined = value;
                        }
                    }
                },

                get: function () {
                    return this._outlined;
                }
            }
        },

        _transformUpdated: function (transform) {
            this._dummyRootTransform.parent = transform;
            this._setAABBDirty();
        },

        _setAABBDirty: function () {
            if (this._aabbDirty) {
                return;
            }
            this._aabbDirty = true;

            /**
             Fired whenever this Model's World-space boundary changes.

             Get the latest boundary from the Model's {{#crossLink "Model/aabb:property"}}{{/crossLink}} property.

             @event boundary
             */
            this.fire("boundary");
        },

        _destroy: function () {
            this.removeAll();
        }
    });

})();