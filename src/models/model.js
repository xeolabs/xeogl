(function () {

    "use strict";

    /**
     A **Model** is a group of {{#crossLink "Component"}}Components{{/crossLink}} within a xeogl {{#crossLink "Scene"}}{{/crossLink}}.

     ## Overview

     * A Model manages the lifecycle of its components, automatically deleting them when the Model is deleted.
     * Can be attached to a hierarchy of {{#crossLink "Transform"}}Transforms{{/crossLink}}, to transform its components as a group, within World-space.
     * Provides the collective World-space boundary of its components as a {{#crossLink "Boundary3D"}}{{/crossLink}}, which
     updates its extents automatically as components are added and removed, or Transforms are updated.

     A Model is subclassed by (at least):

     * {{#crossLink "GLTFModel"}}{{/crossLink}}, which loads its components from glTF files.
     * {{#crossLink "SceneJSModel"}}{{/crossLink}}, which loads its components from SceneJS scene definitions.
     * {{#crossLink "BuildableModel"}}{{/crossLink}}, which provides a fluent API for building its components.

     <img src="../../../assets/images/Model.png"></img>

     ## Usage

     ### Adding and removing components to a Model

     When adding components to a Model, it's usually easiest to just add their configuration objects and let the Model
     internally instantiate them, as shown below.

     Note that a Model manages the lifecycles of all the components contained within it, destroying them when we destroy
     the Model or call its {{#crossLink "Model/destroyAll:method"}}{{/crossLink}} method.

     ````javascript
     var model = new xeogl.Model();

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

     As shown below, we can also add our own component instances, supplying either the objects or their IDs.

     Note that the components must be in the same {{#crossLink "Scene"}}{{/crossLink}} as the model.

     ````javascript
     // Add our component object
     model.add(new xeogl.Entity({
            geometry: geometry,
            material: material
        }));

     // Instantiate our component and add it by ID:
     var material2 = new xeogl.PhongMaterial({
            id: "myMaterial",
            diffuse: [0.4, 1.0, 9.0]
        });

     model.add("myMaterial");
     ````

     Since xeogl aims to be as declarative as possible, we can also add components immediately,
     via the Model's constructor:

     ````javascript
     // We can add components immediately, via the Model's
     var model2 = new xeogl.Model({
            components: [
                {
                    type: "xeogl.TorusGeometry"
                    id: "myTorusGeometry"
                },
                {
                    type: "xeogl.PhongMaterial"
                    id: "myTorusGeometry",
                    diffuse: [0.4, 0.4, 9.0]
                },
                {
                    type: "xeogl.Entity",
                    geometry: geometry,
                    material: "myPhongMaterial"
                }
            ]
        });
    ````

     ### Transforming a Model

     As well as allowing us organize the lifecycle of groups of components, a Model also lets us transform them as a group.

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

     We can also provide the transforms to the Model constructor, as either configuration objects or instances.

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

     Note that, as with the components we added before, the Model will manage the lifecycles of our transform components,
     destroying them when we destroy the Model or call its {{#crossLink "Model/destroyAll:method"}}{{/crossLink}} method.

     ### Getting the World-space boundary of a Model

     A Model's {{#crossLink "Model/worldBoundary:property"}}{{/crossLink}} property is a {{#crossLink "Boundary3D"}}{{/crossLink}}
     that provides the collective World-space boundary of all its components. The {{#crossLink "Boundary3D"}}{{/crossLink}} will
     automatically adjust its extents whenever we add or remove components to its Model, or whenever we update the Model's transforms.

     Let's get the {{#crossLink "Boundary3D"}}{{/crossLink}} from our first Model, subscribe to changes on its extents,
     then animate one of the Model's transforms, which will cause the {{#crossLink "Boundary3D"}}{{/crossLink}} to fire an
     {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}} each time its extents change:

     ```` Javascript
     var worldBoundary = model.worldBoundary;

     worldBoundary.on("updated", function() {
        obb = worldBoundary.obb;
        aabb = worldBoundary.aabb;
        center = worldBoundary.center;
        sphere = worldBoundary.sphere();
        //...
    });

     model.scene.on("tick", function() {
            model.transform.parent.angle += 0.2;
        });
     ````

     Since xeogl is all about lazy-execution to avoid needless work, the {{#crossLink "Boundary3D"}}{{/crossLink}} will
     only actually recompute its extents when we read its {{#crossLink "Boundary3D/obb:property"}}{{/crossLink}},
     {{#crossLink "Boundary3D/aabb:property"}}{{/crossLink}}, {{#crossLink "Boundary3D/center:property"}}{{/crossLink}},
      {{#crossLink "Boundary3D/center:property"}}{{/crossLink}} or
     {{#crossLink "Boundary3D/sphere:property"}}{{/crossLink}} properties.

     Also, the Model lazy-instantiates its {{#crossLink "Boundary3D"}}{{/crossLink}} the first time we reference
     the Model's {{#crossLink "Model/worldBoundary:property"}}{{/crossLink}} property. Since the {{#crossLink "Boundary3D"}}{{/crossLink}}
     is going to hang around in memory and fire {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}} events each time we add or
     remove components, or animate transforms, for efficiency we should destroy the {{#crossLink "Boundary3D"}}{{/crossLink}}
     as soon as we no longer need it.

     Finally, when we destroy a Model, it will also destroy its {{#crossLink "Boundary3D"}}{{/crossLink}}, if it
     currently has one.

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
     @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this Model.
     Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this Model. Internally, the given
     {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
     that the Model attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
     @param [cfg.components] {Array} Array of {{#crossLink "Components"}}{{/crossLink}} to add initially, given as IDs, configuration objects or instances.
     @extends Component
     */
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

            // Subscriptions to "destroyed" events from components
            this._onDestroyed = {};

            // Subscriptions to "updated" events from components' worldBoundaries
            this._onWorldBoundaryUpdated = {};

            this._aabbDirty = true;

            // Dummy transform to make it easy to graft user-supplied transforms above added entities
            this._dummyRootTransform = this.create({
                type: "xeogl.Transform",
                meta: "dummy"
            });

            this.transform = cfg.transform;

            if (cfg.components) {
                var components = cfg.components;
                for (var i = 0, len = components.length; i , len; i++) {
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

                    type = component;

                    types = this.scene.types[type];

                    if (!types) {
                        this.warn("Component type not found: '" + type + "'");
                        return;
                    }

                    for (componentId in types) {
                        if (types.hasOwnProperty(componentId)) {
                            this._add(types[componentId]);
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
                self._remove(component);
            });

            if (component.isType("xeogl.Entity")) {

                // Insert the dummy transform above
                // each entity we just loaded

                var rootTransform = component.transform;

                if (!rootTransform) {

                    component.transform = self._dummyRootTransform;

                } else {

                    while (rootTransform.parent) {

                        if (rootTransform.id === self._dummyRootTransform.id) {

                            // Since transform hierarchies may contain
                            // transforms that share the same parents, there is potential to find
                            // our dummy root transform while walking up an entity's transform
                            // path, when that path is joins a path that belongs to an Entity that
                            // we processed earlier

                            return;
                        }

                        rootTransform = rootTransform.parent;
                    }

                    if (rootTransform.id !== self._dummyRootTransform.id) {
                        rootTransform.parent = self._dummyRootTransform;
                    }
                }
            }

            if (component.worldBoundary) {
                this._onWorldBoundaryUpdated[component.id] = component.worldBoundary.on("updated", this._updated, this);
                if (!this._aabbDirty) {
                    this._setAABBDirty();
                }
            }

            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is added to this {{#crossLink "Model"}}{{/crossLink}}.
             * @event added
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was added.
             */
            this.fire("added", component);

            if (!this._dirty) {
                this._scheduleUpdate();
            }

            return component;
        },

        _scheduleUpdate: function () {
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
            this._dirty = false;
        },

        /**
         * Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
         *
         * @method destroyAll
         */
        destroyAll: function () {

            this.iterate(function (component) {
                component.destroy();
            });
        },

        /**
         * Removes all {{#crossLink "Component"}}Components{{/crossLink}} from this Model.
         *
         * @method removeAll
         */
        removeAll: function () {

            // this.iterate(function (component) {
            //     component.destroy();
            // });
        },

        _remove: function (component) {

            var componentId = component.id;

            if (component.scene !== this.scene) {
                this.warn("Attempted to remove component that's not in same xeogl.Scene: '" + componentId + "'");
                return;
            }

            delete this.components[componentId];

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

            if (component.worldBoundary) {
                component.worldBoundary.off(this._onWorldBoundaryUpdated[component.id]);
                delete this._onWorldBoundaryUpdated[component.id];
            }

            if (!this._aabbDirty) {
                this._setAABBDirty();
            }


            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is removed from this {{#crossLink "Model"}}{{/crossLink}}.
             * @event removed
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was removed.
             */
            this.fire("removed", component);

            if (!this._dirty) {
                this._scheduleUpdate();
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
             * World-space 3D boundary enclosing all the components in this Model.
             *
             * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
             * this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time you reference it.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._worldBoundary) {

                        var self = this;

                        this._worldBoundary = this.create({

                            type: "xeogl.Boundary3D",

                            getDirty: function () {
                                if (self._aabbDirty) {
                                    self._buildAABB();
                                    self._aabbDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getAABB: function () {
                                return self._aabb;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {
                                self._worldBoundary = null;
                            });
                    }

                    return this._worldBoundary;
                }
            }
        },

        _transformUpdated: function (transform) {
            this._dummyRootTransform.parent = transform;
        },

        _updated: function () {
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _setAABBDirty: function () {
            this._aabbDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
        },

        _buildAABB: function () {

            if (!this._aabb) {
                this._aabb = xeogl.math.AABB3();
            }

            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;

            var component;
            var worldBoundary;
            var aabb;

            var components = this.components;

            for (var componentId in components) {
                if (components.hasOwnProperty(componentId)) {

                    component = components[componentId];

                    worldBoundary = component.worldBoundary;

                    if (worldBoundary) {

                        aabb = worldBoundary.aabb;

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
            }

            this._aabb[0] = xmin;
            this._aabb[1] = ymin;
            this._aabb[2] = zmin;
            this._aabb[3] = xmax;
            this._aabb[4] = ymax;
            this._aabb[5] = zmax;
        },

        _destroy: function () {
            this.removeAll();
        }
    });

})();