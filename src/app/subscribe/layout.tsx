
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Subscribe – Stay Informed on Nepal Politics",
    description: "Subscribe to The Leaders Nepal (LeadersNP) for the latest political news, election updates, and in-depth coverage of Nepal's leaders and governance.",
    canonical: "/subscribe",
    keywords: ["subscribe leadersnp", "nepal politics newsletter", "the leaders nepal updates", "nepal election news subscription"],
});

export default function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
