#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  GAMMA_MAX_SLIDES,
  GAMMA_BLUEPRINT_INCOMPLETE,
  resolveGammaSlideBudget,
  validateGammaBlueprint,
  createGammaBlueprintMarkdown,
  createGammaSourcesMarkdown,
  writeGammaBlueprintPackage,
} = require('../assets/gamma-export');
const { prepareGammaBlueprint } = require('../assets/gamma-pipeline');
const { resolveV46Intent } = require('../assets/presentation-format');

const CANVA_REQUEST = 'Crée-moi une présentation pour un atelier "Créer et imprimer une carte d\'invitation personnalisée avec Canva". Les objectifs pédagogiques et compétences sont : utiliser l\'outil de conception graphique en ligne Canva, choisir un modèle gratuit adapté, personnaliser textes et visuels, et générer un fichier prêt pour l\'impression.';

const objectives = [
  { id: 'obj-create', text: 'Créer une carte d’invitation personnalisée dans Canva.' },
  { id: 'obj-free', text: 'Choisir un modèle gratuit adapté à l’occasion.' },
  { id: 'obj-customize', text: 'Personnaliser les textes, les visuels et la lisibilité.' },
  { id: 'obj-print', text: 'Générer, vérifier et imprimer un fichier adapté.' },
];
const competencies = [
  { id: 'skill-canva', text: 'Utiliser l’outil de conception graphique en ligne Canva.' },
  { id: 'skill-template', text: 'Sélectionner un modèle gratuit pertinent.' },
  { id: 'skill-edit', text: 'Modifier textes, images et couleurs avec discernement.' },
  { id: 'skill-export', text: 'Exporter un PDF prêt pour l’impression.' },
];
const requiredTopics = [
  ['result', 'objectif et résultat final'], ['discover', 'découverte de Canva'], ['access', 'accès et création du design'],
  ['search', 'recherche d’un modèle d’invitation'], ['free', 'choix d’un modèle gratuit'], ['text', 'personnalisation du texte'],
  ['hierarchy', 'hiérarchie des informations'], ['visuals', 'remplacement des visuels'], ['colors', 'couleurs et lisibilité'],
  ['preflight', 'vérification avant impression'], ['dimensions', 'format et dimensions'], ['bleed', 'marges et fond perdu'],
  ['export', 'export adapté à l’impression'], ['pdf', 'vérification du PDF'], ['print', 'impression'],
  ['practice', 'exercice pratique'], ['errors', 'erreurs fréquentes'], ['validation', 'synthèse et validation des acquis'],
].map(([id, text]) => ({ id, text }));

function visual(kind, role, purpose, description, composition, extra = {}) {
  return { kind, role, purpose, description, composition, avoid: ['décoration sans fonction', 'fausse capture exacte non vérifiée'], ...extra };
}

