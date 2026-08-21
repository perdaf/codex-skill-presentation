'use strict';

module.exports = Object.freeze({
  id: 'EPN_RIVIERE_SALEE',
  metadata: Object.freeze({
    visibleName: 'EPN de Rivière-Salée',
    signature: 'EPN de Rivière-Salée • Atelier numérique',
    benchmark: 'epn-riviere-salee-design-test-v3/',
  }),
  palette: Object.freeze({
    background: 'FAFAF7', surface: 'FFFFFF', text: '243447', primary: '243447',
    secondary: 'A9D6E5', accent: 'F3B6A5', muted: '536272', line: 'D6DEDF',
    bluePastel: 'A9D6E5', mint: 'BFDCCB', coral: 'F3B6A5', yellow: 'F4DFA0',
    chart: Object.freeze(['243447', 'A9D6E5', 'BFDCCB', 'F3B6A5', 'F4DFA0']),
  }),
  typography: Object.freeze({
    face: 'Arial', boldFace: 'Arial',
    minimumSizes: Object.freeze({ display: 40, title: 30, subtitle: 20, body: 18, caption: 11, stat: 38 }),
  }),
  graphicSignature: Object.freeze({
    kind: 'SEGMENT_DOT_CAPSULE', segment: 'A9D6E5', dot: 'F3B6A5', capsule: 'BFDCCB',
    usage: Object.freeze(['TITLE', 'ACTIVITY', 'FOOTER']), sparse: true, isLogo: false,
  }),
  components: Object.freeze({
    retain: Object.freeze({ label: 'À RETENIR', fill: 'EAF4F8', accent: 'A9D6E5' }),
    practice: Object.freeze({ label: 'À VOUS DE JOUER', fill: 'EEF6F1', accent: 'BFDCCB' }),
    warning: Object.freeze({ label: 'ATTENTION', fill: 'FBEDE8', accent: 'F3B6A5' }),
    tip: Object.freeze({ label: 'ASTUCE', fill: 'FCF7E6', accent: 'F4DFA0' }),
    steps: Object.freeze({ number: '243447', finalNumber: 'F3B6A5', path: 'A9D6E5', background: 'FAFAF7', verbDominant: true }),
  }),
  projection: Object.freeze({
    principle: 'COMPRENDRE + VOIR + PRATIQUER', synthetic: true, preserveNegativeSpace: true,
    largeType: true, visualPresence: 'HIGH_WHEN_FUNCTIONAL', reproduceMasterContent: false,
  }),
  handout: Object.freeze({
    principle: 'COMPRENDRE + REFAIRE SEUL', format: 'A4_PORTRAIT', autonomous: true,
    printFriendly: true, mostlyWhite: true, largePastelAreas: false, reuseProjectionImages: false,
    markers: Object.freeze(['SMALL_PASTEL_NUMBERS', 'THIN_COLORED_LINES', 'TITLE_ACCENTS', 'FUNCTIONAL_CALLOUTS', 'DISCREET_SIGNATURE']),
  }),
  imageArtDirection: Object.freeze({
    benchmarkQualityOnly: true, style: 'premium-contemporary-editorial-educational',
    palette: 'EPN_PASTELS_WITH_NAVY_DETAIL', finish: 'PROFESSIONAL', texture: 'SUBTLE',
    exclusions: Object.freeze(['CHILDISH_CARTOON', 'CLIPART', 'SIMPLISTIC_GEOMETRIC_CHARACTER', 'PLASTIC_3D', 'GENERIC_CORPORATE', 'FAKE_INTERFACE', 'TEXT_IN_IMAGE']),
    audience: Object.freeze({
      senior: Object.freeze({ mood: 'CALM', objectRecognition: 'VERY_HIGH', gestureClarity: 'EXPLICIT', simultaneousElements: 'FEW' }),
      kids: Object.freeze({ mood: 'EXPRESSIVE', movement: 'MORE', quality: 'EDITORIAL_NOT_CHILDISH' }),
      education: Object.freeze({ mood: 'PEDAGOGICAL', illustrationDiagramBalance: 'BALANCED' }),
    }),
  }),
});
