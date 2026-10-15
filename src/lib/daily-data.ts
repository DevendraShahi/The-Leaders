import { unstable_cache } from "next/cache";
export type LocalizedValue = string | { en?: string; ne?: string };
export interface DailyBriefDTO {
    title: LocalizedValue;
    slug: string;
    date: string;
    summary: LocalizedValue;
    content: LocalizedValue;
    tags: string[];
    isPublished: boolean;
    status: "draft" | "published" | "archived";
    image?: string;
}

export const getDailyBriefs = unstable_cache(async (page: number = 1, limit: number = 30) => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { DailyBrief } = await import("@/models/ElectionContent");

        await dbConnect();

        let query = DailyBrief.find({
            $or: [
                { status: "published" },
                { $and: [{ status: { $exists: false } }, { isPublished: true }] },
            ],
            slug: { $exists: true, $ne: "" }
        }).sort({ date: -1 });

        if (limit > 0) {
            query = query.skip((page - 1) * limit).limit(limit);
        }

        const briefs = await query.lean();

        return briefs.map((brief: any) => ({
            title: (brief.title ?? "") as LocalizedValue,
            slug: brief.slug,
            date: brief.date instanceof Date ? brief.date.toISOString() : String(brief.date),
            summary: (brief.summary ?? "") as LocalizedValue,
            content: (brief.content ?? "") as LocalizedValue,
            tags: brief.tags || [],
            isPublished: !!brief.isPublished,
            status: brief.status || (brief.isPublished ? "published" : "draft"),
            image: brief.image || "",
        })) as DailyBriefDTO[];
    } catch (error) {
        console.error("Failed to load daily briefs from database:", error);
        throw error;
    }
}, ['daily-briefs-paginated'], { revalidate: 3600, tags: ['daily-briefs'] });

export const countDailyBriefs = unstable_cache(async () => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { DailyBrief } = await import("@/models/ElectionContent");

        await dbConnect();
        return await DailyBrief.countDocuments({
            $or: [
                { status: "published" },
                { $and: [{ status: { $exists: false } }, { isPublished: true }] },
            ],
            slug: { $exists: true, $ne: "" }
        });
    } catch {
        return 0;
    }
}, ['daily-briefs-count'], { revalidate: 3600, tags: ['daily-briefs'] });

export const getDailyBriefBySlug = unstable_cache(async (slug: string) => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { DailyBrief } = await import("@/models/ElectionContent");

        await dbConnect();

        const brief = await DailyBrief.findOne({
            slug,
            $or: [
                { status: "published" },
                { $and: [{ status: { $exists: false } }, { isPublished: true }] },
            ],
        }).lean();

        if (!brief) return null;

        return {
            title: (brief.title ?? "") as LocalizedValue,
            slug: brief.slug,
            date: brief.date instanceof Date ? brief.date.toISOString() : String(brief.date),
            summary: (brief.summary ?? "") as LocalizedValue,
            content: (brief.content ?? "") as LocalizedValue,
            tags: brief.tags || [],
            isPublished: !!brief.isPublished,
            status: brief.status || (brief.isPublished ? "published" : "draft"),
            image: brief.image || "",
        } as DailyBriefDTO;
    } catch (error) {
        console.error("Failed to load daily brief by slug from database:", error);
        throw error;
    }
}, ['daily-brief-by-slug'], { revalidate: 3600, tags: ['daily-briefs'] });
