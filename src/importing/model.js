(function () {

    "use strict";

    var glTFLoader = XEO.GLTFLoader;

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

     ## Examples

     <ul>
     <li>[Gearbox](../../examples/#importing_gltf_gearbox)</li>
     <li>[Buggy](../../examples/#importing_gltf_buggy)</li>
     <li>[Reciprocating Saw](../../examples/#importing_gltf_ReciprocatingSaw)</li>
     <li>[Textured Duck](../../examples/#importing_gltf_duck)</li>
     <li>[Model with entity explorer UI](../../examples/#demos_ui_explorer)</li>
     <li>[Fly camera to model entities](../../examples/#boundaries_flyToBoundary)</li>
     <li>[Ensuring individual materials on Model entities](../../examples/#importing_gltf_techniques_uniqueMaterials)</li>
     <li>[Attaching transforms to Models, via constructor](../../examples/#importing_gltf_techniques_configTransform)</li>
     <li>[Attaching transforms to Models, via property](../../examples/#importing_gltf_techniques_attachTransform)</li>
     </ul>

     ## Tutorials

     <li>[Importing glTF](https://github.com/xeolabs/xeoengine/wiki/Importing-glTF#attaching-transforms-to-models)</li>

     ### Loading a glTF file

     First, create a Model, which immediately loads a glTF model into its {{#crossLink "Scene"}}{{/crossLink}} (which in this case is the default {{#crossLink "Scene"}}{{/crossLink}}, since we didn't explicitly configure the Model with one):

     ````javascript
     var gearboxModel = new XEO.Model({
        src: "models/gltf/gearbox/gearbox_assy.gltf"
     });
     ````

     We can bind a callback, to get notification when the Model has loaded, which will
     fire immediately if the Model happens to be loaded already:

     ````javascript
     gearboxModel.on("loaded", function() {
             // Model has loaded!
         });
     ````

     ### Iterating over loaded components

     The Model's {{#crossLink "Collection"}}{{/crossLink}} which now contains all the scene components
     it created while loading the glTF file.

     Let's iterate over the {{#crossLink "Collection"}}{{/crossLink}} and log the ID of each
     {{#crossLink "Entity"}}{{/crossLink}} we that find in there:

     ````javascript
     gearboxModel.collection.iterate(function(c) {
         if (c.type === "XEO.Entity") {
             this.log("Entity found: " + c.id);
         }
     });
     ````

     ### Getting the boundary of a Model

     To visualize the World-space boundary of a Model, we can create a {{#crossLink "CollectionBoundary"}}{{/crossLink}},
     generate a {{#crossLink "BoundaryGeometry"}}{{/crossLink}} from that, then create an {{#crossLink "Entity"}}{{/crossLink}}
     to visualize the {{#crossLink "BoundaryGeometry"}}{{/crossLink}}:

     ````javascript
     var collectionBoundary = new XEO.CollectionBoundary({
         collection: model.collection
     });

     var boundaryGeometry = new XEO.BoundaryGeometry({
         boundary: collectionBoundary.worldBoundary
     });

     // The Entity will be a red wireframe box indicating the
     // extents of the boundary

     new XEO.Entity({
         geometry: boundaryGeometry,
         material: new XEO.PhongMaterial({
             diffuse: [1,0,0]
         })
     });
     ````

     Now whenever we set the Model to a new file (see example below), the World-space boundary will automatically update accordingly, as will
     our boundary indicator {{#crossLink "Entity"}}{{/crossLink}}.

     ### Flying the Camera to look at a Model

     To position the Model entirely within view, we can use a {{#crossLink "CameraFlight"}}{{/crossLink}} to fly the {{#crossLink "Camera"}}{{/crossLink}} (in this case the default, implicit one) to look at the World-space extents of our {{#crossLink "CollectionBoundary"}}{{/crossLink}}:

     ````javascript
     var flight = new XEO.CameraFlight({
        duration: 1.5
     });

     flight.flyTo(collectionBoundary.worldBoundary, function() {
             // Optional callback to fire on arrival
         });

     ````

     ### Transforming the Model

     A Model can be attached to a modelling {{#crossLink "Transform"}}{{/crossLink}} hierarchy to transform it within
     the World-space coordinate system.

     The hierarchy can be attached on instantiation:

     ````javascript
     gearboxModel = new XEO.Model({
        src: "models/gltf/gearbox/gearbox_assy.gltf",

        transform: new XEO.Rotate({
            id: "spinY",
            xyz: [0, 1, 0],
            angle: 0,

            parent: new XEO.Rotate({
                id: "spinZ",
                xyz: [0, 0, 1],
                angle: 0
            })
        })
     });
     ````

     Alternatively, you can attach the {{#crossLink "Transform"}}{{/crossLink}} hierarchy afterwards:

     ````javascript
     gearboxModel.transform = new XEO.Rotate({
            id: "spinY",
            xyz: [0, 1, 0],
            angle: 0,

            parent: new XEO.Rotate({
                id: "spinZ",
                xyz: [0, 0, 1],
                angle: 0
            })
        });
     ````

     And of course, the hierarchy may be dynamically-editable, since everything in a xeoEngine scene is editable at
     runtime. Animating or updating the {{#crossLink "Transform"}}{{/crossLink}} hierarchy will automatically update the
     boundaries on the {{#crossLink "CollectionBoundary"}}{{/crossLink}} shown in previous examples.

     You can access the {{#crossLink "Transform"}}Transforms{{/crossLink}} by ID:

     ````javascript
     var scene = gearboxMode.scene;
     var spinY = scene.components["spinY"];
     var spinZ = scene.components["spinZ"];

     gearboxModel.scene.on("tick", function () {
                spinY.angle += 0.1;
                spinZ.angle += 0.2;
            });
     ````

     or by walking the {{#crossLink "Transform"}}{{/crossLink}} hierarchy:

     ````javascript
     var scene = gearboxMode.scene;
     var spinY = gearbox.transform;
     var spinZ = gearbox.transform.parent;

     gearboxModel.scene.on("tick", function () {
                spinY.angle += 0.1;
                spinZ.angle += 0.2;
            });
     ````

     ### Switching to a different glTF file

     Let's set the Model to a different file path:

     ````javascript
     gearboxModel.src = "models/gltf/buggy/buggy.gltf"
     ````

     Once loaded, the {{#crossLink "Collection"}}{{/crossLink}} will then contain an entirely different collection of scene
     components, created from this new glTF file.

     ### Destroying a Model

     Finally, a Model manages the lifecycle of it's components. Therefore, destroying a Model also destroys all the
     components it loaded:

     ````javascript
     gearboxModel.destroy();
     ````

     @class Model
     @module XEO
     @submodule importing
     @extends Component
     */
    XEO.Model = XEO.Component.extend({

        type: "XEO.Model",

        _init: function (cfg) {

            this._super(cfg);

            // The XEO.Collection that will hold all the components
            // we create from the glTF model; this will be available
            // as a public, immutable #collection property

            this._collection = this.create(XEO.Collection);

            // Dummy transform to make it easy to graft user-supplied
            // transforms above loaded entities

            this._dummyRootTransform = this.create(XEO.Translate, {
                meta: "dummy"
            });

            this._src = null;

            if (!cfg.src) {
                this.error("Config missing: 'src'");
                return;
            }

            if (!XEO._isString(cfg.src)) {
                this.error("Value for config 'src' should be a string");
                return;
            }

            this.src = cfg.src;
            this.transform = cfg.transform;
        },

        _props: {

            /**
             Path to the glTF file.

             You can set this to a new file path at any time, which will cause the Model to load components from
             the new file (after first destroying any components loaded from a previous file path).

             Fires a {{#crossLink "Model/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (!XEO._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    this._clear();

                    this._src = value;

                    glTFLoader.setCollection(this._collection);
                    glTFLoader.initWithPath(this.id, this._src);

                    var self = this;
                    var userInfo = null;
                    var options = null;
                    var rootTransform;
                    var dummyRootTransform = self._dummyRootTransform;

                    // Increment processes represented by loading spinner
                    // Spinner appears as soon as count is non-zero

                    var spinner = self.scene.canvas.spinner;
                    spinner.processes++;

                    glTFLoader.load(userInfo, options,
                        function () {

                            self._collection.iterate(function (component) {

                                if (component.isType("XEO.Entity")) {

                                    // Insert the dummy transform above
                                    // each entity we just loaded

                                    rootTransform = component.transform;

                                    if (!rootTransform) {

                                        component.transform = dummyRootTransform;

                                    } else {

                                        while (rootTransform.parent) {

                                            if (rootTransform.id === dummyRootTransform.id) {

                                                // Since transform hierarchies created by the glTFLoader may contain
                                                // transforms that share the same parents, there is potential to find
                                                // our dummy root transform while walking up an entity's transform
                                                // path, when that path is joins a path that belongs to an Entity that
                                                // we processed earlier

                                                return;
                                            }

                                            rootTransform = rootTransform.parent;
                                        }

                                        if (rootTransform.id === dummyRootTransform.id) {
                                            return;
                                        }

                                        rootTransform.parent = dummyRootTransform;
                                    }
                                }
                            });

                            // Decrement processes represented by loading spinner
                            // Spinner disappears if the count is now zero
                            spinner.processes--;

                            /**
                             Fired whenever this Model has finished loading components from the glTF file
                             specified by {{#crossLink "Model/src:property"}}{{/crossLink}}.
                             @event loaded
                             */
                            self.fire("loaded");
                        });

                    /**
                     Fired whenever this Model's {{#crossLink "Model/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            },

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
                    var useDefault = false;

                    this._setChild("XEO.Transform", "transform", value, useDefault, this._transformUpdated, this);
                },

                get: function () {
                    return this._children.transform;
                }
            }
        },

        _transformUpdated: function (transform) {
            this._dummyRootTransform.parent = transform;
        },

        _clear: function () {

            var c = [];

            this._collection.iterate(
                function (component) {
                    c.push(component);
                });

            while (c.length) {
                c.pop().destroy();
            }
        },

        _getJSON: function () {

            var json = {
                src: this._src
            };

            if (this._children.transform) {
                json.transform = this._children.transform.id;
            }

            return json;
        },

        _destroy: function () {
            this._clear();
        }
    });


})();