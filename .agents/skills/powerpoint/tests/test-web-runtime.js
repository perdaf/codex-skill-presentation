#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  actionForKey,
  createNavigationState,
  reduceNavigationState,
} = require('../assets/web-presentation-runtime');

assert.strictEqual(actionForKey('ArrowRight'), 'NEXT');
assert.strictEqual(actionForKey('ArrowLeft'), 'PREVIOUS');
assert.strictEqual(actionForKey(' '), 'NEXT');
assert.strictEqual(actionForKey('Home'), 'FIRST');
assert.strictEqual(actionForKey('End'), 'LAST');
assert.strictEqual(actionForKey('f'), 'FULLSCREEN');
assert.strictEqual(actionForKey('x'), null);

let state = createNavigationState(3, 0, [2, 0, 0]);
state = reduceNavigationState(state, 'NEXT');
assert.strictEqual(state.currentIndex, 0);
assert.strictEqual(state.pendingPerSlide[0], 1);
state = reduceNavigationState(state, 'NEXT');
assert.strictEqual(state.currentIndex, 0);
state = reduceNavigationState(state, 'NEXT');
assert.strictEqual(state.currentIndex, 1);
state = reduceNavigationState(state, 'NEXT');
assert.strictEqual(state.currentIndex, 2);
state = reduceNavigationState(state, 'PREVIOUS');
assert.strictEqual(state.currentIndex, 1);
state = reduceNavigationState(state, 'FIRST');
assert.strictEqual(state.currentIndex, 0);
state = reduceNavigationState(state, 'LAST');
assert.strictEqual(state.currentIndex, 2);

console.log('V4.6 keyboard navigation and progressive state-machine assertions passed');
