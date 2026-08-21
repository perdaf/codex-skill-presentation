'use strict';

const { selectProfile } = require('./themes');
const { resolvePageBudget } = require('./teaching');
const { PRESETS, getPreset } = require('./presets');

const RESEARCH_LEVELS = Object.freeze(['ONLY_WHEN_NEEDED', 'VERIFY_IMPORTANT_AND_VOLATILE', 'THOROUGH_WHEN_NEEDED']);

function normalizeText(value = '') {
  return ` ${String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[’']/g, ' ').replace(/[^a-z0-9+/:]+/g, ' ').trim().replace(/\s+/g, ' ')} `;
}
function hasSignal(text, signal) { return text.includes(` ${signal} `); }
function hasAny(text, signals) { return signals.some((signal) => hasSignal(text, signal)); }

function parseDuration(request) {
  const text = normalizeText(request);
  let match = text.match(/\b(\d+)\s*h(?:eures?)?\s*(\d{1,2})?\b/);
  if (match) return Number(match[1]) * 60 + Number(match[2] || 0);
  match = text.match(/\b(\d+)\s*(?:minutes?|mins?|min)\b/);
  return match ? Number(match[1]) : null;
}

function detectIntent(text) {
  if (hasAny(text, ['atelier', 'workshop'])) return 'WORKSHOP';
  if (hasAny(text, ['cours', 'formation'])) return 'COURSE';
  return 'PRESENTATION';
}

function detectAudience(text) {
  if (hasAny(text, ['cm1/cm2', 'cm1', 'cm2', 'enfants', 'enfant', 'eleves', 'primaire'])) return 'KIDS';
  if (hasAny(text, ['personnes agees', 'grand debutant', 'grands debutants', 'debutant numerique', 'debutants numeriques', 'senior', 'seniors'])) return 'SENIOR';
  if (hasAny(text, ['adultes', 'adulte', 'collaborateurs', 'collaborateur', 'personnel', 'professionnels', 'professionnel'])) return 'ADULT';
  return null;
}

function resolvePreset(text, audience) {
  const epn = hasSignal(text, 'epn') || hasSignal(text, 'epn de riviere salee');
  if (epn && audience === 'SENIOR') return { id: 'EPN_SENIOR_COURSE', reason: 'EPN context and Senior audience' };
  if (epn && audience === 'KIDS') return { id: 'EPN_KIDS_WORKSHOP', reason: 'EPN context and children/primary audience' };
  if (epn && audience === 'ADULT') return { id: 'EPN_ADULT_TRAINING', reason: 'EPN context and adult/professional audience' };
  return { id: 'GENERAL_PRESENTATION', reason: epn ? 'EPN context without a supported audience signal' : 'No identified EPN course context' };
}

function detectExplicit(request, text, structured = {}) {
  const values = {}; const reasons = []; const constraints = [];
  const set = (key, value, reason) => { values[key] = value; reasons.push(`${key}: ${reason}`); constraints.push(reason); };
  if (hasAny(text, ['uniquement la presentation', 'presentation uniquement', 'pas de handout', 'sans handout'])) set('deliveryMode', 'PRESENTATION', 'explicit projection-only request');
  else if (hasAny(text, ['uniquement le handout', 'handout uniquement', 'uniquement la fiche', 'fiche uniquement'])) set('deliveryMode', 'HANDOUT', 'explicit handout-only request');
  else if (hasAny(text, ['presentation + handout', 'presentation et handout', 'presentation avec handout', 'fiche a remettre aux participants', 'presentation et fiche'])) set('deliveryMode', 'DUAL', 'explicit request for projection and handout');
  if (hasAny(text, ['tres detaille', 'tres detaillee', 'ultra detaille', 'ultra detaillee'])) set('contentDepth', 'ULTRA_DETAILED', 'explicit very detailed depth');
  else if (hasAny(text, ['reste synthetique', 'support synthetique', 'sois synthetique', 'synthetique'])) set('contentDepth', 'SIMPLE', 'explicit synthetic depth');
  let match = normalizeText(request).match(/\b(?:maximum|max)\s+(\d+)\s+(?:slides?|pages?)\b/);
  if (!match) match = normalizeText(request).match(/\b(?:environ|autour de)\s+(\d+)\s+(?:slides?|pages?)\b/);
  if (!match) match = normalizeText(request).match(/\b(?:presentation de|cours de|atelier de)\s+(\d+)\s+(?:slides?|pages?)\b/);
  if (match) set('pageBudget', Number(match[1]), `explicit page/slide budget ${match[1]}`);
  const duration = parseDuration(request); if (duration !== null) set('durationMinutes', duration, `explicit duration ${duration} minutes`);
  const audience = detectAudience(text); if (audience) set('audience', audience, `explicit audience signal ${audience}`);
  const mappings = { brand: 'brand', profile: 'profile', contentDepth: 'contentDepth', deliveryMode: 'deliveryMode', pageBudget: 'pageBudget', researchStrategy: 'researchStrategy', durationMinutes: 'durationMinutes', audience: 'audience' };
  Object.entries(mappings).forEach(([source, target]) => { if (structured[source] !== undefined) set(target, structured[source], `structured explicit ${source}`); });
  return { values, reasons, constraints };
}

