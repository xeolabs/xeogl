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

            this._uLightAttenuation = this._uLightAttenuation || [];

            var lights = this.state.lights;
            var program = this.program;

            for (var i = 0, len = lights.length; i < len; i++) {

                switch (lights[i].type) {

                    case "ambient":
                        this._uLightAmbientColor[i] = program.draw.getUniform("xeo_uLightAmbientColor");
                        this._uLightAmbientIntensity[i] = program.draw.getUniform("xeo_uLightAmbientIntensity");
                        break;

                    case "dir":
                        this._uLightColor[i] = program.draw.getUniform("xeo_uLightColor" + i);
                        this._uLightIntensity[i] = program.draw.getUniform("xeo_uLightIntensity" + i);
                        this._uLightPos[i] = null;
                        this._uLightDir[i] = program.draw.getUniform("xeo_uLightDir" + i);
                        break;

                    case "point":
                        this._uLightColor[i] = program.draw.getUniform("xeo_uLightColor" + i);
                        this._uLightIntensity[i] = program.draw.getUniform("xeo_uLightIntensity" + i);
                        this._uLightPos[i] = program.draw.getUniform("xeo_uLightPos" + i);
                        this._uLightDir[i] = null;
                        this._uLightAttenuation[i] = program.draw.getUniform("xeo_uLightAttenuation" + i);
                        break;
                }
            }
        },

        draw: function () {

            var lights = this.state.lights;
            var light;

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

                        if (this._uLightAttenuation[i]) {
                            this._uLightAttenuation[i].setValue(light.attenuation);
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
