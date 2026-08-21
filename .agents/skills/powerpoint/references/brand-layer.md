# Brand Layer

The brand layer is optional. Resolve the audience profile and teaching configuration first, then merge a named brand through `assets/brands/index.js`. A brand supplies identity, palette, typography family, graphic signature, component variants, footer behavior, projection/handout rules, and image art direction. It does not replace profile density, rhythm, audience sizing, or accessibility.

Priority is: technical and accessibility constraints → audience/profile → teaching configuration → brand → aesthetic variation. A brand minimum never reduces a larger profile size. Handout print rules override projection-scale image ambitions.

Use `resolveBrand()`, `mergeBrandWithTheme()`, or `applyBrand()`. Keep brand definitions centralized under `assets/brands/`; do not scatter `if (brand === ...)` conditions. Existing `resolveTheme()`, `selectProfile()`, `deriveBrandTheme()`, and `createVariation()` remain compatible.

## EPN_RIVIERE_SALEE

Visible name: **EPN de Rivière-Salée**. Signature: **EPN de Rivière-Salée • Atelier numérique**. The palette, Arial typography, segment–dot–capsule signature, pedagogical callouts, projection rules, handout rules, and audience-aware image direction are defined in `assets/brands/epn-riviere-salee.js`.

Use `createBrandComponents()` from `assets/brand-components.js` for the reusable signature, callouts, action steps, and footer. Color never carries meaning alone: labels, numbering, shapes, and hierarchy remain explicit.

Brand components resolve `ShapeType` from the real PptxGenJS presentation instance. A future engine may inject it explicitly through the optional dependency argument. Do not import `ShapeType` as a static property of the PptxGenJS constructor. Runtime tests must execute every exposed component on a real slide and serialize a temporary PPTX; checking function presence is insufficient.

Projection follows **COMPRENDRE + VOIR + PRATIQUER**. Handouts follow **COMPRENDRE + REFAIRE SEUL**, remain A4 portrait, mostly white, print-friendly, and may omit projection imagery.
