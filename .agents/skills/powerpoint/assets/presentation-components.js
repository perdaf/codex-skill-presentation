'use strict';

// Copy and adapt this module into each presentation project. Coordinates are inches.
const pptxgen = require('pptxgenjs');

const defaults = {
  fontFace: 'Aptos', titleFontFace: 'Aptos Display', primary: '16324F', secondary: '3B82A0',
  accent: 'F59E0B', background: 'F8FAFC', surface: 'FFFFFF', text: '15202B', muted: '5B6B7A',
  line: 'D8E1E8', margin: 0.62, slideWidth: 13.333, slideHeight: 7.5,
  titleSize: 30, subtitleSize: 19, bodySize: 18, captionSize: 11,
};

function createComponents(pptx, overrides = {}) {
  const t = { ...defaults, ...overrides };
  const text = { fontFace: t.fontFace, color: t.text, margin: 0 };
  const addTitle = (slide, value, opts = {}) => slide.addText(value, {
    ...text, fontFace: t.titleFontFace, fontSize: t.titleSize, bold: true, fit: 'shrink',
    x: t.margin, y: 0.5, w: t.slideWidth - (2 * t.margin), h: 0.5, ...opts,
  });
  const addSubtitle = (slide, value, opts = {}) => slide.addText(value, {
    ...text, color: t.muted, fontSize: t.subtitleSize, fit: 'shrink',
    x: t.margin, y: 1.08, w: t.slideWidth - (2 * t.margin), h: 0.34, ...opts,
  });
  const addFooter = (slide, value, opts = {}) => slide.addText(value, {
    ...text, color: t.muted, fontSize: t.captionSize,
    x: t.margin, y: t.slideHeight - 0.34, w: 5.5, h: 0.16, ...opts,
  });
  const addPageNumber = (slide, value, opts = {}) => slide.addText(String(value), {
    ...text, color: t.muted, fontSize: t.captionSize, align: 'right',
    x: t.slideWidth - t.margin - 0.5, y: t.slideHeight - 0.34, w: 0.5, h: 0.16, ...opts,
  });
  const addCard = (slide, { x, y, w, h, fill = t.surface, line = t.line }) => slide.addShape(
    pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: line, transparency: 35 } },
  );
  const addImage = (slide, path, { x, y, w, h, mode = 'crop', ...opts }) => slide.addImage({
    path, sizing: { type: mode === 'contain' ? 'contain' : 'cover', x, y, w, h }, ...opts,
  });
  const addTextBlock = (slide, value, opts = {}) => slide.addText(value, {
    ...text, fontSize: t.bodySize, fit: 'shrink', valign: 'top',
    x: t.margin, y: 1.6, w: 5.5, h: 2.5, ...opts,
  });
  const addSectionHeader = (slide, { eyebrow, title, subtitle }) => {
    slide.background = { color: t.primary };
    if (eyebrow) slide.addText(eyebrow.toUpperCase(), { ...text, color: t.accent, bold: true, charSpacing: 1.5, fontSize: 12, x: t.margin, y: 1.35, w: 5, h: 0.25 });
    addTitle(slide, title, { color: 'FFFFFF', x: t.margin, y: 1.75, w: 9.5, h: 0.7, fontSize: 38 });
    if (subtitle) addSubtitle(slide, subtitle, { color: 'E6EFF5', x: t.margin, y: 2.62, w: 8.5, h: 0.4 });
  };
  const addQuote = (slide, { quote, attribution, x = t.margin, y = 1.6, w = 9.5, h = 2.3 }) => {
    slide.addShape(pptx.ShapeType.line, { x, y, w: 0, h, line: { color: t.accent, width: 3 } });
    slide.addText(`“${quote}”`, { ...text, fontFace: t.titleFontFace, italic: true, fontSize: 28, fit: 'shrink', x: x + 0.35, y, w: w - 0.35, h: h - 0.45 });
    if (attribution) slide.addText(attribution, { ...text, color: t.muted, fontSize: 14, x: x + 0.35, y: y + h - 0.3, w: w - 0.35, h: 0.2 });
  };
  const addStat = (slide, { value, label, detail, x, y, w = 2.8, h = 1.7, color = t.primary }) => {
    addCard(slide, { x, y, w, h });
    slide.addText(value, { ...text, fontFace: t.titleFontFace, color, bold: true, fontSize: 34, fit: 'shrink', x: x + 0.25, y: y + 0.25, w: w - 0.5, h: 0.5 });
    slide.addText(label, { ...text, bold: true, fontSize: 15, fit: 'shrink', x: x + 0.25, y: y + 0.86, w: w - 0.5, h: 0.24 });
    if (detail) slide.addText(detail, { ...text, color: t.muted, fontSize: 11, fit: 'shrink', x: x + 0.25, y: y + 1.18, w: w - 0.5, h: 0.22 });
  };
  const addTimeline = (slide, { items, x = t.margin, y = 3.2, w = t.slideWidth - (2 * t.margin) }) => {
    const step = items.length > 1 ? w / (items.length - 1) : 0;
    slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color: t.line, width: 2 } });
    items.forEach((item, index) => {
      const px = x + (step * index);
      slide.addShape(pptx.ShapeType.ellipse, { x: px - 0.1, y: y - 0.1, w: 0.2, h: 0.2, fill: { color: index === 0 ? t.accent : t.primary }, line: { color: 'FFFFFF', width: 1 } });
      slide.addText(item.title, { ...text, bold: true, fontSize: 14, align: 'center', fit: 'shrink', x: px - 0.75, y: y + 0.25, w: 1.5, h: 0.22 });
      if (item.detail) slide.addText(item.detail, { ...text, color: t.muted, fontSize: 11, align: 'center', fit: 'shrink', x: px - 0.75, y: y + 0.52, w: 1.5, h: 0.34 });
    });
  };
  const addProcess = (slide, { steps, x = t.margin, y = 2.5, w = t.slideWidth - (2 * t.margin), h = 1.35 }) => {
    const gap = 0.18; const boxW = (w - (gap * (steps.length - 1))) / steps.length;
    steps.forEach((step, index) => {
      const px = x + index * (boxW + gap); addCard(slide, { x: px, y, w: boxW, h, fill: index === 0 ? t.primary : t.surface, line: index === 0 ? t.primary : t.line });
      slide.addText(`${index + 1}`, { ...text, color: index === 0 ? t.accent : t.secondary, bold: true, fontSize: 13, x: px + 0.18, y: y + 0.2, w: 0.3, h: 0.2 });
      slide.addText(step, { ...text, color: index === 0 ? 'FFFFFF' : t.text, bold: true, fontSize: 15, fit: 'shrink', x: px + 0.18, y: y + 0.52, w: boxW - 0.36, h: 0.42 });
    });
  };
  const addComparison = (slide, { left, right, x = t.margin, y = 1.8, w = t.slideWidth - (2 * t.margin), h = 4.5 }) => {
    const gap = 0.28; const colW = (w - gap) / 2;
    [[left, x], [right, x + colW + gap]].forEach(([column, px]) => {
      addCard(slide, { x: px, y, w: colW, h, fill: column.fill || t.surface });
      slide.addText(column.title, { ...text, color: column.color || t.primary, bold: true, fontSize: 22, fit: 'shrink', x: px + 0.3, y: y + 0.3, w: colW - 0.6, h: 0.35 });
      slide.addText((column.items || []).map((item) => ({ text: item, options: { bullet: { indent: 14 }, hanging: 3, breakLine: true } })), { ...text, fontSize: 16, fit: 'shrink', x: px + 0.3, y: y + 0.95, w: colW - 0.6, h: h - 1.2, paraSpaceAfterPt: 10 });
    });
  };
  const addChart = (slide, { type, data, options = {} }) => slide.addChart(type, data, {
    x: t.margin, y: 1.65, w: 7.4, h: 4.6, showLegend: false, showTitle: false,
    catAxisLabelFontFace: t.fontFace, valAxisLabelFontFace: t.fontFace,
    chartColors: [t.primary, t.secondary, t.accent], ...options,
  });
  return { tokens: t, addTitle, addSubtitle, addFooter, addPageNumber, addCard, addImage, addTextBlock, addSectionHeader, addQuote, addStat, addTimeline, addProcess, addComparison, addChart };
}

module.exports = { createComponents, defaults };
