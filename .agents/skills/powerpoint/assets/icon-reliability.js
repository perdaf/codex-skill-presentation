'use strict';

const ICON_TYPES = Object.freeze(['PEDAGOGICAL_OBJECT', 'FUNCTIONAL_ICON', 'ABSTRACT_CUSTOM_ICON']);
const ICON_RECOGNIZABILITY = Object.freeze(['CLEAR', 'ACCEPTABLE_WITH_LABEL', 'AMBIGUOUS', 'UNRECOGNIZABLE']);
const UNIVERSAL_SYMBOLS = new Set(['LOCK', 'PADLOCK', 'CAMERA', 'PHONE', 'MAGNIFIER', 'ARROW', 'STOP', 'WIFI', 'EYE', 'EYE_OFF']);
const CONCRETE_OBJECTS = new Set(['SMARTPHONE', 'COMPUTER', 'LAPTOP', 'FILE', 'PHOTO', 'FOLDER', 'FORM', 'KEYBOARD', 'DOCUMENT']);

function assessIconRecognizability(input = {}) {
  const iconType = String(input.iconType || 'FUNCTIONAL_ICON').toUpperCase();
  if (!ICON_TYPES.includes(iconType)) throw new RangeError(`Unknown icon type: ${input.iconType}`);
  const symbol = String(input.symbol || '').toUpperCase();
  const profile = String(input.profile || '').toUpperCase();
  const functional = input.functional !== false;
  let iconRecognizability = 'AMBIGUOUS';
  if (iconType === 'PEDAGOGICAL_OBJECT' && (CONCRETE_OBJECTS.has(symbol) || input.immediatelyRecognizable === true)) iconRecognizability = 'CLEAR';
  else if (iconType === 'FUNCTIONAL_ICON' && UNIVERSAL_SYMBOLS.has(symbol)) iconRecognizability = symbol === 'EYE_OFF' ? 'ACCEPTABLE_WITH_LABEL' : 'CLEAR';
  else if (iconType === 'FUNCTIONAL_ICON' && input.standardVector === true) iconRecognizability = input.hasLabel ? 'ACCEPTABLE_WITH_LABEL' : 'CLEAR';
  else if (iconType === 'ABSTRACT_CUSTOM_ICON') iconRecognizability = input.recognizableConvention === true ? 'ACCEPTABLE_WITH_LABEL' : 'AMBIGUOUS';
  if (input.unrecognizable === true) iconRecognizability = 'UNRECOGNIZABLE';
  const reviewRequired = functional && (['AMBIGUOUS', 'UNRECOGNIZABLE'].includes(iconRecognizability) || (profile === 'SENIOR' && iconRecognizability === 'ACCEPTABLE_WITH_LABEL' && !input.hasLabel));
  return { iconType, iconRecognizability, reviewRequired, labelRequired: profile === 'SENIOR' && functional };
}

module.exports = { ICON_TYPES, ICON_RECOGNIZABILITY, UNIVERSAL_SYMBOLS, CONCRETE_OBJECTS, assessIconRecognizability };
