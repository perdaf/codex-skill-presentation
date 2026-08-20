#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const pptxgen = require('pptxgenjs');
const { profiles, selectProfile, resolveTheme, deriveBrandTheme, createVariation } = require('../assets/themes');
const { layoutNames, getLayout, chooseLayoutSequence } = require('../assets/layouts');
const { createComponents } = require('../assets/presentation-components');

const installedPackage = JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve('pptxgenjs')), '..', 'package.json'), 'utf8'));
assert.strictEqual(installedPackage.version, '4.0.1');
assert.strictEqual(Object.keys(profiles).length, 10);
assert.strictEqual(selectProfile('Formation ludique pour enfants'), 'kids');
assert.strictEqual(selectProfile('Résultats trimestriels du comité de direction'), 'corporate');
assert.strictEqual(selectProfile('Voyage photographique en Martinique'), 'tropical');
assert.strictEqual(resolveTheme('senior').typography.body.size >= 23, true);
assert.strictEqual(deriveBrandTheme({ colors: { primary: 'ABCDEF' } }).colors.primary, 'ABCDEF');
assert.notStrictEqual(createVariation('premium', 1).variation, undefined);
assert.strictEqual(layoutNames.length, 21);
layoutNames.forEach((name) => assert.strictEqual(getLayout(name, 'tech').name, name));
const sequence = chooseLayoutSequence([{ layout: 'hero' }, { layout: 'hero' }, {}], 'corporate');
assert.notStrictEqual(sequence[0], sequence[1]);

async function build(output) {
  const pptx = new pptxgen(); pptx.layout = 'LAYOUT_WIDE'; pptx.author = 'Codex V4 test'; pptx.lang = 'fr-FR';
  ['kids', 'corporate', 'premium', 'tropical'].forEach((profileName, index) => {
    const theme = resolveTheme(profileName); const c = createComponents(pptx, theme); const slide = pptx.addSlide();
    slide.background = { color: theme.colors.background }; c.addTitle(slide, profileName.toUpperCase()); c.addSubtitle(slide, 'Tokens, composants et rendu éditables');
    c.addStat(slide, { value: `${index + 1}0%`, label: 'Signal principal', detail: 'Micro-test sans API', x: theme.layout.margin, y: 2.05, w: 3.25, h: 1.8 });
    c.addCard(slide, { x: 4.35, y: 2.05, w: 3.8, h: 3.4 }); c.addTextBlock(slide, 'Une hiérarchie claire\nUn rythme distinct\nUne palette cohérente', { x: 4.75, y: 2.5, w: 3, h: 2.2, breakLine: false });
    c.addProcess(slide, { steps: ['Idée', 'Design', 'Valider'], x: 8.55, y: 2.45, w: 4.05, h: 1.7 }); c.addPageNumber(slide, index + 1);
  });
  await pptx.writeFile({ fileName: output });
}

if (process.argv[2]) build(path.resolve(process.argv[2])).catch((error) => { console.error(error); process.exit(1); });
else console.log('Design engine assertions passed');
