# Visual validation

For projection, explicitly ask whether a mainly textual slide contains a `HIGH` `VISUAL_OPPORTUNITY` that has not been used. If so, reconsider the representation before adding imagery: diagram, process, comparison, spatial relation, controlled pictogram, chart, or—only for an appropriate editorial scene—ImageGen. Preserve audience accessibility and do not transform every list into a visual.

In V4.4.1, also validate `VISUAL_EXPRESSION` and `READ_SEE_BALANCE`. Correct role/method classification is insufficient when a high-opportunity projection slide remains `READ_ONLY` or `READ_MOSTLY`. Inspect the whole deck for `HIGH_VISUAL_OPPORTUNITY_READ_MOSTLY`, `REPETITIVE_TEXT_CARDS`, `LOW_VISUAL_VARIETY`, `IMAGEGEN_OVERUSE`, `DECORATIVE_VISUAL`, and `SENIOR_VISUAL_OVERLOAD`. For each important slide ask: if some text disappeared, would its objects or spatial relationships still communicate anything meaningful?

For important connectors, verify the actual endpoint, intended target, direction, neighboring ambiguity, crossings through text, and floating endpoints. For SENIOR functional icons, hide the label mentally: if a digitally inexperienced senior could not reasonably infer the meaning, use a clearer object, universal symbol, controlled vector, or explicit text treatment.

Use this review after rendering a deck into `rendered/`. Inspect every `slide-XX.png`; a successful command is not visual approval.

## Compare against the intended presentation

Review each slide against its storyboard objective, main message, planned layout, and transition, as well as the deck's art direction: palette, typography, spacing, imagery, tone, and audience. Validate both technical correctness and overall visual quality. A technically intact slide still needs correction when its composition, hierarchy, pacing, or visual language weakens the story.

## Minimum inspection checklist

Look for:

- clipped or cut-off text;
- text that is too small for the audience and delivery context;
- overflow outside a text box, card, image zone, or slide boundary;
- overlaps between text, shapes, charts, images, and decorations;
- incorrect alignment or broken grid relationships;
- inconsistent margins, padding, or vertical rhythm;
- stretched, squashed, or otherwise distorted images;
- poorly cropped images, missing focal points, or unintended empty crop areas;
- insufficient contrast, including text over imagery;
- weak or ambiguous visual hierarchy;
- overcrowded slides or too many competing focal points;
- incoherent empty space, including accidental gaps and cramped regions;
- inconsistent colors or color roles across slides;
- inconsistent typography, sizing, weight, capitalization, or line spacing;
- excessive repetition of the same layout when the narrative needs variation.
- for diagrams and processes: reversed or ambiguous arrows, unclear attachment points, misleading grouping, unnecessary connector crossings, relationships open to incorrect interpretation, or secondary systems visually competing with the main flow;
- monotony across the full sequence or insufficient alternation between impact, information, respiration, data, image, and comparison;
- a missing or competing focal point, weak reading order, or hierarchy unrelated to the primary message;
- unnecessary decorative elements, generic template styling, gratuitous cards, shadows, radii, gradients, or icons;
- incoherence between generated images in lighting, palette, realism, framing, texture, or treatment;
- density classified too low for the actual content, or a HIGH-density slide that should be split;

Also assess balance, legibility at presentation distance, visual polish, continuity between slides, and whether each visual supports the slide's single primary idea.

## Correction loop

Record material findings by slide and fix the JavaScript source rather than patching only the exported file. Regenerate the PPTX, rerender it, and inspect all affected slides plus any slide influenced by shared components or theme changes.

Run no more than three automatic build-render-review passes by default. Stop earlier when the deck meets the quality bar. If a material problem remains after the third pass, keep and deliver the best available PPTX and renders, and report the remaining issue precisely and honestly.

Keep the source PPTX, JavaScript, and original assets. Store generated PDF and PNG render artifacts under `rendered/`; do not treat source files or original assets as temporary cleanup targets.

Finish by applying the internal rubric in [design score](design-score.md). Coherence must remain stronger than variety. Prefer simple, safe corrections: remove, align, resize, recolor, recrop, shorten, or split; do not redesign the entire deck during an automatic pass.
