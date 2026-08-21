'use strict';

const { resolveBrand } = require('./brands');

function resolveShapeType(pptx, dependencies = {}) {
  const shapeType = dependencies.ShapeType || dependencies.shapeType || pptx?.ShapeType;
  if (!shapeType) throw new TypeError('Brand components require ShapeType from the PptxGenJS instance or explicit dependencies');
  return shapeType;
}

function createBrandComponents(pptx, brandInput = 'EPN_RIVIERE_SALEE', dependencies = {}) {
  const brand = resolveBrand(brandInput);
  if (!brand) throw new RangeError('A BRAND is required for brand components');
  const ShapeType = resolveShapeType(pptx, dependencies);
  const P = brand.palette; const G = brand.graphicSignature; const C = brand.components;
  const addGraphicSignature = (slide, { x, y, scale = 1 } = {}) => {
    slide.addShape(ShapeType.line, { x, y: y + .11 * scale, w: .62 * scale, h: 0, line: { color: G.segment, width: 4 * scale } });
    slide.addShape(ShapeType.ellipse, { x: x + .57 * scale, y, w: .22 * scale, h: .22 * scale, fill: { color: G.dot }, line: { transparency: 100 } });
    slide.addShape(ShapeType.roundRect, { x: x + .86 * scale, y: y + .02 * scale, w: .38 * scale, h: .18 * scale, rectRadius: .08 * scale, fill: { color: G.capsule }, line: { transparency: 100 } });
  };
  const addPedagogicalCallout = (slide, kind, value, { x, y, w, h = 1.05 } = {}) => {
    const token = C[String(kind).toLowerCase()]; if (!token) throw new RangeError(`Unknown EPN callout: ${kind}`);
    slide.addShape(ShapeType.roundRect, { x, y, w, h, rectRadius: .06, fill: { color: token.fill }, line: { color: token.accent, transparency: 20 } });
    slide.addShape(ShapeType.rect, { x, y, w: .14, h, fill: { color: token.accent }, line: { transparency: 100 } });
    slide.addText(token.label, { x: x + .28, y: y + .14, w: w - .48, h: .28, fontFace: 'Arial', fontSize: 15, bold: true, color: P.text, margin: 0 });
    slide.addText(value, { x: x + .28, y: y + .52, w: w - .48, h: h - .62, fontFace: 'Arial', fontSize: 14, color: P.text, margin: 0, fit: 'shrink' });
  };
  const addActionSteps = (slide, steps, { x, y, w, orientation = 'HORIZONTAL', finalAccent = true, bodySize = 14, verbSize = 18 } = {}) => {
    const horizontal = String(orientation).toUpperCase() !== 'VERTICAL'; const gap = horizontal ? w / Math.max(steps.length - 1, 1) : .95;
    if (horizontal && steps.length > 1) slide.addShape(ShapeType.line, { x: x + .3, y: y + .34, w: w - .6, h: 0, line: { color: C.steps.path, width: 4 } });
    steps.forEach((step, index) => { const px = horizontal ? x + gap * index : x; const py = horizontal ? y : y + gap * index; const final = finalAccent && index === steps.length - 1;
      slide.addShape(ShapeType.ellipse, { x: px, y: py, w: .68, h: .68, fill: { color: final ? C.steps.finalNumber : C.steps.number }, line: { color: P.background, width: 1.5 } });
      slide.addText(String(index + 1), { x: px, y: py + .04, w: .68, h: .5, fontFace: 'Arial', fontSize: 18, bold: true, align: 'center', color: final ? P.text : 'FFFFFF', margin: 0 });
      slide.addText(String(step.verb || step.title || step).toUpperCase(), { x: px + .82, y: py - .02, w: horizontal ? Math.max(1.25, gap - .92) : w - .82, h: .28, fontFace: 'Arial', fontSize: verbSize, bold: true, color: P.text, margin: 0, fit: 'shrink' });
      if (step.detail) slide.addText(step.detail, { x: px + .82, y: py + .34, w: horizontal ? Math.max(1.25, gap - .92) : w - .82, h: .3, fontFace: 'Arial', fontSize: bodySize, color: P.muted, margin: 0, fit: 'shrink' });
    });
  };
  const addBrandFooter = (slide, page, { courseName = '', y = 7.08, slideWidth = 13.333, margin = .68 } = {}) => {
    addGraphicSignature(slide, { x: margin, y: y + .01, scale: .55 });
    const label = courseName ? `${brand.metadata.signature} • ${courseName}` : brand.metadata.signature;
    slide.addText(label, { x: margin + .78, y, w: 7.4, h: .2, fontFace: 'Arial', fontSize: 10.5, color: P.muted, margin: 0, fit: 'shrink' });
    slide.addText(String(page), { x: slideWidth - margin - .6, y, w: .6, h: .2, fontFace: 'Arial', fontSize: 10.5, bold: true, color: P.muted, align: 'right', margin: 0 });
  };
  return { brand, addGraphicSignature, addPedagogicalCallout, addActionSteps, addBrandFooter };
}

module.exports = { createBrandComponents, resolveShapeType };
