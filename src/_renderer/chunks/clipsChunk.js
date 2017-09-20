(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "clips",

        build: function () {

            var type;
            var i;
            var len;
            var uniforms;
            var program;
            var clips = this.state.clips;
            var clipUniforms;

            this._uniforms = {
                draw: [],
                pickObject: [],
                pickPrimitive: [],
                outline: []
            };

            for (type in this._uniforms) {
                if (this._uniforms.hasOwnProperty(type)) {
                    uniforms = this._uniforms[type];
                    program = this.program[type];
                    for (i = 0, len = clips.length; i < len; i++) {
                        clipUniforms = {
                            active: program.getUniform("clipActive" + i),
                            pos: program.getUniform("clipPos" + i),
                            dir: program.getUniform("clipDir" + i)
                        };
                        uniforms.push(clipUniforms);
                    }
                }
            }
        },

        _drawAndPick: function (frameCtx, type) {
            var clips = this.state.clips;
            var clip;
            var uniforms = this._uniforms[type];
            var clipUniforms;
            var uClipActive;
            var uClipPos;
            var uClipDir;
            for (var i = 0, len = uniforms.length; i < len; i++) {
                clip = clips[i];
                clipUniforms = uniforms[i];
                uClipActive = clipUniforms.active;
                if (uClipActive) {
                    uClipActive.setValue(clip.active);
                }
                uClipPos = clipUniforms.pos;
                if (uClipPos) {
                    clipUniforms.pos.setValue(clip.pos);
                }
                uClipDir = clipUniforms.dir;
                if (uClipDir) {
                    clipUniforms.dir.setValue(clip.dir);
                }
            }
        },

        draw: function (frameCtx) {
            this._drawAndPick(frameCtx, "draw");
        },

        shadow: function (frameCtx) {
            this._drawAndPick(frameCtx, "shadow");
        },

        pickObject: function (frameCtx) {
            this._drawAndPick(frameCtx, "pickObject");
        },

        pickPrimitive: function (frameCtx) {
            this._drawAndPick(frameCtx, "pickPrimitive");
        },

        outline: function (frameCtx) {
            this._drawAndPick(frameCtx, "outline");
        }
    });
})();