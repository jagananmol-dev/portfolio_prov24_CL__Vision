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
    backOut: (t) => { const c1 = 1.15, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
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

    // a caption naming each stage of the transformation
    const cap = document.createElement("div");
    cap.className = "r3-caption";
    cap.innerHTML = '<span class="r3-n"></span><span class="r3-t"></span><span class="r3-bar"></span>';
    container.appendChild(cap);
    const capN = cap.querySelector(".r3-n"), capT = cap.querySelector(".r3-t"), capBar = cap.querySelector(".r3-bar");
    function caption(num, text, n, total) {
      capN.textContent = num;
      capT.textContent = text;
      capBar.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
      cap.classList.add("show");
    }

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
      spark: new T.MeshBasicMaterial({ color: 0xf2a93b }),
      lamp: new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6e0, emissiveIntensity: 1.2, roughness: 0.2 }),
      tail: new T.MeshStandardMaterial({ color: 0xd8262c, emissive: 0xd8262c, emissiveIntensity: 1.0, roughness: 0.3 })
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
    // armour plates have rounded, bevelled edges (an extruded rounded rectangle)
    function roundedBox(w, h, d) {
      const b = Math.min(w, h, d) * 0.12;           // bevel
      const r = Math.min(w, h) * 0.14;              // corner radius
      const iw = w - 2 * b, ih = h - 2 * b, rr = Math.min(r, iw / 2, ih / 2);
      const sh = new T.Shape();
      sh.moveTo(-iw / 2 + rr, -ih / 2);
      sh.lineTo(iw / 2 - rr, -ih / 2); sh.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + rr);
      sh.lineTo(iw / 2, ih / 2 - rr); sh.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - rr, ih / 2);
      sh.lineTo(-iw / 2 + rr, ih / 2); sh.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - rr);
      sh.lineTo(-iw / 2, -ih / 2 + rr); sh.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + rr, -ih / 2);
      const g = new T.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 5 });
      g.center();
      return g;
    }
    function box(w, h, d, mat, x, y, z, parent) {
      const curved = mat === M.body;
      const m = new T.Mesh(curved ? roundedBox(w, h, d) : new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      return add(m, parent, mat === M.trim);
    }
    // hexagon prism, the same shape as the pieces of the name
    function hex(r, h, mat, x, y, z, parent, faceForward = true) {
      const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 6), mat);
      if (faceForward) m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z);
      return add(m, parent, mat === M.body || mat === M.trim);
    }
    const wheels = [];
    function wheel(parent, x, y, z) {
      const g = G();
      wheels.push(g);
      g.position.set(x, y, z);
      parent.add(g);
      const tyre = new T.Mesh(new T.CylinderGeometry(0.31, 0.31, 0.24, 28), M.tyre);
      tyre.rotation.z = Math.PI / 2;
      add(tyre, g, false);
      const hub = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.26, 6), M.rim);
      hub.rotation.z = Math.PI / 2;
      add(hub, g, false);
      // spokes, so you can see the wheels turn
      const spoke = new T.Mesh(new T.BoxGeometry(0.27, 0.05, 0.3), M.trim);
      add(spoke, g, false);
      return g;
    }

    // ---------- the robot ----------
    const root = G();
    scene.add(root);
    const pelvis = G();
    root.add(pelvis);
    box(1.15, 0.38, 0.72, M.trim, 0, 0, 0, pelvis);
    hex(0.15, 0.74, M.glow, 0, 0, 0, pelvis);
    box(1.3, 0.14, 0.14, M.rim, 0, -0.08, 0.42, pelvis);          // chrome bumper

    const torso = G();
    torso.position.set(0, 0.2, 0);
    pelvis.add(torso);
    box(0.95, 0.42, 0.62, M.body, 0, 0.21, 0, torso);
    box(1.7, 1.05, 0.95, M.body, 0, 0.92, 0, torso);
    box(0.62, 0.42, 0.06, M.glass, -0.43, 1.06, 0.49, torso);
    box(0.62, 0.42, 0.06, M.glass, 0.43, 1.06, 0.49, torso);
    // headlights: chrome bezel with a white lamp
    for (const sx of [-1, 1]) {
      box(0.32, 0.19, 0.04, M.rim, sx * 0.6, 0.55, 0.49, torso);
      box(0.25, 0.12, 0.03, M.lamp, sx * 0.6, 0.55, 0.515, torso);
      hex(0.05, 0.03, M.glow, sx * 0.78, 0.8, 0.49, torso);          // amber marker light
    }
    box(1.12, 0.18, 0.52, M.trim, 0, 1.5, -0.1, torso);
    // truck details: windshield pillar and sun visor, side windows, mirrors,
    // cab steps, radiator grille, roof lights, air horns, exhaust stacks
    box(0.06, 0.44, 0.04, M.trim, 0, 1.06, 0.5, torso);
    box(1.5, 0.05, 0.14, M.trim, 0, 1.32, 0.53, torso);
    for (const sx of [-1, 1]) {
      box(0.03, 0.34, 0.42, M.glass, sx * 0.857, 1.06, 0.06, torso);
      box(0.26, 0.03, 0.03, M.trim, sx * 0.97, 1.18, 0.52, torso);
      box(0.05, 0.3, 0.14, M.trim, sx * 1.1, 1.06, 0.52, torso);
      box(0.04, 0.24, 0.1, M.glass, sx * 1.1, 1.06, 0.6, torso);
      box(0.12, 0.05, 0.32, M.trim, sx * 0.9, 0.5, 0.08, torso);
      box(0.12, 0.05, 0.32, M.trim, sx * 0.9, 0.2, 0.08, torso);
      const horn = new T.Mesh(new T.CylinderGeometry(0.035, 0.06, 0.32, 10), M.rim);
      horn.rotation.x = Math.PI / 2;
      horn.position.set(sx * 0.3, 1.64, -0.05);
      add(horn, torso, false);
    }
    box(0.82, 0.38, 0.03, M.rim, 0, 0.21, 0.315, torso);
    for (let k = -2.5; k <= 2.5; k++) box(0.045, 0.32, 0.03, M.trim, k * 0.12, 0.21, 0.335, torso);
    for (let k = -2; k <= 2; k++) box(0.1, 0.06, 0.06, M.glow, k * 0.2, 1.62, 0.15, torso);
    for (const sx of [-1, 1]) {
      const stack = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 1.35, 14), M.rim);
      stack.position.set(sx * 0.7, 1.15, -0.56);
      add(stack, torso, false);
      const cap = new T.Mesh(new T.CylinderGeometry(0.09, 0.07, 0.08, 14), M.trim);
      cap.position.set(sx * 0.7, 1.86, -0.56);
      add(cap, torso, false);
    }

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
      hand.rotation.y = s * 0.55;                    // turned a little toward you, so the fingers show
      fore.add(hand);
      // a hand with a palm, four two-jointed fingers and a thumb. The palm faces
      // the body; fingers curl toward it.
      box(0.3, 0.2, 0.3, M.trim, 0, -0.1, 0, hand);
      box(0.04, 0.12, 0.2, M.glow, s * 0.155, -0.1, 0, hand);       // knuckle light on the back of the hand
      const fingers = [];
      for (const fz of [-0.105, -0.035, 0.035, 0.105]) {
        const k1 = G(); k1.position.set(0, -0.2, fz); hand.add(k1);
        box(0.075, 0.13, 0.06, M.body, 0, -0.065, 0, k1);
        const k2 = G(); k2.position.set(0, -0.13, 0); k1.add(k2);
        box(0.068, 0.11, 0.055, M.trim, 0, -0.055, 0, k2);
        fingers.push(k1, k2);
      }
      const t1 = G(); t1.position.set(-s * 0.1, -0.12, 0.15); t1.rotation.x = -0.5; hand.add(t1);
      box(0.075, 0.12, 0.07, M.body, 0, -0.06, 0, t1);
      const t2 = G(); t2.position.set(0, -0.12, 0); t1.add(t2);
      box(0.068, 0.1, 0.065, M.trim, 0, -0.05, 0, t2);
      // 0 = open hand, 1 = closed fist
      function curl(a) {
        for (let i = 0; i < fingers.length; i++) fingers[i].rotation.z = -s * a * (i % 2 ? 1.5 : 1.25);
        t1.rotation.z = -s * a * 0.9;
        t2.rotation.z = -s * a * 0.8;
      }
      return { shoulder, upper, fore, hand, curl };
    }
    function leg(s) {
      const hip = G();
      hip.position.set(s * 0.34, -0.12, 0);
      pelvis.add(hip);
      const thigh = G();
      hip.add(thigh);
      box(0.42, 0.86, 0.48, M.body, 0, -0.43, 0, thigh);
      // chrome fuel tank with straps (sits right behind the cab in truck mode)
      const tank = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.62, 18), M.rim);
      tank.position.set(s * 0.29, -0.42, 0.02);
      add(tank, thigh, false);
      for (const ty of [-0.24, -0.6]) {
        const strap = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.035, 18), M.trim);
        strap.position.set(s * 0.29, ty, 0.02);
        add(strap, thigh, false);
      }
      const shin = G();
      shin.position.set(0, -0.88, 0);
      thigh.add(shin);
      box(0.52, 0.88, 0.58, M.body, 0, -0.44, 0, shin);
      hex(0.11, 0.06, M.glow, 0, -0.26, 0.3, shin);
      wheel(shin, s * 0.38, -0.18, 0);          // tandem rear axles
      // the second rear wheel tucks up behind the calf in robot mode, so it never touches the floor
      const wheel2 = wheel(shin, s * 0.24, -0.5, -0.36);
      const foot = G();
      foot.position.set(0, -0.9, 0);
      shin.add(foot);
      box(0.56, 0.16, 0.84, M.trim, 0, -0.08, 0.12, foot);
      // the sole faces backwards in truck mode: tail lights and a reflector
      box(0.14, 0.03, 0.1, M.tail, -0.17, -0.17, 0.36, foot);
      box(0.14, 0.03, 0.1, M.tail, 0.17, -0.17, 0.36, foot);
      box(0.3, 0.03, 0.05, M.glow, 0, -0.17, 0.1, foot);
      return { hip, thigh, shin, foot, wheel2 };
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
    // truck mode: the chest is the cab (windows become the windshield, the
    // abdomen the grille), the legs lie flat behind it as the chassis, the
    // shoulders drop to become the front wheels, the arms tuck inside the cab
    // and the head sinks into the chest.
    const PHASES = [
      { win: [0.0, 0.24], robot: "Chassis lifts, legs swing down", truck: "Legs swing back into the chassis" },
      { win: [0.22, 0.34], robot: "Hips lock, rear wheel tucks behind the calf", truck: "Hips spread, rear wheels drop to the axle" },
      { win: [0.34, 0.5], robot: "Front wheels rise into the shoulders", truck: "Shoulders drop to become the front wheels" },
      { win: [0.48, 0.7], robot: "Arms swing out from behind the cab", truck: "Arms swing up behind the cab" },
      { win: [0.68, 0.78], robot: "Wrists unfold", truck: "Wrists fold in" },
      { win: [0.76, 0.9], robot: "Head rises out of the cab", truck: "Head lowers into the cab" },
      { win: [0.88, 1.0], robot: "Antennas up, systems online", truck: "Antennas fold flat, truck mode" }
    ];
    const W = (i) => PHASES[i].win;
    joint(pelvis, { p: [0, 0.43, 0.3] }, W(0));
    joint(legL.thigh, { r: [HALF, 0, 0] }, W(0));
    joint(legR.thigh, { r: [HALF, 0, 0] }, W(0));
    joint(legL.shin, { r: [0, 0, 0] }, W(0));
    joint(legR.shin, { r: [0, 0, 0] }, W(0));
    joint(legL.foot, { r: [0, 0, 0] }, W(0));
    joint(legR.foot, { r: [0, 0, 0] }, W(0));
    joint(legL.hip, { p: [-0.5, -0.12, -0.45] }, W(1));
    joint(legR.hip, { p: [0.5, -0.12, -0.45] }, W(1));
    joint(torso, { p: [0, 0.2, 0] }, W(1));
    joint(armL.shoulder, { p: [-0.5, -0.32, 0.1] }, W(2));
    joint(armR.shoulder, { p: [0.5, -0.32, 0.1] }, W(2));
    // in truck mode the arms stand upright just behind the cab; they swing out
    // sideways and down into place. Nothing shrinks or vanishes: every part
    // moves into its spot.
    joint(legL.wheel2, { p: [-0.38, -0.8, 0] }, W(1));
    joint(legR.wheel2, { p: [0.38, -0.8, 0] }, W(1));
    joint(armL.upper, { p: [0.15, 0.2, -0.66], r: [0, 0, -Math.PI] }, W(3));
    joint(armR.upper, { p: [-0.15, 0.2, -0.66], r: [0, 0, Math.PI] }, W(3));
    joint(armL.fore, { r: [0, 0, 0] }, W(3));
    joint(armR.fore, { r: [0, 0, 0] }, W(3));
    joint(armL.hand, { r: [1.4, 0, 0] }, W(4));
    joint(armR.hand, { r: [1.4, 0, 0] }, W(4));
    joint(neck, { p: [0, 0.42, -0.04] }, W(5));
    joint(antenna, { r: [-HALF, 0, 0] }, W(6));
    const TRUCK_FACE = 1.15;   // mostly side-on, a little toward you

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
      // while the legs swing, lift the body so the feet never sink into the floor
      const legReach = 0.12 + 1.94 * Math.cos(legL.thigh.rotation.x);
      if (u < 1 && pelvis.position.y < legReach) pelvis.position.y = legReach;
      // the hands are closed fists in truck mode and open as the wrists unfold
      const open = clamp01((u - 0.7) / 0.08);
      armL.curl(1 - open); armR.curl(1 - open);
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
      talking: false, time: 0, shake: 0, onArrive: null,
      drive: null, flash: 0
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
        // turn from the truck's side view to face you (or back) during the first stages
        const ft = clamp01((u - 0.08) / 0.34);
        state.facing = state.faceTarget = lerp(anim.truckFace, anim.robotFace, ft * ft * (3 - 2 * ft));
        // caption: which stage is running now
        const up = anim.to > anim.from;
        let k = -1;
        PHASES.forEach((ph, i) => { if (u >= ph.win[0] - 1e-6 && u <= ph.win[1] + 1e-6) k = up ? Math.max(k, i) : (k === -1 ? i : Math.min(k, i)); });
        if (k !== -1 && k !== anim.phase) {
          anim.phase = k;
          const n = up ? k + 1 : PHASES.length - k;
          caption(String(n).padStart(2, "0") + "/" + String(PHASES.length).padStart(2, "0"), up ? PHASES[k].robot : PHASES[k].truck, n, PHASES.length);
        }
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
        if (t >= 1) {
          const r = anim.resolve; anim = null;
          setTimeout(() => { if (!anim) cap.classList.remove("show"); }, 700);
          r();
        }
      }

      // driving (truck mode): roll along the floor with the wheels turning
      if (state.drive) {
        const d = state.drive;
        const t = clamp01((now - d.start) / d.ms);
        const nx = lerp(d.from, d.to, 1 - Math.pow(1 - t, 3));
        const spin = (nx - state.x) / 0.31;
        wheels.forEach((w) => { w.rotation.x += spin; });
        state.x = nx;
        if (t >= 1) { const r = d.resolve; state.drive = null; r(); }
      }
      if (cap.classList.contains("show")) {
        const v = new T.Vector3(root.position.x, 0, 0).project(camera);
        const cw = container.clientWidth, half = cap.offsetWidth / 2 + 8;
        cap.style.left = Math.max(half, Math.min(cw - half, (v.x + 1) / 2 * cw)).toFixed(0) + "px";
        cap.style.top = Math.min(container.clientHeight - 36, (1 - v.y) / 2 * container.clientHeight + 14).toFixed(0) + "px";
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
        // fingers: loosely curled while walking, relaxed when standing, open to
        // wave, and a small gesture while talking
        const flex = 0.05 * Math.sin(state.time * 1.7);
        if (walkAmt) { armL.curl(0.55); armR.curl(0.55); }
        else { armL.curl(0.22 + flex + (state.talking ? 0.12 * Math.sin(state.time * 5) : 0)); }
        if (!walkAmt) {
          const w = (state.time % 6) / 6;
          const wave = w > 0.7 ? Math.sin((w - 0.7) / 0.3 * Math.PI) : 0;
          armR.curl(wave > 0.05 ? 0.02 : 0.22 - flex);
          armR.hand.rotation.y = 0.55 + wave * 1.0;  // the palm turns to face you as it waves
          armR.upper.rotation.z = wave * 2.4;
          armR.fore.rotation.z = wave * Math.sin(state.time * 12) * 0.35;
          armR.upper.rotation.x = 0; armL.upper.rotation.x = 0;
          armL.fore.rotation.x = 0; armR.fore.rotation.x = 0;
        } else {
          armR.upper.rotation.z = 0; armR.fore.rotation.z = 0; armR.hand.rotation.y = 0.55;
        }
      }
      M.visor.emissiveIntensity = state.talking ? 0.8 + Math.abs(Math.sin(state.time * 16)) * 0.9 : 1.0;
      state.flash = Math.max(0, state.flash - dt);
      M.glow.emissiveIntensity = 0.75 + Math.sin(state.time * 2.5) * 0.2 + (state.flash > 0 ? (Math.sin(state.flash * 30) > 0 ? 1.6 : 0) : 0);

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
      // a steady camera: it only shakes a little when a part locks in
      camera.position.set((Math.random() - 0.5) * k * 0.6, LOOK_Y + 1.1 + (Math.random() - 0.5) * k * 0.6, camDist);
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

    function transform(to, ms, robotFace) {
      return new Promise((resolve) => {
        if (reduceMotion) { applyMode(to); state.facing = state.faceTarget = to ? robotFace : TRUCK_FACE; resolve(); return; }
        anim = { from: mode, to, start: performance.now(), ms, resolve, fired: new Set(), phase: -1, truckFace: TRUCK_FACE, robotFace };
      });
    }
    function drive(dx, ms = 1300) {
      return new Promise((resolve) => {
        if (reduceMotion) { resolve(); return; }
        state.drive = { from: state.x - dx, to: state.x, start: performance.now(), ms, resolve };
        state.x -= dx;
        state.flash = 0.5;
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
      toRobot: (face = 0) => transform(1, 6800, face),
      toCar: () => transform(0, 5200, state.facing),
      setCar: () => { applyMode(0); state.facing = state.faceTarget = TRUCK_FACE; root.rotation.y = TRUCK_FACE; },
      driveIn: (px) => drive(px == null ? 2.2 : px),
      flash: () => { state.flash = 0.5; },
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
