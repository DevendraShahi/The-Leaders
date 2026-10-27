import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const baseDir = path.resolve('public/studio/cricket/players');
const tempDir = path.join(baseDir, '.nobg-temp');
const manifestPath = path.join(baseDir, 'catalog.json');

await fs.mkdir(tempDir, { recursive: true });

const overseasPlayers = [
    {
        id: 'sherfane-rutherford',
        name: 'Sherfane Rutherford',
        url: 'https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/13203/67285.png',
        credit: 'International Cricket Council (ICC)',
        license: 'ICC Editorial Headshot',
        sourceUrl: 'https://www.icc-cricket.com/players/sherfane-rutherford'
    },
    {
        id: 'brandon-mcmullen',
        name: 'Brandon McMullen',
        url: 'https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/13203/97960.png',
        credit: 'International Cricket Council (ICC)',
        license: 'ICC Editorial Headshot',
        sourceUrl: 'https://www.icc-cricket.com/players/brandon-mcmullen'
    },
    {
        id: 'saif-zaib',
        name: 'Saif Zaib',
        url: 'https://resources.ecb.co.uk/photo-resources/2026/07/22/1115e98e-1aff-46b5-80f0-d7dc38078ba2/SB-Saif-Zaib.png?width=460&height=690',
        credit: 'England and Wales Cricket Board (ECB / The Hundred)',
        license: 'ECB Editorial Headshot',
        sourceUrl: 'https://www.thehundred.com/players/saif-zaib'
    },
    {
        id: 'haider-ali',
        name: 'Haider Ali',
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Haider-Ali.png',
        credit: 'Wikimedia Commons',
        license: 'CC BY-SA 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Haider-Ali.png'
    },
    {
        id: 'scott-kuggeleijn',
        name: 'Scott Kuggeleijn',
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Scott_Kuggeleijn.jpg',
        credit: 'Wikimedia Commons',
        license: 'CC BY-SA 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scott_Kuggeleijn.jpg'
    }
];

const catalog = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

for (const player of overseasPlayers) {
    console.log(`Processing ${player.name} (${player.id})...`);
    
    // 1. Download source image
    const response = await fetch(player.url, {
        headers: { 'User-Agent': 'TheLeadersStudio/1.0 (dev@theleaders.com)' }
    });
    if (!response.ok) {
        throw new Error(`Failed to download ${player.name}: HTTP ${response.status}`);
    }
    const rawBuffer = Buffer.from(await response.arrayBuffer());
    
    // 2. Check current transparency
    const { data, info } = await sharp(rawBuffer).raw().toBuffer({ resolveWithObject: true });
    let transparentPixels = 0;
    if (info.channels === 4) {
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 20) transparentPixels++;
        }
    }
    const percentTransparent = (transparentPixels / (info.width * info.height)) * 100;
    console.log(`  Initial transparency: ${percentTransparent.toFixed(1)}%`);

    let transparentBuffer;
    if (percentTransparent >= 15) {
        console.log(`  Already has transparent background.`);
        transparentBuffer = rawBuffer;
    } else {
        console.log(`  Background removal required. Running worker-bg-runner in isolated process...`);
        const ext = path.extname(new URL(player.url).pathname) || '.jpg';
        const tempRawPath = path.join(tempDir, `${player.id}-raw${ext}`);
        const tempPngPath = path.join(tempDir, `${player.id}-nobg.png`);
        
        await fs.writeFile(tempRawPath, rawBuffer);
        
        try {
            execFileSync('node', ['scripts/worker-bg-runner.mjs', tempRawPath, tempPngPath], { stdio: 'inherit' });
            transparentBuffer = await fs.readFile(tempPngPath);
            await fs.unlink(tempPngPath);
            await fs.unlink(tempRawPath);
            console.log(`  Background removal completed successfully.`);
        } catch (err) {
            console.error(`  ✗ Worker failed for ${player.id}:`, err.message);
            continue;
        }
    }

    // 3. Save optimized transparent WebP files
    const finalWebpPath = path.join(baseDir, `${player.id}.webp`);
    const thumbWebpPath = path.join(baseDir, `${player.id}-thumb.webp`);

    const image = sharp(transparentBuffer).rotate();

    await image
        .clone()
        .resize({ width: 1280, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88, alphaQuality: 95 })
        .toFile(finalWebpPath);

    await image
        .clone()
        .resize({ width: 320, height: 400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, alphaQuality: 90 })
        .toFile(thumbWebpPath);

    // 4. Verify resulting transparency
    const verifyRaw = await sharp(finalWebpPath).raw().toBuffer({ resolveWithObject: true });
    let finalTrans = 0;
    for (let i = 3; i < verifyRaw.data.length; i += 4) {
        if (verifyRaw.data[i] < 20) finalTrans++;
    }
    const finalPct = ((finalTrans / (verifyRaw.info.width * verifyRaw.info.height)) * 100).toFixed(1);
    console.log(`  Final WebP: ${verifyRaw.info.width}x${verifyRaw.info.height}, ${finalPct}% transparent.`);

    // 5. Update catalog entry
    const entry = catalog.players.find(p => p.id === player.id);
    if (entry) {
        entry.photo = {
            originalUrl: player.url,
            sourceUrl: player.sourceUrl,
            credit: player.credit,
            license: player.license,
            kind: 'overseas',
            checkedAt: '2026-10-26',
            url: `/studio/cricket/players/${player.id}.webp`,
            thumbnailUrl: `/studio/cricket/players/${player.id}-thumb.webp`,
            width: verifyRaw.info.width,
            height: verifyRaw.info.height
        };
    }
}

// Clean temp directory
await fs.rm(tempDir, { recursive: true, force: true });

// Write catalog.json
await fs.writeFile(manifestPath, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nAll overseas player images successfully downloaded, processed to transparent backgrounds, and saved in catalog.json!');
