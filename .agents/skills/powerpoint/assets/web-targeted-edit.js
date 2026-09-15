'use strict';

const crypto = require('node:crypto');
const base = require('./targeted-edit');
const { resolveInteractionMethod } = require('./web-interactions');

function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, ''); }

function detectWebProject(projectFiles = []) {
  const files = new Set(projectFiles.map(normalizePath));
  const prefixes = ['', 'presentation-web/'];
  for (const prefix of prefixes) {
    if (files.has(`${prefix}index.html`) && files.has(`${prefix}styles.css`) && files.has(`${prefix}presentation.js`)) {
      return { root: prefix.replace(/\/$/, ''), index: `${prefix}index.html`, styles: `${prefix}styles.css`, runtime: `${prefix}presentation.js` };
    }
  }
  return null;
}

function classifyWebInteraction(request = '') {
  const text = String(request).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/une\s+par\s+une|progressivement|etape\s+par\s+etape/.test(text)) return resolveInteractionMethod({ interactionMethod: 'STEP_SEQUENCE', progressiveDisclosure: true });
  if (/revele|affiche\s+la\s+reponse/.test(text)) return resolveInteractionMethod({ interactionMethod: 'QUIZ_REVEAL' });
  if (/avant\s*\/\s*apres|avant\s+apres/.test(text)) return resolveInteractionMethod({ interactionMethod: 'BEFORE_AFTER' });
  if (/zoom|mets?\s+en\s+evidence|surligne/.test(text)) return resolveInteractionMethod({ interactionMethod: 'HIGHLIGHT' });
  return null;
}

function resolveWebTargets(request, inventory = []) {
  const text = String(request).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slides = base.resolveSlideNumbers(request);
  const selectors = [];
  if (/\btitre\b/.test(text)) selectors.push({ kind: 'TITLE' });
  if (/\billustration|\bdessin|\bvisuel/.test(text)) selectors.push({ kind: 'ILLUSTRATION' });
  if (/\betapes?\b/.test(text)) selectors.push({ kind: 'STEP_GROUP' });
  if (!selectors.length) return base.resolveTargets(request, inventory);
  const targets = [];
  for (const slide of slides.length ? slides : [null]) {
    for (const element of selectors) {
      const matches = inventory.filter((item) => (!slide || Number(item.slide) === Number(slide))
        && String(item.type || item.role || '').toUpperCase() === element.kind);
      if (matches.length > 1) return { status: 'AMBIGUOUS_TARGET', target: { slide, element }, candidates: matches.map((item) => ({ slide: item.slide, id: item.id, type: item.type || item.role })) };
      targets.push(matches.length === 1 ? { slide: Number(matches[0].slide), elementId: matches[0].id, element } : { slide, element });
    }
  }
  return { status: inventory.length ? 'RESOLVED' : 'RESOLVED_SELECTOR', targets };
}

function impactedWebFiles(baseChanges, interaction, webProject) {
  const files = new Set();
  if (baseChanges.some((type) => ['TEXT_CONTENT', 'VISUAL_REPLACEMENT', 'IMAGE_REPLACEMENT', 'DELETE', 'ADD', 'PEDAGOGICAL_CONTENT'].includes(type))) files.add(webProject.index);
  if (baseChanges.some((type) => ['TEXT_STYLE', 'LAYOUT', 'COLOR', 'TYPOGRAPHY', 'SIZE', 'POSITION'].includes(type))) files.add(webProject.styles);
  if (interaction) files.add(webProject.index);
  return [...files];
}

