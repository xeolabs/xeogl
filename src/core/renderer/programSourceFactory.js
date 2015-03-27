(function () {

    "use strict";

    /**
     * @class Manages creation, sharing and recycle of {@link XEO.renderer.ProgramSource} instances
     */
    XEO.renderer.ProgramSourceFactory = new (function () {

        var cache = {}; // Caches source code against hashes

        var src = ""; // Accumulates source code as it's being built

        var states; // Cache rendering state
        var texturing; // True when rendering state contains textures
        var normals; // True when rendering state contains normals
        var tangents; // True when rendering state contains tangents
        var clipping; // True when rendering state contains clip planes
        var morphing; // True when rendering state contains morph targets
        var reflection; // True when rendering state contains reflections
        var depthTarget; // True when rendering state contains a depth target

        /**
         * Get source code for a program to render the given states.
         * Attempts to reuse cached source code for the given hash.
         */
        this.getSource = function (hash, _states) {

            var source = cache[hash];

            if (source) {
                source.useCount++;
                return source;
            }

            states = _states;
            texturing = isTexturing();
            normals = hasNormals();
            tangents = hasTangents();
            clipping = states.clips.clips.length > 0;
            morphing = !!states.MorphTargets.targets;
            reflection = hasReflection();
            depthTarget = hasDepthTarget();

            source = new XEO.renderer.ProgramSource(
                hash,
                composePickingVertexShader(),
                composePickingFragmentShader(),
                composeRenderingVertexShader(),
                composeRenderingFragmentShader()
            );

            cache[hash] = source;

            return source;
        };

        function isTexturing() {
            if (states.texture.layers && states.texture.layers.length > 0) {
                if (states.geometry.uvBuf || states.geometry.uvBuf2) {
                    return true;
                }
                if (states.MorphTargets.targets && (states.MorphTargets.targets[0].uvBuf || states.MorphTargets.targets[0].uvBuf2)) {
                    return true;
                }
            }
            return false;
        }

        function hasReflection(states) {
            return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
        }

        function hasNormals() {
            if (states.geometry.normalBuf) {
                return true;
            }
            if (states.MorphTargets.targets && states.MorphTargets.targets[0].normalBuf) {
                return true;
            }
            return false;
        }

        function hasTangents() {
            if (states.texture) {
                var layers = states.texture.layers;
                if (!layers) {
                    return false;
                }
                for (var i = 0, len = layers.length; i < len; i++) {
                    if (layers[i].applyTo === "normals") {
                        return true;
                    }
                }
            }
            return false;
        }

        function hasDepthTarget() {
            if (states.renderTarget && states.renderTarget.targets) {
                var targets = states.renderTarget.targets;
                for (var i = 0, len = targets.length; i < len; i++) {
                    if (targets[i].bufType === "depth") {
                        return true;
                    }
                }
            }
            return false;
        }

        function begin() {
            src = "";
        }

        function add(txt) {
            src.push(txt);
        }

        function end() {
            return src.join("\n");
        }

        /**
         * Releases program source code
         */
        this.putSource = function (hash) {
            var source = cache[hash];
            if (source) {
                if (--source.useCount === 0) {
                    cache[source.hash] = null;
                }
            }
        };

        function composePickingVertexShader() {

            begin();

            add("precision mediump float;");

            add("attribute vec3 XEO_aPosition;");

            add("uniform mat4 XEO_uMMatrix;");
            add("uniform mat4 XEO_uVMatrix;");
            add("uniform mat4 XEO_uVNMatrix;");
            add("uniform mat4 XEO_uPMatrix;");

            add("varying vec4 XEO_vWorldVertex;");
            add("varying vec4 XEO_vViewVertex;");

            if (morphing) {
                add("uniform float XEO_uMorphFactor;");       // LERP factor for morph
                if (states.MorphTargets.targets[0].vertexBuf) {      // target2 has these arrays also
                    add("attribute vec3 XEO_aMorphVertex;");
                }
            }

            add("void main(void) {");

            add("vec4 tmpVertex=vec4(XEO_aPosition, 1.0); ");
            if (morphing) {
                if (states.MorphTargets.targets[0].vertexBuf) {
                    add("  tmpVertex = vec4(mix(tmpVertex.xyz, XEO_aMorphVertex, XEO_uMorphFactor), 1.0); ");
                }
            }

            add("XEO_vWorldVertex = XEO_uMMatrix * tmpVertex; ");
            add("XEO_vViewVertex = XEO_uVMatrix * XEO_vWorldVertex;");

            add("gl_Position = XEO_uPMatrix * XEO_vViewVertex;");
            add("}");

            return end();
        }


        function composePickingFragmentShader() {

            begin();

            add("precision mediump float;");

            // varyings

            add("varying vec4 XEO_vWorldVertex;");
            add("varying vec4  XEO_vViewVertex;");                  // View-space vertex

            // uniforms

            add("uniform bool  XEO_uRayPickMode;");                   // Z-pick mode when true else colour-pick
            add("uniform vec3  XEO_uPickColor;");                   // Used in colour-pick mode
            add("uniform float XEO_uZNear;");                      // Used in Z-pick mode
            add("uniform float XEO_uZFar;");                       // Used in Z-pick mode
            add("uniform bool  XEO_uClipping;");

            // Clipping uniforms

            if (clipping) {
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float XEO_uClipMode" + i + ";");
                    add("uniform vec4  XEO_uClipNormalAndDist" + i + ";");
                }
            }

            // Pack depth function for ray-pick

            add("vec4 packDepth(const in float depth) {");
            add("  const vec4 bitShift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);");
            add("  const vec4 bitMask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);");
            add("  vec4 res = fract(depth * bitShift);");
            add("  res -= res.xxyz * bitMask;");
            add("  return res;");
            add("}");

            // main

            add("void main(void) {");

            // Clipping logic

            if (clipping) {
                add("if (SCENEJS_uClipping) {");
                add("float dist = 0.0;");
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("if (XEO_uClipMode" + i + " != 0.0) {");
                    add("dist += clamp(dot(XEO_vWorldVertex.xyz, XEO_uClipNormalAndDist" + i + ".xyz) - XEO_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");
                add("}");
            }

            // Output a color

            add("if (XEO_uRayPickMode) {");

            // Output color-encoded depth value for ray-pick

            add("float zNormalizedDepth = abs((XEO_uZNear + XEO_vViewVertex.z) / (XEO_uZFar - XEO_uZNear));");
            add("gl_FragColor = packDepth(zNormalizedDepth); ");
            add("} else {");

            // Output indexed color value for normal pick

            add("gl_FragColor = vec4(XEO_uPickColor.rgb, 1.0);  ");
            add("}");

            add("}");

            return end();
        }


        function composeRenderingVertexShader() {

            var customShaders = states.shader.shaders || {};
            if (customShaders.vertex && customShaders.vertex.code && customShaders.vertex.code !== "") {
                return customShaders.vertex.code;
            }

            begin();

            // uniforms

            add("uniform mat4 XEO_uMMatrix;");             // Model matrix
            add("uniform mat4 XEO_uVMatrix;");             // View matrix
            add("uniform mat4 XEO_uPMatrix;");             // Projection matrix
            add("uniform vec3 XEO_uWorldEye;");            // World-space eye position

            // attributes

            add("attribute vec3 XEO_aPosition;");            // Model coordinates

            // varyings

            add("varying vec3 XEO_vViewEyeVec;");          // View-space vector from origin to eye

            if (normals) {

                add("attribute vec3 XEO_aNormal;");        // Normal vectors
                add("uniform   mat4 XEO_uMNMatrix;");      // Model normal matrix
                add("uniform   mat4 XEO_uVNMatrix;");      // View normal matrix

                add("varying   vec3 XEO_vViewNormal;");    // Output view-space vertex normal

                if (tangents) {
                    add("attribute vec4 XEO_aTangent;");
                }

                for (var i = 0; i < states.lights.lights.length; i++) {

                    var light = states.lights.lights[i];

                    if (light.mode === "ambient") {
                        continue;
                    }

                    if (light.mode === "dir") {
                        add("uniform vec3 XEO_uLightDir" + i + ";");
                    }

                    if (light.mode === "point") {
                        add("uniform vec3 XEO_uLightPos" + i + ";");
                    }

                    if (light.mode === "spot") {
                        add("uniform vec3 XEO_uLightPos" + i + ";");
                    }

                    // Vector from vertex to light, packaged with the pre-computed length of that vector
                    add("varying vec4 XEO_vViewLightVecAndDist" + i + ";");
                }
            }

            if (texturing) {

                if (states.geometry.uvBuf) {
                    add("attribute vec2 XEO_aUV;");      // UV coords
                }

                if (states.geometry.uvBuf2) {
                    add("attribute vec2 XEO_aUV2;");     // UV2 coords
                }
            }

            if (states.geometry.colorBuf) {
                add("attribute vec4 XEO_aVertexColor;");       // UV2 coords
                add("varying vec4 XEO_vColor;");               // Varying for fragment texturing
            }

            if (clipping) {
                add("varying vec4 XEO_vWorldVertex;");         // Varying for fragment clip or world pos hook
            }

            add("varying vec4 XEO_vViewVertex;");              // Varying for fragment view clip hook

            if (texturing) {                                            // Varyings for fragment texturing

                if (states.geometry.uvBuf) {
                    add("varying vec2 XEO_vUVCoord;");
                }

                if (states.geometry.uvBuf2) {
                    add("varying vec2 XEO_vUVCoord2;");
                }
            }

            if (morphing) {
                add("uniform float XEO_uMorphFactor;");// LERP factor for morph
                if (states.MorphTargets.targets[0].vertexBuf) {  // target2 has these arrays also
                    add("attribute vec3 XEO_aMorphVertex;");
                }
                if (normals) {
                    if (states.MorphTargets.targets[0].normalBuf) {
                        add("attribute vec3 XEO_aMorphNormal;");
                    }
                }
            }

            add("void main(void) {");

            add("vec4 tmpVertex=vec4(XEO_aPosition, 1.0); ");
            add("vec4 modelVertex = tmpVertex; ");

            if (normals) {
                add("vec4 modelNormal = vec4(XEO_aNormal, 0.0); ");
            }

            if (morphing) {
                if (states.MorphTargets.targets[0].vertexBuf) {
                    add("vec4 vMorphVertex = vec4(XEO_aMorphVertex, 1.0); ");
                    add("modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, XEO_uMorphFactor), 1.0); ");
                }
                if (normals) {
                    if (states.MorphTargets.targets[0].normalBuf) {
                        add("vec4 vMorphNormal = vec4(XEO_aMorphNormal, 1.0); ");
                        add("modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, XEO_uMorphFactor), 1.0); ");
                    }
                }
            }

            add("vec4 worldVertex = XEO_uMMatrix * modelVertex;");
            add("vec4 viewVertex  = XEO_uVMatrix * worldVertex; ");

            if (normals) {
                add("vec3 worldNormal = (XEO_uMNMatrix * modelNormal).xyz; ");
                add("XEO_vViewNormal = (XEO_uVNMatrix * vec4(worldNormal, 1.0)).xyz;");
            }

            if (clipping) {
                add("  XEO_vWorldVertex = worldVertex;");
            }

            add("XEO_vViewVertex = viewVertex;");

            add("gl_Position = XEO_uPMatrix * viewVertex;");

            if (tangents) {

                // Compute tangent-bitangent-normal matrix

                add("vec3 tangent = normalize((XEO_uVNMatrix * XEO_uMNMatrix * XEO_aTangent).xyz);");
                add("vec3 bitangent = cross(XEO_vViewNormal, tangent);");
                add("mat3 TBM = mat3(tangent, bitangent, XEO_vViewNormal);");
            }

            add("  vec3 tmpVec3;");

            if (normals) {

                for (var i = 0; i < states.lights.lights.length; i++) {

                    light = states.lights.lights[i];

                    if (light.mode === "ambient") {
                        continue;
                    }

                    if (light.mode === "dir") {

                        // Directional light

                        if (light.space === "world") {

                            // World space light

                            add("tmpVec3 = normalize(XEO_uLightDir" + i + ");");

                            // Transform to View space
                            add("tmpVec3 = vec3(XEO_uVMatrix * vec4(tmpVec3, 0.0)).xyz;");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space light

                            add("tmpVec3 = normalize(XEO_uLightDir" + i + ");");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }
                        }

                        // Output
                        add("XEO_vViewLightVecAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                    }

                    if (light.mode === "point") {

                        // Positional light

                        if (light.space === "world") {

                            // World space

                            add("tmpVec3 = XEO_uLightPos" + i + " - worldVertex.xyz;"); // Vector from World coordinate to light pos

                            // Transform to View space
                            add("tmpVec3 = vec3(XEO_uVMatrix * vec4(tmpVec3, 0.0)).xyz;");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space

                            add("tmpVec3 = XEO_uLightPos" + i + ".xyz - viewVertex.xyz;"); // Vector from View coordinate to light pos

                            if (tangents) {

                                // Transform to tangent space
                                add("tmpVec3 *= TBM;");
                            }
                        }

                        // Output
                        add("XEO_vViewLightVecAndDist" + i + " = vec4(tmpVec3, length( XEO_uLightPos" + i + " - worldVertex.xyz));");
                    }
                }
            }

            add("XEO_vViewEyeVec = ((XEO_uVMatrix * vec4(XEO_uWorldEye, 0.0)).xyz  - viewVertex.xyz);");

            if (tangents) {

                add("XEO_vViewEyeVec *= TBM;");
            }

            if (texturing) {

                if (states.geometry.uvBuf) {
                    add("XEO_vUVCoord = XEO_aUV;");
                }

                if (states.geometry.uvBuf2) {
                    add("XEO_vUVCoord2 = XEO_aUV2;");
                }
            }

            if (states.geometry.colorBuf) {
                add("XEO_vColor = XEO_aVertexColor;");
            }

            add("}");

            return end();
        }


        function composeRenderingFragmentShader() {

            var customShaders = states.shader.shaders || {};
            if (customShaders.fragment && customShaders.fragment.code && customShaders.fragment.code !== "") {
                return [customShaders.fragment.code];
            }

            begin();

            add("precision mediump float;");

            add("varying vec4 XEO_vViewVertex;");

            add("uniform float XEO_uZNear;");
            add("uniform float XEO_uZFar;");

            if (clipping) {
                add("varying vec4 XEO_vWorldVertex;");
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float XEO_uClipMode" + i + ";");
                    add("uniform vec4  XEO_uClipNormalAndDist" + i + ";");
                }
            }

            if (texturing) {
                if (states.geometry.uvBuf) {
                    add("varying vec2 XEO_vUVCoord;");
                }
                if (states.geometry.uvBuf2) {
                    add("varying vec2 XEO_vUVCoord2;");
                }
                var layer;
                for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                    layer = states.texture.layers[i];
                    add("uniform sampler2D XEO_uSampler" + i + ";");
                    if (layer.matrix) {
                        add("uniform mat4 XEO_uLayer" + i + "Matrix;");
                    }
                    add("uniform float XEO_uLayer" + i + "BlendFactor;");
                }
            }

            if (normals && reflection) {
                var layer;
                for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                    layer = states.cubemap.layers[i];
                    add("uniform samplerCube XEO_uCubeMapSampler" + i + ";");
                    add("uniform float XEO_uCubeMapIntensity" + i + ";");
                }
            }

            add("uniform bool  XEO_uClipping;");

            add("uniform bool  XEO_uDepthMode;");

            if (states.geometry.colorBuf) {
                add("varying vec4 XEO_vColor;");
            }

            add("uniform vec3  XEO_uAmbientColor;");                         // Scene ambient colour - taken from clear colour

            add("uniform vec3  XEO_uMaterialColor;");
            add("uniform float XEO_uMaterialAlpha;");
            add("uniform float XEO_uMaterialEmit;");
            add("uniform vec3  XEO_uMaterialSpecularColor;");
            add("uniform float XEO_uMaterialSpecular;");
            add("uniform float XEO_uMaterialShine;");

            add("varying vec3 XEO_vViewEyeVec;");                          // Direction of world-space vertex from eye

            if (normals) {

                add("varying vec3 XEO_vViewNormal;");                   // View-space normal

                var light;
                for (var i = 0; i < states.lights.lights.length; i++) {
                    light = states.lights.lights[i];
                    if (light.mode === "ambient") {
                        continue;
                    }
                    add("uniform vec3 XEO_uLightColor" + i + ";");
                    if (light.mode === "point") {
                        add("uniform vec3 XEO_uLightAttenuation" + i + ";");
                    }
                    add("varying vec4 XEO_vViewLightVecAndDist" + i + ";");         // Vector from light to vertex
                }
            }

            add("void main(void) {");

            if (clipping) {
                add("if (SCENEJS_uClipping) {");
                add("float dist = 0.0;");
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("if (XEO_uClipMode" + i + " != 0.0) {");
                    add("dist += clamp(dot(XEO_vWorldVertex.xyz, XEO_uClipNormalAndDist" + i + ".xyz) - XEO_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");
                add("}");
            }

            add("vec3 ambient = XEO_uAmbient ? XEO_uAmbientColor : vec3(0.0, 0.0, 0.0);");

            if (states.geometry.colorBuf) {
                add("vec3 color = XEO_vColor.rgb;");
            } else {
                add("vec3 color = XEO_uMaterialColor;")
            }

            add("float alpha = XEO_uMaterialAlpha;");
            add("float emit = XEO_uMaterialEmit;");
            add("float specular = XEO_uMaterialSpecular;");
            add("vec3  specularColor = XEO_uMaterialSpecularColor;");
            add("float shininess  = XEO_uMaterialShine;");

            if (normals) {
                add("float attenuation = 1.0;");
                if (tangents) {
                    add("vec3 viewNormalVec = vec3(0.0, 1.0, 0.0);");
                } else {

                    // Normalize the interpolated normals in the per-fragment-fragment-shader,
                    // because if we linear interpolated two nonparallel normalized vectors, the resulting vector won’t be of length 1
                    add("vec3 viewNormalVec = normalize(XEO_vViewNormal);");
                }
            }

            if (texturing) {

                add("  vec4    texturePos;");
                add("  vec2    textureCoord=vec2(0.0,0.0);");

                for (var i = 0, len = states.texture.layers.length; i < len; i++) {

                    var layer = states.texture.layers[i];

                    if (normals && layer.applyFrom === "normal" && states.geometry.normalBuf) {
                        add("texturePos=vec4(viewNormalVec.xyz, 1.0);");
                    }
                    if (layer.applyFrom === "uv" && states.geometry.uvBuf) {
                        add("texturePos = vec4(XEO_vUVCoord.s, XEO_vUVCoord.t, 1.0, 1.0);");
                    }
                    if (layer.applyFrom === "uv2" && states.geometry.uvBuf2) {
                        add("texturePos = vec4(XEO_vUVCoord2.s, XEO_vUVCoord2.t, 1.0, 1.0);");
                    }

                    if (layer.matrix) {
                        add("textureCoord=(XEO_uLayer" + i + "Matrix * texturePos).xy;");
                    } else {
                        add("textureCoord=texturePos.xy;");
                    }

                    if (layer.applyTo === "alpha") {
                        if (layer.blendMode === "multiply") {
                            add("alpha = alpha * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        } else if (layer.blendMode === "add") {
                            add("alpha = ((1.0 - XEO_uLayer" + i + "BlendFactor) * alpha) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        }
                    }

                    if (layer.applyTo === "baseColor") {
                        if (layer.blendMode === "multiply") {
                            add("color = color * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        } else {
                            add("color = ((1.0 - XEO_uLayer" + i + "BlendFactor) * color) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        }
                    }

                    if (layer.applyTo === "emit") {
                        if (layer.blendMode === "multiply") {
                            add("emit  = emit * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("emit = ((1.0 - XEO_uLayer" + i + "BlendFactor) * emit) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo === "specular" && normals) {
                        if (layer.blendMode === "multiply") {
                            add("specular  = specular * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("specular = ((1.0 - XEO_uLayer" + i + "BlendFactor) * specular) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo === "shininess") {
                        if (layer.blendMode === "multiply") {
                            add("shininess  = shininess * (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("shininess = ((1.0 - XEO_uLayer" + i + "BlendFactor) * shininess) + (XEO_uLayer" + i + "BlendFactor * texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo === "normals" && normals) {
                        add("viewNormalVec = normalize(texture2D(XEO_uSampler" + i + ", vec2(textureCoord.x, -textureCoord.y)).xyz * 2.0 - 1.0);");
                    }
                }
            }

            if (normals && reflection) {
                add("vec3 envLookup = reflect(XEO_vViewEyeVec, viewNormalVec);");
                add("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
                add("vec4 envColor;");
                for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                    layer = states.cubemap.layers[i];
                    add("envColor = textureCube(XEO_uCubeMapSampler" + i + ", envLookup);");
                    add("color = mix(color, envColor.rgb, specular * XEO_uCubeMapIntensity" + i + ");");
                }
            }

            add("vec4 fragColor;");

            if (normals) {

                add("vec3  lightValue = vec3(0.0, 0.0, 0.0);");
                add("vec3  specularValue = vec3(0.0, 0.0, 0.0);");
                add("vec3  viewLightVec;");
                add("float dotN;");
                add("float lightDist;");

                var light;

                for (var i = 0, len = states.lights.lights.length; i < len; i++) {
                    light = states.lights.lights[i];

                    if (light.mode === "ambient") {
                        continue;
                    }

                    add("viewLightVec = XEO_vViewLightVecAndDist" + i + ".xyz;");

                    if (light.mode === "point") {

                        add("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                        add("lightDist = XEO_vViewLightVecAndDist" + i + ".w;");

                        add("attenuation = 1.0 - (" +
                            "  XEO_uLightAttenuation" + i + "[0] + " +
                            "  XEO_uLightAttenuation" + i + "[1] * lightDist + " +
                            "  XEO_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                        if (light.diffuse) {
                            add("lightValue += dotN * XEO_uLightColor" + i + " * attenuation;");
                        }

                        if (light.specular) {
                            add("specularValue += specularColor * XEO_uLightColor" + i +
                                " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewVertex.xyz)), 0.0), shininess) * attenuation;");
                        }
                    }

                    if (light.mode === "dir") {

                        add("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                        if (light.diffuse) {
                            add("lightValue += dotN * XEO_uLightColor" + i + ";");
                        }

                        if (light.specular) {
                            add("specularValue += specularColor * XEO_uLightColor" + i +
                                " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewVertex.xyz)), 0.0), shininess);");
                        }
                    }
                }

                add("fragColor = vec4((specularValue.rgb + color.rgb * (lightValue.rgb + ambient.rgb)) + (emit * color.rgb), alpha);");

            } else { // No normals
                add("fragColor = vec4((color.rgb + (emit * color.rgb)) *  (vec3(1.0, 1.0, 1.0) + ambient.rgb), alpha);");
            }

            if (depthTarget) {
                add("if (XEO_uDepthMode) {");
                add("  float depth = length(XEO_vViewVertex) / (XEO_uZFar - XEO_uZNear);");
                add("  const vec4 bias = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);");
                add("  float r = depth;");
                add("  float g = fract(r * 255.0);");
                add("  float b = fract(g * 255.0);");
                add("  float a = fract(b * 255.0);");
                add("  vec4 colour = vec4(r, g, b, a);");
                add("  gl_FragColor = colour - (colour.yzww * bias);");
                add("} else {");
                add("  gl_FragColor = fragColor;");
                add("};");
            }

            add("}");

            return end();
        }

    })();

})();