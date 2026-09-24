# Gamma Presentation Blueprint

Read this reference whenever Gamma should generate or render the slides.

## Responsibility boundary

Gamma is a rendering engine, not the pedagogical author. Before export, the skill must complete:

`CONTEXT → INTENT → RESEARCH → TEACHING ENGINE → CONTENT ARCHITECTURE → BRAND → VISUAL INTELLIGENCE → GAMMA BLUEPRINT → VALIDATION`

Use `prepareGammaBlueprint()` from `assets/gamma-pipeline.js`. It reuses the existing request resolver, Teaching Engine, Brand Layer, Context Layer and Visual Intelligence. Do not build a separate lightweight Gamma plan.

The primary deliverable is `gamma-blueprint.md`. Research traceability belongs in the secondary `sources.md`. Never substitute a source list, research notes, or a simple outline for the blueprint.

## Resolution

An explicit Gamma request resolves to `PRESENTATION_FORMAT=GAMMA`; do not ask the direct-computer projection question. For `DUAL + GAMMA`, generate the blueprint and the existing A4 handout from the same master content.

## Complete architecture before compression

The account limit is `GAMMA_MAX_SLIDES=20`. Establish the complete learning architecture first, including all required objectives, prerequisites, demonstrations, procedures, practice, common errors, validation and synthesis. Then group compatible material intelligently.

Never slice an array at slide 20. When the final coherent architecture still exceeds 20 slides, return `GAMMA_BLUEPRINT_INCOMPLETE` with `GAMMA_SLIDE_LIMIT_EXCEEDED` as the reason and recompose or request a scope decision.

The resolved Teaching Engine page budget remains the first design target. The Gamma limit is only a hard ceiling; it does not force every deck toward 20 slides.

## Blueprint contract

Start exactly with:

```markdown
# GAMMA PRESENTATION BLUEPRINT

## Présentation
Sujet : ...
Public : ...
Contexte : ...
Durée : ...
Nombre de slides : ...
Langue : ...
```

Then include objectives, competencies, pedagogical direction, Brand-derived art direction, and explicit global generation instructions.

Every slide must define:

- `Rôle pédagogique`: why the slide exists and what must be understood;
- `Titre affiché` and optional exact subtitle;
- `Contenu affiché`: the concrete text or data Gamma must place on the slide;
- `Message essentiel`: the single takeaway;
- `Visuel`: `VISUAL_OPPORTUNITY`, `VISUAL_ROLE`, `IMAGE_METHOD`, expression, function, precise description, composition and exclusions;
- `Mise en page`: spatial structure and hierarchy;
- `Interaction / progression`: only when pedagogically useful;
- `Consignes Gamma`: specific rendering instructions that preserve the intended teaching move.

Gamma must not need to research, reconstruct the sequence, invent examples, fill placeholders, or turn slide titles into content.

## Research and sources

For volatile software or services, research current official primary sources before content architecture. Pass sources to the pipeline for `sources.md`; the blueprint renderer intentionally excludes URLs and source notes from `gamma-blueprint.md`.

`sources.md` is traceability for the author. `gamma-blueprint.md` is the generation input for Gamma.

## Brand and accessibility

`buildBrandDirection()` obtains palette, typography, projection rules and exclusions from the resolved Brand Layer. Do not manually duplicate EPN values in calling code. For `EPN_RIVIERE_SALEE`, the resulting blueprint must expose the actual off-white background, navy text, pastel accents, readable typography, airy projection behavior and visual exclusions.

When `PROFILE=SENIOR`, the blueprint must carry large text, strong contrast, few simultaneous elements and simple interactions. The validator blocks if Senior accessibility is absent.

When a slide genuinely contains people, preserve the resolved representation. `AUDIENCE_REPRESENTATION=MARTINIQUE` must reach that slide’s human representation instruction. Explicit no-character or alternative representation requests retain priority.

## Visual Intelligence

Provide a real visual intent for every slide before calling the pipeline. `resolveGammaVisual()` routes it through the existing Visual Intelligence functions. Do not write “add a beautiful image.” Describe the subject or object, its learning function, the relationship to slide content, composition, protected elements, and what to avoid.

Use real interface screenshots only when exact recognition is necessary and current evidence exists. Otherwise request a clearly labeled pedagogical schematic rather than an invented interface.

## Validation

Run `validateGammaBlueprint()` before writing files. It returns blocking code `GAMMA_BLUEPRINT_INCOMPLETE` when any material requirement fails, including:

- more than 20 slides;
- missing global objectives, pedagogical direction or art direction;
- slide without pedagogical stage, role, exact title, concrete content, essential message, layout or Gamma instructions;
- missing or generic visual direction for a material visual opportunity;
- placeholders such as “à compléter” or “à déterminer”;
- uncovered objective, competency or required topic;
- pedagogical order regression;
- missing Senior or human-representation constraints;
- embedded sources or a source-dominant document.

Write final files with `writeGammaBlueprintPackage()` only after validation passes. The final visual inspection remains external because Gamma performs the rendering. Do not call Gamma or any image/API provider while producing the blueprint.
