// Shatters the hero name into equal-sized pieces split by jagged, splintered
// cracks (never straight lines). Moving the pointer over a piece zooms it out.
(function () {
  const h1 = document.querySelector("h1.name");
  const base = h1 && h1.querySelector(".name-base");
  if (!base || !window.CSS || !CSS.supports("clip-path", "polygon(0 0, 1px 0, 0 1px)")) return;

  // small seeded random generator, so the cracks look the same on every visit
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // keep the part of a convex polygon on point a's side of the line between a and b
  function clipHalf(poly, a, b) {
    const nx = b.x - a.x, ny = b.y - a.y;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const side = (p) => (p.x - mx) * nx + (p.y - my) * ny;
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
  function shatter(w, h, seeds) {
    const box = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    return seeds.map((s, i) => {
      let poly = box;
      for (let j = 0; j < seeds.length && poly.length; j++) if (j !== i) poly = clipHalf(poly, s, seeds[j]);
      return poly;
    }).filter((p) => p.length >= 3);
  }

  // Equal-sized pieces: seeds sit on a regular honeycomb (hexagonal) grid, so
  // every piece inside the name is the same hexagon. The jagged crack lines
  // drawn along their edges keep it looking shattered rather than tiled.
  function makeSeeds(w, h, fontSize) {
    const target = Math.max(18, Math.min(46, Math.round((w * h) / 2500)));
    // hexagon spacing chosen so about `target` pieces cover the name
    const d = Math.sqrt((w * h * 2) / (Math.sqrt(3) * target));
    const rowH = d * Math.sqrt(3) / 2;
    const seeds = [];
    for (let r = 0, y = rowH / 2; y < h + rowH; r++, y += rowH) {
      const shift = r % 2 ? d / 2 : 0;
      for (let x = -d / 2 + shift; x < w + d; x += d) seeds.push({ x, y });
    }
    return seeds;
  }


  // turn a straight edge into a jagged crack. The same edge always gets the same
  // jagged line, so the two pieces on either side of it still fit together.
  function jagged(a, b, fontSize) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const rand = rng(hash(`${a.x.toFixed(1)},${a.y.toFixed(1)}|${b.x.toFixed(1)},${b.y.toFixed(1)}`));
    const steps = Math.max(2, Math.round(len / (fontSize * 0.07)));
    const amp = Math.min(fontSize * 0.035, len * 0.09);
    const nx = -(b.y - a.y) / (len || 1), ny = (b.x - a.x) / (len || 1);
    const pts = [];
    let sign = rand() < 0.5 ? 1 : -1;
    for (let i = 1; i < steps; i++) {
      const t = (i + (rand() - 0.5) * 0.5) / steps;
      if (rand() < 0.7) sign = -sign;           // mostly zig-zag, sometimes a longer run
      const off = sign * (0.3 + 0.7 * rand()) * amp;
      pts.push({ x: a.x + (b.x - a.x) * t + nx * off, y: a.y + (b.y - a.y) * t + ny * off });
    }
    return pts; // interior points only, from a to b
  }

  let layer = null;

  function build() {
    if (layer) layer.remove();
    h1.classList.remove("cracked");
    const w = base.offsetWidth, h = base.offsetHeight;
    if (!w || !h) return;
    const fontSize = parseFloat(getComputedStyle(h1).fontSize);

    const pieces = shatter(w, h, makeSeeds(w, h, fontSize));

    // give every shared edge one jagged path, keyed so both neighbours reuse it
    const near = 0.6;
    const onBorder = (p, q) =>
      (Math.abs(p.x - q.x) < near && (p.x < near || p.x > w - near)) ||
      (Math.abs(p.y - q.y) < near && (p.y < near || p.y > h - near));
    const keyOf = (p) => `${Math.round(p.x * 4)},${Math.round(p.y * 4)}`;
    const edges = new Map();
    const crackLines = [];

    const shapes = pieces.map((poly) => {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length];
        out.push(p);
        if (onBorder(p, q)) continue;
        const kp = keyOf(p), kq = keyOf(q);
        const forward = kp < kq;
        const key = forward ? kp + "|" + kq : kq + "|" + kp;
        let line = edges.get(key);
        if (!line) {
          const a = forward ? p : q, b = forward ? q : p;
          line = { a, b, mid: jagged(a, b, fontSize) };
          edges.set(key, line);
          crackLines.push([line.a, ...line.mid, line.b]);
        }
        out.push(...(forward ? line.mid : line.mid.slice().reverse()));
      }
      return { poly, out };
    });

    // hairline splinters: short dead-end cracks branching off some corners
    const rand = rng(77);
    const branches = [];
    shapes.forEach(({ poly }) => {
      poly.forEach((p) => {
        if (p.x < 2 || p.y < 2 || p.x > w - 2 || p.y > h - 2 || rand() > 0.22) return;
        const ang = rand() * Math.PI * 2, len = fontSize * (0.1 + rand() * 0.16);
        const end = { x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len };
        branches.push([p, ...jagged(p, end, fontSize * 0.7), end]);
      });
    });

    layer = document.createElement("div");
    layer.className = "name-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = base.offsetLeft + "px";
    layer.style.top = base.offsetTop + "px";
    layer.style.width = w + "px";
    layer.style.height = h + "px";

    shapes.forEach(({ poly, out }) => {
      const shard = base.cloneNode(true);
      shard.className = "name-shard";
      shard.style.width = w + "px";
      shard.style.height = h + "px";
      shard.style.clipPath = "polygon(" + out.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",") + ")";
      const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
      const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
      shard.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      shard.addEventListener("pointerenter", () => shard.classList.add("lift"));
      shard.addEventListener("pointerleave", () => shard.classList.remove("lift"));
      layer.appendChild(shard);
    });

    // the white crack lines, drawn over the black letters
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "name-cracks");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const toD = (pts) => "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L");
    const main = document.createElementNS(ns, "path");
    main.setAttribute("d", crackLines.map(toD).join(""));
    main.setAttribute("stroke-width", Math.max(1.1, Math.min(1.7, fontSize / 62)).toFixed(2));
    const fine = document.createElementNS(ns, "path");
    fine.setAttribute("d", branches.map(toD).join(""));
    fine.setAttribute("stroke-width", Math.max(0.7, Math.min(1.1, fontSize / 100)).toFixed(2));
    svg.append(main, fine);
    layer.appendChild(svg);

    h1.appendChild(layer);
    h1.classList.add("cracked");
    h1.dataset.pieces = shapes.length;
  }

  let t;
  const rebuild = () => { clearTimeout(t); t = setTimeout(build, 120); };
  (document.fonts ? document.fonts.load('700 80px "Space Grotesk"').then(() => document.fonts.ready) : Promise.resolve())
    .then(build).catch(build);
  if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(base);
  else window.addEventListener("resize", rebuild);
})();
