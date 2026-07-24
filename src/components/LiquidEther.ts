/**
 * LiquidEther.ts
 *
 * Vanilla TS port of React Bits' LiquidEther component.
 * GPU-accelerated fluid simulation background using Three.js.
 * Finds a container by selector and initializes the WebGL effect.
 */

import * as THREE from 'three';

interface LiquidEtherOptions {
  container: string | HTMLElement;
  colors?: string[];
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

interface LiquidEtherInstance {
  destroy: () => void;
}

function makePaletteTexture(stops: string[]): THREE.DataTexture {
  let arr: string[];
  if (Array.isArray(stops) && stops.length > 0) {
    arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
  } else {
    arr = ['#ffffff', '#ffffff'];
  }
  const w = arr.length;
  const data = new Uint8Array(w * 4);
  for (let i = 0; i < w; i++) {
    const c = new THREE.Color(arr[i]);
    data[i * 4 + 0] = Math.round(c.r * 255);
    data[i * 4 + 1] = Math.round(c.g * 255);
    data[i * 4 + 2] = Math.round(c.b * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// Shader sources
const face_vert = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  precision highp float;
  void main(){
    vec3 pos = position;
    vec2 scale = 1.0 - boundarySpace * 2.0;
    pos.xy = pos.xy * scale;
    uv = vec2(0.5)+(pos.xy)*0.5;
    gl_Position = vec4(pos, 1.0);
  }
`;

const line_vert = `
  attribute vec3 position;
  uniform vec2 px;
  precision highp float;
  varying vec2 uv;
  void main(){
    vec3 pos = position;
    uv = 0.5 + pos.xy * 0.5;
    vec2 n = sign(pos.xy);
    pos.xy = abs(pos.xy) - px * 1.0;
    pos.xy *= n;
    gl_Position = vec4(pos, 1.0);
  }
`;

const mouse_vert = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const advection_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform bool isBFECC;
  uniform vec2 fboSize;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
      vec2 vel = texture2D(velocity, uv).xy;
      vec2 uv2 = uv - vel * dt * ratio;
      vec2 newVel = texture2D(velocity, uv2).xy;
      gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
      vec2 spot_new = uv;
      vec2 vel_old = texture2D(velocity, uv).xy;
      vec2 spot_old = spot_new - vel_old * dt * ratio;
      vec2 vel_new1 = texture2D(velocity, spot_old).xy;
      vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
      vec2 error = spot_new2 - spot_new;
      vec2 spot_new3 = spot_new - error / 2.0;
      vec2 vel_2 = texture2D(velocity, spot_new3).xy;
      vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
      vec2 newVel2 = texture2D(velocity, spot_old2).xy;
      gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
  }
`;

const color_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D palette;
  uniform vec4 bgColor;
  varying vec2 uv;
  void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float speed = length(vel);
    float lenv = clamp(speed * 5.0, 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    float alpha = clamp(speed * 8.0, 0.0, 1.0);
    vec3 outRGB = mix(bgColor.rgb, c, alpha);
    float outA = mix(bgColor.a, 1.0, alpha);
    gl_FragColor = vec4(outRGB, outA);
  }
`;

const divergence_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
  }
`;

const externalForce_frag = `
  precision highp float;
  uniform vec2 force;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
  }
`;

const poisson_frag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
  }
`;

const pressure_frag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    float step = 1.0;
    float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

const viscous_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D velocity_new;
  uniform float v;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
  }
`;

export function initLiquidEther(opts: LiquidEtherOptions): LiquidEtherInstance | null {
  const containerEl = typeof opts.container === 'string'
    ? document.querySelector<HTMLElement>(opts.container)
    : opts.container;

  if (!containerEl) return null;

  const {
    colors = ['#5227FF', '#FF9FFC', '#B497CF'],
    mouseForce = 20,
    cursorSize = 100,
    isViscous = false,
    viscous = 30,
    iterationsViscous = 32,
    iterationsPoisson = 32,
    dt = 0.014,
    BFECC = true,
    resolution = 0.5,
    isBounce = false,
    autoDemo = true,
    autoSpeed = 0.5,
    autoIntensity = 2.2,
    takeoverDuration = 0.25,
    autoResumeDelay = 1000,
    autoRampDuration = 0.6
  } = opts;

  const paletteTex = makePaletteTexture(colors);
  const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

  // ── Common ──
  let commonWidth = 0;
  let commonHeight = 0;
  let commonPixelRatio = 1;
  let commonRenderer: THREE.WebGLRenderer | null = null;
  let commonClock: THREE.Clock | null = null;
  let commonDelta = 0;
  let commonTime = 0;
  let commonContainer: HTMLElement | null = null;

  function commonInit(container: HTMLElement) {
    commonContainer = container;
    commonPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    commonResize();
    commonRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    commonRenderer.autoClear = false;
    commonRenderer.setClearColor(new THREE.Color(0x000000), 0);
    commonRenderer.setPixelRatio(commonPixelRatio);
    commonRenderer.setSize(commonWidth, commonHeight);
    commonRenderer.domElement.style.width = '100%';
    commonRenderer.domElement.style.height = '100%';
    commonRenderer.domElement.style.display = 'block';
    commonClock = new THREE.Clock();
    commonClock.start();
  }

  function commonResize() {
    if (!commonContainer) return;
    const rect = commonContainer.getBoundingClientRect();
    commonWidth = Math.max(1, Math.floor(rect.width));
    commonHeight = Math.max(1, Math.floor(rect.height));
    if (commonRenderer) commonRenderer.setSize(commonWidth, commonHeight, false);
  }

  function commonUpdate() {
    if (!commonClock) return;
    commonDelta = commonClock.getDelta();
    commonTime += commonDelta;
  }

  // ── Mouse ──
  let mouseCoords = new THREE.Vector2();
  let mouseCoordsOld = new THREE.Vector2();
  let mouseDiff = new THREE.Vector2();
  let mouseTimer: number | null = null;
  let mouseContainer: HTMLElement | null = null;
  let mouseDocTarget: Document | null = null;
  let mouseListenerTarget: Window | null = null;
  let isHoverInside = false;
  let hasUserControl = false;
  let isAutoActive = false;
  let autoIntensityVal = autoIntensity;
  let takeoverActive = false;
  let takeoverStartTime = 0;
  let takeoverDurationVal = takeoverDuration;
  let takeoverFrom = new THREE.Vector2();
  let takeoverTo = new THREE.Vector2();
  let onInteractCallback: (() => void) | null = null;

  function mouseInit(container: HTMLElement) {
    mouseContainer = container;
    mouseDocTarget = container.ownerDocument || null;
    const defaultView = mouseDocTarget?.defaultView || window;
    mouseListenerTarget = defaultView;
    mouseListenerTarget.addEventListener('mousemove', onMouseMove);
    mouseListenerTarget.addEventListener('touchstart', onTouchStart, { passive: true });
    mouseListenerTarget.addEventListener('touchmove', onTouchMove, { passive: true });
    mouseListenerTarget.addEventListener('touchend', onTouchEnd);
    mouseDocTarget?.addEventListener('mouseleave', onDocLeave);
  }

  function mouseDispose() {
    mouseListenerTarget?.removeEventListener('mousemove', onMouseMove);
    mouseListenerTarget?.removeEventListener('touchstart', onTouchStart);
    mouseListenerTarget?.removeEventListener('touchmove', onTouchMove);
    mouseListenerTarget?.removeEventListener('touchend', onTouchEnd);
    mouseDocTarget?.removeEventListener('mouseleave', onDocLeave);
    mouseListenerTarget = null;
    mouseDocTarget = null;
    mouseContainer = null;
  }

  function isPointInside(clientX: number, clientY: number): boolean {
    if (!mouseContainer) return false;
    const rect = mouseContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function setCoords(x: number, y: number) {
    if (!mouseContainer) return;
    if (mouseTimer) window.clearTimeout(mouseTimer);
    const rect = mouseContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (x - rect.left) / rect.width;
    const ny = (y - rect.top) / rect.height;
    mouseCoords.set(nx * 2 - 1, -(ny * 2 - 1));
  }

  function setNormalized(nx: number, ny: number) {
    mouseCoords.set(nx, ny);
  }

  function onMouseMove(event: MouseEvent) {
    isHoverInside = isPointInside(event.clientX, event.clientY);
    if (!isHoverInside) return;
    if (onInteractCallback) onInteractCallback();
    if (isAutoActive && !hasUserControl && !takeoverActive) {
      if (!mouseContainer) return;
      const rect = mouseContainer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      takeoverFrom.copy(mouseCoords);
      takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
      takeoverStartTime = performance.now();
      takeoverActive = true;
      hasUserControl = true;
      isAutoActive = false;
      return;
    }
    setCoords(event.clientX, event.clientY);
    hasUserControl = true;
  }

  function onTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    const t = event.touches[0];
    isHoverInside = isPointInside(t.clientX, t.clientY);
    if (!isHoverInside) return;
    if (onInteractCallback) onInteractCallback();
    setCoords(t.clientX, t.clientY);
    hasUserControl = true;
  }

  function onTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    const t = event.touches[0];
    isHoverInside = isPointInside(t.clientX, t.clientY);
    if (!isHoverInside) return;
    if (onInteractCallback) onInteractCallback();
    setCoords(t.clientX, t.clientY);
  }

  function onTouchEnd() { isHoverInside = false; }
  function onDocLeave() { isHoverInside = false; }

  function mouseUpdate() {
    if (takeoverActive) {
      const t = (performance.now() - takeoverStartTime) / (takeoverDurationVal * 1000);
      if (t >= 1) {
        takeoverActive = false;
        mouseCoords.copy(takeoverTo);
        mouseCoordsOld.copy(mouseCoords);
        mouseDiff.set(0, 0);
      } else {
        const k = t * t * (3 - 2 * t);
        mouseCoords.copy(takeoverFrom).lerp(takeoverTo, k);
      }
    }
    mouseDiff.subVectors(mouseCoords, mouseCoordsOld);
    mouseCoordsOld.copy(mouseCoords);
    if (mouseCoordsOld.x === 0 && mouseCoordsOld.y === 0) mouseDiff.set(0, 0);
    if (isAutoActive && !takeoverActive) mouseDiff.multiplyScalar(autoIntensityVal);
  }

  // ── AutoDriver ──
  let autoActive = false;
  let autoCurrent = new THREE.Vector2(0, 0);
  let autoTarget = new THREE.Vector2();
  let autoLastTime = performance.now();
  let autoActivationTime = 0;
  let autoEnabled = autoDemo;
  let autoSpeedVal = autoSpeed;
  let autoResumeDelayMs = autoResumeDelay;
  let autoRampDurationMs = autoRampDuration * 1000;
  let lastUserInteraction = performance.now();
  const _tmpDir = new THREE.Vector2();

  function pickNewAutoTarget() {
    const r = Math.random;
    autoTarget.set((r() * 2 - 1) * 0.8, (r() * 2 - 1) * 0.8);
  }

  function autoForceStop() {
    autoActive = false;
    isAutoActive = false;
  }

  function autoUpdate() {
    if (!autoEnabled) return;
    const now = performance.now();
    const idle = now - lastUserInteraction;
    if (idle < autoResumeDelayMs) { if (autoActive) autoForceStop(); return; }
    if (isHoverInside) { if (autoActive) autoForceStop(); return; }
    if (!autoActive) {
      autoActive = true;
      autoCurrent.copy(mouseCoords);
      autoLastTime = now;
      autoActivationTime = now;
    }
    if (!autoActive) return;
    isAutoActive = true;
    let dts = (now - autoLastTime) / 1000;
    autoLastTime = now;
    if (dts > 0.2) dts = 0.016;
    const dir = _tmpDir.subVectors(autoTarget, autoCurrent);
    const dist = dir.length();
    if (dist < 0.01) { pickNewAutoTarget(); return; }
    dir.normalize();
    let ramp = 1;
    if (autoRampDurationMs > 0) {
      const t = Math.min(1, (now - autoActivationTime) / autoRampDurationMs);
      ramp = t * t * (3 - 2 * t);
    }
    const step = autoSpeedVal * dts * ramp;
    const move = Math.min(step, dist);
    autoCurrent.addScaledVector(dir, move);
    setNormalized(autoCurrent.x, autoCurrent.y);
  }

  pickNewAutoTarget();

  // ── ShaderPass ──
  class ShaderPass {
    props: Record<string, unknown>;
    uniforms: Record<string, { value: unknown }> | undefined;
    scene: THREE.Scene;
    camera: THREE.Camera;
    material: THREE.RawShaderMaterial | undefined;
    geometry: THREE.PlaneGeometry | undefined;
    plane: THREE.Mesh | undefined;

    constructor(props: Record<string, unknown>) {
      this.props = props || {};
      this.uniforms = (this.props.material as { uniforms?: Record<string, { value: unknown }> })?.uniforms;
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
    }

    baseInit() {
      if (this.uniforms) {
        this.material = new THREE.RawShaderMaterial(this.props.material as THREE.ShaderMaterialParameters);
        this.geometry = new THREE.PlaneGeometry(2.0, 2.0);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
      }
    }

    baseUpdate() {
      if (!commonRenderer) return;
      commonRenderer.setRenderTarget((this.props.output as THREE.WebGLRenderTarget) || null);
      commonRenderer.render(this.scene, this.camera);
      commonRenderer.setRenderTarget(null);
    }
  }

  // ── Advection ──
  class Advection extends ShaderPass {
    line: THREE.LineSegments;
    advectionUniforms: Record<string, { value: unknown }>;

    constructor(simProps: {
      cellScale: THREE.Vector2; fboSize: THREE.Vector2; dt: number;
      src: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget;
    }) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: advection_frag,
          uniforms: {
            boundarySpace: { value: simProps.cellScale },
            px: { value: simProps.cellScale },
            fboSize: { value: simProps.fboSize },
            velocity: { value: simProps.src.texture },
            dt: { value: simProps.dt },
            isBFECC: { value: true }
          }
        },
        output: simProps.dst
      });
      this.advectionUniforms = this.props.material as Record<string, { value: unknown }>;
      this.uniforms = this.advectionUniforms;
      this.baseInit();

