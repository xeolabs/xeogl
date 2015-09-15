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
        var shading; // True when rendering state contains normals
        var normalMapping; // True when rendering state contains tangents
        var reflection; // True when rendering state contains reflections

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
            shading = hasShading();
            normalMapping = hasNormalMap();
            reflection = hasReflection();

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
            return material.diffuseMap ||
                material.specularMap ||
                material.emissiveMap ||
                material.opacityMap ||
                material.reflectivityMap;
        }

        function hasReflection() {
            return false;
            //return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
        }

        function hasShading() {
            var primitive = states.geometry.primitiveName;
            if (states.geometry.normals && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
                return true;
            }
            return false;
        }

        function hasNormalMap() {
            return (states.geometry.normals && states.material.normalMap);
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
            begin();
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
            return end();
        }

        function fragmentPickObject() {
            begin();
            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");
            add("uniform vec4 xeo_uPickColor;");
            add("void main(void) {");
            add("   gl_FragColor = xeo_uPickColor; ");
            add("}");
            return end();
        }

        function vertexPickPrimitive() {
            begin();
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
            return end();
        }

        function fragmentPickPrimitive() {
            begin();
            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");
            add("varying vec4 xeo_vColor;");
            add("void main(void) {");
            add("   gl_FragColor = xeo_vColor;");
            add("}");
            return end();
        }

        function vertexDraw() {

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

            add();

            // Model-space vertex position
            add("attribute vec3 xeo_aPosition;");

            add();

            // View-space fragment position
            add("varying vec4 xeo_vViewPosition;");

            // View-space vector from fragment position to eye
            add("varying vec3 xeo_vViewEyeVec;");

            if (shading) {

                add();

                // Model-space vertex normal
                add("attribute vec3 xeo_aNormal;");

                // Modelling and View normal transform matrix
                add("uniform mat4 xeo_uModelNormalMatrix;");
                add("uniform mat4 xeo_uViewNormalMatrix;");

                // View-space normal
                add("varying vec3 xeo_vViewNormal;");

                if (normalMapping) {

                    // Vertex tangent vector
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

            if (states.geometry.primitive === "points") {
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
                add("   mat[2][2] = 1.0;");
                add("}");
            }

            // ------------------- main -------------------------------

            add();
            add("void main(void) {");
            add();
            add("   vec4 modelPosition = vec4(xeo_aPosition, 1.0); ");

            if (shading) {
                add("   vec4 modelNormal = vec4(xeo_aNormal, 0.0); ");
            }

            add("   mat4 modelMatrix = xeo_uModelMatrix;");
            add("   mat4 viewMatrix = xeo_uViewMatrix;");

            if (shading) {
                add("   mat4 modelNormalMatrix = xeo_uModelNormalMatrix;");
                add("   mat4 viewNormalMatrix = xeo_uViewNormalMatrix;");
            }
            
            add("   vec4 worldPosition;");

            if (states.billboard.active) {
                add("   mat4 modelView =  xeo_uViewMatrix * xeo_uModelMatrix ;");
                add("   mat4 modelViewNormal =  xeo_uViewNormalMatrix * xeo_uModelNormalMatrix ;");

                add("   billboard(modelMatrix);");
                add("   billboard(viewMatrix);");
                add("   billboard(modelView);");

                if (shading) {
                    add("   billboard(modelNormalMatrix);");
                    add("   billboard(viewNormalMatrix);");
                    add("   billboard(modelViewNormal);");
                }

                add("   worldPosition = modelMatrix * modelPosition;");
                add("   vec4 viewPosition = modelView * modelPosition;");

            } else {

                add("   worldPosition = modelMatrix * modelPosition;");
                add("   vec4 viewPosition  = viewMatrix * worldPosition; ");
            }

            if (shading) {
                add("   vec3 worldNormal = (modelNormalMatrix * modelNormal).xyz; ");
                add("   xeo_vViewNormal = (viewNormalMatrix * vec4(worldNormal, 1.0)).xyz;");
            }

            add("   xeo_vViewPosition = viewPosition;");

            if (normalMapping) {

                // Compute tangent-bitangent-normal matrix
                add("   vec3 tangent = normalize((viewNormalMatrix * modelNormalMatrix * xeo_aTangent).xyz);");
                add("   vec3 bitangent = cross(xeo_vViewNormal, tangent);");
                add("   mat3 TBM = mat3(tangent, bitangent, xeo_vViewNormal);");
            }

            add("  vec3 tmpVec3;");

            if (shading) {

                for (var i = 0; i < states.lights.lights.length; i++) {

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
                            add("   tmpVec3 = vec3(viewMatrix * vec4(tmpVec3, 0.0)).xyz;");

                            if (normalMapping) {

                                // Transform to Tangent space
                                add("   tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space light

                            add("   tmpVec3 = xeo_uLightDir" + i + ";");

                            if (normalMapping) {

                                // Transform to Tangent space
                                add("   tmpVec3 *= TBM;");
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

                            add("   tmpVec3 = (viewMatrix * vec4(xeo_uLightPos" + i + ", 0.0)).xyz - viewPosition.xyz;"); // Vector from World coordinate to light pos

                            if (normalMapping) {
                                // Transform to Tangent space
                                add("   tmpVec3 *= TBM;");
                            }

                        } else {

                            // View space

                            add("   tmpVec3 = xeo_uLightPos" + i + ".xyz - viewPosition.xyz;"); // Vector from View coordinate to light pos

                            if (normalMapping) {

                                // Transform to tangent space
                                add("   tmpVec3 *= TBM;");
                            }
                        }

                        // Output
                        add("   xeo_vViewLightVecAndDist" + i + " = vec4(tmpVec3, length(xeo_uLightPos" + i + ".xyz - worldPosition.xyz));");
                    }
                }
            }

            add("   xeo_vViewEyeVec = ((viewMatrix * vec4(xeo_uEye, 0.0)).xyz  - viewPosition.xyz);");

            if (normalMapping) {
                add("   xeo_vViewEyeVec *= TBM;");
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

            begin();

            add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");
            add();
            add("varying vec4 xeo_vViewPosition;");
            add();
            add("uniform vec3 xeo_uDiffuse;");
            add("uniform vec3 xeo_uSpecular;");
            add("uniform vec3 xeo_uEmissive;");
            add("uniform float xeo_uOpacity;");
            add("uniform float xeo_uShininess;");
            add("uniform float xeo_uReflectivity;");
            add();

            if (texturing) {

                if (states.geometry.uv) {
                    add("varying vec2 xeo_vUV;");
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
                    add("uniform sampler2D xeo_uOpacityMap;");
                    if (states.material.opacityMap.matrix) {
                        add("uniform mat4 xeo_uOpacityMapMatrix;");
                    }
                }

                if (states.material.reflectivityMap) {
                    add("uniform sampler2D xeo_uTextureReflectivity;");
                    if (states.material.reflectivityMap.matrix) {
                        add("uniform mat4 xeo_uTextureReflectivityMatrix;");
                    }
                }
            }

            if (states.geometry.colors) {
                add("varying vec4 xeo_vColor;");
            }

            // Global, ambient colour - taken from clear colour

            add("uniform vec3 xeo_uLightAmbientColor;");
            add("uniform float xeo_uLightAmbientIntensity;");

            // World-space vector from fragment to eye

            add("varying vec3 xeo_vViewEyeVec;");

            if (shading) {

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

            add();
            add("void main(void) {");
            add();

            // These may be overridden by textures below

            add("   vec3 ambient = xeo_uLightAmbientColor;");
            add("   vec3 diffuse = xeo_uDiffuse;");
            add("   vec3 specular = xeo_uSpecular;");
            add("   vec3 emissive = xeo_uEmissive;");
            add("   float opacity = xeo_uOpacity;");
            add("   float shininess = xeo_uShininess;");
            add("   float reflectivity = xeo_uReflectivity;");


            if (states.geometry.colors) {

                // Fragment diffuse color from geometry vertex colors
                add("   diffuse = xeo_vColor.rgb;");
            }

            if (shading) {

                if (normalMapping) {
                    add("   vec3 viewNormalVec = vec3(0.0, 1.0, 0.0);");

                } else {

                    // Normalize the interpolated normals in the per-fragment-fragment-shader,
                    // because if we linear interpolated two nonparallel normalized vectors,
                    // the resulting vector won’t be of length 1
                    add("   vec3 viewNormalVec = normalize(xeo_vViewNormal);");
                }
            }

            if (texturing) {

                // Textures

                add();

                add("   vec4 texturePos = vec4(xeo_vUV.s, xeo_vUV.t, 1.0, 1.0);");
                add("   vec2 textureCoord;");

                var material = states.material;

                if (material.ambientMap) {
                    add();
                    if (material.ambientMap.matrix) {
                        add("   textureCoord = (xeo_uAmbientMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   ambient = texture2D(xeo_uAmbientMap, textureCoord).rgb;");
                }

                if (material.diffuseMap) {
                    add();
                    if (material.diffuseMap.matrix) {
                        add("   textureCoord = (xeo_uDiffuseMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   diffuse = texture2D(xeo_uDiffuseMap, textureCoord).rgb;");
                }

                if (material.specularMap) {
                    add();
                    if (material.specularMap.matrix) {
                        add("   textureCoord = (xeo_uSpecularMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   specular = texture2D(xeo_uSpecularMap, textureCoord).rgb;");
                }

                if (material.emissiveMap) {
                    add();
                    if (material.emissiveMap.matrix) {
                        add("   textureCoord = (xeo_uEmissiveMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   emissive = texture2D(xeo_uEmissiveMap, textureCoord).rgb;");
                }

                if (material.opacityMap) {
                    add();
                    if (material.opacityMap.matrix) {
                        add("   textureCoord = (xeo_uOpacityMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   opacity = texture2D(xeo_uOpacityMap, textureCoord).b;");
                }

                if (material.reflectivityMap) {
                    add();
                    if (material.reflectivityMap.matrix) {
                        add("   textureCoord = (xeo_uReflectivityMapMatrix * texturePos).xy;");
                    } else {
                        add("   textureCoord = texturePos.xy;");
                    }
                    add("   textureCoord.y = -texturePos.y;");
                    add("   reflectivity = texture2D(xeo_uReflectivityMap, textureCoord).b;");
                }
            }

            if (shading) {

                add();
                add("   vec3  diffuseLight = vec3(0.0, 0.0, 0.0);");
                add("   vec3  specularLight = vec3(0.0, 0.0, 0.0);");

                add();
                add("   vec3  viewLightVec;");
                add("   float dotN;");
                add("   float lightDist;");
                add("   float attenuation;");

                var light;

                for (var i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    add("   viewLightVec = normalize(xeo_vViewLightVecAndDist" + i + ".xyz);");

                    if (light.type === "point") {
                        add();
                        add("   dotN = max(dot(viewNormalVec, viewLightVec), 0.0);");
                        add("   lightDist = xeo_vViewLightVecAndDist" + i + ".w;");
                        add("   attenuation = 1.0 - (" +
                            "  xeo_uLightAttenuation" + i + "[0] + " +
                            "  xeo_uLightAttenuation" + i + "[1] * lightDist + " +
                            "  xeo_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                        add("   diffuseLight += dotN * xeo_uLightColor" + i + " * attenuation;");

                        add("   specularLight += specular * xeo_uLightIntensity" + i +
                            " * specular * pow(max(dot(reflect(-viewLightVec, -viewNormalVec), " +
                            "normalize(-xeo_vViewPosition.xyz)), 0.0), shininess) * attenuation;");
                    }

                    if (light.type === "dir") {
                        add();
                        add("   dotN = max(dot(viewNormalVec, viewLightVec), 0.0);");

                        add("   diffuseLight += dotN * xeo_uLightColor" + i + ";");

                        add("   specularLight += specular * xeo_uLightIntensity" + i +
                            " * pow(max(dot(reflect(-viewLightVec, -viewNormalVec), " +
                            "normalize(-xeo_vViewPosition.xyz)), 0.0), shininess);");
                    }
                }

                add();
                add("   gl_FragColor = vec4( (specularLight * specular) + (diffuse * (diffuseLight + ambient * xeo_uLightAmbientIntensity)) + emissive, opacity);");

            } else {

                // No shading

                add();
                add("   gl_FragColor = vec4(diffuse + ambient + emissive, opacity);");
            }

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