(function () {

    "use strict";

    /**
     * Create display state chunk type for draw render of material transform
     */
    XEO.ChunkFactory.createChunkType({

        type: "name",

        build: function () {
            this._uPickColor = this.program.pick.getUniformLocation("XEO_uPickColor");
        },

        pick: function (frameCtx) {

            if (this._uPickColor && this.state.name) {

                frameCtx.pickNames[frameCtx.pickIndex++] = this.state;

                var b = frameCtx.pickIndex >> 16 & 0xFF;
                var g = frameCtx.pickIndex >> 8 & 0xFF;
                var r = frameCtx.pickIndex & 0xFF;

                this.program.gl.uniform3fv(this._uPickColor, [r / 255, g / 255, b / 255]);
            }
        }
    });

})();