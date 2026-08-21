# Intent & Preset Layer

V4.4 translates natural-language requests into configuration for the existing engines. It does not replace AUTO STYLE, Teaching, Brand, Visual Intelligence, ImageGen, rendering, or validation.

## Resolution order

Always apply:

1. explicit user constraint;
2. preset;
3. automatic inference;
4. safe default.

Use `resolveIntent(request, structuredExplicit?)` from `assets/intent-layer.js`. The returned object preserves intent, subject, audience, normalized duration, brand, profile, content depth, delivery, resolved page budget, research strategy, learning goals, prerequisites, exclusions, explicit constraints, inferred values, ambiguities, and a resolution trace. `explainResolution()` produces a compact human-readable audit.

## Supported intents and presets

Keep the intent vocabulary deliberately small: `COURSE`, `WORKSHOP`, and `PRESENTATION`.

| Preset | Main configuration |
| --- | --- |
| `EPN_SENIOR_COURSE` | EPN brand, Senior, ultra-detailed, dual, thorough research |
| `EPN_KIDS_WORKSHOP` | EPN brand, Kids, simple, projection, light research |
| `EPN_ADULT_TRAINING` | EPN brand, Education, detailed, dual, verified research |
| `GENERAL_PRESENTATION` | no brand, AUTO STYLE, simple, projection |

Preset resolution uses normalized complete words and contextual combinations, particularly EPN plus audience. Do not use substring matching. A sentinel such as `AUTO_STYLE` or `AUTO` delegates only that value to inference; it does not weaken fixed preset values.

## Explicit constraints

Natural phrases such as “uniquement la présentation”, “pas de handout”, “présentation et fiche”, “très détaillé”, “reste synthétique”, “maximum 8 pages”, and explicit durations override presets. Structured explicit values may also be supplied as the second argument. Preserve user-provided prerequisites, focus areas, and exclusions rather than reducing the request to the preset.

## AUTO page budget

`resolveAutoPageBudget()` considers duration, audience, depth, delivery, notions, procedures, exercises, and handout autonomy. It selects `COMPACT`, `STANDARD`, or `EXTENDED` through a transparent score; duration alone never determines the result. An explicit numeric budget is never replaced. When the explicit target is materially tighter than the AUTO estimate, return `tension: true` and explain that pedagogical compression should precede any requested expansion.

Projection richness must not automatically increase the print budget. Continue to preserve readable type, essential steps, and Teaching Engine compression rules.

## Research and ambiguity

Start with the preset strategy, then elevate it for current software procedures, institutional services, security, administrative processes, volatile interfaces, or detailed high-risk content. An explicitly supplied research strategy remains authoritative.

Do not ask for every absent detail. Record a material ambiguity only when the preset and context cannot safely determine the deliverable. `confidence` and `ambiguities` make this inspectable without forcing a question.
