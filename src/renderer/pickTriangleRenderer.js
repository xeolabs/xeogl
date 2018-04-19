/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickTriangleRenderer = function (gl, hash, scene, object) {

        this._gl = gl;
        this._hash = hash;
        this._shaderSource = new xeogl.renderer.PickTriangleShaderSource(gl, scene, object);
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

    xeogl.renderer.PickTriangleRenderer.create = function (gl, hash, scene, object) {
        var renderer = renderers[hash];
        if (!renderer) {
            renderer = new xeogl.renderer.PickTriangleRenderer(gl, hash, scene, object);
            renderers[hash] = renderer;
            xeogl.stats.memory.programs++;
        }
        renderer._useCount++;
        return renderer;
    };

    xeogl.renderer.PickTriangleRenderer.prototype.destroy = function () {
        if (--this._useCount === 0) {
            this._program.destroy();
            delete renderers[this._hash];
            xeogl.stats.memory.programs--;
        }
    };

    xeogl.renderer.PickTriangleRenderer.prototype.drawObject = function (frame, object) {

        // Only rendering one object within a surface picking pass

        var gl = this._gl;
        var scene = this._scene;

        this._program.bind();

        frame.useProgram++;

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

        var material = object.material;
        var modelTransform = object.modelTransform;
        var geometry = object.geometry;

        var backfaces = material.backfaces;
        if (frame.backfaces !== backfaces) {
            if (backfaces) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
            }
            frame.backfaces = backfaces;
        }

        var frontface = material.frontface;
        if (frame.frontface !== frontface) {
            if (frontface) {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
            frame.frontface = frontface;
        }

        this._lastMaterialId = material.id;

        gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, modelTransform.getMatrix());

        if (this._uClippable) {
            gl.uniform1i(this._uClippable, object.modes.clippable);
        }

        var positions = geometry.getPickTrianglePositions();

        if (this._uPositionsDecodeMatrix) {
            gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, geometry.positionsDecodeMatrix);
            this._aPosition.bindArrayBuffer(positions, geometry.quantized ? gl.UNSIGNED_SHORT : gl.FLOAT);
        } else {
            this._aPosition.bindArrayBuffer(positions);
        }

        var pickColorsBuf = geometry.getPickTriangleColors();
        pickColorsBuf.bind();
        gl.enableVertexAttribArray(this._aColor.location);
        this._gl.vertexAttribPointer(this._aColor.location, pickColorsBuf.itemSize, pickColorsBuf.itemType, true, 0, 0); // Normalize

        gl.drawArrays(geometry.primitive, 0, positions.numItems / 3);
    };
})();



