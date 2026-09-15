#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { validateTargetedEditReadability } = require('../assets/targeted-edit-readability');

const slide = { w: 13.333, h: 7.5 };
const box = (overrides = {}) => ({ x: 2, y: 2, w: 2.4, h: 0.5, fontSize: 18, hierarchyPreserved: true, distanceReadable: true, ...overrides });

const shortText = validateTargetedEditReadability({ profile: 'SENIOR', role: 'BODY', text: 'Retirer la clé', slide, current: box() });
assert.strictEqual(shortText.status, 'VALID');
assert.strictEqual(shortText.strategy, 'DIRECT');

const expanded = validateTargetedEditReadability({
  profile: 'SENIOR', role: 'BODY', text: 'Éjectez la clé USB depuis Windows avant de la retirer', slide,
  current: box({ w: 1.7, h: 0.34, fontSize: 18 }),
  textBoxExpansion: box({ w: 4.8, h: 0.72, fontSize: 18 }),
});
assert.strictEqual(expanded.status, 'VALID');
assert.strictEqual(expanded.strategy, 'TEXT_BOX_EXPANSION');

const localLayout = validateTargetedEditReadability({
  profile: 'SENIOR', role: 'BODY', text: 'Une consigne un peu plus longue reste lisible', slide,
  current: box({ w: 1.5, h: 0.34 }),
  textBoxExpansion: box({ x: 2, y: 2, w: 3.5, h: 0.7 }),
  neighbors: [{ x: 5.45, y: 1.9, w: 1, h: 1 }],
  localLayoutAdaptation: box({ x: 1.2, y: 2, w: 3.8, h: 0.8 }),
});
assert.strictEqual(localLayout.status, 'VALID');
assert.strictEqual(localLayout.strategy, 'LOCAL_LAYOUT_ADAPTATION');

const excessiveShrink = validateTargetedEditReadability({
  profile: 'SENIOR', role: 'STEP_LABEL', text: 'Éjectez la clé USB depuis Windows avant de la retirer', slide,
  current: box({ w: 1.7, h: 0.34, fontSize: 11.5, compressionRatio: 0.64 }),
});
assert.strictEqual(excessiveShrink.status, 'TARGETED_EDIT_READABILITY_REGRESSION');
assert.strictEqual(excessiveShrink.requiresUserDecision, true);
assert.ok(excessiveShrink.attempts[0].reasons.includes('FONT_BELOW_PROFILE_MINIMUM'));

const seniorPriority = validateTargetedEditReadability({
  profile: 'SENIOR', role: 'BODY', text: 'Texte lisible techniquement', slide,
  current: box({ fontSize: 16, density: 0.3 }),
  textBoxExpansion: box({ w: 3, h: 0.6, fontSize: 18 }),
});
assert.strictEqual(seniorPriority.strategy, 'TEXT_BOX_EXPANSION');
assert.strictEqual(seniorPriority.attempts[0].valid, false);

const authorizedReformulation = validateTargetedEditReadability({
  profile: 'SENIOR', text: 'Formulation beaucoup trop longue pour cet emplacement', slide,
  current: box({ w: 1.2, h: 0.34 }),
  allowReformulation: true,
  reformulation: { ...box({ w: 3.8, h: 0.5 }), text: 'Formulation équivalente', exactMeaningPreserved: true },
});
assert.strictEqual(authorizedReformulation.strategy, 'AUTHORIZED_REFORMULATION');

console.log('Targeted Edit readability assertions passed');