function canvaSlides() {
  return [
    {
      stage: 'OUTCOME',
      pedagogicalRole: 'Donner une vision concrète du résultat final et rendre les objectifs de l’atelier observables.',
      title: 'Votre invitation, du modèle au papier',
      subtitle: 'Un atelier guidé dans Canva',
      content: ['Résultat attendu : une invitation personnalisée, lisible et prête à imprimer.', 'Parcours : choisir, personnaliser, vérifier, exporter.'],
      keyMessage: 'Nous allons fabriquer un document réel et vérifiable, pas seulement découvrir un outil.',
      visualIntent: visual('BEFORE_AFTER', 'DIAGRAM', 'Montrer immédiatement la transformation attendue.', 'À gauche, un modèle générique grisé ; à droite, une invitation finalisée avec date, lieu et visuel cohérent.', 'Comparaison horizontale avant/après, résultat final plus grand et clairement légendé.'),
      layout: 'Titre en haut, comparaison avant/après au centre, quatre verbes d’action en pied de slide.',
      interaction: 'Question d’ouverture : pour quelle occasion créeriez-vous une invitation ?',
      gammaInstructions: 'Afficher le résultat final comme preuve de réussite ; ne pas ajouter de procédure sur cette slide.',
      objectivesCovered: ['obj-create'], competenciesCovered: ['skill-canva'], topicsCovered: ['result', 'discover'],
    },
    {
      stage: 'DISCOVERY',
      pedagogicalRole: 'Préparer les informations indispensables et expliquer le rôle de Canva avant toute manipulation.',
      title: 'Avant Canva : préparez les bonnes informations',
      subtitle: 'Une invitation répond à cinq questions',
      content: ['Quoi ? l’événement.', 'Quand ? la date et l’heure.', 'Où ? l’adresse.', 'Pour qui ? les invités.', 'Comment répondre ? le contact et la date limite.', 'Choisir un format adapté à l’impression prévue.'],
      keyMessage: 'Un modèle ne remplace pas les informations essentielles de l’invitation.',
      visualIntent: visual('HIERARCHY', 'DIAGRAM', 'Faire mémoriser les cinq informations comme un système.', 'Une carte d’invitation centrale reliée à cinq zones nommées Quoi, Quand, Où, Pour qui et Répondre.', 'Diagramme radial très lisible, cinq branches maximum, aucun faux écran Canva.'),
      layout: 'Diagramme à gauche, courte consigne de préparation et rappel du format à droite.',
      interaction: 'Les participants choisissent une occasion et écrivent leurs cinq réponses.',
      gammaInstructions: 'Conserver exactement les cinq questions ; ne pas les remplacer par des catégories génériques.',
      objectivesCovered: ['obj-create'], competenciesCovered: ['skill-canva'], topicsCovered: ['hierarchy', 'dimensions'],
    },
    {
      stage: 'PROCEDURE',
      pedagogicalRole: 'Guider l’accès à Canva, la création du design et la recherche d’un modèle d’invitation.',
      title: 'Ouvrir Canva et trouver les invitations',
      subtitle: 'Partir du bon type de design',
      content: ['1. Ouvrir Canva et se connecter.', '2. Rechercher « Invitation » depuis l’accueil.', '3. Choisir le type de design correspondant.', '4. Parcourir les modèles proposés avant d’en ouvrir un.'],
      keyMessage: 'Commencer par le bon type de design évite de devoir tout redimensionner ensuite.',
      visualIntent: visual('PROCESS', 'PROCESS', 'Rendre visibles les quatre actions et leur ordre.', 'Quatre étapes numérotées avec les objets pédagogiques navigateur, loupe, carte et galerie.', 'Processus horizontal de gauche à droite avec flèches explicites et libellés exacts.'),
      layout: 'Procédure numérotée occupant toute la largeur ; une action et une icône fonctionnelle par étape.',
      interaction: 'Démonstration en direct, puis les participants reproduisent les quatre actions.',
      gammaInstructions: 'Ne pas inventer une capture de l’interface ; utiliser un schéma pédagogique clairement stylisé.',
      objectivesCovered: ['obj-create', 'obj-free'], competenciesCovered: ['skill-canva', 'skill-template'], topicsCovered: ['access', 'search'],
    },
    {
      stage: 'PROCEDURE',
      pedagogicalRole: 'Apprendre à distinguer un modèle gratuit exploitable d’un modèle ou élément nécessitant Canva Pro.',
      title: 'Choisir un modèle vraiment gratuit',
      subtitle: 'Beau, adapté et disponible',
      content: ['1. Observer les modèles proposés.', '2. Repérer les mentions ou symboles signalant le contenu Pro.', '3. Vérifier que les éléments utilisés sont gratuits.', '4. Choisir un modèle simple à personnaliser et adapté à l’occasion.'],
      keyMessage: 'Un beau modèle n’est utile que s’il convient à l’invitation et reste disponible gratuitement.',
      visualIntent: visual('CHOICE', 'DIAGRAM', 'Faire comparer une option gratuite et une option premium sans ambiguïté.', 'Galerie pédagogique de trois modèles : deux gratuits et un Pro, avec le modèle gratuit pertinent clairement sélectionné.', 'Grande galerie à droite, procédure courte numérotée à gauche, code visuel explicite Gratuit / Pro.'),
      layout: 'Colonne de quatre critères à gauche et galerie comparative dominante à droite.',
      interaction: 'Quiz oral : quel modèle choisir et quel indice vous a permis de décider ?',
      gammaInstructions: 'Afficher les critères concrets ; ne pas réduire la slide au conseil vague « choisissez un beau modèle ».',
      objectivesCovered: ['obj-free'], competenciesCovered: ['skill-template'], topicsCovered: ['free', 'errors'],
    },
    {
      stage: 'PROCEDURE',
      pedagogicalRole: 'Montrer comment remplacer les textes sans perdre la hiérarchie des informations.',
      title: 'Personnaliser le texte sans perdre la lisibilité',
      subtitle: 'Le titre attire ; les informations guident',
      content: ['Remplacer le titre par le nom réel de l’événement.', 'Saisir date, heure, lieu et contact sans modifier leur sens.', 'Garder le titre plus grand que les détails.', 'Limiter le nombre de polices et vérifier l’orthographe.', 'Relire à distance avant de continuer.'],
      keyMessage: 'La décoration attire l’œil, mais la hiérarchie permet de comprendre immédiatement.',
      visualIntent: visual('BEFORE_AFTER', 'DIAGRAM', 'Comparer un texte générique et une invitation correctement hiérarchisée.', 'Avant : YOUR PARTY, DATE, LOCATION. Après : Goûter de Léa, date, heure, adresse et réponse clairement hiérarchisés.', 'Deux cartes côte à côte, flèche centrale, trois règles de typographie en marge.'),
      layout: 'Comparaison avant/après sur les deux tiers ; règles courtes de lisibilité sur le dernier tiers.',
      interaction: 'Les participants remplacent les textes puis font relire leur invitation par un voisin.',
      gammaInstructions: 'Utiliser exactement les informations de l’exemple ; ne pas générer de faux texte illisible dans l’image.',
      objectivesCovered: ['obj-customize'], competenciesCovered: ['skill-edit'], topicsCovered: ['text', 'hierarchy'],
    },
    {
      stage: 'PROCEDURE',
      pedagogicalRole: 'Apprendre à remplacer les visuels et à choisir couleurs et contraste sans surcharger la composition.',
      title: 'Personnaliser les visuels avec mesure',
      subtitle: 'Un style cohérent reste facile à lire',
      content: ['Choisir une photo nette ou une illustration principale.', 'Remplacer l’image sans masquer les informations.', 'Utiliser deux ou trois couleurs cohérentes.', 'Conserver un contraste fort entre texte et fond.', 'Éviter trop d’éléments, d’effets et de polices.'],
      keyMessage: 'Chaque visuel doit soutenir l’occasion et laisser les informations faciles à lire.',
      visualIntent: visual('COMPARISON', 'DIAGRAM', 'Rendre perceptible la différence entre composition chargée et composition lisible.', 'Deux invitations : l’une encombrée et peu contrastée, l’autre avec un seul visuel, trois couleurs et un texte net.', 'Comparaison équilibrée avec critères communs, coche sur la version lisible et avertissements sur la version chargée.'),
      layout: 'Comparaison centrale ; cinq règles courtes alignées sous les deux exemples.',
      interaction: 'Test à deux mètres : le titre, la date et le lieu restent-ils lisibles ?',
      gammaInstructions: 'Ne pas ajouter de photo décorative autonome ; la comparaison est le principal objet visuel.',
      objectivesCovered: ['obj-customize'], competenciesCovered: ['skill-edit'], topicsCovered: ['visuals', 'colors'],
    },
    {
      stage: 'PROCEDURE',
      pedagogicalRole: 'Sécuriser la préparation du fichier, l’export PDF et l’impression en faisant apparaître les contrôles critiques.',
      title: 'Vérifier, exporter, puis imprimer',
      subtitle: 'Le contrôle vient avant le clic final',
      content: ['1. Vérifier format, orientation, orthographe et qualité des images.', '2. Garder les textes dans les marges ; prolonger le fond dans le fond perdu si nécessaire.', '3. Choisir Partager > Télécharger > PDF pour impression.', '4. Ouvrir le PDF et contrôler chaque page.', '5. Faire une impression test à l’échelle 100 % avant plusieurs exemplaires.', 'Erreurs fréquentes : élément Pro oublié, texte trop près du bord, image floue, mauvais format ou mise à l’échelle automatique.'],
      keyMessage: 'Un fichier n’est prêt à imprimer qu’après vérification du PDF et impression d’un exemplaire test.',
      visualIntent: visual('PROCESS', 'PROCESS', 'Montrer la chaîne de contrôle complète sans perdre les erreurs fréquentes.', 'Flux en cinq étapes : vérification, marges/fond perdu, PDF pour impression, contrôle du PDF, impression test ; panneau d’alerte pour les erreurs.', 'Processus horizontal ou en boucle, panneau erreurs distinct, libellés suffisamment grands pour la projection.'),
      layout: 'Processus principal sur les deux tiers supérieurs ; erreurs fréquentes dans un encadré d’alerte en bas.',
      interaction: 'Progression étape par étape ; demander à un participant d’expliquer le contrôle suivant.',
      gammaInstructions: 'Conserver les libellés vérifiés et toutes les étapes ; ne pas remplacer « PDF pour impression » par « télécharger le fichier ».',
      objectivesCovered: ['obj-print'], competenciesCovered: ['skill-export'], topicsCovered: ['preflight', 'bleed', 'export', 'pdf', 'print', 'errors'],
    },
    {
      stage: 'VALIDATION',
      pedagogicalRole: 'Faire pratiquer l’ensemble de la procédure et vérifier que chaque compétence peut être mobilisée en autonomie.',
      title: 'Défi final : votre invitation prête à imprimer',
      subtitle: 'Créer, contrôler et expliquer vos choix',
      content: ['Choisir une occasion réelle et un modèle gratuit.', 'Créer l’invitation avec les cinq informations indispensables.', 'Personnaliser texte, visuel et couleurs.', 'Exporter puis ouvrir le PDF pour impression.', 'Validation : modèle gratuit, informations complètes, lecture facile, marges sûres et PDF correct.'],
      keyMessage: 'La réussite se vérifie par un fichier imprimable et par la capacité à expliquer ses choix.',
      visualIntent: visual('SCENARIO', 'DIAGRAM', 'Transformer les critères de réussite en checklist utilisable pendant l’exercice.', 'Checklist de mission avec cinq critères, associée à une petite invitation terminée et un pictogramme PDF.', 'Mission à gauche, checklist de validation à droite, synthèse des quatre verbes en pied de slide.'),
      layout: 'Deux colonnes équilibrées : consigne pratique puis critères de réussite ; synthèse visible en bas.',
      interaction: 'Exercice individuel, vérification en binôme, puis autoévaluation orale avec la checklist.',
      gammaInstructions: 'Faire de la checklist l’outil principal de validation ; ne pas conclure par une formule générique de remerciement.',
      objectivesCovered: ['obj-create', 'obj-free', 'obj-customize', 'obj-print'], competenciesCovered: ['skill-canva', 'skill-template', 'skill-edit', 'skill-export'], topicsCovered: ['practice', 'validation'],
    },
  ];
}

