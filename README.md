# Nala Moon Studio — Website

Website für [@nala_moon_studio](https://www.instagram.com/nala_moon_studio) — handgefertigte
3D-Druck-Kreationen (Namensschilder, Fantasy-Figuren, Deko, Alltagshelfer).

## Status: Design-Vorschau / Vorbereitung

- ✅ Design, cinematische GSAP-ScrollTrigger-Animationen, Warenkorb (localStorage)
- ✅ Rechtstexte-Gerüst (Impressum, AGB, Widerruf, Datenschutz) — mit Platzhaltern
- ✅ Cloudflare-Worker-Stub für Stripe-Checkout (`cloudflare-worker/`, aktuell nicht verbunden)
- ⏳ Noch offen: echte Produktfotos & Preise, echte Geschäftsdaten in den Rechtstexten,
  Stripe-Checkout aktivieren (siehe `cloudflare-worker/SETUP.md`)

## Struktur

- `index.html` / `style.css` / `main.js` — Hauptseite
- `impressum.html`, `agb.html`, `widerruf.html`, `datenschutz.html` — Rechtstexte-Gerüst
- `cloudflare-worker/` — Checkout-Backend-Stub (Stripe), inkl. `SETUP.md`

## Lokal ansehen

Einfach `index.html` im Browser öffnen, oder die GitHub-Pages-URL dieses Repos nutzen.
