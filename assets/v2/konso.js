/* Konso: poster drops, posters and parallax. Transform and opacity only; positions measured on load/resize. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth <= 820;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  if (reduce) root.classList.add('no-runway');

  /* Smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); }
    }));
  }

  /* Hero arrives */
  const hero = document.querySelector('.hero');
  const heroMedia = hero.querySelector('.hero__media');
  const ready = () => setTimeout(() => hero.classList.add('is-ready'), 30);
  ready();

  /* Loose ingredients, cut out, drifting at their own depth */
  const ING = Array.from({ length: 15 }, (_, i) => 'ing-' + (i + 1));
  const floats = [];
  const scatter = (host, n, seed, top) => {
    let r = seed;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      const img = new Image();
      img.src = `assets/v2/cut/${ING[(i + seed) % ING.length]}.webp`;
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      const edge = i % 2 ? 80 + rnd() * 14 : 1 + rnd() * 12;
      const far = rnd() < 0.45;              // far pieces are small, soft and dim: depth
      const size = far ? 34 + rnd() * 26 : (phone() ? 48 + rnd() * 28 : 64 + rnd() * 56);
      img.style.cssText = `--l:${edge}%;--t:${top ? top() : 6 + rnd() * 84}%;--sz:${size}px;--blur:${far ? 2.5 : 0}px;--lit:${far ? 0.6 : 1}`;
      host.appendChild(img);
      floats.push({ el: img, speed: far ? 0.08 + rnd() * 0.12 : 0.3 + rnd() * 0.4, spin: (rnd() - 0.5) * 120, host });
    }
  };
  document.querySelectorAll('.spice').forEach((h, i) => scatter(h, phone() ? 6 : 10, 7 + i * 13));
  const heroSpice = document.createElement('div'); heroSpice.className = 'spice'; heroSpice.setAttribute('aria-hidden', 'true');
  hero.appendChild(heroSpice); { let k = 0; scatter(heroSpice, phone() ? 3 : 6, 3, () => (phone() ? [44, 62, 52] : [22, 60, 34, 52, 16, 44])[k++ % (phone() ? 3 : 6)]); }

  /* The line-up: each dish gets a burst of its own ingredients, placed once */
  const BURST = {
    steamer: [13, 8, 15, 5, 9, 4], baodown: [4, 13, 7, 3, 10, 15], fever: [9, 10, 11, 3, 13, 1], kpop: [1, 2, 13, 15, 5, 8]
  };
  const drops = [...document.querySelectorAll('.drop')].map((el, k) => {
    const dish = el.querySelector('.drop__media'), img = el.querySelector('.drop__dish'), clip = el.querySelector('.drop__clip'), word = el.querySelector('.drop__word'), host = el.querySelector('.drop__burst');
    const key = (img.getAttribute('src').match(/cut\/(\w+)\./) || [])[1];
    const ids = BURST[key] || [1, 5, 8, 13, 4, 15];
    const bits = ids.map((n, i) => {
      const img = new Image(); img.src = `assets/v2/cut/ing-${n}.webp`; img.alt = ''; img.decoding = 'async';
      const ang = (i / ids.length) * Math.PI * 2 + k * 0.7;       // spread all round the dish
      const far = i % 3 === 2;
      const size = far ? 46 : (phone() ? 58 : 78 + (i % 2) * 34);
      img.style.setProperty('--sz', size + 'px');
      if (!far && i % 2) img.classList.add('front');
      if (far) img.style.opacity = 0.55;
      host.appendChild(img);
      return { img, ang, dist: 0.30 + (i % 3) * 0.09, spin: (i % 2 ? 1 : -1) * (90 + i * 25), far };
    });
    return { el, dish, clip, word, bits, top: 0, h: 0, live: false };
  });
  const easeOutBack = t => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  /* Posters, fire and other clips: load when near, play only on screen */
  const clips = [...document.querySelectorAll('video[data-src]')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src) { v.src = phone() && v.dataset.srcSm ? v.dataset.srcSm : v.dataset.src; }
      if (!reduce) v.play().catch(() => {});
      v.closest('section')?.classList.add('is-in');
    } else { v.pause(); }
  }), { rootMargin: '25% 0px' });
  clips.forEach(v => io.observe(v));
  if (heroMedia.dataset.src && !reduce) { heroMedia.src = phone() ? heroMedia.dataset.srcSm : heroMedia.dataset.src; heroMedia.play().catch(() => {}); }
  const heroIO = new IntersectionObserver(([e]) => { if (reduce) return; e.isIntersecting ? heroMedia.play().catch(() => {}) : heroMedia.pause(); });
  heroIO.observe(hero);
  if (reduce) heroMedia.removeAttribute('autoplay'), heroMedia.pause();

  /* Entrances: heading, then text, then picture */
  const riseSel = '.poster__word,.poster__cap,.pour__title,.glass,.pour__note';
  document.querySelectorAll('section,footer').forEach(sec => sec.querySelectorAll(riseSel).forEach((el, i) => { el.setAttribute('data-rise', ''); el.style.setProperty('--i', i % 6); }));
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-rise]').forEach(el => rio.observe(el));

  /* Measure once, then scroll reads no layout. Every frame writes transform and opacity only. */
  const bar = document.querySelector('.bar');
  const posters = [...document.querySelectorAll('.poster')];
  let vh = innerHeight, vw = innerWidth, M = {};
  const absTop = el => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const measure = () => {
    vh = innerHeight; vw = innerWidth;
    const ds = document.querySelector('.drops'); M.drops = { top: absTop(ds), h: ds.offsetHeight };
    M.posters = posters.map(p => ({ el: p.querySelector('.poster__media'), top: absTop(p), h: p.offsetHeight }));
    floats.forEach(f => { f.top = absTop(f.el.parentNode) + f.el.offsetTop; });
    M.hero = hero.offsetHeight;
  };

  // One clock for the whole line-up. Scroll decides WHICH dish is on (target); springs decide HOW it moves,
  // so a landing always feels the same at any scroll speed and reverses smoothly mid-flight.
  const spring = (st, target, k, c, dt) => { const acc = k * (target - st.x) - c * st.v; st.v += acc * dt; st.x += st.v * dt; if (Math.abs(target - st.x) < 0.0005 && Math.abs(st.v) < 0.0005) { st.x = target; st.v = 0; } };
  drops.forEach(d => { d.inS = { x: 0, v: 0 }; d.outS = { x: 0, v: 0 }; d.local = -1; d.vis = ''; });
  const PH = phone();
  const slotOf = y => ((y - M.drops.top + vh * 0.55) / Math.max(1, M.drops.h - vh + vh * 0.55)) * drops.length;
  const yOfSlot = seg => seg / drops.length * Math.max(1, M.drops.h - vh + vh * 0.55) + M.drops.top - vh * 0.55;
  const dropTargets = y => { const seg = slotOf(y); drops.forEach((d, i) => { d.local = seg - i; d.tIn = d.local > -0.05 ? 1 : 0; d.tOut = (i < drops.length - 1 && d.local > 0.86) ? 1 : 0; }); };
  const dropStep = dt => {
    let moving = false;
    drops.forEach(d => {
      spring(d.inS, d.tIn, 150, 17, dt);          // arrival: a little weight, a soft bounce on landing
      spring(d.outS, d.tOut, 260, 30, dt);        // hand-over: quicker than arriving, no bounce
      if (d.inS.v || d.outS.v || d.inS.x !== d.tIn || d.outS.x !== d.tOut) moving = true;
      const xin = d.inS.x, xout = clamp(d.outS.x);
      const vis = (xin < 0.01 && d.tIn === 0) || xout > 0.99 ? 'hidden' : 'visible';
      if (vis !== d.vis) { d.vis = vis; d.el.style.visibility = vis; }
      if (vis === 'hidden') return;
      const up = 1 - xin;                                       // 1 = still above the screen
      d.dish.style.opacity = (clamp(xin * 2) * (1 - xout)).toFixed(3);
      d.dish.style.transform = `translate3d(0,${(up * -vh * 0.6 + xout * vh * 0.3).toFixed(1)}px,0) rotate(${(up * -14 + xout * 8).toFixed(2)}deg) scale(${(0.9 + 0.1 * Math.min(1, xin) - 0.08 * xout).toFixed(4)})`;
      d.word.style.opacity = (clamp(xin * 3) * (1 - xout)).toFixed(3);
      d.word.style.transform = `translate3d(0,${(clamp(up) * 36 - xout * 28).toFixed(1)}px,0)`;
      const b = ease(clamp((d.local - 0.1) / 0.7));            // the burst follows the scroll (parallax)
      const R = Math.min(vw, vh * 1.3);
      d.bits.forEach(t => {
        const r = R * t.dist * (0.25 + 0.75 * b);
        const x = Math.cos(t.ang) * r * (PH ? 0.8 : 1.25), yy = Math.sin(t.ang) * r * 0.8 - b * vh * (t.far ? 0.03 : 0.08);
        t.img.style.transform = `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0) rotate(${(t.spin * b).toFixed(1)}deg) scale(${(0.5 + 0.5 * Math.min(1, b * 1.6)).toFixed(3)})`;
        t.img.style.opacity = ((t.far ? 0.55 : 1) * clamp(xin * 2 - 0.6) * (1 - xout)).toFixed(3);
      });
      if (d.clip) {
        const want = xin > 0.95 && xout < 0.05 && d.local > 0.12 && d.local < 0.84;
        if (want !== d.live) {
          d.live = want;
          if (want) { if (!d.clip.src) d.clip.src = d.clip.dataset.clip; d.clip.play().then(() => { if (d.live) d.dish.classList.add('is-live'); }).catch(() => {}); }
          else { d.dish.classList.remove('is-live'); d.clip.pause(); }
        }
      }
    });
    return moving;
  };
  // Clips for the line-up load while it is still a screen away, so the hand-over never waits on the network
  let clipsWarm = false;
  const warmClips = () => { if (clipsWarm) return; clipsWarm = true; drops.forEach(d => { if (d.clip && !d.clip.src) { d.clip.preload = 'auto'; d.clip.src = d.clip.dataset.clip; } }); };
  // After the visitor stops between two dishes, ease to the nearer one (mouse and trackpad only; never fights a finger)
  const fine = matchMedia('(pointer: fine)').matches;
  let settleT = 0, settling = false;
  const settle = () => {
    if (!lenis || !fine || settling) return;
    const y = lenis.scroll; if (y < M.drops.top || y > M.drops.top + M.drops.h - vh) return;
    const seg = slotOf(y), i = Math.floor(seg), f = seg - i;
    if (f > 0.12 && f < 0.82) return;                         // resting on a dish already
    const to = f >= 0.82 ? Math.min(drops.length - 0.5, i + 1.45) : i + 0.45;
    const ty = yOfSlot(to); if (Math.abs(ty - y) > vh * 0.6) return;
    settling = true; lenis.scrollTo(ty, { duration: 0.8, easing: t => 1 - Math.pow(1 - t, 4), onComplete: () => { settling = false; } });
  };

  let lastY = -1, springing = false, lastT = 0;
  const frame = (t = performance.now()) => {
    const dt = Math.min(1 / 30, Math.max(1 / 240, (t - (lastT || t)) / 1000 || 1 / 60)); lastT = t;
    const y = lenis ? lenis.scroll : scrollY;
    const inDrops = y > M.drops.top - vh * 1.5 && y < M.drops.top + M.drops.h;
    if (y !== lastY) {
      lastY = y;
      bar.classList.toggle('is-solid', y > M.hero * 0.45);
      if (reduce) return;
      if (y < M.hero * 1.2) heroMedia.style.translate = `0 ${(y * -0.18).toFixed(1)}px`;
      if (inDrops) { warmClips(); dropTargets(y); springing = true; }
      M.posters.forEach(P => { if (y > P.top - vh && y < P.top + P.h) { const q = clamp((y - P.top + vh) / (P.h + vh)); P.el.style.transform = `scale(${(1.14 - q * 0.14).toFixed(4)})`; } });
      floats.forEach(f => { const rel = y + vh / 2 - f.top; if (Math.abs(rel) < vh * 1.4) f.el.style.transform = `translate3d(0,${(-rel * f.speed).toFixed(1)}px,0) rotate(${(rel / vh * f.spin).toFixed(1)}deg)`; });
      clearTimeout(settleT); if (inDrops) settleT = setTimeout(settle, 220);
    }
    if (springing && !reduce) springing = dropStep(dt);
  };

  const loop = t => { if (lenis) lenis.raf(t); frame(t); requestAnimationFrame(loop); };
  addEventListener('load', measure);
  addEventListener('resize', () => { measure(); frame(); });
  measure();
  if (reduce) { frame(); addEventListener('scroll', frame, { passive: true }); }
  else requestAnimationFrame(loop);
})();

/* Music: the visitor turns it on; fades in and out */
(() => {
  const btn = document.querySelector('.sound'), a = document.getElementById('music');
  if (!btn || !a) return;
  let fade;
  const ramp = (to, done) => { clearInterval(fade); fade = setInterval(() => { const v = a.volume + (to > a.volume ? 0.05 : -0.05); a.volume = Math.min(1, Math.max(0, v)); if (Math.abs(a.volume - to) < 0.06) { a.volume = to; clearInterval(fade); done && done(); } }, 40); };
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    if (on) { a.volume = 0; a.play().then(() => ramp(0.7)).catch(() => {}); } else ramp(0, () => a.pause());
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !a.paused) a.pause(); else if (!document.hidden && btn.getAttribute('aria-pressed') === 'true') a.play().catch(() => {}); });
})();
