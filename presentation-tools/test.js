const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();

pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "Test PowerPoint";
pptx.title = "Test Codex + PptxGenJS";
pptx.company = "Steeve";
pptx.lang = "fr-FR";

const slide = pptx.addSlide();

slide.background = { color: "F5F5F5" };

slide.addText("Bonjour depuis Codex !", {
    x: 1,
    y: 2,
    w: 11.33,
    h: 0.7,
    fontSize: 32,
    bold: true,
    align: "center",
    color: "222222",
});

slide.addText("PowerPoint généré automatiquement avec PptxGenJS", {
    x: 2,
    y: 3,
    w: 9.33,
    h: 0.5,
    fontSize: 18,
    align: "center",
    color: "555555",
});

pptx.writeFile({
    fileName: "test-codex.pptx",
});
