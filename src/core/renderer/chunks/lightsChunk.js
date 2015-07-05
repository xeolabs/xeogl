(function () {

    "use strict";

    XEO.renderer.ChunkFactory.createChunkType({

        type: "lights",

        build: function () {

            this._uLightAmbientColor = this._uLightAmbientColor || [];
            this._uLightAmbientIntensity = this._uLightAmbientIntensity || [];

            this._uLightColor = this._uLightColor || [];
            this._uLightIntensity = this._uLightIntensity || [];

            this._uLightDir = this._uLightDir || [];
            this._uLightPos = this._uLightPos || [];

            this._uLightConstantAttenuation = this._uLightConstantAttenuation || [];
            this._uLightLinearAttenuation = this._uLightLinearAttenuation || [];
            this._uLightQuadraticAttenuation = this._uLightQuadraticAttenuation || [];

            var lights = this.state.lights;
            var program = this.program;

            for (var i = 0, len = lights.length; i < len; i++) {

                switch (lights[i].type) {

                    case "ambient":
                        this._uLightAmbientColor[i] = program.draw.getUniform("XEO_uLightAmbientColor");
                        this._uLightAmbientIntensity[i] = program.draw.getUniform("XEO_uLightAmbientIntensity" + i);
                        break;

                    case "dir":
                        this._uLightColor[i] = program.draw.getUniform("XEO_uLightColor" + i);
                        this._uLightIntensity[i] = program.draw.getUniform("XEO_uLightIntensity" + i);
                        this._uLightPos[i] = null;
                        this._uLightDir[i] = program.draw.getUniform("XEO_uLightDir" + i);
                        break;

                    case "point":
                        this._uLightColor[i] = program.draw.getUniform("XEO_uLightColor" + i);
                        this._uLightIntensity[i] = program.draw.getUniform("XEO_uLightIntensity" + i);
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

                if (this._uLightAmbientColor[i]) {
                    this._uLightAmbientColor[i].setValue(light.color);

                    if (this._uLightAmbientIntensity[i]) {
                        this._uLightAmbientIntensity[i].setValue(light.intensity);
                    }

                } else {

                    // Color and intensity

                    if (this._uLightColor[i]) {
                        this._uLightColor[i].setValue(light.color);
                    }

                    if (this._uLightIntensity[i]) {
                        this._uLightIntensity[i].setValue(light.intensity);
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