# Design profiles

Select one profile before storyboarding. If the user supplied a brand, derive a brand theme first and use the nearest profile only for missing decisions. Profiles are starting systems, not fixed templates; coherence outranks variation.

| Profile | Palette and type | Density, geometry, imagery | Prefer / avoid | Recommended copy |
| --- | --- | --- | --- | --- |
| EDUCATION | Welcoming blue/teal/warm accent; large Arial | LOW; friendly geometry, soft cards; bright authentic illustrations/photos | diagrams, steps, quizzes / dense tables | title 3–8 words; 20–45 body words |
| KIDS | Expressive violet/teal/yellow; Arial Rounded with Arial fallback | LOW; soft shapes, generous radii; coherent cartoon illustration | hero, question, quiz, image-led / small text, long lists | title 2–6 words; 5–25 body words |
| SENIOR | White, deep blue, teal, amber; high-contrast Arial | LOW; minimal shadow/radius; clear high-contrast photos and bold icons | statement, process, comparison / captions below 15 pt, crowded cards | title 3–8 words; 10–35 body words |
| CORPORATE | Navy, controlled blue, restrained amber; Arial | MEDIUM; rigorous grid, restrained radius/shadow; clean editorial photos | charts, stats, comparison, process / decoration without function | title 3–9 words; 20–60 body words |
| PREMIUM | Black, warm ivory, muted gold; Georgia + Arial | LOW; sharp editorial forms, no gratuitous shadow; cinematic imagery | hero, full bleed, statement, asymmetric split / card grids, busy diagrams | title 2–7 words; 10–35 body words |
| MINIMAL | Black/white plus one accent; Arial | LOW; no radius/shadow; quiet, selective imagery | statement, split, chart focus / ornaments, excessive labels | title 2–7 words; 10–40 body words |
| TECH | Deep navy, blue, teal; Avenir Next with Arial fallback | MEDIUM; interface grid, restrained radius; crisp realistic or technical visuals | diagram, chart, process, comparison / automatic neon, fake dashboards | title 3–9 words; 20–60 body words |
| TROPICAL | Forest green, mineral teal, sun-warm accent, sand; Georgia + Arial | LOW; subtle organic/editorial shapes; warm natural documentary photography | full bleed, editorial split, image grid / postcard clichés, oversaturation | title 2–8 words; 15–45 body words |
| SOCIAL | Black, vivid violet/coral; large Arial | LOW; bold modular forms; high-impact crops | hero, statement, before-after, CTA / slow reading, long captions | title 2–6 words; 5–25 body words |
| EDITORIAL | Charcoal, paper, rust accent; Georgia + Arial | MEDIUM; magazine geometry, sharp images; documentary photography | full bleed, asymmetric split, quote, image grid / repetitive cards | title 2–8 words; 15–50 body words |

All token details live in `assets/themes/index.js`: colors, six text roles, spacing, radius, shadows, layout/grid, shape style, icon style, and photo style. Safe margins range from 0.64–0.86 in by profile.

## Automatic selection

Use `selectProfile(context)` or the same reasoning: children → KIDS; general training/beginners → EDUCATION; seniors/accessibility → SENIOR; results/business review → CORPORATE; luxury → PREMIUM; portfolio → EDITORIAL or MINIMAL; computing/data → TECH; Martinique/tropical tourism → TROPICAL, often with EDITORIAL rhythm; carousel/social → SOCIAL. Decide and continue instead of routinely asking.

The selector normalizes case, accents, punctuation, and apostrophes, then scores complete words and expressions. Do not use raw substring matching: `formation` must not match `transformation`. Strong contextual expressions outweigh isolated weak signals; for example, `formation professionnelle` may resolve to EDUCATION, while business-review or management signals can make CORPORATE the better fit.

## Controlled variation

Vary one or two secondary dimensions per deck: image-led/type-led/balanced composition, secondary palette role, selected layouts, photographic crop/treatment, or LOW/MEDIUM density. Never vary primary typography, color roles, image bible, alignment logic, and shape language simultaneously. Avoid repeating the same layout consecutively unless it represents a deliberate comparison or sequence.
