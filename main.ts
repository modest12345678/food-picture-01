import * as fs from 'node:fs';
import * as path from 'node:path';

// Hakata Tonkotsu Ramen Round 3 Submission Handler
// ponytail: deterministic static deployment, zero external dependencies, strict boundary checks
const JPEG_LIMIT_BYTES = 1048576;
const CANDIDATE_ASSET_NAME = 'entry.png';

function checkJpegPayload(buffer: Buffer): void {
  const totalLength = buffer.length;
  if (totalLength === 0 || totalLength > JPEG_LIMIT_BYTES) {
    throw new Error(`Invalid payload length: ${totalLength}`);
  }
  const validSoiMarker = buffer[0] === 0xff && buffer[1] === 0xd8;
  const validEoiMarker = buffer[totalLength - 2] === 0xff && buffer[totalLength - 1] === 0xd9;
  if (!validSoiMarker || !validEoiMarker) {
    throw new Error('JPEG SOI/EOI markers not found in payload');
  }
}

function publishFoodEntry(): void {
  const assetPath = path.resolve(import.meta.dirname, CANDIDATE_ASSET_NAME);
  const payloadData = fs.readFileSync(assetPath);
  checkJpegPayload(payloadData);

  const destinationFolder = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  fs.mkdirSync(destinationFolder, { recursive: true });

  const targetPath = path.join(destinationFolder, CANDIDATE_ASSET_NAME);
  fs.writeFileSync(targetPath, payloadData);

  const readBack = fs.readFileSync(targetPath);
  checkJpegPayload(readBack);
  if (readBack.length !== payloadData.length || readBack.byteLength === 0) {
    throw new Error('Integrity verification failed after writing');
  }
}

publishFoodEntry();
