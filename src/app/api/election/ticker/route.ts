import { NextResponse } from "next/server";
import { getDailyBriefs, type LocalizedValue } from "@/lib/election-data";

function toNepalDateKey(input: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kathmandu",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(input);
}

function resolveLocalizedTitle(value: LocalizedValue): { en: string; ne: string } {
    if (typeof value === "string") {
        return { en: value, ne: value };
    }
    return {
        en: value?.en || value?.ne || "",
        ne: value?.ne || value?.en || "",
    };
}

export async function GET() {
    try {
        const briefs = await getDailyBriefs();
        const todayKey = toNepalDateKey(new Date());

        const todayBriefs = briefs.filter((brief) => {
            const parsed = new Date(brief.date);
            if (Number.isNaN(parsed.getTime())) return false;
            return toNepalDateKey(parsed) === todayKey;
        });

        const source = todayBriefs.length > 0 ? todayBriefs : briefs.slice(0, 8);
        const items = source
            .slice(0, 12)
            .filter((brief) => brief.slug && brief.title)
            .map((brief) => ({
                slug: brief.slug,
                title: resolveLocalizedTitle(brief.title),
                date: brief.date,
            }));

        return NextResponse.json({
            success: true,
            data: {
                items,
                scope: todayBriefs.length > 0 ? "today" : "latest",
            },
        });
    } catch (error) {
        console.error("Failed to build election ticker:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load ticker" },
            { status: 500 }
        );
    }
}
