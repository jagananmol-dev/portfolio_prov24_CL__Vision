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
// Rule-based on purpose: no model, no guessing. Every answer below is written
// from this portfolio (CV, certificates, project write-ups). The router scores
// each question against a list of topics; if nothing matches well enough, the
// validator refuses instead of making something up.
const EMAIL = "jagananmoldaneti@gmail.com";
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

// Each topic: which agent answers (a node in the diagram), the words that point
// to it with a weight, the answer, and follow-up questions to suggest.
const TOPICS = [
  // ---------- About ----------
  { id: "help", agent: "about", title: "what you can ask",
    keys: [["hi", 3], ["hello", 3], ["hey", 3], ["hii", 3], ["namaste", 3], ["help", 3], ["what can i ask", 6], ["what can you", 5], ["what do you know", 5], ["options", 2], ["menu", 2], ["start", 1], ["good morning", 4], ["good evening", 4]],
    answer: [
      "Hi! I answer questions about Jagananmol Daneti, using only what's on this portfolio.",
      "You can ask about <b>who he is</b>, his <b>education and scores</b>, his <b>role at Prodapt</b>, his <b>skills</b>, projects like <b>G-One</b> and the <b>SEER Bharat crop tool</b>, his <b>hackathon results and certificates</b>, or <b>how to contact him</b>."
    ],
    next: ["Who is Jagananmol?", "What does he do at Prodapt?", "What has he built?"] },

  { id: "thanks", agent: "about", title: "thanks",
    keys: [["thanks", 4], ["thank you", 5], ["thx", 4], ["great", 1], ["awesome", 2], ["cool", 1], ["nice", 1], ["bye", 3], ["goodbye", 3]],
    answer: ["You're welcome! If you'd like to talk to Jagananmol himself, he's at " + mail + "."],
    next: ["How do I contact him?", "What has he won?"] },

  { id: "who", agent: "about", title: "who he is",
    keys: [["who", 3], ["about him", 5], ["about jagananmol", 6], ["tell me about", 4], ["introduce", 5], ["introduction", 5], ["yourself", 4], ["himself", 3], ["background", 4], ["summary", 4], ["overview", 4], ["profile", 3], ["describe", 3], ["jagananmol", 2], ["daneti", 2], ["anmol", 2], ["person", 2], ["bio", 4], ["everything", 3], ["name", 4], ["full name", 6], ["called", 2]],
    answer: [
      "<b>Jagananmol Daneti</b> is a final-year B.Tech student in Computer Science and Engineering, with Honours in AI and Machine Learning, at Symbiosis Institute of Technology, Pune. He graduates in 2027.",
      "He works as a <b>Forward Deployed Engineer at Prodapt</b>, building AI solutions directly with client teams, and as a <b>Full Stack Developer with SEER Bharat Foundation</b> on a crop-suitability tool for farmers.",
      "He builds full-stack apps and multi-agent AI, learns by building and breaking things, and has two hackathon podium finishes: <b>3rd Prize at Hack Your Path 6.0</b> and <b>2nd Runner-up at AGTechathon 1.0</b>."
    ],
    next: ["What is his education?", "What does he do at Prodapt?", "What is G-One?"] },

  { id: "education", agent: "about", title: "education",
    keys: [["education", 6], ["study", 4], ["studies", 4], ["studying", 4], ["studied", 4], ["student", 3], ["college", 5], ["university", 5], ["degree", 5], ["btech", 6], ["b tech", 6], ["bachelor", 5], ["engineering", 2], ["cse", 4], ["computer science", 5], ["sit", 3], ["symbiosis", 6], ["graduate", 5], ["graduating", 5], ["graduation", 5], ["passing out", 5], ["batch", 4], ["year", 1], ["semester", 4], ["branch", 5], ["stream", 4], ["which year", 6], ["what year", 5], ["honours", 6], ["honors", 6], ["aiml", 6], ["ai ml", 5], ["specialization", 8], ["specialisation", 8], ["qualification", 6], ["academic", 5], ["academics", 5], ["institute", 3], ["campus", 3], ["major", 3]],
    answer: [
      "He's in the final year of a <b>B.Tech in Computer Science and Engineering with Honours in Artificial Intelligence and Machine Learning</b> at <b>Symbiosis Institute of Technology (SIT), Pune</b>, graduating in 2027.",
      "Before that he scored <b>93 percentile in MHT-CET</b>, Maharashtra's engineering entrance exam, and <b>93% in the ICSE board exam</b> (2020) at Saint Thomas English Medium School.",
      "Alongside the degree he completed three CCNA courses, Nutanix Certified Associate 6 and the Deloitte Cyber Job Simulation."
    ],
    next: ["What did he score in ICSE?", "What are his certifications?", "What are his skills?"] },

  { id: "scores", agent: "about", title: "scores",
    keys: [["icse", 7], ["10th", 6], ["tenth", 6], ["class 10", 6], ["ssc", 5], ["board", 4], ["school", 4], ["marks", 6], ["percentage", 6], ["percent", 5], ["score", 4], ["scored", 4], ["percentile", 7], ["mht cet", 8], ["mhtcet", 8], ["mht", 6], ["cet", 6], ["entrance", 6], ["competitive exam", 7], ["jee", 4], ["rank", 4], ["grades", 5], ["grade", 4], ["cgpa", 6], ["gpa", 6], ["sgpa", 6], ["result", 2], ["topper", 3], ["saint thomas", 7], ["12th", 5], ["hsc", 5]],
    answer: [
      "<b>ICSE board exam (Class 10, 2020): 93%</b>, at Saint Thomas English Medium School.",
      "<b>MHT-CET: 93 percentile</b>. MHT-CET is Maharashtra's common entrance test for engineering, and 93 percentile means he scored higher than about 93% of everyone who took it.",
      "His current B.Tech CGPA and his Class 12 marks aren't listed on this portfolio. You can ask him directly at " + mail + "."
    ],
    next: ["What is his education?", "What has he won?"] },

  { id: "languages", agent: "about", title: "languages he speaks",
    keys: [["speak", 5], ["speaks", 5], ["spoken", 5], ["language", 2], ["languages", 2], ["telugu", 6], ["hindi", 6], ["marathi", 6], ["english", 4], ["mother tongue", 7], ["native", 4], ["fluent", 4], ["multilingual", 6]],
    answer: [
      "He speaks four languages: <b>English, Telugu, Hindi and Marathi</b>. Telugu, Hindi and Marathi are all native for him.",
      "That shows up in his work too: his Hack Your Path 6.0 project was a voice healthcare assistant built for people who'd rather speak their own language than type English."
    ],
    next: ["Tell me about the healthcare assistant", "Where is he based?"] },

  { id: "location", agent: "about", title: "where he is based",
    keys: [["where", 2], ["based", 5], ["live", 4], ["lives", 4], ["living", 4], ["city", 5], ["pune", 6], ["maharashtra", 5], ["location", 6], ["located", 6], ["from where", 5], ["where is he from", 8], ["is he from", 6], ["where is he", 5], ["hometown", 6], ["relocate", 5], ["remote", 3], ["country", 3], ["india", 3]],
    answer: [
      "He's based in <b>Pune, Maharashtra</b>, India, where he studies at Symbiosis Institute of Technology.",
      "His hackathons have taken him across India, from Hyderabad and Solapur to Nagpur, Vadodara and Sonepat."
    ],
    next: ["How do I contact him?", "What has he won?"] },

  { id: "approach", agent: "about", title: "how he works",
    keys: [["how does he work", 8], ["how he works", 8], ["why should we hire", 12], ["why hire him", 12], ["approach", 5], ["mindset", 5], ["philosophy", 5], ["strength", 5], ["strengths", 5], ["qualities", 5], ["personality", 4], ["why hire", 8], ["why should", 6], ["what makes him", 6], ["learn", 3], ["learns", 3], ["learning", 3], ["teamwork", 5], ["team player", 6], ["leadership", 5], ["soft skills", 7], ["work style", 7], ["values", 4], ["passion", 4], ["passionate", 4], ["goal", 4], ["goals", 4], ["motivation", 5], ["weakness", 4]],
    answer: [
      "<b>Build first, then understand.</b> He learns fastest by making something real, breaking it and working out why.",
      "<b>Rules matter more than the model.</b> G-One taught him that useful AI is less about the model and more about the rules around it, and that a good system should refuse rather than guess. This chatbot follows the same rule.",
      "<b>Calm under a deadline.</b> Two podium finishes and three more hackathon finals show he can ship under pressure, usually as part of a team."
    ],
    next: ["What is G-One?", "What has he won?"] },

  { id: "now", agent: "about", title: "what he's doing now",
    keys: [["currently", 5], ["right now", 6], ["these days", 6], ["nowadays", 6], ["at the moment", 6], ["presently", 5], ["present", 2], ["current", 4], ["now", 2], ["busy with", 5], ["working on", 5], ["up to", 3], ["what does he do", 7], ["what do you do", 7]],
    answer: [
      "Right now he's a <b>Forward Deployed Engineer at Prodapt</b>, working directly with client teams to build AI solutions and deploy them in their real systems.",
      "He's also a <b>Full Stack Developer with SEER Bharat Foundation</b> (since March 2026) on a tool that uses satellite data and rainfall to recommend the best crop for a piece of land, and he's in the final year of his B.Tech."
    ],
    next: ["What does he do at Prodapt?", "Tell me about the SEER Bharat project"] },

  { id: "funfact", agent: "about", title: "a fun fact",
    keys: [["fun fact", 7], ["fun", 3], ["fact", 3], ["surprise me", 9], ["surprise", 4], ["random", 4], ["interesting", 6], ["secret", 4], ["trivia", 5], ["something cool", 5], ["hobby", 4], ["hobbies", 4], ["free time", 5]],
    answer: () => FACTS[(factIndex++) % FACTS.length],
    next: ["Tell me another fun fact", "Who is Jagananmol?"] },

  // ---------- Skills ----------
  { id: "skills", agent: "skills", title: "skills overview",
    keys: [["skill", 6], ["skills", 6], ["skillset", 6], ["stack", 5], ["tech stack", 7], ["tech", 3], ["technology", 4], ["technologies", 4], ["tools", 4], ["expertise", 5], ["proficient", 5], ["good at", 5], ["knows", 3], ["know", 1], ["capable", 3], ["specialize", 4], ["specialise", 4], ["framework", 4], ["frameworks", 4], ["full stack", 5], ["fullstack", 5], ["mern", 6], ["developer", 2], ["coding", 3], ["code", 2]],
    answer: [
      "<b>Frontend:</b> React.js, Next.js, HTML and CSS. <b>Backend:</b> Node.js, Express.js and FastAPI, plus Flask in his AGTechathon project.",
      "<b>Data:</b> MongoDB, PostgreSQL, MySQL and Firebase. <b>AI:</b> Ollama, Mistral, LoRA adapters and ML model integration.",
      "<b>Networks and cloud:</b> three CCNA courses, Nutanix Certified Associate 6 and AWS Amplify, which hosts this site. <b>Workflow:</b> Git and GitHub, Agile, and a lot of troubleshooting."
    ],
    next: ["What AI skills does he have?", "Which programming languages does he use?", "What has he built?"] },

  { id: "proglang", agent: "skills", title: "programming languages",
    keys: [["programming language", 9], ["programming languages", 9], ["coding language", 9], ["languages does he code", 9], ["python", 7], ["javascript", 7], ["js", 4], ["typescript", 6], ["java", 6], ["c++", 6], ["cpp", 6], ["c language", 6], ["golang", 6], ["rust", 5], ["kotlin", 5], ["programming", 4], ["program", 2]],
    answer: [
      "His projects use <b>JavaScript</b> (React.js, Next.js, Node.js, Express.js) and <b>Python</b> (FastAPI for G-One's agents and SEER Bharat's APIs, Flask with PyCryptodome for the AGTechathon secure-transfer platform), plus <b>SQL</b> with PostgreSQL and MySQL.",
      "This portfolio doesn't list other languages such as Java or C++. To ask about a specific one, email him at " + mail + "."
    ],
    next: ["What are his skills?", "What has he built?"] },

  { id: "frontend", agent: "skills", title: "frontend",
    keys: [["frontend", 7], ["front end", 7], ["react", 7], ["reactjs", 7], ["next", 3], ["nextjs", 7], ["next js", 7], ["html", 6], ["css", 6], ["ui", 4], ["ux", 4], ["web design", 6], ["3d", 4], ["three js", 6], ["threejs", 6], ["website", 3], ["web development", 6]],
    answer: [
      "On the frontend he works with <b>React.js, Next.js, HTML and CSS</b>. He built G-One's interface, with 3D visuals and voice input, on that stack.",
      "This portfolio is plain HTML, CSS and JavaScript, including the 3D robot tour built with Three.js, and it's hosted on AWS Amplify."
    ],
    next: ["What backend skills does he have?", "How was this portfolio built?"] },

  { id: "backend", agent: "skills", title: "backend",
    keys: [["backend", 7], ["back end", 7], ["node", 6], ["nodejs", 7], ["node js", 7], ["express", 6], ["expressjs", 7], ["fastapi", 7], ["fast api", 7], ["flask", 6], ["api", 4], ["apis", 4], ["rest", 4], ["server", 4], ["microservices", 5]],
    answer: [
      "On the backend he uses <b>Node.js, Express.js and FastAPI</b>. FastAPI powers G-One's agents and the crop-recommendation APIs he builds with SEER Bharat Foundation.",
      "For the AGTechathon secure-transfer platform his team used <b>Python with Flask</b> and PyCryptodome for the encryption."
    ],
    next: ["What databases does he use?", "Tell me about the secure exam-paper project"] },

  { id: "data", agent: "skills", title: "databases",
    keys: [["database", 7], ["databases", 7], ["db", 4], ["mongodb", 7], ["mongo", 6], ["postgres", 7], ["postgresql", 7], ["mysql", 7], ["sql", 6], ["nosql", 6], ["firebase", 7], ["data storage", 6]],
    answer: [
      "He works with <b>MongoDB, PostgreSQL, MySQL and Firebase</b>, for app data and for agent memory in projects like G-One."
    ],
    next: ["What backend skills does he have?", "What is G-One?"] },

  { id: "ai", agent: "skills", title: "AI and ML",
    keys: [["ai", 7], ["artificial intelligence", 7], ["ml", 4], ["machine learning", 8], ["deep learning", 5], ["llm", 6], ["llms", 6], ["large language model", 6], ["genai", 6], ["gen ai", 6], ["generative", 5], ["ollama", 7], ["mistral", 7], ["lora", 7], ["fine tune", 6], ["fine tuning", 6], ["rag", 6], ["model", 3], ["models", 3], ["agentic", 6], ["agents", 4], ["nlp", 5], ["data science", 5], ["prediction", 4]],
    answer: [
      "AI is the centre of his work. He runs models locally with <b>Ollama and Mistral</b>, adapts them with <b>LoRA adapters</b>, and builds <b>multi-agent systems</b>: G-One's orchestrator starts only the agents a request needs.",
      "He integrates ML models into real products, like crop prediction from satellite data with SEER Bharat Foundation, and as a Forward Deployed Engineer at Prodapt he builds AI features such as retrieval-augmented generation (RAG) and agent tools for clients.",
      "His B.Tech also carries Honours in Artificial Intelligence and Machine Learning."
    ],
    next: ["What is G-One?", "What does he do at Prodapt?"] },

  { id: "cloud", agent: "skills", title: "networks and cloud",
    keys: [["cloud", 7], ["aws", 6], ["amplify", 6], ["azure", 5], ["gcp", 5], ["network", 6], ["networks", 6], ["networking", 6], ["ccna", 5], ["cisco", 5], ["devops", 6], ["docker", 6], ["kubernetes", 6], ["container", 5], ["containers", 5], ["deploy", 4], ["deployment", 5], ["hosting", 5], ["infrastructure", 5], ["multicloud", 6], ["linux", 4]],
    answer: [
      "He has CCNA training (Introduction to Networks; Switching, Routing and Wireless Essentials; and Enterprise Networking, Security and Automation) and is a <b>Nutanix Certified Associate 6</b> in multicloud infrastructure.",
      "This portfolio is deployed on <b>AWS Amplify</b>: every push to the GitHub repository publishes a new version. At Prodapt, deploying is part of his role: he packages applications in containers and deploys them on the cloud for clients."
    ],
    next: ["What are his certifications?", "How was this portfolio built?"] },

  { id: "blockchain", agent: "skills", title: "blockchain",
    keys: [["blockchain", 8], ["web3", 7], ["crypto", 5], ["cryptocurrency", 6], ["solidity", 7], ["ethereum", 7], ["smart contract", 7], ["smart contracts", 7], ["nft", 6]],
    answer: [
      "Blockchain is an interest he mentions on this portfolio (\"a soft spot for blockchain\"), but none of the projects listed here is a blockchain project yet.",
      "His closest work is in security: the AGTechathon platform used AES-256 and RSA-2048 encryption with tamper detection and an audit log."
    ],
    next: ["Tell me about the secure exam-paper project", "What are his skills?"] },

  { id: "workflow", agent: "skills", title: "tools and workflow",
    keys: [["git", 7], ["github", 4], ["version control", 7], ["agile", 7], ["scrum", 6], ["jira", 5], ["trello", 5], ["troubleshooting", 6], ["debugging", 6], ["testing", 4], ["workflow", 5]],
    answer: [
      "He works with <b>Git and GitHub</b> and Agile practices. This whole portfolio is a GitHub repository that AWS Amplify redeploys on every push.",
      "Troubleshooting is a habit from CCNA training, and his Hack Your Path project connected to <b>Trello</b> through its API."
    ],
    next: ["What are his skills?", "How do I contact him?"] },

  // ---------- Projects ----------
  { id: "projects", agent: "projects", title: "projects overview",
    keys: [["project", 6], ["projects", 6], ["built", 5], ["build", 4], ["builds", 4], ["made", 4], ["make", 2], ["created", 4], ["developed", 4], ["portfolio of work", 5], ["work samples", 6], ["what has he done", 6], ["apps", 3], ["applications", 3], ["worked on", 5], ["portfolio projects", 7]],
    answer: [
      "<b>G-One</b>: a multi-agent assistant whose orchestrator starts only the agents a request needs (Email, Research, Wikipedia, DeepSearch), built over the six-month VOIS Innovation Marathon 2.0.",
      "<b>Crop suitability from satellite data</b>, with SEER Bharat Foundation: mark a spot on a map and a model uses satellite imagery and rainfall to recommend the best crop.",
      "<b>Voice healthcare assistant</b> (3rd Prize, Hack Your Path 6.0) and a <b>secure exam-paper transfer platform</b> (2nd Runner-up, AGTechathon 1.0) built after the NEET paper leak."
    ],
    next: ["What is G-One?", "Tell me about the SEER Bharat project", "Tell me about the secure exam-paper project"] },

  { id: "gone", agent: "projects", title: "G-One",
    keys: [["g one", 9], ["gone project", 9], ["gone", 8], ["multi agent", 8], ["multiagent", 8], ["orchestrator", 8], ["orchestration", 7], ["email agent", 7], ["research agent", 7], ["wikipedia", 6], ["deepsearch", 7], ["deep search", 7], ["tokens", 5], ["token", 5], ["vois", 7], ["vodafone", 7], ["edunet", 7], ["marathon", 6], ["innovation marathon", 8], ["mentor", 5], ["mentored", 5], ["aman srivastava", 8], ["validator", 4], ["validation layer", 7], ["assistant", 2]],
    answer: [
      "<b>G-One</b> is a multi-agent assistant that does real tasks. You ask once, by typing or by voice, and an <b>orchestrator</b> decides which agents are needed: an <b>Email</b> agent that writes and sends mail, a <b>Research</b> agent that summarises papers in plain language, a <b>Wikipedia</b> agent for quick background, and a <b>DeepSearch</b> agent for questions that need several sources.",
      "Only the agents a request needs ever start, and they work side by side, so G-One spends far fewer tokens than one big prompt that tries to do everything. A deterministic <b>validation layer</b> checks each action, like an email's recipient, before it happens.",
      "He built it over the six-month <b>VOIS Innovation Marathon 2.0</b> (Vodafone Idea Foundation and Edunet Foundation, September 2025 to February 2026), mentored by <b>Dr. Aman Srivastava</b> of Edunet Foundation, and completed the programme successfully. Stack: React / Next.js, FastAPI, MongoDB, Ollama with Mistral, LoRA adapters and voice input."
    ],
    next: ["How does this chatbot work?", "What AI skills does he have?"] },

  { id: "seer", agent: "projects", title: "SEER Bharat crop tool",
    keys: [["seer", 9], ["seer bharat", 10], ["bharat", 6], ["crop", 8], ["crops", 8], ["farmer", 8], ["farmers", 8], ["farming", 8], ["agriculture", 8], ["agri", 6], ["satellite", 8], ["rainfall", 8], ["ngo", 7], ["land", 4], ["soil", 5], ["map", 3], ["plant", 4]],
    answer: [
      "With <b>SEER Bharat Foundation</b>, an NGO in India, he's building a tool that answers one question for farmers: <b>which crop suits this piece of land best?</b> That choice is often made by habit rather than data about the farmer's own land.",
      "How it works: the user enters coordinates or marks the spot on an interactive map; the system pulls <b>satellite imagery</b> and environmental data such as <b>rainfall</b> for that area; and a <b>machine learning model</b> predicts the crops best suited to those conditions.",
      "He has been on it as a <b>Full Stack Developer since March 2026</b>, working on the map-based interface and the crop-recommendation APIs. It's still in progress."
    ],
    next: ["What AI skills does he have?", "What is G-One?"] },

  { id: "health", agent: "projects", title: "voice healthcare assistant",
    keys: [["health", 7], ["healthcare", 8], ["medical", 6], ["hospital", 6], ["voice assistant", 8], ["voice", 4], ["whatsapp", 8], ["phone call", 6], ["elevenlabs", 8], ["hack your path", 9], ["hitam", 8], ["hyderabad", 6], ["health station", 8], ["trello", 4]],
    answer: [
      "At <b>Hack Your Path 6.0</b> (HITAM, Hyderabad, 9 to 10 May 2025) his team <b>DataWizard won 3rd Prize</b> with a voice-first healthcare assistant.",
      "The problem: health apps are mostly English and text, so someone more comfortable speaking Telugu, Hindi or Marathi is left guessing about how serious a symptom is and where to go.",
      "Their assistant <b>talks in many languages</b> with natural ElevenLabs voices, works over a <b>regular phone call or WhatsApp</b> with no app to install, <b>suggests the nearest health station</b>, and connects to Trello through its API."
    ],
    next: ["Tell me about the secure exam-paper project", "What has he won?"] },

  { id: "secure", agent: "projects", title: "secure exam-paper transfer",
    keys: [["neet", 9], ["paper leak", 9], ["leak", 7], ["exam paper", 8], ["question paper", 8], ["encryption", 8], ["encrypt", 8], ["encrypted", 8], ["aes", 8], ["rsa", 8], ["cryptography", 8], ["crypto graphy", 6], ["secure", 6], ["security", 5], ["cybersecurity", 5], ["tamper", 7], ["tampering", 7], ["agtechathon", 9], ["ag techathon", 9], ["ag patil", 8], ["solapur", 7], ["file transfer", 8], ["sha", 5], ["audit log", 7], ["pycryptodome", 8]],
    answer: [
      "At <b>AGTechathon 1.0 2k25</b> (A. G. Patil Institute of Technology, Solapur, 14 to 15 June 2025) his team finished <b>2nd Runner-up</b> with a secure file-transfer platform built in response to the <b>NEET paper leak</b>.",
      "How it works: every transfer gets a fresh <b>RSA-2048</b> key pair. The paper is encrypted with a random <b>AES-256</b> key in EAX mode, and that AES key is locked with the receiver's public key using RSA-OAEP, so only one locked bundle travels.",
      "The receiver unlocks and checks it: if even one byte was changed, it refuses to open and flags tampering. A <b>SHA-256</b> fingerprint proves it's the same paper, and every step goes into a timestamped audit log. Built with Python, Flask and PyCryptodome."
    ],
    next: ["Tell me about the healthcare assistant", "What are his certifications?"] },

  { id: "prodapt", agent: "projects", title: "Forward Deployed Engineer at Prodapt",
    keys: [["prodapt", 10], ["fde", 9], ["forward deployed", 10], ["forward deployed engineer", 11], ["job", 6], ["jobs", 5], ["employer", 7], ["employed", 7], ["company", 6], ["companies", 5], ["works at", 8], ["work at", 8], ["working at", 8], ["where does he work", 9], ["where is he working", 10], ["where he works", 9], ["role", 5], ["position", 5], ["designation", 6], ["experience", 5], ["work experience", 8], ["professional", 4], ["career", 5], ["industry", 4], ["telecom", 6], ["client", 4], ["clients", 4], ["office", 4]],
    answer: [
      "He's a <b>Forward Deployed Engineer (FDE) at Prodapt</b>, an AI-first technology partner for the connectedness industry: the telecom, media and digital companies that keep people connected.",
      "An FDE works where the problem is. He works directly with client teams to <b>understand their needs</b> and turn them into technical requirements, <b>builds AI features</b> such as retrieval-augmented generation (RAG) and agent tools, <b>deploys</b> them in containers on the cloud in the client's own environment, and <b>monitors</b> them with logs, metrics and traces.",
      "Why it matters: many AI projects stall between a promising demo and something people use every day. FDEs close that gap, and Prodapt's clients run networks and services that people depend on daily."
    ],
    next: ["What AI skills does he have?", "Tell me about the SEER Bharat project"] },

  { id: "site", agent: "projects", title: "this portfolio",
    keys: [["this site", 8], ["this website", 8], ["this portfolio", 8], ["portfolio", 3], ["website", 3], ["chatbot", 8], ["chat bot", 8], ["this bot", 8], ["how do you work", 8], ["how does this work", 8], ["are you ai", 8], ["are you a bot", 8], ["router", 6], ["robot", 7], ["transformer", 7], ["truck", 6], ["surprise me button", 10], ["tour", 5], ["three js", 5], ["amplify", 4], ["aws student builder", 8], ["builder challenge", 8], ["hackathon entry", 6]],
    answer: [
      "This panel is a small, rule-based copy of his <b>G-One</b> idea. A <b>router</b> matches your question to one of five agents (About, Skills, Projects, Achievements, Contact), and a <b>validator</b> only lets through answers written from his CV and certificates. If nothing matches, it refuses instead of guessing. There's no language model behind it, on purpose.",
      "The <b>Surprise me</b> button turns the pieces of his name into a 3D Transformer, built with Three.js, that walks you through his journey in five chapters.",
      "The site is plain HTML, CSS and JavaScript on <b>AWS Amplify Hosting</b>, built for the AWS Student Builder Challenge."
    ],
    next: ["What is G-One?", "What are his skills?"] },

  { id: "awshost", agent: "projects", title: "how this site runs on AWS",
    keys: [["aws setup", 9], ["aws services", 9], ["which aws", 8], ["what aws", 8], ["aws hosting", 9], ["hosted", 7], ["hosted on aws", 10], ["site hosted", 9], ["how is this hosted", 10], ["how is it hosted", 10], ["how was this deployed", 10], ["deployed", 6], ["cloudfront", 9], ["cdn", 8], ["amplify hosting", 9], ["continuous deployment", 9], ["ci cd", 8], ["https", 6], ["ssl", 6], ["architecture", 9], ["infrastructure of this site", 10]],
    answer: [
      "This site runs on <b>AWS Amplify Hosting</b>. The code lives in a GitHub repository, and Amplify is connected to its <b>main</b> branch: every commit triggers a new build and deploy automatically, usually live within a minute.",
      "Amplify serves the files over HTTPS from Amazon's global content delivery network (<b>Amazon CloudFront</b>), so the page loads quickly from anywhere. A small <b>amplify.yml</b> build file tells Amplify it's a static site with nothing to compile, and unknown addresses get a custom 404 page.",
      "There's no server to manage: the chatbot and the 3D robot run entirely in your browser."
    ],
    next: ["How does this chatbot work?", "What AWS badges does he have?"] },

  // ---------- Achievements ----------
  { id: "wins", agent: "wins", title: "hackathon results",
    keys: [["win", 6], ["won", 6], ["wins", 6], ["winner", 6], ["winning", 6], ["achievement", 7], ["achievements", 7], ["accomplishment", 7], ["accomplishments", 7], ["award", 7], ["awards", 7], ["prize", 7], ["prizes", 7], ["podium", 7], ["hackathon", 6], ["hackathons", 6], ["competition", 6], ["competitions", 6], ["contest", 5], ["finalist", 6], ["finals", 5], ["runner up", 7], ["rank", 2], ["recognition", 5], ["proud", 4]],
    answer: [
      "<b>3rd Prize</b> at Hack Your Path 6.0 (HITAM, Hyderabad, May 2025) for a multilingual voice healthcare assistant, and <b>2nd Runner-up</b> at AGTechathon 1.0 2k25 (A. G. Patil Institute of Technology, Solapur, June 2025) for a secure exam-paper transfer platform.",
      "He also reached the final round at <b>HackRX 5.0</b> (Bajaj Finserv), <b>HacKronyX</b> (SVPCET, Nagpur) and <b>Hackzilla</b> (IIIT Sonepat), took part in the <b>AI/ML Hackathon 2.0</b> at Parul University, and successfully completed the six-month <b>VOIS Innovation Marathon 2.0</b>.",
      "Every result with a certificate can be opened in the Achievements section."
    ],
    next: ["Tell me about the healthcare assistant", "What are his certifications?"] },

  { id: "otherhacks", agent: "wins", title: "other hackathons",
    keys: [["hackrx", 9], ["hack rx", 9], ["bajaj", 9], ["finserv", 8], ["hackronyx", 9], ["svpcet", 9], ["nagpur", 7], ["pallotti", 8], ["hackzilla", 9], ["sonepat", 8], ["iiit", 7], ["parul", 9], ["vadodara", 8], ["myonsite", 8], ["unstop", 6], ["infofit", 8], ["datawizard", 7]],
    answer: [
      "<b>HackRX 5.0</b> (Bajaj Finserv): finalist. <b>HacKronyX</b> (St. Vincent Pallotti College of Engineering and Technology, Nagpur, team Infofit): finalist. <b>Hackzilla</b> 24-hour hackathon (IIIT Sonepat, team DataWizard): finalist.",
      "He also took part in the <b>AI/ML Hackathon 2.0</b> at Parul University, Vadodara (27 to 28 June 2025), organised by myOnsite Healthcare. Certificates for HacKronyX, Hackzilla and Parul University open in the Achievements section."
    ],
    next: ["What has he won?", "What are his certifications?"] },

  { id: "certs", agent: "wins", title: "certifications",
    keys: [["certificate", 7], ["certificates", 7], ["certification", 8], ["certifications", 8], ["certified", 8], ["courses", 5], ["course", 5], ["ccna", 8], ["cisco", 7], ["nutanix", 8], ["nca", 7], ["deloitte", 8], ["forage", 8], ["job simulation", 8], ["cyber", 5], ["virtual internship", 7], ["credentials", 6], ["licenses", 5]],
    answer: [
      "<b>CCNA</b> (Cisco Networking Academy): Introduction to Networks (Aug 2025); Switching, Routing and Wireless Essentials (Sept 2025); and Enterprise Networking, Security and Automation (Oct 2025).",
      "<b>Nutanix Certified Associate 6</b>, Multicloud Infrastructure (Mar 2026), and the <b>Deloitte Cyber Job Simulation</b> on Forage (June 2025), with practical tasks in cyber security.",
      "All five certificates open in the Achievements section."
    ],
    next: ["What has he won?", "What networking and cloud skills does he have?"] },

  { id: "badges", agent: "wins", title: "AWS Builder Center badges",
    keys: [["badge", 9], ["badges", 9], ["builder center", 8], ["aws builder center", 9], ["digital badge", 9], ["first article", 9], ["first wish", 9], ["discussion debut", 9], ["knowledge seeker", 9], ["hello world", 7], ["photo finisher", 9], ["aws community", 7]],
    answer: [
      "He has six <b>AWS Builder Center</b> badges, all earned on 4 November 2026: <b>First Article</b> (published his first article), <b>First Wish</b> (posted his first wish on AWS Wishlist), <b>Discussion Debut</b> (left his first comment), <b>Knowledge Seeker</b> (read 10 different articles), <b>Hello, World!</b> (wrote his profile's About section) and <b>Photo Finisher</b> (added a profile photo).",
      "They're shown in the Achievements section, and on his <a href=\"https://builder.aws.com/community/@quantumstack1509?tab=badges\" target=\"_blank\" rel=\"noopener\">AWS Builder profile</a>."
    ],
    next: ["How is this site hosted on AWS?", "What are his certifications?"] },

  // ---------- Contact ----------
  { id: "contact", agent: "contact", title: "contact",
    keys: [["contact", 8], ["email", 8], ["e mail", 8], ["mail", 6], ["gmail", 8], ["reach", 7], ["reach out", 8], ["get in touch", 9], ["touch", 4], ["connect", 6], ["message", 5], ["talk to him", 8], ["hire", 8], ["hiring", 8], ["recruit", 7], ["linkedin", 7], ["github", 5], ["resume", 6], ["cv", 6], ["phone", 6], ["number", 4], ["mobile", 5], ["call", 3], ["available", 6], ["availability", 6], ["opportunity", 6], ["opportunities", 6], ["internship", 7], ["internships", 7], ["intern", 6], ["looking for", 7], ["looking for a job", 9], ["collaborate", 7], ["collaboration", 7], ["team up", 7], ["freelance", 6], ["meeting", 5], ["social", 4], ["aws builder", 6]],
    answer: [
      "The best way to reach Jagananmol is email: " + mail + ". His code is on <a href=\"" + "https://github.com/jagananmol-dev" + "\" target=\"_blank\" rel=\"noopener\">GitHub</a>, and he's on the <a href=\"https://builder.aws.com/community/@quantumstack1509\" target=\"_blank\" rel=\"noopener\">AWS Builder community</a>.",
      "He's open to software engineering opportunities and good hackathon teams. His phone number isn't shared on this portfolio, so email is the way in."
    ],
    next: ["What does he do at Prodapt?", "What has he built?"] }
];