function canvaInput(extra = {}) {
  return {
    request: CANVA_REQUEST,
    resolveOptions: { explicit: { presentationFormat: 'GAMMA', deliveryMode: 'PRESENTATION', audience: 'ADULT' } },
    title: 'Créer et imprimer une carte d’invitation personnalisée avec Canva',
    subject: 'Création et impression d’une invitation personnalisée avec Canva',
    audience: 'Adultes débutants',
    objectives,
    competencies,
    requiredTopics,
    slides: canvaSlides(),
    pedagogy: ['Démonstration guidée, reproduction immédiate, pratique autonome et validation par critères observables.'],
    artDirection: ['Univers pédagogique contemporain, clair et accueillant ; objets immédiatement reconnaissables.'],
    sources: [
      { title: 'Créateur de cartes d’invitation Canva', url: 'https://www.canva.com/create/invitation-cards/', note: 'Parcours général de création.' },
      { title: 'Marges, fond perdu et traits de coupe', url: 'https://www.canva.com/help/margins-bleed-crop-marks/', note: 'Procédure d’impression vérifiée.' },
    ],
    ...extra,
  };
}

assert.strictEqual(GAMMA_MAX_SLIDES, 20);
assert.deepStrictEqual(resolveGammaSlideBudget({ planned: 24 }), {
  max: 20, requested: null, planned: 24, target: 20, tension: true, status: 'NEEDS_PEDAGOGICAL_COMPRESSION',
});

