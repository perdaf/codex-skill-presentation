#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  INTERACTION_METHODS,
  PROGRESSIVE_DISCLOSURE,
  resolveInteractionMethod,
  extendVisualDecision,
} = require('../assets/web-interactions');

assert.deepStrictEqual(INTERACTION_METHODS, ['STATIC', 'REVEAL', 'HIGHLIGHT', 'STEP_SEQUENCE', 'BEFORE_AFTER', 'QUIZ_REVEAL']);
assert.deepStrictEqual(PROGRESSIVE_DISCLOSURE, ['AUTO', 'ENABLED', 'DISABLED']);
assert.strictEqual(resolveInteractionMethod({ conceptType: 'PROCEDURE', stepCount: 3 }).interactionMethod, 'STEP_SEQUENCE');
assert.strictEqual(resolveInteractionMethod({ conceptType: 'PROCEDURE', stepCount: 3, progressiveDisclosure: false }).interactionMethod, 'STATIC');
assert.strictEqual(resolveInteractionMethod({ conceptType: 'BEFORE_AFTER' }).interactionMethod, 'BEFORE_AFTER');
assert.strictEqual(resolveInteractionMethod({ conceptType: 'QUIZ' }).interactionMethod, 'QUIZ_REVEAL');
assert.strictEqual(resolveInteractionMethod({ focusTarget: 'button' }).interactionMethod, 'HIGHLIGHT');
assert.strictEqual(resolveInteractionMethod({ progressiveDisclosure: true, itemCount: 3 }).interactionMethod, 'REVEAL');
const senior = resolveInteractionMethod({ conceptType: 'PROCEDURE', stepCount: 4, profile: 'SENIOR' });
assert.strictEqual(senior.seniorConstraints.minClickTargetPx, 48);
assert.strictEqual(senior.seniorConstraints.complexGestures, false);
assert.strictEqual(senior.seniorConstraints.essentialInformationAnimationOnly, false);
const extended = extendVisualDecision({ visualOpportunity: 'HIGH', visualRole: 'PROCESS', imageMethod: 'POWERPOINT' }, { conceptType: 'PROCEDURE', stepCount: 3 });
assert.strictEqual(extended.visualOpportunity, 'HIGH');
assert.strictEqual(extended.visualRole, 'PROCESS');
assert.strictEqual(extended.imageMethod, 'POWERPOINT');
assert.strictEqual(extended.interactionMethod, 'STEP_SEQUENCE');

console.log('V4.6 web interaction assertions passed');
