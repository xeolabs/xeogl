(function () {

    "use strict";

    var glTFLoader = XEO.GLTFLoader;

    /**
     A **Model** component loads content from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

     <ul><li>A Model component begins loading content into its {{#crossLink "Scene"}}{{/crossLink}} as soon as it's {{#crossLink "Model/src:property"}}{{/crossLink}}
     property is set to a file path.</li>
     <li>A Model keeps all the scene components it has loaded in a {{#crossLink "Group"}}{{/crossLink}}.</li>
     <li>You can set a Model's {{#crossLink "Model/src:property"}}{{/crossLink}} property to a new file path at any time, causing the Model
     to load components from the new file path (after destroying any components that it had loaded from the previous file path).</li>
     </ul>

     ## Example

     First, create a Model, which immediately loads a glTF model into the default {{#crossLink "Scene"}}{{/crossLink}}:

     ````javascript
     var myModel = new XEO.Model({
        src: "models/gltf/gearbox/gearbox_assy.gltf"
     });
     ````

     The Model has a {{#crossLink "Group"}}{{/crossLink}} which now contains all the scene components
     it created while loading the glTF file.

     Let's iterate over the {{#crossLink "Group"}}{{/crossLink}} and log the ID of each
     {{#crossLink "GameObject"}}{{/crossLink}} we find in there:

     ````javascript
     myModel.group.iterate(function(c) {
         if (c.type === "XEO.GameObject") {
             this.log("GameObject found: " + c.id);
         }
     });
     ````

     Let's set the Model to a different file path:

     ````javascript
     myModel.src = "models/gltf/buggy/buggy.gltf"
     ````

     Once loaded, the {{#crossLink "Group"}}{{/crossLink}} will then contain an entirely different collection of scene
     components, created from this new glTF file.

     Finally, a Model manages the lifecycle of it's components. Therefore, destroying a Model also destroys all the
     components it loaded:

     ````javascript
     myModel.destroy();
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

            // The XEO.Group that will hold all the components
            // we create from the glTF model; this will be available
            // as a public, immutable #group property

            this._group = new XEO.Group(this.scene);

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
        },

        _props: {

            /**
             Path to the glTF file.

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

                    glTFLoader.setGroup(this._group);
                    glTFLoader.initWithPath(value);
                    glTFLoader.load();

                    /**
                     Fired whenever this Model's  {{#crossLink "GLTF/src:property"}}{{/crossLink}} property changes.
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
             * {{#crossLink "Group"}}{{/crossLink}} containing all the xeoEngine components currently loaded by this Model.
             *
             * @property group
             * @type Group
             * @final
             */
            group: {

                get: function () {
                    return this._group;
                }
            }
        },

        _clear: function () {

            var c = [];

            this._group.iterate(
                function (component) {
                    c.push(component);
                });

            while (c.length) {
                c.pop().destroy();
            }
        },

        _getJSON: function () {
            return {
                src: this._src
            };
        },

        _destroy: function () {
            this._clear();
        }
    });


})();