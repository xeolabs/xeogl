/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer = xeogl.renderer || {};

xeogl.renderer.Renderer = function (stats, canvas, gl, options) {

    "use strict";

    var self = this;

    options = options || {};
    stats = stats || {};

    var ids = new xeogl.utils.Map({});
    var frame = new xeogl.renderer.Frame();

    this.gammaOutput = true; // Set true to format output as premultiplied gamma

    this.viewport = null;
    this.lights = null;
    this.viewTransform = null;
    this.projTransform = null;
    this.clips = null;

    this.indicesBufs = [];

    var objects = {};
    var shadowLightObjects = {};
    var canvasTransparent = options.transparent === true;
    var ambient = null; // The current ambient light, if available
    var ambientColor = xeogl.math.vec4([0, 0, 0, 1]);
    var objectList = [];
    var objectListLen = 0;
    var objectPickList = [];
    var objectPickListLen = 0;
    var shadowObjectLists = {};

    var objectListDirty = true;
    var stateSortDirty = true;
    var imageDirty = true;
    var shadowsDirty = true;
    this.imageForceDirty = true;

    var blendOneMinusSrcAlpha = true;

    var pickBuf = null;
    var readPixelBuf = null;

    var bindOutputFrameBuffer = null;
    var unbindOutputFrameBuffer = null;

    this.needStateSort = function () {
        stateSortDirty = true;
    };

    this.shadowsDirty = function () {
        shadowsDirty = true;
    };

    this.imageDirty = function () {
        imageDirty = true;
    };

    this.setImageForceDirty = function () {
        this.imageForceDirty = true;
    };

    this.getAmbientColor = function () {
        return ambientColor;
    };

    this.setBlendOneMinusSrcAlpha = function (value) {
        blendOneMinusSrcAlpha = value;
    };

    this.webglRestored = function (gl) {
        // gl = gl;
        // this._programFactory.webglRestored(gl);
        // this._chunkFactory.webglRestored();
        // if (pickBuf) {
        //     pickBuf.webglRestored(gl);
        // }
        // imageDirty = true;
    };

    this.createObject = function (entityId, material, ghostMaterial, outlineMaterial, highlightMaterial, selectedMaterial, vertexBufs, geometry, modelTransform, modes) {
        var objectId = ids.addItem({});
        var object = new xeogl.renderer.Object(objectId, entityId, gl, self, material, ghostMaterial, outlineMaterial, highlightMaterial, selectedMaterial, vertexBufs, geometry, modelTransform, modes);
        if (object.errors) {
            object.destroy();
            ids.removeItem(objectId);
            return {
                errors: object.errors
            };
        }
        objects[objectId] = object;
        objectListDirty = true;
        stateSortDirty = true;
        setAmbientLights(this.lights); // TODO: Is self the best place for self?
        return {
            objectId: objectId
        };
    };

    function setAmbientLights(state) {
        var lights = state.lights;
        var light;
        for (var i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            if (light.type === "ambient") {
                ambient = light;
            }
        }
    }

    this.destroyObject = function (objectId) {
        var object = objects[objectId];
        if (!object) {
            return;
        }
        object.destroy();
        delete objects[objectId];
        ids.removeItem(objectId);
        objectListDirty = true;
    };

    this.clear = function (params) {

        params = params || {};

        if (self.viewport) {
            var boundary = self.viewport.boundary;
            gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        } else {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        if (canvasTransparent) { // Canvas is transparent
            gl.clearColor(0, 0, 0, 0);
        } else {
            var color = params.ambientColor || ambientColor;
            gl.clearColor(color[0], color[1], color[2], 1.0);
        }

        if (bindOutputFrameBuffer) {
            bindOutputFrameBuffer(params.pass);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        if (unbindOutputFrameBuffer) {
            unbindOutputFrameBuffer(params.pass);
        }
    };

    //this._renderer.render({pass: pass, clear: clear, force: forceRender});
    this.render = function (params) {
        params = params || {};

        update();

        if (imageDirty || this.imageForceDirty || params.force) {

            // In case context lost/recovered

            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {
                gl.getExtension("OES_element_index_uint");
            }

            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_standard_derivatives"]) { // For normal mapping w/o precomputed tangents
                gl.getExtension("OES_standard_derivatives");
            }

            drawObjects(params);

            stats.frame.frameCount++;
            imageDirty = false;
            this.imageForceDirty = false;
        }
    };

    function update() {
        if (objectListDirty) {
            buildObjectList();
            objectListDirty = false;
            stateSortDirty = true;
        }
        if (stateSortDirty) {
            stateSort();
            stateSortDirty = false;
            imageDirty = true;
        }
        //  if (shadowsDirty) {
        drawShadowMaps();
        // shadowsDirty = false;
        // }
    }

    function buildObjectList() {
        objectListLen = 0;
        for (var objectId in objects) {
            if (objects.hasOwnProperty(objectId)) {
                objectList[objectListLen++] = objects[objectId];
            }
        }
        for (var i = objectListLen, len = objectList.length; i < len; i++) {
            objectList[i] = null; // Release memory
        }
        objectList.length = objectListLen;
    }

    function stateSort() {
        objectList.length = objectListLen;
        objectList.sort(xeogl.renderer.Object.compareState);
    }

    function drawShadowMaps() {
        var lights = self.lights.lights;
        var light;
        var i;
        var len;
        for (i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            if (!light.shadow) {
                continue;
            }
            drawShadowMap(light);
        }
    }

    function drawShadowMap(light) {

        var shadow = light.shadow;

        if (!shadow) {
            return;
        }

        var renderBuf = light.getShadowRenderBuf();

        if (!renderBuf) {
            return;
        }

        renderBuf.bind();

        frame.reset();
        frame.backfaces = true;
        frame.frontface = true;
        frame.drawElements = 0;
        frame.useProgram = -1;
        frame.shadowViewMatrix = light.getShadowViewMatrix();
        frame.shadowProjMatrix = light.getShadowProjMatrix();

        if (self.viewport) {
            var boundary = self.viewport.boundary;
            gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        } else {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var i;
        var object;

        for (i = 0; i < objectListLen; i++) {
            object = objectList[i];
            if (!object.modes.visible || !object.modes.castShadow) {
                continue; // For now, culled objects still cast shadows because they are just out of view
            }
            if (object.material.alpha === 0) {
                continue;
            }
            object.drawShadow(frame, light);
        }

        renderBuf.unbind();
    }

    var drawObjects = (function () {

        var opaqueGhostFillObjects = [];
        var opaqueGhostVerticesObjects = [];
        var opaqueGhostEdgesObjects = [];
        var transparentGhostFillObjects = [];
        var transparentGhostVerticesObjects = [];
        var transparentGhostEdgesObjects = [];

        var opaqueHighlightFillObjects = [];
        var opaqueHighlightVerticesObjects = [];
        var opaqueHighlightEdgesObjects = [];
        var transparentHighlightFillObjects = [];
        var transparentHighlightVerticesObjects = [];
        var transparentHighlightEdgesObjects = [];

        var opaqueSelectedFillObjects = [];
        var opaqueSelectedVerticesObjects = [];
        var opaqueSelectedEdgesObjects = [];
        var transparentSelectedFillObjects = [];
        var transparentSelectedVerticesObjects = [];
        var transparentSelectedEdgesObjects = [];

        var outlinedObjects = [];
        var highlightObjects = [];
        var selectedObjects = [];
        var transparentObjects = [];
        var numTransparentObjects = 0;

        return function (params) {

            if (ambient) {
                var color = ambient.color;
                var intensity = ambient.intensity;
                ambientColor[0] = color[0] * intensity;
                ambientColor[1] = color[1] * intensity;
                ambientColor[2] = color[2] * intensity;
            } else {
                ambientColor[0] = 0;
                ambientColor[1] = 0;
                ambientColor[2] = 0;
            }

            frame.reset();
            frame.pass = params.pass;

            if (self.viewport) {
                var boundary = self.viewport.boundary;
                gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
            } else {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            }

            if (canvasTransparent) { // Canvas is transparent
                gl.clearColor(0, 0, 0, 0);
            } else {
                gl.clearColor(ambientColor[0], ambientColor[1], ambientColor[2], 1.0);
            }

            gl.enable(gl.DEPTH_TEST);
            gl.frontFace(gl.CCW);
            gl.enable(gl.CULL_FACE);
            gl.depthMask(true);

            var i;
            var len;
            var object;
            var modes;
            var material;
            var transparent;

            var startTime = Date.now();

            if (bindOutputFrameBuffer) {
                bindOutputFrameBuffer(params.pass);
            }

            if (params.clear !== false) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }

            var numOpaqueGhostFillObjects = 0;
            var numOpaqueGhostVerticesObjects = 0;
            var numOpaqueGhostEdgesObjects = 0;
            var numTransparentGhostFillObjects = 0;
            var numTransparentGhostVerticesObjects = 0;
            var numTransparentGhostEdgesObjects = 0;
            var numOutlinedObjects = 0;
            var numHighlightObjects = 0;
            var numSelectedObjects = 0;

            var numOpaqueHighlightFillObjects = 0;
            var numOpaqueHighlightVerticesObjects = 0;
            var numOpaqueHighlightEdgesObjects = 0;
            var numTransparentHighlightFillObjects = 0;
            var numTransparentHighlightVerticesObjects = 0;
            var numTransparentHighlightEdgesObjects = 0;

            var numOpaqueSelectedFillObjects = 0;
            var numOpaqueSelectedVerticesObjects = 0;
            var numOpaqueSelectedEdgesObjects = 0;
            var numTransparentSelectedFillObjects = 0;
            var numTransparentSelectedVerticesObjects = 0;
            var numTransparentSelectedEdgesObjects = 0;

            numTransparentObjects = 0;

            // Build draw lists

            for (i = 0, len = objectListLen; i < len; i++) {

                object = objectList[i];
                modes = object.modes;
                material = object.material;

                if (modes.culled === true || modes.visible === false) {
                    continue;
                }

                if (material.alpha === 0) {
                    continue;
                }

                if (modes.ghosted) {
                    var ghostMaterial = object.ghostMaterial;
                    if (ghostMaterial.edges) {
                        if (ghostMaterial.edgeAlpha < 1.0) {
                            transparentGhostEdgesObjects[numTransparentGhostEdgesObjects++] = object;
                        } else {
                            opaqueGhostEdgesObjects[numOpaqueGhostEdgesObjects++] = object;
                        }
                    }
                    if (ghostMaterial.vertices) {
                        if (ghostMaterial.vertexAlpha < 1.0) {
                            transparentGhostVerticesObjects[numTransparentGhostVerticesObjects++] = object;
                        } else {
                            opaqueGhostVerticesObjects[numOpaqueGhostVerticesObjects++] = object;
                        }
                    }
                    if (ghostMaterial.fill) {
                        if (ghostMaterial.fillAlpha < 1.0) {
                            transparentGhostFillObjects[numTransparentGhostFillObjects++] = object;
                        } else {
                            opaqueGhostFillObjects[numOpaqueGhostFillObjects++] = object;
                        }
                    }
                } else {

                    // Normal render

                    transparent = object.material.alphaMode === 2 /* blend */ || modes.xray || modes.colorize[3] < 1;
                    if (transparent) {
                        transparentObjects[numTransparentObjects++] = object;
                    } else {
                        if (modes.outlined) {
                            outlinedObjects[numOutlinedObjects++] = object;
                        } else {
                            object.draw(frame);
                        }
                    }
                }

                if (modes.selected) {
                    var selectedMaterial = object.selectedMaterial;
                    if (selectedMaterial.edges) {
                        if (selectedMaterial.edgeAlpha < 1.0) {
                            transparentSelectedEdgesObjects[numTransparentSelectedEdgesObjects++] = object;
                        } else {
                            opaqueSelectedEdgesObjects[numOpaqueSelectedEdgesObjects++] = object;
                        }
                    }
                    if (selectedMaterial.vertices) {
                        if (selectedMaterial.vertexAlpha < 1.0) {
                            transparentSelectedVerticesObjects[numTransparentSelectedVerticesObjects++] = object;
                        } else {
                            opaqueSelectedVerticesObjects[numOpaqueSelectedVerticesObjects++] = object;
                        }
                    }
                    if (selectedMaterial.fill) {
                        if (selectedMaterial.fillAlpha < 1.0) {
                            transparentSelectedFillObjects[numTransparentSelectedFillObjects++] = object;
                        } else {
                            opaqueSelectedFillObjects[numOpaqueSelectedFillObjects++] = object;
                        }
                    }
                    if (modes.selected) {
                        selectedObjects[numSelectedObjects++] = object;
                    }
                }

                if (modes.highlighted) {
                    var highlightMaterial = object.highlightMaterial;
                    if (highlightMaterial.edges) {
                        if (highlightMaterial.edgeAlpha < 1.0) {
                            transparentHighlightEdgesObjects[numTransparentHighlightEdgesObjects++] = object;
                        } else {
                            opaqueHighlightEdgesObjects[numOpaqueHighlightEdgesObjects++] = object;
                        }
                    }
                    if (highlightMaterial.vertices) {
                        if (highlightMaterial.vertexAlpha < 1.0) {
                            transparentHighlightVerticesObjects[numTransparentHighlightVerticesObjects++] = object;
                        } else {
                            opaqueHighlightVerticesObjects[numOpaqueHighlightVerticesObjects++] = object;
                        }
                    }
                    if (highlightMaterial.fill) {
                        if (highlightMaterial.fillAlpha < 1.0) {
                            transparentHighlightFillObjects[numTransparentHighlightFillObjects++] = object;
                        } else {
                            opaqueHighlightFillObjects[numOpaqueHighlightFillObjects++] = object;
                        }
                    }
                    if (modes.highlighted) {
                        highlightObjects[numHighlightObjects++] = object;
                    }
                }
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

                for (i = 0; i < numOutlinedObjects; i++) {
                    outlinedObjects[i].draw(frame);
                }

                // Render outlines

                gl.stencilFunc(gl.EQUAL, 0, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.stencilMask(0x00);
                gl.disable(gl.CULL_FACE); // Need both faces for better corners with face-aligned normals

                for (i = 0; i < numOutlinedObjects; i++) {
                    outlinedObjects[i].drawOutline(frame);
                }

                gl.disable(gl.STENCIL_TEST);
            }

            // Render opaque ghosted objects

            if (numOpaqueGhostFillObjects > 0) {
                for (i = 0; i < numOpaqueGhostFillObjects; i++) {
                    opaqueGhostFillObjects[i].drawGhostFill(frame);
                }
            }

            if (numOpaqueGhostEdgesObjects > 0) {
                for (i = 0; i < numOpaqueGhostEdgesObjects; i++) {
                    opaqueGhostEdgesObjects[i].drawGhostEdges(frame);
                }
            }

            if (numOpaqueGhostVerticesObjects > 0) {
                for (i = 0; i < numOpaqueGhostVerticesObjects; i++) {
                    opaqueGhostVerticesObjects[i].drawGhostVertices(frame);
                }
            }

            var transparentDepthMask = true;

            if (numTransparentGhostFillObjects > 0 || numTransparentGhostEdgesObjects > 0 || numTransparentGhostVerticesObjects > 0 || numTransparentObjects > 0) {

                // Draw transparent objects

                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);

                if (blendOneMinusSrcAlpha) {

                    // Makes glTF windows appear correct

                    // Without premultiplied alpha:
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                    // Premultiplied alpha:
                    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                } else {

                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                }

                frame.backfaces = false;

                if (!transparentDepthMask) {
                    gl.depthMask(false);
                }

                // Render transparent ghosted objects

                if (numTransparentGhostVerticesObjects > 0) {
                    for (i = 0; i < numTransparentGhostVerticesObjects; i++) {
                        transparentGhostVerticesObjects[i].drawGhostVertices(frame);
                    }
                }

                if (numTransparentGhostEdgesObjects > 0) {
                    for (i = 0; i < numTransparentGhostEdgesObjects; i++) {
                        transparentGhostEdgesObjects[i].drawGhostEdges(frame);
                    }
                }

                if (numTransparentGhostFillObjects > 0) {
                    for (i = 0; i < numTransparentGhostFillObjects; i++) {
                        transparentGhostFillObjects[i].drawGhostFill(frame);
                    }
                }

                numOutlinedObjects = 0;

                for (i = 0; i < numTransparentObjects; i++) {
                    object = transparentObjects[i];
                    if (object.modes.outlined) {
                        outlinedObjects[numOutlinedObjects++] = object; // Build outlined list
                        continue;
                    }

                    object.draw(frame);
                }

                // Transparent outlined objects are not supported yet

                gl.disable(gl.BLEND);
            }

            // Highlighting

            if (numOpaqueHighlightFillObjects > 0 || numOpaqueHighlightEdgesObjects > 0 || numOpaqueHighlightVerticesObjects > 0) {

                // Render opaque highlighted objects

                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);

                if (numOpaqueHighlightVerticesObjects > 0) {
                    for (i = 0; i < numOpaqueHighlightVerticesObjects; i++) {
                        opaqueHighlightVerticesObjects[i].drawHighlightVertices(frame);
                    }
                }

                if (numOpaqueHighlightEdgesObjects > 0) {
                    for (i = 0; i < numOpaqueHighlightEdgesObjects; i++) {
                        opaqueHighlightEdgesObjects[i].drawHighlightEdges(frame);
                    }
                }

                if (numOpaqueHighlightFillObjects > 0) {
                    for (i = 0; i < numOpaqueHighlightFillObjects; i++) {
                        opaqueHighlightFillObjects[i].drawHighlightFill(frame);
                    }
                }
            }

            if (numTransparentHighlightFillObjects > 0 || numTransparentHighlightEdgesObjects > 0 || numTransparentHighlightVerticesObjects > 0) {

                // Render transparent highlighted objects

                frame.lastProgramId = null;

                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //          gl.disable(gl.DEPTH_TEST);

                if (numTransparentHighlightVerticesObjects > 0) {
                    for (i = 0; i < numTransparentHighlightVerticesObjects; i++) {
                        transparentHighlightVerticesObjects[i].drawHighlightVertices(frame);
                    }
                }

                if (numTransparentHighlightEdgesObjects > 0) {
                    for (i = 0; i < numTransparentHighlightEdgesObjects; i++) {
                        transparentHighlightEdgesObjects[i].drawHighlightEdges(frame);
                    }
                }

                if (numTransparentHighlightFillObjects > 0) {
                    for (i = 0; i < numTransparentHighlightFillObjects; i++) {
                        transparentHighlightFillObjects[i].drawHighlightFill(frame);
                    }
                }

                gl.disable(gl.BLEND);
                //        gl.enable(gl.DEPTH_TEST);
            }

            // Selection

            if (numOpaqueSelectedFillObjects > 0 || numOpaqueSelectedEdgesObjects > 0 || numOpaqueSelectedVerticesObjects > 0) {

                // Render opaque selected objects

                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);

                if (numOpaqueSelectedVerticesObjects > 0) {
                    for (i = 0; i < numOpaqueSelectedVerticesObjects; i++) {
                        opaqueSelectedVerticesObjects[i].drawSelectedVertices(frame);
                    }
                }

                if (numOpaqueSelectedEdgesObjects > 0) {
                    for (i = 0; i < numOpaqueSelectedEdgesObjects; i++) {
                        opaqueSelectedEdgesObjects[i].drawSelectedEdges(frame);
                    }
                }

                if (numOpaqueSelectedFillObjects > 0) {
                    for (i = 0; i < numOpaqueSelectedFillObjects; i++) {
                        opaqueSelectedFillObjects[i].drawSelectedFill(frame);
                    }
                }
            }

            if (numTransparentSelectedFillObjects > 0 || numTransparentSelectedEdgesObjects > 0 || numTransparentSelectedVerticesObjects > 0) {

                // Render transparent selected objects

                frame.lastProgramId = null;

                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //          gl.disable(gl.DEPTH_TEST);

                if (numTransparentSelectedVerticesObjects > 0) {
                    for (i = 0; i < numTransparentSelectedVerticesObjects; i++) {
                        transparentSelectedVerticesObjects[i].drawSelectedVertices(frame);
                    }
                }

                if (numTransparentSelectedEdgesObjects > 0) {
                    for (i = 0; i < numTransparentSelectedEdgesObjects; i++) {
                        transparentSelectedEdgesObjects[i].drawSelectedEdges(frame);
                    }
                }

                if (numTransparentSelectedFillObjects > 0) {
                    for (i = 0; i < numTransparentSelectedFillObjects; i++) {
                        transparentSelectedFillObjects[i].drawSelectedFill(frame);
                    }
                }

                gl.disable(gl.BLEND);
                //        gl.enable(gl.DEPTH_TEST);
            }

            var endTime = Date.now();
            var frameStats = stats.frame;

            frameStats.renderTime = (endTime - startTime) / 1000.0;
            frameStats.drawElements = frame.drawElements;
            frameStats.drawElements = frame.drawElements;
            frameStats.useProgram = frame.useProgram;
            frameStats.bindTexture = frame.bindTexture;
            frameStats.bindArray = frame.bindArray;

            var numTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_UNITS;
            for (var ii = 0; ii < numTextureUnits; ii++) {
                gl.activeTexture(gl.TEXTURE0 + ii);
            }
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            gl.bindTexture(gl.TEXTURE_2D, null);

            // Set the backbuffer's alpha to 1.0
            // gl.clearColor(1, 1, 1, 1);
            // gl.colorMask(false, false, false, true);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            // gl.colorMask(true, true, true, true);

            if (unbindOutputFrameBuffer) {
                unbindOutputFrameBuffer(params.pass);
            }
        };
    })();

    this.pick = (function () {

        var math = xeogl.math;
        var tempVec3a = math.vec3();
        var tempMat4a = math.mat4();
        var up = math.vec3([0, 1, 0]);
        var pickFrustumMatrix = math.frustumMat4(-1, 1, -1, 1, 0.1, 10000);

        return function (params) {

            update();

            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) { // In case context lost/recovered
                gl.getExtension("OES_element_index_uint");
            }

            var canvasX;
            var canvasY;
            var origin;
            var direction;
            var look;
            var pickViewMatrix = null;
            var pickProjMatrix = null;

            if (params.canvasPos) {

                canvasX = params.canvasPos[0];
                canvasY = params.canvasPos[1];

            } else {

                // Picking with arbitrary World-space ray
                // Align camera along ray and fire ray through center of canvas

                origin = params.origin || math.vec3([0, 0, 0]);
                direction = params.direction || math.vec3([0, 0, 1]);
                look = math.addVec3(origin, direction, tempVec3a);

                pickViewMatrix = math.lookAtMat4v(origin, look, up, tempMat4a);
                pickProjMatrix = pickFrustumMatrix;

                canvasX = canvas.clientWidth * 0.5;
                canvasY = canvas.clientHeight * 0.5;
            }

            pickBuf = pickBuf || new xeogl.renderer.RenderBuffer(canvas, gl);
            pickBuf.bind();

            var object = pickObject(canvasX, canvasY, pickViewMatrix, pickProjMatrix, params);

            if (!object) {
                pickBuf.unbind();
                return null;
            }

            var hit = {
                entity: object.entityId
            };

            if (params.pickSurface) {
                hit.primIndex = pickTriangle(object, canvasX, canvasY, pickViewMatrix, pickProjMatrix);
            }

            if (pickViewMatrix) {
                hit.origin = origin;
                hit.direction = direction;
            }

            pickBuf.unbind();

            return hit;
        };
    })();

    function pickObject(canvasX, canvasY, pickViewMatrix, pickProjMatrix, params) {

        frame.reset();
        frame.backfaces = true;
        frame.pickViewMatrix = pickViewMatrix;
        frame.pickProjMatrix = pickProjMatrix;
        frame.pickObjectIndex = 1;

        if (self.viewport) {
            var boundary = self.viewport.boundary;
            gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        } else {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        objectPickListLen = 0;

        var i;
        var len;
        var object;
        var includeObjects = params.includeObjects;
        var excludeObjects = params.excludeObjects;

        for (i = 0, len = objectListLen; i < len; i++) {
            object = objectList[i];
            if (object.modes.culled === true || object.modes.visible === false || object.modes.pickable === false) {
                continue;
            }
            if (includeObjects && !includeObjects[object.id]) {
                continue;
            }
            if (excludeObjects && excludeObjects[object.id]) {
                continue;
            }
            objectPickList[objectPickListLen++] = object;
            object.pickObject(frame);
        }

        var pix = pickBuf.read(canvasX, canvasY);
        var pickedObjectIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        pickedObjectIndex--;

        //pickedObjectIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;

        return pickedObjectIndex >= 0 ? objectPickList[pickedObjectIndex] : null;
    }

    function pickTriangle(object, canvasX, canvasY, pickViewMatrix, pickProjMatrix) {

        frame.reset();
        frame.backfaces = true;
        frame.frontface = true; // "ccw" 
        frame.pickViewMatrix = pickViewMatrix; // Can be null
        frame.pickProjMatrix = pickProjMatrix; // Can be null

        if (self.viewport) {
            var boundary = self.viewport.boundary;
            gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        } else {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        object.pickTriangle(frame);

        var pix = pickBuf.read(canvasX, canvasY);

        var primIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        primIndex *= 3; // Convert from triangle number to first vertex in indices

        return primIndex;
    }

    this.readPixels = function (pixels, colors, len, opaqueOnly) {

        readPixelBuf = readPixelBuf || (readPixelBuf = new xeogl.renderer.RenderBuffer(canvas, gl));
        readPixelBuf.bind();
        readPixelBuf.clear();

        this.render({force: true, opaqueOnly: opaqueOnly});

        var color;
        var i;
        var j;
        var k;
        for (i = 0; i < len; i++) {
            j = i * 2;
            k = i * 4;
            color = readPixelBuf.read(pixels[j], pixels[j + 1]);
            colors[k] = color[0];
            colors[k + 1] = color[1];
            colors[k + 2] = color[2];
            colors[k + 3] = color[3];
        }

        readPixelBuf.unbind();

        imageDirty = true;
    };

    this.destroy = function () {
        if (pickBuf) {
            pickBuf.destroy();
        }
        if (readPixelBuf) {
            readPixelBuf.destroy();
        }
    };
};
