// Nala Moon Studio — Cloudflare Worker (Checkout-Stub)
// Erstellt eine Stripe Checkout Session aus dem Warenkorb (mehrere Positionen)
// und gibt die Session-URL zurück, zu der das Frontend weiterleitet.
//
// Aktuell NICHT deployed / NICHT verbunden — main.js hat CHECKOUT_API_URL noch
// leer stehen. Bis dahin zeigt der "Zur Kasse"-Button nur einen Hinweis. Es
// werden keine echten Zahlungen verarbeitet.
//
// SETUP (siehe SETUP.md für die ausführliche Schritt-für-Schritt-Anleitung):
// 1. Diese Datei als Cloudflare Worker deployen (dash.cloudflare.com -> Workers & Pages -> Create -> Create Worker).
// 2. Ein verschlüsseltes Secret namens STRIPE_SECRET_KEY mit deinem Stripe-LIVE-Secret-Key anlegen
//    (Settings -> Variables and Secrets -> Add -> Type: Secret).
// 3. Die Worker-URL notieren (sieht aus wie https://nala-moon-checkout.<deine-subdomain>.workers.dev).
// 4. Diese URL in main.js als Wert von CHECKOUT_API_URL eintragen.
// 5. ALLOWED_ORIGIN unten auf die echte Domain der Website anpassen.
//
// Kostenlose Stufe: 100.000 Requests/Tag, keine Kreditkarte nötig. Keine
// zusätzlichen laufenden Kosten außer der üblichen Stripe-Transaktionsgebühr.

// Platzhalter-Preise — MÜSSEN durch den echten Produktkatalog ersetzt werden,
// sobald echte Fotos/Preise feststehen. slug muss zu main.js PRODUCTS passen.
const PRICES = {
  'mond-namensschild': { name: 'Mond-Namensschild', unit_amount: 1800 },
  'fantasy-kreatur': { name: 'Fantasy-Kreatur', unit_amount: 2400 },
  'geburtstags-topper': { name: 'Geburtstags-Topper', unit_amount: 900 },
  'alltagsheld-organizer': { name: 'Alltagsheld Organizer', unit_amount: 1400 },
  'medaillen-halter': { name: 'Medaillen-Halter', unit_amount: 2200 },
  'boho-vasen-set': { name: 'Boho Vasen-Set', unit_amount: 1900 }
};

// TODO: Auf die echte Domain anpassen, sobald die Seite unter einer eigenen Domain läuft.
const ALLOWED_ORIGIN = 'https://DEIN-GITHUB-USERNAME.github.io';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'Invalid request body' }, 400);
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return json({ error: 'Cart is empty' }, 400);
    }

    const lineItems = [];
    for (const item of items) {
      if (!item || typeof item !== 'object') continue; // Schutz gegen fehlerhafte/leere Warenkorb-Einträge
      const product = PRICES[item.slug];
      if (!product) continue; // unbekannte slugs ignorieren, statt dem Client zu vertrauen
      const qty = Math.max(1, Math.min(20, parseInt(item.qty, 10) || 1));
      lineItems.push({ product, qty });
    }
    if (lineItems.length === 0) {
      return json({ error: 'No valid items in cart' }, 400);
    }

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', ALLOWED_ORIGIN + '/confirmed.html?session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', ALLOWED_ORIGIN + '/?cart=cancelled');
    ['DE', 'AT', 'CH'].forEach(c => params.append('shipping_address_collection[allowed_countries][]', c));

    lineItems.forEach((li, i) => {
      params.append(`line_items[${i}][price_data][currency]`, 'eur');
      params.append(`line_items[${i}][price_data][product_data][name]`, li.product.name);
      params.append(`line_items[${i}][price_data][unit_amount]`, String(li.product.unit_amount));
      params.append(`line_items[${i}][quantity]`, String(li.qty));
    });

    let stripeResp;
    try {
      stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
    } catch (e) {
      return json({ error: 'Could not reach Stripe' }, 502);
    }

    const session = await stripeResp.json();
    if (!stripeResp.ok) {
      return json({ error: session.error?.message || 'Stripe error' }, 500);
    }

    return json({ url: session.url });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

