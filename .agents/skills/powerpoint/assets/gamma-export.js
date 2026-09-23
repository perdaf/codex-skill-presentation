'use strict';

const GAMMA_MAX_SLIDES = 20;
const GAMMA_DEFAULT_HUMAN_REPRESENTATION = 'AFRO_ANTILLEAN';

function cleanText(value) {
  return String(value ?? '').trim();
}

function asList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(cleanText).filter(Boolean);
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
    return 'Lorsque des personnes sont utiles, représenter des personnes afro-antillaises contemporaines, de différents âges selon le public, avec des carnations, morphologies, coiffures et styles vestimentaires variés. Représentation naturelle, digne et non caricaturale. Éviter l’exotisation, le casting artificiel et les clichés automatiques de plage, cocotiers ou costumes traditionnels.';
  }
  return `Lorsque des personnes sont utiles, respecter cette représentation explicite : ${normalized.toLowerCase().replace(/_/g, ' ')}. La traiter naturellement, dignement et sans stéréotype.`;
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

function normalizeSlide(slide, index) {
  const title = cleanText(slide?.title);
  if (!title) throw new TypeError(`Gamma slide ${index + 1} requires a title`);
  return Object.freeze({
    number: index + 1,
    title,
    objective: cleanText(slide.objective || slide.purpose),
    keyMessage: cleanText(slide.keyMessage),
    content: asList(slide.content),
    visual: cleanText(slide.visual || slide.visualDirection),
    layout: cleanText(slide.layout),
    participation: cleanText(slide.participation || slide.interaction),
    speakerNotes: cleanText(slide.speakerNotes),
    hasPeople: slide.hasPeople === true,
  });
}

