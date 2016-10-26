(function () {

    "use strict";

    /**
     A **Model** loads content from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file into its parent {{#crossLink "Scene"}}{{/crossLink}}.

     <ul><li>A Model begins loading as soon as it's {{#crossLink "Model/src:property"}}{{/crossLink}}
     property is set to the location of a valid glTF file.</li>
     <li>A Model keeps all its loaded components in a {{#crossLink "Collection"}}{{/crossLink}}.</li>
     <li>A Model can be attached to an animated and dynamically-editable
     modelling {{#crossLink "Transform"}}{{/crossLink}} hierarchy, to rotate, translate and scale it within the World-space coordinate system, in the
     same way that an {{#crossLink "Entity"}}{{/crossLink}} can.</li>
     <li>You can set a Model's {{#crossLink "Model/src:property"}}{{/crossLink}} property to a new file path at any time,
     which will cause it to load components from the new file (destroying any components loaded previously).</li>
     </ul>

     <img src="../../../assets/images/Model.png"></img>

     @class Model
     @module xeogl
     @submodule importing
     @extends Component
     */
    xeogl.Model = xeogl.Component.extend({

        type: "xeogl.Model",

        _init: function (cfg) {

            this._super(cfg);

            // The xeogl.Collection that will hold all the components
            // we create from the glTF model; this will be available
            // as a public, immutable #collection property

            this._collection = this.create(xeogl.Collection);

            // Dummy transform to make it easy to graft user-supplied
            // transforms above loaded entities

            this._dummyRootTransform = this.create(xeogl.Transform, {
                meta: "dummy"
            });

var self = this;

            this._collection.on("added", function(component) {

                if (component.isType("xeogl.Entity")) {

                    // Insert the dummy transform above
                    // each entity we just loaded

                    var rootTransform = component.transform;

                    if (!rootTransform) {

                        component.transform = self._dummyRootTransform;

                    } else {

                        while (rootTransform.parent) {

                            if (rootTransform.id === self._dummyRootTransform.id) {

                                // Since transform hierarchies created by the glTFLoader may contain
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
             * Whenever {{#crossLink "Model/src:property"}}{{/crossLink}} is set to the location of a valid glTF file,
             * and once the file has been loaded, this {{#crossLink "Collection"}}{{/crossLink}} will contain whatever
             * components were loaded from that file.
             *
             * Note that prior to loading the file, the Model will destroy any components in the {{#crossLink "Collection"}}{{/crossLink}}.
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

            var json = {
            };

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