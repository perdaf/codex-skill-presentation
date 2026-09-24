'use strict';

const { resolveV46RequestWithContext } = require('./presentation-format');
const { resolveTeachingOptions } = require('./teaching');
const { resolveBrand, mergeBrandWithTheme } = require('./brands');
const {
  assessVisualOpportunity,
  classifyVisual,
  resolveVisualExpression,
  assessProjectionRichness,
  assessDeckVisualDiversity,
} = require('./visual-intelligence');
const { humanRepresentationInvariant } = require('./audience-representation');
const {
  GAMMA_MAX_SLIDES,
  GAMMA_DEFAULT_HUMAN_REPRESENTATION,
  GAMMA_BLUEPRINT_INCOMPLETE,
  representationInstruction,
  validateGammaBlueprint,
  createGammaBlueprintMarkdown,
  createGammaSourcesMarkdown,
} = require('./gamma-export');

function blocked(code, details = {}) {
  return Object.freeze({ status: 'BLOCKED', code, ...details });
}

function color(value) {
  const text = String(value || '').trim();
  return /^[0-9a-f]{6}$/i.test(text) ? `#${text.toUpperCase()}` : text;
}

function asList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map((item) => String(item).trim()).filter(Boolean);
}

function buildBrandDirection(config = {}) {
  const profile = String(config.profile || 'CORPORATE').toLowerCase();
  const theme = mergeBrandWithTheme(profile, config.brand || null, { deliveryMode: config.deliveryMode || 'PRESENTATION' });
  const brand = resolveBrand(config.brand || null);
  const palette = theme.colors || {};
  const accents = [palette.secondary, palette.accent, palette.mint, palette.yellow].filter(Boolean).map(color);
  const lines = [
    `Fond principal ${color(palette.background)} et surfaces ${color(palette.surface)} ; texte principal ${color(palette.text)}.`,
    `Accents cohérents et parcimonieux : ${[...new Set(accents)].join(', ')}.`,
    `Typographie ${theme.typography?.body?.face || 'Arial'} ; titres au moins ${theme.typography?.title?.size || 30} pt et corps au moins ${theme.typography?.body?.size || 18} pt.`,
    `Composition ${theme.layout?.density || 'LOW'} density, aérée, contemporaine et cohérente entre les slides.`,
    'Éviter l’esthétique générique « AI presentation », les décorations inutiles et les visuels sans fonction pédagogique.',
  ];
  if (brand?.projection) {
    lines.push(`Principe de projection : ${brand.projection.principle}.`, `Préserver l’espace négatif : ${brand.projection.preserveNegativeSpace ? 'oui' : 'non'}.`);
  }
  if (brand?.imageArtDirection?.exclusions?.length) lines.push(`Exclusions visuelles : ${brand.imageArtDirection.exclusions.join(', ')}.`);
  return Object.freeze({ theme, brand, lines: Object.freeze(lines) });
}

