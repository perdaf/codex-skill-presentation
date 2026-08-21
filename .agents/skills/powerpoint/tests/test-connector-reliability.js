#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { validateConnector, validateConnectors } = require('../assets/connector-reliability');
const objects = [
  { id: 'label', x: 0, y: 0, w: 1, h: .4 },
  { id: 'name', x: 3, y: 1, w: 2, h: .5 },
  { id: 'messages', x: 3, y: 2, w: 2, h: 1 },
  { id: 'entry', x: 3, y: 3.4, w: 2, h: .5 },
  { id: 'actions', x: 3, y: 4.2, w: 2, h: .5 },
];
assert.strictEqual(validateConnector({ id: 'ok', sourceId: 'label', targetId: 'name', end: { x: 3, y: 1.25 }, direction: 'TO_TARGET' }, objects).status, 'VALID');
assert.strictEqual(validateConnector({ id: 'empty', sourceId: 'label', targetId: 'name', end: { x: 7, y: 6 }, direction: 'TO_TARGET' }, objects).status, 'INVALID');
assert.strictEqual(validateConnector({ id: 'wrong-neighbor', sourceId: 'label', targetId: 'name', end: { x: 3, y: 2.3 }, direction: 'TO_TARGET' }, objects).status, 'REVIEW');
assert.strictEqual(validateConnector({ id: 'direction', sourceId: 'label', targetId: 'name', end: { x: 3, y: 1.2 }, direction: 'FROM_TARGET', expectedDirection: 'TO_TARGET' }, objects).status, 'REVIEW');
assert.strictEqual(validateConnector({ id: 'crossing', sourceId: 'label', targetId: 'name', end: { x: 3, y: 1.2 }, direction: 'TO_TARGET', unnecessaryCrossing: true }, objects).status, 'REVIEW');
const phone = validateConnectors([
  { id: 'a', sourceId: 'label', targetId: 'name', end: { x: 3, y: 1.2 }, direction: 'TO_TARGET' },
  { id: 'b', sourceId: 'label', targetId: 'messages', end: { x: 3, y: 2.4 }, direction: 'TO_TARGET' },
  { id: 'c', sourceId: 'label', targetId: 'entry', end: { x: 3, y: 3.6 }, direction: 'TO_TARGET' },
  { id: 'd', sourceId: 'label', targetId: 'actions', end: { x: 3, y: 4.4 }, direction: 'TO_TARGET' },
], objects);
assert.strictEqual(phone.passed, true);
console.log('Connector Reliability assertions passed');
