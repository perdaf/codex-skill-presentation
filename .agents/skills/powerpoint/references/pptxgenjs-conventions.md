# PptxGenJS conventions

Use `pptxgenjs` 4.0.1 as the primary engine and retain a reproducible `presentation.js` beside the final PPTX.

```js
const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.lang = 'fr-FR';
```

Set language, title, subject, and layout from the request. A supplied template controls dimensions and theme.

- Centralize colors, fonts, scale, margins, and spacing. Adapt [`assets/presentation-components.js`](../assets/presentation-components.js) rather than duplicating large style blocks.
- Keep editable material in PptxGenJS text, shapes, tables, and charts. Use PptxGenJS image `sizing` with `cover` or `contain`; never stretch images.
- Use native charts where quantitative comparison matters. Keep labels, legend, and units readable, and simplify categories when needed.
- Build simple processes and diagrams from shapes/connectors; avoid crossing lines.
- Use inches consistently and verify every coordinate and size against the selected slide dimensions.
- Avoid unlicensed external-font dependencies. Prefer common-system fallbacks when a brand font cannot be embedded.

The component template exports `createComponents(pptx, tokens)` with titles, subtitles, footer/page number, cards, images, text blocks, section headers, quotes, statistics, timelines, processes, comparisons, and editable charts. Adapt it to the particular deck and retain the adapted code in the presentation project.
