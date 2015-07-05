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
            //morphing = !!states.morphTargets.targets;
            morphing = false;
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

        // Returns true if texturing

        function isTexturing() {

            if (!states.geometry.uv) {
                return false;
            }

            var material = states.material;

            if (material.type === "phongMaterial") {

                if (material.diffuseMap || material.specularMap || material.emissiveMap || material.opacityMap || material.reflectivityMap) {
                    return true;
                }
            }

            return false;
        }

        // Returns true if rendering reflections
        function hasReflection(states) {
            return false;
            //return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
        }

        // Returns true if normals exist on geometry
        function hasNormals() {

            if (states.geometry.normals) {
                return true;
            }

            //if (states.MorphTargets.targets && states.MorphTargets.targets[0].normalBuf) {
            //    return true;
            //}

            return false;
        }

        // Returns true if geometry has tangents for normal mapping
        function hasTangents() {

            //if (states.texture) {
            //
            //    var layers = states.texture.layers;
            //
            //    if (!layers) {
            //        return false;
            //    }
            //
            //    for (var i = 0, len = layers.length; i < len; i++) {
            //        if (layers[i].applyTo === "normals") {
            //            return true;
            //        }
            //    }
            //}
            //
            return false;
        }

        // Returns true if renderer state set contains a depth target
        function hasDepthTarget() {
            return !!states.depthTarget;
        }

        /**
         * Releases program source code back to this factory.
         */
        this.putSource = function (hash) {
            var source = cache[hash];
            if (source) {
                if (--source.useCount === 0) {
                    cache[source.hash] = null;
                }
            }
        };

        // Returns GLSL for a picking mode vertex shader
        //
        function composePickingVertexShader() {

            begin();

            add("attribute vec3 XEO_aGeometryPosition;");

            add("uniform mat4 XEO_uModelMatrix;");
            add("uniform mat4 XEO_uViewMatrix;");
            add("uniform mat4 XEO_uViewNormalMatrix;");
            add("uniform mat4 XEO_uProjMatrix;");

            add("varying vec4 XEO_vWorldPosition;");
            add("varying vec4 XEO_vViewPosition;");

//            if (morphing) {
//                add("uniform float XEO_uMorphFactor;");       // LERP factor for morph
//                if (states.MorphTargets.targets[0].vertexBuf) {      // target2 has these arrays also
//                    add("attribute vec3 XEO_aMorphVertex;");
//                }
//            }

            add("void main(void) {");

            add("vec4 tmpVertex = vec4(XEO_aGeometryPosition, 1.0); ");

//            if (morphing) {
//                if (states.MorphTargets.targets[0].vertexBuf) {
//                    add("  tmpVertex = vec4(mix(tmpVertex.xyz, XEO_aMorphVertex, XEO_uMorphFactor), 1.0); ");
//                }
//            }

            add("XEO_vWorldPosition = XEO_uModelMatrix * tmpVertex; ");

            add("XEO_vViewPosition = XEO_uViewMatrix * XEO_vWorldPosition;");

            add("gl_Position = XEO_uProjMatrix * XEO_vViewPosition;");

            add("}");

            return end();
        }

        function composePickingFragmentShader() {

            begin();

            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

            add("varying vec4 XEO_vWorldPosition;");
            add("varying vec4 XEO_vViewPosition;");

            add("uniform bool  XEO_uRayPickMode;");
            add("uniform vec3  XEO_uPickColor;");
            add("uniform bool  XEO_uModesClipping;");

            // Clipping

            if (clipping) {
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float XEO_uClipMode" + i + ";");
                    add("uniform vec4  XEO_uClipPlane" + i + ";");
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
                add("if (SCENEJS_uModesClipping) {");
                add("float dist = 0.0;");
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("if (XEO_uClipMode" + i + " != 0.0) {");
                    add("   dist += clamp(dot(XEO_vWorldPosition.xyz, XEO_uClipPlane" + i + ".xyz) - XEO_uClipPlane" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");
                add("}");
            }

            add("if (XEO_uRayPickMode) {");

            // Output color-encoded depth value for ray-pick

            add("   gl_FragColor = packDepth(gl_Position.z); ");

            add("} else {");

            // Output indexed color value for normal pick

            add("   gl_FragColor = vec4(XEO_uPickColor.rgb, 1.0);  ");

            add("}");
            add("}");

            return end();
        }


        function composeRenderingVertexShader() {

            var vertex = states.shader.vertex;
            if (vertex) {
                // Custom vertex shader
                return vertex;
            }

            begin();

            // uniforms

            add("uniform mat4 XEO_uModelMatrix;");
            add("uniform mat4 XEO_uViewMatrix;");
            add("uniform mat4 XEO_uProjMatrix;");

            add("uniform vec3 XEO_uEye;"); // World-space eye position

            // attributes

            add("attribute vec3 XEO_aGeometryPosition;");

            // varyings

            add("varying vec3 XEO_vViewEyeVec;"); // View-space vector from position to eye

            if (normals) {

                add("attribute vec3 XEO_aGeometryNormal;");

                add("uniform mat4 XEO_uModelNormalMatrix;");
                add("uniform mat4 XEO_uViewNormalMatrix;");

                add("varying vec3 XEO_vViewNormal;");  // View-space vertex normal

                if (tangents) {
                    add("attribute vec4 XEO_aGeometryTangent;");
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

            if (clipping) {
                add("varying vec4 XEO_vWorldPosition;");
            }

            add("varying vec4 XEO_vViewPosition;");

            if (texturing) {
                if (states.geometry.uv) {

                    add("attribute vec2 XEO_aGeometryUV;"); // UV coords
                    add("varying vec2 XEO_vUVCoord;");
                }
            }

            if (states.geometry.colorBuf) {

                add("attribute vec4 XEO_aGeometryColor;"); // Vertex colors
                add("varying vec4 XEO_vColor;"); // Varying for fragment texturing
            }

            //if (morphing) {
            //    add("uniform float XEO_uMorphFactor;");// LERP factor for morph
            //    if (states.MorphTargets.targets[0].vertexBuf) {  // target2 has these arrays also
            //        add("attribute vec3 XEO_aMorphVertex;");
            //    }
            //    if (normals) {
            //        if (states.MorphTargets.targets[0].normalBuf) {
            //            add("attribute vec3 XEO_aMorphNormal;");
            //        }
            //    }
            //}

            add("void main(void) {");

            add("vec4 modelVertex=vec4(XEO_aGeometryPosition, 1.0); ");

            if (normals) {
                add("vec4 modelNormal = vec4(XEO_aGeometryNormal, 0.0); ");
            }

            //if (morphing) {
            //    if (states.MorphTargets.targets[0].vertexBuf) {
            //        add("vec4 vMorphVertex = vec4(XEO_aMorphVertex, 1.0); ");
            //        add("modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, XEO_uMorphFactor), 1.0); ");
            //    }
            //    if (normals) {
            //        if (states.MorphTargets.targets[0].normalBuf) {
            //            add("vec4 vMorphNormal = vec4(XEO_aMorphNormal, 1.0); ");
            //            add("modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, XEO_uMorphFactor), 1.0); ");
            //        }
            //    }
            //}

            add("vec4 worldVertex = XEO_uModelMatrix * modelVertex;");

            add("vec4 viewVertex  = XEO_uViewMatrix * worldVertex; ");

            if (normals) {
                add("vec3 worldNormal = (XEO_uModelNormalMatrix * modelNormal).xyz; ");
                add("XEO_vViewNormal = (XEO_uViewNormalMatrix * vec4(worldNormal, 1.0)).xyz;");
            }

            if (clipping) {
                add("  XEO_vWorldPosition = worldVertex;");
            }

            add("XEO_vViewPosition = viewVertex;");

            add("gl_Position = XEO_uProjMatrix * viewVertex;");

            if (tangents) {

                // Compute tangent-bitangent-normal matrix

                add("vec3 tangent = normalize((XEO_uViewNormalMatrix * XEO_uModelNormalMatrix * XEO_aGeometryTangent).xyz);");
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
                            add("tmpVec3 = vec3(XEO_uViewMatrix * vec4(tmpVec3, 0.0)).xyz;");

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
                            add("tmpVec3 = vec3(XEO_uViewMatrix * vec4(tmpVec3, 0.0)).xyz;");

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

            add("XEO_vViewEyeVec = ((XEO_uViewMatrix * vec4(XEO_uEye, 0.0)).xyz  - viewVertex.xyz);");

            if (tangents) {

                add("XEO_vViewEyeVec *= TBM;");
            }

            if (texturing) {

                if (states.geometry.uv) {
                    add("XEO_vUVCoord = XEO_aGeometryUV;");
                }
            }

            if (states.geometry.colorBuf) {
                add("XEO_vColor = XEO_aGeometryColor;");
            }

            add("}");

            return end();
        }


        function composeRenderingFragmentShader() {

            var fragment = states.shader.fragment;
            if (fragment) {
                // Custom fragment shader
                return fragment;
            }

            begin();

            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

            add("varying vec4 XEO_vViewPosition;");

            add("uniform float XEO_uZNear;");
            add("uniform float XEO_uZFar;");

            if (clipping) {

                add("varying vec4 XEO_vWorldPosition;");

                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float XEO_uClipMode" + i + ";");
                    add("uniform vec4  XEO_uClipPlane" + i + ";");
                }
            }

            var flatMaterial = (states.material.type === "flatMaterial");
            var phongMaterial = !flatMaterial && (states.material.type === "phongMaterial");
            var pbrMaterial = !flatMaterial && !phongMaterial && (states.material.type === "pbrMaterial");

            if (phongMaterial) {

                add("uniform vec3 XEO_uMaterialDiffuse;");
                add("uniform vec3 XEO_uMaterialSpecular;");
                add("uniform vec3 XEO_uMaterialEmissive;");
                add("uniform float XEO_uMaterialOpacity;");
                add("uniform float XEO_uMaterialShininess;");
                add("uniform float XEO_uMaterialReflectivity;");

                if (texturing) {

                    if (states.geometry.uv) {
                        add("varying vec2 XEO_vUVCoord;");
                    }

                    if (states.material.diffuseMap) {
                        add("uniform sampler2D XEO_uTextureDiffuse;");
                        if (states.material.diffuseMap.matrix) {
                            add("uniform mat4 XEO_uTextureDiffuseMatrix;");
                        }
                    }

                    if (states.material.specularMap) {
                        add("uniform sampler2D XEO_uTextureSpecular;");
                        if (states.material.specularMap.matrix) {
                            add("uniform mat4 XEO_uTextureSpecularMatrix;");
                        }
                    }

                    if (states.material.emissiveMap) {
                        add("uniform sampler2D XEO_uTextureEmissive;");
                        if (states.material.emissiveMap.matrix) {
                            add("uniform mat4 XEO_uTextureEmissiveMatrix;");
                        }
                    }

                    if (states.material.emissiveMap) {
                        add("uniform sampler2D XEO_uTextureEmissive;");
                        if (states.material.emissiveMap.matrix) {
                            add("uniform mat4 XEO_uTextureEmissiveMatrix;");
                        }
                    }

                    if (states.material.opacityMap) {
                        add("uniform sampler2D XEO_uTextureOpacity;");
                        if (states.material.opacityMap.matrix) {
                            add("uniform mat4 XEO_uTextureOpacityMatrix;");
                        }
                    }

                    if (states.material.reflectivityMap) {
                        add("uniform sampler2D XEO_uTextureReflectivity;");
                        if (states.material.reflectivityMap.matrix) {
                            add("uniform mat4 XEO_uTextureReflectivityMatrix;");
                        }
                    }
                }
            }

            //if (normals && reflection) {
            //    var layer;
            //    for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
            //        layer = states.cubemap.layers[i];
            //        add("uniform samplerCube XEO_uCubeMapSampler" + i + ";");
            //        add("uniform float XEO_uCubeMapIntensity" + i + ";");
            //    }
            //}

            add("uniform bool  XEO_uModesClipping;");

            add("uniform bool  XEO_uDepthMode;");

            if (states.geometry.colorBuf) {
                add("varying vec4 XEO_vColor;");
            }

            add("uniform vec3 XEO_uLightAmbientColor;");                         // Scene ambient colour - taken from clear colour
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

                    add("uniform vec3 XEO_uLightIntensity" + i + ";");

                    if (light.mode === "point") {
                        add("uniform vec3 XEO_uLightConstantAttenuation" + i + ";");
                    }

                    add("varying vec4 XEO_vViewLightVecAndDist" + i + ";");         // Vector from light to vertex
                }
            }


            add("void main(void) {");

            if (clipping) {
                add("if (SCENEJS_uModesClipping) {");
                add("float dist = 0.0;");
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("if (XEO_uClipMode" + i + " != 0.0) {");
                    add("dist += clamp(dot(XEO_vWorldPosition.xyz, XEO_uClipPlane" + i + ".xyz) - XEO_uClipPlane" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");
                add("}");
            }

            add("vec3 ambient = XEO_uAmbient ? XEO_uLightAmbientColor : vec3(0.0, 0.0, 0.0);");


            // ------------------- PhongMaterial Shading

            if (phongMaterial) {

                if (states.geometry.colorBuf) {
                    add("vec3 diffuse = XEO_vColor.rgb;");
                } else {
                    add("vec3 diffuse = XEO_uMaterialDiffuse;")
                }

                add("vec3 specular = XEO_uMaterialSpecular;");
                add("vec3 emissive = XEO_uMaterialEmissive;");
                add("float opacity = XEO_uMaterialOpacity;");
                add("float shininess  = XEO_uMaterialShininess;");
                add("float reflectivity  = XEO_uMaterialReflectivity;");

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

                    add("vec4 texturePos = vec4(XEO_vUVCoord.s, XEO_vUVCoord.t, 1.0, 1.0);");
                    add("vec2 textureCoord = texturePos.xy;");

                    add("textureCoord.y = -textureCoord.y;");

                    var material = states.material;

                    if (material.diffuseMap) {
                        if (material.diffuseMap.matrix) {
                            add("textureCoord = (XEO_uMaterialDiffuseTextureMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }
                        add("diffuse = texture2D(XEO_uMaterialDiffuseTexture, textureCoord).rgb);");
                    }

                    if (material.specularMap) {
                        if (material.specularMap.matrix) {
                            add("textureCoord = (XEO_uSpecularTextureMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }
                        add("specular = texture2D(XEO_uSpecularTexture, textureCoord).rgb;");
                    }

                    if (material.emissiveMap) {
                        if (material.emissiveMap.matrix) {
                            add("textureCoord = (XEO_uEmissiveTextureMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }
                        add("emissive = texture2D(XEO_uEmissiveTexture, textureCoord).rgb;");
                    }

                    if (material.opacityMap) {
                        if (material.opacityMap.matrix) {
                            add("textureCoord = (XEO_uOpacityTextureMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }
                        add("opacity = texture2D(XEO_uOpacityTexture, textureCoord).b;");
                    }

                    if (material.reflectivityMap) {
                        if (material.reflectivityMap.matrix) {
                            add("textureCoord = (XEO_uReflectivityTextureMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }
                        add("reflectivity = texture2D(XEO_uReflectivityTexture, textureCoord).b;");
                    }
                }

                if (normals && reflection) {

                    add("vec3 envLookup = reflect(XEO_vViewEyeVec, viewNormalVec);");
                    add("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
                    add("vec4 envColor;");

                    //for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                    //    layer = states.cubemap.layers[i];
                    //    add("envColor = textureCube(XEO_uCubeMapSampler" + i + ", envLookup);");
                    //    add("color = mix(color, envColor.rgb, specular * XEO_uCubeMapIntensity" + i + ");");
                    //}
                }

                add("vec4 fragColor;");

                if (normals) {

                    add("vec3  diffuseLight = vec3(0.0, 0.0, 0.0);");
                    add("vec3  specularLight = vec3(0.0, 0.0, 0.0);");
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
                                "  XEO_uLightConstantAttenuation" + i + "[0] + " +
                                "  XEO_uLightConstantAttenuation" + i + "[1] * lightDist + " +
                                "  XEO_uLightConstantAttenuation" + i + "[2] * lightDist * lightDist);");

                            add("diffuseLight += dotN * XEO_uLightColor" + i + " * attenuation;");

                            add("specularLight += specular * XEO_uLightIntensity" + i +
                                " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewPosition.xyz)), 0.0), shininess) * attenuation;");
                        }

                        if (light.mode === "dir") {

                            add("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                            add("diffuseLight += dotN * XEO_uLightColor" + i + ";");

                            add("specularLight += specular * XEO_uLightIntensity" + i +
                                " * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-XEO_vViewPosition.xyz)), 0.0), shininess);");
                        }
                    }

                    add("fragColor = vec4((specularLight + diffuse * (diffuseLight + ambient)) + emissive, opacity);");

                } else { // No normals
                    add("fragColor = vec4((diffuse.rgb + (emissive * color.rgb)) * (vec3(1.0, 1.0, 1.0) + ambient.rgb), opacity);");
                }

            } // if (phongMqterial)

            if (depthTarget) {
                add("if (XEO_uDepthMode) {");
                add("  float depth = length(XEO_vViewPosition) / (XEO_uZFar - XEO_uZNear);");
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


        // Start fresh program source
        function begin() {
            src = "";
        }

        // Append to program source
        function add(txt) {
            src.push(txt);
        }

        // Finish building program source
        function end() {
            return src.join("\n");
        }

        function getFSFloatPrecision(gl) {

            if (!gl.getShaderPrecisionFormat) {
                return "mediump";
            }

            if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
                return "highp";
            }

            if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
                return "mediump";
            }

            return "lowp";
        }

    })();

})();