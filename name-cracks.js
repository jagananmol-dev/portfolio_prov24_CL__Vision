// Shatters the hero name into pieces split by thin white cracks.
// The cracks radiate from two fixed "impact points", so they look the same on
// every visit. Moving the pointer over a piece makes that piece zoom out.
(function () {
  const h1 = document.querySelector("h1.name");
  const base = h1 && h1.querySelector(".name-base");
  if (!base || !window.CSS || !CSS.supports("clip-path", "polygon(0 0, 1px 0, 0 1px)")) return;

  // small seeded random generator, so the crack pattern never changes
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // keep the part of a convex polygon on point a's side of the line between a and b,
  // pulled back by half the crack width so neighbouring pieces leave a thin gap
  function clipHalf(poly, a, b, half) {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = (b.x - a.x) / len, ny = (b.y - a.y) / len;
    const mx = (a.x + b.x) / 2 - nx * half, my = (a.y + b.y) / 2 - ny * half;
    const side = (p) => (p.x - mx) * nx + (p.y - my) * ny; // <= 0 means closer to a
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const sp = side(p), sq = side(q);
      if (sp <= 0) out.push(p);
      if ((sp <= 0) !== (sq <= 0)) {
        const t = sp / (sp - sq);
        out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
      }
    }
    return out;
  }

  // split the box into pieces around each seed (a Voronoi diagram)
  function shatter(w, h, seeds, gap) {
    const box = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    return seeds.map((s, i) => {
      let poly = box;
      for (let j = 0; j < seeds.length && poly.length; j++) if (j !== i) poly = clipHalf(poly, s, seeds[j], gap / 2);
      return poly;
    }).filter((p) => p.length >= 3);
  }

  function makeSeeds(w, h) {
    const rand = rng(1509);
    const count = Math.max(16, Math.min(42, Math.round((w * h) / 2700)));
    // two impact points: through the middle of "Jagananmol" and the end of "Daneti"
    const hits = [{ x: w * 0.36, y: h * 0.27 }, { x: w * 0.6, y: h * 0.74 }];
    const seeds = hits.map((p) => ({ ...p }));
    let guard = 0;
    while (seeds.length < count && guard++ < 4000) {
      let p;
      if (rand() < 0.6) {
        // cluster around an impact point, like real shattered glass
        const c = hits[seeds.length % 2];
        const ang = rand() * Math.PI * 2, rad = Math.pow(rand(), 0.7) * Math.min(w, h) * 0.75;
        p = { x: c.x + Math.cos(ang) * rad * 1.6, y: c.y + Math.sin(ang) * rad };
      } else {
        p = { x: rand() * w, y: rand() * h };
      }
      if (p.x < 0 || p.y < 0 || p.x > w || p.y > h) continue;
      if (seeds.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < Math.min(w, h) * 0.07)) continue;
      seeds.push(p);
    }
    return seeds;
  }

  let layer = null;

  function build() {
    if (layer) layer.remove();
    h1.classList.remove("cracked");
    const w = base.offsetWidth, h = base.offsetHeight;
    if (!w || !h) return;

    layer = document.createElement("div");
    layer.className = "name-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = base.offsetLeft + "px";
    layer.style.top = base.offsetTop + "px";
    layer.style.width = w + "px";
    layer.style.height = h + "px";

    // crack width scales with the font: about 1.6px on desktop, a little thinner on phones
    const fontSize = parseFloat(getComputedStyle(h1).fontSize);
    const gap = Math.max(1.1, Math.min(1.8, fontSize / 60));
    const pieces = shatter(w, h, makeSeeds(w, h), gap);

    pieces.forEach((poly) => {
      const shard = base.cloneNode(true);
      shard.className = "name-shard";
      shard.style.width = w + "px";
      shard.style.height = h + "px";
      shard.style.clipPath = "polygon(" + poly.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",") + ")";
      const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
      const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
      shard.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      shard.addEventListener("pointerenter", () => shard.classList.add("lift"));
      shard.addEventListener("pointerleave", () => shard.classList.remove("lift"));
      layer.appendChild(shard);

    });

    h1.appendChild(layer);
    h1.classList.add("cracked");
    h1.dataset.pieces = pieces.length;
  }

  let t;
  const rebuild = () => { clearTimeout(t); t = setTimeout(build, 120); };
  (document.fonts ? document.fonts.load('700 80px "Space Grotesk"').then(() => document.fonts.ready) : Promise.resolve())
    .then(build).catch(build);
  if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(base);
  else window.addEventListener("resize", rebuild);
})();
