---
name: powerpoint
description: Create, modify, and validate editable PowerPoint presentations with PptxGenJS, including Gamma-like end-to-end storytelling, art direction, visuals, and quality control. Use for PPTX decks, slides, templates, training, education, business, and social-media presentations; use imagegen for original raster visuals.
---

# PowerPoint V4.1 — Presentation Design Engine

Create an editable, presentation-ready `.pptx` with PptxGenJS 4.0.1. Treat “create a presentation on X” as an end-to-end design request: choose a fitting visual system, build a coherent narrative, and validate the rendered result. Do not make a slide deck a single image, rasterize editable content, or modify the `imagegen` skill. This skill is compatible with Codex CLI 0.148.0.

## Non-negotiable constraints

- Use PptxGenJS as the primary engine. Keep titles, text, shapes, tables, charts, simple diagrams, lines, and practical icons editable.
- For original photos, illustrations, and backgrounds, follow the image-generation decision tree in [image generation](references/image-generation.md). A listed `imagegen` skill does **not** prove that its built-in tool is callable in this session. Store every generated result under `assets/images/` and integrate it using PptxGenJS; do not use an external image-generation API when the built-in `imagegen` tool is actually callable.
- Preserve an existing deck’s dimensions, theme, layouts, content, and visual identity unless asked to redesign it. Use a supplied template as the base when practical.
- Keep JavaScript and every generated or supplied asset. Do not delete source files or flatten a deck without explicit permission.
- Default to `LAYOUT_WIDE` (13.333 × 7.5 in, 16:9), except where the request, a template, or a social format calls for another size.
- Preserve V3 behavior: decks may use no images; charts and diagrams remain editable; imagegen and the `gpt-image-2` fallback remain available; LibreOffice rendering, PNG inspection, source preservation, structural checks, and the three-pass correction limit remain mandatory when applicable.

## Workflow

The first PPTX is a draft, not automatically final.

1. **Analyze:** infer or identify objective, audience, knowledge level, context, language, tone, style, slide count, duration, format, branding, and references. Ask only when a missing answer materially changes the deck; otherwise choose a sound default.
2. **Select the visual system:** if brand assets exist, derive a brand theme and give them priority. Otherwise choose a profile automatically from the audience, purpose, subject, and format; do not routinely ask. See [design profiles](references/design-profiles.md), [composition engine](references/composition-engine.md), and [design system](references/design-system.md).
3. **Storyboard and rhythm:** before coding, define internally for every slide its objective, main message, condensed content, density (`LOW`, `MEDIUM`, or `HIGH`), layout, focal point, visual need, and transition. Most slides are LOW or MEDIUM. Review the complete layout sequence before building. See [storyboard](references/storyboard-layouts.md) and [layout library](references/layout-library.md).
4. **Art direction:** instantiate or adapt a token theme for palette, six typographic roles, spacing, radius, shadows, grid, shapes, icons, and photographic treatment. Allow controlled variation but keep coherence stronger than variety.
5. **Assets:** before generating multiple originals, write one visual bible. Make each prompt aware of its target region, crop, focal placement, and negative-space requirement. Prefer the built-in `imagegen`; when it is not callable, use the existing `gpt-image-2` fallback only when `OPENAI_API_KEY` is configured. See [image art direction](references/image-art-direction.md) and [image generation](references/image-generation.md).
6. **Build:** compose with theme-aware [components](assets/presentation-components.js) and [layouts](assets/layouts.js), preserving editability. Follow [PptxGenJS conventions](references/pptxgenjs-conventions.md).
7. **Validate and improve:** run structural checks, render with LibreOffice when available, inspect every PNG for both technical and design defects, and score the deck internally. Correct the JavaScript source and rerender, with at most three automatic passes. See [validation](references/validation.md), [visual validation](references/visual-validation.md), and [design score](references/design-score.md).
8. **Deliver:** give the `.pptx` first, keeping the JavaScript and assets for reproduction.

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
- Read [design score](references/design-score.md) during final visual validation.
