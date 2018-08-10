/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    var ids = new xeogl.utils.Map({});

    xeogl.renderer.EmphasisFillRenderer = function (hash, mesh) {
        this.id = ids.addItem({});
        this._hash = hash;
        this._scene = mesh.scene;
        this._useCount = 0;
        this._shaderSource = new xeogl.renderer.EmphasisFillShaderSource(mesh);
        this._allocate(mesh);
    };

    var ghostFillRenderers = {};

    xeogl.renderer.EmphasisFillRenderer.get = function (mesh) {
        var hash = [
            mesh.scene.id,
            mesh.scene.gammaOutput ? "go" : "", // Gamma input not needed
            mesh.scene._clipsState.getHash(),
            !!mesh._geometry.normals ? "n" : "",
            mesh._geometry._state.quantized ? "cp" : "",
            mesh._state.hash
        ].join(";");
        var renderer = ghostFillRenderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.EmphasisFillRenderer(hash, mesh);
            ghostFillRenderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.EmphasisFillRenderer.prototype.put = function () {
        if (--this._useCount === 0) {
            ids.removeItem(this.id);
            if (this._program) {
                this._program.destroy();
            }
            delete ghostFillRenderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.EmphasisFillRenderer.prototype.webglContextRestored = function () {
        this._program = null;
    };

    xeogl.renderer.EmphasisFillRenderer.prototype.drawMesh = function (frame, mesh, mode) {
        if (!this._program) {
            this._allocate(mesh);
        }
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var materialState = mode === 0 ? mesh._ghostMaterial._state : (mode === 1 ? mesh._highlightMaterial._state : mesh._selectedMaterial._state);
        var meshState = mesh._state;
        var geometryState = mesh._geometry._state;
        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }
        if (materialState.id !== this._lastMaterialId) {
            var fillColor = materialState.fillColor;
            var backfaces = materialState.backfaces;
            if (frame.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frame.backfaces = backfaces;
            }
            gl.uniform4f(this._uFillColor, fillColor[0], fillColor[1], fillColor[2], materialState.fillAlpha);
            this._lastMaterialId = materialState.id;
        }
        gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
        if (this._uModelNormalMatrix) {
            gl.uniformMatrix4fv(this._uModelNormalMatrix, gl.FALSE, mesh.worldNormalMatrix);
        }
        if (this._uClippable) {
            gl.uniform1i(this._uClippable, meshState.clippable);
        }
        if (geometryState.combined) {
            var vertexBufs = mesh._geometry._getVertexBufs();
            if (vertexBufs.id !== this._lastVertexBufsId) {
                if (vertexBufs.positionsBuf && this._aPosition) {
                    this._aPosition.bindArrayBuffer(vertexBufs.positionsBuf, vertexBufs.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (vertexBufs.normalsBuf && this._aNormal) {
                    this._aNormal.bindArrayBuffer(vertexBufs.normalsBuf, vertexBufs.quantized ? gl.BYTE : gl.FLOAT);
                    frame.bindArray++;
                }
                this._lastVertexBufsId = vertexBufs.id;
            }
        }
        // Bind VBOs
        if (geometryState.id !== this._lastGeometryId) {
            if (this._uPositionsDecodeMatrix) {
                gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
            }
            if (this._uUVDecodeMatrix) {
                gl.uniformMatrix3fv(this._uUVDecodeMatrix, false, geometryState.uvDecodeMatrix);
            }
            if (geometryState.combined) { // VBOs were bound by the VertexBufs logic above
                if (geometryState.indicesBufCombined) {
                    geometryState.indicesBufCombined.bind();
                    frame.bindArray++;
                }
            } else {
                if (this._aPosition) {
                    this._aPosition.bindArrayBuffer(geometryState.positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (this._aNormal) {
                    this._aNormal.bindArrayBuffer(geometryState.normalsBuf, geometryState.quantized ? gl.BYTE : gl.FLOAT);
                    frame.bindArray++;
                }
                if (geometryState.indicesBuf) {
                    geometryState.indicesBuf.bind();
                    frame.bindArray++;
                    // gl.drawElements(geometryState.primitive, geometryState.indicesBuf.numItems, geometryState.indicesBuf.itemType, 0);
                    // frame.drawElements++;
                } else if (geometryState.positions) {
                    // gl.drawArrays(gl.TRIANGLES, 0, geometryState.positions.numItems);
                    //  frame.drawArrays++;
                }
            }
            this._lastGeometryId = geometryState.id;
        }
        // Draw (indices bound in prev step)
        if (geometryState.combined) {
            if (geometryState.indicesBufCombined) { // Geometry indices into portion of uber-array
                gl.drawElements(geometryState.primitive, geometryState.indicesBufCombined.numItems, geometryState.indicesBufCombined.itemType, 0);
                frame.drawElements++;
            } else {
                // TODO: drawArrays() with VertexBufs positions
            }
        } else {
            if (geometryState.indicesBuf) {
                gl.drawElements(geometryState.primitive, geometryState.indicesBuf.numItems, geometryState.indicesBuf.itemType, 0);
                frame.drawElements++;
            } else if (geometryState.positions) {
                gl.drawArrays(gl.TRIANGLES, 0, geometryState.positions.numItems);
                frame.drawArrays++;
            }
        }
    };

    xeogl.renderer.EmphasisFillRenderer.prototype._allocate = function (mesh) {
        var lightsState = mesh.scene._lightsState;
        var clipsState = mesh.scene._clipsState;
        var gl = mesh.scene.canvas.gl;
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        if (this._program.errors) {
            this.errors = this._program.errors;
            return;
        }
        var program = this._program;
        this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
        this._uModelMatrix = program.getLocation("modelMatrix");
        this._uModelNormalMatrix = program.getLocation("modelNormalMatrix");
        this._uViewMatrix = program.getLocation("viewMatrix");
        this._uViewNormalMatrix = program.getLocation("viewNormalMatrix");
        this._uProjMatrix = program.getLocation("projMatrix");
        this._uLightAmbient = [];
        this._uLightColor = [];
        this._uLightDir = [];
        this._uLightPos = [];
        this._uLightAttenuation = [];
        for (var i = 0, len = lightsState.lights.length; i < len; i++) {
            var light = lightsState.lights[i];
            switch (light.type) {
                case "ambient":
                    this._uLightAmbient[i] = program.getLocation("lightAmbient");
                    break;
                case "dir":
                    this._uLightColor[i] = program.getLocation("lightColor" + i);
                    this._uLightPos[i] = null;
                    this._uLightDir[i] = program.getLocation("lightDir" + i);
                    break;
                case "point":
                    this._uLightColor[i] = program.getLocation("lightColor" + i);
                    this._uLightPos[i] = program.getLocation("lightPos" + i);
                    this._uLightDir[i] = null;
                    this._uLightAttenuation[i] = program.getLocation("lightAttenuation" + i);
                    break;
            }
        }
        this._uClips = [];
        for (var i = 0, len = clipsState.clips.length; i < len; i++) {
            this._uClips.push({
                active: program.getLocation("clipActive" + i),
                pos: program.getLocation("clipPos" + i),
                dir: program.getLocation("clipDir" + i)
            });
        }
        this._uFillColor = program.getLocation("fillColor");
        this._aPosition = program.getAttribute("position");
        this._aNormal = program.getAttribute("normal");
        this._uClippable = program.getLocation("clippable");
        this._uGammaFactor = program.getLocation("gammaFactor");
        this._lastMaterialId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
    };

    xeogl.renderer.EmphasisFillRenderer.prototype._bindProgram = function (frame) {
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var clipsState = scene._clipsState;
        var lightsState = scene._lightsState;
        var camera = scene.camera;
        var cameraState = camera._state;
        var light;
        var program = this._program;
        program.bind();
        frame.useProgram++;
        frame.textureUnit = 0;
        this._lastMaterialId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
        this._lastIndicesBufId = null;
        gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
        gl.uniformMatrix4fv(this._uViewNormalMatrix, false, cameraState.normalMatrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, camera.project._state.matrix);
        for (var i = 0, len = lightsState.lights.length; i < len; i++) {
            light = lightsState.lights[i];
            if (this._uLightAmbient[i]) {
                gl.uniform4f(this._uLightAmbient[i], light.color[0], light.color[1], light.color[2], light.intensity);
            } else {
                if (this._uLightColor[i]) {
                    gl.uniform4f(this._uLightColor[i], light.color[0], light.color[1], light.color[2], light.intensity);
                }
                if (this._uLightPos[i]) {
                    gl.uniform3fv(this._uLightPos[i], light.pos);
                    if (this._uLightAttenuation[i]) {
                        gl.uniform1f(this._uLightAttenuation[i], light.attenuation);
                    }
                }
                if (this._uLightDir[i]) {
                    gl.uniform3fv(this._uLightDir[i], light.dir);
                }
            }
        }
        if (clipsState.clips.length > 0) {
            var clips = scene._clipsState.clips;
            var clipUniforms;
            var uClipActive;
            var clip;
            var uClipPos;
            var uClipDir;
            for (var i = 0, len = this._uClips.length; i < len; i++) {
                clipUniforms = this._uClips[i];
                uClipActive = clipUniforms.active;
                clip = clips[i];
                if (uClipActive) {
                    gl.uniform1i(uClipActive, clip.active);
                }
                uClipPos = clipUniforms.pos;
                if (uClipPos) {
                    gl.uniform3fv(clipUniforms.pos, clip.pos);
                }
                uClipDir = clipUniforms.dir;
                if (uClipDir) {
                    gl.uniform3fv(clipUniforms.dir, clip.dir);
                }
            }
        }
        if (this._uGammaFactor) {
            gl.uniform1f(this._uGammaFactor, scene.gammaFactor);
        }
    };

})();
