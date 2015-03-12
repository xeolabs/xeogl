(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    /**
     * @class Display compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
     *
     * <p>A Display is a container of {@link XEO.renderer.GameObject}s which are created (or updated) by a depth-first
     * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
     *
     * <h2>Rendering Pipeline</h2>
     *
     * <p>Conceptually, a Display implements a pipeline with the following stages:</p>
     *
     * <ol>
     * <li>Create or update {@link XEO.renderer.GameObject}s during scene compilation</li>
     * <li>Organise the {@link XEO.renderer.GameObject} into an <b>object list</b></li>
     * <li>Determine the GL state sort order for the object list</li>
     * <li>State sort the object list</li>
     * <li>Create a <b>draw list</b> containing {@link XEO.Chunk}s belonging to the {@link XEO.renderer.GameObject}s in the object list</li>
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
     * <h2>GameObject Creation</h2>
     * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
     * "compiling" the scene graph into the Display. As traversal visits each scene component, the component's state core is
     * set on the Display (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
     * cores that are active at that instant during compilation. Each of the scene's leaf components is always
     * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildGameObject} to create an
     * object in the soup. For each of the currently active cores, the object is given a {@link XEO.Chunk}
     * containing the WebGL calls for rendering it.</p>
     *
     * <p>The object also gets a shader (implemented by {@link XEO.renderer.Program}), taylored to render those state cores.</p>
     *
     * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
     * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildGameObject}
     * may update the {@link XEO.Chunk}s on the object as required for any changes in the core soup since the
     * last time the object was built. If differences among the cores require it, then {@link #buildGameObject} may also replace
     * the object's {@link XEO.renderer.Program} in order to render the new core soup configuration.</p>
     *
     * <p>So in summary, to each {@link XEO.renderer.GameObject} it builds, {@link #buildGameObject} creates a list of
     * {@link XEO.Chunk}s to render the set of component state cores that are currently set on the {@link XEO.Renderer}.
     * When {@link #buildGameObject} is re-building an existing object, it may replace one or more {@link XEO.Chunk}s
     * for state cores that have changed from the last time the object was built or re-built.</p>

     * <h2>GameObject Destruction</h2>
     * <p>Destruction of a scene graph branch simply involves a call to {@link #removeGameObject} for each {@link SceneJS.Geometry}
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

        // Display is bound to the lifetime of an HTML5 canvas
        this._canvas = cfg.canvas;

        // Factory which creates and recycles {@link XEO.renderer.Program} instances
        this._programFactory = new XEO.renderer.ProgramFactory({
            canvas: cfg.canvas
        });

        // Factory which creates and recycles {@link SceneJS.Chunk} instances
        this._chunkFactory = new XEO.renderer.ChunkFactory();

        /**
         * True when the background is to be transparent
         * @type {boolean}
         */
        this.transparent = cfg.transparent === true;

        /**
         * Component state core for the last {@link SceneJS.Enable} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.enable = null;

        /**
         * Component state core for the last {@link SceneJS.Flags} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.flags = null;

        /**
         * Component state core for the last {@link SceneJS.Layer} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.layer = null;

        /**
         * Component state core for the last {@link SceneJS.Stage} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.stage = null;

        /**
         * Component state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.renderer = null;

        /**
         * Component state core for the last {@link SceneJS.DepthBuf} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.depthBuf = null;

        /**
         * Component state core for the last {@link SceneJS.ColorBuf} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.colorBuf = null;

        /**
         * Component state core for the last {@link SceneJS.View} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.view = null;

        /**
         * Component state core for the last {@link SceneJS.Lights} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.lights = null;

        /**
         * Component state core for the last {@link SceneJS.Material} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.material = null;

        /**
         * Component state core for the last {@link SceneJS.Texture} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.texture = null;

        /**
         * Component state core for the last {@link SceneJS.Reflect} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.cubemap = null;

        /**
         * Component state core for the last {@link SceneJS.XForm} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.modelTransform = null;

        /**
         * Component state core for the last {@link SceneJS.LookAt} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.viewTransform = null;

        /**
         * Component state core for the last {@link SceneJS.Camera} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.projTransform = null;

        /**
         * Component state core for the last {@link SceneJS.ColorTarget} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.renderTarget = null;

        /**
         * Component state core for the last {@link SceneJS.Clips} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.clips = null;

        /**
         * Component state core for the last {@link SceneJS.MorphTargets} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.MorphTargets = null;

        /**
         * Component state core for the last {@link SceneJS.Name} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.name = null;

        /**
         * Component state core for the last {@link SceneJS.Tag} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.tag = null;

        /**
         * Component state core for the last {@link SceneJS.Shader} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.shader = null;

        /**
         * Component state core for the last {@link SceneJS.Uniforms} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.uniforms = null;

        /**
         * Component state core for the last {@link SceneJS.Style} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.style = null;

        /**
         * Component state core for the last {@link SceneJS.Geometry} visited during scene graph compilation traversal
         * @type GameObject
         */
        this.geometry = null;

        /* Factory which creates and recycles {@link XEO.renderer.GameObject} instances
         */
        this._objectFactory = new XEO.renderer.ObjectFactory();

        /**
         * The objects in the display
         */
        this._objects = {};

        /**
         * Ambient color, which must be given to gl.clearColor before draw list iteration
         */
        this._ambientColor = [0, 0, 0, 1.0];

        /**
         * The object list, containing all elements of #_objects, kept in GL state-sorted order
         */
        this._objectList = [];
        this._objectListLen = 0;

        /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
         * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
         * "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
         * their objects in #_objectList, with runs of duplicate states removed.
         */
        this._drawList = [];                // State chunk list to render all objects
        this._drawListLen = 0;

        this._pickDrawList = [];            // State chunk list to render scene to pick buffer
        this._pickDrawListLen = 0;

        this._targetList = [];
        this._targetListLen = 0;

        /* The frame context holds state shared across a single render of the draw list, along with any results of
         * the render, such as pick hits
         */
        this._frameCtx = {
            pickNames: [], // Pick names of objects hit during pick render
            canvas: this._canvas,           // The canvas
            VAO: null                       // Vertex array object extension
        };

        /*-------------------------------------------------------------------------------------
         * Flags which schedule what the display is to do when #render is next called.
         *------------------------------------------------------------------------------------*/

        /**
         * Flags the object list as needing to be rebuilt from existing objects on the next call to {@link #render} or {@link #pick}.
         * Setting this will cause the rendering pipeline to be executed from stage #2 (see class comment),
         * causing object list rebuild, state order determination, state sort, draw list construction and image render.
         * @type Boolean
         */
        this.objectListDirty = true;

        /**
         * Flags the object list as needing state orders to be computed on the next call to {@link #render} or {@link #pick}.
         * Setting this will cause the rendering pipeline to be executed from stage #3 (see class comment),
         * causing state order determination, state sort, draw list construction and image render.
         * @type Boolean
         */
        this.stateOrderDirty = true;

        /**
         * Flags the object list as needing to be state sorted on the next call to {@link #render} or {@link #pick}.
         * Setting this will cause the rendering pipeline to be executed from stage #4 (see class comment),
         * causing state sort, draw list construction and image render.
         * @type Boolean
         */
        this.stateSortDirty = true;

        /**
         * Flags the draw list as needing to be rebuilt from the object list on the next call to {@link #render} or {@link #pick}.
         * Setting this will cause the rendering pipeline to be executed from stage #5 (see class comment),
         * causing draw list construction and image render.
         * @type Boolean
         */
        this.drawListDirty = true;

        /**
         * Flags the image as needing to be redrawn from the draw list on the next call to {@link #render} or {@link #pick}.
         * Setting this will cause the rendering pipeline to be executed from stage #6 (see class comment),
         * causing the image render.
         * @type Boolean
         */
        this.imageDirty = true;

        /**
         * Flags the neccessity for the image buffer to be re-rendered from the draw list.
         * @type Boolean
         */
        this.pickBufDirty = true;           // Redraw pick buffer
        this.rayPickBufDirty = true;        // Redraw raypick buffer
    };

    /**
     * Reallocates WebGL resources for objects within this display
     */
    XEO.renderer.Renderer.prototype.webglRestored = function () {
        this._programFactory.webglRestored();// Reallocate programs
        this._chunkFactory.webglRestored(); // Recache shader var locations
        var gl = this._canvas.gl;
        if (this.pickBuf) {
            this.pickBuf.webglRestored(gl);          // Rebuild pick buffers
        }
        if (this.rayPickBuf) {
            this.rayPickBuf.webglRestored(gl);
        }
        this.imageDirty = true;             // Need redraw
    };

    /**
     * Internally creates (or updates) a {@link XEO.renderer.GameObject} of the given ID from whatever component state cores are currently set
     * on this {@link XEO.Renderer}. The object is created if it does not already exist in the display, otherwise it is
     * updated with the current state cores, possibly replacing cores already referenced by the object.
     *
     * @param {String} objectId ID of object to create or update
     */
    XEO.renderer.Renderer.prototype.buildGameObject = function (objectId) {

        var object = this._objects[objectId];

        if (!object) { // Create object
            object = this._objects[objectId] = this._objectFactory.getGameObject(objectId);
            this.objectListDirty = true;
        }

        object.stage = this.stage;
        object.layer = this.layer;
        object.renderTarget = this.renderTarget;
        object.texture = this.texture;
        object.cubemap = this.cubemap;
        object.geometry = this.geometry;
        object.enable = this.enable;
        object.flags = this.flags;
        object.tag = this.tag;

        //if (!object.hash) {

        var hash = ([                   // Build current state hash
            this.geometry.hash,
            this.shader.hash,
            this.clips.hash,
            this.MorphTargets.hash,
            this.texture.hash,
            this.cubemap.hash,
            this.lights.hash
        ]).join(";");

        if (!object.program || hash !== object.hash) {
            // Get new program for object if no program or hash mismatch
            if (object.program) {
                this._programFactory.putProgram(object.program);
            }
            object.program = this._programFactory.getProgram(hash, this);
            object.hash = hash;
        }
        //}

        // Build draw chunks for object

        this._setChunk(object, 0, "program");          // Must be first
        this._setChunk(object, 1, "xform", this.modelTransform);
        this._setChunk(object, 2, "lookAt", this.viewTransform);
        this._setChunk(object, 3, "camera", this.projTransform);
        this._setChunk(object, 4, "flags", this.flags);
        this._setChunk(object, 5, "shader", this.shader);
        this._setChunk(object, 6, "uniforms", this.uniforms);
        this._setChunk(object, 7, "style", this.style);
        this._setChunk(object, 8, "depthBuf", this.depthBuf);
        this._setChunk(object, 9, "colorBuf", this.colorBuf);
        this._setChunk(object, 10, "view", this.view);
        this._setChunk(object, 11, "name", this.name);
        this._setChunk(object, 12, "lights", this.lights);
        this._setChunk(object, 13, "material", this.material);
        this._setChunk(object, 14, "texture", this.texture);
        this._setChunk(object, 15, "cubemap", this.cubemap);
        this._setChunk(object, 16, "clips", this.clips);
        this._setChunk(object, 17, "renderer", this.renderer);
        this._setChunk(object, 18, "geometry", this.MorphTargets, this.geometry);
        this._setChunk(object, 19, "draw", this.geometry); // Must be last
    };

    XEO.renderer.Renderer.prototype._setChunk = function (object, order, chunkType, state, core2) {

        var chunkId;
        var chunkClass = this._chunkFactory.chunkTypes[chunkType];

        if (state) {

            // state supplied
            if (state.empty) { // Only set default cores for state types that have them
                var oldChunk = object.chunks[order];
                if (oldChunk) {
                    this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
                }
                object.chunks[order] = null;
                return;
            }

            // Note that state.stateId can be either a number or a string, that's why we make
            // chunkId a string here.
            // TODO: Would it be better if all were numbers?
            chunkId = chunkClass.prototype.programGlobal
                ? '_' + state.stateId
                : 'p' + object.program.id + '_' + state.stateId;

            if (core2) {
                chunkId += '__' + core2.stateId;
            }

        } else {

            // No state supplied, probably a program.
            // Only one chunk of this type per program.
            chunkId = 'p' + object.program.id;
        }

        // This is needed so that chunkFactory can distinguish between draw and geometry
        // chunks with the same state.
        chunkId = order + '__' + chunkId;

        var oldChunk = object.chunks[order];

        if (oldChunk) {
            if (oldChunk.id === chunkId) { // Avoid needless chunk reattachment
                return;
            }
            this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
        }

        object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, state, core2); // Attach new chunk

        // Ambient light is global across everything in display, and
        // can never be disabled, so grab it now because we want to
        // feed it to gl.clearColor before each display list render
        if (chunkType === "lights") {
            this._setAmbient(state);
        }
    };

    XEO.renderer.Renderer.prototype._setAmbient = function (state) {
        var lights = state.lights;
        var light;
        for (var i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            if (light.mode === "ambient") {
                this._ambientColor[0] = light.color[0];
                this._ambientColor[1] = light.color[1];
                this._ambientColor[2] = light.color[2];
            }
        }
    };

    /**
     * Removes an object from this display
     *
     * @param {String} objectId ID of object to remove
     */
    XEO.renderer.Renderer.prototype.removeGameObject = function (objectId) {
        var object = this._objects[objectId];
        if (!object) {
            return;
        }
        this._programFactory.putProgram(object.program);
        object.program = null;
        object.hash = null;
        this._objectFactory.putGameObject(object);
        delete this._objects[objectId];
        this.objectListDirty = true;
    };

    /**
     * Set a tag selector to selectively activate objects that have matching SceneJS.Tag components
     */
    XEO.renderer.Renderer.prototype.selectTags = function (tagSelector) {
        this._tagSelector = tagSelector;
        this.drawListDirty = true;
    };

    /**
     * Render this display. What actually happens in the method depends on what flags are set.
     *
     */
    XEO.renderer.Renderer.prototype.render = function (params) {

        params = params || {};

        if (this.objectListDirty) {
            this._buildGameObjectList();          // Build object render bin
            this.objectListDirty = false;
            this.stateOrderDirty = true;        // Now needs state ordering
        }

        if (this.stateOrderDirty) {
            this._makeStateSortKeys();       // Compute state sort order
            this.stateOrderDirty = false;
            this.stateSortDirty = true;     // Now needs state sorting
        }

        if (this.stateSortDirty) {
            this._stateSort();              // State sort the object render bin
            this.stateSortDirty = false;
            this.drawListDirty = true;      // Now needs new visible object bin
            //this._logGameObjectList();
        }

        if (this.drawListDirty) {           // Render visible list while building transparent list
            this._buildDrawList();
            this.imageDirty = true;
            //this._logDrawList();
            //this._logPickList();
        }

        if (this.imageDirty || params.force) {
            this._doDrawList({ // Render, no pick
                clear: (params.clear !== false) // Clear buffers by default
            });
            this.imageDirty = false;
            this.pickBufDirty = true;       // Pick buff will now need rendering on next pick
        }
    };

    XEO.renderer.Renderer.prototype._buildGameObjectList = function () {
        this._objectListLen = 0;
        for (var objectId in this._objects) {
            if (this._objects.hasOwnProperty(objectId)) {
                this._objectList[this._objectListLen++] = this._objects[objectId];
            }
        }
    };

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
                    + ((object.flags.transparent ? 2 : 1) * 1000000000)
                    + ((object.layer.priority + 1) * 1000000)
                    + ((object.program.id + 1) * 1000)
                    + object.texture.stateId;
            }
        }
        //  console.log("--------------------------------------------------------------------------------------------------");
    };

    XEO.renderer.Renderer.prototype._stateSort = function () {
        this._objectList.length = this._objectListLen;
        this._objectList.sort(this._stateSortGameObjects);
    };

    XEO.renderer.Renderer.prototype._stateSortGameObjects = function (a, b) {
        return a.sortKey - b.sortKey;
    };

    XEO.renderer.Renderer.prototype._logGameObjectList = function () {
        console.log("--------------------------------------------------------------------------------------------------");
        console.log(this._objectListLen + " objects");
        for (var i = 0, len = this._objectListLen; i < len; i++) {
            var object = this._objectList[i];
            console.log("XEO.Renderer : object[" + i + "] sortKey = " + object.sortKey);
        }
        console.log("--------------------------------------------------------------------------------------------------");
    };

    XEO.renderer.Renderer.prototype._buildDrawList = function () {

        this._lastStateId = this._lastStateId || [];
        this._lastPickStateId = this._lastPickStateId || [];

        for (var i = 0; i < 23; i++) {
            this._lastStateId[i] = null;
            this._lastPickStateId[i] = null;
        }

        this._drawListLen = 0;
        this._pickDrawListLen = 0;

        // For each render target, a list of objects to render to that target
        var targetGameObjectLists = {};

        // A list of all the render target object lists
        var targetListList = [];

        // List of all targets
        var targetList = [];

        var object;
        var tagMask;
        var tagRegex;
        var tagCore;
        var flags;

        if (this._tagSelector) {
            tagMask = this._tagSelector.mask;
            tagRegex = this._tagSelector.regex;
        }

        this._objectDrawList = this._objectDrawList || [];
        this._objectDrawListLen = 0;

        for (var i = 0, len = this._objectListLen; i < len; i++) {

            object = this._objectList[i];

            // Cull invisible objects
            if (object.enable.enabled === false) {
                continue;
            }

            flags = object.flags;

            // Cull invisible objects
            if (flags.enabled === false) {
                continue;
            }

            // Cull objects in disabled layers
            if (!object.layer.enabled) {
                continue;
            }

            // Cull objects with unmatched tags
            if (tagMask) {
                tagCore = object.tag;
                if (tagCore.tag) {
                    if (tagCore.mask !== tagMask) { // Scene tag mask was updated since last render
                        tagCore.mask = tagMask;
                        tagCore.matches = tagRegex.test(tagCore.tag);
                    }
                    if (!tagCore.matches) {
                        continue;
                    }
                }
            }

            // Put objects with render targets into a bin for each target
            if (object.renderTarget.targets) {
                var targets = object.renderTarget.targets;
                var target;
                var coreId;
                var list;
                for (var j = 0, lenj = targets.length; j < lenj; j++) {
                    target = targets[j];
                    coreId = target.coreId;
                    list = targetGameObjectLists[coreId];
                    if (!list) {
                        list = [];
                        targetGameObjectLists[coreId] = list;
                        targetListList.push(list);
                        targetList.push(this._chunkFactory.getChunk(target.stateId, "renderTarget", object.program, target));
                    }
                    list.push(object);
                }
            } else {

                //
                this._objectDrawList[this._objectDrawListLen++] = object;
            }
        }

        // Append chunks for objects within render targets first

        var list;
        var target;
        var object;
        var pickable;

        for (var i = 0, len = targetListList.length; i < len; i++) {

            list = targetListList[i];
            target = targetList[i];

            this._appendRenderTargetChunk(target);

            for (var j = 0, lenj = list.length; j < lenj; j++) {
                object = list[j];
                pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages
                this._appendGameObjectToDrawLists(object, pickable);
            }
        }

        if (object) {

            // Unbinds any render target bound previously
            this._appendRenderTargetChunk(this._chunkFactory.getChunk(-1, "renderTarget", object.program, {}));
        }

        // Append chunks for objects not in render targets
        for (var i = 0, len = this._objectDrawListLen; i < len; i++) {
            object = this._objectDrawList[i];
            pickable = !object.stage || (object.stage && object.stage.pickable); // We'll only pick objects in pickable stages
            this._appendGameObjectToDrawLists(object, pickable);
        }

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
    XEO.renderer.Renderer.prototype._appendGameObjectToDrawLists = function (object, pickable) {
        var chunks = object.chunks;
        var picking = object.flags.picking;
        var chunk;
        for (var i = 0, len = chunks.length; i < len; i++) {
            chunk = chunks[i];
            if (chunk) {

                // As we apply the state chunk lists we track the ID of most types of chunk in order
                // to cull redundant re-applications of runs of the same chunk - except for those chunks with a
                // 'unique' flag, because we don't want to cull runs of draw chunks because they contain the GL
                // drawElements calls which render the objects.

                if (chunk.draw) {
                    if (chunk.unique || this._lastStateId[i] !== chunk.id) { // Don't reapply repeated states
                        this._drawList[this._drawListLen++] = chunk;
                        this._lastStateId[i] = chunk.id;
                    }
                }

                if (chunk.pick) {
                    if (pickable !== false) {   // Don't pick objects in unpickable stages
                        if (picking) {          // Don't pick unpickable objects
                            if (chunk.unique || this._lastPickStateId[i] !== chunk.id) { // Don't reapply repeated states
                                this._pickDrawList[this._pickDrawListLen++] = chunk;
                                this._lastPickStateId[i] = chunk.id;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Logs the contents of the draw list to the console.
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
                    console.log(" bufType = " + chunk.state.bufType);
                    break;
            }
        }
        console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * Logs the contents of the pick list to the console.
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
                    console.log(" bufType = " + chunk.state.bufType);
                    break;
            }
        }
        console.log("--------------------------------------------------------------------------------------------------");
    };

    /**
     * Performs a pick on the display graph and returns info on the result.
     * @param {*} params
     * @returns {*}
     */
    XEO.renderer.Renderer.prototype.pick = function (params) {

        var canvas = this._canvas.canvas;
        var hit = null;
        var canvasX = params.canvasX;
        var canvasY = params.canvasY;
        var pickBuf = this.pickBuf;

        // Lazy-create pick buffer
        if (!pickBuf) {
            pickBuf = this.pickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
            this.pickBufDirty = true;
        }

        this.render(); // Do any pending visible render

        // Colour-index pick to find the picked object

        pickBuf.bind();

        // Re-render the pick buffer if the display has updated
        if (this.pickBufDirty) {
            pickBuf.clear();
            this._doDrawList({
                pick: true,
                clear: true
            });
            this._canvas.gl.finish();
            this.pickBufDirty = false;                                                  // Pick buffer up to date
            this.rayPickBufDirty = true;                                                // Ray pick buffer now dirty
        }

        // Read pixel color in pick buffer at given coordinates,
        // convert to an index into the pick name list

        var pix = pickBuf.read(canvasX, canvasY);                                       // Read pick buffer
        var pickedGameObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        var pickIndex = (pickedGameObjectIndex >= 1) ? pickedGameObjectIndex - 1 : -1;
        pickBuf.unbind();                                                               // Unbind pick buffer

        // Look up pick name from index
        var pickName = this._frameCtx.pickNames[pickIndex];                                   // Map pixel to name

        if (pickName) {

            hit = {
                name: pickName.name,
                path: pickName.path,
                componentId: pickName.componentId,
                canvasPos: [canvasX, canvasY]
            };

            // Now do a ray-pick if requested

            if (params.rayPick) {

                // Lazy-create ray pick depth buffer
                var rayPickBuf = this.rayPickBuf;
                if (!rayPickBuf) {
                    rayPickBuf = this.rayPickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
                    this.rayPickBufDirty = true;
                }

                // Render depth values to ray-pick depth buffer

                rayPickBuf.bind();

                if (this.rayPickBufDirty) {
                    rayPickBuf.clear();
                    this._doDrawList({
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

                var screenZ = this._unpackDepth(pix);
                var w = canvas.width;
                var h = canvas.height;
                // Calculate clip space coordinates, which will be in range
                // of x=[-1..1] and y=[-1..1], with y=(+1) at top
                var x = (canvasX - w / 2) / (w / 2);           // Calculate clip space coordinates
                var y = -(canvasY - h / 2) / (h / 2);
                var projMat = this._frameCtx.cameraMat;
                var viewMat = this._frameCtx.viewMat;
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
        return XEO.math.dotVector4(vec, bitShift);
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

        // Reset frame context
        var frameCtx = this._frameCtx;
        frameCtx.renderTarget = null;
        frameCtx.targetIndex = 0;
        frameCtx.renderBuf = null;
        frameCtx.viewMat = null;
        frameCtx.modelMat = null;
        frameCtx.cameraMat = null;
        frameCtx.renderer = null;
        frameCtx.depthbufEnabled = null;
        frameCtx.clearDepth = null;
        frameCtx.depthFunc = gl.LESS;
        frameCtx.scissorTestEnabled = false;
        frameCtx.blendEnabled = false;
        frameCtx.backfaces = true;
        frameCtx.frontface = "ccw";
        frameCtx.pick = !!params.pick;
        frameCtx.rayPick = !!params.rayPick;
        frameCtx.pickIndex = 0;
        frameCtx.textureUnit = 0;
        frameCtx.lineWidth = 1;
        frameCtx.transparent = false;
        frameCtx.ambientColor = this._ambientColor;
        frameCtx.aspect = this._canvas.canvas.width / this._canvas.canvas.height;

        // The extension needs to be re-queried in case the context was lost and has been recreated.
        var VAO = gl.getExtension("OES_vertex_array_object");
        frameCtx.VAO = (VAO) ? VAO : null;
        frameCtx.VAO = null;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (this.transparent) {
            gl.clearColor(0, 0, 0, 0);
        } else {
            gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
        }

        if (params.clear) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        }

        gl.frontFace(gl.CCW);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);

        if (params.pick) {
            // Render for pick
            for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
                this._pickDrawList[i].pick(frameCtx);
            }
        } else {
            // Render for draw
            for (var i = 0, len = this._drawListLen; i < len; i++) {      // Push opaque rendering chunks
                this._drawList[i].draw(frameCtx);
            }
        }

        gl.flush();

        if (frameCtx.renderBuf) {
            frameCtx.renderBuf.unbind();
        }

        if (frameCtx.VAO) {
            frameCtx.VAO.bindVertexArrayOES(null);
            for (var i = 0; i < 10; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
    };

    XEO.renderer.Renderer.prototype.destroy = function () {
        this._programFactory.destroy();
    };

})();