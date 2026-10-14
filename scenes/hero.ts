// Hero centrepiece: "a studio as a system" — scattered inputs (particles)
// converge on one working form (a noise-deformed core inside orbital rings).
// Plain three.js, procedural, no imported models. Loaded lazily by
// components/HeroStage.tsx after first paint; never on the 'static' tier.

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  NormalBlending,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { HERO_STACKED } from '@/lib/heroLayout';
import { palette } from '@/lib/tokens';

export type HeroQuality = 'high' | 'low';

export type HeroScene = {
  /** 0 → 1 timeline of the opening sequence (light, gather, assemble). */
  setIntro: (t: number) => void;
  /** 0 → 1 as the hero scrolls out of view. */
  setScroll: (p: number) => void;
  pulse: () => void;
  dispose: () => void;
};

// Ashima/Stefan Gustavson 3D simplex noise (MIT)
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);

export function createHeroScene(host: HTMLElement, quality: HeroQuality, theme: 'light' | 'dark' = 'dark'): HeroScene {
  const isLight = theme === 'light';
  const pal = palette(theme);
  // Additive glow vanishes on a light ground, so light mode blends normally.
  const glowBlend = isLight ? NormalBlending : AdditiveBlending;
  const high = quality === 'high';
  const renderer = new WebGLRenderer({ antialias: high, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 1.5 : 1.25));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const sculpture = new Group();
  scene.add(sculpture);

  const blue = new Color(pal.blue);
  const blueDim = new Color(pal.blueDim);
  const lime = new Color(pal.lime);
  const ink = new Color(isLight ? pal.text1 : '#F2F4F9');

  /* ---- core: noise-deformed, fresnel rim, faint iridescence ---- */
  const coreGeo = new IcosahedronGeometry(1.15, high ? 48 : 24);
  const coreMat = new ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uDissolve: { value: 0 },
      uPulse: { value: 0 },
      uAccent: { value: blue },
      uDim: { value: blueDim },
      uLight: { value: isLight ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      ${NOISE}
      uniform float uTime; uniform float uAssemble; uniform float uDissolve; uniform float uPulse;
      varying vec3 vN; varying vec3 vView; varying float vNoise;
      void main(){
        float n = snoise(normal * 1.6 + vec3(uTime * 0.12));
        vNoise = n;
        float amp = 0.16 + uPulse * 0.25;
        vec3 p = position * (0.35 + 0.65 * uAssemble) + normal * n * amp * uAssemble;
        p += normal * uDissolve * (1.2 + n);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAssemble; uniform float uDissolve; uniform vec3 uAccent; uniform vec3 uDim; uniform float uLight;
      varying vec3 vN; varying vec3 vView; varying float vNoise;
      void main(){
        float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.2);
        // key light from upper left, cool fill from below
        float key = max(dot(vN, normalize(vec3(-0.6, 0.7, 0.5))), 0.0);
        float fill = max(dot(vN, normalize(vec3(0.4, -0.8, 0.3))), 0.0) * 0.25;
        vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fres * 0.6 + vNoise * 0.15 + vec3(0.0, 0.33, 0.67)));
        vec3 base = mix(vec3(0.04, 0.047, 0.066), vec3(0.80, 0.86, 0.97), uLight);
        vec3 col = base + uDim * (key * 0.35 + fill) * (1.0 - uLight * 0.6) + uAccent * fres * mix(1.1, 0.9, uLight) + irid * fres * mix(0.18, 0.06, uLight);
        float a = (0.35 + fres * 0.65) * smoothstep(0.0, 0.6, uAssemble) * (1.0 - uDissolve);
        gl_FragColor = vec4(col, a);
      }`,
  });
  const core = new Mesh(coreGeo, coreMat);
  sculpture.add(core);

  /* ---- orbital rings ---- */
  const ringSpecs = [
    { r: 1.75, tilt: [1.2, 0.2, 0], speed: 0.12, color: blue, op: 0.55 },
    { r: 2.15, tilt: [0.4, 0.9, 0.3], speed: -0.08, color: blueDim, op: 0.5 },
    { r: 2.55, tilt: [1.6, -0.5, 0.6], speed: 0.05, color: new Color(pal.text2), op: isLight ? 0.3 : 0.18 },
  ];
  const rings = ringSpecs.map((s) => {
    const geo = new TorusGeometry(s.r, 0.0065, 6, high ? 220 : 140);
    const mat = new MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0 });
    const m = new Mesh(geo, mat);
    m.rotation.set(s.tilt[0], s.tilt[1], s.tilt[2]);
    sculpture.add(m);
    return { m, geo, mat, s };
  });

  /* ---- particles: scattered start → orbiting home ---- */
  const N = high ? 2600 : 1200;
  const start = new Float32Array(N * 3);
  const home = new Float32Array(N * 3); // (radius, angle, height) — orbit params
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 6 + Math.random() * 6;
    const s = Math.sqrt(1 - u * u);
    start.set([rr * s * Math.cos(th), rr * s * Math.sin(th), rr * u - 2], i * 3);
    home.set([1.4 + Math.pow(Math.random(), 1.6) * 2.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.9], i * 3);
    seed[i] = Math.random();
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(start, 3));
  pGeo.setAttribute('aHome', new BufferAttribute(home, 3));
  pGeo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  const pMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: glowBlend,
    uniforms: {
      uTime: { value: 0 },
      uGather: { value: 0 },
      uScatter: { value: 0 },
      uPointer: { value: new Vector3(99, 99, 0) },
      uPulse: { value: 0 },
      uPx: { value: renderer.getPixelRatio() },
      uAccent: { value: blue },
      uLime: { value: lime },
      uInk: { value: ink },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aHome; attribute float aSeed;
      uniform float uTime; uniform float uGather; uniform float uScatter; uniform vec3 uPointer; uniform float uPulse; uniform float uPx;
      varying float vSeed; varying float vA;
      void main(){
        float ang = aHome.y + uTime * (0.08 + aSeed * 0.12) * (aSeed > 0.5 ? 1.0 : -1.0);
        vec3 orbit = vec3(cos(ang) * aHome.x, aHome.z + sin(ang * 2.0 + aSeed * 6.28) * 0.12, sin(ang) * aHome.x);
        // tilt the orbital plane so it reads as a disc, not a line
        orbit = vec3(orbit.x, orbit.y * 0.9 + orbit.z * 0.32, orbit.z * 0.9 - orbit.y * 0.32);
        // a few particles "dock" into the core and drift back out
        float dock = smoothstep(0.92, 1.0, sin(uTime * 0.35 + aSeed * 40.0));
        orbit *= mix(1.0, 0.55, dock);
        float g = smoothstep(aSeed * 0.35, 0.65 + aSeed * 0.35, uGather);
        vec3 p = mix(position, orbit, g);
        p += normalize(orbit + 0.0001) * uScatter * (2.0 + aSeed * 5.0);
        p += normalize(orbit + 0.0001) * uPulse * (0.2 + aSeed * 0.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // soft repulsion from the pointer, in view space
        vec2 d = mv.xy - uPointer.xy;
        float r = length(d);
        mv.xy += (d / max(r, 0.001)) * smoothstep(0.9, 0.0, r) * 0.45;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.4 + aSeed * 2.4) * uPx * (8.0 / -mv.z);
        vSeed = aSeed;
        vA = (0.25 + 0.75 * g) * (1.0 - uScatter * 0.6);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent; uniform vec3 uLime; uniform vec3 uInk;
      varying float vSeed; varying float vA;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * vA;
        vec3 col = vSeed > 0.985 ? uLime : mix(uAccent, uInk, step(0.8, vSeed) * 0.5);
        gl_FragColor = vec4(col, a * 0.85);
      }`,
  });
  const particles = new Points(pGeo, pMat);
  sculpture.add(particles);

  /* ---- the single point of light the sequence opens on ---- */
  const lightGeo = new BufferGeometry();
  lightGeo.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const lightMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: glowBlend,
    uniforms: { uA: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uCol: { value: isLight ? blue : new Color('#F2F0FF') } },
    vertexShader: `uniform float uPx; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_PointSize = 90.0 * uPx; }`,
    fragmentShader: `uniform float uA; uniform vec3 uCol; void main(){ float d = length(gl_PointCoord - 0.5); float a = exp(-d * 14.0) + exp(-d * 4.0) * 0.25; gl_FragColor = vec4(uCol, a * uA); }`,
  });
  const light = new Points(lightGeo, lightMat);
  sculpture.add(light);

  /* ---- layout: sculpture off-centre (columns 7–12) on wide screens; on
     phones (globals.css .hero-visual) the canvas is its own square below
     the text, so the sculpture sits centred in it ---- */
  const layout = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    if (window.matchMedia(HERO_STACKED).matches) {
      sculpture.position.set(0, 0, 0);
      sculpture.scale.setScalar(0.9);
    } else if (width >= 1024) {
      sculpture.position.set(halfW * 0.6, 0.1, 0);
      sculpture.scale.setScalar(0.86);
    } else {
      sculpture.position.set(0, 1.35, 0);
      sculpture.scale.setScalar(Math.min(1, camera.aspect * 1.25));
    }
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(host);

  /* ---- input ---- */
  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  let pulse = 0;
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  /* ---- state + loop ---- */
  let intro = 0;
  let scroll = 0;
  let raf = 0;
  let running = false;
  let visible = true;
  const t0 = performance.now();

  const render = (now: number) => {
    const t = (now - t0) / 1000;
    pointer.lerp(target, 0.05); // damped inertia
    pulse *= 0.94;

    // opening sequence, mapped from a single 0→1 progress over ~1.8s
    const lightA = smooth(0, 0.17, intro) * (1 - smooth(0.45, 0.85, intro));
    const gather = easeOut(smooth(0.17, 0.61, intro));
    const assemble = easeOut(smooth(0.5, 1, intro));

    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uAssemble.value = assemble;
    coreMat.uniforms.uDissolve.value = scroll;
    coreMat.uniforms.uPulse.value = pulse;
    pMat.uniforms.uTime.value = t;
    pMat.uniforms.uGather.value = gather;
    pMat.uniforms.uScatter.value = scroll;
    pMat.uniforms.uPulse.value = pulse;
    lightMat.uniforms.uA.value = lightA;

    // pointer in view space at the sculpture's depth, for particle repulsion
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    pMat.uniforms.uPointer.value.set(pointer.x * halfH * camera.aspect - sculpture.position.x, pointer.y * halfH - sculpture.position.y, 0);

    rings.forEach(({ m, mat, s }, i) => {
      m.rotation.z += s.speed * 0.01;
      mat.opacity = s.op * smooth(0.55 + i * 0.1, 0.95, intro) * (1 - scroll);
      m.scale.setScalar(0.6 + 0.4 * assemble + scroll * 0.6);
    });

    sculpture.rotation.y = t * 0.06 + pointer.x * 0.35;
    sculpture.rotation.x = -pointer.y * 0.22;
    camera.position.x = pointer.x * 0.25; // a few degrees of parallax
    camera.position.y = pointer.y * 0.18 - scroll * 1.6;
    camera.position.z = 10 - scroll * 3.2; // dolly forward and down on scroll-out
    camera.lookAt(sculpture.position.x * 0.5, sculpture.position.y * 0.5 - scroll * 1.2, 0);

    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? play() : pause();
  });
  io.observe(host);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener('visibilitychange', onVis);
  play();

  return {
    setIntro: (v) => { intro = v; },
    setScroll: (p) => { scroll = p; },
    pulse: () => { pulse = 1; },
    dispose: () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      coreGeo.dispose();
      coreMat.dispose();
      rings.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
      pGeo.dispose();
      pMat.dispose();
      lightGeo.dispose();
      lightMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
