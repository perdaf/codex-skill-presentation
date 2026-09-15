#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  EDIT_MODE, resolveSlideNumbers, resolveTargets, classifyChanges,
  selectSource, createTargetedEditPlan,
} = require('../assets/targeted-edit');

assert.strictEqual(EDIT_MODE, 'TARGETED');
assert.deepStrictEqual(resolveSlideNumbers('Sur la slide 12, agrandis le titre.'), [12]);
assert.deepStrictEqual(resolveSlideNumbers('Slides 4 et 7 : augmente les titres.'), [4, 7]);
assert.deepStrictEqual(resolveSlideNumbers('Slides 5 à 8 : mets les titres en vert.'), [5, 6, 7, 8]);

assert.deepStrictEqual(classifyChanges('Sur la slide 12, agrandis le titre et mets-le en vert.').sort(), ['COLOR', 'SIZE', 'TEXT_STYLE'].sort());
assert.deepStrictEqual(classifyChanges('Remplace le paragraphe « exemple » par « nouveau texte » et mets-le en bleu nuit.').sort(), ['COLOR', 'TEXT_CONTENT', 'TEXT_STYLE'].sort());
assert.ok(classifyChanges('Corrige la flèche pour qu’elle pointe vers le port USB.').includes('CONNECTOR'));

const inventory = [
  { slide: 12, id: 'title-12', type: 'TITLE', text: 'Utiliser une clé USB' },
  { slide: 12, id: 'usb-a', type: 'ILLUSTRATION', label: 'clé USB gauche' },
  { slide: 12, id: 'usb-b', type: 'ILLUSTRATION', label: 'clé USB droite' },
];
const title = resolveTargets('Le titre de la slide 12', inventory);
assert.strictEqual(title.status, 'RESOLVED');
assert.strictEqual(title.targets[0].elementId, 'title-12');
const ambiguous = resolveTargets('Sur la slide 12, remplace les illustrations.', inventory);
assert.strictEqual(ambiguous.status, 'AMBIGUOUS_TARGET');
assert.strictEqual(ambiguous.candidates.length, 2);

const semanticInventory = [
  { slide: 10, id: 'body-10', type: 'PARAGRAPH', text: 'Copier conserve l’original' },
  { slide: 3, id: 'usb-arrow', type: 'CONNECTOR', relation: { source: 'ordinateur', target: 'clé USB' } },
];
const exactText = resolveTargets('Sur la slide 10, remplace le paragraphe « Copier conserve l’original ».', semanticInventory);
assert.strictEqual(exactText.targets[0].elementId, 'body-10');
const connector = resolveTargets('Sur la slide 3, corrige la flèche entre ordinateur et clé USB.', semanticInventory);
assert.strictEqual(connector.targets[0].elementId, 'usb-arrow');

assert.deepStrictEqual(selectSource(['presentation.js', 'presentation.pptx']), {
  kind: 'JAVASCRIPT', path: 'presentation.js', regenerate: 'presentation.pptx', directPptxPatchAllowed: false,
});

const imagePlan = createTargetedEditPlan({
  request: 'Sur la slide 12, remplace les illustrations de clés USB par des photos réalistes générées de clés USB.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js'],
});
assert.strictEqual(imagePlan.status, 'READY');
assert.strictEqual(imagePlan.editMode, 'TARGETED');
assert.strictEqual(imagePlan.scope.presentation, true);
assert.strictEqual(imagePlan.scope.handout, false);
assert.strictEqual(imagePlan.imageReplacement.userOverride, true);
assert.strictEqual(imagePlan.imageReplacement.requiresMandatoryPipeline, true);
assert.ok(imagePlan.forbiddenGlobalReruns.includes('AUTO_STYLE'));
assert.deepStrictEqual(imagePlan.validation.targetedSlides, [12]);
assert.strictEqual(imagePlan.validation.readabilityRegression.required, false);

const handoutPlan = createTargetedEditPlan({
  request: 'Sur la slide 8 et la page correspondante du handout, mets une photo.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js'],
});
assert.strictEqual(handoutPlan.scope.handout, true);

const textPlan = createTargetedEditPlan({
  request: 'Sur la slide 9, remplace le titre par « Une consigne plus longue ».',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js', 'content/course-content.md'],
});
assert.strictEqual(textPlan.validation.readabilityRegression.required, true);
assert.strictEqual(textPlan.validation.readabilityRegression.failureCode, 'TARGETED_EDIT_READABILITY_REGRESSION');
assert.strictEqual(textPlan.scope.handout, false);
assert.ok(textPlan.preserve.includes('master content unless propagation is authorized'));

const connectorPlan = createTargetedEditPlan({
  request: 'Sur la slide 3, corrige la flèche entre ordinateur et clé USB.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js'],
});
assert.strictEqual(connectorPlan.validation.readabilityRegression.required, false);

const typographyPlan = createTargetedEditPlan({
  request: 'Sur la slide 7, augmente légèrement la taille du titre.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js'],
});
assert.strictEqual(typographyPlan.validation.readabilityRegression.required, true);
assert.strictEqual(typographyPlan.scope.handout, false);

const visualPlan = createTargetedEditPlan({
  request: 'Sur la slide 3, remplace les illustrations par des photos.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'handout.js'],
});
assert.strictEqual(visualPlan.validation.readabilityRegression.required, false);
assert.strictEqual(visualPlan.scope.handout, false);

const consistency = createTargetedEditPlan({
  request: 'Sur la slide 6, remplace l’étape 4 par : Cliquez sur Éjecter.',
  projectFiles: ['presentation.js', 'presentation.pptx', 'content/course-content.md', 'handout.js'],
  occurrences: [{ output: 'handout', page: 4, path: 'handout.js' }, { output: 'master', path: 'content/course-content.md' }],
});
assert.strictEqual(consistency.status, 'CONSISTENCY_REVIEW_REQUIRED');
assert.strictEqual(consistency.consistencyImpact.status, 'REVIEW_REQUIRED');

const propagate = createTargetedEditPlan({
  request: 'Partout, remplace l’étape 4 par : Cliquez sur Éjecter.',
  projectFiles: ['presentation.js', 'presentation.pptx'],
  occurrences: [{ output: 'handout', page: 4 }],
});
assert.strictEqual(propagate.consistencyImpact.status, 'PROPAGATION_AUTHORIZED');

console.log('Targeted Edit Layer assertions passed');
