/**
 * @author xeolabs / https://github.com/xeolabs
 */

class EmphasisEdgesShaderSource {
    constructor(mesh) {
        this.vertex = buildVertex(mesh);
        this.fragment = buildFragment(mesh);
    }
}

function buildVertex(mesh) {
    const scene = mesh.scene;
    const clipping = scene._clipsState.clips.length > 0;
    const quantizedGeometry = !!mesh._geometry._state.quantized;
    const billboard = mesh._state.billboard;
    const stationary = mesh._state.stationary;
    const src = [];
    src.push("// Edges drawing vertex shader");
    src.push("attribute vec3 position;");
    src.push("uniform mat4 modelMatrix;");
    src.push("uniform mat4 viewMatrix;");
    src.push("uniform mat4 projMatrix;");
    src.push("uniform vec4 edgeColor;");
    if (quantizedGeometry) {
        src.push("uniform mat4 positionsDecodeMatrix;");
    }
    if (clipping) {
        src.push("varying vec4 vWorldPosition;");
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
    if (quantizedGeometry) {
        src.push("localPosition = positionsDecodeMatrix * localPosition;");
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
    src.push("vColor = edgeColor;");
    if (clipping) {
        src.push("vWorldPosition = worldPosition;");
    }
    src.push("   gl_Position = projMatrix * viewPosition;");
    src.push("}");
    return src;
}

function buildFragment(mesh) {
    const clipsState = mesh.scene._clipsState;
    const gammaOutput = mesh.scene.gammaOutput;
    const clipping = clipsState.clips.length > 0;
    let i;
    let len;
    const src = [];
    src.push("// Edges drawing fragment shader");
    src.push("precision lowp float;");
    if (gammaOutput) {
        src.push("uniform float gammaFactor;");
        src.push("vec4 linearToGamma( in vec4 value, in float gammaFactor ) {");
        src.push("  return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );");
        src.push("}");
    }
    if (clipping) {
        src.push("varying vec4 vWorldPosition;");
        src.push("uniform bool clippable;");
        for (i = 0, len = clipsState.clips.length; i < len; i++) {
            src.push("uniform bool clipActive" + i + ";");
            src.push("uniform vec3 clipPos" + i + ";");
            src.push("uniform vec3 clipDir" + i + ";");
        }
    }
    src.push("varying vec4 vColor;");
    src.push("void main(void) {");
    if (clipping) {
        src.push("if (clippable) {");
        src.push("  float dist = 0.0;");
        for (i = 0, len = clipsState.clips.length; i < len; i++) {
            src.push("if (clipActive" + i + ") {");
            src.push("   dist += clamp(dot(-clipDir" + i + ".xyz, vWorldPosition.xyz - clipPos" + i + ".xyz), 0.0, 1000.0);");
            src.push("}");
        }
        src.push("  if (dist > 0.0) { discard; }");
        src.push("}");
    }
    src.push("gl_FragColor = vColor;");
    if (gammaOutput) {
        src.push("gl_FragColor = linearToGamma(vColor, gammaFactor);");
    } else {
        src.push("gl_FragColor = vColor;");
    }
    src.push("}");
    return src;
}

export {EmphasisEdgesShaderSource};