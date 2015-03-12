(function () {

    "use strict";

    /**
     * Create display state chunk type for draw and pick render of user clipping planes
     */
    XEO.ChunkFactory.createChunkType({

        type: "clips",

        build: function () {

            this._draw = this._draw || [];

            var draw = this.program.draw;

            for (var i = 0, len = this.state.clips.length; i < len; i++) {
                this._draw[i] = {
                    uClipMode: draw.getUniformLocation("XEO_uClipMode" + i),
                    uClipNormalAndDist: draw.getUniformLocation("XEO_uClipNormalAndDist" + i)
                };
            }

            this._pick = this._pick || [];

            var pick = this.program.pick;

            for (var i = 0, len = this.state.clips.length; i < len; i++) {
                this._pick[i] = {
                    uClipMode: pick.getUniformLocation("XEO_uClipMode" + i),
                    uClipNormalAndDist: pick.getUniformLocation("XEO_uClipNormalAndDist" + i)
                };
            }
        },

        drawAndPick: function (frameCtx) {

            var vars = (frameCtx.pick) ? this._pick : this._draw;

            var mode;
            var normalAndDist;
            var clips = this.state.clips;
            var clip;
            var gl = this.program.gl;

            for (var i = 0, len = clips.length; i < len; i++) {

                if (frameCtx.pick) {
                    mode = vars[i].uClipMode;
                    normalAndDist = vars[i].uClipNormalAndDist;
                } else {
                    mode = vars[i].uClipMode;
                    normalAndDist = vars[i].uClipNormalAndDist;
                }

                if (mode && normalAndDist) {

                    clip = clips[i];

                    if (clip.mode === "inside") {

                        gl.uniform1f(mode, 2);
                        gl.uniform4fv(normalAndDist, clip.normalAndDist);

                    } else if (clip.mode === "outside") {

                        gl.uniform1f(mode, 1);
                        gl.uniform4fv(normalAndDist, clip.normalAndDist);

                    } else { // disabled
                        gl.uniform1f(mode, 0);
                    }
                }
            }
        }
    });

})();