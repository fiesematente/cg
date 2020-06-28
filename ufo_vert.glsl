precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vNormal;
varying vec3 fEyeDir;
varying vec3 fNormal;
uniform vec3 eyeDir;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;


void main()
{
  fEyeDir = eyeDir;
  fNormal = (mWorld * vec4(vNormal, 0.0)).xyz;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}