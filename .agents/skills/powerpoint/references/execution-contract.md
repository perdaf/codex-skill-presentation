# Mandatory execution contract

This contract is runtime-independent. The agent runtime supplies callable tools only after deterministic pedagogical, contextual, and artistic decisions are complete.

V4.6 adds a format-resolution gate before this unchanged asset pipeline. Call `resolveV46RequestWithContext()` from `assets/presentation-format.js`; if its presentation branch remains `PRESENTATION_FORMAT=AUTO`, ask the returned material question and do not compose or generate assets. `assets/v46-pipeline.js` enforces this gate, then delegates to `assets/mandatory-pipeline.js`. An explicit Gamma request resolves the gate to `GAMMA`; complete research, Teaching, content architecture, Brand and per-slide Visual Intelligence normally, then call `prepareGammaBlueprint()` from `assets/gamma-pipeline.js`. Gamma receives a validated rendering blueprint, never responsibility for rebuilding the pedagogical plan.

## Required order

1. Read the user request and identify an explicitly supplied or workspace-provided active context. Do not infer an organizational context merely from the fact that this skill is installed.
2. Call `resolveV46RequestWithContext(request, activeContext, options)` before composition. It delegates to `resolveRequestWithContext()` and adds material format resolution. Its resolved configuration is the source of truth; do not reconstruct `brand`, `profile`, `contentDepth`, `deliveryMode`, `presentationFormat`, `pageBudget`, or `audienceRepresentation` manually.
3. Feed that configuration to Teaching, Brand, and Visual Intelligence as applicable.
4. Build the Visual Bible and Visual Manifest before asset generation.
5. For a human `EDITORIAL_SCENE`, verify that `AUDIENCE_REPRESENTATION` and `HUMAN_REPRESENTATION` reach the final prompt when applicable.
6. Resolve `VISUAL_ROLE → IMAGE_METHOD → CAPABILITY`, then let the runtime map the capability to a callable provider.
7. Generate assets, compose, and validate.

Use `prepareV46ImageAsset()` from `assets/v46-pipeline.js` for V4.6 requests. After the format gate it delegates to `prepareImageAsset()` from `assets/mandatory-pipeline.js` to produce a resolved configuration, Visual Bible, manifest, final prompt, runtime resolution, and minimal pre-generation trace without invoking a generator.

## Context activation

Pass `EPN_RIVIERE_SALEE_CONTEXT` only when the project or environment explicitly provides it. A missing active context is `NONE`; it is not an invitation to infer EPN defaults. Explicit user values keep priority over context defaults.

## Fail-safe

If the resolver cannot execute, a complete structured configuration already produced by the deterministic pipeline may be reused. Otherwise stop with an explicit `BLOCKED` result. Do not fabricate approximate values. A human editorial scene that should contain representation invariants but lacks them must also block before provider resolution.

## Pre-generation trace

Always inspect at least:

- `CONTEXT`, `PRESET`, `BRAND`, `PROFILE`, `CONTENT_DEPTH`, `DELIVERY_MODE`, `PRESENTATION_FORMAT`, `AUDIENCE_REPRESENTATION`;
- for a human editorial scene: `VISUAL_ROLE`, `IMAGE_METHOD`, `HUMAN_REPRESENTATION`, `RUNTIME_CAPABILITY`, `RUNTIME_PROVIDER`.

The trace complements the Visual Bible and Visual Manifest; it does not replace either one.
