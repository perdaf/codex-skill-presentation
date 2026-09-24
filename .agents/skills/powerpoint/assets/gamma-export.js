'use strict';

const fs = require('node:fs');
const path = require('node:path');

const GAMMA_MAX_SLIDES = 20;
const GAMMA_DEFAULT_HUMAN_REPRESENTATION = 'AFRO_ANTILLEAN';
const GAMMA_BLUEPRINT_INCOMPLETE = 'GAMMA_BLUEPRINT_INCOMPLETE';
const PEDAGOGICAL_STAGE_ORDER = Object.freeze({
  OPENING: 0, OUTCOME: 0, PREREQUISITE: 0,
  DISCOVERY: 1, DEMONSTRATION: 1, PROCEDURE: 1, ERRORS: 1,
  PRACTICE: 2, VALIDATION: 3, SYNTHESIS: 3,
});
const PLACEHOLDER_PATTERN = /(?:\b(?:todo|tbd|lorem ipsum|placeholder)\b|[àa]\s+(?:compl[eé]ter|d[eé]terminer|r[eé]diger|inventer)|contenu\s+[àa]\s+venir)/i;
const GENERIC_VISUAL_PATTERN = /^(?:ajouter|mettre|utiliser|cr[eé]er)?\s*(?:une?\s+)?(?:belle|jolie|attrayante|moderne)?\s*(?:image|illustration|visuel)\s*(?:pertinente?|adapt[eé]e?)?[.!]?$/i;

function cleanText(value) {
  return String(value ?? '').trim();
}

function asList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(cleanText).filter(Boolean);
}

