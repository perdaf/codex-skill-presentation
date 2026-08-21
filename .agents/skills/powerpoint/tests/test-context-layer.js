#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { contextNames, resolveContext } = require('../assets/contexts');
const { resolveRequestWithContext, explainContextResolution } = require('../assets/context-layer');

assert.deepStrictEqual(contextNames, ['EPN_RIVIERE_SALEE_CONTEXT']);
assert.strictEqual(resolveContext('EPN_RIVIERE_SALEE_CONTEXT').organizationName, 'EPN de Rivière-Salée');

const senior = resolveRequestWithContext('Atelier de 2h sur WhatsApp pour seniors débutants.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(senior.presetUsed, 'EPN_SENIOR_COURSE');
assert.strictEqual(senior.brand, 'EPN_RIVIERE_SALEE');
assert.strictEqual(senior.profile, 'SENIOR');
assert.strictEqual(senior.deliveryMode, 'DUAL');
assert.strictEqual(senior.contentDepth, 'ULTRA_DETAILED');
assert.strictEqual(senior.context, 'EPN_RIVIERE_SALEE_CONTEXT');

const kids = resolveRequestWithContext('Atelier CM1/CM2 sur les fake news.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(kids.presetUsed, 'EPN_KIDS_WORKSHOP'); assert.strictEqual(kids.profile, 'KIDS'); assert.strictEqual(kids.deliveryMode, 'PRESENTATION');

const adult = resolveRequestWithContext('Formation Excel pour des collaborateurs.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(adult.presetUsed, 'EPN_ADULT_TRAINING');

const optOut = resolveRequestWithContext('Présentation sur la Martinique sans identité EPN.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(optOut.brand, null); assert.strictEqual(optOut.presetUsed, 'GENERAL_PRESENTATION');

const none = resolveRequestWithContext('Atelier senior sur WhatsApp.', null);
assert.strictEqual(none.brand, null); assert.strictEqual(none.presetUsed, 'GENERAL_PRESENTATION');

const projection = resolveRequestWithContext('Atelier senior uniquement la présentation.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(projection.deliveryMode, 'PRESENTATION'); assert.strictEqual(projection.resolutionTrace.sources.deliveryMode, 'EXPLICIT');

const otherBrand = resolveRequestWithContext('Atelier senior.', 'EPN_RIVIERE_SALEE_CONTEXT', { explicit: { brand: 'OTHER_BRAND' } });
assert.strictEqual(otherBrand.brand, 'OTHER_BRAND'); assert.strictEqual(otherBrand.resolutionTrace.sources.brand, 'EXPLICIT');
assert.deepStrictEqual(senior.resolutionTrace.priority, ['EXPLICIT_USER', 'EXPLICIT_CONTEXT_OVERRIDE', 'ACTIVE_CONTEXT', 'PRESET', 'INFERENCE', 'DEFAULT']);
assert.ok(explainContextResolution(senior).includes('EPN preset family'));
const contextOverride = resolveRequestWithContext('Atelier senior.', 'EPN_RIVIERE_SALEE_CONTEXT', { contextOverrides: { deliveryMode: 'HANDOUT' } });
assert.strictEqual(contextOverride.deliveryMode, 'HANDOUT'); assert.strictEqual(contextOverride.resolutionTrace.sources.deliveryMode, 'CONTEXT_OVERRIDE');
const userBeatsContext = resolveRequestWithContext('Atelier senior uniquement la présentation.', 'EPN_RIVIERE_SALEE_CONTEXT', { contextOverrides: { deliveryMode: 'HANDOUT' } });
assert.strictEqual(userBeatsContext.deliveryMode, 'PRESENTATION'); assert.strictEqual(userBeatsContext.resolutionTrace.sources.deliveryMode, 'EXPLICIT');
console.log('Context Layer assertions passed');
