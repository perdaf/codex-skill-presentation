#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { resolveRequestWithContext } = require('../assets/context-layer');
const { createVisualBible, visualBibleToMarkdown } = require('../assets/visual-bible');
const { buildCompositionAwarePrompt } = require('../assets/visual-intelligence');
const { resolveRasterGeneration, RASTER_MODES } = require('../assets/image-generation-runtime');

const epn = resolveRequestWithContext('Atelier senior sur les photos.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(epn.audienceRepresentation, 'MARTINIQUE');

const none = resolveRequestWithContext('Atelier senior sur les photos.', 'NONE');
assert.strictEqual(none.audienceRepresentation, null);

const explicit = resolveRequestWithContext('Atelier pour un public japonais.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(explicit.audienceRepresentation, 'JAPANESE');
assert.strictEqual(explicit.resolutionTrace.audienceRepresentation.source, 'EXPLICIT_USER');

const noCharacters = resolveRequestWithContext('Atelier senior, aucun personnage.', 'EPN_RIVIERE_SALEE_CONTEXT');
assert.strictEqual(noCharacters.audienceRepresentation, null);
assert.strictEqual(noCharacters.humanRepresentationEnabled, false);

const bible = createVisualBible({ visualRole: 'EDITORIAL_SCENE', hasPeople: true, audienceRepresentation: epn.audienceRepresentation });
assert.strictEqual(bible.AUDIENCE_REPRESENTATION, 'MARTINIQUE');
assert.ok(bible.HUMAN_REPRESENTATION.includes('Afro-Caribbean'));
assert.ok(visualBibleToMarkdown(bible).includes('AUDIENCE_REPRESENTATION: MARTINIQUE'));

const editorialPrompt = buildCompositionAwarePrompt('adults learning to use a smartphone', {}, {
  hasPeople: true,
  audienceRepresentation: epn.audienceRepresentation,
});
assert.ok(editorialPrompt.includes('contemporary Martinican / Afro-Caribbean'));
assert.ok(editorialPrompt.includes('Avoid artificial casting'));

for (const visualRole of ['DIAGRAM', 'PROCESS']) {
  const noPeopleBible = createVisualBible({ visualRole, hasPeople: false, audienceRepresentation: epn.audienceRepresentation });
  assert.ok(!Object.prototype.hasOwnProperty.call(noPeopleBible, 'AUDIENCE_REPRESENTATION'));
  assert.ok(!visualBibleToMarkdown(noPeopleBible).includes('MARTINIQUE'));
}

const prompts = ['imagegen', 'default_api:generate_image'].map((runtimeTool) => {
  const runtime = resolveRasterGeneration({ callableTools: [runtimeTool] });
  assert.strictEqual(runtime.mode, RASTER_MODES.NATIVE_IMAGE_GENERATION);
  return buildCompositionAwarePrompt('a senior digital workshop', {}, { hasPeople: true, audienceRepresentation: epn.audienceRepresentation });
});
assert.strictEqual(prompts[0], prompts[1]);

console.log('Audience representation assertions passed');