function resolveGammaVisual(slide = {}, config = {}) {
  const intent = slide.visualIntent || slide.visual || {};
  const opportunityInput = {
    ...intent,
    kind: intent.kind || intent.conceptType || slide.conceptType,
    audience: config.audience,
    profile: config.profile,
    deliveryMode: config.deliveryMode,
    stepCount: intent.stepCount || slide.stepCount,
  };
  const opportunity = String(intent.opportunity || intent.visualOpportunity || assessVisualOpportunity(opportunityInput).visualOpportunity).toUpperCase();
  const suggested = assessVisualOpportunity(opportunityInput).suggestedVisualRole;
  const role = String(intent.role || intent.visualRole || suggested || (opportunity === 'LOW' ? 'DECORATIVE' : 'DIAGRAM')).toUpperCase();
  const classification = classifyVisual(role, intent);
  const expression = resolveVisualExpression({ ...intent, visualRole: classification.visualRole }).visualExpression;
  const richness = assessProjectionRichness({
    ...intent,
    visualOpportunity: opportunity,
    visualRole: classification.visualRole,
    visualExpression: expression,
    deliveryMode: config.deliveryMode,
  });
  const hasPeople = intent.hasPeople === true;
  const representationValue = hasPeople && config.humanRepresentationEnabled !== false
    ? (config.audienceRepresentation || GAMMA_DEFAULT_HUMAN_REPRESENTATION)
    : null;
  const humanRepresentation = representationValue
    ? `${humanRepresentationInvariant(representationValue) || representationValue}. ${representationInstruction(representationValue)}`
    : '';
  return Object.freeze({
    opportunity,
    role: classification.visualRole,
    method: classification.imageMethod,
    expression,
    purpose: intent.purpose || intent.pedagogicalFunction || '',
    description: intent.description || intent.direction || '',
    composition: intent.composition || intent.layout || slide.layout || '',
    avoid: intent.avoid || intent.exclusions || [],
    hasPeople,
    humanRepresentation,
    readSeeBalance: richness.readSeeBalance,
    projectionRichness: richness.projectionRichness,
    reviewRequired: richness.reviewRequired,
  });
}

function buildPedagogicalDirection(config, teaching, input = {}) {
  const lines = [
    `Utiliser le Teaching Engine résolu : audience ${config.audience}, CONTENT_DEPTH=${teaching.contentDepth}, DELIVERY_MODE=${teaching.deliveryMode}.`,
    `Respecter PAGE_BUDGET=${teaching.pageBudget.kind}, cible ${teaching.pageBudget.target}, plage ${teaching.pageBudget.min}–${teaching.pageBudget.max}.`,
    'Construire la progression complète avant de condenser ; ne jamais couper les dernières étapes parce que la limite Gamma est atteinte.',
    'Prioriser objectifs, prérequis, démonstrations, procédures essentielles, pratique, erreurs fréquentes, validation et synthèse.',
    ...asList(input.pedagogy || input.pedagogicalDirection),
  ];
  if (teaching.seniorConstraints) lines.push('SENIOR : phrases simples, texte très lisible, contraste fort, interactions évidentes et peu d’éléments simultanés.');
  return lines;
}

