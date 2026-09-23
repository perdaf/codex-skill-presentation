---
name: powerpoint
description: Create, modify, and validate projected presentations in local HTML or editable PowerPoint, generate structured Markdown briefs for Gamma, and produce print-ready A4 learning handouts, including storytelling, pedagogy, art direction, interactions, visuals, and quality control. Use for Gamma, web presentations, PPTX decks, slides, training, education, business, social-media presentations, and dual presentation/handout courses; use the runtime's native image-generation capability for original raster visuals when available.
---

# PowerPoint V4.6 — Web Presentation Engine

Create presentation-ready local HTML/CSS/JavaScript projects, editable `.pptx` files with PptxGenJS 4.0.1, or structured Markdown briefs that Gamma can turn into slides and, when requested, autonomous print-ready A4 handout PDFs derived from the same course content. Treat “create a presentation on X” as an end-to-end design request; treat a training request as both a content-design and delivery-design problem. Do not rasterize editable content or modify the `imagegen` skill. V4.6 is additive: every V4.5.2 engine and validation remains available and unchanged.

V4.6 separates `DELIVERY_MODE=PRESENTATION|HANDOUT|DUAL` from `PRESENTATION_FORMAT=AUTO|HTML|PPTX|GAMMA`. Delivery describes the pedagogical output; format describes only the technical presentation branch. `DUAL` means `PRESENTATION + HANDOUT`, not necessarily PPTX + PDF. HTML adds a standards-based, offline-capable Web Presentation Engine while preserving the same content, profile, Brand, Visual Intelligence, image, and validation pipeline. The additive Gamma target exports the resolved content and storyboard as a self-contained Markdown generation brief; it does not call Gamma or replace the existing renderers.

## Presentation format resolution

Resolve new requests with `resolveV46RequestWithContext()` from `assets/presentation-format.js`; it wraps the stabilized Context and Intent resolvers. Explicit HTML/web/interactive/direct-computer projection resolves to `HTML`. Explicit PowerPoint/PPTX or a file intended for editing in PowerPoint resolves to `PPTX`. An explicit Gamma request or Markdown brief for Gamma resolves to `GAMMA`. Explicit user constraints retain priority.

When delivery includes a presentation and its usage is not already unambiguous, stop before composition and ask exactly: **« La présentation sera-t-elle projetée directement depuis l’ordinateur ? »** This is a material question. Never ask it for `HANDOUT` alone, and never ask when the answer is already deducible. `PRESENTATION_FORMAT=AUTO` is a resolution state, not a final deliverable.

Read [Web Presentation Engine](references/web-presentation-engine.md) whenever format resolution is needed or `PRESENTATION_FORMAT=HTML`. Read [Gamma Markdown Export](references/gamma-export.md) for `PRESENTATION_FORMAT=GAMMA`.

V4.3 adds an optional brand layer that overlays, but never replaces, the audience profile and teaching configuration. It also classifies visual needs by function so editorial scenes may prioritize ImageGen while exact diagrams, processes, charts, functional icons, and real interfaces use controlled methods. When no brand is requested, preserve V4.2 behavior exactly.

V4.3.1 stabilizes runtime brand components and adds `VISUAL_OPPORTUNITY` before role and method selection. It asks whether a concept benefits materially from perceptual representation; it does not request more images by default. Record important decisions in the automatic visual manifest so the Visual Bible remains auditable.

V4.4 adds an Intent & Preset Layer above the existing engines. Natural-language requests should be resolved through `assets/intent-layer.js` before invoking AUTO STYLE, Teaching, Brand, Visual Intelligence, or output engines. Preserve the priority `explicit user constraint > preset > automatic inference > safe default`; never require users to know internal parameter names.

V4.4.1 adds `VISUAL_EXPRESSION` and deck-level projection-richness checks after role/method selection. Correctly classifying content as `DIAGRAM` or `PROCESS` does not itself satisfy a projection slide's visual requirement. For a `HIGH` opportunity, verify that the audience can see meaningful objects or relationships rather than merely read descriptions. This does not increase ImageGen by default.

