/**
 * @author xeolabs / https://github.com/xeolabs
 */

(function () {

    "use strict";

    xeogl.renderer.GhostVerticesShaderSource = function (gl, scene, object) {
        var cfg = {
            normals: hasNormals(object),
            clipping: scene.clips.clips.length > 0,
            quantizedGeometry: !!object.geometry.quantized,
            gammaOutput: scene.gammaOutput
        };
        this.vertex = buildVertex(gl, cfg, scene, object);
        this.fragment = buildFragment(gl, cfg, scene, object);
    };

    function hasNormals(object) {
        var primitive = object.geometry.primitiveName;
        if ((object.geometry.autoVertexNormals || object.geometry.normals) && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
            return true;
        }
        return false;
    }

    function buildVertex(gl, cfg, scene, object) {

        var billboard = object.modes.billboard;

        var src = [];

        src.push("// Vertices drawing vertex shader");

        src.push("attribute vec3 position;");

        src.push("uniform mat4 modelMatrix;");
        src.push("uniform mat4 viewMatrix;");
        src.push("uniform mat4 projMatrix;");
        src.push("uniform vec4 vertexColor;");
        src.push("uniform float vertexSize;");

        if (cfg.quantizedGeometry) {
            src.push("uniform mat4 positionsDecodeMatrix;");
        }

        if (cfg.clipping) {
            src.push("varying vec4 vWorldPosition;");
        }

        if (cfg.normals) {
            src.push("attribute vec3 normal;");
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
                src.push("vec3 localNormal = octDecode(normal.xy); ");
            } else {
                src.push("vec3 localNormal = normal; ");
            }
       //     src.push("localPosition.xyz +=  localNormal * 0.09; ");
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
            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition = modelViewMatrix * (localPosition + normal);");
        } else {
            src.push("worldPosition = modelMatrix2 * localPosition;");
            src.push("vec4 viewPosition  = viewMatrix2 * worldPosition; ");
        }

        src.push("vColor = vertexColor;");

        src.push("gl_PointSize = vertexSize;");

        if (cfg.clipping) {
            src.push("vWorldPosition = worldPosition;");
        }

        src.push("   gl_Position = projMatrix * viewPosition;");

        src.push("}");

        return src;
    }

    function buildFragment(gl, cfg, scene, object) {

        var i;
        var len;
        var src = [];

        src.push("// Vertices drawing fragment shader");

        src.push("precision lowp float;");

        if (cfg.gammaOutput) {
            src.push("uniform float gammaFactor;");
            src.push("vec4 linearToGamma( in vec4 value, in float gammaFactor ) {");
            src.push("  return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );");
            src.push("}");
        }

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
            src.push("}");
        }
        //if (roundPoints) {
        src.push("vec2 cxy = 2.0 * gl_PointCoord - 1.0;");
        src.push("float r = dot(cxy, cxy);");
        src.push("if (r > 1.0) {");
        src.push("   discard;");
        src.push("}");
        //}
        src.push("gl_FragColor = vColor;");
        if (cfg.gammaOutput) {
            src.push("gl_FragColor = linearToGamma(vColor, gammaFactor);");
        } else {
            src.push("gl_FragColor = vColor;");
        }
        src.push("}");
        return src;
    }

})();