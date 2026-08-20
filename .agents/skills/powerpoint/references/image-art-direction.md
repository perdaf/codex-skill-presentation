# Image art direction

Before generating a set, write a compact visual bible and reuse it verbatim in every image prompt. Include medium/style, light, palette, contrast, lens or perspective, texture, realism, framing, treatment, mood, and exclusions. Derive these choices from the active profile and brand. The bible controls coherence; the scene-specific suffix controls subject matter.

Every prompt must also describe its destination region and crop tolerance:

- right-side image with text left: place the subject toward the right third and preserve calm negative space on the left;
- left-side image: inverse placement;
- centered title overlay: keep the central title zone low-detail and high-contrast;
- 16:9 full bleed: provide edge-safe context and a focal point that survives cropping;
- portrait/card: request the card ratio, headroom, and safe facial crop;
- image grid: use compatible perspective, scale, light, and color treatment across all cells.

Generate for the target layout rather than forcing a finished image into an incompatible crop. Avoid generic stock-photo concepts, embedded words, watermarks, logos, charts, diagrams, or other content that should remain editable. Follow `image-generation.md` for tool choice and the `gpt-image-2` fallback.