V4.5 adds an optional Context Layer before intent resolution and focused reliability checks after composition. Context supplies reusable environment defaults without replacing intent. Important connectors must reach their declared targets, and SENIOR functional icons must remain recognizable without relying on unfamiliar abstract conventions.

V4.5.1 makes raster generation runtime-independent without changing the V4.5 engines. Visual Intelligence selects the logical `NATIVE_IMAGE_GENERATION` capability for `IMAGE_METHOD=IMAGEGEN`; the active agent runtime resolves that capability to a callable native tool. In Codex this may be `imagegen`; in Antigravity it may be `default_api:generate_image`; other Agent Skills runtimes may expose another declared compatible provider.

When `EPN_RIVIERE_SALEE_CONTEXT` is active, its art-direction default `AUDIENCE_REPRESENTATION=MARTINIQUE` applies only to visuals that genuinely contain people. Explicit user representation or an explicit request for no characters takes priority. Keep this parameter separate from the pedagogical audience profile and from runtime image-tool resolution.

V4.5.2 adds `EDIT_MODE=TARGETED` for precise natural-language changes to an existing skill-generated project. Its invariant is **WHAT IS NOT REQUESTED MUST NOT CHANGE**. Targeted editing is additive and does not rerun AUTO STYLE, profile, brand, page budget, storyboard, global art direction, or the full creation workflow.

## Targeted edit contract

When a request targets an existing presentation, follow:

`EXISTING PROJECT → EDIT REQUEST → TARGET RESOLUTION → CHANGE CLASSIFICATION → IMPACT ANALYSIS → TARGETED PATCH → REGENERATION → TARGETED VALIDATION → REGRESSION CHECK`

Build an inspectable patch plan before editing. For PPTX, use `assets/targeted-edit.js`, prefer `presentation.js` as the source of truth, and regenerate the PPTX; never patch PPTX OOXML directly when the JS source exists. For HTML, use `assets/web-targeted-edit.js` and modify only the targeted slide section, component, local style, asset reference, or interaction wiring. Resolve only the named slides and elements. If the project evidence yields multiple materially different matches, return `AMBIGUOUS_TARGET` and clarify rather than modifying all matches.

Preserve every slide, element, layout, style, brand decision, and output not named by the request. A minimal local adjustment is allowed only to prevent overflow, collision, clipping, off-slide placement, or loss of readability, and must be reported. A request about a slide affects projection only unless the handout is explicitly named.

After any targeted edit affecting text, run `validateTargetedEditReadability()` from `assets/targeted-edit-readability.js`. Do not accept technical fit achieved through excessive type reduction or compression. Respect the active profile's minimum size, projection readability, density, neighbor clearance, and hierarchy; `SENIOR` accessibility overrides exact geometry preservation. Try text-box expansion, then local layout adaptation, then an authorized meaning-equivalent shortening. If none passes, return `TARGETED_EDIT_READABILITY_REGRESSION` and request a decision. This gate never authorizes global recomposition or automatic handout/master-content changes.

Explicit user edits override prior automatic visual choices. A requested generated-image replacement must retain local geometry as far as practical and route through Visual Intelligence and the existing Mandatory Pipeline before `NATIVE_IMAGE_GENERATION`; do not rebuild the slide. For pedagogical or informational changes, report `CONSISTENCY_IMPACT` across master content, handout, and other occurrences. Propagate only when explicitly requested; otherwise surface a material divergence for confirmation.

## Mandatory resolution pipeline

Every runtime using this skill **MUST resolve configuration before presentation composition**:

`USER REQUEST → ACTIVE CONTEXT → resolveV46RequestWithContext() → FORMAT CLARIFICATION WHEN REQUIRED → RESOLVED CONFIGURATION → Teaching / Brand / Visual Intelligence → Visual Bible / Visual Manifest → renderer → asset generation → validation`

