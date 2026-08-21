'use strict';

const CONTENT_DEPTH = Object.freeze(['SIMPLE', 'DETAILED', 'ULTRA_DETAILED']);
const DELIVERY_MODE = Object.freeze(['PRESENTATION', 'HANDOUT', 'DUAL']);
const PAGE_BUDGETS = Object.freeze({
  COMPACT: Object.freeze({ min: 6, max: 8, target: 7 }),
  STANDARD: Object.freeze({ min: 10, max: 12, target: 11 }),
  EXTENDED: Object.freeze({ min: 14, max: 16, target: 15 }),
});
const A4_PORTRAIT = Object.freeze({ width: 8.267, height: 11.693, unit: 'in', printSafeMargin: 0.55 });

function enumValue(value, allowed, fallback, label) {
  const normalized = String(value || fallback).trim().toUpperCase();
  if (!allowed.includes(normalized)) throw new RangeError(`${label} must be one of: ${allowed.join(', ')}`);
  return normalized;
}

function resolvePageBudget(value = 'STANDARD') {
  const numeric = typeof value === 'number' ? value : (/^\d+$/.test(String(value).trim()) ? Number(value) : null);
  if (numeric !== null) {
    if (!Number.isInteger(numeric) || numeric < 1) throw new RangeError('Explicit PAGE_BUDGET must be a positive integer');
    return { kind: 'EXPLICIT', min: numeric, max: numeric, target: numeric, explicit: true };
  }
  const preset = String(value || 'STANDARD').trim().toUpperCase();
  if (!PAGE_BUDGETS[preset]) throw new RangeError(`PAGE_BUDGET must be COMPACT, STANDARD, EXTENDED, or a positive integer`);
  return { kind: preset, ...PAGE_BUDGETS[preset], explicit: false };
}

function resolveTeachingOptions(options = {}) {
  const contentDepth = enumValue(options.contentDepth, CONTENT_DEPTH, 'SIMPLE', 'CONTENT_DEPTH');
  const deliveryMode = enumValue(options.deliveryMode, DELIVERY_MODE, 'PRESENTATION', 'DELIVERY_MODE');
  const pageBudget = resolvePageBudget(options.pageBudget);
  const audience = String(options.audience || '').trim().toUpperCase();
  return {
    contentDepth,
    deliveryMode,
    pageBudget,
    audience,
    requiresMasterContent: contentDepth !== 'SIMPLE' || deliveryMode === 'DUAL',
    persistMasterContent: deliveryMode === 'DUAL',
    researchDepth: contentDepth === 'ULTRA_DETAILED' ? 'THOROUGH_WHEN_NEEDED' : contentDepth === 'DETAILED' ? 'VERIFY_IMPORTANT_AND_VOLATILE' : 'ONLY_WHEN_NEEDED',
    outputs: deliveryMode === 'DUAL' ? ['PRESENTATION', 'HANDOUT'] : [deliveryMode],
    seniorConstraints: audience === 'SENIOR',
  };
}

module.exports = { CONTENT_DEPTH, DELIVERY_MODE, PAGE_BUDGETS, A4_PORTRAIT, resolvePageBudget, resolveTeachingOptions };
