precision mediump float;

uniform vec3 u_lightPosition;
uniform samplerCube u_envTexture;

uniform sampler2D u_baseColorTexture;
uniform sampler2D u_metallicTexture;
uniform sampler2D u_roughnessTexture;
uniform sampler2D u_normalTexture;

uniform vec3 u_camera;
uniform vec3 u_baseColor;
uniform float u_metallic;
uniform float u_roughness;

varying vec2 v_texCoord0;
varying vec3 v_tangent;
varying vec3 v_normal; 
varying vec3 v_position;

const float M_PI = 3.141592653589793;

void main(){

  vec3 lightPosition = vec3(3,3,5);
  vec3 cameraPosition = vec3(0,0,5);
  
  vec4 baseColor = texture2D(u_baseColorTexture, v_texCoord0);

  // Normal Map
  vec3 n = normalize(v_normal);
  vec3 t = normalize(v_tangent);
  vec3 b = cross(n, t);
  mat3 tbn = mat3(t, b, n);
  n = texture2D(u_normalTexture, v_texCoord0).rgb;
  n = normalize(n * 2.0 - 1.0);
  n = normalize(tbn * n);

  vec3 l = normalize(lightPosition - v_position);
  vec3 v = normalize(cameraPosition - v_position);
  vec3 h = normalize(l + v);
  float nDotV = max(0.0, dot(n,v));
  float nDotL = max(0.0, dot(n,l));
  float nDotH = max(0.0, dot(n,h));
  float vDotH = max(0.0, dot(v,h));

  // Fresnel Term: Schlick's Approximation
  float metallic = texture2D(u_metallicTexture, v_texCoord0).x;
  vec3 specularColor = (baseColor.rgb * metallic) + (vec3(0.04) * (1.0 - metallic));
  vec3 f = specularColor + ((1.0 - specularColor) * pow(1.0 - vDotH, 5.0));

  // Geometric Attenuation Term: Schlick-Beckmann
  float roughness = texture2D(u_roughnessTexture, v_texCoord0).x;
  float a = roughness * roughness; // UE4 definition
  float k = ((roughness + 1.0) * (roughness + 1.0)) / 8.0;
  float g1L = nDotL / ((nDotL * (1.0 - k)) + k);
  float g1V = nDotV / ((nDotV * (1.0 - k)) + k);
  float g = g1L * g1V;

  // Normal Distribution Function: GGX (Trowbridge-Reitz)
  float a2 = a * a;
  float nDotH2 = nDotH * nDotH;
  float denom = M_PI * (nDotH2 * (a2 - 1.0) + 1.0) * (nDotH2 * (a2 - 1.0) + 1.0);
  float d = a2 / denom;

  // Specular BRDF
  vec3 specBRDF = (d * f * g) / (4.0 * nDotL * nDotV);

  metallic = 0.5; // Hack to look good before environment maps
  vec3 diffuseColor = baseColor.rgb * (1.0 - metallic);
  vec4 diffuse = vec4(diffuseColor * nDotL, 1.0);
  vec4 specular = vec4(specularColor * specBRDF, 1.0);
  
  vec4 finalColor = clamp(diffuse + specular, 0.0, 1.0);
  
  //finalColor = vec4(v_normal, 1.0);
  
  gl_FragColor = finalColor;
}


