/**
 * @author xeolabs / https://github.com/xeolabs
 */

import {Frame} from './frame.js';
import {RenderBuffer} from '../webgl/renderBuffer.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';
import {Mesh} from '../mesh/mesh.js';

const Renderer = function (scene, options) {

    "use strict";

    var self = this;

    options = options || {};

    const frame = new Frame();
    const canvas = scene.canvas.canvas;
    const gl = scene.canvas.gl;
    const shadowLightMeshes = {};
    const canvasTransparent = options.transparent === true;
    const drawables = {};
    const drawablesUnsorted = {};
    const drawableListSorted = [];
    let drawableListSortedLen = 0;
    const meshPickList = [];
    let meshPickListLen = 0;
    const shadowMeshLists = {};

    let drawableListDirty = true;
    let stateSortDirty = true;
    let imageDirty = true;
    let shadowsDirty = true;
    let imageForceDirty = true;

    let blendOneMinusSrcAlpha = true;

    let pickBuf = null;
    let readPixelBuf = null;

    const bindOutputFrameBuffer = null;
    const unbindOutputFrameBuffer = null;

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
        imageForceDirty = true;
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
     * Inserts a drawable into this renderer.
     */
    this.addDrawable = function (id, drawable) {
        if (drawable._needStateSort) { // Drawables like BigModel
            drawables[id] = drawable;
        } else {
            drawablesUnsorted[id] = drawable;
        }
        drawableListDirty = true;
    };

    /**
     * Removes a drawable from this renderer.
     */
    this.removeDrawable = function (id) {
        delete drawables[id];
        delete drawablesUnsorted[id];
        drawableListDirty = true;
    };

    /**
     * Clears the canvas.
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
     * Renders inserted drawables.
     */
    this.render = function (params) {
        params = params || {};
        updateDrawlist();
        if (imageDirty || imageForceDirty || params.force) {
            draw(params);
            stats.frame.frameCount++;
            imageDirty = false;
            imageForceDirty = false;
        }
    };

    function updateDrawlist() { // Prepares state-sorted array of drawables from maps of inserted drawables
        if (drawableListDirty) {
            buildDrawableList();
            drawableListDirty = false;
            stateSortDirty = true;
        }
        if (stateSortDirty) {
            sortDrawableList();
            appendDrawableList();
            stateSortDirty = false;
            imageDirty = true;
        }
        // if (shadowsDirty) {
        //     drawShadowMaps();
        //     shadowsDirty = false;
        //     imageDirty = true;
        // }
    }

    function buildDrawableList() { // Inserts state-sortable drawables to the front portion of drawableListSorted
        drawableListSortedLen = 0;
        for (const id in drawables) {
            if (drawables.hasOwnProperty(id)) {
                drawableListSorted[drawableListSortedLen++] = drawables[id];
            }
        }
    }

    function sortDrawableList() { // State-sorts the front portion of drawableListSorted
        drawableListSorted.sort(Mesh._compareState);
    }

    function appendDrawableList() { // Appends non-state-sortable drawables to the end portion of drawableListSorted
        for (const id in drawablesUnsorted) {
            if (drawablesUnsorted.hasOwnProperty(id)) {
                drawableListSorted[drawableListSortedLen++] = drawablesUnsorted[id];
            }
        }
        for (let i = drawableListSortedLen, len = drawableListSorted.length; i < len; i++) {
            drawableListSorted[i] = null; // Release memory
        }
        drawableListSorted.length = drawableListSortedLen;
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
        let drawable;

        for (i = 0; i < drawableListSortedLen; i++) {
            drawable = drawableListSorted[i];
            if (!drawable.visible || !drawable.castShadow) {
                continue; // For now, culled drawables still cast shadows because they are just out of view
            }
            // if (drawable._material._state.alpha === 0) {
            //     continue;
            // }
            //    drawable._drawShadow(frame, light);
        }

        renderBuf.unbind();
    }

    var draw = (function () { // Draws the drawables in drawableListSorted

        // On the first pass, we'll immediately draw the opaque normal-appearance drawables, while deferring
        // the rest to these bins, then do subsequent passes to render these bins.

        const drawTransparentBin = [];
        const ghostFillOpaqueBin = [];
        const ghostEdgesOpaqueBin = [];
        const ghostFillTransparentBin = [];
        const ghostEdgesTransparentBin = [];
        const highlightFillOpaqueBin = [];
        const highlightEdgesOpaqueBin = [];
        const highlightFillTransparentBin = [];
        const highlightEdgesTransparentBin = [];
        const selectedFillOpaqueBin = [];
        const selectedEdgesOpaqueBin = [];
        const selectedFillTransparentBin = [];
        const selectedEdgesTransparentBin = [];
        const edgesOpaqueBin = [];
        const edgesTransparentBin = [];
        const outlinedOpaqueBin = [];

        return function (params) {

            var opaqueOnly = !!params.opaqueOnly;

            if (WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {  // In case context lost/recovered
                gl.getExtension("OES_element_index_uint");
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
            let drawable;

            const startTime = Date.now();

            if (bindOutputFrameBuffer) {
                bindOutputFrameBuffer(params.pass);
            }

            if (params.clear !== false) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }

            let ghostFillOpaqueBinLen = 0;
            let ghostEdgesOpaqueBinLen = 0;
            let ghostFillTransparentBinLen = 0;
            let ghostEdgesTransparentBinLen = 0;
            let highlightFillOpaqueBinLen = 0;
            let highlightEdgesOpaqueBinLen = 0;
            let highlightFillTransparentBinLen = 0;
            let highlightEdgesTransparentBinLen = 0;
            let selectedFillOpaqueBinLen = 0;
            let selectedEdgesOpaqueBinLen = 0;
            let selectedFillTransparentBinLen = 0;
            let selectedEdgesTransparentBinLen = 0;
            let edgesOpaqueBinLen = 0;
            let edgesTransparentBinLen = 0;
            let drawTransparentBinLen = 0;
            let outlinedOpaqueBinLen = 0;

            for (i = 0, len = drawableListSortedLen; i < len; i++) {
                drawable = drawableListSorted[i];
                if (drawable.culled === true || drawable.visible === false) {
                    continue;
                }
                if (drawable.ghosted) {
                    const ghostMaterial = drawable.ghostMaterial._state; // Faster to access each drawable's EmphasisMaterial's internal rendering state directly
                    if (ghostMaterial.fill) {
                        if (ghostMaterial.fillAlpha < 1.0) {
                            if (!opaqueOnly) {
                                ghostFillTransparentBin[ghostFillTransparentBinLen++] = drawable;
                            }
                        } else {
                            ghostFillOpaqueBin[ghostFillOpaqueBinLen++] = drawable;
                        }
                    }
                    if (ghostMaterial.edges) {
                        if (ghostMaterial.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                ghostEdgesTransparentBin[ghostEdgesTransparentBinLen++] = drawable;
                            }
                        } else {
                            ghostEdgesOpaqueBin[ghostEdgesOpaqueBinLen++] = drawable;
                        }
                    }
                } else { // Normal render - mutually exclusive with ghosted
                    if (drawable._needDrawTransparent()) {
                        if (!opaqueOnly) {
                            drawTransparentBin[drawTransparentBinLen++] = drawable;
                        }
                    } else   if (drawable.outlined) {
                        outlinedOpaqueBin[outlinedOpaqueBinLen++] = drawable;
                    }
                    if (drawable._needDrawOpaque()) {
                        drawable._drawOpaqueFill(frame);
                    }
                }
                if (drawable.highlighted) {
                    const highlightMaterial = drawable.highlightMaterial._state;
                    if (highlightMaterial.fill) {
                        if (highlightMaterial.fillAlpha < 1.0) {
                            highlightFillTransparentBin[highlightFillTransparentBinLen++] = drawable;
                        } else {
                            highlightFillOpaqueBin[highlightFillOpaqueBinLen++] = drawable;
                        }
                    }
                    if (highlightMaterial.edges) {
                        if (highlightMaterial.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                highlightEdgesTransparentBin[highlightEdgesTransparentBinLen++] = drawable;
                            }
                        } else {
                            highlightEdgesOpaqueBin[highlightEdgesOpaqueBinLen++] = drawable;
                        }
                    }
                }
                if (drawable.selected) {
                    const selectedMaterial = drawable.selectedMaterial._state;
                    if (selectedMaterial.fill) {
                        if (selectedMaterial.fillAlpha < 1.0) {
                            if (!opaqueOnly) {
                                selectedFillTransparentBin[selectedFillTransparentBinLen++] = drawable;
                            }
                        } else {
                            selectedFillOpaqueBin[selectedFillOpaqueBinLen++] = drawable;
                        }
                    }
                    if (selectedMaterial.edges) {
                        if (selectedMaterial.edgeAlpha < 1.0) {
                            if (!opaqueOnly) {
                                selectedEdgesTransparentBin[selectedEdgesTransparentBinLen++] = drawable;
                            }
                        } else {
                            selectedEdgesOpaqueBin[selectedEdgesOpaqueBinLen++] = drawable;
                        }
                    }
                }
                if (drawable.edges) {
                    const edgeMaterial = drawable.edgeMaterial._state;
                    if (edgeMaterial.edgeAlpha < 1.0) {
                        if (!opaqueOnly) {
                            edgesTransparentBin[edgesTransparentBinLen++] = drawable;
                        }
                    } else {
                        edgesOpaqueBin[edgesOpaqueBinLen++] = drawable;
                    }
                }
            }
            if (outlinedOpaqueBinLen > 0) {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.stencilMask(1);
                gl.clearStencil(0);
                gl.clear(gl.STENCIL_BUFFER_BIT);
                for (i = 0; i < outlinedOpaqueBinLen; i++) {
                    outlinedOpaqueBin[i]._drawOpaqueFill(frame);
                }
                gl.stencilFunc(gl.EQUAL, 0, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.stencilMask(0x00);
                gl.disable(gl.CULL_FACE); // Need both faces for better corners with face-aligned normals
                for (i = 0; i < outlinedOpaqueBinLen; i++) {
                    outlinedOpaqueBin[i]._drawOutline(frame);
                }
                gl.disable(gl.STENCIL_TEST);
            }
            if (edgesOpaqueBinLen > 0) {
                for (i = 0; i < edgesOpaqueBinLen; i++) {
                    edgesOpaqueBin[i]._drawOpaqueEdges(frame);
                }
            }
            if (ghostFillOpaqueBinLen > 0) {
                for (i = 0; i < ghostFillOpaqueBinLen; i++) {
                    ghostFillOpaqueBin[i]._drawGhostedFill(frame);
                }
            }
            if (ghostEdgesOpaqueBinLen > 0) {
                for (i = 0; i < ghostEdgesOpaqueBinLen; i++) {
                    ghostEdgesOpaqueBin[i]._drawGhostedEdges(frame);
                }
            }
            const transparentDepthMask = true;
            if (ghostFillTransparentBinLen > 0 || ghostEdgesTransparentBinLen > 0 || drawTransparentBinLen > 0) {
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                if (blendOneMinusSrcAlpha) { // Makes glTF windows appear correct
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                } else {
                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                }
                frame.backfaces = false;
                if (!transparentDepthMask) {
                    gl.depthMask(false);
                }
                if (ghostFillTransparentBinLen > 0) {
                    for (i = 0; i < ghostFillTransparentBinLen; i++) {
                        ghostFillTransparentBin[i]._drawGhostedFill(frame);
                    }
                }
                if (ghostEdgesTransparentBinLen > 0) {
                    for (i = 0; i < ghostEdgesTransparentBinLen; i++) {
                        ghostEdgesTransparentBin[i]._drawGhostedEdges(frame);
                    }
                }
                outlinedOpaqueBinLen = 0;
                for (i = 0; i < drawTransparentBinLen; i++) {
                    drawable = drawTransparentBin[i];
                    if (drawable.outlined) {
                        outlinedOpaqueBin[outlinedOpaqueBinLen++] = drawable; // Build outlined list
                        continue;
                    }
                    drawable._drawTransparentFill(frame);
                }
                gl.disable(gl.BLEND);
            }
            if (highlightFillOpaqueBinLen > 0 || highlightEdgesOpaqueBinLen > 0) {
                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);
                if (highlightFillOpaqueBinLen > 0) {
                    for (i = 0; i < highlightFillOpaqueBinLen; i++) {
                        highlightFillOpaqueBin[i]._drawHighlightedFill(frame);
                    }
                }
                if (highlightEdgesOpaqueBinLen > 0) {
                    for (i = 0; i < highlightEdgesOpaqueBinLen; i++) {
                        highlightEdgesOpaqueBin[i]._drawHighlightedEdges(frame);
                    }
                }
            }
            if (highlightFillTransparentBinLen > 0 || highlightEdgesTransparentBinLen > 0 || highlightFillOpaqueBinLen > 0) {
                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                if (highlightFillTransparentBinLen > 0) {
                    for (i = 0; i < highlightFillTransparentBinLen; i++) {
                        highlightFillTransparentBin[i]._drawHighlightedFill(frame);
                    }
                }
                if (highlightEdgesTransparentBinLen > 0) {
                    for (i = 0; i < highlightEdgesTransparentBinLen; i++) {
                        highlightEdgesTransparentBin[i]._drawHighlightedEdges(frame);
                    }
                }
                gl.disable(gl.BLEND);
            }
            if (selectedFillOpaqueBinLen > 0 || selectedEdgesOpaqueBinLen > 0) {
                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);
                if (selectedFillOpaqueBinLen > 0) {
                    for (i = 0; i < selectedFillOpaqueBinLen; i++) {
                        selectedFillOpaqueBin[i]._drawSelectedFill(frame);
                    }
                }
                if (selectedEdgesOpaqueBinLen > 0) {
                    for (i = 0; i < selectedEdgesOpaqueBinLen; i++) {
                        selectedEdgesOpaqueBin[i]._drawSelectedEdges(frame);
                    }
                }
            }
            if (selectedFillTransparentBinLen > 0 || selectedEdgesTransparentBinLen > 0) {
                frame.lastProgramId = null;
                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                if (selectedFillTransparentBinLen > 0) {
                    for (i = 0; i < selectedFillTransparentBinLen; i++) {
                        selectedFillTransparentBin[i]._drawSelectedFill(frame);
                    }
                }
                if (selectedEdgesTransparentBinLen > 0) {
                    for (i = 0; i < selectedEdgesTransparentBinLen; i++) {
                        selectedEdgesTransparentBin[i]._drawSelectedEdges(frame);
                    }
                }
                gl.disable(gl.BLEND);
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
     * Picks a drawable in the scene.
     */
    this.pick = (function () {

        const tempVec3a = math.vec3();
        const tempMat4a = math.mat4();
        const up = math.vec3([0, 1, 0]);
        const pickFrustumMatrix = math.frustumMat4(-1, 1, -1, 1, 0.1, 10000);

        return function (params) {

            updateDrawlist();

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

        for (i = 0, len = drawableListSortedLen; i < len; i++) {
            mesh = drawableListSorted[i];
            if (mesh.culled === true || mesh.visible === false || mesh.pickable === false) {
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

        // for (var id in self.drawables) { // OPTIMIZE
        //     self.drawables[id]._pick(frame);
        // }

        const pix = pickBuf.read(Math.round(canvasX), Math.round(canvasY));
        let pickedMeshIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        pickedMeshIndex--;

        //console.log("pickMesh() = " + pickedMeshIndex);

        if (pickedMeshIndex === 0) {
            return null;
        }

        mesh = meshPickList[pickedMeshIndex];

        if (mesh) {
            return mesh;
        }

        /////////////////////////////////////////////////////////////////////////////
        // TODO: attempt to find object in drawables, or on Scene?
        // TODO: binary search to find the right layer in BigModel?
        /////////////////////////////////////////////////////////////////////////////

        return null;

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