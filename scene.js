/* =====================================================================
   Nala Moon Studio — Sternen- und Filamentstaub (Three.js)
   Eine einzige Aufgabe: Tiefe. Ein Partikelfeld, durch das die Kamera
   beim Scrollen gleitet (unendlicher Tunnel per modulo), leicht auf den
   Zeiger reagiert und funkelt. Additiv über dem Film, nie vor dem Text.
   Pausiert, wenn die Bühne geparkt oder der Tab unsichtbar ist.
   Wird unter prefers-reduced-motion und ohne WebGL gar nicht gestartet.
   ===================================================================== */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.getElementById('stageStars');
const stage = document.getElementById('stage');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canvas && stage && !reduce) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (e) { canvas.remove(); return; }

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 0);

  /* ---- Partikel ---- */
  const isSmall = window.innerWidth < 900;
  const COUNT = isSmall ? 700 : 1300;
  const DEPTH = 140;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const gold = new THREE.Color('#f4cf6e');
  const lilac = new THREE.Color('#c9b8ff');
  const cream = new THREE.Color('#f6efe4');
  const tmp = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = Math.random();
    // Ein leerer Kanal in der Mitte, damit der Staub das Motiv umrahmt statt es zu überdecken.
    const ang = Math.random() * Math.PI * 2;
    const rad = 6 + Math.pow(Math.random(), 0.7) * 44;
    pos[i * 3] = Math.cos(ang) * rad * 1.35;
    pos[i * 3 + 1] = Math.sin(ang) * rad;
    pos[i * 3 + 2] = -Math.random() * DEPTH;
    tmp.copy(r < 0.42 ? gold : r < 0.78 ? lilac : cream);
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    size[i] = 0.6 + Math.pow(Math.random(), 2.2) * 2.6;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));

  const uniforms = {
    uTime: { value: 0 },
    uTravel: { value: 0 },
    uDepth: { value: DEPTH },
    uPixelRatio: { value: DPR },
    uFade: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; attribute float aPhase;
      uniform float uTime; uniform float uTravel; uniform float uDepth; uniform float uPixelRatio;
      varying vec3 vColor; varying float vTwinkle; varying float vDepthFade;
      void main(){
        vColor = aColor;
        vec3 p = position;
        // unendlicher Tunnel: Partikel wandern mit dem Scroll auf die Kamera zu und werden hinten neu eingereiht
        p.z = mod(p.z + uTravel, uDepth) - uDepth + 4.0;
        p.x += sin(uTime * 0.18 + aPhase) * 0.6;
        p.y += cos(uTime * 0.14 + aPhase * 1.3) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float tw = 0.65 + 0.35 * sin(uTime * 1.4 + aPhase * 3.0);
        vTwinkle = tw;
        float near = smoothstep(-2.0, -14.0, mv.z);      // nah an der Kamera ausblenden
        float far = 1.0 - smoothstep(-uDepth * 0.55, -uDepth, mv.z); // in der Tiefe verblassen
        vDepthFade = near * far;
        gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z) * (0.85 + 0.15 * tw);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uFade;
      varying vec3 vColor; varying float vTwinkle; varying float vDepthFade;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        float glow = pow(core, 2.2);
        float a = glow * vTwinkle * vDepthFade * uFade * 0.75;
        gl_FragColor = vec4(vColor, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  /* ---- Zustand ---- */
  const target = { rx: 0, ry: 0 };
  const cur = { rx: 0, ry: 0 };
  let running = false, visible = !document.hidden, parked = false, raf = 0;
  const clock = new THREE.Clock();

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  let pointerT = 0;
  function onPointer(e) {
    const now = performance.now();
    if (now - pointerT < 32) return; // ~30 Hz reicht für Atmosphäre
    pointerT = now;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    target.ry = nx * 0.045;
    target.rx = -ny * 0.03;
  }
  function onLeave() { target.rx = 0; target.ry = 0; }

  function frame() {
    raf = 0;
    if (!running) return;
    const t = clock.getElapsedTime();
    const nm = window.NM || {};
    uniforms.uTime.value = t;
    // Scrollfortschritt der Kino-Strecke (0–1) treibt die Fahrt durch den Staub; danach gleitet er sanft weiter.
    const travel = (nm.cinema || 0) * 70 + (nm.scroll || 0) * 20 + t * 0.9;
    uniforms.uTravel.value = travel;
    uniforms.uFade.value = 1 - Math.min(1, Math.max(0, (nm.dim || 0)));
    cur.rx += (target.rx - cur.rx) * 0.06;
    cur.ry += (target.ry - cur.ry) * 0.06;
    camera.rotation.x = cur.rx;
    camera.rotation.y = cur.ry;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function update() {
    const should = visible && !parked;
    if (should && !running) { running = true; clock.start(); if (!raf) raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('blur', onLeave);
  document.addEventListener('mouseleave', onLeave);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; update(); });
  // main.js parkt die Bühne, sobald die festen Abschnitte sie vollständig verdecken.
  const mo = new MutationObserver(() => { parked = stage.classList.contains('is-parked'); update(); });
  mo.observe(stage, { attributes: true, attributeFilter: ['class'] });
  parked = stage.classList.contains('is-parked');
  update();

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }, false);
  canvas.addEventListener('webglcontextrestored', () => { update(); }, false);

  window.addEventListener('pagehide', () => {
    running = false; if (raf) cancelAnimationFrame(raf);
    mo.disconnect();
    geo.dispose(); mat.dispose(); renderer.dispose();
  }, { once: true });
}
