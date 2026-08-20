# Image generation and fallback

Use this procedure only when a presentation genuinely benefits from original raster photos, illustrations, or backgrounds. Keep charts, tables, simple diagrams, labels, and meaningful slide text editable in PptxGenJS.

## Decision tree

1. Determine whether the current session exposes a callable built-in `imagegen` tool. Do not infer availability from the presence of the `imagegen` skill, from a local `SKILL.md`, or from a presumed tool name. A tool is available only when it is exposed and can be invoked in the session.
2. If the built-in tool is callable, use it according to the `imagegen` skill. Save/copy each selected result into the presentation's `assets/images/` directory, then reference that project-local file from PptxGenJS.
3. If the built-in tool is not callable, check only whether `process.env.OPENAI_API_KEY` is non-empty. Never print the value, put it in a command line, write it to a file, or add it to the project.
4. If the environment variable is available, run `scripts/generate-image.js`. The script calls the OpenAI Images API using `gpt-image-2`, the currently recommended API image model at the time this skill was updated. It accepts either a single prompt/output pair or a JSON manifest for multiple distinct prompts.
5. If neither option is available, use temporary editable shapes only where practical, label the internal asset status accurately, and say in the delivery note that original images were not generated.

Do not ask a user to paste a key into chat. A configured environment variable is the only credential source for the fallback.

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

If the API key is absent, the script exits with a clear error and does not make a network request. GPT Image access may additionally require API organization verification; consult the official OpenAI image-generation documentation when an API request is denied.