for (const request of ['Crée un brief Gamma.', 'Génère un fichier Markdown pour Gamma.', 'Je veux que Gamma fasse les slides.']) {
  const resolved = resolveV46Intent(request);
  assert.strictEqual(resolved.presentationFormat, 'GAMMA');
  assert.strictEqual(resolved.requiresFormatClarification, false);
}

const canva = prepareGammaBlueprint(canvaInput());
assert.strictEqual(canva.status, 'READY', JSON.stringify(canva.validation?.errors));
assert.strictEqual(canva.model.slides.length, 8);
assert.strictEqual(canva.teaching.pageBudget.kind, 'COMPACT');
assert.strictEqual(canva.teaching.pageBudget.target, 7);
assert.strictEqual(canva.teaching.pageBudget.max, 8);
assert.strictEqual(canva.validation.uncoveredObjectives.length, 0);
assert.strictEqual(canva.validation.uncoveredCompetencies.length, 0);
assert.strictEqual(canva.validation.uncoveredTopics.length, 0);
assert.ok(canva.blueprintMarkdown.startsWith('# GAMMA PRESENTATION BLUEPRINT'));
assert.ok(canva.blueprintMarkdown.includes('## INSTRUCTIONS DE GÉNÉRATION POUR GAMMA'));
assert.ok(canva.blueprintMarkdown.includes('## SLIDE 04 — Choisir un modèle vraiment gratuit'));
assert.ok(canva.blueprintMarkdown.includes('### Rôle pédagogique'));
assert.ok(canva.blueprintMarkdown.includes('### Contenu affiché'));
assert.ok(canva.blueprintMarkdown.includes('VISUAL_ROLE : PROCESS'));
assert.ok(canva.blueprintMarkdown.includes('Garder les textes dans les marges'));
assert.ok(canva.blueprintMarkdown.includes('Erreurs fréquentes'));
assert.ok(canva.blueprintMarkdown.includes('Défi final'));
assert.ok(!canva.blueprintMarkdown.includes('https://www.canva.com/'));
assert.ok(canva.sourcesMarkdown.includes('https://www.canva.com/help/margins-bleed-crop-marks/'));
assert.deepStrictEqual(canva.deliverables, [
  { name: 'gamma-blueprint.md', primary: true },
  { name: 'sources.md', primary: false },
]);

