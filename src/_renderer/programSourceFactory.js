(function () {

    "use strict";

    /**
     *  Manages creation, sharing and recycle of {@link xeogl.renderer.ProgramSource} instances
     */
    xeogl.renderer.ProgramSourceFactory = new (function () {

        var cache = {}; // Caches source code against hashes

        var src = ""; // Accumulates source code as it's being built

        var states; // Cache rendering state
        var phongMaterial;
        var MetallicMaterial;
        var SpecularMaterial;
        var texturing; // True when rendering state contains textures
        var normals; // True when rendering state contains normals
        var normalMapping; // True when rendering state contains tangents
        var reflection; // True when rendering state contains reflections
        var diffuseFresnel;
        var specularFresnel;
        var alphaFresnel;
        var reflectivityFresnel;
        var emissiveFresnel;
        var receiveShadow;

        var vertexPickObjectSrc;
        var fragmentPickObjectSrc;
        var vertexPickPrimSrc;
        var fragmentPickPrimSrc;
        var vertexShadowSrc;
        var fragmentShadowSrc;
        var vertexOutlineSrc;
        var fragmentOutlineSrc;

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
            phongMaterial = (states.material.type === "phongMaterial");
            MetallicMaterial = (states.material.type === "MetallicMaterial");
            SpecularMaterial = (states.material.type === "SpecularMaterial");
            reflection = hasReflection();
            diffuseFresnel = states.material.diffuseFresnel;
            specularFresnel = states.material.specularFresnel;
            alphaFresnel = states.material.alphaFresnel;
            reflectivityFresnel = states.material.reflectivityFresnel;
            emissiveFresnel = states.material.emissiveFresnel;
            receiveShadow = receivesShadow();

            source = new xeogl.renderer.ProgramSource(
                hash,
                vertexPickObject(),
                fragmentPickObject(),
                vertexPickPrimitive(),
                fragmentPickPrimitive(),
                vertexDraw(),
                fragmentDraw(),
                vertexShadow(),
                fragmentShadow(),
                vertexOutline(),
                fragmentOutline()
            );

            cache[hash] = source;

            return source;
        };

        function receivesShadow() {
            if (!states.modes.receiveShadow) {
                return false;
            }
            var lights = states.lights.lights;
            if (!lights) {
                return false;
            }
            for (var i = 0, len = lights.length; i < len; i++) {
                if (lights[i].shadow) {
                    return true;
                }
            }
            return false;
        }

        function hasTextures() {
            if (!states.geometry.uv) {
                return false;
            }
            var material = states.material;
            return material.ambientMap ||
                material.occlusionMap ||
                material.baseColorMap ||
                material.diffuseMap ||
                material.alphaMap ||
                material.specularMap ||
                material.glossinessMap ||
                material.specularGlossinessMap ||
                material.emissiveMap ||
                material.metallicMap ||
                material.roughnessMap ||
                material.metallicRoughnessMap ||
                material.reflectivityMap ||
                states.material.normalMap;
        }

        function hasReflection() {
            return false;
            //return (states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
        }

        function hasNormals() {
            var primitive = states.geometry.primitiveName;
            if ((states.geometry.autoNormals || states.geometry.normals) && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
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
            add("attribute vec3 position;");
            add("uniform mat4 modelMatrix;");
            add("uniform mat4 viewMatrix;");
            add("uniform mat4 viewNormalMatrix;");
            add("uniform mat4 projMatrix;");
            add("varying vec4 vViewPosition;");
            add("void main(void) {");
            add("   vec4 tmpVertex = vec4(position, 1.0); ");
            add("   vViewPosition = viewMatrix * modelMatrix * tmpVertex;");
            add("   gl_Position = projMatrix * vViewPosition;");
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
            add("uniform vec4 pickColor;");
            add("void main(void) {");
            add("   gl_FragColor = pickColor; ");
            add("}");
            return fragmentPickObjectSrc = end();
        }

        function vertexPickPrimitive() {

            if (vertexPickPrimSrc) {
                return vertexPickPrimSrc;
            }

            begin();

            add("// Triangle picking vertex shader");

            add("attribute vec3 position;");
            add("attribute vec4 color;");

            add("uniform vec3 pickColor;");
            add("uniform mat4 modelMatrix;");
            add("uniform mat4 viewMatrix;");
            add("uniform mat4 projMatrix;");

            add("varying vec4 vViewPosition;");
            add("varying vec4 vColor;");

            add("void main(void) {");
            add("   vec4 tmpVertex = vec4(position, 1.0); ");
            add("   vec4 worldPosition = modelMatrix * tmpVertex; ");
            add("   vec4 viewPosition = viewMatrix * worldPosition;");
            add("   vColor = color;");
            add("   gl_Position = projMatrix * viewPosition;");
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
            add("varying vec4 vColor;");
            add("void main(void) {");
            add("   gl_FragColor = vColor;");
            add("}");
            return fragmentPickPrimSrc = end();
        }

        /// NOTE: Shadow shaders will become more complex and will eventually be
        // composed from state, in the same manner as the draw shaders.

        function vertexShadow() {
            begin();
            add("// Shadow map vertex shader");
            add("attribute vec3 position;");
            add("uniform mat4 modelMatrix;");
            add("uniform mat4 shadowViewMatrix;");
            add("uniform mat4 shadowProjMatrix;");
            add("void main(void) {");
            add("   gl_Position = shadowProjMatrix * (shadowViewMatrix * (modelMatrix * (vec4(position, 1.0))));");
            add("}");
            return vertexShadowSrc = end();
        }

        function fragmentShadow() {
            begin();
            add("// Shadow map fragment shader");
            add("precision " + getFSFloatPrecision(states.gl) + " float;");
            add("void main(void) {");
            add("   gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);");
            //     add("   gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);");
            add("}");
            return fragmentShadowSrc = end();
        }

        function vertexOutline() {
            begin();
            add("attribute vec4 position;");
            add("uniform mat4 modelMatrix;");
            add("uniform mat4 viewMatrix;");
            add("uniform mat4 projMatrix;");
            add("uniform float thickness;");

            if (normals) {
                add("attribute vec3 normal;");
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

            add("void main(void) {");

            add("mat4 viewMatrix2 = viewMatrix;");
            add("mat4 modelMatrix2 = modelMatrix;");

            if (states.stationary.active) {
                add("viewMatrix2[3][0] = viewMatrix2[3][1] = viewMatrix2[3][2] = 0.0;")
            }

            if (states.billboard.active) {
                add("billboard(modelMatrix2);");
                add("billboard(viewMatrix2);");
            }

            // Displacement

            if (normals) {
                add("vec4 projPos = projMatrix * viewMatrix2 * modelMatrix2 * vec4(position.xyz, 1.0); ");
                add("  vec3 offset = (normalize(normal) * (thickness * 0.0005 * (projPos.z/1.0)));");
            } else {
                add("  vec3 offset = vec3(0.0, 0.0, 0.0);");
            }

            add("vec4 worldVertex = modelMatrix * vec4(position.xyz + offset, 1.0); ");

            add("  gl_Position = projMatrix * (viewMatrix * worldVertex);");
            add("}");
            return vertexOutlineSrc = end();
        }

        function fragmentOutline() {
            begin();
            add("precision " + getFSFloatPrecision(states.gl) + " float;");
            add("uniform vec3  color;");
            add("void main(void) {");
            add("   gl_FragColor = vec4(color, 1.0);");
            add("}");

            return fragmentOutlineSrc = end();
        }

        function vertexDraw() {

            var i;
            var len;
            var lights = states.lights.lights;
            var light;

            begin();

            add("// Drawing vertex shader");
            add("attribute  vec3 position;");

            add("uniform    mat4 modelMatrix;");
            add("uniform    mat4 viewMatrix;");
            add("uniform    mat4 projMatrix;");

            add("varying    vec3 vViewPosition;");

            if (states.lights.lightMap) {
                add("varying    vec3 vWorldNormal;");
            }

            if (normals) {

                add("attribute  vec3 normal;");

                add("uniform    mat4 modelNormalMatrix;");
                add("uniform    mat4 viewNormalMatrix;");

                add("varying    vec3 vViewNormal;");

                if (states.material.normalMap) {
                    add("varying    mat3 vTBN;");
                }

                for (i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {
                        add("uniform vec3 lightDir" + i + ";");
                    }

                    if (light.type === "point") {
                        add("uniform vec3 lightPos" + i + ";");
                    }

                    if (light.type === "spot") {
                        add("uniform vec3 lightPos" + i + ";");
                    }

                    if (!(light.type === "dir" && light.space === "view")) {
                        // World-space dir lights don't need these varyings
                        add("varying vec4 vViewLightReverseDirAndDist" + i + ";");
                    }
                }
            }

            if (normalMapping) {
                add("attribute vec3 tangent;");
            }

            if (texturing) {
                add("attribute vec2 uv;");
                add("varying vec2 vUV;");
            }

            if (states.geometry.colors) {
                add("attribute vec4 color;");
                add("varying vec4 vColor;");
            }

            if (states.geometry.primitiveName === "points") {
                add("uniform float pointSize;");
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

            if (receiveShadow) {
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("uniform mat4 shadowViewMatrix" + i + ";");
                        add("uniform mat4 shadowProjMatrix" + i + ";");
                        add("varying vec4 vShadowPosFromLight" + i + ";");
                    }
                }
            }

            add("void main(void) {");

            add("vec4 localPosition = vec4(position, 1.0); ");
            add("vec4 worldPosition;");

            if (normals) {
                add("vec4 localNormal = vec4(normal, 0.0); ");
                add("mat4 modelNormalMatrix2    = modelNormalMatrix;");
                add("mat4 viewNormalMatrix2     = viewNormalMatrix;");

            }

            add("mat4 viewMatrix2           = viewMatrix;");
            add("mat4 modelMatrix2          = modelMatrix;");

            if (states.stationary.active) {
                add("viewMatrix2[3][0] = viewMatrix2[3][1] = viewMatrix2[3][2] = 0.0;")
            }

            if (states.billboard.active) {

                add("mat4 modelViewMatrix = viewMatrix2 * modelMatrix2;");

                add("billboard(modelMatrix2);");
                add("billboard(viewMatrix2);");
                add("billboard(modelViewMatrix);");

                if (normals) {

                    add("mat4 modelViewNormalMatrix =  viewNormalMatrix2 * modelNormalMatrix2;");

                    add("billboard(modelNormalMatrix2);");
                    add("billboard(viewNormalMatrix2);");
                    add("billboard(modelViewNormalMatrix);");
                }

                add("worldPosition = modelMatrix2 * localPosition;");
                add("vec4 viewPosition = modelViewMatrix * localPosition;");

            } else {

                add("worldPosition = modelMatrix2 * localPosition;");
                add("vec4 viewPosition  = viewMatrix2 * worldPosition; ");
            }

            if (normals) {

                add("vec3 worldNormal = (modelNormalMatrix2 * localNormal).xyz; ");
                if (states.lights.lightMap) {
                    add("vWorldNormal = worldNormal;");
                }
                add("vViewNormal = normalize((viewNormalMatrix2 * vec4(worldNormal, 1.0)).xyz);");

                if (normalMapping) {

                    add("mat4 mat =  viewMatrix2 * modelMatrix2;");

                    add("vec3 n = normalize( ( mat * vec4( normal, 0.0 ) ).xyz );");
                    add("vec3 t = normalize( ( mat * vec4( tangent, 0.0 ) ).xyz );");
                    add("vec3 b = normalize( ( mat * vec4( ( cross(normal, tangent.xyz ) * 1.0 ), 0.0 ) ).xyz );");

                    add("vTBN = mat3(t, b, n);");
                }

                add("vec3 tmpVec3;");
                add("float lightDist;");

                for (i = 0, len = states.lights.lights.length; i < len; i++) { // Lights

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {

                        if (light.space === "world") {
                            add("tmpVec3 = vec3(viewMatrix2 * vec4(lightDir" + i + ", 0.0) ).xyz;");
                            add("vViewLightReverseDirAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                        }
                    }

                    if (light.type === "point") {

                        if (light.space === "world") {
                            add("tmpVec3 = (viewMatrix2 * vec4(lightPos" + i + ", 1.0)).xyz - viewPosition.xyz;");
                            add("lightDist = abs(length(tmpVec3));");

                        } else {
                            add("tmpVec3 = lightPos" + i + ".xyz - viewPosition.xyz;");
                            add("lightDist = abs(length(tmpVec3));");
                        }

                        add("vViewLightReverseDirAndDist" + i + " = vec4(tmpVec3, lightDist);");
                    }
                }
            }

            if (texturing) {
                add("vUV = uv;");
            }

            if (states.geometry.colors) {
                add("vColor = color;");
            }

            if (states.geometry.primitiveName === "points") {
                add("gl_PointSize = pointSize;");
            }
            add("   vViewPosition = viewPosition.xyz;");
            add("   gl_Position = projMatrix * viewPosition;");

            if (receiveShadow) {
                add("vec4 tempx; ");
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("vShadowPosFromLight" + i + " = shadowProjMatrix" + i + " * (shadowViewMatrix" + i + " * worldPosition); ");
                        //add("tempx = shadowViewMatrix" + i + " * worldPosition; ");
                        //add("tempx = shadowProjMatrix" + i + " * tempx; ");
                        //add("   gl_Position = tempx;");
                    }
                }
            }

            add("}");

            return end();
        }

        function fragmentDraw() {

            var material = states.material;
            var geometry = states.geometry;

            var phongMaterial = material.type === "phongMaterial";
            var pbrMetalRough = material.type === "MetallicMaterial";
            var pbrSpecGloss = material.type === "SpecularMaterial";

            var i;
            var len;
            var lights = states.lights.lights;
            var light;

            begin();

            add("// Drawing fragment shader");

            add("precision " + getFSFloatPrecision(states.gl) + " float;");

            //--------------------------------------------------------------------------------
            // LIGHT AND REFLECTION MAP INPUTS
            // Define here so available globally to shader functions
            //--------------------------------------------------------------------------------

            if (states.lights.lightMap) {
                add("uniform samplerCube lightMap;");
                add("uniform mat4 viewNormalMatrix;");
            }

            if (states.lights.reflectionMap) {
                add("uniform samplerCube reflectionMap;");
            }

            if (states.lights.lightMap || states.lights.reflectionMap) {
                add("uniform mat4 viewMatrix;");
            }


            //--------------------------------------------------------------------------------
            // SHADING FUNCTIONS
            //--------------------------------------------------------------------------------

            // CONSTANT DEFINITIONS

            add("#define PI 3.14159265359");
            add("#define RECIPROCAL_PI 0.31830988618");
            add("#define RECIPROCAL_PI2 0.15915494");
            add("#define EPSILON 1e-6");

            add("#define saturate(a) clamp( a, 0.0, 1.0 )");

            // UTILITY DEFINITIONS

            add("float pow2(const in float x) {");
            add("   return x*x;");
            add("}");

            add("vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {");
            add("   return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );");
            add("}");

            // STRUCTURES

            add("struct IncidentLight {");
            add("   vec3 color;");
            add("   vec3 direction;");
            add("};");

            add("struct ReflectedLight {");
            add("   vec3 diffuse;");
            add("   vec3 specular;");
            add("};");

            add("struct Geometry {");
            add("   vec3 position;");
            add("   vec3 viewNormal;");
            add("   vec3 worldNormal;");
            add("   vec3 viewEyeDir;");
            add("};");

            add("struct Material {");
            add("   vec3    diffuseColor;");
            add("   float   specularRoughness;");
            add("   vec3    specularColor;");
            add("   float   shine;"); // Only used for Phong
            add("};");

            // DIFFUSE BRDF EVALUATION

            add("vec3 BRDF_Diffuse_Lambert(const in vec3 diffuseColor) {");
            add("   return RECIPROCAL_PI * diffuseColor;");
            add("}");

            // COMMON UTILS

            add("vec4 LinearTosRGB( in vec4 value ) {");
            add("   return vec4(mix(pow(value.rgb,vec3(0.41666))*1.055-vec3(0.055), value.rgb*12.92, vec3(lessThanEqual(value.rgb,vec3(0.0031308)))),value.w);");
            add("}");

            if (phongMaterial) {

                if (states.lights.lightMap || states.lights.reflectionMap) {

                    add("void computePhongLightMapping(const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");

                    if (states.lights.lightMap) {
                        add("   vec3 irradiance = textureCube(lightMap, geometry.worldNormal).rgb;");
                        add("   irradiance *= PI;");
                        add("   vec3 diffuseBRDFContrib = BRDF_Diffuse_Lambert(material.diffuseColor);");
                        add("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                    }

                    if (states.lights.reflectionMap) {
                        //     add("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.worldNormal);");
                        //   //  add("   reflectVec                  = inverseTransformDirection(reflectVec, viewMatrix);");
                        //     add("   vec3 radiance               = textureCube(reflectionMap, geometry.worldNormal).rgb;");
                        ////     add("   radiance *= PI;");
                        //     add("   reflectedLight.specular     += radiance;");
                    }

                    add("}");
                }

                add("void computePhongLighting(const in IncidentLight directLight, const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");
                add("   float dotNL     = saturate(dot(geometry.viewNormal, directLight.direction));");
                add("   vec3 irradiance = dotNL * directLight.color * PI;");
                add("   reflectedLight.diffuse  += irradiance * BRDF_Diffuse_Lambert(material.diffuseColor);");
                add("   reflectedLight.specular += directLight.color * material.specularColor * pow(max(dot(reflect(-directLight.direction, -geometry.viewNormal), geometry.viewEyeDir), 0.0), material.shine);");
                add("}");
            }

            if (pbrMetalRough || pbrSpecGloss) {

                // IRRADIANCE EVALUATION

                //add("vec3 sample_reflectMapEquirect(const in vec3 reflect, const in float mipLevel) {");
                //add("   vec2 sampleUV;");
                //add("   sampleUV.y = saturate(reflect.y * 0.5 + 0.5);");
                //add("   sampleUV.x = atan(reflect.z, reflect.x) * RECIPROCAL_PI2 + 0.5;");
                //add("   vec4 texColor = texture2D(reflectionMap, sampleUV, mipLevel);");
                //add("   return texColor.rgb;"); // assumed to be linear
                //add("}");

                add("float GGXRoughnessToBlinnExponent(const in float ggxRoughness) {");
                add("   return (2.0 / pow2(ggxRoughness + 0.0001) - 2.0);");
                add("}");

                add("float getSpecularMIPLevel(const in float blinnShininessExponent, const in int maxMIPLevel) {");
                add("   float maxMIPLevelScalar = float( maxMIPLevel );");
                add("   float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );");
                add("   return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );");
                add("}");

                //add("vec3 getLightProbeIndirectRadiance(const in mat4 viewMatrix, const in Geometry geometry, const in float blinnShininessExponent, const in int maxMIPLevel) {");
                //add("   vec3 reflectVec = reflect(geometry.viewEyeDir, geometry.viewNormal);");
                //add("   reflectVec = inverseTransformDirection(reflectVec, viewMatrix);");
                //add("   float mipLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );");
                //add("   vec3 reflectionMapColor = sample_reflectMapEquirect(reflectVec, float(mipLevel));");
                //add("   return reflectionMapColor;");
                //add("}");


                if (states.lights.reflectionMap) {
                    add("vec3 getLightProbeIndirectRadiance(const in vec3 reflectVec, const in float blinnShininessExponent, const in int maxMIPLevel) {");
                    add("   float mipLevel = 0.5 * getSpecularMIPLevel(blinnShininessExponent, maxMIPLevel);"); //TODO: a random factor - fix this
                    add("   vec3 envMapColor = textureCube(reflectionMap, reflectVec, mipLevel).rgb;");
                    add("   return envMapColor;");
                    add("}");
                }

                // SPECULAR BRDF EVALUATION

                add("vec3 F_Schlick(const in vec3 specularColor, const in float dotLH) {");
                add("   float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );");
                add("   return ( 1.0 - specularColor ) * fresnel + specularColor;");
                add("}");

                add("float G_GGX_Smith(const in float alpha, const in float dotNL, const in float dotNV) {");
                add("   float a2 = pow2( alpha );");
                add("   float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );");
                add("   float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );");
                add("   return 1.0 / ( gl * gv );");
                add("}");

                add("float G_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {");
                add("   float a2 = pow2( alpha );");
                add("   float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );");
                add("   float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );");
                add("   return 0.5 / max( gv + gl, EPSILON );");
                add("}");

                add("float D_GGX(const in float alpha, const in float dotNH) {");
                add("   float a2 = pow2( alpha );");
                add("   float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;");
                add("   return RECIPROCAL_PI * a2 / pow2( denom );");
                add("}");

                add("vec3 BRDF_Specular_GGX(const in IncidentLight incidentLight, const in Geometry geometry, const in vec3 specularColor, const in float roughness) {");
                add("   float alpha = pow2( roughness );");
                add("   vec3 halfDir = normalize( incidentLight.direction + geometry.viewEyeDir );");
                add("   float dotNL = saturate( dot( geometry.viewNormal, incidentLight.direction ) );");
                add("   float dotNV = saturate( dot( geometry.viewNormal, geometry.viewEyeDir ) );");
                add("   float dotNH = saturate( dot( geometry.viewNormal, halfDir ) );");
                add("   float dotLH = saturate( dot( incidentLight.direction, halfDir ) );");
                add("   vec3  F = F_Schlick( specularColor, dotLH );");
                add("   float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );");
                add("   float D = D_GGX( alpha, dotNH );");
                add("   return F * (G * D);");
                add("}");

                add("vec3 BRDF_Specular_GGX_Environment(const in Geometry geometry, const in vec3 specularColor, const in float roughness) {");
                add("   float dotNV = saturate(dot(geometry.viewNormal, geometry.viewEyeDir));");
                add("   const vec4 c0 = vec4( -1, -0.0275, -0.572,  0.022);");
                add("   const vec4 c1 = vec4(  1,  0.0425,   1.04, -0.04);");
                add("   vec4 r = roughness * c0 + c1;");
                add("   float a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;");
                add("   vec2 AB    = vec2(-1.04, 1.04) * a004 + r.zw;");
                add("   return specularColor * AB.x + AB.y;");
                add("}");


                if (states.lights.lightMap || states.lights.reflectionMap) {

                    add("void computePBRLightMapping(const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");

                    if (states.lights.lightMap) {
                        add("   vec3 irradiance = textureCube(lightMap, geometry.worldNormal).rgb;");
                        add("   irradiance *= PI;");
                        add("   vec3 diffuseBRDFContrib = BRDF_Diffuse_Lambert(material.diffuseColor);");
                        add("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                        //   add("   reflectedLight.diffuse = vec3(1.0, 0.0, 0.0);");
                    }

                    if (states.lights.reflectionMap) {
                        add("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.viewNormal);");
                        add("   reflectVec                  = inverseTransformDirection(reflectVec, viewMatrix);");
                        add("   float blinnExpFromRoughness = GGXRoughnessToBlinnExponent(material.specularRoughness);");
                        add("   vec3 radiance               = getLightProbeIndirectRadiance(reflectVec, blinnExpFromRoughness, 8);");
                        add("   vec3 specularBRDFContrib    = BRDF_Specular_GGX_Environment(geometry, material.specularColor, material.specularRoughness);");
                        add("   reflectedLight.specular     += radiance * specularBRDFContrib;");
                    }

                    add("}");
                }

                // MAIN LIGHTING COMPUTATION FUNCTION

                add("void computePBRLighting(const in IncidentLight incidentLight, const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");
                add("   float dotNL     = saturate(dot(geometry.viewNormal, incidentLight.direction));");
                add("   vec3 irradiance = dotNL * incidentLight.color * PI;");
                add("   reflectedLight.diffuse  += irradiance * BRDF_Diffuse_Lambert(material.diffuseColor);");
                add("   reflectedLight.specular += irradiance * BRDF_Specular_GGX(incidentLight, geometry, material.specularColor, material.specularRoughness);");
                add("}");
            }

            //--------------------------------------------------------------------------------
            // GEOMETRY INPUTS
            //--------------------------------------------------------------------------------

            add("varying vec3 vViewPosition;");

            if (geometry.colors) {
                add("varying vec4 vColor;");
            }

            if (geometry.uv && ((geometry.normals && material.normalMap)
                || material.ambientMap
                || material.baseColorMap
                || material.diffuseMap
                || material.emissiveMap
                || material.metallicMap
                || material.roughnessMap
                || material.metallicRoughnessMap
                || material.specularMap
                || material.glossinessMap
                || material.specularGlossinessMap
                || material.occlusionMap
                || material.alphaMap)) {
                add("varying vec2 vUV;");
            }

            if (geometry.normals) {
                if (states.lights.lightMap) {
                    add("varying vec3 vWorldNormal;");
                }
                add("varying vec3 vViewNormal;");
            }

            //--------------------------------------------------------------------------------
            // MATERIAL CHANNEL INPUTS
            //--------------------------------------------------------------------------------

            if (material.ambient) {
                add("uniform vec3 materialAmbient;");
            }

            if (material.baseColor) {
                add("uniform vec3 materialBaseColor;");
            }

            if (material.alpha !== undefined && material.alpha !== null) {
                add("uniform float materialAlpha;");
            }

            if (material.emissive) {
                add("uniform vec3 materialEmissive;");
            }

            if (material.diffuse) {
                add("uniform vec3 materialDiffuse;");
            }

            if (material.glossiness !== undefined && material.glossiness !== null) {
                add("uniform float materialGlossiness;");
            }

            if (material.shininess !== undefined && material.shininess !== null) {
                add("uniform float materialShininess;");  // Phong channel
            }

            if (material.specular) {
                add("uniform vec3 materialSpecular;");
            }

            if (material.metallic !== undefined && material.metallic !== null) {
                add("uniform float materialMetallic;");
            }

            if (material.roughness !== undefined && material.roughness !== null) {
                add("uniform float materialRoughness;");
            }

            if (material.specularF0 !== undefined && material.specularF0 !== null) {
                add("uniform float materialSpecularF0;");
            }

            //--------------------------------------------------------------------------------
            // MATERIAL TEXTURE INPUTS
            //--------------------------------------------------------------------------------

            if (geometry.uv && material.ambientMap) {
                add("uniform sampler2D ambientMap;");
                if (material.ambientMap.matrix) {
                    add("uniform mat4 ambientMapMatrix;");
                }
            }

            if (geometry.uv && material.baseColorMap) {
                add("uniform sampler2D baseColorMap;");
                if (material.baseColorMap.matrix) {
                    add("uniform mat4 baseColorMapMatrix;");
                }
            }

            if (geometry.uv && material.diffuseMap) {
                add("uniform sampler2D diffuseMap;");
                if (material.diffuseMap.matrix) {
                    add("uniform mat4 diffuseMapMatrix;");
                }
            }

            if (geometry.uv && material.emissiveMap) {
                add("uniform sampler2D emissiveMap;");
                if (material.emissiveMap.matrix) {
                    add("uniform mat4 emissiveMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.metallicMap) {
                add("uniform sampler2D metallicMap;");
                if (material.metallicMap.matrix) {
                    add("uniform mat4 metallicMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.roughnessMap) {
                add("uniform sampler2D roughnessMap;");
                if (material.roughnessMap.matrix) {
                    add("uniform mat4 roughnessMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.metallicRoughnessMap) {
                add("uniform sampler2D metallicRoughnessMap;");
                if (material.metallicRoughnessMap.matrix) {
                    add("uniform mat4 metallicRoughnessMapMatrix;");
                }
            }

            if (geometry.normals && material.normalMap) {
                add("varying mat3 vTBN;");
                add("uniform sampler2D normalMap;");
                if (material.normalMap.matrix) {
                    add("uniform mat4 normalMapMatrix;");
                }
            }

            if (geometry.uv && material.occlusionMap) {
                add("uniform sampler2D occlusionMap;");
                if (material.occlusionMap.matrix) {
                    add("uniform mat4 occlusionMapMatrix;");
                }
            }

            if (geometry.uv && material.alphaMap) {
                add("uniform sampler2D alphaMap;");
                if (material.alphaMap.matrix) {
                    add("uniform mat4 alphaMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.specularMap) {
                add("uniform sampler2D specularMap;");
                if (material.specularMap.matrix) {
                    add("uniform mat4 specularMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.glossinessMap) {
                add("uniform sampler2D glossinessMap;");
                if (material.glossinessMap.matrix) {
                    add("uniform mat4 glossinessMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.specularGlossinessMap) {
                add("uniform sampler2D materialSpecularGlossinessMap;");
                if (material.specularGlossinessMap.matrix) {
                    add("uniform mat4 materialSpecularGlossinessMapMatrix;");
                }
            }

            //--------------------------------------------------------------------------------
            // MATERIAL FRESNEL INPUTS
            //--------------------------------------------------------------------------------

            if (geometry.normals && (material.diffuseFresnel ||
                material.specularFresnel ||
                material.alphaFresnel ||
                material.emissiveFresnel ||
                material.reflectivityFresnel)) {

                add("float fresnel(vec3 eyeDir, vec3 normal, float edgeBias, float centerBias, float power) {");
                add("    float fr = abs(dot(eyeDir, normal));");
                add("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
                add("    return pow(finalFr, power);");
                add("}");

                if (material.diffuseFresnel) {
                    add("uniform float  diffuseFresnelCenterBias;");
                    add("uniform float  diffuseFresnelEdgeBias;");
                    add("uniform float  diffuseFresnelPower;");
                    add("uniform vec3   diffuseFresnelCenterColor;");
                    add("uniform vec3   diffuseFresnelEdgeColor;");
                }

                if (material.specularFresnel) {
                    add("uniform float  specularFresnelCenterBias;");
                    add("uniform float  specularFresnelEdgeBias;");
                    add("uniform float  specularFresnelPower;");
                    add("uniform vec3   specularFresnelCenterColor;");
                    add("uniform vec3   specularFresnelEdgeColor;");
                }

                if (material.alphaFresnel) {
                    add("uniform float  alphaFresnelCenterBias;");
                    add("uniform float  alphaFresnelEdgeBias;");
                    add("uniform float  alphaFresnelPower;");
                    add("uniform vec3   alphaFresnelCenterColor;");
                    add("uniform vec3   alphaFresnelEdgeColor;");
                }

                if (material.reflectivityFresnel) {
                    add("uniform float  materialSpecularF0FresnelCenterBias;");
                    add("uniform float  materialSpecularF0FresnelEdgeBias;");
                    add("uniform float  materialSpecularF0FresnelPower;");
                    add("uniform vec3   materialSpecularF0FresnelCenterColor;");
                    add("uniform vec3   materialSpecularF0FresnelEdgeColor;");
                }

                if (material.emissiveFresnel) {
                    add("uniform float  emissiveFresnelCenterBias;");
                    add("uniform float  emissiveFresnelEdgeBias;");
                    add("uniform float  emissiveFresnelPower;");
                    add("uniform vec3   emissiveFresnelCenterColor;");
                    add("uniform vec3   emissiveFresnelEdgeColor;");
                }
            }

            //--------------------------------------------------------------------------------
            // LIGHT SOURCES
            //--------------------------------------------------------------------------------

            add("uniform vec3   lightAmbient;");
            add("uniform float  lightAmbientIntensity;");

            if (geometry.normals) {

                for (i = 0, len = lights.length; i < len; i++) { // Light sources

                    light = lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    add("uniform vec3 lightColor" + i + ";");
                    add("uniform float lightIntensity" + i + ";");

                    if (light.type === "point") {
                        add("uniform vec3 lightAttenuation" + i + ";");
                    }
                    if (light.type === "dir" && light.space === "view") {
                        add("uniform vec3 lightDir" + i + ";");
                    }
                    if (light.type === "point" && light.space === "view") {
                        add("uniform vec3 lightPos" + i + ";");
                    } else {
                        add("varying vec4 vViewLightReverseDirAndDist" + i + ";");
                    }
                }
            }

            //--------------------------------------------------------------------------------
            // SHADOWS
            //--------------------------------------------------------------------------------

            if (receiveShadow) {
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("varying vec4 vShadowPosFromLight" + i + ";");
                        add("uniform sampler2D shadowMap" + i + ";");
                    }
                }
            }

            //================================================================================
            // MAIN
            //================================================================================

            add("void main(void) {");

            if (geometry.primitiveName === "points") {
                add("vec2 cxy = 2.0 * gl_PointCoord - 1.0;");
                add("float r = dot(cxy, cxy);");
                add("if (r > 1.0) {");
                add("   discard;");
                add("}");
            }

            add("float occlusion = 1.0;");

            if (material.ambient) {
                add("vec3 ambientColor = materialAmbient;");
            } else {
                add("vec3 ambientColor = vec3(1.0, 1.0, 1.0);");
            }

            if (material.diffuse) {
                add("vec3 diffuseColor = materialDiffuse;");
            } else if (material.baseColor) {
                add("vec3 diffuseColor = materialBaseColor;");
            } else {
                add("vec3 diffuseColor = vec3(1.0, 1.0, 1.0);");
            }

            if (geometry.colors) {
                add("diffuseColor *= vColor.rgb;");
            }

            if (material.emissive) {
                add("vec3 emissiveColor = materialEmissive;"); // Emissive default is (0,0,0), so initializing here
            } else {
                add("vec3  emissiveColor = vec3(0.0, 0.0, 0.0);");
            }

            if (material.specular) {
                add("vec3 specular = materialSpecular;");
            } else {
                add("vec3 specular = vec3(1.0, 1.0, 1.0);");
            }

            if (material.alpha !== undefined) {
                add("float alpha = materialAlpha;");
            } else {
                add("float alpha = 1.0;");
            }

            if (geometry.colors) {
                add("alpha *= vColor.a;");
            }

            if (material.glossiness !== undefined) {
                add("float glossiness = materialGlossiness;");
            } else {
                add("float glossiness = 1.0;");
            }

            if (material.metallic !== undefined) {
                add("float metallic = materialMetallic;");
            } else {
                add("float metallic = 1.0;");
            }

            if (material.roughness !== undefined) {
                add("float roughness = materialRoughness;");
            } else {
                add("float roughness = 1.0;");
            }

            if (material.specularF0 !== undefined) {
                add("float specularF0 = materialSpecularF0;");
            } else {
                add("float specularF0 = 1.0;");
            }

            //--------------------------------------------------------------------------------
            // TEXTURING
            //--------------------------------------------------------------------------------

            if (geometry.uv
                && ((geometry.normals && material.normalMap)
                || material.ambientMap
                || material.baseColorMap
                || material.diffuseMap
                || material.occlusionMap
                || material.emissiveMap
                || material.metallicMap
                || material.roughnessMap
                || material.metallicRoughnessMap
                || material.specularMap
                || material.glossinessMap
                || material.specularGlossinessMap
                || material.alphaMap)) {
                add("vec4 texturePos = vec4(vUV.s, vUV.t, 1.0, 1.0);");
                add("vec2 textureCoord;");
            }

            if (geometry.uv && material.ambientMap) {
                if (material.ambientMap.matrix) {
                    add("textureCoord = (ambientMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("ambientColor *= texture2D(ambientMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.diffuseMap) {
                if (material.diffuseMap.matrix) {
                    add("textureCoord = (diffuseMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("vec4 diffuseTexel = texture2D(diffuseMap, textureCoord);");
                add("diffuseColor *= diffuseTexel.rgb;");
                add("alpha *= diffuseTexel.a;");
            }

            if (geometry.uv && material.baseColorMap) {
                if (material.baseColorMap.matrix) {
                    add("textureCoord = (baseColorMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("vec4 baseColorTexel = texture2D(baseColorMap, textureCoord);");
                add("diffuseColor *= baseColorTexel.rgb;");
                add("alpha *= baseColorTexel.a;");
            }

            if (geometry.uv && material.emissiveMap) {
                if (material.emissiveMap.matrix) {
                    add("textureCoord = (emissiveMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("emissiveColor *= texture2D(emissiveMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.alphaMap) {
                if (material.alphaMap.matrix) {
                    add("textureCoord = (alphaMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("alpha *= texture2D(alphaMap, textureCoord).r;");
            }

            if (geometry.uv && material.occlusionMap) {
                if (material.occlusionMap.matrix) {
                    add("textureCoord = (occlusionMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("occlusion *= texture2D(occlusionMap, textureCoord).r;");
            }

            if (geometry.normals && ((lights.length > 0) || states.lights.lightMap || states.lights.reflectionMap)) {

                //--------------------------------------------------------------------------------
                // SHADING
                //--------------------------------------------------------------------------------

                if (geometry.uv && material.normalMap) {
                    if (material.normalMap.matrix) {
                        add("textureCoord = (normalMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec3 viewNormal = vTBN * normalize( texture2D(normalMap, vec2(textureCoord.x, textureCoord.y) ).rgb * 2.0 - 1.0);");
                } else {
                    add("vec3 viewNormal = normalize(vViewNormal);");
                }

                if (geometry.uv && material.specularMap) {
                    if (material.specularMap.matrix) {
                        add("textureCoord = (specularMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("specular *= texture2D(specularMap, textureCoord).rgb;");
                }

                if (geometry.uv && material.glossinessMap) {
                    if (material.glossinessMap.matrix) {
                        add("textureCoord = (glossinessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("glossiness *= texture2D(glossinessMap, textureCoord).r;");
                }

                if (geometry.uv && material.specularGlossinessMap) {
                    if (material.specularGlossinessMap.matrix) {
                        add("textureCoord = (materialSpecularGlossinessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec4 specGlossRGB = texture2D(materialSpecularGlossinessMap, textureCoord).rgba;"); // TODO: what if only RGB texture?
                    add("specular *= specGlossRGB.rgb;");
                    add("glossiness *= specGlossRGB.a;");
                }

                if (geometry.uv && material.metallicMap) {
                    if (material.metallicMap.matrix) {
                        add("textureCoord = (metallicMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("metallic *= texture2D(metallicMap, textureCoord).r;");
                }

                if (geometry.uv && material.roughnessMap) {
                    if (material.roughnessMap.matrix) {
                        add("textureCoord = (roughnessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("roughness *= texture2D(roughnessMap, textureCoord).r;");
                }

                if (geometry.uv && material.metallicRoughnessMap) {
                    if (material.metallicRoughnessMap.matrix) {
                        add("textureCoord = (metallicRoughnessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec3 metalRoughRGB = texture2D(metallicRoughnessMap, textureCoord).rgb;");
                    add("metallic *= metalRoughRGB.b;");
                    add("roughness *= metalRoughRGB.g;");
                }

                add("vec3 viewEyeDir = normalize(-vViewPosition);");

                if (material.diffuseFresnel || material.specularFresnel || material.alphaFresnel || material.emissiveFresnel || material.reflectivityFresnel) {
                    if (material.diffuseFresnel) {
                        add("float diffuseFresnel = fresnel(viewEyeDir, viewNormal, diffuseFresnelEdgeBias, diffuseFresnelCenterBias, diffuseFresnelPower);");
                        add("diffuseColor *= mix(diffuseFresnelEdgeColor, diffuseFresnelCenterColor, diffuseFresnel);");
                    }
                    if (material.specularFresnel) {
                        add("float specularFresnel = fresnel(viewEyeDir, viewNormal, specularFresnelEdgeBias, specularFresnelCenterBias, specularFresnelPower);");
                        add("specular *= mix(specularFresnelEdgeColor, specularFresnelCenterColor, specularFresnel);");
                    }
                    if (material.alphaFresnel) {
                        add("float alphaFresnel = fresnel(viewEyeDir, viewNormal, alphaFresnelEdgeBias, alphaFresnelCenterBias, alphaFresnelPower);");
                        add("alpha *= mix(alphaFresnelEdgeColor.r, alphaFresnelCenterColor.r, alphaFresnel);");
                    }
                    if (material.emissiveFresnel) {
                        add("float emissiveFresnel = fresnel(viewEyeDir, viewNormal, emissiveFresnelEdgeBias, emissiveFresnelCenterBias, emissiveFresnelPower);");
                        add("emissiveColor *= mix(emissiveFresnelEdgeColor, emissiveFresnelCenterColor, emissiveFresnel);");
                    }
                }

                // PREPARE INPUTS FOR SHADER FUNCTIONS

                add("IncidentLight  light;");
                add("Material       material;");
                add("Geometry       geometry;");
                add("ReflectedLight reflectedLight = ReflectedLight(vec3(0.0,0.0,0.0), vec3(0.0,0.0,0.0));");
                add("vec3           viewLightDir;");

                if (phongMaterial) {
                    add("material.diffuseColor      = diffuseColor;");
                    add("material.specularColor     = specular;");
                    add("material.shine             = materialShininess;");
                }

                if (pbrSpecGloss) {
                    add("float oneMinusSpecularStrength = 1.0 - max(max(specular.r, specular.g ),specular.b);"); // Energy conservation
                    add("material.diffuseColor      = diffuseColor * oneMinusSpecularStrength;");
                    add("material.specularRoughness = clamp( 1.0 - glossiness, 0.04, 1.0 );");
                    add("material.specularColor     = specular;");
                }

                if (pbrMetalRough) {
                    add("float dielectricSpecular = 0.16 * specularF0 * specularF0;");
                    add("material.diffuseColor      = diffuseColor * (1.0 - dielectricSpecular) * (1.0 - metallic);");
                    add("material.specularRoughness = clamp(roughness, 0.04, 1.0);");
                    add("material.specularColor     = mix(vec3(dielectricSpecular), diffuseColor, metallic);");
                }

                add("geometry.position      = vViewPosition;");
                if (states.lights.lightMap) {
                    add("geometry.worldNormal   = normalize(vWorldNormal);");
                }
                add("geometry.viewNormal    = viewNormal;");
                add("geometry.viewEyeDir    = viewEyeDir;");

                // ENVIRONMENT AND REFLECTION MAP SHADING

                if ((phongMaterial) && (states.lights.lightMap || states.lights.reflectionMap)) {
                    add("computePhongLightMapping(geometry, material, reflectedLight);");
                }

                if ((pbrSpecGloss || pbrMetalRough) && (states.lights.lightMap || states.lights.reflectionMap)) {
                    add("computePBRLightMapping(geometry, material, reflectedLight);");
                }

                // LIGHT SOURCE SHADING

                var light;

                for (i = 0, len = lights.length; i < len; i++) {

                    light = lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }
                    if (light.type === "dir" && light.space === "view") {
                        add("viewLightDir = -normalize(lightDir" + i + ");");
                    } else if (light.type === "point" && light.space === "view") {
                        add("viewLightDir = normalize(lightPos" + i + " - vViewPosition);");
                        //add("tmpVec3 = lightPos" + i + ".xyz - viewPosition.xyz;");
                        //add("lightDist = abs(length(tmpVec3));");
                    } else {
                        add("viewLightDir = normalize(vViewLightReverseDirAndDist" + i + ".xyz);"); // If normal mapping, the fragment->light vector will be in tangent space
                    }

                    add("light.direction = viewLightDir;");
                    add("light.color = lightIntensity" + i + " * lightColor" + i + ";");

                    if (phongMaterial) {
                        add("computePhongLighting(light, geometry, material, reflectedLight);");
                    }

                    if (pbrSpecGloss || pbrMetalRough) {
                        add("computePBRLighting(light, geometry, material, reflectedLight);");
                    }
                }

                //--------------------------------------------------------------------------------
                // Shadow mapping
                //--------------------------------------------------------------------------------

                add("float shadow = 1.0;");

                if (receiveShadow) {

                    add("vec3 shadowCoord;");
                    add("float depth;");
                    add("vec4 rgbaDepth;");

                    for (i = 0, len = lights.length; i < len; i++) { // Light sources

                        light = lights[i];

                        if (light.shadow) {
                            add("shadowCoord = (vShadowPosFromLight" + i + ".xyz / vShadowPosFromLight" + i + ".w) / 2.0 - 1.0;");
                            add("rgbaDepth = texture2D(shadowMap" + i + ", shadowCoord.xy);");
                            add("depth = rgbaDepth.r;");
                            add("shadow *= (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;");
                            //add("shadow *= (shadowCoord.z == 0.0) ? 0.2 : 1.0;");
                        }
                    }
                }

                // COMBINE TERMS

                if (phongMaterial) {

                    add("ambientColor *= lightAmbient;");

                    add("vec3 outgoingLight =  (shadow * occlusion * (ambientColor + reflectedLight.diffuse + reflectedLight.specular)) + emissiveColor;");

                } else {
                    add("vec3 outgoingLight = (shadow * occlusion * reflectedLight.diffuse) + (shadow * occlusion * reflectedLight.specular) + emissiveColor;");
                }

            } else {

                //--------------------------------------------------------------------------------
                // NO SHADING - EMISSIVE and AMBIENT ONLY
                //--------------------------------------------------------------------------------

                add("ambientColor *= lightAmbient;");

                add("vec3 outgoingLight = emissiveColor + ambientColor;");
            }


            add("gl_FragColor = vec4(outgoingLight, alpha);");
             //    add("gl_FragColor = LinearTosRGB(gl_FragColor);");  // Gamma correction

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

    })
    ();

})
();