function extractDetails(request) {
  const prerequisites = []; const learningGoals = []; const exclusions = [];
  const prereq = String(request).match(/([^.!?]*(?:savent d[eé]j[aà]|connaissent d[eé]j[aà]|pr[eé]requis)[^.!?]*)/i);
  if (prereq) prerequisites.push(prereq[1].trim());
  const focus = String(request).match(/(?:surtout|priorite a|approfondir)\s+([^.!?]+)/i);
  if (focus) learningGoals.push(...focus[1].split(/,|\bet\b/i).map((x) => x.trim()).filter(Boolean));
  const colon = String(request).match(/:\s*([^.!?]+)/);
  if (colon) learningGoals.push(...colon[1].split(/,|\bet\b/i).map((x) => x.trim()).filter(Boolean));
  const excluded = String(request).match(/(?:ne pas traiter|sans aborder|exclure)\s+([^.!?]+)/i);
  if (excluded) exclusions.push(excluded[1].trim());
  const subjectMatch = String(request).match(/\bsur\s+([^:,.!?]+)/i);
  return { subject: subjectMatch ? subjectMatch[1].trim() : '', prerequisites, learningGoals: [...new Set(learningGoals)], exclusions };
}

function resolveAutoPageBudget(input = {}) {
  if (input.explicitBudget !== undefined && input.explicitBudget !== null) {
    const resolved = resolvePageBudget(input.explicitBudget);
    const tension = Number(input.requiredComplexityScore || 0) > 3 && resolved.target <= 8;
    return { ...resolved, strategy: 'EXPLICIT', tension, tensionReason: tension ? 'Explicit budget may be insufficient after pedagogical compression' : '', reason: 'Explicit user budget has priority' };
  }
  let score = 0; const reasons = [];
  if ((input.durationMinutes || 0) >= 180) { score += 2; reasons.push('long duration'); } else if ((input.durationMinutes || 0) >= 90) { score += 1; reasons.push('workshop duration'); }
  if (input.contentDepth === 'ULTRA_DETAILED') { score += 2; reasons.push('ultra-detailed content'); } else if (input.contentDepth === 'DETAILED') { score += 1; reasons.push('detailed content'); }
  if (input.deliveryMode === 'DUAL') { score += 1; reasons.push('autonomous handout'); }
  if ((input.notionCount || 0) >= 8) score += 2; else if ((input.notionCount || 0) >= 4) score += 1;
  if ((input.procedureCount || 0) >= 5) score += 2; else if ((input.procedureCount || 0) >= 2) score += 1;
  if ((input.exerciseCount || 0) >= 3) score += 1;
  if (input.autonomyExpected === true) score += 1;
  const preset = score <= 3 ? 'COMPACT' : score <= 8 ? 'STANDARD' : 'EXTENDED';
  const requiredScore = Number(input.requiredComplexityScore || score);
  const tension = requiredScore > 8 && preset !== 'EXTENDED';
  return { ...resolvePageBudget(preset), strategy: 'AUTO', score, tension, tensionReason: tension ? 'Essential content may exceed the selected budget after pedagogical compression' : '', reason: `${preset} selected from ${reasons.join(', ') || 'limited scope'}` };
}

function elevateResearch(base, request, contentDepth) {
  const text = normalizeText(request);
  let index = RESEARCH_LEVELS.indexOf(base); const reasons = [];
  const volatile = hasAny(text, ['windows', 'android', 'iphone', 'whatsapp', 'google maps', 'franceconnect', 'gmail', 'logiciel', 'application', 'demarches administratives']);
  const sensitive = hasAny(text, ['securite', 'mot de passe', 'mots de passe', 'hameconnage', 'cybersecurite', 'administratives', 'franceconnect']);
  if (volatile) { index = Math.max(index, 1); reasons.push('current software/service procedure'); }
  if (sensitive || (contentDepth === 'ULTRA_DETAILED' && volatile)) { index = 2; reasons.push('sensitive or high-detail volatile topic'); }
  return { value: RESEARCH_LEVELS[Math.max(index, 0)], reasons };
}

