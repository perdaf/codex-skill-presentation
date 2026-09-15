# Targeted Edit Layer

Use `EDIT_MODE=TARGETED` when natural language asks to change an existing presentation. Do not treat the request as a new deck.

## Source and scope

Prefer `presentation.js` over direct PPTX/OOXML editing and regenerate `presentation.pptx` from that source. Preserve existing master content, handout sources, Visual Bible, and manifest unless the request or consistency decision explicitly includes them. “Slide” means projection only by default; include the handout only when the user names it.

## Target and change resolution

Use `createTargetedEditPlan()` from `assets/targeted-edit.js`. It resolves single slides, lists, ranges, semantic element roles, exact text, connectors, and identifiable visual groups. Evidence from a supplied project inventory determines whether a target is unique. When several real matches would produce materially different edits, stop with `AMBIGUOUS_TARGET`.

For a V4.6 HTML project, use `createWebTargetedEditPlan()` from `assets/web-targeted-edit.js`. It preserves this contract, delegates PPTX work back to the existing planner, limits HTML edits to the named slide/component/files, and validates untouched slide fingerprints. Interaction-only changes never authorize rewriting unrelated slides or the handout.

Changes may combine `TEXT_CONTENT`, `TEXT_STYLE`, `LAYOUT`, `VISUAL_REPLACEMENT`, `IMAGE_REPLACEMENT`, `CONNECTOR`, `COLOR`, `TYPOGRAPHY`, `SIZE`, `POSITION`, `DELETE`, `ADD`, and `PEDAGOGICAL_CONTENT`.

## Minimal patch

The patch may touch only resolved target nodes and explicitly included outputs. Do not rerun global layout, palette, AUTO STYLE, profile, brand, page budget, storyboard, or art direction. Preserve position and dimensions during local visual replacement unless a small adaptation is necessary for overflow, collision, clipping, off-slide placement, or readability; record that adaptation.

An explicit generated-photo request overrides an earlier editable/vector recommendation. Route that one replacement through Visual Intelligence and `prepareImageAsset()` from the Mandatory Pipeline, preserving active brand, audience, `AUDIENCE_REPRESENTATION`, Visual Bible, Senior constraints, and local composition.

## Readability regression gate

After a targeted edit affecting text, call `validateTargetedEditReadability()` from `assets/targeted-edit-readability.js` before accepting the patch. Technical fit alone is insufficient. Validate the active profile's minimum type size, projection-distance readability, reasonable density, compression, clearance from neighboring objects, slide bounds, and preserved visual hierarchy. For `SENIOR`, accessibility takes priority over retaining the exact former geometry.

If the requested text does not remain readable in its former box, try in order: a reasonable enlargement of that box; a local layout adaptation around the target; an explicitly authorized shorter reformulation that preserves the exact requested meaning. Never keep shrinking type merely to make it fit. If no candidate passes, return `TARGETED_EDIT_READABILITY_REGRESSION` with `requiresUserDecision=true`. Do not trigger a global slide recomposition or alter other slides.

## Consistency

Style-only changes remain local. For pedagogical or informational edits, inspect occurrences in `content/course-content.md`, `handout.js`, the handout output, and other slides. Return `CONSISTENCY_IMPACT` without silently changing them. Propagate only for an explicit instruction such as “modifie partout”; otherwise ask before creating a material contradiction.

After regeneration, validate changed slides and any explicitly included handout pages, run the readability gate for textual edits, then run a regression comparison of untouched slides and outputs. Readability repair does not authorize changes to the handout or master content.
