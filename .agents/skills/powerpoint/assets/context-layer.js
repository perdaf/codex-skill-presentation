'use strict';

const { resolveContext } = require('./contexts');
const { normalizeText, detectIntent, detectAudience, resolveIntent } = require('./intent-layer');

function hasExplicitEpnOptOut(request) {
  const text = normalizeText(request);
  return text.includes(' sans identite epn ') || text.includes(' sans brand epn ') || text.includes(' hors epn ');
}

function applyContext(request, contextValue, options = {}) {
  const context = resolveContext(contextValue);
  if (!context) return { context: null, structuredExplicit: { ...(options.explicit || {}) }, resolverOptions: { contextValues: { ...(options.contextOverrides || {}) } }, inherited: [], overrides: [] };
  const intent = detectIntent(normalizeText(request));
  const audience = detectAudience(normalizeText(request));
  const explicit = { ...(options.explicit || {}) };
  const overrides = [];
  if (hasExplicitEpnOptOut(request)) { explicit.brand = null; explicit.preset = 'GENERAL_PRESENTATION'; overrides.push('brand = NONE', 'preset = GENERAL_PRESENTATION'); }
  const eligible = ['COURSE', 'WORKSHOP'].includes(intent) && context.presetFamily[audience];
  const presetHint = explicit.preset || options.contextOverrides?.preset || (eligible ? context.presetFamily[audience] : null);
  const inherited = [];
  if (eligible && !hasExplicitEpnOptOut(request)) inherited.push('EPN brand eligibility', 'EPN preset family');
  return {
    context,
    structuredExplicit: explicit,
    resolverOptions: { presetHint, contextBrand: eligible && !hasExplicitEpnOptOut(request) ? context.defaultBrand : undefined, contextValues: { ...(options.contextOverrides || {}) } },
    inherited,
    overrides,
  };
}

function mergeContextWithIntent(request, contextValue = null, options = {}) {
  const applied = applyContext(request, contextValue, options);
  const resolved = resolveIntent(request, applied.structuredExplicit, applied.resolverOptions);
  const contextSource = options.source || (applied.context ? 'ACTIVE_CONTEXT' : 'NONE');
  return {
    ...resolved,
    context: applied.context?.id || null,
    contextSource,
    resolutionTrace: {
      ...resolved.resolutionTrace,
      priority: ['EXPLICIT_USER', 'EXPLICIT_CONTEXT_OVERRIDE', 'ACTIVE_CONTEXT', 'PRESET', 'INFERENCE', 'DEFAULT'],
      context: { id: applied.context?.id || null, source: contextSource, inherited: applied.inherited, overrides: applied.overrides },
    },
  };
}

const resolveRequestWithContext = mergeContextWithIntent;

function explainContextResolution(config) {
  const context = config.resolutionTrace?.context || {};
  return [
    `Context: ${config.context || 'NONE'}`,
    `Context source: ${context.source || 'NONE'}`,
    'Inherited from context:',
    ...(context.inherited?.length ? context.inherited : ['none']).map((value) => `- ${value}`),
    'Context overrides:',
    ...(context.overrides?.length ? context.overrides : ['none']).map((value) => `- ${value}`),
  ].join('\n');
}

module.exports = { hasExplicitEpnOptOut, applyContext, mergeContextWithIntent, resolveRequestWithContext, explainContextResolution };