function createWebTargetedEditPlan(input = {}) {
  const request = String(input.request || '').trim();
  if (!request) throw new TypeError('An edit request is required');
  const webProject = detectWebProject(input.projectFiles || []);
  if (!webProject) return base.createTargetedEditPlan(input);
  const targetResolution = resolveWebTargets(request, input.inventory || []);
  if (targetResolution.status === 'AMBIGUOUS_TARGET') {
    return { status: 'AMBIGUOUS_TARGET', editMode: base.EDIT_MODE, ...targetResolution, source: { kind: 'WEB_PROJECT', ...webProject } };
  }
  const changes = base.classifyChanges(request);
  const interaction = classifyWebInteraction(request);
  const scope = base.resolveScope(request);
  const consistencyImpact = base.analyzeConsistency(changes, targetResolution.targets, input.occurrences || [], scope);
  const targetedSlides = [...new Set(targetResolution.targets.map((target) => target.slide).filter(Boolean))];
  const imageReplacement = changes.includes('IMAGE_REPLACEMENT') || (/photo|image/.test(request.toLowerCase()) && /gener/.test(request.toLowerCase()));
  const affectsText = changes.some((type) => ['TEXT_CONTENT', 'TEXT_STYLE', 'TYPOGRAPHY', 'SIZE'].includes(type));
  return Object.freeze({
    status: consistencyImpact.status === 'REVIEW_REQUIRED' ? 'CONSISTENCY_REVIEW_REQUIRED' : 'READY',
    editMode: base.EDIT_MODE,
    presentationFormat: 'HTML',
    source: Object.freeze({ kind: 'WEB_PROJECT', ...webProject, directDomPatchAllowed: true }),
    targets: targetResolution.targets,
    changes,
    interaction,
    scope,
    impactedFiles: impactedWebFiles(changes, interaction, webProject),
    preserve: Object.freeze(['all untargeted slide sections', 'all untargeted components', 'brand', 'global CSS unless explicitly targeted', 'master content unless propagation is authorized', 'handout unless explicitly targeted']),
    forbiddenGlobalReruns: Object.freeze(['AUTO_STYLE', 'PROFILE_SELECTION', 'BRAND_RESOLUTION', 'PAGE_BUDGET', 'STORYBOARD', 'GLOBAL_ART_DIRECTION']),
    consistencyImpact,
    imageReplacement: imageReplacement ? Object.freeze({ userOverride: true, preserveGeometry: true, requiresVisualIntelligence: true, requiresMandatoryPipeline: true, runtimeIndependent: true, localAssetRequired: true }) : null,
    validation: Object.freeze({
      targetedSlides,
      compareUntouchedSlideFingerprints: true,
      validator: 'validateWebPresentationProject',
      browserInteractionRequired: Boolean(interaction),
      readabilityRegression: affectsText ? Object.freeze({ required: true, validator: 'validateTargetedEditReadability', failureCode: 'TARGETED_EDIT_READABILITY_REGRESSION' }) : Object.freeze({ required: false }),
    }),
  });
}

function extractSlideSections(html = '') {
  const sections = new Map();
  const pattern = /<section\b[^>]*\bclass=["'][^"']*\bweb-slide\b[^>]*\bdata-slide-index=["'](\d+)["'][^>]*>[\s\S]*?<\/section>/gi;
  let match;
  while ((match = pattern.exec(String(html)))) sections.set(Number(match[1]), match[0]);
  return sections;
}

function fingerprint(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }

function validateUntargetedSlidesPreserved(beforeHtml, afterHtml, targetedSlides = []) {
  const targets = new Set(targetedSlides.map(Number));
  const before = extractSlideSections(beforeHtml); const after = extractSlideSections(afterHtml);
  const changed = [];
  before.forEach((section, slide) => {
    if (!targets.has(slide) && fingerprint(section) !== fingerprint(after.get(slide) || '')) changed.push(slide);
  });
  return Object.freeze({ passed: changed.length === 0 && before.size === after.size, changedUntargetedSlides: changed, beforeCount: before.size, afterCount: after.size });
}

module.exports = {
  detectWebProject,
  classifyWebInteraction,
  resolveWebTargets,
  impactedWebFiles,
  createWebTargetedEditPlan,
  extractSlideSections,
  validateUntargetedSlidesPreserved,
};
