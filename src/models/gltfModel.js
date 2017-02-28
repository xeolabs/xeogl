/**
 A **GLTFModel** is a {{#crossLink "Model"}}{{/crossLink}} that loads itself from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

 <a href="../../examples/#importing_gltf_gearbox"><img src="../../../assets/images/gltf/glTF_gearbox_squashed.png"></img></a>

 ## Overview

 * A GLTFModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from a glTF file.
 * It begins loading as soon as you set its {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}
 property to the location of a valid glTF file.
 * You can set {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
 the GLTFModel to clear itself and load components from the new file.

 It inherits these capabilities from its {{#crossLink "Model"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the components within it.
 * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * Provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 <img src="../../../assets/images/GLTFModel.png"></img>

 ## Usage

 ### Loading glTF

 Load a glTF file by creating a GLTFModel:

 ````javascript
 var gearbox = new xeogl.GLTFModel({
   id: "gearbox",
   src: "models/gltf/gearbox/gearbox_assy.gltf"
 });
 ````

 A GLTFModel prefixes its own ID to those of its components. Its ID is optional and defaults to
 the value of {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}. In this example we're providing our own short ID,
 however, in order to keep the component IDs short and easy to use.

 The GLTFModel begins loading the glTF file immediately. Bind a callback to be notified when the file has loaded (which
 fires immediately if already loaded):

 ````javascript
 gearbox.on("loaded", function() {
        // GLTFModel has loaded!
    });
 ````

 To switch to a different glTF file, simply update {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}:

 ````javascript
 gearbox.src = "models/gltf/buggy/buggy.gltf"
 ````
 
 ### Accessing components

 Once the GLTFModel has loaded, its {{#crossLink "Scene"}}{{/crossLink}} will contain various components that represent the elements of the glTF file. 
 We'll now access some of those components by ID, to query and update them programmatically.

 **Transforms**

 Let's reposition one of the {{#crossLink "Entity"}}Entities{{/crossLink}} in our GLTFModel. We'll get the {{#crossLink "Transform"}}{{/crossLink}} that
 positions our target {{#crossLink "Entity"}}{{/crossLink}}, in this case a gear. Then we'll update its matrix to translate it ten units along the negative Z-axis.

 ````javascript
 var transform = gearbox.scene.components["gearbox#n274017_gear_53t-node.transform"];

 transform.matrix = xeogl.math.translationMat4v([0,0,-10]);
 ````

 Note the format of the {{#crossLink "Transform"}}{{/crossLink}}'s ID:

 ````<GLTFModel ID>#<glTF node ID>.transform````

 From left to right, the format contains the GLTFModel's ID, the ID of the glTF node that contains the transform, then
 "transform", to distinguish it from the IDs of any other components loaded from elements on the same glTF node.

 **Entities**

 Let's make our gear {{#crossLink "Entity"}}{{/crossLink}} invisible. This time we'll get the {{#crossLink "Entity"}}{{/crossLink}} itself, then update
 its {{#crossLink "Visibility"}}{{/crossLink}} component:

 ````javascript
 var gear53 = gearbox.scene.components["gearbox#n274017_gear_53.entity.0"];

 gear53.visibility.visible = false;
 ````

 Note the format of the {{#crossLink "Entity"}}{{/crossLink}}'s ID: ````<GLTFModel ID>#<glTF node ID>.entity.<glTF mesh index>````

 A glTF scene node may contain multiple meshes, and for each of those xeogl will create an individual {{#crossLink "Entity"}}{{/crossLink}}. As
 before, the part before the hash is the ID of the GLTFModel, which is then followed by the ID of the glTF node, then "entity"
 to signify that this is an Entity ID, then finally an index to differentiate the Entity from those loaded from other
 meshes on the same glTF node.

 When we load multiple Entities from a glTF node, then they will share the same {{#crossLink "Transform"}}{{/crossLink}} and {{#crossLink "Visibility"}}{{/crossLink}} components. This
 lets us update their transformation and visibility as a group, as if they were a composite entity that represents
 the glTF node.


 ## Examples

 * [Damaged Helmet with metal/rough PBR materials](../../examples/#importing_gltf_pbr_metallic_helmet)
 * [Gearbox with entity explorer](../../examples/#importing_gltf_explorer)
 * [Ensuring individual materials on GLTFModel entities](../../examples/#models_filter_uniqueMaterials)
 * [Baking transform hierarchies in a GLTFModel](../../examples/#models_filter_bakeTransforms)

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
(function () {

    "use strict";

    xeogl.GLTFModel = xeogl.Model.extend({

        type: "xeogl.GLTFModel",

        _init: function (cfg) {

            this._super(cfg);

            this._src = null;

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

                    var spinner = this.scene.canvas.spinner;
                    spinner.processes++;

                    glTFLoader.load(userInfo, options, function () {

                        // Decrement processes represented by loading spinner
                        // Spinner disappears if the count is now zero
                        spinner.processes--;

                        xeogl.scheduleTask(function () {
                            self.fire("loaded", true);
                        });
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

            var json = {};

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