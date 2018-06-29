/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickTriangleRenderer = function (hash, mesh) {
        var gl = mesh.scene.canvas.gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.PickTriangleShaderSource(mesh);
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
        this._aColor = program.getAttribute("color");
        this._uClippable = program.getLocation("clippable");
    };

    var renderers = {};

    xeogl.renderer.PickTriangleRenderer.get = function (mesh) {
        var hash = [
            mesh.scene.canvas.canvas.id,
            mesh.scene._clipsState.getHash(),
            mesh._geometry._state.quantized ? "cp" : "",
            mesh._state.hash
        ].join(";");
        var renderer = renderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.PickTriangleRenderer(hash, mesh);
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

    xeogl.renderer.PickTriangleRenderer.prototype.put = function () {
        if (--this._useCount === 0) {
            this._program.destroy();
            delete renderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.PickTriangleRenderer.prototype.drawMesh = function (frame, mesh) {
        var scene = this._scene;
        var gl = scene.canvas.gl;
        var clipsState = scene._clipsState;
        var materialState = mesh._material._state;
        var meshState = mesh._state;
        var geometry = mesh._geometry;
        var geometryState = mesh._geometry._state;
        var backfaces = materialState.backfaces;
        var frontface = materialState.frontface;
        var positionsBuf = geometry._getPickTrianglePositions();
        var pickColorsBuf = geometry._getPickTriangleColors();
        var camera = scene.camera;
        var cameraState = camera._state;
        this._program.bind();
        frame.useProgram++;
        gl.uniformMatrix4fv(this._uViewMatrix, false, frame.pickViewMatrix || cameraState.matrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, frame.pickProjMatrix || camera.project._state.matrix);
        if (clipsState.clips.length > 0) {
            var clips = clipsState.clips;
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
        if (frame.backfaces !== backfaces) {
            if (backfaces) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
            }
            frame.backfaces = backfaces;
        }
        if (frame.frontface !== frontface) {
            if (frontface) {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
            frame.frontface = frontface;
        }
        this._lastMaterialId = materialState.id;
        gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, mesh.worldMatrix);
        if (this._uClippable) {
            gl.uniform1i(this._uClippable, mesh._state.clippable);
        }
        if (this._uPositionsDecodeMatrix) {
            gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometryState.positionsDecodeMatrix);
            this._aPosition.bindArrayBuffer(positionsBuf, geometryState.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
        } else {
            this._aPosition.bindArrayBuffer(positionsBuf);
        }
        pickColorsBuf.bind();
        gl.enableVertexAttribArray(this._aColor.location);
        gl.vertexAttribPointer(this._aColor.location, pickColorsBuf.itemSize, pickColorsBuf.itemType, true, 0, 0); // Normalize
        gl.drawArrays(geometryState.primitive, 0, positionsBuf.numItems / 3);
    };
})();



