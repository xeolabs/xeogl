(function () {

    "use strict";

    /**
     A **GLTFModel** is a {{#crossLink "Model"}}{{/crossLink}} that loads itself from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

     <a href="../../examples/#models_GLTFModel_gearbox"><img src="../../../assets/images/gltf/glTF_gearbox_squashed.png"></img></a>

     ## Overview

     * A GLTFModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from glTF.
     * It begins loading as soon as you set its {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}
     property to the location of a valid glTF file.
     * You can set {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
     the GLTFModel to clear itself and load components from the new file.
     * Can be transformed within World-space by attached it to a {{#crossLink "Transform"}}{{/crossLink}}.
     * Provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

     <img src="../../../assets/images/GLTFModel.png"></img>

     ## Tutorials

     * [Importing glTF](https://github.com/xeolabs/xeogl/wiki/Models-glTF)

     ## Examples

     * [Gearbox](../../examples/#models_GLTFModel_gearbox)
     * [Buggy](../../examples/#models_GLTFModel_buggy)
     * [Reciprocating Saw](../../examples/#models_GLTFModel_ReciprocatingSaw)
     * [Textured Duck](../../examples/#models_GLTFModel_duck)
     * [GLTFModel with entity explorer UI](../../examples/#demos_ui_explorer)
     * [Fly camera to GLTFModel entities](../../examples/#boundaries_flyToBoundary)
     * [Ensuring individual materials on GLTFModel entities](../../examples/#models__uniqueMaterials)
     * [Baking transform hierarchies](../../examples/#models_bakeTransforms)
     * [Attaching transforms to GLTFModel, via constructor](../../examples/#models_configureTransform)
     * [Attaching transforms to GLTFModel, via property](../../examples/#models_attachTransform)

     @class GLTFModel
     @module xeogl
     @submodule models
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GLTFModel in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
     generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GLTFModel.
     @param [cfg.src] {String} Path to a glTF file. You can set this to a new file path at any time, which will cause the
     GLTFModel to load components from the new file (after first destroying any components loaded from a previous file path).
     @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this GLTFModel.
     Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this GLTFModel. Internally, the given
     {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
     that the GLTFModel attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
     @extends Model
     */
    xeogl.GLTFModel = xeogl.Model.extend({

        type: "xeogl.GLTFModel",

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
             Path to a glTF file.

             You can set this to a new file path at any time, which will cause the GLTFModel to load components from
             the new file (after first destroying any components loaded from a previous file path).

             Fires a {{#crossLink "GLTFModel/src:event"}}{{/crossLink}} event on change.

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

                    if (value === this._src) { // Already loaded this GLTFModel

                        /**
                         Fired whenever this GLTFModel has finished loading components from the glTF file
                         specified by {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        this.fire("loaded");

                        return;
                    }

                    this.destroyAll();

                    this._src = value;

                    var glTFLoader = xeogl.GLTFLoader;

                    glTFLoader.setModel(this);
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
                         Fired whenever this GLTFModel has finished loading components from the glTF file
                         specified by {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        self.fire("loaded");
                    });

                    /**
                     Fired whenever this GLTFModel's {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} property changes.
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

            var json =  {};

            if (this.src) {
                json.src = this._src;
            }

            return json;
        },

        _destroy: function () {
            this.destroyAll();
        }
    });

})();