(function () {

    "use strict";

    var glTFLoader = xeogl.GLTFLoader;

    /**
     A **glTF** loads content from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file into its parent {{#crossLink "Scene"}}{{/crossLink}}.

     <ul><li>A glTF begins loading as soon as it's {{#crossLink "glTF/src:property"}}{{/crossLink}}
     property is set to the location of a valid glTF file.</li>
     <li>A glTF keeps all its loaded components in a {{#crossLink "Collection"}}{{/crossLink}}.</li>
     <li>A glTF can be attached to an animated and dynamically-editable
     glTFling {{#crossLink "Transform"}}{{/crossLink}} hierarchy, to rotate, translate and scale it within the World-space coordinate system, in the
     same way that an {{#crossLink "Entity"}}{{/crossLink}} can.</li>
     <li>You can set a glTF's {{#crossLink "glTF/src:property"}}{{/crossLink}} property to a new file path at any time,
     which will cause it to load components from the new file (destroying any components loaded previously).</li>
     </ul>

     <img src="../../../assets/images/glTF.png"></img>

     ## Examples

     <ul>
     <li>[Gearbox](../../examples/#importing_gltf_gearbox)</li>
     <li>[Buggy](../../examples/#importing_gltf_buggy)</li>
     <li>[Reciprocating Saw](../../examples/#importing_gltf_ReciprocatingSaw)</li>
     <li>[Textured Duck](../../examples/#importing_gltf_duck)</li>
     <li>[glTF with entity explorer UI](../../examples/#demos_ui_explorer)</li>
     <li>[Fly camera to glTF entities](../../examples/#boundaries_flyToBoundary)</li>
     <li>[Ensuring individual materials on glTF entities](../../examples/#importing_gltf_techniques_uniqueMaterials)</li>
     <li>[Baking transform hierarchies](../../examples/#importing_gltf_techniques_bakeTransforms)</li>
     <li>[Attaching transforms to glTFs, via constructor](../../examples/#importing_gltf_techniques_configTransform)</li>
     <li>[Attaching transforms to glTFs, via property](../../examples/#importing_gltf_techniques_attachTransform)</li>
     </ul>

     ## Tutorials

     Find API documentation for glTF here:

     <ul>
     <li>[Importing glTF](https://github.com/xeolabs/xeogl/wiki/Importing-glTF)</li>
     </ul>

     @class glTFModel
     @module xeogl
     @submodule importing
     @extends Model
     */
    xeogl.glTFModel = xeogl.Model.extend({

        type: "xeogl.glTFModel",

        _init: function (cfg) {

            this._super(cfg);

            this._src = null;

            if (!cfg.src) {
                this.error("Config missing: 'src'");
                return;
            }

            if (!xeogl._isString(cfg.src)) {
                this.error("Value for config 'src' should be a string");
                return;
            }

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to the glTF file.

             You can set this to a new file path at any time, which will cause the glTFModel to load components from
             the new file (after first destroying any components loaded from a previous file path).

             Fires a {{#crossLink "glTFModel/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (!xeogl._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    if (value === this._src) { // Already loaded this glTFModel

                        /**
                         Fired whenever this glTFModel has finished loading components from the glTF file
                         specified by {{#crossLink "glTFModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        this.fire("loaded");

                        return;
                    }

                    this.clear();

                    this._src = value;

                    glTFLoader.setCollection(this.collection);
                    glTFLoader.initWithPath(this.id, this._src);

                    var self = this;
                    var userInfo = null;
                    var options = null;

                    // Increment processes represented by loading spinner
                    // Spinner appears as soon as count is non-zero

                    var spinner = self.scene.canvas.spinner;
                    spinner.processes++;

                    glTFLoader.load(userInfo, options, function () {

                        // Decrement processes represented by loading spinner
                        // Spinner disappears if the count is now zero
                        spinner.processes--;

                        /**
                         Fired whenever this glTFModel has finished loading components from the glTF file
                         specified by {{#crossLink "glTFModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        self.fire("loaded");
                    });

                    /**
                     Fired whenever this glTFModel's {{#crossLink "glTFModel/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _getJSON: function () {

            var json =  this._super();

            if (this.src) {
                json.src = this._src;
            }

            return json;
        },

        _destroy: function () {
            this._clear();
        }
    });


})();