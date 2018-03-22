/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.DrawShaderSource = function (gl, scene, object) {
        var cfg = {
            texturing: hasTextures(object),
            normals: hasNormals(object),
            normalMapping: hasNormalMap(object),
            clipping: scene.clips.clips.length > 0,
            solid: false && object.material.backfaces,
            lambertMaterial: (object.material.type === "LambertMaterial"),
            phongMaterial: (object.material.type === "PhongMaterial"),
            metallicMaterial: (object.material.type === "MetallicMaterial"),
            specularMaterial: (object.material.type === "SpecularMaterial"),
            reflection: hasReflection(scene),
            receiveShadow: receivesShadow(scene, object),
            quantizedGeometry: !!object.geometry.quantized,
            gammaInput: scene.gammaInput, // If set, then it expects that all textures and colors are premultiplied gamma. Default is false.
            gammaOutput: scene.gammaOutput // If set, then it expects that all textures and colors need to be outputted in premultiplied gamma. Default is false.
        };
        this.vertex = cfg.lambertMaterial ? buildVertexLambert(gl, cfg, scene, object) : buildVertexDraw(gl, cfg, scene, object);
        this.fragment = cfg.lambertMaterial ? buildFragmentLambert(gl, cfg, scene, object) : buildFragmentDraw(gl, cfg, scene, object);
    };

    function receivesShadow(scene, object) {
        if (!object.modes.receiveShadow) {
            return false;
        }
        var lights = scene.lights.lights;
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

    function hasTextures(object) {
        if (!object.geometry.uv) {
            return false;
        }
        var material = object.material;
        return !!(material.ambientMap ||
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
        object.material.normalMap);
    }

    function hasReflection(scene) {
        return false;
        //return (object.cubemap.layers && object.cubemap.layers.length > 0 && object.geometry.normalBuf);
    }

    function hasNormals(object) {
        var primitive = object.geometry.primitiveName;
        if ((object.geometry.autoVertexNormals || object.geometry.normals) && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
            return true;
        }
        return false;
    }

    function hasNormalMap(object) {
        var geometry = object.geometry;
        var result = (!!geometry.positions && !!geometry.indices && !!geometry.normals && !!geometry.uv && !!object.material.normalMap);
        return result;
    }

    function getFragmentFloatPrecision(gl) {
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

    const TEXTURE_DECODE_FUNCS = {
        "linear":   "linearToLinear",
        "sRGB":     "sRGBToLinear",
        "gamma":    "gammaToLinear"
    };

    function buildVertexLambert(gl, cfg, scene, object) {

        var i;
        var len;
        var lights = scene.lights.lights;
        var light;
        var billboard = object.modes.billboard;

        var src = [];

        src.push("// Lambertian drawing vertex shader");

        src.push("attribute vec3 position;");

        src.push("uniform mat4 modelMatrix;");
        src.push("uniform mat4 viewMatrix;");
        src.push("uniform mat4 projMatrix;");
        src.push("uniform vec4 colorize;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
        }

        src.push("uniform vec4   lightAmbient;");
        src.push("uniform vec4   materialColor;");

        if (cfg.normals) {

            src.push("attribute vec3 normal;");
            src.push("uniform mat4 modelNormalMatrix;");
            src.push("uniform mat4 viewNormalMatrix;");

            for (i = 0, len = lights.length; i < len; i++) {
                light = lights[i];

                if (light.type === "ambient") {
                    continue;
                }

                src.push("uniform vec4 lightColor" + i + ";");

                if (light.type === "dir") {
                    src.push("uniform vec3 lightDir" + i + ";");
                }
                if (light.type === "point") {
                    src.push("uniform vec3 lightPos" + i + ";");
                }
                if (light.type === "spot") {
                    src.push("uniform vec3 lightPos" + i + ";");
                    src.push("uniform vec3 lightDir" + i + ";");
                }
            }

            if (cfg.quantizedGeometry) {
                src.push("vec3 octDecode(vec2 oct) {");
                src.push("    vec3 v = vec3(oct.xy, 1.0 - abs(oct.x) - abs(oct.y));");
                src.push("    if (v.z < 0.0) {");
                src.push("        v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);");
                src.push("    }");
                src.push("    return normalize(v);");
                src.push("}");
            }
        }

        src.push("varying vec4 vColor;");

        if (object.geometry.primitiveName === "points") {
            src.push("uniform float pointSize;");
        }

        if (billboard === "spherical" || billboard === "cylindrical") {
            src.push("void billboard(inout mat4 mat) {");
            src.push("   mat[0][0] = 1.0;");
            src.push("   mat[0][1] = 0.0;");
            src.push("   mat[0][2] = 0.0;");
            if (billboard === "spherical") {
                src.push("   mat[1][0] = 0.0;");
                src.push("   mat[1][1] = 1.0;");
                src.push("   mat[1][2] = 0.0;");
            }
            src.push("   mat[2][0] = 0.0;");
            src.push("   mat[2][1] = 0.0;");
            src.push("   mat[2][2] =1.0;");
            src.push("}");
        }

        src.push("void main(void) {");

        src.push("vec4 localPosition = vec4(position, 1.0); ");
        src.push("vec4 worldPosition;");

        if (cfg.quantizedGeometry) {
            src.push("localPosition = positionsDecodeMatrix * localPosition;");
        }

        if (cfg.normals) {
            if (cfg.quantizedGeometry) {
                src.push("vec4 localNormal = vec4(octDecode(normal.xy), 0.0); ");
            } else {
                src.push("vec4 localNormal = vec4(normal, 0.0); ");
            }
            src.push("mat4 modelNormalMatrix2 = modelNormalMatrix;");
            src.push("mat4 viewNormalMatrix2 = viewNormalMatrix;");
        }

        src.push("mat4 viewMatrix2 = viewMatrix;");
        src.push("mat4 modelMatrix2 = modelMatrix;");

        if (object.modes.stationary) {
            src.push("viewMatrix2[3][0] = viewMatrix2[3][1] = viewMatrix2[3][2] = 0.0;")
        }

        if (billboard === "spherical" || billboard === "cylindrical") {

            src.push("mat4 modelViewMatrix = viewMatrix2 * modelMatrix2;");
            src.push("billboard(modelMatrix2);");
            src.push("billboard(viewMatrix2);");
            src.push("billboard(modelViewMatrix);");

            if (cfg.normals) {
                src.push("mat4 modelViewNormalMatrix =  viewNormalMatrix2 * modelNormalMatrix2;");
                src.push("billboard(modelNormalMatrix2);");
                src.push("billboard(viewNormalMatrix2);");
                src.push("billboard(modelViewNormalMatrix);");
            }

            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition = modelViewMatrix * localPosition;");

        } else {
            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition  = viewMatrix2 * worldPosition; ");
        }

        if (cfg.normals) {
            src.push("vec3 viewNormal = normalize((viewNormalMatrix2 * modelNormalMatrix2 * localNormal).xyz);");
        }

        src.push("vec3 reflectedColor = vec3(0.0, 0.0, 0.0);");
        src.push("vec3 viewLightDir = vec3(0.0, 0.0, -1.0);");
        src.push("float lambertian = 1.0;");

        if (cfg.normals) {
            for (i = 0, len = lights.length; i < len; i++) {

                light = lights[i];

                if (light.type === "ambient") {
                    continue;
                }

                if (light.type === "dir") {
                    if (light.space === "view") {
                        src.push("viewLightDir = normalize(lightDir" + i + ");");
                    } else {
                        src.push("viewLightDir = normalize((viewMatrix2 * vec4(lightDir" + i + ", 0.0)).xyz);");
                    }

                } else if (light.type === "point") {
                    if (light.space === "view") {
                        src.push("viewLightDir = normalize(lightPos" + i + " - viewPosition.xyz);");
                    } else {
                        src.push("viewLightDir = normalize((viewMatrix2 * vec4(lightPos" + i + ", 0.0)).xyz);");
                    }

                } else if (light.type === "spot") {
                    if (light.space === "view") {
                        src.push("viewLightDir = normalize(lightDir" + i + ");");
                    } else {
                        src.push("viewLightDir = normalize((viewMatrix2 * vec4(lightDir" + i + ", 0.0)).xyz);");
                    }

                } else {
                    continue;
                }

                src.push("lambertian = max(dot(-viewNormal, viewLightDir), 0.0);");
                src.push("reflectedColor += lambertian * (lightColor" + i + ".rgb * lightColor" + i + ".a);");
            }
        }

        //src.push("vColor = vec4((reflectedColor * materialColor) + (lightAmbient.rgb * lightAmbient.a), 1.0) * colorize;");
        src.push("vColor = vec4((reflectedColor * materialColor.rgb), materialColor.a) * colorize;"); // TODO: How to have ambient bright enough for canvas BG but not too bright for scene?

        if (cfg.clipping) {
            src.push("vWorldPosition = worldPosition;");
        }

        if (object.geometry.primitiveName === "points") {
            src.push("gl_PointSize = pointSize;");
        }

        src.push("   gl_Position = projMatrix * viewPosition;");

        src.push("}");

        return src;
    }

    function buildFragmentLambert(gl, cfg, scene, object) {

        var i;
        var len;
        var src = [];

        src.push("// Lambertian drawing fragment shader");

        //src.push("precision " + getFragmentFloatPrecision(gl) + " float;");
        src.push("precision lowp float;");

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
            src.push("uniform bool clippable;");
            for (i = 0; i < scene.clips.clips.length; i++) {
                src.push("uniform bool clipActive" + i + ";");
                src.push("uniform vec3 clipPos" + i + ";");
                src.push("uniform vec3 clipDir" + i + ";");
            }
        }
        src.push("varying vec4 vColor;");
        if (cfg.gammaOutput) {
            src.push("uniform float gammaFactor;");
            src.push("    vec4 linearToGamma( in vec4 value, in float gammaFactor ) {");
            src.push("    return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );");
            src.push("}");
        }
        src.push("void main(void) {");
        if (cfg.clipping) {
            src.push("if (clippable) {");
            src.push("  float dist = 0.0;");
            for (i = 0; i < scene.clips.clips.length; i++) {
                src.push("if (clipActive" + i + ") {");
                src.push("   dist += clamp(dot(-clipDir" + i + ".xyz, vWorldPosition.xyz - clipPos" + i + ".xyz), 0.0, 1000.0);");
                src.push("}");
            }
            src.push("  if (dist > 0.0) { discard; }");
            if (cfg.solid) {
                src.push("  if (gl_FrontFacing == false) {");
                src.push("     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);");
                src.push("     return;");
                src.push("  }");
            }
            src.push("}");
        }
        if (object.geometry.primitiveName === "points") {
            src.push("vec2 cxy = 2.0 * gl_PointCoord - 1.0;");
            src.push("float r = dot(cxy, cxy);");
            src.push("if (r > 1.0) {");
            src.push("   discard;");
            src.push("}");

        }
        if (cfg.gammaOutput) {
            src.push("gl_FragColor = linearToGamma(vColor, gammaFactor);");
        } else {
            src.push("gl_FragColor = vColor;");
        }
        src.push("}");
        return src;
    }

    function buildVertexDraw(gl, cfg, scene, object) {

        var material = object.material;
        var geometry = object.geometry;
        var i;
        var len;
        var lights = scene.lights.lights;
        var light;

        var src = [];

        // src.push("#extension GL_OES_standard_derivatives : enable");

        src.push("// Drawing vertex shader");
        src.push("attribute  vec3 position;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        src.push("uniform    mat4 modelMatrix;");
        src.push("uniform    mat4 viewMatrix;");
        src.push("uniform    mat4 projMatrix;");

        src.push("varying    vec3 vViewPosition;");

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
        }

        if (scene.lights.lightMap) {
            src.push("varying    vec3 vWorldNormal;");
        }

        if (cfg.normals) {

            src.push("attribute  vec3 normal;");

            src.push("uniform    mat4 modelNormalMatrix;");
            src.push("uniform    mat4 viewNormalMatrix;");

            //src.push("varying    vec3 vLocalNormal;");

            src.push("varying    vec3 vViewNormal;");

            for (i = 0, len = scene.lights.lights.length; i < len; i++) {
                light = scene.lights.lights[i];
                if (light.type === "ambient") {
                    continue;
                }
                if (light.type === "dir") {
                    src.push("uniform vec3 lightDir" + i + ";");
                }
                if (light.type === "point") {
                    src.push("uniform vec3 lightPos" + i + ";");
                }
                if (light.type === "spot") {
                    src.push("uniform vec3 lightPos" + i + ";");
                    src.push("uniform vec3 lightDir" + i + ";");
                }
                if (!(light.type === "dir" && light.space === "view")) {
                    // World-space dir lights don't need these varyings
                    src.push("varying vec4 vViewLightReverseDirAndDist" + i + ";");
                }
            }

            if (cfg.quantizedGeometry) {
                src.push("vec3 octDecode(vec2 oct) {");
                src.push("    vec3 v = vec3(oct.xy, 1.0 - abs(oct.x) - abs(oct.y));");
                src.push("    if (v.z < 0.0) {");
                src.push("        v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);");
                src.push("    }");
                src.push("    return normalize(v);");
                src.push("}");
            }
        }

        if (cfg.texturing) {
            src.push("attribute vec2 uv;");
            src.push("varying vec2 vUV;");

            if (cfg.quantizedGeometry) {
                src.push("uniform mat3 uvDecodeMatrix;")
            }
        }

        if (object.geometry.colors) {
            src.push("attribute vec4 color;");
            src.push("varying vec4 vColor;");
        }

        if (object.geometry.primitiveName === "points") {
            src.push("uniform float pointSize;");
        }

        var billboard = object.modes.billboard;

        if (billboard === "spherical" || billboard === "cylindrical") {

            src.push("void billboard(inout mat4 mat) {");
            src.push("   mat[0][0] = 1.0;");
            src.push("   mat[0][1] = 0.0;");
            src.push("   mat[0][2] = 0.0;");

            if (billboard === "spherical") {
                src.push("   mat[1][0] = 0.0;");
                src.push("   mat[1][1] = 1.0;");
                src.push("   mat[1][2] = 0.0;");
            }

            src.push("   mat[2][0] = 0.0;");
            src.push("   mat[2][1] = 0.0;");
            src.push("   mat[2][2] =1.0;");
            src.push("}");
        }

        if (cfg.receiveShadow) {

            src.push("const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);");

            for (i = 0, len = lights.length; i < len; i++) { // Light sources
                if (lights[i].shadow) {
                    src.push("uniform mat4 shadowViewMatrix" + i + ";");
                    src.push("uniform mat4 shadowProjMatrix" + i + ";");
                    src.push("varying vec4 vShadowPosFromLight" + i + ";");
                }
            }
        }

        src.push("void main(void) {");

        src.push("vec4 localPosition = vec4(position, 1.0); ");
        src.push("vec4 worldPosition;");

        if (cfg.quantizedGeometry) {
            src.push("localPosition = positionsDecodeMatrix * localPosition;");
        }

        if (cfg.normals) {
            if (cfg.quantizedGeometry) {
                src.push("vec4 localNormal = vec4(octDecode(normal.xy), 0.0); ");
            } else {
                src.push("vec4 localNormal = vec4(normal, 0.0); ");
            }
            src.push("mat4 modelNormalMatrix2    = modelNormalMatrix;");
            src.push("mat4 viewNormalMatrix2     = viewNormalMatrix;");
        }

        src.push("mat4 viewMatrix2           = viewMatrix;");
        src.push("mat4 modelMatrix2          = modelMatrix;");

        if (object.modes.stationary) {
            src.push("viewMatrix2[3][0] = viewMatrix2[3][1] = viewMatrix2[3][2] = 0.0;")
        }

        if (billboard === "spherical" || billboard === "cylindrical") {

            src.push("mat4 modelViewMatrix = viewMatrix2 * modelMatrix2;");

            src.push("billboard(modelMatrix2);");
            src.push("billboard(viewMatrix2);");
            src.push("billboard(modelViewMatrix);");

            if (cfg.normals) {

                src.push("mat4 modelViewNormalMatrix =  viewNormalMatrix2 * modelNormalMatrix2;");

                src.push("billboard(modelNormalMatrix2);");
                src.push("billboard(viewNormalMatrix2);");
                src.push("billboard(modelViewNormalMatrix);");
            }

            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition = modelViewMatrix * localPosition;");

        } else {

            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition  = viewMatrix2 * worldPosition; ");
        }

        if (cfg.normals) {

            src.push("vec3 worldNormal = (modelNormalMatrix2 * localNormal).xyz; ");
            if (scene.lights.lightMap) {
                src.push("vWorldNormal = worldNormal;");
            }
            src.push("vViewNormal = normalize((viewNormalMatrix2 * vec4(worldNormal, 1.0)).xyz);");

            src.push("vec3 tmpVec3;");
            src.push("float lightDist;");

            for (i = 0, len = scene.lights.lights.length; i < len; i++) { // Lights

                light = scene.lights.lights[i];

                if (light.type === "ambient") {
                    continue;
                }

                if (light.type === "dir") {

                    if (light.space === "world") {
                        src.push("tmpVec3 = vec3(viewMatrix2 * vec4(lightDir" + i + ", 0.0) ).xyz;");
                        src.push("vViewLightReverseDirAndDist" + i + " = vec4(-tmpVec3, 0.0);");
                    }
                }

                if (light.type === "point") {

                    if (light.space === "world") {
                        src.push("tmpVec3 = (viewMatrix2 * vec4(lightPos" + i + ", 1.0)).xyz - viewPosition.xyz;");
                        src.push("lightDist = abs(length(tmpVec3));");

                    } else {
                        src.push("tmpVec3 = lightPos" + i + ".xyz - viewPosition.xyz;");
                        src.push("lightDist = abs(length(tmpVec3));");
                    }

                    src.push("vViewLightReverseDirAndDist" + i + " = vec4(tmpVec3, lightDist);");
                }
            }
        }

        if (cfg.texturing) {
            if (cfg.quantizedGeometry) {
                src.push("vUV = (uvDecodeMatrix * vec3(uv, 1.0)).xy;");
            } else {
                src.push("vUV = uv;");
            }
        }

        if (object.geometry.colors) {
            src.push("vColor = color;");
        }

        if (object.geometry.primitiveName === "points") {
            src.push("gl_PointSize = pointSize;");
        }

        if (cfg.clipping) {
            src.push("vWorldPosition = worldPosition;");
        }

        src.push("   vViewPosition = viewPosition.xyz;");

        src.push("   gl_Position = projMatrix * viewPosition;");

        src.push("const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);");

        if (cfg.receiveShadow) {
            src.push("vec4 tempx; ");
            for (i = 0, len = lights.length; i < len; i++) { // Light sources
                if (lights[i].shadow) {
                    src.push("vShadowPosFromLight" + i + " = texUnitConverter * shadowProjMatrix" + i + " * (shadowViewMatrix" + i + " * worldPosition); ");
                }
            }
        }

        src.push("}");

        return src;
    }

    function buildFragmentDraw(gl, cfg, scene, object) {

        var material = object.material;
        var geometry = object.geometry;

        var i;
        var len;
        var lights = scene.lights.lights;
        var light;

        var src = [];

        src.push("// Fragment vertex shader");

        if (geometry.normals && material.normalMap) {
            src.push("#extension GL_OES_standard_derivatives : enable");
        }

        src.push("precision " + getFragmentFloatPrecision(gl) + " float;");

        if (cfg.receiveShadow) {
            src.push("float unpackDepth (vec4 color) {");
            src.push("  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0 * 256.0), 1.0/(256.0*256.0*256.0));");
            src.push("  return dot(color, bitShift);");
            src.push("}");
        }

        //--------------------------------------------------------------------------------
        // GAMMA CORRECTION
        //--------------------------------------------------------------------------------

        src.push("uniform float gammaFactor;");

        src.push("vec4 linearToLinear( in vec4 value ) {");
        src.push("  return value;");
        src.push("}");

        src.push("vec4 sRGBToLinear( in vec4 value ) {");
        src.push("  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );");
        src.push("}");

        src.push("vec4 gammaToLinear( in vec4 value) {");
        src.push("  return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );");
        src.push("}");

        if (cfg.gammaOutput) {
            src.push("vec4 linearToGamma( in vec4 value, in float gammaFactor ) {");
            src.push("  return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );");
            src.push("}");
        }

        //--------------------------------------------------------------------------------
        // USER CLIP PLANES
        //--------------------------------------------------------------------------------

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
            src.push("uniform bool clippable;");
            for (var i = 0; i < scene.clips.clips.length; i++) {
                src.push("uniform bool clipActive" + i + ";");
                src.push("uniform vec3 clipPos" + i + ";");
                src.push("uniform vec3 clipDir" + i + ";");
            }
        }

        if (geometry.normals) {

            //--------------------------------------------------------------------------------
            // LIGHT AND REFLECTION MAP INPUTS
            // Define here so available globally to shader functions
            //--------------------------------------------------------------------------------

            if (scene.lights.lightMap) {
                src.push("uniform samplerCube lightMap;");
                src.push("uniform mat4 viewNormalMatrix;");
            }

            if (scene.lights.reflectionMap) {
                src.push("uniform samplerCube reflectionMap;");
            }

            if (scene.lights.lightMap || scene.lights.reflectionMap) {
                src.push("uniform mat4 viewMatrix;");
            }

            //--------------------------------------------------------------------------------
            // SHADING FUNCTIONS
            //--------------------------------------------------------------------------------

            // CONSTANT DEFINITIONS

            src.push("#define PI 3.14159265359");
            src.push("#define RECIPROCAL_PI 0.31830988618");
            src.push("#define RECIPROCAL_PI2 0.15915494");
            src.push("#define EPSILON 1e-6");

            src.push("#define saturate(a) clamp( a, 0.0, 1.0 )");

            // UTILITY DEFINITIONS

            src.push("vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {");
            src.push("   return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );");
            src.push("}");

            // STRUCTURES

            src.push("struct IncidentLight {");
            src.push("   vec3 color;");
            src.push("   vec3 direction;");
            src.push("};");

            src.push("struct ReflectedLight {");
            src.push("   vec3 diffuse;");
            src.push("   vec3 specular;");
            src.push("};");

            src.push("struct Geometry {");
            src.push("   vec3 position;");
            src.push("   vec3 viewNormal;");
            src.push("   vec3 worldNormal;");
            src.push("   vec3 viewEyeDir;");
            src.push("};");

            src.push("struct Material {");
            src.push("   vec3    diffuseColor;");
            src.push("   float   specularRoughness;");
            src.push("   vec3    specularColor;");
            src.push("   float   shine;"); // Only used for Phong
            src.push("};");

            // COMMON UTILS

            if (cfg.phongMaterial) {

                if (scene.lights.lightMap || scene.lights.reflectionMap) {

                    src.push("void computePhongLightMapping(const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");

                    if (scene.lights.lightMap) {
                        src.push("   vec3 irradiance = " + TEXTURE_DECODE_FUNCS[scene.lights.lightMap.encoding] + "(textureCube(lightMap, geometry.worldNormal)).rgb;");
                        src.push("   irradiance *= PI;");
                        src.push("   vec3 diffuseBRDFContrib = (RECIPROCAL_PI * material.diffuseColor);");
                        src.push("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                    }

                    if (scene.lights.reflectionMap) {
                        //     src.push("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.worldNormal);");
                        //   //  src.push("   reflectVec                  = inverseTransformDirection(reflectVec, viewMatrix);");
                        //     src.push("   vec3 radiance               = textureCube(reflectionMap, geometry.worldNormal).rgb;");
                        ////     src.push("   radiance *= PI;");
                        //     src.push("   reflectedLight.specular     += radiance;");
                    }

                    src.push("}");
                }

                src.push("void computePhongLighting(const in IncidentLight directLight, const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");
                src.push("   float dotNL     = saturate(dot(geometry.viewNormal, directLight.direction));");
                src.push("   vec3 irradiance = dotNL * directLight.color * PI;");
                src.push("   reflectedLight.diffuse  += irradiance * (RECIPROCAL_PI * material.diffuseColor);");
                src.push("   reflectedLight.specular += directLight.color * material.specularColor * pow(max(dot(reflect(-directLight.direction, -geometry.viewNormal), geometry.viewEyeDir), 0.0), material.shine);");
                src.push("}");
            }

            if (cfg.metallicMaterial || cfg.specularMaterial) {

                // IRRADIANCE EVALUATION

                src.push("float GGXRoughnessToBlinnExponent(const in float ggxRoughness) {");
                src.push("   float r = ggxRoughness + 0.0001;");
                src.push("   return (2.0 / (r * r) - 2.0);");
                src.push("}");

                src.push("float getSpecularMIPLevel(const in float blinnShininessExponent, const in int maxMIPLevel) {");
                src.push("   float maxMIPLevelScalar = float( maxMIPLevel );");
                src.push("   float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( ( blinnShininessExponent * blinnShininessExponent ) + 1.0 );");
                src.push("   return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );");
                src.push("}");

                if (scene.lights.reflectionMap) {
                    src.push("vec3 getLightProbeIndirectRadiance(const in vec3 reflectVec, const in float blinnShininessExponent, const in int maxMIPLevel) {");
                    src.push("   float mipLevel = 0.5 * getSpecularMIPLevel(blinnShininessExponent, maxMIPLevel);"); //TODO: a random factor - fix this
                    src.push("   vec3 envMapColor = " + TEXTURE_DECODE_FUNCS[scene.lights.reflectionMap.encoding] + "(textureCube(reflectionMap, reflectVec, mipLevel)).rgb;");
                    src.push("  return envMapColor;");
                    src.push("}");
                }

                // SPECULAR BRDF EVALUATION

                src.push("vec3 F_Schlick(const in vec3 specularColor, const in float dotLH) {");
                src.push("   float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );");
                src.push("   return ( 1.0 - specularColor ) * fresnel + specularColor;");
                src.push("}");

                src.push("float G_GGX_Smith(const in float alpha, const in float dotNL, const in float dotNV) {");
                src.push("   float a2 = ( alpha * alpha );");
                src.push("   float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * ( dotNL * dotNL ) );");
                src.push("   float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * ( dotNV * dotNV ) );");
                src.push("   return 1.0 / ( gl * gv );");
                src.push("}");

                src.push("float G_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {");
                src.push("   float a2 = ( alpha * alpha );");
                src.push("   float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * ( dotNV * dotNV ) );");
                src.push("   float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * ( dotNL * dotNL ) );");
                src.push("   return 0.5 / max( gv + gl, EPSILON );");
                src.push("}");

                src.push("float D_GGX(const in float alpha, const in float dotNH) {");
                src.push("   float a2 = ( alpha * alpha );");
                src.push("   float denom = ( dotNH * dotNH) * ( a2 - 1.0 ) + 1.0;");
                src.push("   return RECIPROCAL_PI * a2 / ( denom * denom);");
                src.push("}");

                src.push("vec3 BRDF_Specular_GGX(const in IncidentLight incidentLight, const in Geometry geometry, const in vec3 specularColor, const in float roughness) {");
                src.push("   float alpha = ( roughness * roughness );");
                src.push("   vec3 halfDir = normalize( incidentLight.direction + geometry.viewEyeDir );");
                src.push("   float dotNL = saturate( dot( geometry.viewNormal, incidentLight.direction ) );");
                src.push("   float dotNV = saturate( dot( geometry.viewNormal, geometry.viewEyeDir ) );");
                src.push("   float dotNH = saturate( dot( geometry.viewNormal, halfDir ) );");
                src.push("   float dotLH = saturate( dot( incidentLight.direction, halfDir ) );");
                src.push("   vec3  F = F_Schlick( specularColor, dotLH );");
                src.push("   float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );");
                src.push("   float D = D_GGX( alpha, dotNH );");
                src.push("   return F * (G * D);");
                src.push("}");

                src.push("vec3 BRDF_Specular_GGX_Environment(const in Geometry geometry, const in vec3 specularColor, const in float roughness) {");
                src.push("   float dotNV = saturate(dot(geometry.viewNormal, geometry.viewEyeDir));");
                src.push("   const vec4 c0 = vec4( -1, -0.0275, -0.572,  0.022);");
                src.push("   const vec4 c1 = vec4(  1,  0.0425,   1.04, -0.04);");
                src.push("   vec4 r = roughness * c0 + c1;");
                src.push("   float a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;");
                src.push("   vec2 AB    = vec2(-1.04, 1.04) * a004 + r.zw;");
                src.push("   return specularColor * AB.x + AB.y;");
                src.push("}");


                if (scene.lights.lightMap || scene.lights.reflectionMap) {

                    src.push("void computePBRLightMapping(const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");

                    if (scene.lights.lightMap) {
                        src.push("   vec3 irradiance = sRGBToLinear(textureCube(lightMap, geometry.worldNormal)).rgb;");
                        src.push("   irradiance *= PI;");
                        src.push("   vec3 diffuseBRDFContrib = (RECIPROCAL_PI * material.diffuseColor);");
                        src.push("   reflectedLight.diffuse += irradiance * diffuseBRDFContrib;");
                        //   src.push("   reflectedLight.diffuse = vec3(1.0, 0.0, 0.0);");
                    }

                    if (scene.lights.reflectionMap) {
                        src.push("   vec3 reflectVec             = reflect(-geometry.viewEyeDir, geometry.viewNormal);");
                        src.push("   reflectVec                  = inverseTransformDirection(reflectVec, viewMatrix);");
                        src.push("   float blinnExpFromRoughness = GGXRoughnessToBlinnExponent(material.specularRoughness);");
                        src.push("   vec3 radiance               = getLightProbeIndirectRadiance(reflectVec, blinnExpFromRoughness, 8);");
                        src.push("   vec3 specularBRDFContrib    = BRDF_Specular_GGX_Environment(geometry, material.specularColor, material.specularRoughness);");
                        src.push("   reflectedLight.specular     += radiance * specularBRDFContrib;");
                    }

                    src.push("}");
                }

                // MAIN LIGHTING COMPUTATION FUNCTION

                src.push("void computePBRLighting(const in IncidentLight incidentLight, const in Geometry geometry, const in Material material, inout ReflectedLight reflectedLight) {");
                src.push("   float dotNL     = saturate(dot(geometry.viewNormal, incidentLight.direction));");
                src.push("   vec3 irradiance = dotNL * incidentLight.color * PI;");
                src.push("   reflectedLight.diffuse  += irradiance * (RECIPROCAL_PI * material.diffuseColor);");
                src.push("   reflectedLight.specular += irradiance * BRDF_Specular_GGX(incidentLight, geometry, material.specularColor, material.specularRoughness);");
                src.push("}");

            } // (cfg.metallicMaterial || cfg.specularMaterial)

        } // geometry.normals

        //--------------------------------------------------------------------------------
        // GEOMETRY INPUTS
        //--------------------------------------------------------------------------------

        src.push("varying vec3 vViewPosition;");

        if (geometry.colors) {
            src.push("varying vec4 vColor;");
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
            src.push("varying vec2 vUV;");
        }

        if (geometry.normals) {
            if (scene.lights.lightMap) {
                src.push("varying vec3 vWorldNormal;");
            }
            src.push("varying vec3 vViewNormal;");
        }

        //--------------------------------------------------------------------------------
        // MATERIAL CHANNEL INPUTS
        //--------------------------------------------------------------------------------

        if (material.ambient) {
            src.push("uniform vec3 materialAmbient;");
        }

        if (material.baseColor) {
            src.push("uniform vec3 materialBaseColor;");
        }

        if (material.alpha !== undefined && material.alpha !== null) {
            src.push("uniform vec4 materialAlphaModeCutoff;"); // [alpha, alphaMode, alphaCutoff]
        }

        if (material.emissive) {
            src.push("uniform vec3 materialEmissive;");
        }

        if (material.diffuse) {
            src.push("uniform vec3 materialDiffuse;");
        }

        if (material.glossiness !== undefined && material.glossiness !== null) {
            src.push("uniform float materialGlossiness;");
        }

        if (material.shininess !== undefined && material.shininess !== null) {
            src.push("uniform float materialShininess;");  // Phong channel
        }

        if (material.specular) {
            src.push("uniform vec3 materialSpecular;");
        }

        if (material.metallic !== undefined && material.metallic !== null) {
            src.push("uniform float materialMetallic;");
        }

        if (material.roughness !== undefined && material.roughness !== null) {
            src.push("uniform float materialRoughness;");
        }

        if (material.specularF0 !== undefined && material.specularF0 !== null) {
            src.push("uniform float materialSpecularF0;");
        }

        //--------------------------------------------------------------------------------
        // MATERIAL TEXTURE INPUTS
        //--------------------------------------------------------------------------------

        if (geometry.uv && material.ambientMap) {
            src.push("uniform sampler2D ambientMap;");
            if (material.ambientMap.matrix) {
                src.push("uniform mat4 ambientMapMatrix;");
            }
        }

        if (geometry.uv && material.baseColorMap) {
            src.push("uniform sampler2D baseColorMap;");
            if (material.baseColorMap.matrix) {
                src.push("uniform mat4 baseColorMapMatrix;");
            }
        }

        if (geometry.uv && material.diffuseMap) {
            src.push("uniform sampler2D diffuseMap;");
            if (material.diffuseMap.matrix) {
                src.push("uniform mat4 diffuseMapMatrix;");
            }
        }

        if (geometry.uv && material.emissiveMap) {
            src.push("uniform sampler2D emissiveMap;");
            if (material.emissiveMap.matrix) {
                src.push("uniform mat4 emissiveMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.metallicMap) {
            src.push("uniform sampler2D metallicMap;");
            if (material.metallicMap.matrix) {
                src.push("uniform mat4 metallicMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.roughnessMap) {
            src.push("uniform sampler2D roughnessMap;");
            if (material.roughnessMap.matrix) {
                src.push("uniform mat4 roughnessMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.metallicRoughnessMap) {
            src.push("uniform sampler2D metallicRoughnessMap;");
            if (material.metallicRoughnessMap.matrix) {
                src.push("uniform mat4 metallicRoughnessMapMatrix;");
            }
        }

        if (geometry.normals && material.normalMap) {
            src.push("uniform sampler2D normalMap;");
            if (material.normalMap.matrix) {
                src.push("uniform mat4 normalMapMatrix;");
            }

            src.push("vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {");
            src.push("      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );");
            src.push("      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );");
            src.push("      vec2 st0 = dFdx( uv.st );");
            src.push("      vec2 st1 = dFdy( uv.st );");
            src.push("      vec3 S = normalize( q0 * st1.t - q1 * st0.t );");
            src.push("      vec3 T = normalize( -q0 * st1.s + q1 * st0.s );");
            src.push("      vec3 N = normalize( surf_norm );");
            src.push("      vec3 mapN = texture2D( normalMap, uv ).xyz * 2.0 - 1.0;");
            src.push("      mat3 tsn = mat3( S, T, N );");
            //     src.push("      mapN *= 3.0;");
            src.push("      return normalize( tsn * mapN );");
            src.push("}");
        }

        if (geometry.uv && material.occlusionMap) {
            src.push("uniform sampler2D occlusionMap;");
            if (material.occlusionMap.matrix) {
                src.push("uniform mat4 occlusionMapMatrix;");
            }
        }

        if (geometry.uv && material.alphaMap) {
            src.push("uniform sampler2D alphaMap;");
            if (material.alphaMap.matrix) {
                src.push("uniform mat4 alphaMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.specularMap) {
            src.push("uniform sampler2D specularMap;");
            if (material.specularMap.matrix) {
                src.push("uniform mat4 specularMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.glossinessMap) {
            src.push("uniform sampler2D glossinessMap;");
            if (material.glossinessMap.matrix) {
                src.push("uniform mat4 glossinessMapMatrix;");
            }
        }

        if (geometry.normals && geometry.uv && material.specularGlossinessMap) {
            src.push("uniform sampler2D materialSpecularGlossinessMap;");
            if (material.specularGlossinessMap.matrix) {
                src.push("uniform mat4 materialSpecularGlossinessMapMatrix;");
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

            src.push("float fresnel(vec3 eyeDir, vec3 normal, float edgeBias, float centerBias, float power) {");
            src.push("    float fr = abs(dot(eyeDir, normal));");
            src.push("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
            src.push("    return pow(finalFr, power);");
            src.push("}");

            if (material.diffuseFresnel) {
                src.push("uniform float  diffuseFresnelCenterBias;");
                src.push("uniform float  diffuseFresnelEdgeBias;");
                src.push("uniform float  diffuseFresnelPower;");
                src.push("uniform vec3   diffuseFresnelCenterColor;");
                src.push("uniform vec3   diffuseFresnelEdgeColor;");
            }

            if (material.specularFresnel) {
                src.push("uniform float  specularFresnelCenterBias;");
                src.push("uniform float  specularFresnelEdgeBias;");
                src.push("uniform float  specularFresnelPower;");
                src.push("uniform vec3   specularFresnelCenterColor;");
                src.push("uniform vec3   specularFresnelEdgeColor;");
            }

            if (material.alphaFresnel) {
                src.push("uniform float  alphaFresnelCenterBias;");
                src.push("uniform float  alphaFresnelEdgeBias;");
                src.push("uniform float  alphaFresnelPower;");
                src.push("uniform vec3   alphaFresnelCenterColor;");
                src.push("uniform vec3   alphaFresnelEdgeColor;");
            }

            if (material.reflectivityFresnel) {
                src.push("uniform float  materialSpecularF0FresnelCenterBias;");
                src.push("uniform float  materialSpecularF0FresnelEdgeBias;");
                src.push("uniform float  materialSpecularF0FresnelPower;");
                src.push("uniform vec3   materialSpecularF0FresnelCenterColor;");
                src.push("uniform vec3   materialSpecularF0FresnelEdgeColor;");
            }

            if (material.emissiveFresnel) {
                src.push("uniform float  emissiveFresnelCenterBias;");
                src.push("uniform float  emissiveFresnelEdgeBias;");
                src.push("uniform float  emissiveFresnelPower;");
                src.push("uniform vec3   emissiveFresnelCenterColor;");
                src.push("uniform vec3   emissiveFresnelEdgeColor;");
            }
        }

        //--------------------------------------------------------------------------------
        // LIGHT SOURCES
        //--------------------------------------------------------------------------------

        src.push("uniform vec4   lightAmbient;");

        if (geometry.normals) {

            for (i = 0, len = lights.length; i < len; i++) { // Light sources

                light = lights[i];

                if (light.type === "ambient") {
                    continue;
                }

                src.push("uniform vec4 lightColor" + i + ";");

                if (light.type === "point") {
                    src.push("uniform vec3 lightAttenuation" + i + ";");
                }
                if (light.type === "dir" && light.space === "view") {
                    src.push("uniform vec3 lightDir" + i + ";");
                }
                if (light.type === "point" && light.space === "view") {
                    src.push("uniform vec3 lightPos" + i + ";");
                } else {
                    src.push("varying vec4 vViewLightReverseDirAndDist" + i + ";");
                }
            }
        }

        if (cfg.receiveShadow) {

            // Variance shadow mapping filter

            // src.push("float linstep(float low, float high, float v){");
            // src.push("      return clamp((v-low)/(high-low), 0.0, 1.0);");
            // src.push("}");
            //
            // src.push("float VSM(sampler2D depths, vec2 uv, float compare){");
            // src.push("      vec2 moments = texture2D(depths, uv).xy;");
            // src.push("      float p = smoothstep(compare-0.02, compare, moments.x);");
            // src.push("      float variance = max(moments.y - moments.x*moments.x, -0.001);");
            // src.push("      float d = compare - moments.x;");
            // src.push("      float p_max = linstep(0.2, 1.0, variance / (variance + d*d));");
            // src.push("      return clamp(max(p, p_max), 0.0, 1.0);");
            // src.push("}");

            for (i = 0, len = lights.length; i < len; i++) { // Light sources
                if (lights[i].shadow) {
                    src.push("varying vec4 vShadowPosFromLight" + i + ";");
                    src.push("uniform sampler2D shadowMap" + i + ";");
                }
            }
        }

        src.push("uniform vec4 colorize;");

        //================================================================================
        // MAIN
        //================================================================================

        src.push("void main(void) {");

        if (cfg.clipping) {
            src.push("if (clippable) {");
            src.push("  float dist = 0.0;");
            for (var i = 0; i < scene.clips.clips.length; i++) {
                src.push("if (clipActive" + i + ") {");
                src.push("   dist += clamp(dot(-clipDir" + i + ".xyz, vWorldPosition.xyz - clipPos" + i + ".xyz), 0.0, 1000.0);");
                src.push("}");
            }
            src.push("  if (dist > 0.0) { discard; }");
            if (cfg.solid) {
                src.push("  if (gl_FrontFacing == false) {");
                src.push("     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);");
                src.push("     return;");
                src.push("  }");
            }
            src.push("}");
        }

        if (geometry.primitiveName === "points") {
            src.push("vec2 cxy = 2.0 * gl_PointCoord - 1.0;");
            src.push("float r = dot(cxy, cxy);");
            src.push("if (r > 1.0) {");
            src.push("   discard;");
            src.push("}");
        }

        src.push("float occlusion = 1.0;");

        if (material.ambient) {
            src.push("vec3 ambientColor = materialAmbient;");
        } else {
            src.push("vec3 ambientColor = vec3(1.0, 1.0, 1.0);");
        }

        if (material.diffuse) {
            src.push("vec3 diffuseColor = materialDiffuse;");
        } else if (material.baseColor) {
            src.push("vec3 diffuseColor = materialBaseColor;");
        } else {
            src.push("vec3 diffuseColor = vec3(1.0, 1.0, 1.0);");
        }

        if (geometry.colors) {
            src.push("diffuseColor *= vColor.rgb;");
        }

        if (material.emissive) {
            src.push("vec3 emissiveColor = materialEmissive;"); // Emissive default is (0,0,0), so initializing here
        } else {
            src.push("vec3  emissiveColor = vec3(0.0, 0.0, 0.0);");
        }

        if (material.specular) {
            src.push("vec3 specular = materialSpecular;");
        } else {
            src.push("vec3 specular = vec3(1.0, 1.0, 1.0);");
        }

        if (material.alpha !== undefined) {
            src.push("float alpha = materialAlphaModeCutoff[0];");
        } else {
            src.push("float alpha = 1.0;");
        }

        if (geometry.colors) {
            src.push("alpha *= vColor.a;");
        }

        if (material.glossiness !== undefined) {
            src.push("float glossiness = materialGlossiness;");
        } else {
            src.push("float glossiness = 1.0;");
        }

        if (material.metallic !== undefined) {
            src.push("float metallic = materialMetallic;");
        } else {
            src.push("float metallic = 1.0;");
        }

        if (material.roughness !== undefined) {
            src.push("float roughness = materialRoughness;");
        } else {
            src.push("float roughness = 1.0;");
        }

        if (material.specularF0 !== undefined) {
            src.push("float specularF0 = materialSpecularF0;");
        } else {
            src.push("float specularF0 = 1.0;");
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
            src.push("vec4 texturePos = vec4(vUV.s, vUV.t, 1.0, 1.0);");
            src.push("vec2 textureCoord;");
        }

        if (geometry.uv && material.ambientMap) {
            if (material.ambientMap.matrix) {
                src.push("textureCoord = (ambientMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("vec4 ambientTexel = texture2D(ambientMap, textureCoord).rgb;");
            src.push("ambientTexel = " + TEXTURE_DECODE_FUNCS[material.ambientMap.encoding] + "(ambientTexel);");
            src.push("ambientColor *= ambientTexel.rgb;");
        }

        if (geometry.uv && material.diffuseMap) {
            if (material.diffuseMap.matrix) {
                src.push("textureCoord = (diffuseMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("vec4 diffuseTexel = texture2D(diffuseMap, textureCoord);");
            src.push("diffuseTexel = " + TEXTURE_DECODE_FUNCS[material.diffuseMap.encoding] + "(diffuseTexel);");
            src.push("diffuseColor *= diffuseTexel.rgb;");
            src.push("alpha *= diffuseTexel.a;");
        }

        if (geometry.uv && material.baseColorMap) {
            if (material.baseColorMap.matrix) {
                src.push("textureCoord = (baseColorMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("vec4 baseColorTexel = texture2D(baseColorMap, textureCoord);");
            src.push("baseColorTexel = " + TEXTURE_DECODE_FUNCS[material.baseColorMap.encoding] + "(baseColorTexel);");
            src.push("diffuseColor *= baseColorTexel.rgb;");
            src.push("alpha *= baseColorTexel.a;");
        }

        if (geometry.uv && material.emissiveMap) {
            if (material.emissiveMap.matrix) {
                src.push("textureCoord = (emissiveMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("vec4 emissiveTexel = texture2D(emissiveMap, textureCoord);");
            src.push("emissiveTexel = " + TEXTURE_DECODE_FUNCS[material.emissiveMap.encoding] + "(emissiveTexel);");
            src.push("emissiveColor *= emissiveTexel.rgb;");
        }

        if (geometry.uv && material.alphaMap) {
            if (material.alphaMap.matrix) {
                src.push("textureCoord = (alphaMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("alpha *= texture2D(alphaMap, textureCoord).r;");
        }

        if (geometry.uv && material.occlusionMap) {
            if (material.occlusionMap.matrix) {
                src.push("textureCoord = (occlusionMapMatrix * texturePos).xy;");
            } else {
                src.push("textureCoord = texturePos.xy;");
            }
            src.push("occlusion *= texture2D(occlusionMap, textureCoord).r;");
        }

        if (geometry.normals && ((lights.length > 0) || scene.lights.lightMap || scene.lights.reflectionMap)) {

            //--------------------------------------------------------------------------------
            // SHADING
            //--------------------------------------------------------------------------------

            if (geometry.uv && material.normalMap) {
                if (material.normalMap.matrix) {
                    src.push("textureCoord = (normalMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("vec3 viewNormal = perturbNormal2Arb( vViewPosition, normalize(vViewNormal), textureCoord );");
            } else {
                src.push("vec3 viewNormal = normalize(vViewNormal);");
            }

            if (geometry.uv && material.specularMap) {
                if (material.specularMap.matrix) {
                    src.push("textureCoord = (specularMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("specular *= texture2D(specularMap, textureCoord).rgb;");
            }

            if (geometry.uv && material.glossinessMap) {
                if (material.glossinessMap.matrix) {
                    src.push("textureCoord = (glossinessMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("glossiness *= texture2D(glossinessMap, textureCoord).r;");
            }

            if (geometry.uv && material.specularGlossinessMap) {
                if (material.specularGlossinessMap.matrix) {
                    src.push("textureCoord = (materialSpecularGlossinessMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("vec4 specGlossRGB = texture2D(materialSpecularGlossinessMap, textureCoord).rgba;"); // TODO: what if only RGB texture?
                src.push("specular *= specGlossRGB.rgb;");
                src.push("glossiness *= specGlossRGB.a;");
            }

            if (geometry.uv && material.metallicMap) {
                if (material.metallicMap.matrix) {
                    src.push("textureCoord = (metallicMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("metallic *= texture2D(metallicMap, textureCoord).r;");
            }

            if (geometry.uv && material.roughnessMap) {
                if (material.roughnessMap.matrix) {
                    src.push("textureCoord = (roughnessMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("roughness *= texture2D(roughnessMap, textureCoord).r;");
            }

            if (geometry.uv && material.metallicRoughnessMap) {
                if (material.metallicRoughnessMap.matrix) {
                    src.push("textureCoord = (metallicRoughnessMapMatrix * texturePos).xy;");
                } else {
                    src.push("textureCoord = texturePos.xy;");
                }
                src.push("vec3 metalRoughRGB = texture2D(metallicRoughnessMap, textureCoord).rgb;");
                src.push("metallic *= metalRoughRGB.b;");
                src.push("roughness *= metalRoughRGB.g;");
            }

            src.push("vec3 viewEyeDir = normalize(-vViewPosition);");

            if (material.diffuseFresnel || material.specularFresnel || material.alphaFresnel || material.emissiveFresnel || material.reflectivityFresnel) {
                if (material.diffuseFresnel) {
                    src.push("float diffuseFresnel = fresnel(viewEyeDir, viewNormal, diffuseFresnelEdgeBias, diffuseFresnelCenterBias, diffuseFresnelPower);");
                    src.push("diffuseColor *= mix(diffuseFresnelEdgeColor, diffuseFresnelCenterColor, diffuseFresnel);");
                }
                if (material.specularFresnel) {
                    src.push("float specularFresnel = fresnel(viewEyeDir, viewNormal, specularFresnelEdgeBias, specularFresnelCenterBias, specularFresnelPower);");
                    src.push("specular *= mix(specularFresnelEdgeColor, specularFresnelCenterColor, specularFresnel);");
                }
                if (material.alphaFresnel) {
                    src.push("float alphaFresnel = fresnel(viewEyeDir, viewNormal, alphaFresnelEdgeBias, alphaFresnelCenterBias, alphaFresnelPower);");
                    src.push("alpha *= mix(alphaFresnelEdgeColor.r, alphaFresnelCenterColor.r, alphaFresnel);");
                }
                if (material.emissiveFresnel) {
                    src.push("float emissiveFresnel = fresnel(viewEyeDir, viewNormal, emissiveFresnelEdgeBias, emissiveFresnelCenterBias, emissiveFresnelPower);");
                    src.push("emissiveColor *= mix(emissiveFresnelEdgeColor, emissiveFresnelCenterColor, emissiveFresnel);");
                }
            }

            src.push("if (materialAlphaModeCutoff[1] == 1.0 && alpha < materialAlphaModeCutoff[2]) {"); // ie. (alphaMode == "mask" && alpha < alphaCutoff)
            src.push("   discard;"); // TODO: Discard earlier within this shader?
            src.push("}");

            // PREPARE INPUTS FOR SHADER FUNCTIONS

            src.push("IncidentLight  light;");
            src.push("Material       material;");
            src.push("Geometry       geometry;");
            src.push("ReflectedLight reflectedLight = ReflectedLight(vec3(0.0,0.0,0.0), vec3(0.0,0.0,0.0));");
            src.push("vec3           viewLightDir;");

            if (cfg.phongMaterial) {
                src.push("material.diffuseColor      = diffuseColor;");
                src.push("material.specularColor     = specular;");
                src.push("material.shine             = materialShininess;");
            }

            if (cfg.specularMaterial) {
                src.push("float oneMinusSpecularStrength = 1.0 - max(max(specular.r, specular.g ),specular.b);"); // Energy conservation
                src.push("material.diffuseColor      = diffuseColor * oneMinusSpecularStrength;");
                src.push("material.specularRoughness = clamp( 1.0 - glossiness, 0.04, 1.0 );");
                src.push("material.specularColor     = specular;");
            }

            if (cfg.metallicMaterial) {
                src.push("float dielectricSpecular = 0.16 * specularF0 * specularF0;");
                src.push("material.diffuseColor      = diffuseColor * (1.0 - dielectricSpecular) * (1.0 - metallic);");
                src.push("material.specularRoughness = clamp(roughness, 0.04, 1.0);");
                src.push("material.specularColor     = mix(vec3(dielectricSpecular), diffuseColor, metallic);");
            }

            src.push("geometry.position      = vViewPosition;");
            if (scene.lights.lightMap) {
                src.push("geometry.worldNormal   = normalize(vWorldNormal);");
            }
            src.push("geometry.viewNormal    = viewNormal;");
            src.push("geometry.viewEyeDir    = viewEyeDir;");

            // ENVIRONMENT AND REFLECTION MAP SHADING

            if ((cfg.phongMaterial) && (scene.lights.lightMap || scene.lights.reflectionMap)) {
                src.push("computePhongLightMapping(geometry, material, reflectedLight);");
            }

            if ((cfg.specularMaterial || cfg.metallicMaterial) && (scene.lights.lightMap || scene.lights.reflectionMap)) {
                src.push("computePBRLightMapping(geometry, material, reflectedLight);");
            }

            // LIGHT SOURCE SHADING

            var light;

            src.push("float shadow = 1.0;");

            // if (cfg.receiveShadow) {
            //
            //     src.push("float lightDepth2 = clamp(length(lightPos)/40.0, 0.0, 1.0);");
            //     src.push("float illuminated = VSM(sLightDepth, lightUV, lightDepth2);");
            //
            src.push("float shadowAcneRemover = 0.0007;");
            src.push("vec3 fragmentDepth;");
            src.push("float texelSize = 1.0 / 1024.0;");
            src.push("float amountInLight = 0.0;");
            src.push("vec3 shadowCoord;");
            src.push('vec4 rgbaDepth;');
            src.push("float depth;");
            // }

            var numShadows = 0;
            for (i = 0, len = lights.length; i < len; i++) {

                light = lights[i];

                if (light.type === "ambient") {
                    continue;
                }
                if (light.type === "dir" && light.space === "view") {
                    src.push("viewLightDir = -normalize(lightDir" + i + ");");
                } else if (light.type === "point" && light.space === "view") {
                    src.push("viewLightDir = normalize(lightPos" + i + " - vViewPosition);");
                    //src.push("tmpVec3 = lightPos" + i + ".xyz - viewPosition.xyz;");
                    //src.push("lightDist = abs(length(tmpVec3));");
                } else {
                    src.push("viewLightDir = normalize(vViewLightReverseDirAndDist" + i + ".xyz);"); // If normal mapping, the fragment->light vector will be in tangent space
                }

                if (cfg.receiveShadow && light.shadow) {

                    // if (true) {
                    //     src.push('shadowCoord = (vShadowPosFromLight' + i + '.xyz/vShadowPosFromLight' + i + '.w)/2.0 + 0.5;');
                    //     src.push("lightDepth2 = clamp(length(vec3[0.0, 20.0, 20.0])/40.0, 0.0, 1.0);");
                    //     src.push("shadow *= VSM(shadowMap' + i + ', shadowCoord, lightDepth2);");
                    // }
                    //
                    // if (false) {
                    //
                    // PCF

                    src.push("shadow = 0.0;");

                    src.push("fragmentDepth = vShadowPosFromLight" + i + ".xyz;");
                    src.push("fragmentDepth.z -= shadowAcneRemover;");
                    src.push("for (int x = -3; x <= 3; x++) {");
                    src.push("  for (int y = -3; y <= 3; y++) {");
                    src.push("      float texelDepth = unpackDepth(texture2D(shadowMap" + i + ", fragmentDepth.xy + vec2(x, y) * texelSize));");
                    src.push("      if (fragmentDepth.z < texelDepth) {");
                    src.push("          shadow += 1.0;");
                    src.push("      }");
                    src.push("  }");
                    src.push("}");

                    src.push("light.color =  lightColor" + i + ".rgb * (lightColor" + i + ".a * (shadow / 49.0));");
                    //
                    // }
                    //
                    // if (false){
                    //
                    //     src.push("shadow = 1.0;");
                    //
                    //     src.push('shadowCoord = (vShadowPosFromLight' + i + '.xyz/vShadowPosFromLight' + i + '.w)/2.0 + 0.5;');
                    //
                    //     src.push('shadow -= (shadowCoord.z > unpackDepth(texture2D(shadowMap' + i + ', shadowCoord.xy + vec2( -0.94201624, -0.39906216 ) / 700.0)) + 0.0015) ? 0.2 : 0.0;');
                    //     src.push('shadow -= (shadowCoord.z > unpackDepth(texture2D(shadowMap' + i + ', shadowCoord.xy + vec2( 0.94558609, -0.76890725 ) / 700.0)) + 0.0015) ? 0.2 : 0.0;');
                    //     src.push('shadow -= (shadowCoord.z > unpackDepth(texture2D(shadowMap' + i + ', shadowCoord.xy + vec2( -0.094184101, -0.92938870 ) / 700.0)) + 0.0015) ? 0.2 : 0.0;');
                    //     src.push('shadow -= (shadowCoord.z > unpackDepth(texture2D(shadowMap' + i + ', shadowCoord.xy + vec2( 0.34495938, 0.29387760 ) / 700.0)) + 0.0015) ? 0.2 : 0.0;');
                    //
                    //     src.push("light.color =  lightColor" + i + ".rgb * (lightColor" + i + ".a * shadow);");
                    // }
                } else {
                    src.push("light.color =  lightColor" + i + ".rgb * (lightColor" + i + ".a );");
                }

                src.push("light.direction = viewLightDir;");


                if (cfg.phongMaterial) {
                    src.push("computePhongLighting(light, geometry, material, reflectedLight);");
                }

                if (cfg.specularMaterial || cfg.metallicMaterial) {
                    src.push("computePBRLighting(light, geometry, material, reflectedLight);");
                }
            }

            if (numShadows > 0) {
                //src.push("shadow /= " + (9 * numShadows) + ".0;");
            }

            //src.push("reflectedLight.diffuse *= shadow;");

            // COMBINE TERMS

            if (cfg.phongMaterial) {

                src.push("ambientColor *= (lightAmbient.rgb * lightAmbient.a);");

                src.push("vec3 outgoingLight =  ((occlusion * (( reflectedLight.diffuse + reflectedLight.specular)))) + emissiveColor;");

            } else {
                src.push("vec3 outgoingLight = (occlusion * (reflectedLight.diffuse)) + (shadow * occlusion * reflectedLight.specular) + emissiveColor;");
            }

        }

        else {

            //--------------------------------------------------------------------------------
            // NO SHADING - EMISSIVE and AMBIENT ONLY
            //--------------------------------------------------------------------------------

            src.push("ambientColor *= (lightAmbient.rgb * lightAmbient.a);");

            src.push("vec3 outgoingLight = emissiveColor + ambientColor;");
        }

        src.push("gl_FragColor = vec4(outgoingLight, alpha) * colorize;");

        if (cfg.gammaOutput) {
            src.push("gl_FragColor = linearToGamma(gl_FragColor, gammaFactor);");
        }

        src.push("}");

        return src;
    }
})();