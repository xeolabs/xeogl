(function () {

    "use strict";

    /**
     A **Model** is a unit of content within a xeogl {{#crossLink "Scene"}}{{/crossLink}}.

     <ul>
     <li>Subclassed by {{#crossLink "GLTFModel"}}GLTFModel{{/crossLink}}, which loads glTF files.</li>
     <li>A Model keeps all its components in a {{#crossLink "Collection"}}{{/crossLink}}.</li>
     <li>A Model can be attached to an animated and dynamically-editable
     modelling {{#crossLink "Transform"}}{{/crossLink}} hierarchy, to rotate, translate and scale it within the World-space coordinate system, in the
     same way that an {{#crossLink "Entity"}}{{/crossLink}} can.</li>
     <li>You can set a Model's {{#crossLink "Model/src:property"}}{{/crossLink}} property to a new file path at any time,
     which will cause it to load components from the new file (destroying any components loaded previously).</li>
     </ul>

     <img src="../../../assets/images/Model.png"></img>

     @class Model
     @module xeogl
     @submodule model
     @extends Component
     */
    xeogl.Model = xeogl.Component.extend({

        type: "xeogl.Model",

        _init: function (cfg) {

            this._super(cfg);

            // The xeogl.Collection that will hold all the components
            // in this Model; this will be available
            // as a public, immutable #collection property

            this._collection = this.create(xeogl.Collection);

            // Dummy transform to make it easy to graft user-supplied
            // transforms above loaded entities

            this._dummyRootTransform = this.create({
                type: "xeogl.Transform",
                meta: "dummy"
            });

            var self = this;

            this._collection.on("added", function (component) {

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

                        if (rootTransform.id === self._dummyRootTransform.id) {
                            return;
                        }

                        rootTransform.parent = self._dummyRootTransform;
                    }
                }
            });

            this.transform = cfg.transform;
        },

        _props: {

            /**
             * A {{#crossLink "Collection"}}{{/crossLink}} containing the scene components loaded by this Model.
             *
             * @property collection
             * @type Collection
             * @final
             */
            collection: {

                get: function () {
                    return this._collection;
                }
            },

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
             * World-space 3D boundary of this Model.
             *
             * This is a {{#crossLink "Boundary3D"}}{{/crossLink}} that encloses the {{#crossLink "Entity"}}Entities{{/crossLink}}
             * within this Model.
             *
             * The a {{#crossLink "Boundary3D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * To minimize performance overhead, only reference this property if you need it, and destroy
             * the {{#crossLink "Boundary3D"}}{{/crossLink}} as soon as you don't need it anymore.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._collectionBoundary) {

                        // A CollectionBoundary provides an automatically resizing
                        // world-space Boundary that encloses the Entities in our Model's Collection

                        this._collectionBoundary = this.create({
                            type: "xeogl.CollectionBoundary",
                            collection: this._collection
                        });

                        // Dispose of the CollectionBoundary as soon as the
                        // caller has destroyed the Boundary3D

                        var self = this;

                        this._collectionBoundary.worldBoundary.on("destroyed", function () {
                            self._collectionBoundary.destroy();
                            self._collectionBoundary = null;
                        });
                    }

                    return this._collectionBoundary.worldBoundary;
                }
            }
        },

        _transformUpdated: function (transform) {
            this._dummyRootTransform.parent = transform;
        },

        /**
         * Clears this Model.
         */
        clear: function () {

            var c = [];

            this._collection.iterate(function (component) {
                c.push(component);
            });

            while (c.length) {
                c.pop().destroy();
            }
        },

        _getJSON: function () {

            var json = {};

            if (this._attached.transform) {
                json.transform = this._attached.transform.id;
            }

            return json;
        },

        _destroy: function () {
            this.clear();
        }
    });
})();