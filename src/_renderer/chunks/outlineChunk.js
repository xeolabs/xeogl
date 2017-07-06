(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "outline",

        build: function () {

            var outline = this.program.outline;

            this._uColor = outline.getUniform("color");
            this._uThickness = outline.getUniform("thickness");
        },

        outline: function (frameCtx) {

            var state = this.state;

            if (this._uColor) {
                this._uColor.setValue(state.color);
            }

            if (this._uThickness) {
                this._uThickness.setValue(state.thickness);
            }
        }
    });

})();
