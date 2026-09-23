# Gamma Markdown Export

Read this reference when the user explicitly asks Gamma to create the slides, requests a Gamma brief, or asks for a Markdown file intended for Gamma.

## Scope

`PRESENTATION_FORMAT=GAMMA` is an additive authoring target. The skill produces a self-contained `.md` brief; it does not call Gamma, spend Gamma credits, upload content, or generate the final deck. Existing HTML, PPTX and handout engines remain unchanged.

Use the normal Context, Intent, Teaching, Brand and Visual Intelligence layers before export. The Markdown is a renderer of the resolved master content and storyboard, not a shortcut around them.

## Resolution

Explicit mentions of Gamma, a Gamma generation brief, or Markdown for Gamma resolve to `GAMMA`. Do not ask the direct-computer projection question because the technical target is already explicit. If Gamma and HTML/PPTX are both explicitly requested for the same presentation branch, return a format conflict and ask which target has priority.

For `HANDOUT` alone, Gamma is not applicable. For `DUAL + GAMMA`, deliver the Gamma Markdown brief plus the existing A4 handout PDF derived from the same master content.

## Slide budget

The user's account constraint is authoritative: one Gamma generation contains at most 20 slides. Treat `GAMMA_MAX_SLIDES=20` as a hard export limit even if Gamma's general product limits differ by plan or change over time.

- Preserve an explicit target from 1 to 20.
- For an automatic budget, choose the pedagogically appropriate count but cap it at 20.
- When the planned or explicitly requested content exceeds 20, apply pedagogical compression first.
- Never shrink type, overload slides, remove essential learning steps, or silently emit more than 20 slides.
- If a coherent deck cannot fit, report `NEEDS_PEDAGOGICAL_COMPRESSION` or `GAMMA_SLIDE_LIMIT_EXCEEDED` and propose either a narrower scope or multiple separately generated modules. Do not split into multiple decks without the user's agreement.

## Human representation

Unless the user explicitly requests another representation or no people, Gamma briefs default to `AFRO_ANTILLEAN` whenever a visual genuinely contains people. The instruction must request contemporary, varied, natural and dignified representation and must reject caricature, exoticization and automatic tropical clichés.

This default does not require people on every slide. Visual Intelligence still decides whether humans are pedagogically useful. Explicit user representation and explicit no-character requests retain priority.

## Markdown contract

Generate the file with `createGammaMarkdown()` from `assets/gamma-export.js`. Provide:

- title, audience, objective and language;
- the resolved pedagogical and artistic direction;
- one ordered storyboard entry per slide;
- for each slide: title, objective, message, visible content, visual direction and composition;
- participation or presenter notes when relevant;
- explicit representation instructions on slides that contain people;
- a final control checklist.

Each `Slide NN` section maps to exactly one Gamma slide. Keep actual slide content distinct from instructions so Gamma can preserve the intended narrative. Do not rely on Gamma to research or repair missing facts: establish and verify master content before export.

## Validation

Run `validateGammaBrief()` and verify:

- 1–20 slides;
- exact slide numbering and order;
- every slide has a title and meaningful content;
- visual directions are present where useful;
- the global Afro-Antillean representation rule is present unless explicitly overridden;
- slide-specific human scenes repeat the representation invariant;
- no contradictory output-format instruction;
- the Markdown is self-contained and contains no secret, API key, remote dependency or undeclared upload.

Because Gamma owns the final rendering, visual validation of the generated Gamma deck remains external to this exporter. State this limitation when delivering the Markdown.
