#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { CONTENT_DEPTH, DELIVERY_MODE, PAGE_BUDGETS, A4_PORTRAIT, resolvePageBudget, resolveTeachingOptions } = require('../assets/teaching');

assert.deepStrictEqual(CONTENT_DEPTH, ['SIMPLE', 'DETAILED', 'ULTRA_DETAILED']);
assert.deepStrictEqual(DELIVERY_MODE, ['PRESENTATION', 'HANDOUT', 'DUAL']);
assert.deepStrictEqual(Object.keys(PAGE_BUDGETS), ['COMPACT', 'STANDARD', 'EXTENDED']);
assert.deepStrictEqual(A4_PORTRAIT, { width: 8.267, height: 11.693, unit: 'in', printSafeMargin: 0.55 });

CONTENT_DEPTH.forEach((contentDepth) => assert.strictEqual(resolveTeachingOptions({ contentDepth }).contentDepth, contentDepth));
DELIVERY_MODE.forEach((deliveryMode) => assert.strictEqual(resolveTeachingOptions({ deliveryMode }).deliveryMode, deliveryMode));

assert.deepStrictEqual(resolvePageBudget('COMPACT'), { kind: 'COMPACT', min: 6, max: 8, target: 7, explicit: false });
assert.deepStrictEqual(resolvePageBudget('STANDARD'), { kind: 'STANDARD', min: 10, max: 12, target: 11, explicit: false });
assert.deepStrictEqual(resolvePageBudget('EXTENDED'), { kind: 'EXTENDED', min: 14, max: 16, target: 15, explicit: false });
assert.deepStrictEqual(resolvePageBudget(10), { kind: 'EXPLICIT', min: 10, max: 10, target: 10, explicit: true });
assert.deepStrictEqual(resolvePageBudget('10'), { kind: 'EXPLICIT', min: 10, max: 10, target: 10, explicit: true });

const dual = resolveTeachingOptions({ contentDepth: 'ULTRA_DETAILED', deliveryMode: 'DUAL', pageBudget: 10, audience: 'SENIOR' });
assert.deepStrictEqual(dual.outputs, ['PRESENTATION', 'HANDOUT']);
assert.strictEqual(dual.requiresMasterContent, true);
assert.strictEqual(dual.persistMasterContent, true);
assert.strictEqual(dual.researchDepth, 'THOROUGH_WHEN_NEEDED');
assert.strictEqual(dual.seniorConstraints, true);
assert.strictEqual(dual.pageBudget.explicit, true);

assert.throws(() => resolvePageBudget(0), RangeError);
assert.throws(() => resolvePageBudget('TINY'), RangeError);
assert.throws(() => resolveTeachingOptions({ contentDepth: 'MAXIMUM' }), RangeError);
assert.throws(() => resolveTeachingOptions({ deliveryMode: 'PRINT' }), RangeError);

console.log('Teaching engine assertions passed');