const outline = validateGammaBlueprint({
  title: 'Outline', subject: 'Test', audience: 'Débutants', objectives: ['Comprendre'],
  pedagogy: ['Progression simple'], artDirection: ['Design lisible'],
  slides: [{ title: 'Introduction' }, { title: 'Découvrir Canva' }, { title: 'Conclusion' }],
});
assert.strictEqual(outline.valid, false);
assert.strictEqual(outline.code, GAMMA_BLUEPRINT_INCOMPLETE);
assert.ok(outline.errors.includes('SLIDE_1_CONCRETE_CONTENT_REQUIRED'));

const sourceDominant = validateGammaBlueprint({
  title: 'Sources', subject: 'Canva', audience: 'Débutants', objectives: ['Comprendre Canva'],
  pedagogy: ['Expliquer'], artDirection: ['Lisible'],
  slides: [{
    stage: 'SYNTHESIS', pedagogicalRole: 'Présenter très brièvement le sujet sans contenu pédagogique suffisant.', title: 'Canva',
    content: ['Canva est un outil de création graphique.'], keyMessage: 'Canva permet de créer.',
    visual: { opportunity: 'LOW', role: 'DECORATIVE', method: 'OPTIONAL' }, layout: 'Titre et phrase au centre.', gammaInstructions: 'Rester très simple et lisible.', objectivesCovered: ['Comprendre Canva'],
  }],
  sources: Array.from({ length: 6 }, (_, index) => ({ title: `Source ${index}`, url: `https://example.com/${index}` })),
});
assert.strictEqual(sourceDominant.valid, false);
assert.ok(sourceDominant.errors.includes('SOURCE_DOMINANT_BLUEPRINT'));

