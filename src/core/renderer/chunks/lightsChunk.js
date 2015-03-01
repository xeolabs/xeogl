/**
 *  Create display state chunk type for draw render of lights projection
 */
XEO.ChunkFactory.createChunkType({

    type:"lights",

    build:function () {

        this._uAmbientColor = this._uAmbientColor || [];
        this._uLightColor = this._uLightColor || [];
        this._uLightDir = this._uLightDir || [];
        this._uLightPos = this._uLightPos || [];
        this._uLightCutOff = this._uLightCutOff || [];
        this._uLightSpotExp = this._uLightSpotExp || [];
        this._uLightAttenuation = this._uLightAttenuation || [];

        var lights = this.core.lights;
        var program = this.program;

        for (var i = 0, len = lights.length; i < len; i++) {

            switch (lights[i].mode) {

                case "ambient":
                    this._uAmbientColor[i] = (program.draw.getUniformLocation("XEO_uAmbientColor"));
                    break;

                case "dir":
                    this._uLightColor[i] = program.draw.getUniformLocation("XEO_uLightColor" + i);
                    this._uLightPos[i] = null;
                    this._uLightDir[i] = program.draw.getUniformLocation("XEO_uLightDir" + i);
                    break;

                case "point":
                    this._uLightColor[i] = program.draw.getUniformLocation("XEO_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniformLocation("XEO_uLightPos" + i);
                    this._uLightDir[i] = null;
                    this._uLightAttenuation[i] = program.draw.getUniformLocation("XEO_uLightAttenuation" + i);
                    break;
            }
        }
    },

    draw:function (frameCtx) {

        if (frameCtx.dirty) {
            this.build();
        }

        var lights = this.core.lights;
        var light;

        var gl = this.program.gl;

        for (var i = 0, len = lights.length; i < len; i++) {

            light = lights[i];

            if (this._uAmbientColor[i]) {
                gl.uniform3fv(this._uAmbientColor[i], light.color);

            } else {

                if (this._uLightColor[i]) {
                    gl.uniform3fv(this._uLightColor[i], light.color);
                }

                if (this._uLightPos[i]) {
                    gl.uniform3fv(this._uLightPos[i], light.pos);

                    if (this._uLightAttenuation[i]) {
                        gl.uniform3fv(this._uLightAttenuation[i], light.attenuation);
                    }
                }

                if (this._uLightDir[i]) {
                    gl.uniform3fv(this._uLightDir[i], light.dir);
                }
            }
        }
    }
});