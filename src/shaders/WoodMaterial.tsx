import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WoodConfig } from '../types/index.ts';

// ─── Vertex Shader ──────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ─── Fragment Shader ────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 u_baseColor;
uniform vec3 u_grainColor;
uniform float u_grainDensity;
uniform float u_grainCurvature;
uniform float u_roughness;
uniform int u_figuring;
uniform float u_time;
uniform float u_seed;
uniform vec3 u_lightDir;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;

// ──────────────────────────────────────────────────────────────────────────
// Classic 3D Perlin noise (Stefan Gustavson, adapted for GLSL)
// ──────────────────────────────────────────────────────────────────────────

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289v3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// ──────────────────────────────────────────────────────────────────────────
// Wood grain generation in virtual log space
// ──────────────────────────────────────────────────────────────────────────

float woodGrain(vec3 logPos) {
  // Offset the pith (center of the log) slightly for asymmetric rings
  vec3 pithOffset = vec3(
    0.15 * snoise(vec3(u_seed, 0.0, 0.0)),
    0.0,
    0.12 * snoise(vec3(0.0, u_seed, 0.0))
  );
  vec3 centered = logPos - pithOffset;

  // Distance from the pith in the cross-section plane (XZ)
  float dist = length(centered.xz);

  // Growth ring pattern - rings are concentric cylinders
  float ringFreq = u_grainDensity;
  float rings = dist * ringFreq;

  // Add noise perturbation to rings for natural waviness
  float noiseScale = 2.0;
  float perturbation = u_grainCurvature * fbm(logPos * noiseScale + u_seed, 4);
  rings += perturbation;

  // Additional low-frequency ring wobble
  rings += 0.3 * u_grainCurvature * snoise(logPos * 0.5 + u_seed * 1.37);

  // Create ring pattern: sharp transitions between early/late wood
  float ringPattern = sin(rings * 6.2831853);
  // Sharpen the ring edges for a more realistic look
  ringPattern = sign(ringPattern) * pow(abs(ringPattern), 0.6);
  // Remap to 0-1
  ringPattern = ringPattern * 0.5 + 0.5;

  return ringPattern;
}

float grainLines(vec3 logPos) {
  // Longitudinal grain streaks along the Y axis
  float streaks = snoise(vec3(logPos.x * 8.0, logPos.y * 0.5, logPos.z * 8.0) + u_seed * 2.71);
  streaks += 0.5 * snoise(vec3(logPos.x * 16.0, logPos.y * 1.0, logPos.z * 16.0) + u_seed * 3.14);
  return streaks * 0.3;
}

// Figuring patterns
float curlyFigure(vec3 logPos) {
  // Periodic wavy distortion perpendicular to grain
  float wave = sin(logPos.y * 30.0 + 2.0 * snoise(logPos * 3.0 + u_seed)) * 0.5 + 0.5;
  float intensity = pow(wave, 2.0);
  return intensity * 0.5;
}

float birdseyeFigure(vec3 logPos) {
  // Scattered small circular patterns
  vec3 p = logPos * 12.0 + u_seed;
  // Use noise to create random dot positions
  float dots = 0.0;
  for (int i = 0; i < 3; i++) {
    vec3 offset = vec3(float(i) * 17.3, float(i) * 31.7, float(i) * 7.9);
    float n = snoise(p * (1.0 + float(i) * 0.5) + offset);
    // Threshold to get sharp circles
    dots += smoothstep(0.65, 0.72, n);
  }
  return clamp(dots * 0.35, 0.0, 1.0);
}

float quiltedFigure(vec3 logPos) {
  // Undulating 3D bumps that create a shimmering quilt pattern
  float bump1 = sin(logPos.x * 15.0 + snoise(logPos * 2.0) * 3.0);
  float bump2 = sin(logPos.z * 15.0 + snoise(logPos * 2.5 + 5.0) * 3.0);
  float quilt = bump1 * bump2;
  return quilt * 0.5 + 0.5;
}

float burlFigure(vec3 logPos) {
  // Chaotic swirling pattern
  vec3 p = logPos * 4.0 + u_seed;
  float swirl = fbm(p + fbm(p + fbm(vec3(p), 3) * 0.5, 3) * 0.5, 4);
  return swirl * 0.5 + 0.5;
}

