'use strict';

const STATUS = Object.freeze({
  VALID: 'VALID',
  REGRESSION: 'TARGETED_EDIT_READABILITY_REGRESSION',
});

const STRATEGIES = Object.freeze([
  'DIRECT',
  'TEXT_BOX_EXPANSION',
  'LOCAL_LAYOUT_ADAPTATION',
  'AUTHORIZED_REFORMULATION',
]);

const PROFILE_LIMITS = Object.freeze({
  SENIOR: { minFontSize: 18, minTitleFontSize: 28, minStepLabelFontSize: 16, maxDensity: 0.86, minCompressionRatio: 0.9, minGap: 0.12 },
  DEFAULT: { minFontSize: 14, minTitleFontSize: 24, minStepLabelFontSize: 14, maxDensity: 0.94, minCompressionRatio: 0.8, minGap: 0.08 },
});

function limitsFor(profile, role) {
  const limits = PROFILE_LIMITS[String(profile || '').toUpperCase()] || PROFILE_LIMITS.DEFAULT;
  const normalizedRole = String(role || 'BODY').toUpperCase();
  const minFontSize = normalizedRole === 'TITLE' ? limits.minTitleFontSize
    : normalizedRole === 'STEP_LABEL' ? limits.minStepLabelFontSize : limits.minFontSize;
  return { ...limits, minFontSize };
}

function boxesOverlap(a, b, gap) {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x
    && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

function estimateDensity(text, box) {
  const fontSize = Number(box.fontSize || 0);
  if (!fontSize || !box.w || !box.h) return Infinity;
  const charsPerLine = Math.max(1, Math.floor((box.w * 72) / (fontSize * 0.52)));
  const lines = Math.max(1, Math.floor((box.h * 72) / (fontSize * 1.2)));
  return String(text || '').trim().length / (charsPerLine * lines);
}

function assessCandidate(text, candidate, context) {
  const { limits, slide, neighbors } = context;
  const reasons = [];
  const fontSize = Number(candidate.fontSize || 0);
  const density = candidate.density == null ? estimateDensity(text, candidate) : Number(candidate.density);
  const compressionRatio = candidate.compressionRatio == null ? 1 : Number(candidate.compressionRatio);
  if (fontSize < limits.minFontSize) reasons.push('FONT_BELOW_PROFILE_MINIMUM');
  if (density > limits.maxDensity) reasons.push('EXCESSIVE_TEXT_DENSITY');
  if (compressionRatio < limits.minCompressionRatio) reasons.push('EXCESSIVE_COMPRESSION');
  if (candidate.clipped) reasons.push('CLIPPING');
  if (candidate.hierarchyPreserved === false) reasons.push('VISUAL_HIERARCHY_LOSS');
  if (candidate.distanceReadable === false) reasons.push('PROJECTION_DISTANCE_READABILITY');
  if (candidate.x < 0 || candidate.y < 0 || candidate.x + candidate.w > slide.w || candidate.y + candidate.h > slide.h) reasons.push('OFF_SLIDE');
  if (neighbors.some((neighbor) => boxesOverlap(candidate, neighbor, limits.minGap))) reasons.push('NEIGHBOR_COLLISION_OR_PROXIMITY');
  return { valid: reasons.length === 0, reasons, metrics: { fontSize, density, compressionRatio, minFontSize: limits.minFontSize } };
}

function validateTargetedEditReadability(input = {}) {
  const text = String(input.text || '');
  const limits = limitsFor(input.profile, input.role);
  const context = { limits, slide: input.slide || { w: 13.333, h: 7.5 }, neighbors: input.neighbors || [] };
  const candidates = [
    ['DIRECT', input.current],
    ['TEXT_BOX_EXPANSION', input.textBoxExpansion],
    ['LOCAL_LAYOUT_ADAPTATION', input.localLayoutAdaptation],
    ['AUTHORIZED_REFORMULATION', input.reformulation],
  ];
  const attempts = [];
  for (const [strategy, candidate] of candidates) {
    if (!candidate) continue;
    if (strategy === 'AUTHORIZED_REFORMULATION' && (!input.allowReformulation || candidate.exactMeaningPreserved !== true)) {
      attempts.push({ strategy, valid: false, reasons: ['REFORMULATION_NOT_AUTHORIZED_OR_EQUIVALENT'] });
      continue;
    }
    const assessment = assessCandidate(strategy === 'AUTHORIZED_REFORMULATION' ? candidate.text : text, candidate, context);
    attempts.push({ strategy, ...assessment });
    if (assessment.valid) {
      return { status: STATUS.VALID, strategy, adaptationRequired: strategy !== 'DIRECT', attempts, limits };
    }
  }
  return {
    status: STATUS.REGRESSION,
    code: STATUS.REGRESSION,
    requiresUserDecision: true,
    attempts,
    limits,
  };
}

module.exports = { STATUS, STRATEGIES, PROFILE_LIMITS, limitsFor, estimateDensity, assessCandidate, validateTargetedEditReadability };
