'use strict';

const { resolveTheme } = require('./themes');
const names = ['hero', 'split-left', 'split-right', 'full-bleed-image', 'statement', 'quote', 'three-cards', 'four-cards', 'stat-grid', 'comparison', 'timeline', 'process', 'before-after', 'image-grid', 'diagram', 'chart-focus', 'section-divider', 'question', 'quiz', 'conclusion', 'call-to-action'];
const box = (x, y, w, h) => ({ x, y, w, h });
function getLayout(name, themeInput = 'corporate') {
  if (!names.includes(name)) throw new Error(`Unknown layout: ${name}`);
  const t = resolveTheme(themeInput); const { slideWidth: W, slideHeight: H, margin: m, contentWidth: cw } = t.layout; const gap = t.spacing.md; const half = (cw - gap) / 2;
  const common = { name, theme: t, canvas: box(0, 0, W, H), safe: box(m, m, cw, H - (2 * m)), title: box(m, 0.48, cw, 0.65) };
  const split = (imageLeft) => ({ ...common, copy: box(imageLeft ? m + half + gap : m, 1.55, half, 4.9), image: box(imageLeft ? m : m + half + gap, 0.75, half, 6.05) });
  const map = {
    hero: { ...common, copy: box(m, 1.2, cw * 0.58, 3.9), visual: box(W * 0.59, 0, W * 0.41, H) },
    'split-left': split(true), 'split-right': split(false),
    'full-bleed-image': { ...common, image: box(0, 0, W, H), overlay: box(0, 0, W, H), copy: box(m, 4.65, cw * 0.72, 1.8) },
    statement: { ...common, copy: box(m + cw * 0.08, 1.4, cw * 0.84, 4.5) }, quote: { ...common, quote: box(m + 0.7, 1.35, cw - 1.4, 4.5) },
    'three-cards': { ...common, cards: grid(m, 1.65, cw, 4.85, 3, 1, gap) }, 'four-cards': { ...common, cards: grid(m, 1.65, cw, 4.85, 2, 2, gap) },
    'stat-grid': { ...common, stats: grid(m, 1.65, cw, 4.9, 2, 2, gap) }, comparison: { ...common, columns: grid(m, 1.65, cw, 4.95, 2, 1, gap) },
    timeline: { ...common, track: box(m, 3.1, cw, 0.1), content: box(m, 2.15, cw, 3.65) }, process: { ...common, steps: box(m, 2.15, cw, 2.6) },
    'before-after': { ...common, panels: grid(m, 1.55, cw, 5.15, 2, 1, gap) }, 'image-grid': { ...common, images: grid(m, 1.45, cw, 5.45, 3, 2, gap) },
    diagram: { ...common, diagram: box(m + 0.4, 1.5, cw - 0.8, 5.25) }, 'chart-focus': { ...common, chart: box(m, 1.5, cw * 0.72, 5.3), insight: box(m + cw * 0.76, 1.7, cw * 0.24, 4.8) },
    'section-divider': { ...common, copy: box(m, 2.1, cw * 0.75, 2.2) }, question: { ...common, prompt: box(m + cw * 0.08, 1.55, cw * 0.84, 3.8) },
    quiz: { ...common, prompt: box(m, 1.35, cw, 1.15), answers: grid(m, 2.75, cw, 3.6, 2, 2, gap) },
    conclusion: { ...common, summary: box(m, 1.35, cw * 0.62, 4.8), visual: box(m + cw * 0.68, 1.15, cw * 0.32, 5.25) },
    'call-to-action': { ...common, copy: box(m, 1.7, cw * 0.68, 3.5), action: box(m, 5.45, 3.2, 0.7) },
  };
  return map[name];
}
function grid(x, y, w, h, cols, rows, gap) { const cellW = (w - gap * (cols - 1)) / cols; const cellH = (h - gap * (rows - 1)) / rows; return Array.from({ length: cols * rows }, (_, i) => box(x + (i % cols) * (cellW + gap), y + Math.floor(i / cols) * (cellH + gap), cellW, cellH)); }
function chooseLayoutSequence(slides, themeInput = 'corporate') {
  const t = resolveTheme(themeInput); const preferred = t.name === 'editorial' ? ['hero', 'full-bleed-image', 'split-right', 'statement', 'image-grid', 'quote'] : t.name === 'corporate' ? ['hero', 'stat-grid', 'chart-focus', 'comparison', 'process', 'statement'] : ['hero', 'split-right', 'three-cards', 'statement', 'split-left', 'comparison'];
  return slides.map((slide, i) => slide.layout || preferred[i % preferred.length]).map((layout, i, all) => i > 0 && layout === all[i - 1] ? preferred[(preferred.indexOf(layout) + 1) % preferred.length] : layout);
}
module.exports = { layoutNames: names, getLayout, chooseLayoutSequence };
