/**
 A **Collection** is a set of {{#crossLink "Component"}}Components{{/crossLink}}.

 <ul>
 <li>A {{#crossLink "Component"}}Component{{/crossLink}} can be included in more than one Collection.</li>
 <li>{{#crossLink "Component"}}Components{{/crossLink}} can be added to a Collection by instance, ID or type.</li>
 <li>A Collection supports iteration over its {{#crossLink "Component"}}Components{{/crossLink}}.</li>
 <li>A {{#crossLink "Model"}}Model{{/crossLink}} stores the {{#crossLink "Component"}}Components{{/crossLink}} it has loaded in a Collection.</li>
 <li>A {{#crossLink "CollectionBoundary"}}CollectionBoundary{{/crossLink}} provides a World-space {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses a Collection.</li>
 </ul>

 <img src="../../../assets/images/Collection.png"></img>

 ## Creating Collections

 Our first Collection contains a {{#crossLink "PhongMaterial"}}{{/crossLink}}, added by ID, plus a {{#crossLink "BoxGeometry"}}{{/crossLink}} and
 an {{#crossLink "Entity"}}{{/crossLink}}, both added by instance.

 ````javascript
 var material = new XEO.PhongMaterial({
     id: "myMaterial",
     diffuse: [0.5, 0.5, 0.0]
 });

 var geometry = new XEO.BoxGeometry();

 var Entity = new XEO.Entity({
    id: "myEntity",
    material: material,
    geometry: geometry
 });

 var collection1 = new XEO.Collection({ // Initialize with the three components
    components: [
        "myMaterial",
        geometry,
        myEntity
    ]
 });
 ````
 Our second Collection includes the {{#crossLink "BoxGeometry"}}{{/crossLink}}, added by instance,
 and the {{#crossLink "Entity"}}{{/crossLink}}, added by type. If there were more than
 one {{#crossLink "Entity"}}{{/crossLink}} in the scene, then that type would ensure
 that all the {{#crossLink "Entity"}}Entities{{/crossLink}} were in the Collection.

 ````javascript
 var collection2 = new XEO.Collection();

 collection2.add([  // Add two components
    geometry,
    "XEO.Entity",
 ]);
 ````

 ## Accessing Components

 Iterate over the components in a Collection using the convenience iterator:

 ````javascript
 collection1.iterate(function(component) {
     if (component.isType("XEO.Entity")) {
         this.log("Found the Entity: " + component.id);
     }
     //..
 });
 ````

 A Collection also registers its components by type:

 ````javascript
 var entities = collection1.types["XEO.Entity"];
 var theEntity = entities["myEntity"];
 ````

 ## Removing Components

 We can remove components from a Collection by instance, ID or type:

 ````javascript
 collection1.remove("myMaterial"); // Remove one component by ID
 collection1.remove([geometry, myEntity]); // Remove two components by instance
 collection2.remove("XEO.Geometry"); // Remove all Geometries
 ````

 ## Getting the boundary of a Collection

 A {{#crossLink "CollectionBoundary"}}{{/crossLink}} provides a {{#crossLink "Boundary3D"}}{{/crossLink}} that
 dynamically fits to the collective World-space boundary of all the Components in a Collection.

 ````javascript
 var collectionBoundary = new XEO.CollectionBoundary({
    collection: collection1
 });

 var worldBoundary = collectionBoundary.worldBoundary;
 ````
 The {{#crossLink "Boundary3D"}}{{/crossLink}}
 will automatically update whenever we add, remove or update any Components that have World-space boundaries. We can subscribe
 to updates on it like so:

 ````javascript
 worldBoundary.on("updated", function() {
     obb = worldBoundary.obb;
     aabb = worldBoundary.aabb;
     center = worldBoundary.center;
     //...
 });
 ````

 Now, if we now re-insert our {{#crossLink "Entity"}}{{/crossLink}} into to our Collection,
 the {{#crossLink "Boundary3D"}}{{/crossLink}} will fire our update handler.

 ````javascript
 collection1.add(myEntity);
 ````


 @class Collection
 @module XEO
 @submodule collections
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Component} Optional map of user-defined metadata to attach to this Collection.
 @param [cfg.components] {{Array of String|Component}} Array of {{#crossLink "Component"}}{{/crossLink}} IDs or instances.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Collection = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.Collection",

        _init: function (cfg) {

            /**
             * The {{#crossLink "Components"}}{{/crossLink}} within this Collection, mapped to their IDs.
             *
             * Fires an {{#crossLink "Collection/updated:event"}}{{/crossLink}} event on change.
             *
             * @property components
             * @type {{String:Component}}
             */
            this.components = {};

            /**
             * The number of {{#crossLink "Components"}}{{/crossLink}} within this Collection.
             *
             * @property numComponents
             * @type Number
             */
            this.numComponents = 0;

            /**
             * A map of maps; for each {{#crossLink "Component"}}{{/crossLink}} type in this Collection,
             * a map to IDs to {{#crossLink "Component"}}{{/crossLink}} instances, eg.
             *
             * ````
             * "XEO.Geometry": {
             *   "alpha": <XEO.Geometry>,
             *   "beta": <XEO.Geometry>
             * },
             * "XEO.Rotate": {
             *   "charlie": <XEO.Rotate>,
             *   "delta": <XEO.Rotate>,
             *   "echo": <XEO.Rotate>,
             * },
             * //...
             * ````
             *
             * @property types
             * @type {String:{String:XEO.Component}}
             */
            this.types = {};

            // Subscriptions to "destroyed" events from components
            this._destroyedSubs = {};

            if (cfg.components) {
                this.add(cfg.components);
            }
        },

        /**
         * Adds one or more {{#crossLink "Component"}}Components{{/crossLink}}s to this Collection.
         *
         * The {{#crossLink "Component"}}Component(s){{/crossLink}} may be specified by instance, ID or type.
         *
         * See class comment for usage examples.
         *
         * The {{#crossLink "Component"}}Components{{/crossLink}} must be in the same {{#crossLink "Scene"}}{{/crossLink}} as this Collection.
         *
         * Fires an {{#crossLink "Collection/added:event"}}{{/crossLink}} event.
         *
         * @method add
         * @param {Array of Component} components Array of {{#crossLink "Component"}}Components{{/crossLink}} instances.
         */
        add: function (components) {

            components = XEO._isArray(components) ? components : [components];

            for (var i = 0, len = components.length; i < len; i++) {
                this._add(components[i]);
            }
        },

        _add: function (c) {

            var componentId;
            var component;
            var type;
            var types;

            if (c.type) {

                // Component instance

                component = c;

            } else if (XEO._isNumeric(c) || XEO._isString(c)) {

                if (this.scene.types[c]) {

                    // Component type

                    type = c;

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

                    component = this.scene.components[c];

                    if (!component) {
                        this.warn("Component not found: " + XEO._inQuotes(c));
                        return;
                    }
                }

            } else {

                return;
            }

            if (component.scene !== this.scene) {

                // Component in wrong Scene

                this.warn("Attempted to add component from different XEO.Scene: " + XEO._inQuotes(component.id));
                return;
            }

            // Add component to this map

            if (this.components[component.id]) {

                // Component already in this Collection
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

            this._destroyedSubs[component.id] = component.on("destroyed",
                function (component) {
                    self._remove(component);
                });

            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is added to this {{#crossLink "Collection"}}{{/crossLink}}.
             * @event added
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was added.
             */
            this.fire("added", component);

            if (!this._dirty) {
                this._scheduleUpdate();
            }
        },

        _scheduleUpdate: function () {
            if (!this._dirty) {
                this._dirty = true;
                XEO.scheduleTask(this._notifyUpdated, this);
            }
        },

        _notifyUpdated: function () {

            /* Fired on the next {{#crossLink "Scene/tick.animate:event"}}{{/crossLink}} whenever
             * {{#crossLink "Component"}}Components{{/crossLink}} were added or removed since the
             * last {{#crossLink "Scene/tick.animate:event"}}{{/crossLink}} event, to provide a batched change event
             * for subscribers who don't want to react to every individual addition or removal on this Collection.
             *
             * @event updated
             */
            this.fire("updated");
            this._dirty = false;
        },

        /**
         * Removes all {{#crossLink "Component"}}Components{{/crossLink}} from this Collection.
         *
         * Fires an {{#crossLink "Collection/updated:event"}}{{/crossLink}} event.
         *
         * @method clear
         */
        clear: function () {

            this.iterate(function (component) {
                this._remove(component);
            });
        },

        /**
         * Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Collection.
         *
         * @method destroyAll
         */
        destroyAll: function () {

            this.iterate(function (component) {
                component.destroy();
            });
        },

        /**
         * Removes one or more {{#crossLink "Component"}}Components{{/crossLink}} from this Collection.
         *
         * The {{#crossLink "Component"}}Component(s){{/crossLink}} may be specified by instance, ID or type.
         *
         * See class comment for usage examples.
         *
         * Fires a {{#crossLink "Collection/removed:event"}}{{/crossLink}} event.
         *
         * @method remove
         * @param {Array of Components} components Array of {{#crossLink "Component"}}Components{{/crossLink}} instances.
         */
        remove: function (components) {

            components = XEO._isArray(components) ? components : [components];

            for (var i = 0, len = components.length; i < len; i++) {
                this._remove(components[i]);
            }
        },

        _remove: function (component) {

            var componentId = component.id;

            if (component.scene !== this.scene) {
                this.warn("Attempted to remove component that's not in same XEO.Scene: '" + componentId + "'");
                return;
            }

            delete this.components[componentId];

            // Unsubscribe from component destruction

            component.off(this._destroyedSubs[componentId]);

            delete this._destroyedSubs[componentId];

            // Unregister component for its type

            var types = this.types[component.type];

            if (types) {
                delete types[component.id];
            }

            this.numComponents--;

            /**
             * Fired whenever an individual {{#crossLink "Component"}}{{/crossLink}} is removed from this {{#crossLink "Collection"}}{{/crossLink}}.
             * @event removed
             * @param value {Component} The {{#crossLink "Component"}}{{/crossLink}} that was removed.
             */
            this.fire("removed", component);

            if (!this._dirty) {
                this._scheduleUpdate();
            }
        },

        /**
         * Iterates with a callback over the {{#crossLink "Component"}}Components{{/crossLink}} in this Collection.
         *
         * @method iterate
         * @param {Function} callback Callback called for each {{#crossLink "Component"}}{{/crossLink}}.
         * @param {Object} [scope=this] Optional scope for the callback, defaults to this Collection.
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

        _getJSON: function () {

            var componentIds = [];

            for (var componentId in this.components) {
                if (this.components.hasOwnProperty(componentId)) {
                    componentIds.push(this.components[componentId].id); // Don't convert numbers into strings
                }
            }

            return {
                components: componentIds
            };
        },

        _destroy: function () {

            this.clear();
        }
    });

})();