'use strict';

const { assessVisualOpportunity, classifyVisual, resolveVisualExpression, assessProjectionRichness, resolveComposition } = require('./visual-intelligence');
const { resolveBrand } = require('./brands');
const { normalizeValue, humanRepresentationInvariant } = require('./audience-representation');

function createVisualBible(input = {}) {
  const brand = resolveBrand(input.brand); const classification = classifyVisual(input.visualRole || 'DECORATIVE', input);
  const opportunity = assessVisualOpportunity(input.visualOpportunityInput || input);
  const audienceRepresentation = classification.visualRole === 'EDITORIAL_SCENE' && input.hasPeople === true
    ? normalizeValue(input.audienceRepresentation)
    : null;
  const humanRepresentation = humanRepresentationInvariant(audienceRepresentation);
  return {
    BRAND: brand ? brand.id : null, PROFILE: String(input.profile || 'corporate').toUpperCase(),
    CONTENT_DEPTH: String(input.contentDepth || 'SIMPLE').toUpperCase(), DELIVERY_MODE: String(input.deliveryMode || 'PRESENTATION').toUpperCase(),
    VISUAL_OPPORTUNITY: opportunity.visualOpportunity, VISUAL_ROLE: classification.visualRole, IMAGE_METHOD: classification.imageMethod,
    COMPOSITION: resolveComposition(input.composition || {}), SUBJECT_POSITION: String(input.composition?.subjectPosition || (input.composition?.textPosition === 'RIGHT' ? 'LEFT' : 'RIGHT')).toUpperCase(),
    NEGATIVE_SPACE: String(input.composition?.negativeSpace || input.composition?.textPosition || 'LEFT').toUpperCase(),
    CROP_STRATEGY: input.composition?.cropStrategy || 'PRESERVE_FOCAL_SUBJECT',
    ...(audienceRepresentation ? { AUDIENCE_REPRESENTATION: audienceRepresentation } : {}),
    ...(humanRepresentation ? { HUMAN_REPRESENTATION: humanRepresentation } : {}),
    STYLE_INVARIANTS: Object.freeze([...(input.styleInvariants || [])]), SCENE_VARIABLES: Object.freeze([...(input.sceneVariables || [])]),
  };
}

function createVisualManifest(initialEntries = []) {
  const entries = [];
  const add = (input = {}) => {
    const opportunity = assessVisualOpportunity(input.visualOpportunityInput || input);
    const visualRole = input.visualRole || opportunity.suggestedVisualRole;
    if (!input.id || !input.location || !input.purpose || !visualRole) throw new TypeError('Visual manifest entries require id, location, purpose, and a visualRole or classifiable concept kind');
    const classification = classifyVisual(visualRole, input);
    const richness = assessProjectionRichness({ ...input, visualRole: classification.visualRole, visualOpportunity: input.visualOpportunity || opportunity.visualOpportunity });
    const entry = Object.freeze({
      id: String(input.id), location: String(input.location), purpose: String(input.purpose),
      visualOpportunity: String(input.visualOpportunity || opportunity.visualOpportunity).toUpperCase(),
      visualRole: classification.visualRole, imageMethod: input.imageMethod || classification.imageMethod,
      visualExpression: input.visualExpression || richness.visualExpression,
      readSeeBalance: input.readSeeBalance || richness.readSeeBalance,
      projectionRichness: input.projectionRichness || richness.projectionRichness,
      reviewRequired: input.reviewRequired ?? richness.reviewRequired,
      connectorValidation: input.connectorValidation || null,
      iconType: input.iconType || null,
      iconRecognizability: input.iconRecognizability || null,
      reason: String(input.reason || ''), composition: input.composition ? resolveComposition(input.composition) : null,
      status: String(input.status || 'PLANNED').toUpperCase(),
    });
    entries.push(entry); return entry;
  };
  initialEntries.forEach(add);
  const toJSON = () => entries.map((entry) => ({ ...entry }));
  const toMarkdown = () => ['## Visual Intelligence manifest', '', ...entries.flatMap((entry) => [
    `### ${entry.id} — ${entry.location}`,
    '',
    `- Purpose: ${entry.purpose}`,
    `- VISUAL_OPPORTUNITY: ${entry.visualOpportunity}`,
    `- VISUAL_ROLE: ${entry.visualRole}`,
    `- IMAGE_METHOD: ${entry.imageMethod}`,
    `- VISUAL_EXPRESSION: ${entry.visualExpression}`,
    `- READ_SEE_BALANCE: ${entry.readSeeBalance}`,
    `- PROJECTION_RICHNESS: ${entry.projectionRichness}`,
    `- REVIEW_REQUIRED: ${entry.reviewRequired}`,
    ...(entry.connectorValidation ? [`- CONNECTORS: ${typeof entry.connectorValidation === 'string' ? entry.connectorValidation : JSON.stringify(entry.connectorValidation)}`] : []),
    ...(entry.iconType ? [`- ICON_TYPE: ${entry.iconType}`] : []),
    ...(entry.iconRecognizability ? [`- ICON_RECOGNIZABILITY: ${entry.iconRecognizability}`] : []),
    `- Reason: ${entry.reason || 'Not specified'}`,
    `- Status: ${entry.status}`,
    ...(entry.composition ? [`- Composition: ${entry.composition.layout}; subject ${entry.composition.subjectPosition}; negative space ${entry.composition.negativeSpace}`] : []),
    '',
  ])].join('\n');
  return { add, entries, toJSON, toMarkdown };
}

function visualBibleToMarkdown(bible, manifest = null) {
  const fields = ['BRAND', 'PROFILE', 'CONTENT_DEPTH', 'DELIVERY_MODE', 'VISUAL_OPPORTUNITY', 'VISUAL_ROLE', 'IMAGE_METHOD',
    ...(bible.AUDIENCE_REPRESENTATION ? ['AUDIENCE_REPRESENTATION'] : []), ...(bible.HUMAN_REPRESENTATION ? ['HUMAN_REPRESENTATION'] : [])];
  const body = ['# Visual Bible', '', ...fields.map((field) => `- ${field}: ${bible[field] ?? ''}`)];
  if (manifest) body.push('', manifest.toMarkdown());
  return body.join('\n');
}

module.exports = { createVisualBible, createVisualManifest, visualBibleToMarkdown };
