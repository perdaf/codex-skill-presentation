#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  CAPABILITIES,
  RASTER_MODES,
  resolveRasterGeneration,
} = require('../assets/image-generation-runtime');
const { classifyVisual } = require('../assets/visual-intelligence');

function resolve(options) {
  return resolveRasterGeneration({ networkPermission: 'DENIED', ...options });
}

assert.strictEqual(resolve({ callableTools: ['imagegen'] }).mode, RASTER_MODES.NATIVE_IMAGE_GENERATION);
assert.strictEqual(resolve({ callableTools: ['default_api:generate_image'] }).mode, RASTER_MODES.NATIVE_IMAGE_GENERATION);

const otherRuntime = resolve({
  providers: [{
    name: 'future_runtime.render_bitmap',
    callable: true,
    capabilities: [CAPABILITIES.NATIVE_IMAGE_GENERATION],
  }],
});
assert.strictEqual(otherRuntime.mode, RASTER_MODES.NATIVE_IMAGE_GENERATION);
assert.strictEqual(otherRuntime.runtimeTool, 'future_runtime.render_bitmap');

assert.strictEqual(resolve({
  hasOpenAiApiKey: true,
  networkPermission: 'ALLOWED',
}).mode, RASTER_MODES.OPENAI_API_FALLBACK);

assert.strictEqual(resolve({
  hasOpenAiApiKey: false,
  networkPermission: 'ALLOWED',
}).mode, RASTER_MODES.NO_RASTER_GENERATION);

const restricted = resolve({
  hasOpenAiApiKey: true,
  networkPermission: 'REQUIRES_AUTHORIZATION',
});
assert.strictEqual(restricted.mode, RASTER_MODES.NO_RASTER_GENERATION);
assert.strictEqual(restricted.permissionAction, 'USE_RUNTIME_NORMAL_AUTHORIZATION_OR_ABORT');
assert.ok(!JSON.stringify(restricted).includes('BypassSandbox'));
const resolverSource = fs.readFileSync(path.join(__dirname, '..', 'assets', 'image-generation-runtime.js'), 'utf8');
assert.ok(!resolverSource.includes('BypassSandbox'));

const editorial = classifyVisual('EDITORIAL_SCENE');
assert.strictEqual(editorial.imageMethod, 'IMAGEGEN');
assert.strictEqual(editorial.allowImageGen, true);
assert.notStrictEqual(editorial.imageMethod, 'POWERPOINT');

console.log('Cross-runtime image-generation assertions passed');
