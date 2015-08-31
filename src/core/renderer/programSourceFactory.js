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

            texturing = hasTextures();
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

        function hasTextures() {

            if (!states.geometry.uv) {
                return false;
            }

            var material = states.material;

            return (material.type === "phongMaterial" &&
            (material.diffuseMap ||
            material.specularMap ||
            material.emissiveMap ||
            material.opacityMap ||
            material.reflectivityMap));
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

            add("attribute vec3 xeo_aPosition;");

            add("uniform mat4 xeo_uModelMatrix;");
            add("uniform mat4 xeo_uViewMatrix;");
            add("uniform mat4 xeo_uViewNormalMatrix;");
            add("uniform mat4 xeo_uProjMatrix;");

            add("varying vec4 xeo_vWorldPosition;");
            add("varying vec4 xeo_vViewPosition;");

//            if (morphing) {
//                add("uniform float xeo_uMorphFactor;");       // LERP factor for morph
//                if (states.MorphTargets.targets[0].vertexBuf) {      // target2 has these arrays also
//                    add("attribute vec3 xeo_aMorphVertex;");
//                }
//            }

            add("void main(void) {");

            add("vec4 tmpVertex = vec4(xeo_aPosition, 1.0); ");

//            if (morphing) {
//                if (states.MorphTargets.targets[0].vertexBuf) {
//                    add("  tmpVertex = vec4(mix(tmpVertex.xyz, xeo_aMorphVertex, xeo_uMorphFactor), 1.0); ");
//                }
//            }

            add("xeo_vWorldPosition = xeo_uModelMatrix * tmpVertex; ");

            add("xeo_vViewPosition = xeo_uViewMatrix * xeo_vWorldPosition;");

            add("gl_Position = xeo_uProjMatrix * xeo_vViewPosition;");

            add("}");

            return end();
        }

        function composePickingFragmentShader() {

            begin();

            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

            add("varying vec4 xeo_vWorldPosition;");
            add("varying vec4 xeo_vViewPosition;");

            add("uniform bool  xeo_uRayPickMode;");
            add("uniform vec3  xeo_uPickColor;");

            // Clipping

            if (clipping) {
                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float xeo_uClipMode" + i + ";");
                    add("uniform vec4  xeo_uClipPlane" + i + ";");
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
                    add("if (xeo_uClipMode" + i + " != 0.0) {");
                    add("   dist += clamp(dot(xeo_vWorldPosition.xyz, xeo_uClipPlane" + i + ".xyz) - xeo_uClipPlane" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");
                add("}");
            }

            add("if (xeo_uRayPickMode) {");

            // Output color-encoded depth value for ray-pick

            add("   gl_FragColor = packDepth(gl_Position.z); ");

            add("} else {");

            // Output indexed color value for normal pick

            add("   gl_FragColor = vec4(xeo_uPickColor.rgb, 1.0);  ");

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

            // Matrix uniforms

            add("uniform mat4 xeo_uModelMatrix;");
            add("uniform mat4 xeo_uViewMatrix;");
            add("uniform mat4 xeo_uProjMatrix;");

            // World-space eye position

            add("uniform vec3 xeo_uEye;");

            // Model-space vertex position

            add("attribute vec3 xeo_aPosition;");

            // View-space fragment position

            add("varying vec4 xeo_vViewPosition;");

            // View-space vector from fragment position to eye

            add("varying vec3 xeo_vViewEyeVec;");

            if (normals) {

                // Normals

                add("attribute vec3 xeo_aNormal;");

                // Modelling and View normal transform matrix

                add("uniform mat4 xeo_uModelNormalMatrix;");
                add("uniform mat4 xeo_uViewNormalMatrix;");

                // View-space normal

                add("varying vec3 xeo_vViewNormal;");

                if (tangents) {
                    add("attribute vec4 xeo_aTangent;");
                }

                // Lights

                for (var i = 0; i < states.lights.lights.length; i++) {

                    var light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    // Directional

                    if (light.type === "dir") {
                        add("uniform vec3 xeo_uLightDir" + i + ";");
                    }

                    // Point

                    if (light.type === "point") {
                        add("uniform vec3 xeo_uLightPos" + i + ";");
                    }

                    // Spot

                    if (light.type === "spot") {
                        add("uniform vec3 xeo_uLightPos" + i + ";");
                    }

                    // Vector from vertex to light, packaged with the pre-computed length of that vector
                    add("varying vec4 xeo_vViewLightVecAndDist" + i + ";");
                }
            }

            if (clipping) {

                // World-space fragment position

                add("varying vec4 xeo_vWorldPosition;");
            }

            if (texturing) {

                // Vertex UV coordinate

                add("attribute vec2 xeo_aUV;");

                // Fragment UV coordinate

                add("varying vec2 xeo_vUV;");
            }

            if (states.geometry.colorBuf) {

                // Vertex color

                add("attribute vec4 xeo_aColor;"); // Vertex colors

                // Fragment color

                add("varying vec4 xeo_vColor;"); // Varying for fragment texturing
            }

            //if (morphing) {
            //    add("uniform float xeo_uMorphFactor;");// LERP factor for morph
            //    if (states.MorphTargets.targets[0].vertexBuf) {  // target2 has these arrays also
            //        add("attribute vec3 xeo_aMorphVertex;");
            //    }
            //    if (normals) {
            //        if (states.MorphTargets.targets[0].normalBuf) {
            //            add("attribute vec3 xeo_aMorphNormal;");
            //        }
            //    }
            //}

            add("void main(void) {");

            add("vec4 modelPosition = vec4(xeo_aPosition, 1.0); ");

            if (normals) {
                add("vec4 modelNormal = vec4(xeo_aNormal, 0.0); ");
            }

            //if (morphing) {
            //    if (states.MorphTargets.targets[0].vertexBuf) {
            //        add("vec4 vMorphVertex = vec4(xeo_aMorphVertex, 1.0); ");
            //        add("modelPosition = vec4(mix(modelPosition.xyz, vMorphVertex.xyz, xeo_uMorphFactor), 1.0); ");
            //    }
            //    if (normals) {
            //        if (states.MorphTargets.targets[0].normalBuf) {
            //            add("vec4 vMorphNormal = vec4(xeo_aMorphNormal, 1.0); ");
            //            add("modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, xeo_uMorphFactor), 1.0); ");
            //        }
            //    }
            //}

            add("vec4 worldPosition = xeo_uModelMatrix * modelPosition;");

            add("vec4 viewPosition  = xeo_uViewMatrix * worldPosition; ");

            if (normals) {
                add("vec3 worldNormal = (xeo_uModelNormalMatrix * modelNormal).xyz; ");
                add("xeo_vViewNormal = (xeo_uViewNormalMatrix * vec4(worldNormal, 1.0)).xyz;");
            }

            if (clipping) {
                add("  xeo_vWorldPosition = worldPosition;");
            }

            add("xeo_vViewPosition = viewPosition;");

            if (tangents) {

                // Compute tangent-bitangent-normal matrix

                add("vec3 tangent = normalize((xeo_uViewNormalMatrix * xeo_uModelNormalMatrix * xeo_aTangent).xyz);");
                add("vec3 bitangent = cross(xeo_vViewNormal, tangent);");
                add("mat3 TBM = mat3(tangent, bitangent, xeo_vViewNormal);");
            }

            add("  vec3 tmpVec3;");

            if (normals) {

                for (var i = 0; i < states.lights.lights.length; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {

                        // Directional light

                        if (light.space === "world") {

                            // World space light

                            add("tmpVec3 = normalize(xeo_uLightDir" + i + ");");

                            // Transform to View space
                            add("tmpVec3 = vec3(xeo_uViewMatrix * vec4(tmpVec3, 0.0)).xyz;");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space light

                            add("tmpVec3 = normalize(xeo_uLightDir" + i + ");");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }
                        }

                        // Output
                        add("xeo_vViewLightVecAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                    }

                    if (light.type === "point") {

                        // Positional light

                        if (light.space === "world") {

                            // World space

                            // Transform into View space

                            add("tmpVec3 = xeo_uLightPos" + i + " - worldPosition.xyz;"); // Vector from World coordinate to light pos

                            // Transform to View space
                            add("tmpVec3 = vec3(xeo_uViewMatrix * vec4(tmpVec3, 0.0)).xyz;");

                            if (tangents) {

                                // Transform to Tangent space
                                add("tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space

                            add("tmpVec3 = xeo_uLightPos" + i + ".xyz - viewPosition.xyz;"); // Vector from View coordinate to light pos

                            if (tangents) {

                                // Transform to tangent space
                                add("tmpVec3 *= TBM;");
                            }
                        }

                        // Output
                        add("xeo_vViewLightVecAndDist" + i + " = vec4(tmpVec3, length(xeo_uLightPos" + i + ".xyz - worldPosition.xyz));");
                    }
                }
            }

            add("xeo_vViewEyeVec = ((xeo_uViewMatrix * vec4(xeo_uEye, 0.0)).xyz  - viewPosition.xyz);");

            if (tangents) {

                add("xeo_vViewEyeVec *= TBM;");
            }

            if (texturing) {

                if (states.geometry.uv) {
                    add("xeo_vUV = xeo_aUV;");
                }
            }

            if (states.geometry.colorBuf) {
                add("xeo_vColor = xeo_aColor;");
            }

            add("gl_Position = xeo_uProjMatrix * xeo_vViewPosition;");

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

            add("varying vec4 xeo_vViewPosition;");

            add("uniform float xeo_uZNear;");
            add("uniform float xeo_uZFar;");

            if (clipping) {

                add("varying vec4 xeo_vWorldPosition;");

                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("uniform float xeo_uClipMode" + i + ";");
                    add("uniform vec4  xeo_uClipPlane" + i + ";");
                }
            }

            var flatMaterial = (states.material.type === "flatMaterial");
            var phongMaterial = !flatMaterial && (states.material.type === "phongMaterial");
            var pbrMaterial = !flatMaterial && !phongMaterial && (states.material.type === "pbrMaterial");

            if (phongMaterial) {

                add("uniform vec3 xeo_uDiffuse;");
                add("uniform vec3 xeo_uMaterialSpecular;");
                add("uniform vec3 xeo_uMaterialEmissive;");
                add("uniform float xeo_uMaterialOpacity;");
                add("uniform float xeo_uMaterialShininess;");
                add("uniform float xeo_uMaterialReflectivity;");

                if (texturing) {

                    if (states.geometry.uv) {
                        add("varying vec2 xeo_vUV;");
                    }

                    if (states.material.diffuseMap) {
                        add("uniform sampler2D xeo_uDiffuseMap;");
                        if (states.material.diffuseMap.matrix) {
                            add("uniform mat4 xeo_uDiffuseMapMatrix;");
                        }
                    }

                    if (states.material.specularMap) {
                        add("uniform sampler2D xeo_uSpecularMap;");
                        if (states.material.specularMap.matrix) {
                            add("uniform mat4 xeo_uSpecularMapMatrix;");
                        }
                    }

                    if (states.material.emissiveMap) {
                        add("uniform sampler2D xeo_uEmissiveMap;");
                        if (states.material.emissiveMap.matrix) {
                            add("uniform mat4 xeo_uEmissiveMapMatrix;");
                        }
                    }

                    if (states.material.opacityMap) {
                        add("uniform sampler2D xeo_uTextureOpacity;");
                        if (states.material.opacityMap.matrix) {
                            add("uniform mat4 xeo_uTextureOpacityMatrix;");
                        }
                    }

                    if (states.material.reflectivityMap) {
                        add("uniform sampler2D xeo_uTextureReflectivity;");
                        if (states.material.reflectivityMap.matrix) {
                            add("uniform mat4 xeo_uTextureReflectivityMatrix;");
                        }
                    }
                }
            }

            //if (normals && reflection) {
            //    var layer;
            //    for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
            //        layer = states.cubemap.layers[i];
            //        add("uniform samplerCube xeo_uCubeMapSampler" + i + ";");
            //        add("uniform float xeo_uCubeMapIntensity" + i + ";");
            //    }
            //}


            add("uniform bool xeo_uDepthMode;");

            if (states.geometry.colorBuf) {
                add("varying vec4 xeo_vColor;");
            }

            // Global, ambient colour - taken from clear colour

            add("uniform vec3 xeo_uLightAmbientColor;");

            // World-space vector from fragment to eye

            add("varying vec3 xeo_vViewEyeVec;");

            if (normals) {

                // View-space fragment normal

                add("varying vec3 xeo_vViewNormal;");

                // Light sources

                var light;

                for (var i = 0; i < states.lights.lights.length; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    add("uniform vec3 xeo_uLightColor" + i + ";");

                    add("uniform float xeo_uLightIntensity" + i + ";");

                    if (light.type === "point") {
                        add("uniform vec3 xeo_uLightAttenuation" + i + ";");
                    }

                    add("varying vec4 xeo_vViewLightVecAndDist" + i + ";");         // Vector from light to vertex
                }
            }

            add("void main(void) {");

            if (clipping) {

                // World-space fragment clipping

                add("if (SCENEJS_uModesClipping) {");

                add("float dist = 0.0;");

                for (var i = 0; i < states.clips.clips.length; i++) {
                    add("if (xeo_uClipMode" + i + " != 0.0) {");
                    add("dist += clamp(dot(xeo_vWorldPosition.xyz, xeo_uClipPlane" + i + ".xyz) - xeo_uClipPlane" + i + ".w, 0.0, 1000.0);");
                    add("}");
                }
                add("if (dist > 0.0) { discard; }");

                add("}");
            }

            add("vec3 ambient = xeo_uLightAmbientColor;");


            // ------------------- PhongMaterial Shading

            if (phongMaterial) {

                if (states.geometry.colorBuf) {

                    // Fragment diffuse color from geometry vertex colors

                    add("vec3 diffuse = xeo_vColor.rgb;");

                } else {

                    // Fragment diffuse color from material

                    add("vec3 diffuse = xeo_uDiffuse;")
                }

                // These may be overridden by textures later

                add("vec3 specular = xeo_uMaterialSpecular;");
                add("vec3 emissive = xeo_uMaterialEmissive;");
                add("float opacity = xeo_uMaterialOpacity;");
                add("float shininess  = xeo_uMaterialShininess;");
                add("float reflectivity  = xeo_uMaterialReflectivity;");

                if (normals) {

                    if (tangents) {

                        add("vec3 viewNormalVec = vec3(0.0, 1.0, 0.0);");

                    } else {

                        // Normalize the interpolated normals in the per-fragment-fragment-shader,
                        // because if we linear interpolated two nonparallel normalized vectors, the resulting vector won’t be of length 1

                        add("vec3 viewNormalVec = normalize(xeo_vViewNormal);");
                    }
                }

                if (texturing) {

                    // Textures

                    add("vec4 texturePos = vec4(xeo_vUV.s, xeo_vUV.t, 1.0, 1.0);");
                    add("vec2 textureCoord = texturePos.xy;");

                    add("textureCoord.y = -textureCoord.y;");

                    var material = states.material;

                    if (material.diffuseMap) {

                        // Diffuse map

                        if (material.diffuseMap.matrix) {
                            add("textureCoord = (xeo_uDiffuseMapMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }

                        add("diffuse = texture2D(xeo_uDiffuseMap, textureCoord).rgb;");
                    }

                    if (material.specularMap) {

                        // Specular map

                        if (material.specularMap.matrix) {
                            add("textureCoord = (xeo_uSpecularMapMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }

                        add("specular = texture2D(xeo_uSpecularMap, textureCoord).rgb;");
                    }

                    if (material.emissiveMap) {

                        // Emissive map

                        if (material.emissiveMap.matrix) {
                            add("textureCoord = (xeo_uEmissiveMapMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }

                        add("emissive = texture2D(xeo_uEmissiveMap, textureCoord).rgb;");
                    }

                    if (material.opacityMap) {

                        // Opacity map

                        if (material.opacityMap.matrix) {
                            add("textureCoord = (xeo_uOpacityMapMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }

                        add("opacity = texture2D(xeo_uOpacityMap, textureCoord).b;");
                    }

                    if (material.reflectivityMap) {

                        // Reflectivity map

                        if (material.reflectivityMap.matrix) {
                            add("textureCoord = (xeo_uReflectivityMapMatrix * texturePos).xy;");
                        } else {
                            add("textureCoord = texturePos.xy;");
                        }

                        add("reflectivity = texture2D(xeo_uReflectivityMap, textureCoord).b;");
                    }
                }

                if (normals && reflection) {

                    add("vec3 envLookup = reflect(xeo_vViewEyeVec, viewNormalVec);");
                    add("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
                    add("vec4 envColor;");

                    //for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                    //    layer = states.cubemap.layers[i];
                    //    add("envColor = textureCube(xeo_uCubeMapSampler" + i + ", envLookup);");
                    //    add("color = mix(color, envColor.rgb, specular * xeo_uCubeMapIntensity" + i + ");");
                    //}
                }

                add("vec4 fragColor;");

                if (normals) {

                    add("vec3  diffuseLight = vec3(0.0, 0.0, 0.0);");
                    add("vec3  specularLight = vec3(0.0, 0.0, 0.0);");
                    add("vec3  viewLightVec;");
                    add("float dotN;");
                    add("float lightDist;");
                    add("float attenuation;");

                    var light;

                    for (var i = 0, len = states.lights.lights.length; i < len; i++) {

                        light = states.lights.lights[i];

                        if (light.type === "ambient") {
                            continue;
                        }

                        add("viewLightVec = xeo_vViewLightVecAndDist" + i + ".xyz;");

                        if (light.type === "point") {

                            add("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                            add("lightDist = xeo_vViewLightVecAndDist" + i + ".w;");

                            add("attenuation = 1.0 - (" +
                                "  xeo_uLightAttenuation" + i + "[0] + " +
                                "  xeo_uLightAttenuation" + i + "[1] * lightDist + " +
                                "  xeo_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                            add("diffuseLight += dotN * xeo_uLightColor" + i + " * attenuation;");

                            add("specularLight += specular * xeo_uLightIntensity" + i +
                                " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-xeo_vViewPosition.xyz)), 0.0), shininess) * attenuation;");
                        }

                        if (light.type === "dir") {

                            add("dotN = max(dot(normalize(viewNormalVec), normalize(viewLightVec)), 0.0);");

                            add("diffuseLight += dotN * xeo_uLightColor" + i + ";");

                            add("specularLight += specular * xeo_uLightIntensity" + i +
                                " * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-xeo_vViewPosition.xyz)), 0.0), shininess);");
                        }
                    }

                    add("fragColor = vec4(diffuse * diffuseLight, opacity);");
                    //    add("fragColor = vec4((specularLight + diffuse * (diffuseLight + ambient)) + emissive, opacity);");


                } else { // No normals
                    //add("fragColor = vec4((diffuse.rgb + (emissive * color.rgb)) * (vec3(1.0, 1.0, 1.0) + ambient.rgb), opacity);");
                    add("fragColor = vec4(diffuse.rgb, opacity);");
                }


            } // if (phongMqterial)

            if (depthTarget) {
                add("if (xeo_uDepthMode) {");
                add("  float depth = length(xeo_vViewPosition) / (xeo_uZFar - xeo_uZNear);");
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
            src = [""];
        }

        // Append to program source
        function add(txt) {
            src.push(txt);
        }

        // Finish building program source
        function end() {
            return src;
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