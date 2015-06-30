(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "projTransform",

        build: function () {

            this._uProjMatrixDraw = this.program.draw.getUniform("XEO_uProjMatrix");
            this._uZNearDraw = this.program.draw.getUniform("XEO_uZNear");
            this._uZFarDraw = this.program.draw.getUniform("XEO_uZFar");

            this._uProjMatrixPick = this.program.pick.getUniform("XEO_uProjMatrix");
            this._uZNearPick = this.program.pick.getUniform("XEO_uZNear");
            this._uZFarPick = this.program.pick.getUniform("XEO_uZFar");
        },

        draw: function (frameCtx) {

            var state = this.state;

            if (this._uProjMatrixDraw) {
                this._uProjMatrixDraw.setValue(state.matrix);
            }

            if (this._uZNearDraw) {
                this._uZNearDraw.setValue(state.near);
            }

            if (this._uZFarDraw) {
                this._uZFarDraw.setValue(state.far);
            }

            frameCtx.projMatrix = state.matrix;
        },


        pick: function (frameCtx) {

            var state = this.state;

            if (this._uProjMatrixPick) {
                this._uProjMatrixPick.setValue(state.matrix);
            }

            if (frameCtx.rayPick) {

                // Z-pick pass: feed near and far clip planes into shader

                if (this._uZNearPick) {
                    this._uZNearPick.setValue(state.near);
                }

                if (this._uZFarPick) {
                    this._uZFarPick.setValue(state.far);
                }
            }

            frameCtx.projMatrix = state.matrix;
        }
    });

})();