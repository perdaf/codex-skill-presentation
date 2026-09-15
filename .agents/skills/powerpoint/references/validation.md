# Validation and visual QA

The first generated deck is not automatically final. After each material correction, regenerate and validate it.

For `PRESENTATION_FORMAT=HTML`, apply the dedicated static/browser checks and visual inspection in [Web Presentation Engine](web-presentation-engine.md). Use `assets/web-validation.js` and, when available, `scripts/render-web-presentation.js`. A successful static check does not replace browser interaction testing or visual review.

For `DETAILED`, `ULTRA_DETAILED`, `HANDOUT`, or `DUAL`, run the pedagogical and print checks in [Teaching & Handout Engine](teaching-handout-engine.md) before or alongside the visual checks. Pedagogical validation is a distinct gate: visual polish cannot compensate for missing, unordered, or unactionable instruction.

## Structural checks

1. Confirm that the PPTX exists and is non-empty.
2. Confirm the ZIP/PPTX is structurally valid, for example with `unzip -t presentation.pptx`.
3. Inspect `ppt/slides/slide*.xml` for expected slide count and `ppt/media/` for packaged images.
4. Confirm expected text is present in source or slide XML and that source asset paths exist.
5. Confirm slide dimensions, then inspect source coordinates, sizes, image crop/contain use, font sizes, and paths for obvious out-of-bounds, missing-file, or readability problems.

For a diagram or process, also perform a lightweight semantic review: verify arrow direction, connection ambiguity, logical grouping, unnecessary crossings, relationships that could be misread, and the distinction between the main flow and secondary systems. This is a guided content check, not a general architecture-understanding engine.

## Render-and-review loop

When LibreOffice is available on macOS, run `node scripts/render-presentation.js presentation.pptx rendered/`; it creates a PDF and one high-resolution `slide-XX.png` per slide. Otherwise use PowerPoint or an equivalent renderer. Inspect every slide using [visual validation](visual-validation.md), correct the JavaScript source, regenerate the PPTX, and rerender. Limit the automatic build-render-review loop to three passes by default.

When no renderer exists, complete the structural/code checks and explicitly say that full visual inspection could not be performed. Do not claim an inspection that was unavailable.

Stop when structural checks pass and the final visual review, when available, finds no material defect. If a material issue remains after three passes, deliver the best available result and report the limitation precisely. Report any rendering tool limitation and the alternate check used.
