# Layout library and rhythm

Use `assets/layouts.js` to obtain theme-aware regions with `getLayout(name, theme)`. Available layouts: `hero`, `split-left`, `split-right`, `full-bleed-image`, `statement`, `quote`, `three-cards`, `four-cards`, `stat-grid`, `comparison`, `timeline`, `process`, `before-after`, `image-grid`, `diagram`, `chart-focus`, `section-divider`, `question`, `quiz`, `conclusion`, and `call-to-action`.

Treat regions as composition guides, not mandatory boxes. Establish one focal point, align supporting elements to a small number of shared edges, and leave intentional negative space. Do not fill unused areas merely because they exist. Cards are for genuinely distinct comparable units, not the default container for every paragraph.

Plan the sequence before building. A useful rhythm alternates impact → information → respiration → evidence/data → image → comparison → conclusion. Use `chooseLayoutSequence` as a starting point and override it for the narrative. Do not use the same layout twice in a row without a narrative reason; avoid three successive slides with the same left/right structure.

Classify each storyboard row as `LOW`, `MEDIUM`, or `HIGH`. Most slides should be LOW or MEDIUM. Reserve HIGH for content whose relationships genuinely require simultaneous view; otherwise split the material. Never solve density primarily by shrinking text below the selected profile’s scale.
