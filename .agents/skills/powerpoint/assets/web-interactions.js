'use strict';

const INTERACTION_METHODS = Object.freeze([
  'STATIC', 'REVEAL', 'HIGHLIGHT', 'STEP_SEQUENCE', 'BEFORE_AFTER', 'QUIZ_REVEAL',
]);
const PROGRESSIVE_DISCLOSURE = Object.freeze(['AUTO', 'ENABLED', 'DISABLED']);

function enumValue(value, allowed, fallback, label) {
  const normalized = String(value || fallback).trim().toUpperCase();
  if (!allowed.includes(normalized)) throw new RangeError(`${label} must be one of: ${allowed.join(', ')}`);
  return normalized;
}

function normalizeInteractionMethod(value = 'STATIC') {
  return enumValue(value, INTERACTION_METHODS, 'STATIC', 'INTERACTION_METHOD');
}

function normalizeProgressiveDisclosure(value = 'AUTO') {
  if (value === true) return 'ENABLED';
  if (value === false) return 'DISABLED';
  return enumValue(value, PROGRESSIVE_DISCLOSURE, 'AUTO', 'PROGRESSIVE_DISCLOSURE');
}

function resolveInteractionMethod(input = {}) {
  const explicit = input.interactionMethod ? normalizeInteractionMethod(input.interactionMethod) : null;
  const disclosure = normalizeProgressiveDisclosure(input.progressiveDisclosure);
  const kind = String(input.kind || input.conceptType || '').trim().toUpperCase();
  const stepCount = Number(input.stepCount || 0);
  let interactionMethod = explicit || 'STATIC';
  let reason = explicit ? 'explicit interaction method' : 'no material pedagogical benefit identified';

  if (!explicit) {
    if (['QUIZ', 'QUESTION', 'EXERCISE'].includes(kind) && input.hasRevealableAnswer !== false) {
      interactionMethod = 'QUIZ_REVEAL'; reason = 'revealing the answer supports active recall';
    } else if (kind === 'BEFORE_AFTER') {
      interactionMethod = 'BEFORE_AFTER'; reason = 'controlled comparison makes the change perceptible';
    } else if (['PROCEDURE', 'PROCESS', 'SEQUENCE'].includes(kind) && stepCount > 1 && disclosure !== 'DISABLED') {
      interactionMethod = 'STEP_SEQUENCE'; reason = 'ordered disclosure reduces simultaneous cognitive load';
    } else if (input.focusTarget) {
      interactionMethod = 'HIGHLIGHT'; reason = 'temporary emphasis directs attention to the named element';
    } else if (disclosure === 'ENABLED' && Number(input.itemCount || 0) > 1) {
      interactionMethod = 'REVEAL'; reason = 'explicit progressive disclosure request';
    }
  }

  const progressiveDisclosure = ['REVEAL', 'STEP_SEQUENCE'].includes(interactionMethod) ? 'ENABLED' : disclosure;
  const profile = String(input.profile || '').trim().toUpperCase();
  return Object.freeze({
    interactionMethod,
    progressiveDisclosure,
    reason,
    pedagogical: interactionMethod !== 'STATIC',
    seniorConstraints: profile === 'SENIOR' ? Object.freeze({
      minClickTargetPx: 48,
      animationDurationMs: 700,
      complexGestures: false,
      essentialInformationAnimationOnly: false,
      navigationAlwaysVisible: true,
    }) : null,
  });
}

function extendVisualDecision(visualDecision = {}, interactionInput = {}) {
  return Object.freeze({ ...visualDecision, ...resolveInteractionMethod(interactionInput) });
}

module.exports = {
  INTERACTION_METHODS,
  PROGRESSIVE_DISCLOSURE,
  normalizeInteractionMethod,
  normalizeProgressiveDisclosure,
  resolveInteractionMethod,
  extendVisualDecision,
};
