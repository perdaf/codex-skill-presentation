# Design system

Create the design system before implementation: visual intent; primary, secondary, accent, background, and text colors; typography; title, subtitle, body, caption, and statistic sizes; grid; margins; spacing increments; card treatment; icon style; and photographic or illustrative direction. A supplied brand guide, logo, template, or palette takes priority. A reference image can inform contrast, mood, texture, crop, lighting, and composition, but must not be copied as protected artwork.

For a 13.333 × 7.5 in deck, start with 0.55–0.75 in safe margins and a simple 12-column conceptual grid. Use one dominant color, one supporting color, one accent, and neutral background/text values. Reserve accent color for emphasis and data highlights.

Use fonts verified on the target machine and renderer. On the current macOS/LibreOffice setup, prefer Arial for robust sans-serif output, Georgia for editorial display, Arial Rounded MT Bold for KIDS display with Arial fallback, and Avenir Next only when local verification succeeds. Aptos has rendered poorly in LibreOffice here and is not a default. Define display, title, subtitle, body, caption, and stat roles. A practical scale is 28–38 pt title, 18–24 pt subtitle, 16–23 pt body, 11–15 pt caption, and 32–56 pt statistic; profiles may increase it. Never reduce body type merely to force overloaded content into a slide.

- Align to shared edges and repeated spacing increments.
- Make the main message dominant; let detail recede through size, contrast, or placement.
- Use negative space deliberately; keep cards, borders, shadows, and icon style consistent.
- For text over imagery, reserve calm space or add a restrained overlay. Do not cover faces or focal subjects.
- Ensure projection-ready contrast and avoid conveying meaning with color alone.

For several generated originals, define one image direction before invoking `imagegen`: editorial photography, premium cinematic photography, 3D illustration, vector illustration, pedagogical cartoon, or artistic collage. Repeat palette treatment, lighting, perspective, realism, crop, subject placement, and negative space in prompts. Prefer editable PowerPoint shapes for charts, arrows, diagrams, and simple icons.