function validateGammaBrief(input = {}) {
  const errors = [];
  const warnings = [];
  const slides = Array.isArray(input.slides) ? input.slides : [];
  if (!cleanText(input.title)) errors.push('TITLE_REQUIRED');
  if (slides.length === 0) errors.push('SLIDES_REQUIRED');
  if (slides.length > GAMMA_MAX_SLIDES) errors.push('GAMMA_SLIDE_LIMIT_EXCEEDED');
  slides.forEach((slide, index) => {
    if (!cleanText(slide?.title)) errors.push(`SLIDE_${index + 1}_TITLE_REQUIRED`);
    if (asList(slide?.content).length === 0 && !cleanText(slide?.keyMessage)) warnings.push(`SLIDE_${index + 1}_CONTENT_SPARSE`);
    if (!cleanText(slide?.visual || slide?.visualDirection)) warnings.push(`SLIDE_${index + 1}_VISUAL_DIRECTION_MISSING`);
  });
  return Object.freeze({
    valid: errors.length === 0,
    slideCount: slides.length,
    maxSlides: GAMMA_MAX_SLIDES,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}

function bullets(lines, fallback = 'À déterminer à partir du contenu maître.') {
  const values = asList(lines);
  return (values.length ? values : [fallback]).map((line) => `- ${line}`);
}

function createGammaMarkdown(input = {}) {
  const validation = validateGammaBrief(input);
  if (!validation.valid) {
    const error = new Error(`Invalid Gamma brief: ${validation.errors.join(', ')}`);
    error.code = validation.errors.includes('GAMMA_SLIDE_LIMIT_EXCEEDED') ? 'GAMMA_SLIDE_LIMIT_EXCEEDED' : 'INVALID_GAMMA_BRIEF';
    error.validation = validation;
    throw error;
  }

  const slides = input.slides.map(normalizeSlide);
  const representation = Object.prototype.hasOwnProperty.call(input, 'audienceRepresentation')
    ? input.audienceRepresentation
    : GAMMA_DEFAULT_HUMAN_REPRESENTATION;
  const lines = [
    '# Brief de génération — Gamma',
    '',
    '> Utiliser ce document comme brief et contenu source. Générer une présentation, pas une page web ni un document long.',
    '',
    '## Paramètres obligatoires',
    '',
    `- Titre : ${cleanText(input.title)}`,
    `- Langue : ${cleanText(input.language || 'français')}`,
    `- Public : ${cleanText(input.audience || 'public précisé dans le brief')}`,
    `- Objectif : ${cleanText(input.objective || 'transmettre clairement le contenu du storyboard')}`,
    `- Nombre exact de slides : ${slides.length}`,
    `- Limite absolue : ${GAMMA_MAX_SLIDES} slides`,
    '- Format : présentation 16:9',
    '- Une section « Slide » ci-dessous correspond exactement à une slide Gamma.',
    '- Respecter l’ordre, les titres, les messages clés et les informations factuelles. Ne pas ajouter de faits non fournis.',
    '- Ne jamais fusionner deux slides ni en créer de nouvelles sans demande explicite.',
    '',
    '## Direction pédagogique et éditoriale',
    '',
    ...bullets(input.pedagogy, 'Une idée principale et un point focal par slide.'),
    '- Préférer des formulations courtes, concrètes et adaptées au public.',
    '- Les consignes d’animation ou de participation servent au présentateur ; elles ne doivent pas devenir de longs paragraphes visibles.',
    '',
    '## Direction artistique globale',
    '',
    ...bullets(input.artDirection, 'Hiérarchie visuelle forte, composition claire, contraste élevé et cohérence sur tout le deck.'),
    `- ${representationInstruction(representation)}`,
    '- Ne pas ajouter une personne sur chaque slide : utiliser des personnages seulement lorsqu’ils améliorent réellement la compréhension ou l’identification.',
    '- Pour les schémas, processus, comparaisons et données, privilégier une composition exacte et lisible plutôt qu’une image décorative.',
    '- Éviter les banques d’images génériques, les visuels comportant du texte illisible et les mises en page de type dashboard.',
    '',
    '## Storyboard à produire',
    '',
  ];

  slides.forEach((slide) => {
    lines.push(
      `## Slide ${String(slide.number).padStart(2, '0')} — ${slide.title}`,
      '',
      `**Objectif pédagogique :** ${slide.objective || 'Faire comprendre le message clé.'}`,
      '',
      `**Message clé :** ${slide.keyMessage || slide.content[0] || 'À formuler fidèlement à partir du contenu.'}`,
      '',
      '**Contenu visible :**',
      '',
      ...bullets(slide.content),
      '',
      `**Direction visuelle :** ${slide.visual || 'Créer une composition visuelle directement liée au message clé.'}`,
      ...(slide.hasPeople ? ['', `**Personnes :** ${representationInstruction(representation)}`] : []),
      '',
      `**Composition :** ${slide.layout || 'Choisir une disposition simple avec un point focal évident.'}`,
      ...(slide.participation ? ['', `**Participation / animation :** ${slide.participation}`] : []),
      ...(slide.speakerNotes ? ['', `**Notes présentateur :** ${slide.speakerNotes}`] : []),
      '',
      '---',
      '',
    );
  });

  lines.push(
    '## Contrôle avant génération',
    '',
    `- Vérifier qu’il y a exactement ${slides.length} slides et jamais plus de ${GAMMA_MAX_SLIDES}.`,
    '- Vérifier qu’aucune information essentielle du storyboard n’a disparu.',
    '- Vérifier que chaque visuel sert le message de sa slide.',
    '- Vérifier la représentation humaine et l’absence de stéréotypes.',
    '- Conserver une lisibilité de projection : peu de texte, contraste fort et hiérarchie évidente.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

module.exports = {
  GAMMA_MAX_SLIDES,
  GAMMA_DEFAULT_HUMAN_REPRESENTATION,
  normalizeRepresentation,
  representationInstruction,
  resolveGammaSlideBudget,
  validateGammaBrief,
  createGammaMarkdown,
};
