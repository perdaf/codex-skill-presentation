#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { presetNames } = require('../assets/presets');
const { parseDuration, resolveAutoPageBudget, resolveIntent, explainResolution } = require('../assets/intent-layer');

assert.deepStrictEqual(presetNames, ['EPN_SENIOR_COURSE', 'EPN_KIDS_WORKSHOP', 'EPN_ADULT_TRAINING', 'GENERAL_PRESENTATION']);

const seniorWhatsApp = resolveIntent('Crée-moi un atelier senior EPN de 2 h sur WhatsApp : messages, photos, appels vidéo et sécurité.');
assert.strictEqual(seniorWhatsApp.intent, 'WORKSHOP');
assert.strictEqual(seniorWhatsApp.presetUsed, 'EPN_SENIOR_COURSE');
assert.strictEqual(seniorWhatsApp.brand, 'EPN_RIVIERE_SALEE');
assert.strictEqual(seniorWhatsApp.profile, 'SENIOR');
assert.strictEqual(seniorWhatsApp.contentDepth, 'ULTRA_DETAILED');
assert.strictEqual(seniorWhatsApp.deliveryMode, 'DUAL');
assert.strictEqual(seniorWhatsApp.durationMinutes, 120);
assert.strictEqual(seniorWhatsApp.pageBudget, 'STANDARD');
assert.strictEqual(seniorWhatsApp.pageBudgetResolved.strategy, 'AUTO');
assert.strictEqual(seniorWhatsApp.researchStrategy, 'THOROUGH_WHEN_NEEDED');
assert.ok(seniorWhatsApp.learningGoals.includes('messages'));

const kids = resolveIntent('Crée-moi un atelier CM1/CM2 EPN de 45 minutes sur les fake news.');
assert.strictEqual(kids.presetUsed, 'EPN_KIDS_WORKSHOP'); assert.strictEqual(kids.profile, 'KIDS');
assert.strictEqual(kids.deliveryMode, 'PRESENTATION'); assert.strictEqual(kids.durationMinutes, 45); assert.strictEqual(kids.pageBudget, 'COMPACT');

const adults = resolveIntent("Formation Excel de 2 h pour des collaborateurs de l'EPN.");
assert.strictEqual(adults.presetUsed, 'EPN_ADULT_TRAINING'); assert.strictEqual(adults.profile, 'EDUCATION');
assert.strictEqual(adults.contentDepth, 'DETAILED'); assert.strictEqual(adults.deliveryMode, 'DUAL');

const martinique = resolveIntent('Présentation de 10 slides sur la Martinique.');
assert.strictEqual(martinique.presetUsed, 'GENERAL_PRESENTATION'); assert.strictEqual(martinique.deliveryMode, 'PRESENTATION');
assert.strictEqual(martinique.pageBudget, 10); assert.strictEqual(martinique.profile, 'TROPICAL');

const projectionOnly = resolveIntent('Atelier senior EPN sur Google Maps, uniquement la présentation.');
assert.strictEqual(projectionOnly.presetUsed, 'EPN_SENIOR_COURSE'); assert.strictEqual(projectionOnly.deliveryMode, 'PRESENTATION');
assert.strictEqual(projectionOnly.resolutionTrace.sources.deliveryMode, 'EXPLICIT');

const eightPages = resolveIntent('Atelier senior EPN, maximum 8 pages imprimées.');
assert.strictEqual(eightPages.pageBudget, 8); assert.strictEqual(eightPages.pageBudgetResolved.strategy, 'EXPLICIT'); assert.strictEqual(eightPages.pageBudgetTension, true);

const synthetic = resolveIntent('Atelier senior EPN sur les mots de passe, mais reste synthétique.');
assert.strictEqual(synthetic.presetUsed, 'EPN_SENIOR_COURSE'); assert.strictEqual(synthetic.contentDepth, 'SIMPLE');
assert.strictEqual(synthetic.resolutionTrace.sources.contentDepth, 'EXPLICIT');

