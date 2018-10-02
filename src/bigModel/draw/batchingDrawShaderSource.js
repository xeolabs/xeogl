/**
 * @author xeolabs / https://github.com/xeolabs
 */

const BatchingDrawShaderSource = function (tile) {
    this.vertex = buildVertex(tile);
    this.fragment = buildFragment(tile);
};

function buildVertex(tile) {
    const clipsState = tile.scene._clipsState;
    const lightsState = tile.scene._lightsState;
    const clipping = clipsState.clips.length > 0;
    let i;
    let len;
    let light;
    const src = [];

    src.push("// Batched geometry drawing vertex shader");

    src.push("attribute vec3 position;");
    src.push("attribute vec3 normal;");

    src.push("uniform mat4 viewMatrix;");
    src.push("uniform mat4 projMatrix;");
    src.push("uniform mat4 viewNormalMatrix;");
    src.push("uniform mat4 positionsDecodeMatrix;");

    src.push("uniform vec4 lightAmbient;");

    for (i = 0, len = lightsState.lights.length; i < len; i++) {
        light = lightsState.lights[i];
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

    src.push("vec3 octDecode(vec2 oct) {");
    src.push("    vec3 v = vec3(oct.xy, 1.0 - abs(oct.x) - abs(oct.y));");
    src.push("    if (v.z < 0.0) {");
    src.push("        v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);");
    src.push("    }");
    src.push("    return normalize(v);");
    src.push("}");

    if (clipping) {
        src.push("varying vec4 vWorldPosition;");
    }
    src.push("varying vec4 vColor;");

    src.push("void main(void) {");
    src.push("vec4 worldPosition = positionsDecodeMatrix * vec4(position, 1.0); ");
    src.push("vec4 viewPosition  = viewMatrix * worldPosition; ");
    src.push("vec4 worldNormal = vec4(octDecode(normal.xy), 0.0); ");
    src.push("vec3 viewNormal = normalize((viewNormalMatrix * worldNormal).xyz);");
    src.push("vec3 reflectedColor = vec3(0.0, 0.0, 0.0);");
    src.push("vec3 viewLightDir = vec3(0.0, 0.0, -1.0);");
    src.push("vec4 color = vec4(1.0, 1.0, 1.0, 1.0);");

    src.push("float lambertian = 1.0;");
    for (i = 0, len = lightsState.lights.length; i < len; i++) {
        light = lightsState.lights[i];
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
    src.push("vColor = vec4((reflectedColor * color.rgb), color.a);"); // TODO: How to have ambient bright enough for canvas BG but not too bright for scene?
    if (clipping) {
        src.push("vWorldPosition = worldPosition;");
    }
    src.push("   gl_Position = projMatrix * viewPosition;");
    src.push("}");
    return src;
}

function buildFragment(tile) {
    const scene = tile.scene;
    const clipsState = scene._clipsState;
    let i;
    let len;
    const clipping = clipsState.clips.length > 0;
    const src = [];
    src.push("// Batched geometry drawing fragment shader");
    src.push("precision lowp float;");
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
    src.push("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
    src.push("}");
    return src;
}

export {BatchingDrawShaderSource};