(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "xform",

        build: function () {

            var draw = this.program.draw;

            this._uMatLocationDraw = draw.getUniformLocation("XEO_uMMatrix");
            this._uNormalMatLocationDraw = draw.getUniformLocation("XEO_uMNMatrix");

            var pick = this.program.pick;

            this._uMatLocationPick = pick.getUniformLocation("XEO_uMMatrix");
        },

        draw: function (frameCtx) {

            /* Rebuild state's matrix from matrices at cores on path up to root
             */
            if (SceneJS_configsModule.configs.forceXFormCoreRebuild === true || this.state.dirty && this.state.build) {
                this.state.build();
            }

            var gl = this.program.gl;

            if (this._uMatLocationDraw) {
                gl.uniformMatrix4fv(this._uMatLocationDraw, gl.FALSE, this.state.mat);
            }

            if (this._uNormalMatLocationDraw) {
                gl.uniformMatrix4fv(this._uNormalMatLocationDraw, gl.FALSE, this.state.normalMat);
            }

            frameCtx.modelMat = this.state.mat;
        },

        pick: function (frameCtx) {

            /* Rebuild state's matrix from matrices at cores on path up to root
             */
            if (this.state.dirty) {
                this.state.build();
            }

            var gl = this.program.gl;

            if (this._uMatLocationPick) {
                gl.uniformMatrix4fv(this._uMatLocationPick, gl.FALSE, this.state.mat);
            }

            frameCtx.modelMat = this.state.mat;
        }
    });

})();
