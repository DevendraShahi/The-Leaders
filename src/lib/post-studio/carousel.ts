import { generateCricketCaption } from './cricket-caption';
import type { DailyEdition } from './daily';
import { defaultPostDesign, type PostDesign } from './types';
import type { PostDraft } from './drafts';
import { zipSync, strToU8 } from 'fflate';
import { artworkBytes, download } from './export';

const sections: Record<string, { en: string; ne: string }> = { 
    headlines: { en: 'HEADLINES', ne: 'मुख्य समाचार' }, 
    watch: { en: 'WATCH TODAY', ne: 'आज पछ्याउने' }, 
    go: { en: 'GO TODAY', ne: 'आज जाने ठाउँ' }, 
    enjoy: { en: 'ENJOY TODAY', ne: 'आज रमाइलो' }, 
    recap: { en: 'DAY IN REVIEW', ne: 'आजको समीक्षा' }, 
    tomorrow: { en: 'TOMORROW', ne: 'भोलि पछ्याउने' }, 
    weather: { en: 'WEATHER', ne: 'मौसम' }, 
    sports: { en: 'SPORTS', ne: 'खेलकुद' }, 
    'good-news': { en: 'GOOD NEWS', ne: 'सुखद समाचार' }, 
    context: { en: 'IN CONTEXT', ne: 'पृष्ठभूमि' }, 
    'morning brief': { en: 'MORNING BRIEF', ne: 'बिहानको समाचार' }, 
    'day in review': { en: 'DAY IN REVIEW', ne: 'आजको समीक्षा' } 
};

export function editionDrafts(edition: DailyEdition) {
    return (['ne', 'en'] as const).flatMap(language => {
        const cover = { 
            headline: edition.title[language], 
            body: language === 'ne' ? `${edition.date} · मुख्य समाचार र उपयोगी जानकारी` : `${edition.date} · Headlines and useful context`, 
            section: edition.edition === 'morning' ? 'morning brief' : 'day in review' 
        };
        const slides = [cover, ...edition.slides.map(slide => ({ headline: slide.headline[language], body: slide.body[language], section: slide.section }))];
        return slides.map((slide, index) => ({
            id: `daily-${edition.id}-${language}-${index}`,
            name: `${edition.date} ${edition.edition} ${language.toUpperCase()} ${index + 1}/${slides.length}`,
            design: { 
                ...defaultPostDesign, 
                template: 'explainer' as const, 
                format: 'portrait' as const,
                headline: slide.headline, 
                summary: slide.body, 
                author: 'The Leaders',
                category: sections[slide.section]?.[language] ?? slide.section.toUpperCase(), 
                eyebrow: `${index + 1} / ${slides.length}`, 
                imageUri: null,
                headlineScale: 0.92,
            },
        }));
    });
}

export function editionCaption(edition: DailyEdition) {
    return `${edition.caption.ne}\n\n${edition.caption.en}`;
}

/**
 * Finds all sibling drafts that belong to the same carousel pack.
 * Checks for ID prefixes (e.g. book-slug-timestamp-1..5) or name patterns ("Title · 1/5").
 */
