(function () {

    "use strict";

    /**
     *  Create display state chunk type for draw and pick render of geometry
     */
    XEO.renderer.ChunkFactory.createChunkType({

        type: "geometry",

        build: function () {

            var draw = this.program.draw;

            this._aGeometryPositionDraw = draw.getAttribute("XEO_aGeometryPosition");
            this._aGeometryNormalDraw = draw.getAttribute("XEO_aGeometryNormal");
            this._aGeometryUVDraw = draw.getAttribute("XEO_aGeometryUV");
            this._aGeometryTangentDraw = draw.getAttribute("XEO_aGeometryTangent");
            this._aGeometryColorDraw = draw.getAttribute("XEO_aGeometryColor");

            var pick = this.program.pick;

            this._aGeometryPositionPick = pick.getAttribute("XEO_aGeometryPosition");
        },

        draw: function (frameCtx) {

            var core = this.core;

            if (this._aGeometryPositionDraw) {
                this._aGeometryPositionDraw.bindFloatArrayBuffer(core.positions);
            }

            if (this._aGeometryNormalDraw) {
                this._aGeometryNormalDraw.bindFloatArrayBuffer(core.normals);
            }

            if (this._aGeometryUVDraw) {
                this._aGeometryUVDraw.bindFloatArrayBuffer(core.uv);
            }

            if (this._aGeometryColorDraw) {
                this._aGeometryColorDraw.bindFloatArrayBuffer(core.colors);
            }

            if (this._aGeometryTangentDraw) {

                // Lazy-compute tangents
                //    this._aGeometryTangentDraw.bindFloatArrayBuffer(core2.tangentBuf || core2.getTangentBuf());
            }

            core.indices.bind();
        },

        pick: function () {

            var core = this.core;

            if (this._aGeometryPositionPick) {
                this._aGeometryPositionPick.bindFloatArrayBuffer(core.positions);
            }

            core.indices.bind();
        }
    });

})();