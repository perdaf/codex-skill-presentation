#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { assessIconRecognizability } = require('../assets/icon-reliability');
const { classifyFunctionalIcon } = require('../assets/visual-intelligence');
const assess = (input) => assessIconRecognizability({ profile: 'SENIOR', functional: true, hasLabel: true, ...input });
assert.strictEqual(assess({ iconType: 'PEDAGOGICAL_OBJECT', symbol: 'SMARTPHONE' }).iconRecognizability, 'CLEAR');
assert.strictEqual(assess({ iconType: 'PEDAGOGICAL_OBJECT', symbol: 'COMPUTER' }).iconRecognizability, 'CLEAR');
assert.strictEqual(assess({ iconType: 'FUNCTIONAL_ICON', symbol: 'LOCK' }).iconRecognizability, 'CLEAR');
assert.strictEqual(assess({ iconType: 'FUNCTIONAL_ICON', symbol: 'EYE_OFF' }).iconRecognizability, 'ACCEPTABLE_WITH_LABEL');
const abstract = assess({ iconType: 'ABSTRACT_CUSTOM_ICON', symbol: 'CUSTOM_GEOMETRY' });
assert.strictEqual(abstract.iconRecognizability, 'AMBIGUOUS'); assert.strictEqual(abstract.reviewRequired, true);
const corporateDecoration = assessIconRecognizability({ profile: 'CORPORATE', functional: false, iconType: 'ABSTRACT_CUSTOM_ICON' });
assert.strictEqual(corporateDecoration.reviewRequired, false);
const labeledBad = assess({ iconType: 'FUNCTIONAL_ICON', symbol: 'UNKNOWN', hasLabel: true });
assert.strictEqual(labeledBad.reviewRequired, true);
const integrated = classifyFunctionalIcon({ profile: 'SENIOR', iconType: 'FUNCTIONAL_ICON', symbol: 'LOCK', functional: true, hasLabel: true });
assert.strictEqual(integrated.visualRole, 'FUNCTIONAL_ICON'); assert.strictEqual(integrated.imageMethod, 'VECTOR'); assert.strictEqual(integrated.iconRecognizability, 'CLEAR');
console.log('Icon Recognizability assertions passed');
