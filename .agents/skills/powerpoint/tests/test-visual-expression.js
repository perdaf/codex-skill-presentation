#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { assessVisualOpportunity, classifyVisual, resolveVisualExpression, assessReadSeeBalance, assessProjectionRichness } = require('../assets/visual-intelligence');

let r = assessProjectionRichness({kind:'CONVERSATION_ZONES',visualOpportunity:'HIGH',visualRole:'DIAGRAM',imageMethod:'POWERPOINT',hasObjectRepresentation:true,hasSpatialMeaning:true,objectCount:1,textBlockCount:4});
assert.ok(['DEVICE_MODEL','SPATIAL_DIAGRAM'].includes(r.visualExpression)); assert.ok(['BALANCED','SEE_FIRST'].includes(r.readSeeBalance)); assert.strictEqual(r.reviewRequired,false); assert.notStrictEqual(r.visualExpression,'TEXT_LED');
r = assessProjectionRichness({kind:'PROCESS',visualRole:'PROCESS',objectCount:4,textBlockCount:4,hasSpatialMeaning:true}); assert.strictEqual(r.visualExpression,'STEP_FLOW'); assert.ok(['BALANCED','SEE_FIRST'].includes(r.readSeeBalance));
r = assessProjectionRichness({kind:'COMPARISON',hasClearRelationship:true,hasObjectMovement:true,visualRole:'DIAGRAM',hasObjectRepresentation:true,objectCount:3,textBlockCount:3}); assert.ok(['OBJECT_FLOW','COMPARISON'].includes(r.visualExpression)); assert.ok(['BALANCED','SEE_FIRST'].includes(r.readSeeBalance));
assert.strictEqual(classifyVisual('EDITORIAL_SCENE').imageMethod,'IMAGEGEN'); assert.strictEqual(resolveVisualExpression({visualRole:'EDITORIAL_SCENE'}).visualExpression,'HUMAN_CONTEXT_SCENE');
r = assessProjectionRichness({kind:'PLAIN_STATEMENT',visualOpportunity:'LOW',visualRole:'DIAGRAM',visualExpression:'TEXT_LED',textBlockCount:1}); assert.strictEqual(r.readSeeBalance,'READ_MOSTLY'); assert.strictEqual(r.reviewRequired,false);
assert.strictEqual(classifyVisual('DATA_VISUALIZATION').imageMethod,'POWERPOINT_CHART'); assert.strictEqual(resolveVisualExpression({visualRole:'DATA_VISUALIZATION'}).visualExpression,'DATA_CHART');
r = assessProjectionRichness({kind:'SHORT_DEFINITION',visualOpportunity:'LOW',visualRole:'DIAGRAM',visualExpression:'TEXT_LED',textBlockCount:2}); assert.strictEqual(r.reviewRequired,false);
assert.strictEqual(assessVisualOpportunity({kind:'PROCESS',audience:'SENIOR',stepCount:9}).recommendation,'SIMPLIFY_OR_SEGMENT');
r = assessProjectionRichness({visualOpportunity:'HIGH',visualRole:'PROCESS',visualExpression:'TEXT_LED',textBlockCount:6,deliveryMode:'PRESENTATION'}); assert.strictEqual(r.reviewRequired,true); assert.strictEqual(r.projectionRichness,'INSUFFICIENT');
console.log('Visual Expression assertions passed');
