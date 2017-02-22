precision highp float;

attribute vec4 a_position;
attribute vec4 a_normal;

uniform mat4 u_modelViewMatrix;
uniform mat3 u_normalMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_position;
varying vec3 v_normal;

void main(void)
{
    vec4 pos = u_modelViewMatrix * a_position;
    v_normal  = u_normalMatrix * a_normal.xyz;
    v_position = pos.xyz;
    gl_Position = u_projectionMatrix * pos;
}
