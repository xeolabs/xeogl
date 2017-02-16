attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec4 a_tangent;
attribute vec2 a_texCoord0;

uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;

varying vec2 v_texCoord0;
varying vec3 v_tangent;
varying vec3 v_normal;
varying vec3 v_position;

void main(){
    vec4 pos = u_mvpMatrix * a_position;
    v_position = vec3(pos.xyz) / pos.w;
    v_normal = normalize(u_normalMatrix * vec3(a_normal));
    v_tangent = normalize(u_normalMatrix * vec3(a_tangent));
    v_texCoord0 = a_texCoord0;
    gl_Position = vec4(v_position, 1.0);
}


