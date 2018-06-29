/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer = xeogl.renderer || {};


xeogl.renderer.Renderer = function (stats, scene, options) {

    "use strict";

    options = options || {};
    stats = stats || {};

    var frame = new xeogl.renderer.Frame();
    var canvas = scene.canvas.canvas;
    var gl = scene.canvas.gl;
    var shadowLightMeshes = {};
    var canvasTransparent = options.transparent === true;
    var meshList = [];
    var meshListLen = 0;
    var meshPickList = [];
    var meshPickListLen = 0;
    var shadowMeshLists = {};

    var meshListDirty = true;
    var stateSortDirty = true;
    var imageDirty = true;
    var shadowsDirty = true;

    this.imageForceDirty = true;

    var blendOneMinusSrcAlpha = true;

    var pickBuf = null;
    var readPixelBuf = null;

    var bindOutputFrameBuffer = null;
    var unbindOutputFrameBuffer = null;

    this.meshListDirty = function () {
        meshListDirty = true;
        stateSortDirty = true;
    };

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


    /**
     * Clears the canvas.
     * @param params
     */
    this.clear = function (params) {
        params = params || {};
        var boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        if (canvasTransparent) { // Canvas is transparent
            gl.clearColor(0, 0, 0, 0);
        } else {
            var color = params.ambientColor || this.lights.getAmbientColor();
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

    /**
     * Renders the scene.
     * @param params
     */
    this.render = function (params) {
        params = params || {};
        update();
        if (imageDirty || this.imageForceDirty || params.force) {
            drawMeshes(params);
            stats.frame.frameCount++;
            imageDirty = false;
            this.imageForceDirty = false;
        }
    };

    function update() {
        if (meshListDirty) {
            buildMeshList();
            meshListDirty = false;
            stateSortDirty = true;
        }
        if (stateSortDirty) {
            meshList.sort(xeogl.Mesh._compareState);
            stateSortDirty = false;
            imageDirty = true;
        }
        //  if (shadowsDirty) {
    //    drawShadowMaps();
        // shadowsDirty = false;
        // }
    }

    function buildMeshList() {
        meshListLen = 0;
        for (var meshId in scene.meshes) {
            if (scene.meshes.hasOwnProperty(meshId)) {
                meshList[meshListLen++] = scene.meshes[meshId];
            }
        }
        for (var i = meshListLen, len = meshList.length; i < len; i++) {
            meshList[i] = null; // Release memory
        }
        meshList.length = meshListLen;
    }

    function stateSort() {
        meshList.sort(xeogl.Mesh._compareState);
    }

    function drawShadowMaps() {
        // var lights = self.lights.lights;
        // var light;
        // var i;
        // var len;
        // for (i = 0, len = lights.length; i < len; i++) {
        //     light = lights[i];
        //     if (!light.shadow) {
        //         continue;
        //     }
        //     drawShadowMap(light);
        // }
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

        var boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var i;
        var mesh;

        for (i = 0; i < meshListLen; i++) {
            mesh = meshList[i];
            if (!mesh._state.visible || !mesh._state.castShadow) {
                continue; // For now, culled meshes still cast shadows because they are just out of view
            }
            if (mesh._material._state.alpha === 0) {
                continue;
            }
            mesh.drawShadow(frame, light);
        }

        renderBuf.unbind();
    }

    var drawMeshes = (function () {

        var opaqueGhostFillMeshes = [];
        var opaqueGhostVerticesMeshes = [];
        var opaqueGhostEdgesMeshes = [];
        var transparentGhostFillMeshes = [];
        var transparentGhostVerticesMeshes = [];
        var transparentGhostEdgesMeshes = [];

        var opaqueHighlightFillMeshes = [];
        var opaqueHighlightVerticesMeshes = [];
        var opaqueHighlightEdgesMeshes = [];
        var transparentHighlightFillMeshes = [];
        var transparentHighlightVerticesMeshes = [];
        var transparentHighlightEdgesMeshes = [];

        var opaqueSelectedFillMeshes = [];
        var opaqueSelectedVerticesMeshes = [];
        var opaqueSelectedEdgesMeshes = [];
        var transparentSelectedFillMeshes = [];
        var transparentSelectedVerticesMeshes = [];
        var transparentSelectedEdgesMeshes = [];

        var opaqueEdgesMeshes = [];
        var transparentEdgesMeshes = [];

        var outlinedMeshes = [];
        var highlightMeshes = [];
        var selectedMeshes = [];
        var transparentMeshes = [];
        var numTransparentMeshes = 0;

        return function (params) {

            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {  // In case context lost/recovered
                gl.getExtension("OES_element_index_uint");
            }
            if (xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_standard_derivatives"]) { // For normal mapping w/o precomputed tangents
                gl.getExtension("OES_standard_derivatives");
            }

            var ambientColor = scene._lightsState.getAmbientColor();

            frame.reset();
            frame.pass = params.pass;

            var boundary = scene.viewport.boundary;
            gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

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
            var mesh;
            var meshState;
            var materialState;
            var transparent;

            var startTime = Date.now();

            if (bindOutputFrameBuffer) {
                bindOutputFrameBuffer(params.pass);
            }

            if (params.clear !== false) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }

            var numOpaqueGhostFillMeshes = 0;
            var numOpaqueGhostVerticesMeshes = 0;
            var numOpaqueGhostEdgesMeshes = 0;
            var numTransparentGhostFillMeshes = 0;
            var numTransparentGhostVerticesMeshes = 0;
            var numTransparentGhostEdgesMeshes = 0;

            var numOutlinedMeshes = 0;
            var numHighlightMeshes = 0;
            var numSelectedMeshes = 0;

            var numOpaqueHighlightFillMeshes = 0;
            var numOpaqueHighlightVerticesMeshes = 0;
            var numOpaqueHighlightEdgesMeshes = 0;
            var numTransparentHighlightFillMeshes = 0;
            var numTransparentHighlightVerticesMeshes = 0;
            var numTransparentHighlightEdgesMeshes = 0;

            var numOpaqueSelectedFillMeshes = 0;
            var numOpaqueSelectedVerticesMeshes = 0;
            var numOpaqueSelectedEdgesMeshes = 0;
            var numTransparentSelectedFillMeshes = 0;
            var numTransparentSelectedVerticesMeshes = 0;
            var numTransparentSelectedEdgesMeshes = 0;

            var numOpaqueEdgesMeshes = 0;
            var numTransparentEdgesMeshes = 0;

            numTransparentMeshes = 0;

            // Build draw lists

            for (i = 0, len = meshListLen; i < len; i++) {

                mesh = meshList[i];
                meshState = mesh._state;
                materialState = mesh._material._state;

                if (meshState.culled === true || meshState.visible === false) {
                    continue;
                }

                if (materialState.alpha === 0) {
                    continue;
                }

                if (meshState.ghosted) {
                    var ghostMaterialState = mesh._ghostMaterial._state;
                    if (ghostMaterialState.edges) {
                        if (ghostMaterialState.edgeAlpha < 1.0) {
                            transparentGhostEdgesMeshes[numTransparentGhostEdgesMeshes++] = mesh;
                        } else {
                            opaqueGhostEdgesMeshes[numOpaqueGhostEdgesMeshes++] = mesh;
                        }
                    }
                    if (ghostMaterialState.vertices) {
                        if (ghostMaterialState.vertexAlpha < 1.0) {
                            transparentGhostVerticesMeshes[numTransparentGhostVerticesMeshes++] = mesh;
                        } else {
                            opaqueGhostVerticesMeshes[numOpaqueGhostVerticesMeshes++] = mesh;
                        }
                    }
                    if (ghostMaterialState.fill) {
                        if (ghostMaterialState.fillAlpha < 1.0) {
                            transparentGhostFillMeshes[numTransparentGhostFillMeshes++] = mesh;
                        } else {
                            opaqueGhostFillMeshes[numOpaqueGhostFillMeshes++] = mesh;
                        }
                    }

                } else {

                    // Normal render

                    transparent = materialState.alphaMode === 2 /* blend */ || meshState.xray || meshState.colorize[3] < 1;
                    if (transparent) {
                        transparentMeshes[numTransparentMeshes++] = mesh;
                    } else {
                        if (meshState.outlined) {
                            outlinedMeshes[numOutlinedMeshes++] = mesh;
                        } else {
                            mesh._draw(frame);
                        }
                    }
                }

                if (meshState.selected) {
                    var selectedMaterialState = mesh._selectedMaterial._state;
                    if (selectedMaterialState.edges) {
                        if (selectedMaterialState.edgeAlpha < 1.0) {
                            transparentSelectedEdgesMeshes[numTransparentSelectedEdgesMeshes++] = mesh;
                        } else {
                            opaqueSelectedEdgesMeshes[numOpaqueSelectedEdgesMeshes++] = mesh;
                        }
                    }
                    if (selectedMaterialState.vertices) {
                        if (selectedMaterialState.vertexAlpha < 1.0) {
                            transparentSelectedVerticesMeshes[numTransparentSelectedVerticesMeshes++] = mesh;
                        } else {
                            opaqueSelectedVerticesMeshes[numOpaqueSelectedVerticesMeshes++] = mesh;
                        }
                    }
                    if (selectedMaterialState.fill) {
                        if (selectedMaterialState.fillAlpha < 1.0) {
                            transparentSelectedFillMeshes[numTransparentSelectedFillMeshes++] = mesh;
                        } else {
                            opaqueSelectedFillMeshes[numOpaqueSelectedFillMeshes++] = mesh;
                        }
                    }
                    if (meshState.selected) {
                        selectedMeshes[numSelectedMeshes++] = mesh;
                    }
                }

                if (meshState.highlighted) {
                    var highlightMaterialState = mesh._highlightMaterial._state;
                    if (highlightMaterialState.edges) {
                        if (highlightMaterialState.edgeAlpha < 1.0) {
                            transparentHighlightEdgesMeshes[numTransparentHighlightEdgesMeshes++] = mesh;
                        } else {
                            opaqueHighlightEdgesMeshes[numOpaqueHighlightEdgesMeshes++] = mesh;
                        }
                    }
                    if (highlightMaterialState.vertices) {
                        if (highlightMaterialState.vertexAlpha < 1.0) {
                            transparentHighlightVerticesMeshes[numTransparentHighlightVerticesMeshes++] = mesh;
                        } else {
                            opaqueHighlightVerticesMeshes[numOpaqueHighlightVerticesMeshes++] = mesh;
                        }
                    }
                    if (highlightMaterialState.fill) {
                        if (highlightMaterialState.fillAlpha < 1.0) {
                            transparentHighlightFillMeshes[numTransparentHighlightFillMeshes++] = mesh;
                        } else {
                            opaqueHighlightFillMeshes[numOpaqueHighlightFillMeshes++] = mesh;
                        }
                    }
                    if (meshState.highlighted) {
                        highlightMeshes[numHighlightMeshes++] = mesh;
                    }
                }

                if (meshState.edges) {
                    var edgeMaterial = mesh._edgeMaterial._state;
                    if (edgeMaterial.edgeAlpha < 1.0) {
                        transparentEdgesMeshes[numTransparentEdgesMeshes++] = mesh;
                    } else {
                        opaqueEdgesMeshes[numOpaqueEdgesMeshes++] = mesh;
                    }
                }
            }

            // Render opaque outlined meshes

            if (numOutlinedMeshes > 0) {

                // Render meshes

                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.stencilMask(1);
                gl.clearStencil(0);
                gl.clear(gl.STENCIL_BUFFER_BIT);

                for (i = 0; i < numOutlinedMeshes; i++) {
                    outlinedMeshes[i]._draw(frame);
                }

                // Render outlines

                gl.stencilFunc(gl.EQUAL, 0, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.stencilMask(0x00);
                gl.disable(gl.CULL_FACE); // Need both faces for better corners with face-aligned normals

                for (i = 0; i < numOutlinedMeshes; i++) {
                    outlinedMeshes[i]._drawOutline(frame);
                }

                gl.disable(gl.STENCIL_TEST);
            }

            // Render opaque edges meshes

            if (numOpaqueEdgesMeshes > 0) {
                for (i = 0; i < numOpaqueEdgesMeshes; i++) {
                    opaqueEdgesMeshes[i]._drawEdges(frame);
                }
            }

            // Render opaque ghosted meshes

            if (numOpaqueGhostFillMeshes > 0) {
                for (i = 0; i < numOpaqueGhostFillMeshes; i++) {
                    opaqueGhostFillMeshes[i]._drawGhostFill(frame);
                }
            }

            if (numOpaqueGhostEdgesMeshes > 0) {
                for (i = 0; i < numOpaqueGhostEdgesMeshes; i++) {
                    opaqueGhostEdgesMeshes[i]._drawGhostEdges(frame);
                }
            }

            if (numOpaqueGhostVerticesMeshes > 0) {
                for (i = 0; i < numOpaqueGhostVerticesMeshes; i++) {
                    opaqueGhostVerticesMeshes[i]._drawGhostVertices(frame);
                }
            }

            var transparentDepthMask = true;

            if (numTransparentGhostFillMeshes > 0 || numTransparentGhostEdgesMeshes > 0 || numTransparentGhostVerticesMeshes > 0 || numTransparentMeshes > 0) {

                // Draw transparent meshes

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

                // Render transparent ghosted meshes

                if (numTransparentGhostVerticesMeshes > 0) {
                    for (i = 0; i < numTransparentGhostVerticesMeshes; i++) {
                        transparentGhostVerticesMeshes[i]._drawGhostVertices(frame);
                    }
                }

                if (numTransparentGhostEdgesMeshes > 0) {
                    for (i = 0; i < numTransparentGhostEdgesMeshes; i++) {
                        transparentGhostEdgesMeshes[i]._drawGhostEdges(frame);
                    }
                }

                if (numTransparentGhostFillMeshes > 0) {
                    for (i = 0; i < numTransparentGhostFillMeshes; i++) {
                        transparentGhostFillMeshes[i]._drawGhostFill(frame);
                    }
                }

                numOutlinedMeshes = 0;

                for (i = 0; i < numTransparentMeshes; i++) {
                    mesh = transparentMeshes[i];
                    if (mesh._state.outlined) {
                        outlinedMeshes[numOutlinedMeshes++] = mesh; // Build outlined list
                        continue;
                    }

                    mesh._draw(frame);
                }

                // Transparent outlined meshes are not supported yet

                gl.disable(gl.BLEND);
            }

            // Highlighting

            if (numOpaqueHighlightFillMeshes > 0 || numOpaqueHighlightEdgesMeshes > 0 || numOpaqueHighlightVerticesMeshes > 0) {

                // Render opaque highlighted meshes

                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);

                if (numOpaqueHighlightVerticesMeshes > 0) {
                    for (i = 0; i < numOpaqueHighlightVerticesMeshes; i++) {
                        opaqueHighlightVerticesMeshes[i]._drawHighlightVertices(frame);
                    }
                }

                if (numOpaqueHighlightEdgesMeshes > 0) {
                    for (i = 0; i < numOpaqueHighlightEdgesMeshes; i++) {
                        opaqueHighlightEdgesMeshes[i]._drawHighlightEdges(frame);
                    }
                }

                if (numOpaqueHighlightFillMeshes > 0) {
                    for (i = 0; i < numOpaqueHighlightFillMeshes; i++) {
                        opaqueHighlightFillMeshes[i]._drawHighlightFill(frame);
                    }
                }
            }

            if (numTransparentHighlightFillMeshes > 0 || numTransparentHighlightEdgesMeshes > 0 || numTransparentHighlightVerticesMeshes > 0) {

                // Render transparent highlighted meshes

                frame.lastProgramId = null;

                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //          gl.disable(gl.DEPTH_TEST);

                if (numTransparentHighlightVerticesMeshes > 0) {
                    for (i = 0; i < numTransparentHighlightVerticesMeshes; i++) {
                        transparentHighlightVerticesMeshes[i]._drawHighlightVertices(frame);
                    }
                }

                if (numTransparentHighlightEdgesMeshes > 0) {
                    for (i = 0; i < numTransparentHighlightEdgesMeshes; i++) {
                        transparentHighlightEdgesMeshes[i]._drawHighlightEdges(frame);
                    }
                }

                if (numTransparentHighlightFillMeshes > 0) {
                    for (i = 0; i < numTransparentHighlightFillMeshes; i++) {
                        transparentHighlightFillMeshes[i]._drawHighlightFill(frame);
                    }
                }

                gl.disable(gl.BLEND);
                //        gl.enable(gl.DEPTH_TEST);
            }

            // Selection

            if (numOpaqueSelectedFillMeshes > 0 || numOpaqueSelectedEdgesMeshes > 0 || numOpaqueSelectedVerticesMeshes > 0) {

                // Render opaque selected meshes

                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);

                if (numOpaqueSelectedVerticesMeshes > 0) {
                    for (i = 0; i < numOpaqueSelectedVerticesMeshes; i++) {
                        opaqueSelectedVerticesMeshes[i]._drawSelectedVertices(frame);
                    }
                }

                if (numOpaqueSelectedEdgesMeshes > 0) {
                    for (i = 0; i < numOpaqueSelectedEdgesMeshes; i++) {
                        opaqueSelectedEdgesMeshes[i]._drawSelectedEdges(frame);
                    }
                }

                if (numOpaqueSelectedFillMeshes > 0) {
                    for (i = 0; i < numOpaqueSelectedFillMeshes; i++) {
                        opaqueSelectedFillMeshes[i]._drawSelectedFill(frame);
                    }
                }
            }

            if (numTransparentSelectedFillMeshes > 0 || numTransparentSelectedEdgesMeshes > 0 || numTransparentSelectedVerticesMeshes > 0) {

                // Render transparent selected meshes

                frame.lastProgramId = null;

                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //          gl.disable(gl.DEPTH_TEST);

                if (numTransparentSelectedVerticesMeshes > 0) {
                    for (i = 0; i < numTransparentSelectedVerticesMeshes; i++) {
                        transparentSelectedVerticesMeshes[i]._drawSelectedVertices(frame);
                    }
                }

                if (numTransparentSelectedEdgesMeshes > 0) {
                    for (i = 0; i < numTransparentSelectedEdgesMeshes; i++) {
                        transparentSelectedEdgesMeshes[i]._drawSelectedEdges(frame);
                    }
                }

                if (numTransparentSelectedFillMeshes > 0) {
                    for (i = 0; i < numTransparentSelectedFillMeshes; i++) {
                        transparentSelectedFillMeshes[i]._drawSelectedFill(frame);
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

    /**
     * Picks a mesh in the scene.
     */
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

            var mesh = pickMesh(canvasX, canvasY, pickViewMatrix, pickProjMatrix, params);

            if (!mesh) {
                pickBuf.unbind();
                return null;
            }

            var hit = {
                mesh: mesh
            };

            if (params.pickSurface) {
                hit.primIndex = pickTriangle(mesh, canvasX, canvasY, pickViewMatrix, pickProjMatrix);
            }

            if (pickViewMatrix) {
                hit.origin = origin;
                hit.direction = direction;
            }

            pickBuf.unbind();

            return hit;
        };
    })();

    function pickMesh(canvasX, canvasY, pickViewMatrix, pickProjMatrix, params) {

        frame.reset();
        frame.backfaces = true;
        frame.frontface = true; // "ccw"
        frame.pickViewMatrix = pickViewMatrix;
        frame.pickProjMatrix = pickProjMatrix;
        frame.pickMeshIndex = 1;

        var boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        meshPickListLen = 0;

        var i;
        var len;
        var mesh;
        var includeMeshIds = params.includeMeshIds;
        var excludeMeshIds = params.excludeMeshIds;

        for (i = 0, len = meshListLen; i < len; i++) {
            mesh = meshList[i];
            if (mesh._state.culled === true || mesh._state.visible === false || mesh._state.pickable === false) {
                continue;
            }
            if (includeMeshIds && !includeMeshIds[mesh.id]) {
                continue;
            }
            if (excludeMeshIds && excludeMeshIds[mesh.id]) {
                continue;
            }
            meshPickList[meshPickListLen++] = mesh;
            mesh._pickMesh(frame);
        }

        var pix = pickBuf.read(Math.round(canvasX), Math.round(canvasY));
        var pickedMeshIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        pickedMeshIndex--;

        return pickedMeshIndex >= 0 ? meshPickList[pickedMeshIndex] : null;
    }

    function pickTriangle(mesh, canvasX, canvasY, pickViewMatrix, pickProjMatrix) {

        frame.reset();
        frame.backfaces = true;
        frame.frontface = true; // "ccw"
        frame.pickViewMatrix = pickViewMatrix; // Can be null
        frame.pickProjMatrix = pickProjMatrix; // Can be null

        var boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mesh._pickTriangle(frame);

        var pix = pickBuf.read(canvasX, canvasY);

        var primIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        primIndex *= 3; // Convert from triangle number to first vertex in indices

        return primIndex;
    }

    /**
     * Read pixels from the frame buffer. Performse a force-render first
     * @param pixels
     * @param colors
     * @param len
     * @param opaqueOnly
     */
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

    /**
     * Destroys this renderer.
     */
    this.destroy = function () {
        if (pickBuf) {
            pickBuf.destroy();
        }
        if (readPixelBuf) {
            readPixelBuf.destroy();
        }
    };
};
