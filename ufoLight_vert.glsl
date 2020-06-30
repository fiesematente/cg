precision mediump float;

attribute vec4 vertColor;
attribute vec3 vertPosition;
varying vec4 fragColor;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;


void main()
{
  
  fragColor = vertColor;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}