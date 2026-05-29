/* ════════════════════════════════════════════════════════════════════
   SCENE3D — McCallum Media Group
   ────────────────────────────────────────────────────────────────────
   Cinematic 3D scroll layer. A single fixed canvas behind the site
   content. Reacts to scroll progress: morphing geometry, particle
   field, depth parallax. Designed to *deepen* the existing
   cinematic vocabulary — never compete with it.

   Sections (mapped to index.html):
     0  HERO         → aperture / depth-field particles
     1  MANIFESTO    → wireframe icosahedron ("story crystal")
     2  PANELS       → morphing form (sphere→cube→pyramid)
     3  AI           → fade out (existing aiCanvas takes over)
     4  STATS        → re-emerge: low ribbon flow
     5  PHILOSOPHY   → horizon-line particle convergence
     6  WHO/CTA      → tri-color wave field

   Performance: throttled to device pixel ratio cap, suspended when
   tab hidden, respects prefers-reduced-motion.
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── BAIL EARLY ────────────────────────────────────────────────────
  if (typeof THREE === 'undefined') {
    console.warn('[scene3d] THREE not loaded');
    return;
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── BRAND PALETTE (matches css/global.css) ────────────────────────
  const COLORS = {
    bg:     new THREE.Color('#0A0A08'),
    fg:     new THREE.Color('#F5F0E8'),
    teal:   new THREE.Color('#2DD4BF'),
    gold:   new THREE.Color('#C9973A'),
    orange: new THREE.Color('#C2612F'),
    green:  new THREE.Color('#1F4D3A'),
  };

  // ── CANVAS HOST ───────────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'scene3d-host';
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '1',           // sits above body bg, beneath content (content is z>=10)
    opacity: '0',
    transition: 'opacity 1.2s ease-out',
  });
  document.body.insertBefore(host, document.body.firstChild);

  // ── THREE BOOT ────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0A0A08, 0.018);

  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  );
  camera.position.set(0, 0, 18);

  // ── ASSEMBLY ROOTS (groups so we can fade per-scene) ──────────────
  const rootHero       = new THREE.Group(); scene.add(rootHero);
  const rootManifesto  = new THREE.Group(); scene.add(rootManifesto);
  const rootPanels     = new THREE.Group(); scene.add(rootPanels);
  const rootStats      = new THREE.Group(); scene.add(rootStats);
  const rootPhilosophy = new THREE.Group(); scene.add(rootPhilosophy);
  const rootWho        = new THREE.Group(); scene.add(rootWho);

  // ─────────────────────────────────────────────────────────────────
  // SCENE 0 — HERO: Cinematic depth-field particle volume
  // A drifting cloud of fine points evoking lens-flare / film grain
  // depth. Slow, ambient, never demanding attention.
  // ─────────────────────────────────────────────────────────────────
  function buildHero() {
    const COUNT = reduceMotion ? 400 : 1400;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sz  = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r  = 8 + Math.pow(Math.random(), 0.7) * 28;
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.5) * Math.PI * 0.85;

      pos[i*3+0] = Math.cos(th) * Math.cos(ph) * r;
      pos[i*3+1] = Math.sin(ph) * r * 0.6;
      pos[i*3+2] = Math.sin(th) * Math.cos(ph) * r - 6;

      // Mostly cream, occasional teal/gold
      const roll = Math.random();
      const c = roll < 0.82 ? COLORS.fg
              : roll < 0.93 ? COLORS.teal
              : COLORS.gold;
      col[i*3+0] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;

      sz[i] = Math.random() * 1.4 + 0.3;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geom.setAttribute('aSize',    new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        varying float vDepth;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 p = position;
          // very slow breathing drift
          p.x += sin(uTime * 0.15 + position.y * 0.1) * 0.4;
          p.y += cos(uTime * 0.12 + position.x * 0.1) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * (260.0 / vDepth);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDepth;
        uniform float uOpacity;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          // depth fade — far points dimmer for atmosphere
          float depthFade = smoothstep(48.0, 8.0, vDepth);
          gl_FragColor = vec4(vColor, a * 0.55 * depthFade * uOpacity);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geom, mat);
    rootHero.add(pts);
    return { mesh: pts, mat };
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE 1 — MANIFESTO: Wireframe story-crystal (icosahedron)
  // Slow rotation, scroll-driven detail. Echoes the SVG circle motif.
  // ─────────────────────────────────────────────────────────────────
  function buildManifesto() {
    const g = new THREE.IcosahedronGeometry(4.2, 1);
    const wire = new THREE.WireframeGeometry(g);
    const mat = new THREE.LineBasicMaterial({
      color: COLORS.teal,
      transparent: true,
      opacity: 0.55,
    });
    const lines = new THREE.LineSegments(wire, mat);

    // Inner counter-rotating wireframe in gold
    const g2 = new THREE.IcosahedronGeometry(2.4, 0);
    const wire2 = new THREE.WireframeGeometry(g2);
    const mat2 = new THREE.LineBasicMaterial({
      color: COLORS.gold,
      transparent: true,
      opacity: 0.3,
    });
    const lines2 = new THREE.LineSegments(wire2, mat2);

    // Outer atmospheric ring of dust
    const dustG = new THREE.BufferGeometry();
    const N = reduceMotion ? 200 : 600;
    const dPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 5.5 + Math.random() * 3;
      dPos[i*3+0] = Math.cos(a) * r;
      dPos[i*3+1] = (Math.random() - 0.5) * 1.5;
      dPos[i*3+2] = Math.sin(a) * r;
    }
    dustG.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: COLORS.fg,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustG, dustMat);

    rootManifesto.add(lines, lines2, dust);
    rootManifesto.position.set(0, 0, 0);
    rootManifesto.visible = false;
    return { lines, lines2, dust, mats: [mat, mat2, dustMat] };
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE 2 — PANELS: Morphing geometry (sphere ⇄ cube ⇄ pyramid)
  // Wireframe morphs as scroll progresses through the panels section.
  // ─────────────────────────────────────────────────────────────────
  function buildPanels() {
    // Build three wireframe forms; cross-fade between them
    const sphereG = new THREE.IcosahedronGeometry(3.4, 2);
    const cubeG   = new THREE.BoxGeometry(5, 5, 5, 4, 4, 4);
    const pyrG    = new THREE.ConeGeometry(3.6, 5.6, 4, 1);

    const mkWire = (g, color) => {
      const w = new THREE.WireframeGeometry(g);
      const m = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      return new THREE.LineSegments(w, m);
    };

    const s1 = mkWire(sphereG, COLORS.teal);
    const s2 = mkWire(cubeG,   COLORS.gold);
    const s3 = mkWire(pyrG,    COLORS.orange);

    // Halo particles that orbit whichever shape is active
    const haloG = new THREE.BufferGeometry();
    const N = reduceMotion ? 300 : 800;
    const hPos = new Float32Array(N * 3);
    const hCol = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4.5 + Math.random() * 2.5;
      const y = (Math.random() - 0.5) * 5;
      hPos[i*3+0] = Math.cos(a) * r;
      hPos[i*3+1] = y;
      hPos[i*3+2] = Math.sin(a) * r;
      const c = i % 3 === 0 ? COLORS.teal : i % 3 === 1 ? COLORS.gold : COLORS.orange;
      hCol[i*3+0] = c.r; hCol[i*3+1] = c.g; hCol[i*3+2] = c.b;
    }
    haloG.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    haloG.setAttribute('color',    new THREE.BufferAttribute(hCol, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Points(haloG, haloMat);

    rootPanels.add(s1, s2, s3, halo);
    rootPanels.visible = false;
    return { shapes: [s1, s2, s3], halo, haloMat };
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE 4 — STATS: low horizontal ribbon, subtle data-grid feeling
  // ─────────────────────────────────────────────────────────────────
  function buildStats() {
    // A grid of points stretching horizontally
    const N = reduceMotion ? 200 : 500;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3+0] = (Math.random() - 0.5) * 40;
      pos[i*3+1] = (Math.random() - 0.5) * 3;
      pos[i*3+2] = (Math.random() - 0.5) * 8;
      const c = Math.random() < 0.5 ? COLORS.teal : COLORS.fg;
      col[i*3+0] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pts = new THREE.Points(g, m);
    rootStats.add(pts);
    rootStats.visible = false;
    return { pts, mat: m };
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE 5 — PHILOSOPHY: Cinematic horizon line (letterbox energy)
  // Particles converge toward a horizontal line at the camera's eye level.
  // ─────────────────────────────────────────────────────────────────
  function buildPhilosophy() {
    const N = reduceMotion ? 400 : 1100;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const ori = new Float32Array(N * 3); // origin (scattered)
    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 12;
      ori[i*3+0] = x; ori[i*3+1] = y; ori[i*3+2] = z;
      pos[i*3+0] = x; pos[i*3+1] = y; pos[i*3+2] = z;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aOrigin',  new THREE.BufferAttribute(ori, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:      { value: 0 },
        uConverge:  { value: 0 },     // 0 = scattered, 1 = on the line
        uOpacity:   { value: 0 },
        uColor:     { value: COLORS.fg },
      },
      vertexShader: `
        attribute vec3 aOrigin;
        uniform float uTime;
        uniform float uConverge;
        varying float vGlow;
        void main() {
          // target is x preserved, y=0, z=0 (the horizon line)
          vec3 target = vec3(aOrigin.x, 0.0, 0.0);
          vec3 p = mix(aOrigin, target, uConverge);
          // gentle drift along the line
          p.x += sin(uTime * 0.4 + aOrigin.y * 2.0) * 0.15 * uConverge;
          vGlow = uConverge;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.5 + 2.0 * uConverge) * (160.0 / -mv.z);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uColor;
        varying float vGlow;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a * uOpacity * (0.4 + vGlow * 0.6));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pts = new THREE.Points(g, mat);
    rootPhilosophy.add(pts);
    rootPhilosophy.visible = false;
    return { pts, mat };
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE 6 — WHO/CTA: Tri-color wave plane (teal/gold/orange ribbons)
  // A flowing wave-grid below the camera. Three color zones for the
  // three audience cards.
  // ─────────────────────────────────────────────────────────────────
  function buildWho() {
    const SEG = reduceMotion ? 60 : 120;
    const g = new THREE.PlaneGeometry(80, 30, SEG, Math.floor(SEG/3));
    g.rotateX(-Math.PI / 2.3);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0 },
        uTeal:    { value: COLORS.teal },
        uGold:    { value: COLORS.gold },
        uOrange:  { value: COLORS.orange },
      },
      vertexShader: `
        uniform float uTime;
        varying float vY;
        varying vec3 vWorld;
        void main() {
          vec3 p = position;
          float w = sin(p.x * 0.18 + uTime * 0.6) * 0.7
                  + cos(p.z * 0.24 + uTime * 0.45) * 0.55
                  + sin((p.x + p.z) * 0.12 + uTime * 0.3) * 0.4;
          p.y += w;
          vY = w;
          vWorld = p;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uTeal;
        uniform vec3 uGold;
        uniform vec3 uOrange;
        varying float vY;
        varying vec3 vWorld;
        void main() {
          // map x-coord to color zones
          float zone = (vWorld.x + 40.0) / 80.0;  // 0..1
          vec3 c;
          if (zone < 0.33)      c = mix(uTeal, uGold, smoothstep(0.0, 0.33, zone));
          else if (zone < 0.66) c = mix(uGold, uOrange, smoothstep(0.33, 0.66, zone));
          else                  c = uOrange;
          float intensity = 0.45 + vY * 0.4;
          // distance fade
          float fade = 1.0 - smoothstep(15.0, 35.0, length(vWorld.xz));
          gl_FragColor = vec4(c * intensity, uOpacity * fade * 0.5);
        }
      `,
      transparent: true,
      depthWrite: false,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(g, mat);
    mesh.position.set(0, -7, -8);
    rootWho.add(mesh);
    rootWho.visible = false;
    return { mesh, mat };
  }

  // ── BUILD ALL ─────────────────────────────────────────────────────
  const heroScene       = buildHero();
  const manifestoScene  = buildManifesto();
  const panelsScene     = buildPanels();
  const statsScene      = buildStats();
  const philosophyScene = buildPhilosophy();
  const whoScene        = buildWho();

  // ── SECTION RESOLUTION ────────────────────────────────────────────
  // We map document scroll → which "scene zone" we're in, plus a 0..1
  // progress within the zone, used to drive morph/rotation/opacity.
  const sectionMap = [
    { key: 'hero',       sel: '.hero' },
    { key: 'manifesto',  sel: '.manifesto' },
    { key: 'panels',     sel: '.panels' },
    { key: 'ai',         sel: '.ai-split' },
    { key: 'stats',      sel: '.stats-bar' },
    { key: 'philosophy', sel: '.philosophy' },
    { key: 'who',        sel: '.who-sec' },
  ];

  function resolveSections() {
    return sectionMap.map(s => {
      const el = document.querySelector(s.sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return { key: s.key, top, height: r.height, bottom: top + r.height };
    }).filter(Boolean);
  }
  let sections = resolveSections();

  function getSceneState() {
    const y = window.scrollY + window.innerHeight * 0.5;
    let active = sections[0]?.key || 'hero';
    let progress = 0;
    for (const s of sections) {
      if (y >= s.top && y < s.bottom) {
        active = s.key;
        progress = (y - s.top) / s.height;
        break;
      }
      if (y >= s.bottom) active = s.key;
    }
    return { active, progress };
  }

  // ── PARALLAX TARGETS ──────────────────────────────────────────────
  // Apply gentle 3D-feeling translateZ-like parallax to hero text.
  const heroEye   = document.querySelector('.hero-eye');
  const heroH1    = document.querySelector('.hero-h1');
  const heroSub   = document.querySelector('.hero-sub');
  const heroAct   = document.querySelector('.hero-actions');

  function applyHeroParallax(scrollY) {
    if (!heroH1) return;
    const t = Math.min(scrollY / window.innerHeight, 1);
    if (heroEye)  heroEye.style.transform  = `translateY(${t * -28}px)`;
    if (heroH1)   heroH1.style.transform   = `translateY(${t * -64}px) scale(${1 - t * 0.04})`;
    if (heroSub)  heroSub.style.transform  = `translateY(${t * -40}px)`;
    if (heroAct)  heroAct.style.transform  = `translateY(${t * -20}px)`;
  }

  // ── ANIMATION LOOP ────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let raf = null;
  let visible = true;

  // Smoothed scroll-driven values
  const sm = {
    activeIdx: 0,         // smoothed index of active scene
    panelMorph: 0,        // 0..2 for sphere/cube/pyramid
    convergence: 0,       // for philosophy
    cameraShake: 0,
  };

  function targetForScene(active, progress) {
    // Returns desired numeric values per smoothed channel
    switch (active) {
      case 'hero':       return { i: 0, panel: 0, conv: 0 };
      case 'manifesto':  return { i: 1, panel: 0, conv: 0 };
      case 'panels':     return { i: 2, panel: progress * 2.0, conv: 0 };
      case 'ai':         return { i: 3, panel: 2, conv: 0 };
      case 'stats':      return { i: 4, panel: 2, conv: 0 };
      case 'philosophy': return { i: 5, panel: 2, conv: progress };
      case 'who':        return { i: 6, panel: 2, conv: 1 };
      default:           return { i: 0, panel: 0, conv: 0 };
    }
  }

  function fadeGroup(group, mats, target, dt) {
    // Interpolate every material's opacity toward target
    for (const m of mats) {
      if (m.uniforms && m.uniforms.uOpacity) {
        m.uniforms.uOpacity.value += (target - m.uniforms.uOpacity.value) * Math.min(dt * 3.5, 1);
      } else if ('opacity' in m) {
        m.opacity += (target - m.opacity) * Math.min(dt * 3.5, 1);
      }
    }
    // Toggle visibility once fully faded out (perf)
    const probe = mats[0];
    const cur = probe.uniforms?.uOpacity?.value ?? probe.opacity;
    group.visible = cur > 0.005;
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.06);
    const t  = clock.elapsedTime;

    const { active, progress } = getSceneState();
    const tgt = targetForScene(active, progress);

    // smooth channels
    sm.activeIdx   += (tgt.i    - sm.activeIdx)    * Math.min(dt * 4, 1);
    sm.panelMorph  += (tgt.panel - sm.panelMorph)  * Math.min(dt * 3, 1);
    sm.convergence += (tgt.conv  - sm.convergence) * Math.min(dt * 2.5, 1);

    // ── HERO ── always present, fades out after manifesto
    {
      const targetOp = active === 'hero' ? 1
                      : active === 'manifesto' ? 0.4
                      : 0;
      heroScene.mat.uniforms.uOpacity.value +=
        (targetOp - heroScene.mat.uniforms.uOpacity.value) * Math.min(dt * 2.5, 1);
      heroScene.mat.uniforms.uTime.value = t;
      rootHero.rotation.y = t * 0.015;
      // gentle parallax driven by scroll within hero
      const heroP = active === 'hero' ? progress : 1;
      rootHero.position.z = heroP * 4;
    }

    // ── MANIFESTO ── visible during manifesto, fades pre/post
    {
      const targetOp = active === 'manifesto' ? 1
                      : active === 'panels' && progress < 0.15 ? 0.3
                      : active === 'hero' && progress > 0.85 ? 0.3
                      : 0;
      // compose individual material targets
      manifestoScene.mats[0].opacity += (0.55 * targetOp - manifestoScene.mats[0].opacity) * Math.min(dt * 3, 1);
      manifestoScene.mats[1].opacity += (0.30 * targetOp - manifestoScene.mats[1].opacity) * Math.min(dt * 3, 1);
      manifestoScene.mats[2].opacity += (0.45 * targetOp - manifestoScene.mats[2].opacity) * Math.min(dt * 3, 1);
      rootManifesto.visible = manifestoScene.mats[0].opacity > 0.005;

      manifestoScene.lines.rotation.y  += dt * 0.18;
      manifestoScene.lines.rotation.x  += dt * 0.07;
      manifestoScene.lines2.rotation.y -= dt * 0.32;
      manifestoScene.lines2.rotation.z += dt * 0.12;
      manifestoScene.dust.rotation.y   += dt * 0.05;

      // scroll-tied scale: crystal blooms slightly through the section
      const localP = active === 'manifesto' ? progress : (active === 'panels' ? 1 : 0);
      const s = 0.85 + localP * 0.3;
      rootManifesto.scale.setScalar(s);
    }

    // ── PANELS ── morph through the three shapes
    {
      const targetOp = active === 'panels' ? 1
                      : active === 'manifesto' && progress > 0.85 ? 0.4
                      : active === 'ai' && progress < 0.15 ? 0.3
                      : 0;
      // Per-shape opacity from the morph value (0..2)
      const m = sm.panelMorph;
      const w0 = Math.max(0, 1 - Math.abs(m - 0));
      const w1 = Math.max(0, 1 - Math.abs(m - 1));
      const w2 = Math.max(0, 1 - Math.abs(m - 2));
      panelsScene.shapes[0].material.opacity += (w0 * 0.7 * targetOp - panelsScene.shapes[0].material.opacity) * Math.min(dt * 4, 1);
      panelsScene.shapes[1].material.opacity += (w1 * 0.7 * targetOp - panelsScene.shapes[1].material.opacity) * Math.min(dt * 4, 1);
      panelsScene.shapes[2].material.opacity += (w2 * 0.7 * targetOp - panelsScene.shapes[2].material.opacity) * Math.min(dt * 4, 1);
      panelsScene.haloMat.opacity            += (0.55 * targetOp - panelsScene.haloMat.opacity) * Math.min(dt * 4, 1);
      rootPanels.visible = (panelsScene.shapes[0].material.opacity + panelsScene.shapes[1].material.opacity + panelsScene.shapes[2].material.opacity) > 0.005;

      panelsScene.shapes[0].rotation.y += dt * 0.35;
      panelsScene.shapes[0].rotation.x += dt * 0.15;
      panelsScene.shapes[1].rotation.y += dt * 0.22;
      panelsScene.shapes[1].rotation.x -= dt * 0.18;
      panelsScene.shapes[2].rotation.y += dt * 0.30;
      panelsScene.shapes[2].rotation.z += dt * 0.10;
      panelsScene.halo.rotation.y      += dt * 0.12;
    }

    // ── STATS ── subtle data-grid drift
    {
      const targetOp = active === 'stats' ? 0.7
                      : active === 'philosophy' && progress < 0.2 ? 0.3
                      : active === 'ai' && progress > 0.85 ? 0.25
                      : 0;
      statsScene.mat.opacity += (targetOp - statsScene.mat.opacity) * Math.min(dt * 3, 1);
      rootStats.visible = statsScene.mat.opacity > 0.005;
      statsScene.pts.rotation.y = Math.sin(t * 0.1) * 0.05;
      statsScene.pts.position.x = Math.sin(t * 0.2) * 0.5;
    }

    // ── PHILOSOPHY ── particles converge to horizon
    {
      const targetOp = active === 'philosophy' ? 1
                      : active === 'stats' && progress > 0.7 ? 0.4
                      : active === 'who' && progress < 0.15 ? 0.5
                      : 0;
      philosophyScene.mat.uniforms.uOpacity.value +=
        (targetOp - philosophyScene.mat.uniforms.uOpacity.value) * Math.min(dt * 3, 1);
      philosophyScene.mat.uniforms.uConverge.value = sm.convergence;
      philosophyScene.mat.uniforms.uTime.value = t;
      rootPhilosophy.visible = philosophyScene.mat.uniforms.uOpacity.value > 0.005;
    }

    // ── WHO/CTA ── tri-color wave field
    {
      const targetOp = active === 'who' ? 1
                      : active === 'philosophy' && progress > 0.7 ? 0.5
                      : 0;
      whoScene.mat.uniforms.uOpacity.value +=
        (targetOp - whoScene.mat.uniforms.uOpacity.value) * Math.min(dt * 2.5, 1);
      whoScene.mat.uniforms.uTime.value = t;
      rootWho.visible = whoScene.mat.uniforms.uOpacity.value > 0.005;
    }

    // ── CAMERA: gentle scroll-tied dolly + drift
    {
      const totalScroll = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      camera.position.z = 18 - totalScroll * 4;
      camera.position.x = Math.sin(t * 0.08) * 0.6;
      camera.position.y = Math.cos(t * 0.07) * 0.4 + (active === 'who' ? 1.5 : 0);
      camera.lookAt(0, 0, 0);
    }

    // ── HERO PARALLAX
    applyHeroParallax(window.scrollY);

    renderer.render(scene, camera);
  }

  // ── RESIZE / VISIBILITY ──────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sections = resolveSections();
  }
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load',   () => { sections = resolveSections(); }, { once: true });

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) clock.getDelta(); // reset
  });

  // ── START ────────────────────────────────────────────────────────
  // Fade host in only after first frame so we don't pop.
  requestAnimationFrame(() => {
    host.style.opacity = '1';
  });
  tick();

  // expose for debug
  window.__scene3d = { scene, camera, renderer, sections, sm };
})();
