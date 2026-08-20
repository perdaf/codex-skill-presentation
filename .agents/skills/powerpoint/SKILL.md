---
name: powerpoint
description: Create, modify, and validate editable PowerPoint presentations with PptxGenJS, including Gamma-like end-to-end storytelling, art direction, visuals, and quality control. Use for PPTX decks, slides, templates, training, education, business, and social-media presentations; use imagegen for original raster visuals.
---

# PowerPoint V2

Create an editable, presentation-ready `.pptx` with PptxGenJS 4.0.1. Treat “create a presentation on X” as **Gamma mode**: make coherent defaults and complete the workflow without needing technical instructions. Do not make a slide deck a single image, rasterize editable content, or modify the `imagegen` skill.

## Non-negotiable constraints

- Use PptxGenJS as the primary engine. Keep titles, text, shapes, tables, charts, simple diagrams, lines, and practical icons editable.
- For original photos, illustrations, and backgrounds, follow the image-generation decision tree in [image generation](references/image-generation.md). A listed `imagegen` skill does **not** prove that its built-in tool is callable in this session. Store every generated result under `assets/images/` and integrate it using PptxGenJS; do not use an external image-generation API when the built-in `imagegen` tool is actually callable.
- Preserve an existing deck’s dimensions, theme, layouts, content, and visual identity unless asked to redesign it. Use a supplied template as the base when practical.
- Keep JavaScript and every generated or supplied asset. Do not delete source files or flatten a deck without explicit permission.
- Default to `LAYOUT_WIDE` (13.333 × 7.5 in, 16:9), except where the request, a template, or a social format calls for another size.

## Workflow

The first PPTX is a draft, not automatically final.

1. **Analyze:** infer or identify objective, audience, knowledge level, context, language, tone, style, slide count, duration, format, branding, and references. Ask only when a missing answer materially changes the deck; otherwise choose a sound default.
2. **Storyboard:** before coding, define internally for every slide its number, objective, title, one main message, condensed content, layout, required visual/image/chart/diagram, and transition from the previous slide. See [storyboard and layouts](references/storyboard-layouts.md).
3. **Art direction:** define palette, type scale, margins, spacing, card and icon treatment, and image direction. A provided brand system is authoritative; borrow only general characteristics from reference imagery. See [design system](references/design-system.md).
4. **Assets:** define a shared art direction before generating multiple originals. First verify that the built-in `imagegen` tool can actually be called in the current session. If it is callable, use it. If it is unavailable, check only whether `OPENAI_API_KEY` is non-empty (never print, write, or otherwise expose its value) and use [`scripts/generate-image.js`](scripts/generate-image.js) with the OpenAI Images API when it is available. If neither path is available, do not claim that original images were generated; use editable PowerPoint shapes only where they keep the deck functional, and report the limitation. Use descriptive filenames, request the correct crop and negative space, avoid meaningful text inside images, and do not generate images for editable diagrams or charts. See [image generation](references/image-generation.md).
5. **Build:** compose the editable presentation with a reusable component layer. Adapt [the component template](assets/presentation-components.js) when useful, and follow [PptxGenJS conventions](references/pptxgenjs-conventions.md).
6. **Validate and improve:** follow [validation](references/validation.md). Render, inspect, fix, regenerate, and recheck when rendering is available.
7. **Deliver:** give the `.pptx` first, keeping the JavaScript and assets for reproduction.

## Narrative and layouts

Every slide has one primary idea. Choose layouts because they clarify the message, not by rote: cover, image-led title, text plus image, comparison, statistics, cards, timeline, process, diagram, quote, question, before/after, case study, table, editable chart, section divider, conclusion, and call to action. Avoid both a uniform layout and a deck made only of titles and bullets.

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
- Read [storyboard and layouts](references/storyboard-layouts.md) when planning a multi-slide deck.
- Read [PptxGenJS conventions](references/pptxgenjs-conventions.md) while implementing source code.
- Read [validation](references/validation.md) before delivery or while correcting defects.
- Read [image generation](references/image-generation.md) when a deck needs original raster visuals or an API fallback.
