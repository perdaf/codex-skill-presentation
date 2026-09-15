'use strict';

const { assessIconRecognizability } = require('./icon-reliability');
const { humanRepresentationPrompt } = require('./audience-representation');

const VISUAL_ROLES = Object.freeze(['EDITORIAL_SCENE', 'DIAGRAM', 'PROCESS', 'TIMELINE', 'DATA_VISUALIZATION', 'FUNCTIONAL_ICON', 'REAL_INTERFACE', 'DECORATIVE']);
const METHODS = Object.freeze({ IMAGEGEN: 'IMAGEGEN', POWERPOINT: 'POWERPOINT', POWERPOINT_CHART: 'POWERPOINT_CHART', VECTOR: 'VECTOR', SCREENSHOT: 'SCREENSHOT', OPTIONAL: 'OPTIONAL' });
const METHOD_BY_ROLE = Object.freeze({
  EDITORIAL_SCENE: METHODS.IMAGEGEN, DIAGRAM: METHODS.POWERPOINT, PROCESS: METHODS.POWERPOINT,
  TIMELINE: METHODS.POWERPOINT, DATA_VISUALIZATION: METHODS.POWERPOINT_CHART,
  FUNCTIONAL_ICON: METHODS.VECTOR, REAL_INTERFACE: METHODS.SCREENSHOT, DECORATIVE: METHODS.OPTIONAL,
});
const VISUAL_OPPORTUNITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH']);
const VISUAL_EXPRESSIONS = Object.freeze(['TEXT_LED', 'OBJECT_FLOW', 'DEVICE_MODEL', 'SPATIAL_DIAGRAM', 'BEFORE_AFTER', 'COMPARISON', 'HUMAN_CONTEXT_SCENE', 'SCENARIO', 'ICON_SYSTEM', 'DATA_CHART', 'STEP_FLOW', 'CONCEPT_MAP', 'PHOTO_FOCUSED']);
const READ_SEE_BALANCES = Object.freeze(['READ_ONLY', 'READ_MOSTLY', 'BALANCED', 'SEE_FIRST']);
const ROLE_BY_CONCEPT = Object.freeze({
  DIRECTION: 'PROCESS', PROCESS: 'PROCESS', SEQUENCE: 'PROCESS', TRANSFORMATION: 'PROCESS', PROGRESSION: 'PROCESS', CAUSE_EFFECT: 'DIAGRAM',
  BEFORE_AFTER: 'DIAGRAM', RELATION: 'DIAGRAM', HIERARCHY: 'DIAGRAM', COMPARISON: 'DIAGRAM', GROUPING: 'DIAGRAM', LOCALIZATION: 'DIAGRAM',
  QUANTITY: 'DATA_VISUALIZATION', DATA: 'DATA_VISUALIZATION', HUMAN_CONTEXT: 'EDITORIAL_SCENE',
});

function assessVisualOpportunity(input = {}) {
  const kind = String(input.kind || input.conceptType || '').trim().toUpperCase();
  const audience = String(input.audience || input.profile || '').trim().toUpperCase();
  const delivery = String(input.deliveryMode || 'PRESENTATION').trim().toUpperCase();
  const stepCount = Number(input.stepCount || 0);
  const highKinds = ['DIRECTION', 'PROCESS', 'SEQUENCE', 'BEFORE_AFTER', 'RELATION', 'HIERARCHY', 'TRANSFORMATION', 'PROGRESSION', 'CAUSE_EFFECT', 'QUANTITY', 'DATA', 'HUMAN_CONTEXT'];
  const mediumKinds = ['COMPARISON', 'GROUPING', 'LOCALIZATION', 'CHOICE', 'STATE', 'PREPARATION'];
  const lowKinds = ['SHORT_DEFINITION', 'QUOTE', 'PLAIN_STATEMENT', 'ARBITRARY_LIST'];
  let opportunity = highKinds.includes(kind) ? 'HIGH' : mediumKinds.includes(kind) ? 'MEDIUM' : lowKinds.includes(kind) ? 'LOW' : 'MEDIUM';
  let recommendation = 'ASSESS_COMPOSITION';
  if (kind === 'COMPARISON' && input.hasClearRelationship !== false) opportunity = 'HIGH';
  if (kind === 'ARBITRARY_LIST' && input.hasRelationship === true) opportunity = 'MEDIUM';
  if (audience === 'SENIOR' && stepCount > 6) { opportunity = 'HIGH'; recommendation = 'SIMPLIFY_OR_SEGMENT'; }
  if (delivery === 'HANDOUT' && opportunity === 'MEDIUM') recommendation = 'USE_ONLY_IF_PRINT_EFFICIENT';
  return { visualOpportunity: opportunity, suggestedVisualRole: ROLE_BY_CONCEPT[kind] || null, recommendation, needsVisualReview: opportunity === 'HIGH' };
}

