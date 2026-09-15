#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  PRESENTATION_FORMATS,
  PRESENTATION_FORMAT_QUESTION,
  resolveV46Intent,
  resolveV46RequestWithContext,
} = require('../assets/presentation-format');
const { prepareV46ImageAsset } = require('../assets/v46-pipeline');

assert.deepStrictEqual(PRESENTATION_FORMATS, ['AUTO', 'HTML', 'PPTX']);

const ambiguous = resolveV46Intent('Crée une présentation sur la sécurité numérique.');
assert.strictEqual(ambiguous.deliveryMode, 'PRESENTATION');
assert.strictEqual(ambiguous.presentationFormat, 'AUTO');
assert.strictEqual(ambiguous.requiresFormatClarification, true);
assert.strictEqual(ambiguous.clarificationQuestion, PRESENTATION_FORMAT_QUESTION);

for (const request of [
  'Crée une présentation projetée directement depuis l’ordinateur.',
  'Crée une présentation interactive.',
  'Crée une présentation web.',
  'Crée une présentation HTML dans un navigateur.',
]) {
  const resolved = resolveV46Intent(request);
  assert.strictEqual(resolved.presentationFormat, 'HTML', request);
  assert.strictEqual(resolved.requiresFormatClarification, false, request);
}

for (const request of [
  'Crée un PowerPoint sur la sécurité numérique.',
  'Crée un fichier PPTX.',
  'Crée une présentation destinée à être modifiée dans PowerPoint.',
]) {
  const resolved = resolveV46Intent(request);
  assert.strictEqual(resolved.presentationFormat, 'PPTX', request);
  assert.strictEqual(resolved.requiresFormatClarification, false, request);
}

const noFalseWebSignal = resolveV46Intent('Présentation générale sur l’histoire du Web.');
assert.strictEqual(noFalseWebSignal.presentationFormat, 'AUTO');

const directAnswer = resolveV46Intent('Crée une présentation.', { projectionDirect: true });
assert.strictEqual(directAnswer.presentationFormat, 'HTML');
const declinedAnswer = resolveV46Intent('Crée une présentation.', { projectionDirect: false });
assert.strictEqual(declinedAnswer.presentationFormat, 'PPTX');
const explicitWins = resolveV46Intent('Crée une présentation web.', { presentationFormat: 'PPTX', projectionDirect: true });
assert.strictEqual(explicitWins.presentationFormat, 'PPTX');

const dualHtml = resolveV46RequestWithContext('Atelier senior avec présentation et fiche, projeté directement depuis l’ordinateur.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(dualHtml.deliveryMode, 'DUAL');
assert.deepStrictEqual(dualHtml.deliverables, [
  { kind: 'PRESENTATION', format: 'HTML' },
  { kind: 'HANDOUT', format: 'PDF', page: 'A4' },
]);

const dualPptx = resolveV46RequestWithContext('Atelier senior avec présentation et fiche au format PPTX.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(dualPptx.deliveryMode, 'DUAL');
assert.deepStrictEqual(dualPptx.deliverables, [
  { kind: 'PRESENTATION', format: 'PPTX' },
  { kind: 'HANDOUT', format: 'PDF', page: 'A4' },
]);

const handout = resolveV46Intent('Uniquement le handout sur les mots de passe.');
assert.strictEqual(handout.deliveryMode, 'HANDOUT');
assert.strictEqual(handout.presentationFormatStatus, 'NOT_APPLICABLE');
assert.strictEqual(handout.requiresFormatClarification, false);
assert.strictEqual(handout.clarificationQuestion, null);
assert.deepStrictEqual(handout.deliverables, [{ kind: 'HANDOUT', format: 'PDF', page: 'A4' }]);

const blocked = prepareV46ImageAsset({
  request: 'Crée une présentation sur les photos.',
  visual: { visualRole: 'EDITORIAL_SCENE', hasPeople: true },
});
assert.strictEqual(blocked.status, 'BLOCKED');
assert.strictEqual(blocked.code, 'PRESENTATION_FORMAT_CLARIFICATION_REQUIRED');

const ready = prepareV46ImageAsset({
  request: 'Crée une présentation web sur les photos pour seniors.',
  activeContext: 'EPN_RIVIERE_SALEE_CONTEXT',
  visual: { id: 'scene', location: 'slide:1', purpose: 'atelier', subject: 'senior photo workshop', visualRole: 'EDITORIAL_SCENE', hasPeople: true },
  runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(ready.status, 'READY');
assert.strictEqual(ready.resolvedConfiguration.presentationFormat, 'HTML');
assert.strictEqual(ready.trace.PRESENTATION_FORMAT, 'HTML');
assert.strictEqual(ready.trace.AUDIENCE_REPRESENTATION, 'MARTINIQUE');
assert.ok(ready.finalPrompt.includes('contemporary Martinican / Afro-Caribbean'));

console.log('V4.6 presentation format assertions passed');
