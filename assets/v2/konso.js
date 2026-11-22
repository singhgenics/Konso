/* Konso, 2026-11-22: calm motion. Videos load near the screen and play only on screen; blocks rise in once (the Konso mark replays them);
   the menu has Food and Drinks tabs; music only when asked. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const phone = () => innerWidth <= 820;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const bar = document.querySelector('.bar');
  const barH = () => bar.offsetHeight;

  /* Smooth wheel scrolling on desktop only; touch keeps the platform's own scrolling */
  let lenis = null;
  if (!reduce && fine && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {            // one clock: GSAP drives Lenis, Lenis tells ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const goTo = el => {
    if (lenis) lenis.scrollTo(el, { offset: -barH() });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - barH(), behavior: reduce ? 'auto' : 'smooth' });
  };

  /* Menu tabs (with arrow keys), and links that open a tab */
  const tabs = [...document.querySelectorAll('.mtab')];
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });

  /* The Konso mark: back to the very top, then the page plays its entrances again */
  const toTop = () => {
    const done = () => { replay(); history.replaceState(null, '', location.pathname + location.search); };
    if (lenis) { lenis.scrollTo(0, { duration: 1.1, onComplete: done }); return; }
    if (scrollY < 2) { done(); return; }
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const t0 = performance.now();
    const wait = () => (scrollY < 2 || performance.now() - t0 > 2000) ? done() : requestAnimationFrame(wait);
    requestAnimationFrame(wait);
  };
  document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toTop(); }));

  /* In-page links land below the sticky header */
  document.querySelectorAll('a[href^="#"]:not([href="#top"])').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (a.dataset.tab) { const t = document.getElementById('mt-' + a.dataset.tab); if (t) select(t); }
    goTo(el);
    history.replaceState(null, '', id);
  }));

  /* Hero video: starts at once (its poster is preloaded) */
  const hero = document.querySelector('.hero');
  const heroMedia = hero.querySelector('.hero__media');
  requestAnimationFrame(() => hero.classList.add('is-ready'));
  if (!phone() && heroMedia.dataset.poster) heroMedia.poster = heroMedia.dataset.poster;
  if (!saveData) { heroMedia.src = phone() ? heroMedia.dataset.srcSm : heroMedia.dataset.src; heroMedia.play().catch(() => {}); }
  new IntersectionObserver(([e]) => { if (!saveData) e.isIntersecting ? heroMedia.play().catch(() => {}) : heroMedia.pause(); }).observe(hero);

  /* Other videos: load a screen early, play only while seen. Card loops fade in over their still once playing. */
  const vids = [...document.querySelectorAll('main video[data-src]')].filter(v => v !== heroMedia);
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target, card = v.closest('.card');
    if (e.isIntersecting) {
      if (!v.poster && v.dataset.poster) v.poster = phone() && v.dataset.posterSm ? v.dataset.posterSm : v.dataset.poster;
      if (saveData) return;
      if (!v.src) v.src = phone() && v.dataset.srcSm ? v.dataset.srcSm : v.dataset.src;
      v.play().then(() => card && card.classList.add('is-live')).catch(() => {});
    } else v.pause();
  }), { rootMargin: '60% 0px' });
  vids.forEach(v => vio.observe(v));

  /* Entrances: each block rises in once as it comes on screen, a few at a time (fades only with Reduce Motion) */
  const SEL = '.hero__title,.hero__lede,.hero__cta,.head,.card,.poster__text,.msec__head,.mi,.barsec__pic,.barsec__text,.glass,.find__text,.find__logo,.menu__foot';
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  const items = [...document.querySelectorAll(SEL)];
  items.forEach(el => { el.setAttribute('data-rise', ''); el.style.setProperty('--i', [...el.parentNode.children].indexOf(el) % 4); rio.observe(el); });
  function replay() {
    hero.classList.remove('is-ready'); void hero.offsetWidth; hero.classList.add('is-ready');
    items.forEach(el => { el.classList.remove('in'); rio.unobserve(el); });
    requestAnimationFrame(() => requestAnimationFrame(() => items.forEach(el => rio.observe(el))));
  }

  /* Scroll-linked depth (GSAP ScrollTrigger). Transform only; nothing here runs with Reduce Motion. */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 821px)', narrow: '(max-width: 820px)', calm: '(prefers-reduced-motion: reduce)' }, ctx => {
      const { wide, calm } = ctx.conditions;
      if (calm) return;
      // 1. Hero: the dumpling drifts up slower than the words; the words lift and fade as the hero leaves
      gsap.to('.hero__pic', { yPercent: -10, scale: 1.06, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__text', { yPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true } });
      // 2. Signature cards: each photo shifts inside its frame as the card passes
      gsap.utils.toArray('.card__pic').forEach(pic => {
        gsap.fromTo(pic.querySelectorAll('img,video'), { yPercent: -7, scale: 1.14 }, { yPercent: 7, scale: 1.14, ease: 'none',
          scrollTrigger: { trigger: pic, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // 3. Toss: the wok zooms out from close up and the word glides up; on desktop the section holds while it happens
      const toss = gsap.timeline({ scrollTrigger: { trigger: '.poster', start: wide ? () => `top ${barH()}px` : 'top 80%', end: wide ? '+=70%' : 'bottom 40%',
        pin: wide, scrub: 0.6, anticipatePin: 1 } });
      toss.fromTo('.poster__media', { scale: 1.32 }, { scale: 1, ease: 'none' }, 0)
          .fromTo('.poster__word', { yPercent: 60 }, { yPercent: 0, ease: 'power2.out' }, 0)
          .fromTo('.poster__cap', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power2.out' }, 0.25);
      // 4. Bar: the pour moves gently inside its frame
      gsap.fromTo('.barsec__media', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: '.barsec__pic', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* Header gets its hairline once the page moves */
  const solid = () => bar.classList.toggle('is-solid', scrollY > 8);
  addEventListener('scroll', solid, { passive: true }); solid();
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
