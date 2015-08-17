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

            var pick = this.program.pick;

            this._aPositionPick = pick.getAttribute("xeo_aPosition");
        },

        draw: function (frameCtx) {

            var state = this.state;

            if (this._aPositionDraw) {
                this._aPositionDraw.bindFloatArrayBuffer(state.positions);
            }

            if (this._aNormalDraw) {
                this._aNormalDraw.bindFloatArrayBuffer(state.normals);
            }

            if (this._aUVDraw) {
                this._aUVDraw.bindFloatArrayBuffer(state.uv);
            }

            if (this._aColorDraw) {
                this._aColorDraw.bindFloatArrayBuffer(state.colors);
            }

            if (this._aTangentDraw) {

                // Lazy-compute tangents
                //    this._aTangentDraw.bindFloatArrayBuffer(state2.tangentBuf || state2.getTangentBuf());
            }

            if (state.indices) {
                state.indices.bind();
            }
        },

        pick: function () {

            var state = this.state;

            if (this._aPositionPick) {
                this._aPositionPick.bindFloatArrayBuffer(state.positions);
            }

            if (state.indices) {
                state.indices.bind();
            }
        }
    });

})();