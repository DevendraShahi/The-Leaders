import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { removeBackground } from '@imgly/background-removal-node';

const id = process.argv[2];
const baseDir = path.resolve('public/studio/cricket/players');
const tempDir = path.join(baseDir, '.nobg-temp');

if (!id) {
    console.error('Missing player ID');
    process.exit(1);
}

await fs.mkdir(tempDir, { recursive: true });

const inputPath = path.join(baseDir, `${id}.webp`);
const outputPath = path.join(tempDir, `${id}.png`);

const fileUrl = pathToFileURL(inputPath).href;
const blob = await removeBackground(fileUrl);
const buffer = Buffer.from(await blob.arrayBuffer());
await fs.writeFile(outputPath, buffer);
console.log(`Saved transparent PNG for ${id} (${buffer.length} bytes)`);