function resolveIntent(request, structuredExplicit = {}, resolverOptions = {}) {
  const rawRequest = String(request || '').trim(); if (!rawRequest) throw new TypeError('A user request is required');
  const text = normalizeText(rawRequest); const intent = detectIntent(text); const inferredAudience = detectAudience(text);
  const presetResolution = resolverOptions.presetHint
    ? { id: resolverOptions.presetHint, reason: 'active context supplied a compatible preset family' }
    : resolvePreset(text, inferredAudience);
  const preset = getPreset(presetResolution.id);
  const explicit = detectExplicit(rawRequest, text, structuredExplicit); const details = extractDetails(rawRequest);
  const reasons = [`Intent ${intent} inferred from support wording`, `${preset.id}: ${presetResolution.reason}`];
  const inferredValues = {}; const source = {};
  const choose = (key, inferred, fallback) => {
    if (explicit.values[key] !== undefined) { source[key] = 'EXPLICIT'; return explicit.values[key]; }
    if (resolverOptions.contextValues?.[key] !== undefined) { source[key] = 'CONTEXT_OVERRIDE'; return resolverOptions.contextValues[key]; }
    if (preset[key] !== undefined && preset[key] !== 'AUTO_STYLE' && preset[key] !== 'AUTO') { source[key] = 'PRESET'; return preset[key]; }
    if (inferred !== undefined && inferred !== null) { source[key] = 'INFERENCE'; inferredValues[key] = inferred; return inferred; }
    source[key] = 'DEFAULT'; return fallback;
  };
  const audience = choose('audience', inferredAudience, 'GENERAL');
  const brand = choose('brand', resolverOptions.contextBrand, null);
  const profileInference = preset.profile === 'AUTO_STYLE' ? selectProfile(rawRequest).toUpperCase() : null;
  const profile = choose('profile', profileInference, 'CORPORATE');
  const contentDepth = choose('contentDepth', intent === 'COURSE' ? 'DETAILED' : 'SIMPLE', 'SIMPLE');
  const deliveryMode = choose('deliveryMode', intent === 'COURSE' ? 'PRESENTATION' : null, 'PRESENTATION');
  const durationMinutes = choose('durationMinutes', parseDuration(rawRequest), null);
  const baseResearch = choose('researchStrategy', null, 'ONLY_WHEN_NEEDED');
  const research = source.researchStrategy === 'EXPLICIT' ? { value: baseResearch, reasons: ['explicit research strategy preserved'] } : elevateResearch(baseResearch, rawRequest, contentDepth);
  const procedureSignals = ['whatsapp', 'google maps', 'excel', 'windows', 'franceconnect', 'demarches', 'photos', 'appels video'].filter((signal) => hasSignal(text, signal)).length;
  const budgetFactors = { durationMinutes, audience, contentDepth, deliveryMode,
    notionCount: Math.max(details.learningGoals.length, 1), procedureCount: procedureSignals, exerciseCount: intent === 'WORKSHOP' ? Math.max(2, details.learningGoals.length) : 0,
    autonomyExpected: deliveryMode === 'DUAL' || deliveryMode === 'HANDOUT' };
  const autoEstimate = resolveAutoPageBudget(budgetFactors);
  const autoBudget = explicit.values.pageBudget === undefined ? autoEstimate : resolveAutoPageBudget({ ...budgetFactors, explicitBudget: explicit.values.pageBudget, requiredComplexityScore: autoEstimate.score });
  source.pageBudget = explicit.values.pageBudget !== undefined ? 'EXPLICIT' : 'INFERENCE'; inferredValues.pageBudget = autoBudget.kind;
  const ambiguities = [];
  if (/\bsupport du cours\b/i.test(rawRequest) && preset.id === 'GENERAL_PRESENTATION' && explicit.values.deliveryMode === undefined) ambiguities.push('Delivery could mean projection, handout, or both');
  reasons.push(`Duration detected: ${durationMinutes === null ? 'not provided' : `${durationMinutes} min`}`, autoBudget.reason, ...research.reasons);
  return {
    intent, subject: details.subject, audience, durationMinutes, brand, profile, contentDepth, deliveryMode,
    pageBudget: autoBudget.explicit ? autoBudget.target : autoBudget.kind, pageBudgetResolved: autoBudget, pageBudgetTension: autoBudget.tension,
    researchStrategy: research.value, learningGoals: details.learningGoals, prerequisites: details.prerequisites, exclusions: details.exclusions,
    explicitConstraints: explicit.constraints, inferredValues, presetUsed: preset.id, confidence: ambiguities.length ? 'MEDIUM' : 'HIGH', ambiguities,
    resolutionTrace: { priority: ['EXPLICIT', 'PRESET', 'INFERENCE', 'DEFAULT'], sources: source, reasons, overrides: explicit.reasons },
  };
}

function explainResolution(config) {
  const lines = ['Resolved configuration', '', `Intent: ${config.intent}`, `Preset: ${config.presetUsed}`, `Brand: ${config.brand || 'NONE'}`, `Audience: ${config.audience}`,
    `Profile: ${config.profile}`, `Content depth: ${config.contentDepth}`, `Delivery: ${config.deliveryMode}`, `Duration: ${config.durationMinutes === null ? 'not specified' : `${config.durationMinutes} min`}`,
    `Page budget: ${config.pageBudget}`, `Research: ${config.researchStrategy}`, '', 'Reasons:', ...config.resolutionTrace.reasons.map((x) => `- ${x}`), '', 'Overrides:', ...(config.resolutionTrace.overrides.length ? config.resolutionTrace.overrides : ['none']).map((x) => `- ${x}`)];
  return lines.join('\n');
}

module.exports = { RESEARCH_LEVELS, normalizeText, parseDuration, detectIntent, detectAudience, resolvePreset, resolveAutoPageBudget, resolveIntent, explainResolution, PRESETS };
