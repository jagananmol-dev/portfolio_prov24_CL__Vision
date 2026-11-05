// A 3D Transformer for the "Surprise me" tour, built with Three.js (loaded on
// demand). It starts as a car, transforms joint by joint into a robot, walks,
// talks, and transforms back. Black armour with white seam lines (like the
// cracks in the name) and orange glowing hexagon cores.
(function () {
  const SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  let loading = null;

  function load() {
    if (window.THREE) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC; s.async = true; s.crossOrigin = "anonymous";
      s.onload = () => (window.THREE ? resolve() : reject(new Error("three missing")));
      s.onerror = () => { loading = null; reject(new Error("three failed to load")); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    backOut: (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  function create(container) {
    const T = window.THREE;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- renderer, camera, lights ----------
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.domElement.className = "robot3d-canvas";
    container.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
    const LOOK_Y = 2.35;
    let camDist = 16;

    scene.add(new T.HemisphereLight(0xffffff, 0x3a3f48, 0.95));
    const key = new T.DirectionalLight(0xffffff, 0.95);
    key.position.set(5, 10, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -12, right: 12, top: 10, bottom: -3, near: 1, far: 40 });
    scene.add(key);
    scene.add(key.target);
    const rim = new T.DirectionalLight(0xf2a93b, 0.55);
    rim.position.set(-7, 5, -6);
    scene.add(rim);
    const ground = new T.Mesh(new T.PlaneGeometry(80, 30), new T.ShadowMaterial({ opacity: 0.17 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ---------- materials ----------
    const M = {
      body: new T.MeshStandardMaterial({ color: 0x111318, metalness: 0.55, roughness: 0.34 }),
      trim: new T.MeshStandardMaterial({ color: 0x272c35, metalness: 0.6, roughness: 0.4 }),
      glow: new T.MeshStandardMaterial({ color: 0xf2a93b, emissive: 0xf2a93b, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.4 }),
      visor: new T.MeshStandardMaterial({ color: 0xf2a93b, emissive: 0xf2a93b, emissiveIntensity: 1.0, metalness: 0.2, roughness: 0.3 }),
      glass: new T.MeshStandardMaterial({ color: 0x1b2633, metalness: 0.9, roughness: 0.12, emissive: 0xf2a93b, emissiveIntensity: 0.06 }),
      tyre: new T.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.1, roughness: 0.85 }),
      rim: new T.MeshStandardMaterial({ color: 0xd9dee6, metalness: 0.9, roughness: 0.25 }),
      line: new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
      spark: new T.MeshBasicMaterial({ color: 0xf2a93b })
    };

    const parts = [];   // every visible piece, for the build-up and break-down effects
    const G = () => new T.Group();
    function add(mesh, parent, edges) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (edges) mesh.add(new T.LineSegments(new T.EdgesGeometry(mesh.geometry, 20), M.line));
      parent.add(mesh);
      parts.push(mesh);
      return mesh;
    }
    function box(w, h, d, mat, x, y, z, parent) {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      return add(m, parent, mat === M.body || mat === M.trim);
    }
    // hexagon prism, the same shape as the pieces of the name
    function hex(r, h, mat, x, y, z, parent, faceForward = true) {
      const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 6), mat);
      if (faceForward) m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z);
      return add(m, parent, mat === M.body || mat === M.trim);
    }
    function wheel(parent, x, y, z) {
      const g = G();
      g.position.set(x, y, z);
      parent.add(g);
      const tyre = new T.Mesh(new T.CylinderGeometry(0.31, 0.31, 0.24, 28), M.tyre);
      tyre.rotation.z = Math.PI / 2;
      add(tyre, g, false);
      const hub = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.26, 6), M.rim);
      hub.rotation.z = Math.PI / 2;
      add(hub, g, false);
      return g;
    }

    // ---------- the robot ----------
    const root = G();
    scene.add(root);
    const pelvis = G();
    root.add(pelvis);
    box(1.15, 0.38, 0.72, M.trim, 0, 0, 0, pelvis);
    hex(0.15, 0.74, M.glow, 0, 0, 0, pelvis);

    const torso = G();
    torso.position.set(0, 0.2, 0);
    pelvis.add(torso);
    box(0.95, 0.42, 0.62, M.body, 0, 0.21, 0, torso);
    box(1.7, 1.05, 0.95, M.body, 0, 0.92, 0, torso);
    box(0.62, 0.42, 0.06, M.glass, -0.43, 1.06, 0.49, torso);
    box(0.62, 0.42, 0.06, M.glass, 0.43, 1.06, 0.49, torso);
    hex(0.12, 0.08, M.glow, -0.62, 0.55, 0.49, torso);
    hex(0.12, 0.08, M.glow, 0.62, 0.55, 0.49, torso);
    box(1.12, 0.18, 0.52, M.trim, 0, 1.5, -0.1, torso);

    // chest screen, showing the chapter number
    const scrCanvas = document.createElement("canvas");
    scrCanvas.width = 128; scrCanvas.height = 64;
    const sctx = scrCanvas.getContext("2d");
    const scrTex = new T.CanvasTexture(scrCanvas);
    scrTex.encoding = T.sRGBEncoding;
    const screen = new T.Mesh(new T.PlaneGeometry(0.46, 0.23), new T.MeshBasicMaterial({ map: scrTex }));
    screen.position.set(0, 0.64, 0.481);
    torso.add(screen);
    parts.push(screen);
    function drawScreen(txt) {
      sctx.fillStyle = "#fff"; sctx.fillRect(0, 0, 128, 64);
      sctx.fillStyle = "#000"; sctx.font = "500 34px 'IBM Plex Mono', monospace";
      sctx.textAlign = "center"; sctx.textBaseline = "middle";
      sctx.fillText(txt, 64, 35);
      scrTex.needsUpdate = true;
    }
    drawScreen("");

    const neck = G();
    neck.position.set(0, 1.47, 0);
    torso.add(neck);
    const head = G();
    neck.add(head);
    box(0.62, 0.56, 0.6, M.body, 0, 0.32, 0, head);
    box(0.78, 0.16, 0.5, M.trim, 0, 0.63, -0.03, head);
    box(0.5, 0.13, 0.05, M.visor, 0, 0.37, 0.31, head);
    box(0.08, 0.32, 0.4, M.trim, -0.36, 0.3, 0, head);
    box(0.08, 0.32, 0.4, M.trim, 0.36, 0.3, 0, head);
    box(0.34, 0.06, 0.04, M.trim, 0, 0.17, 0.31, head);
    const antenna = G();
    antenna.position.set(0, 0.7, -0.1);
    head.add(antenna);
    box(0.05, 0.42, 0.05, M.trim, -0.22, 0.21, 0, antenna);
    box(0.05, 0.42, 0.05, M.trim, 0.22, 0.21, 0, antenna);
    hex(0.065, 0.07, M.glow, -0.22, 0.44, 0, antenna, false);
    hex(0.065, 0.07, M.glow, 0.22, 0.44, 0, antenna, false);

    function arm(s) {
      const shoulder = G();
      shoulder.position.set(s * 1.05, 1.22, 0);
      torso.add(shoulder);
      box(0.55, 0.5, 0.72, M.trim, s * 0.05, 0, 0, shoulder);
      hex(0.13, 0.06, M.glow, s * 0.05, 0.08, 0.37, shoulder);
      wheel(shoulder, s * 0.38, 0, 0);
      const upper = G();
      upper.position.set(s * 0.05, -0.2, 0);
      shoulder.add(upper);
      box(0.32, 0.72, 0.34, M.body, 0, -0.38, 0, upper);
      const fore = G();
      fore.position.set(0, -0.76, 0);
      upper.add(fore);
      box(0.4, 0.66, 0.42, M.body, 0, -0.33, 0, fore);
      hex(0.08, 0.44, M.glow, 0, -0.16, 0, fore);
      const hand = G();
      hand.position.set(0, -0.69, 0);
      fore.add(hand);
      box(0.3, 0.26, 0.3, M.trim, 0, -0.12, 0, hand);
      return { shoulder, upper, fore, hand };
    }
    function leg(s) {
      const hip = G();
      hip.position.set(s * 0.34, -0.12, 0);
      pelvis.add(hip);
      const thigh = G();
      hip.add(thigh);
      box(0.42, 0.86, 0.48, M.body, 0, -0.43, 0, thigh);
      const shin = G();
      shin.position.set(0, -0.88, 0);
      thigh.add(shin);
      box(0.52, 0.88, 0.58, M.body, 0, -0.44, 0, shin);
      hex(0.11, 0.06, M.glow, 0, -0.26, 0.3, shin);
      wheel(shin, s * 0.38, -0.36, 0);
      const foot = G();
      foot.position.set(0, -0.9, 0);
      shin.add(foot);
      box(0.56, 0.16, 0.84, M.trim, 0, -0.08, 0.12, foot);
      return { hip, thigh, shin, foot };
    }
    const armL = arm(-1), armR = arm(1), legL = leg(-1), legR = leg(1);
    pelvis.position.set(0, 2.06, 0);

    // ---------- the two modes: robot and car ----------
    // Each joint stores both poses. Transforming blends between them, each joint
    // in its own time window, so it unfolds in stages like a real Transformer.
    const HALF = Math.PI / 2;
    const JOINTS = [];
    function joint(node, car, win) {
      JOINTS.push({
        node, win,
        robot: { p: node.position.clone(), r: node.rotation.clone(), s: node.scale.x },
        car: {
          p: car.p ? new T.Vector3(...car.p) : node.position.clone(),
          r: car.r ? new T.Euler(...car.r) : node.rotation.clone(),
          s: car.s != null ? car.s : node.scale.x
        }
      });
    }
    joint(pelvis, { p: [0, 0.62, -0.15], r: [-HALF, 0, 0] }, [0, 0.45]);
    joint(legL.hip, { p: [-0.62, -0.12, -0.32] }, [0.1, 0.5]);
    joint(legR.hip, { p: [0.62, -0.12, -0.32] }, [0.1, 0.5]);
    joint(legL.thigh, { r: [0.0, 0, 0] }, [0.15, 0.55]);
    joint(legR.thigh, { r: [0.0, 0, 0] }, [0.15, 0.55]);
    joint(legL.shin, { r: [0, 0, 0] }, [0.2, 0.6]);
    joint(legR.shin, { r: [0, 0, 0] }, [0.2, 0.6]);
    joint(legL.foot, { r: [0, 0, 0] }, [0.3, 0.65]);
    joint(legR.foot, { r: [0, 0, 0] }, [0.3, 0.65]);
    joint(torso, { p: [0, 0.2, 0] }, [0.25, 0.6]);
    joint(armL.shoulder, { p: [-0.95, 1.15, -0.32] }, [0.35, 0.75]);
    joint(armR.shoulder, { p: [0.95, 1.15, -0.32] }, [0.35, 0.75]);
    joint(armL.upper, { r: [0, 0, 0] }, [0.45, 0.8]);
    joint(armR.upper, { r: [0, 0, 0] }, [0.45, 0.8]);
    joint(armL.fore, { r: [0, 0, 0] }, [0.5, 0.85]);
    joint(armR.fore, { r: [0, 0, 0] }, [0.5, 0.85]);
    joint(armL.hand, { s: 0.01 }, [0.6, 0.9]);
    joint(armR.hand, { s: 0.01 }, [0.6, 0.9]);
    joint(neck, { p: [0, 0.95, 0], s: 0.01 }, [0.62, 0.92]);
    joint(antenna, { s: 0.01 }, [0.8, 1]);

    let mode = 1;           // 1 = robot, 0 = car
    function applyMode(u) {
      for (const j of JOINTS) {
        const t = clamp01((u - j.win[0]) / (j.win[1] - j.win[0]));
        const e = ease.backOut(t);
        const n = j.node;
        n.position.set(lerp(j.car.p.x, j.robot.p.x, e), lerp(j.car.p.y, j.robot.p.y, e), lerp(j.car.p.z, j.robot.p.z, e));
        n.rotation.set(lerp(j.car.r.x, j.robot.r.x, e), lerp(j.car.r.y, j.robot.r.y, e), lerp(j.car.r.z, j.robot.r.z, e));
        const s = Math.max(0.001, lerp(j.car.s, j.robot.s, ease.inOut(t)));
        n.scale.set(s, s, s);
      }
      mode = u;
    }

    // ---------- sparks at the joints while transforming ----------
    const sparks = [];
    const sparkGeo = new T.BoxGeometry(0.05, 0.05, 0.05);
    function burst(node, n = 10) {
      const p = new T.Vector3();
      node.getWorldPosition(p);
      for (let i = 0; i < n; i++) {
        const m = new T.Mesh(sparkGeo, M.spark);
        m.position.copy(p);
        const v = new T.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1, (Math.random() - 0.5) * 4);
        scene.add(m);
        sparks.push({ m, v, life: 0.5 + Math.random() * 0.3 });
      }
    }

    // ---------- state ----------
    const state = {
      x: 0, targetX: 0, walking: false, phase: 0,
      facing: 0, faceTarget: 0, idleTurn: 0,
      talking: false, time: 0, shake: 0, onArrive: null
    };
    let running = false, last = 0, raf = 0;
    let anim = null; // { from, to, start, ms, resolve, fired }

    // ---------- screen <-> world ----------
    function resize() {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = w + "px";
      renderer.domElement.style.height = h + "px";
      camera.aspect = w / h;
      // keep the robot (about 5 units tall) at roughly 60% of the view height
      const fovY = camera.fov * Math.PI / 180;
      camDist = (5.2 / (h < 420 ? 0.76 : 0.6)) / 2 / Math.tan(fovY / 2);
      camera.position.set(0, LOOK_Y + 1.1, camDist);
      camera.lookAt(0, LOOK_Y, 0);
      camera.updateProjectionMatrix();
    }
    // world x on the floor line for a pixel x inside the container
    function worldX(px) {
      const w = container.clientWidth || 1;
      const halfW = Math.tan(camera.fov * Math.PI / 360) * camDist * camera.aspect;
      return (px / w * 2 - 1) * halfW;
    }
    function screenRect() {
      scene.updateMatrixWorld(true);
      const box3 = new T.Box3().setFromObject(root);
      const r = container.getBoundingClientRect();
      const pts = [];
      for (const x of [box3.min.x, box3.max.x]) for (const y of [box3.min.y, box3.max.y]) for (const z of [box3.min.z, box3.max.z]) {
        const v = new T.Vector3(x, y, z).project(camera);
        pts.push({ x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height });
      }
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
    }

    // ---------- the loop ----------
    function tick(now) {
      raf = running ? requestAnimationFrame(tick) : 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      state.time += dt;

      // transform animation
      if (anim) {
        const t = clamp01((now - anim.start) / anim.ms);
        const u = lerp(anim.from, anim.to, t);
        // a burst of sparks as each joint starts to move
        for (const j of JOINTS) {
          const edge = anim.to > anim.from ? j.win[0] : j.win[1];
          if (!anim.fired.has(j) && ((anim.to > anim.from && u >= edge) || (anim.to < anim.from && u <= edge))) {
            anim.fired.add(j);
            if (j.node !== legL.thigh && j.node !== legR.thigh && j.node !== armL.fore && j.node !== armR.fore) burst(j.node, 8);
            state.shake = 0.12;
          }
        }
        applyMode(u);
        if (t >= 1) { const r = anim.resolve; anim = null; r(); }
      }

      // walking
      if (state.walking) {
        const dir = Math.sign(state.targetX - state.x);
        const turned = Math.abs(state.facing - state.faceTarget) < 0.08;
        if (turned) {
          const speed = 2.6;
          const step = Math.min(Math.abs(state.targetX - state.x), speed * dt);
          state.x += dir * step;
          state.phase += dt * 7.5;
          if (Math.abs(state.targetX - state.x) < 0.01) {
            state.x = state.targetX;
            state.walking = false;
            state.faceTarget = state.idleTurn;
            const cb = state.onArrive; state.onArrive = null;
            if (cb) setTimeout(cb, 260);
          }
        }
      }
      // turn smoothly toward where it should face
      state.facing += (state.faceTarget - state.facing) * Math.min(1, dt * 9);
      root.rotation.y = state.facing;
      root.position.x = state.x;

      // pose layers on top of the robot pose: walking, idle, talking
      if (mode >= 0.999 && !anim) {
        const p = state.phase;
        const walkAmt = state.walking ? 1 : 0;
        legL.thigh.rotation.x = -Math.sin(p) * 0.55 * walkAmt;
        legR.thigh.rotation.x = Math.sin(p) * 0.55 * walkAmt;
        legL.shin.rotation.x = Math.max(0, Math.sin(p - 0.9)) * 0.85 * walkAmt;
        legR.shin.rotation.x = Math.max(0, -Math.sin(p - 0.9)) * 0.85 * walkAmt;
        legL.foot.rotation.x = -legL.thigh.rotation.x * 0.3;
        legR.foot.rotation.x = -legR.thigh.rotation.x * 0.3;
        armL.upper.rotation.x = Math.sin(p) * 0.45 * walkAmt;
        armR.upper.rotation.x = -Math.sin(p) * 0.45 * walkAmt;
        armL.fore.rotation.x = -0.25 * walkAmt;
        armR.fore.rotation.x = -0.25 * walkAmt;
        const breathe = Math.sin(state.time * 2.2);
        pelvis.position.y = 2.06 + (walkAmt ? Math.abs(Math.cos(p)) * 0.09 - 0.05 : breathe * 0.015);
        torso.rotation.z = walkAmt ? Math.sin(p) * 0.04 : 0;
        // idle: look around a little, wave now and then
        head.rotation.y = walkAmt ? 0 : Math.sin(state.time * 0.7) * 0.18;
        head.rotation.x = state.talking ? Math.sin(state.time * 9) * 0.05 : 0;
        if (!walkAmt) {
          const w = (state.time % 6) / 6;
          const wave = w > 0.7 ? Math.sin((w - 0.7) / 0.3 * Math.PI) : 0;
          armR.upper.rotation.z = wave * 2.4;
          armR.fore.rotation.z = wave * Math.sin(state.time * 12) * 0.35;
          armR.upper.rotation.x = 0; armL.upper.rotation.x = 0;
          armL.fore.rotation.x = 0; armR.fore.rotation.x = 0;
        } else {
          armR.upper.rotation.z = 0; armR.fore.rotation.z = 0;
        }
      }
      // wheels spin while in car mode and moving
      M.visor.emissiveIntensity = state.talking ? 0.8 + Math.abs(Math.sin(state.time * 16)) * 0.9 : 1.0;
      M.glow.emissiveIntensity = 0.75 + Math.sin(state.time * 2.5) * 0.2;

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        s.v.y -= 9 * dt;
        s.m.position.addScaledVector(s.v, dt);
        s.m.scale.setScalar(Math.max(0.01, s.life * 2));
        if (s.life <= 0) { scene.remove(s.m); sparks.splice(i, 1); }
      }

      // a small camera shake when parts lock in
      state.shake = Math.max(0, state.shake - dt);
      const k = reduceMotion ? 0 : state.shake;
      camera.position.x = (Math.random() - 0.5) * k * 0.6;
      camera.position.y = LOOK_Y + 1.1 + (Math.random() - 0.5) * k * 0.6;
      key.position.set(root.position.x + 5, 10, 8);
      key.target.position.set(root.position.x, 0, 0);

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true; last = 0;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function transform(to, ms = 2600) {
      return new Promise((resolve) => {
        if (reduceMotion) { applyMode(to); resolve(); return; }
        anim = { from: mode, to, start: performance.now(), ms, resolve, fired: new Set() };
      });
    }

    // build up / break down: every part pops in (or out) one after another
    function setPartsScale(s) { parts.forEach((m) => m.scale.setScalar(Math.max(0.001, s))); }
    function popParts(show, ms = 900) {
      return new Promise((resolve) => {
        if (reduceMotion) { setPartsScale(show ? 1 : 0); resolve(); return; }
        const order = parts.map((m, i) => ({ m, d: Math.random() * ms * 0.6 }));
        const start = performance.now();
        (function step(now) {
          let done = true;
          for (const o of order) {
            const t = clamp01((now - start - o.d) / (ms * 0.4));
            if (t < 1) done = false;
            const s = show ? ease.backOut(t) : 1 - ease.inOut(t);
            o.m.scale.setScalar(Math.max(0.001, s));
          }
          if (!done) requestAnimationFrame(step); else resolve();
        })(start);
      });
    }

    function placeAt(px) { state.x = state.targetX = worldX(px); root.position.x = state.x; }
    function walkTo(px, idleTurn = 0) {
      return new Promise((resolve) => {
        const x = worldX(px);
        state.idleTurn = idleTurn;
        if (Math.abs(x - state.x) < 0.02 || reduceMotion) {
          state.x = state.targetX = x; state.faceTarget = idleTurn; resolve(); return;
        }
        state.targetX = x;
        state.faceTarget = x > state.x ? HALF : -HALF;
        state.walking = true;
        state.onArrive = resolve;
      });
    }
    function face(turn) { state.idleTurn = turn; if (!state.walking) state.faceTarget = turn; }
    function setFacing(turn) { state.facing = state.faceTarget = turn; root.rotation.y = turn; }

    resize();
    applyMode(1);

    return {
      start, stop, resize, placeAt, walkTo, face, setFacing, screenRect, HALF,
      toRobot: () => transform(1),
      toCar: () => transform(0, 2000),
      setCar: () => applyMode(0),
      materialize: () => popParts(true),
      dematerialize: () => popParts(false, 700),
      hideAll: () => setPartsScale(0),
      setTalking: (on) => { state.talking = !!on; },
      setScreen: drawScreen,
      get mode() { return mode; },
      get walking() { return state.walking; }
    };
  }

  window.Robot3D = { load, supported, create };
})();
