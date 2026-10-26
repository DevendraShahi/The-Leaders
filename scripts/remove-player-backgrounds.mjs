import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const baseDir = path.resolve('public/studio/cricket/players');
const tempDir = path.join(baseDir, '.nobg-temp');
const manifestPath = path.join(baseDir, 'catalog.json');
const catalog = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

await fs.mkdir(tempDir, { recursive: true });

// 1. Find all player images needing background removal (less than 5% transparent pixels)
const files = (await fs.readdir(baseDir)).filter(f => f.endsWith('.webp') && !f.endsWith('-thumb.webp'));
const targets = [];

for (const file of files) {
    const filePath = path.join(baseDir, file);
    const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    let transparentPixels = 0;
    if (info.channels === 4) {
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 20) transparentPixels++;
        }
    }
    const percent = (transparentPixels / (info.width * info.height)) * 100;
    if (percent < 5) {
        targets.push(file.replace(/\.webp$/, ''));
    }
}

console.log(`Starting background removal for ${targets.length} players...\n`);

let completed = 0;
for (const id of targets) {
    const startTime = Date.now();
    console.log(`[${++completed}/${targets.length}] Processing ${id}...`);
    
    // Step A: Background removal in worker process (avoids win32 DLL conflict)
    try {
        execFileSync('node', ['scripts/worker-remove-bg.mjs', id], { stdio: 'inherit' });
    } catch (err) {
        console.error(`  ✗ Worker failed for ${id}:`, err.message);
        continue;
    }
    
    const tempPngPath = path.join(tempDir, `${id}.png`);
    const finalWebpPath = path.join(baseDir, `${id}.webp`);
    const thumbWebpPath = path.join(baseDir, `${id}-thumb.webp`);
    
    // Step B: Encode to high-quality WebP with Sharp
    try {
        const pngBuffer = await fs.readFile(tempPngPath);
        const image = sharp(pngBuffer).rotate();
        
        // Full resolution (up to 1600x1600)
        await image
            .clone()
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 88, alphaQuality: 95 })
            .toFile(finalWebpPath);
            
        // Thumbnail (up to 320x400)
        await image
            .clone()
            .resize({ width: 320, height: 400, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, alphaQuality: 90 })
            .toFile(thumbWebpPath);
            
        // Clean up temporary PNG
        await fs.unlink(tempPngPath);
        
        // Update catalog dimensions
        const meta = await sharp(finalWebpPath).metadata();
        const player = catalog.players.find(p => p.id === id);
        if (player?.photo) {
            player.photo.width = meta.width;
            player.photo.height = meta.height;
        }
        
        console.log(`  ✓ Finished ${id} in ${((Date.now() - startTime) / 1000).toFixed(1)}s (${meta.width}x${meta.height})\n`);
    } catch (err) {
        console.error(`  ✗ Sharp conversion failed for ${id}:`, err);
    }
}

// Clean up temp directory
await fs.rm(tempDir, { recursive: true, force: true });

// Save updated catalog
await fs.writeFile(manifestPath, JSON.stringify(catalog, null, 2) + '\n');

console.log(`\nAll done! Successfully processed all ${completed} player images to transparent backgrounds.`);
