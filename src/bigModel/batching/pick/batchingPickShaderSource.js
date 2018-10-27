/**
 * @author xeolabs / https://github.com/xeolabs
 */

class BatchingPickShaderSource {
    constructor(layer) {
        this.vertex = buildVertex(layer);
        this.fragment = buildFragment(layer);
    }
}

function buildVertex(layer) {
    const scene = layer.model.scene;
    const clipping = scene._clipsState.clips.length > 0;
    const quantizedGeometry = !!layer._state.quantized;
    const src = [];
    src.push("// Batched geometry picking vertex shader");
    src.push("attribute vec3 position;");
    src.push("attribute vec4 flags;");
    src.push("attribute vec2 pickIDs;");
    src.push("uniform mat4 modelMatrix;");
    src.push("uniform mat4 viewMatrix;");
    src.push("uniform mat4 projMatrix;");
    src.push("uniform mat4 positionsDecodeMatrix;");
    src.push("uniform int pickMeshIndex;");
    if (clipping) {
        src.push("varying vec4 vWorldPosition;");
    }
    src.push("varying vec4 vPickColor;");
    src.push("vec3 pickIDToColor(float pickId) {"); // TODO: Encode as vec4 !!
    src.push("  vec3 color;");
    src.push("  color.b = floor(pickId / 256.0 / 256.0);");
    src.push("  color.g = floor((pickId - color.b * 256.0 * 256.0) / 256.0);");
    src.push("  color.r = floor(pickId - color.b * 256.0 * 256.0 - color.g * 256.0);");
    src.push("  return color / 255.0;"); // now we have a vec3 with the 3 components in range [0..255]. Let's normalize it!
    src.push("}");
    src.push("void main(void) {");
    src.push("  bool visible = (float(flags.x) > 0.0);");
    src.push("  if (!visible) {");
    src.push("      gl_Position = vec4(0.0, 0.0, 0.0, 0.0);"); // Cull vertex
    src.push("  } else {");
    src.push("      vec4 worldPosition = modelMatrix * (positionsDecodeMatrix * vec4(position, 1.0)); ");
    src.push("      vec4 viewPosition  = viewMatrix * worldPosition; ");
    src.push("      vPickColor = vec4(pickIDToColor(float(pickMeshIndex) + pickIDs.x), 1.0);");
    if (clipping) {
        src.push("      vWorldPosition = worldPosition;");
    }
    src.push("      gl_Position = projMatrix * viewPosition;");
    src.push("  }");
    src.push("}");
    return src;
}

function buildFragment(layer) {
    const scene = layer.model.scene;
    const clipsState = scene._clipsState;
    const clipping = clipsState.clips.length > 0;
    const src = [];
    src.push("// Batched geometry picking fragment shader");
    src.push("precision mediump float;");
    if (clipping) {
        src.push("uniform bool clippable;");
        src.push("varying vec4 vWorldPosition;");
        for (var i = 0; i < clipsState.clips.length; i++) {
            src.push("uniform bool clipActive" + i + ";");
            src.push("uniform vec3 clipPos" + i + ";");
            src.push("uniform vec3 clipDir" + i + ";");
        }
    }
    src.push("varying vec4 vPickColor;");
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
    src.push("   gl_FragColor = vPickColor; ");
    src.push("}");
    return src;
}

export{BatchingPickShaderSource};