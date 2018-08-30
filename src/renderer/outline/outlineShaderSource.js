/**
 * @author xeolabs / https://github.com/xeolabs
 */

class OutlineShaderSource {
    constructor(mesh) {
        this.vertex = buildVertex(mesh);
        this.fragment = buildFragment(mesh);
    }
}

function hasNormals(mesh) {
    const primitive = mesh._geometry._state.primitiveName;
    if ((mesh._geometry._state.autoVertexNormals || mesh._geometry._state.normals) && (primitive === "triangles" || primitive === "triangle-strip" || primitive === "triangle-fan")) {
        return true;
    }
    return false;
}

function buildVertex(mesh) {
    const scene = mesh.scene;
    const clipping = scene._clipsState.clips.length > 0;
    const quantizedGeometry = !!mesh._geometry._state.quantized;
    const normals = hasNormals(mesh);
    const billboard = mesh._state.billboard;
    const stationary = mesh._state.stationary;
    const src = [];
    src.push("// Outline effect vertex shader");
    src.push("attribute vec3 position;");
    src.push("uniform mat4 modelMatrix;");
    src.push("uniform mat4 viewMatrix;");
    src.push("uniform mat4 projMatrix;");
    src.push("uniform float width;");
    if (quantizedGeometry) {
        src.push("uniform mat4 positionsDecodeMatrix;");
    }
    if (clipping) {
        src.push("varying vec4 vWorldPosition;");
    }
    if (normals) {
        src.push("attribute vec3 normal;");
        if (quantizedGeometry) {
            src.push("vec3 octDecode(vec2 oct) {");
            src.push("    vec3 v = vec3(oct.xy, 1.0 - abs(oct.x) - abs(oct.y));");
            src.push("    if (v.z < 0.0) {");
            src.push("        v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);");
            src.push("    }");
            src.push("    return normalize(v);");
            src.push("}");
        }
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
    if (quantizedGeometry) {
        src.push("localPosition = positionsDecodeMatrix * localPosition;");
    }
    if (normals) {
        if (quantizedGeometry) {
            src.push("vec3 localNormal = octDecode(normal.xy); ");
        } else {
            src.push("vec3 localNormal = normal; ");
        }
        //src.push("  localPosition.xyz += (normalize(normal) * (width * 0.0005 * (projPos.z/1.0)));");
        src.push("  localPosition.xyz += (normalize(normal) * (width * 0.0005));");
    }
    src.push("mat4 viewMatrix2 = viewMatrix;");
    src.push("mat4 modelMatrix2 = modelMatrix;");
    if (stationary) {
        src.push("viewMatrix2[3][0] = viewMatrix2[3][1] = viewMatrix2[3][2] = 0.0;")
    }
    if (billboard === "spherical" || billboard === "cylindrical") {
        src.push("mat4 modelViewMatrix = viewMatrix2 * modelMatrix2;");
        src.push("billboard(modelMatrix2);");
        src.push("billboard(viewMatrix2);");
        src.push("billboard(modelViewMatrix);");
        src.push("worldPosition = modelMatrix2 * localPosition;");
        src.push("vec4 viewPosition = modelViewMatrix * localPosition;");
    } else {
        src.push("worldPosition = modelMatrix2 * localPosition;");
        src.push("vec4 viewPosition  = viewMatrix2 * worldPosition; ");
    }
    if (clipping) {
        src.push("vWorldPosition = worldPosition;");
    }
    src.push("   gl_Position = projMatrix * viewPosition;");
    src.push("}");
    return src;
}

function buildFragment(mesh) {
    const scene = mesh.scene;
    const clipsState = scene._clipsState;
    const clipping = clipsState.clips.length > 0;
    const src = [];
    src.push("precision lowp float;");
    src.push("uniform vec4  color;");
    if (clipping) {
        src.push("uniform bool clippable;");
        src.push("varying vec4 vWorldPosition;");
        for (var i = 0; i < clipsState.clips.length; i++) {
            src.push("uniform bool clipActive" + i + ";");
            src.push("uniform vec3 clipPos" + i + ";");
            src.push("uniform vec3 clipDir" + i + ";");
        }
    }
    src.push("void main(void) {");
    if (clipping) {
        src.push("if (clippable) {");
        src.push("  float dist = 0.0;");
        for (var i = 0; i < clipsState.clips.length; i++) {
            src.push("if (clipActive" + i + ") {");
            src.push("   dist += clamp(dot(-clipDir" + i + ".xyz, vWorldPosition.xyz - clipPos" + i + ".xyz), 0.0, 1000.0);");
            src.push("}");
        }
        src.push("  if (dist > 0.0) { discard; }");
        src.push("}");
    }
    src.push("   gl_FragColor = color;");
    src.push("}");
    return src;
}

export{OutlineShaderSource};