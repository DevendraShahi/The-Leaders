// Refresh only the reviewed source URLs in the checked-in player catalog.
// Usage: node scripts/sync-npl-player-photos.mjs [--refresh]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const directory = fileURLToPath(new URL('../public/studio/cricket/players/', import.meta.url));
const manifestPath = path.join(directory, 'catalog.json');
const catalog = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const candidates = catalog.players.filter(player => player.photo);
const failures = [];
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < candidates.length) {
        const player = candidates[next++];
        const filename = `${player.id}.webp`, thumbnail = `${player.id}-thumb.webp`;
        try {
            const exists = await fs.access(path.join(directory, filename)).then(() => true, () => false);
            if (!exists || process.argv.includes('--refresh')) {
                const response = await fetch(player.photo.originalUrl, {
                    signal: AbortSignal.timeout(25000),
                    headers: { 'User-Agent': 'TheLeadersStudio/1.0 (player photo library; https://theleaders.com.np)' },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const bytes = Buffer.from(await response.arrayBuffer());
                if (bytes.length > 25 * 1024 * 1024) throw new Error('Photo exceeds 25MB');
                const input = sharp(bytes).rotate();
                await input.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(directory, filename));
                await input.clone().resize({ width: 320, height: 400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(directory, thumbnail));
            }
            const metadata = await sharp(path.join(directory, filename)).metadata();
            Object.assign(player.photo, { url: `/studio/cricket/players/${filename}`, thumbnailUrl: `/studio/cricket/players/${thumbnail}`, width: metadata.width, height: metadata.height });
        } catch (error) {
            delete player.photo.url; delete player.photo.thumbnailUrl;
            failures.push({ id: player.id, error: error.message });
        }
    }
}));
await fs.writeFile(manifestPath, JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify({ ready: candidates.filter(player => player.photo.url).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