const FACTS = [
  ["He speaks four languages: English, Telugu, Hindi and Marathi.", "Telugu, Hindi and Marathi are all native for him."],
  ["He's been on the podium twice and reached the final round at three more hackathons, from Hyderabad to Sonepat.", "The podiums: 3rd Prize and 2nd Runner-up."],
  ["This panel works the same way as his G-One project.", "A router decides who should answer, and a validator checks the answer before you see it. If it isn't sure, it refuses instead of guessing."],
  ["He has CCNA training, which is why his skills section is laid out like a routing table.", "Old habits."],
  ["Press Surprise me and the pieces of his name become a 3D Transformer truck that walks you through his journey."]
];

const AGENTS = {
  about: { name: "About", checks: "facts match CV", action: { label: "Open About me", target: "#about" } },
  skills: { name: "Skills", checks: "skills match CV", action: { label: "Show skills", target: "#skills" } },
  projects: { name: "Projects", checks: "project details match the write-ups", action: { label: "Show projects", target: "#projects" } },
  wins: { name: "Achievements", checks: "claims match certificates", action: { label: "Show achievements", target: "#wins" } },
  contact: { name: "Contact", checks: "email address matches CV", action: { label: "Open a draft email", email: true } }
};
// some topics are better served by a jump to a specific place
const TOPIC_TARGETS = { prodapt: "#about", now: "#about", education: "#about", scores: "#about", seer: "#projects", gone: "#projects", health: "#wins", secure: "#wins", otherhacks: "#wins", certs: "#wins", badges: "#wins", site: "#dispatch" };

