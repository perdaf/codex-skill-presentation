'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REQUIRED_WEB_FILES = Object.freeze(['index.html', 'styles.css', 'presentation.js']);

function result(name, passed, details = {}) {
  return Object.freeze({ name, status: passed ? 'PASS' : 'FAIL', ...details });
}

function readIfPresent(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function collectResourceReferences(html, css) {
  const references = [];
  const attributePattern = /\b(?:src|href)=["']([^"']+)["']/gi;
  const cssPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match;
  while ((match = attributePattern.exec(html))) references.push(match[1]);
  while ((match = cssPattern.exec(css))) references.push(match[1]);
  return [...new Set(references)].filter((reference) => reference && !reference.startsWith('#') && !reference.startsWith('data:'));
}

function isExternal(reference) {
  return /^(?:https?:)?\/\//i.test(reference);
}

function validateBrowserAudit(audit = {}, options = {}) {
  const profile = String(options.profile || '').toUpperCase();
  const expectedSlides = Number(options.expectedSlides || audit.slideCount || 0);
  const minFont = Number(options.minFontSize || (profile === 'SENIOR' ? 20 : 18));
  const minTarget = Number(options.minInteractiveTarget || (profile === 'SENIOR' ? 48 : 40));
  const ratio = Number(audit.aspectRatio || 0);
  const checks = [
    result('browser-slide-count', audit.slideCount === expectedSlides, { actual: audit.slideCount, expected: expectedSlides }),
    result('browser-initial-state', audit.activeSlideCount === 1 && Number(audit.currentSlide) >= 1, { activeSlideCount: audit.activeSlideCount, currentSlide: audit.currentSlide }),
    result('browser-aspect-ratio-16-9', Math.abs(ratio - (16 / 9)) < 0.03, { actual: ratio }),
    result('browser-no-overflow', Array.isArray(audit.overflowSlides) && audit.overflowSlides.length === 0, { slides: audit.overflowSlides || [] }),
    result('browser-minimum-text-size', Number(audit.minFontSize) >= minFont, { actual: audit.minFontSize, minimum: minFont }),
    result('browser-click-target-size', Number(audit.minInteractiveTarget) >= minTarget, { actual: audit.minInteractiveTarget, minimum: minTarget }),
    result('browser-local-images-loaded', Array.isArray(audit.brokenImages) && audit.brokenImages.length === 0, { brokenImages: audit.brokenImages || [] }),
    result('browser-javascript-errors', Array.isArray(audit.javascriptErrors) && audit.javascriptErrors.length === 0, { errors: audit.javascriptErrors || [] }),
  ];
  return Object.freeze({ checks, passed: checks.every((check) => check.status === 'PASS') });
}

function validateWebPresentationProject(input = {}) {
  const root = path.resolve(input.rootDir || '.');
  const paths = Object.fromEntries(REQUIRED_WEB_FILES.map((name) => [name, path.join(root, name)]));
  const html = readIfPresent(paths['index.html']);
  const css = readIfPresent(paths['styles.css']);
  const javascript = readIfPresent(paths['presentation.js']);
  const slideCount = (html.match(/<section\b[^>]*\bclass=["'][^"']*\bweb-slide\b/gi) || []).length;
  const interactionMethods = [...html.matchAll(/data-interaction-method=["']([A-Z_]+)["']/g)].map((match) => match[1]);
  const expectedSlides = Number(input.expectedSlides || slideCount);
  const references = collectResourceReferences(html, css);
  const declared = input.declaredInternetDependencies || [];
  const external = references.filter(isExternal);
  const undeclaredExternal = external.filter((reference) => !declared.some((item) => reference.startsWith(item)));
  const localReferences = references.filter((reference) => !isExternal(reference));
  const brokenLocal = localReferences.filter((reference) => {
    const clean = reference.split(/[?#]/)[0];
    return clean && !fs.existsSync(path.resolve(root, clean));
  });
  let syntaxError = null;
  try { if (javascript) new vm.Script(javascript, { filename: paths['presentation.js'] }); } catch (error) { syntaxError = error.message; }

  const checks = [
    ...REQUIRED_WEB_FILES.map((name) => result(`required-file:${name}`, fs.existsSync(paths[name]), { path: paths[name] })),
    result('slide-count', slideCount > 0 && slideCount === expectedSlides, { actual: slideCount, expected: expectedSlides }),
    result('aspect-ratio-16-9', /data-aspect-ratio=["']16:9["']/.test(html) && /aspect-ratio\s*:\s*16\s*\/\s*9/.test(css)),
    result('local-resources-present', brokenLocal.length === 0, { broken: brokenLocal }),
    result('no-undeclared-internet-dependency', undeclaredExternal.length === 0, { undeclared: undeclaredExternal, declared: external.filter((reference) => !undeclaredExternal.includes(reference)) }),
    result('javascript-syntax', !syntaxError, { error: syntaxError }),
    result('keyboard-navigation', /ArrowRight/.test(javascript) && /ArrowLeft/.test(javascript) && /keydown/.test(javascript)),
    result('mouse-navigation', /data-action=["']previous["']/.test(html) && /data-action=["']next["']/.test(html) && /click/.test(javascript)),
    result('fullscreen-control', /data-action=["']fullscreen["']/.test(html) && /requestFullscreen/.test(javascript)),
    result('initial-state', (html.match(/web-slide is-active/g) || []).length === 1 && /data-current-slide>1</.test(html)),
    result('progressive-disclosure-runtime', /data-progressive-item/.test(html) ? /revealNext/.test(javascript) && /is-pending/.test(css) : true),
    result('interaction-methods-supported', interactionMethods.every((method) => ['STATIC', 'REVEAL', 'HIGHLIGHT', 'STEP_SEQUENCE', 'BEFORE_AFTER', 'QUIZ_REVEAL'].includes(method))
      && (!interactionMethods.includes('HIGHLIGHT') || /data-highlight-target/.test(html))
      && (!interactionMethods.includes('BEFORE_AFTER') || /data-before-after-control/.test(html))
      && (!interactionMethods.includes('QUIZ_REVEAL') || /data-action=["']reveal-answer["']/.test(html)), { interactionMethods }),
    result('animation-independent-content', !/data-progressive-item[^>]*\shidden(?:\s|=|>)/i.test(html) && /aria-hidden=["']false["']/.test(html) && /prefers-reduced-motion/.test(css) && /reducedMotion/.test(javascript)),
  ];

  let browserValidation = null;
  if (input.browserAudit) {
    browserValidation = validateBrowserAudit(input.browserAudit, { profile: input.profile, expectedSlides, minFontSize: input.minFontSize, minInteractiveTarget: input.minInteractiveTarget });
    checks.push(...browserValidation.checks);
  }
  const visualInspection = input.visualInspection || null;
  if (visualInspection) checks.push(result('visual-inspection', visualInspection.completed === true && !(visualInspection.issues || []).length, { issues: visualInspection.issues || [] }));

  return Object.freeze({
    root,
    slideCount,
    references,
    interactionMethods,
    checks,
    browserValidation,
    visualInspection,
    requiresBrowserValidation: !input.browserAudit,
    requiresVisualInspection: !visualInspection,
    passed: checks.every((check) => check.status === 'PASS'),
  });
}

module.exports = {
  REQUIRED_WEB_FILES,
  collectResourceReferences,
  isExternal,
  validateBrowserAudit,
  validateWebPresentationProject,
};
