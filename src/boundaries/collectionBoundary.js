/**
 A **CollectionBoundary** provides the World-space boundary of the components within a {{#crossLink "Collection"}}{{/crossLink}}.

 <ul>
 <li>A CollectionBoundary provides its boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.</li>
 <li>The {{#crossLink "Boundary3D"}}{{/crossLink}} dynamically fits to the collective boundary of components
 that provide their own World-space {{#crossLink "Boundary3D"}}Boundar3Ds{{/crossLink}}.</li>
 <li>The {{#crossLink "Boundary3D"}}{{/crossLink}} automatically resizes whenever we add or remove components that
 have World-space {{#crossLink "Boundary3D"}}Boundary3Ds{{/crossLink}}, or whenever
 we cause those components to update their {{#crossLink "Boundary3D"}}Boundary3Ds{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/CollectionBoundary.png"></img>

 ## Examples

 <ul>
 <li>[Visualizing a CollectionBoundary](../../examples/#boundaries_CollectionBoundary)</li>
 <li>[Visualizing a CollectionBoundary hierarchy](../../examples/#boundaries_CollectionBoundary_hierarchy)</li>
 </ul>

 ## Usage

 Let's create a {{#crossLink "Collection"}}{{/crossLink}} that contains two {{#crossLink "Entity"}}Entities{{/crossLink}}:

 ````javascript
 var entity = new xeogl.Entity({
        geometry: new xeogl.BoxGeometry(),
        transform: new xeogl.Translate({
            xyz: [-5, 0, 0]
        })
  });

 var entity2 = new xeogl.Entity({
        geometry: new xeogl.BoxGeometry(),
        transform: new xeogl.Translate({
            xyz: [0, -5, 0]
        })
  });

 var collection = new xeogl.Collection({
    components: [
        entity1,
        entity2
    ]
 });
 ````
 Now we'll create a {{#crossLink "CollectionBoundary"}}{{/crossLink}} that provides
 a World-space {{#crossLink "Boundary3D"}}{{/crossLink}} that will dynamically fit to the collective World-space boundary of
 the {{#crossLink "Entity"}}Entities{{/crossLink}}:

 ````javascript
 var collectionBoundary = new xeogl.CollectionBoundary({
    collection: collection1
 });

 var worldBoundary = collectionBoundary.worldBoundary;
 ````
 The {{#crossLink "Boundary3D"}}{{/crossLink}}
 will automatically update whenever we add, remove or update any Components within the {{#crossLink "Collection"}}{{/crossLink}}
 that have World-space boundaries.

 We can subscribe to updates on it like so:

 ````javascript
 worldBoundary.on("updated", function() {
     obb = worldBoundary.obb;
     aabb = worldBoundary.aabb;
     center = worldBoundary.center;
     //...
 });
 ````

 Now, if we now remove one of our {{#crossLink "Entity"}}Entities{{/crossLink}} from our {{#crossLink "Collection"}}{{/crossLink}},
 the {{#crossLink "Boundary3D"}}{{/crossLink}} will fire our update handler:

 ````javascript
 collection1.add(myEntity);
 ````

 @class CollectionBoundary
 @module xeogl
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this CollectionBoundary within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} CollectionBoundary configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CollectionBoundary.
 @param [cfg.collection=null] {Collection} A {{#crossLink "Collection"}}Collection{{/crossLink}} to fit the {{#crossLink "CollectionBoundary/worldBoundary:property"}}{{/crossLink}} to. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CollectionBoundary.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CollectionBoundary = xeogl.Component.extend({

        type: "xeogl.CollectionBoundary",

        _init: function (cfg) {

            this._onAdded = {};
            this._onUpdated = {};
            this._onRemoved = {};

            this._aabb = null;
            this._aabbDirty = false;
            this._worldBoundary = null;

            this.collection = cfg.collection;
        },

        _props: {

            /**
             * The {{#crossLink "Collection"}}{{/crossLink}} attached to this CollectionBoundary.
             *
             * Fires a {{#crossLink "CollectionBoundary/collection:event"}}{{/crossLink}} event on change.
             *
             * @property collection
             * @type Collection
             */
            collection: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "collection",
                        type: "xeogl.Collection",
                        component: value, // Converts value from ID to instance if necessary
                        on: {
                            added: function (component) {
                                self._added(component);
                            },
                            removed: function (component) {
                                self._removed(component);
                            }
                        },
                        onAttached: function (collection) {
                            collection.iterate(self._bind, self);
                            self._setAABBDirty();
                        },
                        onDetached: function (collection) {
                            collection.iterate(self._unbind, self);
                        }
                    });

                    this._setAABBDirty();
                },

                get: function () {
                    return this._attached.collection;
                }
            },

            /**
             * World-space 3D boundary enclosing all the components contained in {{#crossLink "CollectionBoundary/collection:property"}}{{/crossLink}}.
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

                        this._worldBoundary = new xeogl.Boundary3D(this.scene, {

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

        _added: function (c) {
            if (c.worldBoundary) {
                this._bind(c);
            }
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _removed: function (c) {
            if (c.worldBoundary) {
                this._unbind(c);
            }
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _bind: function (c) {
            var worldBoundary = c.worldBoundary;
            if (!worldBoundary) {
                return;
            }
            this._onUpdated[c.id] = worldBoundary.on("updated", this._updated, this);
        },

        _updated: function () {
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _unbind: function (c) {
            var worldBoundary = c.worldBoundary;
            if (!worldBoundary) {
                return;
            }
            worldBoundary.off(this._onUpdated[c.id]);
            delete this._onUpdated[c.id];
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
            var min;
            var max;

            var collection = this.collection;

            if (collection) {

                var components = collection.components;

                for (var componentId in components) {
                    if (components.hasOwnProperty(componentId)) {

                        component = components[componentId];

                        worldBoundary = component.worldBoundary;
                        if (worldBoundary) {

                            aabb = worldBoundary.aabb;
                            min = aabb.min;
                            max = aabb.max;

                            if (min[0] < xmin) {
                                xmin = min[0];
                            }

                            if (min[1] < ymin) {
                                ymin = min[1];
                            }

                            if (min[2] < zmin) {
                                zmin = min[2];
                            }

                            if (max[0] > xmax) {
                                xmax = max[0];
                            }

                            if (max[1] > ymax) {
                                ymax = max[1];
                            }

                            if (max[2] > zmax) {
                                zmax = max[2];
                            }
                        }
                    }
                }
            }

            this._aabb.min[0] = xmin;
            this._aabb.min[1] = ymin;
            this._aabb.min[2] = zmin;
            this._aabb.max[0] = xmax;
            this._aabb.max[1] = ymax;
            this._aabb.max[2] = zmax;
        },

        _getJSON: function () {
            var json = {};
            if (this.collection) {
                json.collection = this.collection.id
            }
            return json;
        },

        _destroy: function () {

            this.collection = null; // Unsubscribes from worldBoundary updates on Collection members

            if (this._worldBoundary) {
                this._worldBoundary.destroy();
            }
        }
    });

})
();