export function findCarouselSiblings(draft: PostDraft, allDrafts: PostDraft[]): PostDraft[] {
    const activeDrafts = allDrafts.filter(d => !d.trashedAt);

    if (draft.carouselId) return activeDrafts.filter(item => item.carouselId === draft.carouselId)
        .sort((a, b) => (a.carouselOrder ?? 0) - (b.carouselOrder ?? 0));

    // 1. Check ID pattern like book-slug-timestamp-1, book-slug-timestamp-2
    const idMatch = draft.id.match(/^(.*?)(\d+)$/);
    if (idMatch) {
        const prefix = idMatch[1];
        const matching = activeDrafts
            .filter(d => !d.carouselId && d.id.startsWith(prefix) && /^\d+$/.test(d.id.slice(prefix.length)))
            .sort((a, b) => Number(a.id.slice(prefix.length)) - Number(b.id.slice(prefix.length)));
        if (matching.length > 1) return matching;
    }

    // 2. Check Name pattern like "Title · 1/5 (Thesis)" or "Title · 1/5"
    const nameMatch = draft.name.match(/^(.*?)\s*·\s*(\d+)\/(\d+)/);
    if (nameMatch) {
        const titlePrefix = nameMatch[1].trim();
        const matching = activeDrafts
            .filter(d => {
                const m = d.name.match(/^(.*?)\s*·\s*(\d+)\/(\d+)/);
                return !d.carouselId && m && m[1].trim() === titlePrefix;
            })
            .sort((a, b) => {
                const aIdx = Number(a.name.match(/^(.*?)\s*·\s*(\d+)\/(\d+)/)?.[2] || 0);
                const bIdx = Number(b.name.match(/^(.*?)\s*·\s*(\d+)\/(\d+)/)?.[2] || 0);
                return aIdx - bIdx;
            });
        if (matching.length > 1) return matching;
    }

    return [draft];
}

/**
 * Extracts a clean base title for carousel slides, stripping any trailing "· X/Y ...".
 */
export function getCarouselBaseTitle(name: string): string {
    return name.replace(/\s*·\s*\d+\/\d+.*$/, "").trim() || "Untitled Carousel";
}

/**
 * Generates an Instagram-ready caption from a carousel draft or series.
 */
export function generateInstagramCaption(slides: PostDraft[]): string {
    if (!slides.length) return "";
    if (slides[0].design.template === 'cricket') return generateCricketCaption(slides);
    const first = slides[0].design;
    const cleanHeadline = first.headline || "The Leaders Analysis";
    const cleanEyebrow = first.eyebrow ? `${first.eyebrow}\n\n` : "";
    const cleanSummary = first.summary ? `${first.summary}\n\n` : "";
    const category = first.category ? `#${first.category.replace(/[^a-zA-Z0-9]/g, "")}` : "#TheLeaders";

    const slideSummaries = slides.length > 1
        ? `\n\n📌 CAROUSEL BREAKDOWN (${slides.length} SLIDES):\n` +
          slides
              .map((s, idx) => `• Slide ${idx + 1}: ${s.design.headline || s.name}`)
              .join("\n") + "\n\n"
        : "\n\n";

    const hashtags = [
        category,
        "#TheLeaders",
        "#NepalPolitics",
        "#Governance",
        "#Leadership",
        "#PoliticalEconomy",
        "#PolicyAnalysis",
        first.template.startsWith("book") ? "#BookReview #GoodReads" : "",
    ].filter(Boolean).join(" ");

    return `${cleanEyebrow}⚡ ${cleanHeadline}\n\n${cleanSummary}${slideSummaries}Swipe through the carousel for the full analysis.\n\n—\nAnalysis by The Leaders Editorial\n🌐 theleaders.com.np\n\n${hashtags}`;
}

/**
 * Exports all carousel slides into a single compressed ZIP archive.
 */
export async function exportCarouselZip(
    renderSlideNodes: HTMLElement[],
    slides: PostDraft[],
    zipFilename = "the-leaders-carousel.zip"
): Promise<void> {
    const fileEntries: Record<string, Uint8Array> = {};

    for (let i = 0; i < renderSlideNodes.length; i++) {
        const node = renderSlideNodes[i];
        const slide = slides[i];
        if (!node || !slide) continue;

        const bytes = await artworkBytes(node, slide.design.format);
        const indexStr = String(i + 1).padStart(2, "0");
        const safeTitle = (slide.design.headline || slide.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 30)
            .replace(/(^-|-$)/g, "");
        const filename = `${indexStr}-${safeTitle || "slide"}.png`;
        fileEntries[filename] = bytes;
    }

    // Add caption file
    const caption = generateInstagramCaption(slides);
    fileEntries["caption.txt"] = strToU8(caption);

    const zipped = zipSync(fileEntries);
    download(zipped, zipFilename, "application/zip");
}
