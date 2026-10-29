# Wolke Client Demo v3

Open `index.html` in a browser. No build step and no external dependencies are required.

## Important demo behavior

- WhatsApp, E-Mail and Telefon progress automatically every 3 seconds.
- `Geschäftsführung > Offene Entscheidungen` has the switch **Klar | Dynamisch**. Both modes show the same intelligence cases; only the presentation changes.
- The intelligence page is organised by business category. Bubbles are deliberately short: signal first, explanation after click.
- Open **Brand X / Bestand** and choose **Vertriebsaktion starten**. Only after this explicit management decision does the action appear under `Kunden & Vertrieb > Vertriebsaktionen`.
- Discovery/interview questions are intentionally not shown in the client-facing UI. Use the presenter prompts below.

## Intelligence hypotheses / presenter prompts

### Kunden & Sortiment
- **Sortimentslücken:** Wie erkennen Ihre Vertriebler heute Artikel, die ähnliche Kunden kaufen, ein konkreter Kunde aber nicht? Was wäre ein guter Hinweis statt Rauschen?
- **Kundenveränderung:** Wenn Umsatz fällt, wie unterscheiden Sie Bedarf, Verfügbarkeit, Preis und Sortimentsverschiebung? Wann wäre die Information noch handlungsrelevant?
- **Neue Marke / Produkt:** Wie wählen Sie heute die ersten Kunden für einen neuen Artikel oder eine neue Marke aus? Zentral oder je Vertriebler?
- **Top-3-Kunden:** Wäre eine kleine priorisierte Liste hilfreich oder würde sie als Einmischung empfunden? Wer bestimmt die Kriterien?

### Preis & Marge
- **Margenabweichung:** Wie sehen Sie heute, wenn sich realisierte Marge bei ähnlichem Geschäft unterschiedlich entwickelt? Müssen dafür mehrere Ansichten verbunden werden?
- **Historische Preisreaktion:** Sehen Sie nach Preisänderungen systematisch, wo Menge stabil blieb und wo sie reagierte? Welche Störfaktoren müssten berücksichtigt werden?

### Bestand & Einkauf
- **Kapitalbindung / Slow mover:** Was ist wirtschaftlich wichtiger: Kapitalbindung, Lagerplatz, Abschreibung oder Reichweite? Wann würden Sie aktiv verkaufen statt nur weniger einkaufen?
- **Nachfrage / Wareneingang:** Wo entstehen heute Überraschungen trotz vorhandener Daten? Sind Fehlbestand oder Überbestand das größere Problem? Wie weit im Voraus ist eine Warnung nützlich?

### Angebote & Vertrieb
- **Angebots-Follow-up:** Ist Nachverfolgung überhaupt ein Engpass? Wie wird priorisiert, welches Angebot zuerst nachgefasst wird?

## Cross-client logic

The cases intentionally cover the recurring hypotheses from the Vinh Loi/AsRopa and GoodLife discussions without forcing every possible feature onto one screen: customer/sales development, owner decisions, price/margin, stock/purchasing, demand, and data-to-decision. Delivery/operative exceptions remain a separate product area.