When an organizational context is explicitly supplied or available in the working environment, pass it to `resolveV46RequestWithContext()` before the Intent Layer. For an EPN de Rivière-Salée project that declares `EPN_RIVIERE_SALEE_CONTEXT`, pass that exact context; never infer it for every presentation project. After resolution, the returned `brand`, `profile`, `contentDepth`, `deliveryMode`, `presentationFormat`, `pageBudget`, and `audienceRepresentation` are the source of truth. Do not manually reconstruct them.

Before generating an `EDITORIAL_SCENE`, the agent **MUST** run Visual Intelligence, construct the relevant Visual Bible invariants and Visual Manifest, merge those invariants into the final prompt, and only then resolve and call `NATIVE_IMAGE_GENERATION`. The shortcut `USER REQUEST → manual image prompt → generator` is prohibited whenever the deterministic layers contain relevant information. The concrete runtime provider is selected only after `VISUAL_ROLE → IMAGE_METHOD → CAPABILITY`.

Use [Mandatory execution contract](references/execution-contract.md) and `assets/v46-pipeline.js` for V4.6 resolution before delegating to the unchanged `assets/mandatory-pipeline.js`. If a mandatory stage cannot run, reuse an unambiguous structured resolved configuration or report the explicit blocked state; never silently approximate, choose a final format from `AUTO`, or drop `HUMAN_REPRESENTATION`.

## Non-negotiable constraints

- For `PRESENTATION_FORMAT=PPTX`, use PptxGenJS as the primary engine and keep titles, text, shapes, tables, charts, simple diagrams, lines, and practical icons editable. For `HTML`, use the Web Presentation Engine and standards-based local files. For `GAMMA`, generate a self-contained Markdown brief with `assets/gamma-export.js`; do not call Gamma, upload content, or claim to have inspected the final Gamma rendering.
- A Gamma generation may contain at most 20 slides for this user's account. Apply pedagogical compression, preserve essential content, and block the export if the final storyboard still exceeds 20. In Gamma briefs, whenever people are genuinely useful, default to contemporary, varied, non-stereotypical Afro-Antillean representation unless the user explicitly requests another representation or no people.
- For original photos, illustrations, and backgrounds, follow the image-generation decision tree in [image generation](references/image-generation.md). A listed skill or presumed tool name does **not** prove that a native image-generation capability is callable in this session. Store every generated result under `assets/images/` and integrate it using PptxGenJS; do not use the API fallback when a compatible native capability is callable.
- Preserve an existing presentation’s format, dimensions, theme, layouts, content, interactions, and visual identity unless asked to redesign or convert it. Use a supplied template as the base when practical.
- Keep JavaScript and every generated or supplied asset. Do not delete source files or flatten a deck without explicit permission.
- Default to `LAYOUT_WIDE` (13.333 × 7.5 in, 16:9), except where the request, a template, or a social format calls for another size.
- Preserve V3 behavior: decks may use no images; charts and diagrams remain editable; native raster generation and the `gpt-image-2` fallback remain available; LibreOffice rendering, PNG inspection, source preservation, structural checks, and the three-pass correction limit remain mandatory when applicable.
- Keep content separate from rendering for training work. Resolve `CONTENT_DEPTH`, `DELIVERY_MODE`, and `PAGE_BUDGET` with [Teaching & Handout Engine](references/teaching-handout-engine.md) before storyboarding.

## Workflow

The first presentation build is a draft, not automatically final.

