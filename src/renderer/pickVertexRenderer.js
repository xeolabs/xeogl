/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickVertexRenderer = function (gl, hash, scene, object) {

        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.PickVertexShaderSource(gl, scene, object);
        this._program = new xeogl.renderer.Program(gl, this._shaderSource);
        this._scene = scene;
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
        var clips = scene.clips.clips;
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

    xeogl.renderer.PickVertexRenderer.create = function (gl, hash, scene, object) {
        var renderer = renderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.PickVertexRenderer(gl, hash, scene, object);
            renderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.PickVertexRenderer.prototype.destroy = function () {
        if (--this._useCount === 0) {
            this._program.destroy();
            delete renderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.PickVertexRenderer.prototype._bindProgram = function (frame) {

        var gl = this._gl;
        var scene = this._scene;

        this._program.bind();

        frame.useProgram++;

        this._lastModelTransformId = null;
        this._lastVertexBufsId = null;
        this._lastGeometryId = null;

        gl.uniformMatrix4fv(this._uViewMatrix, false, frame.pickViewMatrix || scene.viewTransform.matrix);
        gl.uniformMatrix4fv(this._uProjMatrix, false, frame.pickProjMatrix || scene.projTransform.matrix);

        if (scene.clips.clips.length > 0) {
            var clips = scene.clips.clips;
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
    };

    xeogl.renderer.PickVertexRenderer.prototype.drawObject = function (frame, object) {

        if (frame.lastProgramId !== this._program.id) {
            frame.lastProgramId = this._program.id;
            this._bindProgram(frame);
        }

        var gl = this._gl;
        var scene = this._scene;
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        if (modelTransform.id !== this._lastModelTransformId) {
            gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, modelTransform.getMatrix());
            this._lastModelTransformId = modelTransform.id;
        }

        if (this._uClippable) {
            gl.uniform1i(this._uClippable, object.modes.clippable);
        }

        // Bind VBOs

        if (geometry.id !== this._lastGeometryId) {

            var pickPositionsBuf = geometry.getVertexPickPositions();
            if (this._uPositionsDecodeMatrix) {
                gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometry.positionsDecodeMatrix);
                this._aPosition.bindArrayBuffer(pickPositionsBuf, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
            } else {
                this._aPosition.bindArrayBuffer(pickPositionsBuf);
            }

            var pickColorsBuf = geometry.getVertexPickColors();
            pickColorsBuf.bind();
            gl.enableVertexAttribArray(this._aColor.location);
            this._gl.vertexAttribPointer(this._aColor.location, pickColorsBuf.itemSize, pickColorsBuf.itemType, true, 0, 0); // Normalize

            this._lastGeometryId = geometry.id;
        }

        // TODO: load point size


        // FIXME make points
        gl.drawArrays(geometry.primitive, 0, positions.numItems / 3);
    };
})();



