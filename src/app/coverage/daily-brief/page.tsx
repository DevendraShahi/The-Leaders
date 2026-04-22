import { getDailyBriefs } from "@/lib/election-data";
import { DailyBriefClient } from "./DailyBriefClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Election Daily Briefs",
    description: "Daily election briefings with concise updates, key developments, and verified insights.",
    canonical: "/coverage/daily-brief",
    keywords: ["daily brief", "nepal election updates", "election news nepal"],
});

// export const revalidate = false; // Page caches indefinitely until on-demand revalidation

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
