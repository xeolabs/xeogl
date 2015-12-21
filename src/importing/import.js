(function () {

    "use strict";

    var glTFLoader = XEO.GLTFLoader;

    /**
     An **Import** is a {{#crossLink "Group"}}{{/crossLink}} of {{#crossLink "Components"}}{{/crossLink}} that are
     loaded from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

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