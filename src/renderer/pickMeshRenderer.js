/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickMeshRenderer = function (hash,  mesh) {
        var gl = mesh.scene.canvas.gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.PickMeshShaderSource(mesh);
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        this._scene = mesh.scene;
        this._useCount = 0;
        if (this._program.errors) {
            this.errors = this._program.errors;
            return;
        }
        var program = this._program;
        this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
        this._uModelMatrix = program.getLocation("modelMatrix");
        this._uViewMatrix = program.getLocation("viewMatrix");
        this._uProjMatrix = program.getLocation("projMatrix");
        this._uClips = [];
        var clips = mesh.scene._clipsState.clips;
        for (var i = 0, len = clips.length; i < len; i++) {
            this._uClips.push({
                active: program.getLocation("clipActive" + i),
                pos: program.getLocation("clipPos" + i),
                dir: program.getLocation("clipDir" + i)
            });
        }
        this._aPosition = program.getAttribute("position");
        this._uClippable = program.getLocation("clippable");
        this._uPickColor = program.getLocation("pickColor");
        this._lastMaterialId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
    };

    var renderers = {};

    xeogl.renderer.PickMeshRenderer.get = function ( mesh) {
        var hash = [
            mesh.scene.canvas.canvas.id,
            mesh.scene._clipsState.getHash(),
            mesh._geometry._state.hash,
            mesh._state.hash
        ].join(";");
        var renderer = renderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.PickMeshRenderer(hash, mesh);
            if (renderer.errors) {
                console.log(renderer.errors.join("\n"));
                return null;
            }
            renderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.PickMeshRenderer.prototype.put = function () {
        if (--this._useCount === 0) {
            this._program.destroy();
            delete renderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.PickMeshRenderer.prototype._bindProgram = function (frame) {
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var clipsState = scene._clipsState;
        var camera = scene.camera;
        var cameraState = camera._state;
        this._program.bind();
        frame.useProgram++;
        this._lastMaterialId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;
        gl.uniformMatrix4fv(this._uViewMatrix, false, cameraState.matrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, camera.project._state.matrix);
        if (clipsState.clips.length > 0) {
            var clipUniforms;
            var uClipActive;
            var clip;
            var uClipPos;
            var uClipDir;
            for (var i = 0, len = this._uClips.length; i < len; i++) {
                clipUniforms = this._uClips[i];
                uClipActive = clipUniforms.active;
                clip = clipsState.clips[i];
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
    };

    xeogl.renderer.PickMeshRenderer.prototype.drawMesh = function (frame, mesh) {
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var materialState = mesh._material._state;
        var meshState = mesh._state;
        var geometryState = mesh._geometry._state;
        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }
        if (materialState.id !== this._lastMaterialId) {
            var backfaces = materialState.backfaces;
            if (frame.backfaces !== backfaces) {
                if (backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
                frame.backfaces = backfaces;
            }
            var frontface = materialState.frontface;
            if (frame.frontface !== frontface) {
                if (frontface) {
                    gl.frontFace(gl.CCW);
                } else {
                    gl.frontFace(gl.CW);
                }
                frame.frontface = frontface;
            }
            if (frame.lineWidth !== materialState.lineWidth) {
                gl.lineWidth(materialState.lineWidth);
                frame.lineWidth = materialState.lineWidth;
            }
            if (this._uPointSize) {
                gl.uniform1i(this._uPointSize, materialState.pointSize);
            }
            this._lastMaterialId = materialState.id;
        }
        gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
        if (geometryState.combined) {
            var vertexBufs = mesh._geometry._getVertexBufs();
            if (vertexBufs.id !== this._lastVertexBufsId) {
                if (vertexBufs.positionsBuf && this._aPosition) {
                    this._aPosition.bindArrayBuffer(vertexBufs.positionsBuf, vertexBufs.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                this._lastVertexBufsId = vertexBufs.id;
            }
        }
        // Mesh state
        if (this._uClippable) {
            gl.uniform1i(this._uClippable, mesh._state.clippable);
        }
        // Bind VBOs
        if (geometryState.id !== this._lastGeometryId) {
            if (this._uPositionsDecodeMatrix) {
                gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
            }
            if (geometryState.combined) { // VBOs were bound by the preceding VertexBufs chunk
                if (geometryState.indicesBufCombined) {
                    geometryState.indicesBufCombined.bind();
                    frame.bindArray++;
                }
            } else {
                if (this._aPosition) {
                    this._aPosition.bindArrayBuffer(geometryState.positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
                    frame.bindArray++;
                }
                if (geometryState.indicesBuf) {
                    geometryState.indicesBuf.bind();
                    frame.bindArray++;
                }
            }
            this._lastGeometryId = geometryState.id;
        }
        // Mesh-indexed color
        var a = frame.pickmeshIndex >> 24 & 0xFF;
        var b = frame.pickmeshIndex >> 16 & 0xFF;
        var g = frame.pickmeshIndex >> 8 & 0xFF;
        var r = frame.pickmeshIndex & 0xFF;
        frame.pickmeshIndex++;
        gl.uniform4f(this._uPickColor, r / 255, g / 255, b / 255, a / 255);
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
            }
        }
    };
})();
