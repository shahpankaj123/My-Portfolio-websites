/* ==========================================================================
   Pankaj Shah — portfolio interactions
   Vanilla JS + GSAP/ScrollTrigger (self-hosted). Without JS or GSAP every
   section stays fully visible; motion is layered on top.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  const useMotion = hasGSAP && !reduceMotion;

  root.classList.add(useMotion ? "motion" : "no-motion");
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Theme (original "portfolio-theme" key) ---------------- */
  const themeToggle = $("#themeToggle");
  const themeListeners = [];
  const metaTheme = $('meta[name="theme-color"]');

  const setTheme = (theme, persist) => {
    root.setAttribute("data-theme", theme);
    themeToggle?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    metaTheme?.setAttribute("content", theme === "dark" ? "#081426" : "#0d3b85");
    if (persist) {
      try { localStorage.setItem("portfolio-theme", theme); } catch (e) { /* storage blocked */ }
    }
    themeListeners.forEach((fn) => fn(theme));
  };

  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  themeToggle?.addEventListener("click", () =>
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true)
  );

  /* ---------------- Header, progress, back-to-top, active link ---------------- */
  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 24);
    if (!header.classList.contains("menu-open")) {
      if (y > 640 && y > lastY + 4) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 640) header.classList.remove("is-hidden");
    }
    lastY = y;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    backToTop?.classList.toggle("is-visible", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const navLinks = $$(".nav-link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------------- Mobile navigation ---------------- */
  const menuToggle = $("#menuToggle");
  const navPanel = $("#navPanel");

  const setMenu = (open) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navPanel.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    header.classList.remove("is-hidden");
    document.body.classList.toggle("is-locked", open);
  };

  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  $$("a", navPanel).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navPanel.classList.contains("is-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------------- Smooth wheel scrolling (desktop wheel only) ---------------- */
  if (finePointer && !reduceMotion) {
    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;

    const step = () => {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        running = false;
      }
      window.scrollTo({ top: current, behavior: "instant" });
      if (running) requestAnimationFrame(step);
    };

    window.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey || document.body.classList.contains("is-locked")) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        if (e.target.closest(".strip") && e.shiftKey) return;
        e.preventDefault();
        const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
        if (!running) target = current = window.scrollY;
        target = clamp(target + e.deltaY * unit, 0, document.documentElement.scrollHeight - window.innerHeight);
        if (!running) {
          running = true;
          requestAnimationFrame(step);
        }
      },
      { passive: false }
    );

    const stop = () => {
      running = false;
      target = current = window.scrollY;
    };
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    document.addEventListener("click", (e) => e.target.closest('a[href^="#"]') && stop());
  }

  /* ---------------- Cursor + magnetic elements (desktop) ---------------- */
  if (finePointer && !reduceMotion) {
    /* custom cursor disabled for a cleaner, professional feel */
    const cursor = $(".cursor");
    const label = $(".cursor-label");
    let mx = -100, my = -100, cx = -100, cy = -100;

    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener("pointerover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const hit = e.target.closest("a, button, input, textarea, label");
      cursor.classList.toggle("has-label", Boolean(labelled));
      cursor.classList.toggle("is-hover", Boolean(hit) && !labelled);
      if (labelled) label.textContent = labelled.dataset.cursor;
    });
    root.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    root.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        el.style.setProperty("--my", `${((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------------- Hero: interactive dot field ----------------
     A calm grid of dots with a slow ripple. Near the pointer the dots swell
     and warm to marigold, like light on a woven textile. */
  const initDots = () => {
    const canvas = $("#dots");
    const hero = $("#home");
    if (!canvas?.getContext) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, gap = 28, cols = 0, rows = 0;
    let colors = {};
    let pointer = { x: -9999, y: -9999, on: false };
    let ease = { x: -9999, y: -9999 };
    let raf = 0, t = 0, visible = true;

    const hexToRgb = (hex) => {
      const m = hex.replace("#", "").match(/.{2}/g);
      return m ? m.map((x) => parseInt(x, 16)) : [255, 138, 31];
    };

    const readColors = () => {
      const s = getComputedStyle(root);
      colors = {
        base: s.getPropertyValue("--line-2").trim(),
        accent: hexToRgb(s.getPropertyValue("--accent").trim()),
        light: root.getAttribute("data-theme") === "light",
      };
    };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 720 ? 24 : 28;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ease.x += (pointer.x - ease.x) * 0.12;
      ease.y += (pointer.y - ease.y) * 0.12;
      const R = 170;
      const [ar, ag, ab] = colors.accent;
      const ox = w * 0.72;
      const oy = h * 0.42;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap + (j % 2 ? gap / 2 : 0);
          const y = j * gap;
          // slow ripple travelling outward from behind the portrait
          const d0 = Math.hypot(x - ox, y - oy);
          const wave = reduceMotion ? 0 : Math.max(0, Math.sin(d0 / 46 - t * 1.4)) ** 6;
          let k = 0;
          if (pointer.on) {
            const d = Math.hypot(x - ease.x, y - ease.y);
            if (d < R) k = 1 - d / R;
          }
          const fade = clamp(1.15 - Math.abs(x - ox) / w, 0.25, 1);
          const radius = 0.9 + wave * 0.9 + k * 2.6;
          if (k > 0.02 || wave > 0.05) {
            const a = clamp((k * 0.9 + wave * 0.45) * fade, 0, 1);
            ctx.fillStyle = `rgba(${ar},${ag},${ab},${a})`;
          } else {
            ctx.fillStyle = colors.base;
            ctx.globalAlpha = fade * (colors.light ? 0.9 : 0.75);
          }
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    };

    const frame = () => {
      t += 0.016;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (reduceMotion) return draw();
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    readColors();
    build();
    start();
    themeListeners.push(() => { readColors(); if (!raf) draw(); });

    let lastW = window.innerWidth;
    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        build();
        if (!raf) draw();
      }, 150);
    });

    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(hero);
    document.addEventListener("visibilitychange", () => !document.hidden && start());

    if (finePointer) {
      hero.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true };
        if (ease.x < -999) ease = { x: pointer.x, y: pointer.y };
      });
      hero.addEventListener("pointerleave", () => (pointer.on = false));
    }
  };
  initDots();

  /* ---------------- Hero: arch tilt + chip parallax ---------------- */
  if (finePointer && !reduceMotion) {
    const hero = $("#home");
    const arch = $("#arch");
    const chips = $$(".chip");
    hero.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      arch.style.setProperty("--ry", `${(nx * 12).toFixed(2)}deg`);
      arch.style.setProperty("--rx", `${(-ny * 10).toFixed(2)}deg`);
      chips.forEach((c) => {
        const d = parseFloat(c.dataset.depth) || 1;
        c.style.setProperty("--px", `${(nx * 30 * d).toFixed(1)}px`);
        c.style.setProperty("--py", `${(ny * 22 * d).toFixed(1)}px`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      arch.style.setProperty("--rx", "0deg");
      arch.style.setProperty("--ry", "0deg");
      chips.forEach((c) => { c.style.setProperty("--px", "0px"); c.style.setProperty("--py", "0px"); });
    });
  }

  /* ---------------- Role rotator with text scramble ---------------- */
  const rotator = $("#rotator");
  let rotatorStarted = false;
  const startRotator = () => {
    if (!rotator || rotatorStarted) return;
    rotatorStarted = true;
    let roles;
    try { roles = JSON.parse(rotator.dataset.roles); } catch (e) { return; }
    const glyphs = "abcdefghijklmnopqrstuvwxyz<>/{}[]_=+*#01";
    let index = 0;

    const scramble = (to) => new Promise((resolve) => {
      const from = rotator.textContent;
      const queue = Array.from({ length: Math.max(from.length, to.length) }, (_, i) => {
        const start = Math.floor(Math.random() * 14);
        return { from: from[i] || "", to: to[i] || "", start, end: start + 8 + Math.floor(Math.random() * 14) };
      });
      let frame = 0;
      const tick = () => {
        let out = "";
        let done = 0;
        queue.forEach((q) => {
          if (frame >= q.end) { done++; out += q.to; }
          else if (frame >= q.start) out += q.to === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
          else out += q.from;
        });
        rotator.textContent = out;
        if (done === queue.length) resolve();
        else { frame++; requestAnimationFrame(tick); }
      };
      tick();
    });

    const next = async () => {
      index = (index + 1) % roles.length;
      if (reduceMotion) rotator.textContent = roles[index];
      else await scramble(roles[index]);
      setTimeout(next, 2600);
    };
    setTimeout(next, 2400);
  };

  /* ---------------- Helpers: word split, count-up ---------------- */
  const splitWords = (el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
    return $$(".w", el);
  };

  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (!useMotion) { el.textContent = target.toFixed(decimals); return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = o.v.toFixed(decimals)) });
  };

  const counters = $$(".count[data-count]");
  if (useMotion) counters.forEach((c) => (c.textContent = (0).toFixed(parseInt(c.dataset.decimals || "0", 10))));
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countObserver.observe(c));

  /* ---------------- Experience: current role in the side index ---------------- */
  const logItems = $$(".log-item");
  const logLinks = $$(".log-index a");
  const setCurrentLog = (item) => {
    logLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${item.id}`));
  };
  const logObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && setCurrentLog(e.target)),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  logItems.forEach((item) => logObserver.observe(item));
  if (!useMotion) logItems.forEach((i) => i.classList.add("is-active"));

  /* ---------------- Intro + scroll animations ---------------- */
  const heroIntro = () => {
    if (!useMotion) return startRotator();
    gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: startRotator })
      .to(".hero-title .line-inner", { y: 0, duration: 1.3, stagger: 0.1 })
      .fromTo(".hero-copy [data-hero]", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 }, 0.05)
      .fromTo(".hero-visual", { autoAlpha: 0, y: 50, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.4 }, 0.15)
      .fromTo(".arch-sun", { rotate: -90, scale: 0.6 }, { rotate: 0, scale: 1, duration: 2, ease: "expo.out" }, 0.15)
      .from(".chip", { autoAlpha: 0, scale: 0.7, duration: 0.9, stagger: 0.06, ease: "back.out(1.7)" }, 0.6)
      .fromTo(".hero-proof", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.5)
      .from(".dots", { autoAlpha: 0, duration: 1.6, ease: "power2.out" }, 0);
  };

  const scrollAnimations = () => {
    if (!useMotion) return;
    const scrub = (target, vars, trigger = "#home") =>
      gsap.to(target, { ...vars, ease: "none", scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true } });

    // hero parallax only where the copy and portrait sit side by side
    ScrollTrigger.matchMedia({
      "(min-width: 961px)": () => {
        scrub(".hero-copy", { y: -70, autoAlpha: 0.15 });
        scrub(".hero-visual", { y: 90 });
      },
    });

    $$(".section-head").forEach((head) =>
      gsap.fromTo(head.children, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: head, start: "top 86%" },
      })
    );

    $$("[data-split]").forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { autoAlpha: 0.1, y: "0.4em", rotate: 3 }, {
        autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, ease: "power3.out", stagger: 0.035,
        scrollTrigger: { trigger: el, start: "top 82%" },
      });
    });

    const batchIn = (selector, y = 36, stagger = 0.08) => {
      gsap.set(selector, { autoAlpha: 0, y });
      ScrollTrigger.batch(selector, {
        start: "top 90%",
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.05, ease: "expo.out", stagger, overwrite: true }),
      });
    };
    batchIn(".tile", 40, 0.06);
    batchIn(".prow", 26, 0.07);
    batchIn(".skill-row", 26, 0.08);
    batchIn(".award", 30, 0.07);
    batchIn(".edu-item", 20, 0.12);
    batchIn(".g-item", 30, 0.06);

    $$(".case").forEach((c) => {
      gsap.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, scrollTrigger: { trigger: c, start: "top 85%" } });
      gsap.fromTo($(".case-copy", c).children, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: c, start: "top 80%" },
      });
      gsap.fromTo($(".case-visual", c), { y: 50 }, {
        y: -30, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    gsap.set(".log-item", { autoAlpha: 0, x: -24 });
    logItems.forEach((item) => {
      gsap.to(item, { autoAlpha: 1, x: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: item, start: "top 86%" } });
      ScrollTrigger.create({
        trigger: item,
        start: "top 62%",
        onEnter: () => item.classList.add("is-active"),
        onLeaveBack: () => item.classList.remove("is-active"),
      });
    });
    gsap.to("#timelineFill", {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: "#timeline", start: "top 62%", end: "bottom 62%", scrub: 0.4 },
    });

    // marquee leans with scroll speed
    const track = $(".marquee-track");
    if (track) {
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
      ScrollTrigger.create({
        onUpdate: (self) => skewTo(clamp(self.getVelocity() / -260, -8, 8)),
      });
    }

    gsap.fromTo(".footer-mark", { xPercent: -6 }, {
      xPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true },
    });
  };

  /* ---------------- Loader → intro ---------------- */
  const loader = $("#loader");
  const startedAt = performance.now();
  let introDone = false;
  const finishLoading = () => {
    if (introDone) return;
    introDone = true;
    const wait = reduceMotion ? 0 : Math.max(0, 1000 - (performance.now() - startedAt));
    setTimeout(() => {
      loader?.classList.add("is-done");
      heroIntro();
      scrollAnimations();
      if (hasGSAP) ScrollTrigger.refresh();
    }, wait);
  };
  if (document.readyState === "complete") finishLoading();
  else window.addEventListener("load", finishLoading);
  setTimeout(finishLoading, 2400);
  if (document.fonts && hasGSAP) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---------------- Project index: filter + hover preview ---------------- */
  const filters = $$(".filter");
  const rows = $$(".prow");
  const empty = $("#projectsEmpty");

  filters.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    const shown = rows.filter((r) => {
      const match = f === "all" || r.dataset.category.split(" ").includes(f);
      r.classList.toggle("is-hidden", !match);
      return match;
    });
    if (empty) empty.hidden = shown.length > 0;
    if (useMotion) {
      gsap.fromTo(shown, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.05, overwrite: true });
      ScrollTrigger.refresh();
    }
  }));

  const preview = $("#preview");
  if (preview && finePointer && !reduceMotion) {
    let px = 0, py = 0, tx = 0, ty = 0, on = false, raf = 0;
    const move = () => {
      px += (tx - px) * 0.16;
      py += (ty - py) * 0.16;
      preview.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      raf = on || Math.abs(tx - px) > 0.5 ? requestAnimationFrame(move) : 0;
    };
    rows.forEach((row) => {
      row.addEventListener("pointerenter", (e) => {
        preview.innerHTML = $(".tpl-visual", row).innerHTML;
        tx = px = Math.min(e.clientX + 36, window.innerWidth - 360);
        ty = py = clamp(e.clientY - 250, 80, window.innerHeight - 220);
        on = true;
        preview.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(move);
      });
      row.addEventListener("pointermove", (e) => {
        tx = Math.min(e.clientX + 36, window.innerWidth - 360);
        ty = clamp(e.clientY - 250, 80, window.innerHeight - 220);
      });
      row.addEventListener("pointerleave", () => {
        on = false;
        preview.classList.remove("is-on");
      });
    });
  }

  /* ---------------- Project details modal ---------------- */
  const modal = $("#projectModal");
  let lastFocus = null;
  const lock = (on) => document.body.classList.toggle("is-locked", on);

  const openProject = (item) => {
    if (!modal || typeof modal.showModal !== "function") return;
    lastFocus = document.activeElement;
    const tpl = (cls) => $(`template.${cls}`, item)?.innerHTML;
    $("#modalVisual").innerHTML = tpl("tpl-visual") ?? $(".case-visual", item)?.innerHTML ?? "";
    $("#modalKind").textContent = $(".case-kind", item)?.textContent ?? "";
    $("#modalTitle").textContent = ($(".case-title", item) || $(".prow-btn", item))?.textContent ?? "";
    $("#modalContent").innerHTML = $(".project-detail", item)?.innerHTML ?? "";
    $("#modalTags").innerHTML = tpl("tpl-tags") ?? $(".case-copy .tags", item)?.innerHTML ?? "";
    const actions = $("#modalActions");
    actions.innerHTML = tpl("tpl-actions") ?? "";
    $$(".case-actions a, .case-actions .project-note", item).forEach((el) => actions.append(el.cloneNode(true)));
    $$("svg[role='img']", $("#modalVisual")).forEach((s) => s.removeAttribute("role"));
    modal.showModal();
    lock(true);
    $(".modal-inner", modal).scrollTop = 0;
  };

  $$("[data-project]").forEach((item) => {
    $$("[data-open-project]", item).forEach((b) => b.addEventListener("click", () => openProject(item)));
    const visual = $("div.case-visual", item);
    visual?.addEventListener("click", () => openProject(item));
  });

  const wireDialog = (dialog) => {
    if (!dialog) return;
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
    dialog.addEventListener("close", () => {
      lock(false);
      lastFocus?.focus?.({ preventScroll: true });
    });
  };
  wireDialog(modal);

  /* ---------------- Certificate strip: drag, buttons, lightbox ---------------- */
  const strip = $("#gallery");
  if (strip) {
    $$("[data-strip]").forEach((b) => b.addEventListener("click", () => {
      strip.scrollBy({ left: Number(b.dataset.strip) * strip.clientWidth * 0.7, behavior: reduceMotion ? "auto" : "smooth" });
    }));

    let down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = strip.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) strip.classList.add("is-dragging");
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      setTimeout(() => strip.classList.remove("is-dragging"), 0);
    });
  }

  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCap");
  const shots = $$(".g-btn");
  let lbIndex = 0;

  const showImage = (i) => {
    lbIndex = (i + shots.length) % shots.length;
    const btn = shots[lbIndex];
    lbImg.src = btn.dataset.full;
    lbImg.alt = $("img", btn).alt;
    lbCap.textContent = `${$(".g-cap", btn).textContent} (${lbIndex + 1} of ${shots.length})`;
    if (useMotion) gsap.fromTo(lbImg, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out" });
  };

  shots.forEach((btn, i) => btn.addEventListener("click", () => {
    if (strip?.classList.contains("is-dragging")) return;
    if (!lightbox || typeof lightbox.showModal !== "function") return window.open(btn.dataset.full, "_blank", "noopener");
    lastFocus = btn;
    showImage(i);
    lightbox.showModal();
    lock(true);
  }));

  if (lightbox) {
    wireDialog(lightbox);
    $(".lb-prev", lightbox).addEventListener("click", () => showImage(lbIndex - 1));
    $(".lb-next", lightbox).addEventListener("click", () => showImage(lbIndex + 1));
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") showImage(lbIndex - 1);
      if (e.key === "ArrowRight") showImage(lbIndex + 1);
    });
    let sx = null;
    lightbox.addEventListener("pointerdown", (e) => (sx = e.clientX));
    lightbox.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 50 && e.pointerType !== "mouse") showImage(lbIndex + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------------- Contact form: validation + Web3Forms ---------------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus");
    const submit = $(".btn-submit", form);
    const label = $(".btn-label", submit);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let attempted = false;

    const rules = {
      name: (v) => (v.trim().length < 2 ? "Enter your name." : ""),
      email: (v) => !v.trim() ? "Enter your email so I can reply." : !emailPattern.test(v.trim()) ? "Enter a valid email, like name@example.com." : "",
      subject: (v) => (!v.trim() ? "Add a subject." : ""),
      message: (v) => (v.trim().length < 10 ? "Write a message of at least 10 characters." : ""),
    };

    const check = (field) => {
      const input = form.elements[field];
      const msg = rules[field](input.value);
      input.closest(".field").classList.toggle("is-invalid", Boolean(msg));
      input.setAttribute("aria-invalid", String(Boolean(msg)));
      if (msg) input.setAttribute("aria-describedby", `${field}-error`);
      else input.removeAttribute("aria-describedby");
      $(`#${field}-error`).textContent = msg;
      return !msg;
    };

    Object.keys(rules).forEach((field) => {
      const input = form.elements[field];
      input.addEventListener("blur", () => attempted && check(field));
      input.addEventListener("input", () => attempted && check(field));
    });

    const setStatus = (text, type) => {
      status.textContent = text;
      status.className = `form-status${type ? ` is-${type}` : ""}`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      attempted = true;
      const results = Object.keys(rules).map(check);
      if (results.includes(false)) {
        form.elements[Object.keys(rules)[results.indexOf(false)]].focus();
        setStatus("Check the highlighted fields.", "err");
        return;
      }
      submit.disabled = true;
      submit.classList.add("is-loading");
      label.textContent = "Sending";
      setStatus("", "");
      try {
        const response = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.message || "Request failed");
        const email = form.elements.email.value.trim();
        form.reset();
        attempted = false;
        setStatus(`Message sent. I'll reply to ${email} soon.`, "ok");
      } catch (err) {
        setStatus("Your message didn't send. Check your connection and try again, or email pshah9360@gmail.com.", "err");
      } finally {
        submit.disabled = false;
        submit.classList.remove("is-loading");
        label.textContent = "Send message";
      }
    });
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
