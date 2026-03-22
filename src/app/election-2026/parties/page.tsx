import PartyData from "@/data/registered-parties-2026EC.json";
import { PartyDTO } from "@/lib/election-data";
import { PartiesClient } from "./PartiesClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

// Type assertion since JSON import might be loose
const PARTIES_DATA = PartyData.parties as unknown as PartyDTO[];

export const metadata: Metadata = constructMetadata({
    title: "Political Parties - Election 2026",
    description: "Browse and compare registered political parties for Nepal Election 2026, including profiles, ideology cues, and core facts.",
    canonical: "/election-2026/parties",
    keywords: [
        "Nepal political parties 2026",
        "election parties Nepal",
        "leadersnp parties",
    ],
});

export default function PartiesPage() {
    return <PartiesClient parties={PARTIES_DATA} />;
}
