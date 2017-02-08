(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "lights",

        build: function () {

            this._uLightAmbientColor = this._uLightAmbientColor || [];
            this._uLightAmbientIntensity = this._uLightAmbientIntensity || [];

            this._uLightColor = this._uLightColor || [];
            this._uLightIntensity = this._uLightIntensity || [];

            this._uLightDir = this._uLightDir || [];
            this._uLightPos = this._uLightPos || [];

            this._uLightAttenuation = this._uLightAttenuation || [];

            this._uShadowViewMatrix = this._uShadowViewMatrix || [];
            this._uShadowProjMatrix = this._uShadowProjMatrix || [];

            var lights = this.state.lights;
            var light;
            var program = this.program;

            for (var i = 0, len = lights.length; i < len; i++) {

                light = lights[i];

                switch (light.type) {

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

                if (light.shadow) {
                    this._uShadowViewMatrix[i] = program.draw.getUniform("xeo_uShadowViewMatrix" + i);
                    this._uShadowProjMatrix[i] = program.draw.getUniform("xeo_uShadowProjMatrix" + i);
                }
            }

            if (this.state.lightMap) {
                this._uLightMap = "xeo_uLightMap";
            }

            if (this.state.reflectionMap) {
                this._uReflectionMap = "xeo_uReflectionMap";
            }
        },

        draw: function (frameCtx) {

            var draw = this.program.draw;
            var gl = this.program.gl;
            var state = this.state;
            var lights = state.lights;
            var light;
            var maxTextureUnits = xeogl.WEBGL_INFO.MAX_TEXTURE_IMAGE_UNITS;

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

                    // Shadow

                    if (light.shadow) {

                        if (this._uShadowViewMatrix[i]) {
                            this._uShadowViewMatrix[i].setValue(light.getShadowViewMatrix());
                        }

                        if (this._uShadowProjMatrix[i]) {
                            this._uShadowProjMatrix[i].setValue(light.getShadowProjMatrix());
                        }

                        var shadowRenderBuf = light.getShadowRenderBuf();

                        if (shadowRenderBuf) {

                            var texture = shadowRenderBuf.getTexture();
                            draw.bindTexture("xeo_uShadowMap" + i, shadowRenderBuf.getTexture(), frameCtx.textureUnit);
                            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % maxTextureUnits;
                            frameCtx.bindTexture++;
                        }

                    }
                }
            }

            // Light and reflection map

            if (state.lightMap && state.lightMap.texture && this._uLightMap) {
                draw.bindTexture(this._uLightMap, state.lightMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % maxTextureUnits;
                frameCtx.bindTexture++;
            }

            if (state.reflectionMap && state.reflectionMap.texture && this._uReflectionMap) {
                draw.bindTexture(this._uReflectionMap, state.reflectionMap.texture, frameCtx.textureUnit);
                frameCtx.textureUnit = (frameCtx.textureUnit + 1) % maxTextureUnits;
                frameCtx.bindTexture++;
            }
        }
    });

})();
