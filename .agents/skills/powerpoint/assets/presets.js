'use strict';

const PRESETS = Object.freeze({
  EPN_SENIOR_COURSE: Object.freeze({
    id: 'EPN_SENIOR_COURSE', brand: 'EPN_RIVIERE_SALEE', profile: 'SENIOR', contentDepth: 'ULTRA_DETAILED',
    deliveryMode: 'DUAL', pageBudget: 'AUTO', researchStrategy: 'THOROUGH_WHEN_NEEDED',
  }),
  EPN_KIDS_WORKSHOP: Object.freeze({
    id: 'EPN_KIDS_WORKSHOP', brand: 'EPN_RIVIERE_SALEE', profile: 'KIDS', contentDepth: 'SIMPLE',
    deliveryMode: 'PRESENTATION', pageBudget: 'AUTO', researchStrategy: 'ONLY_WHEN_NEEDED',
  }),
  EPN_ADULT_TRAINING: Object.freeze({
    id: 'EPN_ADULT_TRAINING', brand: 'EPN_RIVIERE_SALEE', profile: 'EDUCATION', contentDepth: 'DETAILED',
    deliveryMode: 'DUAL', pageBudget: 'AUTO', researchStrategy: 'VERIFY_IMPORTANT_AND_VOLATILE',
  }),
  GENERAL_PRESENTATION: Object.freeze({
    id: 'GENERAL_PRESENTATION', brand: null, profile: 'AUTO_STYLE', contentDepth: 'SIMPLE',
    deliveryMode: 'PRESENTATION', pageBudget: 'AUTO', researchStrategy: 'ONLY_WHEN_NEEDED',
  }),
});

function getPreset(id) {
  const key = String(id || '').trim().toUpperCase();
  if (!PRESETS[key]) throw new RangeError(`Unknown preset: ${id}`);
  return PRESETS[key];
}

module.exports = { PRESETS, presetNames: Object.freeze(Object.keys(PRESETS)), getPreset };
