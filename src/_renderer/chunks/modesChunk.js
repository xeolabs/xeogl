(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "modes",

        build: function () {

            this._clippableDraw = this.program.draw.getUniform("clippable");
            this._clippableShadow = this.program.shadow.getUniform("clippable");
            this._clippablePickObject = this.program.pickObject.getUniform("clippable");
            this._clippablePickPrimitive = this.program.pickPrimitive.getUniform("clippable");
        },

        draw: function (frameCtx) {
            if (this._clippableDraw) {
                this._clippableDraw.setValue(this.state.clippable);
            }
        },

        shadow: function (frameCtx) {
            if (this._clippableShadow) {
                this._clippableShadow.setValue(this.state.clippable);
            }
        },

        pickObject: function (frameCtx) {
            if (this._clippablePickObject) {
                this._clippablePickObject.setValue(this.state.clippable);
            }
        },

        pickPrimitive: function (frameCtx) {
            if (this._clippablePickPrimitive) {
                this._clippablePickPrimitive.setValue(this.state.clippable);
            }
        }
    });
})();
