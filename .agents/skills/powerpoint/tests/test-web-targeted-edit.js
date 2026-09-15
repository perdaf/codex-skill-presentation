#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  detectWebProject,
  createWebTargetedEditPlan,
  extractSlideSections,
  validateUntargetedSlidesPreserved,
} = require('../assets/web-targeted-edit');

const projectFiles = [
  'presentation-web/index.html', 'presentation-web/styles.css', 'presentation-web/presentation.js',
  'content/course-content.md', 'handout.js', 'handout.pdf',
];
assert.deepStrictEqual(detectWebProject(projectFiles), {
  root: 'presentation-web',
  index: 'presentation-web/index.html',
  styles: 'presentation-web/styles.css',
  runtime: 'presentation-web/presentation.js',
});

const plan = createWebTargetedEditPlan({
  request: 'Sur la slide 6, remplace cette illustration par une photo générée, agrandis le titre et fais apparaître les trois étapes une par une.',
  projectFiles,
  inventory: [
    { slide: 6, id: 'illustration-6', type: 'ILLUSTRATION' },
    { slide: 6, id: 'title-6', type: 'TITLE' },
    { slide: 6, id: 'steps-6', type: 'STEP_GROUP' },
  ],
});
assert.strictEqual(plan.status, 'READY');
assert.strictEqual(plan.presentationFormat, 'HTML');
assert.strictEqual(plan.source.kind, 'WEB_PROJECT');
assert.deepStrictEqual(plan.validation.targetedSlides, [6]);
assert.deepStrictEqual(plan.targets.map((target) => target.elementId).sort(), ['illustration-6', 'steps-6', 'title-6']);
assert.strictEqual(plan.interaction.interactionMethod, 'STEP_SEQUENCE');
assert.strictEqual(plan.interaction.progressiveDisclosure, 'ENABLED');
assert.strictEqual(plan.imageReplacement.requiresMandatoryPipeline, true);
assert.ok(plan.impactedFiles.includes('presentation-web/index.html'));
assert.ok(plan.impactedFiles.includes('presentation-web/styles.css'));
assert.ok(!plan.impactedFiles.includes('handout.js'));
assert.ok(!plan.impactedFiles.includes('presentation-web/presentation.js'));

const before = '<section class="web-slide" data-slide-index="1"><h1>A</h1></section><section class="web-slide" data-slide-index="2"><h1>B</h1></section>';
const afterTargeted = '<section class="web-slide" data-slide-index="1"><h1>A+</h1></section><section class="web-slide" data-slide-index="2"><h1>B</h1></section>';
const afterRegression = '<section class="web-slide" data-slide-index="1"><h1>A+</h1></section><section class="web-slide" data-slide-index="2"><h1>B+</h1></section>';
assert.strictEqual(extractSlideSections(before).size, 2);
assert.strictEqual(validateUntargetedSlidesPreserved(before, afterTargeted, [1]).passed, true);
assert.strictEqual(validateUntargetedSlidesPreserved(before, afterRegression, [1]).passed, false);
assert.deepStrictEqual(validateUntargetedSlidesPreserved(before, afterRegression, [1]).changedUntargetedSlides, [2]);

const pptxFallback = createWebTargetedEditPlan({ request: 'Sur la slide 2, agrandis le titre.', projectFiles: ['presentation.js', 'presentation.pptx'] });
assert.strictEqual(pptxFallback.source.kind, 'JAVASCRIPT');
assert.strictEqual(pptxFallback.presentationFormat, undefined);

console.log('V4.6 HTML Targeted Edit assertions passed');
