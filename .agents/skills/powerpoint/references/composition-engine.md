# Composition engine

For each slide, decide in order: primary message, focal point, reading order, dominant region, supporting evidence, then decoration only if it serves orientation or tone. Judge hierarchy, balance, contrast, alignment, density, repetition, rhythm, and negative space at deck scale.

## Anti-patterns

Reject walls of text; repeated identical cards; universal centering; excessive rounded corners or shadows; gratuitous gradients; decorative icons; colors without semantic roles; generic imagery; repeated layouts; title plus five bullets on every slide; illegible captions; fake dashboards; visual overload; and generic PowerPoint-template styling.

Prefer the smallest safe correction: remove a decorative element, strengthen one focal point, align to an existing edge, increase contrast, shorten copy, enlarge type, change crop, or split a dense slide. Do not introduce a new visual language during correction.

## Brand mode

Logo, supplied colors, template, brand guide, and existing presentation take priority over profiles. Extract explicit colors, typography, spacing, geometry, imagery, and layout conventions; create a derived theme with `deriveBrandTheme`; preserve template dimensions and masters where practical. Use the nearest profile only to fill gaps and record which decisions came from the brand versus the fallback profile.
