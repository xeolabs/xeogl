/**
 * Create display state chunk type for draw and pick render of lookAt transform
 */
XEO.ChunkFactory.createChunkType({

    type: "lookAt",

    build : function() {

        this._uvMatrixDraw = this.program.draw.getUniformLocation("XEO_uVMatrix");
        this._uVNMatrixDraw = this.program.draw.getUniformLocation("XEO_uVNMatrix");
        this._uWorldEyeDraw = this.program.draw.getUniformLocation("XEO_uWorldEye");

        this._uvMatrixPick = this.program.pick.getUniformLocation("XEO_uVMatrix");
    },

    draw : function(frameCtx) {

        if (this.core.dirty) {
            this.core.rebuild();
        }

        var gl = this.program.gl;

        if (this._uvMatrixDraw) {
            gl.uniformMatrix4fv(this._uvMatrixDraw, gl.FALSE, this.core.mat);
        }

        if (this._uVNMatrixDraw) {
            gl.uniformMatrix4fv(this._uVNMatrixDraw, gl.FALSE, this.core.normalMat);
        }

        if (this._uWorldEyeDraw) {
            gl.uniform3fv(this._uWorldEyeDraw, this.core.lookAt.eye);
        }

        frameCtx.viewMat = this.core.mat;
    },

    pick : function(frameCtx) {

        var gl = this.program.gl;

        if (this._uvMatrixPick) {
            gl.uniformMatrix4fv(this._uvMatrixPick, gl.FALSE, this.core.mat);
        }

        frameCtx.viewMat = this.core.mat;
    }
});