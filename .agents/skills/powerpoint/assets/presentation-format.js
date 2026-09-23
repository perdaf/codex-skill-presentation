'use strict';

const { resolveIntent } = require('./intent-layer');
const { resolveRequestWithContext } = require('./context-layer');

const PRESENTATION_FORMATS = Object.freeze(['AUTO', 'HTML', 'PPTX', 'GAMMA']);
const PRESENTATION_FORMAT_QUESTION = 'La présentation sera-t-elle projetée directement depuis l’ordinateur ?';

function normalizeText(value = '') {
  return ` ${String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[’']/g, ' ').replace(/[^a-z0-9+/.:-]+/g, ' ').trim().replace(/\s+/g, ' ')} `;
}

function normalizePresentationFormat(value = 'AUTO') {
  const normalized = String(value || 'AUTO').trim().toUpperCase();
  if (!PRESENTATION_FORMATS.includes(normalized)) {
    throw new RangeError(`PRESENTATION_FORMAT must be one of: ${PRESENTATION_FORMATS.join(', ')}`);
  }
  return normalized;
}

function deliveryIncludesPresentation(deliveryMode) {
  return ['PRESENTATION', 'DUAL'].includes(String(deliveryMode || '').trim().toUpperCase());
}

function detectTextFormatSignals(request = '') {
  const text = normalizeText(request);
  const htmlPatterns = [
    /\bpresentation\s+(?:web|html|interactive)\b/,
    /\bdiaporama\s+(?:web|html|interactif)\b/,
    /\bprojection\s+directe?\s+depuis\s+(?:l\s+)?ordinateur\b/,
    /\bprojete(?:e)?\s+directement\s+depuis\s+(?:l\s+)?ordinateur\b/,
    /\bprojeter\s+directement\s+depuis\s+(?:l\s+)?ordinateur\b/,
    /\bdans\s+(?:un\s+)?navigateur\b/,
    /\bformat\s+html\b/,
  ];
  const pptxPatterns = [
    /\bpowerpoint\b/,
    /\bpptx\b/,
    /\bfichier\s+(?:a\s+)?(?:etre\s+)?modifie\s+dans\s+powerpoint\b/,
    /\bmodifiable\s+dans\s+powerpoint\b/,
    /\bformat\s+pptx\b/,
  ];
  const gammaPatterns = [
    /\bgamma\b/,
    /\bfichier\s+(?:markdown|md)\s+(?:pour|destine\s+a)\s+gamma\b/,
    /\bbrief\s+(?:markdown|md)\s+(?:pour|destine\s+a)\s+gamma\b/,
  ];
  return {
    html: htmlPatterns.some((pattern) => pattern.test(text)),
    pptx: pptxPatterns.some((pattern) => pattern.test(text)),
    gamma: gammaPatterns.some((pattern) => pattern.test(text)),
  };
}

function detectPresentationFormat(request = '', structuredExplicit = {}) {
  if (structuredExplicit.presentationFormat !== undefined) {
    const value = normalizePresentationFormat(structuredExplicit.presentationFormat);
    if (value !== 'AUTO') return { value, source: 'EXPLICIT_STRUCTURED', reason: 'structured explicit presentationFormat' };
  }

  const signals = detectTextFormatSignals(request);
  const selectedSignals = Object.entries(signals).filter(([, active]) => active).map(([name]) => name.toUpperCase());
  if (selectedSignals.length > 1) {
    return { value: 'AUTO', source: 'EXPLICIT_CONFLICT', reason: `request contains conflicting format signals: ${selectedSignals.join(', ')}`, conflict: true };
  }
  if (signals.gamma) return { value: 'GAMMA', source: 'EXPLICIT_USER', reason: 'Gamma generation brief or Markdown for Gamma requested' };
  if (signals.html) return { value: 'HTML', source: 'EXPLICIT_USER', reason: 'direct-computer, interactive, web, browser, or HTML presentation requested' };
  if (signals.pptx) return { value: 'PPTX', source: 'EXPLICIT_USER', reason: 'PowerPoint/PPTX or PowerPoint editing requested' };
  if (structuredExplicit.projectionDirect === true) return { value: 'HTML', source: 'EXPLICIT_ANSWER', reason: 'direct projection from the computer confirmed' };
  if (structuredExplicit.projectionDirect === false) return { value: 'PPTX', source: 'EXPLICIT_ANSWER', reason: 'direct projection from the computer declined' };
  return { value: 'AUTO', source: 'DEFAULT', reason: 'presentation usage is not explicit enough to choose HTML, PPTX, or Gamma' };
}

