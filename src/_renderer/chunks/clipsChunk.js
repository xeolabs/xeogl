(function () {

    "use strict";

    /**
     * Create display state chunk type for draw and pick render of user clipping planes
     */
    xeogl.renderer.ChunkFactory.createChunkType({

        type: "clips",

        build: function () {

            var i;
            var len;

            this._uClipModeDraw = this._uClipModeDraw || [];
            this._uClipPlaneDraw = this._uClipPlaneDraw || [];

            var draw = this.program.draw;

            for (i = 0, len = this.state.clips.length; i < len; i++) {
                this._uClipModeDraw[i] = draw.getUniform("xeo_uClipMode" + i);
                this._uClipPlaneDraw[i] = draw.getUniform("xeo_uClipPlane" + i)
            }

            this._uClipModePick = this._uClipModePick || [];
            this._uClipPlanePick = this._uClipPlanePick || [];

            var pick = this.program.pick;

            for (i = 0, len = this.state.clips.length; i < len; i++) {
                this._uClipModePick[i] = pick.getUniform("xeo_uClipMode" + i);
                this._uClipPlanePick[i] = pick.getUniform("xeo_uClipPlane" + i)
            }
        },

        drawPick: function (frameCtx) {

            return;

            var uClipMode = (frameCtx.pick) ? this._uClipModePick : this._uClipModeDraw;
            var uClipPlane = (frameCtx.pick) ? this._uClipPlanePick : this._uClipPlaneDraw;

            var mode;
            var plane;
            var clips = this.state.clips;
            var clip;

            for (var i = 0, len = clips.length; i < len; i++) {

                mode = uClipMode[i];
                plane = uClipPlane[i];

                if (mode && plane) {

                    clip = clips[i];

                    if (clip.mode === "inside") {

                        mode.setValue(2);
                        plane.setValue(clip.plane);

                    } else if (clip.mode === "outside") {

                        mode.setValue(1);
                        plane.setValue(clip.plane);

                    } else {

                        // Disabled

                        mode.setValue(0);
                    }
                }
            }
        }
    });

})();