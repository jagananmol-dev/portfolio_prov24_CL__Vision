// ---- Links: fill these in once, they update every button on the page ----
const LINKS = {
  github: "https://github.com/jagananmol-dev",
  gOneRepo: "",      // e.g. "https://github.com/your-username/g-one"
  linkedin: ""       // e.g. "https://www.linkedin.com/in/your-handle"
};

function wireLink(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url) { el.href = url; }
  else { el.hidden = true; } // no link yet: hide the button rather than show a dead one
}
wireLink("cv-github", LINKS.github);
wireLink("contact-github", LINKS.github);
wireLink("gone-github", LINKS.gOneRepo || LINKS.github);
if (!LINKS.gOneRepo && LINKS.github) document.getElementById("gone-github").textContent = "See my code on GitHub";
wireLink("contact-linkedin", LINKS.linkedin);

// ---- Mobile menu ----
const toggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("nav-links");
toggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") { navLinks.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
});

// ---- Highlight the section you're reading in the nav ----
const sectionLinks = [...document.querySelectorAll('#nav-links a[href^="#"]:not(.nav-try)')];
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((a) => {
        const here = a.getAttribute("href") === "#" + entry.target.id;
        if (here) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sectionLinks.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) spy.observe(target);
  });
}

// ---- The agent router ----
// Rule-based on purpose: no model, no guessing. If nothing matches, the validator blocks it.
const AGENTS = {
  email: {
    name: "Email",
    words: ["contact", "email", "mail", "reach", "hire", "hiring", "linkedin", "github", "talk", "message", "connect", "internship", "available", "open to"],
    answer: [
      "Best way to reach Jagananmol: <a href=\"mailto:jagananmoldaneti@gmail.com\">jagananmoldaneti@gmail.com</a>.",
      "He's looking for software engineering internships and good hackathon teams. His GitHub and LinkedIn are in the <a href=\"#contact\">Contact section</a>."
    ],
    checks: "email address matches CV"
  },
  research: {
    name: "Research",
    words: ["built", "build", "project", "projects", "work", "made", "g-one", "gone", "agent", "plant", "seer", "vois", "vodafone", "edunet", "intern", "experience", "stack", "skill", "tech", "know", "react", "node", "mern", "blockchain", "database"],
    answer: [
      "<b>G-One</b>: a multi-agent assistant with a router, four specialist agents and a validation gate. Top 50 in the VOIS Innovation Marathon 2026.",
      "<b>Plant disease detection</b> for SEER Bharat Foundation: ML model integration, APIs and a farmer-friendly interface.",
      "Day-to-day stack: React, Next.js, Node, Express, FastAPI, MongoDB and PostgreSQL, plus an interest in blockchain and smart contracts. The full list is in <a href=\"#skills\">Tech superpowers</a>."
    ],
    checks: "2 projects checked against CV"
  },
  finance: {
    name: "Finance",
    words: ["cost", "price", "money", "budget", "cheap", "pay", "bill", "spend", "run", "salary", "afford"],
    answer: [
      "Running costs, as close to zero as he can get them.",
      "G-One runs locally on Ollama with Mistral and LoRA adapters, so there's no per-call API bill. This site is static files on AWS Amplify Hosting."
    ],
    checks: "no made-up numbers"
  },
  deep: {
    name: "DeepSearch",
    words: ["win", "won", "winner", "hackathon", "award", "achievement", "certified", "certification", "certificate", "ccna", "nutanix", "surprise", "fun", "fact", "secret", "random", "who", "about", "language", "speak", "education", "study", "studied", "college", "university", "degree", "cgpa", "school"],
    answer: null, // picked at dispatch time
    checks: "claims match certificates"
  }
};

