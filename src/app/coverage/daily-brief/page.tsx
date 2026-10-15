import { getDailyBriefs } from "@/lib/daily-data";
import { DailyBriefClient } from "./DailyBriefClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Daily Briefs",
    description: "Daily news briefings with concise updates, key developments, and verified insights.",
    canonical: "/coverage/daily-brief",
    keywords: ["daily brief", "nepal daily updates", "news nepal"],
});

// export const revalidate = false; // Page caches indefinitely until on-demand revalidation

export const revalidate = 21600;
export default async function DailyBriefs() {
    const briefs = await getDailyBriefs(1, 30);
    return <DailyBriefClient briefs={briefs} layout="grid" showLayoutLabel={false} />;
}
