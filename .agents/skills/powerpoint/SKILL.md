---
name: powerpoint
description: Create, modify, and validate editable PowerPoint presentations and print-ready A4 learning handouts, including storytelling, pedagogy, art direction, visuals, and quality control. Use for PPTX decks, slides, training, education, business, social-media presentations, and dual projection/handout courses; use imagegen for original raster visuals.
---

# PowerPoint V4.5 — Context Layer & Senior Visual Reliability

Create editable, presentation-ready `.pptx` files with PptxGenJS 4.0.1 and, when requested, autonomous print-ready A4 handout PDFs derived from the same course content. Treat “create a presentation on X” as an end-to-end design request; treat a training request as both a content-design and delivery-design problem. Do not rasterize editable content or modify the `imagegen` skill. This skill is compatible with Codex CLI 0.148.0.

V4.3 adds an optional brand layer that overlays, but never replaces, the audience profile and teaching configuration. It also classifies visual needs by function so editorial scenes may prioritize ImageGen while exact diagrams, processes, charts, functional icons, and real interfaces use controlled methods. When no brand is requested, preserve V4.2 behavior exactly.

V4.3.1 stabilizes runtime brand components and adds `VISUAL_OPPORTUNITY` before role and method selection. It asks whether a concept benefits materially from perceptual representation; it does not request more images by default. Record important decisions in the automatic visual manifest so the Visual Bible remains auditable.

V4.4 adds an Intent & Preset Layer above the existing engines. Natural-language requests should be resolved through `assets/intent-layer.js` before invoking AUTO STYLE, Teaching, Brand, Visual Intelligence, or output engines. Preserve the priority `explicit user constraint > preset > automatic inference > safe default`; never require users to know internal parameter names.

V4.4.1 adds `VISUAL_EXPRESSION` and deck-level projection-richness checks after role/method selection. Correctly classifying content as `DIAGRAM` or `PROCESS` does not itself satisfy a projection slide's visual requirement. For a `HIGH` opportunity, verify that the audience can see meaningful objects or relationships rather than merely read descriptions. This does not increase ImageGen by default.

V4.5 adds an optional Context Layer before intent resolution and focused reliability checks after composition. Context supplies reusable environment defaults without replacing intent. Important connectors must reach their declared targets, and SENIOR functional icons must remain recognizable without relying on unfamiliar abstract conventions.

## Non-negotiable constraints

- Use PptxGenJS as the primary engine. Keep titles, text, shapes, tables, charts, simple diagrams, lines, and practical icons editable.
- For original photos, illustrations, and backgrounds, follow the image-generation decision tree in [image generation](references/image-generation.md). A listed `imagegen` skill does **not** prove that its built-in tool is callable in this session. Store every generated result under `assets/images/` and integrate it using PptxGenJS; do not use an external image-generation API when the built-in `imagegen` tool is actually callable.
- Preserve an existing deck’s dimensions, theme, layouts, content, and visual identity unless asked to redesign it. Use a supplied template as the base when practical.
- Keep JavaScript and every generated or supplied asset. Do not delete source files or flatten a deck without explicit permission.
- Default to `LAYOUT_WIDE` (13.333 × 7.5 in, 16:9), except where the request, a template, or a social format calls for another size.
- Preserve V3 behavior: decks may use no images; charts and diagrams remain editable; imagegen and the `gpt-image-2` fallback remain available; LibreOffice rendering, PNG inspection, source preservation, structural checks, and the three-pass correction limit remain mandatory when applicable.
- Keep content separate from rendering for training work. Resolve `CONTENT_DEPTH`, `DELIVERY_MODE`, and `PAGE_BUDGET` with [Teaching & Handout Engine](references/teaching-handout-engine.md) before storyboarding.

## Workflow

The first PPTX is a draft, not automatically final.

1. **Resolve context and intent:** when an active context exists, apply the [Context Layer](references/context-layer.md) before translating the request through the [Intent & Preset Layer](references/intent-layer.md). Preserve subject, audience, duration, objectives, prerequisites, exclusions, explicit constraints, preset, inference, ambiguity, research strategy, and budget tension. Context never overrides an explicit user constraint.
2. **Research and master content when needed:** for `DETAILED`, `ULTRA_DETAILED`, or `DUAL`, establish the factual content and pedagogical progression before design. In `DUAL`, both outputs must derive from one master source; preserve it as `content/course-content.md`.
3. **Select the visual system:** choose the audience profile first. If a named brand is requested, resolve and merge it afterward without reducing profile accessibility or teaching constraints. See [Brand Layer](references/brand-layer.md), [design profiles](references/design-profiles.md), [composition engine](references/composition-engine.md), and [design system](references/design-system.md).
4. **Plan pedagogy, storyboard, and rhythm:** define learning objectives and progression before mapping the master content to projection slides and/or A4 pages. Apply pedagogical compression rather than deleting essential explanations or shrinking type.
5. **Art direction:** instantiate or adapt a token theme for palette, typography, spacing, grid, shapes, icons, photographic treatment, and a print-friendly handout adaptation when applicable.
6. **Assets:** assess `VISUAL_OPPORTUNITY`, then classify each actual visual need with [Visual Intelligence](references/visual-intelligence.md). Record important decisions in the visual manifest. Before generating originals, write the enriched visual bible. Make ImageGen prompts aware of narrative role, target region, text position, crop, preserved elements, focal placement, and negative space. Prefer built-in `imagegen`; use the existing fallback only under its current rules.
7. **Build:** compose projection slides with existing theme-aware [components](assets/presentation-components.js) and [layouts](assets/layouts.js). Build handouts as genuine A4 pages rather than slide printouts. Preserve editable source material and follow [PptxGenJS conventions](references/pptxgenjs-conventions.md).
8. **Validate and improve:** run pedagogical validation before visual validation. For handouts, also validate print format and autonomy. Correct sources and rerender, retaining the existing three-pass maximum.
9. **Deliver:** provide the requested outputs and keep JavaScript, master content, assets, PDF, PPTX, and renders needed for reproduction.

