'use strict';

const epn = require('./epn-riviere-salee');
const CONTEXTS = Object.freeze({ [epn.id]: epn });

function resolveContext(value) {
  if (value === null || value === undefined || String(value).trim().toUpperCase() === 'NONE') return null;
  if (typeof value === 'object' && value.id) return value;
  const key = String(value).trim().toUpperCase();
  if (!CONTEXTS[key]) throw new RangeError(`Unknown context: ${value}`);
  return CONTEXTS[key];
}

module.exports = { CONTEXTS, contextNames: Object.freeze(Object.keys(CONTEXTS)), resolveContext };
