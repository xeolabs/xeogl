(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     * @class Renderer compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
     *
     * <p>A Renderer is a container of {@link XEO.renderer.Object}s which are created (or updated) by a depth-first
     * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
     *
     * <h2>Rendering Pipeline</h2>
     *
     * <p>Conceptually, a Renderer implements a pipeline with the following stages:</p>
     *
     * <ol>
     * <li>Create or update {@link XEO.renderer.Object}s during scene compilation</li>
     * <li>Organise the {@link XEO.renderer.Object} into an <b>object list</b></li>
     * <li>Determine the GL state sort order for the object list</li>
     * <li>State sort the object list</li>
     * <li>Create a <b>draw list</b> containing {@link XEO.renderer.Chunk}s belonging to the {@link XEO.renderer.Object}s in the object list</li>
     * <li>Render the draw list to draw the image</li>
     * </ol>
     *
     * <p>An update to the scene causes the pipeline to be re-executed from one of these stages, and SceneJS is designed
     * so that the pipeline is always re-executed from the latest stage possible to avoid redoing work.</p>
     *
     * <p>For example:</p>
     *
     * <ul>
     * <li>when an object is created or updated, we need to (re)do stages 2, 3, 4, 5 and 6</li>
     * <li>when an object is made invisible, we need to redo stages 5 and 6</li>
     * <li>when an object is assigned to a different scene render layer (works like a render bin), we need to redo
     *   stages 3, 4, 5, and 6</li>
     *<li>when the colour of an object changes, or maybe when the viewpoint changes, we simplt redo stage 6</li>
     * </ul>
     *
     * <h2>Object Creation</h2>
     * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
     * "compiling" the scene graph into the Renderer. As traversal visits each scene component, the component's state core is
     * set on the Renderer (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
     * cores that are active at that instant during compilation. Each of the scene's leaf components is always
     * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildObject} to create an
     * object in the soup. For each of the currently active cores, the object is given a {@link XEO.renderer.Chunk}
     * containing the WebGL calls for rendering it.</p>
     *
     * <p>The object also gets a shader (implemented by {@link XEO.renderer.Program}), taylored to render those state cores.</p>
     *
     * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
     * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildObject}
     * may update the {@link XEO.renderer.Chunk}s on the object as required for any changes in the core soup since the
     * last time the object was built. If differences among the cores require it, then {@link #buildObject} may also replace
     * the object's {@link XEO.renderer.Program} in order to render the new core soup configuration.</p>
     *
     * <p>So in summary, to each {@link XEO.renderer.Object} it builds, {@link #buildObject} creates a list of
     * {@link XEO.renderer.Chunk}s to render the set of component state cores that are currently set on the {@link XEO.Renderer}.
     * When {@link #buildObject} is re-building an existing object, it may replace one or more {@link XEO.renderer.Chunk}s
     * for state cores that have changed from the last time the object was built or re-built.</p>

     * <h2>Object Destruction</h2>
     * <p>Destruction of a scene graph branch simply involves a call to {@link #removeObject} for each {@link SceneJS.Geometry}
     * in the branch.</p>
     *
     * <h2>Draw List</h2>
     * <p>The draw list is actually comprised of two lists of state chunks: a "pick" list to render a pick buffer
     * for colour-indexed GPU picking, along with a "draw" list for normal image rendering. The chunks in these lists
     * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.</p>
     *
     * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
     * then lazy-redone on the next call to #render or #pick.</p>
     */
    XEO.renderer.Renderer = function (cfg) {

        // Renderer is bound to the lifetime of an HTML5 canvas
        this._canvas = cfg.canvas;

        // Factory which creates and recycles XEO.renderer.Program instances
        this._programFactory = new XEO.renderer.ProgramFactory({
            canvas: cfg.canvas
        });

        // Factory which creates and recycles XEO.renderer.Object instances
        this._objectFactory = new XEO.renderer.ObjectFactory();

        // Factory which creates and recycles XEO.renderer.Chunk instances
        this._chunkFactory = new XEO.renderer.ChunkFactory();

        /**
         * Indicates if the canvas is transparent
         * @type {boolean}
         */
        this.transparent = cfg.transparent === true;

        // The objects in the render
        this.objects = {};

        // Ambient color
        this._ambientColor = [0, 0, 0, 1.0];

        // The object list, containing all elements of #objects, kept in GL state-sorted order
        this._objectList = [];
        this._objectListLen = 0;

        // The "draw list", comprised collectively of three lists of state chunks belong to visible objects
        // within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
        // "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
        // their objects in #_objectList, with runs of duplicate states removed.

        this._drawList = [];      // State chunk list to render all objects
        this._drawListLen = 0;

        this._pickDrawList = [];  // State chunk list to render scene to pick buffer
        this._pickDrawListLen = 0;


        // The frame context holds state shared across a single render of the
        // draw list, along with any results of the render, such as pick hits
        this._frameCtx = {
            pickObjects: [], // Pick names of objects hit during pick render
            canvas: this._canvas
        };

        //----------------- Render states --------------------------------------

        /**
         Visibility render state.
         @property visibility
         @type {renderer.Visibility}
         */
        this.visibility = null;

        /**
         Modes render state.
         @property modes
         @type {renderer.Modes}
         */
        this.modes = null;

        /**
         Render state for an effects layer.
         @property layer
         @type {renderer.Layer}
         */
        this.layer = null;

        /**
         Render state for an effects pipeline stage.
         @property stage
         @type {renderer.Layer}
         */
        this.stage = null;

        /**
         Depth buffer render state.
         @property depthBuf
         @type {renderer.DepthBuf}
         */
        this.depthBuf = null;

        /**
         Color buffer render state.
         @property colorBuf
         @type {renderer.ColorBuf}
         */
        this.colorBuf = null;

        /**
         Lights render state.
         @property lights
         @type {renderer.Lights}
         */
        this.lights = null;

        /**
         Material render state.
         @property material
         @type {renderer.Material}
         */
        this.material = null;

        /**
         Environmental reflection render state.
         @property reflection
         @type {renderer.Reflect}
         */
        this.reflect = null;

        /**
         Modelling transform render state.
         @property modelTransform
         @type {renderer.ModelTransform}
         */
        this.modelTransform = null;

        /**
         View transform render state.
         @property viewTransform
         @type {renderer.ViewTransform}
         */
        this.viewTransform = null;

        /**
         Projection transform render state.
         @property projTransform
         @type {renderer.ProjTransform}
         */
        this.projTransform = null;

        /**
         Color target render state.
         @property colorTarget
         @type {renderer.RenderTarget}
         */
        this.colorTarget = null;

        /**
         Depth target render state.
         @property depthTarget
         @type {renderer.RenderTarget}
         */
        this.depthTarget = null;

        /**
         Cross-section planes render state.
         @property clips
         @type {renderer.Clips}
         */
        this.clips = null;

        /**
         Morph targets render state.
         @property morphTargets
         @type {renderer.MorphTargets}
         */
        this.morphTargets = null;

        /**
         Custom shader render state.
         @property shader
         @type {renderer.Shader}
         */
        this.shader = null;

        /**
         Render state providing custom shader params.
         @property shaderParams
         @type {renderer.Shader}
         */
        this.shaderParams = null;

        /**
         Geometry render state.
         @property geometry
         @type {renderer.Geometry}
         */
        this.geometry = null;


        //----------------- Renderer dirty flags -------------------------------

        /**
         * Flags the object list as needing to be rebuilt from renderer objects
         * on the next call to {@link #render} or {@link #pick}. Setting this
         * will cause the rendering pipeline to be executed from stage #2
         * (see class comment), causing object list rebuild, state order
         * determination, state sort, draw list construction and image render.
         * @type Boolean
         */
        this.objectListDirty = true;

        /**
         * Flags the object list as needing state orders to be (re)computed on the
         * next call to {@link #render} or {@link #pick}. Setting this will cause
         * the rendering pipeline to be executed from stage #3 (see class comment),
         * causing state order determination, state sort, draw list construction
         * and image render.
         * @type Boolean
         */
        this.stateOrderDirty = true;

        /**
         * Flags the object list as needing to be state-sorted on the next call
         * to {@link #render} or {@link #pick}.Setting this will cause the
         * rendering pipeline to be executed from stage #4 (see class comment),
         * causing state sort, draw list construction and image render.
         * @type Boolean
         */
        this.stateSortDirty = true;

        /**
         * Flags the draw list as needing to be rebuilt from the object list on
         * the next call to {@link #render} or {@link #pick}.  Setting this will
         * cause the rendering pipeline to be executed from stage #5
         * (see class comment), causing draw list construction and image render.
         * @type Boolean
         */
        this.drawListDirty = true;

        /**
         * Flags the image as needing to be redrawn from the draw list on the
         * next call to {@link #render} or {@link #pick}. Setting this will
         * cause the rendering pipeline to be executed from stage #6
         * (see class comment), causing the image render.
         * @type Boolean
         */
        this.imageDirty = true;

        /**
         * Flags the neccessity for the pick buffer to be re-rendered from the
         * draw list.
         * @type Boolean
         */
        this.pickBufDirty = true;

        /**
         * Flags the neccessity for the ray-pick depth buffer to be re-rendered
         * from the draw list.
         * @type Boolean
         */
        this.rayPickBufDirty = true;
    };

    /**
     * Reallocates WebGL resources for objects within this renderer.
     */
    XEO.renderer.Renderer.prototype.webglRestored = function () {

        // Re-allocate programs
        this._programFactory.webglRestored();

        // Re-bind chunks to the programs
        this._chunkFactory.webglRestored();

        var gl = this._canvas.gl;

        // Rebuild pick buffers

        if (this.pickBuf) {
            this.pickBuf.webglRestored(gl);
        }

        if (this.rayPickBuf) {
            this.rayPickBuf.webglRestored(gl);
        }

        // Need redraw

        this.imageDirty = true;
    };

    /**
     * Internally creates (or updates) a {@link XEO.renderer.Object} of the given
     * ID from whatever component state cores are currently set on this {@link XEO.Renderer}.
     * The object is created if it does not already exist in the display, otherwise
     * it is updated with the current states, possibly replacing states already
     * referenced by the object.
     *
     * @param {String} objectId ID of object to create or update
     */
    XEO.renderer.Renderer.prototype.buildObject = function (objectId) {

        var object = this.objects[objectId];

        if (!object) {
            object = this._objectFactory.get(objectId);
        }

        // Attach to the object any states that we need to get off it later.
        // Most of these will be used when composing the object's shader.

        object.stage = this.stage;
        object.layer = this.layer;
        object.colorTarget = this.colorTarget;
        object.depthTarget = this.depthTarget;
        object.material = this.material;
        object.reflect = this.reflect;
        object.geometry = this.geometry;
        object.visibility = this.visibility;
        object.modes = this.modes;

        // Build hash of the object's state configuration. This is used
        // to hash the object's shader so that it may be reused by other
        // objects that have the same state configuration.

        var hash = ([

            // Make sure that every state type
            // with a hash is concatenated here

            this.geometry.hash,
            this.shader.hash,
            this.clips.hash,
            //this.morphTargets.hash,
            this.material.hash,
            //this.reflect.hash,
            this.lights.hash

        ]).join(";");

        if (!object.program || hash !== object.hash) {

            // Get new program for object if needed

            if (object.program) {
                this._programFactory.put(object.program);
            }

            object.program = this._programFactory.get(hash, this);

            object.hash = hash;
        }

        var program = object.program;

        if (!program.allocated || !program.compiled || !program.validated || !program.linked) {

            if (this.objects[objectId]) {

                // Don't keep faulty objects in the renderer
                this.removeObject(objectId);
            }

            return {
                error: true,
                errorLog: object.program.errorLog
            }
        }

        // Build sequence of draw chunks on the object

        // The order of some of these is important because some chunks will set
        // state on this._framectx to be consumed by other chunks downstream.

        this._setChunk(object, 0, "program"); // Must be first
        this._setChunk(object, 1, "modelTransform", this.modelTransform);
        this._setChunk(object, 2, "viewTransform", this.viewTransform);
        this._setChunk(object, 3, "projTransform", this.projTransform);
        this._setChunk(object, 4, "modes", this.modes);
        this._setChunk(object, 5, "shader", this.shader);
        this._setChunk(object, 6, "shaderParams", this.shaderParams);
        this._setChunk(object, 7, "depthBuf", this.depthBuf);
        this._setChunk(object, 8, "colorBuf", this.colorBuf);
        this._setChunk(object, 9, "lights", this.lights);
        this._setChunk(object, 10, this.material.type, this.material); // Supports different material systems
        this._setChunk(object, 11, "clips", this.clips);
        this._setChunk(object, 12, "geometry", this.geometry);
        this._setChunk(object, 13, "draw", this.geometry); // Must be last

        if (!this.objects[objectId]) {

            this.objects[objectId] = object;

            this.objectListDirty = true;

        } else {

            // At the very least, the object sort order will need be recomputed

            this.stateOrderDirty = true;
        }

        return object;
    };

    /** Adds a render state chunk to a render graph object.
     */
    XEO.renderer.Renderer.prototype._setChunk = function (object, order, chunkType, state) {

        var oldChunk = object.chunks[order];

        if (oldChunk) {
            oldChunk.init(oldChunk.id, object, object.program, state);
            return;
        }

        // Attach new chunk

        object.chunks[order] = this._chunkFactory.getChunk(chunkType, object, object.program, state);

        // Ambient light is global across everything in display, and
        // can never be disabled, so grab it now because we want to
        // feed it to gl.clearColor before each display list render

        if (chunkType === "lights") {
            this._setAmbient(state);
        }
    };

    // Sets the singular ambient light.
    XEO.renderer.Renderer.prototype._setAmbient = function (state) {

        var lights = state.lights;
        var light;

        for (var i = 0, len = lights.length; i < len; i++) {

            light = lights[i];

            if (light.type === "ambient") {
                this._ambientColor[0] = light.color[0];
                this._ambientColor[1] = light.color[1];
                this._ambientColor[2] = light.color[2];
            }
        }
    };

    /**
     * Removes an object from this Renderer
     *
     * @param {String} objectId ID of object to remove
     */
    XEO.renderer.Renderer.prototype.removeObject = function (objectId) {

        var object = this.objects[objectId];

        if (!object) {
            return;
        }

        // Release object's shader
        this._programFactory.put(object.program);

        object.program = null;
        object.hash = null;

        // Release object
        this._objectFactory.put(object);

        delete this.objects[objectId];

        // Need to repack object map into fast iteration list
        this.objectListDirty = true;
    };


    /**
     * Renders a new frame, if neccessary.
     */
    XEO.renderer.Renderer.prototype.render = function (params) {

        params = params || {};

        if (this.objectListDirty) {
            this._buildObjectList();        // Build the scene object list
            this.objectListDirty = false;
            this.stateOrderDirty = true;    // Now needs state ordering
        }

        if (this.stateOrderDirty) {
            this._makeStateSortKeys();      // Determine the state sort order
            this.stateOrderDirty = false;
            this.stateSortDirty = true;     // Now needs state sorting
        }

        if (this.stateSortDirty) {
            this._stateSort();              // State sort the scene object list
            this.stateSortDirty = false;
            this.drawListDirty = true;      // Now need to build object draw list
        }

        if (this.drawListDirty) {           // Build draw list from object list
            this._buildDrawList();
            this.imageDirty = true;         // Now need to render the draw list
        }

        if (this.imageDirty || params.force) {

            // Render the draw list

            this._doDrawList({
                clear: (params.clear !== false) // Clear buffers by default
            });

            this.imageDirty = false;
            this.pickBufDirty = true;      // Pick buffer now needs redraw on next pick
        }
    };

    /**
     * (Re)builds the object list from the object soup.
     */
    XEO.renderer.Renderer.prototype._buildObjectList = function () {

        this._objectListLen = 0;

        for (var objectId in this.objects) {
            if (this.objects.hasOwnProperty(objectId)) {

                this._objectList[this._objectListLen++] = this.objects[objectId];
            }
        }
    };

    /**
     * (Re)generates each object's state sort key from it's states.
     */
    XEO.renderer.Renderer.prototype._makeStateSortKeys = function () {

        //  console.log("--------------------------------------------------------------------------------------------------");
        // console.log("XEO.Renderer_makeSortKeys");

        var object;

        for (var i = 0, len = this._objectListLen; i < len; i++) {

            object = this._objectList[i];

            if (!object.program) {

                // Non-visual object (eg. sound)
                object.sortKey = -1;

            } else {

                object.sortKey =
                    ((object.stage.priority + 1) * 1000000000000)
                    + ((object.modes.transparent ? 2 : 1) * 1000000000)
                    + ((object.layer.priority + 1) * 1000000)
                    + ((object.program.id + 1) * 1000)
                    + object.material.id;
            }
        }
        //  console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * State-sorts the object list in ascending order of the object's state sort keys.
     */
    XEO.renderer.Renderer.prototype._stateSort = function () {

        this._objectList.length = this._objectListLen;

        this._objectList.sort(function (a, b) {
            return a.sortKey - b.sortKey;
        });
    };

    /**
     * Logs the object to the console for debugging
     */
    XEO.renderer.Renderer.prototype._logObjectList = function () {
        console.log("--------------------------------------------------------------------------------------------------");
        console.log(this._objectListLen + " objects");
        for (var i = 0, len = this._objectListLen; i < len; i++) {
            var object = this._objectList[i];
            console.log("XEO.Renderer : object[" + i + "] sortKey = " + object.sortKey);
        }
        console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * Builds the draw list, which is the list of draw state-chunks to apply to WebGL
     * to render the visible objects in the object list for the next frame.
     * Preserves the state sort order of the object list among the draw chunks.
     */
    XEO.renderer.Renderer.prototype._buildDrawList = function () {

        this._lastChunkId = this._lastChunkId || [];
        this._lastPickChunkId = this._lastPickChunkId || [];

        for (var i = 0; i < 20; i++) {
            this._lastChunkId[i] = null;
            this._lastPickChunkId[i] = null;
        }

        this._drawListLen = 0;
        this._pickDrawListLen = 0;

        // For each render target, a list of objects to render to that target
        var targetObjectLists = {};

        // A list of all the render target object lists
        var targetListList = [];

        // List of all targets
        var targetList = [];

        var object;
        var targets;
        var target;
        var list;


        this._objectDrawList = this._objectDrawList || [];
        this._objectDrawListLen = 0;

        for (var i = 0, len = this._objectListLen; i < len; i++) {

            object = this._objectList[i];

            // Cull invisible objects

            if (object.visibility.visible === false) {
                continue;
            }

            // Put objects with render targets into a bin for each target

            if (object.colorTarget || object.depthTarget) {

                if (object.colorTarget) {

                    target = object.colorTarget;

                    list = targetObjectLists[target.id];

                    if (!list) {

                        list = [];

                        targetObjectLists[target.id] = list;

                        targetListList.push(list);

                        targetList.push(this._chunkFactory.getChunk("renderTarget", object, object.program, target));
                    }

                    list.push(object);
                }

                if (object.depthTarget) {

                    target = object.colorTarget;

                    list = targetObjectLists[target.id];

                    if (!list) {

                        list = [];

                        targetObjectLists[target.id] = list;

                        targetListList.push(list);

                        targetList.push(this._chunkFactory.getChunk("renderTarget", object, object.program, target));
                    }

                    list.push(object);
                }

            } else {

                // Put objects without render targets into their own list

                this._objectDrawList[this._objectDrawListLen++] = object;
            }
        }

        // Append chunks for objects within render targets first

        var pickable;

        for (var i = 0, len = targetListList.length; i < len; i++) {

            list = targetListList[i];
            target = targetList[i];

            this._appendRenderTargetChunk(target);

            for (var j = 0, lenj = list.length; j < lenj; j++) {

                object = list[j];

                pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages

                this._appendObjectToDrawLists(object, pickable);
            }
        }

        if (object) {

            // Unbinds any render target bound previously

            this._appendRenderTargetChunk(this._chunkFactory.getChunk("renderTarget", object, object.program, {}));
        }

        // Append chunks for objects not in render targets

        for (var i = 0, len = this._objectDrawListLen; i < len; i++) {

            object = this._objectDrawList[i];

            pickable = !object.stage || (object.stage && object.stage.pickable); // We'll only pick objects in pickable stages

            this._appendObjectToDrawLists(object, pickable);
        }

        // Draw list is now up to date.

        this.drawListDirty = false;
    };


    XEO.renderer.Renderer.prototype._appendRenderTargetChunk = function (chunk) {
        this._drawList[this._drawListLen++] = chunk;
    };

    /**
     * Appends an object to the draw and pick lists.
     * @param object
     * @param pickable
     * @private
     */
    XEO.renderer.Renderer.prototype._appendObjectToDrawLists = function (object, pickable) {

        var chunks = object.chunks;
        var picking = object.modes.picking;
        var chunk;

        for (var i = 0, len = chunks.length; i < len; i++) {

            chunk = chunks[i];

            if (chunk) {

                // As we apply the state chunk lists we track the ID of most types
                // of chunk in order to cull redundant re-applications of runs
                // of the same chunk - except for those chunks with a 'unique' flag,
                // because we don't want to collapse runs of draw chunks because
                // they contain the GL drawElements calls which render the objects.

                if (chunk.draw) {

                    // Rendering pass

                    if (chunk.unique || this._lastChunkId[i] !== chunk.id) {

                        // Don't reapply repeated chunks

                        this._drawList[this._drawListLen++] = chunk;
                        this._lastChunkId[i] = chunk.id;
                    }
                }

                if (chunk.pick) {

                    // Picking pass

                    if (pickable !== false) {

                        // Don't pick objects in unpickable stages

                        if (picking) {

                            // Don't pick unpickable objects

                            if (chunk.unique || this._lastPickChunkId[i] !== chunk.id) {

                                // Don't reapply repeated chunks

                                this._pickDrawList[this._pickDrawListLen++] = chunk;
                                this._lastPickChunkId[i] = chunk.id;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Logs the contents of the draw list to the console.
     *
     * @private
     */
    XEO.renderer.Renderer.prototype._logDrawList = function () {

        console.log("--------------------------------------------------------------------------------------------------");
        console.log(this._drawListLen + " draw list chunks");

        for (var i = 0, len = this._drawListLen; i < len; i++) {

            var chunk = this._drawList[i];

            console.log("[chunk " + i + "] type = " + chunk.type);

            switch (chunk.type) {
                case "draw":
                    console.log("\n");
                    break;

                case "renderTarget":
                    console.log(" type = renderTarget");
                    break;
            }
        }

        console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * Logs the contents of the pick list to the console.
     *
     * @private
     */
    XEO.renderer.Renderer.prototype._logPickList = function () {

        console.log("--------------------------------------------------------------------------------------------------");
        console.log(this._pickDrawListLen + " pick list chunks");

        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {

            var chunk = this._pickDrawList[i];

            console.log("[chunk " + i + "] type = " + chunk.type);

            switch (chunk.type) {
                case "draw":
                    console.log("\n");
                    break;
                case "renderTarget":
                    console.log(" type = renderTarget");
                    break;
            }
        }

        console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * Attempts to pick a renderer object at the given canvas coordinates.
     *
     * @param {*} params Picking params.
     * @returns {*} Hit result, if any.
     */
    XEO.renderer.Renderer.prototype.pick = function (params) {

        var canvas = this._canvas.canvas;

        var hit = null;

        var canvasX = params.canvasPos[0];
        var canvasY = params.canvasPos[1];

        var pickBuf = this.pickBuf;

        // Lazy-create the pick buffer

        if (!pickBuf) {

            pickBuf = new XEO.renderer.webgl.RenderBuffer({
                gl: this._canvas.gl,
                canvas: this._canvas
            });

            this.pickBuf = pickBuf;

            this.pickBufDirty = true;
        }

        // Do any pending render

        this.render();

        // Colour-index pick to find the picked object

        pickBuf.bind();

        // Re-render the pick buffer if the image
        // was updated by the render we just did

        if (this.pickBufDirty) {

            pickBuf.clear();

            // Do a color-index picking pass over the draw list

            this._doDrawList({
                pick: true,
                clear: true
            });

            this._canvas.gl.finish();

            this.pickBufDirty = false;

            // Because the image was updated, we'll also need
            // to re-render the ray-pick depth buffer

            this.rayPickBufDirty = true;
        }

        // Read pixel color in pick buffer at given coordinates,
        // convert to an index into the pick name list

        var pix = pickBuf.read(canvasX, canvasY);
        var pickedObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        var pickIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;

        pickBuf.unbind();

        // Look up pick name from index

        var object = this._frameCtx.pickObjects[pickIndex];

        if (object) {

            // Object was picked
            // Build hit report

            hit = {
                object: object,
                canvasPos: [
                    canvasX,
                    canvasY
                ]
            };

            // Now do a ray-pick if requested

            if (params.rayPick) {

                // Lazy-create ray pick depth buffer

                var rayPickBuf = this.rayPickBuf;

                if (!rayPickBuf) {

                    rayPickBuf = new XEO.renderer.webgl.RenderBuffer({
                        gl: this._canvas.gl,
                        canvas: this._canvas
                    });

                    this.rayPickBuf = rayPickBuf;

                    this.rayPickBufDirty = true;
                }

                // Render depth values to the ray-pick depth buffer

                rayPickBuf.bind();

                if (this.rayPickBufDirty) {

                    rayPickBuf.clear();

                    this._doDrawList({
                        object: object,  // Render just the picked object
                        pick: true,
                        rayPick: true,
                        clear: true
                    });

                    this.rayPickBufDirty = false;
                }

                // Read pixel from depth buffer, convert to normalised device Z coordinate,
                // which will be in range of [0..1] with z=0 at front

                pix = rayPickBuf.read(canvasX, canvasY);

                rayPickBuf.unbind();

                // Get World-space ray-intersect position

                var screenZ = this._unpackDepth(pix);
                var w = canvas.width;
                var h = canvas.height;
                // Calculate clip space coordinates, which will be in range
                // of x=[-1..1] and y=[-1..1], with y=(+1) at top
                var x = (canvasX - w / 2) / (w / 2);           // Calculate clip space coordinates
                var y = -(canvasY - h / 2) / (h / 2);
                var projMat = this._frameCtx.projMatrix;
                var viewMat = this._frameCtx.viewMatrix;
                var pvMat = XEO.math.mulMat4(projMat, viewMat, []);
                var pvMatInverse = XEO.math.inverseMat4(pvMat, []);
                var world1 = XEO.math.transformVec4(pvMatInverse, [x, y, -1, 1]);
                world1 = XEO.math.mulVec4Scalar(world1, 1 / world1[3]);
                var world2 = XEO.math.transformVec4(pvMatInverse, [x, y, 1, 1]);
                world2 = XEO.math.mulVec4Scalar(world2, 1 / world2[3]);
                var dir = XEO.math.subVec3(world2, world1, []);
                var vWorld = XEO.math.addVec3(world1, XEO.math.mulVec4Scalar(dir, screenZ, []), []);

                // Got World-space intersect with surface of picked geometry

                hit.worldPos = vWorld;
            }
        }

        return hit;
    };

    /**
     * Unpacks a color-encoded depth
     * @param {Array(Number)} depthZ Depth encoded as an RGBA color value
     * @returns {Number}
     * @private
     */
    XEO.renderer.Renderer.prototype._unpackDepth = function (depthZ) {
        var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
        var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
        return XEO.math.dotVec4(vec, bitShift);
    };

    /** Renders either the draw or pick list.
     *
     * @param {*} params
     * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
     * @param {Boolean} params.pick Set true to render for picking
     * @param {Boolean} params.rayPick Set true to render for ray-picking
     * @private
     */
    XEO.renderer.Renderer.prototype._doDrawList = function (params) {

        var gl = this._canvas.gl;

        // Initialize the renderer frame context.
        // The frame context holds state that will be used by draw list
        // chunks as they are rendered for this frame. Some of the frame context
        // state will also be updated by chunks as they are rendered.

        var frameCtx = this._frameCtx;

        frameCtx.pick = !!params.pick;
        frameCtx.rayPick = !!params.rayPick;
        frameCtx.renderTarget = null;
        frameCtx.renderBuf = null;
        frameCtx.viewMatrix = null;
        frameCtx.projMatrix = null;
        frameCtx.depthbufEnabled = null;
        frameCtx.clearDepth = null;
        frameCtx.depthFunc = gl.LESS;
        frameCtx.blendEnabled = false;
        frameCtx.backfaces = true;
        frameCtx.frontface = true; // true == "ccw" else "cw"
        frameCtx.pickIndex = 0; // Indexes this._pickObjects
        frameCtx.textureUnit = 0;
        frameCtx.lineWidth = 1;
        frameCtx.transparent = false; // True while rendering transparency bin
        frameCtx.ambientColor = this._ambientColor;

        // Set the viewport to the extents of the drawing buffer

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        gl.enable(gl.DEPTH_TEST);

        if (this.transparent) {

            // Canvas is transparent - set clear color with zero alpha
            // to allow background to show through

            gl.clearColor(0, 0, 0, 0);

        } else {

            // Canvas is opaque - set clear color to the current ambient
            // color, which can be provided by an ambient light source

            gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
        }

        if (params.clear) {

            // Clear the various buffers for this frame

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        }

        // "modes" chunks set the backface winding direction
        gl.frontFace(gl.CCW);

        // "modes" chunks set backface culling on/off
        gl.disable(gl.CULL_FACE);

        // Last "modes" chunk in draw list with
        // transparent == true will enable blend
        gl.disable(gl.BLEND);

        if (params.pick) {

            // Pick render

            if (params.object) {

                // Render the pick chunks for a given object
                // TODO

            } else {

                // Render all pick chunks in the draw list

                for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
                    this._pickDrawList[i].pick(frameCtx);
                }
            }

        } else {

            // Render the draw chunk list

            for (var i = 0, len = this._drawListLen; i < len; i++) {
                this._drawList[i].draw(frameCtx);
            }
        }

        gl.flush();

        if (frameCtx.renderBuf) {
            //        frameCtx.renderBuf.unbind();
        }

//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
    };

    /**
     * Destroys this Renderer.
     */
    XEO.renderer.Renderer.prototype.destroy = function () {
        this._programFactory.destroy();
    };

})();
