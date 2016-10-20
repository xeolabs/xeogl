(function () {

    "use strict";

    XEO.GeometryOptimizer = XEO.Component.extend({

        type: "XEO.GeometryOptimizer",

        _init: function (cfg) {
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
                        type: "XEO.Collection",
                        component: value, // Converts value from ID to instance if necessary
                        on: {
                            added: function (component) {
                                self._added(component);
                            },
                            removed: function (component) {
                                self._removed(component);
                            }
                        },
                        onAttached: function () {
                            self._collectionAttached();
                        },
                        onDetached: function (collection) {
                            collection.iterate(self._unbind, self);
                        }
                    });
                },

                get: function () {
                    return this._attached.collection;
                }
            }
        },

        _collectionAttached: function () {

        },

        _optimizeGeometries: function () {

            var entities = this.collection.entities;
            var entity;
            var orderedEntities = [];
            var materialEntities = {};

            for (var id in entities) {
                if (entities.hasOwnProperty(id)) {

                    entity = entities[id];

                    var group = materialEntities[entity.material.id];

                    if (!group) {
                        group = materialEntities[entity.material.id] = [];
                    }

                    group.push(entity);
                }
            }

            for (var id in materialEntities) {

                var group = materialEntities[id];

                var positions = [];
                var indices = [];
                var uvs = [];
                var normals = [];

                for (var i = 0, len = group.length; i < len; i++) {

                }

                new XEO.Entity({
                    geometry: {
                        type: "XEO.Geometry",
                        primitive: "triangles",
                        positions: positions,
                        uvs: uvs,
                        normals:normals,
                        indices:indices
                    }
                });
            }


        }
    });
})();
