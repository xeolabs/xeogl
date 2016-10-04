(function () {

    "use strict";

    /**
     *  Manages creation, sharing and recycle of {@link XEO.renderer.ProgramSource} instances
     */
    XEO.renderer.ProgramSourceFactory = new (function () {

        var cache = {}; // Caches source code against hashes

        var src = ""; // Accumulates source code as it's being built

        var states; // Cache rendering state
        var texturing; // True when rendering state contains textures
        var normals; // True when rendering state contains normals
        var normalMapping; // True when rendering state contains tangents
        var reflection; // True when rendering state contains reflections
        var diffuseFresnel;
        var specularFresnel;
        var opacityFresnel;
        var reflectivityFresnel;
        var emissiveFresnel;

        var vertexPickObjectSrc;
        var fragmentPickObjectSrc;
        var vertexPickPrimSrc;
        var fragmentPickPrimSrc;

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
            normalMapping = hasNormalMap();
            reflection = hasReflection();
            diffuseFresnel = states.material.diffuseFresnel;
            specularFresnel = states.material.specularFresnel;
            opacityFresnel = states.material.opacityFresnel;
            reflectivityFresnel = states.material.reflectivityFresnel;
            emissiveFresnel = states.material.emissiveFresnel;

            source = new XEO.renderer.ProgramSource(
                hash,
                vertexPickObject(),
                fragmentPickObject(),
                vertexPickPrimitive(),
                fragmentPickPrimitive(),
                vertexDraw(),
                fragmentDraw()
            );

            cache[hash] = source;

            return source;
        };

        function hasTextures() {
            if (!states.geometry.uv) {
                return false;
            }
            var material = states.material;
            return material.ambientMap ||
                material.diffuseMap ||
                material.specularMap ||
                material.emissiveMap ||
                material.opacityMap ||
                material.reflectivityMap ||
                states.material.normalMap;
        }

        function hasReflection() {
            return false;
            //return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
        }

        function hasNormals() {
            var primitive = states.geometry.primitiveName;
            if (states.geometry.normals && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
                return true;
            }
            return false;
        }

        function hasNormalMap() {
            var geometry = states.geometry;
            return (geometry.positions && geometry.indices && geometry.normals && geometry.uv && states.material.normalMap);
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


        // NOTE: Picking shaders will become more complex and will eventually be
        // composed from state, in the same manner as the draw shaders.

        function vertexPickObject() {
            if (vertexPickObjectSrc) {
                return vertexPickObjectSrc;
            }
            begin();
            add("// Object picking vertex shader");
            add("attribute vec3 xeo_aPosition;");
            add("uniform mat4 xeo_uModelMatrix;");
            add("uniform mat4 xeo_uViewMatrix;");
            add("uniform mat4 xeo_uViewNormalMatrix;");
            add("uniform mat4 xeo_uProjMatrix;");
            add("varying vec4 xeo_vWorldPosition;");
            add("varying vec4 xeo_vViewPosition;");
            add("void main(void) {");
            add("   vec4 tmpVertex = vec4(xeo_aPosition, 1.0); ");
            add("   xeo_vWorldPosition = xeo_uModelMatrix * tmpVertex; ");
            add("   xeo_vViewPosition = xeo_uViewMatrix * xeo_vWorldPosition;");
            add("   gl_Position = xeo_uProjMatrix * xeo_vViewPosition;");
            add("}");
            return vertexPickObjectSrc = end();
        }

        function fragmentPickObject() {
            if (fragmentPickObjectSrc) {
                return fragmentPickObjectSrc;
            }
            begin();
            add("// Object picking fragment shader");
            add("precision " + getFSFloatPrecision(states.gl) + " float;");
            add("uniform vec4 xeo_uPickColor;");
            add("void main(void) {");
            add("   gl_FragColor = xeo_uPickColor; ");
            add("}");
            return fragmentPickObjectSrc = end();
        }

        function vertexPickPrimitive() {
            if (vertexPickPrimSrc) {
                return vertexPickPrimSrc;
            }
            begin();
            add("// Triangle picking vertex shader");
            add("attribute vec3 xeo_aPosition;");
            add("attribute vec4 xeo_aColor;");
            add("uniform vec3 xeo_uPickColor;");
            add("uniform mat4 xeo_uModelMatrix;");
            add("uniform mat4 xeo_uViewMatrix;");
            add("uniform mat4 xeo_uProjMatrix;");
            add("varying vec4 xeo_vWorldPosition;");
            add("varying vec4 xeo_vViewPosition;");
            add("varying vec4 xeo_vColor;");
            add("void main(void) {");
            add("   vec4 tmpVertex = vec4(xeo_aPosition, 1.0); ");
            add("   vec4 worldPosition = xeo_uModelMatrix * tmpVertex; ");
            add("   vec4 viewPosition = xeo_uViewMatrix * worldPosition;");
            add("   xeo_vColor = xeo_aColor;");
            add("   gl_Position = xeo_uProjMatrix * viewPosition;");
            add("}");
            return vertexPickPrimSrc = end();
        }

        function fragmentPickPrimitive() {
            if (fragmentPickPrimSrc) {
                return fragmentPickPrimSrc;
            }
            begin();
            add("// Triangle picking fragment shader");
            add("precision " + getFSFloatPrecision(states.gl) + " float;");
            add("varying vec4 xeo_vColor;");
            add("void main(void) {");
            add("   gl_FragColor = xeo_vColor;");
            add("}");
            return fragmentPickPrimSrc = end();
        }

        function vertexDraw() {

            var vertex = states.shader.vertex;

            if (vertex) {

                // Custom vertex shader
                return vertex;
            }

            var i;
            var len;
            var light;

            begin();

            add("// Drawing vertex shader");

            add("uniform mat4 xeo_uModelMatrix;          // Modeling matrix");
            add("uniform mat4 xeo_uViewMatrix;           // Viewing matrix");
            add("uniform mat4 xeo_uProjMatrix;           // Projection matrix");

            add("attribute vec3 xeo_aPosition;           // Local-space vertex position");

            add();

            add("varying vec4 xeo_vViewPosition;         // Output: View-space fragment position");

            if (normals) {

                add();

                add("attribute vec3 xeo_aNormal;             // Local-space vertex normal");

                add("uniform mat4 xeo_uModelNormalMatrix;    // Modeling normal matrix");
                add("uniform mat4 xeo_uViewNormalMatrix;     // Viewing normal matrix");

                add("varying vec3 xeo_vViewEyeVec;           // Output: View-space vector from fragment position to eye");
                add("varying vec3 xeo_vViewNormal;           // Output: View-space normal");

                // Lights
                for (i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {
                        add("uniform vec3 xeo_uLightDir" + i + ";   // Directional light direction");
                    }

                    if (light.type === "point") {
                        add("uniform vec3 xeo_uLightPos" + i + ";   // Positional light position");
                    }

                    if (light.type === "spot") {
                        add("uniform vec3 xeo_uLightPos" + i + ";   // Spot light position");
                    }

                    add("varying vec4 xeo_vViewLightVecAndDist" + i + "; // Output: Vector from vertex to light, packaged with the pre-computed length of that vector");
                }
            }

            if (normalMapping) {
                add("attribute vec3 xeo_aTangent;");
            }

            if (texturing) {

                add();

                // Vertex UV coordinate
                add("attribute vec2 xeo_aUV;");

                // Fragment UV coordinate
                add("varying vec2 xeo_vUV;");
            }

            if (states.geometry.colors) {

                // Vertex color
                add("attribute vec4 xeo_aColor;");

                // Fragment color
                add("varying vec4 xeo_vColor;");
            }

            if (states.geometry.primitiveName === "points") {
                add("uniform float xeo_uPointSize;");
            }

            if (states.billboard.active) {

                add("void billboard(inout mat4 mat) {");
                add("   mat[0][0] = 1.0;");
                add("   mat[0][1] = 0.0;");
                add("   mat[0][2] = 0.0;");
                if (states.billboard.spherical) {
                    add("   mat[1][0] = 0.0;");
                    add("   mat[1][1] = 1.0;");
                    add("   mat[1][2] = 0.0;");
                }
                add("   mat[2][0] = 0.0;");
                add("   mat[2][1] = 0.0;");
                add("   mat[2][2] =1.0;");
                add("}");
            }

            // ------------------- main -------------------------------

            add();
            add("void main(void) {");
            add();
            add("   vec4 localPosition = vec4(xeo_aPosition, 1.0); ");

            if (normals) {

                add("   vec4 localNormal = vec4(xeo_aNormal, 0.0); ");
                add("   mat4 modelNormalMatrix = xeo_uModelNormalMatrix;");
                add("   mat4 viewNormalMatrix = xeo_uViewNormalMatrix;");
            }

            add("   mat4 modelMatrix = xeo_uModelMatrix;");
            add("   mat4 viewMatrix = xeo_uViewMatrix;");
            add("   vec4 worldPosition;");

            if (states.stationary.active) {
                add("   viewMatrix[3][0] = viewMatrix[3][1] = viewMatrix[3][2] = 0.0;")
            }

            if (states.billboard.active) {

                add("   mat4 modelViewMatrix =  xeo_uViewMatrix * xeo_uModelMatrix;");

                add("   billboard(modelMatrix);");
                add("   billboard(viewMatrix);");
                add("   billboard(modelViewMatrix);");

                if (normals) {

                    add("   mat4 modelViewNormalMatrix =  xeo_uViewNormalMatrix * xeo_uModelNormalMatrix;");

                    add("   billboard(modelNormalMatrix);");
                    add("   billboard(viewNormalMatrix);");
                    add("   billboard(modelViewNormalMatrix);");
                }

                add("   worldPosition = modelMatrix * localPosition;");
                add("   vec4 viewPosition = modelViewMatrix * localPosition;");

            } else {

                add("   worldPosition = modelMatrix * localPosition;");
                add("   vec4 viewPosition  = viewMatrix * worldPosition; ");
            }

            if (normals) {

                add("   vec3 worldNormal = (modelNormalMatrix * localNormal).xyz; ");
                add("   xeo_vViewNormal = normalize((viewNormalMatrix * vec4(worldNormal, 1.0)).xyz);");

                if (normalMapping) {

                    // Compute the tangent-bitangent-normal (TBN) matrix

                    add("   vec3 tangent = normalize((xeo_uViewNormalMatrix * xeo_uModelNormalMatrix * vec4(xeo_aTangent, 1.0)).xyz);");
                    add("   vec3 bitangent = cross(xeo_vViewNormal, tangent);");
                    add("   mat3 TBN = mat3(tangent, bitangent, xeo_vViewNormal);");
                }

                add("   vec3 tmpVec3;");
                add("   float lightDist;");

                // Lights

                for (i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {

                        // Directional light

                        if (light.space === "world") {

                            // World space light

                            add("   tmpVec3 = xeo_uLightDir" + i + ";");

                            // Transform to View space
                            add("   tmpVec3 = vec3(viewMatrix * vec4(tmpVec3, 1.0)).xyz;");

                            if (normalMapping) {

                                // Transform to Tangent space
                                add("   tmpVec3 *= TBN;");
                            }

                        } else {

                            // View space light

                            add("   tmpVec3 = xeo_uLightDir" + i + ";");

                            if (normalMapping) {

                                // Transform to Tangent space
                                add("   tmpVec3 *= TBN;");
                            }
                        }

                        // Pipe the light direction and zero distance through to the fragment shader
                        add("   xeo_vViewLightVecAndDist" + i + " = vec4(tmpVec3, 0.0);");
                    }

                    if (light.type === "point") {

                        // Positional light

                        if (light.space === "world") {

                            // World space

                            // Get vertex -> light vector in View space
                            // Transform light pos to View space first
                            add("   tmpVec3 = (viewMatrix * vec4(xeo_uLightPos" + i + ", 1.0)).xyz - viewPosition.xyz;"); // Vector from World coordinate to light pos

                            // Get distance to light
                            add("   lightDist = abs(length(tmpVec3));");

                            if (normalMapping) {

                                // Transform light vector to Tangent space
                                add("   tmpVec3 *= TBN;");
                            }

                        } else {

                            // View space

                            // Get vertex -> light vector in View space
                            add("   tmpVec3 = xeo_uLightPos" + i + ".xyz - viewPosition.xyz;"); // Vector from View coordinate to light pos

                            // Get distance to light
                            add("   lightDist = abs(length(tmpVec3));");

                            if (normalMapping) {

                                // Transform light vector to tangent space
                                add("   tmpVec3 *= TBN;");
                            }
                        }

                        // Pipe the light direction and distance through to the fragment shader
                        add("   xeo_vViewLightVecAndDist" + i + " = vec4(tmpVec3, lightDist);");
                    }
                }

                add("   xeo_vViewEyeVec = -viewPosition.xyz;");

                if (normalMapping) {

                    // Transform vertex->eye vector to tangent space
                    add("   xeo_vViewEyeVec *= TBN;");
                }
            }

            if (texturing) {
                add("   xeo_vUV = xeo_aUV;");
            }

            if (states.geometry.colors) {
                add("   xeo_vColor = xeo_aColor;");
            }

            if (states.geometry.primitiveName === "points") {
                add("   gl_PointSize = xeo_uPointSize;");
            }

            add("   xeo_vViewPosition = viewPosition;");

            add("   gl_Position = xeo_uProjMatrix * viewPosition;");

            add("}");

            return end();
        }


        function fragmentDraw() {

            var fragment = states.shader.fragment;
            if (fragment) {
                // Custom fragment shader
                return fragment;
            }

            var i;
            var len;

            var light;

            begin();

            add("// Drawing fragment shader");

            add("precision " + getFSFloatPrecision(states.gl) + " float;");
            add();

            if (normals) {

                add("varying vec4 xeo_vViewPosition;");

                add();

                add("uniform vec3 xeo_uSpecular;");
                add("uniform float xeo_uShininess;");
                add("uniform float xeo_uReflectivity;");
            }

            if (normalMapping) {
                //    add("varying vec3 xeo_vTangent;");
            }

            add("uniform vec3 xeo_uEmissive;");
            add("uniform float xeo_uOpacity;");
            add("uniform vec3 xeo_uDiffuse;");

            add();

            if (states.geometry.colors) {
                add("varying vec4 xeo_vColor;");
            }

            if (texturing) {

                add();
                comment("Texture variables");
                add();

                if (states.geometry.uv) {
                    add("varying vec2 xeo_vUV;");
                }

                if (states.material.emissiveMap) {
                    add("uniform sampler2D xeo_uEmissiveMap;");
                    if (states.material.emissiveMap.matrix) {
                        add("uniform mat4 xeo_uEmissiveMapMatrix;");
                    }
                }

                if (states.material.opacityMap) {
                    add("uniform sampler2D xeo_uOpacityMap;");
                    if (states.material.opacityMap.matrix) {
                        add("uniform mat4 xeo_uOpacityMapMatrix;");
                    }
                }

                if (states.material.ambientMap) {
                    add("uniform sampler2D xeo_uAmbientMap;");
                    if (states.material.ambientMap.matrix) {
                        add("uniform mat4 xeo_uAmbientMapMatrix;");
                    }
                }

                if (states.material.diffuseMap) {
                    add("uniform sampler2D xeo_uDiffuseMap;");
                    if (states.material.diffuseMap.matrix) {
                        add("uniform mat4 xeo_uDiffuseMapMatrix;");
                    }
                }

                if (normals) {

                    if (states.material.specularMap) {
                        add("uniform sampler2D xeo_uSpecularMap;");
                        if (states.material.specularMap.matrix) {
                            add("uniform mat4 xeo_uSpecularMapMatrix;");
                        }
                    }

                    if (states.material.reflectivityMap) {
                        add("uniform sampler2D xeo_uTextureReflectivity;");
                        if (states.material.reflectivityMap.matrix) {
                            add("uniform mat4 xeo_uTextureReflectivityMatrix;");
                        }
                    }

                    if (normalMapping) {
                        add("uniform sampler2D xeo_uNormalMap;");
                        if (states.material.normalMap.matrix) {
                            add("uniform mat4 xeo_uNormalMapMatrix;");
                        }
                    }
                }
            }

            add("uniform vec3 xeo_uLightAmbientColor;");
            add("uniform float xeo_uLightAmbientIntensity;");

            if (normals) {

                // View-space vector from fragment to eye

                add("varying vec3 xeo_vViewEyeVec;");

                // View-space fragment normal

                add("varying vec3 xeo_vViewNormal;");

                // Light sources

                for (i = 0, len = states.lights.lights.length; i < len; i++) {

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

                if (diffuseFresnel || specularFresnel || opacityFresnel || emissiveFresnel || reflectivityFresnel) {

                    add();
                    comment("Fresnel variables");
                    add();

                    if (diffuseFresnel) {
                        add("uniform float xeo_uDiffuseFresnelCenterBias;");
                        add("uniform float xeo_uDiffuseFresnelEdgeBias;");
                        add("uniform float xeo_uDiffuseFresnelPower;");
                        add("uniform vec3 xeo_uDiffuseFresnelCenterColor;");
                        add("uniform vec3 xeo_uDiffuseFresnelEdgeColor;");
                        add();
                    }

                    if (specularFresnel) {
                        add("uniform float xeo_uSpecularFresnelCenterBias;");
                        add("uniform float xeo_uSpecularFresnelEdgeBias;");
                        add("uniform float xeo_uSpecularFresnelPower;");
                        add("uniform vec3 xeo_uSpecularFresnelCenterColor;");
                        add("uniform vec3 xeo_uSpecularFresnelEdgeColor;");
                        add();
                    }

                    if (opacityFresnel) {
                        add("uniform float xeo_uOpacityFresnelCenterBias;");
                        add("uniform float xeo_uOpacityFresnelEdgeBias;");
                        add("uniform float xeo_uOpacityFresnelPower;");
                        add("uniform vec3 xeo_uOpacityFresnelCenterColor;");
                        add("uniform vec3 xeo_uOpacityFresnelEdgeColor;");
                        add();
                    }

                    if (reflectivityFresnel) {
                        add("uniform float xeo_uReflectivityFresnelCenterBias;");
                        add("uniform float xeo_uReflectivityFresnelEdgeBias;");
                        add("uniform float xeo_uReflectivityFresnelPower;");
                        add("uniform vec3 xeo_uReflectivityFresnelCenterColor;");
                        add("uniform vec3 xeo_uReflectivityFresnelEdgeColor;");
                        add();
                    }

                    if (emissiveFresnel) {
                        add("uniform float xeo_uEmissiveFresnelCenterBias;");
                        add("uniform float xeo_uEmissiveFresnelEdgeBias;");
                        add("uniform float xeo_uEmissiveFresnelPower;");
                        add("uniform vec3 xeo_uEmissiveFresnelCenterColor;");
                        add("uniform vec3 xeo_uEmissiveFresnelEdgeColor;");
                        add();
                    }

                    comment("Fresnel calculation");
                    add();
                    add("float fresnel(vec3 eyeDir, vec3 normal, float edgeBias, float centerBias, float power) {");
                    add("    float fr = abs(dot(eyeDir, normal));");
                    add("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
                    add("    return pow(finalFr, power);");
                    add("}");
                }
            }

            add();

            add("void main(void) {");

            add();

            add("   vec3 ambient = xeo_uLightAmbientColor;");
            add("   vec3 emissive = xeo_uEmissive;");
            add("   float opacity = xeo_uOpacity;");

            if (states.geometry.colors) {
                add("   vec3 diffuse = xeo_vColor.rgb;"); // Diffuse color from vertex colors
            } else {
                add("   vec3 diffuse = xeo_uDiffuse;");
            }

            if (normals) {

                add("vec3 viewEyeVec = normalize(xeo_vViewEyeVec);");

                add("   vec3 specular = xeo_uSpecular;");
                add("   float shininess = xeo_uShininess;");
                add("   float reflectivity = xeo_uReflectivity;");

                if (normalMapping) {

                    add("   vec3 viewNormal = vec3(0.0, 1.0, 0.0);");

                } else {

                    // Normalize the interpolated normals in the per-fragment-fragment-shader,
                    // because if we linear interpolated two nonparallel normalized vectors,
                    // the resulting vector won’t be of length 1

                    add("   vec3 viewNormal = normalize(xeo_vViewNormal);");
                }
            }

            if (texturing) {

                // Apply textures

                add();
                comment("   Apply textures");
                add();

                add("   vec4 texturePos = vec4(xeo_vUV.s, xeo_vUV.t, 1.0, 1.0);");
                add("   vec2 textureCoord;");

                var material = states.material;

                // Opacity and emissive lighting and mapping are independent of normals

                if (material.emissiveMap) {
                    add();
                    if (material.emissiveMap.matrix) {
                        add("   textureCoord = (xeo_uEmissiveMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -textureCoord.y;");
                    add("   emissive = texture2D(xeo_uEmissiveMap, textureCoord).rgb;");
                }

                if (material.opacityMap) {
                    add();
                    if (material.opacityMap.matrix) {
                        add("   textureCoord = (xeo_uOpacityMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -textureCoord.y;");
                    add("   opacity = texture2D(xeo_uOpacityMap, textureCoord).b;");
                }

                if (material.ambientMap) {
                    add();
                    if (material.ambientMap.matrix) {
                        add("   textureCoord = (xeo_uAmbientMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -textureCoord.y;");
                    add("   ambient = texture2D(xeo_uAmbientMap, textureCoord).rgb;");
                }

                if (material.diffuseMap) {
                    add();
                    if (material.diffuseMap.matrix) {
                        add("   textureCoord = (xeo_uDiffuseMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -textureCoord.y;");
                    add("   diffuse = texture2D(xeo_uDiffuseMap, textureCoord).rgb;");
                }

                if (normals) {

                    if (material.specularMap) {
                        add();
                        if (material.specularMap.matrix) {
                            add("   textureCoord = (xeo_uSpecularMapMatrix * texturePos).xy;");
                        } else {
                            add("   textureCoord = texturePos.xy;");
                        }
                        add("   textureCoord.y = -textureCoord.y;");
                        add("   specular = texture2D(xeo_uSpecularMap, textureCoord).rgb;");
                    }

                    if (material.reflectivityMap) {
                        add();
                        if (material.reflectivityMap.matrix) {
                            add("   textureCoord = (xeo_uReflectivityMapMatrix * texturePos).xy;");
                        } else {
                            add("   textureCoord = texturePos.xy;");
                        }
                        add("   textureCoord.y = -textureCoord.y;");
                        add("   reflectivity = texture2D(xeo_uReflectivityMap, textureCoord).b;");
                    }
                }

                if (normalMapping) {
                    add();
                    if (material.normalMap.matrix) {
                        add("   textureCoord = (xeo_uNormalMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -textureCoord.y;");
                    add("   viewNormal = normalize(texture2D(xeo_uNormalMap, vec2(textureCoord.x, textureCoord.y)).xyz * 2.0 - 1.0);");
                }
            }

            add("   vec4 fragColor;");

            if (normals) {

                // Get Lambertian shading terms

                add();
                add("   vec3  diffuseLight = vec3(0.0, 0.0, 0.0);");
                add("   vec3  specularLight = vec3(0.0, 0.0, 0.0);");

                add();
                add("   vec3  viewLightVec;");
                add("   float specAngle;");
                add("   float lightDist;");
                add("   float attenuation;");


                for (i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    // If normal mapping, the fragment->light vector will be in tangent space
                    add("   viewLightVec = normalize(xeo_vViewLightVecAndDist" + i + ".xyz);");


                    if (light.type === "point") {
                        add();

                        add("   specAngle = max(dot(viewNormal, viewLightVec), 0.0);");

                        add("   lightDist = xeo_vViewLightVecAndDist" + i + ".w;");

                        add("   attenuation = 1.0 - (" +
                            "  xeo_uLightAttenuation" + i + "[0] + " +
                            "  xeo_uLightAttenuation" + i + "[1] * lightDist + " +
                            "  xeo_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                        add("   diffuseLight += xeo_uLightIntensity" + i + " * specAngle * xeo_uLightColor" + i + " * attenuation;");

                        add("   specularLight += xeo_uLightIntensity" + i + " *  pow(max(dot(reflect(-viewLightVec, -viewNormal), viewEyeVec), 0.0), shininess) * attenuation;");
                    }

                    if (light.type === "dir") {

                        add("   specAngle = max(dot(viewNormal, -viewLightVec), 0.0);");

                        add("   diffuseLight += xeo_uLightIntensity" + i + " * specAngle * xeo_uLightColor" + i + ";");

                        add("   specularLight += xeo_uLightIntensity" + i + " * pow(max(dot(reflect(viewLightVec, -viewNormal), viewEyeVec), 0.0), shininess);");
                    }
                }

                add();

                // Get Fresnel terms

                if (diffuseFresnel || specularFresnel || opacityFresnel || emissiveFresnel || reflectivityFresnel) {

                    add();
                    comment("   Apply Fresnels");

                    if (diffuseFresnel) {
                        add();
                        add("float diffuseFresnel = fresnel(viewEyeVec, viewNormal, xeo_uDiffuseFresnelEdgeBias, xeo_uDiffuseFresnelCenterBias, xeo_uDiffuseFresnelPower);");
                        add("diffuse *= mix(xeo_uDiffuseFresnelEdgeColor, xeo_uDiffuseFresnelCenterColor, diffuseFresnel);");
                    }

                    if (specularFresnel) {
                        add();
                        add("float specularFresnel = fresnel(viewEyeVec, viewNormal, xeo_uSpecularFresnelEdgeBias, xeo_uSpecularFresnelCenterBias, xeo_uSpecularFresnelPower);");
                        add("specular *= mix(xeo_uSpecularFresnelEdgeColor, xeo_uSpecularFresnelCenterColor, specularFresnel);");
                    }

                    if (opacityFresnel) {
                        add();
                        add("float opacityFresnel = fresnel(viewEyeVec, viewNormal, xeo_uOpacityFresnelEdgeBias, xeo_uOpacityFresnelCenterBias, xeo_uOpacityFresnelPower);");
                        add("opacity *= mix(xeo_uOpacityFresnelEdgeColor.r, xeo_uOpacityFresnelCenterColor.r, opacityFresnel);");
                    }

                    if (emissiveFresnel) {
                        add();
                        add("float emissiveFresnel = fresnel(viewEyeVec, viewNormal, xeo_uEmissiveFresnelEdgeBias, xeo_uEmissiveFresnelCenterBias, xeo_uEmissiveFresnelPower);");
                        add("emissive *= mix(xeo_uEmissiveFresnelEdgeColor, xeo_uEmissiveFresnelCenterColor, emissiveFresnel);");
                    }
                }

                // Combine terms with Blinn-Phong BRDF

                add();
                comment("   Phong BRDF");
                add();
                add("   fragColor = vec4((specular * specularLight) + ((diffuseLight + (ambient * xeo_uLightAmbientIntensity) ) * diffuse) + emissive, opacity);");

            } else {

                // No normals
                add();
                comment("   Non-Lambertian BRDF");
                add();
                add("   fragColor = vec4(emissive + diffuse, opacity);");
            }

            add("   fragColor.rgb *= fragColor.a;");

            add("   gl_FragColor = fragColor;");

            add("}");

            return end();
        }

        // Start fresh program source
        function begin() {
            src = [];
        }

        // Append to program source
        function add(txt) {
            src.push(txt || "");
        }

        // Append to program source
        function comment(txt) {
            if (txt) {
                var c = 0;
                for (var i = 0, len = txt.length; i < len; i++) {
                    if (txt.charAt(i) === " ") {
                        c++;
                    }
                }
                var pad = c > 0 ? txt.substring(0, c - 1) : "";
                src.push(pad + "// " + txt.substring(c - 1));
            }
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