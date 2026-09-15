#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

function findBrowser(explicit) {
  const candidates = [
    explicit,
    process.env.WEB_PRESENTATION_BROWSER,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function findFirefoxBrowser(explicit) {
  const candidates = [
    explicit,
    process.env.WEB_PRESENTATION_FIREFOX,
    '/Applications/Firefox.app/Contents/MacOS/firefox',
    '/usr/bin/firefox',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function slideCount(indexHtml) {
  const html = fs.readFileSync(indexHtml, 'utf8');
  return (html.match(/<section\b[^>]*\bclass=["'][^"']*\bweb-slide\b/gi) || []).length;
}

function renderWebPresentation(inputDirectory, outputDirectory, options = {}) {
  const input = path.resolve(inputDirectory);
  const output = path.resolve(outputDirectory);
  const index = path.join(input, 'index.html');
  if (!fs.existsSync(index)) throw new Error(`Missing web presentation entrypoint: ${index}`);
  const firefox = findFirefoxBrowser(options.firefox);
  const browser = firefox || findBrowser(options.browser);
  const browserKind = firefox ? 'FIREFOX' : 'CHROMIUM';
  if (!browser) return { status: 'UNAVAILABLE', code: 'NO_COMPATIBLE_HEADLESS_BROWSER', renders: [] };
  fs.mkdirSync(output, { recursive: true });
  const count = slideCount(index); const renders = [];
  for (let slide = 1; slide <= count; slide += 1) {
    const destination = path.join(output, `slide-${String(slide).padStart(2, '0')}.png`);
    const url = `${pathToFileURL(index).href}?slide=${slide}`;
    const args = browserKind === 'FIREFOX'
      ? ['--headless', '--screenshot', destination, '--window-size', '1600,900', url]
      : ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking',
        '--disable-component-update', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--metrics-recording-only',
        '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1600,900', '--force-device-scale-factor=1',
        '--virtual-time-budget=1000', `--screenshot=${destination}`, url];
    const run = spawnSync(browser, args, { encoding: 'utf8', timeout: 15000, killSignal: 'SIGKILL', env: { ...process.env, MOZ_HEADLESS: '1' } });
    if (run.status !== 0 || !fs.existsSync(destination)) {
      return { status: 'FAILED', code: 'BROWSER_RENDER_FAILED', slide, stderr: run.stderr, renders };
    }
    renders.push(destination);
  }
  return { status: 'READY', browser, browserKind, slideCount: count, renders };
}

if (require.main === module) {
  const [inputDirectory, outputDirectory] = process.argv.slice(2);
  if (!inputDirectory || !outputDirectory) {
    console.error('Usage: render-web-presentation.js <presentation-web> <rendered-directory>');
    process.exit(2);
  }
  const result = renderWebPresentation(inputDirectory, outputDirectory);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'READY' ? 0 : 1);
}

module.exports = { findBrowser, findFirefoxBrowser, slideCount, renderWebPresentation };
