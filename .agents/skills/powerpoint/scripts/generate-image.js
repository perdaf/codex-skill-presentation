#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_MODEL = 'gpt-image-2';
const DEFAULT_SIZE = '1536x1024';
const API_URL = 'https://api.openai.com/v1/images/generations';
const ALLOWED_SIZES = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);
const ALLOWED_QUALITIES = new Set(['auto', 'low', 'medium', 'high']);

function usage(message) {
  if (message) console.error(`Error: ${message}`);
  console.error('Usage: generate-image.js --prompt <text> --output <path> [--size <WxH>] [--quality <auto|low|medium|high>] [--model <model>]');
  console.error('   or: generate-image.js --manifest <path> [--model <model>] [--quality <auto|low|medium|high>]');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) usage(`unexpected argument: ${token}`);
    const name = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) usage(`missing value for --${name}`);
    if (args[name] !== undefined) usage(`--${name} may be supplied only once`);
    args[name] = value;
    i += 1;
  }
  return args;
}

function normaliseJob(job, defaults) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) throw new Error('each image job must be an object');
  if (typeof job.prompt !== 'string' || !job.prompt.trim()) throw new Error('each image job needs a non-empty prompt');
  if (typeof job.output !== 'string' || !job.output.trim()) throw new Error('each image job needs an output path');
  const output = path.resolve(job.output);
  const size = job.size || defaults.size || DEFAULT_SIZE;
  const quality = job.quality || defaults.quality || 'auto';
  const outputParts = output.split(path.sep);
  const assetsIndex = outputParts.lastIndexOf('assets');
  if (assetsIndex < 0 || outputParts[assetsIndex + 1] !== 'images') {
    throw new Error('each output must be inside an assets/images directory');
  }
  if (path.extname(output).toLowerCase() !== '.png') throw new Error('each output must use a .png extension');
  if (!ALLOWED_SIZES.has(size)) throw new Error(`unsupported size: ${size}`);
  if (!ALLOWED_QUALITIES.has(quality)) throw new Error(`unsupported quality: ${quality}`);
  return {
    prompt: `${defaults.style ? `${defaults.style.trim()}\n\n` : ''}${job.prompt.trim()}`,
    output,
    size,
    quality,
    model: job.model || defaults.model || DEFAULT_MODEL,
  };
}

async function readJobs(args) {
  if (args.manifest) {
    if (args.prompt || args.output || args.size) usage('--manifest cannot be combined with --prompt, --output, or --size');
    let manifest;
    try { manifest = JSON.parse(await fs.readFile(args.manifest, 'utf8')); }
    catch (error) { throw new Error(`cannot read manifest: ${error.message}`); }
    if (!Array.isArray(manifest.images) || manifest.images.length === 0) throw new Error('manifest must contain a non-empty images array');
    const defaults = { style: manifest.style || '', quality: args.quality || manifest.quality, model: args.model || manifest.model };
    return manifest.images.map((job) => normaliseJob(job, defaults));
  }
  if (!args.prompt || !args.output) usage('a single image needs both --prompt and --output');
  return [normaliseJob({ prompt: args.prompt, output: args.output, size: args.size, quality: args.quality, model: args.model }, {})];
}

async function generate(job, apiKey) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: job.model, prompt: job.prompt, size: job.size, quality: job.quality, output_format: 'png' }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload && payload.error && payload.error.message ? payload.error.message : `HTTP ${response.status}`;
    throw new Error(`image API request failed: ${message}`);
  }
  const image = payload && Array.isArray(payload.data) ? payload.data[0] : null;
  if (!image) throw new Error('image API returned no image data');
  let bytes;
  if (image.b64_json) bytes = Buffer.from(image.b64_json, 'base64');
  else if (image.url) {
    const download = await fetch(image.url);
    if (!download.ok) throw new Error(`generated image download failed: HTTP ${download.status}`);
    bytes = Buffer.from(await download.arrayBuffer());
  } else throw new Error('image API response did not include b64_json or url');
  await fs.mkdir(path.dirname(job.output), { recursive: true });
  await fs.writeFile(job.output, bytes);
  return job.output;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not available; cannot use the OpenAI Images API fallback.');
  const jobs = await readJobs(parseArgs(process.argv.slice(2)));
  for (const job of jobs) console.log(await generate(job, process.env.OPENAI_API_KEY));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Image generation failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { parseArgs, normaliseJob, readJobs, generate };
