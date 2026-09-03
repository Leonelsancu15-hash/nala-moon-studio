/* =====================================================================
   Nala Moon Studio — main.js
   1. Lenis (ein einziger Smooth-Scroll) an GSAP ScrollTrigger gekoppelt
   2. Wort-Splitting mit intaktem Accessible Name
   3. Der Film: Blob-gepuffert, per Scroll gescrubbt, Poster bis zum ersten Frame
   4. Intro + Choreografie (Hero, Kapitel, feste Abschnitte, Parallax)
   5. Kollektion als 3D-Galerie (gepinnt am Desktop, Snap-Scroller mobil)
   6. Navigation, Cursor, magnetische Buttons, Tilt
   7. Produktdetail + Warenkorb (localStorage) + Checkout-Anbindung
   8. Hinweise (Speicherung, abgebrochener Checkout)
   Alles fällt sauber zurück: ohne JS ist alles sichtbar, unter
   prefers-reduced-motion gibt es weder Smooth-Scroll noch Film noch Sterne.
   ===================================================================== */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const html = document.documentElement;
  const isIndex = document.body.classList.contains('is-index');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const motion = isIndex && hasGSAP && !prefersReduced;

  // Von scene.js gelesen: Gesamt-Scroll, Kino-Fortschritt, Abdunklung.
  window.NM = { scroll: 0, cinema: 0, dim: 0 };

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ============================================================
     1. SMOOTH SCROLL — Lenis, über den GSAP-Ticker getaktet
     ============================================================ */
  let lenis = null;
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: 'power3.out', duration: 0.85 });
  }
  if (motion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, anchors: { offset: -72 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.NM.lenis = lenis; // für Tests und Debugging
  }
  const lockScroll = (on) => {
    document.body.classList.toggle('is-locked', on);
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  };

  /* ============================================================
     2. WORT-SPLITTING — Maske pro Wort, Accessible Name bleibt ganz
     ============================================================ */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.wi', el);
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    const frag = document.createDocumentFragment();
    const walk = (node, cls) => {
      Array.prototype.forEach.call(node.childNodes, (n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            const wi = document.createElement('span'); wi.className = 'wi' + (cls ? ' ' + cls : ''); wi.textContent = p;
            w.appendChild(wi); frag.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { frag.appendChild(document.createElement('br')); return; }
          walk(n, (cls ? cls + ' ' : '') + (n.className || n.tagName.toLowerCase()));
        }
      });
    };
    walk(el, '');
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.splitDone = '1';
    return $$('.wi', el);
  }

  /* ============================================================
     3. DER FILM — Blob-gepuffert, Seeks zusammengefasst, iOS geprimt
     ============================================================ */
  const FILM = {
    desktop:  { mp4: 'assets/film/nalamoon-desktop.mp4',  webm: 'assets/film/nalamoon-desktop.webm',  poster: 'assets/film/nalamoon-desktop-poster.jpg' },
    mobile:   { mp4: 'assets/film/nalamoon-mobile.mp4',   webm: 'assets/film/nalamoon-mobile.webm',   poster: 'assets/film/nalamoon-mobile-poster.jpg' },
    portrait: { mp4: 'assets/film/nalamoon-portrait.mp4', webm: 'assets/film/nalamoon-portrait.webm', poster: 'assets/film/nalamoon-portrait-poster.jpg' },
  };
  const TOTAL_LAYERS = 412; // 82,4 mm Bauhöhe bei 0,2 mm Schichten

  const film = (function () {
    const api = { ready: false, setProgress: function () {} };
    const stage = $('#stage'), video = $('#stageFilm'), posterImg = $('#stagePoster img');
    if (!stage || !video || !motion) return api;

    const portrait = window.matchMedia('(orientation: portrait) and (max-width: 899px)').matches;
    const variant = portrait ? FILM.portrait : (window.innerWidth <= 1024 ? FILM.mobile : FILM.desktop);
    if (posterImg && !portrait && variant === FILM.mobile) posterImg.src = variant.poster;

    const canH264 = !!video.canPlayType && video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    const canVP9 = !!video.canPlayType && video.canPlayType('video/webm; codecs="vp9"') !== '';
    const src = canH264 ? variant.mp4 : (canVP9 ? variant.webm : null);
    if (!src) return api;

    let duration = 0, target = 0, pending = false, seeking = false, lastApplied = -1, blobUrl = null, primed = false;

    const markReady = () => {
      if (api.ready) return;
      api.ready = true;
      stage.classList.add('is-ready');
      if (hasGSAP) ScrollTrigger.refresh();
    };
    const applySeek = () => {
      pending = false;
      if (!duration || seeking) return;
      const t = Math.min(duration - 0.04, Math.max(0, target * duration));
      if (Math.abs(t - lastApplied) < 1 / 90) return;
      seeking = true; lastApplied = t;
      try { video.currentTime = t; } catch (e) { seeking = false; }
    };
    const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(applySeek); } };

    video.addEventListener('seeked', () => {
      seeking = false;
      markReady();
      if (duration && Math.abs(target * duration - lastApplied) > 1 / 60) schedule();
    });
    video.addEventListener('loadeddata', markReady, { once: true });
    video.addEventListener('loadedmetadata', () => { duration = video.duration || 0; lastApplied = -1; schedule(); });

    // iOS/Safari: die erste Geste schaltet stummes Suchen frei.
    const prime = () => {
      if (primed) return; primed = true;
      const p = video.play();
      if (p && p.then) p.then(() => video.pause()).catch(() => {});
    };
    ['touchstart', 'pointerdown', 'keydown', 'wheel'].forEach((ev) => window.addEventListener(ev, prime, { once: true, passive: true }));

    fetch(src, { cache: 'force-cache' })
      .then((r) => { if (!r.ok) throw new Error('film ' + r.status); return r.blob(); })
      .then((b) => { blobUrl = URL.createObjectURL(b); video.src = blobUrl; video.load(); })
      .catch(() => { /* Datei fehlt oder offline: das Poster bleibt, die Seite funktioniert. */ });

    window.addEventListener('pagehide', () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, { once: true });
    api.setProgress = (p) => { target = p; schedule(); };
    return api;
  })();

  /* ============================================================
     4. INTRO + CHOREOGRAFIE
     ============================================================ */
  const veil = $('#veil');
  const liftVeil = () => { if (veil) veil.classList.add('is-lifted'); };

  if (motion) {
    /* Hero */
    const heroSplits = $$('#heroTitle .split');
    const heroWords = [].concat.apply([], heroSplits.map(splitWords));
    heroSplits.forEach((el) => el.classList.add('is-ready'));
    const intro = $$('.hero [data-intro]');
    gsap.set(heroWords, { yPercent: 110 });
    gsap.set(intro, { opacity: 0, y: 22 });
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    heroTl
      .to(heroWords, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0.05)
      .to(intro, { opacity: 1, y: 0, duration: 1, stagger: 0.12, onComplete: () => intro.forEach((el) => el.classList.add('is-visible')) }, 0.5);
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.all([fontsReady, new Promise((r) => setTimeout(r, 380))]).then(() => { liftVeil(); heroTl.play(); ScrollTrigger.refresh(); });
    setTimeout(() => { liftVeil(); if (heroTl.progress() === 0 && !heroTl.isActive()) heroTl.play(); }, 3500);

    gsap.to('.hero-content', { yPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom 40%', scrub: 0.5 } });
    gsap.to('.hero-foot', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: '35% top', scrub: true } });

    /* Der Film läuft über Hero + drei Kapitel; das HUD zählt die Schichten. */
    const cinemaEnd = $('#kapitel-3') || $('#top');
    const hud = $('#printHud'), hudLayer = $('#hudLayer'), hudFill = $('#hudFill');
    ScrollTrigger.create({
      trigger: '#top', start: 'top top', endTrigger: cinemaEnd, end: 'bottom bottom', scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        window.NM.cinema = p;
        film.setProgress(p);
        if (hudLayer) hudLayer.textContent = String(Math.round(p * TOTAL_LAYERS)).padStart(3, '0');
        if (hudFill) hudFill.style.transform = 'scaleX(' + p + ')';
      },
    });
    ScrollTrigger.create({ trigger: '#top', start: '6% top', endTrigger: cinemaEnd, end: 'bottom 70%', onToggle: (s) => { if (hud) hud.classList.toggle('is-on', s.isActive); } });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { window.NM.scroll = s.progress; } });

    /* Die Bühne dunkelt ab, wenn die festen Abschnitte kommen, und wird geparkt, sobald sie verdeckt ist. */
    const dim = $('#stageDim'), stage = $('#stage');
    ScrollTrigger.create({ trigger: '#reise', start: 'top bottom', end: 'top 25%', scrub: 0.4, onUpdate: (s) => { window.NM.dim = s.progress; if (dim) dim.style.opacity = String(s.progress * 0.85); } });
    ScrollTrigger.create({ trigger: '#reise', start: 'top top', end: 'bottom top', onEnter: () => { if (stage) stage.classList.add('is-parked'); }, onLeaveBack: () => { if (stage) stage.classList.remove('is-parked'); } });

    /* Kapitel: Worte steigen auf, wenn das Kapitel kommt, die Karte löst sich beim Verlassen. */
    $$('.chapter').forEach((ch) => {
      const title = $('.split', ch);
      const words = title ? splitWords(title) : [];
      if (title) title.classList.add('is-ready');
      const reveals = $$('.reveal', ch);
      gsap.set(words, { yPercent: 110 });
      gsap.set(reveals, { opacity: 0, y: 26 });
      gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 65%', end: 'top 15%', toggleActions: 'play none none reverse' }, defaults: { ease: 'power4.out' } })
        .to(words, { yPercent: 0, duration: 1.1, stagger: 0.05 }, 0)
        .to(reveals, { opacity: 1, y: 0, duration: 1, stagger: 0.1, onStart: () => reveals.forEach((r) => r.classList.add('is-visible')) }, 0.25);
      gsap.to($('.chapter-copy', ch), { opacity: 0, y: -30, ease: 'none', scrollTrigger: { trigger: ch, start: 'bottom 70%', end: 'bottom 30%', scrub: 0.5 } });
    });

    /* Feste Abschnitte: Überschriften wortweise, Inhalte einmalig. */
    $$('.solid .split, .band .split').forEach((el) => {
      const words = splitWords(el);
      el.classList.add('is-ready');
      gsap.set(words, { yPercent: 110 });
      gsap.to(words, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.04, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.solid .reveal, .band .reveal').forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onStart: () => el.classList.add('is-visible') });
    });

    /* Parallax: Hintergrund langsamer, Text stabil. */
    $$('[data-parallax]').forEach((el) => {
      const img = el.tagName === 'IMG' ? el : $('img', el);
      if (!img) return;
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(img, { yPercent: -speed * 40 }, { yPercent: speed * 40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    const stepsFill = $('#stepsFill');
    if (stepsFill) gsap.fromTo(stepsFill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 } });

    gsap.fromTo('.footer-giant', { yPercent: 35 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });

    initGallery();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    liftVeil();
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    $$('.split').forEach((el) => el.classList.add('is-ready'));
    $$('[data-intro]').forEach((el) => el.classList.add('is-visible'));
  }

  /* ============================================================
     5. KOLLEKTION — 3D-Galerie
     Desktop: gepinnt, der Scroll fährt die Kamera an den Karten entlang.
     Mobil: nativer Snap-Scroller, dieselbe Tiefenstaffelung.
     ============================================================ */
  function initGallery() {
    const gallery = $('#gallery'), track = $('#galleryTrack');
    if (!gallery || !track) return;
    const cards = $$('.product', track);
    if (!cards.length) return;
    let x = 0;
    const isMobile = () => window.innerWidth < 900;

    const cardCenter = (card) => {
      if (isMobile()) {
        const tr = track.getBoundingClientRect();
        return tr.left + card.offsetLeft + card.offsetWidth / 2 - track.scrollLeft;
      }
      return gallery.getBoundingClientRect().left + x + card.offsetLeft + card.offsetWidth / 2;
    };
    const layout = () => {
      const mid = window.innerWidth / 2;
      const spread = isMobile() ? 0.9 : 0.62;
      cards.forEach((card) => {
        const a = Math.max(-1, Math.min(1, (cardCenter(card) - mid) / (window.innerWidth * spread)));
        const ab = Math.abs(a);
        card.style.transform = 'translateZ(' + (-ab * 240).toFixed(1) + 'px) rotateY(' + (-a * 26).toFixed(2) + 'deg) scale(' + (1 - ab * 0.1).toFixed(3) + ')';
        card.style.opacity = String(1 - ab * 0.3);
      });
    };
    const reset = () => cards.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const travel = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -travel(), ease: 'none',
        scrollTrigger: {
          trigger: gallery, start: 'top top', end: () => '+=' + (travel() + window.innerHeight * 0.4),
          pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: () => { x = gsap.getProperty(track, 'x'); layout(); },
          onRefresh: () => { x = gsap.getProperty(track, 'x'); layout(); },
        },
      });
      layout();
      return () => { tween.kill(); x = 0; reset(); };
    });
    mm.add('(max-width: 899px)', () => {
      let ticking = false;
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; layout(); }); } };
      track.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      layout();
      return () => { track.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); reset(); };
    });
  }

  /* ============================================================
     6. NAVIGATION, CURSOR, MAGNETIK, TILT
     ============================================================ */
  const nav = $('#siteNav');
  if (nav) {
    let lastY = window.scrollY, ticking = false;
    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      const menuOpen = nav.querySelector('.nav-links.open');
      if (!menuOpen && !prefersReduced) {
        if (y > lastY + 6 && y > 320) nav.classList.add('is-hidden');
        else if (y < lastY - 6) nav.classList.remove('is-hidden');
      }
      lastY = y; ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  (function mobileMenu() {
    const burger = $('#navBurger'), links = $('#navLinks'), backdrop = $('#navBackdrop');
    if (!burger || !links) return;
    const set = (open) => {
      links.classList.toggle('open', open);
      if (backdrop) backdrop.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    };
    burger.addEventListener('click', () => set(!links.classList.contains('open')));
    if (backdrop) backdrop.addEventListener('click', () => set(false));
    $$('a', links).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('open')) set(false); });
  })();

  if (isIndex && finePointer && !prefersReduced && hasGSAP) {
    const cur = $('#cursor'), dot = $('#cursorDot');
    if (cur && dot) {
      html.classList.add('has-cursor');
      const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }, ring = { x: pos.x, y: pos.y };
      window.addEventListener('pointermove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
      gsap.ticker.add(() => {
        ring.x += (pos.x - ring.x) * 0.16; ring.y += (pos.y - ring.y) * 0.16;
        cur.style.transform = 'translate(' + ring.x + 'px,' + ring.y + 'px) translate(-50%,-50%)';
        dot.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px) translate(-50%,-50%)';
      });
      const hoverSel = 'a, button, summary, input, label, .product-media';
      document.addEventListener('pointerover', (e) => { if (e.target.closest(hoverSel)) cur.classList.add('is-hover'); });
      document.addEventListener('pointerout', (e) => { if (e.target.closest(hoverSel)) cur.classList.remove('is-hover'); });
      const hide = () => { cur.classList.add('is-hidden'); dot.classList.add('is-hidden'); };
      const show = () => { cur.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); };
      document.addEventListener('mouseleave', hide);
      document.addEventListener('mouseenter', show);
      window.addEventListener('blur', hide);
      window.addEventListener('focus', show);
    }
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    $$('.tilt, .product').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power2.out' });
      const ry = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power2.out' });
      const isProduct = card.classList.contains('product');
      if (!isProduct) gsap.set(card, { transformPerspective: 1000 });
      card.addEventListener('pointermove', (e) => {
        if (isProduct) return; // Produktkarten werden von der Galerie positioniert
        const r = card.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -5);
        ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      });
      card.addEventListener('pointerleave', () => { if (!isProduct) { rx(0); ry(0); } });
    });
  }

  /* ============================================================
     7. PRODUKTDETAIL + WARENKORB + CHECKOUT
     ============================================================ */
  const PRODUCTS = [
    { slug: 'mond-namensschild', name: 'Mond-Namensschild', price: 18.00, img: 'assets/img/product-mond-namensschild',
      desc: 'Personalisiertes Namensschild im Moon-Glitter-Look — perfekt fürs Kinderzimmer.',
      details: ['PLA-Filament, Glitter-Finish', 'Wunschname & Farbe wählbar', 'Ca. 15–25 cm breit', 'Inkl. Aufhängung'] },
    { slug: 'fantasy-kreatur', name: 'Fantasy-Kreatur', price: 24.00, img: 'assets/img/product-fantasy-kreatur',
      desc: 'Kleine Drachenfigur aus schillerndem Seiden-Filament — jedes Stück ein Unikat.',
      details: ['Silk-PLA, mehrfarbig schillernd', 'Ca. 8–15 cm hoch', 'Handbemalte Details möglich', 'Einzelstück-Charakter'] },
    { slug: 'geburtstags-topper', name: 'Geburtstags-Topper', price: 9.00, img: 'assets/img/product-geburtstags-topper',
      desc: 'Individueller Cake Topper mit Wunschtext für jeden Anlass.',
      details: ['PLA, lebensmittelecht verpackt', 'Wunschtext frei wählbar', 'Wiederverwendbar', 'Verschiedene Farben'] },
    { slug: 'alltagsheld-organizer', name: 'Alltagsheld Organizer', price: 14.00, img: 'assets/img/product-alltagsheld-organizer',
      desc: 'Praktischer Fernbedienungs- & Kabel-Organizer für Wohnzimmer und Schreibtisch.',
      details: ['PETG, robust & langlebig', 'Ca. 10–30 cm', 'Rutschfeste Standfläche', 'Mehrere Farben auf Anfrage'] },
    { slug: 'medaillen-halter', name: 'Medaillen-Halter', price: 22.00, img: 'assets/img/product-medaillen-halter',
      desc: 'Wandhalter für Sport-Medaillen, personalisierbar mit Name und Sportart.',
      details: ['PLA, matt lackierbar', 'Personalisierung mit Namen', 'Wandmontage inklusive', 'Für bis zu 15 Medaillen'] },
    { slug: 'boho-vasen-set', name: 'Boho Vasen-Set', price: 19.00, img: 'assets/img/product-boho-vasen-set',
      desc: 'Dekoratives Vasen-Duo im geriffelten Wellen-Design für dein Zuhause.',
      details: ['PLA, seidig matt', 'Ca. 12–20 cm hoch', '2er-Set', 'Wasserdicht mit Einsatz'] },
  ];
  const bySlug = (s) => PRODUCTS.find((p) => p.slug === s);

  // Wird gesetzt, sobald der Cloudflare Worker deployed ist (siehe cloudflare-worker/SETUP.md).
  const CHECKOUT_API_URL = ''; // z. B. 'https://nala-moon-checkout.DEIN-SUBDOMAIN.workers.dev'
  const CART_KEY = 'nms_cart_v1';
  const fmt = (n) => n.toFixed(2).replace('.', ',') + ' €';

  const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } };
  const saveCart = (cart) => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} renderCart(); };
  const cartCount = () => getCart().reduce((s, i) => s + (i.qty || 0), 0);
  const cartTotal = () => getCart().reduce((s, i) => { const p = bySlug(i.slug); return s + (p ? p.price * i.qty : 0); }, 0);

  const toastEl = $('#toast');
  let toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }

  /* Dialoge: Öffnen/Schließen mit Fokus-Rückgabe und einfacher Fokus-Falle */
  let lastFocus = null;
  function openDialog(el) {
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    lockScroll(true);
    const first = el.querySelector('.modal-close, button, [href], input');
    if (first) first.focus({ preventScroll: true });
  }
  function closeDialog(el) {
    if (!el || el.hidden) return;
    el.classList.remove('is-open');
    lockScroll(false);
    setTimeout(() => { el.hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function wireDialog(el) {
    if (!el) return;
    $$('[data-close]', el).forEach((c) => c.addEventListener('click', () => closeDialog(el)));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeDialog(el); return; }
      if (e.key !== 'Tab') return;
      const f = $$('button:not([disabled]), [href], input:not([disabled]), summary', el).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  const modal = $('#productModal'), drawer = $('#cartDrawer');
  wireDialog(modal); wireDialog(drawer);

  function openProduct(slug) {
    const p = bySlug(slug);
    if (!p || !modal) return;
    const img = $('#modalImg');
    if (img) { img.src = p.img + '.jpg'; img.alt = p.name; }
    $('#modalName').textContent = p.name;
    $('#modalPrice').textContent = fmt(p.price);
    $('#modalDesc').textContent = p.desc;
    $('#modalDetails').innerHTML = p.details.map((d) => '<li>' + d + '</li>').join('');
    $('#modalQty').value = 1;
    $('#modalAddBtn').dataset.slug = p.slug;
    openDialog(modal);
  }

  function addToCart(slug, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.slug === slug);
    if (item) item.qty = Math.min(20, item.qty + qty); else cart.push({ slug: slug, qty: qty });
    saveCart(cart);
    const btn = $('#cartToggle');
    if (btn) { btn.classList.add('bump'); setTimeout(() => btn.classList.remove('bump'), 450); }
    const p = bySlug(slug);
    toast((p ? p.name : 'Artikel') + ' liegt im Warenkorb');
    openDialog(drawer);
  }

  function renderCart() {
    const items = $('#cartItems'), total = $('#cartTotal'), count = $('#cartCount');
    const cart = getCart();
    if (count) { count.textContent = String(cartCount()); if (cartCount() === 0) count.setAttribute('data-zero', ''); else count.removeAttribute('data-zero'); }
    if (!items) return;
    if (!cart.length) {
      items.innerHTML = '<p class="cart-empty">Dein Warenkorb ist noch leer.</p>';
    } else {
      items.innerHTML = cart.map((i) => {
        const p = bySlug(i.slug); if (!p) return '';
        return '<div class="cart-item" data-slug="' + p.slug + '">' +
          '<img src="' + p.img + '-600.jpg" alt="" width="64" height="80" loading="lazy">' +
          '<div><span class="cart-item-name">' + p.name + '</span><span class="cart-item-price">' + fmt(p.price) + '</span>' +
          '<div class="cart-item-qty"><button type="button" class="qty-dec" aria-label="Menge verringern">−</button>' +
          '<input class="qty-input" type="number" min="1" max="20" value="' + i.qty + '" aria-label="Menge">' +
          '<button type="button" class="qty-inc" aria-label="Menge erhöhen">+</button></div></div>' +
          '<button type="button" class="cart-item-remove" aria-label="' + p.name + ' entfernen">&times;</button></div>';
      }).join('');
    }
    if (total) total.textContent = fmt(cartTotal());
    $$('.cart-item', items).forEach((row) => {
      const slug = row.dataset.slug;
      const setQty = (q) => { const c = getCart(); const it = c.find((i) => i.slug === slug); if (!it) return; it.qty = Math.max(1, Math.min(20, q || 1)); saveCart(c); };
      $('.qty-dec', row).addEventListener('click', () => setQty(parseInt($('.qty-input', row).value, 10) - 1));
      $('.qty-inc', row).addEventListener('click', () => setQty(parseInt($('.qty-input', row).value, 10) + 1));
      $('.qty-input', row).addEventListener('change', (e) => setQty(parseInt(e.target.value, 10)));
      $('.cart-item-remove', row).addEventListener('click', () => saveCart(getCart().filter((i) => i.slug !== slug)));
    });
  }

  $$('.product').forEach((card) => {
    const slug = card.dataset.slug;
    if (!bySlug(slug)) return;
    const media = $('.product-media', card), title = $('h3', card), buy = $('.product-buy', card);
    if (media) media.addEventListener('click', () => openProduct(slug));
    if (title) { title.style.cursor = 'pointer'; title.addEventListener('click', () => openProduct(slug)); }
    if (buy) buy.addEventListener('click', () => addToCart(slug, 1));
  });
  const modalAdd = $('#modalAddBtn');
  if (modalAdd) modalAdd.addEventListener('click', () => {
    const qty = Math.max(1, Math.min(20, parseInt($('#modalQty').value, 10) || 1));
    closeDialog(modal);
    setTimeout(() => addToCart(modalAdd.dataset.slug, qty), 300);
  });
  const cartToggle = $('#cartToggle');
  if (cartToggle) cartToggle.addEventListener('click', () => openDialog(drawer));

  const checkoutBtn = $('#cartCheckoutBtn'), checkoutNote = $('#checkoutNote');
  if (checkoutBtn) checkoutBtn.addEventListener('click', async () => {
    const cart = getCart();
    if (!cart.length) { if (checkoutNote) checkoutNote.textContent = 'Leg zuerst etwas in den Warenkorb.'; return; }
    if (!CHECKOUT_API_URL) {
      if (checkoutNote) checkoutNote.innerHTML = 'Der Checkout wird gerade eingerichtet. Schreib mir solange gern per <a href="https://www.instagram.com/nala_moon_studio" target="_blank" rel="noopener noreferrer">Instagram</a> oder <a href="mailto:Nalamoonstudio@outlook.com">E-Mail</a> — dann klären wir alles persönlich.';
      return;
    }
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Weiterleitung …';
    try {
      const res = await fetch(CHECKOUT_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart }) });
      const data = await res.json();
      if (data && data.url) { window.location.href = data.url; return; }
      throw new Error((data && data.error) || 'Checkout fehlgeschlagen');
    } catch (err) {
      if (checkoutNote) checkoutNote.textContent = 'Der Checkout ist gerade nicht erreichbar. Bitte versuch es gleich noch einmal.';
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Zur Kasse';
    }
  });
  renderCart();

  /* ============================================================
     8. HINWEISE
     ============================================================ */
  (function storageNotice() {
    const KEY = 'nms_cookie_notice_dismissed';
    const notice = $('#cookieNotice'), ok = $('#cookieNoticeOk');
    if (!notice || !ok) return;
    let dismissed = false;
    try { dismissed = !!localStorage.getItem(KEY); } catch (e) {}
    if (!dismissed) setTimeout(() => notice.classList.add('visible'), 1800);
    ok.addEventListener('click', () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} notice.classList.remove('visible'); });
  })();

  (function cancelledCheckout() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cart') !== 'cancelled') return;
    toast('Checkout abgebrochen — dein Warenkorb ist noch gespeichert.');
    params.delete('cart');
    const q = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
  })();
})();
