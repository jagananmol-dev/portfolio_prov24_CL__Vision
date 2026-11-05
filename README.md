# Jagananmol Daneti: a portfolio you can ask questions

My entry for the AWS Student Builder Challenge: Build Your Tech Superpower.

- Live site: https://main.dxr78ekpgci7i.amplifyapp.com
- Repository: https://github.com/jagananmol-dev/portfolio_prov24_CL__Vision

## The creative feature

The first thing on the page is a small panel called **Ask my portfolio**. You pick a question (or type or say your own), and a packet travels across a diagram: from you, to a router, to the section of the portfolio that can answer it (About, Skills, Projects, Achievements or Contact), and through a validator before the answer comes back. A trace log underneath shows each step as it happens.

Behind the router are 32 topics, each with a detailed answer written from my CV, certificates and project write-ups: who I am, education and scores, my role as a Forward Deployed Engineer at Prodapt, each skill area, G-One, the SEER Bharat crop tool, both podium projects, every hackathon, certificate and AWS Builder Center badge, how this site runs on AWS, and how to contact me. It understands different phrasings and fixes typos ("wat r his skils", "mechine lerning"), and every answer ends with follow-up questions you can click.

It only answers questions about me. Requests like essays, homework or "ignore your rules" are blocked, general-knowledge questions are refused, and a question about me that the portfolio doesn't cover (like my age) gets an honest "that isn't on my portfolio" with my email, never a made-up answer.

Then the agent does something about it. Like G-One, it doesn't act until you approve: a button appears, and clicking it lets the agent take the action. Contact opens a draft email to me, and every other section scrolls you to the matching part of the page and highlights it. Every step shows up in the trace, including "waiting for your OK" and "approved".

You can also speak your question, because G-One takes voice commands too. The mic button uses the browser's built-in speech recognition and only appears in browsers that support it.

It's a small, rule-based copy of G-One, the multi-agent assistant I built over the six-month VOIS Innovation Marathon 2.0, mentored by Dr. Aman Srivastava of Edunet Foundation. I completed the program successfully. G-One's main idea is that an AI system should refuse rather than guess, so the portfolio does the same thing. There's no model behind it on purpose. Every answer comes from my CV, and anything that doesn't match a rule gets blocked.

What visitors can do:
- Click one of five example questions, or a follow-up under any answer
- Type or say their own question and watch which agent it gets routed to
- Approve the agent's action: draft an email, jump to a project, open achievements
- Ask "surprise me" or "tell me a fun fact" more than once to get different facts

I tested the router with 361 questions: 245 written while building it, 96 new phrasings written afterwards to check it generalises, and 20 more for the badges and AWS topics. They include typos, chat-speak, ALL CAPS, emoji, empty and 5,000-character input, Hindi script, script injection, "ignore your rules" attempts and general-knowledge questions. All 361 land on the right topic, get blocked, or get the honest "not on my portfolio" reply.

How visitors find it: it sits right next to my name in the hero, with the heading "Ask my portfolio" and a one-line instruction.

### Surprise me: the robot tour

Under the panel sits a **Surprise me** button with four blinking arrows pointing at it, and a second, smaller Surprise me button sits in the navigation bar, so the tour can be started from anywhere on the page. Click either and the page fades away while every hexagonal piece of my cracked name flies out from its centroid, spinning, and locks into place as one tile of a robot. The robot is built from the name's actual pieces, at exactly the same size and shape, with the same 1.5px cracks between them: 43 pieces make 43 tiles. Its eyes then flicker on, and it walks you through my journey in five chapters that match the site's sections: About, Skills, Projects, Achievements and Contact. Between chapters it walks across the screen, swinging its legs from the hips and its arms the opposite way, with dust at each step. Each chapter's details appear one by one.

In browsers with WebGL, the robot is a **3D Transformer** built with Three.js. The name's pieces fly in and build a cab-over truck: the chest is the cab, with the windows as the windshield, side windows and mirrors, a sun visor, headlights in chrome bezels, a chrome grille and bumper, roof lights, air horns and two exhaust stacks. The legs lie flat behind it as the chassis, with chrome fuel tanks, tandem rear axles and tail lights, and the arms stand upright behind the cab. The truck rolls in with its headlights flashing and transforms in seven stages, each named in a caption with a progress bar: the chassis lifts and the legs swing down, the hips lock and a rear wheel tucks behind each calf, the front wheels rise into the shoulders, the arms swing out from behind the cab, the wrists unfold and the fists open into hands with four jointed fingers and a thumb, the head rises out of the cab, and the antennas come up. The armour plates have rounded, bevelled edges, in clear-coated graphite with a deep amber livery, and the shoulder plates become the truck's front fenders. The materials reflect a small virtual photo studio (softboxes and an amber strip light baked into an environment map), with filmic tone mapping, brushed-metal joints, chrome wheels with treaded tyres and lug nuts, hydraulic pistons at the knees and elbows that slide as the joints bend, and glowing eyes that blink. Phones get a lighter setup (fewer pixels, a smaller shadow map) so it stays smooth. Nothing shrinks or disappears: every part moves into its place, and the wheels sit on the floor in truck mode and clear of it in robot mode. It turns sideways to walk between chapters, its fingers curl loosely as it walks and open when it waves, its visor flickers while it talks, and its chest screen shows the chapter number. On Close it runs the same seven stages in reverse back into a truck, and the pieces fly home into my name. If WebGL isn't available or Three.js can't load, the flat tile robot runs instead.

