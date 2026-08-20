const pptxgen = require('./presentation-tools/node_modules/pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.company = 'Codex';
pptx.subject = 'Présentation de la Martinique';
pptx.title = 'Martinique — l’île aux fleurs';
pptx.lang = 'fr-FR';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'fr-FR',
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.margin = 0;

const W = 13.333;
const H = 7.5;
const C = {
  navy: '082B3A',
  deep: '063542',
  teal: '00A6A6',
  mint: 'BFE9DF',
  coral: 'FF795E',
  sand: 'F8F1E6',
  ink: '17313A',
  white: 'FFFFFF',
  muted: '5D747A',
  line: 'D4E3E2',
};
const imagePath = 'assets/images/martinique-couverture.png';

function rect(slide, x, y, w, h, fill, transparency = 0, line = fill, radius = 0) {
  slide.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill, transparency },
    line: { color: line, transparency: 100 },
  });
}

function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, {
    x, y, w, h, margin: 0,
    fontFace: opts.fontFace || 'Aptos',
    fontSize: opts.fontSize || 16,
    color: opts.color || C.ink,
    bold: opts.bold || false,
    breakLine: false,
    fit: 'shrink',
    valign: opts.valign || 'mid',
    align: opts.align || 'left',
    paraSpaceAfterPt: 0,
    ...opts,
  });
}

function footer(slide, n) {
  slide.addShape(pptx.ShapeType.line, { x: 0.58, y: 7.02, w: 12.18, h: 0, line: { color: C.line, width: 0.7 } });
  text(slide, 'MARTINIQUE  •  ANTILLES FRANÇAISES', 0.6, 7.14, 4.4, 0.16, { fontSize: 6.8, color: C.muted, bold: true, charSpacing: 1.1 });
  text(slide, String(n).padStart(2, '0'), 12.2, 7.09, 0.55, 0.22, { fontSize: 8, color: C.teal, bold: true, align: 'right' });
}

function pill(slide, value, x, y, w, color = C.teal) {
  rect(slide, x, y, w, 0.32, color, 0, color, 0.15);
  text(slide, value, x, y + 0.01, w, 0.25, { fontSize: 7.4, color: C.white, bold: true, align: 'center', charSpacing: 0.6 });
}

// Slide 1 — couverture
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  slide.addImage({ path: imagePath, x: 0, y: 0, w: W, h: H });
  rect(slide, 0, 0, W, H, C.navy, 18);
  rect(slide, 0, 0, 7.1, H, C.navy, 12);
  rect(slide, 0.68, 0.78, 0.12, 1.64, C.coral);
  text(slide, 'ANTILLES FRANÇAISES', 1.02, 0.83, 3.7, 0.24, { fontSize: 8.5, color: C.mint, bold: true, charSpacing: 1.5 });
  text(slide, 'Martinique', 1.0, 1.22, 5.8, 0.78, { fontFace: 'Aptos Display', fontSize: 36, color: C.white, bold: true });
  text(slide, 'L’île aux fleurs, entre reliefs volcaniques\net horizons caribéens.', 1.02, 2.12, 4.9, 0.72, { fontSize: 16.5, color: 'EAF9F6', breakLine: false, valign: 'top', breakLine: false });
  pill(slide, 'UN TERRITOIRE À VIVRE', 1.02, 3.24, 1.9, C.teal);
  text(slide, 'MER DES CARAÏBES  ·  OCÉAN ATLANTIQUE', 1.02, 6.54, 4.3, 0.19, { fontSize: 7.1, color: C.white, bold: true, charSpacing: 0.8 });
  text(slide, '01', 12.02, 6.45, 0.58, 0.35, { fontSize: 12, color: C.white, bold: true, align: 'right' });
}

