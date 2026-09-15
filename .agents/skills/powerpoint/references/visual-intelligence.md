# Visual Intelligence

For `FUNCTIONAL_ICON`, continue role and method selection with `ICON_RECOGNIZABILITY` before validation. Read [Senior Visual Reliability](senior-visual-reliability.md) for icon categories and connector checks. A functional icon must not require prior familiarity with digital conventions to be understood by its audience.

## Visual expression and projection richness (V4.4.1)

After opportunity, role, and method, select a `VISUAL_EXPRESSION`: the perceptual form through which the audience encounters the concept. Correctly classifying content as `DIAGRAM` or `PROCESS` does not by itself satisfy the visual requirement of a projection slide. For projection, evaluate whether the audience can **see** the concept rather than merely read its description.

Use the compact vocabulary below:

- `TEXT_LED`: concise statement or definition where objects add little.
- `OBJECT_FLOW`: recognizable pedagogical objects moving or converging.
- `DEVICE_MODEL`: simplified editable device containing spatially meaningful zones.
- `SPATIAL_DIAGRAM`: position, grouping, hierarchy, or relationship carries meaning.
- `BEFORE_AFTER` and `COMPARISON`: visual contrast is the main teaching move.
- `HUMAN_CONTEXT_SCENE`: editorial scene where human context materially helps; normally ImageGen.
- `SCENARIO`: situation, cue, choice, and response.
- `ICON_SYSTEM`: controlled functional symbols with explicit labels.
- `DATA_CHART`: native editable chart.
- `STEP_FLOW`: ordered actions with a visible path.
- `CONCEPT_MAP`: labeled conceptual relationships.
- `PHOTO_FOCUSED`: a real or generated image is the principal evidence or object of attention.

`assessReadSeeBalance()` returns `READ_ONLY`, `READ_MOSTLY`, `BALANCED`, or `SEE_FIRST`. A title plus several rectangles containing phrases is generally read-led. A recognizable smartphone model with four labeled regions, a directional object flow, or a chart with a short conclusion is balanced or see-first. When `VISUAL_OPPORTUNITY=HIGH`, delivery includes projection, and the result is `READ_ONLY` or `READ_MOSTLY`, `assessProjectionRichness()` sets `reviewRequired=true`.

Improve a weak high-opportunity slide in this order, as relevant: spatial relation, object representation, graphical process, visual comparison, scenario, functional pictograms, data chart, then ImageGen only when a human/editorial context is genuinely superior. If removing part of the text leaves the composition conveying nothing, re-examine a high-opportunity slide.

### Pedagogical objects and device models

A `PEDAGOGICAL_OBJECT` is a simple, adult, editable representation of a real object needed for understanding: smartphone, computer, folder, file, photo, envelope, form, browser, USB key, window, generic button, camera, conversation, or document. It should be immediately recognizable, brand-consistent, high contrast, and simpler than a real interface.

A `PEDAGOGICAL_DEVICE_MODEL` may show a generic smartphone with zones such as name, messages, writing area, and actions. This is a spatial diagram, not a screenshot. A `FAKE_INTERFACE` imitates a real product interface with invented menus, labels, or behaviors and remains prohibited. Use a real screenshot only when exact recognition is necessary.

### Deck-level diversity

Run `assessDeckVisualDiversity()` on projection manifests. It detects high-opportunity read-led slides, repetitive text cards, one expression dominating most of the deck, unjustified ImageGen concentration, and Senior overload. Diversity must follow content: a conversation suggests a device, photo concepts suggest camera/gallery objects, calling may justify a human scene, and safety suggests a scenario. Do not add decoration, arbitrary layout variation, or icons without a teaching function.

For Senior audiences, prefer one principal object, few simultaneous elements, large zones, explicit labels, obvious relations, and text-supported pictograms. Segment a nine-step procedure before enriching it. Never shrink Senior type to fit a visualization.

Handouts are not held to the same projection-richness standard. They prioritize autonomous explanation, procedures, troubleshooting, print economy, and may use a different expression from the paired slide.

## Visual opportunity first

Before choosing a visual role, ask: **Would this concept be understood faster or remembered more easily if it were represented perceptually rather than mainly explained in text?** Use `assessVisualOpportunity()` with the simple levels `LOW`, `MEDIUM`, and `HIGH`.