const placeholders = validateGammaBlueprint({ ...canvaInput(), slides: canvaSlides().map((slide, index) => index === 0 ? { ...slide, content: ['À compléter'] } : slide) });
assert.strictEqual(placeholders.valid, false);
assert.ok(placeholders.errors.includes('SLIDE_1_PLACEHOLDER_FORBIDDEN'));

const tooMany = prepareGammaBlueprint(canvaInput({ slides: Array.from({ length: 21 }, (_, index) => ({ ...canvaSlides()[0], title: `Slide ${index + 1}` })) }));
assert.strictEqual(tooMany.status, 'BLOCKED');
assert.strictEqual(tooMany.code, GAMMA_BLUEPRINT_INCOMPLETE);
assert.strictEqual(tooMany.reason, 'GAMMA_SLIDE_LIMIT_EXCEEDED');

const seniorSlides = canvaSlides();
seniorSlides[0] = {
  ...seniorSlides[0],
  visualIntent: visual('HUMAN_CONTEXT', 'EDITORIAL_SCENE', 'Permettre aux seniors de se reconnaître dans la situation d’apprentissage.',
    'Une animatrice accompagne deux seniors pendant la création d’une invitation sur ordinateur, attitudes calmes et gestes explicites.',
    'Scène humaine à droite, espace calme à gauche pour le titre, mains et écran non rognés.', { hasPeople: true }),
};
const epnSenior = prepareGammaBlueprint(canvaInput({
  request: `${CANVA_REQUEST} Public : seniors débutants.`,
  activeContext: 'EPN_RIVIERE_SALEE_CONTEXT',
  resolveOptions: { explicit: { presentationFormat: 'GAMMA', deliveryMode: 'PRESENTATION', audience: 'SENIOR' } },
  audience: 'Seniors débutants',
  slides: seniorSlides,
}));
assert.strictEqual(epnSenior.status, 'READY', JSON.stringify(epnSenior.validation?.errors));
assert.strictEqual(epnSenior.resolvedConfiguration.brand, 'EPN_RIVIERE_SALEE');
assert.strictEqual(epnSenior.resolvedConfiguration.audienceRepresentation, 'MARTINIQUE');
assert.strictEqual(epnSenior.model.accessibility.senior, true);
assert.ok(epnSenior.blueprintMarkdown.includes('Profil : SENIOR'));
assert.ok(epnSenior.blueprintMarkdown.includes('#FAFAF7'));
assert.ok(epnSenior.blueprintMarkdown.includes('#243447'));
assert.ok(epnSenior.blueprintMarkdown.includes('#A9D6E5'));
assert.ok(epnSenior.blueprintMarkdown.includes('martiniquaises / afro-antillaises'));
assert.ok(epnSenior.blueprintMarkdown.includes('VISUAL_ROLE : EDITORIAL_SCENE'));
assert.ok(epnSenior.blueprintMarkdown.includes('IMAGE_METHOD : IMAGEGEN'));

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gamma-blueprint-test-'));
try {
  const written = writeGammaBlueprintPackage(temporaryRoot, canva.model);
  assert.ok(fs.existsSync(written.blueprintPath));
  assert.ok(fs.existsSync(written.sourcesPath));
  assert.ok(fs.readFileSync(written.blueprintPath, 'utf8').includes('## SLIDE 08'));
  assert.ok(!fs.readFileSync(written.blueprintPath, 'utf8').includes('https://www.canva.com/'));
  assert.ok(fs.readFileSync(written.sourcesPath, 'utf8').includes('https://www.canva.com/'));
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

assert.throws(
  () => createGammaBlueprintMarkdown({ title: 'Incomplet' }),
  (error) => error.code === GAMMA_BLUEPRINT_INCOMPLETE,
);
assert.ok(createGammaSourcesMarkdown(canva.model).startsWith('# Sources et traçabilité'));

console.log('Gamma Presentation Blueprint assertions passed (Canva regression: 8 slides)');
