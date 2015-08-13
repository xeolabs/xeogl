/**
 A **Group** is a subset of the {{#crossLink "Component"}}Components{{/crossLink}} within a {{#crossLink "Scene"}}{{/crossLink}}.

 ## Overview

 <ul>
 <li>Supports addition and removal of {{#crossLink "Component"}}Components{{/crossLink}} by instance, ID or type.</li>
 </ul>

 <img src="../../../assets/images/Group.png"></img>

 ## Example

 In this example we have:

 <ul>
 <li>a {{#crossLink "Material"}}{{/crossLink}},
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} (that is the default box shape),
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above,</li>
 <li>two {{#crossLink "Group"}}Groups{{/crossLink}}, each containing a subset of all our components.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var material = new XEO.PhongMaterial(scene, {
     id: "myMaterial",
     diffuse: [0.5, 0.5, 0.0]
 });

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var gameObject = new XEO.GameObject(scene, {
    id: "myObject",
    material: material,
    geometry: geometry
 });

 // Our first group contains the Material, added by ID,
 // plus the Geometry and GameObject, both added by instance.

 var group1 = new XEO.Group(scene, { // Initialize with three components
    components: [
        "myMaterial",
        geometry,
        gameObject
    ]
 });

 // Our second Group includes the geometry, added by instance,
 // and the GameObject, added by type. If there were more than
 // one GameObject in the scene, then that type would ensure
 // that all the GameObjects were in the Group.

 var group2 = new XEO.Group(scene);

 group2.add([  // Add two components
        geometry,
        "XEO.GameObject",
    ]);

 // We can iterate over the components in a Group like so:

 group1.iterate(
    function(component) {
        //..
    });

 // And remove components from a Group
 // by instance, ID or type:

 group1.remove("myMaterial"); // Remove one component by ID
 group1.remove([geometry, gameObject]); // Remove two components by instance

 group2.remove("XEO.Geometry"); // Remove all Geometries
 ````

 TODO

 @class Group
 @module XEO
 @submodule grouping
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Component} Optional map of user-defined metadata to attach to this Group.
 @param [cfg.components] {{Array of String|Component}} Array of {{#crossLink "Component"}}{{/crossLink}} IDs or instances.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Group = XEO.Component.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.Group",

        _init: function (cfg) {

            /**
             * The {{#crossLink "Components"}}{{/crossLink}} within this Group, mapped to their IDs.
             *
             * Fires an {{#crossLink "Group/updated:event"}}{{/crossLink}} event on change.
             *
             * @property components
             * @type {{String:Component}}
             */
            this.components = {};

            /**
             * The number of {{#crossLink "Components"}}{{/crossLink}} within this Group.
             *
             * @property numComponents
             * @type Number
             */
            this.numComponents = 0;

            /**
             * For each {{#crossLink "Component"}}Component{{/crossLink}} type, a map of
             * IDs to instances.
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
         * Adds one or more {{#crossLink "Component"}}Components{{/crossLink}}s to this Group.
         *
         * The {{#crossLink "Component"}}Component(s){{/crossLink}} may be specified by instance, ID or type.
         *
         * See class comment for usage examples.
         *
         * The {{#crossLink "Component"}}Components{{/crossLink}} must be in the same {{#crossLink "Scene"}}{{/crossLink}} as this Group.
         *
         * Fires an {{#crossLink "Group/updated:event"}}{{/crossLink}} event.
         *
         * @method add
         * @param {Array of Component} components Array of {{#crossLink "Component"}}Components{{/crossLink}} instances.
         */
        add: function (components) {

            components = XEO._isArray(components) ? components : [components];

            for (var i = 0, len = components.length; i < len; i++) {
                this._addComponent(components[i]);
            }
        },

        _addComponent: function (c) {

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
                            this._addComponent(types[componentId]);
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

            if (component.scene != this.scene) {

                // Component in wrong Scene

                this.warn("Attempted to add component from different XEO.Scene: " + XEO._inQuotes(component.id));
                return;
            }

            // Add component to this map

            this.components[component.id] = component;

            // Register component for its type

            types = this.types[component.type];

            if (!types) {
                types = this.types[type] = {};
            }

            types[component.id] = component;

            this.numComponents++;

            // Remove component when it's destroyed

            var self = this;

            this._destroyedSubs[component.id] = component.on("destroyed",
                function(component) {
                    self._removeComponent(component);
                });

            this.fire("added", component);
        },

        /**
         * Removes all {{#crossLink "Component"}}Components{{/crossLink}} from this Group.
         *
         * Fires an {{#crossLink "Group/updated:event"}}{{/crossLink}} event.
         *
         * @method clear
         */
        clear: function () {

            this.iterate(function (component) {
                this._removeComponent(component);
            });
        },

        /**
         * Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Group.
         *
         * @method destroyAll
         */
        destroyAll: function () {

            this.iterate(function (component) {
                component.destroy();
            });
        },

        /**
         * Removes one or more {{#crossLink "Component"}}Components{{/crossLink}} from this Group.
         *
         * The {{#crossLink "Component"}}Component(s){{/crossLink}} may be specified by instance, ID or type.
         *
         * See class comment for usage examples.
         *
         * Fires an {{#crossLink "Group/updated:event"}}{{/crossLink}} event.
         *
         * @method remove
         * @param {Array of Components} components Array of {{#crossLink "Component"}}Components{{/crossLink}} instances.
         */
        remove: function (components) {

            components = XEO._isArray(components) ? components : [components];

            for (var i = 0, len = components.length; i < len; i++) {
                this._removeComponent(components[i]);
            }
        },

        _removeComponent: function (component) {

            var componentId = component.id;

            if (component.scene != this.scene) {
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

            this.fire("removed", component);
        },

        /**
         * Iterates with a callback over the {{#crossLink "Component"}}Components{{/crossLink}} in this Group.
         *
         * @method withComponents
         * @param {Function} callback Callback called for each {{#crossLink "Component"}}{{/crossLink}}.
         */
        iterate: function (callback) {
            for (var componentId in this.components) {
                if (this.components.hasOwnProperty(componentId)) {
                    callback.call(this, this.components[componentId]);
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