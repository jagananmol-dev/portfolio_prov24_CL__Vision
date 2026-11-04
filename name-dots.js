// Draws the hero name as a field of dots. Move the pointer (or a finger)
// over it and the nearby cluster of dots grows and lights up, like a lens.
(function () {
  const h1 = document.querySelector("h1.name");
  const canvas = h1 && h1.querySelector(".name-dots");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const lines = ["Jagananmol", "Daneti"];

  let dots = [];          // { x, y, s } where s is the current scale
  let width = 0, height = 0, step = 6, baseR = 2.5, lens = 90;
  let pointer = null;     // { x, y } in canvas pixels, or null when away
  let raf = null;

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  let ink = "#13213c", glow = "#2f5bff";

  function build() {
    const style = getComputedStyle(h1);
    const avail = (h1.parentElement && h1.parentElement.clientWidth) || h1.clientWidth || 600;
    let fontSize = parseFloat(style.fontSize);
    const fontFor = (size) => `800 ${size}px "Bricolage Grotesque", system-ui, sans-serif`;

    // Draw the name off-screen on a wide scratch canvas and measure where the ink
    // really ends. Canvas text can render wider than the CSS heading, so shrink
    // the font until the real ink fits the column.
    const off = document.createElement("canvas");
    const o = off.getContext("2d", { willReadFrequently: true });
    let lineH, inkW = 0, data;
    for (let attempt = 0; attempt < 4; attempt++) {
      lineH = fontSize * 0.92;
      off.width = Math.ceil(avail * 1.6);
      off.height = Math.ceil(lineH * lines.length + fontSize * 0.2);
      o.font = fontFor(fontSize);
      o.textBaseline = "alphabetic";
      o.fillStyle = "#000";
      lines.forEach((l, i) => o.fillText(l, 2, lineH * (i + 1) - fontSize * 0.12));
      data = o.getImageData(0, 0, off.width, off.height).data;
      inkW = 0;
      for (let y = 0; y < off.height; y += 2) {
        for (let x = off.width - 1; x > inkW; x--) {
          if (data[(y * off.width + x) * 4 + 3] > 128) { inkW = x; break; }
        }
      }
      if (inkW + 4 <= avail) break;
      fontSize *= (avail - 6) / (inkW + 4);
    }
    width = Math.min(inkW + 4, avail);
    height = off.height;
    const scanW = off.width;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    step = Math.max(4, Math.round(fontSize / 15));
    baseR = step * 0.42;
    lens = fontSize * 0.75;
    dots = [];
    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        const a = data[(Math.floor(y) * scanW + Math.floor(x)) * 4 + 3];
        if (a > 128) dots.push({ x, y, s: 1 });
      }
    }
    ink = css("--ink") || ink;
    glow = css("--signal") || glow;
    h1.classList.add("dotted");
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    let moving = false;
    for (const d of dots) {
      let target = 1, push = 0, dx = 0, dy = 0;
      if (pointer) {
        dx = d.x - pointer.x; dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < lens) {
          const t = 1 - dist / lens;
          target = 1 + 1.7 * t * t;          // grow toward the centre of the lens
          push = t * step * 0.9;             // spread slightly so the cluster opens up
        }
      }
      d.s += (target - d.s) * 0.22;          // ease toward the target size
      if (Math.abs(target - d.s) > 0.01) moving = true;
      const len = Math.hypot(dx, dy) || 1;
      const px = d.x + (dx / len) * push * (d.s - 1) / 1.7;
      const py = d.y + (dy / len) * push * (d.s - 1) / 1.7;
      ctx.beginPath();
      ctx.fillStyle = d.s > 1.25 ? glow : ink;
      ctx.arc(px, py, baseR * d.s, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = moving ? requestAnimationFrame(draw) : null;
  }

  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  function setPointer(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    pointer = { x: clientX - r.left, y: clientY - r.top };
    kick();
  }
  canvas.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY));
  canvas.addEventListener("pointerdown", (e) => setPointer(e.clientX, e.clientY));
  canvas.addEventListener("pointerleave", () => { pointer = null; kick(); });
  canvas.addEventListener("pointercancel", () => { pointer = null; kick(); });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  // wait for the display font, otherwise the dots trace the fallback font
  (document.fonts ? document.fonts.load('800 80px "Bricolage Grotesque"').then(() => document.fonts.ready) : Promise.resolve())
    .then(build)
    .catch(build);
})();
