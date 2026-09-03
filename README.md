# Nala Moon Studio — neue Website (Scroll-Film, 3D-Tiefe)

Komplett neue Auflage von [nalamoon-studio.com](https://nalamoon-studio.com/): Der Scroll spielt einen
15-Sekunden-Film ab, in dem die Mond-mit-Hund-Figur Schicht für Schicht gedruckt wird, während die
Kapitel der Seite darüber lesen. Danach folgen Geschichte, Prozess, eine 3D-Galerie der Kollektion,
Versprechen, Material-Tabelle, FAQ, Kontakt und die Rechtstexte.

## Deployment

Dieses Repo wird von GitHub Pages direkt unter [nalamoon-studio.com](https://nalamoon-studio.com/)
ausgeliefert (`CNAME` im Wurzelverzeichnis). Jeder Push auf `main` geht live. Es gibt keinen
Build-Schritt und keine Abhängigkeiten — alle Pfade sind relativ, Schriften und Bibliotheken liegen
lokal. Die Quelle dieser Auflage inklusive Entstehungsgeschichte liegt im Ordner `nalamoon/` des
Repos `Leonelsancu15-hash/Archangel-Armor` (Branch `claude/nalamoon-3d-scroll-page-dmle4w`).

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite (Hero, drei Kapitel über dem Film, Reise, Prozess, Material-Band, Kollektion, Versprechen, Tabelle, FAQ, Kontakt, Footer, Produktdialog, Warenkorb) |
| `style.css` | Design-System: Indigo/Mondgold/Silk-Flieder/Creme, Fraunces + Nunito (selbst gehostet) |
| `main.js` | Lenis ↔ GSAP ScrollTrigger, Film-Scrub, Schicht-HUD, Choreografie, 3D-Galerie, Warenkorb (localStorage `nms_cart_v1`), Checkout-Anbindung |
| `scene.js` | Three.js-Partikelfeld (Sternen-/Filamentstaub), das beim Scrollen durchflogen wird |
| `assets/film/` | Scroll-Film in drei Schnitten (desktop 16:9, mobile 16:9 ≤720p, portrait 9:16) als MP4 + WebM, Poster = erstes Bild des Encodes |
| `assets/img/` | Higgsfield-Renderings (JPG + WebP, zwei Größen) |
| `fonts/`, `vendor/` | Schriften und Bibliotheken lokal — keine Drittanbieter-Requests (DSGVO) |
| `higgsfield/` | `PROMPTS.md` (alle Prompts, Modelle, Einstellungen) und `encode-film.sh` |
| `impressum.html`, `agb.html`, `widerruf.html`, `datenschutz.html` | Rechtstexte der bisherigen Seite, neu gestaltet; Datenschutz um „Schriftarten, Skripte & Medien“ ergänzt |
| `confirmed.html` | Bestellbestätigung (Ziel der `success_url` im Worker-Stub), leert den Warenkorb |
| `cloudflare-worker/` | Unveränderter Stripe-Checkout-Stub der bisherigen Seite (siehe dortige `SETUP.md`) |

## Checkout aktivieren

Wie bisher: Worker deployen, in `main.js` die Konstante `CHECKOUT_API_URL` setzen, im Worker
`ALLOWED_ORIGIN` auf `https://nalamoon-studio.com` stellen. Bis dahin zeigt „Zur Kasse“ einen
freundlichen Hinweis mit Instagram- und E-Mail-Link.

## Ehrlichkeit der Inhalte

Die Produktbilder sind KI-Konzept-Renderings (so auch auf der Seite gekennzeichnet), die Preise sind
die bisherigen Vorschau-Preise. Sobald echte Fotos und Preise feststehen: Bilder in `assets/img/`
ersetzen, Preise in `index.html`, `main.js` (`PRODUCTS`) und `cloudflare-worker/checkout.js`
(`PRICES`) angleichen und den Hinweis „Konzept-Renderings“ in der Kollektion entfernen.

## Barrierefreiheit & Fallbacks

- Ohne JavaScript ist der komplette Inhalt sichtbar, die Kollektion ist ein horizontaler Snap-Scroller.
- Unter `prefers-reduced-motion` gibt es keinen Smooth-Scroll, keinen Film (Poster bleibt), keine Sterne.
- Überschriften werden wortweise animiert, der Accessible Name bleibt über `aria-label` intakt.
- Dialoge (Produkt, Warenkorb) mit Fokusfalle, Escape und Fokus-Rückgabe; sichtbarer Tastaturfokus überall.