const webHistory = resolveIntent("Présentation générale sur l'histoire du Web.");
assert.strictEqual(webHistory.presetUsed, 'GENERAL_PRESENTATION'); assert.strictEqual(webHistory.intent, 'PRESENTATION');

assert.strictEqual(resolveIntent('Cours senior EPN de 1h30.').durationMinutes, 90);
assert.strictEqual(parseDuration('atelier de 30 minutes'), 30); assert.strictEqual(parseDuration('atelier de 45 min'), 45);
assert.strictEqual(parseDuration('atelier de 1 heure'), 60); assert.strictEqual(parseDuration('atelier de 1 h 30'), 90); assert.strictEqual(parseDuration('atelier de 2h'), 120);

const noCollision = resolveIntent('Présentation sur la transformation professionnelle des organisations.');
assert.strictEqual(noCollision.presetUsed, 'GENERAL_PRESENTATION');

const explicitPriority = resolveIntent('Atelier senior EPN sans handout.', { contentDepth: 'DETAILED' });
assert.strictEqual(explicitPriority.deliveryMode, 'PRESENTATION'); assert.strictEqual(explicitPriority.contentDepth, 'DETAILED');
const presetPriority = resolveIntent("Formation sur l'architecture web pour des collaborateurs EPN.");
assert.strictEqual(presetPriority.profile, 'EDUCATION'); assert.strictEqual(presetPriority.resolutionTrace.sources.profile, 'PRESET');
assert.strictEqual(martinique.resolutionTrace.sources.profile, 'INFERENCE');
assert.strictEqual(webHistory.resolutionTrace.sources.durationMinutes, 'DEFAULT');
const ambiguous = resolveIntent('Fais-moi le support du cours sur Internet.');
assert.strictEqual(ambiguous.confidence, 'MEDIUM'); assert.strictEqual(ambiguous.ambiguities.length, 1);
const explicitResearch = resolveIntent('Cours senior EPN sur FranceConnect.', { researchStrategy: 'ONLY_WHEN_NEEDED' });
assert.strictEqual(explicitResearch.researchStrategy, 'ONLY_WHEN_NEEDED'); assert.strictEqual(explicitResearch.resolutionTrace.sources.researchStrategy, 'EXPLICIT');

const prerequisites = resolveIntent("Atelier senior EPN sur le smartphone. Ils savent déjà utiliser un navigateur mais connaissent mal leur smartphone. Je veux surtout travailler les photos et les messages.");
assert.ok(prerequisites.prerequisites.length === 1); assert.deepStrictEqual(prerequisites.learningGoals, ['travailler les photos', 'les messages']);

assert.strictEqual(resolveAutoPageBudget({ durationMinutes: 45, audience: 'KIDS', contentDepth: 'SIMPLE', deliveryMode: 'PRESENTATION' }).kind, 'COMPACT');
assert.strictEqual(resolveAutoPageBudget({ durationMinutes: 120, audience: 'SENIOR', contentDepth: 'ULTRA_DETAILED', deliveryMode: 'DUAL', procedureCount: 4, notionCount: 5, exerciseCount: 3, autonomyExpected: true }).kind, 'STANDARD');
assert.strictEqual(resolveAutoPageBudget({ durationMinutes: 240, contentDepth: 'DETAILED', deliveryMode: 'DUAL', procedureCount: 7, notionCount: 10, exerciseCount: 4, autonomyExpected: true }).kind, 'EXTENDED');
const explicitBudget = resolveAutoPageBudget({ explicitBudget: 8, requiredComplexityScore: 10 });
assert.strictEqual(explicitBudget.target, 8); assert.strictEqual(explicitBudget.tension, true);

const explanation = explainResolution(seniorWhatsApp);
['Intent: WORKSHOP', 'Preset: EPN_SENIOR_COURSE', 'Duration: 120 min', 'Page budget: STANDARD', 'Research: THOROUGH_WHEN_NEEDED'].forEach((part) => assert.ok(explanation.includes(part), part));
console.log('Intent Layer assertions passed');
