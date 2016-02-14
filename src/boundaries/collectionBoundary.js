/**
 A **CollectionBoundary** TODO.

 ## Overview

 <ul>

 <li>TODO</li>

 </ul>

 <img src="../../../assets/images/CollectionBoundary.png"></img>

 ## Example

 TODO

 ````javascript
 var collectionBoundary = new XEO.CollectionBoundary({

    collection: new XEO.Collection({

        components: [
            new XEO.Entity({
                ..,,
            }),
            new XEO.Entity({
                ..,,
            }),
            new XEO.Entity({
                //..
            })
        ]
    })
});

 var showBoundary = new XEO.Entity({
        geometry: new XEO.BoundaryGeometry({
            boundary: collectionBoundary.worldBoundary
        }),
        material: new XEO.PhongMaterial({
            diffuse: [1,0,0]
        })
    });
 ````

 @class CollectionBoundary
 @module XEO
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this CollectionBoundary within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} CollectionBoundary configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CollectionBoundary.
 @param [cfg.emissiveMap=null] {Collection} A {{#crossLink "Collection"}}Collection{{/crossLink}} to fit the {{#crossLink "CollectionBoundary/worldBoundary:property"}}{{/crossLink}} to. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CollectionBoundary.
 @extends Component
 */
(function () {

    "use strict";

    XEO.CollectionBoundary = XEO.Component.extend({

        type: "XEO.CollectionBoundary",

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

                    // Unsubscribe from old Collection's events

                    var oldCollection = this._children.collection;

                    if (oldCollection && XEO._isSameComponent(oldCollection, value)) {

                        oldCollection.off(this._onAdded);
                        oldCollection.off(this._onRemoved);

                        oldCollection.iterate(this._unbind, this);
                    }

                    /**
                     * Fired whenever this CollectionBoundary's {{#crossLink "CollectionBoundary/collection:property"}}{{/crossLink}} property changes.
                     *
                     * @event collection
                     * @param value The property's new value
                     */
                    var collection = this._setChild("XEO.Collection", "collection", value); // Converts value from ID to instance if necessary

                    if (collection) {

                        this._onAdded = collection.on("added", this._added, this);
                        this._onRemoved = collection.on("removed", this._removed, this);

                        collection.iterate(this._bind, this);

                        this._setAABBDirty();
                    }

                    this._setAABBDirty();
                },

                get: function () {
                    return this._children.collection;
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

                        this._worldBoundary = new XEO.Boundary3D(this.scene, {

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
                this._aabb = XEO.math.AABB3();
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
