import { MapV2Client } from "./MapV2Client";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Interactive Election Map",
    description: "Interactive map of Nepal's electoral districts and provinces with election-focused regional context and profile access.",
    canonical: "/election-2026/map-v2",
    keywords: ["Nepal election map", "interactive map Nepal election", "leadersnp map"],
});

export default function MapV2Page() {
    return <MapV2Client />;
}
