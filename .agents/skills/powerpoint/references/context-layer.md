# Context Layer

V4.5 resolves optional reusable environment defaults before the Intent Layer. Context answers “where does the user work?”; intent still answers “what do they want to make?”. Use `resolveRequestWithContext()` from `assets/context-layer.js`. Passing `null` or `NONE` preserves V4.4.1 behavior.

Priority is `explicit user constraint > explicit context override > active context > preset > inference > default`. Context may make a brand and preset family eligible, but must not impose audience, depth, or delivery independently of intent and audience.

`EPN_RIVIERE_SALEE_CONTEXT` supplies the organization name, EPN brand eligibility, mappings from supported audiences to EPN presets, and `AUDIENCE_REPRESENTATION=MARTINIQUE`. Audience representation is an art-direction default, not a pedagogical profile. Preserve `explicit user request > context default > other inference`: an explicit different public wins, and “aucun personnage” disables human representation. Passing `NONE` injects no Martinique representation. An explicit “sans identité EPN” selects `GENERAL_PRESENTATION` with no brand. Resolution traces record context id, source, inherited signals, and overrides.

`MARTINIQUE` primarily affects people when a scene genuinely needs them: credible contemporary Martinican and Afro-Caribbean adults or seniors, natural variation in skin tones and hair, everyday clothing, natural attitudes, dignified non-caricatural treatment, and believable settings. It does not automatically add beaches, palm trees, traditional clothing, tropical decoration, tourism cues, or people to a non-human visual.