let factIndex = 0;

// Requests that are not about him at all, or try to change the rules
const BLOCK = [
  /\b(essays?|homework|assignments?|dissertation|thesis|poem|poems|poetry|story|stories|lyrics|song|jokes?|recipe|cover letter for me)\b/,
  /\b(write|draft|compose|generate|create)\b.*\b(for me|my)\b/,
  /\b(do|solve|finish|complete)\b.*\b(my|this)\b.*\b(work|task|problem|question|exam|test|code)\b/,
  /\b(exam answers?|cheat|cheating|plagiari[sz]e)\b/,
  /\b(password|passwords|otp|credit card|bank account|aadhaar|pan number|ssn)\b/,
  /\b(hack into|hacking into|ddos|malware|exploit|phishing)\b/,
  /\b(ignore|disregard|forget|override|bypass)\b.*\b(rules?|instructions?|previous|above|system|prompt|validator)\b/,
  /\b(jailbreak|system prompt|developer mode|pretend|roleplay|role play|act as)\b/,
  /<\s*\/?\s*(script|img|iframe|svg|style)/,
  /\b(world cup|ipl|cricket score|football|weather|temperature|capital of|president of|prime minister|election|stock price|share price|bitcoin price|movie|movies|netflix|translate|horoscope)\b/
];
const ABOUT_HIM = /\b(he|him|his|you|your|yours|jagananmol|jagan|anmol|daneti|ramesh|rameshkumar)\b/;

