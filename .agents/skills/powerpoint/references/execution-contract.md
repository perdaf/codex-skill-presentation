# Mandatory execution contract

This contract is runtime-independent. The agent runtime supplies callable tools only after deterministic pedagogical, contextual, and artistic decisions are complete.

## Required order

1. Read the user request and identify an explicitly supplied or workspace-provided active context. Do not infer an organizational context merely from the fact that this skill is installed.
2. Call `resolveRequestWithContext(request, activeContext, options)` before composition. Its resolved configuration is the source of truth; do not reconstruct `brand`, `profile`, `contentDepth`, `deliveryMode`, `pageBudget`, or `audienceRepresentation` manually.
3. Feed that configuration to Teaching, Brand, and Visual Intelligence as applicable.
4. Build the Visual Bible and Visual Manifest before asset generation.
5. For a human `EDITORIAL_SCENE`, verify that `AUDIENCE_REPRESENTATION` and `HUMAN_REPRESENTATION` reach the final prompt when applicable.
6. Resolve `VISUAL_ROLE → IMAGE_METHOD → CAPABILITY`, then let the runtime map the capability to a callable provider.
7. Generate assets, compose, and validate.

Use `prepareImageAsset()` from `assets/mandatory-pipeline.js` to produce a resolved configuration, Visual Bible, manifest, final prompt, runtime resolution, and minimal pre-generation trace without invoking a generator.

## Context activation

Pass `EPN_RIVIERE_SALEE_CONTEXT` only when the project or environment explicitly provides it. A missing active context is `NONE`; it is not an invitation to infer EPN defaults. Explicit user values keep priority over context defaults.

## Fail-safe

If the resolver cannot execute, a complete structured configuration already produced by the deterministic pipeline may be reused. Otherwise stop with an explicit `BLOCKED` result. Do not fabricate approximate values. A human editorial scene that should contain representation invariants but lacks them must also block before provider resolution.

## Pre-generation trace

Always inspect at least:

- `CONTEXT`, `PRESET`, `BRAND`, `PROFILE`, `CONTENT_DEPTH`, `DELIVERY_MODE`, `AUDIENCE_REPRESENTATION`;
- for a human editorial scene: `VISUAL_ROLE`, `IMAGE_METHOD`, `HUMAN_REPRESENTATION`, `RUNTIME_CAPABILITY`, `RUNTIME_PROVIDER`.

The trace complements the Visual Bible and Visual Manifest; it does not replace either one.
