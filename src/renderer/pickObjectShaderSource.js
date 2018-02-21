/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickObjectShaderSource = function (gl, scene, object) {
        var cfg = {
            clipping: scene.clips.clips.length > 0,
            quantizedGeometry: !!object.geometry.quantized
        };
        this.vertex = buildVertex(gl, cfg, object);
        this.fragment = buildFragment(gl, cfg, scene);
    };
    
    function buildVertex(gl, cfg, object) {
        var src = [];

        src.push("// Object picking vertex shader");

        src.push("attribute vec3 position;");

        src.push("uniform mat4 modelMatrix;");
        src.push("uniform mat4 viewMatrix;");
        src.push("uniform mat4 viewNormalMatrix;");
        src.push("uniform mat4 projMatrix;");

        src.push("varying vec4 vViewPosition;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
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

        src.push("void main(void) {");

        src.push("vec4 localPosition = vec4(position, 1.0); ");
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
        }

        src.push("   vec4 worldPosition = modelMatrix2 * localPosition;");
        src.push("   vec4 viewPosition = viewMatrix2 * worldPosition;");

        if (cfg.clipping) {
            src.push("   vWorldPosition = worldPosition;");
        }

        src.push("   gl_Position = projMatrix * viewPosition;");
        src.push("}");
        return src;
    }

    function buildFragment(gl, cfg, scene) {
        var src = [];
        src.push("// Object picking fragment shader");
        src.push("precision lowp float;");
        src.push("uniform vec4 pickColor;");
        if (cfg.clipping) {
            src.push("uniform bool clippable;");
            src.push("varying vec4 vWorldPosition;");
            for (var i = 0; i < scene.clips.clips.length; i++) {
                src.push("uniform bool clipActive" + i + ";");
                src.push("uniform vec3 clipPos" + i + ";");
                src.push("uniform vec3 clipDir" + i + ";");
            }
        }
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
            src.push("}");
        }
        src.push("   gl_FragColor = pickColor; ");
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