- `HIGH`: direction, meaningful comparison, transformation, sequence, hierarchy, relation, progression, cause/effect, before/after, quantitative data, or a human context where visual representation materially helps.
- `MEDIUM`: a visual may help but is optional, such as preparation categories, localization, grouping, choice, or a weakly structured comparison.
- `LOW`: a short definition, quotation, plain statement, or arbitrary list without a meaningful relation.

Opportunity is not a method. `HIGH → PROCESS → POWERPOINT` is as valid as `HIGH → EDITORIAL_SCENE → IMAGEGEN`. A mainly textual projection slide with an unexploited `HIGH` opportunity must be reconsidered, starting with comparison, spatial relation, diagram, process, controlled pictogram, or chart—not automatically an image.

Classify the visual by function before choosing a method. Use `assets/visual-intelligence.js` for deterministic routing where helpful.

For HTML only, V4.6 may extend the unchanged result with `INTERACTION_METHOD` through `assets/web-interactions.js`. Interaction comes after `VISUAL_OPPORTUNITY → VISUAL_ROLE → IMAGE_METHOD` and never changes image routing or master content. See [Web Presentation Engine](web-presentation-engine.md).

| Visual role | Default method |
| --- | --- |
| `EDITORIAL_SCENE` | `IMAGEGEN` |
| `DIAGRAM` | `POWERPOINT` |
| `PROCESS` | `POWERPOINT` |
| `TIMELINE` | `POWERPOINT` |
| `DATA_VISUALIZATION` | `POWERPOINT_CHART` |
| `FUNCTIONAL_ICON` | `VECTOR` — prefer PowerPoint shape, then controlled SVG/pictogram |
| `REAL_INTERFACE` | `SCREENSHOT` |
| `DECORATIVE` | `OPTIONAL` |

For `EDITORIAL_SCENE`, interpret `IMAGEGEN` as a visual method, then resolve execution separately: `VISUAL_ROLE → IMAGE_METHOD → CAPABILITY → RUNTIME TOOL`. The preferred capability is `NATIVE_IMAGE_GENERATION`; the active runtime maps it to whichever compatible native provider is actually callable. Keep `IMAGE_METHOD=IMAGEGEN` in the manifest so it remains portable and does not encode a physical tool name. If native raster generation is unavailable, follow [image generation](image-generation.md) for API fallback eligibility or `NO_RASTER_GENERATION`.

Editability is a functional quality, not an absolute goal. Do not replace a premium editorial scene with simplistic PowerPoint shapes merely to keep it editable. Conversely, do not use ImageGen for exact diagrams, processes, charts, or an interface presented as real. If no reliable interface capture exists, use a clearly labeled pedagogical schematic or text; never invent the interface.

Before ImageGen, resolve narrative role, layout, text position, subject position, negative space, framing, orientation, crop strategy, protected elements, and relationship to slide objects. `buildCompositionAwarePrompt()` converts these decisions into prompt guidance. Generated images must not contain important text, logos, watermarks, or invented software UI.

For `DECORATIVE`, ask whether the element improves understanding, hierarchy, or identity. If not, omit it.

## Projection, handout, and Senior

Apply opportunity assessment most actively to `PRESENTATION` and the projection branch of `DUAL`. A handout may retain more autonomous explanation and use a simplified, print-efficient visual. Never replicate rich projection imagery automatically in a handout.

For `SENIOR`, preserve large text, high contrast, explicit labels, obvious arrows, few simultaneous elements, and low interpretive burden. If a process has too many steps for one accessible view, simplify or segment it; do not shrink type or build a dense diagram.

## Automatic manifest

Use `createVisualManifest()` from `assets/visual-bible.js`. Add each important visual while planning or building, with `id`, `location`, `purpose`, `visualRole`, `reason`, optional composition, and status. Opportunity, method, expression, read/see balance, projection richness, and review status are resolved automatically. Override only from actual composition evidence. `toMarkdown()` produces the auditable Visual Bible section; `toJSON()` provides structured data.

## Anti-patterns

- Adding a decorative image to fill space.
- Turning every list into a diagram.
- Using ImageGen when a few exact PowerPoint shapes communicate better.
- Replacing a necessary real interface with an invented ImageGen interface.
- Adding so many pictograms that scanning becomes harder.
- Reducing Senior type sizes to fit a visualization.
- Automatically reusing projection visuals in the handout.
