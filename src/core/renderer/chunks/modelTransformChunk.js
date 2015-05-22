(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "modelTransform",

        build: function () {

            var draw = this.program.draw;

            this._uMatLocationDraw = draw.getUniformLocation("XEO_uMMatrix");
            this._uNormalMatLocationDraw = draw.getUniformLocation("XEO_uMNMatrix");

            var pick = this.program.pick;

            this._uMatLocationPick = pick.getUniformLocation("XEO_uMMatrix");
        },

        draw: function (frameCtx) {

            var gl = this.program.gl;

            if (this._uMatLocationDraw) {
                gl.uniformMatrix4fv(this._uMatLocationDraw, gl.FALSE, this.state.matrix);
            }

            if (this._uNormalMatLocationDraw) {
                gl.uniformMatrix4fv(this._uNormalMatLocationDraw, gl.FALSE, this.state.normalMatrix);
            }

            frameCtx.modelMatrix = this.state.matrix;
        },

        pick: function (frameCtx) {

            var gl = this.program.gl;

            if (this._uMatLocationPick) {
                gl.uniformMatrix4fv(this._uMatLocationPick, gl.FALSE, this.state.matrix);
            }

            frameCtx.modelMatrix = this.state.matrix;
        }
    });

})();
