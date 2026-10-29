const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  view: 'home',
  orderStep: 0,
  orderTimer: null,
  voiceStep: 0,
  voiceTimer: null,
  activeCampaign: false,
  campaignProgress: 0,
  dismissedCases: new Set(),
  intelMode: 'clear',
};

const VIEW_META = {
  home: ['Plattform', 'Übersicht'],
  whatsapp: ['Bestellungen', 'WhatsApp'],
  email: ['Bestellungen', 'E-Mail'],
  phone: ['Bestellungen', 'Telefon'],
  customer: ['Kunden & Vertrieb', 'Kundenprofil'],
  opportunities: ['Kunden & Vertrieb', 'Verkaufschancen'],
  actions: ['Kunden & Vertrieb', 'Vertriebsaktionen'],
  decisions: ['Geschäftsführung', 'Offene Entscheidungen'],
  history: ['Geschäftsführung', 'Entscheidungshistorie'],
};

const ORDER_DATA = {
  whatsapp: {
    label: 'WhatsApp',
    eyebrow: 'BESTELLUNGEN / WHATSAPP · DEMO',
    title: 'WhatsApp-Bestellung vorbereiten.',
    lead: 'Wolke liest die Nachricht, ordnet Kunde, Artikel, Menge und Gebinde zu und bereitet den Auftrag zur Prüfung vor. Unklare Positionen bleiben sichtbar.',
    customer: 'Restaurant Milano',
    id: 'K-00418',
    order: 'WO-10482',
    source: 'whatsapp',
    rows: [
      ['Tomaten Kiste 6 kg', 'G-2081 · 2 Kisten'],
      ['Mozzarella 1 kg', 'M-1440 · 4 Stück'],
      ['Kalamata-Oliven 5 kg', 'O-2301 · 1 Eimer'],
    ],
  },
  email: {
    label: 'E-Mail',
    eyebrow: 'BESTELLUNGEN / E-MAIL · DEMO',
    title: 'E-Mail-Bestellung vorbereiten.',
    lead: 'Wolke liest Freitext und Packungsgrößen, gleicht sie mit Artikelstamm und Bestellhistorie ab und bereitet den Auftrag zur Prüfung vor.',
    customer: 'Bistro Sora',
    id: 'K-00947',
    order: 'WO-10483',
    source: 'email',
    rows: [
      ['Jasminreis 5 kg', 'R-3301 · 12 Säcke'],
      ['Kokosmilch 1 L (12er)', 'K-1872 · 6 Kartons'],
      ['Tofu fest 500 g (12er)', 'F-4407 · 2 Kartons'],
    ],
  }
};

const OPPORTUNITIES = [
  {
    id: 'opp-assortment', type: 'SORTIMENT', title: '6 plausible Sortimentslücken bei Asia Markt Berlin',
    text: 'Ähnliche Kunden kaufen mehrere Artikel regelmäßig, die bei diesem Kunden bisher fehlen.',
    chips: ['Kunde 10231', '6 Artikel', 'Vertrieb'],
    detail: {
      eyebrow: 'VERKAUFSCHANCE · BEISPIEL', title: 'Welche Artikel fehlen bei Kunden, die sonst ähnlich einkaufen?',
      recognized: 'Asia Markt Berlin kauft 31 relevante Artikel aus einem vergleichbaren Sortiment. Eine Peer-Gruppe mit ähnlichem Einkaufsprofil kauft im Median 43.',
      evidence: [
        ['Fischsauce 700 ml', '8 / 10 Peers', 'Kunde kauft nicht'],
        ['Kokosmilch Premium', '7 / 10 Peers', 'Kunde kauft nicht'],
        ['Instantnudeln Brand X', '7 / 10 Peers', 'Kunde kauft nicht'],
      ],
      question: 'Sind diese Lücken echte Verkaufschancen oder gibt es einen guten geschäftlichen Grund, warum der Kunde sie nicht kauft?',
      decision: ['Beim Kunden prüfen', 'Nicht relevant'],
      discovery: ['Wie erkennen Ihre Vertriebler das heute?', 'Zeigt Qlik solche Lücken automatisch oder nur auf Anfrage?', 'Was müsste Wolke zeigen, damit ein Vertriebler die Empfehlung ernst nimmt?', 'Wie würden Sie messen, ob die Empfehlung gut war?']
    }
  },
  {
    id: 'opp-regular', type: 'BESTELLMUSTER', title: '3 Stammartikel fehlen seit zwei Bestellungen',
    text: 'Bestellfrequenz und Gesamtvolumen sind stabil. Das spricht eher für eine Sortimentsveränderung als für allgemeinen Kundenverlust.',
    chips: ['Kunde 11807', '3 Artikel', 'prüfen'],
    detail: {
      eyebrow: 'VERKAUFSCHANCE · BEISPIEL', title: 'Fehlt etwas, das der Kunde normalerweise regelmäßig nimmt?',
      recognized: 'Drei Artikel fehlen zum zweiten Mal in Folge, obwohl der Kunde weiterhin mit normaler Frequenz bestellt.',
      evidence: [
        ['Jasminreis 20 kg', 'wöchentlich', '2 Bestellungen fehlt'],
        ['Sweet Chili Sauce', '14-tägig', '2 Bestellungen fehlt'],
        ['Thai Basilikum Paste', '14-tägig', '2 Bestellungen fehlt'],
      ],
      question: 'Hat sich der Bedarf geändert, kauft der Kunde woanders oder wurde schlicht vergessen?',
      decision: ['Beim nächsten Kontakt ansprechen', 'Nicht relevant'],
      discovery: ['Merkt heute jemand systematisch, wenn Stammartikel verschwinden?', 'Wie häufig entstehen Nachbestellungen oder Zusatzfahrten?', 'Möchten Sie solche Hinweise pro Auftrag oder gesammelt für Vertrieb?']
    }
  },
  {
    id: 'opp-change', type: 'KUNDENENTWICKLUNG', title: 'Kategorie Getränke +14 %, Snacks −19 %',
    text: 'Der Gesamtumsatz wirkt stabil. Innerhalb des Kunden verschiebt sich das Geschäft jedoch deutlich.',
    chips: ['Kunde 10902', '90 Tage', 'Trend'],
    detail: {
      eyebrow: 'VERKAUFSCHANCE · BEISPIEL', title: 'Ist der Kunde wirklich schwächer oder verändert sich nur ein Teil des Geschäfts?',
      recognized: 'Der Gesamtumsatz ist nahezu unverändert, aber zwei Warengruppen entwickeln sich in entgegengesetzte Richtungen.',
      evidence: [['Getränke', '+14 %', 'steigend'], ['Snacks', '−19 %', 'fallend'], ['Bestellfrequenz', '+1 %', 'stabil']],
      question: 'Ist der Rückgang bei Snacks ein echter Bedarfsverlust, ein Sortimentsproblem oder eine Preis-/Verfügbarkeitsfrage?',
      decision: ['Ursache prüfen', 'Beobachten'],
      discovery: ['Wie würden Sie diese Verschiebung heute finden?', 'Wann wäre die Information früh genug, damit Vertrieb handeln kann?', 'Welche Ursachen müssten Wolke ausschließen, bevor der Hinweis glaubwürdig ist?']
    }
  },
  {
    id: 'opp-offer', type: 'ANGEBOT', title: 'Angebot 4481 seit 12 Tagen offen',
    text: 'Das Angebot liegt deutlich länger als vergleichbare Angebote ohne Rückmeldung.',
    chips: ['€ 8.400', '12 Tage', 'offen'],
    detail: {
      eyebrow: 'VERKAUFSCHANCE · BEISPIEL', title: 'Welche offenen Angebote verdienen zuerst Aufmerksamkeit?',
      recognized: 'Angebot 4481 ist seit 12 Tagen offen. Vergleichbare Angebote dieses Kundentyps werden normalerweise innerhalb von 5–8 Tagen entschieden.',
      evidence: [['Angebot 4481', '€ 8.400', '12 Tage offen'], ['Vergleichsgruppe', 'Median', '6 Tage'], ['Kunde', 'frühere Angebote', '3 / 4 angenommen']],
      question: 'Ist Nachfassen wirtschaftlich sinnvoll oder gibt es bereits Kontext, den Wolke nicht kennt?',
      decision: ['Nachfassen', 'Nicht relevant'],
      discovery: ['Wie werden Angebote heute nachgehalten?', 'Sehen Vertriebler, welche Angebote statistisch besonders erfolgversprechend sind?', 'Ist das überhaupt ein relevanter Engpass bei Ihnen?']
    }
  }
];

