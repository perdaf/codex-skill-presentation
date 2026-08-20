# Validation and visual QA

The first generated deck is not automatically final. After each material correction, regenerate and validate it.

## Structural checks

1. Confirm that the PPTX exists and is non-empty.
2. Confirm the ZIP/PPTX is structurally valid, for example with `unzip -t presentation.pptx`.
3. Inspect `ppt/slides/slide*.xml` for expected slide count and `ppt/media/` for packaged images.
4. Confirm expected text is present in source or slide XML and that source asset paths exist.
5. Confirm slide dimensions, then inspect source coordinates, sizes, image crop/contain use, font sizes, and paths for obvious out-of-bounds, missing-file, or readability problems.

## Render-and-review loop

When LibreOffice, PowerPoint, or an equivalent renderer is available, render into `rendered/`, inspect every slide, then correct and rerender. Check text overflow/clipping, off-frame objects, overlap, distorted images, inconsistent margins, weak contrast, undersized items, and information overload.

When no renderer exists, complete the structural/code checks and explicitly say that full visual inspection could not be performed. Do not claim an inspection that was unavailable.

Stop when structural checks pass and the final visual review, when available, finds no material defect. Report any tool limitation and the alternate check used.
