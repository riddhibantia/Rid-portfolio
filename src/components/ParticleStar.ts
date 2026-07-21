/**
 * ParticleStar.ts
 *
 * 3D particle star effect using OGL — a 4-pointed diamond/star shape
 * made of thousands of glowing particles. Mouse-reactive with subtle
 * orbit animation and bloom-like edge glow.
 */

import { Renderer, Program, Mesh, Geometry, Color } from 'ogl';

interface ParticleStarOptions {
  canvas?: string | HTMLCanvasElement;
  particleCount?: number;
  baseColor?: string;
  glowColor?: string;
  edgeColor?: string;
  rotationSpeed?: number;
  mouseStrength?: number;
}

const VERT = `#version 300 es
precision highp float;

in vec3 position;
in float aRandom;
in float aPhase;
in float aDist;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uRotation;
uniform float uMouseStrength;

out float vAlpha;
out float vDist;
out float vRandom;

mat2 rotate2d(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec3 pos = position;

  // Subtle orbit animation — each particle drifts slightly
  float drift = sin(uTime * 0.4 + aPhase * 6.28) * 0.015 * aRandom;
  float drift2 = cos(uTime * 0.35 + aPhase * 4.0) * 0.012 * aRandom;
  pos.x += drift;
  pos.y += drift2;
  pos.z += sin(uTime * 0.3 + aPhase * 5.0) * 0.01 * aRandom;

  // Slow Y-axis rotation
  pos.xz *= rotate2d(uRotation);

  // Project to 2D
  float fov = 1.8;
  float z = pos.z + 2.0;
  vec2 projected = pos.xy / z * fov;

  // Mouse repulsion
  vec2 mouseNorm = (uMouse / uResolution) * 2.0 - 1.0;
  mouseNorm.y *= -1.0;
  vec2 diff = projected - mouseNorm;
  float dist = length(diff);
  float repulse = exp(-dist * 4.0) * uMouseStrength;
  projected += normalize(diff + 0.0001) * repulse * 0.15;

  // Distance from center for glow (geometry-aligned isotropic distance)
  vDist = aDist;
  vAlpha = smoothstep(0.0, 0.2, 1.0 / z) * (0.4 + 0.6 * aRandom);
  vRandom = aRandom;

  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = max(1.0, (4.5 * aRandom + 1.5) / z);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec3 uBaseColor;
uniform vec3 uGlowColor;
uniform vec3 uEdgeColor;
uniform float uTime;

in float vAlpha;
in float vDist;
in float vRandom;

out vec4 fragColor;

void main() {
  // Soft circular point sprite
  vec2 pc = gl_PointCoord * 2.0 - 1.0;
  float d = length(pc);
  if (d > 1.0) discard;

  float softness = 1.0 - d * d;

  // Color blending: center core is bright white/pink (uEdgeColor), mid-range is uGlowColor, tips are uBaseColor
  float coreGlow = smoothstep(0.0, 0.45, vDist);
  float outerFade = smoothstep(0.3, 0.85, vDist);
  
  vec3 col = mix(uEdgeColor, uGlowColor, coreGlow);
  col = mix(col, uBaseColor, outerFade * 0.95);

  // Twinkle
  float twinkle = 0.65 + 0.35 * sin(uTime * 2.5 + vRandom * 40.0);

  float alpha = softness * vAlpha * twinkle;
  fragColor = vec4(col * alpha, alpha);
}
`;

/**
 * Generate particle positions on a 4-pointed star silhouette.
 * Uses a pinched aspect-ratio correct parametric star.
 */