const INTELLIGENCE_CASES = {
  margin: {
    type: 'PREIS & MARGE', title: 'Realisierte Marge driftet bei ähnlichem Geschäft auseinander',
    metric: '−2,8 PP', submetric: 'bei 14 ähnlichen Kunden',
    text: 'Bei vergleichbaren Mengen und Kundentypen entwickelt sich die realisierte Marge für dieselbe Artikelgruppe auffällig unterschiedlich.',
    tag: 'Beispiel ansehen', mode: 'example',
    recognized: 'Bei 14 Kunden derselben Gruppe sinkt die realisierte Marge auf Artikelgruppe X, obwohl Umsatz und Bestellmenge relativ stabil bleiben.',
    evidence: [['Kundengruppe A', 'Marge 90 Tage', '−2,8 PP'], ['Kundengruppe B', 'Marge 90 Tage', '−0,4 PP'], ['Mengenentwicklung', 'vergleichbar', '±3 %']],
    question: 'Kommt die Veränderung aus Einkauf, Rabatt, Preisvereinbarung oder Produktmix?',
    discovery: ['Wie sehen Sie heute, wenn sich Marge innerhalb eines Kunden oder Artikels verändert?', 'Bekommen Sie die Ursache automatisch dazu?', 'Muss jemand dafür mehrere Qlik-Ansichten verbinden?', 'Welche Abweichung wäre groß genug, dass Sie handeln würden?', 'Wer entscheidet anschließend: Vertrieb, Einkauf oder Geschäftsführung?']
  },
  stock: {
    type: 'BESTAND & KAPITAL', title: 'Bestand von Brand X wächst schneller als der Absatz',
    metric: '+31 % Bestand', submetric: 'Absatz nur +4 %',
    text: 'Ein Teil des Sortiments bindet zunehmend Kapital. Management kann entscheiden, ob Einkauf reduziert oder Vertrieb aktiviert wird.',
    tag: 'Beispiel ansehen', mode: 'example management',
    recognized: 'Der Bestand von Brand X ist in acht Wochen deutlich gestiegen, während der Absatz nicht entsprechend mitgewachsen ist.',
    evidence: [['Brand X', 'Bestandswert', '+31 %'], ['Absatz 8 Wochen', 'Menge', '+4 %'], ['Reichweite', 'heute', '12,6 Wochen']],
    question: 'Soll weniger eingekauft werden, soll Vertrieb aktiv verkaufen oder ist der Bestand strategisch gewollt?',
    discovery: ['Wie erkennen Sie langsame Bestandsentwicklung heute?', 'Ist Kapitalbindung, Lagerplatz oder Abschreibungsrisiko für Sie die wichtigere Kennzahl?', 'Wann würden Sie aktiv verkaufen statt nur weniger nachzubestellen?', 'Soll Wolke nach Ihrer Entscheidung automatisch passende Kunden an die Vertriebler verteilen?'],
    canLaunch: true
  },
  assortment: {
    type: 'KUNDEN & SORTIMENT', title: 'Welche Artikel fehlen bei ähnlich einkaufenden Kunden?',
    metric: '6 Lücken', submetric: 'bei Kunde 10231',
    text: 'Wolke sucht keine beliebigen Cross-Sells, sondern Unterschiede zwischen wirtschaftlich vergleichbaren Kundenprofilen.',
    tag: 'Beispiel ansehen', mode: 'example',
    recognized: 'Mehrere Kunden haben ähnliche Einkaufsprofile, aber einzelne Artikelgruppen sind bei bestimmten Accounts systematisch unterrepräsentiert.',
    evidence: [['Peer-Gruppe', '18 Kunden', 'ähnliches Profil'], ['Kunde 10231', '31 relevante Artikel', '6 Lücken'], ['Kunde 11980', '28 relevante Artikel', '4 Lücken']],
    question: 'Welche Unterschiede sind echte Verkaufschancen und welche sind bewusst oder strukturell?',
    discovery: ['Wie erkennen Ihre Vertriebler das heute?', 'Welche Kundensegmentierung wäre für Sie fachlich sinnvoll?', 'Wie viele gute Hinweise pro Vertriebler und Woche wären hilfreich statt störend?']
  },
  customerChange: {
    type: 'KUNDENENTWICKLUNG', title: 'Umsatz −8 %. Aber ist der Kunde wirklich schwächer geworden?',
    metric: '−8 % Umsatz', submetric: 'Kategorie Y −27 %',
    text: 'Wolke zerlegt die Veränderung in Frequenz, Kategorien, Verfügbarkeit und Produktmix, bevor daraus eine Vertriebsaktion wird.',
    tag: 'Beispiel ansehen', mode: 'example',
    recognized: 'Der Umsatz eines Kunden fällt, während Bestellfrequenz und Gesamtmenge fast stabil bleiben. Der Rückgang konzentriert sich auf eine Warengruppe.',
    evidence: [['Umsatz', '90 Tage', '−8 %'], ['Bestellfrequenz', '90 Tage', '−1 %'], ['Kategorie Y', '90 Tage', '−27 %']],
    question: 'Ist das ein Kundenproblem, ein Sortimentsproblem, Preis oder Verfügbarkeit?',
    discovery: ['Wie würden Sie das heute finden?', 'Zeigt Qlik Ihnen nur den Rückgang oder auch automatisch die relevante Ursache?', 'Wann wäre diese Information früh genug, um zu handeln?']
  },
  demand: {
    type: 'NACHFRAGE & EINKAUF', title: 'Was könnte vor dem nächsten Wareneingang knapp werden?',
    metric: 'Knapp vor Wareneingang?', submetric: 'Bestand + PO + Lieferzeit',
    text: 'Nachfrage, Bestand, offene Bestellungen und reale Lieferzeiten müssen gemeinsam betrachtet werden.',
    tag: 'Hypothese besprechen', mode: 'hypothesis',
    recognized: 'Hypothese: Wolke könnte Artikel markieren, deren erwarteter Bedarf den verfügbaren Bestand vor dem nächsten realistischen Wareneingang übersteigt.',
    evidence: [['Benötigt', 'Verkäufe', '18–24 Monate'], ['Benötigt', 'Bestand / offene PO', 'historisch'], ['Benötigt', 'Lieferzeiten', 'real statt Stammdatum']],
    question: 'Wo entstehen heute Überraschungen, obwohl die Daten grundsätzlich vorhanden sind?',
    discovery: ['Wie planen Sie Nachfrage heute?', 'Welche Daten liegen dafür bereits in Qlik?', 'Sind Fehlbestände oder Überbestand wirtschaftlich das größere Problem?', 'Wie weit im Voraus wäre eine Warnung tatsächlich handlungsrelevant?']
  },
  priceResponse: {
    type: 'PREISREAKTION', title: 'Wie reagierten ähnliche Kunden auf vergangene Preisänderungen?',
    metric: 'Preis ↗ · Menge?', submetric: 'historische Reaktion',
    text: 'Nicht als „optimaler KI-Preis“, sondern als historische Evidenz für die nächste Preisentscheidung.',
    tag: 'Hypothese besprechen', mode: 'hypothesis',
    recognized: 'Hypothese: Historische Preisänderungen können zeigen, bei welchen Kundentypen Mengen stabil blieben und wo deutliche Reaktionen folgten.',
    evidence: [['Benötigt', 'historische VK', 'pro Kunden/SKU'], ['Kontrolle', 'Verfügbarkeit', 'Stockouts ausschließen'], ['Kontrolle', 'Saison / Promotion', 'berücksichtigen']],
    question: 'Wäre historische Preisreaktion für Ihre nächste Preisentscheidung nützlich genug, um sie systematisch aufzubauen?',
    discovery: ['Wenn Sie Preise erhöhen, sehen Sie später systematisch, wo die Menge reagiert hat?', 'Welche Faktoren müssten berücksichtigt werden, damit Sie der Analyse vertrauen?', 'Würden Sie eine solche Analyse eher pro Kunde, Segment oder Artikelgruppe nutzen?']
  },
  newBrand: {
    type: 'NEUE MARKE / PRODUKT', title: 'Welche bestehenden Kunden sollten eine neue Marke zuerst sehen?',
    metric: '27 passende Kunden?', submetric: 'für die erste Vertriebswelle',
    text: 'Kundenähnlichkeit, verwandte Kategorien und vergangene Produkteinführungen können die erste Vertriebswelle priorisieren.',
    tag: 'Hypothese besprechen', mode: 'hypothesis',
    recognized: 'Hypothese: Für eine neue Marke kann Wolke bestehende Accounts priorisieren, deren Einkaufsmuster zu ähnlichen Produkten und Preispositionen passen.',
    evidence: [['Signal', 'ähnliche Kategorien', 'Kaufhistorie'], ['Signal', 'vergleichbare Marken', 'Kaufhistorie'], ['Lernen', 'frühere Launches', 'Annahme / Ablehnung']],
    question: 'Wie wählen Ihre Vertriebler heute die ersten Kunden für einen neuen Artikel oder eine neue Marke aus?',
    discovery: ['Ist das zentral gesteuert oder entscheidet jeder Vertriebler selbst?', 'Wäre eine priorisierte Kundenliste mit Begründung wertvoll?', 'Wie würden Sie einen erfolgreichen Produktlaunch messen?', 'Soll eine Managemententscheidung daraus direkt Vertriebsaktionen erzeugen?']
  },
  offerFollow: {
    type: 'ANGEBOTE', title: 'Welche offenen Angebote verdienen zuerst Aufmerksamkeit?',
    metric: '12 Tage offen', submetric: 'Angebot · € 8.400',
    text: 'Angebotsalter, Kundentyp und historische Konversion können helfen, Follow-up zu priorisieren.',
    tag: 'Hypothese besprechen', mode: 'hypothesis',
    recognized: 'Hypothese: Nicht jedes offene Angebot ist gleich wertvoll. Wolke könnte Fälle priorisieren, bei denen Timing, Kunde und Historie für Nachfassen sprechen.',
    evidence: [['Benötigt', 'Angebote', 'Status + Datum'], ['Benötigt', 'Kundenhistorie', 'Annahme / Ablehnung'], ['Optional', 'Gründe', 'wenn erfasst']],
    question: 'Ist Angebot-Nachverfolgung überhaupt ein Engpass oder bereits sauber gelöst?',
    discovery: ['Wie viele Angebote laufen parallel?', 'Wie wird heute nachgehalten?', 'Wissen Sie, welche Arten von Angeboten bei welchen Kunden normalerweise konvertieren?']
  },
  top3: {
    type: 'VERTRIEB', title: 'Welche drei Kunden verdienen heute Aufmerksamkeit und warum?',
    metric: '3 Kunden', submetric: 'mit wirtschaftlichem Grund',
    text: 'Eine komprimierte Priorisierung aus mehreren Signalen, nicht ein weiterer KPI-Feed.',
    tag: 'Hypothese besprechen', mode: 'hypothesis',
    recognized: 'Hypothese: Jeder Vertriebler erhält nur wenige wirtschaftlich begründete Fälle, statt selbst mehrere Dashboards und Listen zu durchsuchen.',
    evidence: [['Basis', 'Sortiment', 'Lücken / Veränderungen'], ['Basis', 'Angebote', 'offene Chancen'], ['Basis', 'Management', 'freigegebene Aktionen']],
    question: 'Wäre diese Priorisierung hilfreich oder würde sie von Ihren Vertrieblern als Einmischung empfunden?',
    discovery: ['Wer sollte die Kriterien bestimmen?', 'Wie viele Fälle pro Woche wären realistisch?', 'Soll Wolke Chancen selbst finden und zusätzlich Managementaktionen verteilen?', 'Wie messen wir, ob die Priorisierung besser ist als heute?']
  }
};

