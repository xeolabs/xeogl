(function () {

    "use strict";

    var glTFLoader = XEO.GLTFLoader;

    /**
     An **Import** component loads content from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

     <ul><li>An Import component begins loading content into its {{#crossLink "Scene"}}{{/crossLink}} as soon as it's {{#crossLink "Import/src:property"}}{{/crossLink}}
     property is set to a file path.</li>
     <li>An Import provides all the components it has loaded within a {{#crossLink "Group"}}{{/crossLink}}.</li>
     <li>You can set an Import's {{#crossLink "Import/src:property"}}{{/crossLink}} property to a new file path at any time, causing the Import
     to load components from the new file path (after destroying any components that it had loaded from the previous file path).</li>
     </ul>

     ## Example

     First, create an Import, which immediately loads a glTF model into the default {{#crossLink "Scene"}}{{/crossLink}}:

     ````javascript
     var myImport = new XEO.Import({
        src: "models/gltf/gearbox/gearbox_assy.gltf"
     });
     ````

     The Import has a {{#crossLink "Group"}}{{/crossLink}} which contains all the components
     it loaded from the glTF file.

     Let's iterate over the {{#crossLink "Group"}}{{/crossLink}} and log the ID of each
     {{#crossLink "GameObject"}}{{/crossLink}} we find in there:

     ````javascript
     var group = myImport.group;

     group.iterate(function(c) {
         if (c.type === "XEO.GameObject") {
             this.log("GameObject found: " + c.id);
         }
     });
     ````

     Let's set the Import to a different file path:

     ````javascript
     myImport.src = "models/gltf/buggy/buggy.gltf"
     ````

     Once loaded, the {{#crossLink "Group"}}{{/crossLink}} will contain an entirely different collection of scene components, loaded from this new glTF file.

     Finally, an Import manages the lifecycle of it's components. Therefore, destroying a Import also destroys all the
     components it loaded:

     ````javascript
     myImport.destroy();
     ````

     @class Import
     @module XEO
     @submodule importing
     @extends Component
     */
    XEO.Import = XEO.Component.extend({

        type: "XEO.Import",

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

             Fires a {{#crossLink "Import/src:event"}}{{/crossLink}} event on change.

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
                     Fired whenever this Import's  {{#crossLink "GLTF/src:property"}}{{/crossLink}} property changes.
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
             * {{#crossLink "Group"}}{{/crossLink}} containing all the xeoEngine components for this Import.
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