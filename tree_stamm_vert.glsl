precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat3 mNormal;
uniform vec3 lightDir;
attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec4 vColor;
varying vec3 fNormal;
varying vec3 fLightDir;
varying vec4 fColor;

void main()
{
  fNormal = mNormal * vNormal;
  fLightDir = (mView * vec4(lightDir, 0.0)).xyz;
  fColor = vColor;
  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
}