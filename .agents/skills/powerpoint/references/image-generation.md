# Image generation and fallback

Use this procedure only when a presentation genuinely benefits from original raster photos, illustrations, or backgrounds. Keep charts, tables, simple diagrams, labels, and meaningful slide text editable in PptxGenJS.

## Decision tree

1. Resolve the logical capability `NATIVE_IMAGE_GENERATION` from the callable tools actually exposed by the current agent runtime. Do not infer availability from an installed skill, local documentation, or one presumed universal tool name. In Codex the concrete tool may be `imagegen`; in Antigravity it may be `default_api:generate_image`; another runtime may declare a different compatible provider.
2. If `NATIVE_IMAGE_GENERATION` is callable, use the runtime's normal invocation mechanism and instructions. Save/copy each selected result into the presentation's `assets/images/` directory, then reference that project-local file from PptxGenJS.
3. If no compatible native capability is callable, check only whether `process.env.OPENAI_API_KEY` is non-empty and whether the runtime's current network permissions allow the API request. Never print the key, put it in a command line, write it to a file, modify it, or add it to the project.
4. Only when both conditions hold, `OPENAI_API_FALLBACK` is eligible through `scripts/generate-image.js`. The script calls the OpenAI Images API using `gpt-image-2` and accepts either a single prompt/output pair or a JSON manifest for multiple distinct prompts. Eligibility and success also depend on runtime policy, API quota, and rights to the model.
5. Never request or enable `BypassSandbox`, a sandbox workaround, or silent privilege elevation. If the runtime requires authorization, use only its normal authorization flow; if that authorization is unavailable or declined, abandon the API fallback cleanly.
6. If neither raster path is available, return `NO_RASTER_GENERATION`. Continue with existing V4.5 native PowerPoint, SVG/vector, diagram, or pedagogical-object methods when pedagogically acceptable. Do not replace a true `EDITORIAL_SCENE` with a weak PowerPoint illustration unless no better capability is available.

Do not ask a user to paste a key into chat. A configured environment variable is the only credential source for the fallback. `assets/image-generation-runtime.js` models this selection without invoking a provider or inspecting the secret value.

## Art direction for a set of images

Before generating any images, write the visual bible specified in [image art direction](image-art-direction.md). Repeat it in every prompt, then add the image-specific scene and the destination-aware crop/negative-space instructions. Use descriptive filenames such as `hero-robot-lab.png` or `privacy-lock-illustration.png`.

Avoid meaningful text inside generated images. Compose titles, labels, statistics, diagrams, and calls to action as editable PowerPoint elements.

## Fallback script

The script needs Node.js 18+ for built-in `fetch`, and reads `OPENAI_API_KEY` from `process.env` only. It does not depend on the OpenAI npm package.
It rejects output paths outside an `assets/images/` directory and writes PNG files only.

Single image:

```sh
node .agents/skills/powerpoint/scripts/generate-image.js \
  --prompt "3D educational illustration of a curious robot in a bright classroom; no text" \
  --output my-deck/assets/images/hero-robot.png \
  --size 1536x1024
```

Several distinct images use a manifest. Store the manifest outside the generated presentation if it contains only temporary prompts, or keep it with the source if it is part of the reproducible project:

```json
{
  "style": "Friendly 3D educational illustration, rounded shapes, bright blue and yellow palette, soft light, no text or watermark.",
  "images": [
    { "prompt": "A child and a small robot exploring a library", "output": "my-deck/assets/images/library.png", "size": "1536x1024" },
    { "prompt": "A friendly shield protecting a child’s private data", "output": "my-deck/assets/images/privacy.png", "size": "1024x1024" }
  ]
}
```

```sh
node .agents/skills/powerpoint/scripts/generate-image.js --manifest image-manifest.json
```

The fallback sends one request per manifest item, so each image can use a distinct prompt and crop. It prints only the generated file paths. Integrate the saved file with PptxGenJS using `addImage({ path, sizing: { type: 'cover' | 'contain', x, y, w, h } })`.

If the API key is absent, the script exits with a clear error and does not make a network request. Network permissions, runtime policy, API quota, and model access can still prevent the fallback. GPT Image access may additionally require API organization verification; consult the official OpenAI image-generation documentation when an API request is denied.