// Slide 2 — repères
{
  const slide = pptx.addSlide();
  slide.background = { color: C.sand };
  text(slide, 'UN TERRITOIRE SINGULIER', 0.62, 0.51, 4.0, 0.22, { fontSize: 8, color: C.teal, bold: true, charSpacing: 1.5 });
  text(slide, 'Une île française au cœur des Caraïbes', 0.6, 0.88, 8.4, 0.58, { fontFace: 'Aptos Display', fontSize: 25, color: C.navy, bold: true });
  text(slide, 'La Martinique conjugue une identité créole forte, un patrimoine vivant et une géographie spectaculaire.', 0.62, 1.52, 8.8, 0.35, { fontSize: 12.8, color: C.muted });

  const cards = [
    ['1 128', 'km² de contrastes', 'Forêts tropicales, plages et reliefs en quelques kilomètres.'],
    ['34', 'communes', 'Un maillage de bourgs, de villes et de paysages très variés.'],
    ['1 397 m', 'Montagne Pelée', 'Un volcan emblématique qui façonne le nord de l’île.'],
  ];
  cards.forEach((card, i) => {
    const x = 0.62 + i * 4.12;
    rect(slide, x, 2.25, 3.72, 2.25, C.white, 0, C.white, 0.16);
    rect(slide, x, 2.25, 3.72, 0.08, i === 1 ? C.coral : C.teal);
    text(slide, card[0], x + 0.26, 2.62, 3.15, 0.42, { fontFace: 'Aptos Display', fontSize: 22, color: C.navy, bold: true });
    text(slide, card[1], x + 0.26, 3.13, 3.16, 0.24, { fontSize: 11, color: C.teal, bold: true });
    text(slide, card[2], x + 0.26, 3.56, 3.14, 0.55, { fontSize: 10.2, color: C.muted, valign: 'top' });
  });

  rect(slide, 0.62, 5.12, 12.08, 1.32, C.deep, 0, C.deep, 0.18);
  text(slide, '« La diversité se vit ici à taille humaine : du littoral aux sommets, chaque route révèle une autre Martinique. »', 0.98, 5.48, 10.55, 0.4, { fontSize: 15, color: C.white, italic: true });
  text(slide, 'GÉOGRAPHIE • CULTURE • ART DE VIVRE', 0.98, 6.07, 5.2, 0.18, { fontSize: 7, color: C.mint, bold: true, charSpacing: 1.2 });
  footer(slide, 2);
}

// Slide 3 — expérience
{
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  rect(slide, 0, 0, W, 0.18, C.teal);
  text(slide, 'UNE DESTINATION PLURIELLE', 0.62, 0.53, 4.8, 0.22, { fontSize: 8, color: C.teal, bold: true, charSpacing: 1.5 });
  text(slide, 'Trois façons d’entrer en Martinique', 0.6, 0.89, 8.6, 0.54, { fontFace: 'Aptos Display', fontSize: 25, color: C.navy, bold: true });

  const cols = [
    { x: 0.62, no: '01', title: 'Nature', label: 'RESPIRER', color: C.teal, body: 'Randonnées en forêt, fonds marins, anses tranquilles et panoramas volcaniques.' },
    { x: 4.82, no: '02', title: 'Culture', label: 'RENCONTRER', color: C.coral, body: 'Créolité, musique, architecture et mémoire : une histoire qui se partage.' },
    { x: 9.02, no: '03', title: 'Saveurs', label: 'SAVOURER', color: 'D79025', body: 'Épices, fruits tropicaux, rhums agricoles et tables inspirées par le terroir.' },
  ];
  cols.forEach((item) => {
    rect(slide, item.x, 2.06, 3.68, 3.38, 'F7FAF9', 0, 'F7FAF9', 0.16);
    rect(slide, item.x + 0.3, 2.38, 0.56, 0.56, item.color, 0, item.color, 0.14);
    text(slide, item.no, item.x + 0.3, 2.49, 0.56, 0.19, { fontSize: 8.5, color: C.white, bold: true, align: 'center' });
    text(slide, item.label, item.x + 1.06, 2.42, 2.25, 0.17, { fontSize: 7.2, color: item.color, bold: true, charSpacing: 1.1 });
    text(slide, item.title, item.x + 0.3, 3.2, 2.95, 0.37, { fontFace: 'Aptos Display', fontSize: 20, color: C.navy, bold: true });
    text(slide, item.body, item.x + 0.3, 3.83, 2.98, 0.77, { fontSize: 11, color: C.muted, valign: 'top' });
    slide.addShape(pptx.ShapeType.line, { x: item.x + 0.3, y: 5.02, w: 2.98, h: 0, line: { color: item.color, width: 1.4 } });
  });
  rect(slide, 0.62, 6.02, 12.08, 0.53, C.sand, 0, C.sand, 0.12);
  text(slide, 'Une promesse : ralentir, explorer et goûter une Caraïbe singulière.', 0.92, 6.16, 10.2, 0.19, { fontSize: 11.5, color: C.ink, bold: true });
  text(slide, 'À DÉCOUVRIR', 11.08, 6.16, 1.25, 0.19, { fontSize: 7.2, color: C.teal, bold: true, align: 'right', charSpacing: 1.1 });
  footer(slide, 3);
}

pptx.writeFile({ fileName: 'martinique-test.pptx' });
