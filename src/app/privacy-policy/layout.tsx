
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Privacy Policy",
    description: "Privacy policy for The Leaders Nepal (LeadersNP), including data handling, consent, and user rights.",
    canonical: "/privacy-policy",
    keywords: ["leadersnp privacy policy", "the leaders nepal privacy", "nepal news site privacy policy"],
});

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
