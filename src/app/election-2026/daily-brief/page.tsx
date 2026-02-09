import { getDailyBriefs } from "@/lib/election-data";
import { DailyBriefClient } from "./DailyBriefClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
    searchParams?: Promise<{
        layout?: string;
    }>;
}

function resolveLayout(layout?: string) {
    if (layout === "grid" || layout === "stack" || layout === "timeline") return layout;
    return "grid";
}

export default async function ElectionDailyBrief({ searchParams }: PageProps) {
    const briefs = await getDailyBriefs();
    const resolvedParams = await searchParams;
    const layout = resolveLayout(resolvedParams?.layout);
    const showLayoutLabel = !!resolvedParams?.layout;

    return (
        <DailyBriefClient
            briefs={briefs}
            layout={layout}
            showLayoutLabel={showLayoutLabel}
        />
    );
}