1. **Resolve context and intent:** execute the mandatory resolution pipeline above. When an active context exists, apply the [Context Layer](references/context-layer.md) before translating the request through the [Intent & Preset Layer](references/intent-layer.md). Preserve subject, audience, duration, objectives, prerequisites, exclusions, explicit constraints, preset, inference, ambiguity, research strategy, and budget tension. Context never overrides an explicit user constraint.
2. **Research and master content when needed:** for `DETAILED`, `ULTRA_DETAILED`, or `DUAL`, establish the factual content and pedagogical progression before design. In `DUAL`, both outputs must derive from one master source; preserve it as `content/course-content.md`.
3. **Select the visual system:** choose the audience profile first. If a named brand is requested, resolve and merge it afterward without reducing profile accessibility or teaching constraints. See [Brand Layer](references/brand-layer.md), [design profiles](references/design-profiles.md), [composition engine](references/composition-engine.md), and [design system](references/design-system.md).
4. **Plan pedagogy, storyboard, and rhythm:** define learning objectives and progression before mapping the master content to projection slides and/or A4 pages. Apply pedagogical compression rather than deleting essential explanations or shrinking type.
5. **Art direction:** instantiate or adapt a token theme for palette, typography, spacing, grid, shapes, icons, photographic treatment, and a print-friendly handout adaptation when applicable.
6. **Assets:** assess `VISUAL_OPPORTUNITY`, then classify each actual visual need with [Visual Intelligence](references/visual-intelligence.md). Record important decisions in the visual manifest. Before generating originals, write the enriched visual bible. Make ImageGen prompts aware of narrative role, target region, text position, crop, preserved elements, focal placement, and negative space. Prefer the runtime's callable `NATIVE_IMAGE_GENERATION` capability; use the existing fallback only under the rules in [image generation](references/image-generation.md).
7. **Build:** for PPTX, compose projection slides with existing theme-aware [components](assets/presentation-components.js) and [layouts](assets/layouts.js) and follow [PptxGenJS conventions](references/pptxgenjs-conventions.md). For HTML, use `assets/web-presentation-engine.js`; keep each slide a 16:9 pedagogical screen and all runtime resources local. For Gamma, use `assets/gamma-export.js` to render the approved storyboard to Markdown. Build handouts as genuine A4 pages rather than slide printouts.
8. **Validate and improve:** run pedagogical validation before visual validation. For HTML, run `assets/web-validation.js`, browser interaction checks, and visual inspection. For Gamma, run `validateGammaBrief()` and inspect the Markdown structure, slide count, content fidelity, visual directions, and representation rules; final visual QA remains external because Gamma performs the rendering. For handouts, also validate print format and autonomy. Correct sources and rerender, retaining the existing three-pass maximum.
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

For HTML presentation output, prefer:

```text
presentation-web/
├── index.html
├── styles.css
├── presentation.js
└── assets/images/
```

For Gamma presentation output, prefer:

```text
presentation-gamma/
├── gamma-brief.md
└── content/course-content.md  # when master content is required
```

For `DUAL + HTML`, keep `presentation-web/`, `handout.pdf`, `handout.js`, and `content/course-content.md` in the same course project. For `DUAL + PPTX`, retain the established PPTX + PDF structure. For `DUAL + GAMMA`, keep `presentation-gamma/gamma-brief.md`, the A4 handout sources/output, and `content/course-content.md` together.

## Required quality bar

Respect the grid, safe margins, alignment, vertical rhythm, proportions, hierarchy, and image zones. Keep important content away from edges; never knowingly place an element outside the slide, stretch an image, leave low-contrast text, or create an overcrowded slide. If no rendering engine is available, do structural and code checks and say that full visual inspection was unavailable.

## Reference routing

- Read [Web Presentation Engine](references/web-presentation-engine.md) for V4.6 format resolution, HTML composition, interactions, offline output, HTML Targeted Edit, and web validation.
- Read [Gamma Markdown Export](references/gamma-export.md) when Gamma should create the slides or the requested deliverable is a Markdown generation brief for Gamma.
- Read [Targeted Edit Layer](references/targeted-edit-layer.md) for any modification to an existing deck.
- Read [Mandatory execution contract](references/execution-contract.md) before composing any deck or generating any asset.
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