void main() {
  // Map surface position back to virtual log space.
  // The pen blank is a cylinder: vUv.x wraps around (angle), vUv.y along length.
  // We reconstruct the 3D "log" position from the cylindrical coordinates.
  float angle = vUv.x * 6.2831853; // 0 to 2PI
  float lengthPos = vUv.y;

  // Virtual log dimensions - imagine a log section the blank was cut from
  // The blank radius is ~0.375 inches, but the log could be any size.
  // We place the blank at an offset from the pith for more interesting grain.
  float logRadius = 3.0; // virtual log radius in grain-space
  float blankOffset = 1.5; // how far from pith center the blank was cut

  vec3 logPos = vec3(
    blankOffset + cos(angle) * 0.5,
    lengthPos * 5.0, // scale to blank length in grain space
    sin(angle) * 0.5
  );

  // Compute wood grain
  float rings = woodGrain(logPos);
  float grain = grainLines(logPos);

  // Combine ring pattern with longitudinal grain
  float woodPattern = clamp(rings + grain, 0.0, 1.0);

  // Apply figuring
  float figureEffect = 0.0;
  if (u_figuring == 1) {
    figureEffect = curlyFigure(logPos);
  } else if (u_figuring == 2) {
    figureEffect = birdseyeFigure(logPos);
  } else if (u_figuring == 3) {
    figureEffect = quiltedFigure(logPos);
  } else if (u_figuring == 4) {
    figureEffect = burlFigure(logPos);
  }

  // Modulate wood pattern with figuring
  woodPattern = clamp(woodPattern + figureEffect * 0.4, 0.0, 1.0);

  // Mix base and grain colors
  vec3 color = mix(u_baseColor, u_grainColor, woodPattern);

  // Add fine detail noise for micro-texture
  float microDetail = snoise(logPos * 40.0 + u_seed * 0.5) * 0.03;
  color += microDetail;

  // Simple lighting
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(u_lightDir);
  float NdotL = max(dot(normal, lightDir), 0.0);

  // Ambient + diffuse
  float ambient = 0.25;
  float diffuse = NdotL * 0.65;

  // Subtle specular for finish
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), mix(20.0, 80.0, 1.0 - u_roughness));
  float specIntensity = mix(0.05, 0.3, 1.0 - u_roughness);

  // Grain lines should be slightly smoother - modulate roughness
  float localRoughness = u_roughness - grain * 0.05;
  localRoughness = clamp(localRoughness, 0.05, 1.0);

  // Subtle shimmer when lathe spins (time-based)
  float shimmer = 0.0;
  if (u_time > 0.0) {
    shimmer = snoise(vec3(angle * 2.0, lengthPos * 10.0, u_time * 0.5)) * 0.02;
  }

  vec3 finalColor = color * (ambient + diffuse) + vec3(spec * specIntensity) + shimmer;

  // Gamma correction
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// ─── Figuring enum mapping ──────────────────────────────────────────────────
function figuringToInt(figuring: WoodConfig['figuring']): number {
  switch (figuring) {
    case 'none': return 0;
    case 'curly': return 1;
    case 'birdseye': return 2;
    case 'quilted': return 3;
    case 'burl': return 4;
    default: return 0;
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface WoodMaterialProps {
  config: WoodConfig;
  seed?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function WoodMaterial({ config, seed = 42.0 }: WoodMaterialProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Update time uniform each frame
  useFrame((_state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value += delta;
    }
  });

  // Build uniforms object
  const uniforms = useRef({
    u_baseColor: { value: new THREE.Vector3(...config.baseColor) },
    u_grainColor: { value: new THREE.Vector3(...config.grainColor) },
    u_grainDensity: { value: config.grainDensity },
    u_grainCurvature: { value: config.grainCurvature },
    u_roughness: { value: config.roughness },
    u_figuring: { value: figuringToInt(config.figuring) },
    u_time: { value: 0.0 },
    u_seed: { value: seed },
    u_lightDir: { value: new THREE.Vector3(1.0, 1.0, 0.5).normalize() },
  });

  // Update uniforms when config changes (via ref to avoid re-creating material)
  const prevConfig = useRef(config);
  if (prevConfig.current !== config) {
    prevConfig.current = config;
    const u = uniforms.current;
    u.u_baseColor.value.set(...config.baseColor);
    u.u_grainColor.value.set(...config.grainColor);
    u.u_grainDensity.value = config.grainDensity;
    u.u_grainCurvature.value = config.grainCurvature;
    u.u_roughness.value = config.roughness;
    u.u_figuring.value = figuringToInt(config.figuring);
  }

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms.current}
    />
  );
}

export default WoodMaterial;
