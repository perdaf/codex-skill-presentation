'use strict';

const CONNECTOR_RESULTS = Object.freeze(['VALID', 'REVIEW', 'INVALID']);
const DIRECTIONS = Object.freeze(['TO_TARGET', 'FROM_TARGET', 'BIDIRECTIONAL', 'UNDIRECTED']);

function pointToBoxDistance(point, box) {
  const dx = Math.max(box.x - point.x, 0, point.x - (box.x + box.w));
  const dy = Math.max(box.y - point.y, 0, point.y - (box.y + box.h));
  return Math.hypot(dx, dy);
}

function validateConnector(connector, objects = [], options = {}) {
  const tolerance = Number(options.tolerance ?? 0.16);
  const target = objects.find((item) => item.id === connector.targetId);
  const source = objects.find((item) => item.id === connector.sourceId);
  const issues = [];
  if (!source || !target) return { status: 'INVALID', issues: ['MISSING_SOURCE_OR_TARGET'], targetDistance: Infinity };
  const end = connector.end || { x: connector.x2, y: connector.y2 };
  const targetDistance = pointToBoxDistance(end, target);
  if (targetDistance > tolerance) issues.push('ENDPOINT_DISCONNECTED');
  const otherDistances = objects.filter((item) => item.id !== target.id && item.id !== source.id).map((item) => ({ id: item.id, distance: pointToBoxDistance(end, item) })).sort((a,b) => a.distance-b.distance);
  if (otherDistances[0] && otherDistances[0].distance + tolerance / 2 < targetDistance) issues.push('CLOSER_TO_WRONG_TARGET');
  if (connector.direction && !DIRECTIONS.includes(connector.direction)) issues.push('AMBIGUOUS_DIRECTION');
  if (connector.expectedDirection && connector.direction !== connector.expectedDirection) issues.push('WRONG_DIRECTION');
  if (connector.unnecessaryCrossing === true) issues.push('UNNECESSARY_CROSSING');
  if (connector.crossesText === true) issues.push('CROSSES_TEXT');
  const nearestOtherDistance = otherDistances[0]?.distance ?? Infinity;
  const invalid = issues.includes('ENDPOINT_DISCONNECTED') && nearestOtherDistance > tolerance;
  return { status: invalid ? 'INVALID' : issues.length ? 'REVIEW' : 'VALID', issues, targetDistance };
}

function validateConnectors(connectors = [], objects = [], options = {}) {
  const results = connectors.map((connector) => ({ id: connector.id, ...validateConnector(connector, objects, options) }));
  return { results, passed: results.every((result) => result.status === 'VALID'), reviewRequired: results.some((result) => result.status !== 'VALID') };
}

module.exports = { CONNECTOR_RESULTS, DIRECTIONS, pointToBoxDistance, validateConnector, validateConnectors };