      // Boundary
      const boundaryG = new THREE.BufferGeometry();
      const verts = new Float32Array([-1,-1,0, -1,1,0, -1,1,0, 1,1,0, 1,1,0, 1,-1,0, 1,-1,0, -1,-1,0]);
      boundaryG.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const boundaryM = new THREE.RawShaderMaterial({
        vertexShader: line_vert, fragmentShader: advection_frag, uniforms: this.advectionUniforms
      });
      this.line = new THREE.LineSegments(boundaryG, boundaryM);
      this.scene.add(this.line);
    }

    update(props: { dt: number; isBounce: boolean; BFECC: boolean }) {
      (this.advectionUniforms.dt.value as number) = props.dt;
      this.line.visible = props.isBounce;
      (this.advectionUniforms.isBFECC.value as boolean) = props.BFECC;
      this.baseUpdate();
    }
  }

  // ── ExternalForce ──
  class ExternalForce extends ShaderPass {
    mouseMesh: THREE.Mesh;
    efUniforms: Record<string, { value: unknown }>;

    constructor(simProps: { cellScale: THREE.Vector2; cursor_size: number; dst: THREE.WebGLRenderTarget }) {
      super({ output: simProps.dst });
      this.baseInit();
      const mouseG = new THREE.PlaneGeometry(1, 1);
      const mouseM = new THREE.RawShaderMaterial({
        vertexShader: mouse_vert, fragmentShader: externalForce_frag,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: {
          px: { value: simProps.cellScale },
          force: { value: new THREE.Vector2(0, 0) },
          center: { value: new THREE.Vector2(0, 0) },
          scale: { value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size) }
        }
      });
      this.mouseMesh = new THREE.Mesh(mouseG, mouseM);
      this.scene.add(this.mouseMesh);
      this.efUniforms = (mouseM as unknown as { uniforms: Record<string, { value: unknown }> }).uniforms;
    }

    update(props: { cursor_size: number; mouse_force: number; cellScale: THREE.Vector2 }) {
      const forceX = (mouseDiff.x / 2) * props.mouse_force;
      const forceY = (mouseDiff.y / 2) * props.mouse_force;
      const cX = Math.min(Math.max(mouseCoords.x, -1 + props.cursor_size * props.cellScale.x + props.cellScale.x * 2),
        1 - props.cursor_size * props.cellScale.x - props.cellScale.x * 2);
      const cY = Math.min(Math.max(mouseCoords.y, -1 + props.cursor_size * props.cellScale.y + props.cellScale.y * 2),
        1 - props.cursor_size * props.cellScale.y - props.cellScale.y * 2);
      (this.efUniforms.force.value as THREE.Vector2).set(forceX, forceY);
      (this.efUniforms.center.value as THREE.Vector2).set(cX, cY);
      (this.efUniforms.scale.value as THREE.Vector2).set(props.cursor_size, props.cursor_size);
      this.baseUpdate();
    }
  }

  // ── Viscous ──
  class ViscousPass extends ShaderPass {
    viscousUniforms: Record<string, { value: unknown }>;
    output0: THREE.WebGLRenderTarget;
    output1: THREE.WebGLRenderTarget;

    constructor(simProps: {
      cellScale: THREE.Vector2; boundarySpace: THREE.Vector2; viscous: number;
      src: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget; dst_: THREE.WebGLRenderTarget; dt: number;
    }) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: viscous_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            velocity: { value: simProps.src.texture },
            velocity_new: { value: simProps.dst_.texture },
            v: { value: simProps.viscous },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst
      });
      this.output0 = simProps.dst_;
      this.output1 = simProps.dst;
      this.viscousUniforms = this.props.material as Record<string, { value: unknown }>;
      this.uniforms = this.viscousUniforms;
      this.baseInit();
    }

    update(props: { viscous: number; iterations: number; dt: number }): THREE.WebGLRenderTarget {
      let fboIn: THREE.WebGLRenderTarget;
      let fboOut: THREE.WebGLRenderTarget;
      (this.viscousUniforms.v.value as number) = props.viscous;
      for (let i = 0; i < props.iterations; i++) {
        if (i % 2 === 0) { fboIn = this.output0; fboOut = this.output1; }
        else { fboIn = this.output1; fboOut = this.output0; }
        (this.viscousUniforms.velocity_new.value as THREE.Texture) = fboIn.texture;
        this.props.output = fboOut;
        (this.viscousUniforms.dt.value as number) = props.dt;
        this.baseUpdate();
      }
      return fboOut!;
    }
  }

  // ── Divergence ──
  class DivergencePass extends ShaderPass {
    divUniforms: Record<string, { value: unknown }>;
    constructor(simProps: {
      cellScale: THREE.Vector2; boundarySpace: THREE.Vector2;
      src: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget; dt: number;
    }) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: divergence_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            velocity: { value: simProps.src.texture },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst
      });
      this.divUniforms = this.props.material as Record<string, { value: unknown }>;
      this.uniforms = this.divUniforms;
      this.baseInit();
    }
    update(props: { vel: THREE.WebGLRenderTarget }) {
      (this.divUniforms.velocity.value as THREE.Texture) = props.vel.texture;
      this.baseUpdate();
    }
  }

  // ── Poisson ──
  class PoissonPass extends ShaderPass {
    poissonUniforms: Record<string, { value: unknown }>;
    output0: THREE.WebGLRenderTarget;
    output1: THREE.WebGLRenderTarget;
    constructor(simProps: {
      cellScale: THREE.Vector2; boundarySpace: THREE.Vector2;
      src: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget; dst_: THREE.WebGLRenderTarget;
    }) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: poisson_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            pressure: { value: simProps.dst_.texture },
            divergence: { value: simProps.src.texture },
            px: { value: simProps.cellScale }
          }
        },
        output: simProps.dst
      });
      this.output0 = simProps.dst_;
      this.output1 = simProps.dst;
      this.poissonUniforms = this.props.material as Record<string, { value: unknown }>;
      this.uniforms = this.poissonUniforms;
      this.baseInit();
    }
    update(props: { iterations: number }): THREE.WebGLRenderTarget {
      let pIn: THREE.WebGLRenderTarget;
      let pOut: THREE.WebGLRenderTarget;
      for (let i = 0; i < props.iterations; i++) {
        if (i % 2 === 0) { pIn = this.output0; pOut = this.output1; }
        else { pIn = this.output1; pOut = this.output0; }
        (this.poissonUniforms.pressure.value as THREE.Texture) = pIn.texture;
        this.props.output = pOut;
        this.baseUpdate();
      }
      return pOut!;
    }
  }

  // ── Pressure ──
  class PressurePass extends ShaderPass {
    pressureUniforms: Record<string, { value: unknown }>;
    constructor(simProps: {
      cellScale: THREE.Vector2; boundarySpace: THREE.Vector2;
      src_p: THREE.WebGLRenderTarget; src_v: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget; dt: number;
    }) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: pressure_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            pressure: { value: simProps.src_p.texture },
            velocity: { value: simProps.src_v.texture },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst
      });
      this.pressureUniforms = this.props.material as Record<string, { value: unknown }>;
      this.uniforms = this.pressureUniforms;
      this.baseInit();
    }
    update(props: { vel: THREE.WebGLRenderTarget; pressure: THREE.WebGLRenderTarget }) {
      (this.pressureUniforms.velocity.value as THREE.Texture) = props.vel.texture;
      (this.pressureUniforms.pressure.value as THREE.Texture) = props.pressure.texture;
      this.baseUpdate();
    }
  }

  // ── Simulation ──
  const simOptions = {
    iterations_poisson: iterationsPoisson,
    iterations_viscous: iterationsViscous,
    mouse_force: mouseForce,
    resolution,
    cursor_size: cursorSize,
    viscous,
    isBounce,
    dt,
    isViscous,
    BFECC
  };

  const fboKeys = ['vel_0', 'vel_1', 'vel_viscous0', 'vel_viscous1', 'div', 'pressure_0', 'pressure_1'] as const;
  type FboKey = typeof fboKeys[number];
  const fbos: Record<FboKey, THREE.WebGLRenderTarget> = {} as Record<FboKey, THREE.WebGLRenderTarget>;
  const fboSize = new THREE.Vector2();
  const cellScale = new THREE.Vector2();
  const boundarySpace = new THREE.Vector2();

  function getFloatType() {
    return /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
  }

  function simCalcSize() {
    const w = Math.max(1, Math.round(simOptions.resolution * commonWidth));
    const h = Math.max(1, Math.round(simOptions.resolution * commonHeight));
    cellScale.set(1 / w, 1 / h);
    fboSize.set(w, h);
  }

  function simCreateAllFBO() {
    const type = getFloatType();
    const fboOpts: THREE.RenderTargetOptions = {
      type, depthBuffer: false, stencilBuffer: false,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping
    };
    for (const key of fboKeys) {
      fbos[key] = new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts);
    }
  }

  let advection: Advection;
  let externalForce: ExternalForce;
  let viscousPass: ViscousPass;
  let divergencePass: DivergencePass;
  let poissonPass: PoissonPass;
  let pressurePass: PressurePass;

  function simCreateShaderPasses() {
    advection = new Advection({ cellScale, fboSize, dt: simOptions.dt, src: fbos.vel_0, dst: fbos.vel_1 });
    externalForce = new ExternalForce({ cellScale, cursor_size: simOptions.cursor_size, dst: fbos.vel_1 });
    viscousPass = new ViscousPass({
      cellScale, boundarySpace, viscous: simOptions.viscous,
      src: fbos.vel_1, dst: fbos.vel_viscous1, dst_: fbos.vel_viscous0, dt: simOptions.dt
    });
    divergencePass = new DivergencePass({
      cellScale, boundarySpace, src: fbos.vel_viscous0, dst: fbos.div, dt: simOptions.dt
    });
    poissonPass = new PoissonPass({
      cellScale, boundarySpace, src: fbos.div, dst: fbos.pressure_1, dst_: fbos.pressure_0
    });
    pressurePass = new PressurePass({
      cellScale, boundarySpace, src_p: fbos.pressure_0, src_v: fbos.vel_viscous0, dst: fbos.vel_0, dt: simOptions.dt
    });
  }

  function simResize() {
    simCalcSize();
    for (const key of fboKeys) fbos[key].setSize(fboSize.x, fboSize.y);
  }

  function simUpdate() {
    if (simOptions.isBounce) boundarySpace.set(0, 0);
    else boundarySpace.copy(cellScale);
    advection.update({ dt: simOptions.dt, isBounce: simOptions.isBounce, BFECC: simOptions.BFECC });
    externalForce.update({ cursor_size: simOptions.cursor_size, mouse_force: simOptions.mouse_force, cellScale });
    let vel = fbos.vel_1;
    if (simOptions.isViscous) {
      vel = viscousPass.update({ viscous: simOptions.viscous, iterations: simOptions.iterations_viscous, dt: simOptions.dt });
    }
    divergencePass.update({ vel });
    const pressure = poissonPass.update({ iterations: simOptions.iterations_poisson });
    pressurePass.update({ vel, pressure });
  }

  // ── Output ──
  let outputScene: THREE.Scene;
  let outputCamera: THREE.Camera;
  let outputMesh: THREE.Mesh;

  function outputInit() {
    simCalcSize();
    simCreateAllFBO();
    simCreateShaderPasses();
    outputScene = new THREE.Scene();
    outputCamera = new THREE.Camera();
    outputMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.RawShaderMaterial({
        vertexShader: face_vert, fragmentShader: color_frag,
        transparent: true, depthWrite: false,
        uniforms: {
          velocity: { value: fbos.vel_0.texture },
          boundarySpace: { value: new THREE.Vector2() },
          palette: { value: paletteTex },
          bgColor: { value: bgVec4 }
        }
      })
    );
    outputScene.add(outputMesh);
  }

  function outputResize() { simResize(); }

  function outputRender() {
    if (!commonRenderer) return;
    commonRenderer.setRenderTarget(null);
    commonRenderer.render(outputScene, outputCamera);
  }

  function outputUpdate() {
    simUpdate();
    outputRender();
  }

  // ── Init everything ──
  containerEl.style.position = containerEl.style.position || 'relative';
  containerEl.style.overflow = containerEl.style.overflow || 'hidden';

  commonInit(containerEl);
  mouseInit(containerEl);
  onInteractCallback = () => {
    lastUserInteraction = performance.now();
    autoForceStop();
  };

  outputInit();

  // Apply initial options
  Object.assign(simOptions, {
    mouse_force: mouseForce, cursor_size: cursorSize, isViscous, viscous,
    iterations_viscous: iterationsViscous, iterations_poisson: iterationsPoisson,
    dt, BFECC, resolution, isBounce
  });

  // Prepend canvas
  if (commonRenderer) containerEl.prepend((commonRenderer as THREE.WebGLRenderer).domElement);

  // ── RAF loop ──
  let running = false;
  let rafId = 0;

  function loop() {
    if (!running) return;
    autoUpdate();
    mouseUpdate();
    commonUpdate();
    outputUpdate();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    loop();
  }

  function pause() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  start();

  // ── IntersectionObserver ──
  let isVisible = true;
  const io = new IntersectionObserver(entries => {
    const entry = entries[0];
    isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
    if (isVisible && !document.hidden) start(); else pause();
  }, { threshold: [0, 0.01, 0.1] });
  io.observe(containerEl);

  // ── ResizeObserver ──
  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      commonResize();
      outputResize();
    });
  });
  ro.observe(containerEl);

  // ── Visibility ──
  function onVisibilityChange() {
    if (document.hidden) pause();
    else if (isVisible) start();
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // ── Window resize ──
  function onWindowResize() {
    commonResize();
    outputResize();
  }
  window.addEventListener('resize', onWindowResize);

  // ── Cleanup ──
  return {
    destroy() {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onWindowResize);
      mouseDispose();
      if (commonRenderer) {
        const canvas = commonRenderer.domElement;
        if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
        commonRenderer.dispose();
        commonRenderer.forceContextLoss();
      }
    }
  };
}
