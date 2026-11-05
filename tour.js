// "Surprise me" tour. The pieces of the cracked name fly out from their
// centroids and assemble into a robot, the page fades away, and the robot
// walks through the five sections of the portfolio, one chapter at a time.
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
        ["Student", "Final-year B.Tech Computer Science student at Symbiosis Institute of Technology, Pune, graduating in 2027."],
        ["How he learns", "By building something, then figuring out why it broke."],
        ["Languages", "Speaks English, Telugu, Hindi and Marathi."],
        ["Right now", "Working with SEER Bharat Foundation on crop advice from satellite data, and looking for software engineering internships."]
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
        ["Crop suitability", "With SEER Bharat Foundation: mark a spot on the map, the system reads satellite imagery and rainfall, and a model suggests the crop that suits that land."]
      ]
    },
    {
      key: "wins", nav: "Achievements", target: "#wins",
      title: "Where he has proven it",
      say: "He's been on the podium twice, and every result here has a certificate you can open on the page.",
      points: [
        ["3rd Prize, Hack Your Path 6.0", "HITAM, May 2025. Team DataWizard built a voice healthcare assistant that speaks many languages, works over a phone call or WhatsApp, and points people to the nearest health station."],
        ["2nd Runner-up, AGTechathon 1.0", "A. G. Patil Institute of Technology, June 2025. After the NEET paper leak, a secure transfer platform that locks exam papers with AES-256 and RSA-2048, catches tampering and logs every step."],
        ["More hackathons", "Finalist at HackRX 5.0 (Bajaj Finserv), HackronyX and Hackzilla (IIIT Sonepat), and took part in the AI/ML Hackathon 2.0 at Parul University."],
        ["Certified", "Three CCNA courses, Nutanix Certified Associate 6, and the Deloitte cybersecurity virtual internship."]
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

  // ---------- The robot ----------
  const ROBOT = `
<svg class="bot-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 330" role="img" aria-label="A robot made from the pieces of Jagananmol's name">
  <g class="bot-body">
    <g class="bot-leg bot-leg-l">
      <rect x="80" y="236" width="22" height="58" rx="10" fill="#000"/>
      <rect x="70" y="290" width="38" height="16" rx="8" fill="#000"/>
    </g>
    <g class="bot-leg bot-leg-r">
      <rect x="118" y="236" width="22" height="58" rx="10" fill="#000"/>
      <rect x="112" y="290" width="38" height="16" rx="8" fill="#000"/>
    </g>
    <g class="bot-arm bot-arm-l">
      <rect x="36" y="138" width="20" height="66" rx="10" fill="#000"/>
      <circle cx="46" cy="210" r="11" fill="#000"/>
    </g>
    <g class="bot-arm bot-arm-r">
      <rect x="164" y="138" width="20" height="66" rx="10" fill="#000"/>
      <circle cx="174" cy="210" r="11" fill="#000"/>
    </g>
    <g class="bot-torso">
      <rect x="72" y="226" width="76" height="14" rx="7" fill="#000"/>
      <rect x="58" y="132" width="104" height="94" rx="20" fill="#000"/>
      <path d="M62 150 L80 158 L76 172 L92 182 M160 200 L144 196 L148 184 L136 178 M100 222 L104 212 L118 214 L122 224" stroke="#fff" stroke-width="1.6" fill="none" stroke-linejoin="miter"/>
      <g class="bot-chest">
        <rect x="82" y="150" width="56" height="36" rx="7" fill="#fff"/>
        <text class="bot-screen" x="110" y="175" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="17" font-weight="500" fill="#000">01</text>
      </g>
      <circle class="bot-led" cx="92" cy="202" r="4" fill="#f2a93b"/>
      <circle cx="106" cy="202" r="4" fill="#fff"/>
      <circle cx="120" cy="202" r="4" fill="#fff"/>
    </g>
    <g class="bot-headg">
      <rect x="101" y="122" width="18" height="12" fill="#000"/>
      <g class="bot-antenna">
        <line x1="110" y1="24" x2="110" y2="46" stroke="#000" stroke-width="5" stroke-linecap="round"/>
        <circle class="bot-bulb" cx="110" cy="18" r="7" fill="#f2a93b"/>
      </g>
      <rect x="45" y="68" width="11" height="30" rx="4" fill="#000"/>
      <rect x="164" y="68" width="11" height="30" rx="4" fill="#000"/>
      <rect class="bot-head" x="54" y="44" width="112" height="80" rx="24" fill="#000"/>
      <path d="M70 52 L84 60 L80 70 M150 116 L140 108 L144 98" stroke="#fff" stroke-width="1.6" fill="none" stroke-linejoin="miter"/>
      <rect x="70" y="62" width="80" height="34" rx="14" fill="#1b1f27"/>
      <g class="bot-eyes">
        <circle cx="93" cy="79" r="7.5" fill="#f2a93b"/>
        <circle cx="127" cy="79" r="7.5" fill="#f2a93b"/>
      </g>
      <g class="bot-mouth" fill="#fff">
        <rect x="95" y="104" width="6" height="6" rx="2"/>
        <rect x="107" y="104" width="6" height="6" rx="2"/>
        <rect x="119" y="104" width="6" height="6" rx="2"/>
      </g>
    </g>
    <g class="bot-sparks" fill="none" stroke="#f2a93b" stroke-width="3" stroke-linecap="round">
      <g class="spark sp-hips"><path d="M110 228 m-14 0 h-8 M110 228 m14 0 h8 M110 228 m0 -14 v-8 M110 228 m-10 10 l-6 6 M110 228 m10 10 l6 6"/></g>
      <g class="spark sp-chest"><path d="M110 168 m-34 0 h-8 M110 168 m34 0 h8 M110 168 m-24 -24 l-6 -6 M110 168 m24 -24 l6 -6"/></g>
      <g class="spark sp-arm-l"><path d="M46 142 m-12 0 h-8 M46 142 m0 -12 v-8 M46 142 m-9 -9 l-6 -6"/></g>
      <g class="spark sp-arm-r"><path d="M174 142 m12 0 h8 M174 142 m0 -12 v-8 M174 142 m9 -9 l6 -6"/></g>
      <g class="spark sp-neck"><path d="M110 128 m-16 0 h-8 M110 128 m16 0 h8 M110 128 m-12 -10 l-6 -6 M110 128 m12 -10 l6 -6"/></g>
      <g class="spark sp-antenna"><path d="M110 18 m-12 0 h-7 M110 18 m12 0 h7 M110 18 m0 -12 v-7"/></g>
    </g>
  </g>
</svg>`;

  // ---------- Overlay markup ----------
  const tour = document.createElement("div");
  tour.className = "tour";
  tour.id = "tour";
  tour.hidden = true;
  tour.setAttribute("role", "dialog");
  tour.setAttribute("aria-modal", "true");
  tour.setAttribute("aria-labelledby", "tour-title");
  tour.innerHTML = `
    <canvas class="tour-canvas" aria-hidden="true"></canvas>
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
      <div class="tour-bot" aria-hidden="true">${ROBOT}</div>
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
  const canvas = $(".tour-canvas"), ctx = canvas.getContext("2d");
  const bot = $(".tour-bot"), botSvg = bot.querySelector("svg"), screen = bot.querySelector(".bot-screen");
  const ground = $(".tour-ground"), shadow = $(".tour-shadow"), dust = $(".tour-dust");
  const card = $(".tour-card"), kicker = $(".tc-kicker"), title = $(".tc-title");
  const sayText = $(".tc-say-text"), points = $(".tc-points"), actions = $(".tc-actions");
  const backBtn = $("#tour-back"), nextBtn = $("#tour-next"), skipBtn = $("#tour-skip"), closeBtn = $("#tour-close"), openLink = $("#tour-open");
  const stepBtns = [...tour.querySelectorAll(".tour-steps button")];
  const pageParts = [document.querySelector(".nav"), document.querySelector("main"), document.querySelector(".foot")].filter(Boolean);

  let step = 0, open = false, busy = false, typingToken = 0, lastFocus = null;

  // ---------- Particles ----------
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // where each broken piece of the name sits on screen (its centroid)
  function shardCentroids() {
    const layer = document.querySelector(".name-layer");
    const shards = [...document.querySelectorAll(".name-shard")];
    if (layer && shards.length) {
      const r = layer.getBoundingClientRect();
      return shards.map((s) => {
        const [x, y] = s.style.transformOrigin.split(" ").map(parseFloat);
        return { x: r.left + x, y: r.top + y };
      });
    }
    const n = document.querySelector("h1.name");
    const r = n ? n.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 3, width: 1, height: 1 };
    return Array.from({ length: 24 }, (_, i) => ({ x: r.left + ((i % 8) + 0.5) * r.width / 8, y: r.top + (Math.floor(i / 8) + 0.5) * r.height / 3 }));
  }

  // the particles first gather into a compact block: the robot folded up,
  // like a Transformer before it stands. Coordinates are in the robot's viewBox.
  function blockTargets() {
    const r = botSvg.getBoundingClientRect();
    if (!r.width) return { pts: [], cell: 6 };
    const sx = r.width / 220, sy = r.height / 330;
    const cell = Math.max(4, Math.round(r.height / 70));
    const x0 = 58, x1 = 162, y0 = 178, y1 = 306, round = 18;
    const pts = [];
    for (let y = y0 + cell / sy / 2; y < y1; y += cell / sy) {
      for (let x = x0 + cell / sx / 2; x < x1; x += cell / sx) {
        // rounded corners
        const cx = Math.min(Math.max(x, x0 + round), x1 - round), cy = Math.min(Math.max(y, y0 + round), y1 - round);
        if (Math.hypot(x - cx, y - cy) > round) continue;
        const led = Math.hypot(x - 92, y - 248) < 7 || (y > 214 && y < 230 && Math.abs(x - 110) < 26);
        pts.push({ x: r.left + x * sx, y: r.top + y * sy, c: led ? "#f2a93b" : "#000" });
      }
    }
    return { pts, cell };
  }

  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  // fly particles from `from` points to `to` points; returns when done
  function fly(pairs, cell, ms) {
    return new Promise((resolve) => {
      if (reduceMotion || !pairs.length) return resolve();
      sizeCanvas();
      canvas.classList.add("on");
      const start = performance.now();
      function frame(now) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        let done = true;
        for (const p of pairs) {
          let t = (now - start - p.delay) / ms;
          if (t < 1) done = false;
          t = Math.max(0, Math.min(1, t));
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const u = 1 - e;
          const x = u * u * p.a.x + 2 * u * e * p.k.x + e * e * p.b.x;
          const y = u * u * p.a.y + 2 * u * e * p.k.y + e * e * p.b.y;
          const s = cell * (0.55 + 0.45 * (1 - Math.abs(0.5 - t) * 2) * 0.6 + 0.45 * e);
          ctx.fillStyle = p.c;
          ctx.fillRect(x - s / 2, y - s / 2, s - 1, s - 1);
        }
        if (!done) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function pairUp(froms, tos, toName) {
    const rand = seeded(1509);
    return tos.map((b, i) => {
      const a0 = froms[i % froms.length];
      const jitter = 18;
      const a = { x: a0.x + (rand() - 0.5) * jitter, y: a0.y + (rand() - 0.5) * jitter };
      const from = toName ? b : a, to = toName ? a : b;
      // curve each path through a swirl point so the swarm sweeps instead of sliding
      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
      const bend = (rand() - 0.5) * Math.min(260, len * 0.6);
      return { a: from, b: to, k: { x: mx - (dy / len) * bend, y: my + (dx / len) * bend }, c: b.c || "#000", delay: rand() * 380 };
    });
  }

  // ---------- Layout: robot and card trade sides each chapter ----------
  const isNarrow = () => innerWidth < 900;
  function botX(i) {
    const stage = $(".tour-stage").getBoundingClientRect();
    const w = bot.getBoundingClientRect().width || 200;
    if (isNarrow()) return [0.08, 0.62, 0.3, 0.7, 0.4][i] * (stage.width - w);
    // stand in the middle of whichever half the card leaves free
    const cardW = card.getBoundingClientRect().width || Math.min(620, stage.width * 0.56);
    const gutter = Math.max(16, Math.min(64, stage.width * 0.05));
    const free = stage.width - cardW - gutter;
    return i % 2 === 0 ? free / 2 - w / 2 : cardW + gutter + free / 2 - w / 2;
  }
  function placeCard(i) {
    card.classList.toggle("left", !isNarrow() && i % 2 === 1);
    card.classList.toggle("right", !isNarrow() && i % 2 === 0);
  }

  // position the robot; its shadow stays on the floor and shrinks in the air
  function setPos(x, y = 0) {
    bot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    ground.style.transform = `translateX(${x.toFixed(1)}px)`;
    const lift = Math.min(1, -y / 140);
    shadow.style.transform = `scale(${(1 - lift * 0.5).toFixed(3)})`;
    shadow.style.opacity = (1 - lift * 0.6).toFixed(3);
  }

  function arc(a, b, height, ms) {
    return new Promise((resolve) => {
      const start = performance.now();
      (function frame(now) {
        const t = Math.min(1, (now - start) / ms);
        setPos(a + (b - a) * t, -height * 4 * t * (1 - t));
        if (t < 1) requestAnimationFrame(frame); else resolve();
      })(start);
    });
  }

  function puff() {
    dust.classList.remove("puff");
    void dust.offsetWidth;
    dust.classList.add("puff");
  }

  // grasshopper hops: crouch, spring up in an arc with legs kicked back, land with a squash
  async function hopTo(i) {
    const x = botX(i);
    const cur = parseFloat(bot.dataset.x || x);
    bot.dataset.x = x;
    bot.style.transition = "none";
    if (Math.abs(x - cur) < 2 || reduceMotion) { setPos(x); return; }
    bot.classList.toggle("face-left", x < cur);
    const w = bot.getBoundingClientRect().width || 200;
    const hops = Math.max(1, Math.min(4, Math.round(Math.abs(x - cur) / (w * 0.95))));
    bot.classList.add("hopping");
    for (let k = 0; k < hops; k++) {
      const a = cur + (x - cur) * (k / hops), b = cur + (x - cur) * ((k + 1) / hops);
      bot.classList.add("crouch");
      await wait(150);
      bot.classList.remove("crouch");
      bot.classList.add("air");
      await arc(a, b, Math.min(150, 60 + Math.abs(b - a) * 0.35), 470);
      bot.classList.remove("air");
      bot.classList.add("land");
      puff();
      await wait(140);
      bot.classList.remove("land");
      await wait(60);
    }
    bot.classList.remove("hopping");
  }

  // ---------- Transformer: fold up and unfold, part by part ----------
  const FOLD = [
    ["f-legs", ["sp-hips"]],
    ["f-torso", ["sp-hips"]],
    ["f-chest", ["sp-chest"]],
    ["f-arms", ["sp-arm-l", "sp-arm-r"]],
    ["f-head", ["sp-neck"]],
    ["f-antenna", ["sp-antenna"]],
    ["f-eyes", []]
  ];
  function spark(names) {
    names.forEach((n) => {
      const s = bot.querySelector("." + n);
      if (!s) return;
      s.classList.remove("pop"); void s.getBoundingClientRect(); s.classList.add("pop");
    });
  }
  function folded() {
    bot.classList.add("booting", ...FOLD.map(([c]) => c));
  }
  async function unfold() {
    bot.classList.add("booting");
    screen.textContent = "....";
    for (const [cls, sparks] of FOLD) {
      bot.classList.remove(cls);
      spark(sparks);
      if (cls === "f-chest") screen.textContent = "BOOT";
      if (cls === "f-eyes") { bot.classList.add("power"); screen.textContent = "OK"; }
      await wait(cls === "f-legs" ? 380 : 300);
    }
    await wait(350);
    bot.classList.remove("booting", "power");
  }
  async function fold() {
    bot.classList.add("booting");
    for (const [cls, sparks] of FOLD.slice().reverse()) {
      bot.classList.add(cls);
      spark(sparks);
      await wait(120);
    }
    await wait(250);
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
    card.classList.add("typing");
    if (reduceMotion) { sayText.textContent = text; }
    else {
      for (let n = 1; n <= text.length; n++) {
        if (token !== typingToken) return false;
        sayText.textContent = text.slice(0, n);
        await new Promise((r) => setTimeout(r, text[n - 1] === "," || text[n - 1] === "." ? 90 : 16));
      }
    }
    if (token === typingToken) { bot.classList.remove("talking"); card.classList.remove("typing"); }
    return token === typingToken;
  }

  async function show(i, { walk = true } = {}) {
    if (busy) return;
    busy = true;
    step = i;
    const c = CHAPTERS[i];
    setSteps(i);
    card.classList.add("out");
    if (walk) { await wait(220); await hopTo(i); }
    placeCard(i);
    screen.textContent = String(i + 1).padStart(2, "0");
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
    // then the details appear one by one
    const items = [...points.children];
    for (const li of items) {
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
    const froms = shardCentroids();

    tour.hidden = false;
    document.body.classList.add("touring");
    pageParts.forEach((el) => el.setAttribute("inert", ""));
    bot.classList.remove("ready", "hopping", "crouch", "air", "land", "face-left", "power");
    bot.style.transition = "none";
    folded();
    placeCard(0);
    setSteps(0);
    card.classList.add("out");
    const x = botX(0);
    bot.dataset.x = x;
    setPos(x);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const { pts, cell } = blockTargets();
    document.body.classList.add("name-flying");      // the real name pieces take off
    tour.classList.add("show");                      // the page fades out behind the swarm
    await fly(pairUp(froms, pts, false), cell, 1400);
    bot.classList.add("ready");                      // the folded robot replaces the block
    await wait(260);
    canvas.classList.remove("on");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    await unfold();                                  // and transforms, part by part
    closeBtn.focus({ preventScroll: true });
    busy = false;
    await wait(150);
    show(0, { walk: false });
  }

  async function closeTour() {
    if (!open) return;
    typingToken++;
    busy = true;
    const froms = shardCentroids();
    card.classList.add("out");
    if (!bot.dataset.x) setPos(botX(step));
    await fold();
    const { pts, cell } = blockTargets();
    bot.classList.remove("ready");
    tour.classList.remove("show");
    await fly(pairUp(froms, pts, true), cell, 1000);
    canvas.classList.remove("on");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    document.body.classList.remove("name-flying", "touring");
    pageParts.forEach((el) => el.removeAttribute("inert"));
    tour.hidden = true;
    open = false; busy = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // ---------- Wiring ----------
  trigger.addEventListener("click", openTour);
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
      // keep keyboard focus inside the tour
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
      bot.style.transition = "none";
      const x = botX(step); bot.dataset.x = x;
      setPos(x);
      placeCard(step);
    }, 120);
  });

  window.portfolioTour = { open: openTour, close: closeTour, go, get step() { return step; }, get isOpen() { return open; } };
})();
