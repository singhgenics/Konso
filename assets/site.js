// Menu tabs, and the once-only scroll-in moments (deals board, photos, lists, the Opening soon stamp).
// Content is visible by default: the hidden starting states only apply once `.motion` is set at the end of this file.
document.documentElement.classList.replace('no-js', 'js');

const tabs = [...document.querySelectorAll('[role="tab"]')];
function show(tab, animate) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (!animate) return;
  const panel = document.getElementById(tab.getAttribute('aria-controls'));
  panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); // restart the short fade
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => { if (t.getAttribute('aria-selected') !== 'true') show(t, true); });
  t.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    const next = tabs[(i + k + tabs.length) % tabs.length];
    show(next, true); next.focus();
  });
});
// "See the menu" always lands on the food list
document.querySelectorAll('a[href="#menu"]').forEach(a => a.addEventListener('click', () => {
  if (tabs[0] && tabs[0].getAttribute('aria-selected') !== 'true') show(tabs[0], true);
}));
if (tabs.length) show(tabs[0], false);

// one observer: whatever scrolls into view gets `.in` once, and the CSS plays its motion
const still = /[?&]still\b/.test(location.search); // ?still shows the finished page (screenshots, print checks)
const targets = document.querySelectorAll('.bills, .find, [data-reveal], [data-stagger]');
document.querySelectorAll('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
if (still || !('IntersectionObserver' in window)) {
  targets.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
}
// lazy images fade in when they finish loading instead of popping in (an already-cached image is ready at once)
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  const ready = () => img.classList.add('ready');
  if (img.complete) ready(); else { img.addEventListener('load', ready, { once: true }); img.addEventListener('error', ready, { once: true }); }
});

// the story: the chapter crossing the middle of the screen sets the step the route map draws to
const story = document.querySelector('.story');
const chapters = [...document.querySelectorAll('.chapter')];
if (story && chapters.length) {
  const setStep = ch => {
    story.dataset.step = ch.dataset.step;
    chapters.forEach(c => c.classList.toggle('on', c === ch));
  };
  if (still || !('IntersectionObserver' in window)) { story.dataset.step = '6'; chapters.forEach(c => c.classList.add('on')); }
  else {
    setStep(chapters[0]);
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(e.target); }),
      { rootMargin: '-38% 0px -50% 0px' });
    chapters.forEach(c => so.observe(c));
  }
}


// the hero clip autoplays, but never under reduced motion or ?still (the poster stays)
document.querySelectorAll('video[autoplay]').forEach(v => { if (still || matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); } });
// below-the-fold video posters are set only as their clip comes near (two screens away), so they don't compete with the hero
{ const vids = document.querySelectorAll('video[data-poster]'); const set = v => { v.poster = v.dataset.poster; v.removeAttribute('data-poster'); };
  if (still || !('IntersectionObserver' in window)) vids.forEach(set);
  else { const po = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { po.unobserve(e.target); set(e.target); } }), { rootMargin: '200% 0px' }); vids.forEach(v => po.observe(v)); } }
// looping clips play only while on screen (and never under reduced motion or ?still: the poster stays)
const loops = document.querySelectorAll('video[data-loop]');
if (loops.length && 'IntersectionObserver' in window && !still && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const vo = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = 'auto'; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
  }), { threshold: .25 });
  loops.forEach(v => vo.observe(v));
}

// whole-page smooth scrolling (Lenis, self-hosted): wheel and trackpad glide, touch stays native, anchors ease to their target
let lenis = null;
if (!still && window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({ lerp: .13, wheelMultiplier: 1, smoothWheel: true });   // a short glide: smooth, but settles in ~0.7 s instead of ~1.5 s
  const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
    const to = document.querySelector(a.getAttribute('href')); if (!to) return;
    e.preventDefault();
    lenis.scrollTo(to, { offset: -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0), duration: .9, easing: t => 1 - Math.pow(1 - t, 4) });
    history.pushState(null, '', a.getAttribute('href'));
  });
}

