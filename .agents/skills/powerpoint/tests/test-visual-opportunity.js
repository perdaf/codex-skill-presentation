#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { assessVisualOpportunity, classifyVisual } = require('../assets/visual-intelligence');
const { createVisualBible, createVisualManifest, visualBibleToMarkdown } = require('../assets/visual-bible');

const opportunity = (input) => assessVisualOpportunity(input).visualOpportunity;
assert.strictEqual(opportunity({ kind: 'DIRECTION' }), 'HIGH'); // télécharger vs envoyer
assert.strictEqual(opportunity({ kind: 'PROCESS', stepCount: 6 }), 'HIGH');
assert.strictEqual(opportunity({ kind: 'BEFORE_AFTER' }), 'HIGH');
assert.strictEqual(opportunity({ kind: 'COMPARISON', hasClearRelationship: true }), 'HIGH');
assert.strictEqual(opportunity({ kind: 'COMPARISON', hasClearRelationship: false }), 'MEDIUM');
assert.strictEqual(opportunity({ kind: 'SHORT_DEFINITION' }), 'LOW');
assert.strictEqual(opportunity({ kind: 'QUOTE' }), 'LOW');
assert.strictEqual(opportunity({ kind: 'DATA' }), 'HIGH');
assert.strictEqual(assessVisualOpportunity({ kind: 'DATA' }).suggestedVisualRole, 'DATA_VISUALIZATION');
assert.strictEqual(classifyVisual('DATA_VISUALIZATION').imageMethod, 'POWERPOINT_CHART');
assert.strictEqual(opportunity({ kind: 'HUMAN_CONTEXT' }), 'HIGH');
assert.strictEqual(assessVisualOpportunity({ kind: 'HUMAN_CONTEXT' }).suggestedVisualRole, 'EDITORIAL_SCENE');
assert.strictEqual(classifyVisual('EDITORIAL_SCENE').imageMethod, 'IMAGEGEN');
assert.strictEqual(opportunity({ kind: 'ARBITRARY_LIST' }), 'LOW');
assert.notStrictEqual(classifyVisual('PROCESS').imageMethod, 'IMAGEGEN');
const seniorComplex = assessVisualOpportunity({ kind: 'PROCESS', audience: 'SENIOR', stepCount: 9 });
assert.strictEqual(seniorComplex.recommendation, 'SIMPLIFY_OR_SEGMENT');

const manifest = createVisualManifest();
manifest.add({ id: 'download-upload', location: 'projection:8', purpose: 'Comprendre le sens du fichier', kind: 'DIRECTION', reason: 'La direction porte le sens', status: 'BUILT' });
manifest.add({ id: 'cover', location: 'projection:1', purpose: 'Installer un contexte rassurant', kind: 'HUMAN_CONTEXT', visualRole: 'EDITORIAL_SCENE', reason: 'Scène humaine', composition: { layout: 'hero', textPosition: 'LEFT' } });
assert.strictEqual(manifest.entries[0].visualOpportunity, 'HIGH');
assert.strictEqual(manifest.entries[0].imageMethod, 'POWERPOINT');
assert.strictEqual(manifest.entries[1].imageMethod, 'IMAGEGEN');
const bible = createVisualBible({ brand: 'EPN_RIVIERE_SALEE', profile: 'SENIOR', visualRole: 'PROCESS', kind: 'DIRECTION' });
assert.strictEqual(bible.VISUAL_OPPORTUNITY, 'HIGH');
const markdown = visualBibleToMarkdown(bible, manifest);
['VISUAL_OPPORTUNITY: HIGH', 'VISUAL_ROLE: PROCESS', 'IMAGE_METHOD: POWERPOINT', 'download-upload'].forEach((part) => assert.ok(markdown.includes(part), part));
console.log('Visual Opportunity assertions passed');
