import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { removeBackground } from '@imgly/background-removal-node';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error('Usage: node worker-bg.mjs <inputPath> <outputPath>');
    process.exit(1);
}

const fileUrl = pathToFileURL(path.resolve(inputPath)).href;
const blob = await removeBackground(fileUrl);
const buffer = Buffer.from(await blob.arrayBuffer());
await fs.writeFile(outputPath, buffer);
console.log(`Saved transparent PNG to ${outputPath} (${buffer.length} bytes)`);
