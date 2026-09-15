'use strict';

const MARTINIQUE = 'MARTINIQUE';

function normalizeValue(value) {
  if (value === null || value === false) return null;
  const normalized = String(value || '').trim().toUpperCase().replace(/[ -]+/g, '_');
  return ['NONE', 'NO_CHARACTERS', 'NO_PEOPLE'].includes(normalized) ? null : normalized || null;
}

function detectExplicitRepresentation(request = '') {
  const text = ` ${String(request).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')} `;
  if (/\b(aucun|sans)\s+(personnage|personnages|personne|personnes)\b/.test(text)) {
    return { value: null, peopleAllowed: false, source: 'EXPLICIT_USER' };
  }
  if (/\bpublic\s+japonais(e)?\b/.test(text)) return { value: 'JAPANESE', peopleAllowed: true, source: 'EXPLICIT_USER' };
  if (/\bpublic\s+(tres\s+)?mixte\b/.test(text)) return { value: 'HIGHLY_MIXED', peopleAllowed: true, source: 'EXPLICIT_USER' };
  return null;
}

function resolveAudienceRepresentation(options = {}) {
  const detected = detectExplicitRepresentation(options.request);
  if (detected) return detected;
  if (Object.prototype.hasOwnProperty.call(options, 'explicit')) {
    const value = normalizeValue(options.explicit);
    return { value, peopleAllowed: value !== null, source: 'EXPLICIT_USER' };
  }
  if (Object.prototype.hasOwnProperty.call(options, 'contextOverride')) {
    const value = normalizeValue(options.contextOverride);
    return { value, peopleAllowed: value !== null, source: 'EXPLICIT_CONTEXT_OVERRIDE' };
  }
  if (options.contextDefault !== undefined && options.contextDefault !== null) {
    return { value: normalizeValue(options.contextDefault), peopleAllowed: true, source: 'ACTIVE_CONTEXT' };
  }
  if (options.inferred !== undefined && options.inferred !== null) {
    return { value: normalizeValue(options.inferred), peopleAllowed: true, source: 'INFERENCE' };
  }
  return { value: null, peopleAllowed: true, source: 'NONE' };
}

function humanRepresentationInvariant(value) {
  const normalized = normalizeValue(value);
  if (!normalized) return null;
  if (normalized === MARTINIQUE) return 'contemporary Martinican / Afro-Caribbean representation, natural and non-stereotypical';
  return `${normalized.toLowerCase().replace(/_/g, ' ')} representation, natural and respectful`;
}

function humanRepresentationPrompt(input = {}) {
  if (String(input.visualRole || '').toUpperCase() !== 'EDITORIAL_SCENE' || input.hasPeople !== true) return '';
  const value = normalizeValue(input.audienceRepresentation);
  if (!value) return '';
  if (value !== MARTINIQUE) return `Human representation: ${value.toLowerCase().replace(/_/g, ' ')}; follow the explicitly requested audience naturally and respectfully.`;
  return 'Human representation: contemporary Martinican / Afro-Caribbean adults or seniors when relevant; natural varied skin tones, credible varied hair and hairstyles, contemporary everyday clothing, natural attitudes, and dignified non-caricatural portrayal. Use a credible setting for the subject. Avoid artificial casting, exoticization, tourist imagery, and automatic beaches, palm trees, tropical clichés, or traditional clothing.';
}

module.exports = { MARTINIQUE, normalizeValue, detectExplicitRepresentation, resolveAudienceRepresentation, humanRepresentationInvariant, humanRepresentationPrompt };
