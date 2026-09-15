'use strict';

const CAPABILITIES = Object.freeze({
  NATIVE_IMAGE_GENERATION: 'NATIVE_IMAGE_GENERATION',
});

const RASTER_MODES = Object.freeze({
  NATIVE_IMAGE_GENERATION: 'NATIVE_IMAGE_GENERATION',
  OPENAI_API_FALLBACK: 'OPENAI_API_FALLBACK',
  NO_RASTER_GENERATION: 'NO_RASTER_GENERATION',
});

const KNOWN_NATIVE_TOOL_NAMES = Object.freeze([
  'imagegen',
  'default_api:generate_image',
]);

function normalizeProvider(provider) {
  if (typeof provider === 'string') {
    return {
      name: provider,
      callable: true,
      capabilities: KNOWN_NATIVE_TOOL_NAMES.includes(provider)
        ? [CAPABILITIES.NATIVE_IMAGE_GENERATION]
        : [],
    };
  }

  const capabilities = Array.isArray(provider && provider.capabilities)
    ? provider.capabilities.map((capability) => String(capability).toUpperCase())
    : [];
  return {
    name: String((provider && provider.name) || ''),
    callable: provider && provider.callable !== false,
    capabilities,
  };
}

function findNativeImageProvider(providers = []) {
  return providers
    .map(normalizeProvider)
    .find((provider) => provider.callable
      && provider.capabilities.includes(CAPABILITIES.NATIVE_IMAGE_GENERATION)) || null;
}

function resolveRasterGeneration(options = {}) {
  const providers = options.providers || options.callableTools || [];
  const nativeProvider = findNativeImageProvider(providers);

  if (nativeProvider) {
    return {
      mode: RASTER_MODES.NATIVE_IMAGE_GENERATION,
      capability: CAPABILITIES.NATIVE_IMAGE_GENERATION,
      runtimeTool: nativeProvider.name,
      apiFallbackEligible: false,
      permissionAction: 'NONE',
    };
  }

  const apiFallbackEligible = options.hasOpenAiApiKey === true
    && options.networkPermission === 'ALLOWED';
  if (apiFallbackEligible) {
    return {
      mode: RASTER_MODES.OPENAI_API_FALLBACK,
      capability: null,
      runtimeTool: 'scripts/generate-image.js',
      apiFallbackEligible: true,
      permissionAction: 'NONE',
    };
  }

  return {
    mode: RASTER_MODES.NO_RASTER_GENERATION,
    capability: null,
    runtimeTool: null,
    apiFallbackEligible: false,
    permissionAction: options.networkPermission === 'REQUIRES_AUTHORIZATION'
      ? 'USE_RUNTIME_NORMAL_AUTHORIZATION_OR_ABORT'
      : 'NONE',
  };
}

module.exports = {
  CAPABILITIES,
  RASTER_MODES,
  KNOWN_NATIVE_TOOL_NAMES,
  findNativeImageProvider,
  resolveRasterGeneration,
};
