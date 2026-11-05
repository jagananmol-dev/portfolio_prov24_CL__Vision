// "Surprise me" tour. Every hexagon piece of the cracked name flies out from
// its centroid and becomes one tile of a robot, keeping its exact shape and
// size. The page fades away, and the robot walks through the five sections of
// the portfolio, one chapter at a time.
(function () {
  const trigger = document.getElementById("surprise");
  if (!trigger) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const github = (typeof LINKS !== "undefined" && LINKS.github) || "https://github.com/jagananmol-dev";

  // ---------- What the robot says: the five sections of the site ----------
  const CHAPTERS = [
    {
      key: "about", nav: "About", target: "#about",
      title: "Meet Jagananmol",
      say: "Hi! I'm built from the pieces of Jagananmol's name. Let me walk you through his journey, one chapter at a time.",
      points: [
        ["Student", "Final-year B.Tech in Computer Science and Engineering, with Honours in AI and Machine Learning, at Symbiosis Institute of Technology, Pune. Graduating in 2027."],
        ["Education", "93% in the ICSE board exam (2020) and 93 percentile in MHT-CET, the engineering entrance exam."],
        ["How he learns", "By building something, then figuring out why it broke."],
        ["Languages", "Speaks English, Telugu, Hindi and Marathi."],
        ["Right now", "Forward Deployed Engineer (FDE) at Prodapt, working directly with client teams to build and deploy AI solutions in their real systems. Also working with SEER Bharat Foundation on crop advice from satellite data."]
      ]
    },
    {
      key: "skills", nav: "Skills", target: "#skills",
      title: "His tech superpowers",
      say: "He builds across the whole stack, from the screen you tap to the model doing the thinking.",
      points: [
        ["Frontend", "React.js, Next.js, HTML and CSS. He built G-One's interface, with 3D visuals and voice input."],
        ["Backend", "Node.js, Express.js and FastAPI, powering G-One's agents and SEER Bharat's crop APIs."],
        ["Data", "MongoDB, PostgreSQL, MySQL and Firebase."],
        ["AI", "Ollama, Mistral and LoRA adapters for local multi-agent inference, plus ML model integration."],
        ["Networks and cloud", "Three CCNA courses, Nutanix NCA 6, and AWS Amplify, which hosts this site."]
      ]
    },
    {
      key: "projects", nav: "Projects", target: "#projects",
      title: "What he has built",
      say: "Two projects show how he thinks: make AI do real work, and put data in the hands of people who need it.",
      points: [
        ["G-One", "Built over the six-month VOIS Innovation Marathon 2.0, mentored by Dr. Aman Srivastava of Edunet Foundation, and completed successfully."],
        ["The orchestrator", "It reads each request and starts only the agents it needs: Email, Research, Wikipedia or DeepSearch. Idle agents never run, so it uses far fewer tokens."],
        ["Safety first", "A validation layer checks every action, like an email's recipient, before it happens."],
        ["SEER Bharat Foundation", "An NGO in India. He has been working with them as a Full Stack Developer since March 2026, building a crop suitability tool."],
        ["The problem", "Choosing what to plant is one of the biggest bets a farmer makes each season, and it's often based on habit or guesswork rather than data about their own land."],
        ["1. Pick a spot", "The farmer enters coordinates, or simply marks the location on a map."],
        ["2. Read the land from space", "The system pulls satellite imagery for that area, along with environmental data such as rainfall."],
        ["3. Get a recommendation", "A model predicts the crops best suited to those conditions, so farmers can plan with data instead of guesswork."],
        ["Built with", "Satellite imagery, rainfall and climate data, an ML prediction model, an interactive map, and crop recommendation APIs on the backend."]
      ]
    },
    {
      key: "wins", nav: "Achievements", target: "#wins",
      title: "Where he has proven it",
      say: "He's been on the podium twice, and every result here has a certificate you can open on the page.",
      points: [
        ["3rd Prize, Hack Your Path 6.0", "HITAM, May 2025. Team DataWizard built a voice healthcare assistant that speaks many languages, works over a phone call or WhatsApp, and points people to the nearest health station."],
        ["2nd Runner-up, AGTechathon 1.0", "A. G. Patil Institute of Technology, June 2025. After the NEET paper leak, a secure transfer platform that locks exam papers with AES-256 and RSA-2048, catches tampering and logs every step."],
        ["More hackathons", "Finalist at HackRX 5.0 (Bajaj Finserv), HacKronyX (SVPCET Nagpur) and Hackzilla (IIIT Sonepat), and took part in the AI/ML Hackathon 2.0 at Parul University."],
        ["Certified", "Three CCNA courses, Nutanix Certified Associate 6, and the Deloitte Cyber Job Simulation. Every certificate opens on the page."]
      ]
    },
    {
      key: "contact", nav: "Contact", target: "#contact",
      title: "Let's build something",
      say: "That's his journey so far. If you're hiring interns or building a hackathon team, he'd love to hear from you.",
      points: [
        ["Looking for", "Software engineering internships and good hackathon teams."],
        ["Fastest way to reach him", "Email: jagananmoldaneti@gmail.com"]
      ],
      actions: [
        { label: "Email him", href: "mailto:jagananmoldaneti@gmail.com", primary: true },
        { label: "GitHub", href: github },
        { label: "AWS Builder profile", href: "https://builder.aws.com/community/@quantumstack1509" }
      ]
    }
  ];

  // ---------- The robot: tiles on the same hexagon grid as the name ----------
  // Each cell is [row, x, part, priority]. Even rows sit on whole x positions,
  // odd rows on halves, exactly like the name's honeycomb. When the name has
  // fewer pieces than cells, the highest priority numbers are left out first.
  const CELLS = [
    [0, 3, "antenna", 1],
    [1, 1.5, "head", 4], [1, 2.5, "head", 1], [1, 3.5, "head", 1], [1, 4.5, "head", 4],
    [2, 1, "head", 1], [2, 2, "eye", 1], [2, 3, "head", 1], [2, 4, "eye", 1], [2, 5, "head", 1],
    [3, 1.5, "head", 5], [3, 2.5, "head", 1], [3, 3.5, "head", 1], [3, 4.5, "head", 5],
    [4, 0, "arm-l", 1], [4, 1, "torso", 1], [4, 2, "torso", 1], [4, 3, "torso", 1], [4, 4, "torso", 1], [4, 5, "torso", 1], [4, 6, "arm-r", 1],
    [5, 0.5, "arm-l", 1], [5, 1.5, "torso", 1], [5, 2.5, "torso", 1], [5, 3.5, "torso", 1], [5, 4.5, "torso", 1], [5, 5.5, "arm-r", 1],
    [6, 0, "arm-l", 3], [6, 1, "torso", 7], [6, 2, "torso", 1], [6, 3, "torso", 1], [6, 4, "torso", 1], [6, 5, "torso", 7], [6, 6, "arm-r", 3],
    [7, 1.5, "torso", 6], [7, 2.5, "torso", 1], [7, 3.5, "torso", 1], [7, 4.5, "torso", 6],
    [8, 2, "leg-l", 1], [8, 4, "leg-r", 1],
    [9, 1.5, "leg-l", 1], [9, 4.5, "leg-r", 1],
    [10, 1, "leg-l", 2], [10, 2, "leg-l", 1], [10, 4, "leg-r", 1], [10, 5, "leg-r", 2]
  ];
  const ORANGE = "#f2a93b";
  const ns = "http://www.w3.org/2000/svg";

  // ---------- Overlay markup ----------
  const tour = document.createElement("div");
  tour.className = "tour";
  tour.id = "tour";
  tour.hidden = true;
  tour.setAttribute("role", "dialog");
  tour.setAttribute("aria-modal", "true");
  tour.setAttribute("aria-labelledby", "tour-title");
  tour.innerHTML = `
    <div class="tour-pieces" aria-hidden="true"></div>
    <div class="tour-top">
      <ol class="tour-steps" aria-label="Tour chapters">
        ${CHAPTERS.map((c, i) => `<li><button type="button" data-step="${i}"><span class="ts-bar"></span><span class="ts-label">${c.nav}</span></button></li>`).join("")}
      </ol>
      <div class="tour-controls">
        <button type="button" class="tour-btn" id="tour-skip">Skip section</button>
        <button type="button" class="tour-btn tour-close" id="tour-close" aria-label="Close the tour">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Close</span>
        </button>
      </div>
    </div>
    <div class="tour-stage">
      <div class="tour-ground" aria-hidden="true"><span class="tour-shadow"></span><span class="tour-dust"></span></div>
      <div class="tour-bot" aria-hidden="true"><svg class="bot-svg" xmlns="${ns}"></svg></div>
      <div class="tour-3d" aria-hidden="true"></div>
      <article class="tour-card" aria-live="polite">
        <div class="tc-body">
        <p class="tc-kicker"></p>
        <h2 class="tc-title" id="tour-title"></h2>
        <p class="tc-say"><span class="tc-say-text"></span><span class="tc-caret" aria-hidden="true"></span></p>
        <ul class="tc-points"></ul>
        <div class="tc-actions"></div>
        </div>
        <div class="tc-nav">
          <button type="button" class="tour-btn" id="tour-back">Back</button>
          <a class="tc-open" id="tour-open" href="#about">Open this section on the page</a>
          <button type="button" class="tour-btn primary" id="tour-next">Next chapter</button>
        </div>
      </article>
    </div>`;
  document.body.appendChild(tour);

  const $ = (s) => tour.querySelector(s);
  const piecesLayer = $(".tour-pieces");
  const stage = $(".tour-stage");
  const bot = $(".tour-bot"), botSvg = bot.querySelector("svg");
  const ground = $(".tour-ground"), shadow = $(".tour-shadow"), dust = $(".tour-dust");
  const card = $(".tour-card"), kicker = $(".tc-kicker"), title = $(".tc-title");
  const sayText = $(".tc-say-text"), points = $(".tc-points"), actions = $(".tc-actions");
  const backBtn = $("#tour-back"), nextBtn = $("#tour-next"), skipBtn = $("#tour-skip"), closeBtn = $("#tour-close"), openLink = $("#tour-open");
  const stepBtns = [...tour.querySelectorAll(".tour-steps button")];
  const pageParts = [document.querySelector(".nav"), document.querySelector("main"), document.querySelector(".foot")].filter(Boolean);

  let step = 0, open = false, busy = false, typingToken = 0, lastFocus = null;
  let robot = null;   // { cells: [{ cx, cy, el, color }], scale, w, h }
  let screenText = null;

  // ---------- The 3D Transformer (Three.js), with the flat tile robot as a fallback ----------
  const box3d = $(".tour-3d");
  let r3 = null, use3d = false;
  const can3d = () => !!(window.Robot3D && window.Robot3D.supported());
  async function prepare3d() {
    if (!can3d()) return false;
    try {
      await Promise.race([window.Robot3D.load(), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 5000))]);
      if (!r3) r3 = window.Robot3D.create(box3d);
      return true;
    } catch (e) { return false; }
  }
  // fetch Three.js quietly once the page is idle, so the tour opens instantly
  const preload = () => { if (can3d()) window.Robot3D.load().catch(() => {}); };
  if ("requestIdleCallback" in window) requestIdleCallback(preload, { timeout: 4000 }); else setTimeout(preload, 2500);
  trigger.addEventListener("pointerenter", preload, { once: true });
  // where the robot stands, in pixels inside the stage: the middle of its spot
  const centerX = (i) => botX(i) + (bot.getBoundingClientRect().width || 200) / 2;

  const isNarrow = () => innerWidth < 900;

  // ---------- Build the robot from as many tiles as the name has pieces ----------
  function buildRobot(count) {
    const R = (window.nameCracks && window.nameCracks.R) || 30;
    const hexW = Math.sqrt(3) * R, rowH = 1.5 * R;
    const outline = window.nameCracks ? window.nameCracks.outline : null;
    const chosen = CELLS.map((c, i) => ({ c, i })).sort((a, b) => a.c[3] - b.c[3] || a.i - b.i).slice(0, count).map((o) => o.c);
    const W = 7 * hexW, H = 10 * rowH + 2 * R;
    botSvg.setAttribute("viewBox", `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
    botSvg.innerHTML = "";

    const center = (row, x) => ({ cx: (x + 0.5) * hexW, cy: row * rowH + R });
    const groups = {};
    const mk = (cls, parent) => { const g = document.createElementNS(ns, "g"); g.setAttribute("class", cls); (parent || botSvg).appendChild(g); return g; };
    const body = mk("bot-body");
    // draw order: legs and arms behind the torso, head on top
    groups["leg-l"] = mk("bot-leg bot-leg-l", body);
    groups["leg-r"] = mk("bot-leg bot-leg-r", body);
    groups["arm-l"] = mk("bot-arm bot-arm-l", body);
    groups["arm-r"] = mk("bot-arm bot-arm-r", body);
    groups.torso = mk("bot-torso", body);
    const head = mk("bot-headg", body);
    groups.head = head; groups.eye = head;
    groups.antenna = mk("bot-antenna", head);

    // joints the parts swing around
    const hip = (x) => ({ x: (x + 0.5) * hexW, y: 8 * rowH + R * 0.35 });
    const shoulder = (x) => ({ x: (x + 0.5) * hexW, y: 4 * rowH + R * 0.2 });
    const setOrigin = (g, p) => { g.style.transformOrigin = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`; };
    setOrigin(groups["leg-l"], hip(2)); setOrigin(groups["leg-r"], hip(4));
    setOrigin(groups["arm-l"], shoulder(0)); setOrigin(groups["arm-r"], shoulder(6));
    setOrigin(head, { x: W / 2, y: 4 * rowH });
    setOrigin(body, { x: W / 2, y: H });
    setOrigin(groups.antenna, { x: 3.5 * hexW, y: R * 1.6 });

    const cells = chosen.map(([row, x, part]) => {
      const { cx, cy } = center(row, x);
      const color = part === "eye" || part === "antenna" ? ORANGE : "#000";
      const el = document.createElementNS(ns, "polygon");
      const pts = outline ? outline(cx, cy, R) : [-90, -30, 30, 90, 150, 210].map((d) => ({ x: cx + Math.cos(d * Math.PI / 180) * R, y: cy + Math.sin(d * Math.PI / 180) * R }));
      el.setAttribute("points", pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
      el.setAttribute("fill", color);
      el.setAttribute("class", "bot-tile" + (part === "eye" ? " bot-eye" : ""));
      groups[part].appendChild(el);
      return { cx, cy, el, color, part };
    });

    // white crack lines between tiles are the tiles' own outlines, always 1.5px
    botSvg.style.setProperty("--crack", ((window.nameCracks && window.nameCracks.CRACK_WIDTH) || 1.5) + "px");

    // face details drawn on top of the tiles
    const mouth = mk("bot-mouth", head);
    [-1, 0, 1].forEach((k) => {
      const r = document.createElementNS(ns, "rect");
      const s = R * 0.22;
      r.setAttribute("x", (3.5 * hexW + k * R * 0.42 - s / 2).toFixed(1));
      r.setAttribute("y", (3 * rowH + R - s / 2).toFixed(1));
      r.setAttribute("width", s.toFixed(1)); r.setAttribute("height", s.toFixed(1)); r.setAttribute("rx", (s * 0.3).toFixed(1));
      r.setAttribute("fill", "#fff");
      mouth.appendChild(r);
    });
    const scr = mk("bot-chest", groups.torso);
    const sw = hexW * 1.25, sh = R * 0.95;
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", (3.5 * hexW - sw / 2).toFixed(1)); rect.setAttribute("y", (5 * rowH + R - sh / 2).toFixed(1));
    rect.setAttribute("width", sw.toFixed(1)); rect.setAttribute("height", sh.toFixed(1)); rect.setAttribute("rx", (R * 0.18).toFixed(1));
    rect.setAttribute("fill", "#fff");
    screenText = document.createElementNS(ns, "text");
    screenText.setAttribute("x", (3.5 * hexW).toFixed(1)); screenText.setAttribute("y", (5 * rowH + R + R * 0.18).toFixed(1));
    screenText.setAttribute("text-anchor", "middle");
    screenText.setAttribute("font-family", "IBM Plex Mono, monospace");
    screenText.setAttribute("font-size", (R * 0.5).toFixed(1));
    screenText.setAttribute("font-weight", "500");
    screenText.textContent = "01";
    scr.append(rect, screenText);

    robot = { cells, W, H, R };
    fitRobot();
    return robot;
  }

  // Tiles keep the name's exact piece size. Only if the robot can't fit the
  // screen at that size is the whole robot scaled down, evenly.
  function fitRobot() {
    if (!robot) return;
    const st = stage.getBoundingClientRect();
    let availW, availH;
    if (isNarrow()) {
      availH = Math.min(st.height * 0.42, 330);
      availW = st.width * 0.6;
    } else {
      const cardW = Math.min(620, st.width * 0.54);
      availW = (st.width - cardW - 64) * 0.9;
      availH = st.height * 0.9;
    }
    const scale = Math.min(1, availW / robot.W, availH / robot.H);
    robot.scale = scale;
    const w = robot.W * scale, h = robot.H * scale;
    bot.style.width = ground.style.width = w + "px";
    bot.style.height = ground.style.height = h + "px";
    tour.style.setProperty("--bot-h", h + "px");
  }

  // ---------- Positions ----------
  function botX(i) {
    const st = stage.getBoundingClientRect();
    const w = bot.getBoundingClientRect().width || 200;
    if (isNarrow()) return [0.42, 0.66, 0.3, 0.66, 0.4][i] * Math.max(0, st.width - w);
    const cardW = card.getBoundingClientRect().width || Math.min(620, st.width * 0.54);
    const gutter = Math.max(16, Math.min(64, st.width * 0.05));
    const free = st.width - cardW - gutter;
    return i % 2 === 0 ? free / 2 - w / 2 : cardW + gutter + free / 2 - w / 2;
  }
  // after walking, the 3D robot turns a little toward the card it's explaining
  const idleTurn = (i) => (isNarrow() ? 0 : i % 2 === 0 ? 0.35 : -0.35);
  function placeCard(i) {
    card.classList.toggle("left", !isNarrow() && i % 2 === 1);
    card.classList.toggle("right", !isNarrow() && i % 2 === 0);
  }
  function setPos(x) {
    if (use3d && r3) r3.placeAt(x + (bot.getBoundingClientRect().width || 200) / 2);
    bot.style.transform = `translateX(${x.toFixed(1)}px)`;
    ground.style.transform = `translateX(${x.toFixed(1)}px)`;
  }
  function puff() {
    dust.classList.remove("puff"); void dust.offsetWidth; dust.classList.add("puff");
  }

  // ---------- Walking: legs and arms swing in turn, the body bobs, feet kick up dust ----------
  function walkTo(i) {
    return new Promise((resolve) => {
      const x = botX(i);
      const cur = parseFloat(bot.dataset.x || x);
      bot.dataset.x = x;
      if (use3d && r3) { r3.walkTo(centerX(i), idleTurn(i)).then(resolve); return; }
      if (Math.abs(x - cur) < 2 || reduceMotion) { setPos(x); return resolve(); }
      bot.classList.toggle("face-left", x < cur);
      const dist = Math.abs(x - cur);
      const ms = Math.max(1100, Math.min(2800, dist / 0.32));
      bot.classList.add("walking");
      const start = performance.now();
      let lastStep = -1;
      (function frame(now) {
        const t = Math.min(1, (now - start) / ms);
        const e = t < 0.12 ? (t / 0.12) * 0.12 * 0.5 : t > 0.88 ? 1 - ((1 - t) / 0.12) * 0.12 * 0.5 : t; // ease in and out of the stride
        setPos(cur + (x - cur) * Math.min(1, Math.max(0, e)));
        const stepNo = Math.floor((now - start) / 380);
        if (stepNo !== lastStep) { lastStep = stepNo; puff(); }
        if (t < 1) requestAnimationFrame(frame);
        else { bot.classList.remove("walking"); resolve(); }
      })(start);
    });
  }

  // ---------- The name's pieces fly to the robot and back ----------
  function namePieces() {
    const layer = document.querySelector(".name-layer");
    const h1 = document.querySelector("h1.name");
    if (!layer || !h1) return { layer: null, list: [] };
    const r = layer.getBoundingClientRect();
    const list = [...layer.querySelectorAll(".name-shard")].map((s) => {
      const [ox, oy] = s.style.transformOrigin.split(" ").map(parseFloat);
      return { shard: s, ox, oy, x: r.left + ox, y: r.top + oy };
    });
    return { layer, rect: r, h1, list };
  }

  // copies of the real pieces, placed exactly over the name, that can fly
  function makeFlyers(src) {
    piecesLayer.innerHTML = "";
    const cs = getComputedStyle(src.h1);
    const wrap = document.createElement("div");
    wrap.className = "fly-wrap";
    Object.assign(wrap.style, {
      left: src.rect.left + "px", top: src.rect.top + "px", width: src.rect.width + "px", height: src.rect.height + "px",
      fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight, color: "#000"
    });
    piecesLayer.appendChild(wrap);
    return src.list.map((p) => {
      const el = p.shard.cloneNode(true);
      el.className = "fly-piece";
      wrap.appendChild(el);
      return { ...p, el };
    });
  }

  // match pieces to tiles left-to-right and top-to-bottom, so the swarm doesn't cross itself
  function pairPiecesToTiles(pieces, cells) {
    const ps = pieces.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const cs = cells.slice().sort((a, b) => a.cx - b.cx || a.cy - b.cy);
    return ps.map((p, i) => ({ p, c: cs[i] || null }));
  }

  function tileScreen(c) {
    const r = botSvg.getBoundingClientRect();
    const s = r.width / robot.W;
    return { x: r.left + c.cx * s, y: r.top + c.cy * s, s };
  }

  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  // 3D: the name's pieces fly into a car, the car builds itself, then transforms
  async function assemble3d(src) {
    r3.resize();
    r3.setCar();
    r3.setScreen("");
    const x = botX(0); bot.dataset.x = x; setPos(x);
    const rect = r3.screenRect();
    r3.hideAll();
    r3.start();
    if (src.list.length && !reduceMotion) {
      const flyers = makeFlyers(src);
      document.body.classList.add("name-flying");
      const rand = seeded(1509);
      const jobs = flyers.map((p) => {
        const delay = rand() * 420, dur = 1150;
        const tx = rect.left + (0.12 + rand() * 0.76) * (rect.right - rect.left);
        const ty = rect.top + (0.2 + rand() * 0.6) * (rect.bottom - rect.top);
        const dx = tx - p.x, dy = ty - p.y;
        const spin = rand() < 0.5 ? 360 : -360;
        return p.el.animate([
          { transform: "translate(0px, 0px) rotate(0deg) scale(1)", opacity: 1 },
          { transform: `translate(${(dx / 2).toFixed(1)}px, ${(dy / 2 - 80).toFixed(1)}px) rotate(${spin / 2}deg) scale(.7)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${spin}deg) scale(.25)`, opacity: 0 }
        ], { duration: dur, delay, easing: "cubic-bezier(.55,0,.3,1)", fill: "forwards" }).finished;
      });
      await wait(900);
      const built = r3.materialize();
      await Promise.all(jobs);
      await built;
      piecesLayer.innerHTML = "";
    } else {
      await r3.materialize();
    }
    await r3.driveIn();                         // the finished truck rolls in, headlights flashing
    await wait(500);
    await r3.toRobot(idleTurn(0));              // then transforms, stage by stage
  }

  async function disassemble3d(src) {
    if (r3.mode > 0.01) { r3.setTalking(false); await r3.toCar(); }
    const rect = r3.screenRect();
    if (src.list.length && !reduceMotion) {
      const flyers = makeFlyers(src);
      const rand = seeded(77);
      const jobs = flyers.map((p) => {
        const tx = rect.left + (0.12 + rand() * 0.76) * (rect.right - rect.left);
        const ty = rect.top + (0.2 + rand() * 0.6) * (rect.bottom - rect.top);
        return p.el.animate([
          { transform: `translate(${(tx - p.x).toFixed(1)}px, ${(ty - p.y).toFixed(1)}px) rotate(0deg) scale(.25)`, opacity: 0 },
          { transform: `translate(${(tx - p.x).toFixed(1)}px, ${(ty - p.y).toFixed(1)}px) rotate(40deg) scale(.4)`, opacity: 1, offset: 0.15 },
          { transform: "translate(0px, 0px) rotate(360deg) scale(1)", opacity: 1 }
        ], { duration: 1000, delay: rand() * 300, easing: "cubic-bezier(.55,0,.3,1)", fill: "both" }).finished;
      });
      r3.dematerialize();
      await Promise.all(jobs);
    } else {
      await r3.dematerialize();
    }
    r3.stop();
  }

  async function assemble() {
    const src = namePieces();
    buildRobot(src.list.length || 40);
    use3d = await prepare3d();
    tour.classList.toggle("is3d", use3d);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (use3d) {
      try { return await assemble3d(src); }
      catch (e) { use3d = false; tour.classList.remove("is3d"); if (r3) r3.stop(); piecesLayer.innerHTML = ""; }
    }
    const x = botX(0); bot.dataset.x = x; setPos(x);
    robot.cells.forEach((c) => c.el.classList.add("hide"));
    bot.classList.add("assembling");
    if (!src.list.length || reduceMotion) { robot.cells.forEach((c) => c.el.classList.remove("hide")); bot.classList.remove("assembling"); return; }

    const flyers = makeFlyers(src);
    document.body.classList.add("name-flying");
    const rand = seeded(1509);
    const pairs = pairPiecesToTiles(flyers, robot.cells);
    let longest = 0;
    const jobs = pairs.map(({ p, c }) => {
      const delay = rand() * 420;
      const dur = 1250;
      longest = Math.max(longest, delay + dur);
      if (!c) {
        return p.el.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.2)" }], { duration: 600, delay, fill: "forwards" }).finished;
      }
      const t = tileScreen(c);
      const dx = t.x - p.x, dy = t.y - p.y;
      const bend = (rand() - 0.5) * 220;
      const len = Math.hypot(dx, dy) || 1;
      const mx = dx / 2 - (dy / len) * bend, my = dy / 2 + (dx / len) * bend - 60;
      const spin = rand() < 0.5 ? 360 : -360;
      const a = p.el.animate([
        { transform: "translate(0px, 0px) rotate(0deg) scale(1)" },
        { transform: `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px) rotate(${spin / 2}deg) scale(${((1 + t.s) / 2).toFixed(3)})`, offset: 0.5 },
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${spin}deg) scale(${t.s.toFixed(3)})` }
      ], { duration: dur, delay, easing: "cubic-bezier(.55,0,.3,1)", fill: "forwards" });
      // as each piece lands it locks in and turns solid
      return a.finished.then(() => { c.el.classList.remove("hide"); c.el.classList.add("lock"); p.el.style.opacity = "0"; });
    });
    await Promise.all(jobs);
    robot.cells.forEach((c) => c.el.classList.remove("hide"));
    bot.classList.remove("assembling");
    piecesLayer.innerHTML = "";
  }

  async function disassemble() {
    const src = namePieces();
    if (use3d && r3) { try { return await disassemble3d(src); } catch (e) { r3.stop(); return; } }
    if (!src.list.length || reduceMotion || !robot) return;
    const flyers = makeFlyers(src);
    bot.classList.add("assembling");
    const rand = seeded(77);
    const pairs = pairPiecesToTiles(flyers, robot.cells);
    const jobs = pairs.map(({ p, c }) => {
      const delay = rand() * 300;
      if (!c) return p.el.animate([{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "scale(1)" }], { duration: 700, delay: 300, fill: "backwards" }).finished;
      const t = tileScreen(c);
      const dx = t.x - p.x, dy = t.y - p.y;
      c.el.classList.add("hide");
      return p.el.animate([
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(0deg) scale(${t.s.toFixed(3)})` },
        { transform: "translate(0px, 0px) rotate(360deg) scale(1)" }
      ], { duration: 1000, delay, easing: "cubic-bezier(.55,0,.3,1)", fill: "both" }).finished;
    });
    await Promise.all(jobs);
  }

  // ---------- Chapter rendering ----------
  function setSteps(i) {
    stepBtns.forEach((b, k) => {
      b.classList.toggle("done", k < i);
      b.classList.toggle("current", k === i);
      if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    backBtn.disabled = i === 0;
    const last = i === CHAPTERS.length - 1;
    skipBtn.hidden = last;
    nextBtn.textContent = last ? "Finish tour" : "Next chapter";
  }

  async function type(text) {
    const token = ++typingToken;
    sayText.textContent = "";
    bot.classList.add("talking");
    if (r3) r3.setTalking(true);
    card.classList.add("typing");
    if (reduceMotion) { sayText.textContent = text; }
    else {
      for (let n = 1; n <= text.length; n++) {
        if (token !== typingToken) return false;
        sayText.textContent = text.slice(0, n);
        await new Promise((r) => setTimeout(r, text[n - 1] === "," || text[n - 1] === "." ? 90 : 16));
      }
    }
    if (token === typingToken) { bot.classList.remove("talking"); card.classList.remove("typing"); if (r3) r3.setTalking(false); }
    return token === typingToken;
  }

  async function show(i, { walk = true } = {}) {
    if (busy) return;
    busy = true;
    step = i;
    const c = CHAPTERS[i];
    setSteps(i);
    card.classList.add("out");
    if (walk) { await wait(220); await walkTo(i); }
    placeCard(i);
    if (screenText) screenText.textContent = String(i + 1).padStart(2, "0");
    if (use3d && r3) r3.setScreen(String(i + 1).padStart(2, "0"));
    kicker.textContent = `Chapter ${i + 1} of ${CHAPTERS.length}: ${c.nav}`;
    title.textContent = c.title;
    points.innerHTML = c.points.map(([b, t]) => `<li><b>${b}</b><span>${t}</span></li>`).join("");
    actions.innerHTML = (c.actions || []).map((a) => `<a class="tour-btn${a.primary ? " primary" : ""}" href="${a.href}"${a.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${a.label}</a>`).join("");
    openLink.href = c.target;
    $(".tc-body").scrollTop = 0;
    card.classList.remove("out");
    busy = false;
    const token = typingToken + 1;
    const finished = await type(c.say);
    if (!finished || token !== typingToken) return;
    for (const li of [...points.children]) {
      if (token !== typingToken) return;
      li.classList.add("in");
      await wait(260);
    }
    actions.classList.add("in");
  }

  function revealAll() {
    typingToken++;
    sayText.textContent = CHAPTERS[step].say;
    bot.classList.remove("talking"); card.classList.remove("typing");
    if (r3) r3.setTalking(false);
    [...points.children].forEach((li) => li.classList.add("in"));
    actions.classList.add("in");
  }

  function go(i) {
    if (i < 0 || i >= CHAPTERS.length || i === step || busy) return;
    typingToken++;
    actions.classList.remove("in");
    show(i);
  }

  // ---------- Open and close ----------
  async function openTour() {
    if (open) return;
    open = true; busy = true;
    lastFocus = document.activeElement;
    step = 0;
    tour.hidden = false;
    document.body.classList.add("touring");
    pageParts.forEach((el) => el.setAttribute("inert", ""));
    bot.classList.remove("ready", "walking", "face-left", "power");
    placeCard(0);
    setSteps(0);
    card.classList.add("out");
    tour.classList.add("show");                 // the page fades away
    bot.classList.add("ready");
    await assemble();                           // the name's pieces become the robot
    bot.classList.add("power");                 // eyes flicker on
    if (screenText) screenText.textContent = "OK";
    if (use3d && r3) r3.setScreen("OK");
    await wait(700);
    bot.classList.remove("power");
    closeBtn.focus({ preventScroll: true });
    busy = false;
    show(0, { walk: false });
  }

  async function closeTour() {
    if (!open) return;
    typingToken++;
    busy = true;
    card.classList.add("out");
    if (use3d && r3) {                          // the robot folds back into a car while you watch
      try { r3.setTalking(false); await r3.toCar(); r3.flash(); await wait(450); } catch (e) {}
    }
    tour.classList.remove("show");
    await disassemble();                        // the robot's tiles fly back into the name
    piecesLayer.innerHTML = "";
    document.body.classList.remove("name-flying", "touring");
    pageParts.forEach((el) => el.removeAttribute("inert"));
    tour.hidden = true;
    bot.classList.remove("ready", "assembling");
    open = false; busy = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // ---------- Wiring ----------
  trigger.addEventListener("click", openTour);
  // the small Surprise me badge on the "Ask my portfolio" button opens the same tour
  const navTrigger = document.querySelector(".nav-surprise");
  if (navTrigger) {
    navTrigger.addEventListener("pointerenter", preload, { once: true });
    navTrigger.addEventListener("click", () => {
      const menu = document.querySelector(".menu-toggle");
      if (menu && menu.getAttribute("aria-expanded") === "true") menu.click();   // close the phone menu first
      openTour();
    });
  }
  closeBtn.addEventListener("click", closeTour);
  nextBtn.addEventListener("click", () => (step === CHAPTERS.length - 1 ? closeTour() : go(step + 1)));
  backBtn.addEventListener("click", () => go(step - 1));
  skipBtn.addEventListener("click", () => go(step + 1));
  stepBtns.forEach((b) => b.addEventListener("click", () => go(+b.dataset.step)));
  sayText.parentElement.addEventListener("click", revealAll);
  openLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const target = openLink.getAttribute("href");
    await closeTour();
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); closeTour(); }
    else if (e.key === "ArrowRight" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) go(step + 1);
    else if (e.key === "ArrowLeft" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) go(step - 1);
    else if (e.key === "Tab") {
      const f = [...tour.querySelectorAll("button:not([disabled]):not([hidden]), a[href]")].filter((el) => el.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  let rt;
  window.addEventListener("resize", () => {
    if (!open) return;
    clearTimeout(rt);
    rt = setTimeout(() => {
      fitRobot();
      if (use3d && r3) r3.resize();
      const x = botX(step); bot.dataset.x = x;
      setPos(x);
      placeCard(step);
    }, 120);
  });

  window.portfolioTour = { open: openTour, close: closeTour, go, get step() { return step; }, get isOpen() { return open; }, get robot() { return robot; }, get is3d() { return use3d; }, get robot3d() { return r3; } };
})();
