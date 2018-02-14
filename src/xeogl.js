/**
 The xeogl namespace.

 @class xeogl
 @main xeogl
 @static
 @author xeolabs / http://xeolabs.com/
 */
(function () {

    "use strict";

    // Fast queue that avoids using potentially inefficient array .shift() calls
    // Based on https://github.com/creationix/fastqueue
    var Queue = function () {

        var head = [];
        var headLength = 0;
        var tail = [];
        var index = 0;
        this.length = 0;

        this.shift = function () {
            if (index >= headLength) {
                var t = head;
                t.length = 0;
                head = tail;
                tail = t;
                index = 0;
                headLength = head.length;
                if (!headLength) {
                    return;
                }
            }
            var value = head[index];
            if (index < 0) {
                delete head[index++];
            }
            else {
                head[index++] = undefined;
            }
            this.length--;
            return value;
        };

        this.push = function (item) {
            this.length++;
            tail.push(item);
            return this;
        };

        this.unshift = function (item) {
            head[--index] = item;
            this.length++;
            return this;
        };
    };

    var xeogl = function () {

        this._debug = {
            forceHighShaderPrecision: false
        };

        /**
         * Semantic version number. The value for this is set by an expression that's concatenated to
         * the end of the built binary by the xeogl build script.
         * @property version
         * @namespace xeogl
         * @type {String}
         */
        this.version = null;

        /**
         * Information about available WebGL support
         */
        this.WEBGL_INFO = (function () {
            var info = {
                WEBGL: false
            };

            var canvas = document.createElement("canvas");

            if (!canvas) {
                return info;
            }

            var gl = canvas.getContext("webgl", {antialias: true}) || canvas.getContext("experimental-webgl", {antialias: true});

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
            info.MAX_TEXTURE_UNITS = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            info.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
            info.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            info.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
            info.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
            info.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);

            info.SUPPORTED_EXTENSIONS = {};

            gl.getSupportedExtensions().forEach(function (ext) {
                info.SUPPORTED_EXTENSIONS[ext] = true;
            });

            return info;
        })();

        /**
         * Tracks statistics within xeogl, such as numbers of
         * scenes, textures, geometries etc.
         * @final
         * @property stats
         * @type {*}
         */
        this.stats = {
            build: {
                version: xeogl.version
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
                models: 0,
                entities: 0
            },
            memory: {

                // Note that these counts will include any positions, colors,
                // normals and indices that xeogl internally creates on-demand
                // to support color-index triangle picking.

                meshes: 0,
                positions: 0,
                colors: 0,
                normals: 0,
                uvs: 0,
                indices: 0,
                textures: 0,
                transforms: 0,
                materials: 0,
                programs: 0
            },
            frame: {
                frameCount: 0,
                fps: 0,
                useProgram: 0,
                bindTexture: 0,
                bindArray: 0,
                drawElements: 0,
                drawArrays: 0,
                tasksRun: 0,
                tasksScheduled: 0
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
         * @namespace xeogl
         * @type {{String:xeogl.Scene}}
         */
        this.scenes = {};

        // Used for throttling FPS for each Scene
        this._scenesRenderInfo = {};

        /**
         * For each component type, a list of its supertypes, ordered upwards in the hierarchy.
         * @type {{}}
         * @private
         */
        this._superTypes = {};

        // Task queue, which is pumped on each frame;
        // tasks are pushed to it with calls to xeogl.schedule

        this._taskQueue = new Queue();

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

            var taskBudget = 10; // Millisecs we're allowed to spend on tasks in each frame
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

                var tasksRun = self._runScheduledTasks(updateTime + taskBudget);
                var tasksScheduled = self._taskQueue.length;

                self.stats.frame.tasksRun = tasksRun;
                self.stats.frame.tasksScheduled = tasksScheduled;
                self.stats.frame.tasksBudget = taskBudget;

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
                var scenesRenderInfo = self._scenesRenderInfo;
                var scene;
                var renderInfo;
                var ticksPerRender;

                var forceRender = false;
                for (id in scenes) {
                    if (scenes.hasOwnProperty(id)) {

                        scene = scenes[id];
                        renderInfo = scenesRenderInfo[id];

                        ticksPerRender = scene.ticksPerRender;

                        if (renderInfo.ticksPerRender !== ticksPerRender) {
                            renderInfo.ticksPerRender = ticksPerRender;
                            renderInfo.renderCountdown = ticksPerRender;
                        }

                        if (--renderInfo.renderCountdown === 0) {
                            scene.render(forceRender);
                            renderInfo.renderCountdown = ticksPerRender;
                        }
                    }
                }
            }

            window.requestAnimationFrame(frame);

        })();
    };

    xeogl.prototype = {

        constructor: xeogl,

        /**
         The default {{#crossLink "Scene"}}Scene{{/crossLink}}.

         Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
         {{#crossLink "Scene"}}Scene{{/crossLink}} by default.

         xeogl creates the default {{#crossLink "Scene"}}Scene{{/crossLink}} as soon as you either
         reference this property for the first time, or create your first {{#crossLink "Entity"}}Entity{{/crossLink}} without
         a specified {{#crossLink "Scene"}}Scene{{/crossLink}}.

         @property scene
         @namespace xeogl
         @final
         @type Scene
         */
        get scene() {

            // xeogl.Scene constructor will call this._addScene
            // to register itself on xeogl

            return this._scene || (this._scene = new window.xeogl.Scene({
                    id: "default.scene"
                }));
        },

        set scene(value) {
            this._scene = value;
        },

        /**
         * Registers a scene on xeogl.
         * This is called within the xeogl.Scene constructor.
         *
         * @method _addScene
         * @param {Scene} scene The scene
         * @private
         */
        _addScene: function (scene) {

            this._sceneIDMap = this._sceneIDMap || new window.xeogl.utils.Map();

            if (scene.id) {

                // User-supplied ID

                if (this.scenes[scene.id]) {
                    console.error("[ERROR] Scene " + xeogl._inQuotes(scene.id) + " already exists");
                    return;
                }

            } else {

                // Auto-generated ID

                scene.id = this._sceneIDMap.addItem(scene);
            }

            this.scenes[scene.id] = scene;

            var ticksPerRender = scene.ticksPerRender;

            this._scenesRenderInfo[scene.id] = {
                ticksPerRender: ticksPerRender,
                renderCountdown: ticksPerRender
            };

            this.stats.components.scenes++;

            var self = this;

            // Unregister destroyed scenes

            scene.on("destroyed",
                function () {

                    self._sceneIDMap.removeItem(scene.id);

                    delete self.scenes[scene.id];
                    delete self._scenesRenderInfo[scene.id];

                    self.stats.components.scenes--;
                });
        },

        /**
         * Schedule a task for xeogl to run at the next frame.
         *
         * Internally, this pushes the task to a FIFO queue. Within each frame interval, xeogl processes the queue
         * for a certain period of time, popping tasks and running them. After each frame interval, tasks that did not
         * get a chance to run during the task are left in the queue to be run next time.
         *
         * @method scheduleTask
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
            var tasksRun = 0;

            while (taskQueue.length > 0 && time < until) {
                callback = taskQueue.shift();
                scope = taskQueue.shift();
                if (scope) {
                    callback.call(scope);
                } else {
                    callback();
                }
                time = (new Date()).getTime();
                tasksRun++;
            }

            return tasksRun;
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
            return xeogl._isString(value) || xeogl._isNumeric(value);
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

            var id1 = (xeogl.prototype._isNumeric(c1) || xeogl.prototype._isString(c1)) ? "" + c1 : c1.id;
            var id2 = (xeogl.prototype._isNumeric(c2) || xeogl.prototype._isString(c2)) ? "" + c2 : c2.id;

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

        /**
         * Tests if the given value is a JavaScript JSON object, eg, ````{ foo: "bar" }````.
         * @param value
         * @returns {boolean}
         * @private
         */
        _isObject: (function () {
            var objectConstructor = {}.constructor;
            return function (value) {
                return (!!value && value.constructor === objectConstructor);
            };
        })(),

        /**
         * Tests if the given component type is a subtype of another component supertype.
         * @param {String} type
         * @param {String} [superType="xeogl.Component"]
         * @returns {boolean}
         * @private
         */
        _isComponentType: function (type, superType) {

            superType = superType || "xeogl.Component";

            if (type === superType) {
                return true;
            }

            var superTypes = this._superTypes[type];

            if (!superTypes) {
                return false;
            }

            for (var i = superTypes.length - 1; i >= 0; i--) {
                if (superTypes[i] === superType) {
                    return true;
                }
            }

            return false;
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
        },

        /**
         * Returns the concatenation of two typed arrays.
         * @param a
         * @param b
         * @returns {*|a}
         * @private
         */
        _concat: function (a, b) {
            var c = new a.constructor(a.length + b.length);
            c.set(a);
            c.set(b, a.length);
            return c;
        }
    };

    // Have a lower-case xeogl namespace as well,
    // just because it's easier to type when live-coding

    window.xeogl = window.xeogl = new xeogl();

})
();
