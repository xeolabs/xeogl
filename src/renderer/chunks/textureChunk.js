XEO.ChunkFactory.createChunkType({

    type: "texture",

    build : function() {

        this._uTexSampler = this._uTexSampler || [];
        this._uTexMatrix = this._uTexMatrix || [];
        this._uTexBlendFactor = this._uTexBlendFactor || [];

        var layers = this.core.layers;

        if (layers) {

            var layer;
            var draw = this.program.draw;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                this._uTexSampler[i] = "XEO_uSampler" + i;

                this._uTexMatrix[i] = draw.getUniform("XEO_uLayer" + i + "Matrix");

                this._uTexBlendFactor[i] = draw.getUniform("XEO_uLayer" + i + "BlendFactor");
            }
        }
    },

    draw : function(frameCtx) {

        frameCtx.textureUnit = 0;

        var layers = this.core.layers;

        if (layers) {

            var draw = this.program.draw;
            var layer;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                if (this._uTexSampler[i] && layer.texture) {    // Lazy-loads

                    draw.bindTexture(this._uTexSampler[i], layer.texture, frameCtx.textureUnit++);

                    if (layer._matrixDirty && layer.buildMatrix) {
                        layer.buildMatrix.call(layer);
                    }

                    if (this._uTexMatrix[i]) {
                        this._uTexMatrix[i].setValue(layer.matrixAsArray);
                    }

                    if (this._uTexBlendFactor[i]) {
                        this._uTexBlendFactor[i].setValue(layer.blendFactor);
                    }

                } else {
                     // draw.bindTexture(this._uTexSampler[i], null, i); // Unbind
                }
            }
        }

        if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
            frameCtx.textureUnit = 0;
        }
    }
});