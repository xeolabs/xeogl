(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "cubemap",

        build: function () {
//            this._uCubeMapSampler = this._uCubeMapSampler || [];
//            this._uCubeMapIntensity = this._uCubeMapIntensity || [];
//            var layers = this.state.layers;
//            if (layers) {
//                var layer;
//                var draw = this.program.draw;
//                for (var i = 0, len = layers.length; i < len; i++) {
//                    layer = layers[i];
//                    this._uCubeMapSampler[i] = "xeo_uCubeMapSampler" + i;
//                    this._uCubeMapIntensity[i] = draw.getUniform("xeo_uCubeMapIntensity" + i);
//                }
//            }
        },

        draw: function (frameCtx) {
//            var layers = this.state.layers;
//            if (layers) {
//                var layer;
//                var draw = this.program.draw;
//                for (var i = 0, len = layers.length; i < len; i++) {
//                    layer = layers[i];
//                    if (this._uCubeMapSampler[i] && layer.texture) {
//                        draw.bindTexture(this._uCubeMapSampler[i], layer.texture, frameCtx.textureUnit++);
//                        if (this._uCubeMapIntensity[i]) {
//                            this._uCubeMapIntensity[i].setValue(layer.intensity);
//                        }
//                    }
//                }
//            }
//
//            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
//                frameCtx.textureUnit = 0;
//            }
        }
    });

})();