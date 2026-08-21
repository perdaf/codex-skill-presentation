'use strict';

module.exports = Object.freeze({
  id: 'EPN_RIVIERE_SALEE_CONTEXT',
  organizationName: 'EPN de Rivière-Salée',
  defaultBrand: 'EPN_RIVIERE_SALEE',
  presetFamily: Object.freeze({
    SENIOR: 'EPN_SENIOR_COURSE',
    KIDS: 'EPN_KIDS_WORKSHOP',
    ADULT: 'EPN_ADULT_TRAINING',
  }),
  defaultTeachingBehavior: 'USE_AUDIENCE_APPROPRIATE_EPN_PRESET_FOR_COURSE_OR_WORKSHOP',
});
