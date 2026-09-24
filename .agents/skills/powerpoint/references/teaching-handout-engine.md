# Teaching & Handout Engine

Use this mode when the deliverable teaches, must remain useful after delivery, or includes an A4 handout. Separate factual/pedagogical content from rendering:

`request → audience → CONTENT_DEPTH → DELIVERY_MODE → PAGE_BUDGET → research → master content → pedagogical plan → storyboard → outputs → pedagogical validation → visual/print validation`

Use `assets/teaching.js` to normalize explicit options. When the user does not name them, infer them from purpose and audience without changing AUTO STYLE.

## CONTENT_DEPTH

- `SIMPLE`: projected support for oral delivery; large ideas, synthesis, little text, visual impact. Research only when needed.
- `DETAILED`: independently rereadable support; definitions, context, explanations, examples, and essential advice. Verify important facts and procedures likely to change.
- `ULTRA_DETAILED`: autonomous beginner-oriented teaching; explain vocabulary and prerequisites, add useful analogies, ordered procedures, concrete examples, frequent errors, advice, exercises, verification methods, and recaps. Research current factual or procedural topics thoroughly, preferring official sources.

Depth controls comprehension, not one-page-per-micro-step. Projection remains selective even at `ULTRA_DETAILED`; detailed autonomy belongs primarily in the master content and handout.

For seniors, especially at `ULTRA_DETAILED`, use simple explicit sentences, comfortable type, high contrast, exact menu/button names when verified, real action order, explained terminology, practical exercises, and visible reminders. Do not make important information depend on emoji rendering.

## DELIVERY_MODE

- `PRESENTATION`: a 16:9 presentation branch optimized for projection; its technical output is selected separately by `PRESENTATION_FORMAT`.
- `HANDOUT`: autonomous, print-friendly A4 PDF plus reproducible source.
- `DUAL`: `PRESENTATION + HANDOUT` from one factual and pedagogical master source. It may be HTML + PDF, PPTX + PDF, or a Gamma Markdown brief + PDF. Never write two independent courses.

## PRESENTATION_FORMAT — V4.6

- `AUTO`: format not yet resolved; never compose a final presentation in this state.
- `HTML`: local HTML/CSS/JavaScript presentation for direct computer projection or requested web/interactive use.
- `PPTX`: editable PowerPoint generated with PptxGenJS.
- `GAMMA`: complete Gamma Presentation Blueprint containing the resolved pedagogy, exact displayed content, per-slide Visual Intelligence and rendering instructions. The skill designs the full presentation; Gamma only renders the final slides.

For delivery containing a presentation, follow [Web Presentation Engine](web-presentation-engine.md) for explicit signals and the material clarification gate. For `HANDOUT` alone, presentation format is not applicable and no question is asked.

The projection keeps essential concepts, important steps, exercises, and trainer cues. It may summarize the master content and must not become dense merely because depth is high.

The handout is not a printout of 16:9 slides. Build portrait A4 pages (210 × 297 mm; approximately 8.267 × 11.693 in) with print-safe margins, economical use of space and ink, clear procedures, identifiable exercises, visible advice/warnings, and restrained imagery. Avoid massive dark backgrounds, decorative half-page images, inherited projection whitespace, and nonfunctional ornaments. PptxGenJS may create an intermediate custom-layout A4 PPTX that LibreOffice converts to PDF; keep `handout.js` and useful reproducible source artifacts.

## PAGE_BUDGET

- `COMPACT`: 6–8 pages/slides, target 7.
- `STANDARD`: 10–12, target 11.
- `EXTENDED`: 14–16, target 15.
- positive integer: explicit target and priority over presets.

Treat the budget as a design target, not permission to harm learning. If content exceeds it: group related information, improve pedagogical composition, remove nonessential decoration and repetition, then preserve essential explanations. Add a page only when compression would impair comprehension or legibility. Never solve budget tension with tiny type, missing steps, or overloaded pages. Report an irreducible tension.

## Master content and pedagogical compression

Create master content before slides for `DETAILED` and `ULTRA_DETAILED`. For every `DUAL` project, preserve it as `content/course-content.md`. Keep one authoritative version of objectives, concepts, definitions, progression, explanations, procedures, examples, exercises, advice, common errors, warnings, and recap; avoid duplicating identical passages.

Pedagogical compression increases learning value per page without deleting necessary information. Combine steps when they belong to one action, their order remains obvious, type stays readable, and hierarchy remains clear. Prefer one well-structured “Create a folder” page with five numbered steps to five sparse micro-step pages.

## Research strategy

Research in proportion to depth and volatility. `SIMPLE` needs research only for uncertain or current claims. `DETAILED` verifies important claims and evolving procedures. `ULTRA_DETAILED` performs deeper research when factual accuracy, current interfaces, safety, or procedures matter—for example operating systems, mobile devices, Gmail, Google Photos, online services, cybersecurity, and digital administration. Prefer official primary sources for procedures. Build and verify the master content before visual design.

## Pedagogical validation

For `DETAILED` and `ULTRA_DETAILED`, verify before visual QA:

- vocabulary fits the audience and technical terms are explained before use;
- actions are ordered, complete, and executable;
- examples clarify the concept;
- exercises practice what was just taught;
- important warnings are visible;
- avoidable repetition is removed without losing reinforcement.

For `HANDOUT` and `DUAL`, answer: **Can someone who did not attend the training understand and repeat the procedure using only this document?** If not, correct the master content and handout.

## Print validation

Confirm A4 dimensions, safe margins, no clipping or overflow, comfortable text size, contrast, printable image readability, limited unnecessary dark coverage, efficient space use, and final page count. Render the handout PDF and inspect every page. Report the number of pages and any PAGE_BUDGET tension. The existing three-pass limit still applies.