The name itself is split into identical hexagonal pieces. Every crack follows the same jagged profile, which keeps all pieces exactly the same size, and every crack line is a fixed 1.5px.

On laptops and desktops the whole front page, with my name, the panel and the Surprise me button, fits in one screen.

- **Skip section** jumps to the next chapter, and **Close** (or Esc) sends the robot back into my name.
- The chapter bar at the top lets you jump to any chapter, and the arrow keys move back and forward.
- It respects "reduce motion", traps keyboard focus while open, and works on phones.

## Portfolio sections

| Required section | Where it lives |
|---|---|
| About Me | About me (#about): four headline stats (93% ICSE, 93 percentile MHT-CET, B.Tech CSE with Honours in AI and ML, graduating 2027) that count up, and an explorer with four tabs: Who I am, Education (a timeline), How I work and Right now (my role as a Forward Deployed Engineer at Prodapt, SEER Bharat and my final year). Use the mouse or the arrow keys |
| Skills | Tech superpowers (#skills), laid out as a routing table, since I trained on CCNA |
| Projects / Achievements | Projects (#projects) and Achievements (#wins): G-One, SEER Bharat crop suitability from satellite data, 2 hackathon podium finishes (with certificates you can open), 3 more hackathon finals, 5 certifications, each with a certificate you can open, and my 6 AWS Builder Center badges |

The site works on phones too. Below 720px the navigation collapses into a menu, the diagram scales down, the skills table turns into cards, the About tabs become a 2 x 2 grid, and nothing scrolls sideways.

## AWS services used

- **AWS Amplify Hosting** hosts the site.
- **Deployment:** Amplify is connected to this GitHub repository on the main branch, so every push to main publishes a new version.
- **Build:** none needed. It's plain HTML, CSS and JavaScript. `amplify.yml` tells Amplify to publish the repo root as it is.
- **Region:** US East (N. Virginia), us-east-1.
- **Rewrites and redirects:** one rule, `/<*>` → `/404.html` with status 404, so a mistyped link shows my own "no route for this path" page instead of a blank error.
- **Delivery:** Amplify serves the site over HTTPS through its managed CDN, Amazon CloudFront. I didn't set up an S3 bucket or a CloudFront distribution myself; Amplify Hosting manages both.
- **Custom headers:** `customHttp.yml` adds security headers to every response (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and a `Permissions-Policy` that only allows the microphone, for voice questions).
- **Caching:** every CSS and JS file is linked with a version number (`app.js?v=24`), so a new deploy reaches visitors at once instead of waiting for the CDN cache to expire.
- **Search and sharing:** `robots.txt`, `sitemap.xml`, a canonical URL and a link preview image (`og-image.png`).

How a change goes live:

```
edit → commit to GitHub (main) → Amplify webhook → build (amplify.yml: nothing to compile)
     → deploy to Amplify Hosting → served worldwide over HTTPS by Amazon CloudFront
```

The only things loaded from outside AWS are Google Fonts and Three.js (from the cdnjs CDN, fetched only for the robot tour).

## What I learned and the challenges I hit

- **A CDN caches harder than you expect.** After a deploy, some visitors still got the old JavaScript. Adding a version number to every script and stylesheet link fixed it, and now each deploy is live within a minute.
- **Rule-based doesn't mean simple.** "hi" kept matching "his", singular and plural words were counted twice, and fixing typos broke phrases like "machine learning". I ended up matching both the raw and the corrected question, only allowing word endings on longer words, and writing a test bank of 361 questions that I rerun after every change.
- **Saying "I don't know" is a feature.** The hardest part of the chatbot was deciding what it should refuse. Questions about me that the site doesn't cover now get an honest answer and my email instead of a guess, which is the same idea as G-One.
- **3D on phones is a budget.** Making the robot look real (studio reflections, clear-coat paint, pistons) doubled the work per frame, so phones get fewer pixels and a smaller shadow map, and tiny parts skip the shadow pass. If WebGL fails, a flat robot runs instead.
- **Mobile layouts need their own design.** A wide skills table and a sideways-scrolling tab strip looked fine on a laptop but hid content on a phone. Turning the table into cards and the tabs into a 2 x 2 grid fixed both.
- **PDF certificates behave differently on phones.** Most phone browsers won't show a PDF inside a page, so on small screens the certificate opens in its own tab instead.

## Run it locally

Open `index.html` in a browser. There's nothing to install.

To add your links, edit the `LINKS` object at the top of `app.js`.
