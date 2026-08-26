'use strict';

const contextLayer = require('./context-layer');
const visualIntelligence = require('./visual-intelligence');
const visualBibleModule = require('./visual-bible');
const runtimeModule = require('./image-generation-runtime');

const REQUIRED_CONFIG_FIELDS = Object.freeze([
  'context', 'presetUsed', 'brand', 'profile', 'contentDepth',
  'deliveryMode', 'pageBudget', 'audienceRepresentation',
]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function validateResolvedConfiguration(config) {
  if (!config || typeof config !== 'object') return REQUIRED_CONFIG_FIELDS.slice();
  return REQUIRED_CONFIG_FIELDS.filter((field) => !hasOwn(config, field));
}

function blocked(code, details = {}) {
  return Object.freeze({ status: 'BLOCKED', code, ...details });
}

function createMandatoryPipeline(overrides = {}) {
  const dependencies = {
    resolveRequestWithContext: contextLayer.resolveRequestWithContext,
    classifyVisual: visualIntelligence.classifyVisual,
    buildCompositionAwarePrompt: visualIntelligence.buildCompositionAwarePrompt,
    createVisualBible: visualBibleModule.createVisualBible,
    createVisualManifest: visualBibleModule.createVisualManifest,
    resolveRasterGeneration: runtimeModule.resolveRasterGeneration,
    ...overrides,
  };

  function prepareImageAsset(input = {}) {
    let config = input.resolvedConfiguration || null;
    let configurationSource = 'STRUCTURED_CONFIG';
    if (!config) {
      if (typeof dependencies.resolveRequestWithContext !== 'function') {
        return blocked('MANDATORY_STEP_UNAVAILABLE', { missingSteps: ['resolveRequestWithContext'] });
      }
      config = dependencies.resolveRequestWithContext(input.request, input.activeContext ?? null, input.resolveOptions || {});
      configurationSource = 'RESOLVER';
    }

    const missingConfigFields = validateResolvedConfiguration(config);
    if (missingConfigFields.length) return blocked('INCOMPLETE_RESOLVED_CONFIGURATION', { missingConfigFields });

    const requiredFunctions = ['classifyVisual', 'createVisualBible', 'createVisualManifest', 'buildCompositionAwarePrompt', 'resolveRasterGeneration'];
    const missingSteps = requiredFunctions.filter((name) => typeof dependencies[name] !== 'function');
    if (missingSteps.length) return blocked('MANDATORY_STEP_UNAVAILABLE', { missingSteps });

    const visual = input.visual || {};
    const classification = dependencies.classifyVisual(visual.visualRole || 'DECORATIVE', visual);
    const bible = dependencies.createVisualBible({
      ...visual,
      brand: config.brand,
      profile: config.profile,
      contentDepth: config.contentDepth,
      deliveryMode: config.deliveryMode,
      audienceRepresentation: config.audienceRepresentation,
      hasPeople: config.humanRepresentationEnabled === false ? false : visual.hasPeople === true,
      visualRole: classification.visualRole,
    });
    const manifest = dependencies.createVisualManifest([{
      id: visual.id || 'asset',
      location: visual.location || 'UNSPECIFIED',
      purpose: visual.purpose || visual.subject || 'Presentation visual',
      visualRole: classification.visualRole,
      visualOpportunity: visual.visualOpportunity,
      reason: visual.reason || 'Resolved through mandatory execution pipeline',
      composition: visual.composition,
    }]);

    const isHumanEditorial = classification.visualRole === 'EDITORIAL_SCENE'
      && config.humanRepresentationEnabled !== false
      && visual.hasPeople === true;
    if (isHumanEditorial && config.audienceRepresentation && !bible.HUMAN_REPRESENTATION) {
      return blocked('MISSING_HUMAN_REPRESENTATION', {
        audienceRepresentation: config.audienceRepresentation,
        visualRole: classification.visualRole,
      });
    }

    const prompt = dependencies.buildCompositionAwarePrompt(
      visual.subject || visual.purpose || 'presentation scene',
      visual.composition || {},
      {
        ...(visual.artDirection || {}),
        hasPeople: isHumanEditorial,
        audienceRepresentation: bible.AUDIENCE_REPRESENTATION || null,
      },
    );
    const humanPromptMarker = bible.HUMAN_REPRESENTATION?.split(' representation')[0];
    if (isHumanEditorial && humanPromptMarker && !prompt.includes(humanPromptMarker)) {
      return blocked('HUMAN_REPRESENTATION_NOT_IN_PROMPT', { humanRepresentation: bible.HUMAN_REPRESENTATION });
    }

    const runtime = dependencies.resolveRasterGeneration(input.runtime || {});
    const trace = Object.freeze({
      CONTEXT: config.context || 'NONE',
      PRESET: config.presetUsed,
      BRAND: config.brand || 'NONE',
      PROFILE: config.profile,
      CONTENT_DEPTH: config.contentDepth,
      DELIVERY_MODE: config.deliveryMode,
      AUDIENCE_REPRESENTATION: bible.AUDIENCE_REPRESENTATION || 'NONE',
      VISUAL_ROLE: classification.visualRole,
      IMAGE_METHOD: classification.imageMethod,
      HUMAN_REPRESENTATION: bible.HUMAN_REPRESENTATION || 'NONE',
      RUNTIME_CAPABILITY: runtime.capability || runtime.mode,
      RUNTIME_PROVIDER: runtime.runtimeTool || 'NONE',
    });

    return Object.freeze({
      status: 'READY', configurationSource, resolvedConfiguration: config,
      classification, visualBible: bible, visualManifest: manifest,
      finalPrompt: prompt, runtime, trace,
    });
  }

  return Object.freeze({ prepareImageAsset });
}

const prepareImageAsset = createMandatoryPipeline().prepareImageAsset;

module.exports = { REQUIRED_CONFIG_FIELDS, validateResolvedConfiguration, createMandatoryPipeline, prepareImageAsset };
