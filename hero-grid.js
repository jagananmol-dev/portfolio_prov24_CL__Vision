// The hero background is a grid of white boxes. Whichever box the pointer
// moves over turns black, then fades back to white, leaving a short trail.
(function () {
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".hero-grid");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const CELL = 28;          // box size in CSS pixels
  const FADE_MS = 650;      // how long a box takes to go back to white
  const LINE = "#d7dee9";   // grid line colour

  let cols = 0, rows = 0, w = 0, h = 0, dpr = 1;
  let level = new Float32Array(0);   // 0 = white, 1 = black, per box
  let raf = null, last = 0, prev = null;

  function size() {
    const r = hero.getBoundingClientRect();
    w = Math.ceil(r.width); h = Math.ceil(r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL);
    level = new Float32Array(cols * rows);
    measureName();
    draw();
  }

  function draw() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#000";
    for (let i = 0; i < level.length; i++) {
      const v = level[i];
      if (v <= 0.01) continue;
      ctx.globalAlpha = v;
      ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += CELL) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y <= h; y += CELL) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
  }

  function tick(now) {
    const dt = last ? now - last : 16;
    last = now;
    let active = false;
    for (let i = 0; i < level.length; i++) {
      if (level[i] > 0) {
        level[i] = Math.max(0, level[i] - dt / FADE_MS);
        if (level[i] > 0) active = true;
      }
    }
    draw();
    raf = active ? requestAnimationFrame(tick) : null;
    if (!raf) last = 0;
  }

  // boxes behind the name never turn black, so the cracked name always reads clearly
  const name = document.querySelector("h1.name .name-base");
  let nameBox = null;
  function measureName() {
    if (!name) return;
    const hr = hero.getBoundingClientRect(), nr = name.getBoundingClientRect();
    const pad = CELL;
    nameBox = { l: nr.left - hr.left - pad, t: nr.top - hr.top - pad, r: nr.right - hr.left + pad, b: nr.bottom - hr.top + pad };
  }

  function light(x, y) {
    const c = Math.floor(x / CELL), r = Math.floor(y / CELL);
    if (nameBox) {
      const cx = c * CELL, cy = r * CELL;
      if (cx + CELL > nameBox.l && cx < nameBox.r && cy + CELL > nameBox.t && cy < nameBox.b) return;
    }
    if (c < 0 || r < 0 || c >= cols || r >= rows) return;
    level[r * cols + c] = 1;
  }

  function onMove(e) {
    if (!nameBox) measureName();
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    // fill in every box between the last position and this one, so a fast
    // swipe leaves a solid trail instead of scattered boxes
    if (prev) {
      const steps = Math.ceil(Math.hypot(x - prev.x, y - prev.y) / (CELL / 2));
      for (let s = 1; s <= steps; s++) light(prev.x + (x - prev.x) * s / steps, prev.y + (y - prev.y) * s / steps);
    } else {
      light(x, y);
    }
    prev = { x, y };
    if (!raf) raf = requestAnimationFrame(tick);
  }

  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", () => { prev = null; });

  if ("ResizeObserver" in window) new ResizeObserver(size).observe(hero);
  else window.addEventListener("resize", size);
  size();
})();