function normalizeRole(role) { const value = String(role || '').trim().toUpperCase(); if (!VISUAL_ROLES.includes(value)) throw new RangeError(`Unknown VISUAL_ROLE: ${role}`); return value; }
function classifyVisual(role, options = {}) {
  const visualRole = normalizeRole(role); let imageMethod = METHOD_BY_ROLE[visualRole];
  if (visualRole === 'DECORATIVE' && options.improvesUnderstanding !== true && options.improvesHierarchy !== true && options.improvesIdentity !== true) imageMethod = METHODS.OPTIONAL;
  return { visualRole, imageMethod, editable: [METHODS.POWERPOINT, METHODS.POWERPOINT_CHART, METHODS.VECTOR].includes(imageMethod),
    exactInterfaceRequired: visualRole === 'REAL_INTERFACE', allowImageGen: visualRole !== 'REAL_INTERFACE' && imageMethod === METHODS.IMAGEGEN };
}

function classifyFunctionalIcon(options = {}) {
  const classification = classifyVisual('FUNCTIONAL_ICON', options);
  return { ...classification, ...assessIconRecognizability(options) };
}

function normalizeExpression(expression) { const value = String(expression || '').trim().toUpperCase(); if (!VISUAL_EXPRESSIONS.includes(value)) throw new RangeError(`Unknown VISUAL_EXPRESSION: ${expression}`); return value; }

function resolveVisualExpression(input = {}) {
  const role = normalizeRole(input.visualRole || input.role || 'DIAGRAM');
  const kind = String(input.kind || input.conceptType || '').trim().toUpperCase();
  const explicit = input.visualExpression ? normalizeExpression(input.visualExpression) : null;
  let visualExpression = explicit;
  if (!visualExpression) {
    if (role === 'EDITORIAL_SCENE') visualExpression = 'HUMAN_CONTEXT_SCENE';
    else if (role === 'DATA_VISUALIZATION') visualExpression = 'DATA_CHART';
    else if (role === 'FUNCTIONAL_ICON') visualExpression = 'ICON_SYSTEM';
    else if (kind === 'DEVICE' || kind === 'INTERFACE_ZONES' || kind === 'CONVERSATION_ZONES') visualExpression = 'DEVICE_MODEL';
    else if (kind === 'BEFORE_AFTER') visualExpression = 'BEFORE_AFTER';
    else if (kind === 'COMPARISON' || kind === 'CHOICE') visualExpression = input.hasObjectMovement ? 'OBJECT_FLOW' : 'COMPARISON';
    else if (kind === 'SCENARIO' || kind === 'DECISION') visualExpression = 'SCENARIO';
    else if (role === 'PROCESS' || role === 'TIMELINE') visualExpression = input.objectBased ? 'OBJECT_FLOW' : 'STEP_FLOW';
    else if (role === 'DIAGRAM') visualExpression = input.spatial !== false ? 'SPATIAL_DIAGRAM' : 'CONCEPT_MAP';
    else visualExpression = 'TEXT_LED';
  }
  return { visualExpression };
}

function assessReadSeeBalance(input = {}) {
  const expression = normalizeExpression(input.visualExpression || 'TEXT_LED');
  const objectCount = Number(input.objectCount || 0); const textBlockCount = Number(input.textBlockCount || 0);
  const hasSpatialMeaning = input.hasSpatialMeaning === true; const hasObjectRepresentation = input.hasObjectRepresentation === true;
  if (expression === 'TEXT_LED') return textBlockCount > 2 ? 'READ_ONLY' : 'READ_MOSTLY';
  if (['HUMAN_CONTEXT_SCENE', 'DATA_CHART', 'PHOTO_FOCUSED'].includes(expression)) return 'SEE_FIRST';
  if (['DEVICE_MODEL', 'OBJECT_FLOW', 'BEFORE_AFTER', 'COMPARISON', 'SPATIAL_DIAGRAM', 'SCENARIO'].includes(expression) && (hasSpatialMeaning || hasObjectRepresentation || objectCount > 0)) return textBlockCount > 5 ? 'BALANCED' : 'SEE_FIRST';
  if (['STEP_FLOW', 'ICON_SYSTEM', 'CONCEPT_MAP'].includes(expression)) return textBlockCount > Math.max(4, objectCount) ? 'READ_MOSTLY' : 'BALANCED';
  return 'BALANCED';
}

function assessProjectionRichness(input = {}) {
  const opportunity = String(input.visualOpportunity || assessVisualOpportunity(input).visualOpportunity).toUpperCase();
  const expression = resolveVisualExpression(input).visualExpression;
  const readSeeBalance = input.readSeeBalance || assessReadSeeBalance({ ...input, visualExpression: expression });
  const delivery = String(input.deliveryMode || 'PRESENTATION').toUpperCase();
  const isProjection = delivery === 'PRESENTATION' || delivery === 'DUAL';
  const reviewRequired = isProjection && opportunity === 'HIGH' && ['READ_ONLY', 'READ_MOSTLY'].includes(readSeeBalance);
  return { visualExpression: expression, readSeeBalance, projectionRichness: reviewRequired ? 'INSUFFICIENT' : opportunity === 'HIGH' ? 'STRONG' : 'APPROPRIATE', reviewRequired };
}

