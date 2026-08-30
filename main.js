document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  gsap.registerPlugin(ScrollTrigger);

  // Verhindert, dass ScrollTrigger bei jeder kleinen Viewport-Höhen-Änderung
  // (mobile Safari Adressleiste ein-/ausblenden) neu berechnet - Standard-Fix
  // gegen ruckelige/springende Scroll-Animationen auf iOS Safari.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sternenfeld im Hero generieren ---------- */
  const starField = document.getElementById('starField');
  if (starField) {
    const STAR_COUNT = 60;
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      const size = Math.random() * 2.4 + 0.6;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
      starField.appendChild(star);
    }
    if (!prefersReduced) {
      gsap.utils.toArray('.star').forEach((star, i) => {
        gsap.to(star, {
          opacity: Math.random() * 0.5 + 0.2,
          duration: 1.5 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.05
        });
      });
    }
  }

  /* ---------- NAV background on scroll ---------- */
  const nav = document.getElementById('siteNav');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.scroll() > 80);
    }
  });

  /* ---------- HERO entrance ---------- */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('#heroMoon', { opacity: 0, y: 40, scale: .7, rotate: -12, duration: 1.2 })
    .to('.hero-title .line', { opacity: 1, y: 0, duration: .9, stagger: .15 }, '-=.7')
    .to('.hero .reveal-up', { opacity: 1, y: 0, duration: .8, stagger: .12 }, '-=.5');

  /* ---------- Generic scroll reveals for everything below the hero ---------- */
  document.querySelectorAll('section:not(.hero) .reveal-up').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  /* Stagger product cards */
  gsap.utils.toArray('.placeholder-grid .product-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: .8, delay: i * 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' }
    });
  });

  if (!prefersReduced) {
    /* ---------- Parallax hero glow ---------- */
    gsap.to('.hero-glow', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.to('#heroMoon', {
      yPercent: -40,
      scale: .85,
      opacity: .4,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.to('.star-field', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* ---------- Mond-Wasserzeichen rotate/scale in Story ---------- */
    gsap.to('#storyWatermark', {
      rotate: 18,
      scale: 1.15,
      ease: 'none',
      scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.fromTo('.story-inner', { rotateX: 6, transformPerspective: 800 }, {
      rotateX: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.story', start: 'top 80%', end: 'top 20%', scrub: true }
    });
  }

  /* ================= ORIGIN STORY — cinematic pinned scene ================= */
  const originSection = document.getElementById('origin');
  if (originSection && !prefersReduced) {
    const originTl = gsap.timeline({
      scrollTrigger: {
        trigger: originSection,
        start: 'top top',
        end: '+=220%',
        scrub: 0.6,
        pin: '#originPin'
      }
    });

    originTl
      .to('#originMoon', { opacity: 1, scale: 1, y: 40, duration: 1 }, 0)
      .to('#originBadge', { opacity: 1, y: 0, duration: 0.6 }, 0.15)
      .to('#originEyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.3)
      .to('#originHeading', { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .to('#originP1', { opacity: 1, y: 0, duration: 0.7 }, 0.9)
      .to('#originMoon', { y: -20, scale: 1.15 }, 1.0)
      .to('#originP1', { opacity: 0.15, duration: 0.4 }, 1.5)
      .to('#originP2', { opacity: 1, y: 0, duration: 0.7 }, 1.55)
      .to('#originMoon', { y: -60, scale: 1.3, rotate: 12 }, 1.9)
      .to('#originP2', { opacity: 0.15, duration: 0.4 }, 2.2)
      .to('#originP3', { opacity: 1, y: 0, duration: 0.7 }, 2.25)
      .to('#originMoon', { y: -100, scale: 1.5, rotate: -8 }, 2.6)
      .to('#originP3', { opacity: 0.15, duration: 0.4 }, 2.9)
      .to('#originSignoff', { opacity: 1, y: 0, duration: 0.8 }, 2.95);

    // Setzt die Anfangswerte für alle animierten Elemente (sonst kurz sichtbar vor Scroll-Start)
    gsap.set(['#originBadge', '#originEyebrow', '#originHeading', '#originP1', '#originP2', '#originP3', '#originSignoff'], { y: 30 });
  } else if (originSection && prefersReduced) {
    // Reduced motion: alles direkt sichtbar, kein Pinning
    gsap.set(['#originMoon', '#originBadge', '#originEyebrow', '#originHeading', '#originP1', '#originP2', '#originP3', '#originSignoff'], { opacity: 1, y: 0, scale: 1 });
  }

  /* ================= PROCESS — pinned timeline draw ================= */
  const processTrack = document.querySelector('.process-track');
  if (processTrack) {
    gsap.to('#processLineFill', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: processTrack,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6
      }
    });

    gsap.utils.toArray('.process-step').forEach((step) => {
      gsap.fromTo(step,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
    });
  }

  /* ---------- Newsletter Cookie Notice already handled inline in index.html ---------- */
});

/* ================= BOLD CINEMATIC SCROLL FX v2 ================= */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const prefersReducedV2 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedV2) return;

  gsap.to('.hero-title', {
    scale: 1.15, opacity: 0.15, yPercent: -20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });

  // Hinweis: "section h2" schließt bewusst .origin aus — die Origin-Story-Überschrift
  // (#originHeading) wird bereits exklusiv von der gepinnten Cinematic-Timeline oben
  // gesteuert. Ohne den Ausschluss laufen hier zwei unabhängige Scroll-Animationen auf
  // demselben Element gegeneinander, was auf Mobilgeräten zu Ruckeln/Flackern führte.
  gsap.utils.toArray('.section-title, section:not(.origin) h2').forEach((el) => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 0 100% 0)', scale: 1.06 },
      {
        clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('section:not(.hero):not(.origin) .reveal-up').forEach((el) => {
    gsap.fromTo(el,
      { rotateX: -12, scale: 0.92, transformPerspective: 900, transformOrigin: '50% 100%' },
      {
        rotateX: 0, scale: 1, duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.placeholder-grid .product-card').forEach((card, i) => {
    gsap.fromTo(card,
      { scale: 0.8, rotateY: -18, transformPerspective: 1000 },
      {
        scale: 1, rotateY: 0, duration: 1, delay: i * 0.06, ease: 'power4.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.values-inner .value-item').forEach((item, i) => {
    gsap.fromTo(item,
      { rotateX: -25, transformPerspective: 800 },
      {
        rotateX: 0, duration: 1, delay: i * 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.size-table tbody tr').forEach((row, i) => {
    gsap.fromTo(row,
      { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
      {
        opacity: 1, x: 0, duration: .8, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.faq-item').forEach((item, i) => {
    gsap.fromTo(item,
      { scale: 0.96 },
      {
        scale: 1, duration: .9, delay: i * 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.to('.hero-glow', {
    scale: 1.3, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });

  gsap.to('#heroMoon', {
    rotate: 10, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });

  gsap.to('#storyWatermark', {
    xPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
  });

  gsap.fromTo('.story-inner', { y: 60 }, {
    y: 0, ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top 85%', end: 'top 25%', scrub: 0.6 }
  });
});

/* ================= PRODUCT DETAIL + CART SYSTEM ================= */
document.addEventListener('DOMContentLoaded', () => {
  const PRODUCTS = [
    { slug: 'mond-namensschild', name: 'Mond-Namensschild', price: 18.00, icon: '🌙',
      desc: 'Personalisiertes Namensschild im Moon-Glitter-Look, perfekt fürs Kinderzimmer.',
      details: ['PLA-Filament, Glitter-Finish', 'Wunschname &amp; Farbe wählbar', 'Ca. 15–25 cm breit', 'Inkl. Aufhängung'] },
    { slug: 'fantasy-kreatur', name: 'Fantasy-Kreatur', price: 24.00, icon: '🐉',
      desc: 'Kleine Drachenfigur aus schillerndem Seiden-Filament — jedes Stück ein Unikat.',
      details: ['Silk-PLA, mehrfarbig schillernd', 'Ca. 8–15 cm hoch', 'Handbemalte Details möglich', 'Einzelstück-Charakter'] },
    { slug: 'geburtstags-topper', name: 'Geburtstags-Topper', price: 9.00, icon: '🎂',
      desc: 'Individueller Cake Topper mit Wunschtext für jeden Anlass.',
      details: ['PLA, lebensmittelecht verpackt', 'Wunschtext frei wählbar', 'Wiederverwendbar', 'Verschiedene Farben'] },
    { slug: 'alltagsheld-organizer', name: 'Alltagsheld Organizer', price: 14.00, icon: '📦',
      desc: 'Praktischer Fernbedienungs- &amp; Kabel-Organizer für Wohnzimmer und Schreibtisch.',
      details: ['PETG, robust &amp; langlebig', 'Ca. 10–30 cm', 'Rutschfeste Standfläche', 'Mehrere Farben auf Anfrage'] },
    { slug: 'medaillen-halter', name: 'Medaillen-Halter', price: 22.00, icon: '🏅',
      desc: 'Wandhalter für Sport-Medaillen, personalisierbar mit Name und Sportart.',
      details: ['PLA, matt lackierbar', 'Personalisierung mit Namen', 'Wandmontage inklusive', 'Für bis zu 15 Medaillen'] },
    { slug: 'boho-vasen-set', name: 'Boho Vasen-Set', price: 19.00, icon: '🏺',
      desc: 'Dekoratives Vasen-Duo im geriffelten Wellen-Design für dein Zuhause.',
      details: ['PLA, seidig matt', 'Ca. 12–20 cm hoch', '2er-Set', 'Wasserdicht mit Einsatz'] }
  ];
  const PRODUCT_BY_NAME = Object.fromEntries(PRODUCTS.map(p => [p.name, p]));

  // Wird erst gesetzt, sobald der Cloudflare Worker deployed ist (siehe cloudflare-worker/SETUP.md).
  // Bis dahin bleibt der Checkout-Button funktionsfähig, zeigt aber einen Hinweis statt echter Zahlung.
  const CHECKOUT_API_URL = ''; // z.B. 'https://nala-moon-checkout.DEIN-SUBDOMAIN.workers.dev'

  const CART_KEY = 'nms_cart_v1';
  const fmt = (n) => '€' + n.toFixed(2);

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { return []; }
  }
  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
    updateCartBadge();
  }
  function addToCart(slug, qty = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.slug === slug);
    if (existing) existing.qty += qty; else cart.push({ slug, qty });
    setCart(cart);
    openCart();
  }
  function removeFromCart(slug) {
    setCart(getCart().filter(i => i.slug !== slug));
  }
  function updateQty(slug, qty) {
    const cart = getCart();
    const item = cart.find(i => i.slug === slug);
    if (!item) return;
    item.qty = Math.max(1, Math.min(20, qty));
    setCart(cart);
  }
  function cartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }
  function cartTotal() {
    return getCart().reduce((sum, i) => {
      const p = PRODUCTS.find(p => p.slug === i.slug);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }

  const navInner = document.querySelector('.nav-inner');
  const cartBtn = document.createElement('button');
  cartBtn.id = 'cartToggle';
  cartBtn.className = 'cart-toggle';
  cartBtn.setAttribute('aria-label', 'Warenkorb öffnen');
  cartBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span class="cart-count" id="cartCount">0</span>';
  if (navInner) navInner.appendChild(cartBtn);

  const cartDrawer = document.createElement('div');
  cartDrawer.id = 'cartDrawer';
  cartDrawer.className = 'cart-drawer';
  cartDrawer.innerHTML = '<div class="cart-drawer-backdrop" id="cartBackdrop"></div><div class="cart-drawer-panel"><div class="cart-drawer-head"><h3>Dein Warenkorb</h3><button class="cart-close" id="cartClose" aria-label="Warenkorb schließen">&times;</button></div><div class="cart-items" id="cartItems"></div><div class="cart-footer"><div class="cart-total-row"><span>Zwischensumme</span><span id="cartTotal">€0.00</span></div><p class="cart-note">Versand &amp; Steuern werden im Checkout berechnet.</p><button class="btn btn-primary cart-checkout" id="cartCheckoutBtn">Zur Kasse</button><p class="cart-placeholder-note">Platzhalter-Katalog — finale Preise stehen mit dem echten Sortiment fest.</p></div></div>';
  document.body.appendChild(cartDrawer);

  const modal = document.createElement('div');
  modal.id = 'productModal';
  modal.className = 'product-modal';
  modal.innerHTML = '<div class="product-modal-backdrop" id="modalBackdrop"></div><div class="product-modal-panel"><button class="modal-close" id="modalClose" aria-label="Schließen">&times;</button><div class="modal-media"><span id="modalIcon"></span><span class="placeholder-tag">PLATZHALTER</span></div><div class="modal-info"><h2 id="modalName"></h2><p class="modal-price" id="modalPrice"></p><p class="modal-desc" id="modalDesc"></p><ul class="modal-details" id="modalDetails"></ul><p class="modal-size-link"><a href="#size-guide" id="modalSizeLink">Materialübersicht ansehen &rarr;</a></p><div class="modal-qty-row"><label for="modalQty">Menge</label><input type="number" id="modalQty" min="1" max="20" value="1"></div><button class="btn btn-primary modal-add" id="modalAddBtn">In den Warenkorb</button><p class="modal-placeholder-note">Angezeigte Produktinhalte sind Platzhaltertexte, bis der finale Katalog steht.</p></div>';
  document.body.appendChild(modal);

  function openModal(slug) {
    const p = PRODUCTS.find(p => p.slug === slug);
    if (!p) return;
    document.getElementById('modalIcon').textContent = p.icon;
    document.getElementById('modalName').textContent = p.name;
    document.getElementById('modalPrice').textContent = fmt(p.price);
    document.getElementById('modalDesc').innerHTML = p.desc;
    document.getElementById('modalDetails').innerHTML = p.details.map(d => '<li>' + d + '</li>').join('');
    document.getElementById('modalQty').value = 1;
    document.getElementById('modalAddBtn').dataset.slug = p.slug;
    modal.classList.add('open');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalAddBtn').addEventListener('click', (e) => {
    const slug = e.currentTarget.dataset.slug;
    const qty = parseInt(document.getElementById('modalQty').value) || 1;
    addToCart(slug, qty);
    closeModal();
  });
  document.getElementById('modalSizeLink').addEventListener('click', () => { closeModal(); });

  function openCart() {
    cartDrawer.classList.add('open');
    document.body.classList.add('modal-open');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
  document.getElementById('cartBackdrop').addEventListener('click', closeCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartBtn.addEventListener('click', openCart);

  function renderCart() {
    const cart = getCart();
    const itemsEl = document.getElementById('cartItems');
    if (!itemsEl) return;
    if (cart.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">Dein Warenkorb ist noch leer.</p>';
    } else {
      itemsEl.innerHTML = cart.map(i => {
        const p = PRODUCTS.find(p => p.slug === i.slug);
        if (!p) return '';
        return '<div class="cart-item" data-slug="' + p.slug + '"><span class="cart-item-icon">' + p.icon + '</span><div class="cart-item-info"><span class="cart-item-name">' + p.name + '</span><span class="cart-item-price">' + fmt(p.price) + '</span><div class="cart-item-qty"><button class="qty-dec">-</button><input type="number" class="qty-input" min="1" max="20" value="' + i.qty + '"><button class="qty-inc">+</button></div></div><button class="cart-item-remove" aria-label="Entfernen">&times;</button></div>';
      }).join('');
    }
    document.getElementById('cartTotal').textContent = fmt(cartTotal());

    itemsEl.querySelectorAll('.cart-item').forEach(row => {
      const slug = row.dataset.slug;
      row.querySelector('.qty-dec').addEventListener('click', () => {
        const input = row.querySelector('.qty-input');
        updateQty(slug, parseInt(input.value) - 1);
      });
      row.querySelector('.qty-inc').addEventListener('click', () => {
        const input = row.querySelector('.qty-input');
        updateQty(slug, parseInt(input.value) + 1);
      });
      row.querySelector('.qty-input').addEventListener('change', (e) => {
        updateQty(slug, parseInt(e.target.value) || 1);
      });
      row.querySelector('.cart-item-remove').addEventListener('click', () => {
        removeFromCart(slug);
      });
    });
  }
  function updateCartBadge() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = cartCount();
  }

  document.getElementById('cartCheckoutBtn').addEventListener('click', async () => {
    const cart = getCart();
    if (cart.length === 0) return;
    if (!CHECKOUT_API_URL) {
      alert('Der Checkout wird gerade eingerichtet — bitte schau bald wieder vorbei! (Cloudflare Worker noch nicht verbunden, siehe cloudflare-worker/SETUP.md)');
      return;
    }
    const btn = document.getElementById('cartCheckoutBtn');
    btn.disabled = true;
    btn.textContent = 'Weiterleitung...';
    try {
      const res = await fetch(CHECKOUT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout fehlgeschlagen');
      }
    } catch (err) {
      alert('Checkout ist gerade nicht verfügbar. Bitte versuch es gleich noch einmal.');
      btn.disabled = false;
      btn.textContent = 'Zur Kasse';
    }
  });

  document.querySelectorAll('.placeholder-grid .product-card').forEach(card => {
    const nameEl = card.querySelector('h3');
    const name = nameEl ? nameEl.textContent.trim() : '';
    const product = PRODUCT_BY_NAME[name];
    if (!product) return;

    card.style.cursor = 'pointer';
    const openThisModal = (e) => {
      if (e.target.closest('.product-buy')) return;
      openModal(product.slug);
    };
    const media = card.querySelector('.product-media');
    if (media) media.addEventListener('click', openThisModal);
    if (nameEl) nameEl.addEventListener('click', openThisModal);

    const buyBtn = card.querySelector('.product-buy');
    if (buyBtn) {
      buyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product.slug, 1);
      });
    }
  });

  renderCart();
  updateCartBadge();
});

// ===== MOBILE NAV MENU (hamburger) =====
(function(){
  const navInner = document.querySelector('.nav-inner');
  const navLinks = document.querySelector('.nav-links');
  if (!navInner || !navLinks) return;

  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Menü öffnen');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-mobile-backdrop';

  navInner.appendChild(hamburger);
  document.body.appendChild(backdrop);

  function openMenu(){
    navLinks.classList.add('open');
    backdrop.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Menü schließen');
  }
  function closeMenu(){
    navLinks.classList.remove('open');
    backdrop.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Menü öffnen');
  }
  hamburger.addEventListener('click', function(){
    if (navLinks.classList.contains('open')) { closeMenu(); } else { openMenu(); }
  });
  backdrop.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
  });
})();

// ===== CHECKOUT ABGEBROCHEN HINWEIS =====
(function(){
  const params = new URLSearchParams(window.location.search);
  if (params.get('cart') !== 'cancelled') return;

  const notice = document.createElement('div');
  notice.className = 'cart-cancel-notice';
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<span>Checkout abgebrochen — dein Warenkorb ist noch gespeichert.</span><button type="button">Schließen</button>';
  document.body.appendChild(notice);

  requestAnimationFrame(function(){
    notice.classList.add('visible');
  });

  function dismiss(){
    notice.classList.remove('visible');
    setTimeout(function(){ notice.remove(); }, 400);
  }
  notice.querySelector('button').addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);

  params.delete('cart');
  const newSearch = params.toString();
  const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
  window.history.replaceState({}, '', newUrl);
})();

// ===== ACCESSIBILITY: FOCUS TRAP FÜR WARENKORB & PRODUKT-MODAL =====
(function(){
  function init(){
    const targets = [
      { el: document.getElementById('cartDrawer'), label: 'Warenkorb' },
      { el: document.getElementById('productModal'), label: 'Produktdetails' }
    ].filter(function(t){ return t.el; });

    if (targets.length === 0) return;

    targets.forEach(function(t){
      t.el.setAttribute('role', 'dialog');
      t.el.setAttribute('aria-modal', 'true');
      t.el.setAttribute('aria-label', t.label);
    });

    function getFocusable(container){
      return Array.prototype.slice.call(
        container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(function(el){ return el.offsetParent !== null; });
    }

    function trapHandler(e, container){
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    targets.forEach(function(t){
      let wasOpen = t.el.classList.contains('open');
      let keyHandler = null;
      let lastFocused = null;

      const observer = new MutationObserver(function(){
        const isOpen = t.el.classList.contains('open');
        if (isOpen && !wasOpen) {
          lastFocused = document.activeElement;
          const focusable = getFocusable(t.el);
          if (focusable.length) focusable[0].focus();
          keyHandler = function(e){ trapHandler(e, t.el); };
          document.addEventListener('keydown', keyHandler);
        } else if (!isOpen && wasOpen) {
          if (keyHandler) document.removeEventListener('keydown', keyHandler);
          if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }
        wasOpen = isOpen;
      });
      observer.observe(t.el, { attributes: true, attributeFilter: ['class'] });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }
})();
