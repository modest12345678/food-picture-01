import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// food-picture-01 Round 3 entry: Artisan Tonkotsu Ramen — Glossy Noodle Pull & Molten Ajitama Egg
// ponytail: deterministic static asset deployment with byte-level validation and tie-break optimization
const MAX_BYTES = 1_048_576;
const srcUrl = new URL('./entry.png', import.meta.url);
const imageBytes = readFileSync(srcUrl);

if (imageBytes.byteLength === 0 || imageBytes.byteLength > MAX_BYTES) {
  throw new Error(`Invalid image byte length: ${imageBytes.byteLength}`);
}

if (
  imageBytes[0] !== 0xff ||
  imageBytes[1] !== 0xd8 ||
  imageBytes[imageBytes.byteLength - 2] !== 0xff ||
  imageBytes[imageBytes.byteLength - 1] !== 0xd9
) {
  throw new Error('Image buffer is missing valid JPEG SOI/EOI markers');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, 'entry.png');
writeFileSync(outPath, imageBytes);

const writtenBytes = readFileSync(outPath);
if (
  writtenBytes.byteLength !== imageBytes.byteLength ||
  writtenBytes[0] !== 0xff ||
  writtenBytes[1] !== 0xd8 ||
  writtenBytes[writtenBytes.byteLength - 2] !== 0xff ||
  writtenBytes[writtenBytes.byteLength - 1] !== 0xd9
) {
  throw new Error('Written output failed post-write integrity check');
}
