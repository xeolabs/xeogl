/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.PickVertexShaderSource = function (gl, scene, object) {
        var cfg = {
            clipping: scene.clips.clips.length > 0,
            quantizedGeometry: !!object.geometry.quantized
        };
        this.vertex = buildVertex(gl, cfg);
        this.fragment = buildFragment(gl, cfg, scene);
    };

    function buildVertex(gl, cfg) {

        var src = [];

        src.push("// Surface picking vertex shader");

        src.push("attribute vec3 position;");
        src.push("attribute vec4 color;");

        src.push("uniform mat4 modelMatrix;");
        src.push("uniform mat4 viewMatrix;");
        src.push("uniform mat4 projMatrix;");

        if (cfg.clipping) {
            src.push("uniform bool clippable;");
            src.push("varying vec4 vWorldPosition;");
        }

        src.push("varying vec4 vColor;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        src.push("void main(void) {");

        src.push("vec4 localPosition = vec4(position, 1.0); ");

        if (cfg.quantizedGeometry) {
            src.push("localPosition = positionsDecodeMatrix * localPosition;");
        }

        src.push("   vec4 worldPosition = modelMatrix * localPosition; ");
        src.push("   vec4 viewPosition = viewMatrix * worldPosition;");

        if (cfg.clipping) {
            src.push("   vWorldPosition = worldPosition;");
        }

        src.push("   vColor = color;");
        src.push("   gl_Position = projMatrix * viewPosition;");
        src.push("}");
        return src;
    }

    function buildFragment(gl, cfg, scene) {

        var src = [];

        src.push("// Surface picking fragment shader");

        src.push("precision lowp float;");

        src.push("varying vec4 vColor;");

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

        src.push("   gl_FragColor = vColor;");
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