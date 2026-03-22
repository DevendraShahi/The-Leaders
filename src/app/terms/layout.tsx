
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Terms of Service",
    description: "Terms of service governing use of The Leaders Nepal (LeadersNP) platform and editorial content.",
    canonical: "/terms",
    keywords: ["leadersnp terms", "the leaders nepal terms of service"],
});

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
