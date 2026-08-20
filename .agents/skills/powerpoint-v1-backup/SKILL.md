---
name: powerpoint
description: Create, modify, and validate editable PowerPoint presentations using PptxGenJS. Use this skill whenever the user asks to create a PPTX presentation, presentation slides, training decks, educational presentations, business presentations, or PowerPoint files. Combine with the imagegen skill when original images or illustrations are needed.
---

# PowerPoint Presentation Skill

Use PptxGenJS to create editable PowerPoint presentations.

## Core principles

- Create real editable PowerPoint elements whenever possible.
- Do not render an entire slide as one flat image unless explicitly requested.
- Keep titles, body text, shapes, tables, charts, and diagrams editable.
- Use images as image elements.
- Default presentation format is 16:9 widescreen.
- Use French language when the user's presentation is in French.
- Keep layouts clean, readable, and visually balanced.
- Avoid excessive text.
- Never allow text or objects to extend outside the slide.
- Preserve consistent typography, spacing, and visual hierarchy across slides.

## Image generation

When original visual assets are needed:

1. Use the `imagegen` skill.
2. Generate images suitable for the slide composition.
3. Save generated images inside the current presentation project's `assets/images` 
directory.
4. Insert the generated images into the PowerPoint with PptxGenJS.
5. Do not place important text inside generated images unless explicitly requested.
6. Prefer landscape images for full-width presentation backgrounds.
7. Prefer portrait or square images when they fit the slide composition better.
8. Generate images with sufficient resolution for presentation use.
9. When multiple images are generated for the same presentation, maintain a consistent 
visual style.

## Presentation workflow

For a new presentation:

1. Understand the audience and objective.
2. Identify the desired tone and visual style.
3. Create a slide-by-slide outline before writing the PowerPoint code.
4. Define a consistent visual system.
5. Define typography, colors, spacing, and layout rules.
6. Generate required visual assets using `imagegen`.
7. Build the PowerPoint with PptxGenJS.
8. Save the source JavaScript alongside the PPTX.
9. Render or inspect slides when rendering tools are available.
10. Check for text overflow, clipping, overlapping objects, and unreadable content.
11. Correct problems before delivering the final PPTX.

## Default format

Use `pptx.layout = "LAYOUT_WIDE";`

The default slide dimensions are approximately:

- Width: 13.333 inches
- Height: 7.5 inches
- Aspect ratio: 16:9

## Project structure

Prefer the following structure for each presentation:

    presentation-name/
    ├── presentation.pptx
    ├── presentation.js
    ├── assets/
    │   ├── images/
    │   ├── icons/
    │   └── logos/
    └── rendered/

Create the directories when necessary.

## PowerPoint code requirements

Use:

    const pptxgen = require("pptxgenjs");

Initialize the presentation with useful metadata:

    const pptx = new pptxgen();

    pptx.author = "Codex";
    pptx.lang = "fr-FR";
    pptx.layout = "LAYOUT_WIDE";

Set the presentation title and subject when appropriate.

## Reusable components

Use reusable JavaScript functions for repeated visual elements such as:

- titles
- subtitles
- footers
- page numbers
- section headers
- cards
- image blocks
- text blocks
- icons
- callouts
- quotation blocks

Avoid duplicating large blocks of PowerPoint code.

## Typography

Prefer a small number of fonts throughout a presentation.

Use fonts that are likely to be available on common systems.

Avoid decorative fonts unless explicitly requested.

Maintain a clear hierarchy between:

- presentation title
- slide title
- subtitle
- body text
- captions
- footnotes

Do not use excessively small text.

For normal presentation slides, prefer body text that remains readable when projected.

## Text

Keep slide text concise.

Do not fill slides with long paragraphs unless the user explicitly requests a 
text-heavy presentation.

Prefer:

- short sentences
- bullet points
- keywords
- visual explanations
- diagrams
- cards
- timelines
- simple charts

Never put important presentation text inside a generated image unless the user 
explicitly requests it.

## Images

Images must preserve their aspect ratio.

Never stretch or distort an image.

When placing an image inside a defined area, crop or contain the image appropriately 
rather than changing its proportions.

Use high-quality images suitable for the intended presentation size.

For generated images, use the `imagegen` skill whenever available.

When an image is intended as a background, ensure that the composition leaves enough 
visual space for overlaid text.

## Image and text composition

When placing text over an image:

- ensure sufficient contrast
- avoid placing text over visually complex areas
- use an overlay or gradient when necessary
- maintain safe margins
- keep text readable

If the generated image contains a person or important subject, avoid placing text 
directly over the face or main subject.

## Colors

Use a coherent color palette.

Prefer a limited palette:

- primary color
- secondary color
- accent color
- background color
- text color

Avoid using many unrelated colors.

If the user provides a brand palette, follow it.

If the user provides a reference image, extract the visual characteristics from the 
reference and use them consistently without copying protected logos or artwork unless 
the user supplied them for that purpose.

## Layout

Maintain consistent margins.

Do not place important elements too close to the slide edges.

Use alignment guides conceptually:

- left alignment
- right alignment
- center alignment
- consistent vertical rhythm

