# Jagananmol Daneti: a portfolio you can ask questions

My entry for the AWS Student Builder Challenge: Build Your Tech Superpower.

- Live site: https://main.dxr78ekpgci7i.amplifyapp.com
- Repository: https://github.com/jagananmol-dev/portfolio_prov24_CL__Vision

## The creative feature

The first thing on the page is a small panel called **Ask my portfolio**. You pick a question (or type or say your own), and a packet travels across a diagram: from you, to a router, to the section of the portfolio that can answer it (About, Skills, Projects, Achievements or Contact), and through a validator before the answer comes back. A trace log underneath shows each step as it happens.

Behind the router are about 30 topics, each with a detailed answer written from my CV, certificates and project write-ups: who I am, education and scores, my role as a Forward Deployed Engineer at Prodapt, each skill area, G-One, the SEER Bharat crop tool, both podium projects, every hackathon and certificate, and how to contact me. It understands different phrasings and fixes typos ("wat r his skils", "mechine lerning"), and every answer ends with follow-up questions you can click.

It only answers questions about me. Requests like essays, homework or "ignore your rules" are blocked, general-knowledge questions are refused, and a question about me that the portfolio doesn't cover (like my age) gets an honest "that isn't on my portfolio" with my email, never a made-up answer.

Then the agent does something about it. Like G-One, it doesn't act until you approve: a button appears, and clicking it lets the agent take the action. Contact opens a draft email to me, and every other section scrolls you to the matching part of the page and highlights it. Every step shows up in the trace, including "waiting for your OK" and "approved".

You can also speak your question, because G-One takes voice commands too. The mic button uses the browser's built-in speech recognition and only appears in browsers that support it.

It's a small, rule-based copy of G-One, the multi-agent assistant I built over the six-month VOIS Innovation Marathon 2.0, mentored by Dr. Aman Srivastava of Edunet Foundation. I completed the program successfully. G-One's main idea is that an AI system should refuse rather than guess, so the portfolio does the same thing. There's no model behind it on purpose. Every answer comes from my CV, and anything that doesn't match a rule gets blocked.

What visitors can do:
- Click one of five example questions, or a follow-up under any answer
- Type or say their own question and watch which agent it gets routed to
- Approve the agent's action: draft an email, jump to a project, open achievements
- Ask "surprise me" or "tell me a fun fact" more than once to get different facts

I tested the router with 341 questions: 245 written while building it and 96 new phrasings written afterwards to check it generalises. They include typos, chat-speak, ALL CAPS, emoji, empty and 5,000-character input, Hindi script, script injection, "ignore your rules" attempts and general-knowledge questions. All 341 land on the right topic, get blocked, or get the honest "not on my portfolio" reply.

How visitors find it: it sits right next to my name in the hero, with the heading "Ask my portfolio" and a one-line instruction.

### Surprise me: the robot tour

Under the panel sits a **Surprise me** button with four blinking arrows pointing at it, and a second, smaller Surprise me button sits in the navigation bar, so the tour can be started from anywhere on the page. Click either and the page fades away while every hexagonal piece of my cracked name flies out from its centroid, spinning, and locks into place as one tile of a robot. The robot is built from the name's actual pieces, at exactly the same size and shape, with the same 1.5px cracks between them: 43 pieces make 43 tiles. Its eyes then flicker on, and it walks you through my journey in five chapters that match the site's sections: About, Skills, Projects, Achievements and Contact. Between chapters it walks across the screen, swinging its legs from the hips and its arms the opposite way, with dust at each step. Each chapter's details appear one by one.

In browsers with WebGL, the robot is a **3D Transformer** built with Three.js. The name's pieces fly in and build a cab-over truck: the chest is the cab, with the windows as the windshield, side windows and mirrors, a sun visor, headlights in chrome bezels, a chrome grille and bumper, roof lights, air horns and two exhaust stacks. The legs lie flat behind it as the chassis, with chrome fuel tanks, tandem rear axles and tail lights, and the arms stand upright behind the cab. The truck rolls in with its headlights flashing and transforms in seven stages, each named in a caption with a progress bar: the chassis lifts and the legs swing down, the hips lock and a rear wheel tucks behind each calf, the front wheels rise into the shoulders, the arms swing out from behind the cab, the wrists unfold and the fists open into hands with four jointed fingers and a thumb, the head rises out of the cab, and the antennas come up. The armour plates have rounded, bevelled edges. Nothing shrinks or disappears: every part moves into its place, and the wheels sit on the floor in truck mode and clear of it in robot mode. It turns sideways to walk between chapters, its fingers curl loosely as it walks and open when it waves, its visor flickers while it talks, and its chest screen shows the chapter number. On Close it runs the same seven stages in reverse back into a truck, and the pieces fly home into my name. If WebGL isn't available or Three.js can't load, the flat tile robot runs instead.

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
| Projects / Achievements | Projects (#projects) and Achievements (#wins): G-One, SEER Bharat crop suitability from satellite data, 2 hackathon podium finishes (with certificates you can open), 3 more hackathon finals, 5 certifications, each with a certificate you can open |

The site works on phones too. Below 720px the navigation collapses into a menu, the diagram scales down, and nothing scrolls sideways.

## AWS services used

- **AWS Amplify Hosting** hosts the site.
- **Deployment:** Amplify is connected to this GitHub repository on the main branch, so every push to main publishes a new version.
- **Build:** none needed. It's plain HTML, CSS and JavaScript. `amplify.yml` tells Amplify to publish the repo root as it is.
- **Region:** US East (N. Virginia), us-east-1.
- **Rewrites and redirects:** one rule, `/<*>` → `/404.html` with status 404, so a mistyped link shows my own "no route for this path" page instead of a blank error.
- **Delivery:** Amplify serves the site over HTTPS through its managed CDN. I didn't set up an S3 bucket or a CloudFront distribution myself.

The only things loaded from outside AWS are Google Fonts and Three.js (from the cdnjs CDN, fetched only for the robot tour).

## What I learned and the challenges I hit

ADD_YOUR_OWN_NOTES. A few prompts to help:
- The router uses keyword matching, so "who is he" and "about him" both had to land somewhere sensible. How did you decide which agent wins when two match?
- The packet animation follows SVG paths with `getPointAtLength`. Respecting `prefers-reduced-motion` meant skipping the animation entirely, not just making it faster.
- Anything that went wrong while connecting Amplify to GitHub, and how you fixed it.

## Run it locally

Open `index.html` in a browser. There's nothing to install.

To add your links, edit the `LINKS` object at the top of `app.js`.
