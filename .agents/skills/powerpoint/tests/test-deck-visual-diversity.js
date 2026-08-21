#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { assessDeckVisualDiversity } = require('../assets/visual-intelligence');
const weak = Array.from({length:10},(_,i)=>({visualExpression:i<8?'TEXT_LED':'STEP_FLOW',textCardDominant:i<8,textBlockCount:5,imageMethod:'POWERPOINT',visualOpportunity:i<8?'HIGH':'MEDIUM',readSeeBalance:i<8?'READ_MOSTLY':'BALANCED'}));
const weakResult=assessDeckVisualDiversity(weak); assert.ok(weakResult.warnings.includes('REPETITIVE_TEXT_CARDS')); assert.ok(weakResult.warnings.includes('LOW_VISUAL_VARIETY')); assert.ok(weakResult.warnings.includes('HIGH_VISUAL_OPPORTUNITY_READ_MOSTLY'));
const rich=[
 {visualExpression:'HUMAN_CONTEXT_SCENE',imageMethod:'IMAGEGEN',readSeeBalance:'SEE_FIRST'},
 {visualExpression:'STEP_FLOW',imageMethod:'POWERPOINT',readSeeBalance:'BALANCED'},
 {visualExpression:'DEVICE_MODEL',imageMethod:'POWERPOINT',readSeeBalance:'SEE_FIRST'},
 {visualExpression:'OBJECT_FLOW',imageMethod:'POWERPOINT',readSeeBalance:'SEE_FIRST'},
 {visualExpression:'SCENARIO',imageMethod:'POWERPOINT',readSeeBalance:'BALANCED'},
 {visualExpression:'HUMAN_CONTEXT_SCENE',imageMethod:'IMAGEGEN',readSeeBalance:'SEE_FIRST'},
 {visualExpression:'ICON_SYSTEM',imageMethod:'VECTOR',readSeeBalance:'BALANCED'},
 {visualExpression:'TEXT_LED',imageMethod:'POWERPOINT',readSeeBalance:'READ_MOSTLY'}
];
const richResult=assessDeckVisualDiversity(rich); assert.ok(!richResult.warnings.includes('LOW_VISUAL_VARIETY')); assert.ok(!richResult.warnings.includes('IMAGEGEN_OVERUSE')); assert.ok(richResult.uniqueExpressions>=6);
const senior=assessDeckVisualDiversity([{profile:'SENIOR',simultaneousElements:9,visualExpression:'SPATIAL_DIAGRAM',readSeeBalance:'BALANCED'}]); assert.ok(senior.warnings.includes('SENIOR_VISUAL_OVERLOAD'));
console.log('Deck Visual Diversity assertions passed');
