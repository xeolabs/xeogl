/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.ShadowShaderSource = function (gl, scene, object) {
        var cfg = {
            clipping: scene.clips.clips.length > 0,
            quantizedGeometry: !!object.geometry.quantized
        };
        this.vertex = buildVertex(gl, cfg, scene, object);
        this.fragment = buildFragment(gl, cfg, scene, object);
    };

    function hasTextures(object) {
        if (!object.geometry.uv) {
            return false;
        }
        var material = object.material;
        return material.alphaMap;
    }
    
    function buildVertex(gl, cfg, scene, object) {

        var i;
        var len;
        var lights = scene.lights.lights;
        var light;
        var billboard = object.modes.billboard;

        var src = [];

        src.push("// Shadow drawing vertex shader");

        src.push("attribute vec3 position;");

        src.push("uniform mat4 modelMatrix;");
        src.push("uniform mat4 viewMatrix;");
        src.push("uniform mat4 projMatrix;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
        }

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

    function buildFragment(gl, cfg, scene, object) {

        var i;
        var src = [];

        src.push("// Shadow fragment shader");

        src.push("precision " + getFragmentFloatPrecision(gl) + " float;");

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
            src.push("uniform bool clippable;");
            for (i = 0; i < scene.clips.clips.length; i++) {
                src.push("uniform bool clipActive" + i + ";");
                src.push("uniform vec3 clipPos" + i + ";");
                src.push("uniform vec3 clipDir" + i + ";");
            }
        }
        src.push("vec4 packDepth (float depth) {");
        src.push("  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);");
        src.push("  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);");
        src.push("  vec4 comp = fract(depth * bitShift);");
        src.push("  comp -= comp.gbaa * bitMask;");
        src.push("  return comp;");
        src.push("}");
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
        src.push("gl_FragColor = packDepth(gl_FragCoord.z);");
        src.push("}");
        return src;
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

})();