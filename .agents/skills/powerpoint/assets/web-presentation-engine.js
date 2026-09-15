'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { resolveInteractionMethod } = require('./web-interactions');
const { mergeBrandWithTheme } = require('./brands');

const WEB_PRESENTATION_FILES = Object.freeze(['index.html', 'styles.css', 'presentation.js', 'assets/images/']);
const WEB_ASPECT_RATIO = '16:9';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function safeId(value, fallback) {
  const id = String(value || fallback).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return id || fallback;
}

function slideFingerprint(html) {
  return crypto.createHash('sha256').update(String(html)).digest('hex').slice(0, 16);
}

function cssColor(value, fallback) {
  const color = String(value || fallback || '').trim();
  return /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : color;
}

function renderTextBlock(block = {}) {
  const allowedTags = ['p', 'h2', 'h3', 'blockquote'];
  const tag = allowedTags.includes(block.tag) ? block.tag : 'p';
  return `<${tag}${block.className ? ` class="${escapeHtml(block.className)}"` : ''}>${escapeHtml(block.text)}</${tag}>`;
}

function renderListBlock(block = {}, context = {}) {
  const tag = block.ordered ? 'ol' : 'ul';
  const progressive = block.progressive === true || ['REVEAL', 'STEP_SEQUENCE'].includes(context.interactionMethod);
  return `<${tag} class="pedagogical-list${progressive ? ' progressive-list' : ''}">${(block.items || []).map((item, index) =>
    `<li${progressive ? ` data-progressive-item data-step="${index + 1}" aria-hidden="false"` : ''}>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function renderStepsBlock(block = {}) {
  return `<ol class="step-sequence" aria-label="${escapeHtml(block.label || 'Étapes')}">${(block.items || []).map((item, index) =>
    `<li data-progressive-item data-step="${index + 1}" aria-hidden="false"><span class="step-number">${index + 1}</span><span>${escapeHtml(item)}</span></li>`).join('')}</ol>`;
}

function renderImageBlock(block = {}) {
  if (!block.src) throw new TypeError('An image block requires a local src');
  return `<figure class="visual-image"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || '')}">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
}

function renderBeforeAfterBlock(block = {}, slideId) {
  const id = `${slideId}-comparison`;
  return `<div class="before-after" id="${id}" style="--comparison-position: 50%" data-before-after>
    <div class="before-panel"><span class="comparison-label">${escapeHtml(block.beforeLabel || 'Avant')}</span>${escapeHtml(block.before || '')}</div>
    <div class="after-panel"><span class="comparison-label">${escapeHtml(block.afterLabel || 'Après')}</span>${escapeHtml(block.after || '')}</div>
  </div>
  <label class="comparison-control"><span>${escapeHtml(block.controlLabel || 'Comparer avant et après')}</span><input type="range" min="0" max="100" value="50" data-before-after-control aria-controls="${id}"></label>`;
}

function renderQuizBlock(block = {}, slideId) {
  const answerId = `${slideId}-answer`;
  return `<div class="quiz-block"><p class="quiz-question">${escapeHtml(block.question || '')}</p>
    <button type="button" class="reveal-answer" data-action="reveal-answer" aria-controls="${answerId}" aria-expanded="false">${escapeHtml(block.buttonLabel || 'Afficher la réponse')}</button>
    <div class="quiz-answer" id="${answerId}" data-quiz-answer aria-hidden="false">${escapeHtml(block.answer || '')}</div></div>`;
}

function renderHighlightBlock(block = {}, slideId) {
  const targetId = `${slideId}-${safeId(block.targetId, 'focus')}`;
  return `<div class="highlight-layout"><button type="button" data-highlight-target="${targetId}">${escapeHtml(block.buttonLabel || 'Mettre en évidence')}</button><div id="${targetId}" class="highlight-target">${escapeHtml(block.content || '')}</div></div>`;
}

function renderBlock(block, context) {
  switch (String(block?.type || 'text').toLowerCase()) {
    case 'text': return renderTextBlock(block);
    case 'list': return renderListBlock(block, context);
    case 'steps': return renderStepsBlock(block);
    case 'image': return renderImageBlock(block);
    case 'before-after': return renderBeforeAfterBlock(block, context.slideId);
    case 'quiz': return renderQuizBlock(block, context.slideId);
    case 'highlight': return renderHighlightBlock(block, context.slideId);
    case 'html': return String(block.html || '');
    default: throw new RangeError(`Unknown web presentation block type: ${block?.type}`);
  }
}

function inferInteractionInput(slide, profile) {
  const steps = (slide.blocks || []).find((block) => block.type === 'steps');
  const quiz = (slide.blocks || []).find((block) => block.type === 'quiz');
  const comparison = (slide.blocks || []).find((block) => block.type === 'before-after');
  const highlight = (slide.blocks || []).find((block) => block.type === 'highlight');
  return {
    interactionMethod: slide.interactionMethod,
    progressiveDisclosure: slide.progressiveDisclosure,
    profile,
    conceptType: quiz ? 'QUIZ' : comparison ? 'BEFORE_AFTER' : steps ? 'PROCEDURE' : slide.conceptType,
    stepCount: steps?.items?.length || slide.stepCount,
    itemCount: slide.itemCount,
    hasRevealableAnswer: Boolean(quiz),
    focusTarget: highlight?.targetId,
  };
}

function renderSlide(slide, index, profile) {
  const slideId = safeId(slide.id, `slide-${index + 1}`);
  const interaction = resolveInteractionMethod(inferInteractionInput(slide, profile));
  const body = (slide.blocks || []).map((block) => renderBlock(block, { slideId, interactionMethod: interaction.interactionMethod })).join('\n');
  const inner = `<header class="slide-header"><p class="slide-kicker">${escapeHtml(slide.kicker || '')}</p><h1>${escapeHtml(slide.title || '')}</h1></header><div class="slide-content">${body}</div>`;
  return `<section class="web-slide${index === 0 ? ' is-active' : ''}" id="${slideId}" data-slide-index="${index + 1}" data-slide-id="${slideId}" data-interaction-method="${interaction.interactionMethod}" data-progressive-disclosure="${interaction.progressiveDisclosure}" data-slide-fingerprint="${slideFingerprint(inner)}" aria-label="${escapeHtml(slide.ariaLabel || slide.title || `Slide ${index + 1}`)}" aria-hidden="${index === 0 ? 'false' : 'true'}">${inner}</section>`;
}

function renderHtml(model = {}) {
  if (!Array.isArray(model.slides) || model.slides.length === 0) throw new TypeError('A web presentation requires at least one slide');
  const lang = escapeHtml(model.lang || 'fr');
  const title = escapeHtml(model.title || 'Présentation');
  const profile = String(model.profile || 'CORPORATE').toUpperCase();
  const seniorControls = profile === 'SENIOR';
  const slides = model.slides.map((slide, index) => renderSlide(slide, index, profile)).join('\n');
  return `<!doctype html>
<html lang="${lang}" class="no-js" data-presentation-format="HTML" data-aspect-ratio="16:9" data-profile="${escapeHtml(profile)}" data-brand="${escapeHtml(model.brand || 'NONE')}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="styles.css"></head>
<body><main class="presentation-stage"><div class="presentation-shell" role="region" aria-roledescription="diaporama" aria-label="${title}">${slides}
<nav class="presentation-controls" aria-label="Navigation du diaporama"><button type="button" data-action="previous" aria-label="Slide précédente">${seniorControls ? '← Précédent' : '←'}</button><div class="slide-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100 / model.slides.length)}"><span data-progress-bar></span></div><span class="slide-counter" aria-live="polite"><span data-current-slide>1</span> / <span data-total-slides>${model.slides.length}</span></span><button type="button" data-action="next" aria-label="Slide suivante">${seniorControls ? 'Suivant →' : '→'}</button><button type="button" data-action="fullscreen" aria-label="Plein écran">Plein écran</button></nav>
</div></main><script src="presentation.js"></script></body></html>`;
}

function renderCss(model = {}) {
  const profile = String(model.profile || 'CORPORATE').toUpperCase();
  const senior = profile === 'SENIOR';
  const resolvedTheme = mergeBrandWithTheme(profile.toLowerCase(), model.brand || null, { deliveryMode: 'PRESENTATION' });
  const colors = { ...resolvedTheme.colors, ...(model.theme?.colors || {}) };
  const background = cssColor(colors.background, '#F7F8FA');
  const foreground = cssColor(colors.foreground || colors.text, '#102A43');
  const accent = cssColor(colors.accent, '#087E8B');
  const secondary = cssColor(colors.secondary, '#FFB000');
  return `:root{--bg:${background};--fg:${foreground};--accent:${accent};--secondary:${secondary};--body-size:${senior ? 'clamp(28px,2.15vw,38px)' : 'clamp(22px,1.75vw,32px)'};--title-size:${senior ? 'clamp(48px,4vw,72px)' : 'clamp(42px,3.7vw,68px)'};--control-size:${senior ? '56px' : '48px'};--motion:${senior ? '700ms' : '420ms'};font-family:Arial,Helvetica,sans-serif;color-scheme:light}
*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#101820;color:var(--fg)}button,input{font:inherit}.presentation-stage{width:100%;height:100%;display:grid;place-items:center}.presentation-shell{position:relative;width:min(100vw,calc(100vh * 16 / 9));height:min(100vh,calc(100vw * 9 / 16));aspect-ratio:16 / 9;background:var(--bg);overflow:hidden}.web-slide{position:absolute;inset:0;display:none;overflow:hidden;padding:5.4% 6.2% 8.4%;background:var(--bg)}.web-slide.is-active{display:flex;flex-direction:column}.slide-header{flex:0 0 auto}.slide-kicker{min-height:1.1em;margin:0 0 .3em;color:var(--accent);font-size:calc(var(--body-size)*.62);font-weight:700;text-transform:uppercase;letter-spacing:.06em}.slide-header h1{max-width:92%;margin:0 0 .48em;font-size:var(--title-size);line-height:1.02;letter-spacing:-.025em}.slide-content{display:flex;flex:1;min-height:0;flex-direction:column;justify-content:center;gap:.65em;font-size:var(--body-size);line-height:1.25}.slide-content p,.slide-content ul,.slide-content ol{margin:.15em 0}.pedagogical-list,.step-sequence{display:grid;gap:.55em;padding-left:1.3em}.step-sequence{list-style:none;padding:0}.step-sequence li{display:flex;align-items:center;gap:.6em}.step-number{display:grid;flex:0 0 1.7em;height:1.7em;place-items:center;border-radius:50%;background:var(--accent);color:#fff;font-weight:700}.visual-image{display:grid;place-items:center;margin:0;min-height:0}.visual-image img{display:block;max-width:100%;max-height:52vh;object-fit:contain}.visual-image figcaption{font-size:.62em;margin-top:.4em}.presentation-controls{position:absolute;z-index:10;right:2.1%;bottom:2.2%;left:2.1%;display:flex;align-items:center;gap:14px}.presentation-controls button,.reveal-answer,.highlight-layout button{min-width:var(--control-size);min-height:var(--control-size);padding:.2em .55em;border:2px solid var(--accent);border-radius:8px;background:#fff;color:var(--fg);cursor:pointer}.presentation-controls button:focus-visible,.slide-content button:focus-visible,.slide-content input:focus-visible{outline:5px solid var(--secondary);outline-offset:3px}.presentation-controls button:disabled{opacity:.38;cursor:default}.slide-progress{height:10px;flex:1;border-radius:8px;background:#cbd5e1;overflow:hidden}.slide-progress span{display:block;height:100%;width:0;background:var(--accent);transition:width var(--motion) ease}.slide-counter{min-width:4.5em;text-align:center;font-size:${senior ? '22px' : '18px'};font-weight:700}.js-enabled [data-progressive-item].is-pending{opacity:0;transform:translateY(18px);visibility:hidden}.js-enabled [data-progressive-item].is-revealed{opacity:1;transform:none;visibility:visible;transition:opacity var(--motion) ease,transform var(--motion) ease}.js-enabled .quiz-answer.is-concealed{display:none}.quiz-block{display:grid;gap:.7em}.quiz-question{font-weight:700}.quiz-answer{padding:.7em;border-left:8px solid var(--accent);background:#fff}.reveal-answer{padding:.35em .8em;width:max-content}.highlight-layout{display:grid;gap:.8em}.highlight-layout button{padding:.35em .8em;width:max-content}.highlight-target{padding:.8em;border:4px solid transparent;transition:border-color var(--motion),background var(--motion)}.highlight-target.is-highlighted{border-color:var(--secondary);background:#fff8dc}.before-after{position:relative;min-height:4.2em;border:4px solid var(--accent);overflow:hidden}.before-panel,.after-panel{position:absolute;top:0;bottom:0;display:grid;place-items:center;padding:1em;overflow:hidden}.before-panel{left:0;right:calc(100% - var(--comparison-position));background:#e7eef5}.after-panel{left:var(--comparison-position);right:0;background:#fff8dc}.comparison-label{display:block;font-size:.6em;font-weight:700;text-transform:uppercase}.comparison-control{display:grid;gap:.3em}.comparison-control input{width:100%;min-height:var(--control-size)}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
@media(max-aspect-ratio:4/3){.slide-content{font-size:clamp(18px,2.6vw,28px)}}`;
}

function renderWebPresentation(model = {}) {
  const runtimePath = path.join(__dirname, 'web-presentation-runtime.js');
  return Object.freeze({
    'index.html': renderHtml(model),
    'styles.css': renderCss(model),
    'presentation.js': fs.readFileSync(runtimePath, 'utf8'),
  });
}

function assertInside(parent, child) {
  const relative = path.relative(parent, child);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new RangeError('Asset destination must remain inside assets/images');
}

function writeWebPresentation(outputDirectory, model = {}) {
  const root = path.resolve(outputDirectory);
  const imageDirectory = path.join(root, 'assets', 'images');
  fs.mkdirSync(imageDirectory, { recursive: true });
  const files = renderWebPresentation(model);
  Object.entries(files).forEach(([name, contents]) => fs.writeFileSync(path.join(root, name), contents, 'utf8'));
  (model.assets || []).forEach((asset) => {
    const destination = path.resolve(imageDirectory, asset.destination || path.basename(asset.source));
    assertInside(imageDirectory, destination);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.resolve(asset.source), destination);
  });
  return Object.freeze({ root, files: WEB_PRESENTATION_FILES.slice(), slideCount: model.slides.length, aspectRatio: WEB_ASPECT_RATIO });
}

module.exports = {
  WEB_PRESENTATION_FILES,
  WEB_ASPECT_RATIO,
  escapeHtml,
  safeId,
  slideFingerprint,
  cssColor,
  renderSlide,
  renderHtml,
  renderCss,
  renderWebPresentation,
  writeWebPresentation,
};
