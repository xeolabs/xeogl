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
        var opacityFresnel;
        var reflectivityFresnel;
        var emissiveFresnel;
        var receiveShadow;

        var vertexPickObjectSrc;
        var fragmentPickObjectSrc;
        var vertexPickPrimSrc;
        var fragmentPickPrimSrc;
        var vertexShadowSrc;
        var fragmentShadowSrc;

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
            opacityFresnel = states.material.opacityFresnel;
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
                fragmentShadow()
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
                material.opacityMap ||
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

        /// NOTE: Shadow shaders will become more complex and will eventually be
        // composed from state, in the same manner as the draw shaders.

        function vertexShadow() {
            begin();
            add("// Shadow map vertex shader");
            add("attribute vec3 xeo_aPosition;");
            add("uniform mat4 xeo_uModelMatrix;");
            add("uniform mat4 xeo_uShadowViewMatrix;");
            add("uniform mat4 xeo_uShadowProjMatrix;");
            add("void main(void) {");
            add("   gl_Position = xeo_uShadowProjMatrix * (xeo_uShadowViewMatrix * (xeo_uModelMatrix * (vec4(xeo_aPosition, 1.0))));");
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

        function vertexDraw() {

            var vertex = states.shader.vertex;

            if (vertex) { // Custom vertex shader
                return vertex;
            }

            var i;
            var len;
            var lights = states.lights.lights;
            var light;

            begin();

            add("// Drawing vertex shader");
            add("attribute  vec3 xeo_aPosition;");

            add("uniform    mat4 xeo_uModelMatrix;");
            add("uniform    mat4 xeo_uViewMatrix;");
            add("uniform    mat4 xeo_uProjMatrix;");

            add("varying    vec3 xeo_vViewPosition;");
            add("varying    vec3 xeo_vWorldPosition;");
            add("varying    vec3 xeo_vWorldNormal;");

            if (normals) {

                add("attribute  vec3 xeo_aNormal;");

                add("uniform    mat4 xeo_uModelNormalMatrix;");
                add("uniform    mat4 xeo_uViewNormalMatrix;");

                add("varying    vec3 xeo_vViewEyeVec;");
                add("varying    vec3 xeo_vViewNormal;");
                add("varying    mat3 xeo_TBN;");

                for (i = 0, len = states.lights.lights.length; i < len; i++) {

                    light = states.lights.lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    if (light.type === "dir") {
                        add("uniform vec3 xeo_uLightDir" + i + ";");
                    }

                    if (light.type === "point") {
                        add("uniform vec3 xeo_uLightPos" + i + ";");
                    }

                    if (light.type === "spot") {
                        add("uniform vec3 xeo_uLightPos" + i + ";");
                    }

                    add("varying vec4 xeo_vViewLightReverseDirAndDist" + i + ";");
                }
            }

            if (normalMapping) {
                add("attribute vec3 xeo_aTangent;");
            }

            if (texturing) {
                add("attribute vec2 xeo_aUV;");
                add("varying vec2 xeo_vUV;");
            }

            if (states.geometry.colors) {
                add("attribute vec4 xeo_aColor;");
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

            if (receiveShadow) {
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("uniform mat4 xeo_uShadowViewMatrix" + i + ";");
                        add("uniform mat4 xeo_uShadowProjMatrix" + i + ";");
                        add("varying vec4 xeo_vShadowPositionFromLight" + i + ";");
                    }
                }
            }

            add("void main(void) {");

            add("vec4 localPosition = vec4(xeo_aPosition, 1.0); ");
            add("vec4 worldPosition;");

            if (normals) {
                add("vec4 localNormal = vec4(xeo_aNormal, 0.0); ");
                add("mat4 modelNormalMatrix = xeo_uModelNormalMatrix;");
                add("mat4 viewNormalMatrix = xeo_uViewNormalMatrix;");
            }

            add("mat4 modelMatrix = xeo_uModelMatrix;");
            add("mat4 viewMatrix = xeo_uViewMatrix;");

            if (states.stationary.active) {
                add("viewMatrix[3][0] = viewMatrix[3][1] = viewMatrix[3][2] = 0.0;")
            }

            if (states.billboard.active) {

                add("mat4 modelViewMatrix = xeo_uViewMatrix * xeo_uModelMatrix;");

                add("billboard(modelMatrix);");
                add("billboard(viewMatrix);");
                add("billboard(modelViewMatrix);");

                if (normals) {
                    add("mat4 modelViewNormalMatrix =  xeo_uViewNormalMatrix * xeo_uModelNormalMatrix;");
                    add("billboard(modelNormalMatrix);");
                    add("billboard(viewNormalMatrix);");
                    add("billboard(modelViewNormalMatrix);");
                }

                add("worldPosition = modelMatrix * localPosition;");
                add("vec4 viewPosition = modelViewMatrix * localPosition;");

            } else {

                add("worldPosition = modelMatrix * localPosition;");
                add("vec4 viewPosition  = viewMatrix * worldPosition; ");
            }

            if (normals) {

                add("vec3 worldNormal = (modelNormalMatrix * localNormal).xyz; ");
                add("xeo_vWorldNormal = worldNormal;");
                add("xeo_vViewNormal = normalize((viewNormalMatrix * vec4(worldNormal, 1.0)).xyz);");

                if (normalMapping) {

                    add("mat4 mat =  viewMatrix * modelMatrix;");

                    add("vec3 n = normalize( ( mat * vec4( xeo_aNormal, 0.0 ) ).xyz );");
                    add("vec3 t = normalize( ( mat * vec4( xeo_aTangent, 0.0 ) ).xyz );");
                    add("vec3 b = normalize( ( mat * vec4( ( cross(xeo_aNormal, xeo_aTangent.xyz ) * 1.0 ), 0.0 ) ).xyz );");

                    add("xeo_TBN = mat3(t, b, n);");
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
                            add("tmpVec3 = vec3(viewMatrix * vec4(xeo_uLightDir" + i + ", 0.0) ).xyz;");
                        } else {
                            add("tmpVec3 = xeo_uLightDir" + i + ";");
                        }

                        add("xeo_vViewLightReverseDirAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                    }

                    if (light.type === "point") {

                        if (light.space === "world") {
                            add("tmpVec3 = (viewMatrix * vec4(xeo_uLightPos" + i + ", 1.0)).xyz - viewPosition.xyz;");
                            add("lightDist = abs(length(tmpVec3));");

                        } else {
                            add("tmpVec3 = xeo_uLightPos" + i + ".xyz - viewPosition.xyz;");
                            add("lightDist = abs(length(tmpVec3));");
                        }

                        add("xeo_vViewLightReverseDirAndDist" + i + " = vec4(tmpVec3, lightDist);");
                    }
                }

                add("xeo_vViewEyeVec = -viewPosition.xyz;");
            }

            if (texturing) {
                add("xeo_vUV = xeo_aUV;");
            }

            if (states.geometry.colors) {
                add("xeo_vColor = xeo_aColor;");
            }

            if (states.geometry.primitiveName === "points") {
                add("gl_PointSize = xeo_uPointSize;");
            }
            add("   xeo_vViewPosition = viewPosition.xyz;");
            add("   gl_Position = xeo_uProjMatrix * viewPosition;");

            if (receiveShadow) {
                add("vec4 tempx; ");
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("xeo_vShadowPositionFromLight" + i + " = xeo_uShadowProjMatrix" + i + " * (xeo_uShadowViewMatrix" + i + " * worldPosition); ");
                        //add("tempx = xeo_uShadowViewMatrix" + i + " * worldPosition; ");
                        //add("tempx = xeo_uShadowProjMatrix" + i + " * tempx; ");
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
                add("uniform samplerCube xeo_uLightMap;");
                add("uniform    mat4 xeo_uViewNormalMatrix;");
            }

            if (states.lights.reflectionMap) {
                add("uniform samplerCube xeo_uReflectionMap;");
            }

            if (states.lights.lightMap || states.lights.reflectionMap) {
                add("uniform mat4 xeo_uViewMatrix;");
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
                        add("   vec3 irradiance = textureCube(xeo_uLightMap, geometry.worldNormal).rgb;");
                        add("   irradiance *= PI;");
                        add("   vec3 diffuseBRDFContrib = BRDF_Diffuse_Lambert(material.diffuseColor);");
                        add("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                    }

                    if (states.lights.reflectionMap) {
                        //     add("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.worldNormal);");
                        //   //  add("   reflectVec                  = inverseTransformDirection(reflectVec, xeo_uViewMatrix);");
                        //     add("   vec3 radiance               = textureCube(xeo_uReflectionMap, geometry.worldNormal).rgb;");
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
                //add("   vec4 texColor = texture2D(xeo_uReflectionMap, sampleUV, mipLevel);");
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
                    add("   vec3 envMapColor = textureCube(xeo_uReflectionMap, reflectVec, mipLevel).rgb;");
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
                        add("   vec3 irradiance = textureCube(xeo_uLightMap, geometry.worldNormal).rgb;");
                        add("   irradiance *= PI;");
                        add("   vec3 diffuseBRDFContrib = BRDF_Diffuse_Lambert(material.diffuseColor);");
                        add("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                        //   add("   reflectedLight.diffuse = vec3(1.0, 0.0, 0.0);");
                    }

                    if (states.lights.reflectionMap) {
                        add("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.viewNormal);");
                        add("   reflectVec                  = inverseTransformDirection(reflectVec, xeo_uViewMatrix);");
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

            add("varying vec3 xeo_vViewPosition;");
            add("varying vec3 xeo_vWorldPosition;");

            if (geometry.colors) {
                add("varying vec4 xeo_vColor;");
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
                || material.opacityMap)) {
                add("varying vec2 xeo_vUV;");
            }

            if (geometry.normals) {
                add("varying vec3 xeo_vWorldNormal;");
                add("varying vec3 xeo_vViewNormal;");
            }

            //--------------------------------------------------------------------------------
            // MATERIAL CHANNEL INPUTS
            //--------------------------------------------------------------------------------

            if (material.ambient) {
                add("uniform vec3 xeo_uAmbient;");
            }

            if (material.baseColor) {
                add("uniform vec3 xeo_uBaseColor;");
            }

            if (material.opacity !== undefined && material.opacity !== null) {
                add("uniform float xeo_uOpacity;");
            }

            if (material.emissive) {
                add("uniform vec3 xeo_uEmissive;");
            }

            if (material.diffuse) {
                add("uniform vec3 xeo_uDiffuse;");
            }

            if (material.glossiness !== undefined && material.glossiness !== null) {
                add("uniform float xeo_uGlossiness;");
            }

            if (material.shininess !== undefined && material.shininess !== null) {
                add("uniform float xeo_uShininess;");  // Phong channel
            }

            if (material.specular) {
                add("uniform vec3 xeo_uSpecular;");
            }

            if (material.metallic !== undefined && material.metallic !== null) {
                add("uniform float xeo_uMetallic;");
            }

            if (material.roughness !== undefined && material.roughness !== null) {
                add("uniform float xeo_uRoughness;");
            }

            if (material.specularF0 !== undefined && material.specularF0 !== null) {
                add("uniform float xeo_uSpecularF0;");
            }

            //--------------------------------------------------------------------------------
            // MATERIAL TEXTURE INPUTS
            //--------------------------------------------------------------------------------

            if (geometry.uv && material.ambientMap) {
                add("uniform sampler2D xeo_uAmbientMap;");
                if (material.ambientMap.matrix) {
                    add("uniform mat4 xeo_uAmbientMapMatrix;");
                }
            }

            if (geometry.uv && material.baseColorMap) {
                add("uniform sampler2D xeo_uBaseColorMap;");
                if (material.baseColorMap.matrix) {
                    add("uniform mat4 xeo_uBaseColorMapMatrix;");
                }
            }

            if (geometry.uv && material.diffuseMap) {
                add("uniform sampler2D xeo_uDiffuseMap;");
                if (material.diffuseMap.matrix) {
                    add("uniform mat4 xeo_uDiffuseMapMatrix;");
                }
            }

            if (geometry.uv && material.emissiveMap) {
                add("uniform sampler2D xeo_uEmissiveMap;");
                if (material.emissiveMap.matrix) {
                    add("uniform mat4 xeo_uEmissiveMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.metallicMap) {
                add("uniform sampler2D xeo_uMetallicMap;");
                if (material.metallicMap.matrix) {
                    add("uniform mat4 xeo_uMetallicMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.roughnessMap) {
                add("uniform sampler2D xeo_uRoughnessMap;");
                if (material.roughnessMap.matrix) {
                    add("uniform mat4 xeo_uRoughnessMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.metallicRoughnessMap) {
                add("uniform sampler2D xeo_uMetallicRoughnessMap;");
                if (material.metallicRoughnessMap.matrix) {
                    add("uniform mat4 xeo_uMetallicRoughnessMapMatrix;");
                }
            }

            if (geometry.normals && material.normalMap) {
                add("varying mat3 xeo_TBN;");
                add("uniform sampler2D xeo_uNormalMap;");
                if (material.normalMap.matrix) {
                    add("uniform mat4 xeo_uNormalMapMatrix;");
                }
            }

            if (geometry.uv && material.occlusionMap) {
                add("uniform sampler2D xeo_uOcclusionMap;");
                if (material.occlusionMap.matrix) {
                    add("uniform mat4 xeo_uOcclusionMapMatrix;");
                }
            }

            if (geometry.uv && material.opacityMap) {
                add("uniform sampler2D xeo_uOpacityMap;");
                if (material.opacityMap.matrix) {
                    add("uniform mat4 xeo_uOpacityMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.specularMap) {
                add("uniform sampler2D xeo_uSpecularMap;");
                if (material.specularMap.matrix) {
                    add("uniform mat4 xeo_uSpecularMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.glossinessMap) {
                add("uniform sampler2D xeo_uGlossinessMap;");
                if (material.glossinessMap.matrix) {
                    add("uniform mat4 xeo_uGlossinessMapMatrix;");
                }
            }

            if (geometry.normals && geometry.uv && material.specularGlossinessMap) {
                add("uniform sampler2D xeo_uSpecularGlossinessMap;");
                if (material.specularGlossinessMap.matrix) {
                    add("uniform mat4 xeo_uSpecularGlossinessMapMatrix;");
                }
            }

            //--------------------------------------------------------------------------------
            // MATERIAL FRESNEL INPUTS
            //--------------------------------------------------------------------------------

            if (geometry.normals && (material.diffuseFresnel ||
                material.specularFresnel ||
                material.opacityFresnel ||
                material.emissiveFresnel ||
                material.reflectivityFresnel)) {

                add("float fresnel(vec3 eyeDir, vec3 normal, float edgeBias, float centerBias, float power) {");
                add("    float fr = abs(dot(eyeDir, normal));");
                add("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
                add("    return pow(finalFr, power);");
                add("}");

                if (material.diffuseFresnel) {
                    add("uniform float  xeo_uDiffuseFresnelCenterBias;");
                    add("uniform float  xeo_uDiffuseFresnelEdgeBias;");
                    add("uniform float  xeo_uDiffuseFresnelPower;");
                    add("uniform vec3   xeo_uDiffuseFresnelCenterColor;");
                    add("uniform vec3   xeo_uDiffuseFresnelEdgeColor;");
                }

                if (material.specularFresnel) {
                    add("uniform float  xeo_uSpecularFresnelCenterBias;");
                    add("uniform float  xeo_uSpecularFresnelEdgeBias;");
                    add("uniform float  xeo_uSpecularFresnelPower;");
                    add("uniform vec3   xeo_uSpecularFresnelCenterColor;");
                    add("uniform vec3   xeo_uSpecularFresnelEdgeColor;");
                }

                if (material.opacityFresnel) {
                    add("uniform float  xeo_uOpacityFresnelCenterBias;");
                    add("uniform float  xeo_uOpacityFresnelEdgeBias;");
                    add("uniform float  xeo_uOpacityFresnelPower;");
                    add("uniform vec3   xeo_uOpacityFresnelCenterColor;");
                    add("uniform vec3   xeo_uOpacityFresnelEdgeColor;");
                }

                if (material.reflectivityFresnel) {
                    add("uniform float  xeo_uSpecularF0FresnelCenterBias;");
                    add("uniform float  xeo_uSpecularF0FresnelEdgeBias;");
                    add("uniform float  xeo_uSpecularF0FresnelPower;");
                    add("uniform vec3   xeo_uSpecularF0FresnelCenterColor;");
                    add("uniform vec3   xeo_uSpecularF0FresnelEdgeColor;");
                }

                if (material.emissiveFresnel) {
                    add("uniform float  xeo_uEmissiveFresnelCenterBias;");
                    add("uniform float  xeo_uEmissiveFresnelEdgeBias;");
                    add("uniform float  xeo_uEmissiveFresnelPower;");
                    add("uniform vec3   xeo_uEmissiveFresnelCenterColor;");
                    add("uniform vec3   xeo_uEmissiveFresnelEdgeColor;");
                }
            }

            //--------------------------------------------------------------------------------
            // LIGHT SOURCES
            //--------------------------------------------------------------------------------

            add("uniform vec3   xeo_uLightAmbientColor;");
            add("uniform float  xeo_uLightAmbientIntensity;");

            if (geometry.normals) {

                add("varying vec3 xeo_vViewEyeVec;");

                for (i = 0, len = lights.length; i < len; i++) { // Light sources

                    light = lights[i];

                    if (light.type === "ambient") {
                        continue;
                    }

                    add("uniform vec3 xeo_uLightColor" + i + ";");
                    add("uniform float xeo_uLightIntensity" + i + ";");

                    if (light.type === "point") {
                        add("uniform vec3 xeo_uLightAttenuation" + i + ";");
                    }

                    add("varying vec4 xeo_vViewLightReverseDirAndDist" + i + ";"); // Vector from light to vertex
                }
            }

            //--------------------------------------------------------------------------------
            // SHADOWS
            //--------------------------------------------------------------------------------

            if (receiveShadow) {
                for (i = 0, len = lights.length; i < len; i++) { // Light sources
                    if (lights[i].shadow) {
                        add("varying vec4 xeo_vShadowPositionFromLight" + i + ";");
                        add("uniform sampler2D xeo_uShadowMap" + i + ";");
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
                add("vec3 ambient = xeo_uAmbient;");
            } else {
                add("vec3 ambient = vec3(1.0, 1.0, 1.0);");
            }

            if (material.diffuse) {
                add("vec3 diffuse = xeo_uDiffuse;");
            } else if (material.baseColor) {
                add("vec3 diffuse = xeo_uBaseColor;");
            } else {
                add("vec3 diffuse = vec3(1.0, 1.0, 1.0);");
            }

            if (material.emissive) {
                add("vec3 emissive = xeo_uEmissive;"); // Emissive default is (0,0,0), so initializing here
            } else {
                add("vec3  emissive = vec3(0.0, 0.0, 0.0);");
            }

            if (material.specular) {
                add("vec3 specular = xeo_uSpecular;");
            } else {
                add("vec3 specular = vec3(1.0, 1.0, 1.0);");
            }

            if (material.opacity !== undefined) {
                add("float opacity = xeo_uOpacity;");
            } else {
                add("float opacity = 1.0;");
            }

            if (material.glossiness !== undefined) {
                add("float glossiness = xeo_uGlossiness;");
            } else {
                add("float glossiness = 1.0;");
            }

            if (material.metallic !== undefined) {
                add("float metallic = xeo_uMetallic;");
            } else {
                add("float metallic = 1.0;");
            }

            if (material.roughness !== undefined) {
                add("float roughness = xeo_uRoughness;");
            } else {
                add("float roughness = 1.0;");
            }

            if (material.specularF0 !== undefined) {
                add("float specularF0 = xeo_uSpecularF0;");
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
                || material.opacityMap)) {
                add("vec4 texturePos = vec4(xeo_vUV.s, xeo_vUV.t, 1.0, 1.0);");
                add("vec2 textureCoord;");
            }

            if (geometry.uv && material.ambientMap) {
                if (material.ambientMap.matrix) {
                    add("textureCoord = (xeo_uAmbientMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("ambient *= texture2D(xeo_uAmbientMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.diffuseMap) {
                if (material.diffuseMap.matrix) {
                    add("textureCoord = (xeo_uDiffuseMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("diffuse *= texture2D(xeo_uDiffuseMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.baseColorMap) {
                if (material.baseColorMap.matrix) {
                    add("textureCoord = (xeo_uBaseColorMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("diffuse *= texture2D(xeo_uBaseColorMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.emissiveMap) {
                if (material.emissiveMap.matrix) {
                    add("textureCoord = (xeo_uEmissiveMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("emissive *= texture2D(xeo_uEmissiveMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.opacityMap) {
                if (material.opacityMap.matrix) {
                    add("textureCoord = (xeo_uOpacityMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("opacity *= texture2D(xeo_uOpacityMap, textureCoord).r;");
            }

            if (geometry.uv && material.occlusionMap) {
                if (material.occlusionMap.matrix) {
                    add("textureCoord = (xeo_uOcclusionMapMatrix * texturePos).xy;");
                } else {
                    add("textureCoord = texturePos.xy;");
                }
                add("occlusion *= texture2D(xeo_uOcclusionMap, textureCoord).r;");
            }

            if (geometry.normals && ((lights.length > 0) || states.lights.lightMap || states.lights.reflectionMap)) {

                //--------------------------------------------------------------------------------
                // SHADING
                //--------------------------------------------------------------------------------

                if (material.normalMap) {
                    if (material.normalMap.matrix) {
                        add("textureCoord = (xeo_uNormalMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec3 viewNormal = xeo_TBN * normalize( texture2D(xeo_uNormalMap, vec2(textureCoord.x, textureCoord.y) ).rgb * 2.0 - 1.0);");
                } else {
                    add("vec3 viewNormal = normalize(xeo_vViewNormal);");
                }

                if (geometry.uv && material.specularMap) {
                    if (material.specularMap.matrix) {
                        add("textureCoord = (xeo_uSpecularMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("specular *= texture2D(xeo_uSpecularMap, textureCoord).rgb;");
                }

                if (geometry.uv && material.glossinessMap) {
                    if (material.glossinessMap.matrix) {
                        add("textureCoord = (xeo_uGlossinessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("glossiness *= texture2D(xeo_uGlossinessMap, textureCoord).r;");
                }

                if (geometry.uv && material.specularGlossinessMap) {
                    if (material.specularGlossinessMap.matrix) {
                        add("textureCoord = (xeo_uSpecularGlossinessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec4 specGlossRGB = texture2D(xeo_uSpecularGlossinessMap, textureCoord).rgba;"); // TODO: what if only RGB texture?
                    add("specular *= specGlossRGB.rgb;");
                    add("glossiness *= specGlossRGB.a;");
                }

                if (geometry.uv && material.metallicMap) {
                    if (material.metallicMap.matrix) {
                        add("textureCoord = (xeo_uMetallicMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("metallic *= texture2D(xeo_uMetallicMap, textureCoord).r;");
                }

                if (geometry.uv && material.roughnessMap) {
                    if (material.roughnessMap.matrix) {
                        add("textureCoord = (xeo_uRoughnessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("roughness *= texture2D(xeo_uRoughnessMap, textureCoord).r;");
                }

                if (geometry.uv && material.metallicRoughnessMap) {
                    if (material.metallicRoughnessMap.matrix) {
                        add("textureCoord = (xeo_uMetallicRoughnessMapMatrix * texturePos).xy;");
                    } else {
                        add("textureCoord = texturePos.xy;");
                    }
                    add("vec3 metalRoughRGB = texture2D(xeo_uMetallicRoughnessMap, textureCoord).rgb;");
                    add("metallic *= metalRoughRGB.r;");
                    add("roughness *= metalRoughRGB.g;");
                }

                add("vec3 viewEyeDir = normalize(-xeo_vViewPosition);");

                if (material.diffuseFresnel || material.specularFresnel || material.opacityFresnel || material.emissiveFresnel || material.reflectivityFresnel) {
                    if (material.diffuseFresnel) {
                        add("float diffuseFresnel = fresnel(viewEyeDir, viewNormal, xeo_uDiffuseFresnelEdgeBias, xeo_uDiffuseFresnelCenterBias, xeo_uDiffuseFresnelPower);");
                        add("diffuse *= mix(xeo_uDiffuseFresnelEdgeColor, xeo_uDiffuseFresnelCenterColor, diffuseFresnel);");
                    }
                    if (material.specularFresnel) {
                        add("float specularFresnel = fresnel(viewEyeDir, viewNormal, xeo_uSpecularFresnelEdgeBias, xeo_uSpecularFresnelCenterBias, xeo_uSpecularFresnelPower);");
                        add("specular *= mix(xeo_uSpecularFresnelEdgeColor, xeo_uSpecularFresnelCenterColor, specularFresnel);");
                    }
                    if (material.opacityFresnel) {
                        add("float opacityFresnel = fresnel(viewEyeDir, viewNormal, xeo_uOpacityFresnelEdgeBias, xeo_uOpacityFresnelCenterBias, xeo_uOpacityFresnelPower);");
                        add("opacity *= mix(xeo_uOpacityFresnelEdgeColor.r, xeo_uOpacityFresnelCenterColor.r, opacityFresnel);");
                    }
                    if (material.emissiveFresnel) {
                        add("float emissiveFresnel = fresnel(viewEyeDir, viewNormal, xeo_uEmissiveFresnelEdgeBias, xeo_uEmissiveFresnelCenterBias, xeo_uEmissiveFresnelPower);");
                        add("emissive *= mix(xeo_uEmissiveFresnelEdgeColor, xeo_uEmissiveFresnelCenterColor, emissiveFresnel);");
                    }
                }

                // PREPARE INPUTS FOR SHADER FUNCTIONS

                add("IncidentLight  light;");
                add("Material       material;");
                add("Geometry       geometry;");
                add("ReflectedLight reflectedLight = ReflectedLight(vec3(0.0,0.0,0.0), vec3(0.0,0.0,0.0));");
                add("vec3           viewLightDir;");

                if (phongMaterial) {
                    add("material.diffuseColor      = diffuse;");
                    add("material.specularColor     = specular;");
                    add("material.shine             = xeo_uShininess;");
                }

                if (pbrSpecGloss) {
                    add("float oneMinusSpecularStrength = 1.0 - max(max(specular.r, specular.g ),specular.b);"); // Energy conservation
                    add("material.diffuseColor      = diffuse * oneMinusSpecularStrength;");
                    add("material.specularRoughness = clamp( 1.0 - glossiness, 0.04, 1.0 );");
                    add("material.specularColor     = specular;");
                }

                if (pbrMetalRough) {
                    add("float dielectricSpecular = 0.16 * specularF0 * specularF0;");
                    add("material.diffuseColor      = diffuse * (1.0 - dielectricSpecular) * (1.0 - metallic);");
                    add("material.specularRoughness = clamp(roughness, 0.04, 1.0);");
                    add("material.specularColor     = mix(vec3(dielectricSpecular), diffuse, metallic);");
                }

                add("geometry.position      = xeo_vViewPosition;");
                if (states.lights.lightMap) {
                    add("geometry.worldNormal   = normalize(xeo_vWorldNormal);");
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

                    add("viewLightDir = normalize(xeo_vViewLightReverseDirAndDist" + i + ".xyz);"); // If normal mapping, the fragment->light vector will be in tangent space

                    add("light.direction = viewLightDir;");
                    add("light.color = xeo_uLightIntensity" + i + " * xeo_uLightColor" + i + ";");

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
                            add("shadowCoord = (xeo_vShadowPositionFromLight" + i + ".xyz / xeo_vShadowPositionFromLight" + i + ".w) / 2.0 - 1.0;");
                            add("rgbaDepth = texture2D(xeo_uShadowMap" + i + ", shadowCoord.xy);");
                            add("depth = rgbaDepth.r;");
                            add("shadow *= (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;");
                            //add("shadow *= (shadowCoord.z == 0.0) ? 0.2 : 1.0;");
                        }
                    }
                }

                // COMBINE TERMS

                if (phongMaterial) {

                    add("ambient *= xeo_uLightAmbientColor;");

                    add("vec3 outgoingLight =  (shadow * occlusion * (ambient + reflectedLight.diffuse + reflectedLight.specular)) + emissive;");

                } else {
                    add("vec3 outgoingLight = (shadow * occlusion * reflectedLight.diffuse) + (shadow * occlusion * reflectedLight.specular) + emissive;");
                }

            } else {

                //--------------------------------------------------------------------------------
                // NO SHADING - EMISSIVE ONLY
                //--------------------------------------------------------------------------------

                add("vec3 outgoingLight = emissive;");
            }


            add("gl_FragColor = vec4(outgoingLight, opacity);");
           //     add("gl_FragColor = LinearTosRGB(gl_FragColor);");  // Gamma correction

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