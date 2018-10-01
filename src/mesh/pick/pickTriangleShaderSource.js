/**
 * @author xeolabs / https://github.com/xeolabs
 */

class PickTriangleShaderSource {
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
    src.push("// Surface picking vertex shader");
    src.push("attribute vec3 position;");
    src.push("attribute vec4 color;");
    src.push("uniform mat4 modelMatrix;");
    src.push("uniform mat4 viewMatrix;");
    src.push("uniform mat4 projMatrix;");
    if (clipping) {
        src.push("uniform bool clippable;");
        src.push("varying vec4 vWorldPosition;");
    }
    src.push("varying vec4 vColor;");
    if (quantizedGeometry) {
        src.push("uniform mat4 positionsDecodeMatrix;");
    }
    src.push("void main(void) {");
    src.push("vec4 localPosition = vec4(position, 1.0); ");
    if (quantizedGeometry) {
        src.push("localPosition = positionsDecodeMatrix * localPosition;");
    }
    src.push("   vec4 worldPosition = modelMatrix * localPosition; ");
    src.push("   vec4 viewPosition = viewMatrix * worldPosition;");
    if (clipping) {
        src.push("   vWorldPosition = worldPosition;");
    }
    src.push("   vColor = color;");
    src.push("   gl_Position = projMatrix * viewPosition;");
    src.push("}");
    return src;
}

function buildFragment(mesh) {
    const scene = mesh.scene;
    const clipsState = scene._clipsState;
    const clipping = clipsState.clips.length > 0;
    const src = [];
    src.push("// Surface picking fragment shader");
    src.push("precision lowp float;");
    src.push("varying vec4 vColor;");
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
    src.push("   gl_FragColor = vColor;");
    src.push("}");
    return src;
}

export{PickTriangleShaderSource};