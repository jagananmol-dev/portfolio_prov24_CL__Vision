# Jagananmol Daneti: a portfolio you can ask questions

My entry for the AWS Student Builder Challenge: Build Your Tech Superpower.

- Live site: https://main.dxr78ekpgci7i.amplifyapp.com
- Repository: https://github.com/jagananmol-dev/portfolio_prov24_CL__Vision

## The creative feature

The first thing on the page is a small panel called **Ask my portfolio**. You pick a question (or type or say your own), and a packet travels across a diagram: from you, to a router, to the section of the portfolio that can answer it (About, Skills, Projects, Achievements or Contact), and through a validator before the answer comes back. A trace log underneath shows each step as it happens.

Ask something the site isn't built to answer, like "write my essay", and the validator turns red and blocks it instead of making something up.

Then the agent does something about it. Like G-One, it doesn't act until you approve: a button appears, and clicking it lets the agent take the action. Contact opens a draft email to me, and every other section scrolls you to the matching part of the page and highlights it. Every step shows up in the trace, including "waiting for your OK" and "approved".

You can also speak your question, because G-One takes voice commands too. The mic button uses the browser's built-in speech recognition and only appears in browsers that support it.

It's a small, rule-based copy of G-One, the multi-agent assistant I built over the six-month VOIS Innovation Marathon 2.0, mentored by Dr. Aman Srivastava of Edunet Foundation. I completed the program successfully. G-One's main idea is that an AI system should refuse rather than guess, so the portfolio does the same thing. There's no model behind it on purpose. Every answer comes from my CV, and anything that doesn't match a rule gets blocked.

What visitors can do:
- Click one of six example questions, including one that gets blocked on purpose
- Type or say their own question and watch which agent it gets routed to
- Approve the agent's action: draft an email, jump to a project, open achievements
- Press "Surprise me" more than once to get different facts

I tested the router with 46 different questions, including typos, plurals, empty input, script injection and "ignore your rules" attempts. All of them land on the right agent or get blocked.

How visitors find it: it sits right next to my name in the hero, with the heading "Ask my portfolio" and a one-line instruction. The navigation bar also has a highlighted "Ask my portfolio" link that scrolls straight to it.

## Portfolio sections

| Required section | Where it lives |
|---|---|
| About Me | About me (#about) |
| Skills | Tech superpowers (#skills), laid out as a routing table, since I trained on CCNA |
| Projects / Achievements | Projects (#projects) and Achievements (#wins): G-One, SEER Bharat crop suitability from satellite data, 2 hackathon podium finishes (with certificates you can open), 3 more hackathon finals, 5 certifications (4 with certificates you can open) |

The site works on phones too. Below 720px the navigation collapses into a menu, the diagram scales down, and nothing scrolls sideways.

## AWS services used

- **AWS Amplify Hosting** hosts the site.
- **Deployment:** Amplify is connected to this GitHub repository on the main branch, so every push to main publishes a new version.
- **Build:** none needed. It's plain HTML, CSS and JavaScript. `amplify.yml` tells Amplify to publish the repo root as it is.
- **Region:** US East (N. Virginia), us-east-1.
- **Rewrites and redirects:** one rule, `/<*>` → `/404.html` with status 404, so a mistyped link shows my own "no route for this path" page instead of a blank error.
- **Delivery:** Amplify serves the site over HTTPS through its managed CDN. I didn't set up an S3 bucket or a CloudFront distribution myself.

The only thing loaded from outside AWS is Google Fonts.

## What I learned and the challenges I hit

ADD_YOUR_OWN_NOTES. A few prompts to help:
- The router uses keyword matching, so "who is he" and "about him" both had to land somewhere sensible. How did you decide which agent wins when two match?
- The packet animation follows SVG paths with `getPointAtLength`. Respecting `prefers-reduced-motion` meant skipping the animation entirely, not just making it faster.
- Anything that went wrong while connecting Amplify to GitHub, and how you fixed it.

## Run it locally

Open `index.html` in a browser. There's nothing to install.

To add your links, edit the `LINKS` object at the top of `app.js`.
