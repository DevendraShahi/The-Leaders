import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { ManifestoIndexClient } from "@/components/election/ManifestoIndexClient";
import { getPartyManifestos } from "@/lib/manifesto-data";

export const metadata: Metadata = constructMetadata({
    title: "Party Manifesto Library",
    description:
        "Browse and compare official party manifesto documents for Nepal Election 2026 in one structured archive.",
    canonical: "/election-2026/manifesto",
    keywords: [
        "Nepal manifesto",
        "party manifesto 2082",
        "election promises Nepal",
        "election 2026 policy documents",
    ],
});

// export const revalidate = false; // Page caches indefinitely until on-demand revalidation

export default async function ElectionManifestoPage() {
    const manifestos = await getPartyManifestos();

    return <ManifestoIndexClient manifestos={manifestos} />;
}
