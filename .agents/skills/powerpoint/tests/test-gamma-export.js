#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const {
  GAMMA_MAX_SLIDES,
  representationInstruction,
  resolveGammaSlideBudget,
  validateGammaBrief,
  createGammaMarkdown,
} = require('../assets/gamma-export');
const { resolveV46Intent } = require('../assets/presentation-format');

assert.strictEqual(GAMMA_MAX_SLIDES, 20);

for (const request of [
  'Crée un brief Gamma pour cette présentation.',
  'Génère un fichier Markdown pour Gamma.',
  'Je veux que Gamma fasse les slides.',
]) {
  const resolved = resolveV46Intent(request);
  assert.strictEqual(resolved.presentationFormat, 'GAMMA', request);
  assert.strictEqual(resolved.requiresFormatClarification, false, request);
  assert.deepStrictEqual(resolved.deliverables, [
    { kind: 'PRESENTATION', format: 'GAMMA', artifact: 'MARKDOWN', maxSlides: 20 },
  ]);
}

const conflict = resolveV46Intent('Crée un fichier Gamma et un PPTX pour la même présentation.');
assert.strictEqual(conflict.presentationFormat, 'AUTO');
assert.strictEqual(conflict.requiresFormatClarification, true);

const dualGamma = resolveV46Intent('Crée un brief Gamma avec une fiche à remettre aux participants.');
assert.strictEqual(dualGamma.deliveryMode, 'DUAL');
assert.deepStrictEqual(dualGamma.deliverables, [
  { kind: 'PRESENTATION', format: 'GAMMA', artifact: 'MARKDOWN', maxSlides: 20 },
  { kind: 'HANDOUT', format: 'PDF', page: 'A4' },
]);

assert.deepStrictEqual(resolveGammaSlideBudget({ requested: 12 }), {
  max: 20, requested: 12, planned: null, target: 12, tension: false, status: 'READY',
});
assert.deepStrictEqual(resolveGammaSlideBudget({ planned: 24 }), {
  max: 20, requested: null, planned: 24, target: 20, tension: true, status: 'NEEDS_PEDAGOGICAL_COMPRESSION',
});

const slides = [
  {
    title: 'Bienvenue',
    objective: 'Créer un premier contact',
    keyMessage: 'Nous allons apprendre ensemble.',
    content: ['Une présentation claire', 'Des exemples concrets'],
    visual: 'Une animatrice et un groupe en situation réelle',
    layout: 'Grande scène à droite, titre à gauche',
    hasPeople: true,
  },
  {
    title: 'À vous de jouer',
    content: ['Choisissez la bonne réponse'],
    visual: 'Deux options très lisibles',
    participation: 'Vote à main levée',
  },
];

const validation = validateGammaBrief({ title: 'Test', slides });
assert.strictEqual(validation.valid, true);
assert.strictEqual(validation.slideCount, 2);

const markdown = createGammaMarkdown({
  title: 'Test Gamma',
  audience: 'adultes débutants',
  objective: 'Comprendre une notion',
  pedagogy: ['Faire participer le public'],
  artDirection: ['Palette chaleureuse et contrastée'],
  slides,
});
assert.ok(markdown.includes('Nombre exact de slides : 2'));
assert.ok(markdown.includes('Limite absolue : 20 slides'));
assert.ok(markdown.includes('personnes afro-antillaises contemporaines'));
assert.ok(markdown.includes('Slide 01 — Bienvenue'));
assert.ok(markdown.includes('Participation / animation :** Vote à main levée'));

const noPeople = createGammaMarkdown({
  title: 'Sans personnages',
  audienceRepresentation: null,
  slides: [{ title: 'Schéma', content: ['Étape 1'], visual: 'Un processus abstrait', hasPeople: true }],
});
assert.ok(noPeople.includes('Ne représenter aucune personne.'));

const explicitRepresentation = representationInstruction('JAPANESE');
assert.ok(explicitRepresentation.includes('japanese'));
assert.ok(!explicitRepresentation.includes('afro-antillaises'));

const tooMany = Array.from({ length: 21 }, (_, index) => ({ title: `Slide ${index + 1}`, content: ['Contenu'] }));
assert.throws(
  () => createGammaMarkdown({ title: 'Trop long', slides: tooMany }),
  (error) => error.code === 'GAMMA_SLIDE_LIMIT_EXCEEDED',
);

console.log('Gamma Markdown export assertions passed');