const DEEP_ANSWERS = {
  wins: [
    "Winner of <b>Hack Your Path 6.0</b> and <b>AGTechathon 1.0</b>.",
    "Finalist at HackRX 5.0 (Bajaj Finserv), the Parul University AIML Hackathon, HackronyX and Hackzilla at IIIT Sonepat. Plus Top 50 at the VOIS Innovation Marathon 2026."
  ],
  who: [
    "Jagananmol Daneti is a final-year B.Tech CSE student at Symbiosis Institute of Technology, Pune, graduating in 2027.",
    "He builds full-stack apps and multi-agent AI, and he's usually at a hackathon. Read more in <a href=\"#about\">About me</a>."
  ],
  education: [
    "B.Tech in Computer Science and Engineering at Symbiosis Institute of Technology, Pune, expected June 2027.",
    "Before that: 93 percentile in MHT-CET and 93% in ICSE at Saint Thomas English Medium School (2020)."
  ],
  languages: [
    "He speaks four languages: English, Telugu, Hindi and Marathi.",
    "Telugu, Hindi and Marathi are all native for him."
  ],
  certs: [
    "Three CCNA courses: Introduction to Networks; Switching, Routing and Wireless Essentials; and Enterprise Networking, Security and Automation.",
    "Also Nutanix Certified Associate 6 and the Deloitte cybersecurity virtual internship."
  ],
  facts: [
    ["He speaks four languages: English, Telugu, Hindi and Marathi.", "Telugu, Hindi and Marathi are all native for him."],
    ["He's reached the final round at six hackathons, from Hyderabad to Sonepat.", "Two of them he won."],
    ["The diagram you just used is a simplified copy of G-One's architecture.", "The real one has the same router, the same four agents and the same \"refuse rather than guess\" validator."],
    ["He has CCNA training, which is why his skills section is laid out like a routing table.", "Old habits."]
  ]
};
let factIndex = 0;

const BLOCK_WORDS = ["essay", "homework", "assignment", "password", "hack into", "write my", "do my", "exam answers", "cheat"];

function normalise(text) { return text.toLowerCase().replace(/[^a-z0-9\- ]/g, " "); }

function route(question) {
  const q = normalise(question);
  if (BLOCK_WORDS.some(w => q.includes(w))) return { blocked: true, reason: "out of scope for this portfolio" };
  let best = null, bestScore = 0, hit = "";
  for (const [key, agent] of Object.entries(AGENTS)) {
    for (const w of agent.words) {
      // allow simple plurals and verb endings: internship(s), project(s), win(s), speak(s)
      const re = new RegExp("\\b" + w + "(s|es|ed|ing)?\\b");
      if (re.test(q)) {
        const score = w.length;
        if (score > bestScore) { best = key; bestScore = score; hit = w; }
      }
    }
  }
  if (!best) return { blocked: true, reason: "no agent matched, and guessing isn't allowed" };
  return { agent: best, keyword: hit };
}

function deepAnswer(question) {
  const q = normalise(question);
  if (/\b(certified|certification|certificate|ccna|nutanix)\b/.test(q)) return DEEP_ANSWERS.certs;
  if (/\b(win|wins|won|winner|hackathons?|awards?|achievements?)\b/.test(q)) return DEEP_ANSWERS.wins;
  if (/\b(education|study|studied|college|university|degree|cgpa|school)\b/.test(q)) return DEEP_ANSWERS.education;
  if (/\b(languages?|speaks?)\b/.test(q)) return DEEP_ANSWERS.languages;
  if (/\b(who|about)\b/.test(q)) return DEEP_ANSWERS.who;
  const fact = DEEP_ANSWERS.facts[factIndex % DEEP_ANSWERS.facts.length];
  factIndex++;
  return fact;
}

// ---- Animation helpers ----
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const packet = document.getElementById("packet");
const trace = document.getElementById("trace");
const answerBox = document.getElementById("answer");
const sleep = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));

