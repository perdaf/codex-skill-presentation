'use strict';

const { resolveTheme } = require('../themes');
const epnRiviereSalee = require('./epn-riviere-salee');

const registry = Object.freeze({ EPN_RIVIERE_SALEE: epnRiviereSalee });
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function resolveBrand(input) {
  if (!input) return null;
  if (typeof input === 'object' && input.id && registry[String(input.id).toUpperCase()]) return registry[String(input.id).toUpperCase()];
  const id = String(input).trim().toUpperCase();
  if (!registry[id]) throw new RangeError(`Unknown BRAND: ${input}`);
  return registry[id];
}

function maxSize(profileRole = {}, minimum = 0, face = 'Arial') {
  return { ...profileRole, face, fallback: 'Helvetica', size: Math.max(Number(profileRole.size) || 0, minimum) };
}

function mergeBrandWithTheme(themeInput = 'corporate', brandInput = null, context = {}) {
  const profileTheme = resolveTheme(themeInput);
  const brand = resolveBrand(brandInput);
  if (!brand) return profileTheme;
  const theme = clone(profileTheme);
  const mins = brand.typography.minimumSizes;
  theme.colors = { ...theme.colors, ...clone(brand.palette) };
  ['display', 'title', 'subtitle', 'body', 'caption', 'stat'].forEach((role) => {
    theme.typography[role] = maxSize(theme.typography[role], mins[role], brand.typography.face);
  });
  theme.name = `${brand.id.toLowerCase()}+${profileTheme.name}`;
  theme.brand = clone(brand);
  theme.brandId = brand.id;
  theme.profileName = profileTheme.name;
  theme.deliveryMode = String(context.deliveryMode || 'PRESENTATION').toUpperCase();
  theme.brandRules = theme.deliveryMode === 'HANDOUT' ? clone(brand.handout) : clone(brand.projection);
  theme.fontFace = theme.typography.body.face; theme.titleFontFace = theme.typography.title.face;
  theme.primary = theme.colors.primary; theme.secondary = theme.colors.secondary; theme.accent = theme.colors.accent;
  theme.background = theme.colors.background; theme.surface = theme.colors.surface; theme.text = theme.colors.text;
  theme.muted = theme.colors.muted; theme.line = theme.colors.line;
  theme.titleSize = theme.typography.title.size; theme.subtitleSize = theme.typography.subtitle.size;
  theme.bodySize = theme.typography.body.size; theme.captionSize = theme.typography.caption.size;
  return theme;
}

function applyBrand(themeInput, brandInput, context = {}) { return mergeBrandWithTheme(themeInput, brandInput, context); }

module.exports = { registry, brandNames: Object.freeze(Object.keys(registry)), resolveBrand, mergeBrandWithTheme, applyBrand };
