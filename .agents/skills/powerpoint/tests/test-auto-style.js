#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { profiles, selectProfile } = require('../assets/themes');

const cases = [
  ['formation pour enfants', 'kids'],
  ['formation professionnelle', 'education'],
  ['formation professionnelle pour les managers et la direction', 'corporate'],
  ['transformation digitale des PME', 'corporate'],
  ['transformation numérique', 'tech'],
  ['élèves de CM1', 'kids'],
  ['résultats financiers annuels', 'corporate'],
  ["architecture d'une application web", 'tech'],
  ['voyage culturel en Martinique', 'tropical'],
];

cases.forEach(([context, expected]) => assert.strictEqual(selectProfile(context), expected, context));
assert.notStrictEqual(selectProfile('transformation digitale'), 'education');
assert.notStrictEqual(selectProfile('transformation numérique'), 'education');
assert.strictEqual(Object.keys(profiles).length, 10);

console.log(`AUTO STYLE assertions passed (${cases.length + 3})`);
