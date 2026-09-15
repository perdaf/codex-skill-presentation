#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { renderWebPresentation, writeWebPresentation } = require('../assets/web-presentation-engine');
const { validateWebPresentationProject } = require('../assets/web-validation');

const model = {
  title: 'Atelier numérique', profile: 'SENIOR', brand: 'EPN_RIVIERE_SALEE',
  theme: { colors: { background: '#F7F8FA', foreground: '#102A43', accent: '#087E8B', secondary: '#FFB000' } },
  slides: [
    { id: 'bienvenue', title: 'Bienvenue', blocks: [{ type: 'text', text: 'Nous allons apprendre ensemble.' }] },
    { id: 'procedure', title: 'Trois étapes', blocks: [{ type: 'steps', items: ['Ouvrir le dossier', 'Choisir la photo', 'Confirmer'] }] },
    { id: 'quiz', title: 'À vous de jouer', blocks: [{ type: 'quiz', question: 'Quel bouton faut-il choisir ?', answer: 'Le bouton Confirmer.' }] },
    { id: 'comparaison', title: 'Avant et après', blocks: [{ type: 'before-after', before: 'Photo sombre', after: 'Photo éclaircie' }] },
  ],
};

const rendered = renderWebPresentation(model);
assert.deepStrictEqual(Object.keys(rendered), ['index.html', 'styles.css', 'presentation.js']);
assert.strictEqual((rendered['index.html'].match(/class="web-slide/g) || []).length, 4);
assert.ok(rendered['index.html'].includes('data-aspect-ratio="16:9"'));
assert.ok(rendered['index.html'].includes('data-interaction-method="STEP_SEQUENCE"'));
assert.ok(rendered['index.html'].includes('data-interaction-method="QUIZ_REVEAL"'));
assert.ok(rendered['styles.css'].includes('aspect-ratio:16 / 9'));
assert.ok(rendered['presentation.js'].includes('ArrowRight'));
assert.ok(!/https?:\/\//.test(Object.values(rendered).join('\n')));
const epnCss = renderWebPresentation({ title: 'EPN', profile: 'SENIOR', brand: 'EPN_RIVIERE_SALEE', slides: [{ title: 'Test', blocks: [{ type: 'text', text: 'Test' }] }] })['styles.css'];
assert.ok(epnCss.includes('--bg:#FAFAF7'));
assert.ok(epnCss.includes('--fg:#243447'));

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'powerpoint-v46-web-'));
try {
  const output = path.join(temporaryRoot, 'presentation-web');
  const written = writeWebPresentation(output, model);
  assert.strictEqual(written.slideCount, 4);
  assert.ok(fs.existsSync(path.join(output, 'assets', 'images')));
  const validation = validateWebPresentationProject({ rootDir: output, expectedSlides: 4, profile: 'SENIOR' });
  assert.strictEqual(validation.passed, true, JSON.stringify(validation.checks.filter((check) => check.status === 'FAIL')));
  assert.strictEqual(validation.requiresBrowserValidation, true);
  assert.strictEqual(validation.requiresVisualInspection, true);
  assert.deepStrictEqual(validation.references.sort(), ['presentation.js', 'styles.css']);
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log('V4.6 web presentation engine assertions passed');
