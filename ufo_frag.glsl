precision mediump float;

uniform samplerCube skybox;
varying vec3 fEyeDir;
varying vec3 fNormal;
void main()
{
  vec3 eyeDir = normalize(fEyeDir);
  vec3 normalDir = normalize(fNormal);
  vec3 reflection = textureCube(skybox, reflect(-eyeDir, normalDir)).rgb;
  gl_FragColor =  vec4(reflection, 1.0);
}