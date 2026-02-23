import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { SnapshotFactsClient } from "./SnapshotFactsClient";

export const metadata: Metadata = constructMetadata({
    title: "Election Snapshot Metrics",
    description: "Verified Nepal Election 2026 snapshot metrics with official Election Commission bulletin references.",
    canonical: "/election-2026/snapshot",
    keywords: [
        "Nepal election snapshot",
        "election reference metrics Nepal",
        "Nepal election verified data",
    ],
});

export default function ElectionSnapshotPage() {
    return <SnapshotFactsClient />;
}
