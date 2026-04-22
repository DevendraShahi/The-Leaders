import { getFactChecks } from "@/lib/election-data";
import { FactChecksPageClient } from "./FactChecksPageClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Election Fact Checks",
    description: "Verified fact checks of election claims, statements, and narratives from Nepal Election 2026.",
    canonical: "/election-2026/fact-checks",
    keywords: ["election fact check", "nepal fact check", "claim verification nepal election"],
});

// export const revalidate = false; // Page caches indefinitely until on-demand revalidation

export default async function ElectionFactChecks() {
    const factChecks = await getFactChecks();

    return <FactChecksPageClient factChecks={factChecks} />;
}
