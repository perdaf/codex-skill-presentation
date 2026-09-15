'use strict';

const { createMandatoryPipeline } = require('./mandatory-pipeline');
const { resolveV46RequestWithContext } = require('./presentation-format');

function blocked(code, details = {}) {
  return Object.freeze({ status: 'BLOCKED', code, ...details });
}

function createV46MandatoryPipeline(overrides = {}) {
  const resolver = overrides.resolveV46RequestWithContext || resolveV46RequestWithContext;
  const baseOverrides = { ...overrides };
  delete baseOverrides.resolveV46RequestWithContext;
  const basePipeline = createMandatoryPipeline(baseOverrides);

  function resolveConfiguration(input = {}) {
    if (input.resolvedConfiguration) return input.resolvedConfiguration;
    if (typeof resolver !== 'function') return null;
    return resolver(input.request, input.activeContext ?? null, input.resolveOptions || {});
  }

  function prepareImageAsset(input = {}) {
    const config = resolveConfiguration(input);
    if (!config) return blocked('MANDATORY_STEP_UNAVAILABLE', { missingSteps: ['resolveV46RequestWithContext'] });
    if (config.requiresFormatClarification) {
      return blocked('PRESENTATION_FORMAT_CLARIFICATION_REQUIRED', {
        presentationFormat: 'AUTO',
        clarificationQuestion: config.clarificationQuestion,
        resolvedConfiguration: config,
      });
    }
    const prepared = basePipeline.prepareImageAsset({ ...input, resolvedConfiguration: config });
    if (prepared.status !== 'READY') return prepared;
    return Object.freeze({
      ...prepared,
      trace: Object.freeze({ ...prepared.trace, PRESENTATION_FORMAT: config.presentationFormat }),
    });
  }

  return Object.freeze({ resolveConfiguration, prepareImageAsset });
}

const pipeline = createV46MandatoryPipeline();

module.exports = {
  createV46MandatoryPipeline,
  resolveV46Configuration: pipeline.resolveConfiguration,
  prepareV46ImageAsset: pipeline.prepareImageAsset,
};
