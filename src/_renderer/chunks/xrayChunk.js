(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "xray",

        build: function () {

            var xray = this.program.xray;

            //this._uColor = xray.getUniform("color");
            //this._uThickness = xray.getUniform("thickness");
        },

        xray: function (frameCtx) {

            var state = this.state;

            //if (this._uColor) {
            //    this._uColor.setValue(state.color);
            //}
            //
            //if (this._uThickness) {
            //    this._uThickness.setValue(state.thickness);
            //}
        }
    });

})();
