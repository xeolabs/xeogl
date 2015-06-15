(function () {

    "use strict";

    XEO.ChunkFactory.createChunkType({

        type: "lights",

        build: function () {

            this._uLightAmbient = this._uLightAmbient || [];

            this._uLightDiffuse = this._uLightDiffuse || [];
            this._uLightSpecular = this._uLightSpecular || [];

            this._uLightDir = this._uLightDir || [];
            this._uLightPos = this._uLightPos || [];

            this._uLightConstantAttenuation = this._uLightConstantAttenuation || [];
            this._uLightLinearAttenuation = this._uLightLinearAttenuation || [];
            this._uLightQuadraticAttenuation = this._uLightQuadraticAttenuation || [];

            var lights = this.state.lights;
            var program = this.program;

            for (var i = 0, len = lights.length; i < len; i++) {

                switch (lights[i].mode) {

                    case "ambient":
                        this._uLightAmbient[i] = program.draw.getUniform("XEO_uLightAmbient");
                        break;

                    case "dir":
                        this._uLightDiffuse[i] = program.draw.getUniform("XEO_uLightDiffuse" + i);
                        this._uLightSpecular[i] = program.draw.getUniform("XEO_uLightSpecular" + i);
                        this._uLightPos[i] = null;
                        this._uLightDir[i] = program.draw.getUniform("XEO_uLightDir" + i);
                        break;

                    case "point":
                        this._uLightDiffuse[i] = program.draw.getUniform("XEO_uLightDiffuse" + i);
                        this._uLightSpecular[i] = program.draw.getUniform("XEO_uLightSpecular" + i);
                        this._uLightPos[i] = program.draw.getUniform("XEO_uLightPos" + i);
                        this._uLightDir[i] = null;
                        this._uLightConstantAttenuation[i] = program.draw.getUniform("XEO_uLightConstantAttenuation" + i);
                        this._uLightLinearAttenuation[i] = program.draw.getUniform("XEO_uLightLinearAttenuation" + i);
                        this._uLightQuadraticAttenuation[i] = program.draw.getUniform("XEO_uLightQuadraticAttenuation" + i);
                        break;
                }
            }
        },

        draw: function () {

            var lights = this.state.lights;
            var light;

            var gl = this.program.gl;

            for (var i = 0, len = lights.length; i < len; i++) {

                light = lights[i];

                // Ambient color

                if (this._uLightAmbient[i]) {
                    this._uLightAmbient[i].setValue(light.ambient);

                } else {

                    // Diffuse and specular color

                    if (this._uLightDiffuse[i]) {
                        this._uLightDiffuse[i].setValue(light.diffuse);
                    }

                    if (this._uLightSpecular[i]) {
                        this._uLightSpecular[i].setValue(light.specular);
                    }

                    if (this._uLightPos[i]) {

                        // Position

                        this._uLightPos[i].setValue(light.pos);

                        // Attenuation

                        if (this._uLightConstantAttenuation[i]) {
                            this._uLightConstantAttenuation[i].setValue(light.constantAttenuation);
                        }

                        if (this._uLightLinearAttenuation[i]) {
                            this._uLightLinearAttenuation[i].setValue(light.linearAttenuation);
                        }

                        if (this._uLightQuadraticAttenuation[i]) {
                            this._uLightQuadraticAttenuation[i].setValue(light.quadraticAttenuation);
                        }
                    }

                    // Direction

                    if (this._uLightDir[i]) {
                        this._uLightDir[i].setValue(light.dir);
                    }
                }
            }
        }
    });

})();