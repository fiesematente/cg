precision mediump float;

attribute vec3 vertColor;
attribute vec3 vertPosition;
varying vec3 fragColor;
uniform mat4 mWorld;
uniform mat4 viewGLSL;
uniform mat4 projGLSL;


void main()
{
  
  fragColor = vertColor;
  gl_Position = projGLSL * viewGLSL * mWorld * vec4(vertPosition, 1.0);
}