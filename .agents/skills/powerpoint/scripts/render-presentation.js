#!/usr/bin/env node

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");

const SOFFICE = "/Applications/LibreOffice.app/Contents/MacOS/soffice";
const SWIFT = "/usr/bin/swift";
const DEFAULT_DPI = 180;
const TIMEOUT_MS = 120_000;

function fail(message) {
  console.error(`render-presentation: ${message}`);
  process.exitCode = 1;
}

function usage() {
  console.error("Usage: node render-presentation.js <presentation.pptx> <rendered-directory>");
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const timeoutMs = options.timeout || TIMEOUT_MS;
    const spawnOptions = { ...options };
    delete spawnOptions.timeout;
    const child = spawn(command, args, {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      ...spawnOptions,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);

    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, "SIGTERM"); } catch (_) {}
      setTimeout(() => {
        try { process.kill(-child.pid, "SIGKILL"); } catch (_) {}
      }, 2_000).unref();
    }, timeoutMs);

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`${path.basename(command)} timed out after ${timeoutMs / 1000}s`));
      } else if (code !== 0) {
        reject(new Error(`${path.basename(command)} exited with ${code}${signal ? ` (${signal})` : ""}\n${stderr || stdout}`.trim()));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

const SWIFT_RENDERER = String.raw`
import AppKit
import Foundation
import PDFKit

guard CommandLine.arguments.count == 4 else {
    fputs("Usage: pdf-to-png.swift <input.pdf> <output-directory> <dpi>\n", stderr)
    exit(64)
}

let pdfURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
guard let dpi = Double(CommandLine.arguments[3]), dpi >= 72 else {
    fputs("DPI must be at least 72\n", stderr)
    exit(64)
}
guard let document = PDFDocument(url: pdfURL), document.pageCount > 0 else {
    fputs("Cannot open PDF or PDF has no pages: \(pdfURL.path)\n", stderr)
    exit(65)
}

let scale = dpi / 72.0
let digits = max(2, String(document.pageCount).count)

for index in 0..<document.pageCount {
    guard let page = document.page(at: index) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let width = max(1, Int(ceil(bounds.width * scale)))
    let height = max(1, Int(ceil(bounds.height * scale)))
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ) else {
        fputs("Cannot allocate bitmap for page \(index + 1)\n", stderr)
        exit(70)
    }

    bitmap.size = NSSize(width: bounds.width, height: bounds.height)
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        fputs("Cannot create graphics context for page \(index + 1)\n", stderr)
        exit(70)
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: bounds.width, height: bounds.height).fill()
    page.draw(with: .mediaBox, to: context.cgContext)
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    guard let png = bitmap.representation(using: .png, properties: [:]) else {
        fputs("Cannot encode page \(index + 1) as PNG\n", stderr)
        exit(70)
    }
    let filename = String(format: "slide-%0*d.png", digits, index + 1)
    do {
        try png.write(to: outputURL.appendingPathComponent(filename), options: .atomic)
    } catch {
        fputs("Cannot write \(filename): \(error)\n", stderr)
        exit(74)
    }
}

print("Rendered \(document.pageCount) slide(s) at \(Int(dpi)) DPI")
`;

async function main() {
  const [inputArg, outputArg, ...extra] = process.argv.slice(2);
  if (!inputArg || !outputArg || extra.length) {
    usage();
    throw new Error("expected exactly two arguments");
  }
  if (!fs.existsSync(SOFFICE)) {
    throw new Error(`LibreOffice was not found at ${SOFFICE}`);
  }
  if (!fs.existsSync(SWIFT)) {
    throw new Error(`macOS Swift runtime was not found at ${SWIFT}`);
  }

  const input = path.resolve(inputArg);
  const output = path.resolve(outputArg);
  if (path.extname(input).toLowerCase() !== ".pptx") {
    throw new Error(`input must be a .pptx file: ${input}`);
  }
  const stat = fs.statSync(input, { throwIfNoEntry: false });
  if (!stat?.isFile()) {
    throw new Error(`input file does not exist: ${input}`);
  }

  fs.mkdirSync(output, { recursive: true });
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "powerpoint-render-"));
  const profileDir = path.join(temporaryRoot, "libreoffice-profile");
  const conversionDir = path.join(temporaryRoot, "conversion");
  const pngStageDir = path.join(temporaryRoot, "png");
  const swiftFile = path.join(temporaryRoot, "pdf-to-png.swift");
  fs.mkdirSync(profileDir);
  fs.mkdirSync(conversionDir);
  fs.mkdirSync(pngStageDir);

  try {
    await run(SOFFICE, [
      `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
      "--headless",
      "--nologo",
      "--nodefault",
      "--nolockcheck",
      "--norestore",
      "--convert-to", "pdf",
      "--outdir", conversionDir,
      input,
    ]);

    const convertedPdf = path.join(conversionDir, `${path.basename(input, path.extname(input))}.pdf`);
    if (!fs.existsSync(convertedPdf) || fs.statSync(convertedPdf).size === 0) {
      throw new Error(`LibreOffice did not create the expected PDF: ${convertedPdf}`);
    }

    const outputPdf = path.join(output, `${path.basename(input, path.extname(input))}.pdf`);
    fs.copyFileSync(convertedPdf, outputPdf);
    fs.writeFileSync(swiftFile, SWIFT_RENDERER);
    const { stdout } = await run(SWIFT, [
      swiftFile,
      outputPdf,
      pngStageDir,
      String(DEFAULT_DPI),
    ], { timeout: 300_000 });

    const pngs = fs.readdirSync(pngStageDir).filter((name) => /^slide-\d+\.png$/.test(name)).sort();
    if (pngs.length === 0) {
      throw new Error("no slide PNG was created from the converted PDF");
    }
    // Replace only render files managed by this script; preserve every other file.
    for (const name of fs.readdirSync(output).filter((entry) => /^slide-\d+\.png$/.test(entry))) {
      fs.rmSync(path.join(output, name));
    }
    for (const name of pngs) {
      fs.copyFileSync(path.join(pngStageDir, name), path.join(output, name));
    }
    console.log(`PDF: ${outputPdf}`);
    console.log(`PNG: ${pngs.length} file(s) in ${output}`);
    if (stdout.trim()) console.log(stdout.trim());
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => fail(error.message));