const HISTORY = [
  {date:'12.10.', case:'Brand X Bestand', decision:'Vertriebsaktion für 4 Wochen', owner:'Geschäftsführung', result:'+€18k Umsatz · Bestand −14 %', status:'abgeschlossen'},
  {date:'08.10.', case:'Kunde 10231 · Preis', decision:'Preis beibehalten', owner:'K', result:'Menge stabil · Marge planmäßig', status:'abgeschlossen'},
  {date:'01.10.', case:'Artikelgruppe Y', decision:'Einkauf reduzieren', owner:'Einkauf', result:'Bestand −11 %', status:'abgeschlossen'},
  {date:'24.09.', case:'Sortiment Kunde 884', decision:'3 Artikel anbieten', owner:'Vertrieb', result:'2 Artikel aufgenommen', status:'abgeschlossen'},
];

function pageHeader(eyebrow, title, explainer, right='') {
  return `<section class="page-head"><div><h1 class="page-title">${title}</h1><p class="page-explainer">${explainer}</p></div>${right}</section>`;
}

function lineChart({labels, series, yLabel=''}) {
  const w=560,h=210,padL=42,padR=16,padT=18,padB=34;
  const all=series.flatMap(x=>x.values); const min=Math.min(...all), max=Math.max(...all); const span=(max-min)||1;
  const x=i=>padL+i*((w-padL-padR)/(labels.length-1));
  const y=v=>padT+(max-v)/span*(h-padT-padB);
  const grid=[0,.5,1].map(t=>{const yy=padT+t*(h-padT-padB);return `<line x1="${padL}" y1="${yy}" x2="${w-padR}" y2="${yy}" class="chart-grid"/>`;}).join('');
  const lines=series.map(sr=>{const pts=sr.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');return `<polyline points="${pts}" fill="none" stroke="${sr.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${sr.values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#fff" stroke="${sr.color}" stroke-width="2"/>`).join('')}`}).join('');
  const xlabels=labels.map((l,i)=>`<text x="${x(i)}" y="${h-9}" text-anchor="middle" class="chart-axis">${l}</text>`).join('');
  const legend=series.map((sr,i)=>`<span><i style="background:${sr.color}"></i>${sr.name}</span>`).join('');
  return `<div class="chart-box"><div class="chart-legend">${legend}${yLabel?`<em>${yLabel}</em>`:''}</div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Entwicklung im Zeitverlauf">${grid}${lines}${xlabels}</svg></div>`;
}

function barChart({items, suffix=''}){
  const max=Math.max(...items.map(x=>Math.abs(x.value)),1);
  return `<div class="bar-chart">${items.map(it=>`<div class="bar-row"><span>${it.label}</span><div class="bar-track"><i style="width:${Math.max(5,Math.abs(it.value)/max*100)}%;background:${it.color}"></i></div><b class="${it.value<0?'down':'up'}">${it.value>0?'+':''}${it.value}${suffix}</b></div>`).join('')}</div>`;
}

const INTEL_CHARTS = {
  margin: ()=>lineChart({labels:['Mai','Jun','Jul','Aug','Sep','Okt'],series:[{name:'Kundengruppe A',values:[20.2,19.8,19.1,18.7,18.0,17.4],color:'#D95D4E'},{name:'Kundengruppe B',values:[20.1,20.0,19.9,19.8,19.8,19.7],color:'#0B8F88'}],yLabel:'Realisierte Marge · Index/Beispiel'}),
  stock: ()=>lineChart({labels:['KW 35','37','39','41','43','45'],series:[{name:'Bestandswert',values:[100,106,114,120,125,131],color:'#D9A33D'},{name:'Absatz',values:[100,101,102,103,103,104],color:'#0B8F88'}],yLabel:'Index · Start = 100'}),
  customerChange: ()=>barChart({items:[{label:'Gesamtumsatz',value:-8,color:'#607983'},{label:'Bestellfrequenz',value:-1,color:'#0B8F88'},{label:'Kategorie Y',value:-27,color:'#D95D4E'}],suffix:' %'}),
  priceResponse: ()=>lineChart({labels:['vorher','W1','W2','W3','W4'],series:[{name:'Segment A · Menge',values:[100,99,101,98,100],color:'#0B8F88'},{name:'Segment B · Menge',values:[100,94,91,89,88],color:'#D95D4E'}],yLabel:'Hypothese · Mengenindex'}),
};

const VOICE_TURNS=[
  {who:'Kunde',text:'Hallo, ich brauche wie letzte Woche Getränke und Reis.',speaker:'Kunde spricht · Auftrag aufnehmen'},
  {who:'Wolke',text:'Gerne. Sie hatten zuletzt Mango-Nektar und Jasminreis. Welche Mengen möchten Sie?',speaker:'Wolke spricht · Kundenkontext'},
  {who:'Kunde',text:'Sechs Kartons Mango-Nektar und drei Kartons Jasminreis.',speaker:'Kunde spricht · Mengen erkannt'},
  {who:'Wolke',text:'Zur Bestätigung: 6 Kartons Mango-Nektar 1 Liter und 3 Kartons Jasminreis 5 kg. Ist das richtig?',speaker:'Wolke spricht · Bestätigung einholen'},
  {who:'Kunde',text:'Ja, bitte genau so.',speaker:'Kunde spricht · bestätigt'},
  {who:'Wolke',text:'Danke. Die Bestellung ist vorbereitet.',speaker:'Wolke spricht · Auftrag vorbereitet'}
];

function homeHTML(){
  return `
    <section class="hero">
      <div>
        <div class="eyebrow">WOLKE AI · DEMO</div>
        <h1>Bestellungen, Kundenwissen und Entscheidungen an einem Ort.</h1>
        <p>Die Demo zeigt drei Dinge getrennt: Bestellungen vorbereiten, Kunden im Zusammenhang verstehen und wirtschaftliche Fragen bis zur Entscheidung und Wirkung verfolgen.</p>
        <div class="hero-actions">
          <button class="btn primary" data-view="whatsapp">Bestellungen</button>
          <button class="btn" data-view="customer">Kunden & Vertrieb</button>
          <button class="btn" data-view="decisions">Geschäftsführung</button>
        </div>
      </div>
      <div class="system-flow">
        <div class="flow-row">
          <div class="flow-box"><strong>Bestellungen</strong><p>Nachrichten oder Anrufe werden als prüfbarer Auftrag vorbereitet.</p></div>
          <div class="flow-arrow">→</div>
          <div class="flow-box"><strong>Kunden & Vertrieb</strong><p>Bestellverhalten, Umsatz, Marge und Veränderungen werden zusammengeführt.</p></div>
          <div class="flow-arrow">→</div>
          <div class="flow-box"><strong>Geschäftsführung</strong><p>Auffällige wirtschaftliche Fälle werden mit Beleg zur Entscheidung vorgelegt.</p></div>
        </div>
        <div class="flow-footer"><span><b>Warenwirtschaft bleibt führend.</b></span></div>
      </div>
    </section>
    <section class="home-grid">
      <article class="home-card"><div class="num">01</div><div class="home-card-accent"></div><h3>Bestellungen</h3><p>Wolke bereitet unstrukturierte Bestellungen vor. Der Innendienst prüft statt abzutippen.</p><button class="btn small" data-view="whatsapp">Öffnen →</button></article>
      <article class="home-card"><div class="num">02</div><div class="home-card-accent"></div><h3>Kunden & Vertrieb</h3><p>Pro Kunde werden Bestellungen, Entwicklung und wirtschaftlicher Kontext in einem Bild zusammengeführt.</p><button class="btn small" data-view="customer">Öffnen →</button></article>
      <article class="home-card"><div class="num">03</div><div class="home-card-accent"></div><h3>Lieferung & Vorgänge</h3><p>Operative Liefer- und Klärungsfälle bleiben als eigener Bereich bestehen.</p><a class="btn small" href="https://technoway-wolke.vercel.app/apps/admin-panel.html" target="_blank" rel="noopener noreferrer">Technoway ↗</a></article>
      <article class="home-card"><div class="num">04</div><div class="home-card-accent"></div><h3>Geschäftsführung</h3><p>Wolke legt wenige wirtschaftlich relevante Fälle mit Beleg zur Entscheidung vor und hält das Ergebnis nach.</p><button class="btn small" data-view="decisions">Öffnen →</button></article>
    </section>`;
}

function orderSource(type){
  if(type==='whatsapp') return `<div class="mock-message"><div class="message-head">Restaurant Milano · WhatsApp</div><div class="bubble in">Hallo, bitte <b>2 Kisten Tomaten wie letzte Woche, 4 Mozzarella und die Oliven.</b><div class="message-time">09:41</div></div><div class="bubble out ${state.orderStep<3?'hidden':''}">Meinen Sie die <b>Kalamata-Oliven, 5 kg</b>, wie bei der letzten Bestellung?<div class="message-time">09:42</div></div><div class="bubble in ${state.orderStep<3?'hidden':''}">Ja genau, danke!<div class="message-time">09:43</div></div><div class="bubble out ${state.orderStep<5?'hidden':''}">Vielen Dank. Ihr Auftrag wurde erfasst.<div class="message-time">09:43</div></div></div>`;
  return `<div class="email-card"><div class="email-bar">E-Mail · Posteingang</div><div class="email-body"><div class="eyebrow">NEUE BESTELLUNG</div><h3>Bestellung für Donnerstag</h3><div class="email-meta">Von: einkauf@bistro-sora.example<br>An: bestellung@grosshandel.example</div><div class="email-copy">Guten Morgen,<br><br>bitte für Donnerstag:<br><br><span class="mark">12 × Jasminreis 5 kg</span><br><span class="mark">6 Kartons Kokosmilch</span><br><span class="mark">2 Kartons Tofu</span><br><br>Vielen Dank und viele Grüße<br>Lea</div></div></div>`;
}

function orderHTML(type){
  const d = ORDER_DATA[type];
  const steps = [['Kunde erkennen','Absender und Kundenkonto zuordnen.'],['Artikel zuordnen','Freitext, Gebinde und Historie abgleichen.'],['Unklarheit klären','Unsichere Positionen markieren oder nachfragen.'],['Auftrag aufbauen','Positionen als ERP-Auftrag vorbereiten.'],['Prüfung','Innendienst prüft die Zuordnung.'],['Übergabe','Freigegebenen Auftrag übergeben.']];
  return `${pageHeader(d.eyebrow,d.title,d.lead,`<div class="order-controls"><span class="auto-label"><i></i> automatisch · 3 Sek.</span><div class="progress-dots">${steps.map((_,i)=>`<i class="progress-dot ${i<=state.orderStep?'on':''}"></i>`).join('')}</div><button class="btn small" data-order="restart">Neu starten</button></div>`)}
    <section class="order-layout">
      <div class="panel"><div class="panel-title"><h2>Kundenanfrage</h2><small>INBOUND</small></div>${orderSource(type)}<p class="note">Beispielanfrage. Keine reale Kundenkommunikation.</p></div>
      <div class="panel"><div class="panel-title"><h2>Wolke verarbeitet</h2><small>${state.orderStep+1} / 6</small></div><div class="engine-list">${steps.map((it,i)=>`<div class="engine-step ${i===state.orderStep?'active':''} ${i<state.orderStep?'done':''}"><span class="engine-num">${i+1}</span><div><strong>${it[0]}</strong><p>${it[1]}</p></div></div>`).join('')}</div></div>
      <div class="panel"><div class="panel-title"><h2>Vorbereiteter Auftrag</h2><small>ERP</small></div><div class="erp-card"><div class="erp-row"><span>Kunde</span><b>${d.customer}</b></div><div class="erp-row"><span>Kundennr.</span><b>${d.id}</b></div><div class="erp-items">${d.rows.map(r=>`<div class="erp-item ${state.orderStep<2?'hidden':''}"><strong>${r[0]}</strong><small>${r[1]}</small></div>`).join('')}</div>${state.orderStep>=5?`<div class="success-box">✓ Auftrag ${d.order} vorbereitet</div>`:`<div class="concept-box">Unsichere Zuordnungen bleiben sichtbar. Die Freigabe liegt beim Mitarbeiter.</div>`}</div></div>
    </section>`;
}

function phoneHTML(){
  const n=state.voiceStep;
  const transcript=VOICE_TURNS.slice(0,n+1).map(t=>`<div class="transcript-line ${t.who==='Wolke'?'bot':''}"><span class="transcript-person">${t.who==='Wolke'?'W':'K'}</span><div class="transcript-bubble"><small>${t.who}</small>${t.text}</div></div>`).join('');
  const phase=n>=5?'Auftrag vorbereitet':n>=4?'Bestätigt':n>=2?'Artikel & Menge erkannt':n>=1?'Kundenhistorie':'Hört zu';
  return `${pageHeader('BESTELLUNGEN / TELEFON · KONZEPT','Telefonbestellungen erfassen.','Der Agent nimmt die Bestellung auf, gleicht Produkt und Gebinde mit Katalog und Bestellhistorie ab und lässt Unklarheiten bestätigen. Er verkauft nicht selbstständig.',`<span class="chip amber">Konzept · automatische Vorschau</span>`)}
    <section class="voice-shell">
      <div class="voice-call"><div class="voice-call-top"><span>☎ EINGEHENDER ANRUF</span><span>00:${String(3+n*3).padStart(2,'0')}</span></div><div class="voice-avatar">BS</div><h2>Bistro Sora</h2><p>Bestelltelefon · Beispielkunde</p><div class="voice-speaker">${VOICE_TURNS[n].speaker}</div><div class="voice-wave">${Array.from({length:17},(_,i)=>`<span style="--n:${i}"></span>`).join('')}</div><div class="call-controls"><span class="call-control">●</span><span class="call-control">⌁</span><span class="call-control end">☎</span></div></div>
      <div class="panel voice-transcript"><div class="panel-title"><h2>Gespräch</h2><small>AUTOMATISCH · 3 SEK.</small></div><div class="voice-transcript-content">${transcript}</div><p class="note">Illustration. Kein echter Anruf.</p></div>
      <div class="panel voice-erp"><div class="panel-title"><h2>Auftragsverarbeitung</h2><small>WOLKE + ERP</small></div><div class="voice-phase">${phase}</div><div class="erp-card"><div class="erp-row"><span>Kunde</span><b>Bistro Sora · K-00947</b></div>${n<2?`<div class="erp-empty">Warte auf Produktangaben ...</div>`:`<div class="erp-item"><strong>Mango-Nektar 1 L (12er)</strong><small>G-1077 · 6 Kartons</small></div><div class="erp-item"><strong>Jasminreis 5 kg</strong><small>R-3301 · 3 Kartons</small></div>`}${n>=4?`<div class="success-box">✓ Kunde hat die Positionen bestätigt</div>`:''}${n>=5?`<div class="success-box">✓ Auftrag WO-10484 vorbereitet</div>`:''}<div class="concept-box">Telefon ist nur ein weiterer Eingangskanal. Keine autonome Verkaufsberatung.</div></div></div>
    </section>`;
}

function customerHTML(){
  return `${pageHeader('KUNDEN & VERTRIEB / KUNDENPROFIL','Kundenprofil.','Bestellungen, Umsatz, Rohertrag, Retouren und Veränderungen werden in einem Kundenbild zusammengeführt. So sieht Vertrieb schneller, was sich beim Kunden verändert.')}
    <section class="profile-shell">
      <div class="profile-head"><div class="profile-id"><div class="avatar">AM</div><div><h2>Asia Markt Berlin</h2><p>Kunde 10231 · Einzelhandel · Berlin · Beispielansicht</p></div></div><span class="chip teal">Datenlage: gut</span></div>
      <div class="profile-kpis">
        <div class="kpi"><div class="kpi-label">Umsatz · 12 Mon.</div><div class="kpi-value">€184k</div><div class="kpi-sub">Beispieldaten</div></div>
        <div class="kpi"><div class="kpi-label">Rohertrag</div><div class="kpi-value">€36,8k</div><div class="kpi-sub">20,0 %</div></div>
        <div class="kpi"><div class="kpi-label">Bestelltrend</div><div class="kpi-value up">↑ +9 %</div><div class="kpi-sub">letzte 90 Tage</div></div>
        <div class="kpi"><div class="kpi-label">Frequenz</div><div class="kpi-value">3,2×</div><div class="kpi-sub">pro Woche</div></div>
        <div class="kpi"><div class="kpi-label">Retouren</div><div class="kpi-value">2,1 %</div><div class="kpi-sub">vom Warenwert</div></div>
      </div>
      <div class="profile-body">
        <div class="profile-col"><div class="section-label">Was kauft der Kunde?</div>
          <div class="product-line"><div><strong>Jasminreis & Reisprodukte</strong><small> · regelmäßig</small></div><div class="micro-bar"><i style="width:88%"></i></div></div>
          <div class="product-line"><div><strong>Saucen & Würzmittel</strong><small> · stabil</small></div><div class="micro-bar"><i style="width:74%"></i></div></div>
          <div class="product-line"><div><strong>Getränke</strong><small> · steigend</small></div><div class="micro-bar"><i style="width:61%"></i></div></div>
          <div class="product-line"><div><strong>Snacks</strong><small> · fallend</small></div><div class="micro-bar"><i style="width:38%"></i></div></div>
          <p class="note">Dazu sichtbar: Menge · Häufigkeit · letzter Kauf · Preis · Veränderung.</p>
        </div>
        <div class="profile-col"><div class="section-label">Was hat sich verändert?</div>
          <div class="change-line"><div><strong>Getränke +14 %</strong><small>letzte 90 Tage</small></div><span class="chip teal">steigt</span></div>
          <div class="change-line"><div><strong>Snacks −19 %</strong><small>Gesamtumsatz bleibt stabil</small></div><span class="chip red">prüfen</span></div>
          <div class="change-line"><div><strong>3 Stammartikel fehlen</strong><small>seit zwei Bestellungen</small></div><span class="chip amber">auffällig</span></div>
          <div class="change-line"><div><strong>Angebot 4481 offen</strong><small>seit 12 Tagen</small></div><span class="chip blue">offen</span></div>
        </div>
      </div>
      <div class="profile-trend"><div><div class="section-label">Entwicklung der letzten 6 Monate</div><p>Hier hilft die Kurve: Umsatz bleibt stabil, während sich einzelne Warengruppen verändern.</p></div>${lineChart({labels:['Mai','Jun','Jul','Aug','Sep','Okt'],series:[{name:'Umsatz',values:[100,103,101,104,102,103],color:'#143B4A'},{name:'Snacks',values:[100,98,96,92,87,81],color:'#D95D4E'},{name:'Getränke',values:[100,102,105,107,111,114],color:'#0B8F88'}],yLabel:'Index · Mai = 100'})}</div>
      <div class="profile-footer"><span class="signal-pill"><b>Sortiment:</b> 6 plausible Lücken</span><span class="signal-pill"><b>Preis:</b> 1 Entwicklung prüfen</span><span class="signal-pill"><b>Angebot:</b> 1 offen</span><span class="signal-pill"><b>Bestellung:</b> Frequenz stabil</span></div>
    </section>`;
}

function opportunitiesHTML(){
  return `${pageHeader('KUNDEN & VERTRIEB / VERKAUFSCHANCEN','Verkaufschancen.','Wolke prüft Bestellmuster und vergleichbare Kunden und zeigt wenige Fälle, die Vertrieb genauer ansehen kann. Der Hinweis ersetzt nicht das Kundengespräch.')}
    <section class="case-grid">${OPPORTUNITIES.map(o=>`<article class="case-card ${o.id==='opp-assortment'?'featured':''}"><div class="case-type">${o.type}</div><h3>${o.title}</h3><p>${o.text}</p><div class="case-meta">${o.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div><div class="case-actions"><button class="btn small" data-opportunity="${o.id}">Begründung ansehen</button></div></article>`).join('')}</section>`;
}

function actionsHTML(){
  const management = state.activeCampaign ? `<article class="action-card new"><div class="action-top"><div><div class="action-source">NEU · AUS MANAGEMENTENTSCHEIDUNG</div><h3>Brand X aktiv bei passenden Kunden vorstellen</h3><p>Geschäftsführung hat entschieden, den steigenden Bestand vier Wochen aktiv über passende Kundenprofile zu bearbeiten.</p></div><span class="chip teal">heute freigegeben</span></div><div class="action-stats"><div class="action-stat"><span>Passende Kunden</span><b>27</b></div><div class="action-stat"><span>Vertriebler</span><b>4</b></div><div class="action-stat"><span>angesprochen</span><b>${state.campaignProgress?21:0}</b></div><div class="action-stat"><span>gekauft</span><b>${state.campaignProgress?8:0}</b></div></div><div class="target-customers"><div class="target-row"><strong>Asia Markt Berlin</strong><span>kauft zwei vergleichbare Marken</span><button class="btn small">Brand X vorstellen</button></div><div class="target-row"><strong>Kim Gastro</strong><span>Brand X früher gekauft · letzter Kauf vor 4 Monaten</span><button class="btn small">Reaktivieren</button></div><div class="target-row"><strong>Dong Xuan Markt</strong><span>hohes Volumen in Kategorie · kein Brand X</span><button class="btn small">Sortiment prüfen</button></div></div>${!state.campaignProgress?`<div style="margin-top:14px"><button class="btn teal small" data-progress-campaign>Wirkung nach 4 Wochen simulieren</button></div>`:`<div class="success-box">Nach 4 Wochen: 21 Kunden angesprochen · 8 gekauft · +€18k Umsatz · Bestand −14 %. Häufigster Ablehnungsgrund: Preis.</div>`}</article>` : '';
  return `${pageHeader('','Vertriebsaktionen','Freigegebene Entscheidungen und konkrete Kundenhinweise landen beim zuständigen Vertriebler. Eine Managementaktion erscheint hier erst nach der Freigabe.')}
    <section class="action-list">${management || `<div class="empty-state"><div class="empty-icon">✓</div><h3>Noch keine neue Managementaktion.</h3><p>Öffnen Sie unter Geschäftsführung den Fall „Brand X Bestand“ und starten Sie dort ausdrücklich eine Vertriebsaktion. Erst dann erscheint sie hier.</p><button class="btn primary" data-view="decisions">Zu den Entscheidungen</button></div>`}
      <article class="action-card"><div class="action-top"><div><div class="action-source">AUS VERKAUFSCHANCE</div><h3>3 Stammartikel bei Kunde 11807 prüfen</h3><p>Der Vertriebler kann beim nächsten Kontakt prüfen, ob Bedarf, Bezugsquelle oder Sortiment sich verändert hat.</p></div><span class="chip">offen</span></div></article>
      <article class="action-card"><div class="action-top"><div><div class="action-source">ANGEBOT</div><h3>Angebot 4481 nachfassen</h3><p>Seit 12 Tagen offen; vergleichbare Angebote dieses Kundentyps werden schneller entschieden.</p></div><span class="chip">zugewiesen</span></div></article>
    </section>`;
}

const INTEL_CARD_LABELS = {
  assortment:'Sortimentslücke',
  customerChange:'Kundenentwicklung',
  newBrand:'Neue Marke',
  top3:'Priorisierung',
  margin:'Margenentwicklung',
  priceResponse:'Preisreaktion',
  stock:'Bestandsentwicklung',
  demand:'Wareneingang',
  offerFollow:'Angebot'
};

function miniIntelVisual(id){
  if(id==='margin') return `<div class="mini-line"><svg viewBox="0 0 220 54" aria-hidden="true"><path d="M4 10 C46 12 70 22 106 27 S165 42 216 47"/><path class="alt" d="M4 12 C50 14 95 15 130 17 S180 18 216 19"/></svg></div>`;
  if(id==='stock') return `<div class="mini-line"><svg viewBox="0 0 220 54" aria-hidden="true"><path class="amber" d="M4 47 C45 44 68 36 104 30 S160 18 216 8"/><path class="alt" d="M4 47 C60 45 105 43 150 41 S190 39 216 38"/></svg></div>`;
  if(id==='customerChange') return `<div class="mini-bars"><i style="height:33%"></i><i style="height:70%"></i><i class="down" style="height:92%"></i></div>`;
  if(id==='priceResponse') return `<div class="mini-line"><svg viewBox="0 0 220 54" aria-hidden="true"><path class="alt" d="M4 18 C55 18 93 20 132 18 S184 21 216 19"/><path d="M4 18 C52 24 86 31 126 35 S175 44 216 47"/></svg></div>`;
  return '';
}

function caseCard(id, c){
  const dynamic=state.intelMode==='dynamic';
  const visual=miniIntelVisual(id);
  return `<button class="intel-card ${dynamic?'dynamic':'clear'} ${c.mode==='hypothesis'?'hypothesis':''}" data-intel="${id}">
    <div class="intel-card-top"><span class="intel-kicker">${INTEL_CARD_LABELS[id]||c.type}</span>${c.mode==='hypothesis'?`<span class="intel-status">Hypothese</span>`:''}</div>
    <div class="intel-metric">${c.metric||c.title}</div>
    <div class="intel-submetric">${c.submetric||''}</div>
    ${visual}
    <div class="intel-question">${c.title}</div>
    <div class="intel-open">Ansehen →</div>
  </button>`;
}

function intelSection(title, note, ids){
  return `<section class="intel-section"><div class="intel-section-head"><div><h2>${title}</h2>${note?`<p>${note}</p>`:''}</div></div><div class="intel-bubble-grid">${ids.map(id=>caseCard(id,INTELLIGENCE_CASES[id])).join('')}</div></section>`;
}

function decisionsHTML(){
  const modeToggle=`<div class="intel-mode-toggle" role="group" aria-label="Darstellung"><button class="${state.intelMode==='clear'?'active':''}" data-intel-mode="clear">Klar</button><button class="${state.intelMode==='dynamic'?'active':''}" data-intel-mode="dynamic">Dynamisch</button></div>`;
  const modeLine='Wolke sucht in Kunden-, Preis-, Bestands- und Verkaufsdaten nach Dingen, die eine Entscheidung wert sein könnten.';
  return `${pageHeader('','Offene Entscheidungen',modeLine,modeToggle)}
    <div class="intel-mode-shell ${state.intelMode==='dynamic'?'dynamic-mode':'clear-mode'}">
      ${state.intelMode==='dynamic'?`<div class="dynamic-banner"><span class="pulse-dot"></span><strong>Wolke meldet sich.</strong><span>4 Themen</span></div>`:''}
      ${intelSection('Kunden & Sortiment','Was verändert sich beim Kunden, und wo könnte Geschäft liegen?',['assortment','customerChange','newBrand','top3'])}
      ${intelSection('Preis & Marge','Wo verändert sich die Wirtschaftlichkeit, obwohl das Geschäft ähnlich aussieht?',['margin','priceResponse'])}
      ${intelSection('Bestand & Einkauf','Wo bindet Ware Kapital, und wo könnte vor dem nächsten Wareneingang etwas fehlen?',['stock','demand'])}
      ${intelSection('Angebote & Vertrieb','Welche offenen Chancen verdienen Aufmerksamkeit?',['offerFollow'])}
    </div>`;
}

function historyHTML(){
  const liveRow = state.activeCampaign ? `<div class="history-row"><span>heute</span><strong>Brand X Bestand</strong><span>4 Wochen aktiv verkaufen</span><span>Geschäftsführung</span><span class="result">${state.campaignProgress?'+€18k · Bestand −14 %':'läuft'}</span><button class="history-open" data-history="live">›</button></div>` : '';
  return `${pageHeader('','Entscheidungshistorie','Entscheidung, Begründung und Ergebnis bleiben zusammen. So wird sichtbar, was umgesetzt wurde und was danach passiert ist.')}
    <section class="history-table"><div class="history-row head"><span>Datum</span><span>Fall</span><span>Entscheidung</span><span>Verantwortlich</span><span>Ergebnis</span><span></span></div>${liveRow}${HISTORY.map((h,i)=>`<div class="history-row"><span>${h.date}</span><strong>${h.case}</strong><span>${h.decision}</span><span>${h.owner}</span><span class="result">${h.result}</span><button class="history-open" data-history="${i}">›</button></div>`).join('')}</section>`;
}

function clearDemoTimers(){
  if(state.orderTimer){clearTimeout(state.orderTimer);state.orderTimer=null;}
  if(state.voiceTimer){clearTimeout(state.voiceTimer);state.voiceTimer=null;}
}

function scheduleActiveDemo(){
  clearDemoTimers();
  if((state.view==='whatsapp'||state.view==='email') && state.orderStep<5){
    state.orderTimer=setTimeout(()=>{state.orderStep+=1;render(false);},3000);
  }
  if(state.view==='phone' && state.voiceStep<VOICE_TURNS.length-1){
    state.voiceTimer=setTimeout(()=>{state.voiceStep+=1;render(false);},3000);
  }
}

function render(resetScroll=false){
  $$('.nav-item[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===state.view));
  $('#salesActionBadge').classList.toggle('hidden',!state.activeCampaign);
  let html = '';
  if(state.view==='home') html=homeHTML();
  else if(state.view==='whatsapp' || state.view==='email') html=orderHTML(state.view);
  else if(state.view==='phone') html=phoneHTML();
  else if(state.view==='customer') html=customerHTML();
  else if(state.view==='opportunities') html=opportunitiesHTML();
  else if(state.view==='actions') html=actionsHTML();
  else if(state.view==='decisions') html=decisionsHTML();
  else if(state.view==='history') html=historyHTML();
  $('#workspace').innerHTML = html;
  if(resetScroll) window.scrollTo({top:0,behavior:'auto'});
  location.hash = state.view;
  scheduleActiveDemo();
}

function navigate(view){
  if(!VIEW_META[view]) return;
  state.view=view;
  if(view==='whatsapp'||view==='email') state.orderStep=0;
  if(view==='phone') state.voiceStep=0;
  render(true);
  $('#sidebar').classList.remove('show');
}

function evidenceTable(rows){
  return `<div class="evidence-table"><div class="evidence-row head"><span>Signal</span><span>Wert / Basis</span><span>Einordnung</span></div>${rows.map(r=>`<div class="evidence-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}</div>`;
}

function openModal({eyebrow,title,recognized,evidence,question,discovery,canLaunch=false,chart=''}){
  $('#modalEyebrow').textContent=eyebrow;
  $('#modalTitle').textContent=title;
  $('#modalBody').innerHTML = `
    <div class="intel-modal-lead"><p>${recognized}</p>${chart || ''}</div>
    <div class="intel-modal-question"><span>Entscheidung</span><strong>${question}</strong></div>
    <div class="decision-options">${canLaunch?`<button class="btn teal" data-launch-sales>Vertriebsaktion starten</button><button class="btn">Einkauf prüfen</button><button class="btn">Beobachten</button><button class="btn danger-soft">Nicht relevant</button>`:`<button class="btn">Prüfen</button><button class="btn">Beobachten</button><button class="btn danger-soft">Nicht relevant</button>`}</div>
    <div class="intel-evidence-toggle"><button class="btn small" data-rechenweg>Beleg / Datenbasis ansehen</button></div>
    <div class="intel-evidence hidden" id="intelEvidence">${evidenceTable(evidence)}<p>Im echten Einsatz würden Datenquelle, Zeitraum, Filter und Berechnung für den Fall sichtbar dokumentiert.</p></div>
    ${canLaunch?`<p class="intel-after-note">Eine Vertriebsaktion erscheint erst nach Ihrer Freigabe beim zuständigen Vertrieb.</p>`:''}`;
  $('#modalBackdrop').classList.remove('hidden');
  $('#modal').classList.remove('hidden');
}

function closeModal(){ $('#modalBackdrop').classList.add('hidden'); $('#modal').classList.add('hidden'); }

function openOpportunity(id){
  const o=OPPORTUNITIES.find(x=>x.id===id); if(!o) return;
  openModal({eyebrow:o.detail.eyebrow,title:o.detail.title,recognized:o.detail.recognized,evidence:o.detail.evidence,question:o.detail.question,discovery:o.detail.discovery});
}

function openIntel(id){
  const c=INTELLIGENCE_CASES[id]; if(!c)return;
  openModal({eyebrow:`GESCHÄFTSFÜHRUNG · ${c.mode==='hypothesis'?'HYPOTHESE':'BEISPIEL'}`,title:c.title,recognized:c.recognized,evidence:c.evidence,question:c.question,discovery:c.discovery,canLaunch:!!c.canLaunch,chart:INTEL_CHARTS[id]?INTEL_CHARTS[id]():''});
}

function openHistory(id){
  const h = id==='live' ? {date:'heute',case:'Brand X Bestand',decision:'Brand X vier Wochen aktiv verkaufen',owner:'Geschäftsführung',result:state.campaignProgress?'+€18k Umsatz · Bestand −14 %':'läuft'} : HISTORY[Number(id)];
  if(!h)return;
  $('#modalEyebrow').textContent='ENTSCHEIDUNGSHISTORIE';
  $('#modalTitle').textContent=h.case;
  $('#modalBody').innerHTML=`<div class="detail-stage"><div class="detail-stage-label">AUSGANGSLAGE</div><p>Wolke hat einen wirtschaftlich auffälligen Fall mit Beleg zur Prüfung vorgelegt.</p></div><div class="detail-stage"><div class="detail-stage-label">ENTSCHEIDUNG</div><h4>${h.decision}</h4><p>Verantwortlich: ${h.owner} · ${h.date}</p></div><div class="detail-stage"><div class="detail-stage-label">WARUM?</div><p>Die Entscheidung und ihre Begründung bleiben Teil der Historie. Sie kann später gegen das Ergebnis geprüft werden.</p></div><div class="detail-stage"><div class="detail-stage-label">ERGEBNIS</div><h4>${h.result}</h4><p>Das Ergebnis wird nicht als „KI hatte recht“ verstanden, sondern als beobachtete Wirkung einer menschlichen Entscheidung.</p></div>`;
  $('#modalBackdrop').classList.remove('hidden'); $('#modal').classList.remove('hidden');
}

function showRechenweg(){
  const box=$('#intelEvidence');
  if(!box) return;
  box.classList.toggle('hidden');
  const btn=$('[data-rechenweg]');
  if(btn) btn.textContent=box.classList.contains('hidden')?'Beleg / Datenbasis ansehen':'Beleg ausblenden';
}

function launchSalesAction(){
  state.activeCampaign=true;
  closeModal();
  $('#salesActionBadge').classList.remove('hidden');
  navigate('actions');
}

function resetDemo(){
  clearDemoTimers();state.orderStep=0;state.voiceStep=0;state.activeCampaign=false;state.campaignProgress=0;state.dismissedCases.clear();state.intelMode='clear';
  closeModal();navigate('home');
}

document.addEventListener('click',e=>{
  const view=e.target.closest('[data-view]'); if(view){navigate(view.dataset.view);return;}
  const toggle=e.target.closest('[data-toggle]'); if(toggle){const g=toggle.closest('.nav-group');g.classList.toggle('open');toggle.setAttribute('aria-expanded',String(g.classList.contains('open')));return;}
  const order=e.target.closest('[data-order]'); if(order){if(order.dataset.order==='restart'){state.orderStep=0;render(false);}return;}
  const opp=e.target.closest('[data-opportunity]'); if(opp){openOpportunity(opp.dataset.opportunity);return;}
  const intelMode=e.target.closest('[data-intel-mode]'); if(intelMode){state.intelMode=intelMode.dataset.intelMode;render(false);return;}
  const intel=e.target.closest('[data-intel]'); if(intel){openIntel(intel.dataset.intel);return;}
  const hist=e.target.closest('[data-history]'); if(hist){openHistory(hist.dataset.history);return;}
  if(e.target.closest('[data-rechenweg]')){showRechenweg();return;}
  if(e.target.closest('[data-launch-sales]')){launchSalesAction();return;}
  if(e.target.closest('[data-progress-campaign]')){state.campaignProgress=1;render(false);return;}
});

$('#modalClose').addEventListener('click',closeModal);
$('#modalBackdrop').addEventListener('click',closeModal);
$('#resetDemo').addEventListener('click',resetDemo);
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('show'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

const start=(location.hash||'#home').slice(1);
state.view=VIEW_META[start]?start:'home';
render(true);
