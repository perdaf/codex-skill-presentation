'use strict';

const SAFE_SANS = 'Arial';
const SAFE_SERIF = 'Georgia';
const base = {
  name: 'corporate',
  colors: { primary: '16324F', secondary: '3B82A0', accent: 'F59E0B', background: 'F8FAFC', surface: 'FFFFFF', text: '15202B', muted: '5B6B7A', line: 'D8E1E8', onPrimary: 'FFFFFF', onPrimaryMuted: 'E6EFF5', chart: ['16324F', '3B82A0', 'F59E0B', '6B7280'] },
  typography: { display: { face: SAFE_SANS, fallback: 'Helvetica', size: 42, bold: true }, title: { face: SAFE_SANS, fallback: 'Helvetica', size: 32, bold: true }, subtitle: { face: SAFE_SANS, fallback: 'Helvetica', size: 20, bold: false }, body: { face: SAFE_SANS, fallback: 'Helvetica', size: 18, bold: false }, caption: { face: SAFE_SANS, fallback: 'Helvetica', size: 11, bold: false }, stat: { face: SAFE_SANS, fallback: 'Helvetica', size: 38, bold: true } },
  spacing: { xs: 0.18, sm: 0.25, md: 0.36, lg: 0.55, xl: 0.8 },
  radius: { card: 0.06, image: 0, button: 0.08 },
  shadows: { card: { type: 'outer', color: '000000', opacity: 0.12, blur: 1.5, angle: 45, distance: 1 } },
  layout: { slideWidth: 13.333, slideHeight: 7.5, margin: 0.68, columns: 12, gutter: 0.22, density: 'MEDIUM' },
  shapeStyle: 'precise', iconStyle: 'simple-line', photoStyle: 'clean-editorial',
};
const clone = (value) => JSON.parse(JSON.stringify(value));
function merge(a, b) { const out = clone(a); Object.entries(b || {}).forEach(([key, value]) => { out[key] = value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' ? merge(out[key], value) : clone(value); }); return out; }
const profile = (name, patch) => merge(base, { name, ...patch });
const profiles = {
  education: profile('education', { colors: { primary: '2457A7', secondary: '2A9D8F', accent: 'F4A261', background: 'F7FBFF', text: '17324D', chart: ['2457A7', '2A9D8F', 'F4A261', 'E76F51'] }, typography: { display: { size: 44 }, title: { size: 34 }, body: { size: 20 } }, layout: { margin: 0.72, density: 'LOW' }, radius: { card: 0.12 }, shapeStyle: 'friendly-geometric', iconStyle: 'rounded-illustrative', photoStyle: 'bright-authentic' }),
  kids: profile('kids', { colors: { primary: '5B4BDB', secondary: '1FB6A6', accent: 'FFB703', background: 'FFF8ED', text: '27233A', chart: ['5B4BDB', '1FB6A6', 'FFB703', 'F05D5E'] }, typography: { display: { face: 'Arial Rounded MT Bold', fallback: SAFE_SANS, size: 48 }, title: { face: 'Arial Rounded MT Bold', fallback: SAFE_SANS, size: 38 }, subtitle: { size: 22 }, body: { size: 21 }, caption: { size: 13 }, stat: { size: 44 } }, layout: { margin: 0.72, density: 'LOW' }, radius: { card: 0.18, image: 0.14, button: 0.2 }, shapeStyle: 'soft-playful', iconStyle: 'cartoon', photoStyle: 'colorful-illustration' }),
  senior: profile('senior', { colors: { primary: '12355B', secondary: '006D77', accent: 'E09F3E', background: 'FFFFFF', text: '111111', muted: '3D4852', line: '9AA5B1', chart: ['12355B', '006D77', 'C05621', '4A5568'] }, typography: { display: { size: 48 }, title: { size: 38 }, subtitle: { size: 24 }, body: { size: 23 }, caption: { size: 15 }, stat: { size: 46 } }, layout: { margin: 0.8, density: 'LOW' }, shadows: { card: { type: 'none' } }, radius: { card: 0.03 }, iconStyle: 'bold-simple', photoStyle: 'clear-high-contrast' }),
  corporate: profile('corporate', {}),
  premium: profile('premium', { colors: { primary: '171717', secondary: '6B6257', accent: 'B5945A', background: 'F5F1EA', surface: 'FCFAF6', text: '171717', muted: '625D55', line: 'D8D0C3', onPrimaryMuted: 'D9D2C8', chart: ['171717', 'B5945A', '6B6257', 'B8AA98'] }, typography: { display: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 48 }, title: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 36 }, stat: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 44 } }, layout: { margin: 0.82, density: 'LOW' }, radius: { card: 0 }, shadows: { card: { type: 'none' } }, shapeStyle: 'editorial-sharp', iconStyle: 'minimal-fine', photoStyle: 'cinematic-luxury' }),
  minimal: profile('minimal', { colors: { primary: '111111', secondary: '575757', accent: '2563EB', background: 'FFFFFF', surface: 'FFFFFF', text: '111111', muted: '666666', line: 'E5E5E5', chart: ['111111', '2563EB', '737373', 'BDBDBD'] }, typography: { display: { size: 46 }, title: { size: 34 } }, layout: { margin: 0.86, density: 'LOW' }, radius: { card: 0 }, shadows: { card: { type: 'none' } }, shapeStyle: 'minimal', iconStyle: 'monoline', photoStyle: 'quiet-editorial' }),
  tech: profile('tech', { colors: { primary: '172554', secondary: '0369A1', accent: '14B8A6', background: 'F4F7FB', text: '101828', muted: '52606D', line: 'C8D5E3', chart: ['172554', '0369A1', '14B8A6', '7C3AED'] }, typography: { display: { face: 'Avenir Next', fallback: SAFE_SANS, size: 42 }, title: { face: 'Avenir Next', fallback: SAFE_SANS, size: 32 }, stat: { face: 'Avenir Next', fallback: SAFE_SANS, size: 40 } }, layout: { margin: 0.64, density: 'MEDIUM' }, radius: { card: 0.08 }, shapeStyle: 'interface-grid', iconStyle: 'technical-line', photoStyle: 'crisp-future-realism' }),
  tropical: profile('tropical', { colors: { primary: '124E4A', secondary: '1F7A6B', accent: 'E69A45', background: 'F7F3E9', surface: 'FFFDF7', text: '173B38', muted: '5F6F68', line: 'CFD9CF', chart: ['124E4A', 'E69A45', '5E8C61', '3A6EA5'] }, typography: { display: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 46 }, title: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 35 } }, layout: { margin: 0.72, density: 'LOW' }, radius: { card: 0.04 }, shadows: { card: { type: 'none' } }, shapeStyle: 'organic-editorial', iconStyle: 'botanical-line', photoStyle: 'warm-natural-documentary' }),
  social: profile('social', { colors: { primary: '151515', secondary: '6D28D9', accent: 'F43F5E', background: 'FFFDF8', text: '151515', chart: ['151515', '6D28D9', 'F43F5E', 'F59E0B'] }, typography: { display: { size: 50 }, title: { size: 39 }, subtitle: { size: 22 }, body: { size: 20 }, stat: { size: 48 } }, layout: { margin: 0.64, density: 'LOW' }, radius: { card: 0.1 }, shapeStyle: 'bold-modular', iconStyle: 'bold-flat', photoStyle: 'high-impact-crop' }),
  editorial: profile('editorial', { colors: { primary: '202020', secondary: '765D4D', accent: 'C84B31', background: 'F6F1E8', surface: 'FFFDF9', text: '202020', muted: '645F58', line: 'D9D0C5', chart: ['202020', 'C84B31', '765D4D', '8B9A83'] }, typography: { display: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 48 }, title: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 36 }, stat: { face: SAFE_SERIF, fallback: 'Times New Roman', size: 44 } }, layout: { margin: 0.76, density: 'MEDIUM' }, radius: { card: 0 }, shadows: { card: { type: 'none' } }, shapeStyle: 'magazine', iconStyle: 'editorial-fine', photoStyle: 'documentary-magazine' }),
};
const profileSignals = {
  kids: [['eleves de cm1', 8], ['eleves de cm2', 8], ['cm1', 7], ['cm2', 7], ['maternelle', 7], ['primaire', 6], ['enfant', 5], ['enfants', 5], ['kids', 5], ['child', 5], ['ludique', 3]],
  senior: [['personnes agees', 7], ['grand age', 7], ['senior', 6], ['accessibilite', 4]],
  tropical: [['voyage culturel en martinique', 9], ['martinique', 7], ['caraibe', 6], ['tropical', 5], ['tourisme', 4], ['island', 4], ['ile', 3]],
  tech: [['architecture d une application web', 9], ['architecture application web', 9], ['application web', 5], ['transformation numerique', 4], ['informatique', 5], ['logiciel', 5], ['software', 5], ['cyber', 5], ['donnee', 4], ['data', 4], ['tech', 4], ['api', 5], ['ia', 4], ['ai', 4]],
  premium: [['haut de gamme', 7], ['luxe', 6], ['premium', 6], ['luxury', 6], ['prestige', 5]],
  social: [['carousel', 6], ['carrousel', 6], ['instagram', 6], ['linkedin', 5], ['social', 4]],
  education: [['formation professionnelle', 5], ['formation', 4], ['cours', 5], ['education', 5], ['pedagogie', 5], ['pedagogique', 5], ['debutant', 4], ['training', 4]],
  corporate: [['resultats financiers annuels', 9], ['transformation digitale des pme', 8], ['transformation digitale', 6], ['resultats financiers', 7], ['comite de direction', 7], ['resultat', 5], ['resultats', 5], ['business', 5], ['direction', 4], ['manager', 4], ['managers', 4], ['investisseur', 5], ['quarter', 4], ['bilan', 5], ['pme', 3], ['entreprise', 3], ['professionnelle', 2]],
  editorial: [['portfolio', 6], ['magazine', 5], ['reportage', 5], ['editorial', 5]],
  minimal: [['minimal', 5], ['epure', 5], ['sobre', 3]],
};
const profilePriority = ['kids', 'senior', 'tropical', 'tech', 'premium', 'social', 'education', 'corporate', 'editorial', 'minimal'];
function normalizeContext(context = '') {
  return ` ${String(typeof context === 'string' ? context : JSON.stringify(context))
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')} `;
}
function hasCompleteSignal(normalized, signal) { return normalized.includes(` ${signal} `); }
function selectProfile(context = '') {
  const normalized = normalizeContext(context);
  let winner = 'corporate'; let bestScore = 0;
  profilePriority.forEach((name) => {
    const score = profileSignals[name].reduce((sum, [signal, weight]) => sum + (hasCompleteSignal(normalized, signal) ? weight : 0), 0);
    if (score > bestScore) { winner = name; bestScore = score; }
  });
  return winner;
}
function finalise(theme) { theme.layout.contentWidth = theme.layout.slideWidth - (2 * theme.layout.margin); Object.assign(theme, { fontFace: theme.typography.body.face, titleFontFace: theme.typography.title.face, primary: theme.colors.primary, secondary: theme.colors.secondary, accent: theme.colors.accent, background: theme.colors.background, surface: theme.colors.surface, text: theme.colors.text, muted: theme.colors.muted, line: theme.colors.line, margin: theme.layout.margin, slideWidth: theme.layout.slideWidth, slideHeight: theme.layout.slideHeight, titleSize: theme.typography.title.size, subtitleSize: theme.typography.subtitle.size, bodySize: theme.typography.body.size, captionSize: theme.typography.caption.size }); return theme; }
function resolveTheme(input = 'corporate') { if (typeof input === 'string') return finalise(clone(profiles[input.toLowerCase()] || profiles.corporate)); const profileName = input.profile || input.name || 'corporate'; return finalise(merge(profiles[profileName] || profiles.corporate, input)); }
function deriveBrandTheme(brand = {}, fallbackProfile = 'corporate') { return resolveTheme({ profile: fallbackProfile, name: brand.name || `brand-${fallbackProfile}`, colors: brand.colors || {}, typography: brand.typography || {}, radius: brand.radius || {}, shadows: brand.shadows || {}, layout: brand.layout || {}, brandDerived: true }); }
function createVariation(input, seed = 0) { const t = resolveTheme(input); const variants = ['balanced', 'image-led', 'type-led']; t.variation = variants[Math.abs(Number(seed) || 0) % variants.length]; if (t.variation === 'image-led') t.layout.margin = Math.max(0.55, t.layout.margin - 0.08); if (t.variation === 'type-led') t.colors.secondary = t.colors.accent; return finalise(t); }
module.exports = { profiles, selectProfile, resolveTheme, deriveBrandTheme, createVariation, SAFE_SANS, SAFE_SERIF };
