# Checkout-Setup (Cloudflare Worker + Stripe)

Der Warenkorb und das Frontend sind fertig. Damit "Zur Kasse" echte Zahlungen
auslöst, fehlen noch drei Schritte — alles kostenlos in der Basis-Nutzung.

## 1. Stripe-Konto einrichten
1. Auf [stripe.com](https://stripe.com) ein Konto anlegen (falls noch nicht vorhanden) und
   Geschäftsdaten hinterlegen.
2. Im Stripe-Dashboard unter **Entwickler → API-Schlüssel** den **Secret Key** (Live-Modus)
   kopieren.

## 2. Cloudflare Worker deployen
1. Bei [dash.cloudflare.com](https://dash.cloudflare.com) einloggen (kostenloses Konto reicht).
2. **Workers & Pages → Create → Create Worker**.
3. Den Inhalt von `checkout.js` in den Worker-Editor einfügen und speichern/deployen.
4. Unter **Settings → Variables and Secrets → Add** ein Secret namens
   `STRIPE_SECRET_KEY` mit dem Stripe Secret Key aus Schritt 1 anlegen.
5. Die vom Worker vergebene URL notieren, z. B.
   `https://nala-moon-checkout.DEIN-SUBDOMAIN.workers.dev`.

## 3. Worker mit der Website verbinden
1. In `checkout.js` die Konstante `ALLOWED_ORIGIN` auf die echte Website-URL setzen
   (z. B. `https://DEIN-GITHUB-USERNAME.github.io` oder eine eigene Domain).
2. In `main.js` die Konstante `CHECKOUT_API_URL` auf die Worker-URL aus Schritt 2.5 setzen.
3. Beide Dateien erneut committen/pushen.

## 4. Produktkatalog aktualisieren
Sobald echte Produkte, Preise und Fotos feststehen:
- `PRICES` in `checkout.js` mit den echten Preisen (in Cent) füllen.
- `PRODUCTS` in `main.js` mit den echten Produktdaten füllen.
- Die Platzhalter-Produktkarten in `index.html` (Abschnitt `#shop`) durch echte
  Inhalte/Bilder ersetzen und die "Platzhalter"-Badges entfernen.

## Wichtig
- Ohne Schritt 1–3 bleibt der Shop voll funktionsfähig (Warenkorb, Produktansicht),
  zeigt beim Checkout aber nur einen Hinweis statt eine echte Zahlung auszulösen.
- Kostenlose Cloudflare-Worker-Stufe: 100.000 Requests/Tag, keine Kreditkarte nötig.
- Es fallen nur die üblichen Stripe-Transaktionsgebühren pro Zahlung an.