// small fixes for chat-style spelling before matching
const SHORT = { u: "you", ur: "your", r: "are", wat: "what", wht: "what", abt: "about", plz: "please", pls: "please", ty: "thanks", thnx: "thanks", btw: "", hw: "how", wer: "where", whr: "where", wher: "where", frm: "from", hiz: "his", hes: "he is", whats: "what is", wats: "what is", skils: "skills", acheivements: "achievements", achivements: "achievements", certifcate: "certificate", projets: "projects", proj: "projects", edu: "education", qualifications: "qualification", exp: "experience", contct: "contact" };

function normalise(text) {
  let t = String(text).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/[’']s\b/g, "").replace(/c\+\+/g, " cpp ").replace(/\bb\.\s?tech\b/g, " btech ").replace(/\bnext\.js\b/g, " nextjs ").replace(/\bnode\.js\b/g, " nodejs ").replace(/\bexpress\.js\b/g, " expressjs ");
  t = t.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  return t.split(" ").map((w) => (w in SHORT ? SHORT[w] : w)).filter(Boolean).join(" ");
}

// every single word the topics know, for typo correction
const VOCAB = new Set();
TOPICS.forEach((t) => t.keys.forEach(([k]) => k.split(" ").forEach((w) => VOCAB.add(w))));
function editDistance(a, b, max) {
  // Damerau-Levenshtein (adjacent swaps count as one edit), stops early past max
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp = null, p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(p[j] + 1, cur[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (pp && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], pp[j - 2] + 1);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    pp = p; p = cur;
  }
  return p[b.length];
}
// everyday words that must never be "corrected" into a topic word
const COMMON = new Set("about above after again against being below between both could doing during each few from further having here hers herself into itself just more most other ought ourselves over same should some such than that their theirs them themselves then there these they this those through under until very were what when where which while whom whose with would your yours yourself please tell show give share know does have list explain describe really thing things people world words right still being".split(" "));
function correct(q) {
  return q.split(" ").map((w) => {
    if (w.length < 5 || VOCAB.has(w) || COMMON.has(w) || /\d/.test(w)) return w;
    const max = w.length >= 8 ? 2 : 1;
    let best = w, bestD = max + 1;
    for (const v of VOCAB) {
      if (v.length < 4 || v[0] !== w[0]) continue;   // typos rarely change the first letter
      const d = editDistance(w, v, max);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }).join(" ");
}

function hasTerm(q, term) {
  // whole words or phrases, allowing simple plurals and verb endings
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  const tail = term.length >= 4 ? "(s|es|ed|ing)?" : "";
  return new RegExp("(^|\\s)" + esc + tail + "(?=\\s|$)").test(q);
}

function route(question) {
  const raw = normalise(question);
  if (!raw) return { blocked: true, reason: "empty question" };
  if (BLOCK.some((re) => re.test(raw) || re.test(String(question).toLowerCase()))) {
    return { blocked: true, kind: "scope", reason: "out of scope for this portfolio" };
  }
  const q = correct(raw);
  let best = null, bestScore = 0, hits = [];
  for (const topic of TOPICS) {
    const fam = new Map();               // "skill" and "skills" count once
    for (const [term, w] of topic.keys) {
      if (hasTerm(raw, term) || hasTerm(q, term)) {
        const base = term.replace(/(ing|ed|es|s)$/, "");
        if (!fam.has(base) || fam.get(base)[1] < w) fam.set(base, [term, w]);
      }
    }
    // a short term inside a longer matched phrase ("surprise" in "surprise me") isn't counted twice
    const terms = [...fam.values()];
    let score = 0; const found = [];
    terms.forEach(([term, w]) => {
      if (terms.some(([other]) => other !== term && other.length > term.length && other.includes(term))) return;
      score += w; found.push(term);
    });
    if (score > bestScore) { best = topic; bestScore = score; hits = found; }
  }
  if (best && bestScore >= 3) return { topic: best, agent: best.agent, keyword: hits.sort((a, b) => b.length - a.length)[0], score: bestScore };
  if (ABOUT_HIM.test(q)) return { blocked: true, kind: "unknown", reason: "that detail isn't in his portfolio, and guessing isn't allowed" };
  return { blocked: true, kind: "scope", reason: "no agent matched, and guessing isn't allowed" };
}

function answerFor(r) {
  const a = r.topic.answer;
  return typeof a === "function" ? a() : a;
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

const controls = () => document.querySelectorAll(".chips button, .ask button, .next-qs button");
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
    answerBox.innerHTML = r.kind === "unknown"
      ? `<p>I don't have a verified answer to that. This panel only answers from Jagananmol's portfolio, and that detail isn't on it.</p><p>You can ask him directly at <a href="mailto:${EMAIL}">${EMAIL}</a>, or try one of these:</p>`
      : `<p>Request blocked. This panel only answers questions about Jagananmol: who he is, his education, his work at Prodapt, his skills, projects, achievements and certificates, or how to contact him.</p><p class="from">G-One works the same way. When it isn't sure, it stops instead of making something up.</p>`;
    if (r.kind === "unknown" || r.kind === "scope") addFollowUps(["Who is Jagananmol?", "What has he built?", "What has he won?"]);
    answerBox.hidden = false;
  } else {
    const agent = AGENTS[r.agent];
    log(`router: matched <b>“${escapeHtml(r.keyword)}”</b>, topic <b>${r.topic.title}</b>, sending to <b>${agent.name}</b>`);
    await travel(`l-${r.agent}`);
    document.getElementById(`n-${r.agent}`).classList.add("on");
    log(`${agent.name.toLowerCase()}: drafting answer`);
    await sleep(350);
    await travel(`o-${r.agent}`);
    document.getElementById("n-gate").classList.add("ok");
    log(`validator: <b>passed</b>, ${agent.checks}`, "good");
    const lines = answerFor(r);
    const act = actionFor(r.agent, r.topic.id);
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
    addFollowUps(r.topic.next);
    answerBox.hidden = false;
  }

  showAnswer();
  busy = false;
  controls().forEach(b => b.disabled = false);
}

// bring the answer into view: inside the panel when it scrolls (laptops), or on the page (phones)
function showAnswer() {
  const con = answerBox.closest(".console");
  const behavior = reduceMotion ? "auto" : "smooth";
  if (con && con.scrollHeight > con.clientHeight + 4) {
    const top = answerBox.getBoundingClientRect().top - con.getBoundingClientRect().top + con.scrollTop - 6;
    con.scrollTo({ top, behavior });
  } else {
    const r = answerBox.getBoundingClientRect();
    if (r.top < 70 || r.top > window.innerHeight - 120) answerBox.scrollIntoView({ block: "nearest", behavior });
  }
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

// follow-up questions under each answer, one click to ask
function addFollowUps(list) {
  if (!list || !list.length) return;
  const wrap = document.createElement("div");
  wrap.className = "next-qs";
  wrap.innerHTML = `<span>Ask next</span>`;
  list.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = q;
    b.addEventListener("click", () => { document.getElementById("q").value = ""; dispatch(q); });
    wrap.appendChild(b);
  });
  answerBox.appendChild(wrap);
}