function assessDeckVisualDiversity(slides = [], options = {}) {
  const expressions = slides.map((slide) => String(slide.visualExpression || 'TEXT_LED').toUpperCase());
  const warnings = [];
  const textCards = slides.filter((slide) => slide.textCardDominant === true || (slide.visualExpression === 'TEXT_LED' && Number(slide.textBlockCount || 0) >= 3)).length;
  let consecutiveTextCards = 0; let maxConsecutiveTextCards = 0;
  slides.forEach((slide) => { const isTextCard = slide.textCardDominant === true; consecutiveTextCards = isTextCard ? consecutiveTextCards + 1 : 0; maxConsecutiveTextCards = Math.max(maxConsecutiveTextCards, consecutiveTextCards); });
  const counts = expressions.reduce((acc, value) => ((acc[value] = (acc[value] || 0) + 1), acc), {});
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0] || ['NONE',0];
  const imageGenCount = slides.filter((slide) => slide.imageMethod === 'IMAGEGEN').length;
  if (textCards / Math.max(slides.length, 1) >= 0.7 || maxConsecutiveTextCards >= 3) warnings.push('REPETITIVE_TEXT_CARDS');
  if (dominant[1] / Math.max(slides.length, 1) >= 0.7 && slides.length >= 5) warnings.push('LOW_VISUAL_VARIETY');
  if (imageGenCount / Math.max(slides.length, 1) > (options.maxImageGenRatio || 0.35)) warnings.push('IMAGEGEN_OVERUSE');
  if (slides.some((slide) => slide.visualOpportunity === 'HIGH' && ['READ_ONLY','READ_MOSTLY'].includes(slide.readSeeBalance))) warnings.push('HIGH_VISUAL_OPPORTUNITY_READ_MOSTLY');
  if (slides.some((slide) => slide.profile === 'SENIOR' && Number(slide.simultaneousElements || 0) > 7)) warnings.push('SENIOR_VISUAL_OVERLOAD');
  return { warnings: [...new Set(warnings)], expressionCounts: counts, uniqueExpressions: new Set(expressions).size, imageGenCount, textCardRatio: textCards / Math.max(slides.length, 1), passed: warnings.length === 0 };
}

function resolveComposition(input = {}) {
  const textPosition = String(input.textPosition || 'LEFT').toUpperCase();
  const subjectPosition = String(input.subjectPosition || (textPosition === 'LEFT' ? 'RIGHT' : 'LEFT')).toUpperCase();
  const negativeSpace = String(input.negativeSpace || textPosition).toUpperCase();
  return { narrativeRole: input.narrativeRole || '', layout: input.layout || 'UNSPECIFIED', textPosition, subjectPosition, negativeSpace,
    framing: input.framing || 'LANDSCAPE', orientation: input.orientation || 'LANDSCAPE', cropStrategy: input.cropStrategy || 'PRESERVE_FOCAL_SUBJECT',
    preserve: Object.freeze([...(input.preserve || [])]), relationship: input.relationship || 'INTEGRATED_WITH_SLIDE_OBJECTS' };
}

function buildCompositionAwarePrompt(subject, compositionInput = {}, artDirection = {}) {
  const c = resolveComposition(compositionInput);
  return [`Visual role: EDITORIAL_SCENE.`, `Subject: ${subject}.`, `Layout: ${c.layout}; editable PowerPoint text is on the ${c.textPosition.toLowerCase()}.`,
    `Place the principal subject in the ${c.subjectPosition.toLowerCase()} region and preserve calm negative space on the ${c.negativeSpace.toLowerCase()}.`,
    `Framing: ${c.framing}; crop strategy: ${c.cropStrategy}; preserve fully: ${c.preserve.length ? c.preserve.join(', ') : 'face, hands, and functional objects'}.`,
    artDirection.style ? `Style invariants: ${artDirection.style}.` : '', artDirection.palette ? `Palette: ${artDirection.palette}.` : '',
    humanRepresentationPrompt({ visualRole: 'EDITORIAL_SCENE', hasPeople: artDirection.hasPeople === true, audienceRepresentation: artDirection.audienceRepresentation }),
    `No text, logo, watermark, invented software interface, or important content near crop edges.`].filter(Boolean).join(' ');
}

module.exports = { VISUAL_ROLES, METHODS, METHOD_BY_ROLE, VISUAL_OPPORTUNITIES, VISUAL_EXPRESSIONS, READ_SEE_BALANCES, ROLE_BY_CONCEPT, assessVisualOpportunity, classifyVisual, classifyFunctionalIcon, resolveVisualExpression, assessReadSeeBalance, assessProjectionRichness, assessDeckVisualDiversity, resolveComposition, buildCompositionAwarePrompt };
