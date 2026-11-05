// Shatters the hero name into identical pieces. Every piece is the same
// hexagon with the same jagged edges, so all pieces are exactly the same shape
// and size. The crack lines are a fixed 1.5px everywhere, and the pattern is
// tied to the letter size, so it looks the same on a laptop or a phone.
// Moving the pointer over a piece zooms that piece out.
(function () {
  const h1 = document.querySelector("h1.name");
  const base = h1 && h1.querySelector(".name-base");
  if (!base || !window.CSS || !CSS.supports("clip-path", "polygon(0 0, 1px 0, 0 1px)")) return;

  const CRACK_WIDTH = 1.5;      // px, never changes
  const PIECE_SIZE = 0.34;      // hexagon radius as a share of the font size

  // One jagged profile used for every crack. Offsets are a share of the edge
  // length, measured sideways from the straight line. Reusing the same profile
  // on every edge is what makes all pieces congruent: a hexagon's opposite
  // edges are parallel, so whatever one edge gains, the opposite edge loses.
  const PROFILE = [
    [0.13, 0.035], [0.27, -0.02], [0.36, 0.05], [0.52, 0.012],
    [0.64, -0.045], [0.79, 0.02], [0.88, -0.03]
  ];

  // Keep edge direction consistent, so both neighbours draw the same zig-zag.
  function canonical(a, b) {
    return (b.x - a.x > 1e-6 || (Math.abs(b.x - a.x) <= 1e-6 && b.y > a.y)) ? [a, b, false] : [b, a, true];
  }
  function jagged(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    return PROFILE.map(([t, o]) => ({ x: a.x + dx * t + nx * o * len, y: a.y + dy * t + ny * o * len }));
  }

  // bounding boxes of every letter, so pieces with no ink in them are skipped
  function letterBoxes() {
    const origin = base.getBoundingClientRect();
    const boxes = [];
    const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.textContent.length; i++) {
        if (!node.textContent[i].trim()) continue;
        const r = document.createRange();
        r.setStart(node, i); r.setEnd(node, i + 1);
        const b = r.getBoundingClientRect();
        boxes.push({ l: b.left - origin.left, t: b.top - origin.top, r: b.right - origin.left, b: b.bottom - origin.top });
      }
    }
    return boxes;
  }

  let layer = null;

  function build() {
    if (layer) layer.remove();
    h1.classList.remove("cracked");
    const w = base.offsetWidth, h = base.offsetHeight;
    if (!w || !h) return;
    const fontSize = parseFloat(getComputedStyle(h1).fontSize);

    // pointy-top hexagon grid
    const R = fontSize * PIECE_SIZE;
    const hexW = Math.sqrt(3) * R, rowH = 1.5 * R;
    const corners = [-90, -30, 30, 90, 150, 210].map((d) => [Math.cos(d * Math.PI / 180) * R, Math.sin(d * Math.PI / 180) * R]);
    const boxes = letterBoxes();
    const hasInk = (cx, cy) => boxes.some((b) => cx + hexW / 2 > b.l && cx - hexW / 2 < b.r && cy + R > b.t && cy - R < b.b);

    const pieces = [];
    for (let r = 0, cy = 0; cy < h + R; r++, cy += rowH) {
      for (let cx = (r % 2 ? hexW / 2 : 0); cx < w + hexW; cx += hexW) {
        if (!hasInk(cx, cy)) continue;
        const poly = corners.map(([x, y]) => ({ x: cx + x, y: cy + y }));
        const out = [];
        for (let i = 0; i < 6; i++) {
          const [a, b, flipped] = canonical(poly[i], poly[(i + 1) % 6]);
          const mid = jagged(a, b);
          out.push(poly[i], ...(flipped ? mid.reverse() : mid));
        }
        pieces.push({ cx, cy, out });
      }
    }

    // one crack line per shared edge
    const seen = new Set();
    const crackLines = [];
    const key = (p) => `${Math.round(p.x * 10)},${Math.round(p.y * 10)}`;
    pieces.forEach(({ cx, cy }) => {
      const poly = corners.map(([x, y]) => ({ x: cx + x, y: cy + y }));
      for (let i = 0; i < 6; i++) {
        const [a, b] = canonical(poly[i], poly[(i + 1) % 6]);
        const k = key(a) + "|" + key(b);
        if (seen.has(k)) continue;
        seen.add(k);
        crackLines.push([a, ...jagged(a, b), b]);
      }
    });

    layer = document.createElement("div");
    layer.className = "name-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = base.offsetLeft + "px";
    layer.style.top = base.offsetTop + "px";
    layer.style.width = w + "px";
    layer.style.height = h + "px";

    pieces.forEach(({ cx, cy, out }) => {
      const shard = base.cloneNode(true);
      shard.className = "name-shard";
      shard.style.width = w + "px";
      shard.style.height = h + "px";
      shard.style.clipPath = "polygon(" + out.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(",") + ")";
      shard.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      shard.addEventListener("pointerenter", () => shard.classList.add("lift"));
      shard.addEventListener("pointerleave", () => shard.classList.remove("lift"));
      layer.appendChild(shard);
    });

    // the white crack lines, drawn over the black letters at a fixed width
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "name-cracks");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", crackLines.map((pts) => "M" + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("L")).join(""));
    path.setAttribute("stroke-width", CRACK_WIDTH);
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(path);
    layer.appendChild(svg);

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