function generateStarPositions(count: number): {
  positions: Float32Array;
  randoms: Float32Array;
  phases: Float32Array;
  dists: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const phases = new Float32Array(count);
  const dists = new Float32Array(count);

  const pinch = 0.78; // Controls how sharp/pinched the star diagonals are

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const rnd = Math.random();

    // 4-pointed star shape: r = cos(2θ) variant pinched for a sharp diamond-star silhouette
    const starRadius = 0.82 * (1.0 - pinch * Math.abs(Math.sin(2 * theta)));

    let r: number;
    let distVal: number;

    if (Math.random() < 0.35) {
      // 35% of particles concentrated exactly on the outer shell for a sharp, crisp silhouette
      r = starRadius * (0.96 + Math.random() * 0.04);
      distVal = 1.0;
    } else {
      // 65% are distributed inside the volume, denser towards the core
      const p = Math.pow(rnd, 2.2);
      r = starRadius * p;
      distVal = p;
    }

    // Minor organic dust scatter
    const scatter = (Math.random() - 0.5) * 0.05;

    // Apply horizontal stretch (X, Z scaled by 1.35) and vertical squish (Y scaled by 0.72) to match Ricardo Chance's reference shape
    positions[i * 3 + 0] = Math.cos(theta) * r * 1.35 + scatter * 0.5;
    positions[i * 3 + 1] = Math.sin(theta) * r * 0.72 + scatter * 0.5;
    // 3D thickness: star is puffier in the center and thin at the outer tips
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.28 * Math.max(0.0, 1.0 - r / starRadius) * 1.35;

    randoms[i] = Math.random();
    phases[i] = Math.random();
    dists[i] = distVal;
  }

  return { positions, randoms, phases, dists };
}

export function initParticleStar(
  canvasSelector: string,
  options: ParticleStarOptions = {}
): (() => void) | null {
  const canvasEl = document.querySelector<HTMLCanvasElement>(canvasSelector);
  if (!canvasEl) return null;

  const parentEl = canvasEl.parentElement;
  if (!parentEl) return null;

  const opts = {
    particleCount: 3000,
    baseColor: '#6d28d9',
    glowColor: '#a78bfa',
    edgeColor: '#e9d5ff',
    rotationSpeed: 0.08,
    mouseStrength: 1.0,
    ...options,
  };

  const renderer = new Renderer({
    canvas: canvasEl,
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const { positions, randoms, phases, dists } = generateStarPositions(opts.particleCount);

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    aRandom: { size: 1, data: randoms },
    aPhase: { size: 1, data: phases },
    aDist: { size: 1, data: dists },
  });

  const baseCol = new Color(opts.baseColor);
  const glowCol = new Color(opts.glowColor);
  const edgeCol = new Color(opts.edgeColor);

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: [canvasEl.width, canvasEl.height] },
      uMouse: { value: [canvasEl.width / 2, canvasEl.height / 2] },
      uRotation: { value: 0 },
      uMouseStrength: { value: opts.mouseStrength },
      uBaseColor: { value: [baseCol.r, baseCol.g, baseCol.b] },
      uGlowColor: { value: [glowCol.r, glowCol.g, glowCol.b] },
      uEdgeColor: { value: [edgeCol.r, edgeCol.g, edgeCol.b] },
    },
  });

  const mesh = new Mesh(gl, {
    mode: gl.POINTS,
    geometry,
    program,
  });

  // Mouse tracking
  let mouseX = canvasEl.width / 2;
  let mouseY = canvasEl.height / 2;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvasEl.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  };

  const onTouchMove = (e: TouchEvent) => {
    const rect = canvasEl.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
  };

  canvasEl.addEventListener('mousemove', onMouseMove);
  canvasEl.addEventListener('touchmove', onTouchMove, { passive: true });

  function resize() {
    if (!parentEl) return;
    const width = parentEl.offsetWidth;
    const height = parentEl.offsetHeight;
    renderer.setSize(width, height);
    program.uniforms.uResolution.value = [width, height];
  }

  window.addEventListener('resize', resize);
  resize();

  let animId = 0;
  const update = (t: number) => {
    animId = requestAnimationFrame(update);
    const time = t * 0.001;

    program.uniforms.uTime.value = time;
    program.uniforms.uMouse.value = [mouseX, mouseY];
    program.uniforms.uRotation.value = time * opts.rotationSpeed;

    renderer.render({ scene: mesh });
  };
  animId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    canvasEl.removeEventListener('mousemove', onMouseMove);
    canvasEl.removeEventListener('touchmove', onTouchMove);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
