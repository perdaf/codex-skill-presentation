#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { createMandatoryPipeline, prepareImageAsset } = require('../assets/mandatory-pipeline');

const request = 'Atelier senior sur les photos.';
const visual = {
  id: 'workshop-scene', location: 'slide:2', purpose: 'Show the workshop audience',
  subject: 'adults learning to organize smartphone photos', visualRole: 'EDITORIAL_SCENE',
  visualOpportunity: 'HIGH', hasPeople: true,
};

const codex = prepareImageAsset({
  request, activeContext: 'EPN_RIVIERE_SALEE_CONTEXT', visual,
  runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(codex.status, 'READY');
assert.strictEqual(codex.configurationSource, 'RESOLVER');
assert.strictEqual(codex.resolvedConfiguration.context, 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(codex.trace.AUDIENCE_REPRESENTATION, 'MARTINIQUE');
assert.ok(codex.visualBible.HUMAN_REPRESENTATION.includes('Afro-Caribbean'));
assert.ok(codex.finalPrompt.includes('contemporary Martinican / Afro-Caribbean'));

const explicit = prepareImageAsset({
  request: 'Atelier pour un public japonais.', activeContext: 'EPN_RIVIERE_SALEE_CONTEXT', visual,
  runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(explicit.resolvedConfiguration.audienceRepresentation, 'JAPANESE');
assert.ok(explicit.finalPrompt.includes('japanese'));
assert.ok(!explicit.finalPrompt.includes('Martinican'));

const noCharacters = prepareImageAsset({
  request: 'Atelier senior, aucun personnage.', activeContext: 'EPN_RIVIERE_SALEE_CONTEXT',
  visual: { ...visual, hasPeople: true }, runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(noCharacters.status, 'READY');
assert.strictEqual(noCharacters.trace.HUMAN_REPRESENTATION, 'NONE');
assert.ok(!noCharacters.finalPrompt.includes('Human representation:'));

const nonHuman = prepareImageAsset({
  request, activeContext: 'EPN_RIVIERE_SALEE_CONTEXT',
  visual: { ...visual, subject: 'a smartphone and organized photo folders', hasPeople: false },
  runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(nonHuman.trace.HUMAN_REPRESENTATION, 'NONE');
assert.ok(!hasOwn(nonHuman.visualBible, 'HUMAN_REPRESENTATION'));

const providers = ['imagegen', 'default_api:generate_image'].map((runtimeTool) => prepareImageAsset({
  request, activeContext: 'EPN_RIVIERE_SALEE_CONTEXT', visual,
  runtime: { callableTools: [runtimeTool] },
}));
assert.deepStrictEqual(providers[0].resolvedConfiguration, providers[1].resolvedConfiguration);
assert.deepStrictEqual(providers[0].visualBible, providers[1].visualBible);
assert.strictEqual(providers[0].finalPrompt, providers[1].finalPrompt);
assert.notStrictEqual(providers[0].trace.RUNTIME_PROVIDER, providers[1].trace.RUNTIME_PROVIDER);

const missingResolver = createMandatoryPipeline({ resolveRequestWithContext: null }).prepareImageAsset({ request, visual });
assert.strictEqual(missingResolver.status, 'BLOCKED');
assert.strictEqual(missingResolver.code, 'MANDATORY_STEP_UNAVAILABLE');
assert.deepStrictEqual(missingResolver.missingSteps, ['resolveRequestWithContext']);

const structuredRecovery = createMandatoryPipeline({ resolveRequestWithContext: null }).prepareImageAsset({
  resolvedConfiguration: codex.resolvedConfiguration, visual,
  runtime: { callableTools: ['imagegen'] },
});
assert.strictEqual(structuredRecovery.status, 'READY');
assert.strictEqual(structuredRecovery.configurationSource, 'STRUCTURED_CONFIG');

function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object, key); }
console.log('Mandatory execution pipeline assertions passed');
