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

        /**
         * Semantic version number. The value for this is set by an expression that's concatenated to
         * the end of the built binary by the xeoEngine build script.
         * @property version
         * @namespace XEO
         * @type {String}
         */
        this.version = null;

        /**
         * Information about available WebGL support
         */
        this.WEBGL_INFO = (function() {
            var info = {
                WEBGL: false
            };

            var canvas = document.createElement("canvas");

            if (!canvas) {
                return info;
            }

            var gl = canvas.getContext("webgl", { antialias: true }) || canvas.getContext("experimental-webgl", { antialias: true });

            info.WEBGL = !!gl;

            if (!info.WEBGL) {
                return info;
            }

            info.ANTIALIAS = gl.getContextAttributes().antialias;

            if (gl.getShaderPrecisionFormat) {
                if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
                    info.FS_MAX_FLOAT_PRECISION = "highp";
                } else if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
                    info.FS_MAX_FLOAT_PRECISION = "mediump";
                } else {
                    info.FS_MAX_FLOAT_PRECISION = "lowp";
                }
            } else {
                info.FS_MAX_FLOAT_PRECISION = "mediump";
            }

            info.DEPTH_BUFFER_BITS = gl.getParameter(gl.DEPTH_BITS);
            info.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            info.MAX_CUBE_MAP_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            info.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
            info.MAX_TEXTURE_UNITS =  gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            info.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            info.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
            info.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
            info.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);

            info.SUPPORTED_EXTENSIONS = {};

            gl.getSupportedExtensions().forEach(function(ext) {
                info.SUPPORTED_EXTENSIONS[ext] = true;
            });

            return info;
        })();

        /**
         * Tracks statistics within xeoEngine, such as numbers of
         * scenes, textures, geometries etc.
         * @final
         * @property stats
         * @type {*}
         */
        this.stats = {
            build: {
                version: XEO.version
            },
            client: {
                browser: (navigator && navigator.userAgent) ? navigator.userAgent : "n/a"
            },

            // TODO: replace 'canvas' with 'pixels'
            //canvas: {
            //    width: 0,
            //    height: 0
            //},
            components: {
                scenes: 0,
                entities: 0
            },
            memory: {

                // Note that these counts will include any positions, colors,
                // normals and indices that xeoEngine internally creates on-demand
                // to support color-index triangle picking.

                meshes: 0,
                positions: 0,
                colors: 0,
                normals: 0,
                tangents: 0,
                uvs: 0,
                indices: 0,
                textures: 0,
                programs: 0
            },
            frame: {
                frameCount: 0,
                fps: 0,
                useProgram: 0,
                setUniform: 0,
                setUniformCacheHits: 0,
                bindTexture: 0,
                bindArray: 0,
                drawElements: 0,
                drawChunks: 0
            }
        };

        // Ensures unique scene IDs
        // Lazy-instantiated because its class is on the
        // namespace of this object, and so won't be defined yet
        this._sceneIDMap = null;

        // Default singleton Scene, lazy-initialized in getter
        this._scene = null;

        /**
         * Existing {{#crossLink "Scene"}}Scene{{/crossLink}}s , mapped to their IDs
         * @property scenes
         * @namespace XEO
         * @type {{String:XEO.Scene}}
         */
        this.scenes = {};

        // Task queue, which is pumped on each frame;
        // tasks are pushed to it with calls to XEO.schedule

        this._taskQueue = [];

        //-----------------------------------------------------------------------
        // Game loop
        //
        // https://developer.mozilla.org/en-US/docs/Games/Anatomy
        //
        // http://gameprogrammingpatterns.com/game-loop.html
        //-----------------------------------------------------------------------

        var self = this;

        (function () {

            var tickEvent = {
                sceneId: null,
                time: null,
                startTime: null,
                prevTime: null,
                deltaTime: null
            };

            // Hoisted vars

            var taskBudget = 8; // How long we're allowed to spend on tasks in each frame
            var frameTime;
            var lastFrameTime = 0;
            var elapsedFrameTime;
            var newFPS;
            var fpsSamples = [];
            var numFPSSamples = 30;
            var totalFPS = 0;
            var updateTime;
            var id;
            var scene;

            var frame = function () {

                frameTime = Date.now();

                // Moving average of FPS

                if (lastFrameTime > 0) {
                    elapsedFrameTime = frameTime - lastFrameTime;
                    newFPS = 1000 / elapsedFrameTime;
                    totalFPS += newFPS;
                    fpsSamples.push(newFPS);
                    if (fpsSamples.length >= numFPSSamples) {
                        totalFPS -= fpsSamples.shift();
                    }
                    self.stats.frame.fps = Math.round(totalFPS / fpsSamples.length);

                }

                update();

                render();

                lastFrameTime = frameTime;

                window.requestAnimationFrame(frame);
            };


            function update() {

                updateTime = Date.now();

                // Process as many enqueued tasks as we can
                // within the per-frame task budget

                self._runScheduledTasks(updateTime + taskBudget);

                tickEvent.time = updateTime;

                // Fire a "tick" event at the scene, which will in turn cause
                // all sorts of scene components to schedule more tasks

                for (id in self.scenes) {
                    if (self.scenes.hasOwnProperty(id)) {

                        scene = self.scenes[id];

                        // Fire the tick event at the scene

                        tickEvent.sceneId = id;
                        tickEvent.startTime = scene.startTime;
                        tickEvent.deltaTime = tickEvent.prevTime != null ? tickEvent.time - tickEvent.prevTime : 0;

                        /**
                         * Fired on each game loop iteration.
                         *
                         * @event tick
                         * @param {String} sceneID The ID of this Scene.
                         * @param {Number} startTime The time in seconds since 1970 that this Scene was instantiated.
                         * @param {Number} time The time in seconds since 1970 of this "tick" event.
                         * @param {Number} prevTime The time of the previous "tick" event from this Scene.
                         * @param {Number} deltaTime The time in seconds since the previous "tick" event from this Scene.
                         */
                        scene.fire("tick", tickEvent, true);
                    }
                }

                tickEvent.prevTime = updateTime;
            }

            function render() {
                var scenes = self.scenes;
                for (id in scenes) {
                    if (scenes.hasOwnProperty(id)) {
                        scenes[id].render();
                    }
                }
            }

            window.requestAnimationFrame(frame);

        })();
    };

    XEO.prototype = {

        constructor: XEO,

        /**
         The default {{#crossLink "Scene"}}Scene{{/crossLink}}.

         Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
         {{#crossLink "Scene"}}Scene{{/crossLink}} by default.

         xeoEngine creates the default {{#crossLink "Scene"}}Scene{{/crossLink}} as soon as you either
         reference this property for the first time, or create your first {{#crossLink "Entity"}}Entity{{/crossLink}} without
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
                });
        },

        /**
         * Schedule a task for xeoEngine to run at the next frame.
         *
         * Internally, this pushes the task to a FIFO queue. Within each frame interval, xeoEngine processes the queue
         * for a certain period of time, popping tasks and running them. After each frame interval, tasks that did not
         * get a chance to run during the task are left in the queue to be run next time.
         *
         * @method schedule
         * @param {Function} callback Callback that runs the task.
         * @param {Object} [scope] Scope for the callback.
         */
        scheduleTask: function (callback, scope) {
            this._taskQueue.push(callback);
            this._taskQueue.push(scope);
        },

        deferTask: function (callback, scope) {
            if (scope) {
                callback.call(scope);
            } else {
                callback();
            }
        },

        // Pops and propcesses tasks in the queue, until the
        // given number of milliseconds has elapsed.
        _runScheduledTasks: function (until) {

            var time = (new Date()).getTime();
            var taskQueue = this._taskQueue;
            var callback;
            var scope;

            while (taskQueue.length > 0 && time < until) {
                callback = taskQueue.shift();
                scope = taskQueue.shift();
                if (scope) {
                    callback.call(scope);
                } else {
                    callback();
                }
                time = (new Date()).getTime();
            }
        },

        /**
         * Destroys all user-created {{#crossLink "Scene"}}Scenes{{/crossLink}} and
         * clears the default {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * @method clear
         * @demo foo
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
        },

        /**
         * Tests if the given object is an array
         * @private
         */
        _isArray: function (testEntity) {
            return testEntity && !(testEntity.propertyIsEnumerable('length')) && typeof testEntity === 'object' && typeof testEntity.length === 'number';
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

        /**
         * Tests if the given value is an ID
         * @param value
         * @returns {boolean}
         * @private
         */
        _isID: function (value) {
            return XEO._isString(value) || XEO._isNumeric(value);
        },

        /**
         * Tests if the given components are the same, where the components can be either IDs or instances.
         * @param c1
         * @param c2
         * @returns {boolean}
         * @private
         */
        _isSameComponent: function (c1, c2) {

            if (!c1 || !c2) {
                return false;
            }

            var id1 = (XEO.prototype._isNumeric(c1) || XEO.prototype._isString(c1)) ? "" + c1 : c1.id;
            var id2 = (XEO.prototype._isNumeric(c2) || XEO.prototype._isString(c2)) ? "" + c2 : c2.id;

            return id1 === id2;
        },

        /**
         * Tests if the given value is a function
         * @param value
         * @returns {boolean}
         * @private
         */
        _isFunction: function (value) {
            return (typeof value === "function");
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

})
();
