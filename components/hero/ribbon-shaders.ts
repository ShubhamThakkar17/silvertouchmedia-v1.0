/**
 * Card shader: bends each plane onto the inside of a cylinder (with extra curl
 * toward the screen edges), optionally straightens the hovered card, and adds
 * RGB split + horizontal motion blur that grow with screen-space |x| and velocity.
 */
export const cardVertex = /* glsl */ `
uniform float uX;
uniform float uR;
uniform float uCurl;
uniform float uStraight;
uniform float uYOff;
varying vec2 vUv;
varying float vNdcX;
varying float vTheta;

float thetaOf(float s) {
  float t = s / uR;
  return t * (1.0 + uCurl * t * t);
}

void main() {
  vUv = uv;
  float th = clamp(thetaOf(uX + position.x), -2.2, 2.2);
  vec3 bent = vec3(uR * sin(th), position.y + uYOff, uR * (1.0 - cos(th)));
  float thc = thetaOf(uX);
  vec3 flatP = vec3(uR * sin(thc), position.y + uYOff, uR * (1.0 - cos(thc)))
             + vec3(cos(thc), 0.0, sin(thc)) * position.x;
  vec3 p = mix(bent, flatP, uStraight);
  vTheta = th;
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vNdcX = clip.x / clip.w;
  gl_Position = clip;
}
`;

export const cardFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uHover;
uniform float uVel;
uniform float uOpacity;
uniform float uAspect;     // photo width / photo height
uniform float uLabelFrac;  // label strip height / total height
uniform float uRadius;
uniform vec3 uCoral;
uniform vec3 uLabel;
varying vec2 vUv;
varying float vNdcX;
varying float vTheta;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float edge = smoothstep(0.5, 1.15, abs(vNdcX));
  float v = abs(uVel);
  float split = edge * edge * 0.010 + v * (0.0015 + edge * 0.014);
  vec2 dir = vec2(sign(vNdcX + 1e-4), 0.0);
  float blur = v * 0.022 * (0.2 + edge) + edge * edge * 0.004;

  vec3 col = vec3(0.0);
  vec3 alp = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float o = (float(i) / 4.0 - 0.5) * blur;
    vec2 uv = vUv + vec2(o, 0.0);
    vec4 cr = texture2D(uMap, uv + dir * split);
    vec4 cg = texture2D(uMap, uv);
    vec4 cb = texture2D(uMap, uv - dir * split);
    col += vec3(cr.r, cg.g, cb.b);
    alp += vec3(cr.a, cg.a, cb.a);
  }
  col /= 5.0;
  alp /= 5.0;

  float photoTop = 1.0 - uLabelFrac;
  float a;
  vec3 outCol;
  if (vUv.y < photoTop) {
    vec2 p = (vec2(vUv.x, vUv.y / photoTop) - 0.5) * vec2(uAspect, 1.0);
    float d = sdRoundRect(p, vec2(uAspect * 0.5, 0.5), uRadius);
    a = 1.0 - smoothstep(-0.003, 0.003, d);
    outCol = col * mix(1.0, 1.08, uHover);
    outCol *= mix(1.0, 0.5, edge);
  } else {
    vec3 tint = mix(uLabel, uCoral, uHover);
    outCol = tint * alp;
    a = max(alp.r, max(alp.g, alp.b)) * mix(0.75, 1.0, uHover) * mix(1.0, 0.55, edge);
  }

  float fade = 1.0 - smoothstep(1.25, 1.75, abs(vTheta));
  a *= uOpacity * fade;
  if (a < 0.004) discard;
  gl_FragColor = vec4(outCol, a);
  #include <colorspace_fragment>
}
`;
