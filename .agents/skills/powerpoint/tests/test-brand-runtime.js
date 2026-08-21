#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const JSZip = require('jszip');
const PptxGenJS = require('pptxgenjs');
const { resolveBrand, mergeBrandWithTheme } = require('../assets/brands');
const { createBrandComponents } = require('../assets/brand-components');

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'powerpoint-brand-runtime-'));
  const output = path.join(tempDir, 'brand-smoke.pptx');
  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    const brand = resolveBrand('EPN_RIVIERE_SALEE');
    const theme = mergeBrandWithTheme('senior', brand.id);
    assert.strictEqual(theme.brandId, brand.id);
    const components = createBrandComponents(pptx, brand.id);
    const slide = pptx.addSlide();
    slide.background = { color: theme.colors.background };
    components.addGraphicSignature(slide, { x: .7, y: .4 });
    components.addPedagogicalCallout(slide, 'retain', 'Une information essentielle.', { x: .7, y: 1, w: 3.7 });
    components.addPedagogicalCallout(slide, 'practice', 'Une activité guidée.', { x: 4.7, y: 1, w: 3.7 });
    components.addPedagogicalCallout(slide, 'warning', 'Un point de vigilance.', { x: 8.7, y: 1, w: 3.7 });
    components.addPedagogicalCallout(slide, 'tip', 'Un conseil utile.', { x: .7, y: 2.4, w: 3.7 });
    components.addActionSteps(slide, [{ verb: 'Ouvrir' }, { verb: 'Choisir' }, { verb: 'Vérifier' }], { x: .7, y: 4, w: 11.5 });
    components.addBrandFooter(slide, '1 / 1', { courseName: 'Smoke test' });
    await pptx.writeFile({ fileName: output });
    assert.ok(fs.statSync(output).size > 0);
    const zip = await JSZip.loadAsync(fs.readFileSync(output));
    ['[Content_Types].xml', 'ppt/presentation.xml', 'ppt/slides/slide1.xml'].forEach((name) => assert.ok(zip.file(name), name));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log('Brand runtime smoke test passed');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
