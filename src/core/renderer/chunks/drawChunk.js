(function () {

    "use strict";

    /**
     *
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "draw",

        // As we apply a list of state chunks in a {@link XEO.renderer.Renderer},
        // we track the ID of each chunk in order to avoid redundantly re-applying
        // the same chunk. We don't want that for draw chunks however, because
        // they contain GL drawElements calls, which we need to do for each object.
        unique: true,

        build: function () {

            this._depthModeDraw = this.program.draw.getUniform("xeo_uDepthMode");

            this._depthModePick = this.program.pick.getUniform("xeo_uDepthMode");

            this._uPickColor = this.program.pick.getUniform("xeo_uPickColor");
        },

        drawAndPick: function (frameCtx) {

            var gl = this.program.gl;

            if (frameCtx.pick) {

                // TODO: Only set pick color when depthMode === false/0?

                if (this._uPickColor) {

                    frameCtx.pickObjects[frameCtx.pickIndex++] = this.object;

                    var b = frameCtx.pickIndex >> 16 & 0xFF;
                    var g = frameCtx.pickIndex >> 8 & 0xFF;
                    var r = frameCtx.pickIndex & 0xFF;

                    this._uPickColor.setValue([r / 255, g / 255, b / 255]);
                }

                if (this._depthModeDraw) {
                    this._depthModePick.setValue(frameCtx.depthMode);
                }

            } else {

                if (this._depthModePick) {
                this._depthModeDraw.setValue(frameCtx.depthMode);
                }
            }

            gl.drawElements(this.state.primitive, this.state.indices.numItems, this.state.indices.itemType, 0);
        }
    });

})();