// exploded views: a tall section pins the stage while scroll pulls the layers together into one dish or drink.
// Lag-free by design: positions are measured once (and again only when the page resizes), so scrolling reads no layout;
// scroll only sets a target and the picture eases toward it every frame; only transform and opacity ever change.
const xvs = [...document.querySelectorAll('[data-xv]')];
if (xvs.length) {
  const calm = still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  const out = t => 1 - Math.pow(1 - t, 3);
  const items = xvs.map(el => ({
    el, stick: el.querySelector('.xv-stick'), stage: el.querySelector('.xv-stage'), cap: el.querySelector('.xv-cap'),
    word: el.querySelector('.xv-word'), kicker: el.querySelector('.xv-kicker'), k0: el.querySelector('.xv-kicker').textContent,
    k1: el.dataset.k1 || 'Ready to eat', mid: el.dataset.mid || 'Coming together',
    bar: el.querySelector('.xv-bar i'), whole: el.querySelector('.xv-whole'), layers: [...el.querySelectorAll('.xv-l')],
    top: 0, padT: 0, run: 1, h: 0, t: 0, enter: 1, target: 0, cur: -1, ecur: -1, label: '', live: false,
  }));
  if (calm) items.forEach(it => it.el.classList.add('xv-calm'));
  else {
    // a scene's pictures load only as it comes near (about two screens away), so the page opens fast;
    // the stage shows once they have all loaded and decoded (one retry each), so layers never pop in piecemeal
    const prep = it => {
      const imgs = [...it.layers, it.whole].filter(Boolean);
      imgs.forEach(img => { img.loading = 'eager'; });
      const ok = img => img.decode().catch(() => new Promise(res => { const src = img.src; img.src = ''; img.src = src; img.decode().then(res, res); }));
      Promise.race([Promise.all(imgs.map(ok)), new Promise(r => setTimeout(r, 6000))]).then(() => it.stage.classList.add('xv-ready'));
    };
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { near.unobserve(e.target); prep(items.find(it => it.el === e.target)); } }), { rootMargin: '200% 0px' });
      items.forEach(it => near.observe(it.el));
    } else items.forEach(prep);
    const sy = () => (lenis ? lenis.scroll : scrollY);
    const measure = it => {                                          // the only layout reads: on load and on resize
      const cs = getComputedStyle(it.el), r = it.el.getBoundingClientRect();
      it.padT = parseFloat(cs.paddingTop) || 0;
      it.top = r.top + sy() + it.padT;                               // where the pinned run starts
      it.run = Math.max(1, r.height - it.padT - (parseFloat(cs.paddingBottom) || 0) - it.stick.offsetHeight);
      it.bottom = r.top + sy() + r.height;
      it.railTop = parseFloat(getComputedStyle(it.stick).top) || 0;
      it.h = it.stage.offsetHeight;
    };
    const aim = it => {                                              // scroll position -> target progress (0 apart, 1 together)
      const y = sy();
      it.t = clamp((y - it.top) / it.run, 0, 1);
      it.target = clamp((it.t - .08) / .64, 0, 1);
      // the stage rises gently into place while the scene scrolls in, before it pins
      const d = it.top - y - it.railTop;                             // distance (px) still to go before the scene pins
      it.etarget = clamp(1 - d / (innerHeight * .75), 0, 1);
      it.live = y + innerHeight > it.top - it.padT - 300 && y < it.bottom + 300;
    };
    const draw = it => {
      const p = it.cur, h = it.h, e = smooth(p), en = out(it.ecur);
      it.layers.forEach((l, i) => {                                   // outer layers leave first, so the stack folds in a wave; all land by p = .82
        const q = smooth(clamp((p - i * .04) / .66, 0, 1)), bump = Math.sin(q * Math.PI);
        l.style.transform = `translate3d(0, ${(+l.dataset.dy * h * q).toFixed(2)}px, 0) rotate(${((i % 2 ? 1 : -1) * 2.5 * bump).toFixed(2)}deg) scale(${(1 + .04 * bump).toFixed(4)})`;
      });
      const fuse = smooth(clamp((p - .84) / .12, 0, 1));              // once every layer has landed, they dissolve into the finished piece
      const lo = (1 - fuse).toFixed(3);
      it.layers.forEach(l => { if (l._o !== lo) { l.style.opacity = lo; l._o = lo; } });
      if (it.whole) { it.whole.style.opacity = fuse.toFixed(3); it.whole.style.transform = `scale(${(.975 + .025 * fuse).toFixed(4)})`; }
      const done = out(clamp((p - .9) / .1, 0, 1));
      it.cap.style.opacity = done.toFixed(3);
      it.cap.style.transform = `translate3d(0, ${((1 - done) * 18).toFixed(1)}px, 0)`;
      it.word.style.transform = `translate3d(0, ${((.5 - e) * 70 + (1 - en) * 90).toFixed(1)}px, 0) scale(${(.92 + .16 * e).toFixed(4)})`;
      it.stage.style.transform = `translate3d(0, ${((1 - en) * 70).toFixed(1)}px, 0) scale(${(.9 + .17 * e - (1 - en) * .05).toFixed(4)})`;
      it.bar.style.transform = `scaleX(${it.t.toFixed(4)})`;
      const label = p < .06 ? it.k0 : p > .94 ? it.k1 : it.mid;
      if (label !== it.label) { it.label = label; it.kicker.textContent = label; }
    };
    let last = 0, running = false;
    const frame = now => {
      const dt = Math.min(64, now - (last || now)); last = now;
      // with Lenis the scroll is already smoothed, so the scene follows it 1:1 (no second layer of lag);
      // without it (native wheel steps) the scene eases over ~70 ms, frame-rate independent
      const k = lenis ? 1 : 1 - Math.exp(-dt / 70);
      let busy = false;
      items.forEach(it => {
        if (!it.live) return;
        if (it.cur < 0) { it.cur = it.target; it.ecur = it.etarget; draw(it); return; }
        let moved = false;
        for (const [c, g] of [['cur', 'target'], ['ecur', 'etarget']]) {
          const d = it[g] - it[c];
          if (Math.abs(d) > .0004) { it[c] += d * k; busy = moved = true; }
          else if (it[c] !== it[g]) { it[c] = it[g]; moved = true; }
        }
        if (moved) draw(it);
      });
      if (busy) requestAnimationFrame(frame); else { running = false; last = 0; }
    };
    const kick = () => { items.forEach(aim); if (!running) { running = true; requestAnimationFrame(frame); } };
    let rq = 0;
    const remeasure = () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(() => { items.forEach(measure); kick(); }); };
    addEventListener('scroll', kick, { passive: true });
    if (lenis) lenis.on('scroll', () => { items.forEach(aim); frame(performance.now()); });   // draw in the same frame Lenis scrolls
    addEventListener('resize', remeasure); addEventListener('load', remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);   // late images or fonts moving the page
    document.documentElement.classList.add('xv-on');
    items.forEach(measure); kick();
  }
}
document.documentElement.classList.add('motion');

// Menu drop-down in the rail: click or tap to open, Escape or an outside click to close
(() => {
  const d = document.querySelector('.rail-drop'); if (!d) return;
  const b = d.querySelector('.rail-drop-btn');
  const set = o => { d.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); };
  b.addEventListener('click', e => { e.stopPropagation(); set(!d.classList.contains('open')); });
  document.addEventListener('click', e => { if (!d.contains(e.target)) set(false); });
  d.querySelectorAll('.rail-drop-panel a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); b.focus(); } });
})();
