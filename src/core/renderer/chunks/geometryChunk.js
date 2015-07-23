(function () {

    "use strict";

    /**
     *  Create display state chunk type for draw and pick render of geometry
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "geometry",

        build: function () {

            var draw = this.program.draw;

            this._aPositionDraw = draw.getAttribute("XEO_aPosition");
            this._aNormalDraw = draw.getAttribute("XEO_aNormal");
            this._aUVDraw = draw.getAttribute("XEO_aUV");
            this._aTangentDraw = draw.getAttribute("XEO_aTangent");
            this._aColorDraw = draw.getAttribute("XEO_aColor");

            var pick = this.program.pick;

            this._aPositionPick = pick.getAttribute("XEO_aPosition");
        },

        draw: function (frameCtx) {

            var core = this.core;

            if (this._aPositionDraw) {
                this._aPositionDraw.bindFloatArrayBuffer(core.positions);
            }

            if (this._aNormalDraw) {
                this._aNormalDraw.bindFloatArrayBuffer(core.normals);
            }

            if (this._aUVDraw) {
                this._aUVDraw.bindFloatArrayBuffer(core.uv);
            }

            if (this._aColorDraw) {
                this._aColorDraw.bindFloatArrayBuffer(core.colors);
            }

            if (this._aTangentDraw) {

                // Lazy-compute tangents
                //    this._aTangentDraw.bindFloatArrayBuffer(core2.tangentBuf || core2.getTangentBuf());
            }

            core.indices.bind();
        },

        pick: function () {

            var core = this.core;

            if (this._aPositionPick) {
                this._aPositionPick.bindFloatArrayBuffer(core.positions);
            }

            core.indices.bind();
        }
    });

})();