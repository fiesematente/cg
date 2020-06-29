precision mediump float;

uniform vec3 cAmbient;
uniform vec3 cDiffuse;
uniform vec3 cSpecular;
uniform float alpha;
varying vec3 fNormal;
varying vec3 fLightDir;
varying vec4 fColor;
void main()
{
  vec3 lightDir = normalize(fLightDir);
  vec3 normalDir = normalize(fNormal);
  vec3 eyeDir = vec3(0.0, 0.0, 1.0);
  vec3 light = cAmbient;
  light += cDiffuse * max(dot(normalDir, lightDir), 0.0);
  light += cSpecular * pow(max(dot(reflect(-lightDir, normalDir), eyeDir), 0.0), alpha);
  gl_FragColor =  vec4(fColor.rgb * light, fColor.a);
}