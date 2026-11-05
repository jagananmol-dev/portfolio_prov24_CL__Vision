// A 3D Transformer for the "Surprise me" tour, built with Three.js (loaded on
// demand). It starts as a car, transforms joint by joint into a robot, walks,
// talks, and transforms back. Clear-coated graphite armour with a deep amber
// livery, brushed-metal joints, chrome wheels, hydraulic pistons at the knees
// and elbows, glowing eyes that blink, and orange hexagon cores. Studio
// reflections come from a small virtual light box baked into an environment map.
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
    // phones and small tablets get a lighter setup: fewer pixels, a smaller shadow map
    const light = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding;
    // filmic tone mapping: bright highlights roll off softly, like a photo
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
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

    // studio reflections: a small virtual photo studio (softboxes, an amber
    // strip light) is blurred into an environment map, so paint, chrome and
    // glass reflect something real instead of flat colour
    const pmrem = new T.PMREMGenerator(renderer);
    const studio = new T.Scene();
    studio.add(new T.Mesh(new T.BoxGeometry(24, 14, 24), new T.MeshBasicMaterial({ color: 0x121418, side: T.BackSide })));
    function softbox(w, h, hex, power, x, y, z) {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(hex).multiplyScalar(power), side: T.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 1.5, 0);
      studio.add(m);
    }
    softbox(10, 2.2, 0xffffff, 3.2, 0, 6.8, 1);      // overhead strip
    softbox(4, 6, 0xffffff, 2.4, 8, 2.5, 7);          // key softbox, front right
    softbox(3, 5, 0xdfe8ff, 1.2, -9, 2, 4);           // cool fill, left
    softbox(9, 0.8, 0xf2a93b, 3.0, -2, 1.8, -11);     // amber rim strip behind
    const floorGlow = new T.Mesh(new T.PlaneGeometry(24, 24), new T.MeshBasicMaterial({ color: 0x0c0d10 }));
    floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = -6.9;
    studio.add(floorGlow);
    scene.environment = pmrem.fromScene(studio, 0.03).texture;
    pmrem.dispose();

    scene.add(new T.HemisphereLight(0xffffff, 0x3a3f48, 0.45));
    const key = new T.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 10, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(light ? 1024 : 2048, light ? 1024 : 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -12, right: 12, top: 10, bottom: -3, near: 1, far: 40 });
    scene.add(key);
    scene.add(key.target);
    const rim = new T.DirectionalLight(0xf2a93b, 1.1);
    rim.position.set(-7, 5, -6);
    scene.add(rim);
    const ground = new T.Mesh(new T.PlaneGeometry(80, 30), new T.ShadowMaterial({ opacity: 0.17 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ---------- procedural textures ----------
    // brushed metal: fine horizontal streaks, used as a roughness map
    function canvasTex(w, h, draw, repeat) {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      draw(c.getContext("2d"), w, h);
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      if (repeat) t.repeat.set(repeat[0], repeat[1]);
      return t;
    }
    const brushed = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = "#b4b4b4"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const v = 140 + Math.floor(Math.random() * 115);
        g.fillStyle = `rgba(${v},${v},${v},0.55)`;
        g.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 120, 1);
      }
    }, [2, 2]);
    // tyre tread: grooves running across the tread, as a bump map
    const tread = canvasTex(256, 32, (g, w, h) => {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#000";
      for (let i = 0; i < 32; i++) {
        const x = i * 8;
        g.fillRect(x, 0, 3, h * 0.45);
        g.fillRect(x + 4, h * 0.55, 3, h * 0.45);
      }
      g.fillRect(0, h * 0.47, w, 2);
    });

    // ---------- materials ----------
    // graphite clear-coated armour, a deep amber livery on the main plates,
    // brushed gunmetal for the mechanical parts, polished chrome, rubber, glass
    const M = {
      body: new T.MeshPhysicalMaterial({ color: 0x0c0e12, metalness: 0.6, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.6 }),
      paint: new T.MeshPhysicalMaterial({ color: 0xa8480a, metalness: 0.25, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.55 }),
      trim: new T.MeshStandardMaterial({ color: 0x2a2e35, metalness: 0.85, roughness: 0.48, roughnessMap: brushed, envMapIntensity: 0.6 }),
      dark: new T.MeshStandardMaterial({ color: 0x07080a, metalness: 0.3, roughness: 0.7 }),
      glow: new T.MeshStandardMaterial({ color: 0x2a1600, emissive: 0xf2a93b, emissiveIntensity: 1.4, metalness: 0.1, roughness: 0.35, toneMapped: false }),
      visor: new T.MeshStandardMaterial({ color: 0x2a1600, emissive: 0xffb04a, emissiveIntensity: 1.8, metalness: 0, roughness: 0.2, toneMapped: false }),
      glass: new T.MeshPhysicalMaterial({ color: 0x0d141c, metalness: 0.2, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, emissive: 0xf2a93b, emissiveIntensity: 0.04 }),
      tyre: new T.MeshStandardMaterial({ color: 0x111113, metalness: 0, roughness: 0.92 }),
      tread: new T.MeshStandardMaterial({ color: 0x0e0e10, metalness: 0, roughness: 0.95, bumpMap: tread, bumpScale: 0.03 }),
      rim: new T.MeshStandardMaterial({ color: 0xe8ecf2, metalness: 1, roughness: 0.12, envMapIntensity: 1.3 }),
      line: new T.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 }),
      spark: new T.MeshBasicMaterial({ color: 0xffc46b, toneMapped: false }),
      lamp: new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6e0, emissiveIntensity: 1.6, roughness: 0.2, toneMapped: false }),
      tail: new T.MeshStandardMaterial({ color: 0xd8262c, emissive: 0xd8262c, emissiveIntensity: 1.3, roughness: 0.3, toneMapped: false })
    };

    const parts = [];   // every visible piece, for the build-up and break-down effects
    const G = () => new T.Group();
    function add(mesh, parent, edges) {
      // small details (nuts, bolts, vents) skip the shadow pass
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      mesh.castShadow = mesh.geometry.boundingSphere.radius > 0.09;
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
      const curved = mat === M.body || mat === M.paint;
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
      const sg = Math.sign(x) || 1;               // which side faces out
      // tyre: treaded rubber round the outside, smooth sidewalls
      const tyre = new T.Mesh(new T.CylinderGeometry(0.31, 0.31, 0.24, 36), [M.tread, M.tyre, M.tyre]);
      tyre.rotation.z = Math.PI / 2;
      add(tyre, g, false);
      const wall = new T.Mesh(new T.TorusGeometry(0.255, 0.035, 8, 32), M.tyre);
      wall.rotation.y = Math.PI / 2; wall.position.x = sg * 0.115;
      add(wall, g, false);
      // polished rim with a lip, a dished centre and six lug nuts
      const dish = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.245, 28), M.trim);
      dish.rotation.z = Math.PI / 2;
      add(dish, g, false);
      const lip = new T.Mesh(new T.TorusGeometry(0.2, 0.018, 8, 32), M.rim);
      lip.rotation.y = Math.PI / 2; lip.position.x = sg * 0.124;
      add(lip, g, false);
      const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.13, 0.27, 6), M.rim);
      hub.rotation.z = Math.PI / 2;
      add(hub, g, false);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        const nut = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.03, 6), M.rim);
        nut.rotation.z = Math.PI / 2;
        nut.position.set(sg * 0.14, Math.cos(a) * 0.155, Math.sin(a) * 0.155);
        add(nut, g, false);
      }
      // spokes, so you can see the wheels turn
      const spoke = new T.Mesh(new T.BoxGeometry(0.255, 0.045, 0.34), M.dark);
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
    for (const sx of [-1, 1]) for (const vy of [0.11, 0.21, 0.31]) box(0.02, 0.04, 0.42, M.dark, sx * 0.48, vy, 0, torso);   // waist vents
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
    const screen = new T.Mesh(new T.PlaneGeometry(0.46, 0.23), new T.MeshBasicMaterial({ map: scrTex, toneMapped: false }));
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
    const neckCol = new T.Mesh(new T.CylinderGeometry(0.13, 0.16, 0.2, 16), M.trim);
    neckCol.position.y = 0.0;
    add(neckCol, head, false);
    box(0.62, 0.56, 0.6, M.body, 0, 0.32, 0, head);
    box(0.78, 0.16, 0.5, M.paint, 0, 0.63, -0.03, head);           // crest
    box(0.12, 0.2, 0.4, M.paint, 0, 0.72, 0.02, head);              // centre fin
    // face: a dark recessed plate, a brow, two angled eye slits that glow,
    // and a chrome mouth guard with vents
    box(0.48, 0.36, 0.04, M.dark, 0, 0.3, 0.3, head);
    box(0.52, 0.06, 0.1, M.trim, 0, 0.46, 0.3, head);
    const eyes = [];
    for (const sx of [-1, 1]) {
      const e = box(0.15, 0.05, 0.03, M.visor, sx * 0.105, 0.37, 0.33, head);
      e.rotation.z = sx * 0.2;
      eyes.push(e);
    }
    box(0.28, 0.14, 0.05, M.rim, 0, 0.2, 0.33, head);
    for (const vy of [0.17, 0.2, 0.23]) box(0.2, 0.014, 0.01, M.dark, 0, vy, 0.36, head);
    box(0.08, 0.32, 0.4, M.trim, -0.36, 0.3, 0, head);
    box(0.08, 0.32, 0.4, M.trim, 0.36, 0.3, 0, head);
    for (const sx of [-1, 1]) {
      const ear = new T.Mesh(new T.CylinderGeometry(0.085, 0.085, 0.04, 6), M.glow);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(sx * 0.41, 0.32, 0);
      add(ear, head, false);
    }
    // the eyes light up the face around them
    const eyeLight = new T.PointLight(0xffb84d, 0.7, 1.4, 2);
    eyeLight.position.set(0, 0.38, 0.55);
    head.add(eyeLight);
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
      // a painted pauldron over the wheel; in truck mode it is the front fender
      const pad = box(0.66, 0.11, 0.8, M.paint, s * 0.1, 0.31, 0, shoulder);
      pad.rotation.z = -s * 0.16;
      for (const bz of [-0.28, 0.28]) {
        const bolt = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.03, 6), M.rim);
        bolt.position.set(s * 0.02, 0.37, bz);
        add(bolt, shoulder, false);
      }
      const upper = G();
      upper.position.set(s * 0.05, -0.2, 0);
      shoulder.add(upper);
      box(0.32, 0.72, 0.34, M.body, 0, -0.38, 0, upper);
      box(0.2, 0.5, 0.36, M.trim, 0, -0.38, 0, upper);              // inner actuator showing at the sides
      const fore = G();
      fore.position.set(0, -0.76, 0);
      upper.add(fore);
      // elbow: a gunmetal joint barrel with chrome caps
      const elbow = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.38, 18), M.trim);
      elbow.rotation.z = Math.PI / 2;
      add(elbow, fore, false);
      for (const cx of [-0.2, 0.2]) {
        const cap = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.03, 18), M.rim);
        cap.rotation.z = Math.PI / 2; cap.position.x = cx;
        add(cap, fore, false);
      }
      box(0.4, 0.66, 0.42, M.body, 0, -0.36, 0, fore);
      box(0.07, 0.46, 0.36, M.paint, s * 0.215, -0.36, 0, fore);   // forearm armour plate
      hex(0.08, 0.44, M.glow, 0, -0.18, 0, fore);
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
      return { shoulder, upper, fore, hand, curl, s };
    }
    function leg(s) {
      const hip = G();
      hip.position.set(s * 0.34, -0.12, 0);
      pelvis.add(hip);
      const thigh = G();
      hip.add(thigh);
      const hipCap = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.05, 18), M.rim);
      hipCap.rotation.z = Math.PI / 2; hipCap.position.set(s * 0.235, -0.06, 0);
      add(hipCap, thigh, false);
      box(0.42, 0.86, 0.48, M.body, 0, -0.43, 0, thigh);
      box(0.3, 0.6, 0.5, M.trim, 0, -0.45, 0, thigh);                // inner frame showing front and back
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
      // knee: joint barrel, then a painted kneepad and shin plate
      const knee = new T.Mesh(new T.CylinderGeometry(0.19, 0.19, 0.46, 18), M.trim);
      knee.rotation.z = Math.PI / 2;
      add(knee, shin, false);
      box(0.52, 0.88, 0.58, M.body, 0, -0.46, 0, shin);
      box(0.38, 0.26, 0.12, M.paint, 0, 0.02, 0.27, shin);
      box(0.4, 0.34, 0.06, M.paint, 0, -0.6, 0.3, shin);
      hex(0.11, 0.06, M.glow, 0, -0.27, 0.3, shin);
      for (const vy of [-0.38, -0.46, -0.54]) box(0.025, 0.035, 0.4, M.dark, -s * 0.265, vy, 0, shin);   // calf vents
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

    // hydraulic pistons across the knees and elbows: a barrel fixed to one
    // limb and a chrome rod fixed to the other, re-aimed every frame so the
    // rod slides in and out of the barrel as the joint bends
    const pistons = [];
    function piston(pa, a, pb, b, len, r = 0.036) {
      const A = G(); A.position.set(...a); pa.add(A);
      const B = G(); B.position.set(...b); pb.add(B);
      const barrel = new T.Mesh(new T.CylinderGeometry(r, r, len, 12), M.trim);
      barrel.rotation.x = Math.PI / 2; barrel.position.z = len / 2;
      add(barrel, A, false);
      const collar = new T.Mesh(new T.CylinderGeometry(r * 1.25, r * 1.25, 0.03, 12), M.rim);
      collar.rotation.x = Math.PI / 2; collar.position.z = len;
      add(collar, A, false);
      const rod = new T.Mesh(new T.CylinderGeometry(r * 0.5, r * 0.5, len, 10), M.rim);
      rod.rotation.x = Math.PI / 2; rod.position.z = len / 2;
      add(rod, B, false);
      pistons.push({ A, B });
    }
    for (const L of [legL, legR]) piston(L.thigh, [0, -0.28, -0.27], L.shin, [0, -0.3, -0.3], 0.5);
    for (const A of [armL, armR]) piston(A.upper, [0, -0.2, 0.19], A.fore, [0, -0.3, 0.23], 0.46, 0.03);
    const pv = new T.Vector3();
    function aimPistons() {
      root.updateMatrixWorld(true);
      for (const p of pistons) {
        p.B.getWorldPosition(pv); p.A.lookAt(pv);
        p.A.getWorldPosition(pv); p.B.lookAt(pv);
      }
    }

    // soft contact shadow under the feet (or the wheels), grounding it on the page
    const blobTex = canvasTex(128, 128, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(0.55, "rgba(0,0,0,0.22)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
    const blob = new T.Mesh(new T.PlaneGeometry(2.4, 2.0), new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.012;
    blob.renderOrder = -1;
    root.add(blob);

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
      // eyes: brighter flicker while talking, a quick blink every few seconds
      const eyeOn = state.talking ? 1.0 + Math.abs(Math.sin(state.time * 16)) * 0.9 : 1.3;
      M.visor.emissiveIntensity = eyeOn;
      eyeLight.intensity = 0.45 * eyeOn * clamp01((mode - 0.8) / 0.2);
      const bt = state.time % 4.3;
      const blink = bt < 0.14 ? 0.15 + Math.abs(bt - 0.07) / 0.07 * 0.85 : 1;
      for (const e of eyes) if (e.scale.x > 0.99) e.scale.y = blink;
      state.flash = Math.max(0, state.flash - dt);
      M.glow.emissiveIntensity = 0.9 + Math.sin(state.time * 2.5) * 0.15 + (state.flash > 0 ? (Math.sin(state.flash * 30) > 0 ? 2 : 0) : 0);
      // contact shadow: round under the feet, long under the truck, fades with the parts
      blob.scale.set(1, lerp(2.1, 1, mode), 1);
      blob.position.z = lerp(-0.85, 0.05, mode);
      blob.material.opacity = clamp01(parts[0].scale.x);
      aimPistons();

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