Do not overcrowd slides.

Prefer visual hierarchy over symmetry when symmetry makes the slide less readable.

## Common slide layouts

Use appropriate layouts based on content.

Possible layouts include:

- title slide
- title + large image
- image left + text right
- text left + image right
- two-column comparison
- three-card layout
- four-card layout
- quote slide
- statistics slide
- timeline
- process diagram
- comparison table
- section divider
- conclusion
- call to action

Do not force every slide into the same layout.

## Charts and diagrams

When charts or diagrams are needed:

- use native PowerPoint shapes and charts whenever practical
- keep labels editable
- keep diagrams simple
- use consistent colors
- avoid unnecessary decorative elements

Do not create a chart as a single flat image if it can reasonably be created as an 
editable PowerPoint chart.

## Accessibility and readability

Ensure adequate contrast between foreground and background.

Avoid relying solely on color to communicate meaning.

Use sufficiently large text.

Keep important information visually distinct.

## Validation

Before considering a presentation finished:

1. Verify that the PPTX file was successfully generated.
2. Verify that the file can be opened.
3. Inspect every slide when rendering tools are available.
4. Check for:
   - text overflow
   - clipped text
   - objects outside the slide
   - overlapping elements
   - distorted images
   - inconsistent margins
   - unreadable text
   - inconsistent typography
   - inconsistent colors
5. Correct detected problems.
6. Regenerate the PPTX after corrections.
7. Perform a final inspection.

Never assume that the first generated PPTX is visually correct.

## Rendering

When a PowerPoint rendering tool is available, render the presentation to images 
before finalizing it.

Store temporary rendered images inside:

    rendered/

Use the rendered slides to inspect the visual result.

If a rendering tool is not available, still perform structural checks on the PPTX and 
inspect the generated source code carefully.

## File organization

Keep generated files organized.

For each presentation, prefer:

    presentation-name/
    ├── presentation.pptx
    ├── presentation.js
    ├── assets/
    │   ├── images/
    │   ├── icons/
    │   └── logos/
    └── rendered/

Do not place unrelated project files in the presentation directory.

Do not delete source files unless explicitly requested.

## Imagegen integration

When the user requests original illustrations, photographs, backgrounds, icons, or 
decorative artwork:

1. Determine what visual assets are required.
2. Use the `imagegen` skill to generate them.
3. Save the generated assets inside the presentation project.
4. Give each asset a meaningful filename.
5. Integrate the assets into the PowerPoint.
6. Keep all important textual information as editable PowerPoint text.

When multiple generated images belong to the same presentation:

- maintain a consistent art direction
- maintain consistent lighting
- maintain consistent color treatment
- maintain consistent perspective when appropriate
- maintain consistent character or object appearance when relevant

## Presentation planning

Before generating a multi-slide presentation, create a concise internal plan 
containing:

- target audience
- objective
- number of slides
- slide titles
- key message of each slide
- visual concept of each slide
- required images
- expected interactions or animations if relevant

Do not generate unnecessary slides.

Each slide should have one primary communication objective.

## Educational presentations

For educational presentations:

- adapt vocabulary to the audience
- favor visual explanations
- avoid excessive text
- use examples
- use progressive complexity
- distinguish important concepts clearly
- include summaries when useful
- use questions or interactive elements when appropriate

## Professional presentations

For professional presentations:

- prioritize clarity
- use strong hierarchy
- use restrained visual decoration
- maintain consistent branding
- use charts and diagrams when they communicate information better than text

## Social-media-derived presentations

When converting social media content into slides:

- do not simply paste social media posts onto slides
- transform the content into a coherent narrative
- use short headlines
- use strong visual hierarchy
- use appropriate imagery

## Existing PowerPoint files

When modifying an existing PowerPoint:

1. Inspect the existing presentation structure.
2. Preserve its visual identity unless the user asks for a redesign.
3. Preserve existing content unless asked to change it.
4. Make only the requested modifications.
5. Verify that the modified file still opens correctly.
6. Inspect the modified slides when rendering is available.

## Templates

If the user provides a PowerPoint template:

- use it as the base presentation when practical
- preserve its dimensions
- preserve its theme and visual identity
- reuse existing layouts where appropriate
- do not unnecessarily recreate the template from scratch

## Logos and branding

When the user provides a logo:

- preserve its proportions
- do not distort it
- use transparent PNG/SVG assets when available
- position it consistently
- do not place it so close to the edge that it can be clipped

## Output requirements

When the task is complete, provide the final PowerPoint file.

When appropriate, also provide:

- the JavaScript source
- generated image assets
- a rendered preview
- supporting files

The primary deliverable should be the `.pptx`.

## Important restrictions

- Do not replace an editable presentation with a collection of slide screenshots.
- Do not rasterize text unless explicitly requested.
- Do not distort images.
- Do not knowingly create clipped or overflowing text.
- Do not knowingly leave overlapping objects.
- Do not remove source files without permission.
- Do not use external image-generation APIs when the `imagegen` skill is available.
- Prefer the built-in `imagegen` capability for original image generation.