function travel(pathId) {
  const path = document.getElementById(pathId);
  path.classList.add("on");
  if (reduceMotion) {
    const end = path.getPointAtLength(path.getTotalLength());
    packet.setAttribute("cx", end.x); packet.setAttribute("cy", end.y);
    return Promise.resolve();
  }
  const len = path.getTotalLength();
  const duration = 520;
  return new Promise(resolve => {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = path.getPointAtLength(len * eased);
      packet.setAttribute("cx", p.x); packet.setAttribute("cy", p.y);
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}

function log(html, cls) {
  const li = document.createElement("li");
  if (cls) li.className = cls;
  li.innerHTML = html;
  trace.appendChild(li);
}

function reset() {
  document.querySelectorAll(".graph .on, .graph .blocked").forEach(el => el.classList.remove("on", "blocked"));
  document.getElementById("n-gate").classList.remove("ok", "no");
  packet.setAttribute("cx", 30); packet.setAttribute("cy", 150);
  trace.innerHTML = "";
  answerBox.hidden = true; answerBox.className = "answer"; answerBox.innerHTML = "";
}

const controls = () => document.querySelectorAll(".chips button, .ask button");
let busy = false;

async function dispatch(question) {
  question = question.trim();
  if (!question || busy) return;
  busy = true;
  controls().forEach(b => b.disabled = true);
  reset();

  log(`request: <b>“${escapeHtml(question)}”</b>`);
  await travel("l-in");
  const r = route(question);

  if (r.blocked) {
    log(`router: <b>no safe route</b>`, "bad");
    document.getElementById("l-in").classList.add("blocked");
    await sleep(250);
    document.getElementById("n-gate").classList.add("no");
    log(`validator: <b>blocked</b>, ${r.reason}`, "bad");
    answerBox.classList.add("rejected");
    answerBox.innerHTML = `<p>Request blocked. This portfolio only answers questions about Jagananmol: his projects, wins, skills, costs or how to contact him.</p><p class="from">G-One works the same way. When it isn't sure, it stops instead of making something up.</p>`;
    answerBox.hidden = false;
  } else {
    const agent = AGENTS[r.agent];
    log(`router: matched <b>“${r.keyword}”</b>, sending to <b>${agent.name}</b>`);
    await travel(`l-${r.agent}`);
    document.getElementById(`n-${r.agent}`).classList.add("on");
    log(`${agent.name.toLowerCase()}: drafting answer`);
    await sleep(350);
    await travel(`o-${r.agent}`);
    document.getElementById("n-gate").classList.add("ok");
    log(`validator: <b>passed</b>, ${agent.checks}`, "good");
    const lines = agent.answer || deepAnswer(question);
    const act = actionFor(r.agent, question);
    answerBox.innerHTML = lines.map(l => `<p>${l}</p>`).join("") +
      `<p class="from">Answered by the ${agent.name} agent</p>`;
    if (act) {
      log(`${agent.name.toLowerCase()}: action ready, <b>waiting for your OK</b>`);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn act";
      btn.textContent = act.label;
      btn.addEventListener("click", () => {
        log(`you: <b>approved</b>, running “${act.label}”`, "good");
        act.run();
      });
      answerBox.appendChild(btn);
    }
    answerBox.hidden = false;
  }

  busy = false;
  controls().forEach(b => b.disabled = false);
}

// ---- Agents don't just answer, they act (after you approve, like G-One) ----
function jumpTo(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  el.classList.remove("flash");
  void el.offsetWidth; // restart the highlight
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 2200);
}

function actionFor(agentKey, question) {
  const q = normalise(question);
  if (agentKey === "email") {
    return {
      label: "Open a draft email",
      run: () => {
        const subject = encodeURIComponent("Hi Jagananmol, I found your portfolio");
        const body = encodeURIComponent("Hi Jagananmol,\n\nI came across your portfolio and wanted to get in touch about:\n\n");
        window.location.href = `mailto:jagananmoldaneti@gmail.com?subject=${subject}&body=${body}`;
      }
    };
  }
  if (agentKey === "research") return { label: "Take me to G-One", run: () => jumpTo(".project.feature") };
  if (agentKey === "finance") return { label: "Show me the stack", run: () => jumpTo("#skills") };
  if (/\b(education|study|studied|college|university|degree|cgpa|school|who|about|languages?|speaks?)\b/.test(q)) {
    return { label: "Open About me", run: () => jumpTo("#about") };
  }
  if (/\b(certified|certification|certificate|ccna|nutanix)\b/.test(q)) return { label: "Show certifications", run: () => jumpTo("#wins") };
  if (/\b(win|wins|won|winner|hackathons?|awards?|achievements?)\b/.test(q)) return { label: "Show achievements", run: () => jumpTo("#wins") };
  return null;
}

// ---- Voice input (G-One takes voice commands too). Hidden where the browser can't do it. ----
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = document.getElementById("mic");
if (SpeechRec && micBtn) {
  micBtn.hidden = false;
  const rec = new SpeechRec();
  rec.lang = "en-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  let listening = false;
  micBtn.addEventListener("click", () => {
    if (busy) return;
    if (listening) { rec.stop(); return; }
    try { rec.start(); } catch (e) { /* already started */ }
  });
  rec.addEventListener("start", () => { listening = true; micBtn.classList.add("listening"); micBtn.setAttribute("aria-label", "Stop listening"); });
  rec.addEventListener("end", () => { listening = false; micBtn.classList.remove("listening"); micBtn.setAttribute("aria-label", "Ask with your voice"); });
  rec.addEventListener("result", (e) => {
    const said = e.results[0][0].transcript;
    document.getElementById("q").value = said;
    dispatch(said);
  });
  rec.addEventListener("error", (e) => {
    reset();
    log(`voice: <b>${e.error === "not-allowed" ? "microphone blocked" : "didn't catch that"}</b>, try typing instead`, "bad");
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.querySelectorAll(".chips button").forEach(b => b.addEventListener("click", () => dispatch(b.dataset.q)));
document.getElementById("ask").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("q");
  dispatch(input.value);
  input.value = "";
});
