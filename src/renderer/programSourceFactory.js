/**
 * @class Manages creation, sharing and recycle of {@link XEO.renderer.ProgramSource} instances
 */
XEO.renderer.ProgramSourceFactory = new (function () {

    var sourceCache = {}; // Source codes are shared across all scenes


    /**
     * Get sourcecode for a program to render the given states
     */
    this.getSource = function (hash, states) {

        var source = sourceCache[hash];
        if (source) {
            source.useCount++;
            return source;
        }

        return sourceCache[hash] = new XEO.renderer.ProgramSource(
            hash,

            this._composePickingVertexShader(states), // pickVertex
            this._composePickingFragmentShader(states), // pickFragment
            this._composeRenderingVertexShader(states), // drawVertex
            this._composeRenderingFragmentShader(states)  // drawFragment
        );
    };

    /**
     * Releases program source code
     */
    this.putSource = function (hash) {
        var source = sourceCache[hash];
        if (source) {
            if (--source.useCount == 0) {
                sourceCache[source.hash] = null;
            }
        }
    };

    this._composePickingVertexShader = function (states) {
        var morphing = !!states.MorphTargets.targets;
        var src = [

            "precision mediump float;",

            "attribute vec3 XEO_aPosition;",
            "uniform mat4 XEO_uMMatrix;",
            "uniform mat4 XEO_uVMatrix;",
            "uniform mat4 XEO_uVNMatrix;",
            "uniform mat4 XEO_uPMatrix;"
        ];

        src.push("varying vec4 XEO_vWorldVertex;");
        src.push("varying vec4 XEO_vViewVertex;");

        if (morphing) {
            src.push("uniform float XEO_uMorphFactor;");       // LERP factor for morph
            if (states.MorphTargets.targets[0].vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 XEO_aMorphVertex;");
            }
        }

        src.push("void main(void) {");

        src.push("   vec4 tmpVertex=vec4(XEO_aPosition, 1.0); ");
        if (morphing) {
            if (states.MorphTargets.targets[0].vertexBuf) {
                src.push("  tmpVertex = vec4(mix(tmpVertex.xyz, XEO_aMorphVertex, XEO_uMorphFactor), 1.0); ");
            }
        }
        src.push("  XEO_vWorldVertex = XEO_uMMatrix * tmpVertex; ");

        src.push("  XEO_vViewVertex = XEO_uVMatrix * XEO_vWorldVertex;");

        src.push("  gl_Position =  XEO_uPMatrix * XEO_vViewVertex;");
        src.push("}");

        return src.join("\n");
    };

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    this._composePickingFragmentShader = function (states) {

        var clipping = states.clips.clips.length > 0;

        var src = [
            "precision mediump float;"
        ];

        src.push("varying vec4 XEO_vWorldVertex;");
        src.push("varying vec4  XEO_vViewVertex;");                  // View-space vertex

        src.push("uniform bool  XEO_uRayPickMode;");                   // Z-pick mode when true else colour-pick
        src.push("uniform vec3  XEO_uPickColor;");                   // Used in colour-pick mode
        src.push("uniform float XEO_uZNear;");                      // Used in Z-pick mode
        src.push("uniform float XEO_uZFar;");                       // Used in Z-pick mode
        src.push("uniform bool  XEO_uClipping;");

        if (clipping) {

            // World-space clipping planes
            for (var i = 0; i < states.clips.clips.length; i++) {
                src.push("uniform float XEO_uClipMode" + i + ";");
                src.push("uniform vec4  XEO_uClipNormalAndDist" + i + ";");
            }
        }

        // Pack depth function for ray-pick
        src.push("vec4 packDepth(const in float depth) {");
        src.push("  const vec4 bitShift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);");
        src.push("  const vec4 bitMask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);");
        src.push("  vec4 res = fract(depth * bitShift);");
        src.push("  res -= res.xxyz * bitMask;");
        src.push("  return res;");
        src.push("}");

        src.push("void main(void) {");

        if (clipping) {

            src.push("if (XEO_uClipping) {");
            src.push("  float   dist;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                src.push("    if (XEO_uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(XEO_vWorldVertex.xyz, XEO_uClipNormalAndDist" + i + ".xyz) - XEO_uClipNormalAndDist" + i + ".w;");
                src.push("        if (XEO_uClipMode" + i + " == 1.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("        if (XEO_uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
            src.push("}");
        }

        src.push("    if (XEO_uRayPickMode) {");
        src.push("          float zNormalizedDepth = abs((XEO_uZNear + XEO_vViewVertex.z) / (XEO_uZFar - XEO_uZNear));");
        src.push("          gl_FragColor = packDepth(zNormalizedDepth); ");
        src.push("    } else {");
        src.push("          gl_FragColor = vec4(XEO_uPickColor.rgb, 1.0);  ");
        src.push("    }");

        src.push("}");

        return src.join("\n");
    };

    this._isTexturing = function (states) {
        if (states.texture.layers && states.texture.layers.length > 0) {
            if (states.geometry.uvBuf || states.geometry.uvBuf2) {
                return true;
            }
            if (states.MorphTargets.targets && (states.MorphTargets.targets[0].uvBuf || states.MorphTargets.targets[0].uvBuf2)) {
                return true;
            }
        }
        return false;
    };

    this._isCubeMapping = function (states) {
        return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
    };

    this._hasNormals = function (states) {
        if (states.geometry.normalBuf) {
            return true;
        }
        if (states.MorphTargets.targets && states.MorphTargets.targets[0].normalBuf) {
            return true;
        }
        return false;
    };

    this._hasTangents = function (states) {
        if (states.texture) {
            var layers = states.texture.layers;
            if (!layers) {
                return false;
            }
            for (var i = 0, len = layers.length; i < len; i++) {
                if (layers[i].applyTo == "normals") {
                    return true;
                }
            }
        }
        return false;
    };

    this._composeRenderingVertexShader = function (states) {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.vertex
            && customShaders.vertex.code
            && customShaders.vertex.code != ""
            && SceneJS._isEmpty(customShaders.vertex.hooks)) {
            return [customShaders.vertex.code];
        }

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var texturing = this._isTexturing(states);
        var normals = this._hasNormals(states);
        var tangents = this._hasTangents(states);
        var clipping = states.clips.clips.length > 0;
        var morphing = !!states.MorphTargets.targets;

        var src = [
            "precision mediump float;"
        ];

        src.push("uniform mat4 XEO_uMMatrix;");             // Model matrix
        src.push("uniform mat4 XEO_uVMatrix;");             // View matrix
        src.push("uniform mat4 XEO_uPMatrix;");             // Projection matrix

        src.push("attribute vec3 XEO_aPosition;");            // Model coordinates

        src.push("uniform vec3 XEO_uWorldEye;");            // World-space eye position

        src.push("varying vec3 XEO_vViewEyeVec;");          // View-space vector from origin to eye

        if (normals) {

            src.push("attribute vec3 XEO_aNormal;");        // Normal vectors
            src.push("uniform   mat4 XEO_uMNMatrix;");      // Model normal matrix
            src.push("uniform   mat4 XEO_uVNMatrix;");      // View normal matrix

            src.push("varying   vec3 XEO_vViewNormal;");    // Output view-space vertex normal

            if (tangents) {
                src.push("attribute vec4 XEO_aTangent;");
            }

            for (var i = 0; i < states.lights.lights.length; i++) {

                var light = states.lights.lights[i];

                if (light.mode == "ambient") {
                    continue;
                }

                if (light.mode == "dir") {
                    src.push("uniform vec3 XEO_uLightDir" + i + ";");
                }

                if (light.mode == "point") {
                    src.push("uniform vec3 XEO_uLightPos" + i + ";");
                }

                if (light.mode == "spot") {
                    src.push("uniform vec3 XEO_uLightPos" + i + ";");
                }

                // Vector from vertex to light, packaged with the pre-computed length of that vector
                src.push("varying vec4 XEO_vViewLightVecAndDist" + i + ";");
            }
        }

        if (texturing) {

            if (states.geometry.uvBuf) {
                src.push("attribute vec2 XEO_aUV;");      // UV coords
            }

            if (states.geometry.uvBuf2) {
                src.push("attribute vec2 XEO_aUV2;");     // UV2 coords
            }
        }

        if (states.geometry.colorBuf) {
            src.push("attribute vec4 XEO_aVertexColor;");       // UV2 coords
            src.push("varying vec4 XEO_vColor;");               // Varying for fragment texturing
        }

        if (clipping) {
            src.push("varying vec4 XEO_vWorldVertex;");         // Varying for fragment clip or world pos hook
        }

        src.push("varying vec4 XEO_vViewVertex;");              // Varying for fragment view clip hook

        if (texturing) {                                            // Varyings for fragment texturing

            if (states.geometry.uvBuf) {
                src.push("varying vec2 XEO_vUVCoord;");
            }

            if (states.geometry.uvBuf2) {
                src.push("varying vec2 XEO_vUVCoord2;");
            }
        }

        if (morphing) {
            src.push("uniform float XEO_uMorphFactor;");       // LERP factor for morph
            if (states.MorphTargets.targets[0].vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 XEO_aMorphVertex;");
            }
            if (normals) {
                if (states.MorphTargets.targets[0].normalBuf) {
                    src.push("attribute vec3 XEO_aMorphNormal;");
                }
            }
        }

        if (customVertexShader.code) {
            src.push("\n" + customVertexShader.code + "\n");
        }

        src.push("void main(void) {");

        src.push("  vec4 tmpVertex=vec4(XEO_aPosition, 1.0); ");

        src.push("  vec4 modelVertex = tmpVertex; ");
        if (normals) {
            src.push("  vec4 modelNormal = vec4(XEO_aNormal, 0.0); ");
        }

        // Morphing - morph targets are in same model space as the geometry
        if (morphing) {
            if (states.MorphTargets.targets[0].vertexBuf) {
                src.push("  vec4 vMorphVertex = vec4(XEO_aMorphVertex, 1.0); ");
                src.push("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, XEO_uMorphFactor), 1.0); ");
            }
            if (normals) {
                if (states.MorphTargets.targets[0].normalBuf) {
                    src.push("  vec4 vMorphNormal = vec4(XEO_aMorphNormal, 1.0); ");
                    src.push("  modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, XEO_uMorphFactor), 1.0); ");
                }
            }
        }

        src.push("  vec4 worldVertex = XEO_uMMatrix * modelVertex;");

        if (vertexHooks.viewMatrix) {
            src.push("vec4 viewVertex = " + vertexHooks.viewMatrix + "(XEO_uVMatrix) * worldVertex;");
        } else {
            src.push("vec4 viewVertex  = XEO_uVMatrix * worldVertex; ");
        }

        if (vertexHooks.viewPos) {
            src.push("viewVertex=" + vertexHooks.viewPos + "(viewVertex);");    // Vertex hook function
        }

        if (normals) {
            src.push("  vec3 worldNormal = (XEO_uMNMatrix * modelNormal).xyz; ");
            src.push("  XEO_vViewNormal = (XEO_uVNMatrix * vec4(worldNormal, 1.0)).xyz;");
        }

        if (clipping || fragmentHooks.worldPos) {
            src.push("  XEO_vWorldVertex = worldVertex;");                  // Varying for fragment world clip or hooks
        }

        src.push("  XEO_vViewVertex = viewVertex;");                    // Varying for fragment hooks

        if (vertexHooks.projMatrix) {
            src.push("gl_Position = " + vertexHooks.projMatrix + "(XEO_uPMatrix) * viewVertex;");
        } else {
            src.push("  gl_Position = XEO_uPMatrix * viewVertex;");
        }

        if (tangents) {

            // Compute tangent-bitangent-normal matrix

            src.push("vec3 tangent = normalize((XEO_uVNMatrix * XEO_uMNMatrix * XEO_aTangent).xyz);");
            src.push("vec3 bitangent = cross(XEO_vViewNormal, tangent);");
            src.push("mat3 TBM = mat3(tangent, bitangent, XEO_vViewNormal);");
        }

        src.push("  vec3 tmpVec3;");

        if (normals) {

            for (var i = 0; i < states.lights.lights.length; i++) {

                light = states.lights.lights[i];

                if (light.mode == "ambient") {
                    continue;
                }

                if (light.mode == "dir") {

                    // Directional light

                    if (light.space == "world") {

                        // World space light

                        src.push("tmpVec3 = normalize(XEO_uLightDir" + i + ");");

                        // Transform to View space
                        src.push("tmpVec3 = vec3(XEO_uVMatrix * vec4(tmpVec3, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            src.push("tmpVec3 *= TBM;");
                        }

                    } else {

                        // View space light

                        src.push("tmpVec3 = normalize(XEO_uLightDir" + i + ");");

                        if (tangents) {

                            // Transform to Tangent space
                            src.push("tmpVec3 *= TBM;");
                        }
                    }

                    // Output
                    src.push("XEO_vViewLightVecAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                }

                if (light.mode == "point") {

                    // Positional light

                    if (light.space == "world") {

                        // World space

                        src.push("tmpVec3 = XEO_uLightPos" + i + " - worldVertex.xyz;"); // Vector from World coordinate to light pos

                        // Transform to View space
                        src.push("tmpVec3 = vec3(XEO_uVMatrix * vec4(tmpVec3, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            src.push("tmpVec3 *= TBM;");
                        }

                    } else {

                        // View space

                        src.push("tmpVec3 = XEO_uLightPos" + i + ".xyz - viewVertex.xyz;"); // Vector from View coordinate to light pos

                        if (tangents) {

                            // Transform to tangent space
                            src.push("tmpVec3 *= TBM;");
                        }
                    }

                    // Output
                    src.push("XEO_vViewLightVecAndDist" + i + " = vec4(tmpVec3, length( XEO_uLightPos" + i + " - worldVertex.xyz));");
                }
            }
        }

        src.push("XEO_vViewEyeVec = ((XEO_uVMatrix * vec4(XEO_uWorldEye, 0.0)).xyz  - viewVertex.xyz);");

        if (tangents) {

            src.push("XEO_vViewEyeVec *= TBM;");
        }

        if (texturing) {

            if (states.geometry.uvBuf) {
                src.push("XEO_vUVCoord = XEO_aUV;");
            }

            if (states.geometry.uvBuf2) {
                src.push("XEO_vUVCoord2 = XEO_aUV2;");
            }
        }

        if (states.geometry.colorBuf) {
            src.push("XEO_vColor = XEO_aVertexColor;");
        }
        src.push("}");

        return src.join("\n");
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering Fragment shader
     *---------------------------------------------------------------------------------------------------------------*/

    this._composeRenderingFragmentShader = function (states) {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.fragment
            && customShaders.fragment.code
            && customShaders.fragment.code != ""
            && SceneJS._isEmpty(customShaders.fragment.hooks)) {
            return [customShaders.fragment.code];
        }

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var texturing = this._isTexturing(states);
        var cubeMapping = this._isCubeMapping(states);
        var normals = this._hasNormals(states);
        var tangents = this._hasTangents(states);
        var clipping = states.clips.clips.length > 0;

        var src = ["\n"];

        src.push("precision mediump float;");


        if (clipping) {
            src.push("varying vec4 XEO_vWorldVertex;");             // World-space vertex
        }

        //  if (fragmentHooks.viewPos) {
        src.push("varying vec4 XEO_vViewVertex;");              // View-space vertex
        //  }

        src.push("uniform float XEO_uZNear;");                      // Used in Z-pick mode
        src.push("uniform float XEO_uZFar;");                       // Used in Z-pick mode


        /*-----------------------------------------------------------------------------------
         * Variables
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < states.clips.clips.length; i++) {
                src.push("uniform float XEO_uClipMode" + i + ";");
                src.push("uniform vec4  XEO_uClipNormalAndDist" + i + ";");
            }
        }

        if (texturing) {
            if (states.geometry.uvBuf) {
                src.push("varying vec2 XEO_vUVCoord;");
            }
            if (states.geometry.uvBuf2) {
                src.push("varying vec2 XEO_vUVCoord2;");
            }
            var layer;
            for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                layer = states.texture.layers[i];
                src.push("uniform sampler2D XEO_uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 XEO_uLayer" + i + "Matrix;");
                }
                src.push("uniform float XEO_uLayer" + i + "BlendFactor;");
            }
        }

        if (normals && cubeMapping) {
            var layer;
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                src.push("uniform samplerCube XEO_uCubeMapSampler" + i + ";");
                src.push("uniform float XEO_uCubeMapIntensity" + i + ";");
            }
        }

        /* True when lighting
         */
        src.push("uniform bool  XEO_uBackfaceTexturing;");
        src.push("uniform bool  XEO_uBackfaceLighting;");
        src.push("uniform bool  XEO_uSpecularLighting;");
        src.push("uniform bool  XEO_uClipping;");
        src.push("uniform bool  XEO_uAmbient;");
        src.push("uniform bool  XEO_uDiffuse;");
        src.push("uniform bool  XEO_uReflection;");

        // Added in v4.0 to support depth targets
        src.push("uniform bool  XEO_uDepthMode;");

        /* True when rendering transparency
         */
        src.push("uniform bool  XEO_uTransparent;");

        /* Vertex color variable
         */
        if (states.geometry.colorBuf) {
            src.push("varying vec4 XEO_vColor;");
        }

        src.push("uniform vec3  XEO_uAmbientColor;");                         // Scene ambient colour - taken from clear colour

        src.push("uniform vec3  XEO_uMaterialColor;");
        src.push("uniform float XEO_uMaterialAlpha;");
        src.push("uniform float XEO_uMaterialEmit;");
        src.push("uniform vec3  XEO_uMaterialSpecularColor;");
        src.push("uniform float XEO_uMaterialSpecular;");
        src.push("uniform float XEO_uMaterialShine;");

        src.push("varying vec3 XEO_vViewEyeVec;");                          // Direction of world-space vertex from eye

        if (normals) {

            src.push("varying vec3 XEO_vViewNormal;");                   // View-space normal

            var light;
            for (var i = 0; i < states.lights.lights.length; i++) {
                light = states.lights.lights[i];
                if (light.mode == "ambient") {
                    continue;
                }
                src.push("uniform vec3  XEO_uLightColor" + i + ";");
                if (light.mode == "point") {
                    src.push("uniform vec3  XEO_uLightAttenuation" + i + ";");
                }
                src.push("varying vec4  XEO_vViewLightVecAndDist" + i + ";");         // Vector from light to vertex
            }
        }

        if (customFragmentShader.code) {
            src.push("\n" + customFragmentShader.code + "\n");
        }

        src.push("void main(void) {");

        // World-space arbitrary clipping planes

        if (clipping) {
            src.push("if (XEO_uClipping) {");
            src.push("  float   dist;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                src.push("    if (XEO_uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(XEO_vWorldVertex.xyz, XEO_uClipNormalAndDist" + i + ".xyz) - XEO_uClipNormalAndDist" + i + ".w;");
                src.push("        if (XEO_uClipMode" + i + " == 1.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("        if (XEO_uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
            src.push("}");
        }

        src.push("  vec3 ambient= XEO_uAmbient ? XEO_uAmbientColor : vec3(0.0, 0.0, 0.0);");

        if (texturing && states.geometry.uvBuf && fragmentHooks.texturePos) {
            src.push(fragmentHooks.texturePos + "(XEO_vUVCoord);");
        }

        if (fragmentHooks.viewPos) {
            src.push(fragmentHooks.viewPos + "(XEO_vViewVertex);");
        }

        if (normals && fragmentHooks.viewNormal) {
            src.push(fragmentHooks.viewNormal + "(XEO_vViewNormal);");
        }

        if (states.geometry.colorBuf) {
            src.push("  vec3    color   = XEO_vColor.rgb;");
        } else {
            src.push("  vec3    color   = XEO_uMaterialColor;")
        }

        src.push("  float alpha         = XEO_uMaterialAlpha;");
        src.push("  float emit          = XEO_uMaterialEmit;");
        src.push("  float specular      = XEO_uMaterialSpecular;");
        src.push("  vec3  specularColor = XEO_uMaterialSpecularColor;");
        src.push("  float shininess         = XEO_uMaterialShine;");

        if (fragmentHooks.materialBaseColor) {
            src.push("color=" + fragmentHooks.materialBaseColor + "(color);");
        }
        if (fragmentHooks.materialAlpha) {
            src.push("alpha=" + fragmentHooks.materialAlpha + "(alpha);");
        }
        if (fragmentHooks.materialEmit) {
            src.push("emit=" + fragmentHooks.materialEmit + "(emit);");
        }
        if (fragmentHooks.materialSpecular) {
            src.push("specular=" + fragmentHooks.materialSpecular + "(specular);");
        }
        if (fragmentHooks.materialSpecularColor) {
            src.push("specularColor=" + fragmentHooks.materialSpecularColor + "(specularColor);");
        }
        if (fragmentHooks.materialShine) {
            src.push("shininess=" + fragmentHooks.materialShine + "(shininess);");
        }

        if (normals) {
            src.push("  float   attenuation = 1.0;");
            if (tangents) {
                src.push("  vec3    viewNormalVec = vec3(0.0, 1.0, 0.0);");
            } else {

                // Normalize the interpolated normals in the per-fragment-fragment-shader,
                // because if we linear interpolated two nonparallel normalized vectors, the resulting vector won’t be of length 1
                src.push("  vec3    viewNormalVec = normalize(XEO_vViewNormal);");
            }
        }

        var layer;
        if (texturing) {

            if (normals) {
                src.push("if (XEO_uBackfaceTexturing || dot(XEO_vViewNormal, XEO_vViewEyeVec) > 0.0) {");
            }

            src.push("  vec4    texturePos;");
            src.push("  vec2    textureCoord=vec2(0.0,0.0);");

            for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                layer = states.texture.layers[i];

                /* Texture input
                 */
                if (layer.applyFrom == "normal" && normals) {
                    if (states.geometry.normalBuf) {
                        src.push("texturePos=vec4(viewNormalVec.xyz, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv") {
                    if (states.geometry.uvBuf) {
                        src.push("texturePos = vec4(XEO_vUVCoord.s, XEO_vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (states.geometry.uvBuf2) {
                        src.push("texturePos = vec4(XEO_vUVCoord2.s, XEO_vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                        continue;
                    }
                }

                /* Texture matrix
                 */
                if (layer.matrix) {
                    src.push("textureCoord=(XEO_uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Alpha from Texture
                 */
                if (layer.applyTo == "alpha") {
                    if (layer.blendMode == "multiply") {
                        src.push("alpha = alpha * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    } else if (layer.blendMode == "add") {
                        src.push("alpha = ((1.0 - XEO_uLayer" + i + "BlendFactor) * alpha) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    }
                }

                /* Texture output
                 */
                if (layer.applyTo == "baseColor") {
                    if (layer.blendMode == "multiply") {
                        src.push("color = color * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    } else {
                        src.push("color = ((1.0 - XEO_uLayer" + i + "BlendFactor) * color) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    }
                }

                if (layer.applyTo == "emit") {
                    if (layer.blendMode == "multiply") {
                        src.push("emit  = emit * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("emit = ((1.0 - XEO_uLayer" + i + "BlendFactor) * emit) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "specular" && normals) {
                    if (layer.blendMode == "multiply") {
                        src.push("specular  = specular * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("specular = ((1.0 - XEO_uLayer" + i + "BlendFactor) * specular) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "shininess") {
                    if (layer.blendMode == "multiply") {
                        src.push("shininess  = shininess * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("shininess = ((1.0 - XEO_uLayer" + i + "BlendFactor) * shininess) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "normals" && normals) {
                    src.push("viewNormalVec = normalize(texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, -textureCoord.y)).xyz * 2.0 - 1.0);");
                }

            }
            if (normals) {
                src.push("}");
            }
        }

        if (normals && cubeMapping) {
            src.push("if (XEO_uReflection) {"); // Flag which can enable/disable reflection
            src.push("vec3 envLookup = reflect(XEO_vViewEyeVec, viewNormalVec);");
            src.push("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
            src.push("vec4 envColor;");
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                src.push("envColor = textureCube(XEO_uCubeMapSampler" + i + ", envLookup);");
                src.push("color = mix(color, envColor.rgb, specular * XEO_uCubeMapIntensity" + i + ");");
            }
            src.push("}");
        }

        src.push("  vec4    fragColor;");

        if (normals) {

            src.push("if (XEO_uBackfaceLighting || dot(viewNormalVec, XEO_vViewEyeVec) > 0.0) {");

            src.push("  vec3    lightValue      = vec3(0.0, 0.0, 0.0);");
            src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");
            src.push("  vec3    viewLightVec;");
            src.push("  float   dotN;");
            src.push("  float   lightDist;");

            var light;

            for (var i = 0, len = states.lights.lights.length; i < len; i++) {
                light = states.lights.lights[i];

                if (light.mode == "ambient") {
                    continue;
                }

                src.push("viewLightVec = XEO_vViewLightVecAndDist" + i + ".xyz;");

                if (light.mode == "point") {

                    src.push("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                    //src.push("if (dotN > 0.0) {");

                    src.push("lightDist = XEO_vViewLightVecAndDist" + i + ".w;");

                    src.push("attenuation = 1.0 - (" +
                        "  XEO_uLightAttenuation" + i + "[0] + " +
                        "  XEO_uLightAttenuation" + i + "[1] * lightDist + " +
                        "  XEO_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                    if (light.diffuse) {
                        src.push("if (XEO_uDiffuse) {");
                        src.push("      lightValue += dotN * XEO_uLightColor" + i + " * attenuation;");
                        src.push("}");
                    }

                    if (light.specular) {
                        src.push("if (XEO_uSpecularLighting) {");
                        src.push("    specularValue += specularColor * XEO_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewVertex.xyz)), 0.0), shininess) * attenuation;");
                        src.push("}");
                    }
                }

                if (light.mode == "dir") {

                    src.push("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                    if (light.diffuse) {
                        src.push("if (XEO_uDiffuse) {");
                        src.push("      lightValue += dotN * XEO_uLightColor" + i + ";");
                        src.push("}");
                    }

                    if (light.specular) {
                        src.push("if (XEO_uSpecularLighting) {");
                        src.push("    specularValue += specularColor * XEO_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewVertex.xyz)), 0.0), shininess);");
                        src.push("}");
                    }
                }
            }

            src.push("      fragColor = vec4((specularValue.rgb + color.rgb * (lightValue.rgb + ambient.rgb)) + (emit * color.rgb), alpha);");
            src.push("   } else {");
            src.push("      fragColor = vec4((color.rgb + (emit * color.rgb)) *  (vec3(1.0, 1.0, 1.0) + ambient.rgb), alpha);");
            src.push("   }");

        } else { // No normals
            src.push("fragColor = vec4((color.rgb + (emit * color.rgb)) *  (vec3(1.0, 1.0, 1.0) + ambient.rgb), alpha);");
        }

        if (fragmentHooks.pixelColor) {
            src.push("fragColor=" + fragmentHooks.pixelColor + "(fragColor);");
        }
        if (false && debugCfg.whitewash === true) {
            src.push("    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        } else {
            src.push("    if (XEO_uDepthMode) {");
            src.push("          float depth = length(XEO_vViewVertex) / (XEO_uZFar - XEO_uZNear);");
            src.push("          const vec4 bias = vec4(1.0 / 255.0,");
            src.push("          1.0 / 255.0,");
            src.push("          1.0 / 255.0,");
            src.push("          0.0);");
            src.push("          float r = depth;");
            src.push("          float g = fract(r * 255.0);");
            src.push("          float b = fract(g * 255.0);");
            src.push("          float a = fract(b * 255.0);");
            src.push("          vec4 colour = vec4(r, g, b, a);");
            src.push("          gl_FragColor = colour - (colour.yzww * bias);");
            src.push("    } else {");
            src.push("          gl_FragColor = fragColor;");
            src.push("    };");
        }
        src.push("}");

        return src.join("\n");
    };

})();