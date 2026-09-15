#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { writeWebPresentation } = require('../assets/web-presentation-engine');
const { findBrowser } = require('../scripts/render-web-presentation');
const { validateWebPresentationProject } = require('../assets/web-validation');

const browser = findBrowser();
if (!browser) {
  console.log('V4.6 browser interaction assertions skipped: no compatible local browser');
  process.exit(0);
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'powerpoint-v46-browser-'));
try {
  const output = path.join(temporaryRoot, 'presentation-web');
  const model = {
    title: 'Fixture temporaire V4.6', profile: 'SENIOR',
    slides: [
      { title: 'Procédure', blocks: [{ type: 'steps', items: ['Première étape', 'Deuxième étape', 'Troisième étape'] }] },
      { title: 'Question', blocks: [{ type: 'quiz', question: 'Que faut-il faire ?', answer: 'Confirmer.' }] },
      { title: 'Comparaison', blocks: [{ type: 'before-after', before: 'Avant', after: 'Après' }] },
    ],
  };
  writeWebPresentation(output, model);
  const indexPath = path.join(output, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const harness = `<div id="browser-test-result">PENDING</div><script>
  window.addEventListener('load', function () {
    const controller = window.webPresentationController;
    const initial = controller && controller.getState().currentSlide === 1;
    function key(value){ document.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true})); }
    key('ArrowRight');
    const progressive = controller.getState().currentSlide === 1 && document.querySelectorAll('#slide-1 .is-revealed').length === 2;
    key('ArrowRight'); key('ArrowRight');
    const keyboard = controller.getState().currentSlide === 2;
    document.querySelector('[data-action="previous"]').click();
    document.querySelector('[data-action="next"]').click();
    document.querySelector('[data-action="next"]').click();
    const mouse = controller.getState().currentSlide === 3;
    const range = document.querySelector('[data-before-after-control]'); range.value='80'; range.dispatchEvent(new Event('input',{bubbles:true}));
    const beforeAfter = document.querySelector('[data-before-after]').style.getPropertyValue('--comparison-position') === '80%';
    controller.goTo(1); document.querySelector('[data-action="reveal-answer"]').click();
    const quiz = !document.querySelector('[data-quiz-answer]').classList.contains('is-concealed');
    const audit = window.WebPresentationAudit.run();
    const result = { initial, progressive, keyboard, mouse, beforeAfter, quiz, audit, offline: location.protocol === 'file:' };
    document.getElementById('browser-test-result').textContent = btoa(unescape(encodeURIComponent(JSON.stringify(result))));
  });
  </script>`;
  fs.writeFileSync(indexPath, html.replace('</body>', `${harness}</body>`), 'utf8');

  const profile = path.join(temporaryRoot, 'chrome-profile');
  const run = spawnSync(browser, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking',
    '--disable-component-update', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--metrics-recording-only',
    '--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run',
    `--user-data-dir=${profile}`, '--window-size=1600,900', '--force-device-scale-factor=1', '--virtual-time-budget=1800',
    '--dump-dom', pathToFileURL(indexPath).href,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 15000, killSignal: 'SIGKILL' });
  if (run.status !== 0 && (run.error?.code === 'ETIMEDOUT' || /CVDisplayLinkCreateWithCGDisplay failed/.test(run.stderr || ''))) {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
    console.log('V4.6 browser interaction assertions skipped: local Chrome headless display initialization unavailable');
    process.exit(0);
  }
  assert.strictEqual(run.status, 0, [run.error?.message, run.signal, run.stderr].filter(Boolean).join('\n'));
  const marker = run.stdout.match(/id="browser-test-result">([^<]+)</);
  assert.ok(marker, 'Browser harness result was not emitted');
  const outcome = JSON.parse(decodeURIComponent(escape(Buffer.from(marker[1], 'base64').toString('binary'))));
  for (const key of ['initial', 'progressive', 'keyboard', 'mouse', 'beforeAfter', 'quiz', 'offline']) assert.strictEqual(outcome[key], true, key);
  const validation = validateWebPresentationProject({
    rootDir: output, expectedSlides: 3, profile: 'SENIOR', browserAudit: outcome.audit,
    visualInspection: { completed: true, issues: [] },
  });
  assert.strictEqual(validation.passed, true, JSON.stringify(validation.checks.filter((check) => check.status === 'FAIL')));
  assert.strictEqual(validation.requiresBrowserValidation, false);
  assert.strictEqual(validation.requiresVisualInspection, false);
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log('V4.6 offline browser, navigation, disclosure, and interaction assertions passed');
