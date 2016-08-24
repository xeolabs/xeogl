(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     *  Renderer compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
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
    XEO.renderer.Renderer = function (stats, cfg) {

        // Collects runtime statistics
        this.stats = stats || {};

        // Renderer is bound to the lifetime of an HTML5 canvas
        this._canvas = cfg.canvas;

        // Factory which creates and recycles XEO.renderer.Program instances
        this._programFactory = new XEO.renderer.ProgramFactory(this.stats, {
            canvas: cfg.canvas
        });

        // Factory which creates and recycles XEO.renderer.Object instances
        this._objectFactory = new XEO.renderer.ObjectFactory();

        // Factory which creates and recycles XEO.renderer.Chunk instances
        this._chunkFactory = new XEO.renderer.ChunkFactory();

        // State chunks that are dynamically inserted by the renderer
        this._extraChunks = [];
        this._numExtraChunks = 0;

        /**
         * Indicates if the canvas is transparent
         * @type {boolean}
         */
        this.transparent = cfg.transparent === true;

        /**
         * Optional callback to fire when renderer wants to
         * bind an output framebuffer.
         *
         * When this is missing, the renderer will implicitly bind
         * WebGL's default framebuffer.
         *
         * The callback takes one parameter, which is the index of the current
         * rendering pass in which the buffer is to be bound.
         *
         * Use like this: myRenderer.bindOutputFramebuffer = function(pass) { .. });
         */
        this.bindOutputFramebuffer = null;

        /**
         * Optional callback to fire when renderer wants to
         * unbind any output drawing framebuffer that was
         * previously bound with #bindOutputFramebuffer.
         *
         * Callback takes no parameters.
         */
        this.unbindOutputFramebuffer = null;

        // The objects in the render
        this.objects = {};

        // Ambient color
        this._ambient = null;

        // The object list, containing all elements of #objects, kept in GL state-sorted order
        this._objectList = [];
        this._objectListLen = 0;

        // The "draw list", comprised collectively of three lists of state chunks belong to visible objects
        // within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
        // "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
        // their objects in #_objectList, with runs of duplicate states removed.

        this._objectPickList = [];
        this._objectPickListLen = 0;

        this._drawChunkList = [];      // State chunk list to render all objects
        this._drawChunkListLen = 0;

        this._pickObjectChunkList = [];  // State chunk list to render scene to pick buffer
        this._pickObjectChunkListLen = 0;

        // Tracks the index of the first chunk in the transparency pass. The first run of chunks
        // in the list are for opaque objects, while the remainder are for transparent objects.
        // This supports a mode in which we only render the opaque chunks.
        this._drawChunkListTransparentIndex = -1;

        // The frame context holds state shared across a single render of the
        // draw list, along with any results of the render, such as pick hits
        this._frameCtx = {
            pickObjects: [], // Pick names of objects hit during pick render
            canvas: this._canvas,
            renderTarget: null,
            renderBuf: null,
            depthbufEnabled: null,
            clearDepth: null,
            depthFunc: null,
            blendEnabled: false,
            backfaces: true,
            frontface: true, // true = "ccw" else "cw"
            pickIndex: 0, // Indexes this._pickObjects
            textureUnit: 0,
            transparent: false, // True while rendering transparency bin
            ambientColor: null,
            drawElements: 0,
            useProgram: 0,
            bindTexture: 0,
            bindArray: null,
            pass: null,
            bindOutputFramebuffer: null
        };

        //----------------- Render states --------------------------------------

        /**
         Visibility render state.
         @property visibility
         @type {renderer.Visibility}
         */
        this.visibility = null;

        /**
         Culling render state.
         @property cull
         @type {renderer.Cull}
         */
        this.cull = null;

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
         @type {renderer.Transform}
         */
        this.modelTransform = null;

        /**
         View transform render state.
         @property viewTransform
         @type {renderer.Transform}
         */
        this.viewTransform = null;

        /**
         Projection transform render state.
         @property projTransform
         @type {renderer.Transform}
         */
        this.projTransform = null;

        /**
         Billboard render state.
         @property billboard
         @type {renderer.Billboard}
         */
        this.billboard = null;

        /**
         Stationary render state.
         @property stationary
         @type {renderer.Stationary}
         */
        this.stationary = null;

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

        /**
         Viewport render state.
         @property viewport
         @type {renderer.Viewport}
         */
        this.viewport = null;


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

        // Rebuild pick buffer

        if (this.pickBuf) {
            this.pickBuf.webglRestored(gl);
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
        object.cull = this.cull;
        object.modes = this.modes;
        object.billboard = this.billboard;
        object.stationary = this.stationary;
        object.viewport = this.viewport;

        // Build hash of the object's state configuration. This is used
        // to hash the object's shader so that it may be reused by other
        // objects that have the same state configuration.

        var hash = ([

            // Make sure that every state type
            // with a hash is concatenated here

            this.geometry.hash,
            this.shader.hash,
            this.clips.hash,
            this.material.hash,
            //this.reflect.hash,
            this.lights.hash,
            this.billboard.hash,
            this.stationary.hash

        ]).join(";");

        if (!object.program || hash !== object.hash) {

            // Get new program for object if needed

            if (object.program) {
                this._programFactory.put(object.program);
            }

            object.program = this._programFactory.get(hash, this);

            object.hash = hash;
        }

        var programState = object.program;

        if (programState) {

            var program = programState.program;

            if (!program.allocated || !program.compiled || !program.validated || !program.linked) {

                if (this.objects[objectId]) {

                    // Don't keep faulty objects in the renderer
                    this.removeObject(objectId);
                }

                return {
                    error: true,
                    errorLog: program.errorLog
                }
            }
        }


        // Build sequence of draw chunks on the object

        // The order of some of these is important because some chunks will set
        // state on this._frameCtx to be consumed by other chunks downstream.

        this._setChunk(object, 0, "program", object.program); // Must be first
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
        this._setChunk(object, 12, "viewport", this.viewport);
        this._setChunk(object, 13, "geometry", this.geometry);
        this._setChunk(object, 14, "draw", this.geometry, true); // Must be last

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
    XEO.renderer.Renderer.prototype._setChunk = function (object, order, type, state, neg) {

        var id;

        var chunkType = this._chunkFactory.types[type];

        if (type === "program") {
            id = (object.program.id + 1) * 100000000;

        } else if (chunkType.constructor.prototype.programGlobal) {
            id = state.id;

        } else {
            id = ((object.program.id + 1) * 100000000) + ((state.id + 1));
        }

        if (neg) {
            id *= 100000;
        }

        var oldChunk = object.chunks[order];

        if (oldChunk) {
            this._chunkFactory.putChunk(oldChunk);
        }

        // Attach new chunk

        object.chunks[order] = this._chunkFactory.getChunk(id, type, object.program.program, state);

        // Ambient light is global across everything in display, and
        // can never be disabled, so grab it now because we want to
        // feed it to gl.clearColor before each display list render

        if (type === "lights") {
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

                this._ambient = light;
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

            // Object not found
            return;
        }

        // Release draw chunks
        var chunks = object.chunks;
        for (var i = 0, len = chunks.length; i < len; i++) {
            this._chunkFactory.putChunk(chunks[i]);
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
            this._doDrawList({                  // Render the draw list
                clear: (params.clear !== false), // Clear buffers by default
                opaqueOnly: params.opaqueOnly,
                pass: params.pass
            });
            this.stats.frame.frameCount++;
            this.imageDirty = false;
        }
    };

    /**
     * Builds the object list from the object map
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
     * Generates object state sort keys
     */
    XEO.renderer.Renderer.prototype._makeStateSortKeys = function () {
        var object;
        for (var i = 0, len = this._objectListLen; i < len; i++) {
            object = this._objectList[i];
            if (!object.program) { // Non-visual object (eg. sound)
                object.sortKey = -1;
            } else {
                object.sortKey =
                    ((object.stage.priority + 1) * 10000000000000000)
                    + ((object.modes.transparent ? 2 : 1) * 100000000000000)
                    + ((object.layer.priority + 1) * 10000000000000)
                    + ((object.program.id + 1) * 100000000)
                    + ((object.material.id + 1) * 10000)
                    + object.geometry.id;
            }
        }
    };

    /**
     * State-sorts the object list
     */
    XEO.renderer.Renderer.prototype._stateSort = function () {
        this._objectList.length = this._objectListLen;
        this._objectList.sort(function (a, b) {
            return a.sortKey - b.sortKey;
        });
    };

    /**
     * Logs the object list
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

        this._clearExtraChunks();

        this._lastDrawChunkId = this._lastDrawChunkId || [];
        this._lastPickObjectChunkId = this._lastPickObjectChunkId || [];

        var i;
        var len;

        for (i = 0; i < 20; i++) {
            this._lastDrawChunkId[i] = null;
            this._lastPickObjectChunkId[i] = null;
        }

        this._drawChunkListLen = 0;
        this._pickObjectChunkListLen = 0;

        // For each render target, a list of objects to render to that target
        var targetObjectLists = {};

        // A list of all the render target object lists
        var targetListList = [];

        // List of all targets
        var targetList = [];

        var object;
        var colorRenderBuf;
        var depthRenderBuf;
        var target;
        var targetChunk;
        var list;
        var id;

        this._objectDrawList = this._objectDrawList || [];
        this._objectDrawListLen = 0;
        this._objectPickListLen = 0;

        for (i = 0, len = this._objectListLen; i < len; i++) {

            object = this._objectList[i];

            // Skip culled objects

            if (object.cull.culled === true) {
                continue;
            }

            // Skip invisible objects

            if (object.visibility.visible === false) {
                continue;
            }

            // Put objects with render targets into a bin for each target

            colorRenderBuf = object.colorTarget ? object.colorTarget.renderBuf : null;
            depthRenderBuf = object.depthTarget ? object.depthTarget.renderBuf : null;

            if (colorRenderBuf) {

                target = object.colorTarget;

                list = targetObjectLists[target.id];

                if (!list) {

                    list = [];

                    targetObjectLists[target.id] = list;

                    targetListList.push(list);

                    id = -this._numExtraChunks;

                    targetChunk = this._chunkFactory.getChunk(id, "renderTarget", object.program.program, target);

                    this._extraChunks[this._numExtraChunks++] = targetChunk;

                    targetList.push(targetChunk);
                }

                list.push(object);

            } else if (depthRenderBuf) {

                target = object.depthTarget;

                list = targetObjectLists[target.id];

                if (!list) {

                    list = [];

                    targetObjectLists[target.id] = list;

                    targetListList.push(list);

                    id = -this._numExtraChunks;

                    targetChunk = this._chunkFactory.getChunk(id, "renderTarget", object.program.program, target);

                    this._extraChunks[this._numExtraChunks++] = targetChunk;

                    targetList.push(targetChunk);
                }

                list.push(object);

            } else {

                // Put objects without render targets into their own list

                this._objectDrawList[this._objectDrawListLen++] = object;
            }
        }

        // Append chunks for objects within render targets first

        var pickable;
        var renderTargetBound = false;

        for (i = 0, len = targetListList.length; i < len; i++) {

            targetChunk = targetList[i];
            list = targetListList[i];

            this._appendRenderTargetChunk(targetChunk);

            for (var j = 0, lenj = list.length; j < lenj; j++) {

                object = list[j];

                pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages

                this._appendObjectToDrawChunkLists(object, pickable);

                renderTargetBound = true;
            }
        }

        if (renderTargetBound) {

            // Unbinds any render target bound previously

            id = this._numExtraChunks * -1000.0;

            this._appendRenderTargetChunk(this._chunkFactory.getChunk(id, "renderTarget", object.program.program, {}));

            this._extraChunks[this._numExtraChunks++] = targetChunk;
        }

        // Append chunks for objects not in render targets

        for (i = 0, len = this._objectDrawListLen; i < len; i++) {

            object = this._objectDrawList[i];

            pickable = !object.stage || (object.stage && object.stage.pickable); // Don't pick unpickable stages, ie. FX passes

            this._appendObjectToDrawChunkLists(object, pickable);
        }

        // Draw list is now up to date.

        this.drawListDirty = false;
    };

    XEO.renderer.Renderer.prototype._clearExtraChunks = function () {
        for (var i = 0, len = this._numExtraChunks; i < len; i++) {
            this._chunkFactory.putChunk(this._extraChunks[i]);
        }
        this._numExtraChunks = 0;
    };

    XEO.renderer.Renderer.prototype._appendRenderTargetChunk = function (chunk) {
        this._drawChunkList[this._drawChunkListLen++] = chunk;
    };

    /**
     * Appends an object to the draw and pick lists.
     * @param object
     * @param pickable
     * @private
     */
    XEO.renderer.Renderer.prototype._appendObjectToDrawChunkLists = function (object, pickable) {

        pickable = pickable && object.modes.pickable;

        var chunks = object.chunks;
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

                    // Draw pass

                    if (chunk.unique || this._lastDrawChunkId[i] !== chunk.id) {

                        // Don't reapply repeated chunks

                        this._drawChunkList[this._drawChunkListLen] = chunk;
                        this._lastDrawChunkId[i] = chunk.id;

                        if (chunk.state && chunk.state.transparent && this._drawChunkListTransparentIndex < 0) {
                            this._drawChunkListTransparentIndex = this._drawChunkListLen;
                        }

                        this._drawChunkListLen++
                    }
                }

                if (chunk.pickObject) {

                    // Object-picking pass

                    if (pickable) {

                        // Don't pick unpickable objects

                        if (chunk.unique || this._lastPickObjectChunkId[i] !== chunk.id) {

                            // Don't reapply repeated chunks

                            this._pickObjectChunkList[this._pickObjectChunkListLen++] = chunk;
                            this._lastPickObjectChunkId[i] = chunk.id;
                        }
                    }
                }
            }
        }

        if (pickable) {
            this._objectPickList[this._objectPickListLen++] = object;
        }
    };

    /**
     * Logs the contents of the draw list to the console.
     *
     * @private
     */
    XEO.renderer.Renderer.prototype._logDrawList = function () {

        console.log("--------------------------------------------------------------------------------------------------");
        console.log(this._drawChunkListLen + " draw list chunks");

        for (var i = 0, len = this._drawChunkListLen; i < len; i++) {

            var chunk = this._drawChunkList[i];

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
        console.log(this._pickObjectChunkListLen + " pick list chunks");

        for (var i = 0, len = this._pickObjectChunkListLen; i < len; i++) {

            var chunk = this._pickObjectChunkList[i];

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
     * Attempts to pick an object at the given canvas coordinates.
     *
     * @param {*} params Picking params.
     * @returns {*} Hit result, if any.
     */
    XEO.renderer.Renderer.prototype.pick = function (params) {

        var gl = this._canvas.gl;

        var hit = null;

        var canvasX = params.canvasPos[0];
        var canvasY = params.canvasPos[1];

        var pickBuf = this.pickBuf;

        if (!pickBuf) {

            // Lazy-create the pick buffer

            pickBuf = new XEO.renderer.webgl.RenderBuffer({
                gl: this._canvas.gl,
                canvas: this._canvas.canvas
            });

            this.pickBuf = pickBuf;
        }

        // Do any pending render

        this.render();

        pickBuf.bind();

        pickBuf.clear();

        this._doDrawList({
            pickObject: true,
            clear: true
        });

        //     gl.finish();

        // Convert picked pixel color to object index

        var pix = pickBuf.read(canvasX, canvasY);
        var pickedObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        pickedObjectIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;

        var object = this._objectPickList[pickedObjectIndex];

        if (object) {

            // Object was picked

            hit = {
                entity: object.id,
                canvasPos: [
                    canvasX,
                    canvasY
                ]
            };

            // Now do a primitive-pick if requested

            if (params.rayPick) {

                pickBuf.clear();

                this._doDrawList({
                    rayPick: true,
                    object: object,
                    clear: true
                });

                gl.finish();

                // Convert picked pixel color to primitive index

                pix = pickBuf.read(canvasX, canvasY);
                var primIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);
                primIndex *= 3; // Convert from triangle number to first vertex in indices

                hit.primIndex = primIndex;
            }
        }

        pickBuf.unbind();

        return hit;
    };

    /** Renders either the draw or pick list.
     *
     * @param {*} params
     * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
     * @param {Boolean} params.pickObject
     * @param {Boolean} params.rayPick
     * @param {Boolean} params.object
     * @param {Boolean} params.opaqueOnly
     * @private
     */
    XEO.renderer.Renderer.prototype._doDrawList = function (params) {

        var gl = this._canvas.gl;
        var i;
        var len;

        var outputFramebuffer = this.bindOutputFramebuffer && this.unbindOutputFramebuffer && !params.pickObject && !params.rayPick;

        if (outputFramebuffer) {
            this.bindOutputFramebuffer(params.pass);
        }

        var ambient = this._ambient;
        var ambientColor;
        if (ambient) {
            var color = ambient.color;
            var intensity = ambient.intensity;
            ambientColor = [color[0] * intensity, color[1] * intensity, color[2] * intensity, 1.0];
        } else {
            ambientColor = [0, 0, 0];
        }

        var frameCtx = this._frameCtx;

        frameCtx.renderTarget = null;
        frameCtx.renderBuf = null;
        frameCtx.depthbufEnabled = null;
        frameCtx.clearDepth = null;
        frameCtx.depthFunc = gl.LESS;
        frameCtx.blendEnabled = false;
        frameCtx.backfaces = true;
        frameCtx.frontface = true; // true == "ccw" else "cw"
        frameCtx.pickIndex = 0; // Indexes this._pickObjects
        frameCtx.textureUnit = 0;
        frameCtx.transparent = false; // True while rendering transparency bin
        frameCtx.ambientColor = ambientColor;
        frameCtx.drawElements = 0;
        frameCtx.useProgram = 0;
        frameCtx.bindTexture = 0;
        frameCtx.bindArray = 0;
        frameCtx.pass = params.pass;
        frameCtx.bindOutputFramebuffer = this.bindOutputFramebuffer;

        // The extensions needs to be re-queried in case the context was lost and has been recreated.
        if (XEO.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {
            gl.getExtension("OES_element_index_uint");
        }

        var frameStats = this.stats.frame;

        frameStats.setUniform = 0;
        frameStats.setUniformCacheHits = 0;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        gl.enable(gl.DEPTH_TEST);

        if (this.transparent || params.pickObject || params.rayPick) {

            // Canvas is transparent - set clear color with zero alpha
            // to allow background to show through

            gl.clearColor(0, 0, 0, 0);

        } else {

            // Canvas is opaque - set clear color to the current ambient
            // color, which can be provided by an ambient light source

            gl.clearColor(ambientColor[0], ambientColor[1], ambientColor[2], 1.0);
        }

        if (params.clear) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        }

        gl.frontFace(gl.CCW);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);

        if (params.pickObject) {

            // Pick an object

            for (i = 0, len = this._pickObjectChunkListLen; i < len; i++) {
                this._pickObjectChunkList[i].pickObject(frameCtx);
            }

        } else if (params.rayPick) {

            // Pick a primitive of an object

            if (params.object) {

                var chunks = params.object.chunks;
                var chunk;

                for (i = 0, len = chunks.length; i < len; i++) {
                    chunk = chunks[i];
                    if (chunk.pickPrimitive) {
                        chunk.pickPrimitive(frameCtx);
                    }
                }
            }

        } else {

            // Render all visible objects

            var startTime = (new Date()).getTime();

            // Option to only render opaque objects
            len = (params.opaqueOnly && this._drawChunkListTransparentIndex >= 0 ? this._drawChunkListTransparentIndex : this._drawChunkListLen);

            for (i = 0; i < len; i++) {
                this._drawChunkList[i].draw(frameCtx);
            }

            var endTime = (new Date()).getTime();

            frameStats.renderTime = (endTime - startTime) / 1000.0;
            frameStats.drawElements = frameCtx.drawElements;
            frameStats.useProgram = frameCtx.useProgram;
            frameStats.bindTexture = frameCtx.bindTexture;
            frameStats.bindArray = frameCtx.bindArray;
        }

      //  gl.finish();

        if (frameCtx.renderBuf) {
            frameCtx.renderBuf.unbind();
        }

        var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        for (var ii = 0; ii < numTextureUnits; ++ii) {
            gl.activeTexture(gl.TEXTURE0 + ii);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        if (outputFramebuffer) {
            this.unbindOutputFramebuffer();
        }

        frameStats.drawChunks = this._drawChunkListLen;
    };

    /**
     * Reads the colors of some pixels in the last rendered frame.
     *
     * @param {Float32Array} pixels
     * @param {Float32Array} colors
     * @param {Number} len
     * @param {Boolean} opaqueOnly
     */
    XEO.renderer.Renderer.prototype.readPixels = function (pixels, colors, len, opaqueOnly) {

        if (!this._readPixelBuf) {
            this._readPixelBuf = new XEO.renderer.webgl.RenderBuffer({
                gl: this._canvas.gl,
                canvas: this._canvas.canvas
            });
        }

        this._readPixelBuf.bind();

        this._readPixelBuf.clear();

        this.render({
            force: true,
            opaqueOnly: opaqueOnly
        });

        var color;
        var i;
        var j;
        var k;

        for (i = 0; i < len; i++) {

            j = i * 2;
            k = i * 4;

            color = this._readPixelBuf.read(pixels[j], pixels[j + 1]);

            colors[k] = color[0];
            colors[k + 1] = color[1];
            colors[k + 2] = color[2];
            colors[k + 3] = color[3];
        }

        this._readPixelBuf.unbind();
    };

    /**
     * Destroys this Renderer.
     */
    XEO.renderer.Renderer.prototype.destroy = function () {
        this._programFactory.destroy();
    };
})();
