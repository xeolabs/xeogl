/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Frame} from './frame.js';
import {RenderBuffer} from './renderBuffer.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';
import {Mesh} from '../objects/mesh.js';

const Renderer = function ( scene, options) {

    "use strict";

    options = options || {};

    const frame = new Frame();
    const canvas = scene.canvas.canvas;
    const gl = scene.canvas.gl;
    const shadowLightMeshes = {};
    const canvasTransparent = options.transparent === true;
    const meshList = [];
    let meshListLen = 0;
    const meshPickList = [];
    let meshPickListLen = 0;
    const shadowMeshLists = {};

    let meshListDirty = true;
    let stateSortDirty = true;
    let imageDirty = true;
    let shadowsDirty = true;

    this.imageForceDirty = true;

    let blendOneMinusSrcAlpha = true;

    let pickBuf = null;
    let readPixelBuf = null;

    const bindOutputFrameBuffer = null;
    const unbindOutputFrameBuffer = null;

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

    this.webglContextLost = function () {
    };

    this.webglContextRestored = function (gl) {
        if (pickBuf) {
            pickBuf.webglContextRestored(gl);
        }
        if (readPixelBuf) {
            readPixelBuf.webglContextRestored(gl);
        }
        imageDirty = true;
    };

    /**
     * Clears the canvas.
     * @param params
     */
    this.clear = function (params) {
        params = params || {};
        const boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);
        if (canvasTransparent) { // Canvas is transparent
            gl.clearColor(0, 0, 0, 0);
        } else {
            const color = params.ambientColor || this.lights.getAmbientColor();
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
            meshList.sort(Mesh._compareState);
            stateSortDirty = false;
            imageDirty = true;
        }
        // if (shadowsDirty) {
        //     drawShadowMaps();
        //     shadowsDirty = false;
        //     imageDirty = true;
        // }
    }

    function buildMeshList() {
        meshListLen = 0;
        for (const meshId in scene.meshes) {
            if (scene.meshes.hasOwnProperty(meshId)) {
                meshList[meshListLen++] = scene.meshes[meshId];
            }
        }
        for (let i = meshListLen, len = meshList.length; i < len; i++) {
            meshList[i] = null; // Release memory
        }
        meshList.length = meshListLen;
    }

    function stateSort() {
        meshList.sort(Mesh._compareState);
    }

    function drawShadowMaps() {
        var lights = scene._lightsState.lights;
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

        const shadow = light.shadow;

        if (!shadow) {
            return;
        }

        const renderBuf = light.getShadowRenderBuf();

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

        const boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let i;
        let mesh;

        for (i = 0; i < meshListLen; i++) {
            mesh = meshList[i];
            if (!mesh._state.visible || !mesh._state.castShadow) {
                continue; // For now, culled meshes still cast shadows because they are just out of view
            }
            if (mesh._material._state.alpha === 0) {
                continue;
            }
            mesh._drawShadow(frame, light);
        }

        renderBuf.unbind();
    }

    var drawMeshes = (function () {

        const opaqueGhostFillMeshes = [];
        const opaqueGhostVerticesMeshes = [];
        const opaqueGhostEdgesMeshes = [];
        const transparentGhostFillMeshes = [];
        const transparentGhostVerticesMeshes = [];
        const transparentGhostEdgesMeshes = [];

        const opaqueHighlightFillMeshes = [];
        const opaqueHighlightVerticesMeshes = [];
        const opaqueHighlightEdgesMeshes = [];
        const transparentHighlightFillMeshes = [];
        const transparentHighlightVerticesMeshes = [];
        const transparentHighlightEdgesMeshes = [];

        const opaqueSelectedFillMeshes = [];
        const opaqueSelectedVerticesMeshes = [];
        const opaqueSelectedEdgesMeshes = [];
        const transparentSelectedFillMeshes = [];
        const transparentSelectedVerticesMeshes = [];
        const transparentSelectedEdgesMeshes = [];

        const opaqueEdgesMeshes = [];
        const transparentEdgesMeshes = [];

        const outlinedMeshes = [];
        const highlightMeshes = [];
        const selectedMeshes = [];
        const transparentMeshes = [];
        let numTransparentMeshes = 0;

        return function (params) {

            var opaqueOnly = !!params.opaqueOnly;

            if (WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {  // In case context lost/recovered
                gl.getExtension("OES_element_index_uint");
            }
            if (WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_standard_derivatives"]) { // For normal mapping w/o precomputed tangents
                gl.getExtension("OES_standard_derivatives");
            }

            const ambientColor = scene._lightsState.getAmbientColor();

            frame.reset();
            frame.pass = params.pass;

            const boundary = scene.viewport.boundary;
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

            let i;
            let len;
            let mesh;
            let meshState;
            let materialState;
            let transparent;

            const startTime = Date.now();

            if (bindOutputFrameBuffer) {
                bindOutputFrameBuffer(params.pass);
            }

            if (params.clear !== false) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }

            let numOpaqueGhostFillMeshes = 0;
            let numOpaqueGhostVerticesMeshes = 0;
            let numOpaqueGhostEdgesMeshes = 0;
            let numTransparentGhostFillMeshes = 0;
            let numTransparentGhostVerticesMeshes = 0;
            let numTransparentGhostEdgesMeshes = 0;

            let numOutlinedMeshes = 0;
            let numHighlightMeshes = 0;
            let numSelectedMeshes = 0;

            let numOpaqueHighlightFillMeshes = 0;
            let numOpaqueHighlightVerticesMeshes = 0;
            let numOpaqueHighlightEdgesMeshes = 0;
            let numTransparentHighlightFillMeshes = 0;
            let numTransparentHighlightVerticesMeshes = 0;
            let numTransparentHighlightEdgesMeshes = 0;

            let numOpaqueSelectedFillMeshes = 0;
            let numOpaqueSelectedVerticesMeshes = 0;
            let numOpaqueSelectedEdgesMeshes = 0;
            let numTransparentSelectedFillMeshes = 0;
            let numTransparentSelectedVerticesMeshes = 0;
            let numTransparentSelectedEdgesMeshes = 0;

            let numOpaqueEdgesMeshes = 0;
            let numTransparentEdgesMeshes = 0;

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
                    const ghostMaterialState = mesh._ghostMaterial._state;
                    if (ghostMaterialState.edges) {
                        if (ghostMaterialState.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentGhostEdgesMeshes[numTransparentGhostEdgesMeshes++] = mesh;
                            }
                        } else {
                            opaqueGhostEdgesMeshes[numOpaqueGhostEdgesMeshes++] = mesh;
                        }
                    }
                    if (ghostMaterialState.vertices) {
                        if (ghostMaterialState.vertexAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentGhostVerticesMeshes[numTransparentGhostVerticesMeshes++] = mesh;
                            }
                        } else {
                            opaqueGhostVerticesMeshes[numOpaqueGhostVerticesMeshes++] = mesh;
                        }
                    }
                    if (ghostMaterialState.fill) {
                        if (ghostMaterialState.fillAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentGhostFillMeshes[numTransparentGhostFillMeshes++] = mesh;
                            }
                        } else {
                            opaqueGhostFillMeshes[numOpaqueGhostFillMeshes++] = mesh;
                        }
                    }

                } else {

                    // Normal render

                    transparent = materialState.alphaMode === 2 /* blend */ || meshState.xray || meshState.colorize[3] < 1;
                    if (transparent) {
                        if (!opaqueOnly) {
                            transparentMeshes[numTransparentMeshes++] = mesh;
                        }
                    } else {
                        if (meshState.outlined) {
                            outlinedMeshes[numOutlinedMeshes++] = mesh;
                        } else {
                            mesh._draw(frame);
                        }
                    }
                }

                if (meshState.selected) {
                    const selectedMaterialState = mesh._selectedMaterial._state;
                    if (selectedMaterialState.edges) {
                        if (selectedMaterialState.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentSelectedEdgesMeshes[numTransparentSelectedEdgesMeshes++] = mesh;
                            }
                        } else {
                            opaqueSelectedEdgesMeshes[numOpaqueSelectedEdgesMeshes++] = mesh;
                        }
                    }
                    if (selectedMaterialState.vertices) {
                        if (selectedMaterialState.vertexAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentSelectedVerticesMeshes[numTransparentSelectedVerticesMeshes++] = mesh;
                            }
                        } else {
                            opaqueSelectedVerticesMeshes[numOpaqueSelectedVerticesMeshes++] = mesh;
                        }
                    }
                    if (selectedMaterialState.fill) {
                        if (selectedMaterialState.fillAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentSelectedFillMeshes[numTransparentSelectedFillMeshes++] = mesh;
                            }
                        } else {
                            opaqueSelectedFillMeshes[numOpaqueSelectedFillMeshes++] = mesh;
                        }
                    }
                    if (meshState.selected) {
                        selectedMeshes[numSelectedMeshes++] = mesh;
                    }
                }

                if (meshState.highlighted) {
                    const highlightMaterialState = mesh._highlightMaterial._state;
                    if (highlightMaterialState.edges) {
                        if (highlightMaterialState.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                transparentHighlightEdgesMeshes[numTransparentHighlightEdgesMeshes++] = mesh;
                            }
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
                    const edgeMaterial = mesh._edgeMaterial._state;
                    if (edgeMaterial.edgeAlpha < 1.0) {
                        if (!opaqueOnly) {
                            transparentEdgesMeshes[numTransparentEdgesMeshes++] = mesh;
                        }
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

            const transparentDepthMask = true;

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

            const endTime = Date.now();
            const frameStats = stats.frame;

            frameStats.renderTime = (endTime - startTime) / 1000.0;
            frameStats.drawElements = frame.drawElements;
            frameStats.drawElements = frame.drawElements;
            frameStats.useProgram = frame.useProgram;
            frameStats.bindTexture = frame.bindTexture;
            frameStats.bindArray = frame.bindArray;

            const numTextureUnits = WEBGL_INFO.MAX_TEXTURE_UNITS;
            for (let ii = 0; ii < numTextureUnits; ii++) {
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

        const tempVec3a = math.vec3();
        const tempMat4a = math.mat4();
        const up = math.vec3([0, 1, 0]);
        const pickFrustumMatrix = math.frustumMat4(-1, 1, -1, 1, 0.1, 10000);

        return function (params) {

            update();

            if (WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) { // In case context lost/recovered
                gl.getExtension("OES_element_index_uint");
            }

            let canvasX;
            let canvasY;
            let origin;
            let direction;
            let look;
            let pickViewMatrix = null;
            let pickProjMatrix = null;

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

            pickBuf = pickBuf || new RenderBuffer(canvas, gl);
            pickBuf.bind();

            const mesh = pickMesh(canvasX, canvasY, pickViewMatrix, pickProjMatrix, params);

            if (!mesh) {
                pickBuf.unbind();
                return null;
            }

            const hit = {
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

        const boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        meshPickListLen = 0;

        let i;
        let len;
        let mesh;
        const includeMeshIds = params.includeMeshIds;
        const excludeMeshIds = params.excludeMeshIds;

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

        const pix = pickBuf.read(Math.round(canvasX), Math.round(canvasY));
        let pickedMeshIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        pickedMeshIndex--;

        return pickedMeshIndex >= 0 ? meshPickList[pickedMeshIndex] : null;
    }

    function pickTriangle(mesh, canvasX, canvasY, pickViewMatrix, pickProjMatrix) {

        frame.reset();
        frame.backfaces = true;
        frame.frontface = true; // "ccw"
        frame.pickViewMatrix = pickViewMatrix; // Can be null
        frame.pickProjMatrix = pickProjMatrix; // Can be null

        const boundary = scene.viewport.boundary;
        gl.viewport(boundary[0], boundary[1], boundary[2], boundary[3]);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mesh._pickTriangle(frame);

        const pix = pickBuf.read(canvasX, canvasY);

        let primIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

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
        readPixelBuf = readPixelBuf || (readPixelBuf = new RenderBuffer(canvas, gl));
        readPixelBuf.bind();
        readPixelBuf.clear();
        this.render({force: true, opaqueOnly: opaqueOnly});
        let color;
        let i;
        let j;
        let k;
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

export{Renderer};