import { getParties } from "@/lib/election-data";
import { ProfilesClient } from "./ProfilesClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Election Profiles",
    description: "Compare party profiles, key leadership data, and election positioning for Nepal Election 2026.",
    canonical: "/election-2026/profiles",
    keywords: ["election profiles Nepal", "party profiles Nepal", "election 2026 parties"],
});

export default async function ElectionProfiles() {
    const parties = await getParties();

    return <ProfilesClient parties={parties} />;
}
