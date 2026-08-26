# Image art direction

Before generating a set, write a compact visual bible and reuse it verbatim in every image prompt. Include medium/style, light, palette, contrast, lens or perspective, texture, realism, framing, treatment, mood, and exclusions. Derive these choices from the active profile and brand. The bible controls coherence; the scene-specific suffix controls subject matter.

Also record `BRAND`, `PROFILE`, `CONTENT_DEPTH`, `DELIVERY_MODE`, `VISUAL_OPPORTUNITY`, `VISUAL_ROLE`, `IMAGE_METHOD`, `VISUAL_EXPRESSION`, `READ_SEE_BALANCE`, `COMPOSITION`, `SUBJECT_POSITION`, `NEGATIVE_SPACE`, `CROP_STRATEGY`, `STYLE_INVARIANTS`, and `SCENE_VARIABLES`. `IMAGE_METHOD=IMAGEGEN` describes the visual method and remains independent of the physical runtime tool. For execution, resolve `IMAGEGEN → NATIVE_IMAGE_GENERATION → runtime tool`, using the callable native provider declared by the current environment. Use `createVisualManifest()` and `visualBibleToMarkdown()` from `assets/visual-bible.js` so important decisions populate the Visual Bible automatically. Determine layout and composition before writing an ImageGen prompt; a subject-only prompt is insufficient for slide-bound imagery.

For an `EDITORIAL_SCENE` that actually contains people, also transmit the resolved `AUDIENCE_REPRESENTATION`. Under `EPN_RIVIERE_SALEE_CONTEXT`, default to `MARTINIQUE` unless the user explicitly requests another representation or no characters. Record `AUDIENCE_REPRESENTATION: MARTINIQUE` and the human invariant `contemporary Martinican / Afro-Caribbean representation, natural and non-stereotypical`. Apply the same invariant through every runtime provider. Omit both fields when the visual has no people.

For several images in one visual universe, split the visual bible into two explicit blocks:

- **INVARIANTS:** style, palette, texture, light, detail level, treatment, recurring characters, and their proportions or visual personality;
- **VARIABLES:** scene, action, framing, composition, and subject position.

Repeat the invariants explicitly in every successive image prompt. Change only the variables required by the target slide. When recurring characters appear, preserve their identifying features and proportions rather than merely requesting “the same style.”

Every prompt must also describe its destination region and crop tolerance:

- right-side image with text left: place the subject toward the right third and preserve calm negative space on the left;
- left-side image: inverse placement;
- centered title overlay: keep the central title zone low-detail and high-contrast;
- 16:9 full bleed: provide edge-safe context and a focal point that survives cropping;
- portrait/card: request the card ratio, headroom, and safe facial crop;
- image grid: use compatible perspective, scale, light, and color treatment across all cells.

Generate for the target layout rather than forcing a finished image into an incompatible crop. Avoid generic stock-photo concepts, embedded words, watermarks, logos, charts, diagrams, or other content that should remain editable. Follow `image-generation.md` for capability resolution and the `gpt-image-2` fallback; do not assume a universal native tool name.