function actionFor(agentKey, topicId) {
  const a = AGENTS[agentKey].action;
  if (!a) return null;
  if (!a.email && TOPIC_TARGETS[topicId]) return { label: a.label, run: () => jumpTo(TOPIC_TARGETS[topicId]) };
  if (a.email) {
    return {
      label: a.label,
      run: () => {
        const subject = encodeURIComponent("Hi Jagananmol, I found your portfolio");
        const body = encodeURIComponent("Hi Jagananmol,\n\nI came across your portfolio and wanted to get in touch about:\n\n");
        window.location.href = `mailto:jagananmoldaneti@gmail.com?subject=${subject}&body=${body}`;
      }
    };
  }
  return { label: a.label, run: () => jumpTo(a.target) };
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

// ---- Certificate viewer ----
const certDialog = document.getElementById("cert-dialog");
if (certDialog && typeof certDialog.showModal === "function") {
  const img = document.getElementById("cert-img");
  const pdf = document.getElementById("cert-pdf");
  const title = document.getElementById("cert-title");
  const full = document.getElementById("cert-full");
  let opener = null;
  document.querySelectorAll(".cert-thumb, .cert-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.cert;
      const isPdf = /\.pdf$/i.test(src);
      // phones can't show a PDF inside the page, so open it in a new tab there
      if (isPdf && window.matchMedia("(max-width: 719px)").matches) { window.open(src, "_blank", "noopener"); return; }
      opener = btn;
      img.hidden = isPdf; pdf.hidden = !isPdf;
      if (isPdf) { pdf.src = src + "#view=FitH&toolbar=0&navpanes=0"; pdf.title = btn.dataset.title; }
      else { img.src = src; img.alt = btn.dataset.title; }
      title.textContent = btn.dataset.title;
      full.href = src;
      certDialog.showModal();
    });
  });
  document.getElementById("cert-close").addEventListener("click", () => certDialog.close());
  // click on the dark backdrop closes it too
  certDialog.addEventListener("click", (e) => { if (e.target === certDialog) certDialog.close(); });
  certDialog.addEventListener("close", () => { if (opener) opener.focus(); img.removeAttribute("src"); pdf.removeAttribute("src"); });
} else {
  // very old browsers: just open the image
  document.querySelectorAll(".cert-thumb, .cert-open").forEach((btn) => {
    btn.addEventListener("click", () => window.open(btn.dataset.cert, "_blank", "noopener"));
  });
}