function slug(value, fallback) {
  const normalized = cleanText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function normalizeLearningItems(items, prefix) {
  const sourceItems = Array.isArray(items) ? items : asList(items);
  return sourceItems.map((source, index) => {
    if (typeof source === 'object' && source !== null) {
      const text = cleanText(source.text || source.label || source.title);
      return Object.freeze({ id: cleanText(source.id) || `${prefix}-${index + 1}-${slug(text, 'item')}`, text });
    }
    const text = cleanText(source);
    return Object.freeze({ id: `${prefix}-${index + 1}-${slug(text, 'item')}`, text });
  }).filter((item) => item.text);
}

function normalizeRepresentation(value) {
  if (value === null || value === false) return null;
  const normalized = cleanText(value).toUpperCase().replace(/[ -]+/g, '_');
  if (['NONE', 'NO_PEOPLE', 'NO_CHARACTERS', 'SANS_PERSONNE'].includes(normalized)) return null;
  return normalized || GAMMA_DEFAULT_HUMAN_REPRESENTATION;
}

function representationInstruction(value = GAMMA_DEFAULT_HUMAN_REPRESENTATION) {
  const normalized = normalizeRepresentation(value);
  if (!normalized) return 'Ne représenter aucune personne.';
  if (['AFRO_ANTILLEAN', 'MARTINIQUE', 'MARTINICAN'].includes(normalized)) {
    return 'Lorsque des personnes sont pédagogiquement utiles, représenter des personnes martiniquaises / afro-antillaises contemporaines, de différents âges selon le public, avec des carnations, morphologies, coiffures et styles vestimentaires variés. Représentation naturelle, digne et non caricaturale. Éviter l’exotisation, le casting artificiel et les clichés automatiques de plage, cocotiers ou costumes traditionnels.';
  }
  return `Lorsque des personnes sont pédagogiquement utiles, respecter cette représentation explicite : ${normalized.toLowerCase().replace(/_/g, ' ')}. La traiter naturellement, dignement et sans stéréotype.`;
}

function resolveGammaSlideBudget(input = {}) {
  const requested = Number.isInteger(input.requested) && input.requested > 0 ? input.requested : null;
  const planned = Number.isInteger(input.planned) && input.planned > 0 ? input.planned : null;
  const candidate = planned ?? requested ?? GAMMA_MAX_SLIDES;
  return Object.freeze({
    max: GAMMA_MAX_SLIDES,
    requested,
    planned,
    target: Math.min(candidate, GAMMA_MAX_SLIDES),
    tension: candidate > GAMMA_MAX_SLIDES,
    status: candidate > GAMMA_MAX_SLIDES ? 'NEEDS_PEDAGOGICAL_COMPRESSION' : 'READY',
  });
}

function normalizeVisual(visual, slide = {}) {
  const source = typeof visual === 'string' ? { description: visual } : (visual || {});
  return Object.freeze({
    opportunity: cleanText(source.opportunity || source.visualOpportunity || 'LOW').toUpperCase(),
    role: cleanText(source.role || source.visualRole || 'DECORATIVE').toUpperCase(),
    method: cleanText(source.method || source.imageMethod || 'OPTIONAL').toUpperCase(),
    expression: cleanText(source.expression || source.visualExpression || 'TEXT_LED').toUpperCase(),
    purpose: cleanText(source.purpose || source.pedagogicalFunction),
    description: cleanText(source.description || source.direction || source.visualDirection),
    composition: cleanText(source.composition || source.layout),
    avoid: asList(source.avoid || source.exclusions),
    hasPeople: source.hasPeople === true || slide.hasPeople === true,
    humanRepresentation: cleanText(source.humanRepresentation),
    readSeeBalance: cleanText(source.readSeeBalance),
    projectionRichness: cleanText(source.projectionRichness),
    reviewRequired: source.reviewRequired === true,
  });
}

function normalizeSlide(slide = {}, index = 0) {
  return Object.freeze({
    number: index + 1,
    pedagogicalStage: cleanText(slide.pedagogicalStage || slide.stage).toUpperCase(),
    pedagogicalRole: cleanText(slide.pedagogicalRole || slide.rolePedagogique || slide.objective || slide.purpose),
    displayedTitle: cleanText(slide.displayedTitle || slide.displayTitle || slide.title),
    subtitle: cleanText(slide.subtitle),
    displayedContent: asList(slide.displayedContent || slide.content),
    essentialMessage: cleanText(slide.essentialMessage || slide.keyMessage),
    visual: normalizeVisual(slide.visual || slide.visualDirection, slide),
    layout: cleanText(slide.layout),
    interaction: cleanText(slide.interaction || slide.participation),
    gammaInstructions: cleanText(slide.gammaInstructions),
    speakerNotes: cleanText(slide.speakerNotes),
    objectivesCovered: asList(slide.objectivesCovered),
    competenciesCovered: asList(slide.competenciesCovered || slide.skillsCovered),
    topicsCovered: asList(slide.topicsCovered),
  });
}

function normalizeGammaBlueprint(input = {}) {
  const objectives = normalizeLearningItems(input.objectives || input.learningObjectives, 'objective');
  const competencies = normalizeLearningItems(input.competencies || input.skills, 'competency');
  const requiredTopics = normalizeLearningItems(input.requiredTopics, 'topic');
  return Object.freeze({
    subject: cleanText(input.subject || input.title),
    title: cleanText(input.title || input.subject),
    audience: cleanText(input.audience),
    context: cleanText(input.context || 'Aucun contexte organisationnel déclaré'),
    duration: cleanText(input.duration || (input.durationMinutes ? `${input.durationMinutes} minutes` : 'Non précisée')),
    language: cleanText(input.language || 'français'),
    objectives: Object.freeze(objectives),
    competencies: Object.freeze(competencies),
    requiredTopics: Object.freeze(requiredTopics),
    pedagogy: Object.freeze(asList(input.pedagogy || input.pedagogicalDirection)),
    artDirection: Object.freeze(asList(input.artDirection)),
    generationRules: Object.freeze(asList(input.generationRules)),
    accessibility: Object.freeze({ ...(input.accessibility || {}) }),
    brand: cleanText(input.brand || 'NONE'),
    profile: cleanText(input.profile || 'CORPORATE').toUpperCase(),
    contentDepth: cleanText(input.contentDepth || 'SIMPLE').toUpperCase(),
    pageBudget: input.pageBudget ?? null,
    audienceRepresentation: normalizeRepresentation(input.audienceRepresentation),
    slides: Object.freeze((Array.isArray(input.slides) ? input.slides : []).map(normalizeSlide)),
    sources: Object.freeze(Array.isArray(input.sources) ? input.sources.map((source) => Object.freeze({
      title: cleanText(source.title), url: cleanText(source.url), note: cleanText(source.note), accessed: cleanText(source.accessed),
    })) : []),
    sourcesEmbedded: input.sourcesEmbedded === true,
  });
}

function placeholderFields(slide) {
  const fields = [slide.pedagogicalRole, slide.displayedTitle, slide.subtitle, ...slide.displayedContent,
    slide.essentialMessage, slide.visual.description, slide.visual.purpose, slide.layout, slide.interaction, slide.gammaInstructions];
  return fields.filter((value) => PLACEHOLDER_PATTERN.test(value));
}

function coverageIds(items, slides, field) {
  const aliases = new Map();
  items.forEach((item) => {
    aliases.set(item.id.toLowerCase(), item.id);
    aliases.set(item.text.toLowerCase(), item.id);
    aliases.set(slug(item.text, item.id), item.id);
  });
  const covered = new Set();
  slides.flatMap((slide) => slide[field]).forEach((value) => {
    const normalized = cleanText(value).toLowerCase();
    const id = aliases.get(normalized) || aliases.get(slug(normalized, normalized));
    if (id) covered.add(id);
  });
  return items.filter((item) => !covered.has(item.id));
}

function validateGammaBlueprint(input = {}) {
  const model = normalizeGammaBlueprint(input);
  const errors = [];
  const warnings = [];
  if (!model.title) errors.push('TITLE_REQUIRED');
  if (!model.subject) errors.push('SUBJECT_REQUIRED');
  if (!model.audience) errors.push('AUDIENCE_REQUIRED');
  if (!model.objectives.length) errors.push('LEARNING_OBJECTIVES_REQUIRED');
  if (!model.pedagogy.length) errors.push('PEDAGOGICAL_DIRECTION_REQUIRED');
  if (!model.artDirection.length) errors.push('ART_DIRECTION_REQUIRED');
  if (!model.slides.length) errors.push('SLIDES_REQUIRED');
  if (model.slides.length > GAMMA_MAX_SLIDES) errors.push('GAMMA_SLIDE_LIMIT_EXCEEDED');
  if (model.sourcesEmbedded) errors.push('SOURCES_MUST_BE_SEPARATE');

  let priorPhase = -1;
  model.slides.forEach((slide, index) => {
    const prefix = `SLIDE_${index + 1}`;
    if (!slide.pedagogicalStage || PEDAGOGICAL_STAGE_ORDER[slide.pedagogicalStage] === undefined) errors.push(`${prefix}_PEDAGOGICAL_STAGE_REQUIRED`);
    else {
      const phase = PEDAGOGICAL_STAGE_ORDER[slide.pedagogicalStage];
      if (phase < priorPhase) errors.push(`${prefix}_PEDAGOGICAL_ORDER_REGRESSION`);
      priorPhase = Math.max(priorPhase, phase);
    }
    if (slide.pedagogicalRole.length < 18) errors.push(`${prefix}_PEDAGOGICAL_ROLE_REQUIRED`);
    if (!slide.displayedTitle) errors.push(`${prefix}_TITLE_REQUIRED`);
    const contentLength = slide.displayedContent.join(' ').length;
    if (!slide.displayedContent.length || contentLength < 24) errors.push(`${prefix}_CONCRETE_CONTENT_REQUIRED`);
    if (slide.essentialMessage.length < 12) errors.push(`${prefix}_ESSENTIAL_MESSAGE_REQUIRED`);
    if (slide.layout.length < 12) errors.push(`${prefix}_LAYOUT_REQUIRED`);
    if (slide.gammaInstructions.length < 12) errors.push(`${prefix}_GAMMA_INSTRUCTIONS_REQUIRED`);
    if (placeholderFields(slide).length) errors.push(`${prefix}_PLACEHOLDER_FORBIDDEN`);
    if (['HIGH', 'MEDIUM'].includes(slide.visual.opportunity)) {
      if (slide.visual.description.length < 25) errors.push(`${prefix}_VISUAL_DESCRIPTION_REQUIRED`);
      if (slide.visual.purpose.length < 12) errors.push(`${prefix}_VISUAL_PURPOSE_REQUIRED`);
      if (slide.visual.composition.length < 12) errors.push(`${prefix}_VISUAL_COMPOSITION_REQUIRED`);
    }
    if (slide.visual.description && GENERIC_VISUAL_PATTERN.test(slide.visual.description)) errors.push(`${prefix}_GENERIC_VISUAL_FORBIDDEN`);
    if (slide.visual.hasPeople && model.audienceRepresentation && !slide.visual.humanRepresentation) errors.push(`${prefix}_HUMAN_REPRESENTATION_REQUIRED`);
  });

  const uncoveredObjectives = coverageIds(model.objectives, model.slides, 'objectivesCovered');
  const uncoveredCompetencies = coverageIds(model.competencies, model.slides, 'competenciesCovered');
  const uncoveredTopics = coverageIds(model.requiredTopics, model.slides, 'topicsCovered');
  uncoveredObjectives.forEach((item) => errors.push(`UNCOVERED_OBJECTIVE:${item.id}`));
  uncoveredCompetencies.forEach((item) => errors.push(`UNCOVERED_COMPETENCY:${item.id}`));
  uncoveredTopics.forEach((item) => errors.push(`UNCOVERED_REQUIRED_TOPIC:${item.id}`));

  const concreteCharacters = model.slides.reduce((sum, slide) => sum + slide.displayedContent.join(' ').length + slide.essentialMessage.length, 0);
  if (model.sources.length && concreteCharacters < Math.max(160, model.sources.length * 55)) errors.push('SOURCE_DOMINANT_BLUEPRINT');
  if (model.profile === 'SENIOR') {
    if (model.accessibility.senior !== true) errors.push('SENIOR_CONSTRAINTS_REQUIRED');
    if (Number(model.accessibility.minimumBodyText || 0) < 20) errors.push('SENIOR_MINIMUM_TEXT_SIZE_REQUIRED');
    if (model.accessibility.simpleInteractions !== true) errors.push('SENIOR_SIMPLE_INTERACTIONS_REQUIRED');
  }
  if (model.slides.length && !['VALIDATION', 'SYNTHESIS'].includes(model.slides.at(-1).pedagogicalStage)) warnings.push('FINAL_VALIDATION_OR_SYNTHESIS_RECOMMENDED');

  return Object.freeze({
    valid: errors.length === 0,
    status: errors.length === 0 ? 'READY' : 'BLOCKED',
    code: errors.length === 0 ? null : GAMMA_BLUEPRINT_INCOMPLETE,
    slideCount: model.slides.length,
    maxSlides: GAMMA_MAX_SLIDES,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    uncoveredObjectives: Object.freeze(uncoveredObjectives),
    uncoveredCompetencies: Object.freeze(uncoveredCompetencies),
    uncoveredTopics: Object.freeze(uncoveredTopics),
    model,
  });
}

function bulletLines(items) {
  return asList(items).map((item) => `- ${item}`);
}

function renderVisual(visual) {
  const lines = [
    `- VISUAL_OPPORTUNITY : ${visual.opportunity}`,
    `- VISUAL_ROLE : ${visual.role}`,
    `- IMAGE_METHOD : ${visual.method}`,
    `- VISUAL_EXPRESSION : ${visual.expression}`,
    `- Fonction pédagogique : ${visual.purpose || 'Aucun visuel nécessaire ; priorité au message.'}`,
    `- Description : ${visual.description || 'Aucun visuel. Utiliser une composition typographique claire.'}`,
    `- Composition : ${visual.composition || 'Composition typographique simple et aérée.'}`,
  ];
  if (visual.avoid.length) lines.push(`- Éviter : ${visual.avoid.join('; ')}`);
  if (visual.hasPeople && visual.humanRepresentation) lines.push(`- Représentation humaine : ${visual.humanRepresentation}`);
  return lines;
}

function createGammaBlueprintMarkdown(input = {}) {
  const validation = validateGammaBlueprint(input);
  if (!validation.valid) {
    const error = new Error(`Gamma presentation blueprint incomplete: ${validation.errors.join(', ')}`);
    error.code = GAMMA_BLUEPRINT_INCOMPLETE;
    error.validation = validation;
    throw error;
  }
  const model = validation.model;
  const lines = [
    '# GAMMA PRESENTATION BLUEPRINT',
    '',
    '## Présentation',
    '',
    `Sujet : ${model.subject}`,
    `Public : ${model.audience}`,
    `Contexte : ${model.context}`,
    `Durée : ${model.duration}`,
    `Nombre de slides : ${model.slides.length}`,
    `Langue : ${model.language}`,
    '',
    '## Objectifs pédagogiques',
    '',
    ...model.objectives.map((item) => `- [${item.id}] ${item.text}`),
    '',
    '## Compétences travaillées',
    '',
    ...(model.competencies.length ? model.competencies.map((item) => `- [${item.id}] ${item.text}`) : ['- Aucune compétence distincte fournie ; se référer aux objectifs pédagogiques.']),
    '',
    '## Direction pédagogique',
    '',
    ...bulletLines(model.pedagogy),
    `- Profil : ${model.profile}`,
    `- Profondeur de contenu : ${model.contentDepth}`,
    `- Budget pédagogique résolu : ${model.pageBudget ?? model.slides.length} slides ; limite Gamma : ${GAMMA_MAX_SLIDES}.`,
    '',
    '## Direction artistique',
    '',
    ...bulletLines(model.artDirection),
    `- Brand résolue : ${model.brand}`,
    '',
    '## Règles de génération',
    '',
    '## INSTRUCTIONS DE GÉNÉRATION POUR GAMMA',
    '',
    '- Utilise exactement l’architecture pédagogique ci-dessous.',
    '- Ne supprime aucune étape pédagogique essentielle.',
    '- Ne remplace pas le contenu par des formulations génériques.',
    '- Ne rajoute pas de faits ou de procédures non fournis.',
    `- Respecte un maximum absolu de ${GAMMA_MAX_SLIDES} slides et le nombre exact indiqué dans ce blueprint.`,
    '- Privilégie une idée principale par slide.',
    '- Le texte doit rester lisible lors d’une projection.',
    '- Utilise les indications visuelles et de mise en page de chaque slide.',
    '- Maintiens une identité graphique cohérente sur toute la présentation.',
    '- Ne transforme pas ce blueprint en simple outline : le contenu affiché ci-dessous est le contenu maître.',
    ...bulletLines(model.generationRules),
    '',
  ];

  model.slides.forEach((slide) => {
    lines.push(
      `## SLIDE ${String(slide.number).padStart(2, '0')} — ${slide.displayedTitle}`,
      '',
      '### Rôle pédagogique',
      slide.pedagogicalRole,
      '',
      '### Titre affiché',
      slide.displayedTitle,
      '',
      '### Sous-titre',
      slide.subtitle || 'Aucun sous-titre.',
      '',
      '### Contenu affiché',
      ...bulletLines(slide.displayedContent),
      '',
      '### Message essentiel',
      slide.essentialMessage,
      '',
      '### Visuel',
      ...renderVisual(slide.visual),
      '',
      '### Mise en page',
      slide.layout,
      '',
      '### Interaction / progression',
      slide.interaction || 'Aucune interaction ; affichage statique.',
      '',
      '### Consignes Gamma',
      slide.gammaInstructions,
      '',
    );
    if (slide.speakerNotes) lines.push('### Notes présentateur', slide.speakerNotes, '');
  });
  return `${lines.join('\n')}\n`;
}

function createGammaSourcesMarkdown(input = {}) {
  const model = normalizeGammaBlueprint(input);
  const lines = ['# Sources et traçabilité', '', `Sujet : ${model.subject}`, ''];
  if (!model.sources.length) lines.push('Aucune source externe nécessaire ou fournie.', '');
  model.sources.forEach((source, index) => lines.push(
    `## Source ${index + 1} — ${source.title || 'Sans titre'}`,
    '',
    `- URL : ${source.url || 'Non fournie'}`,
    ...(source.accessed ? [`- Consultée le : ${source.accessed}`] : []),
    ...(source.note ? [`- Usage : ${source.note}`] : []),
    '',
  ));
  return `${lines.join('\n')}\n`;
}

function writeGammaBlueprintPackage(outputDirectory, input = {}) {
  const root = path.resolve(outputDirectory);
  const blueprint = createGammaBlueprintMarkdown(input);
  const sources = createGammaSourcesMarkdown(input);
  fs.mkdirSync(root, { recursive: true });
  const blueprintPath = path.join(root, 'gamma-blueprint.md');
  const sourcesPath = path.join(root, 'sources.md');
  fs.writeFileSync(blueprintPath, blueprint, 'utf8');
  fs.writeFileSync(sourcesPath, sources, 'utf8');
  return Object.freeze({ root, blueprintPath, sourcesPath, slideCount: normalizeGammaBlueprint(input).slides.length });
}

// Compatibility aliases for the initial Gamma export API. They now enforce the full blueprint contract.
const validateGammaBrief = validateGammaBlueprint;
const createGammaMarkdown = createGammaBlueprintMarkdown;

module.exports = {
  GAMMA_MAX_SLIDES,
  GAMMA_DEFAULT_HUMAN_REPRESENTATION,
  GAMMA_BLUEPRINT_INCOMPLETE,
  PEDAGOGICAL_STAGE_ORDER,
  normalizeRepresentation,
  representationInstruction,
  resolveGammaSlideBudget,
  normalizeGammaBlueprint,
  validateGammaBlueprint,
  createGammaBlueprintMarkdown,
  createGammaSourcesMarkdown,
  writeGammaBlueprintPackage,
  validateGammaBrief,
  createGammaMarkdown,
};
