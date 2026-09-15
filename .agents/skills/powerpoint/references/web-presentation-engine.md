# Web Presentation Engine — V4.6

V4.6 adds an HTML/CSS/JavaScript renderer without replacing any V4.5.2 engine. `DELIVERY_MODE` describes the pedagogical deliverable; `PRESENTATION_FORMAT` describes the technical format of the presentation branch.

## Resolution contract

Use `resolveV46RequestWithContext()` from `assets/presentation-format.js`. It delegates all V4.5.2 Context and Intent decisions to the stabilized resolvers, then adds format resolution.

- `DELIVERY_MODE=PRESENTATION`: presentation branch only.
- `DELIVERY_MODE=HANDOUT`: A4 PDF only; `PRESENTATION_FORMAT` is not applicable and no format question is allowed.
- `DELIVERY_MODE=DUAL`: presentation branch plus A4 PDF handout from the same master content.
- `PRESENTATION_FORMAT=HTML`: local web presentation.
- `PRESENTATION_FORMAT=PPTX`: editable PowerPoint generated with PptxGenJS.
- `PRESENTATION_FORMAT=AUTO`: unresolved technical format. It is never a final presentation output.

An explicit request has priority. Direct projection from a computer, an interactive presentation, a web presentation, a browser presentation, or HTML resolves to `HTML`. PowerPoint, PPTX, or a file intended for editing in PowerPoint resolves to `PPTX`.

When delivery contains a presentation and usage is not unambiguous, stop before composition and ask exactly:

> La présentation sera-t-elle projetée directement depuis l’ordinateur ?

Treat the answer as material. A confirmed direct projection resolves to HTML; a declined direct projection resolves to PPTX unless the user separately names a format. Do not ask when the request already resolves the format. Never ask for HANDOUT-only work.

`assets/v46-pipeline.js` wraps the V4.5.2 Mandatory Pipeline. It returns `PRESENTATION_FORMAT_CLARIFICATION_REQUIRED` before image preparation when a presentation format is still `AUTO`; after resolution it delegates to the unchanged Mandatory Pipeline.

## Output and offline contract

Prefer:

```text
presentation-web/
├── index.html
├── styles.css
├── presentation.js
└── assets/
    └── images/
```

Use `assets/web-presentation-engine.js` to create the project. Keep fonts, images, icons, CSS, and JavaScript local. The final presentation must open from `index.html` in a modern browser without a server and without an undeclared network dependency. A declared online dependency is a visible limitation, not the default. Do not turn slides into a scrolling site, landing page, dashboard, or generic web application.

Each `.web-slide` is one pedagogical 16:9 screen with one main idea and focal point. Preserve the resolved profile, Senior constraints, Brand layer, EPN Rivière-Salée identity, palette, audience representation, master content, page budget, and pedagogical validation. HTML is a renderer after the same deterministic layers, not a competing content pipeline.

## Visual and interaction routing

Keep the existing visual sequence unchanged:

`VISUAL_OPPORTUNITY → VISUAL_ROLE → IMAGE_METHOD`

After it, the HTML renderer may add:

`INTERACTION_METHOD = STATIC | REVEAL | HIGHLIGHT | STEP_SEQUENCE | BEFORE_AFTER | QUIZ_REVEAL`

Use `assets/web-interactions.js`. Select interaction only when it improves attention, sequencing, comparison, practice, recall, or explanation. `PROGRESSIVE_DISCLOSURE` changes presentation state only; it never edits, deletes, reorders, or fragments the authoritative master content.

- `STATIC`: no material interaction benefit.
- `REVEAL`: reveal a small set of related items.
- `HIGHLIGHT`: temporarily emphasize a named element.
- `STEP_SEQUENCE`: disclose an ordered procedure one step at a time.
- `BEFORE_AFTER`: controlled visual comparison.
- `QUIZ_REVEAL`: learner considers a question before revealing the answer.

The bundled runtime provides left/right, Page Up/Page Down, Space, Home/End, discreet previous/next buttons, progress, slide number, and a full-screen control. It also supports the interaction methods above. Essential information stays in the DOM and visible without JavaScript. When reduced motion is requested, progressive content is shown and transitions are disabled.

For SENIOR, use large obvious controls, labels, no complex gesture, slow understandable motion, stable navigation, strong contrast, and few simultaneous targets. Never make essential information animation-only. The default runtime uses at least 48 px click targets and a slower motion token for the Senior profile.

## Images and runtime independence

`EDITORIAL_SCENE → IMAGEGEN` and all earlier image rules remain unchanged. Run the Mandatory Pipeline, Visual Bible, and Visual Manifest before calling a runtime capability. `AUDIENCE_REPRESENTATION=MARTINIQUE` and `HUMAN_REPRESENTATION` must reach the final prompt exactly as for PPTX. Store generated or supplied images under the web project’s local `assets/images/` directory.

The generated presentation uses standards-based HTML, CSS, and JavaScript. It does not depend on Codex, Antigravity, ImageGen, a proprietary player, a package CDN, or a running server after generation. Runtime-specific tools may help create or validate assets, but are not execution dependencies of the final deliverable.

## Targeted Edit for HTML

Use `createWebTargetedEditPlan()` from `assets/web-targeted-edit.js`. It delegates PPTX projects to the unchanged V4.5.2 planner and recognizes HTML projects by their local entrypoint, stylesheet, and runtime.

Resolve the named slide through `data-slide-index`/`data-slide-id`, then patch only the selected section, local style rule, referenced local asset, or interaction wiring. Preserve all other slide sections and components. Use `validateUntargetedSlidesPreserved()` to compare untouched slide fingerprints. An interaction edit may affect the targeted HTML section and the local runtime only when required; do not rerun global art direction, profile, brand, storyboard, page budget, or the handout.

Text changes still pass `validateTargetedEditReadability()`. Generated image replacements still pass Visual Intelligence and the Mandatory Pipeline. Pedagogical edits still report consistency impact across master content and handout and propagate only when explicitly authorized.

## HTML validation

Use `validateWebPresentationProject()` from `assets/web-validation.js`, then perform a real browser run and visual inspection. Validate:

- required project files and expected slide count;
- a 16:9 shell and one correct initial active slide;
- no slide overflow, clipping, collision, or off-screen content;
- audience/profile minimum text size and Senior readability;
- local assets exist, load, and have no broken reference;
- no undeclared Internet dependency;
- JavaScript syntax and runtime errors;
- keyboard, mouse, progress, slide numbering, and full-screen control when present;
- progressive disclosure and each selected interaction;
- essential content remains accessible with JavaScript or animation disabled;
- Senior click targets and interaction simplicity;
- visual quality, hierarchy, crop, contrast, spacing, rhythm, and fidelity to storyboard/art direction.

`scripts/render-web-presentation.js` can render every slide through a locally available Chromium-compatible browser. Browser automation is a validation aid, not a final-deliverable dependency. If browser rendering is unavailable, report that visual and interaction validation could not be completed; static validation alone is not visual approval. Keep the existing three-pass correction limit.
