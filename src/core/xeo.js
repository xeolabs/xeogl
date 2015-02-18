"use strict";

/**
 * The XeoEngine namespace
 * @class XEO
 * @main XEO
 * @static
 * @author xeolabs / http://xeolabs.com/
 */
(function () {

    var XEO = function () {

        // Default singleton Scene, lazy-initialized in getter
        this._scene = null;

        /**
         * Existing  {{#crossLink "Scene"}}Scene{{/crossLink}}s , mapped to their IDs
         * @property scenes
         * @namespace XEO
         * @type {{String:XEO.Scene}}
         */
        this.scenes = {};

        // Map of Scenes needing recompilation
        this._dirtyScenes = {};

        var self = this;

        // Called on each animation frame
        // fires a "tick" on each scene, recompiles scenes as needed
        var frame = function () {

            var tick = {}; // Publish this on every scene
            var scene;

            for (var id in self.scenes) {
                if (self.scenes.hasOwnProperty(id)) {

                    scene = self.scenes[id];

                    scene.fire("tick", tick);

                    // If scene dirty, then recompile it
                    if (self._dirtyScenes[id]) {
                        scene._compile();
                        self._dirtyScenes[id] = false;
                    }
                }
            }

            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    };

    XEO.prototype = {

        constructor: XEO,

        /**
         * The default {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
         * {{#crossLink "Scene"}}Scene{{/crossLink}} by default.
         *
         * @property scene
         * @namespace XEO
         * @final
         * @type Scene
         */
        get scene() {
            return this._scene || (this._scene = new XEO.Scene());
        },

        /**
         * Registers a scene on this engine
         * @method _addScene
         * @param {Scene} scene The scene
         * @private
         */
        _addScene: function (scene) {

            this.scenes[scene.id] = scene;

            var self = this;

            // Unregister destroyed scenes
            scene.on("destroyed",
                function () {
                    delete self.scenes[scene.id];
                    delete self._dirtyScenes[scene.id];
                });

            // Schedule recompilation of dirty scenes for next animation frame
            scene.on("dirty",
                function () {
                    self._dirtyScenes[scene.id] = true;
                });
        },

        /**
         * Destroys all scenes
         * @method clear
         */
        clear: function () {
            for (var id in this.scenes) {
                if (this.scenes.hasOwnProperty(id)) {
                    this.scenes[id].destroy();
                }
            }
            this.scenes = {};
            this._dirtyScenes = {};
        },

        /**
         * Tests if the given object is an array
         * @private
         */
        _isArray: function (testGameObject) {
            return testGameObject && !(testGameObject.propertyIsEnumerable('length'))
                && typeof testGameObject === 'object' && typeof testGameObject.length === 'number';
        },

        /**
         * Tests if the given value is a string
         * @param value
         * @returns {boolean}
         * @private
         */
        _isString: function (value) {
            return (typeof value == 'string' || value instanceof String);
        },

        /** Returns a shallow copy
         */
        _copy: function (o) {
            return this._apply(o, {});
        },

        /** Add properties of o to o2, overwriting them on o2 if already there
         */
        _apply: function (o, o2) {
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    o2[name] = o[name];
                }
            }
            return o2;
        },

        /**
         * Add properties of o to o2 where undefined or null on o2
         * @private
         */
        _applyIf: function (o, o2) {
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    if (o2[name] == undefined || o2[name] == null) {
                        o2[name] = o[name];
                    }
                }
            }
            return o2;
        },

        /**
         * Create a new component type
         * @param cfg
         * @returns {Component.prototype}
         * @private
         */
        _createType: function (cfg) {
            var claz = XEO.Component;
            for (var key in cfg) {
                claz.prototype[key] = key;
            }
            return claz;
        }
    };

    window.XEO = new XEO();

})();


