(function () {

    "use strict";

    /**
     *  Create display state chunk type for draw and pick render of geometry
     */
    xeogl.renderer.ChunkFactory.createChunkType({

        type: "geometry",

        build: function () {

            var draw = this.program.draw;
            this._aPositionDraw = draw.getAttribute("position");
            this._aNormalDraw = draw.getAttribute("normal");
            this._aUVDraw = draw.getAttribute("uv");
            this._aTangentDraw = draw.getAttribute("tangent");
            this._aColorDraw = draw.getAttribute("color");

            this._aPositionShadow = this.program.shadow.getAttribute("position");

            var pickObject = this.program.pickObject;
            this._aPositionPickObject = pickObject.getAttribute("position");

            var pickPrimitive = this.program.pickPrimitive;
            this._aPositionPickPrimitive = pickPrimitive.getAttribute("position");
            this._aColorPickPrimitive = pickPrimitive.getAttribute("color");

            var outline = this.program.outline;
            this._aPositionOutline = outline.getAttribute("position");
            this._aNormalOutline = outline.getAttribute("normal");
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

        shadow: function (frameCtx) {

            var state = this.state;

            if (this._aPositionShadow) {
                this._aPositionShadow.bindFloatArrayBuffer(state.positions);
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
        },

        outline: function (frameCtx) {

            var state = this.state;

            if (this._aPositionOutline) {
                this._aPositionOutline.bindFloatArrayBuffer(state.positions);
                frameCtx.bindArray++;
            }

            if (this._aNormalOutline) {
                this._aNormalOutline.bindFloatArrayBuffer(state.normals);
                frameCtx.bindArray++;
            }

            if (state.indices) {
                state.indices.bind();
                frameCtx.bindArray++;
            }
        }
    });

})();