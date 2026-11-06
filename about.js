// About me: an explorer with four tabs, and stats that count up when they come
// into view. Without JavaScript every panel simply shows, one after another.
(function () {
  const box = document.querySelector(".about-explorer");
  if (!box) return;
  const tabs = [...box.querySelectorAll(".ax-tab")];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const marker = box.querySelector(".ax-marker");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function moveMarker(tab) {
    if (!marker) return;
    const vertical = getComputedStyle(box.querySelector(".ax-tabs")).flexDirection === "column";
    if (vertical) {
      marker.style.transform = `translateY(${tab.offsetTop}px)`;
      marker.style.height = tab.offsetHeight + "px";
      marker.style.width = "";
    } else {
      // a row on tablets, a 2 x 2 grid on phones: follow the tab in both directions
      marker.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
      marker.style.width = tab.offsetWidth + "px";
      marker.style.height = tab.offsetHeight + "px";
    }
  }

  function select(i, focus) {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle("in", on);
    });
    moveMarker(tabs[i]);
    if (focus) tabs[i].focus({ preventScroll: true });
    // when the tabs sit in a sideways-scrolling strip, bring the chosen tab
    // into view by scrolling only the strip, never the page (scrollIntoView
    // used to jump phones straight down to this section on load)
    const strip = box.querySelector(".ax-tabs");
    if (strip.scrollWidth > strip.clientWidth + 1) {
      const left = tabs[i].offsetLeft - (strip.clientWidth - tabs[i].offsetWidth) / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
    }
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i, false));
    t.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let n = null;
      if (e.key in keys) n = (i + keys[e.key] + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });
  box.classList.add("ax-ready");
  select(0, false);
  window.addEventListener("resize", () => moveMarker(tabs.find((t) => t.getAttribute("aria-selected") === "true")));
  if (document.fonts) document.fonts.ready.then(() => moveMarker(tabs.find((t) => t.getAttribute("aria-selected") === "true")));

  // count-up stats
  const nums = [...document.querySelectorAll(".as-num[data-count]")];
  if (reduce || !("IntersectionObserver" in window)) return;
  const run = (el) => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0), suf = el.dataset.suffix || "";
    const start = performance.now(), ms = 1100;
    (function step(now) {
      const t = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * e) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
})();
