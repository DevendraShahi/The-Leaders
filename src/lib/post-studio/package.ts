import { strToU8, zipSync } from 'fflate';
import type { DailyEdition } from './daily';
import { editionDrafts } from './carousel';
import { createDraftCollection } from './drafts';

export async function carouselEntries(scope: string, edition: DailyEdition, language: 'ne' | 'en' | 'both') {
    const entries = editionDrafts(edition);
    const drafts = await createDraftCollection(scope, entries);
    return entries.filter(entry => language === 'both' || entry.id.includes(`-${language}-`)).map(entry => {
        const draft = drafts.find(value => value.id === entry.id)!;
        const match = entry.id.match(/-(ne|en)-(\d+)$/)!;
        return { draft, path: `${match[1]}/${String(Number(match[2]) + 1).padStart(2, '0')}.png` };
    });
}

export function packageCarousel(edition: DailyEdition, images: Record<string, Uint8Array>, language: 'ne' | 'en' | 'both') {
    const files = { ...images };
    for (const lang of ['ne', 'en'] as const) if (language === 'both' || language === lang) files[`${lang}/caption.txt`] = strToU8(edition.caption[lang]);
    files['README.txt'] = strToU8('The Leaders\nUpload PNGs in numerical order within one language folder. Captions are included. Review all content before posting. This export does not publish.');
    // PNGs are already compressed; store them without expensive recompression.
    return zipSync(files, { level: 0 });
}