function buildDeliverables(deliveryMode, presentationFormat) {
  const delivery = String(deliveryMode || 'PRESENTATION').toUpperCase();
  const format = normalizePresentationFormat(presentationFormat);
  const outputs = [];
  if (deliveryIncludesPresentation(delivery)) {
    outputs.push(Object.freeze(format === 'GAMMA'
      ? { kind: 'PRESENTATION', format: 'GAMMA', artifact: 'MARKDOWN', maxSlides: 20 }
      : { kind: 'PRESENTATION', format }));
  }
  if (delivery === 'HANDOUT' || delivery === 'DUAL') outputs.push(Object.freeze({ kind: 'HANDOUT', format: 'PDF', page: 'A4' }));
  return Object.freeze(outputs);
}

function resolvePresentationFormat(input = {}) {
  const deliveryMode = String(input.deliveryMode || 'PRESENTATION').trim().toUpperCase();
  if (!deliveryIncludesPresentation(deliveryMode)) {
    return Object.freeze({
      presentationFormat: 'AUTO', status: 'NOT_APPLICABLE', source: 'DELIVERY_MODE',
      reason: 'HANDOUT has no presentation branch', requiresClarification: false,
      clarificationQuestion: null, deliverables: buildDeliverables(deliveryMode, 'AUTO'),
    });
  }
  const detected = detectPresentationFormat(input.request, input.structuredExplicit || {});
  const requiresClarification = detected.value === 'AUTO';
  return Object.freeze({
    presentationFormat: detected.value,
    status: requiresClarification ? 'NEEDS_CLARIFICATION' : 'RESOLVED',
    source: detected.source,
    reason: detected.reason,
    conflict: detected.conflict === true,
    requiresClarification,
    clarificationQuestion: requiresClarification ? PRESENTATION_FORMAT_QUESTION : null,
    deliverables: buildDeliverables(deliveryMode, detected.value),
  });
}

function augmentResolvedConfiguration(baseConfiguration, request, structuredExplicit = {}) {
  const format = resolvePresentationFormat({
    request,
    deliveryMode: baseConfiguration.deliveryMode,
    structuredExplicit,
  });
  return {
    ...baseConfiguration,
    presentationFormat: format.presentationFormat,
    presentationFormatStatus: format.status,
    requiresFormatClarification: format.requiresClarification,
    clarificationQuestion: format.clarificationQuestion,
    deliverables: format.deliverables,
    resolutionTrace: {
      ...baseConfiguration.resolutionTrace,
      sources: { ...baseConfiguration.resolutionTrace?.sources, presentationFormat: format.source },
      presentationFormat: {
        value: format.presentationFormat,
        status: format.status,
        source: format.source,
        reason: format.reason,
        conflict: format.conflict,
      },
    },
  };
}

function resolveV46Intent(request, structuredExplicit = {}, resolverOptions = {}) {
  return augmentResolvedConfiguration(resolveIntent(request, structuredExplicit, resolverOptions), request, structuredExplicit);
}

function resolveV46RequestWithContext(request, contextValue = null, options = {}) {
  return augmentResolvedConfiguration(
    resolveRequestWithContext(request, contextValue, options),
    request,
    options.explicit || {},
  );
}

module.exports = {
  PRESENTATION_FORMATS,
  PRESENTATION_FORMAT_QUESTION,
  normalizePresentationFormat,
  deliveryIncludesPresentation,
  detectTextFormatSignals,
  detectPresentationFormat,
  buildDeliverables,
  resolvePresentationFormat,
  augmentResolvedConfiguration,
  resolveV46Intent,
  resolveV46RequestWithContext,
};
