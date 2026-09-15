'use strict';

const EDIT_MODE = 'TARGETED';
const CHANGE_TYPES = Object.freeze([
  'TEXT_CONTENT', 'TEXT_STYLE', 'LAYOUT', 'VISUAL_REPLACEMENT', 'IMAGE_REPLACEMENT',
  'CONNECTOR', 'COLOR', 'TYPOGRAPHY', 'SIZE', 'POSITION', 'DELETE', 'ADD',
  'PEDAGOGICAL_CONTENT',
]);

function normalizeText(value) {
  return ` ${String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')} `;
}

function unique(values) { return [...new Set(values)]; }

function resolveSlideNumbers(request) {
  const text = normalizeText(request);
  const slides = [];
  const range = text.match(/\bslides?\s+(\d+)\s+(?:a|jusqu(?:'|’)a)\s+(\d+)\b/);
  if (range) {
    const start = Number(range[1]); const end = Number(range[2]);
    const step = start <= end ? 1 : -1;
    for (let value = start; value !== end + step; value += step) slides.push(value);
    return slides;
  }
  const list = text.match(/\bslides?\s+(\d+(?:\s*(?:,|et)\s*\d+)+)/);
  if (list) return unique((list[1].match(/\d+/g) || []).map(Number));
  const single = text.match(/\bslide\s+(\d+)\b/);
  return single ? [Number(single[1])] : [];
}

function inferElementSelector(request) {
  const text = normalizeText(request);
  const quoted = String(request || '').match(/[«“"]([^»”"]+)[»”"]/);
  if (quoted) return { kind: 'TEXT_MATCH', text: quoted[1].trim() };
  if (/\btitre\b/.test(text)) return { kind: 'TITLE' };
  if (/\bsous[- ]titre\b/.test(text)) return { kind: 'SUBTITLE' };
  if (/\bparagraphe\b/.test(text)) return { kind: 'PARAGRAPH' };
  if (/\bfleche\b|\bconnecteur\b/.test(text)) return { kind: 'CONNECTOR', relationHint: extractRelationHint(text) };
  if (/\bgraphique\b/.test(text)) return { kind: 'CHART' };
  if (/\bdiagramme\b/.test(text)) return { kind: 'DIAGRAM' };
  if (/\bicones?\b/.test(text)) return { kind: 'ICON' };
  if (/\bphotos?\b|\bimages?\b/.test(text)) return { kind: 'IMAGE' };
  if (/\billustrations?\b|\bdessins?\b/.test(text)) return { kind: 'ILLUSTRATION' };
  if (/\bformes?\b/.test(text)) return { kind: 'SHAPE' };
  return { kind: 'UNSPECIFIED_ELEMENT' };
}

function extractRelationHint(text) {
  const match = text.match(/\bentre\s+(.+?)\s+et\s+(.+?)(?:\.|,|$)/);
  return match ? { source: match[1].trim(), target: match[2].trim() } : null;
}

function elementMatches(element, slide, selector) {
  if (slide && Number(element.slide) !== Number(slide)) return false;
  const type = String(element.type || element.role || '').toUpperCase();
  if (selector.kind === 'TEXT_MATCH') return String(element.text || '').includes(selector.text);
  if (selector.kind === 'UNSPECIFIED_ELEMENT') return true;
  if (selector.kind === 'CONNECTOR' && selector.relationHint) {
    const haystack = normalizeText(`${element.label || ''} ${element.relation?.source || ''} ${element.relation?.target || ''}`);
    return type === 'CONNECTOR' && haystack.includes(selector.relationHint.source) && haystack.includes(selector.relationHint.target);
  }
  return type === selector.kind;
}

function resolveTargets(request, inventory = []) {
  const slides = resolveSlideNumbers(request);
  const selector = inferElementSelector(request);
  const requestedTargets = (slides.length ? slides : [null]).map((slide) => ({ slide, element: selector }));
  if (!inventory.length) return { status: 'RESOLVED_SELECTOR', targets: requestedTargets };
  const resolved = [];
  for (const target of requestedTargets) {
    const matches = inventory.filter((element) => elementMatches(element, target.slide, selector));
    if (matches.length > 1) return { status: 'AMBIGUOUS_TARGET', target, candidates: matches.map((item) => ({ slide: item.slide, id: item.id, type: item.type || item.role })) };
    if (matches.length === 1) resolved.push({ slide: Number(matches[0].slide), elementId: matches[0].id, element: selector });
    else resolved.push(target);
  }
  return { status: 'RESOLVED', targets: resolved };
}

function classifyChanges(request) {
  const text = normalizeText(request); const types = [];
  const add = (type, condition) => { if (condition) types.push(type); };
  add('TEXT_CONTENT', /\b(remplace|corrige|change)\b/.test(text) && /\b(texte|paragraphe|titre|etape|phrase)\b/.test(text));
  add('TEXT_STYLE', /\b(texte|paragraphe|titre|sous-titre)\b/.test(text) && /\b(style|couleur|vert|bleu|rouge|orange|violet|rose|jaune|noir|blanc|gris|police|taille|gras|italique|agrand)/.test(text));
  add('LAYOUT', /\b(layout|mise en page|disposition)\b/.test(text));
  add('VISUAL_REPLACEMENT', /\b(remplace|remplacer)\b/.test(text) && /\b(illustrations?|dessins?|visuels?|images?|photos?|icones?)\b/.test(text));
  add('IMAGE_REPLACEMENT', /\b(remplace|remplacer)\b/.test(text) && /\b(photos?|images?)\b/.test(text));
  add('CONNECTOR', /\b(fleche|connecteur)\b/.test(text));
  add('COLOR', /\b(vert|bleu|rouge|orange|violet|rose|jaune|noir|blanc|gris|couleur)\b/.test(text));
  add('TYPOGRAPHY', /\b(police|typographie|gras|italique)\b/.test(text));
  add('SIZE', /\b(agrand\w*|augment\w*|redui\w*|diminu\w*|taille)\b/.test(text));
  add('POSITION', /\b(deplace|position|pointe|align|centre)\b/.test(text));
  add('DELETE', /\b(supprime|retire|enleve)\b/.test(text));
  add('ADD', /\b(ajoute|insere)\b/.test(text));
  add('PEDAGOGICAL_CONTENT', /\b(etape|consigne|procedure|information|explication|objectif pedagogique)\b/.test(text) && /\b(remplace|corrige|change|ajoute|supprime)\b/.test(text));
  return unique(types).filter((type) => CHANGE_TYPES.includes(type));
}

function resolveScope(request) {
  const text = normalizeText(request);
  const mentionsHandout = /\b(handout|support|page correspondante)\b/.test(text);
  const presentation = /\bslide/.test(text) || !mentionsHandout;
  return { presentation, handout: mentionsHandout, propagateEverywhere: /\b(partout|toutes les occurrences)\b/.test(text) };
}

function selectSource(projectFiles = []) {
  const files = new Set(projectFiles);
  if (files.has('presentation.js')) return { kind: 'JAVASCRIPT', path: 'presentation.js', regenerate: 'presentation.pptx', directPptxPatchAllowed: false };
  if (files.has('presentation.pptx')) return { kind: 'PPTX_ONLY', path: 'presentation.pptx', regenerate: null, directPptxPatchAllowed: true };
  return null;
}

function analyzeConsistency(changeTypes, targets, occurrences = [], scope = {}) {
  if (!changeTypes.includes('PEDAGOGICAL_CONTENT')) return { status: 'NONE', occurrences: [] };
  const targetSlides = new Set(targets.map((target) => target.slide).filter(Boolean));
  const related = occurrences.filter((item) => item.output !== 'presentation' || !targetSlides.has(Number(item.slide)));
  if (!related.length) return { status: 'NONE', occurrences: [] };
  return { status: scope.propagateEverywhere ? 'PROPAGATION_AUTHORIZED' : 'REVIEW_REQUIRED', occurrences: related };
}

function createTargetedEditPlan(input = {}) {
  const request = String(input.request || '').trim();
  if (!request) throw new TypeError('An edit request is required');
  const source = selectSource(input.projectFiles || []);
  if (!source) return { status: 'BLOCKED', code: 'NO_EDITABLE_PRESENTATION_SOURCE', editMode: EDIT_MODE };
  const targetResolution = resolveTargets(request, input.inventory || []);
  if (targetResolution.status === 'AMBIGUOUS_TARGET') return { status: 'AMBIGUOUS_TARGET', editMode: EDIT_MODE, ...targetResolution, source };
  const changes = classifyChanges(request);
  const scope = resolveScope(request);
  const consistencyImpact = analyzeConsistency(changes, targetResolution.targets, input.occurrences || [], scope);
  const imageOverride = changes.includes('IMAGE_REPLACEMENT') || (/\b(photos?|images?)\b/.test(normalizeText(request)) && /\bgenere\w*\b/.test(normalizeText(request)));
  const affectsText = changes.some((type) => ['TEXT_CONTENT', 'TEXT_STYLE', 'TYPOGRAPHY', 'SIZE'].includes(type));
  return {
    status: consistencyImpact.status === 'REVIEW_REQUIRED' ? 'CONSISTENCY_REVIEW_REQUIRED' : 'READY',
    editMode: EDIT_MODE, source, targets: targetResolution.targets, changes, scope,
    preserve: ['all untargeted elements', 'all untargeted slides', 'brand', 'layout unless explicitly targeted', 'master content unless propagation is authorized', 'handout unless explicitly targeted'],
    permittedLocalAdaptations: ['overflow', 'collision', 'clipping', 'off-slide placement', 'readability'],
    forbiddenGlobalReruns: ['AUTO_STYLE', 'PROFILE_SELECTION', 'BRAND_RESOLUTION', 'PAGE_BUDGET', 'STORYBOARD', 'GLOBAL_ART_DIRECTION'],
    consistencyImpact,
    imageReplacement: imageOverride ? { userOverride: true, preserveGeometry: true, requiresVisualIntelligence: true, requiresMandatoryPipeline: true, runtimeIndependent: true } : null,
    validation: {
      targetedSlides: unique(targetResolution.targets.map((target) => target.slide).filter(Boolean)),
      compareUntouchedSlides: true,
      validateHandout: scope.handout,
      readabilityRegression: affectsText ? {
        required: true,
        validator: 'validateTargetedEditReadability',
        failureCode: 'TARGETED_EDIT_READABILITY_REGRESSION',
      } : { required: false },
    },
  };
}

module.exports = { EDIT_MODE, CHANGE_TYPES, resolveSlideNumbers, inferElementSelector, resolveTargets, classifyChanges, resolveScope, selectSource, analyzeConsistency, createTargetedEditPlan };