function createGammaPipeline(overrides = {}) {
  const dependencies = {
    resolveV46RequestWithContext,
    resolveTeachingOptions,
    buildBrandDirection,
    resolveGammaVisual,
    validateGammaBlueprint,
    createGammaBlueprintMarkdown,
    createGammaSourcesMarkdown,
    assessDeckVisualDiversity,
    ...overrides,
  };

  function prepare(input = {}) {
    const config = input.resolvedConfiguration || dependencies.resolveV46RequestWithContext(
      input.request,
      input.activeContext ?? null,
      input.resolveOptions || {},
    );
    if (!config) return blocked('MANDATORY_STEP_UNAVAILABLE', { missingSteps: ['resolveV46RequestWithContext'] });
    if (config.requiresFormatClarification) return blocked('PRESENTATION_FORMAT_CLARIFICATION_REQUIRED', { resolvedConfiguration: config, clarificationQuestion: config.clarificationQuestion });
    if (config.presentationFormat !== 'GAMMA') return blocked('GAMMA_FORMAT_REQUIRED', { presentationFormat: config.presentationFormat });

    const teaching = dependencies.resolveTeachingOptions({
      contentDepth: config.contentDepth,
      deliveryMode: config.deliveryMode,
      pageBudget: config.pageBudget,
      audience: config.audience,
    });
    const brandDirection = dependencies.buildBrandDirection(config);
    const slides = (input.slides || []).map((slide) => ({ ...slide, visual: dependencies.resolveGammaVisual(slide, config) }));
    if (slides.length > GAMMA_MAX_SLIDES) {
      return blocked(GAMMA_BLUEPRINT_INCOMPLETE, {
        reason: 'GAMMA_SLIDE_LIMIT_EXCEEDED',
        plannedSlides: slides.length,
        maxSlides: GAMMA_MAX_SLIDES,
        action: 'Recompose the complete pedagogical architecture into at most 20 slides; never truncate the array.',
        resolvedConfiguration: config,
        teaching,
      });
    }
    const accessibility = {
      senior: teaching.seniorConstraints,
      minimumBodyText: teaching.seniorConstraints ? Math.max(20, Number(brandDirection.theme.typography?.body?.size || 0)) : Number(brandDirection.theme.typography?.body?.size || 18),
      simpleInteractions: teaching.seniorConstraints,
      ...(input.accessibility || {}),
    };
    const model = {
      ...input,
      title: input.title || config.subject || 'Présentation Gamma',
      subject: input.subject || config.subject || input.title,
      audience: input.audience || config.audience,
      context: input.context || config.context || 'Aucun contexte organisationnel déclaré',
      durationMinutes: input.durationMinutes ?? config.durationMinutes,
      objectives: input.objectives || config.learningGoals,
      pedagogy: buildPedagogicalDirection(config, teaching, input),
      artDirection: [...brandDirection.lines, ...asList(input.artDirection)],
      brand: config.brand || 'NONE',
      profile: config.profile,
      contentDepth: config.contentDepth,
      pageBudget: `${teaching.pageBudget.kind} (cible ${teaching.pageBudget.target}, plage ${teaching.pageBudget.min}–${teaching.pageBudget.max})`,
      audienceRepresentation: config.audienceRepresentation,
      accessibility,
      slides,
    };
    const validation = dependencies.validateGammaBlueprint(model);
    if (!validation.valid) return blocked(GAMMA_BLUEPRINT_INCOMPLETE, { validation, resolvedConfiguration: config, teaching, model });

    const visualDiversity = dependencies.assessDeckVisualDiversity(validation.model.slides.map((slide) => ({
      visualOpportunity: slide.visual.opportunity,
      visualExpression: slide.visual.expression,
      imageMethod: slide.visual.method,
      readSeeBalance: slide.visual.readSeeBalance,
      profile: config.profile,
      simultaneousElements: slide.displayedContent.length,
      textBlockCount: slide.displayedContent.length,
      textCardDominant: slide.visual.expression === 'TEXT_LED' && slide.displayedContent.length >= 3,
    })));
    const blueprintMarkdown = dependencies.createGammaBlueprintMarkdown(model);
    const sourcesMarkdown = dependencies.createGammaSourcesMarkdown(model);
    return Object.freeze({
      status: 'READY',
      resolvedConfiguration: config,
      teaching,
      brandDirection,
      visualDiversity,
      model: validation.model,
      validation,
      blueprintMarkdown,
      sourcesMarkdown,
      deliverables: Object.freeze([
        Object.freeze({ name: 'gamma-blueprint.md', primary: true }),
        Object.freeze({ name: 'sources.md', primary: false }),
      ]),
      trace: Object.freeze({
        CONTEXT: config.context || 'NONE',
        INTENT: config.intent,
        RESEARCH: config.researchStrategy,
        TEACHING_ENGINE: teaching.contentDepth,
        CONTENT_ARCHITECTURE: `${validation.slideCount}_SLIDES`,
        BRAND: config.brand || 'NONE',
        PROFILE: config.profile,
        VISUAL_INTELLIGENCE: 'PER_SLIDE',
        AUDIENCE_REPRESENTATION: config.audienceRepresentation || 'NONE',
        PRESENTATION_FORMAT: 'GAMMA',
      }),
    });
  }

  return Object.freeze({ prepare });
}

const prepareGammaBlueprint = createGammaPipeline().prepare;

module.exports = {
  color,
  buildBrandDirection,
  resolveGammaVisual,
  buildPedagogicalDirection,
  createGammaPipeline,
  prepareGammaBlueprint,
};
