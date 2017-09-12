(function () {

    "use strict";

    const LEN_CHUNKS = 12;

    xeogl.renderer = xeogl.renderer || {};

    xeogl.renderer.Renderer = function (stats, canvas, gl, options) {

        options = options || {};

        this.stats = stats || {};

        this.gl = gl;
        this.canvas = canvas;

        this._programFactory = new xeogl.renderer.ProgramFactory(this.stats, gl);
        this._objectFactory = new xeogl.renderer.ObjectFactory();
        this._chunkFactory = new xeogl.renderer.ChunkFactory();

        this._shadowLightObjects = {}; // WIP: Objects for each light that has a shadow

        // Indicates if the canvas is transparent
        this.transparent = options.transparent === true;

        /**
         * Optional callback to fire when renderer wants to
         * bind an output framebuffer. This is useful when we need to bind a stereo output buffer for WebVR.
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
         * The callback takes one parameter, which is the index of the current
         * rendering pass in which the buffer is to be bound.
         *
         * Use like this: myRenderer.unbindOutputFramebuffer = function(pass) { .. });
         *
         * Callback takes no parameters.
         */
        this.unbindOutputFramebuffer = null;

        // Objects mapped to their IDs
        this.objects = {};

        // The current ambient color, if available
        this._ambient = null;

        // The current ambient color.
        this.ambientColor = xeogl.math.vec4([0, 0, 0, 1]);

        // Objects in a list, ordered by state
        this._objectList = [];
        this._objectListLen = 0;

        // List of objects that were rendered in the last picking pass, for indexing when using color-index picking
        this._objectPickList = [];
        this._objectPickListLen = 0;

        // Shadow->Object lookup
        this._shadowObjectLists = {};

        // Render states 

        this.lights = null;
        this.material = null;
        this.modelTransform = null;
        this.viewTransform = null;
        this.projTransform = null;
        this.clips = null;
        this.geometry = null;
        this.viewport = null;
        this.outline = null;
        this.xray = null;
        this.modes = null;

        // Dirty flags 

        this.objectListDirty = true;
        this.stateOrderDirty = true;
        this.stateSortDirty = true;
        this.imageDirty = true;
    };

    /**
     * Reallocates WebGL resources for objects within this renderer.
     */
    xeogl.renderer.Renderer.prototype.webglRestored = function (gl) {
        this.gl = gl;
        this._programFactory.webglRestored(gl);
        this._chunkFactory.webglRestored();
        if (this._pickBuf) {
            this._pickBuf.webglRestored(gl);
        }
        this.imageDirty = true;
    };

    /**
     * Internally creates (or updates) a {@link xeogl.renderer.Object} of the given
     * ID from whatever component state cores are currently set on this {@link xeogl.Renderer}.
     * The object is created if it does not already exist in the display, otherwise
     * it is updated with the current states, possibly replacing states already
     * referenced by the object.
     *
     * @param {String} objectId ID of object to create or update
     */
    xeogl.renderer.Renderer.prototype.buildObject = function (objectId) {

        var object = this.objects[objectId];

        if (!object) {
            object = this._objectFactory.get(objectId);
            object.hash = "";
        }

        object.material = this.material;
        object.geometry = this.geometry;
        object.viewport = this.viewport;
        object.lights = this.lights;
        object.outline = this.outline;
        object.xray = this.xray;
        object.modes = this.modes;

        // Build hash of the object's state configuration. This is used
        // to hash the object's shader so that it may be reused by other
        // objects that have the same state configuration.

        var hash = ([
            this.geometry.hash,
            this.clips.hash,
            this.material.hash,
            this.lights.hash,
            this.modes.hash
        ]).join(";");

        if (hash !== object.hash) {

            // Get new program for object

            if (object.program) {
                this._programFactory.put(object.program);
            }

            object.program = this._programFactory.get(hash, this);
            object.hash = hash;

            // Handle shader error

            var programState = object.program;
            if (programState) {
                var program = programState.program;
                if (!program.allocated || !program.compiled || !program.validated || !program.linked) {
                    if (this.objects[objectId]) {
                        this.removeObject(objectId); // Don't keep faulty objects in the renderer
                    }
                    return {
                        error: true,
                        errorLog: program.errorLog
                    }
                }
            }
        }

        this._setChunk(object, 0, "program", object.program); // Must be first
        this._setChunk(object, 1, "modelTransform", this.modelTransform);
        this._setChunk(object, 2, "viewTransform", this.viewTransform);
        this._setChunk(object, 3, "projTransform", this.projTransform);
        this._setChunk(object, 4, "lights", this.lights);
        this._setChunk(object, 5, this.material.type, this.material); // Supports different material systems
        this._setChunk(object, 6, "clips", this.clips);
        this._setChunk(object, 7, "viewport", this.viewport);
        this._setChunk(object, 8, "outline", this.outline);
        this._setChunk(object, 9, "xray", this.xray);
        this._setChunk(object, 10, "geometry", this.geometry);
        this._setChunk(object, 11, "draw", this.geometry, true); // Must be last

        // Ambient light is global across everything in display, and
        // can never be disabled, so grab it now because we want to
        // feed it to gl.clearColor before each display list render

        // Also grab the first spotlight we get, because we'll use that to cast shadows

        this._setAmbientLights(this.lights);

        if (!this.objects[objectId]) {
            this.objects[objectId] = object;
            this.objectListDirty = true;
        } else {
            this.stateOrderDirty = true;
        }

        object.compiled = true;

        return object;
    };

    xeogl.renderer.Renderer.prototype._mapShadowLightObject = function (lights, object) {
        var shadow;
        var objects;
        for (var i = 0, len = lights.length; i < len; i++) {
            shadow = lights[i].shadow;
            if (shadow) {
                objects = (this._shadowLightObjects[shadow.id] || (this._shadowLightObjects[shadow.id] = {}));
                objects[object.id] = object;
            }
        }
    };

    xeogl.renderer.Renderer.prototype._setChunk = function (object, chunkIndex, type, state, neg) {
        var id;
        var chunkType = this._chunkFactory.types[type];
        if (type === "program") {
            id = (object.program.id + 1) * 100000000;
        } else if (chunkType.constructor.prototype.programGlobal) {
            id = state.id;
        } else {
            id = ((object.program.id + 1) * 100000000) + ((state.id + 1));
        }
        if (neg) { // <<--------------- What's this for?
            id *= 100000;
        }
        var oldChunk = object.chunks[chunkIndex];
        if (oldChunk) {
            this._chunkFactory.putChunk(oldChunk);
        }
        object.chunks[chunkIndex] = this._chunkFactory.getChunk(id, type, object.program.program, state);
    };

    xeogl.renderer.Renderer.prototype._setAmbientLights = function (state) {
        var lights = state.lights;
        var light;
        for (var i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            if (light.type === "ambient") {
                this._ambient = light;
            }
        }
    };

    xeogl.renderer.Renderer.prototype.removeObject = function (objectId) {
        var object = this.objects[objectId];
        if (!object) {
            return;
        }
        var chunks = object.chunks;
        for (var i = 0, len = chunks.length; i < len; i++) {
            this._chunkFactory.putChunk(chunks[i]);
            chunks[i] = null;
        }
        this._programFactory.put(object.program);
        object.program = null;
        object.hash = null;
        this._objectFactory.put(object);
        delete this.objects[objectId];
        this.objectListDirty = true;
    };

    xeogl.renderer.Renderer.prototype.render = function (params) {
        params = params || {};
        this._update();
        if (this.imageDirty || params.force) {
            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) { // In case context lost/recovered
                this.gl.getExtension("OES_element_index_uint");
            }
            this._drawShadowMap();
            this._drawObjects(params);
            this.stats.frame.frameCount++;
            this.imageDirty = false;
        }
    };

    xeogl.renderer.Renderer.prototype._update = function () {
        if (this.objectListDirty) {
            this._buildObjectList();
            this.objectListDirty = false;
            this.stateOrderDirty = true;
        }
        if (this.stateOrderDirty) {
            this._makeStateSortKeys();
            this.stateOrderDirty = false;
            this.stateSortDirty = true;
        }
        if (this.stateSortDirty) {
            this._stateSort();
            this._buildShadowObjectLists();
            this.stateSortDirty = false;
            this.imageDirty = true;
        }
    };

    xeogl.renderer.Renderer.prototype._buildObjectList = function () {
        this._objectListLen = 0;
        for (var objectId in this.objects) {
            if (this.objects.hasOwnProperty(objectId)) {
                this._objectList[this._objectListLen++] = this.objects[objectId];
            }
        }
        for (var i = this._objectListLen, len = this._objectList.length; i < len; i) {
            this._objectList[i] = null; // Release memory
        }
    };

    xeogl.renderer.Renderer.prototype._makeStateSortKeys = function () {
        var object;
        for (var i = 0, len = this._objectListLen; i < len; i++) {
            object = this._objectList[i];
            if (!object.program) { // Non-visual object (eg. sound)
                object.sortKey = -1;
            } else {
                object.sortKey =
                    +((object.modes.layer + 1) * 10000000000000)
                    + ((object.program.id + 1) * 100000000)
                    + ((object.material.id + 1) * 10000)
                    + object.geometry.id;
            }
        }
    };

    xeogl.renderer.Renderer.prototype._stateSort = function () {
        this._objectList.length = this._objectListLen;
        this._objectList.sort(function (a, b) {
            return a.sortKey - b.sortKey;
        });
    };

    xeogl.renderer.Renderer.prototype._buildShadowObjectLists = function () {
        var i;
        var len;
        var object;
        var j;
        var lenj;
        var lights;
        var light;
        var shadowObjectList;
        this._shadowObjectLists = {}; // TODO: Optimize for GC
        for (i = 0, len = this._objectListLen; i < len; i++) {
            object = this._objectList[i];
            if (!object.compiled || !object.modes.castShadow || object.modes.visible) {
                continue;
            }
            lights = object.lights.lights;
            for (j = 0, lenj = lights.length; j < lenj; j++) {
                light = lights[j];
                if (!light.shadow) {
                    continue;
                }
                shadowObjectList = this._shadowObjectLists[light.id];
                if (!shadowObjectList) {
                    shadowObjectList = this._shadowObjectLists[light.id] = {
                        light: light,
                        objects: []
                    };
                }
                shadowObjectList.objects.push(object);
            }
        }
    };

    xeogl.renderer.Renderer.prototype._drawShadowMap = function () {
        var lightId;
        var shadowObjectLists = this._shadowObjectLists;
        var shadowObjectList;
        var light;
        for (lightId in shadowObjectLists) {
            if (shadowObjectLists.hasOwnProperty(lightId)) {
                shadowObjectList = shadowObjectLists[lightId];
                light = shadowObjectList.light;
                //   if (light.shadowDirty) {
                this._drawLightShadows(light, shadowObjectList.objects);
                //   }
            }
        }
    };

    xeogl.renderer.Renderer.prototype._drawLightShadows = (function () {

        var frameCtx = {};
        var lastChunkId = new Int32Array(LEN_CHUNKS);

        function clearStateTracking() {
            for (var i = 0; i < LEN_CHUNKS; i++) {
                lastChunkId[i] = null;
            }
        }

        function drawObjectShadow(frameCtx, object) {
            var chunks = object.chunks;
            var chunk;
            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk) {
                    if (chunk.shadow && (chunk.unique || lastChunkId[i] !== chunk.id)) {
                        chunk.shadow(frameCtx);
                        lastChunkId[i] = chunk.id;
                    }
                }
            }
        }

        return function (light, objects) {

            var shadow = light.shadow;

            if (!shadow) {
                return;
            }

            var renderBuf = light.getShadowRenderBuf();

            if (!renderBuf) {
                return;
            }

            renderBuf.bind();
            renderBuf.clear();

            frameCtx.backfaces = true;
            frameCtx.frontface = true;
            frameCtx.drawElements = 0;
            frameCtx.useProgram = 0;
            frameCtx.shadowViewMatrix = light.getShadowViewMatrix();
            frameCtx.shadowProjMatrix = light.getShadowProjMatrix();

            var gl = this.gl;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            var i;
            var len;
            var object;

            clearStateTracking();

            for (i = 0, len = objects.length; i < len; i++) {
                object = objects[i];
                if (!object.compiled || !object.modes.visible) {
                    continue; // For now, culled objects still cast shadows
                }
                drawObjectShadow(frameCtx, object);
            }

            gl.finish();

            renderBuf.unbind();
        };
    })();

    xeogl.renderer.Renderer.prototype._drawObjects = (function () {

        var outlinedObjects = [];
        var transparentObjects = [];
        var numTransparentObjects = 0;

        var lastChunkId = new Int32Array(LEN_CHUNKS);

        var frameCtx = {};

        function clearStateTracking() {
            for (var i = 0; i < LEN_CHUNKS; i++) {
                lastChunkId[i] = null;
            }
        }

        function drawObject(frameCtx, object) {
            var chunks = object.chunks;
            var chunk;
            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk) {
                    if (chunk.draw && (chunk.unique || lastChunkId[i] !== chunk.id)) {
                        chunk.draw(frameCtx);
                        lastChunkId[i] = chunk.id;
                    }
                }
            }
        }

        function drawObjectOutline(frameCtx, object) {
            var chunks = object.chunks;
            var chunk;
            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk) {
                    if (chunk.outline && (chunk.unique || lastChunkId[i] !== chunk.id)) {
                        chunk.outline(frameCtx);
                        lastChunkId[i] = chunk.id;
                    }
                }
            }
        }

        return function (params) {

            var gl = this.gl;

            var ambient = this._ambient;
            if (ambient) {
                var color = ambient.color;
                var intensity = ambient.intensity;
                this.ambientColor[0] = color[0] * intensity;
                this.ambientColor[1] = color[1] * intensity;
                this.ambientColor[2] = color[2] * intensity;
            } else {
                this.ambientColor[0] = 0;
                this.ambientColor[1] = 0;
                this.ambientColor[2] = 0;
            }

            frameCtx.backfaces = true;
            frameCtx.frontface = true; // true == "ccw" else "cw"
            frameCtx.textureUnit = 0;
            frameCtx.ambientColor = this.ambientColor;
            frameCtx.drawElements = 0;
            frameCtx.useProgram = 0;
            frameCtx.bindTexture = 0;
            frameCtx.bindArray = 0;
            frameCtx.pass = params.pass;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            if (this.transparent) { // Canvas is transparent
                gl.clearColor(0, 0, 0, 0);
            } else {
                gl.clearColor(this.ambientColor[0], this.ambientColor[1], this.ambientColor[2], 1.0);
            }

            gl.enable(gl.DEPTH_TEST);
            gl.frontFace(gl.CCW);
          //  gl.enable(gl.CULL_FACE);
            gl.disable(gl.CULL_FACE);
            gl.depthMask(true);
            gl.colorMask(true, true, true, false);

            var i;
            var len;
            var object;

            var startTime = (new Date()).getTime();

            if (this.bindOutputFramebuffer) {
                this.bindOutputFramebuffer(params.pass);
            }

            if (params.clear !== false) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }

            // Render opaque, non-outlined objects

            var numOutlinedObjects = 0;

            numTransparentObjects = 0;

            clearStateTracking();

            for (i = 0, len = this._objectListLen; i < len; i++) {
                object = this._objectList[i];
                if (!object.compiled || object.modes.culled === true || object.modes.visible === false) {
                    continue;
                }
                if (object.material.alphaMode === 2 /* blend */  || object.modes.xray) {
                    transparentObjects[numTransparentObjects++] = object;
                    continue;
                }
                if (object.modes.outlined) {
                    outlinedObjects[numOutlinedObjects++] = object;
                    continue;
                }
                drawObject(frameCtx, object);
            }

            // Render opaque outlined objects

            if (numOutlinedObjects > 0) {

                // Render objects

                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.stencilMask(1);
                gl.clearStencil(0);
                gl.clear(gl.STENCIL_BUFFER_BIT);

                clearStateTracking();

                for (i = 0; i < numOutlinedObjects; i++) {
                    drawObject(frameCtx, outlinedObjects[i]);
                }

                // Render outlines

                gl.stencilFunc(gl.EQUAL, 0, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.stencilMask(0x00);
                gl.disable(gl.CULL_FACE); // Need both faces for better corners with face-aligned normals

                clearStateTracking();

                for (i = 0; i < numOutlinedObjects; i++) {
                    drawObjectOutline(frameCtx, outlinedObjects[i]);
                }

                gl.disable(gl.STENCIL_TEST);
            }

            // Draw transparent objects

            if (numTransparentObjects > 0) {

                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
             //   gl.depthMask(false);
                gl.blendEquation(gl.FUNC_ADD);
               // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                gl.colorMask(true, true, true, true);

                numOutlinedObjects = 0;

                clearStateTracking();

                for (i = 0; i < numTransparentObjects; i++) {
                    object = transparentObjects[i];
                    if (object.modes.outlined) {
                        outlinedObjects[numOutlinedObjects++] = object; // Build outlined list
                        continue;
                    }
                    drawObject(frameCtx, object);
                }

                // Transparent outlined objects are not supported yet

                gl.disable(gl.BLEND);
                gl.colorMask(true, true, true, false);
            }

            var endTime = Date.now();
            var frameStats = this.stats.frame;

            frameStats.renderTime = (endTime - startTime) / 1000.0;
            frameStats.drawElements = frameCtx.drawElements;
            frameStats.useProgram = frameCtx.useProgram;
            frameStats.bindTexture = frameCtx.bindTexture;
            frameStats.bindArray = frameCtx.bindArray;

            var numTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;
            for (var ii = 0; ii < numTextureUnits; ii++) {
                gl.activeTexture(gl.TEXTURE0 + ii);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            if (this.unbindOutputFramebuffer) {
                this.unbindOutputFramebuffer(params.pass);
            }
        };
    })();

    /**
     * Attempts to pick an object.
     */
    xeogl.renderer.Renderer.prototype.pick = (function () {

        var math = xeogl.math;

        var tempVec3a = math.vec3();
        var tempMat4a = math.mat4();
        var up = math.vec3([0, 1, 0]);
        var pickFrustumMatrix = math.frustumMat4(-1, 1, -1, 1, 0.1, 10000);

        return function (params) {

            var hit = null;

            this._update();

            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) { // In case context lost/recovered
                this.gl.getExtension("OES_element_index_uint");
            }

            var pickBuf = this._pickBuf || (this._pickBuf = new xeogl.renderer.webgl.RenderBuffer(this.canvas, this.gl));

            pickBuf.bind();
            pickBuf.clear();

            var pickBufX;
            var pickBufY;
            var origin;
            var direction;
            var look;
            var pickViewMatrix = null;
            var pickProjMatrix = null;

            if (!params.canvasPos) { // Ray-picking with arbitrarily World-space ray

                origin = params.origin || math.vec3([0, 0, 0]);
                direction = params.direction || math.vec3([0, 0, 1]);
                look = math.addVec3(origin, direction, tempVec3a);

                pickViewMatrix = math.lookAtMat4v(origin, look, up, tempMat4a);
                pickProjMatrix = pickFrustumMatrix;

                pickBufX = this.canvas.clientWidth * 0.5;
                pickBufY = this.canvas.clientHeight * 0.5;

            } else {

                if (params.canvasPos) {
                    pickBufX = params.canvasPos[0];
                    pickBufY = params.canvasPos[1];

                } else {
                    pickBufX = this.canvas.clientWidth * 0.5;
                    pickBufY = this.canvas.clientHeight * 0.5;
                }
            }

            this._pickObjectPass(pickViewMatrix, pickProjMatrix);

            // Convert picked pixel color to object index

            var pix = pickBuf.read(pickBufX, pickBufY);
            var pickedObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
            pickedObjectIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;

            var object = this._objectPickList[pickedObjectIndex];

            if (object) { // Object picked

                hit = {
                    entity: object.id
                };

                if (params.pickSurface) { // Now do a primitive-pick if requested

                    pickBuf.clear();

                    this._pickPrimitivePass(object, pickViewMatrix, pickProjMatrix);

                    this.gl.finish();

                    // Convert picked pixel color to primitive index

                    pix = pickBuf.read(pickBufX, pickBufY);
                    var primIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);
                    primIndex *= 3; // Convert from triangle number to first vertex in indices

                    hit.primIndex = primIndex;

                    if (pickViewMatrix) {
                        hit.origin = origin;
                        hit.direction = direction;
                    }
                }
            }

            pickBuf.unbind();

            return hit;
        };
    })();


    xeogl.renderer.Renderer.prototype._pickObjectPass = (function () {

        var frameCtx = {};

        var lastChunkId = new Int32Array(LEN_CHUNKS);

        function clearStateTracking() {
            for (var i = 0; i < LEN_CHUNKS; i++) {
                lastChunkId[i] = null;
            }
        }

        function pickObject(frameCtx, object) {
            var chunks = object.chunks;
            var chunk;
            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk) {
                    if (chunk.pickObject && (chunk.unique || lastChunkId[i] !== chunk.id)) {
                        chunk.pickObject(frameCtx);
                        lastChunkId[i] = chunk.id;
                    }
                }
            }
        }

        return function (pickViewMatrix, pickProjMatrix) {

            frameCtx.backfaces = true;
            frameCtx.frontface = true; // true == "ccw" else "cw"
            frameCtx.pickViewMatrix = pickViewMatrix;
            frameCtx.pickProjMatrix = pickProjMatrix;
            frameCtx.pickObjectIndex = 0;

            var gl = this.gl;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0, 0, 0, 0);
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            clearStateTracking();

            this._objectPickListLen = 0;

            var i;
            var len;
            var object;

            for (i = 0, len = this._objectListLen; i < len; i++) {
                object = this._objectList[i];
                if (!object.compiled || object.modes.culled === true || object.modes.visible === false || object.modes.pickable === false) {
                    continue;
                }
                this._objectPickList[this._objectPickListLen++] = object;
                pickObject(frameCtx, object);
            }
        };
    })();

    xeogl.renderer.Renderer.prototype._pickPrimitivePass = (function () {

        var frameCtx = {};

        return function (object, pickViewMatrix, pickProjMatrix) {

            frameCtx.backfaces = true;
            frameCtx.frontface = true; // true == "ccw" else "cw"
            frameCtx.pickViewMatrix = pickViewMatrix;
            frameCtx.pickProjMatrix = pickProjMatrix;

            var gl = this.gl;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0, 0, 0, 0);
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            var i;
            var len;
            var chunks;
            var chunk;

            chunks = object.chunks;
            for (i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk.pickPrimitive) {
                    chunk.pickPrimitive(frameCtx);
                }
            }
        };
    })();

    /**
     * Reads the colors of some pixels in the current image.
     */
    xeogl.renderer.Renderer.prototype.readPixels = function (pixels, colors, len, opaqueOnly) {
        var renderBuf = this._readPixelBuf || (this._readPixelBuf = new xeogl.renderer.webgl.RenderBuffer(this.canvas, this.gl));
        renderBuf.bind();
        renderBuf.clear();
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
            color = renderBuf.read(pixels[j], pixels[j + 1]);
            colors[k] = color[0];
            colors[k + 1] = color[1];
            colors[k + 2] = color[2];
            colors[k + 3] = color[3];
        }
        renderBuf.unbind();
        this.imageDirty = true;
    };

    xeogl.renderer.Renderer.prototype.destroy = function () {
        this._programFactory.destroy();
        if (this._pickBuf) {
            this._pickBuf.destroy();
        }
        if (this._readPixelBuf) {
            this._readPixelBuf.destroy();
        }
    };
})();
