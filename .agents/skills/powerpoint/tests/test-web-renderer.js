#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeWebPresentation } = require('../assets/web-presentation-engine');
const { renderWebPresentation } = require('../scripts/render-web-presentation');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'powerpoint-v46-render-'));
try {
  const presentation = path.join(temporaryRoot, 'presentation-web');
  const rendered = path.join(temporaryRoot, 'rendered');
  writeWebPresentation(presentation, {
    title: 'Fixture visuelle temporaire', profile: 'SENIOR',
    slides: [
      { title: 'Une idée claire', blocks: [{ type: 'text', text: 'Un écran pédagogique lisible et contrasté.' }] },
      { title: 'Trois étapes', blocks: [{ type: 'steps', items: ['Choisir', 'Vérifier', 'Confirmer'] }] },
    ],
  });
  const result = renderWebPresentation(presentation, rendered);
  if (result.status === 'UNAVAILABLE') {
    console.log('V4.6 visual renderer assertions skipped: no compatible local headless browser');
    process.exitCode = 0;
  } else {
    assert.strictEqual(result.status, 'READY', JSON.stringify(result));
    assert.strictEqual(result.renders.length, 2);
    result.renders.forEach((file) => assert.ok(fs.statSync(file).size > 1000, file));
    console.log(`V4.6 visual renderer assertions passed (${result.browserKind})`);
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
