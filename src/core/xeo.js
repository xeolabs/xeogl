/**
 The xeoEngine namespace.

 @class XEO
 @main XEO
 @static
 @author xeolabs / http://xeolabs.com/
 */
(function () {

    "use strict";

    var XEO = function () {

        // Ensures unique scene IDs
        // Lazy-instantiated because class won't be defined yet
        this._sceneIDMap = null;

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
        // fires a "tick" event on each scene, recompiles scenes as needed

        var tickEvent = {
            sceneId: null,
            time: null,
            startTime: null,
            prevTime: null,
            deltaTime: null
        };

        var frame = function () {

            var time = (new Date()).getTime() * 0.001;

            tickEvent.time = time;

            var scene;

            for (var id in self.scenes) {
                if (self.scenes.hasOwnProperty(id)) {

                    scene = self.scenes[id];

                    // Fire the tick event on the scene

                    tickEvent.sceneId = id;
                    tickEvent.startTime = scene.startTime;
                    tickEvent.deltaTime = tickEvent.prevTime != null ? time - tickEvent.prevTime : 0;

                    scene.fire("tick", tickEvent);

                    // Recompile the scene if it's now dirty
                    // after handling the tick event

                    // if (self._dirtyScenes[id]) {

                    scene._compile();

                    self._dirtyScenes[id] = false;
                    // }
                }
            }

            tickEvent.prevTime = time;

            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    };

    XEO.prototype = {

        constructor: XEO,

        /**
         The default {{#crossLink "Scene"}}Scene{{/crossLink}}.

         Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
         {{#crossLink "Scene"}}Scene{{/crossLink}} by default.

         xeoEngine creates the default {{#crossLink "Scene"}}Scene{{/crossLink}} as soon as you either
         reference this property for the first time, or create your first {{#crossLink "GameObject"}}GameObject{{/crossLink}} without
         a specified {{#crossLink "Scene"}}Scene{{/crossLink}}.

         @property scene
         @namespace XEO
         @final
         @type Scene
         */
        get scene() {

            // XEO.Scene constructor will call this._addScene
            // to register itself on XEO

            return this._scene || (this._scene = new window.XEO.Scene({
                    id: "default.scene"
                }));
        },

        /**
         * Registers a scene on xeoEngine.
         * This is called within the XEO.Scene constructor.
         *
         * @method _addScene
         * @param {Scene} scene The scene
         * @private
         */
        _addScene: function (scene) {

            this._sceneIDMap = this._sceneIDMap || new window.XEO.utils.Map();

            if (scene.id) {

                // User-supplied ID

                if (this.scenes[scene.id]) {
                    console.error("[ERROR] Scene " + XEO._inQuotes(scene.id) + " already exists");
                    return;
                }

            } else {

                // Auto-generated ID

                scene.id = this._sceneIDMap.addItem(scene);
            }

            this.scenes[scene.id] = scene;

            var self = this;

            // Unregister destroyed scenes

            scene.on("destroyed",
                function () {

                    self._sceneIDMap.removeItem(scene.id);

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
         * Destroys all user-created {{#crossLink "Scene"}}Scenes{{/crossLink}} and
         * clears the default {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * @method clear
         */
        clear: function () {

            var scene;

            for (var id in this.scenes) {
                if (this.scenes.hasOwnProperty(id)) {

                    scene = this.scenes[id];

                    // Only clear the default Scene
                    // but destroy all the others

                    if (id === "default.scene") {
                        scene.clear();
                    } else {
                        scene.destroy();
                    }
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
            return testGameObject && !(testGameObject.propertyIsEnumerable('length')) && typeof testGameObject === 'object' && typeof testGameObject.length === 'number';
        },

        /**
         * Tests if the given value is a string
         * @param value
         * @returns {boolean}
         * @private
         */
        _isString: function (value) {
            return (typeof value === 'string' || value instanceof String);
        },


        /**
         * Tests if the given value is a number
         * @param value
         * @returns {boolean}
         * @private
         */
        _isNumeric: function (value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
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
         * Add non-null/defined properties of o to o2
         * @private
         */
        _apply2: function (o, o2) {
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    if (o[name] !== undefined && o[name] !== null) {
                        o2[name] = o[name];
                    }
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
                    if (o2[name] === undefined || o2[name] === null) {
                        o2[name] = o[name];
                    }
                }
            }
            return o2;
        },

        /**
         * Returns true if the given map is empty.
         * @param obj
         * @returns {boolean}
         * @private
         */
        _isEmptyObject: function (obj) {
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Returns the given ID as a string, in quotes if the ID was a string to begin with.
         *
         * This is useful for logging IDs.
         *
         * @param {Number| String} id The ID
         * @returns {String}
         * @private
         */
        _inQuotes: function (id) {
            return this._isNumeric(id) ? ("" + id) : ("'" + id + "'");
        }
    };

    // Have a lower-case XEO namespace as well,
    // just because it's easier to type when live-coding

    window.XEO = window.XEO = new XEO();

})();
