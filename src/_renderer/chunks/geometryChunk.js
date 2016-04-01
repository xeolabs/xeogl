(function () {

    "use strict";

    /**
     *  Create display state chunk type for draw and pick render of geometry
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "geometry",

        build: function () {

            var draw = this.program.draw;
            this._aPositionDraw = draw.getAttribute("xeo_aPosition");
            this._aNormalDraw = draw.getAttribute("xeo_aNormal");
            this._aUVDraw = draw.getAttribute("xeo_aUV");
            this._aTangentDraw = draw.getAttribute("xeo_aTangent");
            this._aColorDraw = draw.getAttribute("xeo_aColor");

            var pickObject = this.program.pickObject;
            this._aPositionPickObject = pickObject.getAttribute("xeo_aPosition");

            var pickPrimitive = this.program.pickPrimitive;
            this._aPositionPickPrimitive = pickPrimitive.getAttribute("xeo_aPosition");
            this._aColorPickPrimitive = pickPrimitive.getAttribute("xeo_aColor");
        },

        draw: function (frameCtx) {

            var state = this.state;

            if (this._aPositionDraw) {
                this._aPositionDraw.bindFloatArrayBuffer(state.positions);
                frameCtx.bindArray++;
            }

            if (this._aNormalDraw) {
                this._aNormalDraw.bindFloatArrayBuffer(state.normals);
                frameCtx.bindArray++;
            }

            if (this._aUVDraw) {
                this._aUVDraw.bindFloatArrayBuffer(state.uv);
                frameCtx.bindArray++;
            }

            if (this._aColorDraw) {
                this._aColorDraw.bindFloatArrayBuffer(state.colors);
                frameCtx.bindArray++;
            }

            if (this._aTangentDraw) {

                // Tangents array is lazy-built from UVs and normals,
                // now that we know that we need it

                this._aTangentDraw.bindFloatArrayBuffer(state.getTangents());
                frameCtx.bindArray++;
            }

            if (state.indices) {
                state.indices.bind();
                frameCtx.bindArray++;
            }
        },

        pickObject: function () {

            var state = this.state;

            if (this._aPositionPickObject) {
                this._aPositionPickObject.bindFloatArrayBuffer(state.positions);
            }

            if (state.indices) {
                state.indices.bind();
            }
        },

        pickPrimitive: function () {

            var state = this.state;

            // Arrays for primitive-picking are lazy-built
            // now that we know we need them

            if (this._aPositionPickPrimitive) {
                this._aPositionPickPrimitive.bindFloatArrayBuffer(state.getPickPositions());
            }

            if (this._aColorPickPrimitive) {
                this._aColorPickPrimitive.bindFloatArrayBuffer(state.getPickColors());
            }
        }
    });

})();