## Design behavior

Every slide has one primary idea and one focal point. Compose for hierarchy, balance, negative space, contrast, alignment, density, and deck-level rhythm. Never fill space merely because it exists. Avoid consecutive repeated layouts unless the narrative justifies them, and split overloaded material rather than shrinking type. Read [composition engine](references/composition-engine.md) for the anti-pattern list.

## Content, audience, and formats

- Turn dense prose into clear cards, short lists, steps, diagrams, statistics, or quotations. Preserve meaning; add slides or change layout rather than make body text unreadably small.
- Prefer editable native charts with units and readable labels for data, and editable shapes for simple diagrams.
- Educational decks use appropriate vocabulary, concrete examples, visual explanation, and progressive complexity. For children use coherent playful visuals; for seniors use high contrast, strong navigation, large type, and little information per slide.
- Professional decks use a limited palette, hierarchy, clean charts, restrained decoration, and useful negative space.
- For Instagram, LinkedIn, or other social formats, choose the requested dimensions, optimize for rapid reading, use strong headlines, and maintain page-to-page continuity.
- Do not add complex animations or transitions by default. Use them sparingly and only when requested and narratively valuable.

## Project layout

```text
presentation-name/
├── presentation.pptx
├── presentation.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── logos/
└── rendered/
```

Use meaningful filenames, reuse identical assets, and avoid unnecessary dependencies.

For `DUAL`, prefer:

```text
course-name/
├── presentation.pptx
├── presentation.js
├── handout.pdf
├── handout.js
├── content/course-content.md
├── assets/images/
└── rendered/
    ├── presentation/
    └── handout/
```

The handout source may use an intermediate A4 PPTX for LibreOffice conversion; retain it when it is useful for reproduction. Do not force this structure on presentation-only V4.1 workflows.

## Required quality bar

Respect the grid, safe margins, alignment, vertical rhythm, proportions, hierarchy, and image zones. Keep important content away from edges; never knowingly place an element outside the slide, stretch an image, leave low-contrast text, or create an overcrowded slide. If no rendering engine is available, do structural and code checks and say that full visual inspection was unavailable.

## Reference routing

- Read [design system](references/design-system.md) for visual-direction decisions.
- Read [design profiles](references/design-profiles.md) when selecting or adapting a visual profile.
- Read [composition engine](references/composition-engine.md) for brand mode, composition, and anti-patterns.
- Read [storyboard and layouts](references/storyboard-layouts.md) when planning a multi-slide deck.
- Read [layout library](references/layout-library.md) when choosing layout regions and deck rhythm.
- Read [PptxGenJS conventions](references/pptxgenjs-conventions.md) while implementing source code.
- Read [validation](references/validation.md) before delivery or while correcting defects.
- Read [visual validation](references/visual-validation.md) whenever slide PNG renders are available; compare them with the storyboard and art direction, not only technical checks.
- Read [image generation](references/image-generation.md) when a deck needs original raster visuals or an API fallback.
- Read [image art direction](references/image-art-direction.md) before generating deck imagery.
- Read [Brand Layer](references/brand-layer.md) when a named identity must overlay an audience profile; use `assets/brands/` and `assets/brand-components.js` rather than distributed brand conditions.
- Read [Visual Intelligence](references/visual-intelligence.md) before choosing ImageGen, native PowerPoint, SVG/vector, charts, or real screenshots for a visual need.
- Read [Intent & Preset Layer](references/intent-layer.md) before resolving a natural-language request into profile, brand, teaching, research, duration, and page-budget configuration.
- Read [Context Layer](references/context-layer.md) when workspace or organizational defaults should influence preset eligibility without being repeated in every request.
- Read [Senior Visual Reliability](references/senior-visual-reliability.md) when slides use important connectors, functional icons, or pedagogical objects, especially for SENIOR audiences.
- Read [design score](references/design-score.md) during final visual validation.
- Read [Teaching & Handout Engine](references/teaching-handout-engine.md) for training requests, `DETAILED` or `ULTRA_DETAILED` content, A4 handouts, or `DUAL` delivery.
