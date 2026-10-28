# Wolke Client Demo v2

Open `index.html` in a modern browser. No build step or dependencies are required.

## What changed in v2

- WhatsApp and E-mail order flows advance automatically every 3 seconds. The final state remains visible; `Neu starten` restarts the sequence.
- The phone concept again uses a call-screen + live transcript + ERP preparation view. It also advances automatically every 3 seconds and is explicitly order-taking only.
- Page explanations were reduced to one plain German description under the title. The separate sales-style value bubble was removed.
- Charts are used selectively only when the pattern itself matters:
  - customer category development,
  - margin drift,
  - inventory growing faster than sales,
  - customer-change decomposition,
  - historical price-response hypothesis.
- Lists/tables remain for assortment and action cases where charts add no information.
- Management decisions still require an explicit `Vertriebsaktion starten` action before appearing under `Kunden & Vertrieb > Vertriebsaktionen`.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

All figures and customers are illustrative. No live ERP, phone, WhatsApp or email connection is included.
# demo_wolke
