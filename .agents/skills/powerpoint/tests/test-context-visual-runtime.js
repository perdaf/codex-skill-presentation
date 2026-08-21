#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const JSZip = require('jszip');
const PptxGenJS = require('pptxgenjs');
const { resolveRequestWithContext } = require('../assets/context-layer');
const { validateConnector } = require('../assets/connector-reliability');
const { assessIconRecognizability } = require('../assets/icon-reliability');

async function run() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'powerpoint-v45-runtime-'));
  const output = path.join(dir, 'runtime.pptx');
  try {
    const config = resolveRequestWithContext('Atelier senior sur les fichiers.', 'EPN_RIVIERE_SALEE_CONTEXT');
    assert.strictEqual(config.brand, 'EPN_RIVIERE_SALEE');
    const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.roundRect, { x: 5, y: 1, w: 2, h: 4, fill: { color: 'FAFAF7' }, line: { color: '243447', width: 2 } });
    slide.addShape(pptx.ShapeType.rect, { x: 5.35, y: 1.5, w: 1.3, h: 1, fill: { color: 'A9D6E5' }, line: { color: '243447' } });
    slide.addShape(pptx.ShapeType.arc, { x: 8.1, y: 1.5, w: .8, h: .8, adjustPoint: .3, rotate: 180, line: { color: '243447', width: 3 } });
    slide.addShape(pptx.ShapeType.line, { x: 2, y: 2, w: 3, h: 0, line: { color: '243447', width: 2, endArrowType: 'triangle' } });
    const icon = assessIconRecognizability({ profile: 'SENIOR', iconType: 'PEDAGOGICAL_OBJECT', symbol: 'SMARTPHONE', functional: true, hasLabel: true });
    assert.strictEqual(icon.iconRecognizability, 'CLEAR');
    const connector = validateConnector({ id: 'identify', sourceId: 'label', targetId: 'phone', end: { x: 5, y: 2 }, direction: 'TO_TARGET' }, [{ id: 'label', x: 1, y: 1.8, w: 1, h: .4 }, { id: 'phone', x: 5, y: 1, w: 2, h: 4 }]);
    assert.strictEqual(connector.status, 'VALID');
    await pptx.writeFile({ fileName: output });
    const zip = await JSZip.loadAsync(fs.readFileSync(output));
    assert.ok(zip.file('ppt/slides/slide1.xml'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  console.log('Context + visual runtime smoke test passed');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
